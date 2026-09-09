import XCTest
@testable import VaultKit

final class DataISOTests: XCTestCase {
    func testIdaEVolta() throws {
        let data = try XCTUnwrap(DataISO.data("2026-09-09"))
        XCTAssertEqual(DataISO.texto(data), "2026-09-09")
    }

    /// A âncora ao meio-dia existe para isto: nenhum deslocamento de fuso ou
    /// horário de verão empurra o evento para a véspera.
    func testAncoraAoMeioDiaNaoAtravessaODia() throws {
        for iso in ["2026-01-01", "2026-02-21", "2026-10-18", "2026-12-31"] {
            let data = try XCTUnwrap(DataISO.data(iso))
            XCTAssertEqual(DataISO.texto(data), iso, "\(iso) mudou de dia na conversão")
        }
    }

    func testDataInvalidaNaoViraPalpite() {
        XCTAssertNil(DataISO.data("09/09/2026"))
        XCTAssertNil(DataISO.data("2026-13-01"))
        XCTAssertNil(DataISO.data("2026-09"))
        XCTAssertNil(DataISO.data(""))
    }

    func testComponentesSaoOsDoTexto() throws {
        let c = try XCTUnwrap(DataISO.componentes("2026-09-08"))
        XCTAssertEqual(c.year, 2026)
        XCTAssertEqual(c.month, 9)
        XCTAssertEqual(c.day, 8)
    }
}

final class CalendarioTests: XCTestCase {
    private func nota(
        _ caminho: String,
        tipo: TipoNota,
        campos: [String: String],
        corpo: String
    ) -> Nota {
        Nota(
            caminhoRelativo: caminho,
            url: URL(fileURLWithPath: "/v/\(caminho)"),
            tipo: tipo,
            frontmatter: Frontmatter(valores: campos),
            corpo: corpo,
            modificadoEm: .now
        )
    }

    /// Um vault de teste com as três origens de evento representadas: o log
    /// real do primeiro dia, uma nota diária e duas tarefas.
    private func vaultDeTeste() throws -> Vault {
        let url = try XCTUnwrap(Bundle.module.url(
            forResource: "registro-2026-09-08",
            withExtension: "md",
            subdirectory: "Fixtures"
        ))
        let texto = try String(contentsOf: url, encoding: .utf8)
        let (fm, corpo) = Frontmatter.separar(de: texto)

        return Vault(
            raiz: URL(fileURLWithPath: "/v"),
            notas: [
                Nota(
                    caminhoRelativo: "05 - Registros/2026/09/2026-09-08.md",
                    url: url,
                    tipo: .registro,
                    frontmatter: try XCTUnwrap(fm),
                    corpo: corpo,
                    modificadoEm: .now
                ),
                nota(
                    "02 - Atualizações Diárias/2026/09/2026-09-08.md",
                    tipo: .atualizacaoDiaria,
                    campos: ["tipo": "atualizacao-diaria", "data": "2026-09-08"],
                    corpo: "# 2026-09-08\n\nO dia em que o vault nasceu."
                ),
                nota(
                    "04 - Tarefas/T-0001.md",
                    tipo: .tarefa,
                    campos: ["tipo": "tarefa", "id": "T-0001", "status": "concluida", "data_criacao": "2026-09-08"],
                    corpo: "# Refinar a ActionShelf"
                ),
                nota(
                    "04 - Tarefas/T-0002.md",
                    tipo: .tarefa,
                    campos: ["tipo": "tarefa", "id": "T-0002", "status": "a-fazer", "data_criacao": "2026-09-09"],
                    corpo: "# Refatorar a UI da Bancada"
                )
            ],
            invalidas: [],
            midias: [],
            fatosNaoReconhecidos: []
        )
    }

    func testAsTresOrigensViramEvento() throws {
        let vault = try vaultDeTeste()
        let dias = Calendario.porDia(de: vault)

        let oito = try XCTUnwrap(dias.first { $0.data == "2026-09-08" })
        XCTAssertEqual(oito.quantidade(de: .fato), vault.fatos.count)
        XCTAssertEqual(oito.quantidade(de: .diario), 1)
        XCTAssertEqual(oito.quantidade(de: .tarefaCriada), 1)

        let nove = try XCTUnwrap(dias.first { $0.data == "2026-09-09" })
        XCTAssertEqual(nove.quantidade(de: .tarefaCriada), 1)
        XCTAssertEqual(nove.quantidade(de: .fato), 0)
    }

    func testNenhumEventoSePerdeNoAgrupamento() throws {
        let vault = try vaultDeTeste()
        let eventos = Calendario.eventos(de: vault)
        let agrupados = Calendario.porDia(eventos).flatMap(\.eventos)

        XCTAssertEqual(agrupados.count, eventos.count)
        XCTAssertEqual(Set(agrupados.map(\.id)), Set(eventos.map(\.id)))
    }

    func testDiasSaemDoMaisRecenteParaOMaisAntigo() throws {
        let dias = Calendario.porDia(de: try vaultDeTeste())
        XCTAssertEqual(dias.map(\.data), ["2026-09-09", "2026-09-08"])
    }

    /// Dentro do dia, fato tem hora e ordena por ela; diário e tarefa não têm
    /// e vão para o fim, em vez de fingir meia-noite.
    func testEventosSemHoraVaoParaOFimDoDia() throws {
        let dias = Calendario.porDia(de: try vaultDeTeste())
        let oito = try XCTUnwrap(dias.first { $0.data == "2026-09-08" })

        XCTAssertEqual(oito.eventos.first?.especie, .fato)
        XCTAssertNil(oito.eventos.last?.hora)

        let minutos = oito.eventos.map(\.minutoDoDia)
        XCTAssertEqual(minutos, minutos.sorted())
    }

    func testNotaSemDataNaoViraEvento() {
        let vault = Vault(
            raiz: URL(fileURLWithPath: "/v"),
            notas: [
                nota(
                    "04 - Tarefas/T-0009.md",
                    tipo: .tarefa,
                    campos: ["tipo": "tarefa", "id": "T-0009"],
                    corpo: "# Sem data de criação"
                )
            ],
            invalidas: [],
            midias: [],
            fatosNaoReconhecidos: []
        )
        XCTAssertTrue(Calendario.eventos(de: vault).isEmpty)
    }
}
