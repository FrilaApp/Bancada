import Foundation

/// A categoria de um evento de agenda — a cor e o peso vêm dela, nunca do
/// rótulo livre de quem escreveu a linha.
public enum CategoriaDeAgenda: String, CaseIterable, Sendable {
    case rotina, marco, academia, feriado, atividade

    public var rotulo: String {
        switch self {
        case .rotina: return "Rotina"
        case .marco: return "Marco"
        case .academia: return "Academia"
        case .feriado: return "Feriado"
        case .atividade: return "Atividade"
        }
    }
}

/// Uma linha de `01 - CBL/Desafios/<id>/Agenda - <id>.md`, já separada mas
/// ainda não expandida em dias — `categoria` fica como string crua porque uma
/// categoria que a Academy inventar amanhã não pode quebrar o parser.
public struct EventoDeAgendaBruto: Equatable {
    public let dataInicio: String
    public let dataFim: String?
    public let categoria: String
    public let rotulo: String

    public init(dataInicio: String, dataFim: String? = nil, categoria: String, rotulo: String) {
        self.dataInicio = dataInicio
        self.dataFim = dataFim
        self.categoria = categoria
        self.rotulo = rotulo
    }

    /// Os dias ISO que o evento cobre — um só quando não há `dataFim`, ou
    /// quando as datas vierem malformadas (a data de início nunca se perde).
    public var dias: [String] {
        guard let dataFim, dataFim != dataInicio else { return [dataInicio] }
        guard let inicio = DataISO.data(dataInicio), let fim = DataISO.data(dataFim), inicio <= fim else {
            return [dataInicio]
        }

        var resultado: [String] = []
        var cursor = inicio
        while cursor <= fim {
            resultado.append(DataISO.texto(cursor))
            guard let proximo = DataISO.calendario.date(byAdding: .day, value: 1, to: cursor) else { break }
            cursor = proximo
        }
        return resultado
    }
}

/// Lê `01 - CBL/Desafios/<id>/Agenda - <id>.md`.
///
/// Mesma disciplina do `LeitorDeFatos`: um formato só, produzido à mão mas
/// documentado no `CLAUDE.md` do doc-harness, então o parser pode ser estrito
/// e uma linha fora do formato vira `nil` em vez de palpite.
public enum LeitorDeAgenda {
    /// `- \`2026-09-14/2026-09-18\` · **rotina** · Home Office`
    private static let padrao = try! NSRegularExpression(
        pattern: "^-\\s+`(\\d{4}-\\d{2}-\\d{2})(?:/(\\d{4}-\\d{2}-\\d{2}))?`\\s+·\\s+\\*\\*(.+?)\\*\\*\\s+·\\s+(.*)$"
    )

    public static func ler(texto: String) -> (eventos: [EventoDeAgendaBruto], naoReconhecidas: [String]) {
        var eventos: [EventoDeAgendaBruto] = []
        var naoReconhecidas: [String] = []

        for linha in texto.components(separatedBy: "\n") {
            let limpa = linha.trimmingCharacters(in: .whitespaces)
            // Só linha de item interessa; frontmatter, títulos e o parágrafo de
            // explicação do formato no topo da nota são ruído esperado.
            guard limpa.hasPrefix("- ") else { continue }

            if let evento = parsear(linha: limpa) {
                eventos.append(evento)
            } else {
                naoReconhecidas.append(limpa)
            }
        }
        return (eventos, naoReconhecidas)
    }

    public static func parsear(linha: String) -> EventoDeAgendaBruto? {
        let alcance = NSRange(linha.startIndex..<linha.endIndex, in: linha)
        guard let m = padrao.firstMatch(in: linha, range: alcance) else { return nil }

        func grupo(_ i: Int) -> String? {
            guard let r = Range(m.range(at: i), in: linha) else { return nil }
            let texto = String(linha[r]).trimmingCharacters(in: .whitespaces)
            return texto.isEmpty ? nil : texto
        }

        guard let dataInicio = grupo(1), let categoria = grupo(3), let rotulo = grupo(4) else { return nil }

        return EventoDeAgendaBruto(dataInicio: dataInicio, dataFim: grupo(2), categoria: categoria, rotulo: rotulo)
    }
}
