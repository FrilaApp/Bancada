---
tipo: design
desafio: C18
data_criacao: 2026-09-10
tags: [design, revisao, anexo]
---

# Revisão profunda de UI · Log de verificação

> Relatório bruto de uma das sete lentes. A nota consolidada, com os achados
> agrupados por causa e já verificados, é
> [[06 - Design/Revisão Profunda de UI - 2026-09-10|Revisão Profunda de UI - 2026-09-10]].

# Log de verificação — o que eu confiri dos achados dos agentes

Regra: nenhum achado entra na revisão final sem eu ter aberto o arquivo citado.
Modelo dos agentes: Sonnet (o Opus estourou limite de sessão na primeira rodada).

## checklist-design

| achado | veredito |
|---|---|
| **CHK-02** `Componentes.swift:634` — `SeletorSegmentado` sem hover/pressed | **Confere.** `.buttonStyle(.plain)` na linha 635. Tem `.contentShape(Rectangle())` e `.accessibilityAddTraits`, não tem hover nem pressed. |
| **CHK-03** cartão do Acervo sem affordance | **Confere, e é pior do que ele viu** — virou FT-06: os dois gestos moram em camadas diferentes e a instrução some ao primeiro clique. |
| **CHK-01** Trabalho sem busca textual | Confere no fonte. Concordo com a gravidade baixa dele. |

## better-ui

| achado | veredito |
|---|---|
| **UI-01** prévia do calendário sem animação de entrada/saída | **Confere.** `previewDoDia` é escrito em `TelaCalendario.swift:604` e limpo em `:609`/`:613`, nenhum dos três dentro de `withAnimation`. Os três `.animation` das linhas 322–324 observam `semanasVisiveis`, `semanas.count` e `modo` — **nenhum observa `previewDoDia`**. Não há `.transition()` na `Sobreposicao`. |
| **UI-02** os "2 hover" não pintam nada | Confere com o que eu já tinha visto no `SeletorSegmentado`. |
| **UI-03** site sem `transition` e sem `:active` | **Confere, e o detalhe é melhor do que o achado.** A única ocorrência de `transition` no site inteiro é `transition: none !important` **dentro** do bloco `@media (prefers-reduced-motion: reduce)` (`base.css:64`, `estilo.css:193`). O site suprime, para quem pede menos movimento, um movimento que ele nunca teve. São 7 regras `:hover` (todas cortando seco) e **zero** `:active`. |
| **UI-04** raio `3` fora da escala | **Confere.** `TelaCalendario.swift:682` e `TelaRegistros.swift:251`, ambos `cornerRadius: 3`. `DS.Raio` começa em `sm: 6`. |

### O que o UI-01 significa, e o agente não disse

A `Sobreposicao` nasceu na correção do V-03, substituindo um `popover` nativo que
violava a recusa "sem sombra difusa". Ao trocar, o componente herdou a **forma**
que a doutrina exigia e perdeu o **comportamento** que ninguém tinha escrito: o
popover nativo animava a entrada de graça.

É o terceiro caso do mesmo padrão nesta base — regra que vira componente resolve
o que a prosa não resolvia, e abre um buraco no que a plataforma dava sem
ninguém pedir. Vale virar linha no Sistema de Design: **quando um componente do
sistema substitui um controle nativo, a dívida não é só visual — é preciso
listar o que o nativo fazia sozinho.**

## better-layout

| achado | veredito |
|---|---|
| **LAY-01** janela sem mínimo real | **Confere no essencial, com uma correção.** Diário 740 e Acervo 680 são **somas de `minWidth` declarados** — confirmados. Já o "Trabalho 600" **não é declarado**: `TelaTarefas.swift:39-74` tem seis `TableColumn` **sem largura nenhuma**, e `TelaTrabalho.swift:30` é um `VSplitView` (restringe altura, não largura). O modo de falha do Trabalho é **outro**: as colunas espremem até ilegível em vez de cortar. Convergente com o meu FT-03; o ponto de quebra manda-chuva é o Diário, em **920** com a barra lateral. |
| **LAY-02** o mesmo fato tem três layouts, não dois | **Confere.** `LinhaDeFato` (`Componentes.swift:274`) tem exatamente **dois** consumidores: `TelaTrabalho.swift:97` e `TelaCalendario.swift:693`. Diário e Registros reimplementam a linha à mão. |
| **LAY-03** o comentário promete o que a linha seguinte não faz | **Confere, literalmente.** `TelaAcervo.swift:212-214`: o comentário diz *"mesma superfície de leitura, mesmo tratamento"* e a linha seguinte chama `TextoDeNota(derivado.corpo)` **sem o `Folha`** — que é justamente o que dá a superfície. O Diário faz certo (`TelaDiario.swift:52-57`, `Folha { TextoDeNota(...) }`). |

### LAY-02 é a terceira face do mesmo defeito

A nota de sistema já recusa **"controle nativo onde o sistema já tem o seu"** (V-05)
e **"peça de sistema sem consumidor"** (a saída do `Distintivo`). O LAY-02 é a
face que falta: **peça de sistema com consumidor parcial** — existe, é usada por
duas telas, e outras duas escrevem à mão a mesma coisa. É o estado mais difícil
de perceber dos três, porque a peça não parece morta nem parece ignorada.

## better-accessibility

| achado | veredito |
|---|---|
| **A11Y-01** o app não monta `NSMenu` nenhum | **Confere, e é o achado mais grave da rodada.** `main.swift` tem 60 linhas; `NSMenu` não aparece em nenhuma. `app.setActivationPolicy(.regular)` na linha 59, `NSApp.mainMenu` nunca atribuído. |
| **A11Y-02** Acervo é beco sem saída de teclado | **Confere.** `TelaAcervo.swift:51` usa `.onTapGesture`, sem `Button` e sem `.focusable()` — e é a mesma linha do meu FT-06. Os dois achados são o mesmo defeito visto por lentes diferentes. |
| **A11Y-03** link de Markdown real fica com cara de link e não faz nada | **Confere, literalmente.** `TextoDeNota.swift:237`: `case let .link(rotulo, _)` — **a URL é descartada no `_`** e o texto sai com acento **e sublinhado**. O wikilink (`:236`) sai com acento e **sem** sublinhado, e é decisão documentada. O sublinhado é a affordance mais forte que existe para "clicável", aplicada ao que não é. |

### A11Y-01 custa mais do que acessibilidade

Sem `NSMenu` não há **Cmd+Q**, **Cmd+W**, **Cmd+M** — e, o que pesa mais neste
app: não há menu **Editar**, logo não há **Cmd+C**. A Bancada é um **leitor** de
vault. O usuário não pode copiar uma linha do que está lendo, e não pode fechar
o app pelo teclado.

Isso não é lacuna de acessibilidade: é o piso da plataforma faltando. E ele
atinge todo mundo, não só quem navega por teclado.

**Segunda vez que o comentário promete o que o código não faz.** `main.swift:14-15`
diz textualmente *"a Bancada é uma janela de trabalho, com Dock e **menu**"* — e
o menu nunca é construído. O LAY-03 é o mesmo padrão em `TelaAcervo.swift:212`.
Duas ocorrências deixam de ser descuido e viram coisa a procurar: **comentário
como promessa não verificada.**
