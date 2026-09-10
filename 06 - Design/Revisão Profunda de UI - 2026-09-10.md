---
tipo: design
desafio: C18
data_criacao: 2026-09-10
tags: [design, revisao]
---

# Revisão profunda de UI — 2026-09-10

A [[06 - Design/Revisão de UI - 2026-09-09|revisão do Cauê]] olhou o app com
dois olhos: auditoria e crítica. Esta olha com sete, cada um treinado numa coisa
só — detalhe de interface, cor, layout, texto, tipografia, acessibilidade e
checklist — e cobre a superfície que a anterior declarou não ter coberto: **o
site**.

Onde aquela diz *o que a Bancada é hoje*, esta diz *onde ela não cumpre o que
prometeu*. As três se leem juntas. Quando divergirem, o
[[06 - Design/Sistema de Design|Sistema de Design]] vence.

## Como foi feita

Sete agentes em paralelo, um por lente, todos em modo leitura — nenhum arquivo
do projeto foi alterado durante a revisão. Os relatórios brutos de cada lente,
com as tabelas completas, estão em `06 - Design/Anexos/revisao-2026-09-10-*.md`.

Três coisas sobre o método, porque mudam quanto confiar em cada achado:

**Os agentes rodaram em modelo menor.** A primeira rodada morreu inteira em
limite de sessão; a segunda rodou em Sonnet. Por isso **cada achado que entrou
nesta nota foi reconferido por mim no arquivo citado**, linha a linha. O log
está em `Anexos/revisao-2026-09-10-verificacao.md`, e ele registra também o que
eu corrigi dos agentes — houve pelo menos um número inventado.

**O que é medição foi medido.** A revisão anterior anotou que os 3:1 de
componente nunca tinham sido medidos. Foram, com script determinístico:
conversão para OKLCH e cálculo de contraste contra as seis superfícies nos dois
esquemas. Os números aqui não são estimativa.

**As capturas existentes são anteriores às correções V-01 a V-05.** Servem para
ler ritmo e densidade, não para acusar defeito. Todo achado foi confirmado no
código de hoje (`adff756`).

Foram 49 achados brutos. Depois de tirar duplicata entre lentes e o que já era
decisão registrada, sobraram os agrupados abaixo — organizados por **causa**, não
por lente, porque várias lentes acharam o mesmo defeito por caminhos diferentes.

---

## 1 · O app não tem menu

**Gravidade: alta.** `Sources/Bancada/main.swift` — 60 linhas, e `NSMenu` não
aparece em nenhuma. `setActivationPolicy(.regular)` está na linha 59;
`NSApp.mainMenu` nunca é atribuído.

Sem menu não existe **Cmd+Q**, **Cmd+W**, **Cmd+M** — e, o que pesa mais neste
app, não existe menu **Editar**, logo não existe **Cmd+C**.

A Bancada é um **leitor**. Quem usa não consegue copiar uma linha do que está
lendo, e não consegue fechar o app pelo teclado.

Isto não é lacuna de acessibilidade — atinge todo mundo. É o piso da plataforma
faltando, e é o achado mais grave da rodada. O comentário em `main.swift:14-15`
diz textualmente *"a Bancada é uma janela de trabalho, com Dock e **menu**"*.

**Correção:** montar o `NSMenu` mínimo do macOS — App (Sobre, Ocultar, Sair),
Editar (Copiar, Selecionar Tudo), Janela. É o menor conserto da lista e o de
maior retorno.

---

## 2 · A superfície de leitura não entrega a tese — nas duas superfícies

**Gravidade: alta.** A tese do sistema é `fato ≠ narrativa`, e ela vira
tipografia: narrativa em serifa, com medida controlada. Nenhuma das duas
superfícies cumpre.

**No site**, `scripts/estilo/base.css:35` define a regra que implementa a tese
inteira:

```css
.narrativa { font-family: var(--serif); max-width: 66ch; }
```

E `gerar-site.js:297-312` — o gerador **multipágina**, que produz as páginas de
nota — emite o corpo sem envolvê-lo em nada. Conferido no HTML gerado: as
classes presentes em `site/notas/02-atualizacoes-diarias-2026-09-2026-09-09.html`
são `campos`, `colunas`, `grupo`, `marca`, `subtitulo`, `ativo` — **`narrativa`
não está lá**. Só o gerador de **página única** (`:630`, `:653`) aplica.

Resultado: toda narrativa do site — diário, roadmap, CBL — sai em sans, sem teto
de medida, em torno de 110–120 caracteres por linha. É o V-01 do site: a voz
serifada existe, a folha existe, e o conteúdo não recebe nenhuma das duas.

É também uma divergência entre os dois geradores — a mesma classe de defeito que
foi consertada quando os dois emissores de variável CSS foram unificados em
`variaveis()`. Unificamos a cor e deixamos o corpo divergente.

**No app**, `Componentes.swift:216` — a `Folha` usa `.frame(maxWidth: .infinity)`.
**Não há teto de medida nenhum.** Hoje o painel do Diário é estreito e o efeito
é o oposto (cerca de 32–37 caracteres, curto demais), mas o número não é
governado: é resto de `HSplitView`. Numa janela larga passa de 75 sem nada
impedir.

O painel do Acervo, esse acerta — `larguraMaximaDoPainel: 480` dá ≈58
caracteres. **O teto existe como métrica de uma tela e não como propriedade da
superfície de leitura.**

**Correção:** no site, envolver o corpo da nota em `<article class="narrativa">`
no gerador multipágina. No app, o teto de medida pertence à `Folha`, não à tela.

---

## 3 · As duas pernas da profundidade estão fracas ao mesmo tempo

**Gravidade: alta.** O sistema recusa sombra difusa e declara: *"Profundidade
vem de camada e de fio."* Medi as duas.

**O fio**, contra as seis superfícies, nos dois esquemas:

| | fundo | superficie | superficieSutil | cromo | folha | dado |
|---|---|---|---|---|---|---|
| `borda`/`divisor` · claro | 1,21 | 1,24 | 1,13 | 1,13 | 1,24 | 1,13 |
| `borda`/`divisor` · escuro | 1,32 | 1,24 | 1,14 | 1,14 | 1,24 | 1,14 |

**Doze de doze abaixo de 3:1**, nenhum chegando à metade do alvo. Duas lentes
mediram isso independentemente e chegaram ao mesmo número.

Ressalva honesta: o separador nativo do macOS opera em faixa parecida. Isolado,
o número seria discutível.

**A camada**, em lightness perceptual (OKLCH):

| par | claro | escuro |
|---|---|---|
| `fundo` × `superficie` | **ΔL 0,87** | ΔL 3,71 |
| `fundo` × `cromo` | ΔL 2,14 | ΔL 7,15 |

**A elevação no claro vale um quarto da elevação no escuro.** `#FFFFFF` sobre
`#FCFCFD` é imperceptível.

O achado é a combinação: as duas peças que sustentam a doutrina estão fracas ao
mesmo tempo, cada uma contando com a outra. É a **causa** do que o V-07 anotou
como sintoma — *"a folha do Diário quase não se separa"*. Não é a folha.

**Correção:** no claro, `fundo` desce um passo (`neutro.2`) ou `superficie`
sobe, para a camada ter ΔL comparável ao do escuro. E `borda`/`divisor` hoje são
o mesmo papel com dois nomes: `divisor` (estrutural, entre painéis) precisa de
um passo mais contrastado que `borda` (contorno de peça). **Falta papel, não
falta hex.**

---

## 4 · A janela quebra 220pt antes do que o código sugere

**Gravidade: alta.** A revisão anterior deixou isto como suspeita. É aritmética:

| tela | painéis (`minWidth` declarados) | soma |
|---|---|---|
| **Diário** | lista 160 + folha 320 + fatos 260 | **740** |
| **Acervo** | grade 2×180 + detalhe 320 | **680** |
| garantido | `JanelaPrincipal.swift:16` | **520** |

Déficit de **220pt** na tela mais larga. Com a barra lateral (min 180), o mínimo
real do app é **920**, e a janela abre em **1080** — restam 160pt de folga.

O Trabalho falha de outro jeito: `TelaTarefas.swift:39-74` tem seis
`TableColumn` **sem largura nenhuma**, então as colunas espremem até ilegível em
vez de cortar.

E `main.swift:24` cria a `NSWindow` **sem `contentMinSize`**, com
`setFrameAutosaveName`. Se o `NSHostingView` deixar arrastar abaixo dos 520, o
tamanho quebrado é restaurado na abertura seguinte — *isto ainda não foi
verificado na tela e é o primeiro teste a fazer com o app aberto.*

---

## 5 · O sistema não obedece a si mesmo

**Gravidade: alta.** Quatro achados de lentes diferentes, uma causa só.

**Sete dos dezessete tamanhos fora de escala estão dentro do Design System.**
São 17 `.font(.system(size:))` crus, não 16: **7 em `Sources/DesignSystem/`** e
10 nas telas. `Componentes.swift` define a escala 22/15/13/11/10 e escreve
`size: 28`, `size: 12`, `size: 7` dentro de `Etiqueta`, `ChipRemovivel`,
`MenuDeFiltro` e `SeletorSegmentado` — peças que toda tela consome. **O desvio é
carregado para dentro de quem usa o sistema corretamente**, e nenhum dos 17
passa pelo overload que aplica tracking.

**O papel `aviso` não existe, e o aviso vai buscar cor emprestada.**
`JanelaPrincipal.swift:74` e `TelaAjustes.swift:202` usam `cores.status(.revisao)`
como cor de aviso genérico — no segundo caso pintando um
`exclamationmark.triangle.fill` com uma cor de *status de tarefa*. E a nota do
sistema diz, na lista de recusas: *"Aviso é âmbar."* **O sistema nomeia um papel
em prosa que não existe nos tokens.** É exatamente a regra da casa violada:
*"se um componente precisa de uma cor que nenhum papel oferece, o papel é que
está faltando."*

**`LinhaDeFato` tem consumo parcial.** O componente existe
(`Componentes.swift:274`) e tem **dois** consumidores: `TelaTrabalho.swift:97` e
`TelaCalendario.swift:693`. Diário e Registros reescrevem a mesma linha à mão, e
divergem entre si. O V-07 anotou "dois layouts para o mesmo fato" — são três.

**Raio fora da escala** em `TelaCalendario.swift:682` e `TelaRegistros.swift:251`,
ambos `cornerRadius: 3`, sendo que `DS.Raio` começa em `sm: 6`.

### A face que faltava

A nota já recusa **"controle nativo onde o sistema já tem o seu"** (foi o V-05) e
**"peça de sistema sem consumidor"** (foi a saída do `Distintivo`). `LinhaDeFato`
é a terceira: **peça com consumidor parcial** — viva, usada, e duplicada à mão
em outros lugares. É a mais difícil de enxergar das três, porque não parece nem
morta nem ignorada.

---

## 6 · Comentário como promessa não verificada

**Gravidade: média — mas é padrão, não incidente.** Duas ocorrências, achadas
por lentes diferentes:

- `main.swift:14-15` diz *"com Dock e menu"*. O menu nunca é construído (§1).
- `TelaAcervo.swift:212-214` diz *"mesma superfície de leitura, mesmo
  tratamento"* e a linha seguinte chama `TextoDeNota(derivado.corpo)` **sem o
  `Folha`** — que é exatamente o que dá a superfície. O Diário faz certo
  (`TelaDiario.swift:52-57`).

Duas vezes deixa de ser descuido. Neste repositório o comentário carrega
doutrina — é onde as decisões moram. **Comentário que promete comportamento é
código não escrito**, e vale uma varredura própria.

---

## 7 · Nada reage ao ponteiro, e o que flutua não anima

**Gravidade: média-alta.**

**Os "2 hover" que a revisão anterior contou não pintam nada.** Um agenda a
prévia, o outro troca o cursor. **Nenhum elemento clicável do app tem retorno
visual de ponteiro** — nem cartão do Acervo, nem rodapé de Ajustes, nem pílula
de Tarefas, nem chip. Os 12 `.buttonStyle(.plain)` removem o realce nativo sem
repor nada.

**A prévia do calendário aparece e some sem transição.** `previewDoDia` é
escrito em `TelaCalendario.swift:604` e limpo em `:609`/`:613` — nenhum dentro de
`withAnimation`; os três `.animation` das linhas 322-324 observam outras coisas.

Isto é regressão da correção do V-03. Ao trocar o `popover` nativo pela
`Sobreposicao`, o componente herdou a **forma** que a doutrina exigia e perdeu o
**comportamento** que ninguém tinha escrito: o popover nativo animava a entrada
de graça. **Terceira vez que virar componente resolve a doutrina e abre buraco
no que a plataforma dava sozinha.**

**O site inteiro não declara uma `transition`.** A única ocorrência de
`transition` no site é `transition: none !important` **dentro** do bloco
`prefers-reduced-motion` (`base.css:64`). O site suprime, para quem pede menos
movimento, um movimento que ele nunca teve. São 7 regras `:hover` cortando seco
e **zero** `:active`.

**Correção:** um único `ButtonStyle` do DS resolve hover e pressionado em toda a
base. O `SeletorSegmentado` sozinho já cobre Calendário e Ajustes.

---

## 8 · Affordance que mente

**Gravidade: média.**

**O link de Markdown parece link e não é.** `TextoDeNota.swift:237`:
`case let .link(rotulo, _)` — **a URL é descartada no `_`** e o texto sai com
acento **e sublinhado**. O wikilink logo acima sai com acento e sem sublinhado,
e é decisão documentada. O sublinhado é a affordance mais forte que existe para
"clicável", aplicada ao que não faz nada. Hoje um caso é decisão e o outro é
esquecimento, e nada na tela distingue os dois.

**No Acervo, selecionar e abrir são gestos de donos diferentes.** O clique
simples que seleciona está no pai (`TelaAcervo.swift:51`); o duplo que abre está
dentro do cartão (`:131`). O cartão não sabe que é selecionável, então não pode
sinalizar nada — a única affordance é o anel de acento, depois do fato. E não há
caminho de teclado: `.onTapGesture` sem `Button` nem `.focusable()`.

A instrução que ensina o gesto — *"Clique num item da grade… Duplo clique abre"*
— vive no estado vazio do painel de detalhe (`:198-202`), que **desaparece no
instante em que você seleciona o primeiro item**. Só é visível para quem ainda
não descobriu.

---

## 9 · O texto tem três vozes onde devia ter uma

**Gravidade: média.**

- **Mesma ação, dois rótulos.** "Escolher vault" (`JanelaPrincipal.swift:137`) e
  "Escolher vault…" (`TelaAjustes.swift:152`) abrem o mesmo diálogo. Um tem
  reticências, o outro não.
- **"Dia sem fatos" fala com três vozes.** Diário é seco
  (`TelaDiario.swift:70-73`), Calendário enumera três ausências
  (`TelaCalendario.swift:507-514`), só Registros ensina o mecanismo
  (`TelaRegistros.swift:22-25`). Os três passam no checklist de estado vazio e
  soam como três pessoas.
- **Contagem sem plural.** `TelaCalendario.swift:221` monta `"\(total) eventos"`
  sem condicional — com total 1, escreve "1 eventos". É diferente do `(s)` do
  V-07: ali há uma marca, aqui não há nada.
- **Title Case** em dois pontos, num app inteiro em sentence case.

O relatório da lente traz o **glossário do vocabulário em uso** e a **tabela
completa de plurais**, incluindo os do site.

---

## 10 · O que a medição de cor mostrou além do fio

**Gravidade: média-baixa.**

- **O âmbar do claro é marrom, e é estrutural.** `#8A6410`: matiz 81°
  (amarelo-alaranjado correto), mas L 52,9 com chroma 0,104 é a receita de
  oliva. Amarelo escurecido não vira âmbar, vira terra — é limitação do amarelo
  em L baixa, não erro de escolha.
- **A chroma das seis matizes varia 2,3×.** Azul 0,198; turquesa 0,087 — e
  turquesa é a cor de `commit`, o tipo de fato mais frequente do vault. **A cor
  mais usada é a mais fraca da paleta.** Nos passos `luz`, a L varia 7 pontos:
  no escuro, `em-andamento` lê mais pesado que `concluida` no mesmo papel.
- **O véu do acento não cria pílula visível no escuro** — a `Etiqueta` fica só
  com o texto.
- **Não-achado, verificado:** a deriva de matiz da rampa neutra (H° passeia 27°)
  é irrelevante — a chroma máxima é 0,0146 e nas pontas cai para 0,0013. Em
  chroma dessa ordem o matiz é instável por aritmética e invisível na tela. **A
  rampa é limpa.** A progressão irregular (ΔL 0,87 nas pontas, 11,8 no meio)
  também está certa de propósito. Registrado para ninguém remedir achando que
  achou algo.

---

## O que está bom

- **A paridade JSON → Swift → CSS é limpa.** Nenhum hex solto nas três saídas;
  `variaveis()` resolve tudo por papel e `ParidadeDeTokensTests` trava valor a
  valor.
- **As cores semânticas passam 3:1 com folga** contra as seis superfícies nos
  dois esquemas — pior caso 4,63:1. O ponto fraco de componente é a borda, não a
  paleta.
- **O site resiste a 400px sem rolagem horizontal.** Toda tabela gerada sai
  embrulhada em `.rolagem { overflow-x: auto }`; nenhum grid usa largura fixa.
- **O site não usa `box-shadow` em nenhum dos dois modos** — a doutrina "fio,
  nunca sombra difusa" se sustenta na superfície que ninguém tinha olhado.
- **Os dois parsers de Markdown preservam a pontuação como foi escrita** — nem
  corrompem nem convertem travessão, aspas ou elipse.
- **O cruzamento de vozes dentro do texto funciona nos dois lados**: um hash ou
  caminho sai em mono no meio de uma frase em serifa, no app e no site.
- **O erro de leitura do vault já está bem resolvido** (`Vault.swift:134-139`):
  diz o quê e o porquê. Não precisa de correção.
- **V-01, V-02, V-04 e V-05 seguem corrigidos.** Nada regrediu.

---

## Uma pendência que não é minha para resolver

A revisão de 09/09 abre a seção "O que o fonte mostrou" com:

> O `CLAUDE.md` do repositório é explícito: um componente só está pronto quando
> declara padrão, foco, pressionado, selecionado, desabilitado, carregando e erro.

Procurei essa regra para checar os achados contra ela. **Ela não existe em
nenhum `CLAUDE.md`.** Só há um no workspace — `doc-harness/CLAUDE.md` — e não a
contém; `Bancada/CLAUDE.md` não existe. A única ocorrência da frase no vault
inteiro é a própria linha 171 daquela nota.

A regra é boa e a tabela que ela ancora é útil. O problema é de endereço: pelo
critério do próprio projeto, **regra que só vive dentro de uma nota de revisão é
narrativa, não é política** — e nenhum componente novo vai ser cobrado por ela.

Não editei a nota do Cauê: a narrativa dela é dele. Ou a regra sobe para o
`CLAUDE.md` e vira política, ou a citação muda. É decisão dele.

---

## O que esta revisão não cobre

- **A ActionShelf.** Segue com identidade própria, fora deste sistema.
- **Runtime.** Nenhum agente abriu o app — proibido, para não disputarem o
  build. Todo achado vem do fonte. O que depende de ver na tela está marcado
  como pendente: o comportamento real ao redimensionar (§4), o fundo efetivo
  atrás da `Etiqueta` no escuro (§10) e a consequência visual da prévia sem
  transição (§7).
- **VoiceOver e teclado na prática.** Como na revisão anterior, o mapa vem do
  fonte. Uma passada real vai achar mais.
- **A regra CSS `.lista-tarefas .caixa.feita`**, que tem um `#fff` solto e falha
  2,09:1 no escuro. Nenhum gerador parece emitir essa marcação — provável código
  morto, não confirmado.

---

## Ordem sugerida

Por retorno sobre esforço, não por gravidade pura:

1. **O menu** (§1). Menor conserto, maior retorno, devolve Cmd+C num leitor.
2. **`class="narrativa"` no gerador multipágina** (§2). Uma linha, e o site passa
   a cumprir a tese.
3. **Um `ButtonStyle` do DS** (§7). Um ponto, e hover/pressionado aparecem na
   base inteira.
4. **`contentMinSize` com o número real** (§4). Depois de verificar na tela.
5. **Os sete tamanhos crus dentro do DS** (§5). De dentro para fora — cobrar
   obediência das telas enquanto o vocabulário desobedece é cobrar do lado
   errado.
6. **`papel.aviso` e a separação `borda`/`divisor`** (§3, §5). Mexe em token;
   quer o teste de paridade junto.

---
← [[🏠 Início|Início]]
