---
tipo: design
desafio: C18
data_criacao: 2026-09-10
tags: [design, revisao, anexo]
---

# Revisão profunda de UI · Acessibilidade

> Relatório bruto de uma das sete lentes. A nota consolidada, com os achados
> agrupados por causa e já verificados, é
> [[06 - Design/Revisão Profunda de UI - 2026-09-10|Revisão Profunda de UI - 2026-09-10]].

# Achados — Acessibilidade

Lente: acessibilidade, adaptada para SwiftUI/macOS (app) e HTML/CSS puro (site).
Não abri o app nem rodei VoiceOver — tudo abaixo vem da leitura do fonte. Não
repito V-01 a V-07 nem os débitos já registrados (`Cor.foco`/`Traco.foco` sem
uso, 16 tamanhos fora da escala, véu à mão em `TelaTarefas.swift:128`, zero
`@FocusState`, zero `.disabled(`, zero Dynamic Type, zero Reduzir Movimento) —
onde aprofundo um desses, marco explicitamente "aprofundamento de débito
registrado", não achado novo.

---

## Achados, do mais grave ao menor

### A11Y-01 · O app não tem menu — Cmd+Q e Cmd+W não existem
**Onde:** `Bancada/Sources/Bancada/main.swift:16-60`
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código — nenhum `NSMenu`, `mainMenu` ou
`Commands` em todo `Sources/`, `grep -rn "NSMenu\|mainMenu\|keyEquivalent" Sources/` não retorna nada)
**O que está errado:** `DelegadoDoApp.applicationDidFinishLaunching` cria a
`NSWindow` direto, sem nunca montar `NSApp.mainMenu`. Sem menu, a barra de
menu do app fica vazia — sem menu de Aplicativo, sem Editar, sem Janela. Não
existe `NSMenuItem` de "Sair" com `keyEquivalent: "q"`, então **Cmd+Q não tem o
que disparar** (o mesmo vale para Cmd+W). Não medi em runtime — é
consequência direta e bem conhecida da ausência de menu no AppKit, então
marco a causa como confirmada e o efeito em runtime como **plausível**.
**Por que importa:** é o beco sem saída mais caro de todos: uma pessoa que
não usa mouse não tem via convencional para sair do app. A única saída seria
clicar no botão vermelho da janela.
**Correção:** montar um `NSMenu` mínimo no `applicationDidFinishLaunching` —
Aplicativo (Sobre, Sair com Cmd+Q), Editar (Cortar/Copiar/Colar/Selecionar
Tudo, para os campos de busca) e Janela (Minimizar Cmd+M, Cmd+W). É config de
uma tela só; não precisa de `Commands` do SwiftUI porque a janela já é AppKit
puro.

### A11Y-02 · Selecionar um item no Acervo não tem caminho de teclado
**Onde:** `Bancada/Sources/Bancada/Telas/TelaAcervo.swift:49-52`
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código)
**O que está errado:**
```swift
CartaoDeMidia(midia: midia, selecionada: midia.id == selecionada)
    .onTapGesture { selecionada = midia.id }
```
`CartaoDeMidia` não é um `Button`, não tem `.focusable()`, não tem
`onKeyPress`. A seleção só existe via `onTapGesture`, e o duplo clique que abre
o arquivo (`TelaAcervo.swift:131`) é a mesma história. Ao contrário de
`TelaCalendario` (que usa `Button` + `.focusable()` na tela toda) e de
`TelaTarefas` (que usa `Table` nativa), aqui não há nenhum ponto de entrada de
teclado — nem Tab, nem seta, nem Enter.
**Por que importa:** é um dos quatro percursos que o escopo pede para andar
sem mouse ("selecionar arquivo no Acervo"), e aqui ele simplesmente não existe.
Sem depender de o "Acesso total pelo teclado" do sistema estar ligado — não
há nem o `Button` que esse ajuste do sistema tornaria alcançável.
**Correção:** trocar `CartaoDeMidia` por um `Button { selecionada = midia.id }`
(como a grade do Acervo já deveria ter sido, no mesmo espírito de
`TelaTarefas`), com `.accessibilityLabel("\(midia.nome), \(pasta)")` e o duplo
clique preservado como ação secundária. Setas para andar entre cartões
seguiriam o mesmo padrão de `TelaCalendario.andar(_:)`.

### A11Y-03 · Link de Markdown (e wikilink) parecem link e não são clicáveis
**Onde:** `Bancada/Sources/DesignSystem/TextoDeNota.swift:235-238`
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código)
**O que está errado:**
```swift
case let .wikilink(_, rotulo):
    return Text(rotulo).foregroundColor(cores.acento)
case let .link(rotulo, _):
    return Text(rotulo).foregroundColor(cores.acento).underline()
```
O wikilink sem gesto é decisão documentada no comentário da struct ("a Bancada
não navega entre notas a partir do corpo") — não é achado. Mas `.link` é um
link de Markdown de verdade, `[texto](url)`, com um `destino` que o parser
extrai (`Markdown.swift:32`) e que aqui é descartado (`_`). O resultado:
sublinhado + cor de acento — a mesma linguagem visual que `SeletorSegmentado`
e outros usam para dizer "isto reage" — sobre um texto sem `onTapGesture`, sem
`Link`, sem traço de acessibilidade. As URLs do checklist.design citadas em
`Revisão de UI - 2026-09-09.md`, por exemplo, ficam assim: sublinhadas e
mortas.
**Por que importa:** viola de frente a regra "se parece clicável, tem que ser
clicável" — e para quem usa VoiceOver é pior: nenhum rotor de links encontra
nada, porque não há traço de link nenhum.
**Correção:** para `.link`, abrir `destino` via `NSWorkspace.shared.open`
num `Button`/gesto — ou, se a decisão for não navegar (mesmo motivo do
wikilink), tirar o sublinhado para não prometer clique. De qualquer forma,
decida uma vez só e aplique aos dois casos: hoje um é decisão e o outro é
esquecimento, e nada na tela distingue os dois.

### A11Y-04 · `SeletorSegmentado` não tem teclado próprio, e está em duas telas
**Onde:** `Bancada/Sources/DesignSystem/Componentes.swift:590-648`
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li o código)
**O que está errado:** cada opção é um `Button` solto, sem `.focusable()`,
sem `onKeyPress`, sem roving tabindex — nada que replique o padrão de setas
que `TelaCalendario` implementa para a grade de dias. É o mesmo componente em
`TelaCalendario` (trocar Mês/Semana/Lista) e `TelaAjustes` (trocar aparência):
nos dois lugares, andar entre as opções por teclado depende inteiramente do
"Acesso total pelo teclado" do sistema estar ligado — e mesmo ligado, não há
Home/End, não há wrap, não há nada do padrão de grupo de botões da ARIA APG
(equivalente ao `radio group`/tabs do macOS).
**Por que importa:** é a mesma peça em dois lugares falhando do mesmo jeito —
exatamente o tipo de vocabulário que valeria a pena consertar uma vez no
componente, em vez de cada tela reinventar depois.
**Correção:** dar ao próprio `SeletorSegmentado` um `@FocusState` interno e
`onKeyPress(.leftArrow/.rightArrow)` que move a seleção entre `opcoes`
(wrap nas pontas), com o anel de foco desenhado com `DS.Cor.foco`/
`DS.Traco.foco` — os dois tokens que já existem e não têm ponto de uso. É o
"desenho único de anel de foco" que o escopo pede como peça do DS, aplicado
ao primeiro componente que precisa dele.

### A11Y-05 · Puxador do calendário: só mouse, e a área de arrasto é menor que o alvo mínimo
**Onde:** `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:437-467`
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li o código: `DS.Calendario.alturaDoPuxador = 14`
em `Tokens.swift:305`)
**O que está errado:** `puxador` só responde a `DragGesture` e
`onTapGesture` — nenhum `onKeyPress`, nenhuma alternativa de teclado para
"estender para o mês"/"comprimir para a semana", apesar de ter
`.accessibilityLabel`. E a área real de toque é `.frame(height:
DS.Calendario.alturaDoPuxador)` = **14pt de altura** (largura infinita), não os
~2pt visíveis da `Capsule`, mas 14pt ainda é pequeno: a WCAG 2.5.8 (AA) usa
24×24 CSS px como piso, e é o número que também serve de referência sensata
para alvo de ponteiro no macOS — o HIG não fixa um valor formal para clique de
mouse, mas 24pt é o que a maioria dos controles compactos do próprio sistema
usa como mínimo confortável (bem abaixo dos 44pt de toque do iOS, que não se
aplica aqui).
**Por que importa:** a única forma de sanfonar a grade do mês vira
inacessível por teclado, e por mouse tem uma faixa mais estreita que o
recomendado para acertar de primeira.
**Correção:** com a tela já com foco (`.focusable()` em `TelaCalendario`),
adicionar `onKeyPress` (ex.: `+`/`-` ou Cmd+seta) chamando `comprimir(para:)`
diretamente — a função já existe e é a mesma que o arrasto usa. Para a área de
toque, subir `alturaDoPuxador` para 24pt ou manter 14pt visível e estender o
hit target com um `.contentShape(Rectangle())` maior, como a regra de "área
de toque vs. elemento visível" já descreve.

### A11Y-06 · `Thumbnail` não tem texto alternativo nem é marcada como decorativa
**Onde:** `Bancada/Sources/Bancada/Telas/Thumbnail.swift:33-47` (uso em
`TelaAcervo.swift:106`, `TelaRegistros.swift:221` e `:239`)
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado (li o código — nenhum `.accessibilityLabel` ou
`.accessibilityHidden` em `Thumbnail.swift`)
**O que está errado:** `Image(nsImage: imagem)` não carrega rótulo. Em
`CartaoDeMidia`, a miniatura fica ao lado do nome do arquivo em texto — a
imagem é redundante com o texto visível, não informativa por si (é uma prévia
de QuickLook, não um conteúdo com significado próprio).
**Por que importa:** VoiceOver para nesse nó sem dizer nada útil (ou lê o
nome do arquivo do sistema, dependendo do fallback do `Image`), duplicando ou
poluindo o que o texto ao lado já diz certo.
**Correção:** já que é redundante com texto adjacente, `.accessibilityHidden(true)`
no `Thumbnail` quando usado em `CartaoDeMidia` e nos cartões de
`CartaoComparativoUI`. No painel de detalhe (`PainelDeMidia`, thumbnail
grande e só), o mesmo raciocínio vale, porque o nome já aparece abaixo dela.

### A11Y-07 · O X do chip removível não tem alvo mínimo de clique
**Onde:** `Bancada/Sources/DesignSystem/Componentes.swift:572-576`
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado (li o código — sem `.frame`/`.contentShape` além do
ícone)
**O que está errado:** `Image(systemName: "xmark").font(.system(size: 7,
weight: .bold))` dentro de um `Button` sem nenhum `.frame(minWidth:minHeight:)`
nem `.contentShape` maior — o alvo de clique é o glifo em si, bem abaixo dos
~24pt de referência para clique de mouse. O rótulo acessível já existe
(`"Remover o filtro \(texto)"`), então o problema é só de área, não de nome.
**Por que importa:** é o menor alvo clicável do app citado no próprio escopo
da revisão, e some visualmente ao lado de um chip que já é pequeno.
**Correção:** `.frame(minWidth: 20, minHeight: 20)` no botão (não no ícone) e
`.contentShape(Rectangle())` para o alvo cobrir o frame, não o desenho do X.

### A11Y-08 · O site (as duas saídas) não tem link de pular navegação
**Onde:** `Bancada/scripts/gerar-site.js:216-246` (função `pagina()`, molde
multi-página) e `:531-557` (`htmlPaginaUnica()`)
**Superfície:** site
**Gravidade:** média
**Confiança:** confirmado (`grep -in "skip\|pular\|sr-only" scripts/gerar-site.js
scripts/estilo/*.css` não retorna nada)
**O que está errado:** toda página multi-página repete `<header>` (marca +
`nav` com 4 links) e depois `<aside>` com o índice inteiro de notas por seção
antes de chegar no `<main>`. A página única repete a barra lateral com todo o
menu de navegação antes do conteúdo. Nenhuma das duas tem um link "Pular para
o conteúdo" como primeiro elemento focável, e `<main>` não tem `id`.
**Por que importa:** quem navega por teclado tem que passar pelos 4 links do
header e por todos os grupos do índice lateral (que crescem a cada nota nova)
para chegar no conteúdo — em toda página, sempre.
**Correção:** no molde `pagina()`, primeiro filho do `<body>` um
`<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>`, com
`<main id="conteudo">`, escondido via `position: absolute` fora da tela e
revelado em `:focus` (padrão do `focus-and-keyboard.md`). Mesma peça em
`base.css`, usada pelos dois moldes.

### A11Y-09 · Página única: trocar de seção não move o foco nem anuncia nada
**Onde:** `Bancada/scripts/gerar-site.js:558-572` (função `mostrar` dentro de
`htmlPaginaUnica()`)
**Superfície:** site
**Gravidade:** baixa
**Confiança:** confirmado (li o código)
**O que está errado:** `mostrar(id)` alterna `hidden` nas `.tela` e a classe
`ativo`/`aria-current` nos botões do menu — mas o foco continua no botão
clicado, e nada anuncia a troca. Para quem vê a tela isso é óbvio (o conteúdo
muda visualmente); para quem usa leitor de tela, nada indica que o "documento"
virou outro.
**Por que importa:** cada botão do menu funciona como uma troca de rota —
mesmo caso do "SPA route change" da web comum — e a página não segue a prática
de mover foco para o novo título.
**Correção:** em `mostrar(id)`, depois de trocar `hidden`, mover foco para o
`h1`/`h2` da seção revelada (`querySelector('#' + id + ' h1, #' + id + ' h2')`
com `tabindex="-1"` e `.focus()`), como o padrão de troca de rota já pede.

---

## Inventário de controles interativos do app

Peça central pedida no escopo. `tem` = modificador presente e correto; `falta`
= ausente; `parcial` = tem nome mas falta papel/estado, ou vice-versa.

| Controle | Onde | Nome acessível | Papel | Estado | O que falta |
|---|---|---|---|---|---|
| Botões "Mês anterior"/"Próximo mês" | `TelaCalendario.swift:141,150` | tem (`.accessibilityLabel`) | tem (`Button` nativo) | n/a | nada |
| Célula do dia | `TelaCalendario.swift:337-407` | tem (`rotuloAcessivel`) | tem (`.accessibilityAddTraits`) | tem (`.isSelected`) | nada |
| Puxador do calendário | `TelaCalendario.swift:437-467` | tem | falta (`.isButton` nunca é adicionado) | falta | traço de papel + teclado (ver A11Y-05) |
| Campo de busca (`CampoDeBusca`) | `Componentes.swift:432-474` | tem (placeholder, convenção macOS) | tem (`TextField` nativo) | n/a | nada |
| Botão "Limpar" do campo de busca | `Componentes.swift:453-464` | tem | tem | n/a | nada |
| `MenuDeFiltro` (Espécie/Autor) | `Componentes.swift:496-554` | parcial (rótulo só no `.help`, não em `.accessibilityLabel`) | tem (`Menu` nativo) | parcial (contador não é lido como valor) | `.accessibilityLabel` explícito; `.accessibilityValue` para o contador |
| `ChipRemovivel` (X) | `Componentes.swift:557-583` | tem | tem (`Button`) | n/a | alvo mínimo (A11Y-07) |
| Botão "Limpar" (chips ativos) | `TelaCalendario.swift:246-249` | falta | tem (`Button`) | n/a | `.accessibilityLabel("Limpar todos os filtros")` — hoje só o texto visível "Limpar", ambíguo fora de contexto |
| `SeletorSegmentado` (Mês/Semana/Lista; Aparência) | `Componentes.swift:590-648` | tem (`.accessibilityAddTraits`) | tem | tem (`.isSelected`) | teclado próprio (A11Y-04) |
| Cartão de mídia (Acervo) | `TelaAcervo.swift:98-145` | falta | falta (nem `Button` nem trait) | falta | tudo — não é `Button`; ver A11Y-02 |
| `Thumbnail` | `Thumbnail.swift` | falta | n/a (imagem) | n/a | `.accessibilityHidden(true)` (A11Y-06) |
| Botões "Abrir"/"Mostrar no Finder" (painel de mídia) | `TelaAcervo.swift:179-185` | tem (texto do botão) | tem | n/a | nada |
| Linha de "Notas fora da convenção" | `TelaAjustes.swift:47-61` | tem (texto interno) | tem (`Button`) | n/a | nada, mas o nome acessível concatena caminho + motivo sem pausa — plausível que VoiceOver leia como uma frase só |
| Botões "Escolher vault…"/"Recarregar"/"Mostrar no Finder" | `TelaAjustes.swift:152-158`, `JanelaPrincipal.swift:134-149` | tem | tem | falta (nunca desabilita, ver aprofundamento abaixo) | estado |
| `SeletorSegmentado` de Aparência | `TelaAjustes.swift:99-107` | mesmo caso do `SeletorSegmentado` acima | | | |
| Linha da barra lateral (Calendário/Trabalho/Diário/Acervo/Ajustes) | `JanelaPrincipal.swift:48-52` | **falta — V-06, não repito** | | | |
| Link de Markdown / wikilink no corpo da nota | `TextoDeNota.swift:235-238` | falta (não é elemento algum) | falta | n/a | tudo — ver A11Y-03 |
| Botões de filtro de status (Tarefas) | `TelaTarefas.swift:122-132` | tem (texto do botão) | tem | tem (implícito por cor, sem estado formal) | `.accessibilityAddTraits(.isSelected)` quando `ativo`, hoje só muda de cor |
| `Table` de tarefas | `TelaTarefas.swift:38-80` | tem (cabeçalhos nativos) | tem | tem | nada — `Table` nativa cobre bem |
| `List` da barra lateral e de conteúdo (Diário, Registros, painel do dia) | várias | parcial | tem (`List` nativa) | tem (seleção nativa) | ver observação abaixo |

**Observação sobre as `List` de conteúdo (Diário, Registros, painel do dia):**
não consegui confirmar sem a árvore de acessibilidade (proibida nesta rodada)
se o mesmo efeito de V-06 — uma linha com `Label`+`.badge()` expondo só o
número — se repete nas linhas que empilham dois `Text` num `VStack` dentro de
`List` (`TelaDiario.swift:37-43`, `TelaRegistros.swift`). O mecanismo é
diferente (não há `.badge()` aqui), então marco como **não verificado**, não
como extensão de V-06 — fica como item para a próxima passada com VoiceOver.

## Ordem de foco por tela

- **Calendário:** busca → filtro Espécie → filtro Autor → "Limpar" (se ativo)
  → seletor de modo → grade (célula a célula, via `.focusable()` da tela) →
  puxador (sem foco próprio hoje) → painel do dia. A tela é a única com ordem
  garantida por código (as setas), mas o puxador fica fora da sequência.
- **Trabalho:** filtro de status → `Table` (ordem de coluna nativa) → "Ver
  todos os fatos" (quando há tarefa selecionada) → lista de fatos.
- **Diário:** lista de notas → `Folha` (texto, sem controle) → lista de
  fatos do dia. Sem `.focusable()` nenhum declarado; a ordem que existe é a
  do `List` nativo.
- **Acervo:** filtro por espécie (pílulas, `Button`) → grade — **sem ordem
  de foco alguma**, porque não há elemento focável (A11Y-02) → painel de
  detalhe (botões "Abrir"/"Mostrar no Finder").
- **Ajustes:** "Escolher vault…" → "Recarregar" → "Mostrar no Finder" →
  seletor de aparência → lista de notas fora da convenção (se houver).

## Percursos só de teclado — becos sem saída

1. **Escolher vault:** o botão está na toolbar; alcançável por Tab/Acesso
   total pelo teclado, e o `NSOpenPanel` que abre é nativo e plenamente
   operável por teclado. Sem beco.
2. **Filtrar o calendário:** funciona — campo de busca e menus são nativos,
   Escape limpa o filtro (`TelaCalendario.swift:130`). Sem beco.
3. **Selecionar arquivo no Acervo:** beco sem saída — A11Y-02.
4. **Trocar aparência em Ajustes:** depende inteiramente do "Acesso total
   pelo teclado" do sistema estar ligado, porque `SeletorSegmentado` não tem
   teclado próprio (A11Y-04) — sem esse ajuste do sistema, é outro beco.
5. **Sair do app:** beco sem saída — A11Y-01. Não pedido explicitamente no
   escopo, mas apareceu ao mapear os percursos e é mais grave que os quatro
   pedidos.

## Dynamic Type e Reduzir Movimento — custo concreto

Alturas fixas que cortam texto quando a fonte cresce (todas em
`Tokens.swift`):

- `Calendario.alturaMinimaDaCelula = 88` — a célula empilha número do dia,
  até 2 chips de evento e o "+N"; com Dynamic Type grande, o texto do chip
  (`ChipDeEvento`, fonte `monoDetalhe`) estoura a célula antes da altura.
- `Galeria.alturaThumbnail = 128` — fixa por token, não por conteúdo; texto
  abaixo dela (nome + pasta) já usa `.lineLimit`, então o corte vai para lá,
  não para a miniatura — mas o cartão como um todo não cresce.
- `BarraLateral.alturaDoRodape = 36` — uma `List` de uma linha com altura
  travada; o rótulo "Ajustes" cortaria primeiro que qualquer outro texto do
  app, porque é o único texto de interface preso a uma altura em pt fixo tão
  justa.
- `Marcador.larguraDoTipo = 58` — `MarcadorDeTipo` trava a largura do texto
  do tipo (`commit`, `pages`, `ui`...) nesse valor; em mono e com Dynamic Type
  grande, tipos mais longos (`sessao`) truncam primeiro.

Das duas animações do sistema (`DS.Movimento.rapido` e `.padrao`), a que mais
precisa de `@Environment(\.accessibilityReduceMotion)` é `.padrao` (0,20s)
quando anima `semanasVisiveis`/`semanas.count` em `TelaCalendario.swift:322-324`:
é uma reflow de grade inteira (a grade cresce/encolhe de 1 para até 6 linhas),
o tipo de mudança de escala grande que o Reduzir Movimento pede para trocar
por corte instantâneo. `.rapido` (0,12s), usado nos chips de filtro e na
`Pilula`, é feedback breve de estado — o tipo que a diretriz deixa passar sem
guarda.

## `.disabled(` — aprofundamento do débito registrado

"Recarregar" (`TelaAjustes.swift:153`, `JanelaPrincipal.swift:141-149`) fica
clicável sem vault aberto e durante a leitura. `EstadoDaBancada.carregando`
(`EstadoDaBancada.swift:46,119-120`) já existe, já é `true` durante
`recarregar()`, e nunca é lido por nenhuma view — é a peça que falta, não uma
peça nova.

Desabilitar é a resposta certa aqui (ao contrário de um botão de enviar
formulário): recarregar duas vezes ao mesmo tempo é redundante, não é um erro
de validação para o usuário corrigir. Ordem sugerida: (1) `Recarregar` com
`.disabled(estado.carregando || estado.raiz == nil)`; (2) o mesmo para o botão
da toolbar (`JanelaPrincipal.swift:141-149`); (3) trocar o rótulo por um
`ProgressView` inline mantendo o texto "Recarregar" visível durante a leitura
(nunca um spinner sozinho, para quem usa leitor de tela continuar sabendo
qual botão está ocupado).

## O que não consegui verificar

- Nada em runtime: não abri o app, não usei VoiceOver, não medi pixel de
  alvo de toque com régua — todos os tamanhos vêm do valor do token, não de
  captura de tela.
- Se `Table` (Trabalho) e `List` (Diário, Registros) realmente sofrem do
  mesmo efeito de V-06 (nome acessível incompleto) — mecanismo diferente do
  `.badge()` que causou V-06, então não estendi o achado, só registrei a
  dúvida.
- Se "Acesso total pelo teclado" vem ligado por padrão nesta versão do macOS
  teria efeito prático imediato sobre A11Y-04; tratei como desligado por
  padrão (comportamento histórico) e marquei o efeito como plausível.
- Não testei o site em leitor de tela real nem em zoom de 200% num navegador;
  a leitura de CSS mostra `:focus-visible` e `prefers-reduced-motion`
  corretos, então não são achados — mas não é o mesmo que confirmar
  renderizado.

## Proposta — seção "Acessibilidade" para o Sistema de Design

Acessibilidade não é uma auditoria depois; é vocabulário, do mesmo jeito que
cor e tipografia são. Todo componente que expõe uma ação — botão, célula,
pílula, chip — declara nome, papel e estado antes de declarar aparência: sem
isso, ele não está pronto, mesmo que pareça pronto na tela. `DS.Cor.foco` e
`DS.Traco.foco` não são detalhe visual, são o contrato de que quem navega por
teclado sempre sabe onde está — e por isso pertencem a um componente do
sistema (um modificador de anel de foco), não a uma frase de intenção que cada
tela reimplementa ou esquece. Todo controle que só responde a arrasto ou
clique — puxador, cartão de mídia — precisa de um caminho de teclado
equivalente antes de ser considerado terminado; se a tela já usa
`.focusable()` e setas em um lugar, esse padrão é do sistema, não da tela, e
os próximos controles o herdam em vez de reinventar. Imagem ao lado de texto
que já a nomeia é decorativa e se marca como tal; imagem sem texto ao lado
precisa de um rótulo que descreva o que ela mostra, nunca o nome do arquivo.
Texto que parece link — sublinhado, cor de acento — é clicável, ou não recebe
essa aparência; o sistema não empresta a linguagem visual de ação a texto que
não age. Um controle desabilitado é uma decisão de estado, não a ausência de
uma: declare a condição exata que desabilita, e prefira manter habilitado e
comunicar com clareza sobre desabilitar sem explicação. Nenhuma dessas regras
é nova em espécie — são as mesmas de camada, papel e voz que já governam cor
e tipo, aplicadas a quem não vê a tela ou não usa mouse.
