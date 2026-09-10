import Foundation

/// Quem é quem na equipe, lido da tabela de contatos do `CLAUDE.md` do vault.
///
/// O log grava o autor como o Git o conhece — `fbtostadev` de uma máquina,
/// `Cauê Carneiro` de outra. Para quem é da equipe, os dois são óbvios; para o
/// mentor que abre o calendário pela primeira vez, `fbtostadev` é um login,
/// não uma pessoa. A tabela já existe e já liga o nome ao e-mail, e o login
/// do Git costuma ser a parte local desse e-mail.
///
/// Quem não casa com ninguém sai como veio: um nome desconhecido é dado, e
/// adivinhar a pessoa errada faria o registro mentir.
public struct Equipe: Equatable, Sendable {
    public struct Pessoa: Equatable, Sendable {
        public let nome: String
        public let email: String?

        public init(nome: String, email: String? = nil) {
            self.nome = nome
            self.email = email
        }
    }

    public let pessoas: [Pessoa]

    public init(pessoas: [Pessoa] = []) {
        self.pessoas = pessoas
    }

    /// `| 714 Fabrício Tosta | fbtostadev@gmail.com |` — a matrícula na
    /// frente do nome é da Academy e não entra.
    public static func ler(texto: String) -> Equipe {
        var pessoas: [Pessoa] = []
        for linha in texto.components(separatedBy: "\n") {
            let limpa = linha.trimmingCharacters(in: .whitespaces)
            guard limpa.hasPrefix("|") else { continue }

            let celulas = limpa
                .split(separator: "|", omittingEmptySubsequences: false)
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty }
            guard celulas.count >= 2, celulas[1].contains("@") else { continue }

            let nome = celulas[0]
                .drop { $0.isNumber || $0 == " " }
                .trimmingCharacters(in: .whitespaces)
            guard !nome.isEmpty else { continue }
            pessoas.append(Pessoa(nome: nome, email: celulas[1]))
        }
        return Equipe(pessoas: pessoas)
    }

    /// Como chamar quem assinou: o primeiro nome, ou o nome inteiro quando
    /// dois da equipe dividem o primeiro.
    public func nome(de autor: String) -> String {
        let chave = Self.normalizar(autor)
        let achada = pessoas.first { p in
            let nome = Self.normalizar(p.nome)
            // O Git de cada máquina assina como quer: `Júlia Clovandi
            // Vasconcelos` no log, `Júlia Clovandi` na tabela. Um nome que
            // começa pelo outro, palavra inteira, é a mesma pessoa.
            if nome == chave || chave.hasPrefix(nome + " ") || nome.hasPrefix(chave + " ") { return true }
            guard let email = p.email.map(Self.normalizar) else { return false }
            return email == chave || email.split(separator: "@").first.map(String.init) == chave
        }
        guard let pessoa = achada else { return autor }

        let primeiro = Self.primeiroNome(pessoa.nome)
        let repetido = pessoas.filter { Self.primeiroNome($0.nome) == primeiro }.count > 1
        return repetido ? pessoa.nome : primeiro
    }

    /// `[Cauê Carneiro, Júlia Clovandi]` → os dois nomes. O frontmatter
    /// guarda lista YAML como texto, e uma tarefa pode ter mais de um
    /// responsável.
    public static func nomes(em campo: String) -> [String] {
        campo.trimmingCharacters(in: CharacterSet(charactersIn: "[] "))
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }

    private static func primeiroNome(_ nome: String) -> String {
        nome.split(separator: " ").first.map(String.init) ?? nome
    }

    private static func normalizar(_ s: String) -> String {
        s.trimmingCharacters(in: .whitespaces)
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil)
    }
}
