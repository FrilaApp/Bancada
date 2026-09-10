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

    /// `Calendar(identifier:)` devolve `locale` vazio em vez de `nil`, então um
    /// `?? .current` passa batido e todo formatador cai no formato raiz do ICU
    /// — `2026 M09` em vez de `setembro de 2026`. Já quebrou uma vez.
    func testCalendarioCarregaLocaleDeVerdade() throws {
        let l = try XCTUnwrap(DataISO.calendario.locale)
        XCTAssertFalse(l.identifier.isEmpty, "locale vazio faz o ICU cair no formato raiz")
        XCTAssertEqual(l.identifier, Locale.current.identifier)
    }

    /// Sem fixar idioma: o que não pode é sair no formato raiz, em qualquer
    /// máquina. `M09` é a assinatura desse formato.
    func testRotuloDoMesNaoSaiNoFormatoRaiz() {
        let rotulo = Calendario.rotuloDoMes(de: "2026-09-09")
        XCTAssertFalse(rotulo.contains("M09"), "rótulo caiu no formato raiz do ICU: \(rotulo)")
        XCTAssertTrue(rotulo.contains("2026"))
        XCTAssertTrue(
            rotulo.rangeOfCharacter(from: .letters) != nil,
            "o mês precisa aparecer por extenso, não só como número: \(rotulo)"
        )
    }

    func testRotulosDasColunasSaoLocalizados() {
        let rotulos = Calendario.rotulosDasColunas()
        XCTAssertEqual(rotulos.count, 7)
        XCTAssertEqual(Set(rotulos).count, 7, "dias da semana repetidos: \(rotulos)")
        for r in rotulos {
            XCTAssertFalse(r.isEmpty)
        }
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

    func testAutorVemDaOrigemCerta() throws {
        let eventos = Calendario.eventos(de: try vaultDeTeste())

        let fato = try XCTUnwrap(eventos.first { $0.especie == .fato })
        XCTAssertEqual(fato.autor, "fbtostadev", "o fato perdeu o autor do commit")

        let tarefa = try XCTUnwrap(eventos.first { $0.especie == .tarefaCriada })
        XCTAssertNil(tarefa.autor, "a tarefa de teste não tem responsável — não inventar um")

        // O diário é do dia, não de uma pessoa.
        let diario = try XCTUnwrap(eventos.first { $0.especie == .diario })
        XCTAssertNil(diario.autor)
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

/// A grade: onde erro de semana, virada de mês e horário de verão passam
/// despercebidos até alguém reparar que um commit caiu no dia errado.
final class GradeDoCalendarioTests: XCTestCase {
    /// Calendário fixo, para que o teste não mude de resultado conforme a
    /// máquina que o roda. Domingo como primeiro dia, convenção brasileira.
    private var gregoriano: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "America/Sao_Paulo") ?? .current
        c.locale = Locale(identifier: "pt_BR")
        c.firstWeekday = 1
        return c
    }

    func testTodaSemanaTemSeteDias() {
        for mes in ["2026-01-15", "2026-02-15", "2026-09-09", "2026-12-31"] {
            let semanas = Calendario.semanasDoMes(de: mes, calendario: gregoriano)
            XCTAssertFalse(semanas.isEmpty, "\(mes) não gerou grade")
            for (i, semana) in semanas.enumerated() {
                XCTAssertEqual(semana.count, 7, "semana \(i) de \(mes) veio com \(semana.count) dias")
            }
        }
    }

    func testGradeCobreOMesInteiroSemBuraco() throws {
        let semanas = Calendario.semanasDoMes(de: "2026-09-09", calendario: gregoriano)
        let dias = semanas.flatMap { $0 }

        // Todo dia de setembro está lá, uma vez só.
        for d in 1...30 {
            let iso = String(format: "2026-09-%02d", d)
            XCTAssertEqual(dias.filter { $0 == iso }.count, 1, "\(iso) faltou ou duplicou")
        }
        // E a sequência é contínua: sem salto entre células vizinhas.
        for (anterior, proximo) in zip(dias, dias.dropFirst()) {
            XCTAssertEqual(
                Calendario.dia(deslocando: anterior, em: 1, calendario: gregoriano),
                proximo,
                "buraco na grade entre \(anterior) e \(proximo)"
            )
        }
    }

    func testPrimeiraColunaEhSempreOPrimeiroDiaDaSemana() throws {
        let semanas = Calendario.semanasDoMes(de: "2026-09-09", calendario: gregoriano)
        for semana in semanas {
            let data = try XCTUnwrap(DataISO.data(semana[0]))
            XCTAssertEqual(
                gregoriano.component(.weekday, from: data),
                gregoriano.firstWeekday,
                "\(semana[0]) não é o primeiro dia da semana"
            )
        }
    }

    /// A regra do sanfonar: comprimir não pode esconder o dia que está
    /// selecionado.
    func testJanelaComprimidaSempreContemAAncora() {
        let semanas = Calendario.semanasDoMes(de: "2026-09-09", calendario: gregoriano)
        for ancora in semanas.flatMap({ $0 }) {
            for n in 1...6 {
                let janela = Calendario.janelaDeSemanas(de: ancora, semanas: n, calendario: gregoriano)
                XCTAssertTrue(
                    janela.flatMap { $0 }.contains(ancora),
                    "a janela de \(n) semana(s) perdeu a âncora \(ancora)"
                )
            }
        }
    }

    func testJanelaTemAQuantidadeDeSemanasPedida() {
        let total = Calendario.semanasDoMes(de: "2026-09-09", calendario: gregoriano).count
        for n in 1...total {
            let janela = Calendario.janelaDeSemanas(de: "2026-09-09", semanas: n, calendario: gregoriano)
            XCTAssertEqual(janela.count, n)
        }
    }

    func testJanelaNaoEstouraOMes() {
        let total = Calendario.semanasDoMes(de: "2026-09-09", calendario: gregoriano).count
        let janela = Calendario.janelaDeSemanas(de: "2026-09-09", semanas: 99, calendario: gregoriano)
        XCTAssertEqual(janela.count, total, "pedir mais semanas que o mês tem não pode inventar linha")
    }

    /// O mês que mais estica a grade: fevereiro de 29 dias começando no sábado
    /// ocupa seis linhas.
    func testNenhumMesPassaDeSeisSemanas() {
        // O teto que `DS.Calendario.semanasMaximas` declara, verificado contra
        // dez anos de calendário em vez de contra a memória de quem escreveu.
        for ano in 2024...2034 {
            for mes in 1...12 {
                let iso = String(format: "%04d-%02d-15", ano, mes)
                let n = Calendario.semanasDoMes(de: iso, calendario: gregoriano).count
                XCTAssertLessThanOrEqual(n, 6, "\(iso) precisou de \(n) semanas")
                XCTAssertGreaterThanOrEqual(n, 4, "\(iso) só gerou \(n) semanas")
            }
        }
        // Maio de 2026: 31 dias começando na sexta, o arranjo que estica a
        // grade até o teto.
        XCTAssertEqual(Calendario.semanasDoMes(de: "2026-05-15", calendario: gregoriano).count, 6)
    }

    func testRotulosDasColunasSeguemOPrimeiroDiaDaSemana() {
        let domingoPrimeiro = Calendario.rotulosDasColunas(calendario: gregoriano)
        XCTAssertEqual(domingoPrimeiro.count, 7)

        var comSegunda = gregoriano
        comSegunda.firstWeekday = 2
        let segundaPrimeiro = Calendario.rotulosDasColunas(calendario: comSegunda)

        XCTAssertEqual(segundaPrimeiro.count, 7)
        XCTAssertEqual(segundaPrimeiro.last, domingoPrimeiro.first, "domingo devia ter ido para o fim")
        XCTAssertEqual(segundaPrimeiro.first, domingoPrimeiro[1])
    }

    func testNavegacaoDeMesPreservaODiaQuandoEleExiste() {
        XCTAssertTrue(Calendario.mesmoMes(
            Calendario.mes(deslocando: "2026-09-09", em: 1, calendario: gregoriano),
            "2026-10-01",
            calendario: gregoriano
        ))
        XCTAssertTrue(Calendario.mesmoMes(
            Calendario.mes(deslocando: "2026-01-15", em: -1, calendario: gregoriano),
            "2025-12-01",
            calendario: gregoriano
        ))
    }

    /// 31 de janeiro avançando um mês não pode virar 3 de março.
    func testMesNaoTransbordaEmDiaQueNaoExiste() {
        let destino = Calendario.mes(deslocando: "2026-01-31", em: 1, calendario: gregoriano)
        XCTAssertEqual(destino, "2026-02-28")
    }

    /// O dia em que o horário de verão brasileiro começava era a armadilha
    /// clássica: sem a âncora ao meio-dia, somar 24h pulava ou repetia um dia.
    func testViradaDeDiaAtravessaHorarioDeVeraoSemPular() {
        var iso = "2026-10-16"
        var vistos: [String] = [iso]
        for _ in 0..<5 {
            iso = Calendario.dia(deslocando: iso, em: 1, calendario: gregoriano)
            vistos.append(iso)
        }
        XCTAssertEqual(vistos, [
            "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21"
        ])
    }
}
