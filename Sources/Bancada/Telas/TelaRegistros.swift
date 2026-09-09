import SwiftUI
import VaultKit

/// O log de fatos com indentação, em vez da lista plana do Obsidian.
///
/// Dia → tipo de fato → grupo. Repetição colapsa (ver `Agrupador`), e o nó
/// colapsado abre para mostrar cada ocorrência original: a leitura fica limpa
/// sem que nenhum fato deixe de ser alcançável.
struct TelaRegistros: View {
    @Environment(\.cores) private var cores
    let arvore: [NoRegistro]
    let naoReconhecidas: [String]

    var body: some View {
        if arvore.isEmpty {
            Vazio(
                simbolo: "tray",
                titulo: "Nenhum fato registrado",
                detalhe: "Os hooks do Git escrevem aqui a cada commit. Um dia sem registro é um dado, não um erro."
            )
        } else {
            List {
                if !naoReconhecidas.isEmpty {
                    Section {
                        ForEach(naoReconhecidas, id: \.self) { linha in
                            Text(linha)
                                .font(DS.Tipografia.mono)
                                .foregroundStyle(cores.textoSutil)
                        }
                    } header: {
                        Label(
                            "\(naoReconhecidas.count) linha(s) fora do formato dos hooks",
                            systemImage: "exclamationmark.triangle"
                        )
                    }
                }

                ForEach(arvore) { dia in
                    Section {
                        ForEach(dia.filhos ?? []) { tipo in
                            DisclosureGroup {
                                ForEach(tipo.filhos ?? []) { grupo in
                                    LinhaDeGrupo(no: grupo)
                                }
                            } label: {
                                HStack(spacing: DS.Espaco.sm) {
                                    MarcadorDeTipo(tipo: tipo.rotulo)
                                    Text(tipo.detalhe)
                                        .font(DS.Tipografia.detalhe)
                                        .foregroundStyle(cores.textoSutil)
                                }
                            }
                        }
                    } header: {
                        HStack {
                            Text(dia.rotulo).font(DS.Tipografia.secao)
                            Spacer()
                            Text(dia.detalhe)
                                .font(DS.Tipografia.detalhe)
                                .foregroundStyle(cores.textoSutil)
                        }
                    }
                }
            }
            .listStyle(.inset)
        }
    }
}

private struct LinhaDeGrupo: View {
    @Environment(\.cores) private var cores
    let no: NoRegistro

    var body: some View {
        if no.ehFolha {
            linha(rotulo: no.rotulo, detalhe: no.detalhe, destacado: false)
        } else {
            DisclosureGroup {
                ForEach(no.filhos ?? []) { filho in
                    linha(rotulo: filho.rotulo, detalhe: filho.detalhe, destacado: false)
                        .padding(.leading, DS.Espaco.md)
                }
            } label: {
                linha(rotulo: no.rotulo, detalhe: no.detalhe, destacado: true)
            }
        }
    }

    private func linha(rotulo: String, detalhe: String, destacado: Bool) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.md) {
            Text(rotulo)
                .font(DS.Tipografia.corpo)
                .foregroundStyle(cores.texto)
                .fontWeight(destacado ? .medium : .regular)
                .lineLimit(2)
            Spacer(minLength: DS.Espaco.md)
            Text(detalhe)
                .font(DS.Tipografia.detalhe)
                .foregroundStyle(cores.textoSutil)
                .monospacedDigit()
        }
        .padding(.vertical, 1)
    }
}
