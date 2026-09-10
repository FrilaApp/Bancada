import SwiftUI
import AppKit
import VaultKit
import DesignSystem

struct JanelaPrincipal: View {
    @Environment(\.cores) private var cores
    @State private var estado = EstadoDaBancada()

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
    }

    // MARK: - Barra lateral

    private var barraLateral: some View {
        List(selection: selecao) {
            ForEach(Secao.conteudo) { secao in
                linha(secao)
            }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) { rodape }
    }

    private var selecao: Binding<Secao?> {
        Binding(
            get: { estado.secao },
            set: { estado.secao = $0 ?? .trabalho }
        )
    }

    /// Uma linha da barra lateral, do jeito que a `List` desenha.
    ///
    /// O Ajustes usa exatamente esta função, e é essa a correção: antes ele era
    /// um botão desenhado à mão — fundo translúcido, texto no acento, borda —
    /// convivendo na mesma coluna com a seleção nativa azul das outras quatro.
    /// Dois vocabulários de seleção lado a lado, e um recuo de ~9px que não
    /// batia com as linhas de cima. Alinhamento, seleção e realce agora vêm de
    /// onde já vinham para as outras.
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
        // Desvio invisível é o que corrói a confiança no registro: este
        // distintivo é o único que se quer sempre em zero.
        case .ajustes:    return vault.invalidas.count + vault.fatosNaoReconhecidos.count
        }
    }

    /// O distintivo como `Text`, para o de Ajustes poder falar em cor de aviso
    /// sem sair do desenho nativo da linha. Zero vira `nil` — a `List` esconde,
    /// e zero é justamente o estado que não pede atenção.
    private func distintivo(_ secao: Secao, comoTexto: Bool) -> Text? {
        let n = distintivo(secao)
        guard n > 0 else { return nil }
        let t = Text("\(n)")
        return secao == .ajustes ? t.foregroundColor(cores.aviso) : t
    }

    /// Ajustes fica no pé da barra lateral, fora da lista de seções: é sobre o
    /// app, não sobre o vault, e é onde o macOS ensina a procurar por
    /// configuração. Continua sendo uma `Secao` — só não disputa espaço com o
    /// conteúdo.
    ///
    /// É uma `List` de uma linha só, e não um botão: assim a seleção, o recuo e
    /// o realce são os mesmos das seções acima, sem ninguém reimplementar
    /// nenhum dos três.
    private var rodape: some View {
        VStack(spacing: 0) {
            Divisor()
            List(selection: selecao) {
                linha(.ajustes)
            }
            .scrollDisabled(true)
            .frame(height: DS.BarraLateral.alturaDoRodape)
        }
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
            case .calendario:
                TelaCalendario(dias: estado.diasDoCalendario)
            case .trabalho:
                TelaTrabalho(estado: estado)
            case .diario:
                TelaDiario(diarios: estado.diarios, fatos: estado.vault?.fatos ?? [])
            case .acervo:
                TelaAcervo(midias: estado.vault?.midias ?? [], vault: estado.vault)
            case .ajustes:
                TelaAjustes(estado: estado, aoEscolherPasta: escolherPasta)
            }
        }
    }

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .navigation) {
            Text(estado.secao.titulo).font(DS.Tipografia.secao)
        }
        // A pasta aberta é o contexto de tudo que a janela mostra — no centro
        // do cabeçalho ela fica visível o tempo todo, sem competir com a
        // seção à esquerda nem com os botões à direita.
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

    /// Nome da pasta aberta e a hora da última leitura.
    ///
    /// O horário não é enfeite: o conteúdo vem do disco a cada leitura, nunca
    /// de cache, e os hooks escrevem no vault por fora do app. Ver o relógio
    /// andar sozinho é o que prova que a janela não está mostrando um estado
    /// velho. Clicar abre a pasta no Finder.
    @ViewBuilder
    private var vaultNoCabecalho: some View {
        if let raiz = estado.raiz {
            Button {
                NSWorkspace.shared.activateFileViewerSelecting([raiz])
            } label: {
                VStack(spacing: 0) {
                    HStack(spacing: DS.Espaco.xs) {
                        Image(systemName: "folder")
                            .font(DS.Icone.fonte(DS.Icone.pequeno))
                            .foregroundStyle(cores.textoSutil)
                        Text(raiz.lastPathComponent)
                            .font(DS.Tipografia.corpo)
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
                .contentShape(Rectangle())
            }
            .buttonStyle(BotaoDoSistema(.peca))
            .help(raiz.path)
            .accessibilityLabel("Mostrar o vault no Finder")
        } else {
            Text("Nenhum vault aberto")
                .font(DS.Tipografia.corpo)
                .foregroundStyle(cores.textoSutil)
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
