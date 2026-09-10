# Achados — Layout e Estrutura

Revisão de `Bancada/Sources/Bancada/{main,JanelaPrincipal}.swift`,
`Bancada/Sources/Bancada/Telas/*.swift`, `Bancada/Sources/DesignSystem/Componentes.swift`,
`Bancada/tokens.json` (`espaco`/`raio`/`metrica`), e o site (`Bancada/site/*.html`,
`estilo.css`, `scripts/estilo/*.css`). `swift build` roda limpo sobre o estado atual.
Nenhum arquivo do projeto foi editado.

---

### LAY-01 · A janela não tem mínimo, e o mínimo genérico do detalhe é menor que o real de três telas

**Onde:** `Bancada/Sources/Bancada/main.swift:24-29` (criação da `NSWindow`, sem
`minSize`); `Bancada/Sources/Bancada/JanelaPrincipal.swift:11-16`
(`.navigationSplitViewColumnWidth(min: 180…)` + `.frame(minWidth: 520, minHeight: 400)`
genérico em `conteudo`); `Telas/TelaAcervo.swift:36,58,66-68`;
`Telas/TelaDiario.swift:35,45,56,92`; `Telas/TelaTarefas.swift:44,49,58,65,72,79`;
`Telas/TelaTrabalho.swift:30-38`.
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código; `grep -rn "minSize\|windowResizability" Sources/` não
retorna nada — nenhuma das duas formas de travar um mínimo existe no projeto)

**O que está errado:** a `NSWindow` de `main.swift` é criada com `NSRect` de
1080×720 mas sem `.minSize` — nada impede o usuário de arrastar a borda para
qualquer tamanho menor. O único piso declarado é
`.frame(minWidth: 520, minHeight: 400)` em `JanelaPrincipal.swift:16`, aplicado
igual às cinco telas — mas somando os mínimos internos de cada `HSplitView`/
`VSplitView`/`Table` (tokens de `metrica` em `tokens.json`), três telas
precisam de mais do que isso dentro do detalhe:

| Tela | Painéis (mínimos) | Soma interna | vs. o `520` declarado |
|---|---|---|---|
| Acervo | grade `180×2`=360 + painel `320` | **680** | +160 |
| Diário | lista `160` + Folha `320` + fatos `260` | **740** | +220 |
| Trabalho | colunas da `Table`: 60+180+100+100+70+90 | **600** | +80 |

Somando a barra lateral (mínimo `180`), a janela só cabe Acervo sem cortar a
partir de **860px**, Diário a partir de **920px**, Trabalho a partir de
**780px** — não dos `700px` (`180+520`) que o código sugere ser o piso. E como
a `NSWindow` não tem `minSize`, nada impede encolher bem abaixo disso: o
`HSplitView`/`Table` não tem como comprimir mais que seus próprios mínimos, e o
que sobra fica cortado fora da borda da janela.

**Por que importa:** é exatamente o mecanismo por trás do antigo V-02 (grade
do Acervo vazando), só que agora no nível da janela inteira, e em três telas
em vez de uma. Quem usa em metade de tela (comum num Mac com pouca tela ou dois
apps lado a lado) pode perder colunas da tabela de Tarefas, o painel de fatos
do Diário ou o painel de mídia do Acervo sem aviso nenhum — nenhum scroll
aparece para compensar, porque `HSplitView`/`Table` cortam, não rolam.

**Correção:** definir `janela.minSize = NSSize(width: 920, height: 560)` (ou o
maior dos três pisos internos, mais margem de altura) em `main.swift`, e trocar
o `.frame(minWidth: 520, minHeight: 400)` genérico por um valor por tela — ou
remover o genérico e deixar cada `HSplitView`/`Table` ser a fonte de verdade,
já que é o que decide o mínimo real hoje.

---

### LAY-02 · Aprofundamento de V-07 — não são dois layouts para o mesmo fato, são pelo menos três

**Onde:** `Componentes.swift:274-319` (`LinhaDeFato`, o componente);
`Telas/TelaTrabalho.swift:97` e `Telas/TelaCalendario.swift:689-707`
(`LinhaDeEvento`, que embrulha `LinhaDeFato`) — os dois consumidores reais;
`Telas/TelaDiario.swift:76-88` (linha própria, empilhada em duas linhas);
`Telas/TelaRegistros.swift:115-129` (linha própria, `HStack` em
`.firstTextBaseline` com `Spacer(minLength: DS.Espaco.md)`).
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li as quatro implementações)

**O que está errado:** a revisão de 09/09 registrou "dois layouts para o mesmo
fato" comparando Calendário e Diário na tela. O código mostra a causa e que são
mais que dois: `LinhaDeFato` existe como componente e só metade dos lugares que
listam fato o consome (Trabalho e Calendário, via `LinhaDeEvento`). Diário e
Registros reimplementam a linha à mão, e divergem também *entre si* — Diário
empilha hora+tipo numa linha e descrição na linha de baixo; Registros põe tudo
numa única linha em `.firstTextBaseline`. Não é uma tela desviando da regra; é
a regra não ter virado hábito de reúso.

**Por que importa:** o "que informação vem em que ordem" para o mesmo tipo de
dado (fato do log) muda de tela para tela sem motivo de conteúdo — só de quem
escreveu aquele trecho. Isso é o oposto do que `LinhaDeFato` foi criado para
resolver.

**Correção:** trocar `TelaDiario.swift:76-88` e `TelaRegistros.swift:115-129`
por `LinhaDeFato` (a de Registros provavelmente cabe direto; a de Diário perde
o empilhamento em duas linhas — se o painel de 260px for estreito demais para
a linha única, isso é motivo para revisar `DS.Trabalho`/o mínimo do painel do
Diário, não para manter uma quarta variação).

---

### LAY-03 · O comentário promete "mesmo tratamento" da superfície de leitura; o código não entrega

**Onde:** `Telas/TelaAcervo.swift:207-216` (painel de mídia, markdown
derivado) vs. `Telas/TelaDiario.swift:53-55` (`Folha { TextoDeNota(...) }`);
`Componentes.swift:200-229` (`Folha`, a única fonte da superfície de folha
flutuante — raio `lg`, fio, fundo `folha`, padding `xl`/`lg` duplo).
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li as duas implementações; o comentário está no
próprio arquivo)

**O que está errado:** `TelaAcervo.swift:213-214` comenta "O derivado de um
`.pages` é narrativa como qualquer nota: mesma superfície de leitura, mesmo
tratamento" — e na linha seguinte chama `TextoDeNota(derivado.corpo)` direto,
sem `Folha`. `TextoDeNota` só dá a voz (serifa, entrelinha); a superfície —
cor `folha`, borda, raio `lg`, o respiro duplo que faz a nota "flutuar sobre o
chrome" — vem inteira de `Folha`, e só `TelaDiario.swift:53-55` a usa. O
mesmo conteúdo (Markdown de um `.pages`) fica sem cartão no Acervo e com
cartão no Diário.

**Por que importa:** o sistema de design define a folha como a peça central
da tese de "narrativa é gente falando" (ver `06 - Design/Sistema de Design.md`).
Se o próprio código dela diz "mesmo tratamento" e entrega outro, o vocabulário
visual do sistema para "isto é narrativa" para de ser confiável — é o mesmo
tipo de contradição que motivou o achado V-03 do popover.

**Correção:** embrulhar `TextoDeNota(derivado.corpo)` em `Folha` dentro de
`markdownDerivado` (`TelaAcervo.swift:207-226`). Se a largura do painel
(320-480px) apertar demais o padding duplo de `Folha`, isso é argumento para um
`Folha` mais compacto — não para pular a superfície.

---

### LAY-04 · O ritmo de espaçamento tem um degrau fantasma e uma dúzia de números soltos

**Onde:** padrão `DS.Espaco.xs + 1` (=5, fora da escala 4/8/12/20/32) em
`Componentes.swift:100,467,543`, `Telas/TelaCalendario.swift:375`,
`Telas/TelaTarefas.swift:127` — 5 ocorrências idênticas; `.padding(.vertical, 3)`
em `Componentes.swift:247,579`; literais fora da escala em
`Telas/TelaDiario.swift:37,77` e `Telas/TelaAjustes.swift:50` (`spacing: 2`),
`Telas/TelaRegistros.swift:238` (`spacing: 6`), `Telas/TelaCalendario.swift:672`
(`frame(width: 5, height: 5)`); literais que **acertam** a escala mas sem
token em `Telas/TelaRegistros.swift:109,110,246,249,259` (`4`/`8` crus em vez
de `DS.Espaco.xs`/`.sm`).
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado (grep sobre `Telas/*.swift` e `Componentes.swift`)

**O que está errado:** a escala declarada em `tokens.json` é 4/8/12/20/32.
`DS.Espaco.xs + 1` aparece cinco vezes em três arquivos diferentes — não é
descuido isolado, é um degrau de facto (5px) que ninguém tokenizou. Ao lado
dele, valores soltos (`2`, `3`, `6`, `5`, `1`) furam a escala em pontos
menores, e vários `4`/`8` literais deveriam ser `DS.Espaco.xs`/`.sm`.

**Por que importa:** é o mesmo tipo de débito que a revisão anterior já mediu
para tamanho de fonte (16 valores fora da escala) — aqui é espaçamento, e o
padrão repetido (`xs + 1`) é o sintoma mais claro: alguém precisou de 5px
cinco vezes e a escala não oferece.

**Correção:** ou a escala ganha um passo entre `xs`(4) e `sm`(8) — resolvendo
as cinco ocorrências de `xs + 1` de uma vez — ou as cinco chamadas voltam para
`xs`(4) puro e perdem o `+1`. Os `.padding(.vertical, 3)` de `Etiqueta` e
`ChipRemovivel` (cápsulas de rótulo) são o mesmo caso em miniatura. Trocar os
literais `4`/`8` por `DS.Espaco.xs`/`.sm` em `TelaRegistros.swift` é mecânico.

---

### LAY-05 · Métrica de outra tela usada como largura da busca do Calendário

**Onde:** `Telas/TelaCalendario.swift:184-185`
(`CampoDeBusca(...).frame(maxWidth: DS.Acervo.larguraIdealDoPainel)`).
**Superfície:** app | tokens
**Gravidade:** baixa
**Confiança:** confirmado

**O que está errado:** o teto de largura do campo de busca do Calendário
referencia `DS.Acervo.larguraIdealDoPainel` (380) — uma métrica nomeada e
documentada para o painel de detalhe do Acervo, sem relação nenhuma com busca.
Funciona porque o número por acaso serve, mas o nome do token mente sobre o
que ele está fazendo ali.

**Por que importa:** é pequeno hoje; envelhece mal — se o painel do Acervo
mudar de largura por um motivo do Acervo, a busca do Calendário muda de
tamanho por acidente.

**Correção:** um metro próprio em `metrica.calendario` (ex.:
`larguraMaximaDaBusca`), mesmo que o valor inicial seja 380.

---

## O que está bom

- **O site resiste a 400px sem rolagem horizontal.** As duas saídas
  (`multipagina.css:151-152`, breakpoint 800px; `pagina-unica.css:154-155`,
  breakpoint 860px) colapsam a coluna lateral para `1fr` e voltam o `aside`/
  `.lateral` para posição estática — nenhum grid (`.numeros`, `.medidas`,
  `.grade`, `.pecas`) usa largura fixa, todos são `auto-fit`/`auto-fill` com
  `minmax`. Toda tabela gerada (`gerar-site.js:358,679`) sai embrulhada em
  `.rolagem { overflow-x: auto }` — não há tabela solta que possa estourar a
  largura da página.
- **`bordo.html` sem `<head>`/viewport não é falha.** Cheguei a marcar como
  achado e descartei: o comentário em `gerar-site.js:469-471` diz
  textualmente que o arquivo é emitido "sem `<!doctype>`, `<html>`, `<head>`
  nem `<body>` — a forma que um Artifact do claude.ai espera". É decisão, não
  esquecimento.
- **`BarraDePainel`/`Cartao`/`Divisor` seguram o alinhamento entre telas.** As
  três telas que montam barra de painel (Trabalho, Calendário, Acervo) e as
  duas que usam `Cartao` (Acervo, Ajustes) compartilham o mesmo componente —
  não achei nenhuma reimplementação à mão desses dois.

## O que não consegui verificar

- **O comportamento real ao arrastar a janela.** LAY-01 é derivado da leitura
  estática dos `frame`/`HSplitView`/`Table` e do comportamento documentado do
  AppKit para `NSWindow` sem `minSize` — não abri o app nem redimensionei de
  fato (instrução explícita da tarefa). Os números de ponto de quebra (780/
  860/920px) são a soma dos mínimos declarados no código, não uma medição em
  tela.
- **Altura mínima da janela.** O escopo pediu foco em largura; não somei os
  mínimos de altura (`DS.Trabalho.alturaMinimaDaTabela` + `.alturaMinimaDoPainel`
  = 340 vs. o `minHeight: 400` genérico) com o mesmo rigor — a diferença aqui é
  pequena (340 < 400), mas não confirmei se alguma tela tem mínimo de altura
  maior que 400 escondido em outro lugar.
- **VoiceOver/teclado nas telas revisadas aqui.** Fora do escopo desta lente
  (é objeto de V-06, já conhecido).
