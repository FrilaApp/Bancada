import Foundation

/// Um fato do log traduzido para leitura: primeiro o que aconteceu, depois a
/// referência técnica que prova.
///
/// A linha que os hooks gravam é escrita para auditoria —
/// `` `df873d0` — Registra os fatos da sessão · 1 arquivo(s) `` —, e o
/// calendário a mostrava assim, com o hash na frente. Numa célula de 96 pt o
/// que cabia era `` `df873d0` — Regi… ``: a parte que ninguém lê ocupava o
/// lugar da única que diz alguma coisa.
///
/// Nada aqui descarta informação. O hash e a contagem de arquivos saem do
/// título e vão para campos próprios; a linha crua continua no evento, e o
/// "Registro completo" do painel do dia a mostra intacta.
public struct LeituraDeFato: Equatable, Sendable {
    /// O que ler primeiro — a mensagem, sem hash, contagem ou código de tarefa.
    public let titulo: String
    /// O hash curto do commit, quando o fato é um commit.
    public let referencia: String?
    public let arquivos: Int?
    /// O vault registrando a si mesmo. Ver `ehBastidor`.
    public let bastidor: Bool

    public init(titulo: String, referencia: String? = nil, arquivos: Int? = nil, bastidor: Bool = false) {
        self.titulo = titulo
        self.referencia = referencia
        self.arquivos = arquivos
        self.bastidor = bastidor
    }

    /// `` `d622a3a` — Mensagem · 25 arquivo(s) `` — e as variações que o log
    /// real acumulou: `1 arquivo`, `12 arquivos`.
    private static let commit = try! NSRegularExpression(
        pattern: "^`([0-9a-f]{7,40})`\\s+—\\s+(.+?)(?:\\s+·\\s+(\\d+)\\s+arquivos?(?:\\(s\\))?)?$"
    )

    /// `CBL_C18.pages → CBL_C18.md · 4365 palavras`
    private static let pages = try! NSRegularExpression(pattern: "^(.+?)\\.pages\\s+→")

    /// `(T-0001)`, `(V-03)`, `(T-0002, V-05)` no fim da mensagem. O código
    /// sai do título porque o calendário já agrupa pela tarefa e mostra o
    /// nome dela — repetir `T-0001` embaixo de "Refinar a ActionShelf" é o
    /// mesmo dado duas vezes, uma delas ilegível para quem chegou agora.
    private static let codigoFinal = try! NSRegularExpression(
        pattern: "\\s*\\((?:T-\\d{3,4}|V-\\d{2,3})(?:\\s*,\\s*(?:T-\\d{3,4}|V-\\d{2,3}))*\\)\\s*$"
    )

    /// `(commit 5a39cc4)` no meio de uma descrição escrita à mão.
    private static let commitCitado = try! NSRegularExpression(pattern: "\\s*\\(commit [0-9a-f]{7,40}\\)")

    public static func ler(tipo: String, descricao: String) -> LeituraDeFato {
        switch tipo {
        case "commit":
            guard let m = casar(commit, descricao) else {
                return LeituraDeFato(titulo: limpar(descricao), bastidor: ehBastidor(mensagem: descricao))
            }
            let mensagem = m[2] ?? descricao
            return LeituraDeFato(
                titulo: limpar(mensagem),
                referencia: m[1],
                arquivos: m[3].flatMap(Int.init),
                bastidor: ehBastidor(mensagem: mensagem)
            )

        case "pages":
            // O pipeline converte a cada salvamento, então para quem lê o
            // que aconteceu foi "o documento mudou". A contagem de palavras
            // fica na linha crua.
            guard let m = casar(pages, descricao), let nome = m[1] else {
                return LeituraDeFato(titulo: limpar(descricao))
            }
            return LeituraDeFato(titulo: "Atualiza o documento \(nome)")

        case "sessao":
            return LeituraDeFato(titulo: "Sessão com o Claude", bastidor: true)

        case "teste":
            return LeituraDeFato(titulo: limpar(descricao), bastidor: true)

        default:
            return LeituraDeFato(titulo: limpar(descricao))
        }
    }

    /// Commits que existem para manter o próprio registro em dia.
    ///
    /// São reais e ficam no log — mas somavam 37% dos fatos dos três primeiros
    /// dias (27 de 72), e na célula disputavam espaço com o trabalho que eles
    /// registram. A lista é curta e literal de propósito: são as frases que
    /// os hooks e a rotina de fim de sessão escrevem. Uma regra por
    /// semelhança esconderia trabalho de verdade, e esconder trabalho é pior
    /// que mostrar bastidor.
    static let marcasDeBastidor = [
        "registra os fatos",
        "registra o commit anterior",
        "log de fatos",
        "narrativa"
    ]

    static func ehBastidor(mensagem: String) -> Bool {
        let m = mensagem.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil)
        if m.hasPrefix("teste") { return true }
        return marcasDeBastidor.contains { m.contains($0) }
    }

    private static func limpar(_ texto: String) -> String {
        var t = substituir(commitCitado, em: texto, por: "")
        t = substituir(codigoFinal, em: t, por: "")
        t = t.trimmingCharacters(in: .whitespaces)
        guard let primeira = t.first else { return texto }
        return primeira.uppercased() + t.dropFirst()
    }

    private static func casar(_ regex: NSRegularExpression, _ texto: String) -> [Int: String]? {
        let alcance = NSRange(texto.startIndex..<texto.endIndex, in: texto)
        guard let m = regex.firstMatch(in: texto, range: alcance) else { return nil }
        var grupos: [Int: String] = [:]
        for i in 0..<m.numberOfRanges {
            if let r = Range(m.range(at: i), in: texto) { grupos[i] = String(texto[r]) }
        }
        return grupos
    }

    private static func substituir(_ regex: NSRegularExpression, em texto: String, por modelo: String) -> String {
        let alcance = NSRange(texto.startIndex..<texto.endIndex, in: texto)
        return regex.stringByReplacingMatches(in: texto, range: alcance, withTemplate: modelo)
    }
}

extension Markdown {
    /// O item de narrativa sem a referência técnica do fim.
    ///
    /// A narrativa diária termina quase todo item com a prova entre
    /// parênteses — `` (`94a7665`) ``, `` (Bancada `af093a1`, fbtostadev) ``. No
    /// arquivo, é o que amarra a frase ao fato, e fica. No resumo do dia, é o
    /// mesmo hash que o log mostra logo abaixo, só que no meio da leitura.
    ///
    /// Só sai um parêntese **final** que contenha código: um parêntese escrito
    /// por gente, sem hash dentro, é parte da frase.
    public static func semReferenciaFinal(_ trechos: [Trecho]) -> [Trecho] {
        guard case let .texto(ultimo)? = trechos.last else { return trechos }
        let fim = ultimo.trimmingCharacters(in: .whitespaces)
        guard fim.hasSuffix(")") || fim.hasSuffix(").") else { return trechos }

        for i in stride(from: trechos.count - 1, through: 0, by: -1) {
            guard case let .texto(s) = trechos[i], let abre = s.range(of: "(", options: .backwards) else { continue }

            let miolo = trechos[(i + 1)...]
            let temCodigo = miolo.contains { if case .codigo = $0 { return true }; return false }
            let soTextoECodigo = miolo.allSatisfy {
                switch $0 {
                case .texto, .codigo: return true
                default: return false
                }
            }
            guard temCodigo, soTextoECodigo else { return trechos }

            var antes = String(s[..<abre.lowerBound])
            while antes.last == " " { antes.removeLast() }
            // Um item que era só a referência continua sendo o que era.
            guard !(antes.isEmpty && i == 0) else { return trechos }

            var resultado = Array(trechos[..<i])
            let ponto = fim.hasSuffix(".") ? "." : ""
            if !antes.isEmpty || !ponto.isEmpty { resultado.append(.texto(antes + ponto)) }
            return resultado
        }
        return trechos
    }

    /// O texto de uma sequência de trechos, sem marcação.
    static func textoPlano(_ trechos: [Trecho]) -> String {
        trechos.map { trecho -> String in
            switch trecho {
            case let .texto(s), let .forte(s), let .enfase(s), let .riscado(s), let .codigo(s): return s
            case let .wikilink(_, rotulo): return rotulo
            case let .link(rotulo, _): return rotulo
            case let .imagem(_, legenda): return legenda ?? ""
            }
        }.joined()
    }
}
