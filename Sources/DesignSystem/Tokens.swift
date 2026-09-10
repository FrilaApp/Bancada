import SwiftUI
import VaultKit

/// Espelho em Swift de `tokens.json`.
///
/// Os valores vivem em JSON porque o gerador do site e o do ícone consomem o
/// mesmo arquivo. Mantê-los aqui como constantes — em vez de decodificar o
/// JSON em runtime — dá verificação em tempo de compilação e evita um recurso
/// a mais para o executável carregar. Ao mexer num valor, mexa nos dois: o
/// `ParidadeDeTokensTests` quebra se os dois divergirem.
///
/// Segue o padrão declarativo de `ActionShelf/Sources/ActionShelf/MotionTokens.swift`.
///
/// ## As três camadas
///
/// 1. `DS.Primitivo` — rampas e matizes. Todo hex do sistema nasce aqui.
/// 2. `DS.Cor` — os papéis, em par claro/escuro, montados a partir de primitivo.
/// 3. Componente (`Componentes.swift`) — só lê papel.
///
/// Componente nunca lê primitivo. Se um componente precisa de uma cor que
/// nenhum papel oferece, o papel é que está faltando.
public enum DS {

    // MARK: - Camada 1: primitivo

    public enum Primitivo {

        /// Rampa neutra, índice 0 (mais claro) → 13 (mais escuro).
        ///
        /// Quase espelhada em torno dos passos 6-7: o passo que separa no
        /// claro separa igual no escuro, e é por isso que `borda` tem a mesma
        /// separação (1,24:1) contra a superfície dos dois lados — o que
        /// permite um único conjunto de componentes servir aos dois esquemas.
        ///
        /// Duas exceções, ambas de propósito, ambas travadas por teste:
        ///
        /// - `fundo`/`superficie` não espelham (1↔13, 0↔12) porque elevação é
        ///   **mais clara nos dois esquemas**. Simetria pura poria a superfície
        ///   abaixo do fundo no escuro, e um cartão pareceria um buraco.
        /// - `texto` no escuro é o passo 2 e não o 1: branco puro sobre
        ///   quase-preto ofusca.
        public static let neutro: [String] = [
            "FFFFFF",  //  0  branco
            "FCFCFD",  //  1  fundo claro
            "F4F5F7",  //  2  névoa · superfície sutil clara · texto escuro
            "E6E7EA",  //  3  fio claro
            "D3D6DB",  //  4
            "AEB3BB",  //  5
            "8A8F98",  //  6  pedra · texto sutil escuro
            "6B6F76",  //  7  pedra · texto sutil claro
            "4A4E55",  //  8
            "33363C",  //  9
            "26282D",  // 10  fio escuro
            "1B1D21",  // 11  superfície sutil escura
            "141518",  // 12  superfície escura · texto claro
            "0C0D0F"   // 13  fundo escuro
        ]

        /// Dois passos por matiz: `profundo` pesa sobre superfície clara,
        /// `luz` pesa sobre superfície escura. Ambos verificados em ≥ 4.5:1
        /// contra a superfície do próprio esquema.
        public struct Matiz {
            public let profundo: String
            public let luz: String
        }

        public static let azul     = Matiz(profundo: "2F5BD8", luz: "7C95F0")
        public static let verde    = Matiz(profundo: "1E7A4C", luz: "4FC98A")
        public static let ambar    = Matiz(profundo: "8A6410", luz: "D9A84E")
        public static let violeta  = Matiz(profundo: "6B4FA8", luz: "A98FE0")
        public static let turquesa = Matiz(profundo: "0F7A83", luz: "4FC3CE")
        public static let vermelho = Matiz(profundo: "C0362B", luz: "F0837A")
    }

    // MARK: - Camada 2: papel

    /// Par claro/escuro resolvido pelo sistema — a Bancada acompanha a
    /// aparência do macOS em vez de impor um tema.
    ///
    /// Guarda o hex, não a `Color`: é o hex que o `ParidadeDeTokensTests`
    /// compara com `tokens.json`, e `Color` não sabe dizer de que valor veio.
    public struct ParDeCor {
        public let claroHex: String
        public let escuroHex: String

        public init(claro: String, escuro: String) {
            self.claroHex = claro
            self.escuroHex = escuro
        }

        public var claro: Color { .hex(claroHex) }
        public var escuro: Color { .hex(escuroHex) }

        public func resolver(_ esquema: ColorScheme) -> Color {
            esquema == .dark ? escuro : claro
        }
    }

    public enum Cor {
        private static func n(_ claro: Int, _ escuro: Int) -> ParDeCor {
            ParDeCor(claro: Primitivo.neutro[claro], escuro: Primitivo.neutro[escuro])
        }

        private static func m(_ matiz: Primitivo.Matiz) -> ParDeCor {
            ParDeCor(claro: matiz.profundo, escuro: matiz.luz)
        }

        public static let fundo           = n(2, 13)
        public static let superficie      = n(0, 12)
        public static let superficieSutil = n(2, 11)
        public static let borda           = n(3, 10)
        public static let texto           = n(12, 2)
        public static let textoSutil      = n(7, 6)

        /// O chrome da janela — barra lateral, cabeçalhos de painel, barras de
        /// filtro.
        ///
        /// No escuro fica um passo acima do fundo. No claro divide o passo com
        /// ele, e é de propósito: separar os dois custaria a elevação da folha,
        /// que é o que a tese precisa. No claro o sistema tem **duas**
        /// superfícies, não três — cinza para o que opera, branco para o que se
        /// lê. A medição de 2026-09-10 mostrou a folha separando por ΔL 0,87;
        /// hoje separa por 3,00, contra 3,71 do escuro.
        public static let cromo           = n(2, 11)

        /// A superfície de leitura: nota, diário, markdown derivado. Fica
        /// acima do chrome, como a folha sobre a mesa.
        public static let folha           = n(0, 12)

        /// Fundo de bloco de fato — log, linha de registro, caminho de
        /// arquivo. Recua em relação à folha.
        public static let dado            = n(2, 11)

        /// Fio estrutural — separa painel de painel.
        ///
        /// Carrega mais peso que `borda`, que contorna peça. Sem sombra, é o
        /// divisor que diz onde uma região acaba, e ele estava no mesmo passo
        /// da borda até a medição de 2026-09-10: 1,13:1 contra o fundo.
        ///
        /// Não persegue os 3:1 que a WCAG pede para componente, e a recusa tem
        /// número: contra branco, o primeiro passo da rampa que chega a 3:1 é o
        /// `neutro.6` (#8A8F98, 3,25:1) — um cinza médio. A 1px isso é régua,
        /// não fio, e destruiria a linguagem que o sistema escolheu. Ver a nota
        /// de design.
        public static let divisor         = n(4, 9)

        /// Um só, e raro: ação primária, estado ativo, link, anel de foco.
        /// Nunca fundo de área.
        public static let acento          = m(Primitivo.azul)
        public static let foco            = m(Primitivo.azul)

        /// Só ação destrutiva e erro — nunca aviso, nunca ênfase.
        public static let perigo          = m(Primitivo.vermelho)

        /// Aviso: algo merece atenção e nada quebrou.
        ///
        /// Existia só na prosa da nota de design ("Aviso é âmbar") enquanto o
        /// código tomava `status(.revisao)` emprestado em dois pontos — um
        /// deles pintando um triângulo de alerta com cor de *status de tarefa*.
        /// Papel nomeado em texto e ausente dos tokens é papel faltando.
        public static let aviso           = m(Primitivo.ambar)

        public static func status(_ status: StatusTarefa) -> ParDeCor {
            switch status {
            case .aFazer:      return n(7, 6)
            case .emAndamento: return m(Primitivo.azul)
            case .revisao:     return m(Primitivo.ambar)
            case .concluida:   return m(Primitivo.verde)
            }
        }

        /// Cor por tipo de fato. Tipos novos podem surgir — `registrar-fato.sh`
        /// aceita tipo arbitrário —, então há um padrão em vez de um enum.
        /// O padrão é neutro de propósito: um tipo que o sistema não conhece
        /// não ganha cor de categoria, porque não há categoria a comunicar.
        public static func tipoDeFato(_ tipo: String) -> ParDeCor {
            switch tipo {
            case "commit": return m(Primitivo.turquesa)
            case "pages":  return m(Primitivo.ambar)
            case "sessao": return n(7, 6)
            case "teste":  return m(Primitivo.violeta)
            case "ui":     return m(Primitivo.verde)
            default:       return n(7, 6)
            }
        }

        /// Cor por categoria de agenda. Segue o mesmo padrão de `tipoDeFato`:
        /// categoria desconhecida cai no neutro, porque uma linha escrita
        /// fora do vocabulário documentado no `CLAUDE.md` não inventa cor pra
        /// si — ela já aparece como não reconhecida no leitor.
        public static func categoriaDeAgenda(_ categoria: String) -> ParDeCor {
            switch categoria {
            case "rotina":    return m(Primitivo.ambar)
            case "marco":     return m(Primitivo.verde)
            case "academia":  return m(Primitivo.vermelho)
            case "feriado":   return m(Primitivo.violeta)
            case "atividade": return m(Primitivo.turquesa)
            default:          return n(7, 6)
            }
        }
    }

    /// As opacidades de tinta sobre superfície. Existem para que
    /// `.opacity(0.14)` não fique espalhado pelas telas com valores que
    /// ninguém consegue justificar.
    public enum Veu {
        public static let sutil: Double = 0.08
        public static let medio: Double = 0.14
        public static let forte: Double = 0.22
    }

    // MARK: - Métrica

    public enum Espaco {
        public static let xs: CGFloat = 4
        public static let sm: CGFloat = 8
        public static let md: CGFloat = 12
        public static let lg: CGFloat = 20
        public static let xl: CGFloat = 32
    }

    public enum Raio {
        /// Peça pequena — etiqueta de evento, distintivo de tag. Existe porque
        /// dois pontos do app escreviam `cornerRadius: 3` cru: o valor estava
        /// certo, faltava o nome.
        public static let xs: CGFloat = 3
        public static let sm: CGFloat = 6
        public static let md: CGFloat = 10
        public static let lg: CGFloat = 16
        public static let pilula: CGFloat = 9999
    }

    /// Espessuras. Profundidade neste sistema vem de camada e de fio — não de
    /// sombra difusa.
    public enum Traco {
        public static let fio: CGFloat = 1
        public static let foco: CGFloat = 2
        public static let selecao: CGFloat = 2
    }

    // MARK: - Ícone

    /// Tamanhos de glifo.
    ///
    /// Ícone não é texto e não cabe na escala de texto: era exatamente por isso
    /// que 13 dos 17 `.font(.system(size:))` crus do app eram símbolo, não
    /// palavra. Enquanto a escala não teve passo de ícone, cada ponto de uso
    /// inventou o seu — e sete deles estavam **dentro do próprio design
    /// system**, que carregava o desvio para dentro de quem o consumia direito.
    ///
    /// `medio` casa com `corpo` (13pt) para alinhar oticamente ao lado dele.
    /// `micro` era 7 e virou 9: a 7pt o alvo de ponteiro do X do chip ficava
    /// menor que qualquer mínimo defensável.
    public enum Icone {
        public static let micro: CGFloat = 9
        public static let pequeno: CGFloat = 11
        public static let medio: CGFloat = 13
        public static let grande: CGFloat = 20
        public static let vazio: CGFloat = 28

        /// Peso de traço padrão dos SF Symbols do sistema. Declarado para que
        /// ícone ao lado de texto semibold não fique fino por omissão.
        public static func fonte(_ tamanho: CGFloat, peso: Font.Weight = .regular) -> Font {
            .system(size: tamanho, weight: peso)
        }
    }

    // MARK: - Tipografia

    /// Uma superfamília, três vozes: interface, narrativa e fato.
    ///
    /// O token é o **papel**, não o arquivo de fonte. O app usa a superfamília
    /// do sistema (SF / New York / SF Mono) via `Font.Design`; o site usa IBM
    /// Plex Sans/Serif/Mono. A distinção entre narrativa e fato lê como
    /// mudança de registro, não de tipografia — que é a regra de ouro do vault
    /// virada forma.
    public struct EstiloDeTexto {
        public let fonte: Font
        public let tracking: CGFloat

        public init(fonte: Font, tracking: CGFloat) {
            self.fonte = fonte
            self.tracking = tracking
        }
    }

    public enum Tipografia {

        // Voz da interface — sans (SF).
        public static let titulo  = EstiloDeTexto(fonte: .system(size: 22, weight: .semibold), tracking: -0.4)
        public static let secao   = EstiloDeTexto(fonte: .system(size: 15, weight: .semibold), tracking: -0.2)
        public static let corpo   = EstiloDeTexto(fonte: .system(size: 13), tracking: -0.08)
        public static let detalhe = EstiloDeTexto(fonte: .system(size: 11), tracking: 0)

        /// Micro-caps de rótulo de grupo. Dá hierarquia sem gastar borda nem
        /// peso — é como Linear e Craft separam seções na barra lateral e no
        /// painel de propriedades. Aplique junto com `.textCase(.uppercase)`,
        /// ou use `RotuloDeSecao`, que já faz isso.
        public static let rotulo  = EstiloDeTexto(fonte: .system(size: 10, weight: .medium), tracking: 0.6)

        // Voz da narrativa — serif (New York). Entrelinha generosa vive aqui e
        // só aqui: a densidade compacta é do chrome, não do texto que se lê.
        public static let leituraTitulo = EstiloDeTexto(
            fonte: .system(size: 20, weight: .semibold, design: .serif), tracking: -0.3
        )
        public static let leitura = EstiloDeTexto(
            fonte: .system(size: 15, design: .serif), tracking: 0
        )

        /// Entrelinha da voz de narrativa, em pontos de espaçamento extra —
        /// `Text.lineSpacing` soma ao padrão, então é o delta que interessa.
        public static let entrelinhaDeLeitura: CGFloat = 6

        // Voz do fato — mono (SF Mono). Tudo que saiu de um hook.
        public static let mono = EstiloDeTexto(
            fonte: .system(size: 12, design: .monospaced), tracking: -0.1
        )
        public static let monoDetalhe = EstiloDeTexto(
            fonte: .system(size: 11, design: .monospaced), tracking: -0.1
        )
    }

    // MARK: - Movimento

    /// Segue o padrão declarativo de `ActionShelf/.../MotionTokens.swift`.
    /// Dois valores só: o sistema não anima o que não muda de estado.
    public enum Movimento {
        public static let rapido = Animation.easeOut(duration: 0.12)
        public static let padrao = Animation.easeOut(duration: 0.20)
    }

    // MARK: - Métrica por tela

    /// Medidas de layout que não cabem numa escala geral. Espelham
    /// `metrica.*` em `tokens.json`; ficam aqui para que nenhuma view carregue
    /// número mágico.

    /// A janela e o seu mínimo.
    ///
    /// `larguraMinimaDoConteudo` é **soma, não escolha**: a barra lateral no
    /// mínimo mais a mais larga das telas (o Diário). O `minWidth` do SwiftUI
    /// não sobe do `NSHostingView` para a `NSWindow`, então sem declarar isto
    /// na janela ela encolhia abaixo do que as telas conseguem desenhar — e o
    /// autosave devolvia o estado quebrado na abertura seguinte.
    public enum Janela {
        public static let larguraPadrao: CGFloat = 1080
        public static let alturaPadrao: CGFloat = 720
        public static let larguraMinimaDoDetalhe: CGFloat = 740
        public static let larguraMinimaDoConteudo: CGFloat = 920
        public static let alturaMinimaDoConteudo: CGFloat = 400
    }

    /// As três colunas do Diário: lista de dias, folha, fatos do dia.
    public enum Diario {
        public static let larguraMinimaDaLista: CGFloat = 160
        public static let larguraIdealDaLista: CGFloat = 190
        public static let larguraMinimaDaFolha: CGFloat = 320
        public static let larguraMinimaDosFatos: CGFloat = 260
        public static let larguraIdealDosFatos: CGFloat = 300
    }

    /// Teto de medida da superfície de leitura.
    ///
    /// Uma linha de 15pt em serifa passa de 75 caracteres muito antes do que a
    /// janela permite. Medida sem teto não é decisão de design: é resto de
    /// `HSplitView`. O teto pertence à `Folha`, não à tela que a usa — era por
    /// isso que o Acervo acertava (tem teto de painel) e o Diário não.
    public enum Leitura {
        public static let larguraMaximaDaFolha: CGFloat = 620
    }

    public enum Galeria {
        public static let larguraMinimaCard: CGFloat = 180
        public static let alturaThumbnail: CGFloat = 128
    }

    /// Divisão vertical da seção Trabalho: a tabela em cima, os fatos embaixo.
    public enum Trabalho {
        public static let alturaMinimaDaTabela: CGFloat = 180
        public static let alturaMinimaDoPainel: CGFloat = 160
    }

    /// Painel de detalhe do Acervo, à direita da grade.
    public enum Acervo {
        public static let larguraMinimaDoPainel: CGFloat = 320
        public static let larguraIdealDoPainel: CGFloat = 380
        /// Teto para o painel de detalhe.
        ///
        /// Sem ele, o `HSplitView` reparte a sobra e o painel chega a 40% da
        /// janela — largura que se justifica com um item selecionado e não se
        /// justifica nenhuma para dizer "Nada selecionado". A grade é o
        /// conteúdo; o painel é apoio.
        public static let larguraMaximaDoPainel: CGFloat = 480
        public static let alturaDaPreviaGrande: CGFloat = 180
    }

    /// A grade do calendário e o painel do dia ao lado dela.
    public enum Calendario {
        /// Pisos da célula. Abaixo deles a grade rola em vez de espremer: um
        /// número do dia e um chip precisam caber, e 72 × 64 é onde ainda cabem.
        /// O piso de largura é o que decide se o painel do dia cabe ao lado
        /// (`GeometriaDaGrade.larguraDoPainel`).
        public static let larguraMinimaDaCelula: CGFloat = 72
        public static let alturaMinimaDaCelula: CGFloat = 64
        public static let alturaDoCabecalho: CGFloat = 24

        /// A faixa de proporção da célula, em largura ÷ altura.
        ///
        /// A célula acompanha a janela, mas não a qualquer custo: numa tela
        /// larga e baixa ela virava uma faixa de 2,4:1, e na tira da semana,
        /// com altura sobrando, viraria uma coluna. Fora da faixa, a grade
        /// estreita (e centraliza) ou para de crescer — nunca deforma.
        public static let proporcaoMinimaDaCelula: CGFloat = 0.75
        public static let proporcaoMaximaDaCelula: CGFloat = 1.6

        /// O painel do dia, à direita da grade: uma fração da área, entre
        /// dois limites. Sem o teto, numa tela grande o painel roubava a
        /// largura que a grade usa para mostrar o nome das tarefas.
        public static let fracaoDoPainel: CGFloat = 0.3
        public static let larguraMinimaDoPainel: CGFloat = 280
        public static let larguraMaximaDoPainel: CGFloat = 400

        /// Quanto o ponteiro precisa ficar parado sobre uma célula antes do
        /// resumo aparecer. Curto demais e o popover pisca ao atravessar a
        /// grade; longo demais e ninguém descobre que ele existe.
        public static let esperaDoPreview: Double = 0.6
        public static let larguraDoPreview: CGFloat = 260

        /// Teto de altura da prévia, usado para mantê-la dentro da grade ao
        /// posicioná-la. O conteúdo é curto; o teto existe para o cálculo de
        /// borda, não para cortar texto.
        public static let alturaMaximaDoPreview: CGFloat = 220

        /// Quantos dias com evento justificam abrir na grade do mês.
        ///
        /// Abaixo disso a grade fica com 33 das 35 células vazias e parece uma
        /// planilha em branco — o dado é o mesmo, o modo é que estava errado.
        /// Uma semana é o corte: com menos de sete dias marcados, Lista mostra
        /// tudo sem sobra; a partir daí a grade começa a valer a altura que
        /// ocupa. O vault fica denso sozinho, e o padrão acompanha.
        public static let diasMinimosParaGrade: Int = 7
    }

    /// O rodapé da barra lateral: uma `List` de uma linha só, que precisa de
    /// altura declarada porque `List` não se autodimensiona.
    public enum BarraLateral {
        public static let alturaDoRodape: CGFloat = 36
        public static let larguraMinima: CGFloat = 180
        public static let larguraIdeal: CGFloat = 210
        public static let larguraMaxima: CGFloat = 260
    }

    /// Colunas de largura fixa que fazem as linhas de fato alinharem
    /// verticalmente — sem elas a árvore de registros vira serrilha.
    public enum Marcador {
        public static let larguraDoTipo: CGFloat = 58
        public static let larguraDaHora: CGFloat = 44
    }
}

extension Color {
    /// Aceita "RRGGBB" ou "#RRGGBB".
    public static func hex(_ valor: String) -> Color {
        var s = valor
        if s.hasPrefix("#") { s.removeFirst() }
        let n = UInt32(s, radix: 16) ?? 0
        return Color(
            .sRGB,
            red:   Double((n >> 16) & 0xFF) / 255,
            green: Double((n >> 8)  & 0xFF) / 255,
            blue:  Double(n & 0xFF)         / 255
        )
    }
}

extension View {
    /// Aplica fonte e tracking de uma vez.
    ///
    /// Sobrecarga de `font(_:)` de propósito: as chamadas existentes
    /// (`.font(DS.Tipografia.corpo)`) continuam válidas e passam a carregar o
    /// tracking junto, sem que nenhuma tela precise mudar. Tracking solto numa
    /// view e esquecido em outra é como uma escala tipográfica se desfaz.
    public func font(_ estilo: DS.EstiloDeTexto) -> some View {
        self.font(estilo.fonte).tracking(estilo.tracking)
    }
}

/// Acesso às cores já resolvidas para a aparência atual, sem cada view
/// precisar ler o `ColorScheme` e chamar `resolver`.
public struct CoresDoAmbiente {
    public let esquema: ColorScheme

    public init(esquema: ColorScheme) { self.esquema = esquema }

    public var fundo: Color           { DS.Cor.fundo.resolver(esquema) }
    public var superficie: Color      { DS.Cor.superficie.resolver(esquema) }
    public var superficieSutil: Color { DS.Cor.superficieSutil.resolver(esquema) }
    public var borda: Color           { DS.Cor.borda.resolver(esquema) }
    public var texto: Color           { DS.Cor.texto.resolver(esquema) }
    public var textoSutil: Color      { DS.Cor.textoSutil.resolver(esquema) }
    public var cromo: Color           { DS.Cor.cromo.resolver(esquema) }
    public var folha: Color           { DS.Cor.folha.resolver(esquema) }
    public var dado: Color            { DS.Cor.dado.resolver(esquema) }
    public var divisor: Color         { DS.Cor.divisor.resolver(esquema) }
    public var acento: Color          { DS.Cor.acento.resolver(esquema) }
    public var foco: Color            { DS.Cor.foco.resolver(esquema) }
    public var perigo: Color          { DS.Cor.perigo.resolver(esquema) }
    public var aviso: Color           { DS.Cor.aviso.resolver(esquema) }

    public func status(_ s: StatusTarefa) -> Color { DS.Cor.status(s).resolver(esquema) }
    public func tipoDeFato(_ t: String) -> Color { DS.Cor.tipoDeFato(t).resolver(esquema) }
    public func categoriaDeAgenda(_ c: String) -> Color { DS.Cor.categoriaDeAgenda(c).resolver(esquema) }
}

extension EnvironmentValues {
    public var cores: CoresDoAmbiente { CoresDoAmbiente(esquema: colorScheme) }
}
