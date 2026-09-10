import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// Tudo que o vault versiona e não é nota: imagens, vídeos, PDFs e os `.pages`
/// dos entregáveis CBL — com miniatura real e um painel de detalhe.
///
/// Antes eram duas telas. A Galeria já listava os `.pages` (o filtro
/// "Documentos Pages" sempre esteve ali) e a tela de Documentos só acrescentava
/// o painel com o Markdown derivado ao lado. Agora a grade é o navegador único
/// e o painel se adapta ao que está selecionado: para um `.pages`, ele traz o
/// `.md` derivado, que é o que o Git não sabe mostrar sozinho.
struct TelaAcervo: View {
    @Environment(\.cores) private var cores
    let midias: [Midia]
    let vault: Vault?

    @State private var especie: Midia.Especie?
    @State private var selecionada: Midia.ID?

    private var visiveis: [Midia] {
        guard let especie else { return midias }
        return midias.filter { $0.especie == especie }
    }

    private var atual: Midia? {
        visiveis.first { $0.id == selecionada }
    }

    private let colunas = [
        GridItem(.adaptive(minimum: DS.Galeria.larguraMinimaCard), spacing: DS.Espaco.md)
    ]

    var body: some View {
        HSplitView {
            VStack(spacing: 0) {
                barraDeEspecie

                if visiveis.isEmpty {
                    Vazio(
                        simbolo: "photo.on.rectangle.angled",
                        titulo: "Nada para mostrar",
                        detalhe: "O acervo lista imagens, vídeos, PDFs e documentos .pages versionados no vault."
                    )
                } else {
                    ScrollView {
                        LazyVGrid(columns: colunas, spacing: DS.Espaco.md) {
                            ForEach(visiveis) { midia in
                                CartaoDeMidia(midia: midia, selecionada: midia.id == selecionada)
                                    .onTapGesture { selecionada = midia.id }
                            }
                        }
                        .padding(DS.Espaco.lg)
                    }
                }
            }
            .frame(minWidth: DS.Galeria.larguraMinimaCard * 2)

            PainelDeMidia(midia: atual, vault: vault)
                .frame(
                    minWidth: DS.Acervo.larguraMinimaDoPainel,
                    idealWidth: DS.Acervo.larguraIdealDoPainel
                )
        }
    }

    private var barraDeEspecie: some View {
        BarraDePainel {
            Pilula("Tudo (\(midias.count))", ativo: especie == nil) { trocar(para: nil) }
            ForEach(Midia.Especie.allCases, id: \.self) { e in
                let n = midias.filter { $0.especie == e }.count
                if n > 0 {
                    Pilula("\(e.rotulo) (\(n))", ativo: especie == e) {
                        trocar(para: especie == e ? nil : e)
                    }
                }
            }
            Spacer()
        }
    }

    /// Trocar de filtro não pode deixar o painel mostrando um arquivo que
    /// sumiu da grade.
    private func trocar(para nova: Midia.Especie?) {
        especie = nova
        if let selecionada, !visiveis.contains(where: { $0.id == selecionada }) {
            self.selecionada = nil
        }
    }
}

private struct CartaoDeMidia: View {
    @Environment(\.cores) private var cores
    let midia: Midia
    var selecionada = false

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
        .overlay(
            RoundedRectangle(cornerRadius: DS.Raio.md)
                .strokeBorder(selecionada ? cores.acento : .clear, lineWidth: DS.Traco.selecao)
        )
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

/// O detalhe do item selecionado.
///
/// Para um `.pages`, mostra o Markdown que o pipeline do doc-harness gera ao
/// lado dele. A dupla existe porque o Git só sabe dizer que um `.pages` mudou —
/// o `.md` derivado é o que mostra *o que* mudou no texto.
private struct PainelDeMidia: View {
    @Environment(\.cores) private var cores
    let midia: Midia?
    let vault: Vault?

    private var derivado: Nota? {
        guard let caminho = midia?.caminhoDerivado else { return nil }
        return vault?.nota(caminhoRelativo: caminho)
    }

    var body: some View {
        if let midia {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                    Cartao {
                        Thumbnail(url: midia.url, altura: DS.Acervo.alturaDaPreviaGrande)
                            .clipShape(RoundedRectangle(cornerRadius: DS.Raio.md))
                    }

                    VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                        Text(midia.nome).font(DS.Tipografia.titulo)
                        Text(midia.caminhoRelativo)
                            .font(DS.Tipografia.mono)
                            .foregroundStyle(cores.textoSutil)
                            .textSelection(.enabled)

                        HStack(spacing: DS.Espaco.sm) {
                            Button(midia.especie == .pages ? "Abrir no Pages" : "Abrir") {
                                NSWorkspace.shared.open(midia.url)
                            }
                            Button("Mostrar no Finder") {
                                NSWorkspace.shared.activateFileViewerSelecting([midia.url])
                            }
                        }
                        .controlSize(.small)
                    }

                    if midia.especie == .pages {
                        Divider()
                        markdownDerivado
                    }
                }
                .padding(DS.Espaco.lg)
            }
            .background(cores.fundo)
        } else {
            Vazio(
                simbolo: "square.grid.2x2",
                titulo: "Nada selecionado",
                detalhe: "Clique num item da grade para ver o detalhe. Duplo clique abre no app do macOS."
            )
            .background(cores.fundo)
        }
    }

    @ViewBuilder
    private var markdownDerivado: some View {
        if let derivado {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                RotuloDeSecao("Markdown derivado")
                SeloSomenteLeitura(tipo: .documentoDerivado)
                // O derivado de um .pages é narrativa como qualquer nota:
                // mesma superfície de leitura, mesmo tratamento.
                TextoDeNota(derivado.corpo)
            }
        } else {
            // Ausência com causa provável, não um espaço em branco.
            Vazio(
                simbolo: "arrow.triangle.2.circlepath",
                titulo: "Sem Markdown derivado",
                detalhe: "Rode /documento no Claude Code para converter este .pages — ou confira se o Pages está instalado."
            )
            .frame(height: 160)
        }
    }
}
