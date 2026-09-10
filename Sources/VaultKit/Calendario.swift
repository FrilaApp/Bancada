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
    ///
    /// O `locale` precisa ser atribuído à mão. `Calendar(identifier:)` devolve
    /// um calendário cujo `locale` não é `nil` — é um locale *vazio* —, então
    /// um `?? .current` nunca dispara e todo formatador que herda daqui cai no
    /// formato raiz do ICU: `2026 M09` no lugar de `setembro de 2026`, e
    /// `Sun Mon Tue` no lugar de `dom seg ter`.
    public static var calendario: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = .current
        c.locale = .current
        return c
    }

    /// O locale de um calendário, ignorando o vazio que o Foundation devolve.
    static func locale(de calendario: Calendar) -> Locale {
        guard let l = calendario.locale, !l.identifier.isEmpty else { return .current }
        return l
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
    /// Quem fez. Fato traz o autor do commit; tarefa, o responsável; o diário
    /// não tem autoria própria — a narrativa é do dia, não de uma pessoa.
    public let autor: String?
    public let origem: URL?

    public var id: String { "\(data) \(hora ?? "--") \(especie.rawValue) \(rotulo)" }

    public init(
        data: String,
        hora: String? = nil,
        especie: Especie,
        rotulo: String,
        detalhe: String = "",
        autor: String? = nil,
        origem: URL? = nil
    ) {
        self.data = data
        self.hora = hora
        self.especie = especie
        self.rotulo = rotulo
        self.detalhe = detalhe
        self.autor = autor
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
                detalhe: fato.tipo,
                autor: fato.autor
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
                autor: tarefa.responsavel,
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

    // MARK: - A grade

    /// As semanas que cobrem o mês do dia âncora, cada uma com sete datas ISO.
    ///
    /// Inclui os dias vizinhos que completam a primeira e a última semana —
    /// uma grade com buracos nas pontas obriga quem lê a contar colunas para
    /// saber em que dia da semana o mês começou.
    ///
    /// O primeiro dia da semana vem do `Calendar` do sistema (domingo no
    /// Brasil, segunda em boa parte da Europa) em vez de ser fixado no código.
    /// Quantos dias têm ao menos um evento.
    ///
    /// A grade do mês só se paga quando há dias marcados o bastante para
    /// preenchê-la; abaixo disso ela vira uma planilha em branco de 35 células.
    /// Quem decide o corte é a interface — aqui fica só a contagem, que é
    /// leitura do vault e não desenho.
    public static func diasComEvento(_ dias: [DiaDoCalendario]) -> Int {
        dias.reduce(0) { $0 + ($1.eventos.isEmpty ? 0 : 1) }
    }

    public static func semanasDoMes(
        de ancoraISO: String,
        calendario: Calendar = DataISO.calendario
    ) -> [[String]] {
        guard
            let ancora = DataISO.data(ancoraISO),
            let intervalo = calendario.dateInterval(of: .month, for: ancora),
            let primeiraSemana = calendario.dateInterval(of: .weekOfMonth, for: intervalo.start)
        else { return [] }

        var semanas: [[String]] = []
        var cursor = primeiraSemana.start

        // `intervalo.end` é o primeiro instante do mês seguinte, então a
        // comparação estrita é a certa: um mês que fecha no sábado não ganha
        // uma oitava linha vazia.
        while cursor < intervalo.end {
            var semana: [String] = []
            for deslocamento in 0..<7 {
                guard let dia = calendario.date(byAdding: .day, value: deslocamento, to: cursor) else { break }
                semana.append(DataISO.texto(dia))
            }
            guard semana.count == 7 else { break }
            semanas.append(semana)
            guard let proxima = calendario.date(byAdding: .weekOfYear, value: 1, to: cursor) else { break }
            cursor = proxima
        }
        return semanas
    }

    /// A janela visível quando a grade está comprimida.
    ///
    /// É a regra do sanfonar: a semana do dia âncora nunca sai de vista, e a
    /// grade cresce a partir dela até o mês inteiro. Comprimir escondendo
    /// justamente o dia selecionado seria comprimir contra quem está olhando.
    public static func janelaDeSemanas(
        de ancoraISO: String,
        semanas quantidade: Int,
        calendario: Calendar = DataISO.calendario
    ) -> [[String]] {
        let todas = semanasDoMes(de: ancoraISO, calendario: calendario)
        guard !todas.isEmpty else { return [] }

        let alvo = max(1, min(quantidade, todas.count))
        guard alvo < todas.count else { return todas }

        let indiceDaAncora = todas.firstIndex { $0.contains(ancoraISO) } ?? 0

        // Cresce para baixo a partir da semana âncora e, quando bate no fim do
        // mês, completa para cima — assim a janela tem sempre `alvo` semanas.
        var inicio = indiceDaAncora
        var fim = indiceDaAncora + 1
        while fim - inicio < alvo {
            if fim < todas.count {
                fim += 1
            } else if inicio > 0 {
                inicio -= 1
            } else {
                break
            }
        }
        return Array(todas[inicio..<fim])
    }

    /// Os rótulos das colunas, na ordem em que a grade as desenha e no idioma
    /// do sistema: `dom seg ter …` aqui, `Mon Tue Wed …` numa máquina em inglês.
    public static func rotulosDasColunas(calendario: Calendar = DataISO.calendario) -> [String] {
        let formatador = DateFormatter()
        formatador.calendar = calendario
        formatador.locale = DataISO.locale(de: calendario)
        let simbolos = formatador.shortStandaloneWeekdaySymbols ?? ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

        // `firstWeekday` é 1-based (1 = domingo); os símbolos vêm sempre a
        // partir de domingo, então a lista é rotacionada para casar.
        let deslocamento = calendario.firstWeekday - 1
        guard simbolos.count == 7, deslocamento > 0 else { return simbolos }
        return Array(simbolos[deslocamento...] + simbolos[..<deslocamento])
    }

    /// `setembro de 2026` — o título do mês, no idioma do sistema.
    public static func rotuloDoMes(
        de ancoraISO: String,
        calendario: Calendar = DataISO.calendario
    ) -> String {
        guard let data = DataISO.data(ancoraISO) else { return ancoraISO }
        let formatador = DateFormatter()
        formatador.calendar = calendario
        formatador.locale = DataISO.locale(de: calendario)
        formatador.setLocalizedDateFormatFromTemplate("yMMMM")
        return formatador.string(from: data)
    }

    /// Anda `passo` meses a partir da âncora, preservando o dia quando ele
    /// existe no mês de destino — 31 de janeiro recuando vira 28 de fevereiro,
    /// não 3 de março.
    public static func mes(
        deslocando ancoraISO: String,
        em passo: Int,
        calendario: Calendar = DataISO.calendario
    ) -> String {
        guard
            let data = DataISO.data(ancoraISO),
            let destino = calendario.date(byAdding: .month, value: passo, to: data)
        else { return ancoraISO }
        return DataISO.texto(destino)
    }

    /// Anda `passo` dias — o que as setas do teclado fazem na grade.
    public static func dia(
        deslocando ancoraISO: String,
        em passo: Int,
        calendario: Calendar = DataISO.calendario
    ) -> String {
        guard
            let data = DataISO.data(ancoraISO),
            let destino = calendario.date(byAdding: .day, value: passo, to: data)
        else { return ancoraISO }
        return DataISO.texto(destino)
    }

    public static func mesmoMes(
        _ a: String,
        _ b: String,
        calendario: Calendar = DataISO.calendario
    ) -> Bool {
        guard let da = DataISO.data(a), let db = DataISO.data(b) else { return false }
        return calendario.isDate(da, equalTo: db, toGranularity: .month)
    }
}
