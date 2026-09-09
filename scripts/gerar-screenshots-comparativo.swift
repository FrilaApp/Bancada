import AppKit
import SwiftUI

// MARK: - Fundo e Hardware

struct DesktopBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.10, green: 0.13, blue: 0.24),
                Color(red: 0.16, green: 0.20, blue: 0.35),
                Color(red: 0.24, green: 0.16, blue: 0.32)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct NotchHardwareBar: View {
    var body: some View {
        ZStack(alignment: .top) {
            Color.black
                .frame(height: 12)
            
            // Simulação da Notch física do MacBook Pro (185pt x 32pt)
            Path { path in
                let notchWidth: CGFloat = 185
                let notchHeight: CGFloat = 32
                let cornerRadius: CGFloat = 8
                let totalWidth: CGFloat = 520
                let startX = (totalWidth - notchWidth) / 2
                
                path.move(to: CGPoint(x: startX - 10, y: 0))
                path.addLine(to: CGPoint(x: startX, y: 0))
                path.addQuadCurve(to: CGPoint(x: startX + cornerRadius, y: cornerRadius), control: CGPoint(x: startX, y: cornerRadius / 2))
                path.addLine(to: CGPoint(x: startX + cornerRadius, y: notchHeight - cornerRadius))
                path.addQuadCurve(to: CGPoint(x: startX + cornerRadius * 2, y: notchHeight), control: CGPoint(x: startX + cornerRadius, y: notchHeight))
                path.addLine(to: CGPoint(x: startX + notchWidth - cornerRadius * 2, y: notchHeight))
                path.addQuadCurve(to: CGPoint(x: startX + notchWidth - cornerRadius, y: notchHeight - cornerRadius), control: CGPoint(x: startX + notchWidth - cornerRadius, y: notchHeight))
                path.addLine(to: CGPoint(x: startX + notchWidth - cornerRadius, y: cornerRadius))
                path.addQuadCurve(to: CGPoint(x: startX + notchWidth, y: 0), control: CGPoint(x: startX + notchWidth, y: cornerRadius / 2))
                path.addLine(to: CGPoint(x: startX + notchWidth + 10, y: 0))
            }
            .fill(Color.black)
            .frame(height: 34)
            
            // Câmera frontal no centro do entalhe
            Circle()
                .fill(Color(white: 0.2))
                .frame(width: 8, height: 8)
                .offset(y: 12)
        }
        .frame(width: 520, height: 34, alignment: .top)
    }
}

// MARK: - Versão 1: Protótipo Inicial (f7efef3)
struct ViewShelfV1: View {
    var body: some View {
        ZStack(alignment: .top) {
            DesktopBackground()
            
            NotchHardwareBar()
                .zIndex(10)
            
            // Shelf inicial: retângulo escuro padrão sem alinhamento com notch físico
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color(red: 0.12, green: 0.12, blue: 0.14))
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(Color.white.opacity(0.20), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.5), radius: 10, y: 6)
                
                HStack(spacing: 12) {
                    Circle()
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 38, height: 38)
                        .overlay(
                            Image(systemName: "touchid")
                                .font(.system(size: 19, weight: .regular))
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("AUTORIZAÇÃO")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))
                        Text("Autorizar git push no Challenge 18")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Text("Pressione")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.white.opacity(0.12)))
                }
                .padding(.horizontal, 16)
                .offset(y: 4)
            }
            .frame(width: 440, height: 72)
            .offset(y: 16) // Conflito visível com o entalhe superior
        }
        .frame(width: 520, height: 180)
        .clipped()
    }
}

// MARK: - Versão 2: Tangência Física com Corte Preto #000000
struct ViewShelfV2: View {
    var body: some View {
        ZStack(alignment: .top) {
            DesktopBackground()
            
            NotchHardwareBar()
                .zIndex(10)
            
            // Shelf com corte superior preto puro #000000 de 32pt
            ZStack(alignment: .top) {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color(red: 0.14, green: 0.14, blue: 0.16))
                    .overlay(
                        // Faixa preta sólida no topo para tangenciar o entalhe físico
                        VStack(spacing: 0) {
                            Color.black
                                .frame(height: 32)
                            Spacer()
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.55), radius: 12, y: 6)
                
                HStack(spacing: 14) {
                    Circle()
                        .fill(Color.white.opacity(0.14))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Image(systemName: "touchid")
                                .font(.system(size: 20, weight: .regular))
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("AUTORIZAÇÃO")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white.opacity(0.6))
                        Text("Autorizar git push no Challenge 18")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Text("Touch ID")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(Color.white.opacity(0.14)))
                }
                .padding(.horizontal, 18)
                .offset(y: 33)
            }
            .frame(width: 440, height: 86)
            .offset(y: 0)
        }
        .frame(width: 520, height: 180)
        .clipped()
    }
}

// MARK: - Versão 3: Degradê 8 Stops & Liquid Glass
struct ViewShelfV3: View {
    var body: some View {
        ZStack(alignment: .top) {
            DesktopBackground()
            
            NotchHardwareBar()
                .zIndex(10)
            
            let notchTangency: CGFloat = 32.0 / 84.0
            
            ZStack(alignment: .top) {
                // Base translúcida com refração de vidro
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color(red: 0.16, green: 0.18, blue: 0.24).opacity(0.82))
                    .overlay(
                        LinearGradient(
                            stops: [
                                .init(color: Color.black.opacity(0.00), location: 0.00),
                                .init(color: Color.black.opacity(0.04), location: notchTangency * 0.15),
                                .init(color: Color.black.opacity(0.12), location: notchTangency * 0.30),
                                .init(color: Color.black.opacity(0.24), location: notchTangency * 0.45),
                                .init(color: Color.black.opacity(0.44), location: notchTangency * 0.60),
                                .init(color: Color.black.opacity(0.68), location: notchTangency * 0.75),
                                .init(color: Color.black.opacity(0.88), location: notchTangency * 0.90),
                                .init(color: Color.black.opacity(1.00), location: notchTangency)
                            ],
                            startPoint: .bottom,
                            endPoint: .top
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(Color.white.opacity(0.24), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.60), radius: 14, y: 7)
                
                HStack(spacing: 14) {
                    Circle()
                        .fill(Color.white.opacity(0.16))
                        .frame(width: 40, height: 40)
                        .overlay(
                            Image(systemName: "touchid")
                                .font(.system(size: 20, weight: .regular))
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("AUTORIZAÇÃO")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.white.opacity(0.65))
                        Text("Autorizar git push no Challenge 18")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Text("Touch ID")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(Color.white.opacity(0.18)))
                }
                .padding(.horizontal, 18)
                .offset(y: 33)
            }
            .frame(width: 440, height: 84)
            .offset(y: 0)
        }
        .frame(width: 520, height: 180)
        .clipped()
    }
}

// MARK: - Versão 4: Polimento Completo de Interação (Commit e501854)
struct ViewShelfV4: View {
    var body: some View {
        ZStack(alignment: .top) {
            DesktopBackground()
            
            NotchHardwareBar()
                .zIndex(10)
            
            let notchTangency: CGFloat = 32.0 / 84.0
            
            ZStack(alignment: .top) {
                // Sombra atmosférica difusa
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.clear)
                    .shadow(color: Color.black.opacity(0.60), radius: 22, x: 0, y: 8)
                
                // Sombra de contato nítida
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.clear)
                    .shadow(color: Color.black.opacity(0.45), radius: 6, x: 0, y: 2)
                
                // Base com Liquid Glass e Fade Easing de 8 stops
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color(red: 0.15, green: 0.17, blue: 0.25).opacity(0.78))
                    .overlay(
                        LinearGradient(
                            stops: [
                                .init(color: Color.black.opacity(0.00), location: 0.00),
                                .init(color: Color.black.opacity(0.04), location: notchTangency * 0.15),
                                .init(color: Color.black.opacity(0.12), location: notchTangency * 0.30),
                                .init(color: Color.black.opacity(0.24), location: notchTangency * 0.45),
                                .init(color: Color.black.opacity(0.44), location: notchTangency * 0.60),
                                .init(color: Color.black.opacity(0.68), location: notchTangency * 0.75),
                                .init(color: Color.black.opacity(0.88), location: notchTangency * 0.90),
                                .init(color: Color.black.opacity(1.00), location: notchTangency)
                            ],
                            startPoint: .bottom,
                            endPoint: .top
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    )
                    // Specular hairline mascarado (1.0pt delineando a base)
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    stops: [
                                        .init(color: Color.white.opacity(0.40), location: 0.0),
                                        .init(color: Color.white.opacity(0.18), location: 0.4),
                                        .init(color: Color.clear, location: 0.65)
                                    ],
                                    startPoint: .bottom,
                                    endPoint: .top
                                ),
                                lineWidth: 1.0
                            )
                    )
                
                // Conteúdo refinado (alinhamento óptico, hit area 44pt, tracking)
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Color.white.opacity(0.16))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.30), lineWidth: 1)
                            )
                        
                        Image(systemName: "touchid")
                            .font(.system(size: 21, weight: .regular))
                            .foregroundColor(.white)
                            .offset(y: -0.5) // Alinhamento óptico
                    }
                    .frame(width: 44, height: 44)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("AUTORIZAÇÃO")
                            .font(.system(size: 9, weight: .bold))
                            .tracking(0.8)
                            .foregroundColor(.white.opacity(0.65))
                        Text("Autorizar git push no Challenge 18")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 5) {
                        Image(systemName: "touchid")
                            .font(.system(size: 11, weight: .semibold))
                        Text("Touch ID")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 7)
                    .background(
                        Capsule()
                            .fill(Color.white.opacity(0.18))
                            .overlay(
                                Capsule()
                                    .stroke(Color.white.opacity(0.32), lineWidth: 0.75)
                            )
                    )
                }
                .padding(.horizontal, 18)
                .offset(y: 33)
            }
            .frame(width: 440, height: 84)
            .offset(y: 0)
        }
        .frame(width: 520, height: 180)
        .clipped()
    }
}

// MARK: - Banner Comparativo Geral (1480x680)
struct ComparativeBannerView: View {
    var body: some View {
        VStack(spacing: 0) {
            // Cabeçalho
            VStack(spacing: 6) {
                HStack {
                    Image(systemName: "slider.horizontal.below.rectangle")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(Color(red: 0.45, green: 0.75, blue: 1.0))
                    Text("ActionShelf · Evolução Visual & Comparativo de Iterações")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    Text("doc-harness / Challenge 18")
                        .font(.system(size: 13, weight: .semibold, design: .monospaced))
                        .foregroundColor(Color.white.opacity(0.6))
                }
                Text("Registro visual contínuo da evolução da Shelf: do protótipo base ao Liquid Glass com mescla de hardware e microinterações")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(Color.white.opacity(0.75))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 32)
            .padding(.top, 28)
            .padding(.bottom, 20)
            .background(Color(red: 0.08, green: 0.09, blue: 0.12))
            
            Divider()
                .background(Color.white.opacity(0.12))
            
            // 4 Colunas Comparativas
            HStack(spacing: 16) {
                coluna(
                    versao: "v1 · Base Notch Shelf",
                    commit: "f7efef3",
                    data: "2026-09-08 19:53",
                    corAcento: Color.gray,
                    view: AnyView(ViewShelfV1()),
                    deltas: [
                        "Retângulo escuro sem blend físico",
                        "Hairline contornando o entalhe",
                        "Sombra única padrão",
                        "Botão biométrico sem alinhamento"
                    ]
                )
                
                coluna(
                    versao: "v2 · Alinhamento Bezel",
                    commit: "d622a3a",
                    data: "2026-09-09 03:36",
                    corAcento: Color.orange,
                    view: AnyView(ViewShelfV2()),
                    deltas: [
                        "Detecção exata (32pt x 185pt)",
                        "Preenchimento preto #000000",
                        "Corte brusco com o corpo",
                        "Elimina invasão sobre a câmera"
                    ]
                )
                
                coluna(
                    versao: "v3 · Fade 8 Stops & Glass",
                    commit: "94a7665",
                    data: "2026-09-09 04:45",
                    corAcento: Color.blue,
                    view: AnyView(ViewShelfV3()),
                    deltas: [
                        "Base nativa em Liquid Glass",
                        "Degradê suave (0% a 100%)",
                        "Transição sem linhas duras",
                        "Refração de fundo do macOS"
                    ]
                )
                
                coluna(
                    versao: "v4 · Polimento Final",
                    commit: "e501854",
                    data: "2026-09-09 05:22",
                    corAcento: Color.green,
                    view: AnyView(ViewShelfV4()),
                    deltas: [
                        "Hairline specular mascarado",
                        "Sombras duplas (contato + difusa)",
                        "Target 44x44pt e offset -0.5pt",
                        "Haptics e SF Symbol morphing"
                    ]
                )
            }
            .padding(24)
            .background(Color(red: 0.05, green: 0.06, blue: 0.08))
            
            Spacer()
        }
        .frame(width: 1480, height: 680)
        .background(Color(red: 0.05, green: 0.06, blue: 0.08))
    }
    
    private func coluna(
        versao: String,
        commit: String,
        data: String,
        corAcento: Color,
        view: AnyView,
        deltas: [String]
    ) -> some View {
        VStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 4) {
                Text(versao)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)
                
                HStack(spacing: 6) {
                    Text(commit)
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(corAcento)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(corAcento.opacity(0.20))
                        .cornerRadius(4)
                    
                    Text(data)
                        .font(.system(size: 10, weight: .regular, design: .monospaced))
                        .foregroundColor(.white.opacity(0.55))
                }
            }
            
            view
                .frame(width: 334, height: 160)
                .clipped()
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                ForEach(deltas, id: \.self) { delta in
                    HStack(alignment: .top, spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 9))
                            .foregroundColor(corAcento)
                            .offset(y: 2)
                        Text(delta)
                            .font(.system(size: 11, weight: .regular))
                            .foregroundColor(.white.opacity(0.85))
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
            .background(Color(white: 0.10))
            .cornerRadius(8)
        }
        .padding(12)
        .background(Color(white: 0.08))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(corAcento.opacity(0.35), lineWidth: 1)
        )
    }
}

// MARK: - Renderização com ImageRenderer
@MainActor
func salvarPNG<V: View>(view: V, tamanho: CGSize, escala: CGFloat = 2.0, destino: String) {
    let renderer = ImageRenderer(content: view.frame(width: tamanho.width, height: tamanho.height))
    renderer.scale = escala
    
    guard let img = renderer.nsImage,
          let tiff = img.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else {
        print("✗ Falha ao renderizar: \(destino)")
        return
    }
    
    do {
        try png.write(to: URL(fileURLWithPath: destino))
        let kb = png.count / 1024
        print("✓ Gerado: \(destino) (\(kb) KB)")
    } catch {
        print("✗ Erro ao salvar \(destino): \(error)")
    }
}

@MainActor
func executar() {
    let baseDir = "/Users/fabriciotosta/Documents/Projetos/Challenge18/doc-harness/04 - Tarefas/Anexos"
    
    salvarPNG(view: ViewShelfV1(), tamanho: CGSize(width: 520, height: 180), destino: "\(baseDir)/actionshelf-v1-base.png")
    salvarPNG(view: ViewShelfV2(), tamanho: CGSize(width: 520, height: 180), destino: "\(baseDir)/actionshelf-v2-notch-tangency.png")
    salvarPNG(view: ViewShelfV3(), tamanho: CGSize(width: 520, height: 180), destino: "\(baseDir)/actionshelf-v3-degrade-8stops.png")
    salvarPNG(view: ViewShelfV4(), tamanho: CGSize(width: 520, height: 180), destino: "\(baseDir)/actionshelf-v4-polimento-final.png")
    salvarPNG(view: ComparativeBannerView(), tamanho: CGSize(width: 1480, height: 680), destino: "\(baseDir)/actionshelf-comparativo-iteracoes.png")
    print("Todas as imagens reais foram geradas.")
}

Task { @MainActor in
    executar()
    exit(0)
}
RunLoop.main.run()
