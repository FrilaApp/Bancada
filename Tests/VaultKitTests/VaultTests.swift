import XCTest
@testable import VaultKit

final class FrontmatterTests: XCTestCase {
    func testSeparaFrontmatterDoCorpo() {
        let texto = """
        ---
        tipo: tarefa
        id: T-0001
        status: em-andamento
        responsavel: fbtostadev
        tags: [tarefa, c18]
        ---

        # Montar a Bancada

        Corpo da nota.
        """
        let (fm, corpo) = Frontmatter.separar(de: texto)
        let frontmatter = try? XCTUnwrap(fm)

        XCTAssertEqual(frontmatter?["tipo"], "tarefa")
        XCTAssertEqual(frontmatter?["id"], "T-0001")
        XCTAssertEqual(frontmatter?.tags, ["tarefa", "c18"])
        XCTAssertTrue(corpo.hasPrefix("# Montar a Bancada"))
    }

    func testChaveVaziaEIgnorada() {
        // O `Template - Tarefa.md` tem `responsavel:` sem valor.
        let (fm, _) = Frontmatter.separar(de: "---\ntipo: tarefa\nresponsavel: \n---\n\n# x")
        XCTAssertNil(fm?["responsavel"])
        XCTAssertEqual(fm?["tipo"], "tarefa")
    }

    func testAspasSaoNormalizadas() {
        let (fm, _) = Frontmatter.separar(de: "---\nstatus: \"ativo\"\n---\n")
        XCTAssertEqual(fm?["status"], "ativo")
    }

    func testNotaSemFrontmatterNaoInventaValores() {
        let (fm, corpo) = Frontmatter.separar(de: "# Só um título\n\nTexto.")
        XCTAssertNil(fm)
        XCTAssertTrue(corpo.hasPrefix("# Só um título"))
    }
}

final class NotaTests: XCTestCase {
    /// A regra do vault é estrutural aqui, não uma convenção que dependa de
    /// alguém lembrar dela.
    func testRegistrosEDerivadosSaoSomenteLeitura() {
        XCTAssertTrue(TipoNota.registro.somenteLeitura)
        XCTAssertTrue(TipoNota.documentoDerivado.somenteLeitura)

        for tipo in TipoNota.allCases where tipo != .registro && tipo != .documentoDerivado {
            XCTAssertFalse(tipo.somenteLeitura, "\(tipo.rawValue) não deveria ser somente leitura")
        }
    }

    func testTituloVemDoH1() {
        let nota = Nota(
            caminhoRelativo: "04 - Tarefas/T-0001.md",
            url: URL(fileURLWithPath: "/tmp/T-0001.md"),
            tipo: .tarefa,
            frontmatter: Frontmatter(valores: ["tipo": "tarefa"]),
            corpo: "# Montar a Bancada\n\nTexto.",
            modificadoEm: .now
        )
        XCTAssertEqual(nota.titulo, "Montar a Bancada")
        XCTAssertTrue(nota.editavel)
    }

    func testTituloCaiNoNomeDoArquivoSemH1() {
        let nota = Nota(
            caminhoRelativo: "x/Sem Título.md",
            url: URL(fileURLWithPath: "/tmp/Sem Título.md"),
            tipo: .tarefa,
            frontmatter: Frontmatter(),
            corpo: "Texto sem cabeçalho.",
            modificadoEm: .now
        )
        XCTAssertEqual(nota.titulo, "Sem Título")
    }
}

final class MidiaTests: XCTestCase {
    func testPagesApontaParaODerivado() {
        let midia = Midia(
            url: URL(fileURLWithPath: "/v/01 - CBL/Desafios/C18/Documentos/CBL_C18.pages"),
            caminhoRelativo: "01 - CBL/Desafios/C18/Documentos/CBL_C18.pages",
            especie: .pages,
            bytes: 0,
            modificadoEm: .now
        )
        XCTAssertEqual(midia.caminhoDerivado, "01 - CBL/Desafios/C18/Documentos/CBL_C18.md")
    }

    func testEspeciePorExtensao() {
        XCTAssertEqual(Midia.especie(para: URL(fileURLWithPath: "/a/b.PNG")), .imagem)
        XCTAssertEqual(Midia.especie(para: URL(fileURLWithPath: "/a/b.mov")), .video)
        XCTAssertEqual(Midia.especie(para: URL(fileURLWithPath: "/a/b.pdf")), .pdf)
        XCTAssertEqual(Midia.especie(para: URL(fileURLWithPath: "/a/b.pages")), .pages)
        XCTAssertEqual(Midia.especie(para: URL(fileURLWithPath: "/a/b.zip")), .outro)
    }
}

final class LeitorDeVaultTests: XCTestCase {
    func testPastaSemRegistrosNaoEVault() {
        let temp = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("bancada-teste-\(UUID().uuidString)")
        try? FileManager.default.createDirectory(at: temp, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: temp) }

        XCTAssertFalse(LeitorDeVault.ehVault(temp))
        XCTAssertThrowsError(try LeitorDeVault.ler(raiz: temp))
    }

    func testCaminhoRelativo() {
        let raiz = URL(fileURLWithPath: "/Users/x/doc-harness")
        let alvo = raiz.appendingPathComponent("04 - Tarefas/T-0001.md")
        XCTAssertEqual(LeitorDeVault.relativo(alvo, a: raiz), "04 - Tarefas/T-0001.md")
    }
}
