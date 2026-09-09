import AppKit
import SwiftUI

final class ActionShelfAppDelegate: NSObject, NSApplicationDelegate {
    var panel: NSPanel?
    var reason: String = "Autorizar o envio de alterações (git push) no Challenge 18"
    var isTestMode: Bool = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        guard let screen = NSScreen.main else {
            exit(1)
        }

        let windowWidth: CGFloat = 440
        let windowHeight: CGFloat = 120

        // Ancorado exatamente no topo central da tela principal
        let xPos = screen.frame.midX - (windowWidth / 2)
        let yPos = screen.frame.maxY - windowHeight

        let panel = NSPanel(
            contentRect: NSRect(x: xPos, y: yPos, width: windowWidth, height: windowHeight),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )

        panel.level = .statusBar
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.ignoresMouseEvents = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]

        let shelfView = ActionShelfView(
            reason: reason,
            isTestMode: isTestMode
        ) { aprovado in
            exit(aprovado ? 0 : 1)
        }

        panel.contentView = NSHostingView(rootView: shelfView)
        panel.orderFrontRegardless()
        self.panel = panel
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory) // Executa silenciosamente sem ícone no Dock

let delegate = ActionShelfAppDelegate()

// Tratamento de argumentos CLI
var args = CommandLine.arguments
var i = 1
while i < args.count {
    if args[i] == "--reason" && i + 1 < args.count {
        delegate.reason = args[i + 1]
        i += 2
    } else if args[i] == "--test" {
        delegate.isTestMode = true
        i += 1
    } else {
        i += 1
    }
}

app.delegate = delegate
app.run()
