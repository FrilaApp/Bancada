import XCTest
@testable import VaultKit

final class PluralTests: XCTestCase {

    func testUmEhSingular() {
        XCTAssertEqual(Plural.contar(1, "evento", "eventos"), "1 evento")
    }

    func testDoisEmDianteEhPlural() {
        XCTAssertEqual(Plural.contar(2, "evento", "eventos"), "2 eventos")
        XCTAssertEqual(Plural.contar(59, "dia", "dias"), "59 dias")
    }

    /// Zero é plural em português. É o caso que o `(s)` escondia e que uma
    /// implementação ingênua (`n > 1`) erra.
    func testZeroEhPlural() {
        XCTAssertEqual(Plural.contar(0, "nota", "notas"), "0 notas")
        XCTAssertEqual(Plural.contar(0, "fato", "fatos"), "0 fatos")
    }

    func testPalavraSozinha() {
        XCTAssertEqual(Plural.palavra(1, "linha", "linhas"), "linha")
        XCTAssertEqual(Plural.palavra(0, "linha", "linhas"), "linhas")
    }

    /// Plurais irregulares passam pela mesma porta, porque a função recebe as
    /// duas formas em vez de tentar derivar a segunda.
    func testFormaIrregular() {
        XCTAssertEqual(Plural.contar(2, "papel", "papéis"), "2 papéis")
        XCTAssertEqual(Plural.contar(1, "papel", "papéis"), "1 papel")
    }
}
