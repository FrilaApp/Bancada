import SwiftUI
import VaultKit

/// A superfície de leitura de uma nota.
///
/// Antes daqui, o Diário mostrava `# 2026-09-09`, os hifens de lista e as
/// crases como caractere, em serifa — e a serifa piorava, porque fazia a falha
/// parecer intenção. A voz de narrativa existe porque narrativa é "uma pessoa
/// falando"; o que estava na tela era o arquivo-fonte falando.
///
/// O mapeamento de voz é o mesmo do site, e não é decorativo:
///
/// - **narrativa (serifada)** — título, parágrafo, item de lista, citação;
/// - **fato (mono)** — código, cerca de código e o rótulo do callout, porque
///   tudo isso é máquina falando dentro do texto de gente;
/// - **interface (sans)** — tabela, porque tabela é dado tabulado e não prosa.
///
/// Um wikilink sai no acento e sem gesto de clique: a Bancada não navega entre
/// notas a partir do corpo, e um link que não leva a lugar nenhum seria pior
/// que texto marcado.
public struct TextoDeNota: View {
    @Environment(\.cores) private var cores
    private let blocos: [Markdown.Bloco]

    public init(_ markdown: String) {
        self.blocos = Markdown.blocos(de: markdown)
    }

    public init(blocos: [Markdown.Bloco]) {
        self.blocos = blocos
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.md) {
            ForEach(Array(blocos.enumerated()), id: \.offset) { _, b in
                vista(de: b)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .textSelection(.enabled)
    }

    @ViewBuilder
    private func vista(de b: Markdown.Bloco) -> some View {
        switch b {
        case let .titulo(nivel, trechos):
            texto(trechos)
                .font(fonteDeTitulo(nivel))
                .foregroundStyle(cores.texto)
                .padding(.top, nivel <= 2 ? DS.Espaco.sm : 0)

        case let .paragrafo(trechos):
            texto(trechos)
                .font(DS.Tipografia.leitura)
                .lineSpacing(DS.Tipografia.entrelinhaDeLeitura)
                .foregroundStyle(cores.texto)

        case let .lista(itens):
            VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                ForEach(Array(itens.enumerated()), id: \.offset) { _, item in
                    linhaDeItem(item)
                }
            }

        case let .citacao(linhas):
            HStack(alignment: .top, spacing: DS.Espaco.md) {
                Rectangle()
                    .fill(cores.borda)
                    .frame(width: 3)
                VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                    ForEach(Array(linhas.enumerated()), id: \.offset) { _, linha in
                        texto(linha)
                            .font(DS.Tipografia.leitura)
                            .lineSpacing(DS.Tipografia.entrelinhaDeLeitura)
                            .foregroundStyle(cores.textoSutil)
                    }
                }
            }
            .fixedSize(horizontal: false, vertical: true)

        case let .callout(tipo, titulo, corpo):
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                // O tipo é dito pelo rótulo, não por uma barra colorida na
                // lateral — mesma escolha do site, para as duas superfícies não
                // divergirem no visual.
                Text(titulo ?? tipo)
                    .font(DS.Tipografia.rotulo)
                    .textCase(.uppercase)
                    .foregroundStyle(corDeCallout(tipo))
                ForEach(Array(corpo.enumerated()), id: \.offset) { _, linha in
                    texto(linha)
                        .font(DS.Tipografia.leitura)
                        .lineSpacing(DS.Tipografia.entrelinhaDeLeitura)
                        .foregroundStyle(cores.texto)
                }
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(cores.dado, in: RoundedRectangle(cornerRadius: DS.Raio.md))

        case let .codigo(_, corpo):
            ScrollView(.horizontal, showsIndicators: false) {
                Text(corpo)
                    .font(DS.Tipografia.mono)
                    .foregroundStyle(cores.texto)
                    .padding(DS.Espaco.md)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(cores.dado, in: RoundedRectangle(cornerRadius: DS.Raio.md))

        case let .tabela(cabecalho, linhas):
            tabela(cabecalho: cabecalho, linhas: linhas)

        case .regra:
            Divisor()
        }
    }

    // MARK: - Peças

    private func fonteDeTitulo(_ nivel: Int) -> DS.EstiloDeTexto {
        // Só dois degraus: o vault usa `#` para o título da nota e `##` para as
        // seções fixas do diário. Uma escala de seis passos seria escala para
        // um Markdown que ninguém escreve aqui.
        nivel <= 2 ? DS.Tipografia.leituraTitulo : DS.Tipografia.secao
    }

    private func corDeCallout(_ tipo: String) -> Color {
        switch tipo {
        case "warning", "aviso", "caution", "attention": return cores.status(.revisao)
        case "danger", "error", "erro", "bug":           return cores.perigo
        case "success", "tip", "sucesso", "dica":        return cores.status(.concluida)
        default:                                          return cores.acento
        }
    }

    @ViewBuilder
    private func linhaDeItem(_ item: Markdown.Item) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.sm) {
            marca(item.marca)
            if case .vazia = item.marca {
                // Ocupa a linha sem fingir conteúdo: um marcador vazio no
                // template é um campo esperando ser preenchido, e some no
                // texto se a gente o apagar.
                Text(" ")
                    .font(DS.Tipografia.leitura)
                    .accessibilityLabel("item vazio")
            } else {
                texto(item.trechos)
                    .font(DS.Tipografia.leitura)
                    .lineSpacing(DS.Tipografia.entrelinhaDeLeitura)
                    .foregroundStyle(cores.texto)
            }
            Spacer(minLength: 0)
        }
        .padding(.leading, CGFloat(item.recuo / 2) * DS.Espaco.lg)
    }

    @ViewBuilder
    private func marca(_ m: Markdown.Marca) -> some View {
        switch m {
        case .ponto:
            Text("•").font(DS.Tipografia.leitura).foregroundStyle(cores.textoSutil)
        case let .numero(n):
            Text("\(n).")
                .font(DS.Tipografia.mono)
                .monospacedDigit()
                .foregroundStyle(cores.textoSutil)
        case let .tarefa(feita):
            Image(systemName: feita ? "checkmark.square.fill" : "square")
                .font(DS.Icone.fonte(DS.Icone.medio))
                .foregroundStyle(feita ? cores.status(.concluida) : cores.textoSutil)
        case .vazia:
            Text("—").font(DS.Tipografia.leitura).foregroundStyle(cores.borda)
        }
    }

    private func tabela(cabecalho: [[Markdown.Trecho]], linhas: [[[Markdown.Trecho]]]) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top, spacing: DS.Espaco.lg) {
                    ForEach(Array(cabecalho.enumerated()), id: \.offset) { _, celula in
                        texto(celula)
                            .font(DS.Tipografia.rotulo)
                            .textCase(.uppercase)
                            .foregroundStyle(cores.textoSutil)
                            .frame(minWidth: 80, alignment: .leading)
                    }
                }
                .padding(.vertical, DS.Espaco.sm)
                Divisor()
                ForEach(Array(linhas.enumerated()), id: \.offset) { _, linha in
                    HStack(alignment: .top, spacing: DS.Espaco.lg) {
                        ForEach(Array(linha.enumerated()), id: \.offset) { _, celula in
                            texto(celula)
                                .font(DS.Tipografia.corpo)
                                .foregroundStyle(cores.texto)
                                .frame(minWidth: 80, alignment: .leading)
                        }
                    }
                    .padding(.vertical, DS.Espaco.sm)
                    Divisor()
                }
            }
        }
    }

    // MARK: - Linha

    /// Monta a linha concatenando `Text`, o que preserva a quebra natural de
    /// texto. Um `HStack` de pedaços quebraria por pedaço e deixaria buracos no
    /// meio do parágrafo.
    private func texto(_ trechos: [Markdown.Trecho]) -> Text {
        trechos.reduce(Text("")) { acumulado, trecho in
            acumulado + pedaco(trecho)
        }
    }

    private func pedaco(_ t: Markdown.Trecho) -> Text {
        switch t {
        case let .texto(s):
            return Text(s)
        case let .forte(s):
            return Text(s).fontWeight(.semibold)
        case let .enfase(s):
            return Text(s).italic()
        case let .riscado(s):
            return Text(s).strikethrough()
        case let .codigo(s):
            // Voz de fato dentro da voz de narrativa: um hash de commit ou um
            // caminho de arquivo não é prosa, mesmo no meio de uma frase.
            return Text(s)
                .font(DS.Tipografia.mono.fonte)
                .foregroundColor(cores.textoSutil)
        case let .wikilink(_, rotulo):
            // Acento sem sublinhado: sinaliza "isto aponta para algo" sem
            // prometer o clique que a Bancada não dá — ela lê o vault, o
            // Obsidian navega nele. Decisão registrada na nota de design.
            return Text(rotulo).foregroundColor(cores.acento)
        case let .link(rotulo, _):
            // Mesmo tratamento, pela mesma razão. Saía sublinhado, que é a
            // affordance mais forte que existe para "clicável" — sobre um
            // texto sem gesto, sem teclado e sem traço de link para o
            // VoiceOver. Um caso era decisão e o outro era esquecimento, e
            // nada na tela distinguia os dois.
            return Text(rotulo).foregroundColor(cores.acento)
        case let .imagem(alvo, legenda):
            let nome = legenda ?? (alvo as NSString).lastPathComponent
            return Text("🖼 \(nome)")
                .font(DS.Tipografia.detalhe.fonte)
                .foregroundColor(cores.textoSutil)
        }
    }
}
