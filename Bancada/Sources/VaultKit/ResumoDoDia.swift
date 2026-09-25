import Foundation

/// O trabalho de um dia sobre uma tarefa — ou o que não citou tarefa nenhuma.
///
/// É a unidade de leitura do calendário. Um dia com 30 commits não é 30
/// coisas: é "a UI da Bancada andou, a ActionShelf andou, a release saiu". O
/// agrupamento usa o vínculo explícito do `Vinculo` — o ID escrito na
/// mensagem —, nunca semelhança de texto.
public struct AssuntoDoDia: Identifiable, Equatable {
    public let tarefa: TarefaCitada?
    /// Em ordem de hora.
    public let eventos: [EventoDeCalendario]

    public var id: String { tarefa?.id ?? "outros" }

    public var titulo: String {
        guard let tarefa else { return "Outros" }
        return tarefa.titulo ?? "Tarefa \(tarefa.id)"
    }

    /// Quem trabalhou nisso, de quem mais registrou para quem menos.
    public var autores: [String] { ResumoDoDia.porFrequencia(eventos.compactMap(\.autor)) }
}

/// Um dia do calendário lido em camadas, da mais digerível para a mais crua:
/// agenda, narrativa, trabalho por tarefa, bastidor e, por fim, o log inteiro.
///
/// Mora no `VaultKit` pelo motivo de sempre: "o que conta como trabalho" e
/// "como um dia se resume" são regras, e regra dentro de `body` não tem teste.
public struct ResumoDoDia: Equatable {
    public let data: String
    public let agenda: [EventoDeCalendario]
    public let trello: [EventoDeCalendario]
    /// Trabalho agrupado: tarefas por volume, `Outros` sempre por último.
    public let assuntos: [AssuntoDoDia]
    /// O vault registrando a si mesmo. Ver `LeituraDeFato.ehBastidor`.
    public let bastidor: [EventoDeCalendario]
    /// O log do dia, intacto — bastidor incluído, em ordem de hora.
    public let registro: [EventoDeCalendario]
    let diario: EventoDeCalendario?

    public init(_ dia: DiaDoCalendario) {
        data = dia.data
        agenda = dia.eventos.filter { $0.especie == .agenda }
        trello = dia.eventos.filter { $0.especie == .trello }
        diario = dia.eventos.first { $0.especie == .diario }

        let porHora = dia.eventos.sorted { $0.minutoDoDia < $1.minutoDoDia }
        registro = porHora.filter { $0.especie == .fato }
        bastidor = porHora.filter(\.bastidor)

        let trabalho = porHora.filter {
            ($0.especie == .fato || $0.especie == .tarefaCriada) && !$0.bastidor
        }
        let grupos = Dictionary(grouping: trabalho) { $0.tarefa?.id ?? "" }
        let comTarefa = grupos
            .filter { !$0.key.isEmpty }
            .map { AssuntoDoDia(tarefa: $0.value.first?.tarefa, eventos: $0.value) }
            .sorted {
                $0.eventos.count != $1.eventos.count
                    ? $0.eventos.count > $1.eventos.count
                    : $0.id < $1.id
            }
        let soltos = grupos[""].map { [AssuntoDoDia(tarefa: nil, eventos: $0)] } ?? []
        assuntos = comTarefa + soltos
    }

    /// Onde a narrativa do dia está, para abrir o arquivo.
    public var origemDaNarrativa: URL? { diario?.origem }

    /// Os itens de "O que foi feito" da narrativa diária, sem a referência
    /// técnica do fim de cada um.
    ///
    /// É a leitura mais digerível que o vault tem — uma pessoa já fez o
    /// trabalho de transformar 30 commits em frases —, então lidera o painel
    /// quando existe. Sem a seção, vale a primeira lista da nota: a narrativa
    /// é escrita à mão e o título pode variar.
    public var narrativa: [Markdown.Item] {
        guard let texto = diario?.texto else { return [] }
        let blocos = Markdown.blocos(de: texto)

        var lista: [Markdown.Item]?
        for (i, bloco) in blocos.enumerated() {
            guard case let .titulo(_, trechos) = bloco,
                  Self.normalizar(Markdown.textoPlano(trechos)) == "o que foi feito",
                  i + 1 < blocos.count,
                  case let .lista(itens) = blocos[i + 1]
            else { continue }
            lista = itens
            break
        }
        if lista == nil {
            lista = blocos.lazy.compactMap { bloco -> [Markdown.Item]? in
                if case let .lista(itens) = bloco { return itens }
                return nil
            }.first
        }

        return (lista ?? [])
            .filter { $0.marca != .vazia }
            .map { Markdown.Item(recuo: $0.recuo, marca: $0.marca, trechos: Markdown.semReferenciaFinal($0.trechos)) }
    }

    public var quantidadeDeTrabalho: Int { assuntos.reduce(0) { $0 + $1.eventos.count } }

    public var tarefas: [AssuntoDoDia] { assuntos.filter { $0.tarefa != nil } }

    /// Quem trabalhou no dia, de quem mais registrou para quem menos.
    public var pessoas: [String] {
        Self.porFrequencia(assuntos.flatMap(\.eventos).compactMap(\.autor))
    }

    /// O que a célula da grade mostra depois da agenda: o nome das tarefas do
    /// dia. O trabalho fora de tarefa só entra quando o dia não tem tarefa
    /// nenhuma — misturado às tarefas, cada commit solto virava um "+1" e a
    /// célula voltava a contar commits (`+13`) em vez de dizer o que andou.
    public var destaques: [String] {
        let nomes = tarefas.map(\.titulo)
        guard nomes.isEmpty else { return nomes }
        return assuntos.first { $0.tarefa == nil }?.eventos.map(\.titulo) ?? []
    }

    /// Uma frase sobre o dia, para quem não quer ler lista nenhuma.
    ///
    /// `nil` quando o dia só tem agenda ou só narrativa: a frase fala de
    /// trabalho registrado, e inventar uma para um dia sem ele seria enfeite.
    public var frase: String? {
        let soltos = assuntos.first { $0.tarefa == nil }?.eventos.count ?? 0
        let nTarefas = tarefas.count

        guard quantidadeDeTrabalho > 0 else {
            return bastidor.isEmpty ? nil : "Só manutenção do registro."
        }

        let quem = pessoas.isEmpty ? "A equipe" : Self.listar(pessoas)
        let varios = pessoas.count > 1

        guard nTarefas > 0 else {
            return "\(quem) \(varios ? "fizeram" : "fez") \(Plural.contar(soltos, "registro", "registros"))."
        }
        var frase = "\(quem) \(varios ? "avançaram" : "avançou") \(Plural.contar(nTarefas, "tarefa", "tarefas"))"
        if soltos > 0 {
            frase += ", com mais \(Plural.contar(soltos, "registro", "registros")) fora delas"
        }
        return frase + "."
    }

    /// "Fabrício", "Fabrício e Cauê", "Fabrício, Cauê e João".
    public static func listar(_ nomes: [String]) -> String {
        guard let ultimo = nomes.last else { return "" }
        guard nomes.count > 1 else { return ultimo }
        return nomes.dropLast().joined(separator: ", ") + " e " + ultimo
    }

    static func porFrequencia(_ nomes: [String]) -> [String] {
        var contagem: [String: Int] = [:]
        for nome in nomes { contagem[nome, default: 0] += 1 }
        return contagem.keys.sorted { a, b in
            let (na, nb) = (contagem[a] ?? 0, contagem[b] ?? 0)
            return na != nb ? na > nb : a < b
        }
    }

    private static func normalizar(_ s: String) -> String {
        s.trimmingCharacters(in: .whitespaces)
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil)
    }
}
