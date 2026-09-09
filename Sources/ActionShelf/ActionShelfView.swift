import SwiftUI

public struct ActionShelfView: View {
    let reason: String
    let isTestMode: Bool
    let onComplete: (Bool) -> Void

    @StateObject private var biometrics = BiometricsService()
    @State private var isExpanded: Bool = false
    @State private var shakeOffset: CGFloat = 0
    @State private var iconScale: CGFloat = 1.0
    @State private var isHovered: Bool = false
    @State private var isBadgeHovered: Bool = false
    @State private var isBadgePressed: Bool = false

    @Namespace private var shelfNamespace
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private let notch = NotchDetector.current()

    public init(reason: String, isTestMode: Bool = false, onComplete: @escaping (Bool) -> Void) {
        self.reason = reason
        self.isTestMode = isTestMode
        self.onComplete = onComplete
    }

    public var body: some View {
        VStack(spacing: 0) {
            shelfContainer
            Spacer()
        }
        .frame(width: 440, height: 120, alignment: .top)
        .onAppear {
            iniciarCicloDeApresentacao()
        }
    }

    // MARK: - Container de Vidro (GlassEffectContainer)

    @ViewBuilder
    private var shelfContainer: some View {
        if #available(macOS 26, iOS 26, *) {
            GlassEffectContainer(spacing: 14) {
                shelfBase
            }
        } else {
            shelfBase
        }
    }

    private let shelfBodyHeight: CGFloat = 52

    private var currentHeight: CGFloat {
        isExpanded ? (notch.notchHeight + shelfBodyHeight) : notch.notchHeight
    }

    private var notchLocation: CGFloat {
        guard currentHeight > 0 else { return 1.0 }
        return isExpanded ? (notch.notchHeight / currentHeight) : 1.0
    }

    // MARK: - Degradê de Mescla com o Bezel (8 stops partindo da borda inferior em 0%)

    private var bezelBlendGradient: LinearGradient {
        // Ponto de tangência da Notch física em coordenadas de baixo para cima (0.0 = borda inferior, 1.0 = topo)
        let notchTangency = isExpanded ? min(1.0, max(0.0, shelfBodyHeight / currentHeight)) : 0.0

        return LinearGradient(
            stops: [
                .init(color: Color.black.opacity(0.00), location: 0.00),                      // Stop 1: Borda inferior da Shelf (0% opacidade)
                .init(color: Color.black.opacity(0.04), location: notchTangency * 0.15),       // Stop 2: Início sutil do fade
                .init(color: Color.black.opacity(0.12), location: notchTangency * 0.30),       // Stop 3: Transição suave
                .init(color: Color.black.opacity(0.24), location: notchTangency * 0.45),       // Stop 4: Curva perceptual intermediária
                .init(color: Color.black.opacity(0.44), location: notchTangency * 0.60),       // Stop 5: Meia-densidade
                .init(color: Color.black.opacity(0.68), location: notchTangency * 0.75),       // Stop 6: Escurecimento progressivo
                .init(color: Color.black.opacity(0.88), location: notchTangency * 0.90),       // Stop 7: Aproximação da tangência
                .init(color: Color.black.opacity(1.00), location: max(notchTangency, 0.001))   // Stop 8: Tangência física do Notch (#000000 a 100%)
            ],
            startPoint: .bottom,
            endPoint: .top
        )
    }

    // MARK: - Superfície Base da Shelf com Liquid Glass & Bezel Blend

    private var shelfBase: some View {
        ZStack(alignment: .top) {
            // Camada Bezel Blend: degradê em fade com 8 stops partindo da borda inferior (0% opacidade) até a tangência do Notch (#000000)
            bezelBlendGradient
                .clipShape(shelfShape)

            // Conteúdo interno da Shelf
            VStack(spacing: 0) {
                // Espaço reservado para a altura do Notch físico (oculto pela mescla com o bezel)
                Color.clear
                    .frame(height: notch.notchHeight)

                // Corpo visível da Shelf posicionado no Liquid Glass
                if isExpanded {
                    HStack(spacing: 14) {
                        // Badge Biométrico em Vidro Interativo
                        biometricGlassBadge

                        // Informações da ação com tipografia refinada e transição numérica
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Challenge 18 · Action Shelf")
                                .font(.system(size: 10, weight: .bold, design: .rounded))
                                .tracking(0.6)
                                .foregroundStyle(.secondary)
                                .textCase(.uppercase)

                            Text(statusMessage)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(.white)
                                .lineLimit(1)
                                .contentTransition(.numericText(countsDown: false))
                        }

                        Spacer()
                    }
                    .padding(.horizontal, 20)
                    .frame(height: shelfBodyHeight)
                    .transition(
                        reduceMotion
                            ? .opacity
                            : .asymmetric(
                                insertion: .scale(scale: 0.94).combined(with: .opacity),
                                removal: .opacity
                            )
                    )
                }
            }
        }
        .frame(
            width: isExpanded ? 400 : notch.notchWidth,
            height: currentHeight
        )
        .offset(x: shakeOffset)
        .overlay(
            // Borda com iluminação direcional hairline apenas abaixo da linha do Notch Físico
            shelfShape
                .strokeBorder(currentBorderGradient, lineWidth: 1.0)
                .mask {
                    LinearGradient(
                        stops: [
                            .init(color: .clear, location: 0.0),
                            .init(color: .clear, location: notchLocation),
                            .init(color: .white, location: min(1.0, notchLocation + 0.05))
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                }
        )
        // Sombras em duas camadas (profundidade volumétrica):
        // 1. Sombra de contato nítida definindo o corte contra qualquer fundo
        .shadow(color: Color.black.opacity(0.35), radius: 6, x: 0, y: 2)
        // 2. Sombra difusa atmosférica colorida pelo estado da biometria
        .shadow(color: currentShadowColor, radius: isHovered ? 26 : 18, x: 0, y: isHovered ? 8 : 6)
        .scaleEffect(isHovered && !reduceMotion ? 1.008 : 1.0)
        .animation(Theme.hoverSpring, value: isHovered)
        .onHover { isHovered = $0 }
        .modifier(
            ShelfGlassModifier(
                shape: shelfShape,
                tint: currentGlassTint,
                glassID: "shelfBaseContainer",
                namespace: shelfNamespace
            )
        )
        .compositingGroup()
        .animation(Theme.contentSpring, value: biometrics.state)
    }

    // MARK: - Selo Biométrico em Liquid Glass Interativo com Alinhamento Óptico & Hit Area 44pt

    @ViewBuilder
    private var biometricGlassBadge: some View {
        ZStack {
            if #available(macOS 26, iOS 26, *) {
                Circle()
                    .frame(width: 38, height: 38)
                    .glassEffect(.regular.tint(iconGlassTint).interactive(), in: Circle())
                    .overlay(
                        Circle()
                            .strokeBorder(iconBorderColor, lineWidth: 1.0)
                    )
            } else {
                Circle()
                    .fill(iconBackgroundColor)
                    .frame(width: 38, height: 38)
                    .overlay(
                        Circle()
                            .strokeBorder(iconBorderColor, lineWidth: 1.0)
                    )
            }

            // Ícone SF Symbol com transição de substituição fluida e ajuste óptico de centro
            Image(systemName: iconName)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(iconForegroundColor)
                .contentTransition(.symbolEffect(.replace))
                .offset(y: iconName == "touchid" ? -0.5 : 0)
                .symbolEffect(.pulse, isActive: biometrics.state == .authenticating)
                .scaleEffect(iconScale * (isBadgePressed ? 0.92 : 1.0))
        }
        .frame(width: 44, height: 44) // Área de toque mínima acessível (44x44pt)
        .contentShape(Circle())
        .scaleEffect(isBadgeHovered && !reduceMotion ? 1.05 : 1.0)
        .animation(Theme.hoverSpring, value: isBadgeHovered)
        .animation(Theme.badgePressSpring, value: isBadgePressed)
        .onHover { isBadgeHovered = $0 }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isBadgePressed = true }
                .onEnded { _ in isBadgePressed = false }
        )
    }

    private var shelfShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: 0,
            bottomLeadingRadius: 24,
            bottomTrailingRadius: 24,
            topTrailingRadius: 0,
            style: .continuous
        )
    }

    // MARK: - Ciclo de Interação & Física

    private func iniciarCicloDeApresentacao() {
        // Expansão orgânica a partir da Notch com física de mola
        withAnimation(Theme.notchStretch) {
            isExpanded = true
        }

        Task {
            // Aguarda a mola assentar antes de disparar a biometria
            try? await Task.sleep(nanoseconds: 350_000_000)

            if isTestMode {
                // Modo teste: simula sucesso após 1.2s
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                await finalizarComFeedback(aprovado: true)
            } else {
                let aprovado = await biometrics.authenticate(reason: reason)
                await finalizarComFeedback(aprovado: aprovado)
            }
        }
    }

    @MainActor
    private func finalizarComFeedback(aprovado: Bool) async {
        if aprovado {
            // Haptic físico no trackpad (confirmação tátil instantânea)
            triggerHaptic(.levelChange)

            // Micro-impacto elástico de confirmação no badge
            if !reduceMotion {
                withAnimation(Theme.punchPulse) {
                    iconScale = 1.15
                }
                try? await Task.sleep(nanoseconds: 180_000_000)
                withAnimation(Theme.morphSettle) {
                    iconScale = 1.0
                }
            }
            try? await Task.sleep(nanoseconds: 600_000_000)
        } else {
            // Haptic de aviso no trackpad
            triggerHaptic(.alignment)

            // Shake oscilatório de recusa com amortecimento progressivo e micro-pulsos hápticos
            if !reduceMotion {
                withAnimation(Theme.shakeDamped) {
                    shakeOffset = -8
                }
                triggerHaptic(.alignment)
                try? await Task.sleep(nanoseconds: 100_000_000)
                withAnimation(Theme.shakeDamped) {
                    shakeOffset = 8
                }
                try? await Task.sleep(nanoseconds: 100_000_000)
                withAnimation(Theme.shakeDamped) {
                    shakeOffset = -4
                }
                try? await Task.sleep(nanoseconds: 100_000_000)
                withAnimation(Theme.shakeDamped) {
                    shakeOffset = 0
                }
            }
            try? await Task.sleep(nanoseconds: 600_000_000)
        }

        // Retração de volta para a Notch
        withAnimation(Theme.notchRetract) {
            isExpanded = false
        }

        try? await Task.sleep(nanoseconds: 300_000_000)
        onComplete(aprovado)
    }

    private func triggerHaptic(_ pattern: NSHapticFeedbackManager.FeedbackPattern) {
        NSHapticFeedbackManager.defaultPerformer.perform(pattern, performanceTime: .default)
    }

    // MARK: - Propriedades Dinâmicas de Estilo

    private var statusMessage: String {
        switch biometrics.state {
        case .idle, .authenticating:
            return reason.isEmpty ? "Aguardando Touch ID..." : reason
        case .authorized:
            return "Identidade confirmada."
        case .rejected(let msg):
            return "Não autorizado: \(msg)"
        }
    }

    private var iconName: String {
        switch biometrics.state {
        case .idle, .authenticating:
            return "touchid"
        case .authorized:
            return "checkmark"
        case .rejected:
            return "xmark"
        }
    }

    private var currentGlassTint: Color {
        switch biometrics.state {
        case .idle, .authenticating:
            return Theme.glassCyan
        case .authorized:
            return Theme.glassSuccess
        case .rejected:
            return Theme.glassAlert
        }
    }

    private var iconGlassTint: Color {
        switch biometrics.state {
        case .idle, .authenticating:
            return Color.cyan.opacity(0.20)
        case .authorized:
            return Theme.successGlow.opacity(0.30)
        case .rejected:
            return Theme.alertGlow.opacity(0.30)
        }
    }

    private var iconBorderColor: Color {
        switch biometrics.state {
        case .idle, .authenticating:
            return Color.cyan.opacity(0.35)
        case .authorized:
            return Theme.successGlow.opacity(0.60)
        case .rejected:
            return Theme.alertGlow.opacity(0.60)
        }
    }

    private var iconBackgroundColor: Color {
        switch biometrics.state {
        case .idle, .authenticating:
            return Color.white.opacity(0.12)
        case .authorized:
            return Theme.successGlow.opacity(0.25)
        case .rejected:
            return Theme.alertGlow.opacity(0.25)
        }
    }

    private var iconForegroundColor: Color {
        switch biometrics.state {
        case .idle, .authenticating:
            return .cyan
        case .authorized:
            return Theme.successGlow
        case .rejected:
            return Theme.alertGlow
        }
    }

    private var currentBorderGradient: LinearGradient {
        switch biometrics.state {
        case .authorized:
            return LinearGradient(
                colors: [Theme.successGlow.opacity(0.85), Color.white.opacity(0.4), Theme.successGlow.opacity(0.85)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .rejected:
            return LinearGradient(
                colors: [Theme.alertGlow, Color.white.opacity(0.3), Theme.alertGlow],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        default:
            return LinearGradient(
                colors: [Color.white.opacity(0.30), Theme.borderGlow, Color.white.opacity(0.18)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    private var currentShadowColor: Color {
        switch biometrics.state {
        case .authorized:
            return Theme.successGlow.opacity(0.45)
        case .rejected:
            return Theme.alertGlow.opacity(0.45)
        default:
            return Color.black.opacity(0.45)
        }
    }
}

// MARK: - Modificador de Fundo Liquid Glass com Fallback

struct ShelfGlassModifier<S: Shape>: ViewModifier {
    let shape: S
    let tint: Color?
    let glassID: String?
    let namespace: Namespace.ID?

    func body(content: Content) -> some View {
        if #available(macOS 26, iOS 26, *) {
            let glass = Glass.regular
            let tintedGlass = tint.map { glass.tint($0) } ?? glass
            if let glassID, let namespace {
                content
                    .glassEffect(tintedGlass, in: shape)
                    .glassEffectID(glassID, in: namespace)
            } else {
                content
                    .glassEffect(tintedGlass, in: shape)
            }
        } else {
            content
                .background {
                    shape
                        .fill(.ultraThinMaterial)
                        .overlay {
                            if let tint {
                                shape.fill(tint)
                            }
                        }
                }
        }
    }
}
