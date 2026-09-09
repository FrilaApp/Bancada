import XCTest
@testable import VaultKit

final class VinculoTests: XCTestCase {
    private func fato(_ descricao: String, hora: String = "10:00", data: String = "2026-09-09") -> Fato {
        Fato(data: data, hora: hora, autor: "fbtostadev", tipo: "commit", descricao: descricao)
    }

    /// As duas formas que o log real usa: o ID entre parênteses no fim da
    /// mensagem e o ID no meio da frase.
    func testReconheceOsDoisFormatosDoLogReal() {
        XCTAssertEqual(
            Vinculo.tarefas(em: "`db98d70` — Registra o refinamento de UI da ActionShelf (T-0001) · 6 arquivo(s)"),
            ["T-0001"]
        )
        XCTAssertEqual(
            Vinculo.tarefas(em: "`466f383` — Valida a release v0.1.0 e conclui a T-0004 · 2 arquivo(s)"),
            ["T-0004"]
        )
    }

    func testIDRepetidoAparaceUmaVezSo() {
        // Acontece no log: "Cria tarefa T-0003 — Continuar as iterações (T-0003)".
        XCTAssertEqual(
            Vinculo.tarefas(em: "Cria tarefa T-0003 — Continuar as iterações do Fabricio (T-0003)"),
            ["T-0003"]
        )
    }

    func testVariosIDsSaemNaOrdemEmQueAparecem() {
        XCTAssertEqual(
            Vinculo.tarefas(em: "Renumera a T-0005 depois de fechar a T-0004"),
            ["T-0005", "T-0004"]
        )
    }

    /// O vínculo é literal de propósito: adivinhar aqui faria o registro
    /// atribuir trabalho à tarefa errada.
    func testNaoInventaVinculo() {
        XCTAssertTrue(Vinculo.tarefas(em: "Refatora a navegação da Bancada").isEmpty)
        XCTAssertTrue(Vinculo.tarefas(em: "Ajusta o T-1 do gráfico").isEmpty, "dígitos de menos não é ID")
        XCTAssertTrue(Vinculo.tarefas(em: "Corrige o commit AT-0001").isEmpty, "prefixo colado não é ID")
        XCTAssertTrue(Vinculo.tarefas(em: "t-0001 minúsculo").isEmpty)
    }

    func testFatosDaTarefaSaemEmOrdemCronologica() {
        let fatos = [
            fato("Fecha a T-0002", hora: "16:00", data: "2026-09-09"),
            fato("Abre a T-0002", hora: "09:00", data: "2026-09-08"),
            fato("Nada a ver com tarefa", hora: "10:00"),
            fato("Continua a T-0002", hora: "11:30", data: "2026-09-09")
        ]
        let ligados = Vinculo.fatos(fatos, daTarefa: "T-0002")

        XCTAssertEqual(ligados.map(\.descricao), ["Abre a T-0002", "Continua a T-0002", "Fecha a T-0002"])
    }

    /// Nenhum fato pode sumir do alcance do leitor: o que não cita tarefa
    /// continua contável, e por isso continua mostrável.
    func testFatosSemTarefaSaoContaveis() {
        let fatos = [fato("Fecha a T-0002"), fato("Registra os fatos da sessão")]

        XCTAssertEqual(Vinculo.fatos(fatos, daTarefa: "T-0002").count, 1)
        XCTAssertEqual(Vinculo.fatosSemTarefa(fatos).count, 1)
        XCTAssertEqual(
            Vinculo.fatos(fatos, daTarefa: "T-0002").count + Vinculo.fatosSemTarefa(fatos).count,
            fatos.count
        )
    }

    /// O log do primeiro dia é anterior à convenção de citar o ID — e o
    /// vínculo tem que dizer isso com zero, não com um palpite.
    func testLogRealSemIDsNaoProduzVinculo() throws {
        let url = try XCTUnwrap(Bundle.module.url(
            forResource: "registro-2026-09-08",
            withExtension: "md",
            subdirectory: "Fixtures"
        ))
        let texto = try String(contentsOf: url, encoding: .utf8)
        let (_, corpo) = Frontmatter.separar(de: texto)
        let fatos = LeitorDeFatos.ler(texto: corpo, data: "2026-09-08").fatos

        XCTAssertFalse(fatos.isEmpty)
        XCTAssertEqual(Vinculo.fatosSemTarefa(fatos).count, fatos.count)
    }
}
