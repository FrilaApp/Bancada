import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

/// Credenciais e escopo da leitura do Trello.
public struct ConfiguracaoDoTrello: Equatable, Sendable {
    public var chave: String
    public var token: String
    /// Opcional: quando informado, limita a sincronização a um quadro.
    public var quadroID: String

    public init(chave: String = "", token: String = "", quadroID: String = "") {
        self.chave = chave
        self.token = token
        self.quadroID = quadroID
    }

    public var habilitada: Bool {
        !chave.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !token.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    public static func doAmbiente(em arquivos: [URL] = []) -> ConfiguracaoDoTrello {
        var valores: [String: String] = [:]
        for arquivo in arquivos {
            guard let texto = try? String(contentsOf: arquivo, encoding: .utf8) else { continue }
            for linha in texto.components(separatedBy: .newlines) {
                let limpa = linha.trimmingCharacters(in: .whitespaces)
                guard !limpa.isEmpty, !limpa.hasPrefix("#"),
                      let separador = limpa.firstIndex(of: "=") else { continue }
                let chave = String(limpa[..<separador]).trimmingCharacters(in: .whitespaces)
                var valor = String(limpa[limpa.index(after: separador)...])
                    .trimmingCharacters(in: .whitespaces)
                if valor.count >= 2,
                   ((valor.hasPrefix("\"") && valor.hasSuffix("\""))
                    || (valor.hasPrefix("'") && valor.hasSuffix("'"))) {
                    valor = String(valor.dropFirst().dropLast())
                }
                valores[chave] = valor
            }
        }

        let ambiente = ProcessInfo.processInfo.environment
        return ConfiguracaoDoTrello(
            chave: ambiente["TRELLO_KEY"] ?? valores["TRELLO_KEY"] ?? "",
            token: ambiente["TRELLO_TOKEN"] ?? valores["TRELLO_TOKEN"] ?? "",
            quadroID: ambiente["TRELLO_BOARD_ID"] ?? valores["TRELLO_BOARD_ID"] ?? ""
        )
    }
}

public struct TarefaDoTrello: Equatable, Identifiable, Sendable {
    public let id: String
    public let nome: String
    public let prazo: Date
    public let quadro: String
    public let url: URL?

    public init(id: String, nome: String, prazo: Date, quadro: String, url: URL?) {
        self.id = id
        self.nome = nome
        self.prazo = prazo
        self.quadro = quadro
        self.url = url
    }
}

public enum ErroDoTrello: LocalizedError {
    case configuracaoAusente
    case respostaInvalida(Int)
    case dadosInvalidos

    public var errorDescription: String? {
        switch self {
        case .configuracaoAusente:
            return "Informe a chave e o token do Trello em Ajustes."
        case .respostaInvalida(let codigo):
            return "O Trello respondeu com o código \(codigo). Verifique a chave e o token."
        case .dadosInvalidos:
            return "O Trello devolveu dados em um formato inesperado."
        }
    }
}

/// Cliente mínimo da API REST v1 do Trello. A Bancada só lê cartões com prazo;
/// nenhuma operação de escrita é exposta pelo cliente.
public struct ClienteDoTrello: Sendable {
    private let sessao: URLSession

    public init(sessao: URLSession = .shared) {
        self.sessao = sessao
    }

    public func tarefas(com configuracao: ConfiguracaoDoTrello) async throws -> [TarefaDoTrello] {
        guard configuracao.habilitada else { throw ErroDoTrello.configuracaoAusente }

        let quadros: [Quadro] = if configuracao.quadroID.isEmpty {
            try await requisitar(
                caminho: "/members/me/boards",
                configuracao: configuracao,
                query: ["filter": "open", "fields": "id,name"]
            )
        } else {
            [Quadro(id: configuracao.quadroID, name: "Quadro selecionado")]
        }

        var resultado: [TarefaDoTrello] = []
        for quadro in quadros {
            let cartoes: [Cartao] = try await requisitar(
                caminho: "/boards/\(quadro.id)/cards",
                configuracao: configuracao,
                query: ["filter": "all", "fields": "id,name,due,url,closed"]
            )
            resultado += cartoes.compactMap { cartao in
                guard !cartao.closed, let due = cartao.due, let prazo = DataISO.trelloDate(due) else {
                    return nil
                }
                return TarefaDoTrello(
                    id: cartao.id,
                    nome: cartao.name,
                    prazo: prazo,
                    quadro: quadro.name,
                    url: URL(string: cartao.url ?? "")
                )
            }
        }
        return resultado.sorted { $0.prazo < $1.prazo }
    }

    private func requisitar<T: Decodable>(
        caminho: String,
        configuracao: ConfiguracaoDoTrello,
        query: [String: String]
    ) async throws -> T {
        var componentes = URLComponents(string: "https://api.trello.com/1\(caminho)")
        componentes?.queryItems = (query.map { URLQueryItem(name: $0.key, value: $0.value) }
            + [
                URLQueryItem(name: "key", value: configuracao.chave),
                URLQueryItem(name: "token", value: configuracao.token)
            ])
        guard let url = componentes?.url else { throw ErroDoTrello.dadosInvalidos }

        let (dados, resposta) = try await sessao.data(from: url)
        guard let http = resposta as? HTTPURLResponse else { throw ErroDoTrello.dadosInvalidos }
        guard (200..<300).contains(http.statusCode) else {
            throw ErroDoTrello.respostaInvalida(http.statusCode)
        }
        do {
            return try JSONDecoder().decode(T.self, from: dados)
        } catch {
            throw ErroDoTrello.dadosInvalidos
        }
    }

    private struct Quadro: Decodable {
        let id: String
        let name: String
    }

    private struct Cartao: Decodable {
        let id: String
        let name: String
        let due: String?
        let url: String?
        let closed: Bool
    }
}

extension DataISO {
    public static func trelloDate(_ string: String) -> Date? {
        let formatador = ISO8601DateFormatter()
        formatador.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatador.date(from: string)
            ?? {
                formatador.formatOptions = [.withInternetDateTime]
                return formatador.date(from: string)
            }()
    }
}
