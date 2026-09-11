import Foundation

/// O recorte que a pessoa pediu na tela do calendário.
///
/// Fica aqui, e não na view, pelo mesmo motivo que o agrupamento e o vínculo:
/// "que eventos aparecem" é uma regra, e regra dentro de `body` não tem teste.
///
/// As três dimensões se somam (E, não OU): buscar "release" com o autor
/// `fbtostadev` marcado mostra o que casa nos dois. Dimensão sem nada marcado
/// não filtra nada — filtro vazio é ausência de filtro, nunca resultado vazio.
public struct FiltroDeEventos: Equatable {
    public var busca: String
    public var especies: Set<EventoDeCalendario.Especie>
    public var autores: Set<String>

    public init(
        busca: String = "",
        especies: Set<EventoDeCalendario.Especie> = [],
        autores: Set<String> = []
    ) {
        self.busca = busca
        self.especies = especies
        self.autores = autores
    }

    public var ativo: Bool {
        !busca.trimmingCharacters(in: .whitespaces).isEmpty
            || !especies.isEmpty
            || !autores.isEmpty
    }

    /// Quantas dimensões estão em uso — o número que a barra de filtros mostra.
    public var quantidadeDeCriterios: Int {
        var n = especies.count + autores.count
        if !busca.trimmingCharacters(in: .whitespaces).isEmpty { n += 1 }
        return n
    }

    public mutating func limpar() {
        busca = ""
        especies = []
        autores = []
    }

    public func aceita(_ evento: EventoDeCalendario) -> Bool {
        let termo = busca.trimmingCharacters(in: .whitespaces)
        if !termo.isEmpty {
            // Busca sem diacrítico e sem caixa: "diario" acha "diário", que é
            // o mínimo para um vault escrito em português.
            // O nome da tarefa entra porque é o que o painel mostra: buscar
            // "ActionShelf" precisa achar o commit que só diz `(T-0001)`.
            let campos = [
                evento.rotulo, evento.titulo, evento.detalhe, evento.autor ?? "", evento.data,
                evento.tarefa?.titulo ?? ""
            ]
            let casa = campos.contains {
                $0.range(of: termo, options: [.caseInsensitive, .diacriticInsensitive]) != nil
            }
            guard casa else { return false }
        }

        if !especies.isEmpty && !especies.contains(evento.especie) { return false }

        if !autores.isEmpty {
            guard let autor = evento.autor, autores.contains(autor) else { return false }
        }

        return true
    }

    public func aplicar(a eventos: [EventoDeCalendario]) -> [EventoDeCalendario] {
        guard ativo else { return eventos }
        return eventos.filter(aceita)
    }

    /// Os dias que sobram, já reagrupados.
    ///
    /// Um dia que perde todos os eventos some da lista — mas continua existindo
    /// na grade, sem tinta: a grade desenha o mês inteiro, não só o que casou.
    public func aplicar(a dias: [DiaDoCalendario]) -> [DiaDoCalendario] {
        guard ativo else { return dias }
        return Calendario.porDia(aplicar(a: dias.flatMap(\.eventos)))
    }
}

extension Calendario {
    /// Os autores que aparecem nos eventos, em ordem alfabética.
    ///
    /// Sai do dado, nunca de uma lista fixa: quem entrar na equipe amanhã
    /// aparece no filtro sem ninguém editar código.
    public static func autores(de eventos: [EventoDeCalendario]) -> [String] {
        Set(eventos.compactMap(\.autor)).sorted {
            $0.localizedCaseInsensitiveCompare($1) == .orderedAscending
        }
    }
}
