import XCTest
@testable import VaultKit

/// As linhas daqui são do log real de 2026-09-08 a 2026-09-10 — o formato
/// que os hooks escrevem, com as variações que ele acumulou.
final class LeituraDeFatoTests: XCTestCase {
    func testCommitSaiComAMensagemNaFrenteEOHashAParte() {
        let l = LeituraDeFato.ler(
            tipo: "commit",
            descricao: "`94a7665` — Reformata o índice de registros como tabela · 1 arquivo(s)"
        )
        XCTAssertEqual(l.titulo, "Reformata o índice de registros como tabela")
        XCTAssertEqual(l.referencia, "94a7665")
        XCTAssertEqual(l.arquivos, 1)
        XCTAssertFalse(l.bastidor)
    }

    /// `1 arquivo`, `12 arquivos` e `1 arquivo(s)` convivem no log.
    func testTodasAsFormasDaContagemDeArquivos() {
        for (sufixo, n) in [("1 arquivo", 1), ("12 arquivos", 12), ("25 arquivo(s)", 25)] {
            let l = LeituraDeFato.ler(tipo: "commit", descricao: "`abc1234` — Faz uma coisa · \(sufixo)")
            XCTAssertEqual(l.titulo, "Faz uma coisa", sufixo)
            XCTAssertEqual(l.arquivos, n, sufixo)
        }
    }

    func testCommitSemContagemNaoPerdeAMensagem() {
        let l = LeituraDeFato.ler(tipo: "commit", descricao: "`abc1234` — Faz uma coisa")
        XCTAssertEqual(l.titulo, "Faz uma coisa")
        XCTAssertNil(l.arquivos)
    }

    /// O painel agrupa pela tarefa e mostra o nome dela; o código no fim da
    /// mensagem seria o mesmo dado duas vezes.
    func testCodigoDeTarefaNoFimSaiDoTitulo() {
        let l = LeituraDeFato.ler(
            tipo: "commit",
            descricao: "`db98d70` — Registra o refinamento de UI e interação da ActionShelf (T-0001) · 6 arquivo(s)"
        )
        XCTAssertEqual(l.titulo, "Registra o refinamento de UI e interação da ActionShelf")
        XCTAssertFalse(l.bastidor, "registrar um trabalho não é bastidor — só registrar o registro")
    }

    /// No meio da frase, o código é parte do que foi feito e fica.
    func testCodigoNoMeioDaFraseFica() {
        let l = LeituraDeFato.ler(
            tipo: "commit",
            descricao: "`c7de225` — Integra o trabalho do time e renumera a tarefa da Bancada para T-0005 · 3 arquivo(s)"
        )
        XCTAssertEqual(l.titulo, "Integra o trabalho do time e renumera a tarefa da Bancada para T-0005")
    }

    func testBastidorDoLog() {
        let bastidor = [
            "`df873d0` — Registra os fatos da sessão · 1 arquivo(s)",
            "`671d48a` — Registra o commit anterior no log de fatos · 1 arquivo",
            "`6169043` — Atualiza a narrativa diária com a criação da T-0002 · 1 arquivo(s)",
            "`965ae4d` — Remove do log de fatos uma linha que apontava para commit inexistente · 1 arquivo(s)",
            "`aaaaaaa` — Teste: confirma que os hooks de commit estão funcionando · 1 arquivo(s)",
            "`bbbbbbb` — Escreve a narrativa de 2026-09-10 · 1 arquivo"
        ]
        for d in bastidor {
            XCTAssertTrue(LeituraDeFato.ler(tipo: "commit", descricao: d).bastidor, d)
        }
    }

    /// Trabalho no próprio harness continua sendo trabalho.
    func testTrabalhoNoHarnessNaoEhBastidor() {
        let trabalho = [
            "`ccccccc` — Move o registro de fatos para o push e fecha a fronteira do log · 6 arquivos",
            "`ddddddd` — Deixa o commit de escrituração fora do log, por decisão · 1 arquivo",
            "`02271c9` — Cria tarefa T-0002 — Refatorar UI da Bancada + WebView · 2 arquivo(s)"
        ]
        for d in trabalho {
            XCTAssertFalse(LeituraDeFato.ler(tipo: "commit", descricao: d).bastidor, d)
        }
    }

    func testSessaoETesteSaoBastidor() {
        XCTAssertTrue(LeituraDeFato.ler(tipo: "sessao", descricao: "Claude · 0 nota(s) com alteração pendente").bastidor)
        XCTAssertTrue(LeituraDeFato.ler(tipo: "teste", descricao: "verificação de estabilidade do hook").bastidor)
        XCTAssertEqual(
            LeituraDeFato.ler(tipo: "teste", descricao: "verificação de estabilidade do hook").titulo,
            "Verificação de estabilidade do hook"
        )
    }

    func testPagesViraAtualizacaoDoDocumento() {
        let l = LeituraDeFato.ler(tipo: "pages", descricao: "CBL_C18.pages → CBL_C18.md · 4365 palavras")
        XCTAssertEqual(l.titulo, "Atualiza o documento CBL_C18")
        XCTAssertFalse(l.bastidor)
    }

    func testFatoLivreSoPerdeOCommitCitado() {
        let l = LeituraDeFato.ler(
            tipo: "ui",
            descricao: "ActionShelf aumentada em 30% (520x68pt) com badge 48pt (commit 5a39cc4)"
        )
        XCTAssertEqual(l.titulo, "ActionShelf aumentada em 30% (520x68pt) com badge 48pt")
    }

    /// Um formato que o parser não conhece sai como veio, nunca em branco.
    func testCommitForaDoFormatoSaiComoVeio() {
        let l = LeituraDeFato.ler(tipo: "commit", descricao: "mensagem sem hash")
        XCTAssertEqual(l.titulo, "Mensagem sem hash")
        XCTAssertNil(l.referencia)
    }
}

final class ReferenciaFinalTests: XCTestCase {
    private func item(_ md: String) throws -> [Markdown.Trecho] {
        guard case let .lista(itens)? = Markdown.blocos(de: md).first else {
            throw XCTSkip("o Markdown não virou lista")
        }
        return try XCTUnwrap(itens.first).trechos
    }

    func testHashEntreParentesesNoFimSai() throws {
        let t = Markdown.semReferenciaFinal(try item("- Reformatação do índice de registros (`94a7665`)."))
        XCTAssertEqual(Markdown.textoPlano(t), "Reformatação do índice de registros.")
    }

    func testReferenciaComRepoEAutorSai() throws {
        let t = Markdown.semReferenciaFinal(try item("- Re-fundação do sistema de design (Bancada `af093a1`, fbtostadev)."))
        XCTAssertEqual(Markdown.textoPlano(t), "Re-fundação do sistema de design.")
    }

    func testIntervaloDeCommitsSai() throws {
        let t = Markdown.semReferenciaFinal(try item("- Captura das iterações (`f7efef3` → `5a39cc4`)"))
        XCTAssertEqual(Markdown.textoPlano(t), "Captura das iterações")
    }

    /// Parêntese de gente, sem código dentro, é parte da frase.
    func testParenteseSemCodigoFica() throws {
        let original = try item("- Aumento de 30% nas proporções (de 400pt para 520pt).")
        XCTAssertEqual(Markdown.semReferenciaFinal(original), original)
    }

    func testCodigoNoMeioDaFraseFica() throws {
        let original = try item("- O corte ficou em `LeitorDeVault`, e o contrato subiu.")
        XCTAssertEqual(Markdown.semReferenciaFinal(original), original)
    }
}

final class EquipeTests: XCTestCase {
    /// A tabela como está no `CLAUDE.md` do vault.
    private let tabela = """
    ## Contatos da equipe (org BlendOps, C18)

    | Membro | E-mail |
    |---|---|
    | 708 Cauê Carneiro | cauecarneiroc@gmail.com |
    | 714 Fabrício Tosta | fbtostadev@gmail.com |
    | 721 João Paulo | joaopauloalbuquerque606@gmail.com |
    """

    func testLeATabelaSemMatriculaESemCabecalho() {
        let equipe = Equipe.ler(texto: tabela)
        XCTAssertEqual(equipe.pessoas.map(\.nome), ["Cauê Carneiro", "Fabrício Tosta", "João Paulo"])
    }

    func testLoginDoGitViraOPrimeiroNome() {
        XCTAssertEqual(Equipe.ler(texto: tabela).nome(de: "fbtostadev"), "Fabrício")
    }

    func testNomeCompletoViraOPrimeiroNome() {
        XCTAssertEqual(Equipe.ler(texto: tabela).nome(de: "Cauê Carneiro"), "Cauê")
        XCTAssertEqual(Equipe.ler(texto: tabela).nome(de: "caue carneiro"), "Cauê")
    }

    /// Do log real: o Git assina com o sobrenome que a tabela não tem.
    func testNomeMaisLongoQueODaTabelaEhAMesmaPessoa() {
        let equipe = Equipe(pessoas: [.init(nome: "Júlia Clovandi", email: "julia.clovandi@a.ucb.br")])
        XCTAssertEqual(equipe.nome(de: "Júlia Clovandi Vasconcelos"), "Júlia")
        XCTAssertEqual(equipe.nome(de: "Júlia Clo"), "Júlia Clo", "prefixo tem que ser palavra inteira")
    }

    func testResponsavelEmListaYAML() {
        XCTAssertEqual(Equipe.nomes(em: "[Cauê Carneiro, Júlia Clovandi]"), ["Cauê Carneiro", "Júlia Clovandi"])
        XCTAssertEqual(Equipe.nomes(em: "fbtostadev"), ["fbtostadev"])
    }

    func testPrimeiroNomeRepetidoMantemOCompleto() {
        let equipe = Equipe(pessoas: [.init(nome: "João Paulo"), .init(nome: "João Silva")])
        XCTAssertEqual(equipe.nome(de: "João Paulo"), "João Paulo")
    }

    /// Adivinhar a pessoa errada faria o registro mentir.
    func testDesconhecidoSaiComoVeio() {
        XCTAssertEqual(Equipe.ler(texto: tabela).nome(de: "alguem-de-fora"), "alguem-de-fora")
        XCTAssertEqual(Equipe().nome(de: "fbtostadev"), "fbtostadev")
    }
}

final class ResumoDoDiaTests: XCTestCase {
    private let t1 = TarefaCitada(id: "T-0001", titulo: "Refinar a ActionShelf")
    private let t2 = TarefaCitada(id: "T-0002", titulo: "Refatorar a UI da Bancada")

    private func fato(
        _ hora: String,
        _ titulo: String,
        autor: String = "Fabrício",
        tarefa: TarefaCitada? = nil,
        bastidor: Bool = false
    ) -> EventoDeCalendario {
        EventoDeCalendario(
            data: "2026-09-09", hora: hora, especie: .fato,
            rotulo: "`abc1234` — \(titulo)", detalhe: "commit", autor: autor,
            titulo: titulo, tarefa: tarefa, bastidor: bastidor
        )
    }

    private func dia(_ eventos: [EventoDeCalendario]) -> ResumoDoDia {
        ResumoDoDia(Calendario.porDia(eventos).first!)
    }

    func testTrabalhoAgrupaPorTarefaDoMaiorParaOMenorEOutrosPorUltimo() {
        let r = dia([
            fato("05:00", "Solto"),
            fato("05:10", "A", tarefa: t1),
            fato("05:20", "B", tarefa: t2),
            fato("05:30", "C", tarefa: t2)
        ])
        XCTAssertEqual(r.assuntos.map(\.titulo), ["Refatorar a UI da Bancada", "Refinar a ActionShelf", "Outros"])
        XCTAssertEqual(r.assuntos.first?.eventos.map(\.titulo), ["B", "C"])
    }

    func testBastidorFicaForaDoTrabalhoMasDentroDoRegistro() {
        let r = dia([
            fato("05:00", "Trabalho", tarefa: t1),
            fato("05:01", "Registra os fatos da sessão", bastidor: true)
        ])
        XCTAssertEqual(r.quantidadeDeTrabalho, 1)
        XCTAssertEqual(r.bastidor.count, 1)
        XCTAssertEqual(r.registro.count, 2, "o registro completo é o log intacto")
    }

    /// O log real tem linhas fora de ordem — um merge põe 14:17 antes de 05:00.
    func testRegistroSaiEmOrdemDeHora() {
        let r = dia([fato("14:17", "Tarde"), fato("05:00", "Manhã")])
        XCTAssertEqual(r.registro.map(\.hora), ["05:00", "14:17"])
    }

    func testTarefaSemTituloNoVaultMostraOID() {
        let r = dia([fato("05:00", "X", tarefa: TarefaCitada(id: "T-0005"))])
        XCTAssertEqual(r.assuntos.first?.titulo, "Tarefa T-0005")
    }

    func testFraseComTarefasEPessoas() {
        let r = dia([
            fato("05:00", "A", tarefa: t1),
            fato("05:10", "B", autor: "Cauê", tarefa: t2),
            fato("05:20", "C", tarefa: t2),
            fato("05:30", "Solto")
        ])
        XCTAssertEqual(r.frase, "Fabrício e Cauê avançaram 2 tarefas, com mais 1 registro fora delas.")
    }

    func testFraseSemTarefa() {
        XCTAssertEqual(dia([fato("05:00", "A"), fato("06:00", "B")]).frase, "Fabrício fez 2 registros.")
    }

    func testDiaSoDeBastidorDizIsso() {
        XCTAssertEqual(dia([fato("05:00", "Registra os fatos", bastidor: true)]).frase, "Só manutenção do registro.")
    }

    func testDiaSoDeAgendaNaoInventaFrase() {
        let agenda = EventoDeCalendario(data: "2026-09-09", especie: .agenda, rotulo: "Início", detalhe: "marco")
        XCTAssertNil(dia([agenda]).frase)
    }

    func testDestaquesSaoAsTarefasQuandoHaTarefa() {
        let r = dia([fato("05:00", "Solto"), fato("05:10", "A", tarefa: t1)])
        XCTAssertEqual(r.destaques, ["Refinar a ActionShelf"])
    }

    /// Um dia sem tarefa nenhuma não pode parecer vazio na grade.
    func testDestaquesSemTarefaMostramOTrabalhoSolto() {
        XCTAssertEqual(dia([fato("05:00", "Solto"), fato("06:00", "Outro")]).destaques, ["Solto", "Outro"])
    }

    func testNarrativaLeOQueFoiFeitoSemAReferenciaFinal() {
        let diario = EventoDeCalendario(
            data: "2026-09-09", especie: .diario, rotulo: "2026-09-09",
            titulo: "Narrativa do dia",
            texto: """
            # 2026-09-09

            ## O que foi feito
            - Reformatação do índice (`94a7665`).
            - Criação da T-0002.

            ## Decisões
            - Uma decisão que não entra.
            """
        )
        let itens = dia([diario]).narrativa
        XCTAssertEqual(itens.map { Markdown.textoPlano($0.trechos) }, ["Reformatação do índice.", "Criação da T-0002."])
    }

    func testListarPessoas() {
        XCTAssertEqual(ResumoDoDia.listar(["Fabrício"]), "Fabrício")
        XCTAssertEqual(ResumoDoDia.listar(["Fabrício", "Cauê"]), "Fabrício e Cauê")
        XCTAssertEqual(ResumoDoDia.listar(["Fabrício", "Cauê", "João"]), "Fabrício, Cauê e João")
    }
}

final class RotuloDoDiaTests: XCTestCase {
    private var ptBR: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = .current
        c.locale = Locale(identifier: "pt_BR")
        return c
    }

    func testLongoTemDiaDaSemanaEMesPorExtenso() {
        let r = Calendario.rotuloDoDia("2026-09-09", referencia: "2026-09-10", calendario: ptBR)
        XCTAssertTrue(r.contains("quarta"), r)
        XCTAssertTrue(r.contains("setembro"), r)
        XCTAssertFalse(r.contains("2026"), "o ano corrente é ruído: \(r)")
    }

    func testAnoAparecePorForaDoAnoCorrente() {
        let r = Calendario.rotuloDoDia("2025-12-31", referencia: "2026-01-02", calendario: ptBR)
        XCTAssertTrue(r.contains("2025"), r)
    }

    func testIsoInvalidoSaiComoVeio() {
        XCTAssertEqual(Calendario.rotuloDoDia("ontem"), "ontem")
    }
}
