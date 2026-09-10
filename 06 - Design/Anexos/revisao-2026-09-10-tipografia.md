# Achados de tipografia — Bancada

Lente: tipografia (skill `better-typography`). Escopo: `escopo-tipografia.md`.
Achados V-01 a V-07 e débitos já registrados (16 tamanhos fora da escala, zero
Dynamic Type, `CartaoComparativoUI` com metadados à mão) não são repetidos como
descoberta — só aprofundados onde há causa ou extensão nova.

Ordenado do mais grave ao menor.

---

### TIP-01 · O site multi-página nunca aplica a voz de narrativa nem o teto de medida ao corpo da nota

**Onde:** `Bancada/scripts/gerar-site.js:297-312` (`paginaDeNota`, o corpo é
inserido em `corpo += this.md(corpoSemTitulo, 'notas')` na linha 312, sem
nenhum wrapper) e `:250-282` (`paginaCapa`, o "destaque" do desafio ativo na
linha 280, mesmo problema). Confirmado no artefato gerado
`Bancada/site/notas/02-atualizacoes-diarias-2026-09-2026-09-09.html:19-21` — o
`<main>` recebe `<h2>`/`<ul>` crus, nenhuma `class="narrativa"`. Compare com o
modo página única, que faz certo em `gerar-site.js:630` e `:653`
(`<article class="narrativa">…</article>`), e com `scripts/estilo/base.css:35`
(`.narrativa { font-family: var(--serif); max-width: 66ch; }`).

**Superfície:** site
**Gravidade:** alta
**Confiança:** confirmado (li o gerador e o HTML gerado por ele)

**O que está errado:** O modo multi-página — uma página por nota, o padrão
para todo o diário, roadmap e CBL — nunca aplica `.narrativa`. Resultado: todo
texto de narrativa renderiza na voz `--sans` (IBM Plex Sans) do `body`, nunca
em `--serif`, e sem o `max-width: 66ch` que só `.narrativa` carrega. Com
`.colunas` travado em 1180px (`multipagina.css:17`) e a barra lateral de
240px, `<main>` fica com ≈ 880px de conteúdo — a 15px sans isso dá algo perto
de 110-120 caracteres por linha, muito além dos 60-75 recomendados.

**Por que importa:** dois problemas empilhados. Primeiro, quebra a tese
central do sistema — a mesma nota de diário que é "uma pessoa falando" em
serifa no app e na página única passa a ser "o app falando" (sans) no modo
mais comum do site. Segundo, e independente disso, ≈115 caracteres por linha é
quase o dobro do teto que o próprio CSS já sabe aplicar (`.narrativa`
existe, só não é usada aqui).

**Correção:** em `paginaDeNota` (linha 312) e no "destaque" de `paginaCapa`
(linha 280), envolver o `corpo` em `<article class="narrativa">…</article>`,
exatamente como `pagina-unica` já faz. Nenhum papel novo: `.narrativa` já
resolve família e medida: só falta aplicá-la no template que ainda não a usa.

---

### TIP-02 · A superfície de leitura do app não tem teto de medida

**Onde:** `Bancada/Sources/DesignSystem/Componentes.swift:216-218` (`Folha`,
`.frame(maxWidth: .infinity, alignment: .leading)`, sem teto);
`Bancada/Sources/DesignSystem/TextoDeNota.swift:39` (mesmo padrão); uso em
`Bancada/Sources/Bancada/Telas/TelaDiario.swift:53-56`
(`Folha { TextoDeNota(atual.corpo) }.frame(minWidth: 320)` — só piso, sem
teto).

**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código e medi a captura
`bancada-diario.png`/`bancada-diario-claro.png`, janela 1352×848)

**O que está errado:** `Folha` e `TextoDeNota` só declaram `maxWidth:
.infinity` — não existe teto em lugar nenhum da cadeia. Na captura de
referência, a coluna central do Diário mede na prática ≈252pt de conteúdo
(painel ≈356pt − 40pt de padding do `Folha` − 64pt do padding interno
`DS.Espaco.xl`), o que dá **32-37 caracteres por linha** em `leitura` (New
York 15pt) — contei diretamente na imagem: "elementos internos (compensação
de" = 34 caracteres, "alinhamento óptico do glifo, hit area" = 37. Isso é bem
abaixo dos 60-75 recomendados. E como não há teto, o número varia livremente
para os dois lados: apertar as colunas vizinhas estreita ainda mais (o piso é
só 320pt de painel, ≈216pt de texto, ≈28 caracteres), e alargar a janela
alarga sem limite — nada impede passar de 75 numa janela grande.

**Por que importa:** é a superfície que o sistema inteiro existe para servir
— a nota central da tese "fato ≠ narrativa". Hoje o comprimento de linha não é
uma decisão de design, é acidente de `HSplitView`. `TelaAcervo` já resolveu
isso para o painel de mídia (`DS.Acervo.larguraMaximaDoPainel = 480`,
`TelaAcervo.swift:64-69`, com o comentário "o teto importa"); o Diário — que é
onde a voz de narrativa realmente mora — ficou de fora dessa correção.

**Correção:** aplicar um teto ao `Folha`/`TextoDeNota` do Diário, do mesmo
jeito que `TelaAcervo` já faz para o painel de mídia. A 15pt New York, ~65ch
fica perto de 480-560pt de conteúdo; somando os paddings (40+64=104pt), um
`maxWidth` de ~600-650pt no `.frame` de `TelaDiario.swift:56` (ou dentro do
próprio `Folha`) resolve sem token novo — é o mesmo padrão que `TelaAcervo` já
provou, só falta repetir aqui.

---

### TIP-03 · Contagem sem dígito tabular no Diário; data do comparativo abaixo do piso da escala e fora da voz de fato

**Onde:** `Bancada/Sources/Bancada/Telas/TelaDiario.swift:39` (`Text("\(fatos
.filter { $0.data == nota.data }.count) fatos")`, sem `.monospacedDigit()` —
compare com a linha 63-65, que tem); `Bancada/Sources/Bancada/Telas/
TelaRegistros.swift:268` (`Text(info.data).font(.system(size: 9))`, com
`.monospacedDigit()` mas em voz sans).

**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado

**O que está errado:** A lista de dias do Diário empilha "24 fatos" e "28
fatos" na mesma posição horizontal, e a contagem não tem
`.monospacedDigit()` — hoje não desalinha porque os dois dias visíveis têm 2
dígitos, mas quebra no primeiro dia de 1 dígito. Em `TelaRegistros:268`, a
data do `CartaoComparativoUI` sai a 9pt na voz sans (com `.monospacedDigit()`,
isso está certo) mas nunca troca para a voz `fato` (mono) — é dado, e 9pt
também fica abaixo do menor degrau da escala (`rotulo`, 10pt).

**Por que importa:** o dígito tabular existe exatamente para este caso — uma
coluna de valores que mudam de linha para linha. E o ponto de 9pt sem voz mono
é a única data do app fora da regra "fato = mono, tudo que saiu de hook ou
metadado".

**Correção:** `.monospacedDigit()` na linha 39 do Diário; migrar
`TelaRegistros:268` para `DS.Tipografia.monoDetalhe` (11pt, mono, já tabular
por definição da voz — resolve os dois problemas de uma vez).

---

### TIP-04 · Título de tarefa trunca em 1 linha sem tooltip no cabeçalho de Trabalho

**Onde:** `Bancada/Sources/Bancada/Telas/TelaTrabalho.swift:62-65`
(`Text(tarefa.titulo).font(DS.Tipografia.secao)...​.lineLimit(1)`).

**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado

**O que está errado:** O título corta em 1 linha sem `.help()` nem nenhuma
outra forma de ler o resto. Compare com `CartaoDeMidia`
(`TelaAcervo.swift:138`), que sempre expõe `.help(midia.caminhoRelativo)` para
o que truncou.

**Por que importa:** títulos de tarefa do vault têm a forma "T-0002 —
Refatorar UI da Bancada + WebView"; com ID, etiqueta de status e o botão "Ver
todos os fatos" disputando a mesma `BarraDePainel`, truncar é rotina, não
exceção — e sem tooltip a informação some de verdade, não só visualmente.

**Correção:** `.help(tarefa.titulo)` na mesma `Text`.

---

### TIP-05 · `detalhe` tem entrelinha relativa menor que `corpo`, na direção errada

**Onde:** `Bancada/tokens.json` → `tipografia.interface` (`corpo`: 13/1.4;
`detalhe`: 11/1.35).

**Superfície:** tokens
**Gravidade:** baixa
**Confiança:** confirmado (leitura do `tokens.json`)

**O que está errado:** A regra que a própria tabela segue no resto (tamanho
menor → entrelinha relativa maior) inverte entre `corpo` e `detalhe`: o
tamanho menor (11pt) tem a proporção menor (1.35) que o maior (13pt, 1.4).
`rotulo` (10pt/1.2) não entra nessa crítica — é rótulo de uma linha,
isento pela própria regra de "texto curto".

**Por que importa:** é uma inconsistência pequena (0.05) mas mensurável
contra a própria tabela, e `detalhe` aparece em texto que por vezes quebra em
2 linhas (`TelaRegistros.swift:274-277`, `.lineLimit(2)`), onde a folga extra
ajudaria.

**Correção:** subir `interface.detalhe.entrelinha` para 1.4 ou 1.45 em
`tokens.json` e no espelho `Tokens.swift` (os dois, por causa do
`ParidadeDeTokensTests`).

---

### TIP-06 · Wikilink e link externo perdem a distinção visual no site

**Onde:** `Bancada/scripts/markdown.js:48-62` (os dois casos geram `<a>`);
`Bancada/scripts/estilo/multipagina.css:43` (`a { color: var(--acento); }`,
sem diferenciar sublinhado).

**Superfície:** site
**Gravidade:** baixa
**Confiança:** confirmado

**O que está errado:** No app, `TextoDeNota.pedaco`
(`TextoDeNota.swift:235-238`) distingue wikilink (sem sublinhado) de link
externo (`.underline()`) — de propósito, como diz o comentário do arquivo. No
site, `markdown.js` gera `<a>` para os dois e nenhuma regra de CSS remove
`text-decoration` do `<a>` genérico dentro de `main`; os dois saem sublinhados
pelo padrão do navegador.

**Por que importa:** pequena quebra de paridade — a mesma nota comunica duas
categorias de link no app e uma só no site.

**Correção:** emitir uma classe para wikilink em `markdown.js:52` (ex.
`class="wikilink"`) e, no CSS (`multipagina.css`, `pagina-unica.css`),
`.wikilink { text-decoration: none; }`.

---

## O que está bom

- **A medida do painel de Acervo já está resolvida.** `DS.Acervo.
  larguraMaximaDoPainel = 480` (`TelaAcervo.swift:64-69`) dá, depois do
  padding, ≈440pt de conteúdo — perto de 58 caracteres por linha em `leitura`.
  Não é o ideal (um pouco abaixo de 60), mas está dentro de uma ordem de
  grandeza razoável e, mais importante, **existe um teto** — o que falta
  exatamente no Diário (TIP-02).
- **`Markdown.swift` e `markdown.js` preservam a pontuação como foi escrita.**
  Nenhum dos dois converte nem corrompe aspas, travessão ou elipse — o vault
  já escreve `—` como caractere real (visto em várias notas), e os dois
  parsers só extraem estrutura, sem tocar em pontuação. Não há achado aqui.
- **O cruzamento de vozes dentro do texto renderizado funciona nos dois
  lados.** `TextoDeNota.pedaco` (código inline → mono) e `code, .mono` em
  `estilo.css:162` fazem a mesma coisa: um hash ou caminho de arquivo sai em
  mono mesmo no meio de uma frase em serifa, no app e no site.

## Tabela — os 17 `.font(.system(size:))` crus (item 7 do escopo)

O débito registrado fala em 16; contei **17** ocorrências de
`.font(.system(size:))` fora de `Tokens.swift`. Não consegui confirmar qual é
a diferença em relação à contagem anterior — `Bancada/` não é um repositório
git nesta máquina (`git log` falha com "not a git repository"), então não há
histórico para comparar. Marco isso como não verificado, não como achado novo.

Das 17, **13 são tamanho de ícone** (`Image(systemName:)` via `.font()`, não
texto corrido) e **4 são `Text()`** de verdade, todas dentro do
`CartaoComparativoUI` já registrado como débito assumido ("metadados escritos
à mão") — não repito como descoberta, só encaixo na tabela pedida.

| Arquivo:linha | Tamanho | Tipo | Papel mais próximo | Migra para | Sem degrau correspondente? |
|---|---|---|---|---|---|
| `TextoDeNota.swift:171` | 12 | ícone (checkbox de tarefa) | — | escala de ícone (não existe) | sim — ícone não tem escala própria |
| `Componentes.swift:373` | 28 | ícone (símbolo do `Vazio`) | acima de `titulo` (22) | escala de ícone (não existe) | sim — maior que qualquer tamanho de texto |
| `Componentes.swift:445` | 11 | ícone (lupa da busca) | coincide com `detalhe`/`monoDetalhe` (11) | escala de ícone (não existe) | não numericamente, mas é ícone, não texto |
| `Componentes.swift:458` | 11 | ícone (X de limpar busca) | idem acima | escala de ícone (não existe) | idem |
| `Componentes.swift:537` | 10 | ícone (menu de multi-seleção) | coincide com `rotulo` (10) | escala de ícone (não existe) | idem |
| `Componentes.swift:573` | 7 | ícone (X do chip de filtro) | — | escala de ícone (não existe) | **sim — o caso citado no escopo**: nem `rotulo` (10) chega perto |
| `Componentes.swift:622` | 10 | ícone (seletor segmentado) | coincide com `rotulo` (10) | escala de ícone (não existe) | idem "437/537" |
| `Thumbnail.swift:41` | 20 | ícone (falha de miniatura) | coincide com `leituraTitulo` (20) | escala de ícone (não existe) | idem |
| `TelaRegistros.swift:197` | 14 | ícone (cabeçalho do comparativo) | buraco entre `corpo` (13) e `secao` (15) | escala de ícone (não existe) | sim — nem como texto existiria degrau em 14 |
| `TelaRegistros.swift:248` | 10, bold | **texto** (tag de versão) | `rotulo` (10, medium, tracking 0.6, uppercase) | `rotulo` | não — mas peso (bold) e tracking (0) divergem de `rotulo` |
| `TelaRegistros.swift:254` | 11, semibold | **texto** (título da versão) | `detalhe` (11, regular) | `detalhe` + `.fontWeight(.semibold)` | não — peso diverge |
| `TelaRegistros.swift:268` | 9 | **texto** (data) | menor que `rotulo` (10) | `monoDetalhe` (11, mono) — ver TIP-03 | **sim — abaixo do piso da escala** |
| `TelaRegistros.swift:274` | 10 | **texto** (delta, 2 linhas) | entre `rotulo` (10, rótulo) e `detalhe` (11, corpo) | `detalhe` | sim — não há "legenda de 2 linhas" na escala |
| `JanelaPrincipal.swift:167` | 10 | ícone (pasta do vault) | coincide com `rotulo` (10) | escala de ícone (não existe) | idem |
| `TelaCalendario.swift:444` | 7, semibold | ícone (puxador comprimir/expandir) | — | escala de ícone (não existe) | **sim — o segundo caso citado no escopo** |
| `TelaCalendario.swift:755` | 9 | ícone (espécie de evento) | — | escala de ícone (não existe) | sim |
| `TelaAjustes.swift:175` | 9 | ícone (cadeado de somente leitura) | — | escala de ícone (não existe) | sim |

O padrão que a tabela mostra: quase todo o "furo da escala" é ícone (SF
Symbol via `.font()`), não texto — a escala de tipografia não tem (e
provavelmente não deveria ter) um degrau para cada tamanho de glifo de ícone.
O que falta não é um degrau de texto a mais; é uma escala de ícone separada
(`DS.Icone.pequeno/medio/grande` ou similar) para os `Image(systemName:)`
pararem de carregar valores soltos — inclusive os dois `size: 7` que o próprio
escopo já sinalizou. Os quatro casos que **são** texto de verdade (linhas
248/254/268/274) já são o débito conhecido do `CartaoComparativoUI`; o único
com problema novo é a linha 268 (TIP-03), que fica abaixo do piso da escala
existente.

## O que não consegui verificar

- **Contraste renderizado real das duas vozes.** Medi caracteres por linha a
  partir da captura e do código, não abri o app (proibido nesta rodada) —
  não confirmei visualmente o efeito do teto proposto em TIP-02, só o cálculo.
- **Colisão entre `secao` (15, sans, semibold) e `leitura` (15, serif,
  regular) quando adjacentes.** O escopo pergunta se colidem "quando
  próximas"; só encontrei o caso em `TextoDeNota.fonteDeTitulo` (título nível
  ≥3 usa `secao`, mas o vault quase só escreve `#`/`##` — nível ≥3 é raro).
  Não achei uma nota real do vault com esse nível renderizada por
  `TextoDeNota` para confirmar visualmente; marco como não verificado, não
  como achado.
- **Diferença entre 16 e 17 na contagem de `.font(.system(size:))` cru** —
  `Bancada/` não tem histórico git nesta máquina para comparar com a revisão
  anterior.
- **Dynamic Type e Reduzir Movimento** — já debito conhecido; não testei
  redimensionamento real porque o app não podia ser aberto.
