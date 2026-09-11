import XCTest
@testable import NucleoCLI
@testable import VaultKit

/// O `NucleoCLI` é o núcleo compartilhado entre o `Bancada.app` e o executável
/// `bancada-indice` que o CI compila em Linux para gerar o site.
///
/// O que estes testes protegem é o **contrato do JSON**. O site consome esse
/// formato em vez de reimplementar o parser, e uma chave que some ou muda de
/// nome quebra o gerador em silêncio — o site publica, só que vazio ou errado.
final class IndiceTests: XCTestCase {

    // MARK: - Vault de mentira

    /// Monta um vault mínimo numa pasta temporária, no mesmo padrão de
    /// `VaultKitTests/VaultTests.swift`. `05 - Registros/` é o que faz
    /// `LeitorDeVault.ehVault` reconhecer a pasta.
    private func vaultTemporario(
        comNotaInvalida: Bool = false
    ) throws -> (raiz: URL, limpar: () -> Void) {
        let fm = FileManager.default
        let raiz = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("nucleo-cli-\(UUID().uuidString)")
        let tarefas = raiz.appendingPathComponent("04 - Tarefas")
        try fm.createDirectory(
            at: raiz.appendingPathComponent("05 - Registros"),
            withIntermediateDirectories: true
        )
        try fm.createDirectory(at: tarefas, withIntermediateDirectories: true)

        try """
        ---
        tipo: tarefa
        id: T-0001
        status: a-fazer
        ---

        # Tarefa de verdade
        """.write(
            to: tarefas.appendingPathComponent("T-0001.md"),
            atomically: true, encoding: .utf8
        )

        try """
        ---
        tipo: tarefa
        id: T-0000
        status: a-fazer
        ---

        # {{título da tarefa}}
        """.write(
            to: tarefas.appendingPathComponent("Template - Tarefa.md"),
            atomically: true, encoding: .utf8
        )

        if comNotaInvalida {
            try "# Nota sem frontmatter nenhum".write(
                to: tarefas.appendingPathComponent("solta.md"),
                atomically: true, encoding: .utf8
            )
        }

        return (raiz, { try? fm.removeItem(at: raiz) })
    }

    /// Codifica com exatamente os mesmos ajustes de `Indice.executar`. Se um
    /// deles mudar lá e não aqui, o teste para de descrever o que é publicado.
    private func jsonDoIndice(_ vault: Vault) throws -> [String: Any] {
        let codificador = JSONEncoder()
        codificador.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
        codificador.dateEncodingStrategy = .iso8601

        let dados = try codificador.encode(IndiceDoVault(vault))
        let objeto = try JSONSerialization.jsonObject(with: dados)
        return try XCTUnwrap(objeto as? [String: Any], "o índice não é um objeto JSON")
    }

    // MARK: - Contrato

    func testIndiceDeclaraAVersaoDoFormato() throws {
        let (raiz, limpar) = try vaultTemporario()
        defer { limpar() }

        let json = try jsonDoIndice(try LeitorDeVault.ler(raiz: raiz))

        // Se esta versão mudar, o `gerar-site.js` precisa mudar junto — é o que
        // torna a quebra de contrato uma decisão, e não um efeito colateral.
        XCTAssertEqual(json["versaoDoFormato"] as? Int, 2)
        XCTAssertEqual(Indice.versaoDoFormato, 2)
    }

    /// As chaves que `scripts/gerar-site.js` lê. Uma some, o site gera vazio.
    func testIndiceTrazTodasAsChavesQueOSiteConsome() throws {
        let (raiz, limpar) = try vaultTemporario()
        defer { limpar() }

        let json = try jsonDoIndice(try LeitorDeVault.ler(raiz: raiz))

        for chave in [
            "versaoDoFormato", "raiz", "geradoEm", "notas", "templates",
            "fatos", "arvoreDeRegistros", "midias", "invalidas",
            "fatosNaoReconhecidos"
        ] {
            XCTAssertNotNil(json[chave], "o índice perdeu a chave `\(chave)`")
        }
    }

    /// A mudança que motivou a versão 2 do formato: até a versão 1, o andaime
    /// `Template - Tarefa.md` chegava ao site como uma tarefa de verdade,
    /// `T-0000 — {{título da tarefa}}`.
    func testAndaimeNaoSePassaPorNota() throws {
        let (raiz, limpar) = try vaultTemporario()
        defer { limpar() }

        let json = try jsonDoIndice(try LeitorDeVault.ler(raiz: raiz))
        let notas = try XCTUnwrap(json["notas"] as? [[String: Any]])
        let templates = try XCTUnwrap(json["templates"] as? [[String: Any]])

        XCTAssertEqual(templates.count, 1)
        XCTAssertFalse(
            notas.contains { ($0["titulo"] as? String)?.contains("{{") == true },
            "um andaime vazou para as notas publicadas"
        )
    }

    // MARK: - O portão do CI

    /// `--verificar` é o que roda antes de publicar. O código de saída é a
    /// interface inteira dele com o workflow, então é o que merece teste.
    func testVerificarAprovaVaultConsistente() throws {
        let (raiz, limpar) = try vaultTemporario()
        defer { limpar() }

        XCTAssertEqual(Verificacao.executar(caminho: raiz.path), 0)
    }

    func testVerificarReprovaNotaForaDaConvencao() throws {
        let (raiz, limpar) = try vaultTemporario(comNotaInvalida: true)
        defer { limpar() }

        // 2, e não 1: 1 é "isso não é um vault", 2 é "é um vault e está
        // inconsistente". O workflow depende dessa distinção para não publicar.
        XCTAssertEqual(Verificacao.executar(caminho: raiz.path), 2)
    }

    func testVerificarRejeitaPastaQueNaoEVault() throws {
        let vazia = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("nao-vault-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: vazia, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: vazia) }

        XCTAssertEqual(Verificacao.executar(caminho: vazia.path), 1)
    }
}
