import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// O log de fatos com indentação, em vez da lista plana do Obsidian.
///
/// Dia → tipo de fato → grupo. Repetição colapsa (ver `Agrupador`), e o nó
/// colapsado abre para mostrar cada ocorrência original: a leitura fica limpa
/// sem que nenhum fato deixe de ser alcançável.
///
/// Fatos de UI exibem cartões comparativos com screenshots fixos das versões
/// iteradas, incluindo metadados dos commits e data.
struct TelaRegistros: View {
    @Environment(\.cores) private var cores
    let arvore: [NoRegistro]
    let naoReconhecidas: [String]
    var midias: [Midia] = []

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
                            Plural.contar(naoReconhecidas.count, "linha", "linhas") + " fora do formato dos hooks",
                            systemImage: "exclamationmark.triangle"
                        )
                    }
                }

                ForEach(arvore) { dia in
                    Section {
                        ForEach(dia.filhos ?? []) { tipo in
                            DisclosureGroup {
                                ForEach(tipo.filhos ?? []) { grupo in
                                    LinhaDeGrupo(no: grupo, midias: midias)
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
    var midias: [Midia] = []

    private var ehFatoDeUI: Bool {
        no.fatos.contains { $0.tipo == "ui" } ||
        no.rotulo.localizedCaseInsensitiveContains("Screenshots") ||
        no.rotulo.localizedCaseInsensitiveContains("ActionShelf")
    }

    private var screenshotsDaShelf: [Midia] {
        midias.filter { $0.especie == .imagem && $0.nome.contains("actionshelf") }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
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

            // Quando o fato for de UI e houver screenshots, renderiza o comparativo visual
            if ehFatoDeUI && !screenshotsDaShelf.isEmpty {
                CartaoComparativoUI(midias: screenshotsDaShelf)
                    .padding(.top, 4)
                    .padding(.bottom, 8)
            }
        }
    }

    /// A contagem à direita saiu de um hook, então fala na voz de fato — que
    /// é o que `LinhaDeValor` já faz. Esta tela desenhava a linha à mão em
    /// `detalhe` (sans), divergindo do resto do app sem que ninguém tivesse
    /// decidido divergir.
    private func linha(rotulo: String, detalhe: String, destacado: Bool) -> some View {
        LinhaDeValor(rotulo, valor: detalhe, destacado: destacado)
            .padding(.vertical, 1)
    }
}

// MARK: - Cartão Comparativo de UI com Screenshots e Metadados
private struct CartaoComparativoUI: View {
    @Environment(\.cores) private var cores
    let midias: [Midia]

    private var bannerComparativo: Midia? {
        midias.first { $0.nome.contains("comparativo") }
    }

    private var versoesIndividuais: [Midia] {
        midias
            .filter { !$0.nome.contains("comparativo") }
            .sorted { $0.nome < $1.nome }
    }

    struct InfoVersao {
        let tag: String
        let titulo: String
        let commit: String
        let data: String
        let delta: String
    }

    private func infoPara(nome: String) -> InfoVersao {
        if nome.contains("v1") {
            return InfoVersao(
                tag: "v1",
                titulo: "Base Notch Shelf",
                commit: "f7efef3",
                data: "2026-09-08 19:53",
                delta: "Retângulo escuro inicial sem mescla física com o entalhe"
            )
        } else if nome.contains("v2") {
            return InfoVersao(
                tag: "v2",
                titulo: "Alinhamento Bezel",
                commit: "d622a3a",
                data: "2026-09-09 03:36",
                delta: "Preenchimento #000000 na tangência física (32pt x 185pt)"
            )
        } else if nome.contains("v3") {
            return InfoVersao(
                tag: "v3",
                titulo: "Fade 8 Stops & Glass",
                commit: "94a7665",
                data: "2026-09-09 04:45",
                delta: "Base Liquid Glass com atenuação de 8 stops até #000000"
            )
        } else {
            return InfoVersao(
                tag: "v4",
                titulo: "Polimento Final",
                commit: "e501854",
                data: "2026-09-09 05:22",
                delta: "Specular mascarado, sombras duplas, hit area 44pt e haptics"
            )
        }
    }

    var body: some View {
        Cartao {
            VStack(alignment: .leading, spacing: DS.Espaco.md) {
                // Cabeçalho do Cartão Comparativo
                HStack(alignment: .center, spacing: DS.Espaco.sm) {
                    Image(systemName: "photo.stack.fill")
                        .font(DS.Icone.fonte(DS.Icone.medio, peso: .semibold))
                        .foregroundStyle(cores.acento)

                    Text("Comparativo Visual de Iterações")
                        .font(DS.Tipografia.secao)
                        .foregroundStyle(cores.texto)

                    Etiqueta(texto: "ActionShelf", cor: cores.acento)
                    Etiqueta(texto: "4 versões iteradas", cor: cores.tipoDeFato("ui"))

                    Spacer()

                    if let banner = bannerComparativo {
                        Button("Abrir em Alta Resolução") {
                            NSWorkspace.shared.open(banner.url)
                        }
                        .buttonStyle(.link)
                        .font(DS.Tipografia.detalhe)
                    }
                }

                // Banner Geral de Comparação
                if let banner = bannerComparativo {
                    VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                        Thumbnail(url: banner.url, altura: 200)
                            .clipShape(RoundedRectangle(cornerRadius: DS.Raio.sm))
                            .overlay(
                                RoundedRectangle(cornerRadius: DS.Raio.sm)
                                    .strokeBorder(cores.borda, lineWidth: 1)
                            )
                            .onTapGesture(count: 2) {
                                NSWorkspace.shared.open(banner.url)
                            }
                            .help("Clique duas vezes para abrir o comparativo completo em alta resolução")
                    }
                }

                // Grade com as 4 Versões Individuais e Metadados de Commits/Data
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: DS.Espaco.sm)], spacing: DS.Espaco.sm) {
                    ForEach(versoesIndividuais) { midia in
                        let info = infoPara(nome: midia.nome)
                        VStack(alignment: .leading, spacing: 6) {
                            Thumbnail(url: midia.url, altura: 80)
                                .clipShape(RoundedRectangle(cornerRadius: DS.Raio.sm))
                                .overlay(
                                    RoundedRectangle(cornerRadius: DS.Raio.sm)
                                        .strokeBorder(cores.borda, lineWidth: 1)
                                )

                            HStack(spacing: 4) {
                                Text(info.tag)
                                    .font(DS.Tipografia.rotulo)
                                    .padding(.horizontal, DS.Espaco.xs)
                                    .padding(.vertical, 1)
                                    .background(cores.superficieSutil, in: RoundedRectangle(cornerRadius: DS.Raio.xs))

                                Text(info.titulo)
                                    .font(DS.Tipografia.detalhe.fonte.weight(.semibold))
                                    .foregroundStyle(cores.texto)
                                    .lineLimit(1)
                            }

                            HStack(spacing: 4) {
                                Text(info.commit)
                                    .font(DS.Tipografia.mono)
                                    .foregroundStyle(cores.acento)

                                Text("·")
                                    .foregroundStyle(cores.textoSutil)

                                Text(info.data)
                                    .font(DS.Tipografia.monoDetalhe)
                                    .foregroundStyle(cores.textoSutil)
                                    .monospacedDigit()
                            }

                            Text(info.delta)
                                .font(DS.Tipografia.detalhe)
                                .foregroundStyle(cores.textoSutil)
                                .lineLimit(2)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(DS.Espaco.sm)
                        .background(cores.superficieSutil, in: RoundedRectangle(cornerRadius: DS.Raio.sm))
                        .onTapGesture(count: 2) {
                            NSWorkspace.shared.open(midia.url)
                        }
                        .contextMenu {
                            Button("Abrir") { NSWorkspace.shared.open(midia.url) }
                            Button("Mostrar no Finder") {
                                NSWorkspace.shared.activateFileViewerSelecting([midia.url])
                            }
                        }
                    }
                }
            }
            .padding(DS.Espaco.md)
        }
    }
}
