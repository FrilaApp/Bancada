import XCTest
@testable import VaultKit

// Mesmo guard de `Sources/VaultKit/Observador.swift`: sem ele a suíte não
// compila no runner Linux do CI, e o alvo que existe para ser portável
// derrubaria justamente o build que ele veio destravar.
#if canImport(CoreServices)

/// O observador é testado numa pasta temporária, e não commitando no vault
/// real: um commit de teste deixaria um fato permanente no log, que é
/// append-only. O log do dia 08/09 já carrega dois desses.
final class ObservadorTests: XCTestCase {
    private var raiz: URL!

    override func setUpWithError() throws {
        raiz = URL(fileURLWithPath: NSTemporaryDirectory())
            .appendingPathComponent("bancada-observador-\(UUID().uuidString)")
        try FileManager.default.createDirectory(
            at: raiz.appendingPathComponent("05 - Registros/2026/09"),
            withIntermediateDirectories: true
        )
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: raiz)
    }

    /// Simula o que os hooks do Git fazem: acrescentar uma linha ao log por
    /// fora do app.
    func testAvisaQuandoOLogRecebeUmFatoNovo() throws {
        let aviso = expectation(description: "mudança detectada")
        aviso.assertForOverFulfill = false

        let observador = ObservadorDeVault(raiz: raiz, pausa: 0.2) { aviso.fulfill() }
        observador.iniciar()
        defer { observador.parar() }

        // FSEvents precisa de um instante para assinar a árvore.
        Thread.sleep(forTimeInterval: 0.6)

        let log = raiz.appendingPathComponent("05 - Registros/2026/09/2026-09-09.md")
        try "- `10:00` · **fbtostadev** · `commit` · `abc1234` — Um fato · 1 arquivo(s)\n"
            .write(to: log, atomically: true, encoding: .utf8)

        wait(for: [aviso], timeout: 8)
    }

    /// Uma rajada de escritas — um commit toca vários arquivos — não deve
    /// virar uma releitura do vault por arquivo.
    func testRajadaDeEscritasVirapoucosAvisos() throws {
        let contador = ContadorSeguro()
        // Fila própria: este teste bloqueia a thread principal com `sleep`,
        // então a entrega padrão (main) nunca rodaria.
        let observador = ObservadorDeVault(
            raiz: raiz,
            pausa: 0.4,
            filaDeEntrega: DispatchQueue(label: "teste.entrega")
        ) { contador.incrementar() }
        observador.iniciar()
        defer { observador.parar() }

        Thread.sleep(forTimeInterval: 0.6)

        for i in 0..<20 {
            let arquivo = raiz.appendingPathComponent("05 - Registros/2026/09/arquivo-\(i).md")
            try "conteúdo \(i)".write(to: arquivo, atomically: true, encoding: .utf8)
        }

        Thread.sleep(forTimeInterval: 2.0)

        let n = contador.valor
        XCTAssertGreaterThan(n, 0, "nenhuma mudança foi detectada")
        XCTAssertLessThanOrEqual(n, 4, "o debounce não segurou a rajada: \(n) avisos para 20 escritas")
    }
}

private final class ContadorSeguro: @unchecked Sendable {
    private let trava = NSLock()
    private var n = 0

    func incrementar() {
        trava.lock(); defer { trava.unlock() }
        n += 1
    }

    var valor: Int {
        trava.lock(); defer { trava.unlock() }
        return n
    }
}

#endif
