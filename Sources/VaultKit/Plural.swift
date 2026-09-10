import Foundation

/// Concordância de número em português.
///
/// O app escrevia `(s)` em cinco lugares — "30 evento(s)", "2 dia(s)",
/// "1 arquivo(s)" — e num sexto escrevia `"\(total) eventos"` sem condicional
/// nenhuma, que com total igual a 1 imprime "1 eventos". As duas formas são o
/// mesmo defeito: a interface não sabe contar, e passa o trabalho para quem lê.
///
/// A regra do português é mais simples do que o `(s)` sugere: **só o 1 é
/// singular**. Zero é plural — "0 eventos", nunca "0 evento" —, e é por isso
/// que a função não tem caso especial para o zero.
public enum Plural {

    /// "1 evento", "2 eventos", "0 eventos".
    public static func contar(_ n: Int, _ singular: String, _ plural: String) -> String {
        "\(n) \(n == 1 ? singular : plural)"
    }

    /// Só a palavra, sem o número — para quando a contagem já aparece ao lado.
    public static func palavra(_ n: Int, _ singular: String, _ plural: String) -> String {
        n == 1 ? singular : plural
    }
}
