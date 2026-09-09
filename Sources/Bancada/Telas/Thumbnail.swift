import SwiftUI
import QuickLookThumbnailing
import AppKit

/// Miniatura gerada pelo QuickLook.
///
/// É a vantagem concreta de ser um app nativo: o mesmo mecanismo que o Finder
/// usa gera preview de imagem, vídeo, PDF **e `.pages`** sem uma linha de
/// decodificação. Um `.pages` é um bundle proprietário — nenhum navegador
/// consegue mostrá-lo, então a galeria da web sempre terá um ícone genérico
/// onde a Bancada mostra a primeira página do documento.
struct Thumbnail: View {
    @Environment(\.cores) private var cores
    let url: URL
    let altura: CGFloat

    @State private var imagem: NSImage?
    @State private var falhou = false

    var body: some View {
        ZStack {
            if let imagem {
                Image(nsImage: imagem)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                cores.superficieSutil
                if falhou {
                    Image(systemName: "doc")
                        .font(.system(size: 20, weight: .light))
                        .foregroundStyle(cores.textoSutil)
                } else {
                    ProgressView().controlSize(.small)
                }
            }
        }
        .frame(height: altura)
        .frame(maxWidth: .infinity)
        .clipped()
        .task(id: url) { await gerar() }
    }

    private func gerar() async {
        let escala = NSScreen.main?.backingScaleFactor ?? 2
        let pedido = QLThumbnailGenerator.Request(
            fileAt: url,
            size: CGSize(width: 320, height: altura * 2),
            scale: escala,
            representationTypes: .all
        )

        do {
            let r = try await QLThumbnailGenerator.shared.generateBestRepresentation(for: pedido)
            imagem = r.nsImage
        } catch {
            falhou = true
        }
    }
}
