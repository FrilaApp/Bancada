import Foundation

/// Frontmatter YAML de uma nota do vault.
///
/// Não é um parser de YAML: o `CLAUDE.md` do doc-harness fixa um subconjunto
/// deliberadamente pequeno — chaves planas, minúsculas e sem acento, valores
/// escalares, e listas apenas na forma inline `tags: [a, b]`. Um parser de 80
/// linhas cobre o vocabulário inteiro e falha alto no que estiver fora dele,
/// que é exatamente o comportamento desejado num vault com cinco autores.
public struct Frontmatter: Equatable {
    public private(set) var valores: [String: String]
    public private(set) var tags: [String]

    public init(valores: [String: String] = [:], tags: [String] = []) {
        self.valores = valores
        self.tags = tags
    }

    public subscript(chave: String) -> String? { valores[chave] }

    /// Separa o bloco `---` inicial do corpo da nota.
    ///
    /// Devolve `nil` no frontmatter quando a nota não abre com `---`; o corpo
    /// vem inteiro nesse caso, para o chamador decidir se isso é um erro.
    public static func separar(de texto: String) -> (frontmatter: Frontmatter?, corpo: String) {
        let linhas = texto.components(separatedBy: "\n")
        guard linhas.first?.trimmingCharacters(in: .whitespaces) == "---" else {
            return (nil, texto)
        }
        guard let fim = linhas.dropFirst().firstIndex(where: {
            $0.trimmingCharacters(in: .whitespaces) == "---"
        }) else {
            return (nil, texto)
        }

        let bloco = linhas[1..<fim]
        let corpo = linhas[(fim + 1)...]
            .joined(separator: "\n")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        return (parsear(bloco: Array(bloco)), corpo)
    }

    private static func parsear(bloco: [String]) -> Frontmatter {
        var valores: [String: String] = [:]
        var tags: [String] = []

        for linha in bloco {
            let limpa = linha.trimmingCharacters(in: .whitespaces)
            guard !limpa.isEmpty, !limpa.hasPrefix("#") else { continue }
            guard let separador = limpa.firstIndex(of: ":") else { continue }

            let chave = String(limpa[limpa.startIndex..<separador])
                .trimmingCharacters(in: .whitespaces)
            var valor = String(limpa[limpa.index(after: separador)...])
                .trimmingCharacters(in: .whitespaces)

            // Aspas são opcionais no vault; normalizar evita que `status: "ativo"`
            // e `status: ativo` virem dois valores diferentes.
            if valor.count >= 2,
               (valor.hasPrefix("\"") && valor.hasSuffix("\"")) ||
               (valor.hasPrefix("'") && valor.hasSuffix("'")) {
                valor = String(valor.dropFirst().dropLast())
            }

            if chave == "tags" {
                tags = listaInline(valor)
                continue
            }
            guard !valor.isEmpty else { continue }
            valores[chave] = valor
        }

        return Frontmatter(valores: valores, tags: tags)
    }

    private static func listaInline(_ valor: String) -> [String] {
        guard valor.hasPrefix("["), valor.hasSuffix("]") else {
            return valor.isEmpty ? [] : [valor]
        }
        return valor.dropFirst().dropLast()
            .components(separatedBy: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }
}
