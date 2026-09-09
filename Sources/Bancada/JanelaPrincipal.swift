import SwiftUI
import AppKit
import VaultKit

struct JanelaPrincipal: View {
    @Environment(\.cores) private var cores
    @State private var estado = EstadoDaBancada()

    var body: some View {
        NavigationSplitView {
            barraLateral
                .navigationSplitViewColumnWidth(min: 180, ideal: 210, max: 260)
        } detail: {
            conteudo
                .frame(minWidth: 520, minHeight: 400)
                .toolbar { toolbar }
        }
        .background(cores.fundo)
    }

    // MARK: - Barra lateral

    private var barraLateral: some View {
        List(selection: Binding(
            get: { estado.secao },
            set: { estado.secao = $0 ?? .registros }
        )) {
            ForEach(Secao.allCases) { secao in
                Label(secao.titulo, systemImage: secao.simbolo)
                    .badge(distintivo(secao))
                    .tag(secao)
            }
        }
        .safeAreaInset(edge: .bottom) { rodape }
    }

    private func distintivo(_ secao: Secao) -> Int {
        guard let vault = estado.vault else { return 0 }
        switch secao {
        case .registros:  return vault.fatos.count
        case .tarefas:    return vault.tarefas.count
        case .galeria:    return vault.midias.count
        case .documentos: return estado.documentos.count
        case .diario:     return estado.diarios.count
        case .saude:      return vault.invalidas.count + vault.fatosNaoReconhecidos.count
        }
    }

    private var rodape: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.xs) {
            Divider()
            if let raiz = estado.raiz {
                Text(raiz.lastPathComponent)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.texto)
                    .lineLimit(1)
            }
            if let ultima = estado.ultimaLeitura {
                Text("lido às \(ultima.formatted(date: .omitted, time: .standard))")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .monospacedDigit()
            }
        }
        .padding(.horizontal, DS.Espaco.md)
        .padding(.bottom, DS.Espaco.sm)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Conteúdo

    @ViewBuilder
    private var conteudo: some View {
        if let erro = estado.erro {
            Vazio(simbolo: "exclamationmark.triangle", titulo: "Não deu para ler o vault", detalhe: erro)
        } else if estado.vault == nil {
            Vazio(
                simbolo: "folder.badge.questionmark",
                titulo: "Nenhum vault aberto",
                detalhe: "Escolha a pasta do doc-harness — a mesma que você abre no Obsidian."
            )
        } else {
            switch estado.secao {
            case .registros:
                TelaRegistros(
                    arvore: estado.arvoreDeRegistros,
                    naoReconhecidas: estado.vault?.fatosNaoReconhecidos ?? [],
                    midias: estado.vault?.midias ?? []
                )
            case .tarefas:
                TelaTarefas(tarefas: estado.tarefas) { nota in
                    NSWorkspace.shared.activateFileViewerSelecting([nota.url])
                }
            case .galeria:
                TelaGaleria(midias: estado.vault?.midias ?? [])
            case .documentos:
                TelaDocumentos(documentos: estado.documentos, vault: estado.vault)
            case .diario:
                TelaDiario(diarios: estado.diarios, fatos: estado.vault?.fatos ?? [])
            case .saude:
                TelaSaude(vault: estado.vault)
            }
        }
    }

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .navigation) {
            Text(estado.secao.titulo).font(DS.Tipografia.secao)
        }
        ToolbarItem {
            Button {
                escolherPasta()
            } label: {
                Label("Escolher vault", systemImage: "folder")
            }
            .help("Abrir outra pasta como vault")
        }
        ToolbarItem {
            Button {
                estado.recarregar()
            } label: {
                Label("Recarregar", systemImage: "arrow.clockwise")
            }
            .keyboardShortcut("r")
            .help("Reler o vault do disco")
        }
    }

    private func escolherPasta() {
        let painel = NSOpenPanel()
        painel.canChooseDirectories = true
        painel.canChooseFiles = false
        painel.allowsMultipleSelection = false
        painel.prompt = "Abrir vault"
        painel.message = "Escolha a pasta do doc-harness."

        guard painel.runModal() == .OK, let url = painel.url else { return }
        estado.raiz = url
    }
}
