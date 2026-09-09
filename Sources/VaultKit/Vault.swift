import Foundation

/// Um item da galeria: qualquer arquivo não-Markdown que valha mostrar.
public struct Midia: Identifiable, Equatable {
    public enum Especie: String, CaseIterable {
        case imagem, video, pdf, pages, outro

        public var rotulo: String {
            switch self {
            case .imagem: return "Imagens"
            case .video: return "Vídeos"
            case .pdf: return "PDFs"
            case .pages: return "Documentos Pages"
            case .outro: return "Outros"
            }
        }
    }

    public let url: URL
    public let caminhoRelativo: String
    public let especie: Especie
    public let bytes: Int
    public let modificadoEm: Date

    public var id: String { caminhoRelativo }
    public var nome: String { url.lastPathComponent }

    /// O `.md` gerado ao lado de um `.pages` pelo pipeline do doc-harness.
    public var caminhoDerivado: String? {
        guard especie == .pages else { return nil }
        return (caminhoRelativo as NSString).deletingPathExtension + ".md"
    }

    static func especie(para url: URL) -> Especie {
        switch url.pathExtension.lowercased() {
        case "png", "jpg", "jpeg", "gif", "heic", "webp", "tiff", "svg": return .imagem
        case "mov", "mp4", "m4v", "avi": return .video
        case "pdf": return .pdf
        case "pages": return .pages
        default: return .outro
        }
    }
}

/// O vault inteiro, lido do disco.
///
/// Não há banco nem cache de conteúdo: a pasta do doc-harness continua sendo a
/// única fonte de verdade, e a Bancada é apenas mais um leitor sobre ela — do
/// mesmo jeito que o Obsidian. É o que permite as duas ferramentas ficarem
/// abertas ao mesmo tempo sem uma corromper o trabalho da outra.
public struct Vault {
    public let raiz: URL
    public let notas: [Nota]
    public let invalidas: [NotaInvalida]
    public let midias: [Midia]
    /// Linhas de `05 - Registros/` que não casaram com o formato dos hooks.
    public let fatosNaoReconhecidos: [String]

    public var fatos: [Fato] {
        notas.filter { $0.tipo == .registro }
            .flatMap { nota -> [Fato] in
                let data = nota.data ?? String(nota.url.deletingPathExtension().lastPathComponent)
                return LeitorDeFatos.ler(texto: nota.corpo, data: data).fatos
            }
    }

    public var tarefas: [Nota] { notas.filter { $0.tipo == .tarefa } }

    public func notas(tipo: TipoNota) -> [Nota] {
        notas.filter { $0.tipo == tipo }
    }

    public func nota(caminhoRelativo: String) -> Nota? {
        notas.first { $0.caminhoRelativo == caminhoRelativo }
    }
}

public enum LeitorDeVault {
    /// Pastas que não fazem parte do conteúdo.
    static let ignoradas: Set<String> = [".git", ".obsidian", ".claude", "scripts", ".cache", "node_modules"]

    /// Markdown na raiz que é documentação do repositório, não nota do vault.
    ///
    /// O doc-harness é repo e vault na mesma pasta — então o `README.md` e o
    /// `CLAUDE.md` convivem com as notas sem seguir (nem dever seguir) a
    /// convenção de frontmatter. Sem esta lista, os dois apareceriam para
    /// sempre como "fora da convenção", e um alerta que nunca zera é um
    /// alerta que se aprende a ignorar.
    static let documentacaoDoRepo: Set<String> = [
        "README.md", "CLAUDE.md", "CONTRIBUTING.md", "LICENSE.md", "CHANGELOG.md"
    ]

    public enum Erro: LocalizedError {
        case raizInvalida(URL)

        public var errorDescription: String? {
            switch self {
            case .raizInvalida(let url):
                return "\(url.path) não parece um vault do doc-harness — falta a pasta `05 - Registros`."
            }
        }
    }

    /// Confere que a pasta escolhida é mesmo o vault, e não uma pasta qualquer.
    public static func ehVault(_ raiz: URL) -> Bool {
        var ehPasta: ObjCBool = false
        let alvo = raiz.appendingPathComponent("05 - Registros").path
        let existe = FileManager.default.fileExists(atPath: alvo, isDirectory: &ehPasta)
        return existe && ehPasta.boolValue
    }

    public static func ler(raiz: URL) throws -> Vault {
        guard ehVault(raiz) else { throw Erro.raizInvalida(raiz) }

        var notas: [Nota] = []
        var invalidas: [NotaInvalida] = []
        var midias: [Midia] = []
        var naoReconhecidas: [String] = []

        let fm = FileManager.default
        let chaves: [URLResourceKey] = [.isDirectoryKey, .contentModificationDateKey, .fileSizeKey]

        guard let enumerador = fm.enumerator(
            at: raiz,
            includingPropertiesForKeys: chaves,
            options: [.skipsHiddenFiles]
        ) else {
            return Vault(raiz: raiz, notas: [], invalidas: [], midias: [], fatosNaoReconhecidos: [])
        }

        for caso in enumerador {
            guard let url = caso as? URL else { continue }
            let nome = url.lastPathComponent

            let valores = try? url.resourceValues(forKeys: Set(chaves))
            let ehPasta = valores?.isDirectory ?? false

            if ehPasta {
                // Um `.pages` é um bundle: entra na galeria como arquivo e a
                // varredura não desce nele.
                if url.pathExtension.lowercased() == "pages" {
                    enumerador.skipDescendants()
                    midias.append(Midia(
                        url: url,
                        caminhoRelativo: relativo(url, a: raiz),
                        especie: .pages,
                        bytes: 0,
                        modificadoEm: valores?.contentModificationDate ?? .distantPast
                    ))
                } else if ignoradas.contains(nome) {
                    enumerador.skipDescendants()
                }
                continue
            }

            let modificado = valores?.contentModificationDate ?? .distantPast
            let caminho = relativo(url, a: raiz)

            guard url.pathExtension.lowercased() == "md" else {
                // `.base` e `.canvas` são configuração do Obsidian, não conteúdo.
                let ext = url.pathExtension.lowercased()
                guard !["base", "canvas"].contains(ext) else { continue }
                midias.append(Midia(
                    url: url,
                    caminhoRelativo: caminho,
                    especie: Midia.especie(para: url),
                    bytes: valores?.fileSize ?? 0,
                    modificadoEm: modificado
                ))
                continue
            }

            // Só na raiz: um `README.md` dentro de uma pasta de conteúdo é
            // nota de verdade e continua sendo cobrado pela convenção.
            let naRaiz = !caminho.contains("/")
            if naRaiz && documentacaoDoRepo.contains(nome) { continue }

            guard let texto = try? String(contentsOf: url, encoding: .utf8) else { continue }
            let (frontmatter, corpo) = Frontmatter.separar(de: texto)

            guard let frontmatter else {
                invalidas.append(NotaInvalida(caminhoRelativo: caminho, url: url, motivo: .semFrontmatter))
                continue
            }
            guard let bruto = frontmatter["tipo"] else {
                invalidas.append(NotaInvalida(caminhoRelativo: caminho, url: url, motivo: .semTipo))
                continue
            }
            guard let tipo = TipoNota(rawValue: bruto) else {
                invalidas.append(NotaInvalida(caminhoRelativo: caminho, url: url, motivo: .tipoDesconhecido(bruto)))
                continue
            }

            let nota = Nota(
                caminhoRelativo: caminho,
                url: url,
                tipo: tipo,
                frontmatter: frontmatter,
                corpo: corpo,
                modificadoEm: modificado
            )
            notas.append(nota)

            if tipo == .registro {
                let data = nota.data ?? url.deletingPathExtension().lastPathComponent
                naoReconhecidas.append(contentsOf: LeitorDeFatos.ler(texto: corpo, data: data).naoReconhecidas)
            }
        }

        return Vault(
            raiz: raiz,
            notas: notas.sorted { $0.caminhoRelativo < $1.caminhoRelativo },
            invalidas: invalidas.sorted { $0.caminhoRelativo < $1.caminhoRelativo },
            midias: midias.sorted { $0.modificadoEm > $1.modificadoEm },
            fatosNaoReconhecidos: naoReconhecidas
        )
    }

    static func relativo(_ url: URL, a raiz: URL) -> String {
        let base = raiz.standardizedFileURL.path
        let alvo = url.standardizedFileURL.path
        guard alvo.hasPrefix(base) else { return alvo }
        return String(alvo.dropFirst(base.count)).trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    }
}
