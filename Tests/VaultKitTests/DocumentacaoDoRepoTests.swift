import XCTest
@testable import VaultKit

/// O doc-harness é repo e vault na mesma pasta, então documentação do
/// repositório convive com as notas. Ela não deve ser cobrada pela convenção
/// de frontmatter — um alerta permanente vira ruído e treina a pessoa a
/// ignorar a tela de saúde inteira.
final class DocumentacaoDoRepoTests: XCTestCase {
    private var raiz: URL!

    override func setUpWithError() throws {
        raiz = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("bancada-vault-\(UUID().uuidString)")
        let fm = FileManager.default
        try fm.createDirectory(
            at: raiz.appendingPathComponent("05 - Registros/2026/09"),
            withIntermediateDirectories: true
        )
        try fm.createDirectory(
            at: raiz.appendingPathComponent("04 - Tarefas"),
            withIntermediateDirectories: true
        )
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: raiz)
    }

    private func escrever(_ conteudo: String, em caminho: String) throws {
        try conteudo.write(
            to: raiz.appendingPathComponent(caminho),
            atomically: true,
            encoding: .utf8
        )
    }

    func testDocumentacaoNaRaizNaoContaComoNotaInvalida() throws {
        try escrever("# doc-harness\n\nSem frontmatter, e tudo bem.", em: "README.md")
        try escrever("# Instruções\n\nTambém sem frontmatter.", em: "CLAUDE.md")
        try escrever(
            "---\ntipo: tarefa\nid: T-0001\nstatus: a-fazer\n---\n\n# Uma tarefa",
            em: "04 - Tarefas/T-0001.md"
        )

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertTrue(vault.invalidas.isEmpty, "flagrou: \(vault.invalidas.map(\.caminhoRelativo))")
        XCTAssertEqual(vault.tarefas.count, 1)
    }

    /// A isenção vale só na raiz: um README dentro de uma pasta de conteúdo é
    /// nota de verdade.
    func testReadmeDentroDePastaDeConteudoAindaECobrado() throws {
        try escrever("# Sem frontmatter", em: "04 - Tarefas/README.md")

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertEqual(vault.invalidas.count, 1)
        XCTAssertEqual(vault.invalidas.first?.caminhoRelativo, "04 - Tarefas/README.md")
    }

    func testTipoDesconhecidoEReportadoComOValorEncontrado() throws {
        try escrever("---\ntipo: kanban\n---\n\n# x", em: "04 - Tarefas/estranha.md")

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertEqual(vault.invalidas.first?.motivo, .tipoDesconhecido("kanban"))
    }

    func testFatosSaoLidosDoLogDoVault() throws {
        try escrever(
            """
            ---
            tipo: registro
            data: 2026-09-08
            tags: [registro]
            ---

            # Registros — 2026-09-08

            > Log de fatos, escrito automaticamente pelos hooks.

            - `10:00` · **fbtostadev** · `commit` · `abc1234` — Um commit · 1 arquivo(s)
            - `10:05` · **fbtostadev** · `sessao` · Claude · 1 nota(s) com alteração pendente
            """,
            em: "05 - Registros/2026/09/2026-09-08.md"
        )

        let vault = try LeitorDeVault.ler(raiz: raiz)

        XCTAssertEqual(vault.fatos.count, 2)
        XCTAssertTrue(vault.fatosNaoReconhecidos.isEmpty)
        // A linha de citação do cabeçalho não é fato nem erro.
        XCTAssertEqual(vault.fatos.first?.tipo, "commit")
    }
}
