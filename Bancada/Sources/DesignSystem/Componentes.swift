import SwiftUI
import VaultKit

// Camada 3 do sistema. Tudo aqui lê `DS.Cor` (papel) — nenhum componente
// alcança `DS.Primitivo`, e nenhum carrega hex ou número solto.
//
// A divisão de trabalho entre as referências que fundaram o sistema aparece
// aqui de forma literal: `BarraDePainel`, `RotuloDeSecao` e `Pilula` vêm do
// chrome de Linear; `Folha` vem da superfície de leitura de Craft;
// `LinhaDeFato`, `MarcadorDeTipo` e `Divisor` vêm da linguagem de dado de
// HTTPie. Isso espelha a tese do vault: fato e narrativa não se parecem.

// MARK: - Chrome

/// Rótulo de grupo em micro-caps.
///
/// Dá hierarquia sem gastar borda, peso ou cor — é como Linear separa
/// "Workspace" de "Favorites" na barra lateral e como Craft separa
/// "PROPERTIES" de "ACTIONS" no painel de propriedades. Barato e silencioso,
/// que é exatamente o que um rótulo de grupo deve ser.
public struct RotuloDeSecao: View {
    @Environment(\.cores) private var cores
    private let texto: String

    public init(_ texto: String) { self.texto = texto }

    public var body: some View {
        Text(texto)
            .font(DS.Tipografia.rotulo)
            .textCase(.uppercase)
            .foregroundStyle(cores.textoSutil)
    }
}

/// Fio de 1px. Separa sem pesar.
///
/// Profundidade neste sistema vem de camada e de fio, nunca de sombra difusa —
/// as três referências fazem assim, e é o que mantém a interface legível nos
/// dois esquemas sem calibrar sombra duas vezes.
public struct Divisor: View {
    @Environment(\.cores) private var cores
    private let eixo: Axis

    public init(_ eixo: Axis = .horizontal) { self.eixo = eixo }

    public var body: some View {
        Rectangle()
            .fill(cores.divisor)
            .frame(
                width: eixo == .vertical ? DS.Traco.fio : nil,
                height: eixo == .horizontal ? DS.Traco.fio : nil
            )
    }
}

/// A barra que encima um painel: título à esquerda, contexto à direita.
///
/// Assenta no chrome e se fecha com um fio embaixo. Três telas montavam esta
/// mesma composição à mão (`TelaTrabalho`, `TelaCalendario`, `TelaAcervo`);
/// eram três chances de a densidade divergir.
public struct BarraDePainel<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    private let conteudo: Conteudo

    public init(@ViewBuilder conteudo: () -> Conteudo) {
        self.conteudo = conteudo()
    }

    public var body: some View {
        HStack(spacing: DS.Espaco.sm) { conteudo }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(cores.cromo)
            .overlay(alignment: .bottom) { Divisor() }
    }
}

/// Pílula de filtro ou de estado selecionável.
///
/// O acento aparece por véu, não por preenchimento sólido: ação primária é o
/// único lugar onde o acento vira fundo cheio, e uma barra de filtro não é
/// ação primária.
public struct Pilula: View {
    @Environment(\.cores) private var cores
    private let rotulo: String
    private let ativo: Bool
    private let acao: () -> Void

    public init(_ rotulo: String, ativo: Bool, acao: @escaping () -> Void) {
        self.rotulo = rotulo
        self.ativo = ativo
        self.acao = acao
    }

    public var body: some View {
        Button(action: acao) {
            Text(rotulo)
                .font(DS.Tipografia.detalhe)
                .padding(.horizontal, DS.Espaco.md)
                .padding(.vertical, DS.Espaco.xs + 1)
                .background(
                    cores.acento.opacity(ativo ? DS.Veu.forte : DS.Veu.sutil),
                    in: Capsule()
                )
                .foregroundStyle(ativo ? cores.acento : cores.textoSutil)
        }
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.pilula))
        .animation(DS.Movimento.rapido, value: ativo)
    }
}

// MARK: - Superfícies

/// Cartão padrão — superfície, fio e raio médio.
public struct Cartao<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    private let conteudo: Conteudo

    public init(@ViewBuilder conteudo: () -> Conteudo) {
        self.conteudo = conteudo()
    }

    public var body: some View {
        conteudo
            .background(cores.superficie, in: RoundedRectangle(cornerRadius: DS.Raio.md))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Raio.md)
                    .strokeBorder(cores.borda, lineWidth: DS.Traco.fio)
            )
    }
}

/// Cartão com título de seção. É a composição que a tela de Ajustes repetia
/// quatro vezes: cartão, título, conteúdo empilhado, respiro de `md`.
public struct Bloco<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    private let titulo: String
    private let simbolo: String?
    private let corDoSimbolo: Color?
    private let conteudo: Conteudo

    public init(
        _ titulo: String,
        simbolo: String? = nil,
        corDoSimbolo: Color? = nil,
        @ViewBuilder conteudo: () -> Conteudo
    ) {
        self.titulo = titulo
        self.simbolo = simbolo
        self.corDoSimbolo = corDoSimbolo
        self.conteudo = conteudo()
    }

    public var body: some View {
        Cartao {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                HStack(spacing: DS.Espaco.sm) {
                    if let simbolo {
                        // Tamanho e peso declarados: sem isto o glifo herda o
                        // ambiente e sai fino ao lado de um título semibold.
                        Image(systemName: simbolo)
                            .font(DS.Icone.fonte(DS.Icone.medio, peso: .semibold))
                            .foregroundStyle(corDoSimbolo ?? cores.texto)
                    }
                    Text(titulo).font(DS.Tipografia.secao)
                }
                conteudo
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

/// Superfície que flutua sobre o resto: prévia, dica, painel contextual.
///
/// Existe porque o único overlay que o app não desenhava era um `popover`
/// nativo, e ele trazia a sombra difusa que este sistema recusa — a única peça
/// da tela contradizendo a doutrina de profundidade por camada de tom e fio de
/// 1px. Elevação aqui é a mesma do resto: `superficie` um passo acima do
/// fundo, fio de 1px, raio `lg`. Nada de sombra.
///
/// Quem flutua não intercepta clique: a prévia é para ler, e o alvo por baixo
/// continua clicável.
public struct Sobreposicao<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    private let conteudo: Conteudo

    public init(@ViewBuilder conteudo: () -> Conteudo) {
        self.conteudo = conteudo()
    }

    public var body: some View {
        conteudo
            .background(cores.superficie, in: RoundedRectangle(cornerRadius: DS.Raio.lg))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Raio.lg)
                    .strokeBorder(cores.borda, lineWidth: DS.Traco.fio)
            )
            .allowsHitTesting(false)
    }
}

/// A superfície de leitura: a nota posta sobre o chrome, como uma folha sobre
/// a mesa.
///
/// É o único lugar do sistema onde a densidade afrouxa. O chrome é compacto
/// porque precisa caber; o texto que alguém vai ler de fato ganha entrelinha,
/// margem e a voz serifada. Separar as duas densidades é o que impede a
/// interface de ficar apertada exatamente onde não pode.
public struct Folha<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    private let conteudo: Conteudo

    public init(@ViewBuilder conteudo: () -> Conteudo) {
        self.conteudo = conteudo()
    }

    public var body: some View {
        ScrollView {
            conteudo
                // O teto de medida mora aqui, e não na tela que usa a folha.
                // Enquanto morou na tela, o Acervo acertava (tem teto de
                // painel) e o Diário ficava com a medida que sobrasse do
                // `HSplitView` — que não é decisão de design, é resto.
                .frame(maxWidth: DS.Leitura.larguraMaximaDaFolha, alignment: .leading)
                .padding(DS.Espaco.xl)
                .background(cores.folha, in: RoundedRectangle(cornerRadius: DS.Raio.lg))
                .overlay(
                    RoundedRectangle(cornerRadius: DS.Raio.lg)
                        .strokeBorder(cores.borda, lineWidth: DS.Traco.fio)
                )
                .padding(DS.Espaco.lg)
                .frame(maxWidth: .infinity)
        }
        .background(cores.cromo)
    }
}

// MARK: - Dado

/// Etiqueta de status de tarefa.
public struct Etiqueta: View {
    private let texto: String
    private let cor: Color

    public init(texto: String, cor: Color) {
        self.texto = texto
        self.cor = cor
    }

    public var body: some View {
        Text(texto)
            .font(DS.Tipografia.detalhe)
            .padding(.horizontal, DS.Espaco.sm)
            .padding(.vertical, 3)
            .background(cor.opacity(DS.Veu.medio), in: Capsule())
            .foregroundStyle(cor)
    }
}

/// Marcador colorido do tipo de fato, com largura fixa para os rótulos
/// alinharem verticalmente na árvore de registros.
public struct MarcadorDeTipo: View {
    @Environment(\.cores) private var cores
    private let tipo: String

    public init(tipo: String) { self.tipo = tipo }

    public var body: some View {
        Text(tipo)
            .font(DS.Tipografia.mono)
            .foregroundStyle(cores.tipoDeFato(tipo))
            .frame(width: DS.Marcador.larguraDoTipo, alignment: .leading)
    }
}

/// Uma linha do log: quando, de que espécie, o quê, por quem.
///
/// Tudo que veio de um hook fala na voz mono — horário, tipo e autor. A
/// descrição é a única parte escrita por gente, e é a única em sans. A regra
/// de ouro do vault, na largura de uma linha.
public struct LinhaDeFato: View {
    @Environment(\.cores) private var cores
    private let carimbo: String
    private let tipo: String
    private let descricao: String
    private let autor: String?
    private let linhas: Int

    public init(
        carimbo: String,
        tipo: String,
        descricao: String,
        autor: String? = nil,
        linhas: Int = 3
    ) {
        self.carimbo = carimbo
        self.tipo = tipo
        self.descricao = descricao
        self.autor = autor
        self.linhas = linhas
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.md) {
            Text(carimbo)
                .font(DS.Tipografia.mono)
                .foregroundStyle(cores.textoSutil)
                .monospacedDigit()

            MarcadorDeTipo(tipo: tipo)

            Text(descricao)
                .font(DS.Tipografia.corpo)
                .foregroundStyle(cores.texto)
                .lineLimit(linhas)

            if let autor {
                Spacer(minLength: DS.Espaco.md)
                Text(autor)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            }
        }
        .padding(.vertical, 1)
    }
}

/// Rótulo à esquerda, valor à direita na voz mono. Contagem é dado.
public struct LinhaDeValor<Acessorio: View>: View {
    @Environment(\.cores) private var cores
    private let rotulo: String
    private let valor: String
    private let destacado: Bool
    private let acessorio: Acessorio

    /// `destacado` dá peso de nó-pai numa árvore. Existe porque a tela de
    /// Registros precisava disso, não achou aqui e reimplementou a linha
    /// inteira à mão — a peça cobrir o caso real custa um parâmetro; a tela
    /// bifurcar custa uma divergência que ninguém revisa.
    public init(
        _ rotulo: String,
        valor: String,
        destacado: Bool = false,
        @ViewBuilder acessorio: () -> Acessorio = { EmptyView() }
    ) {
        self.rotulo = rotulo
        self.valor = valor
        self.destacado = destacado
        self.acessorio = acessorio()
    }

    public var body: some View {
        HStack(spacing: DS.Espaco.sm) {
            Text(rotulo)
                .font(DS.Tipografia.corpo)
                .fontWeight(destacado ? .medium : .regular)
            acessorio
            Spacer()
            Text(valor)
                .font(DS.Tipografia.mono)
                .monospacedDigit()
                .foregroundStyle(cores.textoSutil)
        }
    }
}

// MARK: - Ausência e permissão

/// Estado vazio com voz própria.
///
/// O `CLAUDE.md` do doc-harness é explícito: "um dia sem registro é um dado,
/// não um problema a esconder". A interface segue a mesma regra — diz que
/// está vazio, sem se desculpar nem inventar conteúdo de exemplo.
public struct Vazio: View {
    @Environment(\.cores) private var cores
    private let simbolo: String
    private let titulo: String
    private let detalhe: String?

    public init(simbolo: String, titulo: String, detalhe: String? = nil) {
        self.simbolo = simbolo
        self.titulo = titulo
        self.detalhe = detalhe
    }

    public var body: some View {
        VStack(spacing: DS.Espaco.sm) {
            Image(systemName: simbolo)
                .font(DS.Icone.fonte(DS.Icone.vazio, peso: .light))
                .foregroundStyle(cores.textoSutil)
            Text(titulo)
                .font(DS.Tipografia.secao)
                .foregroundStyle(cores.texto)
            if let detalhe {
                Text(detalhe)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: 320)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// Aviso de que a nota não pode ser editada aqui.
///
/// Não é decoração: registros são escritos só pelos hooks e derivados são
/// regenerados a partir do `.pages`. A Bancada não tem caminho de escrita para
/// nenhum dos dois (ver `TipoNota.somenteLeitura`) — este selo explica por quê.
public struct SeloSomenteLeitura: View {
    @Environment(\.cores) private var cores
    private let tipo: TipoNota

    public init(tipo: TipoNota) { self.tipo = tipo }

    private var motivo: String {
        switch tipo {
        case .registro:
            return "Log de fatos — escrito pelos hooks do Git, via scripts/registrar-fato.sh."
        case .documentoDerivado:
            return "Derivado de um .pages — regenerado a cada conversão. Edite o .pages original."
        default:
            return ""
        }
    }

    public var body: some View {
        HStack(spacing: DS.Espaco.sm) {
            Image(systemName: "lock.fill")
            Text(motivo)
        }
        .font(DS.Tipografia.detalhe)
        .foregroundStyle(cores.textoSutil)
        .padding(DS.Espaco.sm)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cores.dado, in: RoundedRectangle(cornerRadius: DS.Raio.sm))
    }
}

// MARK: - Busca e filtro

/// Campo de busca com ícone e botão de limpar.
///
/// O rótulo fica no `placeholder` porque o ícone de lupa já diz o que o campo
/// é — esta é a exceção à regra de rótulo acima do campo, e é a convenção que
/// todo campo de busca de macOS segue.
public struct CampoDeBusca: View {
    @Environment(\.cores) private var cores
    @Binding private var texto: String
    private let dica: String

    public init(texto: Binding<String>, dica: String = "Buscar…") {
        self._texto = texto
        self.dica = dica
    }

    public var body: some View {
        HStack(spacing: DS.Espaco.sm) {
            Image(systemName: "magnifyingglass")
                .font(DS.Icone.fonte(DS.Icone.pequeno))
                .foregroundStyle(cores.textoSutil)

            TextField(dica, text: $texto)
                .textFieldStyle(.plain)
                .font(DS.Tipografia.corpo)
                .foregroundStyle(cores.texto)

            if !texto.isEmpty {
                Button {
                    texto = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(DS.Icone.fonte(DS.Icone.pequeno))
                        .foregroundStyle(cores.textoSutil)
                }
                .buttonStyle(BotaoDoSistema(.glifo))
                .help("Limpar a busca")
                .accessibilityLabel("Limpar a busca")
            }
        }
        .padding(.horizontal, DS.Espaco.sm)
        .padding(.vertical, DS.Espaco.xs + 1)
        .background(cores.superficie, in: RoundedRectangle(cornerRadius: DS.Raio.sm))
        .overlay(
            RoundedRectangle(cornerRadius: DS.Raio.sm)
                .strokeBorder(cores.borda, lineWidth: DS.Traco.fio)
        )
    }
}

/// Uma opção dentro de um `MenuDeFiltro`.
public struct OpcaoDeFiltro: Identifiable, Equatable {
    public let id: String
    public let rotulo: String
    public let cor: Color?
    public let contagem: Int?

    public init(id: String, rotulo: String, cor: Color? = nil, contagem: Int? = nil) {
        self.id = id
        self.rotulo = rotulo
        self.cor = cor
        self.contagem = contagem
    }
}

/// Menu de filtro com marcação múltipla e contador do que está marcado.
///
/// Marcar nada é o estado neutro — mostra tudo. É o oposto de uma lista de
/// seleção, onde nada marcado não mostraria nada, e a diferença precisa ficar
/// óbvia: por isso o contador só aparece quando há escolha feita.
public struct MenuDeFiltro: View {
    @Environment(\.cores) private var cores
    private let titulo: String
    private let simbolo: String
    private let opcoes: [OpcaoDeFiltro]
    @Binding private var marcadas: Set<String>

    public init(
        titulo: String,
        simbolo: String = "line.3.horizontal.decrease",
        opcoes: [OpcaoDeFiltro],
        marcadas: Binding<Set<String>>
    ) {
        self.titulo = titulo
        self.simbolo = simbolo
        self.opcoes = opcoes
        self._marcadas = marcadas
    }

    public var body: some View {
        Menu {
            ForEach(opcoes) { opcao in
                Toggle(isOn: Binding(
                    get: { marcadas.contains(opcao.id) },
                    set: { ligado in
                        if ligado { marcadas.insert(opcao.id) } else { marcadas.remove(opcao.id) }
                    }
                )) {
                    if let n = opcao.contagem {
                        Text("\(opcao.rotulo) (\(n))")
                    } else {
                        Text(opcao.rotulo)
                    }
                }
            }
            if !marcadas.isEmpty {
                Divider()
                Button("Desmarcar tudo") { marcadas.removeAll() }
            }
        } label: {
            HStack(spacing: DS.Espaco.xs) {
                Image(systemName: simbolo).font(DS.Icone.fonte(DS.Icone.pequeno))
                Text(titulo).font(DS.Tipografia.detalhe)
                if !marcadas.isEmpty {
                    Text("\(marcadas.count)")
                        .font(DS.Tipografia.monoDetalhe)
                        .monospacedDigit()
                        .padding(.horizontal, DS.Espaco.xs + 1)
                        .background(cores.acento.opacity(DS.Veu.medio), in: Capsule())
                        .foregroundStyle(cores.acento)
                }
            }
            .foregroundStyle(marcadas.isEmpty ? cores.textoSutil : cores.acento)
        }
        .menuStyle(.borderlessButton)
        .fixedSize()
        .help("Filtrar por \(titulo.lowercased())")
    }
}

/// Etiqueta de filtro ativo, com o X que a remove.
public struct ChipRemovivel: View {
    @Environment(\.cores) private var cores
    private let texto: String
    private let cor: Color
    private let remover: () -> Void

    public init(texto: String, cor: Color, remover: @escaping () -> Void) {
        self.texto = texto
        self.cor = cor
        self.remover = remover
    }

    public var body: some View {
        HStack(spacing: DS.Espaco.xs) {
            Text(texto).font(DS.Tipografia.detalhe)
            Button(action: remover) {
                Image(systemName: "xmark").font(DS.Icone.fonte(DS.Icone.micro, peso: .bold))
            }
            .buttonStyle(BotaoDoSistema(.glifo))
            // A 9pt o glifo é menor que qualquer alvo defensável; a área
            // clicável vem do frame, não do desenho.
            .frame(width: DS.Espaco.md, height: DS.Espaco.md)
            .accessibilityLabel("Remover o filtro \(texto)")
        }
        .padding(.horizontal, DS.Espaco.sm)
        .padding(.vertical, 3)
        .background(cor.opacity(DS.Veu.medio), in: Capsule())
        .foregroundStyle(cor)
    }
}

/// O estilo de botão do sistema — o único.
///
/// A revisão de 2026-09-10 contou, no app inteiro: zero estados `pressed`, dois
/// `hover` (e nenhum dos dois pintava nada — um agendava a prévia, o outro
/// trocava o cursor). São doze `.buttonStyle(.plain)`, que no macOS removem o
/// realce nativo **sem repor nada**: o botão fica visualmente morto sob o
/// ponteiro e sob o clique.
///
/// A correção não é adicionar hover em doze lugares. É ter um estilo, porque a
/// mesma lição já apareceu duas vezes nesta base: enquanto "sem sombra difusa"
/// foi frase, um `popover` nativo passou por baixo dela; virou `Sobreposicao` e
/// parou. Regra que não é peça não se cumpre.
///
/// Duas formas, porque há dois tipos de botão aqui:
/// - `.peca` — tem área própria (pílula, cartão, linha). O realce pinta o fundo.
/// - `.glifo` — é só um ícone solto. O realce muda a tinta, porque pintar fundo
///   atrás de um glifo de 9pt cria uma mancha maior que o próprio ícone.
public struct BotaoDoSistema: ButtonStyle {
    public enum Forma { case peca, glifo }

    private let forma: Forma
    private let raio: CGFloat

    public init(_ forma: Forma = .peca, raio: CGFloat = DS.Raio.sm) {
        self.forma = forma
        self.raio = raio
    }

    public func makeBody(configuration: Configuration) -> some View {
        Corpo(configuracao: configuration, forma: forma, raio: raio)
    }

    /// `ButtonStyle` não guarda estado, e hover é estado. Daí a view interna.
    private struct Corpo: View {
        @Environment(\.cores) private var cores
        @Environment(\.isEnabled) private var habilitado
        @Environment(\.accessibilityReduceMotion) private var menosMovimento

        let configuracao: Configuration
        let forma: Forma
        let raio: CGFloat

        @State private var sobre = false

        private var veu: Double {
            if configuracao.isPressed { return DS.Veu.medio }
            if sobre { return DS.Veu.sutil }
            return 0
        }

        var body: some View {
            configuracao.label
                .opacity(opacidade)
                .background(realceDeFundo)
                // O alvo é o retângulo inteiro, não o desenho do glifo: sem
                // isto o clique só pega no traço do ícone.
                .contentShape(RoundedRectangle(cornerRadius: raio))
                .onHover { sobre = $0 }
                .animation(menosMovimento ? nil : DS.Movimento.rapido, value: sobre)
                .animation(menosMovimento ? nil : DS.Movimento.rapido, value: configuracao.isPressed)
        }

        /// Desabilitado esmaece; glifo escurece a tinta sob o ponteiro.
        private var opacidade: Double {
            if !habilitado { return 0.4 }
            if forma == .glifo && configuracao.isPressed { return 0.6 }
            if forma == .glifo && sobre { return 0.8 }
            return 1
        }

        @ViewBuilder
        private var realceDeFundo: some View {
            if forma == .peca && habilitado {
                RoundedRectangle(cornerRadius: raio)
                    .fill(cores.texto.opacity(veu))
            }
        }
    }
}

extension View {
    /// Anel de foco de teclado.
    ///
    /// `DS.Cor.foco` e `DS.Traco.foco` existiam desde o começo do sistema sem
    /// um único ponto de uso — projetados e nunca implementados, como a revisão
    /// do Cauê registrou. Este modificador é o ponto de uso: quem navega por
    /// teclado precisa saber onde está, e o desenho tem de ser **um** para o
    /// app inteiro, não um por tela.
    public func anelDeFoco(_ ativo: Bool, raio: CGFloat = DS.Raio.sm) -> some View {
        modifier(AnelDeFoco(ativo: ativo, raio: raio))
    }
}

private struct AnelDeFoco: ViewModifier {
    @Environment(\.cores) private var cores
    @Environment(\.accessibilityReduceMotion) private var menosMovimento
    let ativo: Bool
    let raio: CGFloat

    func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: raio)
                    .strokeBorder(ativo ? cores.foco : .clear, lineWidth: DS.Traco.foco)
                    // O anel fica por fora da peça: por dentro ele come o
                    // conteúdo e briga com a borda que já está lá.
                    .padding(-DS.Traco.foco)
            )
            .animation(menosMovimento ? nil : DS.Movimento.rapido, value: ativo)
    }
}

/// Seletor exclusivo com ícone e rótulo — o grupo de botões que troca de modo.
///
/// Controle próprio, e não `Pilula`, porque a escolha aqui é exclusiva e
/// obrigatória: sempre há exatamente um modo ativo. Uma barra de pílulas
/// comunica filtro, que pode não ter nenhum selecionado.
public struct SeletorSegmentado<Valor: Hashable>: View {
    @Environment(\.cores) private var cores

    public struct Opcao: Identifiable {
        public let valor: Valor
        public let rotulo: String
        public let simbolo: String
        public var id: Valor { valor }

        public init(valor: Valor, rotulo: String, simbolo: String) {
            self.valor = valor
            self.rotulo = rotulo
            self.simbolo = simbolo
        }
    }

    @Binding private var selecao: Valor
    private let opcoes: [Opcao]

    public init(selecao: Binding<Valor>, opcoes: [Opcao]) {
        self._selecao = selecao
        self.opcoes = opcoes
    }

    public var body: some View {
        HStack(spacing: DS.Traco.fio) {
            ForEach(opcoes) { opcao in
                let ativo = opcao.valor == selecao
                Button {
                    selecao = opcao.valor
                } label: {
                    HStack(spacing: DS.Espaco.xs) {
                        Image(systemName: opcao.simbolo).font(DS.Icone.fonte(DS.Icone.pequeno))
                        Text(opcao.rotulo).font(DS.Tipografia.detalhe)
                    }
                    .padding(.horizontal, DS.Espaco.sm)
                    .padding(.vertical, DS.Espaco.xs)
                    .background(
                        RoundedRectangle(cornerRadius: DS.Raio.sm - 2)
                            .fill(cores.superficie.opacity(ativo ? 1 : 0))
                    )
                    .foregroundStyle(ativo ? cores.texto : cores.textoSutil)
                    .contentShape(Rectangle())
                }
                .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm - 2))
                .accessibilityAddTraits(ativo ? [.isButton, .isSelected] : .isButton)
            }
        }
        .padding(DS.Traco.selecao)
        .background(cores.dado, in: RoundedRectangle(cornerRadius: DS.Raio.sm))
        .overlay(
            RoundedRectangle(cornerRadius: DS.Raio.sm)
                .strokeBorder(cores.borda, lineWidth: DS.Traco.fio)
        )
        // Sem isto o grupo estica na vertical e incha a barra que o contém.
        .fixedSize()
        .animation(DS.Movimento.rapido, value: selecao)
    }
}
