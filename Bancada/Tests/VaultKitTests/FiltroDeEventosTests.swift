import XCTest
@testable import VaultKit

final class FiltroDeEventosTests: XCTestCase {
    private let eventos: [EventoDeCalendario] = [
        EventoDeCalendario(
            data: "2026-09-09", hora: "05:22", especie: .fato,
            rotulo: "Refinamento de UI da ActionShelf", detalhe: "ui", autor: "fbtostadev"
        ),
        EventoDeCalendario(
            data: "2026-09-09", hora: "14:17", especie: .fato,
            rotulo: "Registra os fatos da sessão", detalhe: "commit", autor: "Cauê Carneiro"
        ),
        EventoDeCalendario(
            data: "2026-09-09", especie: .diario,
            rotulo: "2026-09-09", detalhe: "02 - Atualizações Diárias/2026-09-09.md"
        ),
        EventoDeCalendario(
            data: "2026-09-08", especie: .tarefaCriada,
            rotulo: "T-0001 Refinar a ActionShelf", detalhe: "Concluída", autor: "fbtostadev"
        )
    ]

    /// Filtro vazio é ausência de filtro — nunca resultado vazio.
    func testFiltroVazioNaoRecortaNada() {
        let f = FiltroDeEventos()
        XCTAssertFalse(f.ativo)
        XCTAssertEqual(f.aplicar(a: eventos).count, eventos.count)
    }

    func testBuscaOlhaDescricaoAutorEData() {
        XCTAssertEqual(FiltroDeEventos(busca: "ActionShelf").aplicar(a: eventos).count, 2)
        XCTAssertEqual(FiltroDeEventos(busca: "Cauê").aplicar(a: eventos).count, 1)
        XCTAssertEqual(FiltroDeEventos(busca: "2026-09-08").aplicar(a: eventos).count, 1)
    }

    /// Num vault escrito em português, buscar "sessao" tem que achar "sessão".
    func testBuscaIgnoraCaixaEAcento() {
        XCTAssertEqual(FiltroDeEventos(busca: "sessao").aplicar(a: eventos).count, 1)
        XCTAssertEqual(FiltroDeEventos(busca: "SESSÃO").aplicar(a: eventos).count, 1)
        XCTAssertEqual(FiltroDeEventos(busca: "caue").aplicar(a: eventos).count, 1)
    }

    func testBuscaSoDeEspacoNaoFiltra() {
        let f = FiltroDeEventos(busca: "   ")
        XCTAssertFalse(f.ativo)
        XCTAssertEqual(f.aplicar(a: eventos).count, eventos.count)
    }

    func testFiltroPorEspecie() {
        XCTAssertEqual(FiltroDeEventos(especies: [.fato]).aplicar(a: eventos).count, 2)
        XCTAssertEqual(FiltroDeEventos(especies: [.diario, .tarefaCriada]).aplicar(a: eventos).count, 2)
    }

    func testFiltroPorAutor() {
        XCTAssertEqual(FiltroDeEventos(autores: ["fbtostadev"]).aplicar(a: eventos).count, 2)
        // O diário não tem autor: filtrar por pessoa não pode arrastá-lo junto.
        XCTAssertFalse(
            FiltroDeEventos(autores: ["fbtostadev"]).aplicar(a: eventos).contains { $0.especie == .diario }
        )
    }

    /// As dimensões se somam com E, não com OU.
    func testDimensoesSeSomam() {
        let f = FiltroDeEventos(busca: "ActionShelf", especies: [.fato], autores: ["fbtostadev"])
        let saida = f.aplicar(a: eventos)
        XCTAssertEqual(saida.count, 1)
        XCTAssertEqual(saida.first?.detalhe, "ui")
    }

    func testContagemDeCriterios() {
        XCTAssertEqual(FiltroDeEventos().quantidadeDeCriterios, 0)
        XCTAssertEqual(
            FiltroDeEventos(busca: "x", especies: [.fato], autores: ["a", "b"]).quantidadeDeCriterios,
            4
        )
    }

    func testLimparZeraTudo() {
        var f = FiltroDeEventos(busca: "x", especies: [.fato], autores: ["a"])
        f.limpar()
        XCTAssertFalse(f.ativo)
        XCTAssertEqual(f.aplicar(a: eventos).count, eventos.count)
    }

    /// Filtrar reagrupa: um dia que perde todos os eventos sai da lista.
    func testDiaSemEventoQueCasaSaiDoAgrupamento() {
        let dias = Calendario.porDia(eventos)
        XCTAssertEqual(dias.count, 2)

        let recorte = FiltroDeEventos(especies: [.diario]).aplicar(a: dias)
        XCTAssertEqual(recorte.count, 1)
        XCTAssertEqual(recorte.first?.data, "2026-09-09")
    }

    /// A lista de autores sai do dado, não de uma lista fixa no código.
    func testAutoresSaemDosEventosEmOrdem() {
        XCTAssertEqual(Calendario.autores(de: eventos), ["Cauê Carneiro", "fbtostadev"])
    }
}
