import SwiftUI
import AppKit
import VaultKit

/// Grade de mídia do vault, com miniatura real de cada arquivo.
struct TelaGaleria: View {
    @Environment(\.cores) private var cores
    let midias: [Midia]

    @State private var especie: Midia.Especie?

    private var visiveis: [Midia] {
        guard let especie else { return midias }
        return midias.filter { $0.especie == especie }
    }

    private let colunas = [
        GridItem(.adaptive(minimum: DS.Galeria.larguraMinimaCard), spacing: DS.Espaco.md)
    ]

    var body: some View {
        VStack(spacing: 0) {
            barraDeEspecie

            if visiveis.isEmpty {
                Vazio(
                    simbolo: "photo.on.rectangle.angled",
                    titulo: "Nada para mostrar",
                    detalhe: "A galeria lista imagens, vídeos, PDFs e documentos .pages versionados no vault."
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: colunas, spacing: DS.Espaco.md) {
                        ForEach(visiveis) { midia in
                            CartaoDeMidia(midia: midia)
                        }
                    }
                    .padding(DS.Espaco.lg)
                }
            }
        }
    }

    private var barraDeEspecie: some View {
        HStack(spacing: DS.Espaco.sm) {
            filtro(rotulo: "Tudo (\(midias.count))", ativo: especie == nil) { especie = nil }
            ForEach(Midia.Especie.allCases, id: \.self) { e in
                let n = midias.filter { $0.especie == e }.count
                if n > 0 {
                    filtro(rotulo: "\(e.rotulo) (\(n))", ativo: especie == e) {
                        especie = (especie == e) ? nil : e
                    }
                }
            }
            Spacer()
        }
        .padding(DS.Espaco.md)
        .background(cores.superficieSutil)
        .overlay(alignment: .bottom) {
            Rectangle().fill(cores.borda).frame(height: 1)
        }
    }

    private func filtro(rotulo: String, ativo: Bool, acao: @escaping () -> Void) -> some View {
        Button(action: acao) {
            Text(rotulo)
                .font(DS.Tipografia.detalhe)
                .padding(.horizontal, DS.Espaco.md)
                .padding(.vertical, DS.Espaco.xs + 1)
                .background(cores.acento.opacity(ativo ? 0.22 : 0.08), in: Capsule())
                .foregroundStyle(ativo ? cores.acento : cores.textoSutil)
        }
        .buttonStyle(.plain)
    }
}

private struct CartaoDeMidia: View {
    @Environment(\.cores) private var cores
    let midia: Midia

    var body: some View {
        Cartao {
            VStack(alignment: .leading, spacing: 0) {
                Thumbnail(url: midia.url, altura: DS.Galeria.alturaThumbnail)
                    .clipShape(
                        .rect(topLeadingRadius: DS.Raio.md, topTrailingRadius: DS.Raio.md)
                    )

                VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                    Text(midia.nome)
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.texto)
                        .lineLimit(2)

                    Text(pasta)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(DS.Espaco.md)
            }
        }
        // Abre no app padrão do macOS — para um `.pages`, o próprio Pages.
        .onTapGesture(count: 2) { NSWorkspace.shared.open(midia.url) }
        .contextMenu {
            Button("Abrir") { NSWorkspace.shared.open(midia.url) }
            Button("Mostrar no Finder") {
                NSWorkspace.shared.activateFileViewerSelecting([midia.url])
            }
        }
        .help(midia.caminhoRelativo)
    }

    private var pasta: String {
        let p = (midia.caminhoRelativo as NSString).deletingLastPathComponent
        return p.isEmpty ? "raiz do vault" : p
    }
}
