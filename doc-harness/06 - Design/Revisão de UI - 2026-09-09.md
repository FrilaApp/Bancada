---
tipo: design
desafio: C18
data_criacao: 2026-09-09
tags: [design, revisao]
---

# Revisão de UI da Bancada — 2026-09-09

A [[04 - Tarefas/T-0002 - Refatorar UI da Bancada + WebView|T-0002]] deixou um
item aberto: *"UI revisada visualmente por quem usa — a refatoração roda, falta
o olho."* Esta nota é o olho.

Enquanto o [[06 - Design/Sistema de Design|Sistema de Design]] diz o que a
Bancada **deve** ser, esta diz o que ela **é** hoje, com a captura que prova
cada afirmação. As duas se leem juntas: quando divergirem, o sistema vence e o
código se ajusta.

## Como foi feita

O app foi aberto sobre o vault real (`doc-harness`, commit `99bfabf`, janela
1352×848) e fotografado: as cinco seções, os três modos de calendário, claro e
escuro. Dez capturas — nenhuma existia antes; as cinco imagens que o vault já
tinha eram todas da ActionShelf. As nove usadas aqui ficam em
`04 - Tarefas/Anexos/` com prefixo `bancada-`.

A revisão separa duas coisas, e a distinção importa para saber quanto confiar em
cada achado:

| Modo | O que responde | De onde |
|---|---|---|
| **Auditoria** | o que existe na tela, item a item contra um checklist | fonte |
| **Crítica** | hierarquia, ritmo, tipografia, cor | captura |

Tudo que o Sistema de Design já registra como decisão consciente foi filtrado
antes de virar achado. A lista do que foi filtrado está no fim.

Nenhum arquivo de código foi alterado. A preferência de aparência, trocada para
capturar o claro, foi restaurada ao valor original.

## O que a tela mostrou

Sete achados, do mais grave ao menor.

### V-01 · O Diário mostra Markdown cru como texto literal

O painel de narrativa renderiza `# 2026-09-09`, `## O que foi feito`, os hifens
de lista, as crases em volta dos hashes e `[[04 - Tarefas/T-0002 - …` — tudo
como caractere, em serifa.

Isso derruba a tese central do sistema. A voz serifada existe porque narrativa é
"uma pessoa falando". O que está na tela é o arquivo-fonte falando. A serifa
está lá, a entrelinha de 1,62 está lá, e o efeito é o de um editor sem preview.
No claro fica mais evidente, porque a tipografia acerta tudo menos o conteúdo.

![[04 - Tarefas/Anexos/bancada-diario.png|Diário no escuro — sustenido, hifens e crases aparecem como texto]]
![[04 - Tarefas/Anexos/bancada-diario-claro.png|Diário no claro — a mesma falha, com a tipografia acertando o resto]]

### V-02 · A grade do Acervo vaza do container e corta os cartões

Os quatro primeiros cartões estão cortados na esquerda — lê-se
`onshelf-v4-polimento-final.png`, sem o "acti", e `Tarefas/Anexos`, sem o
"04 - ". As miniaturas sangram para fora do cartão pela direita e passam por
baixo do painel de detalhe.

Os dois últimos cartões estão certos: borda visível, miniatura contida, nome e
caminho dentro. A diferença é o formato da imagem — as quatro primeiras são
capturas largas, e a miniatura escala pela largura sem recorte. O componente
funciona; falta contenção. No mesmo screen, o painel de detalhe ocupa cerca de
40% da janela para dizer "Nada selecionado".

![[04 - Tarefas/Anexos/bancada-acervo.png|Acervo — coluna da esquerda cortada, miniaturas fora do quadro]]

### V-03 · O único overlay do app usa a sombra que o sistema recusa

A prévia por permanência do cursor abriu sobre o dia 20 e trouxe a moldura
nativa de `popover` — com sombra difusa, que o Sistema de Design lista entre "o
que o sistema recusa". A doutrina de profundidade por camada de tom e fio de 1px
é contrariada pelo único componente que o app não desenhou.

E o conteúdo era "Nada registrado". A espera de 600 ms foi projetada para não
piscar popover ao atravessar a grade, mas dispara igual em célula vazia — e num
mês com 33 das 35 células vazias, é isso que acontece na maior parte do tempo.

*Captura removida do site: Popover sobre dia vazio, com sombra difusa sobre a grade.*

### V-04 · O calendário abre no modo errado para o formato do vault

Mês é o padrão. Os 59 eventos vivem em dois dias. O resultado é uma grade de 35
caixas em que 33 estão vazias, ocupando a altura inteira da janela — e no claro,
com borda visível em cada célula, o efeito é o de uma planilha em branco.

Não é problema da grade. Semana é denso e legível, e Lista é o melhor dos três
para este conteúdo. O que está desalinhado é o padrão de abertura.

*Captura removida do site: Modo Mês, o padrão — 33 de 35 células vazias.*
*Captura removida do site: Modo Semana — o mesmo dado, aproveitando a tela.*

### V-05 · Dois seletores segmentados e duas seleções de barra lateral

O calendário usa o `SeletorSegmentado` do próprio design system — sutil, cinza,
pílula clara. Ajustes usa o `Picker(.segmented)` nativo — azul sólido do
sistema. Mesmo controle, mesma função, dois vocabulários. O DS construiu o
componente e a tela de Ajustes não o consome.

A barra lateral repete: as quatro seções usam a seleção nativa da `List` (azul
preenchido, texto branco) e o Ajustes é um botão desenhado à mão (fundo
translúcido, texto azul, borda). Os dois aparecem ao mesmo tempo na mesma
coluna. E o rodapé está desalinhado cerca de 9 px à esquerda: ícone e rótulo não
batem na coluna vertical das linhas de cima.

*Captura removida do site: Ajustes — segmentado nativo e rodapé com tratamento próprio.*

### V-06 · A navegação principal não tem nome acessível

Da árvore de acessibilidade do processo rodando, não do fonte. Cada linha da
barra lateral expõe um único texto acessível: o número do distintivo. Os títulos
das seções não são expostos em lugar nenhum, e o botão de Ajustes não tem nome.

```
row → UI element → static text  nome=[2]              ← Calendário
row → UI element → static text  nome=[5]              ← Trabalho
row → UI element → static text  nome=[2]              ← Diário
row → UI element → static text  nome=[6]              ← Acervo
button                          nome=[missing value]  ← Ajustes
```

O VoiceOver lê "2, 5, 2, 6" e um botão sem nome. Não é acessibilidade
incompleta: a navegação primária do app não tem rótulo.

### V-07 · Sete detalhes menores

- **Toolbar.** O título da seção encosta no título da janela em todas as telas —
  lê-se "Diário Bancada", "Acervo Bancada", "Calendário Bancada".
- **Linhas fantasma.** Em Trabalho, abaixo das cinco tarefas, a `Table` desenha
  quatro faixas de linha vazia alternada. Parece conteúdo carregando.
- **Plural.** "59 eventos" no topo e "30 evento(s)" no cabeçalho do painel, na
  mesma tela. O `(s)` também aparece em "2 dia(s)", "1 arquivo(s)", "0 nota(s)".
- **Cabeçalho do painel do dia.** Três pares de glifo e número sem rótulo, e a
  data em ISO enquanto o título logo acima diz "setembro de 2026".
- **Sem botão primário.** Em Ajustes, "Escolher vault…", "Recarregar" e "Mostrar
  no Finder" têm peso visual idêntico.
- **Folha no claro.** `folha` e `superficie` resolvem para o mesmo passo e
  `fundo` fica a um passo — a folha do Diário quase não se separa. Quem faz o
  trabalho é o fio de 1px.
- **Dois layouts para o mesmo fato.** No Calendário, hora, tipo e descrição numa
  linha com autor à direita. No Diário, empilhado em duas linhas e mais
  apertado.

*Captura removida do site: Trabalho — as faixas abaixo de T-0005 são linhas vazias da tabela.*

## O que está bom

Três coisas funcionam exatamente como o Sistema de Design prometia, e vale
dizer antes de qualquer conserto.

- **A tipografia de três vozes funciona na tela.** No painel do dia dá para
  varrer a coluna de `05:22 ui` e `05:23 commit` em mono sem ler uma palavra da
  prosa ao lado. É o efeito que a nota do sistema descreve, entregue.
- **A barra de filtro do calendário é a peça mais bem resolvida do app.** Passa
  o checklist inteiro de filtragem.
- **A correção de locale aparece.** "setembro de 2026" e "dom. seg. ter." estão
  certos — o bug do ICU realmente saiu, e dá para ver.

*Captura removida do site: Modo Lista — as três vozes tipográficas fazendo o trabalho.*

## O que o fonte mostrou

Contagens em `Sources/`, conferidas à mão. O `CLAUDE.md` do repositório é
explícito: um componente só está pronto quando declara padrão, foco,
pressionado, selecionado, desabilitado, carregando e erro.

| Estado | Ocorrências | Onde |
|---|---|---|
| `pressed` | 0 | Nenhum `ButtonStyle` customizado. São 12 `.buttonStyle(.plain)`, que no macOS removem o realce nativo sem repor nada. |
| `hover` | 2 | Ambas em `TelaCalendario.swift`. Grade do Acervo, rodapé de Ajustes, pílulas de Tarefas e chips não reagem ao ponteiro. |
| `disabled` | 0 | `.disabled(` não aparece uma vez. Recarregar fica clicável sem vault e durante a leitura. |
| `focus` | 0 | Zero `@FocusState`. `DS.Cor.foco` e `DS.Traco.foco` existem, têm acessor no ambiente e nenhum ponto de uso. |
| `loading` | 1 | Só em `Thumbnail`. `EstadoDaBancada.carregando` é escrito e nunca lido. |

Mais quatro:

- **Escala tipográfica furada em 16 pontos.** `.font(.system(size:))` cru aparece
  16 vezes, introduzindo os tamanhos 7, 9, 14 e 28 numa escala que tem
  22/15/13/11/10. Nenhum passa pelo overload que aplica o *tracking*. Dois são
  `size: 7` — o X do chip e o puxador do calendário.
- **Dynamic Type e Reduzir Movimento: zero ocorrências.** Toda a tipografia é
  ponto fixo, combinada com alturas fixas de célula e miniatura.
- **O token contrariado dentro do próprio sistema.** `TelaTarefas.swift:128`
  escreve `.opacity(ativo ? 0.22 : 0.08)` — que são, literalmente,
  `DS.Veu.forte` e `DS.Veu.sutil`. O comentário em `Tokens.swift:164` diz que os
  véus existem justamente para isso não acontecer.
- **Estado vazio com três contratos.** O calendário distingue filtro de vault
  vazio. Tarefas guarda em `tarefas.isEmpty` e não em `visiveis.isEmpty`:
  filtrar por um status sem itens entrega tabela vazia sem mensagem. Acervo
  evita o problema escondendo a pílula de contagem zero.

## Auditoria · Estado vazio

Checklist [Empty State — Web app](https://www.checklist.design/web-app/empty-state).

| | Item | Por quê |
|---|---|---|
| tem | **Illustration or icon** | SF Symbol contextual em cada caso: `tray`, `calendar`, `checklist`, e o funil quando é filtro. Não é um ícone genérico repetido. |
| tem | **Clear heading** | "Nenhuma tarefa ainda", "Nada em 2026-09-09 casa com o filtro". Nomeia o que falta, sem se desculpar. |
| tem | **Supporting description** | Presente em quase todos, e ensina o mecanismo: "Tarefas são notas com `tipo: tarefa` em 04 - Tarefas/." |
| parcial | **Primary action** | `Vazio` não tem slot de ação. Nos zero-states de um app somente-leitura isso se defende. Mas o no-results do calendário pede "Limpe o filtro" em texto, e o botão que faria isso existe a poucos pixels dali. |
| parcial | **Zero state vs. no-results** | O calendário faz certo nas duas visões. Tarefas não faz. Acervo evita por outro caminho. Três telas, três contratos. |
| tem | **Error state variant** | "Não deu para ler o vault" é variante própria com o erro no detalhe, e o `Thumbnail` trata a própria falha com ícone distinto. |

## Auditoria · Filtragem

Checklist [Filtering items — Flows](https://www.checklist.design/flows/filtering-items).
Escopo: a barra do calendário.

| | Item | Por quê |
|---|---|---|
| tem | **Show action near item collection** | Barra fixa logo acima da grade, com lupa, funil em "Espécie" e pessoa em "Autor". |
| tem | **Show available filter options** | Menus inline, na mesma tela, com feedback imediato. Certo para duas dimensões curtas. |
| tem | **Consider different filter types** | Três formas distintas, cada uma cabendo na propriedade: texto livre, multi-seleção marcável, segmentado para o modo de visão. |
| tem | **Show active filters clearly** | Linha de chips "Filtrando por…" aparece só quando há filtro, e os menus carregam contador de marcados. |
| parcial | **Provide easy filter removal** | Mecanicamente completo: chip com X para cada um, "Limpar" para todos. Mas o "Limpar" é `.plain`, na cor de texto sutil, sem hover e sem pressed — a rota de fuga é o elemento menos visível da barra. |
| tem | **Show result count** | "59 eventos" sem filtro, "X de 59 eventos" com filtro, em dígito tabular. Sem isso, filtro que zera tudo pareceria vault vazio. |
| tem | **Empty state** | Copy própria para o caso filtrado, diferente da de vault vazio, nas duas visões. |

## Auditoria · Acessibilidade

Checklist [Accessibility — Design system](https://www.checklist.design/design-system/accessibility).
É a mais dura das três.

| | Item | Por quê |
|---|---|---|
| parcial | **Target conformance level** | AA é alvo declarado e cobrado por teste — 78 asserções de contraste. Mas cobre só texto sobre superfície. |
| parcial | **Colour contrast standards** | Os 4,5:1 de texto estão travados. Os 3:1 de componente nunca são medidos: borda, divisor, ícone e indicador. E a cobertura atual só é total por acidente — `folha` e `dado` colidem hoje com superfícies já testadas. |
| falta | **Focus indicator design** | Projetado e nunca implementado: `DS.Cor.foco` e `DS.Traco.foco = 2` existem e não têm nenhum ponto de uso. Quem navega por teclado não sabe onde está. |
| parcial | **Keyboard navigation patterns** | O calendário faz certo — `.focusable()`, setas e Escape. É a única tela que faz, e nenhum documento fixa o padrão. |
| n/a | **ARIA pattern library** | ARIA é da web; aqui o equivalente é o `AXUIElement` do macOS, coberto pelas duas linhas abaixo. |
| falta | **Screen reader testing** | A árvore de acessibilidade prova que não houve teste (ver V-06). São 8 modificadores no app inteiro, 5 deles numa tela só. |
| falta | **Accessibility annotations in design** | O Sistema de Design documenta cor, tipografia e elevação com rigor, e não diz uma palavra sobre rótulo acessível, ordem de leitura ou foco. |
| falta | **Accessibility in contribution guidelines** | O `CLAUDE.md` lista os estados que um componente precisa declarar, mas nenhum requisito de acessibilidade. O teste de paridade cobre contraste e não cobre rótulo. |

## Decisões registradas — não são achados

Conferidas no ledger do Sistema de Design e no README antes de escrever
qualquer crítica. Se alguma for reaberta, que seja por decisão nova.

- **Sem sombra difusa.** Profundidade é camada de tom mais fio de 1px. *(É por
  isso que V-03 é achado: o popover nativo quebra a regra da casa.)*
- **Elevação mais clara nos dois esquemas.** Simetria pura poria a superfície
  abaixo do fundo no escuro.
- **`cromo`, `dado` e `superficieSutil` no mesmo passo da rampa.** A distinção
  hoje é semântica, não visual.
- **`a-fazer` não tem cor**, e tipo de fato desconhecido cai no neutro.
- **Aparência com três estados**, e **Ajustes fora da lista de seções**.
- **`CartaoComparativoUI` com metadados escritos à mão.** Débito já assumido nas
  notas da T-0002.

## O que esta revisão não cobre

- **O site estático.** Só o app foi olhado. `scripts/gerar-site.js` consome os
  mesmos papéis e não passou por revisão.
- **A ActionShelf.** Segue com identidade própria, fora deste sistema.
- **Teclado e VoiceOver na prática.** V-06 vem da árvore de acessibilidade, não
  de uma sessão real de VoiceOver. Uma passada de verdade vai achar mais.
- **Janelas pequenas.** Tudo foi visto em 1352×848. O comportamento de
  `HSplitView` e `VSplitView` perto do mínimo não foi testado — e V-02 sugere
  que é onde mais quebra.

---
← [[🏠 Início|Início]]
