import SwiftUI
import AppKit
import VaultKit
import DesignSystem

struct JanelaPrincipal: View {
    @Environment(\.cores) private var cores
    @State private var estado = EstadoDaBancada()
    @State private var mostrandoAjustes = false

    var body: some View {
        NavigationSplitView {
            barraLateral
                .navigationSplitViewColumnWidth(
                    min: DS.BarraLateral.larguraMinima,
                    ideal: DS.BarraLateral.larguraIdeal,
                    max: DS.BarraLateral.larguraMaxima
                )
        } detail: {
            conteudo
                .frame(
                    minWidth: DS.Janela.larguraMinimaDoDetalhe,
                    minHeight: DS.Janela.alturaMinimaDoConteudo
                )
                .toolbar { toolbar }
        }
        .background(cores.fundo)
        .onReceive(NotificationCenter.default.publisher(for: .abrirAjustes)) { _ in
            mostrandoAjustes.toggle()
        }
    }

    // MARK: - Barra lateral

    private var barraLateral: some View {
        List(selection: selecao) {
            ForEach(Secao.conteudo) { secao in
                linha(secao)
            }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            barraUtilitaria
        }
    }

    /// Barra utilitária no rodapé da barra lateral.
    ///
    /// Separa a navegação principal (conteúdo) das ferramentas de sistema (ajustes e status).
    /// À esquerda: indicador sutil de integridade do vault.
    /// À direita: botão de engrenagem para Ajustes & Diagnóstico (⌘,).
    private var barraUtilitaria: some View {
        VStack(spacing: 0) {
            Divisor()
            HStack(spacing: DS.Espaco.xs) {
                indicadorDeStatus
                Spacer(minLength: DS.Espaco.xs)
                botaoAjustes
            }
            .padding(.horizontal, DS.Espaco.sm)
            .frame(height: DS.BarraLateral.alturaDoRodape)
            .background(cores.cromo)
        }
    }

    @ViewBuilder
    private var indicadorDeStatus: some View {
        Button {
            mostrandoAjustes.toggle()
        } label: {
            HStack(spacing: DS.Espaco.xs + 2) {
                Circle()
                    .fill(corDoStatus)
                    .frame(width: 7, height: 7)
                Text(textoDoStatus)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .lineLimit(1)
            }
            .padding(.horizontal, DS.Espaco.xs)
            .padding(.vertical, DS.Espaco.xs)
            .contentShape(Rectangle())
        }
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
        .help(ajudaDoStatus)
    }

    private var botaoAjustes: some View {
        Button {
            mostrandoAjustes.toggle()
        } label: {
            Image(systemName: "gearshape")
                .font(DS.Icone.fonte(DS.Icone.medio))
                .foregroundStyle(mostrandoAjustes ? cores.acento : cores.textoSutil)
                .frame(width: 26, height: 26)
        }
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
        .help("Ajustes & Diagnóstico (⌘,)")
        .keyboardShortcut(",", modifiers: .command)
        .popover(isPresented: $mostrandoAjustes, arrowEdge: .trailing) {
            popoverAjustes
        }
    }

    private var corDoStatus: Color {
        guard estado.vault != nil else { return cores.textoSutil }
        return alertasDoVault > 0 ? cores.aviso : cores.status(.concluida)
    }

    private var textoDoStatus: String {
        guard estado.vault != nil else { return "Sem vault" }
        if alertasDoVault > 0 {
            return alertasDoVault == 1 ? "1 aviso" : "\(alertasDoVault) avisos"
        }
        return "Vault íntegro"
    }

    private var ajudaDoStatus: String {
        guard estado.vault != nil else { return "Nenhum vault aberto" }
        if alertasDoVault > 0 {
            return "\(alertasDoVault) alerta(s) de consistência no vault — clique para ver diagnósticos"
        }
        return "Vault íntegro e consistente — clique para abrir Ajustes e Diagnóstico"
    }

    private var selecao: Binding<Secao?> {
        Binding(
            get: { estado.secao },
            set: { estado.secao = $0 ?? .trabalho }
        )
    }

    /// Uma linha da barra lateral, do jeito que a `List` desenha.
    private func linha(_ secao: Secao) -> some View {
        Label(secao.titulo, systemImage: secao.simbolo)
            .badge(distintivo(secao, comoTexto: true))
            .tag(secao)
    }

    private func distintivo(_ secao: Secao) -> Int {
        guard let vault = estado.vault else { return 0 }
        switch secao {
        case .calendario: return estado.diasDoCalendario.count
        case .trabalho:   return vault.tarefas.count
        case .diario:     return estado.diarios.count
        case .acervo:     return vault.midias.count
        case .onboarding: return 0
        }
    }

    private func distintivo(_ secao: Secao, comoTexto: Bool) -> Text? {
        let n = distintivo(secao)
        guard n > 0 else { return nil }
        return Text("\(n)")
    }

    private var alertasDoVault: Int {
        guard let vault = estado.vault else { return 0 }
        return vault.invalidas.count + vault.fatosNaoReconhecidos.count
    }

    // MARK: - Conteúdo

    @ViewBuilder
    private var conteudo: some View {
        if estado.secao == .onboarding {
            TelaOnboarding(estado: estado, aoEscolherPasta: escolherPasta)
        } else if let erro = estado.erro {
            Vazio(simbolo: "exclamationmark.triangle", titulo: "Não deu para ler o vault", detalhe: erro)
        } else if estado.vault == nil {
            VStack(spacing: DS.Espaco.md) {
                Vazio(
                    simbolo: "folder.badge.questionmark",
                    titulo: "Nenhum vault aberto",
                    detalhe: "Escolha a pasta do doc-harness — a mesma que você abre no Obsidian."
                )
                HStack(spacing: DS.Espaco.sm) {
                    Button("Escolher vault…", action: escolherPasta)
                    Button("Ver Guia de Onboarding") {
                        estado.secao = .onboarding
                    }
                }
                .controlSize(.small)
            }
        } else {
            switch estado.secao {
            case .calendario:
                TelaCalendario(dias: estado.diasDoCalendario)
            case .trabalho:
                TelaTrabalho(estado: estado)
            case .diario:
                TelaDiario(diarios: estado.diarios, fatos: estado.vault?.fatos ?? [])
            case .acervo:
                TelaAcervo(midias: estado.vault?.midias ?? [], vault: estado.vault)
            case .onboarding:
                EmptyView()
            }
        }
    }

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent {
        // A pasta aberta é o contexto de tudo que a janela mostra — no centro
        // do cabeçalho ela fica visível o tempo todo, sem competir com a
        // barra lateral nem com os botões de ação à direita.
        ToolbarItem(placement: .principal) { vaultNoCabecalho }
        ToolbarItem {
            Button {
                escolherPasta()
            } label: {
                Label("Escolher vault…", systemImage: "folder")
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

    /// Nome da pasta aberta, a hora da última leitura e revelação no Finder.
    ///
    /// Clicar na cápsula revela o vault no Finder (ou abre o seletor de pasta se nenhum estiver aberto).
    /// Se houver notas ou registros fora da convenção, a cápsula acusa com distintivo de aviso.
    @ViewBuilder
    private var vaultNoCabecalho: some View {
        Button {
            if let raiz = estado.raiz {
                NSWorkspace.shared.activateFileViewerSelecting([raiz])
            } else {
                escolherPasta()
            }
        } label: {
            HStack(spacing: DS.Espaco.xs + 2) {
                if let raiz = estado.raiz {
                    Image(systemName: "folder")
                        .font(DS.Icone.fonte(DS.Icone.pequeno, peso: .medium))
                        .foregroundStyle(cores.textoSutil)
                    Text(raiz.lastPathComponent)
                        .font(DS.Tipografia.corpo)
                        .fontWeight(.medium)
                        .foregroundStyle(cores.texto)
                        .lineLimit(1)
                    if let ultima = estado.ultimaLeitura {
                        Text("·")
                            .foregroundStyle(cores.divisor)
                        Text("lido às \(ultima.formatted(date: .omitted, time: .standard))")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                            .monospacedDigit()
                    }
                    if alertasDoVault > 0 {
                        HStack(spacing: 2) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(DS.Icone.fonte(DS.Icone.micro))
                            Text("\(alertasDoVault)")
                                .font(DS.Tipografia.detalhe)
                                .fontWeight(.semibold)
                                .monospacedDigit()
                        }
                        .foregroundStyle(cores.aviso)
                        .padding(.horizontal, DS.Espaco.xs + 2)
                        .padding(.vertical, 1)
                        .background(cores.aviso.opacity(DS.Veu.sutil), in: Capsule())
                    }
                } else {
                    Image(systemName: "folder.badge.questionmark")
                        .font(DS.Icone.fonte(DS.Icone.pequeno))
                        .foregroundStyle(cores.textoSutil)
                    Text("Nenhum vault aberto")
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.textoSutil)
                }
            }
            .padding(.horizontal, DS.Espaco.md)
            .padding(.vertical, DS.Espaco.xs)
        }
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.pilula))
        .help(estado.raiz != nil ? "Revelar pasta no Finder" : "Escolher pasta do vault")
    }

    private var popoverAjustes: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                HStack(spacing: DS.Espaco.xs + 2) {
                    Image(systemName: "slider.horizontal.3")
                        .font(DS.Icone.fonte(DS.Icone.pequeno, peso: .semibold))
                        .foregroundStyle(cores.acento)
                    Text("Ajustes do Sistema")
                        .font(DS.Tipografia.secao)
                        .foregroundStyle(cores.texto)
                }

                Spacer()

                Button {
                    mostrandoAjustes = false
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(DS.Icone.fonte(DS.Icone.medio))
                        .foregroundStyle(cores.textoSutil)
                }
                .buttonStyle(.plain)
                .help("Fechar (Esc)")
            }
            .padding(.horizontal, DS.Espaco.lg)
            .padding(.top, DS.Espaco.md)
            .padding(.bottom, DS.Espaco.xs)

            Divisor()

            TelaAjustes(estado: estado, aoEscolherPasta: {
                mostrandoAjustes = false
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    escolherPasta()
                }
            })
        }
        .frame(width: 480, height: 530)
        .background(cores.fundo)
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

