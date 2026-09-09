import Foundation

/// Datas do vault, que circulam sempre como texto ISO (`2026-09-09`) no
/// frontmatter e no nome dos arquivos de log.
///
/// A conversão ancora ao meio-dia de propósito. Um `Date` na meia-noite local
/// atravessa a fronteira do dia com qualquer deslocamento de fuso ou horário de
/// verão, e um evento que aparece no dia anterior num calendário destrói a
/// confiança na tela inteira. Meio-dia dá doze horas de folga para os dois lados.
public enum DataISO {
    /// Gregoriano explícito: o calendário do sistema pode não ser, e o vault
    /// grava data gregoriana.
    public static var calendario: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = .current
        return c
    }

    public static func componentes(_ iso: String) -> DateComponents? {
        let partes = iso.split(separator: "-")
        guard partes.count == 3,
              let ano = Int(partes[0]), let mes = Int(partes[1]), let dia = Int(partes[2]),
              (1...12).contains(mes), (1...31).contains(dia)
        else { return nil }
        return DateComponents(year: ano, month: mes, day: dia)
    }

    /// Meio-dia local do dia indicado. Ver a nota acima sobre a âncora.
    public static func data(_ iso: String) -> Date? {
        guard var c = componentes(iso) else { return nil }
        c.hour = 12
        return calendario.date(from: c)
    }

    public static func texto(_ data: Date) -> String {
        let c = calendario.dateComponents([.year, .month, .day], from: data)
        guard let a = c.year, let m = c.month, let d = c.day else { return "" }
        return String(format: "%04d-%02d-%02d", a, m, d)
    }
}

/// Uma coisa que aconteceu num dia — a unidade que a tela de calendário desenha.
///
/// É um tipo só para as três origens porque o calendário precisa desenhá-las
/// juntas na mesma célula. `origem` permite abrir o arquivo de onde o evento
/// veio; `hora` é opcional porque só fato tem hora.
public struct EventoDeCalendario: Identifiable, Equatable {
    public enum Especie: String, CaseIterable, Sendable {
        case fato, diario, tarefaCriada

        public var rotulo: String {
            switch self {
            case .fato: return "Fatos"
            case .diario: return "Diário"
            case .tarefaCriada: return "Tarefas criadas"
            }
        }

        public var simbolo: String {
            switch self {
            case .fato: return "circle.fill"
            case .diario: return "text.alignleft"
            case .tarefaCriada: return "checklist"
            }
        }
    }

    public let data: String          // ISO, como no vault
    public let hora: String?         // HH:MM — só fatos têm
    public let especie: Especie
    public let rotulo: String
    public let detalhe: String
    public let origem: URL?

    public var id: String { "\(data) \(hora ?? "--") \(especie.rawValue) \(rotulo)" }

    public init(
        data: String,
        hora: String? = nil,
        especie: Especie,
        rotulo: String,
        detalhe: String = "",
        origem: URL? = nil
    ) {
        self.data = data
        self.hora = hora
        self.especie = especie
        self.rotulo = rotulo
        self.detalhe = detalhe
        self.origem = origem
    }

    /// Minutos desde a meia-noite; evento sem hora vai para o fim do dia.
    public var minutoDoDia: Int {
        guard let hora else { return 24 * 60 }
        let partes = hora.components(separatedBy: ":")
        guard partes.count == 2, let h = Int(partes[0]), let m = Int(partes[1]) else { return 24 * 60 }
        return h * 60 + m
    }
}

/// Um dia com o que aconteceu nele.
public struct DiaDoCalendario: Identifiable, Equatable {
    public let data: String
    public let eventos: [EventoDeCalendario]

    public var id: String { data }

    public func quantidade(de especie: EventoDeCalendario.Especie) -> Int {
        eventos.filter { $0.especie == especie }.count
    }
}

/// Agrega o vault em eventos por dia.
///
/// Puro e sem UI, como o resto do VaultKit: a grade de mês é desenho, e desenho
/// não deve ser onde a regra de "que dia é este evento" mora.
public enum Calendario {
    public static func eventos(de vault: Vault) -> [EventoDeCalendario] {
        var todos: [EventoDeCalendario] = []

        for fato in vault.fatos {
            todos.append(EventoDeCalendario(
                data: fato.data,
                hora: fato.hora,
                especie: .fato,
                rotulo: fato.descricao,
                detalhe: "\(fato.tipo) · \(fato.autor)"
            ))
        }

        for nota in vault.notas(tipo: .atualizacaoDiaria) {
            guard let data = nota.data else { continue }
            todos.append(EventoDeCalendario(
                data: data,
                especie: .diario,
                rotulo: nota.titulo,
                detalhe: nota.caminhoRelativo,
                origem: nota.url
            ))
        }

        for tarefa in vault.tarefas {
            guard let data = tarefa.dataCriacao else { continue }
            todos.append(EventoDeCalendario(
                data: data,
                especie: .tarefaCriada,
                rotulo: "\(tarefa.identificador ?? "—") \(tarefa.titulo)",
                detalhe: tarefa.status?.rotulo ?? "sem status",
                origem: tarefa.url
            ))
        }

        return todos
    }

    /// Os dias que têm algum evento, do mais recente para o mais antigo.
    ///
    /// Dias vazios não entram: quem preenche o mês inteiro é a grade, que sabe
    /// quantas células precisa. Um dia sem registro é um dado, não uma falha a
    /// esconder — mas também não é um evento.
    public static func porDia(_ eventos: [EventoDeCalendario]) -> [DiaDoCalendario] {
        Dictionary(grouping: eventos, by: \.data)
            .map { data, lista in
                DiaDoCalendario(
                    data: data,
                    eventos: lista.sorted { $0.minutoDoDia < $1.minutoDoDia }
                )
            }
            .sorted { $0.data > $1.data }
    }

    public static func porDia(de vault: Vault) -> [DiaDoCalendario] {
        porDia(eventos(de: vault))
    }
}
