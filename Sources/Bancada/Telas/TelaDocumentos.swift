import SwiftUI
import AppKit
import VaultKit

/// Os entregáveis CBL: o `.pages` original e o `.md` que o pipeline do
/// doc-harness gera ao lado dele, lado a lado.
///
/// A dupla existe porque o Git só sabe dizer que um `.pages` mudou — o `.md`
/// derivado é o que mostra *o que* mudou no texto. Ver essa relação explícita
/// é o que torna o par compreensível.
struct TelaDocumentos: View {
    @Environment(\.cores) private var cores
    let documentos: [Midia]
    let vault: Vault?

    @State private var selecionado: Midia.ID?

    private var atual: Midia? {
        documentos.first { $0.id == selecionado } ?? documentos.first
    }

    private var derivado: Nota? {
        guard let caminho = atual?.caminhoDerivado else { return nil }
        return vault?.nota(caminhoRelativo: caminho)
    }

    var body: some View {
        if documentos.isEmpty {
            Vazio(
                simbolo: "doc.richtext",
                titulo: "Nenhum documento .pages",
                detalhe: "Os entregáveis do ciclo ficam em 01 - CBL/Desafios/<C##>/Documentos/."
            )
        } else {
            HSplitView {
                List(documentos, selection: $selecionado) { doc in
                    VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                        Text(doc.nome).font(DS.Tipografia.corpo)
                        Text(doc.caminhoRelativo)
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                            .lineLimit(1)
                    }
                    .tag(doc.id)
                }
                .frame(minWidth: 220, idealWidth: 260)

                painelDoDocumento
                    .frame(minWidth: 380)
            }
        }
    }

    @ViewBuilder
    private var painelDoDocumento: some View {
        if let atual {
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                    HStack(alignment: .top, spacing: DS.Espaco.lg) {
                        Cartao {
                            Thumbnail(url: atual.url, altura: 180)
                                .clipShape(RoundedRectangle(cornerRadius: DS.Raio.md))
                        }
                        .frame(width: 200)

                        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                            Text(atual.nome).font(DS.Tipografia.titulo)
                            Text(atual.caminhoRelativo)
                                .font(DS.Tipografia.mono)
                                .foregroundStyle(cores.textoSutil)

                            HStack(spacing: DS.Espaco.sm) {
                                Button("Abrir no Pages") { NSWorkspace.shared.open(atual.url) }
                                Button("Mostrar no Finder") {
                                    NSWorkspace.shared.activateFileViewerSelecting([atual.url])
                                }
                            }
                            .controlSize(.small)
                        }
                        Spacer()
                    }

                    Divider()

                    if let derivado {
                        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                            Text("Markdown derivado").font(DS.Tipografia.secao)
                            SeloSomenteLeitura(tipo: .documentoDerivado)
                            Text(derivado.corpo)
                                .font(DS.Tipografia.corpo)
                                .textSelection(.enabled)
                                .frame(maxWidth: .infinity, alignment: .leading)
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
                .padding(DS.Espaco.lg)
            }
        } else {
            Vazio(simbolo: "doc", titulo: "Escolha um documento")
        }
    }
}
