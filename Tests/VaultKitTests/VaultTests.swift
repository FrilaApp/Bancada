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

/// Os três andaimes que existem no vault hoje entram aqui pelo nome real: o
/// que quebrou antes foi `Template - Tarefa.md` chegando à tabela de tarefas
/// como `T-0000 — {{título da tarefa}}`, e também ao site publicado.
final class TemplateTests: XCTestCase {
    func testReconheceOsTresTemplatesDoVault() {
        XCTAssertTrue(LeitorDeVault.ehTemplate("04 - Tarefas/Template - Tarefa.md"))
        XCTAssertTrue(LeitorDeVault.ehTemplate("02 - Atualizações Diárias/Template - Atualização Diária.md"))
        XCTAssertTrue(LeitorDeVault.ehTemplate("01 - CBL/Template - Novo Desafio CBL.md"))
    }

    /// A regra é o prefixo do nome do arquivo, não a palavra em qualquer lugar:
    /// uma nota que *fale* sobre templates continua sendo conteúdo.
    func testNaoConfundeNotaQueFalaDeTemplate() {
        XCTAssertFalse(LeitorDeVault.ehTemplate("04 - Tarefas/T-0007 - Revisar o Template de tarefa.md"))
        XCTAssertFalse(LeitorDeVault.ehTemplate("03 - Roadmap/Templates do vault.md"))
        XCTAssertFalse(LeitorDeVault.ehTemplate("04 - Tarefas/template - minúsculo.md"))
        XCTAssertFalse(LeitorDeVault.ehTemplate("04 - Tarefas/T-0001.md"))
    }

    /// O caso completo, do disco à separação: um vault com uma tarefa de
    /// verdade e o andaime ao lado.
    func testTemplateNaoEntraEmNotasNemEmTarefas() throws {
        let fm = FileManager.default
        let raiz = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("bancada-template-\(UUID().uuidString)")
        let tarefas = raiz.appendingPathComponent("04 - Tarefas")
        try fm.createDirectory(at: raiz.appendingPathComponent("05 - Registros"), withIntermediateDirectories: true)
        try fm.createDirectory(at: tarefas, withIntermediateDirectories: true)
        defer { try? fm.removeItem(at: raiz) }

        try """
        ---
        tipo: tarefa
        id: T-0001
        status: a-fazer
        ---

        # Tarefa de verdade
        """.write(to: tarefas.appendingPathComponent("T-0001.md"), atomically: true, encoding: .utf8)

        try """
        ---
        tipo: tarefa
        id: T-0000
        status: a-fazer
        ---

        # {{título da tarefa}}
        """.write(to: tarefas.appendingPathComponent("Template - Tarefa.md"), atomically: true, encoding: .utf8)

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertEqual(vault.tarefas.count, 1)
        XCTAssertEqual(vault.tarefas.first?.identificador, "T-0001")
        XCTAssertFalse(
            vault.notas.contains { $0.identificador == "T-0000" },
            "o andaime vazou para as notas do vault"
        )

        // Separado não é descartado: o andaime continua alcançável e contável.
        XCTAssertEqual(vault.templates.count, 1)
        XCTAssertEqual(vault.templates.first?.identificador, "T-0000")

        // E não vira alerta de saúde: ele cumpre a convenção, só não é conteúdo.
        XCTAssertTrue(vault.invalidas.isEmpty)
    }

    /// Template com frontmatter quebrado continua sendo cobrado — a separação
    /// acontece depois da validação, não no lugar dela.
    func testTemplateForaDaConvencaoAindaEhCobrado() throws {
        let fm = FileManager.default
        let raiz = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("bancada-template-\(UUID().uuidString)")
        let tarefas = raiz.appendingPathComponent("04 - Tarefas")
        try fm.createDirectory(at: raiz.appendingPathComponent("05 - Registros"), withIntermediateDirectories: true)
        try fm.createDirectory(at: tarefas, withIntermediateDirectories: true)
        defer { try? fm.removeItem(at: raiz) }

        try "# Sem frontmatter nenhum"
            .write(to: tarefas.appendingPathComponent("Template - Tarefa.md"), atomically: true, encoding: .utf8)

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertTrue(vault.templates.isEmpty)
        XCTAssertEqual(vault.invalidas.count, 1)
        XCTAssertEqual(vault.invalidas.first?.motivo, .semFrontmatter)
    }
}
