import XCTest
@testable import VaultKit

final class LeitorDeAgendaTests: XCTestCase {
    func testLinhaDeUmDiaSo() throws {
        let linha = "- `2026-09-09` · **atividade** · Definição Big Idea"
        let evento = try XCTUnwrap(LeitorDeAgenda.parsear(linha: linha))

        XCTAssertEqual(evento.dataInicio, "2026-09-09")
        XCTAssertNil(evento.dataFim)
        XCTAssertEqual(evento.categoria, "atividade")
        XCTAssertEqual(evento.rotulo, "Definição Big Idea")
    }

    func testLinhaComIntervalo() throws {
        let linha = "- `2026-09-14/2026-09-18` · **rotina** · Home Office"
        let evento = try XCTUnwrap(LeitorDeAgenda.parsear(linha: linha))

        XCTAssertEqual(evento.dataInicio, "2026-09-14")
        XCTAssertEqual(evento.dataFim, "2026-09-18")
        XCTAssertEqual(evento.categoria, "rotina")
    }

    func testRotuloComPontuacaoNaoQuebraOParser() throws {
        let linha = "- `2026-09-28` · **academia** · Apple Review: Apresentação de escopo; item · dois"
        let evento = try XCTUnwrap(LeitorDeAgenda.parsear(linha: linha))
        XCTAssertEqual(evento.rotulo, "Apple Review: Apresentação de escopo; item · dois")
    }

    func testLinhaForaDoFormatoNaoEAdivinhada() {
        XCTAssertNil(LeitorDeAgenda.parsear(linha: "- alguém editou isso à mão"))
    }

    func testLeTodasAsLinhasEIgnoraOResto() {
        let texto = """
        # Agenda — C18

        Texto de explicação do formato, sem marcador de item.

        ## Eventos
        - `2026-09-08` · **marco** · Início
        - `2026-09-09` · **atividade** · Definição Big Idea
        - isso aqui não casa com o formato
        """
        let resultado = LeitorDeAgenda.ler(texto: texto)

        XCTAssertEqual(resultado.eventos.count, 2)
        XCTAssertEqual(resultado.naoReconhecidas, ["- isso aqui não casa com o formato"])
    }
}

final class EventoDeAgendaBrutoTests: XCTestCase {
    func testDiaUnicoDevolveUmDiaSo() {
        let evento = EventoDeAgendaBruto(dataInicio: "2026-09-09", categoria: "marco", rotulo: "x")
        XCTAssertEqual(evento.dias, ["2026-09-09"])
    }

    func testIntervaloExpandeTodosOsDiasInclusive() {
        let evento = EventoDeAgendaBruto(
            dataInicio: "2026-09-14", dataFim: "2026-09-18", categoria: "rotina", rotulo: "Home Office"
        )
        XCTAssertEqual(evento.dias, [
            "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18"
        ])
    }

    func testDataFimIgualADataInicioNaoDuplica() {
        let evento = EventoDeAgendaBruto(
            dataInicio: "2026-09-09", dataFim: "2026-09-09", categoria: "marco", rotulo: "x"
        )
        XCTAssertEqual(evento.dias, ["2026-09-09"])
    }

    /// Uma `dataFim` malformada não trava a nota inteira — o evento cai de
    /// volta para um único dia em vez de propagar `nil`.
    func testDataFimInvalidaNaoQuebraOEvento() {
        let evento = EventoDeAgendaBruto(
            dataInicio: "2026-09-09", dataFim: "não-é-data", categoria: "marco", rotulo: "x"
        )
        XCTAssertEqual(evento.dias, ["2026-09-09"])
    }
}
