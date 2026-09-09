import Foundation

/// A ligação entre um fato do log e a tarefa que ele diz respeito.
///
/// O vínculo não é inferido por similaridade de texto: ou o ID da tarefa está
/// escrito na descrição do fato, ou não está. A convenção já existe no vault —
/// `Registra o refinamento de UI da ActionShelf (T-0001)`, `conclui a T-0004` —
/// e é ela que o app passa a usar, em vez de pedir que a pessoa procure o ID a
/// olho na árvore de registros.
///
/// Uma regra frouxa aqui seria pior que nenhuma: um fato atribuído à tarefa
/// errada faz o registro mentir, e o vault inteiro depende de ele não mentir.
public enum Vinculo {
    /// `T-0001`, `T-042`. Três ou quatro dígitos cobre a numeração do vault
    /// sem casar com um `T-1` acidental no meio de uma frase.
    private static let padrao = try! NSRegularExpression(pattern: "\\bT-\\d{3,4}\\b")

    /// IDs de tarefa citados num texto, sem repetição e na ordem em que aparecem.
    public static func tarefas(em texto: String) -> [String] {
        let alcance = NSRange(texto.startIndex..<texto.endIndex, in: texto)
        var vistos = Set<String>()
        var ids: [String] = []

        for m in padrao.matches(in: texto, range: alcance) {
            guard let r = Range(m.range, in: texto) else { continue }
            let id = String(texto[r])
            if vistos.insert(id).inserted { ids.append(id) }
        }
        return ids
    }

    /// Os fatos que citam esta tarefa, em ordem cronológica.
    public static func fatos(_ fatos: [Fato], daTarefa id: String) -> [Fato] {
        fatos
            .filter { tarefas(em: $0.descricao).contains(id) }
            .sorted { ($0.data, $0.minutoDoDia) < ($1.data, $1.minutoDoDia) }
    }

    /// Fatos que não citam tarefa nenhuma.
    ///
    /// Existe para que o painel possa dizer quantos fatos ficam de fora do
    /// recorte por tarefa: um número que some seria um convite a achar que a
    /// lista filtrada é o log inteiro.
    public static func fatosSemTarefa(_ fatos: [Fato]) -> [Fato] {
        fatos.filter { tarefas(em: $0.descricao).isEmpty }
    }
}
