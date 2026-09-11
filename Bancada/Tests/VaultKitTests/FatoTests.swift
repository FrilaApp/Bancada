import XCTest
@testable import VaultKit

/// O parser é conferido contra o log real do primeiro dia de uso do
/// doc-harness, copiado sem edição para `Fixtures/`. Um parser que não
/// reproduz aquele arquivo não serve — é o formato que os hooks realmente
/// produzem, não o que a documentação diz que produzem.
final class FatoTests: XCTestCase {
    private func carregarLogReal() throws -> String {
        let url = try XCTUnwrap(Bundle.module.url(
            forResource: "registro-2026-09-08",
            withExtension: "md",
            subdirectory: "Fixtures"
        ))
        return try String(contentsOf: url, encoding: .utf8)
    }

    func testLeTodosOsFatosDoLogReal() throws {
        let texto = try carregarLogReal()
        let (_, corpo) = Frontmatter.separar(de: texto)
        let resultado = LeitorDeFatos.ler(texto: corpo, data: "2026-09-08")

        XCTAssertEqual(resultado.fatos.count, 26)
        XCTAssertTrue(
            resultado.naoReconhecidas.isEmpty,
            "linhas não reconhecidas: \(resultado.naoReconhecidas)"
        )
    }

    func testCamposDaPrimeiraLinha() throws {
        let texto = try carregarLogReal()
        let (_, corpo) = Frontmatter.separar(de: texto)
        let primeiro = try XCTUnwrap(LeitorDeFatos.ler(texto: corpo, data: "2026-09-08").fatos.first)

        XCTAssertEqual(primeiro.hora, "19:53")
        XCTAssertEqual(primeiro.autor, "fbtostadev")
        XCTAssertEqual(primeiro.tipo, "commit")
        XCTAssertEqual(
            primeiro.descricao,
            "`d622a3a` — Transforma o repositório no vault compartilhado do Challenge 18 · 25 arquivo(s)"
        )
    }

    func testAutorComAcentoEEspaco() throws {
        let linha = "- `21:30` · **Cauê Carneiro** · `commit` · `d293be9` — Teste · 1 arquivo(s)"
        let fato = try XCTUnwrap(LeitorDeFatos.parsear(linha: linha, data: "2026-09-08"))
        XCTAssertEqual(fato.autor, "Cauê Carneiro")
    }

    func testMinutoDoDia() {
        let fato = Fato(data: "2026-09-08", hora: "21:30", autor: "a", tipo: "commit", descricao: "x")
        XCTAssertEqual(fato.minutoDoDia, 21 * 60 + 30)
    }

    func testLinhaForaDoFormatoNaoEAdivinhada() {
        // A porta de escrita é única (`registrar-fato.sh`), então tudo que
        // foge do formato é sinal de edição manual — e precisa aparecer.
        let linha = "- alguém editou este log à mão"
        XCTAssertNil(LeitorDeFatos.parsear(linha: linha, data: "2026-09-08"))
    }
}
