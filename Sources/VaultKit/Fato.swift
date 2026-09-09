import Foundation

/// Uma linha do log de fatos de `05 - Registros/`.
///
/// O formato é produzido por um único lugar — a função `registrar` de
/// `doc-harness/scripts/lib.sh`:
///
///     printf -- '- `%s` · **%s** · `%s` · %s\n' hora autor tipo descrição
///
/// Como a escrita tem porta única, o parser pode ser estrito. Uma linha que
/// não casa não é adivinhada: vira `nil` e o chamador a contabiliza.
public struct Fato: Identifiable, Equatable {
    public let data: String      // ISO, vem do nome do arquivo de log
    public let hora: String      // HH:MM
    public let autor: String
    public let tipo: String      // commit · pages · sessao · teste · …
    public let descricao: String

    public var id: String { "\(data) \(hora) \(autor) \(tipo) \(descricao)" }

    /// Minutos desde a meia-noite; usado para ordenar e para medir intervalos.
    public var minutoDoDia: Int {
        let partes = hora.components(separatedBy: ":")
        guard partes.count == 2, let h = Int(partes[0]), let m = Int(partes[1]) else { return 0 }
        return h * 60 + m
    }

    public init(data: String, hora: String, autor: String, tipo: String, descricao: String) {
        self.data = data
        self.hora = hora
        self.autor = autor
        self.tipo = tipo
        self.descricao = descricao
    }
}

public enum LeitorDeFatos {
    /// `- \`19:53\` · **fbtostadev** · \`commit\` · \`d622a3a\` — Mensagem · 25 arquivo(s)`
    private static let padrao = try! NSRegularExpression(
        pattern: "^-\\s+`(\\d{1,2}:\\d{2})`\\s+·\\s+\\*\\*(.+?)\\*\\*\\s+·\\s+`(.+?)`\\s+·\\s+(.*)$"
    )

    /// Lê um arquivo de log inteiro. `data` vem do nome do arquivo porque a
    /// linha carrega só a hora.
    public static func ler(texto: String, data: String) -> (fatos: [Fato], naoReconhecidas: [String]) {
        var fatos: [Fato] = []
        var naoReconhecidas: [String] = []

        for linha in texto.components(separatedBy: "\n") {
            let limpa = linha.trimmingCharacters(in: .whitespaces)
            // Só linhas de item interessam; cabeçalho, frontmatter e a citação
            // de aviso do topo do log são ruído esperado.
            guard limpa.hasPrefix("- ") else { continue }

            if let fato = parsear(linha: limpa, data: data) {
                fatos.append(fato)
            } else {
                naoReconhecidas.append(limpa)
            }
        }
        return (fatos, naoReconhecidas)
    }

    public static func parsear(linha: String, data: String) -> Fato? {
        let alcance = NSRange(linha.startIndex..<linha.endIndex, in: linha)
        guard let m = padrao.firstMatch(in: linha, range: alcance) else { return nil }

        func grupo(_ i: Int) -> String {
            guard let r = Range(m.range(at: i), in: linha) else { return "" }
            return String(linha[r]).trimmingCharacters(in: .whitespaces)
        }

        return Fato(
            data: data,
            hora: grupo(1),
            autor: grupo(2),
            tipo: grupo(3),
            descricao: grupo(4)
        )
    }
}
