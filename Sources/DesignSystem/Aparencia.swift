import SwiftUI
import AppKit

/// Qual dos dois esquemas do sistema de design a janela usa.
///
/// A regra da Bancada é acompanhar a aparência do macOS, e ela continua sendo
/// o padrão — `.sistema`. O que existe aqui é o *override*, que é como todo
/// app Mac resolve isso, incluindo as próprias Ajustes do sistema: três
/// estados, não dois. Um par claro/escuro sem a opção "sistema" seria pior que
/// não ter opção nenhuma — obrigaria a pessoa a escolher de novo toda vez que
/// o Mac trocasse de aparência sozinho ao anoitecer.
///
/// A preferência muda a aparência do `NSApplication` inteiro, e não só das
/// views: assim a barra de título, os menus e o `NSOpenPanel` de escolher
/// vault acompanham. Como o `NSHostingView` deriva o `ColorScheme` da
/// aparência efetiva, `CoresDoAmbiente` segue junto sem nenhuma view saber
/// que existe uma preferência.
public enum Aparencia: String, CaseIterable, Identifiable, Sendable {
    case sistema
    case claro
    case escuro

    public var id: String { rawValue }

    public var rotulo: String {
        switch self {
        case .sistema: return "Sistema"
        case .claro:   return "Claro"
        case .escuro:  return "Escuro"
        }
    }

    public var simbolo: String {
        switch self {
        case .sistema: return "circle.lefthalf.filled"
        case .claro:   return "sun.max"
        case .escuro:  return "moon"
        }
    }

    /// Uma linha dizendo o que a escolha faz. Aparece sob o seletor, porque
    /// "Sistema" não é autoexplicativo para quem nunca trocou.
    public var nota: String {
        switch self {
        case .sistema:
            return "A janela acompanha a aparência do macOS, e muda junto quando ele muda."
        case .claro:
            return "Fixa o esquema claro, mesmo com o macOS no escuro."
        case .escuro:
            return "Fixa o esquema escuro, mesmo com o macOS no claro."
        }
    }

    /// O esquema forçado, ou `nil` para seguir o sistema.
    public var esquema: ColorScheme? {
        switch self {
        case .sistema: return nil
        case .claro:   return .light
        case .escuro:  return .dark
        }
    }

    // MARK: - Persistência

    /// Mesma convenção de chave que o caminho do vault usa em
    /// `EstadoDaBancada` — a preferência é do app, não do vault, e sobrevive a
    /// trocar de pasta.
    private static let chave = "com.blendops.bancada.aparencia"

    /// Ler devolve `.sistema` para valor ausente ou desconhecido: uma chave
    /// escrita por uma versão futura não pode deixar a janela sem aparência.
    /// Escrever já aplica — não há estado salvo que não esteja em vigor.
    public static var preferida: Aparencia {
        get {
            let salvo = UserDefaults.standard.string(forKey: chave) ?? ""
            return Aparencia(rawValue: salvo) ?? .sistema
        }
        set {
            UserDefaults.standard.set(newValue.rawValue, forKey: chave)
            newValue.aplicar()
        }
    }

    public func aplicar() {
        NSApp?.appearance = switch esquema {
        case .none:   nil
        case .light:  NSAppearance(named: .aqua)
        case .dark:   NSAppearance(named: .darkAqua)
        case .some:   nil
        }
    }
}
