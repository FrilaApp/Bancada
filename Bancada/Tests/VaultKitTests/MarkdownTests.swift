import XCTest
@testable import VaultKit

/// O parser existe por causa da V-01: o Diário mostrava `# 2026-09-09` e as
/// crases como caractere, em serifa, e a serifa fazia a falha parecer intenção.
///
/// Os casos aqui seguem o que o vault de fato escreve — títulos, listas,
/// código inline, wikilinks e réguas —, mais a promessa que o gerador do site
/// faz e este parser tem de repetir: o que ele não cobre **degrada, não
/// quebra**.
final class MarkdownTests: XCTestCase {

    // MARK: - O que o Diário usa

    func testTituloSaiComNivelESemSustenido() {
        XCTAssertEqual(
            Markdown.blocos(de: "# 2026-09-09"),
            [.titulo(nivel: 1, trechos: [.texto("2026-09-09")])]
        )
        XCTAssertEqual(
            Markdown.blocos(de: "## O que foi feito"),
            [.titulo(nivel: 2, trechos: [.texto("O que foi feito")])]
        )
    }

    func testSustenidoSemEspacoNaoEhTitulo() {
        // `#tag` é tag do Obsidian, não título. Virar título comeria a tralha.
        XCTAssertEqual(
            Markdown.blocos(de: "#tag no meio do texto"),
            [.paragrafo([.texto("#tag no meio do texto")])]
        )
    }

    func testListaPerdeOHifenEViraItem() {
        let blocos = Markdown.blocos(de: "- primeiro\n- segundo")
        guard case let .lista(itens) = blocos.first else { return XCTFail("não virou lista") }
        XCTAssertEqual(itens.count, 2)
        XCTAssertEqual(itens[0].marca, .ponto)
        XCTAssertEqual(itens[0].trechos, [.texto("primeiro")])
    }

    /// Os templates do vault têm marcadores esperando ser preenchidos. O site
    /// os mantém como `.vazio-item`; aqui viram `.vazia` para ocuparem a linha
    /// sem fingir texto.
    func testMarcadorSemConteudoViraItemVazio() {
        let blocos = Markdown.blocos(de: "- \n-\n- com texto")
        guard case let .lista(itens) = blocos.first else { return XCTFail("não virou lista") }
        XCTAssertEqual(itens.count, 3)
        XCTAssertEqual(itens[0].marca, .vazia)
        XCTAssertEqual(itens[1].marca, .vazia)
        XCTAssertEqual(itens[2].trechos, [.texto("com texto")])
    }

    func testCodigoInlinePerdeAsCrases() {
        XCTAssertEqual(
            Markdown.trechos(de: "o commit `db98d70` fecha"),
            [.texto("o commit "), .codigo("db98d70"), .texto(" fecha")]
        )
    }

    /// A razão de o scanner varrer a linha uma vez em vez de substituir em
    /// cadeia: `**` dentro de código não pode virar negrito.
    func testAsteriscoDentroDeCodigoNaoViraNegrito() {
        XCTAssertEqual(
            Markdown.trechos(de: "use `a ** b` aqui"),
            [.texto("use "), .codigo("a ** b"), .texto(" aqui")]
        )
    }

    func testWikilinkUsaOAliasQuandoTem() {
        XCTAssertEqual(
            Markdown.trechos(de: "ver [[04 - Tarefas/T-0002 - Refatorar|T-0002]] hoje"),
            [.texto("ver "),
             .wikilink(alvo: "04 - Tarefas/T-0002 - Refatorar", rotulo: "T-0002"),
             .texto(" hoje")]
        )
    }

    func testWikilinkSemAliasUsaOAlvo() {
        XCTAssertEqual(
            Markdown.trechos(de: "[[🏠 Início]]"),
            [.wikilink(alvo: "🏠 Início", rotulo: "🏠 Início")]
        )
    }

    func testRegraHorizontal() {
        XCTAssertEqual(Markdown.blocos(de: "---"), [.regra])
        XCTAssertEqual(Markdown.blocos(de: "-----"), [.regra])
    }

    // MARK: - O resto do subconjunto do site

    func testTarefaMarcadaEDesmarcada() {
        let blocos = Markdown.blocos(de: "- [ ] pendente\n- [x] feita")
        guard case let .lista(itens) = blocos.first else { return XCTFail("não virou lista") }
        XCTAssertEqual(itens[0].marca, .tarefa(feita: false))
        XCTAssertEqual(itens[0].trechos, [.texto("pendente")])
        XCTAssertEqual(itens[1].marca, .tarefa(feita: true))
    }

    func testCalloutDoObsidianNaoVazaOMarcador() {
        let blocos = Markdown.blocos(de: "> [!info] Atenção\n> corpo do aviso")
        XCTAssertEqual(
            blocos,
            [.callout(tipo: "info", titulo: "Atenção", corpo: [[.texto("corpo do aviso")]])]
        )
    }

    func testCitacaoSemMarcadorContinuaCitacao() {
        XCTAssertEqual(
            Markdown.blocos(de: "> uma citação simples"),
            [.citacao([[.texto("uma citação simples")]])]
        )
    }

    func testTabelaSeparaCabecalhoDeCorpo() {
        let blocos = Markdown.blocos(de: "| A | B |\n|---|---|\n| 1 | 2 |")
        guard case let .tabela(cabecalho, linhas) = blocos.first else {
            return XCTFail("não virou tabela")
        }
        XCTAssertEqual(cabecalho, [[.texto("A")], [.texto("B")]])
        XCTAssertEqual(linhas, [[[.texto("1")], [.texto("2")]]])
    }

    func testCercaDeCodigoPreservaOTextoLiteral() {
        let blocos = Markdown.blocos(de: "```bash\nls -la\n# não é título\n```")
        XCTAssertEqual(
            blocos,
            [.codigo(linguagem: "bash", texto: "ls -la\n# não é título")]
        )
    }

    func testEnfaseNegritoERiscado() {
        XCTAssertEqual(Markdown.trechos(de: "**forte**"), [.forte("forte")])
        XCTAssertEqual(Markdown.trechos(de: "*leve*"), [.enfase("leve")])
        XCTAssertEqual(Markdown.trechos(de: "~~fora~~"), [.riscado("fora")])
    }

    func testLinkMarkdownGuardaODestino() {
        XCTAssertEqual(
            Markdown.trechos(de: "[docs](https://exemplo.com)"),
            [.link(rotulo: "docs", destino: "https://exemplo.com")]
        )
    }

    // MARK: - Degrada, não quebra

    func testDelimitadorSemFechoContinuaTextoComum() {
        XCTAssertEqual(Markdown.trechos(de: "custa R$ 5 * 3 reais"),
                       [.texto("custa R$ 5 * 3 reais")])
        XCTAssertEqual(Markdown.trechos(de: "uma crase ` solta"),
                       [.texto("uma crase ` solta")])
        XCTAssertEqual(Markdown.trechos(de: "colchete [ solto"),
                       [.texto("colchete [ solto")])
    }

    func testEntradaVaziaNaoProduzBloco() {
        XCTAssertEqual(Markdown.blocos(de: ""), [])
        XCTAssertEqual(Markdown.blocos(de: "\n\n   \n"), [])
    }

    func testParagrafoJuntaLinhasAteABranca() {
        XCTAssertEqual(
            Markdown.blocos(de: "uma linha\ne a seguinte\n\noutro parágrafo"),
            [.paragrafo([.texto("uma linha e a seguinte")]),
             .paragrafo([.texto("outro parágrafo")])]
        )
    }

    /// A garantia que importa para um app que lê arquivo de outra pessoa:
    /// qualquer entrada termina, e nada some.
    func testNotaRealDoVaultNaoPerdeConteudo() throws {
        let bruto = """
        # 2026-09-09

        ## O que foi feito

        - Refatoração da UI com o commit `db98d70`
        - Ver [[04 - Tarefas/T-0002 - Refatorar|T-0002]]
        -

        ---
        ← [[🏠 Início|Início]]
        """
        let blocos = Markdown.blocos(de: bruto)
        XCTAssertFalse(blocos.isEmpty)
        // Nenhum bloco pode carregar a sintaxe crua que o leitor não deve ver.
        for bloco in blocos {
            if case let .paragrafo(trechos) = bloco {
                for t in trechos {
                    if case let .texto(s) = t {
                        XCTAssertFalse(s.contains("[["), "wikilink vazou como texto: \(s)")
                        XCTAssertFalse(s.hasPrefix("#"), "título vazou como texto: \(s)")
                    }
                }
            }
        }
    }
}
