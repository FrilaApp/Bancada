import SwiftUI
import AppKit

/// Ponto de entrada.
///
/// Segue o padrão de `ActionShelf/Sources/ActionShelf/main.swift`: um
/// executável SwiftPM sem `.app` bundle, montando a janela pelo AppKit. É o
/// que permite `swift build` e pronto — sem `.xcodeproj` versionado, que com
/// cinco pessoas commitando é fábrica de conflito.
///
/// Diferente do ActionShelf, aqui a política é `.regular`: a Bancada é uma
/// janela de trabalho, com Dock e menu, não um painel ancorado na notch.
final class DelegadoDoApp: NSObject, NSApplicationDelegate {
    private var janela: NSWindow?

    func applicationDidFinishLaunching(_ notificacao: Notification) {
        let janela = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1080, height: 720),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        janela.title = "Bancada"
        janela.titlebarAppearsTransparent = false
        janela.contentView = NSHostingView(rootView: JanelaPrincipal())
        janela.setFrameAutosaveName("BancadaPrincipal")
        janela.center()
        janela.makeKeyAndOrderFront(nil)

        self.janela = janela
        NSApp.activate(ignoringOtherApps: true)
    }

    /// Fechar a janela encerra o app: sem bundle, não há Dock persistente
    /// que justifique manter o processo vivo.
    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }
}

// Modos de linha de comando: leem o vault e saem, sem abrir janela.
let caminhoPedido = CommandLine.arguments.dropFirst().first { !$0.hasPrefix("--") }

if CommandLine.arguments.contains("--verificar") {
    exit(Verificacao.executar(caminho: caminhoPedido))
}
if CommandLine.arguments.contains("--indice") {
    exit(Indice.executar(caminho: caminhoPedido))
}

let app = NSApplication.shared
let delegado = DelegadoDoApp()
app.delegate = delegado
app.setActivationPolicy(.regular)
app.run()
