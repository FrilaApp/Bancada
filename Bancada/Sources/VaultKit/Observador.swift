import Foundation

// FSEvents vem de CoreServices, que só existe em plataformas Apple. Este é o
// único arquivo do VaultKit que não é Foundation puro — e é justamente o que
// permite ao resto do módulo compilar em Linux, onde o CI roda o
// `bancada-indice` para gerar o site.
//
// O guard não deixa nada inalcançável no app: quem consome `ObservadorDeVault`
// é `Sources/Bancada/EstadoDaBancada.swift`, que só existe no alvo macOS.
#if canImport(CoreServices)
import CoreServices

/// Avisa quando algo muda dentro do vault.
///
/// Existe por causa do fluxo real do doc-harness: os hooks do Git escrevem em
/// `05 - Registros/` por fora da Bancada, e os cinco colaboradores puxam
/// trabalho uns dos outros com `/entrar`. Uma tela que só atualiza ao reabrir
/// mostraria um vault desatualizado sem avisar — pior que não mostrar nada.
///
/// Usa FSEvents porque é a única API que observa uma árvore inteira sem manter
/// um descritor por arquivo.
public final class ObservadorDeVault {
    private let raiz: URL
    private let aoMudar: () -> Void
    private var stream: FSEventStreamRef?
    private let fila = DispatchQueue(label: "com.blendops.bancada.fsevents")

    /// Escritas chegam em rajada (um commit toca vários arquivos); sem uma
    /// pausa, a Bancada releria o vault uma dezena de vezes por commit.
    private var debounce: DispatchWorkItem?
    private let pausa: TimeInterval

    /// Fila em que `aoMudar` é entregue. O padrão é a principal, porque quem
    /// consome é a interface; deixá-la configurável é o que permite testar o
    /// observador sem depender de um runloop ativo.
    private let filaDeEntrega: DispatchQueue

    public init(
        raiz: URL,
        pausa: TimeInterval = 0.4,
        filaDeEntrega: DispatchQueue = .main,
        aoMudar: @escaping () -> Void
    ) {
        self.raiz = raiz
        self.pausa = pausa
        self.filaDeEntrega = filaDeEntrega
        self.aoMudar = aoMudar
    }

    deinit { parar() }

    public func iniciar() {
        guard stream == nil else { return }

        var contexto = FSEventStreamContext(
            version: 0,
            info: Unmanaged.passUnretained(self).toOpaque(),
            retain: nil,
            release: nil,
            copyDescription: nil
        )

        let callback: FSEventStreamCallback = { _, info, _, _, _, _ in
            guard let info else { return }
            let observador = Unmanaged<ObservadorDeVault>.fromOpaque(info).takeUnretainedValue()
            observador.agendar()
        }

        guard let novo = FSEventStreamCreate(
            kCFAllocatorDefault,
            callback,
            &contexto,
            [raiz.path] as CFArray,
            FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
            0.2,
            UInt32(kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagNoDefer)
        ) else { return }

        FSEventStreamSetDispatchQueue(novo, fila)
        FSEventStreamStart(novo)
        stream = novo
    }

    public func parar() {
        guard let stream else { return }
        FSEventStreamStop(stream)
        FSEventStreamInvalidate(stream)
        FSEventStreamRelease(stream)
        self.stream = nil
        debounce?.cancel()
    }

    private func agendar() {
        debounce?.cancel()
        let trabalho = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.filaDeEntrega.async { self.aoMudar() }
        }
        debounce = trabalho
        fila.asyncAfter(deadline: .now() + pausa, execute: trabalho)
    }
}

#endif
