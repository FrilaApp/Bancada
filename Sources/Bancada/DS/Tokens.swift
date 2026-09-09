import SwiftUI
import VaultKit

/// Espelho em Swift de `tokens.json`.
///
/// Os valores vivem em JSON porque o gerador do site (Fase 2) vai consumir o
/// mesmo arquivo. Mantê-los aqui como constantes — em vez de decodificar o
/// JSON em runtime — dá verificação em tempo de compilação e evita um recurso
/// a mais para o executável carregar. Ao mexer num valor, mexa nos dois.
///
/// Segue o padrão declarativo de `ActionShelf/Sources/ActionShelf/MotionTokens.swift`.
public enum DS {

    // MARK: - Cor

    /// Par claro/escuro resolvido pelo sistema — a Bancada acompanha a
    /// aparência do macOS em vez de impor um tema.
    struct ParDeCor {
        let claro: Color
        let escuro: Color

        func resolver(_ esquema: ColorScheme) -> Color {
            esquema == .dark ? escuro : claro
        }
    }

    enum Cor {
        static let fundo           = ParDeCor(claro: .hex("FBFAF7"), escuro: .hex("141310"))
        static let superficie      = ParDeCor(claro: .hex("FFFFFF"), escuro: .hex("1D1B17"))
        static let superficieSutil = ParDeCor(claro: .hex("F2F0EA"), escuro: .hex("25231E"))
        static let borda           = ParDeCor(claro: .hex("E2DED4"), escuro: .hex("33302A"))
        static let texto           = ParDeCor(claro: .hex("1B1A17"), escuro: .hex("F2F0EA"))
        static let textoSutil      = ParDeCor(claro: .hex("6E6A5F"), escuro: .hex("9C978A"))
        static let acento          = ParDeCor(claro: .hex("B4552A"), escuro: .hex("E08A5C"))

        static func status(_ status: StatusTarefa) -> ParDeCor {
            switch status {
            case .aFazer:      return ParDeCor(claro: .hex("8A8578"), escuro: .hex("9C978A"))
            case .emAndamento: return ParDeCor(claro: .hex("B4552A"), escuro: .hex("E08A5C"))
            case .revisao:     return ParDeCor(claro: .hex("8A6D1F"), escuro: .hex("D0AC4E"))
            case .concluida:   return ParDeCor(claro: .hex("3F7A52"), escuro: .hex("6FB287"))
            }
        }

        /// Cor por tipo de fato. Tipos novos podem surgir — `registrar-fato.sh`
        /// aceita tipo arbitrário —, então há um padrão em vez de um enum.
        static func tipoDeFato(_ tipo: String) -> Color {
            switch tipo {
            case "commit": return .hex("5B7FA8")
            case "pages":  return .hex("8A6D1F")
            case "sessao": return .hex("6E6A5F")
            case "teste":  return .hex("7A5B8F")
            case "ui":     return .hex("2E7D52")
            default:       return .hex("8A8578")
            }
        }
    }

    // MARK: - Métrica

    enum Espaco {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 20
        static let xl: CGFloat = 32
    }

    enum Raio {
        static let sm: CGFloat = 6
        static let md: CGFloat = 10
        static let lg: CGFloat = 16
    }

    enum Tipografia {
        static let titulo  = Font.system(size: 22, weight: .semibold)
        static let secao   = Font.system(size: 15, weight: .semibold)
        static let corpo   = Font.system(size: 13)
        static let detalhe = Font.system(size: 11)
        static let mono    = Font.system(size: 12, design: .monospaced)
    }

    enum Galeria {
        static let larguraMinimaCard: CGFloat = 180
        static let alturaThumbnail: CGFloat = 128
    }
}

extension Color {
    /// Aceita "RRGGBB" ou "#RRGGBB".
    static func hex(_ valor: String) -> Color {
        var s = valor
        if s.hasPrefix("#") { s.removeFirst() }
        let n = UInt32(s, radix: 16) ?? 0
        return Color(
            .sRGB,
            red:   Double((n >> 16) & 0xFF) / 255,
            green: Double((n >> 8)  & 0xFF) / 255,
            blue:  Double(n & 0xFF)         / 255
        )
    }
}

/// Acesso às cores já resolvidas para a aparência atual, sem cada view
/// precisar ler o `ColorScheme` e chamar `resolver`.
struct CoresDoAmbiente {
    let esquema: ColorScheme

    var fundo: Color           { DS.Cor.fundo.resolver(esquema) }
    var superficie: Color      { DS.Cor.superficie.resolver(esquema) }
    var superficieSutil: Color { DS.Cor.superficieSutil.resolver(esquema) }
    var borda: Color           { DS.Cor.borda.resolver(esquema) }
    var texto: Color           { DS.Cor.texto.resolver(esquema) }
    var textoSutil: Color      { DS.Cor.textoSutil.resolver(esquema) }
    var acento: Color          { DS.Cor.acento.resolver(esquema) }

    func status(_ s: StatusTarefa) -> Color { DS.Cor.status(s).resolver(esquema) }
}

extension EnvironmentValues {
    var cores: CoresDoAmbiente { CoresDoAmbiente(esquema: colorScheme) }
}
