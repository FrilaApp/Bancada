import SwiftUI
import AppKit
import DesignSystem
import NucleoCLI

/// Ponto de entrada.
///
/// Segue o padrão de `ActionShelf/Sources/ActionShelf/main.swift`: um
/// executável SwiftPM montando a janela pelo AppKit, sem `.xcodeproj`
/// versionado — que com cinco pessoas commitando é fábrica de conflito.
/// `scripts/empacotar-app.sh` empacota esse mesmo binário num `Bancada.app`
/// depois do build, para abrir pelo Finder/Spotlight e fixar na Dock; o
/// bundle em si não é versionado, só o script que o gera.
///
/// Diferente do ActionShelf, aqui a política é `.regular`: a Bancada é uma
/// janela de trabalho, com Dock e menu, não um painel ancorado na notch.
final class DelegadoDoApp: NSObject, NSApplicationDelegate {
    private var janela: NSWindow?

    @objc func abrirAjustes(_ sender: Any?) {
        NotificationCenter.default.post(name: .abrirAjustes, object: nil)
    }

    func applicationDidFinishLaunching(_ notificacao: Notification) {
        // Antes da janela existir: aplicar depois faria a janela abrir com a
        // aparência do sistema e trocar à vista, o que parece defeito.
        Aparencia.preferida.aplicar()

        NSApp.mainMenu = Self.menu()

        let janela = NSWindow(
            contentRect: NSRect(
                x: 0, y: 0,
                width: DS.Janela.larguraPadrao,
                height: DS.Janela.alturaPadrao
            ),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        janela.title = "Bancada"
        janela.titleVisibility = .hidden
        janela.titlebarAppearsTransparent = false
        janela.contentView = NSHostingView(rootView: JanelaPrincipal())
        // O `minWidth` do SwiftUI vive dentro do `NSHostingView` e não sobe
        // para a janela. Sem este limite a janela encolhe abaixo do que as
        // telas conseguem desenhar — e o `setFrameAutosaveName` restaura o
        // tamanho quebrado na abertura seguinte, tornando o estado permanente.
        // O número não é escolhido: é a soma dos mínimos declarados.
        janela.contentMinSize = NSSize(
            width: DS.Janela.larguraMinimaDoConteudo,
            height: DS.Janela.alturaMinimaDoConteudo
        )
        janela.setFrameAutosaveName("BancadaPrincipal")
        janela.center()
        janela.makeKeyAndOrderFront(nil)

        self.janela = janela
        NSApp.activate(ignoringOtherApps: true)
    }

    /// Fechar a janela encerra o app — a Bancada é uma janela única, sem
    /// tarefa em segundo plano que justifique ficar viva sem ela.
    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }

    // MARK: - Menu

    /// O menu principal.
    ///
    /// Um executável SwiftPM não ganha menu de graça como um app de
    /// `.xcodeproj`: sem montar o `NSMenu` à mão não existe **nenhum** atalho
    /// de sistema. Faltavam Cmd+Q e Cmd+W — e, num app cuja função é ler o
    /// vault, faltava **Cmd+C**, porque copiar depende de o menu Editar existir
    /// para ligar os seletores à cadeia de resposta.
    ///
    /// Os itens não têm ação própria: `nil` como `action` faz o AppKit
    /// despachar pelo *responder chain*, que é quem sabe se há texto
    /// selecionado. É por isso que "Copiar" funciona sem esta classe saber o
    /// que está na tela.
    private static func menu() -> NSMenu {
        let principal = NSMenu()
        let nome = ProcessInfo.processInfo.processName

        // MARK: App
        let itemApp = NSMenuItem(title: nome, action: nil, keyEquivalent: "")
        let menuApp = NSMenu()
        menuApp.addItem(withTitle: "Sobre \(nome)",
                        action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)),
                        keyEquivalent: "")
        menuApp.addItem(.separator())
        menuApp.addItem(withTitle: "Ajustes…",
                        action: #selector(abrirAjustes(_:)),
                        keyEquivalent: ",")
        menuApp.addItem(.separator())
        menuApp.addItem(withTitle: "Ocultar \(nome)",
                        action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let ocultarOutros = NSMenuItem(title: "Ocultar Outros",
                                       action: #selector(NSApplication.hideOtherApplications(_:)),
                                       keyEquivalent: "h")
        ocultarOutros.keyEquivalentModifierMask = [.command, .option]
        menuApp.addItem(ocultarOutros)
        menuApp.addItem(withTitle: "Mostrar Tudo",
                        action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        menuApp.addItem(.separator())
        menuApp.addItem(withTitle: "Encerrar \(nome)",
                        action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        itemApp.submenu = menuApp
        principal.addItem(itemApp)

        // MARK: Editar
        // A Bancada é somente leitura: Desfazer, Recortar e Colar não têm o que
        // fazer aqui. Copiar e Selecionar Tudo, sim — é um leitor.
        let itemEditar = NSMenuItem(title: "Editar", action: nil, keyEquivalent: "")
        let menuEditar = NSMenu(title: "Editar")
        menuEditar.addItem(withTitle: "Copiar",
                           action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        menuEditar.addItem(withTitle: "Selecionar Tudo",
                           action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        itemEditar.submenu = menuEditar
        principal.addItem(itemEditar)

        // MARK: Janela
        let itemJanela = NSMenuItem(title: "Janela", action: nil, keyEquivalent: "")
        let menuJanela = NSMenu(title: "Janela")
        menuJanela.addItem(withTitle: "Minimizar",
                           action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        menuJanela.addItem(withTitle: "Zoom",
                           action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        menuJanela.addItem(.separator())
        menuJanela.addItem(withTitle: "Fechar",
                           action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        itemJanela.submenu = menuJanela
        principal.addItem(itemJanela)
        NSApp.windowsMenu = menuJanela

        return principal
    }
}

// Modos de linha de comando: leem o vault e saem, sem abrir janela.
//
// A implementação vive em `NucleoCLI`, compartilhada com o executável
// `bancada-indice` que o CI compila em Linux. O despacho fica aqui para que
// `./Bancada --indice` continue funcionando exatamente como sempre funcionou.
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
