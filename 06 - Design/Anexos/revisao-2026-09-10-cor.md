# Revisão de cor — Bancada (app + site + tokens)

Lente: cor. Metodologia: leitura de `tokens.json`, `Tokens.swift`,
`ParidadeDeTokensTests.swift`, `gerar-site.js` (`variaveis()`) e
`scripts/estilo/*.css`/`site/estilo.css`, mais os pontos de consumo em
`Sources/Bancada/**`. Todo número abaixo saiu de um script Python descartável
em `/Users/fabriciotosta/.claude/jobs/79aea666/tmp/{cor.py,analise.py}`
(conversão OKLCH própria — matriz sRGB→OKLab padrão —, contraste WCAG 2.1
idêntico ao de `ParidadeDeTokensTests`, e APCA simplificado). Nenhum arquivo do
projeto foi alterado; o app não foi aberto.

## Tabela de medições

| Par | Esquema | WCAG | APCA Lc | Limiar | Passa? |
|---|---|---|---|---|---|
| borda `#E6E7EA` vs superficie `#FFFFFF` | claro | 1.24:1 | 11.7 | 3:1 | não |
| borda `#E6E7EA` vs fundo `#FCFCFD` | claro | 1.21:1 | 10.0 | 3:1 | não |
| borda `#E6E7EA` vs cromo/dado `#F4F5F7` | claro | 1.13:1 | 0.0 | 3:1 | não |
| borda `#26282D` vs superficie `#141518` | escuro | 1.24:1 | 0.0 | 3:1 | não |
| borda `#26282D` vs fundo `#0C0D0F` | escuro | 1.32:1 | 0.0 | 3:1 | não |
| borda `#26282D` vs cromo/dado `#1B1D21` | escuro | 1.14:1 | 0.0 | 3:1 | não |
| status/tipoFato (9 papéis) vs 5 superfícies | ambos | 4.63–8.08:1 | — | 3:1 | sim (pior caso sempre contra `cromo`) |
| véu.sutil (0.08) acento sobre superfície | claro/escuro | 1.11–1.12:1 | 0.0 | 15 (Lc) | não |
| véu.forte (0.22) acento sobre superfície | escuro | 1.42:1 | 0.0 | 15 (Lc) | não |
| véu.forte (0.22) acento sobre superfície | claro | 1.38:1 | 18.7 | 15 (Lc) | sim (marginal) |
| `#fff` vs status-concluida `#4FC98A` (site, escuro) | escuro | 2.09:1 | -45.1 | 3:1 | não |
| `#fff` vs status-concluida `#1E7A4C` (site, claro) | claro | 5.33:1 | -81.5 | 3:1 | sim |
| ambar.profundo — chroma usado / chroma máximo em sRGB no mesmo L/H | — | C=0.104 / máx=0.109 = 95% | — | — | quase no teto |
| violeta.profundo — idem | — | C=0.138 / máx=0.320 = 43% | — | — | bem abaixo do teto |
| violeta.luz — idem | — | C=0.119 / máx=0.179 = 66% | — | — | abaixo da família (77–84%) |
| rampa neutra, delta L médio dos passos | — | 0,065 (desvio 0,037) | — | — | passo 7→8 é 13,5× o passo 0→1 |
| soma L(i)+L(13-i) para os pares realmente usados (2↔11, 3↔10, 6↔7) | — | 1,189–1,205 (spread 1,3%) | — | — | espelhamento se sustenta |

## Achados

### COR-01 · Borda e divisor não passam em 3:1 contra nenhuma das cinco superfícies
**Onde:** `Bancada/tokens.json:47,67` (papel.borda, papel.divisor) · `Bancada/Sources/DesignSystem/Tokens.swift:111,128` · não coberto por nenhum teste — `ParidadeDeTokensTests.swift:356` (`testFioSeparaIgualNosDoisEsquemas`) só confere se o fio separa **igual** nos dois esquemas, nunca se separa **o suficiente**.
**Superfície:** tokens (propaga para app e site)
**Gravidade:** alta
**Confiança:** confirmado (medido)
**O que está errado:** `borda`/`divisor` resolvem para `neutro.3` (claro) e `neutro.10` (escuro) — um passo de distância da superfície mais próxima na rampa. Medido contra as cinco superfícies onde o sistema os usa, o contraste fica entre **1,13:1 e 1,32:1** nos dois esquemas; o mínimo WCAG para elemento de UI é 3:1. Por APCA, quatro das seis combinações medem Lc 0,0 — abaixo até do piso absoluto de 15 para algo ser discernível.
**Por que importa:** é o fio que substitui sombra no sistema ("Fio de 1px, nunca sombra difusa" — ledger de decisões). Se o fio não separa, a decisão de não ter sombra fica sem a peça que a sustenta: painéis, células de tabela e cartões perdem o único sinal de contenção que têm. A revisão anterior já apontou isso como medição pendente ("Os 3:1 de componente nunca são medidos"); agora está medido, e falha.
**Correção:** não é caso de trocar um hex isolado — a rampa inteira usa esses passos como vizinhos por design. A correção respeitando as três camadas é abrir mais distância entre os passos 2↔3 e 10↔11 (ou introduzir um passo intermediário na rampa) até que `borda` alcance 3:1 contra `superficie`, `fundo` e `cromo`/`dado` nos dois esquemas — e adicionar um teste de paridade que trave esse mínimo, do mesmo jeito que `testTodoPapelDeTextoPassaEmAA` trava o 4,5:1 de texto.

### COR-02 · `status(.revisao)` faz dois papéis que o sistema não nomeou, e coincide na tela com `tipoFato.pages`
**Onde:** `Bancada/Sources/Bancada/JanelaPrincipal.swift:74` (distintivo de Ajustes) · `Bancada/Sources/Bancada/Telas/TelaAjustes.swift:202` (triângulo "Notas fora da convenção") · coexistência real em `Bancada/Sources/Bancada/Telas/TelaTrabalho.swift:67` (Etiqueta de status, cabeçalho) e `:96-102` (`LinhaDeFato`/`MarcadorDeTipo`, mesmo painel, linhas abaixo)
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li o código); a coincidência de dados (tarefa em `revisao` com fato `pages` vinculado) é plausível, não vi rodando
**O que está errado:** `Sistema de Design.md` deixa registrado que "Aviso é âmbar" — mas não existe `papel.aviso` em `tokens.json`. Sem esse papel, dois pontos do código tomam o atalho de chamar `cores.status(.revisao)` para colorir coisas que não são status de tarefa: o contador de itens inválidos na barra lateral e o ícone de aviso em Ajustes. É o mesmo erro de "emprestar por valor" que a `color-usage.md` descreve para tokens de papel — só que aqui é uma função (`status(.revisao)`) que empresta, não um hex. Separadamente, em `TelaTrabalho`, o cabeçalho mostra a `Etiqueta` de status da tarefa (âmbar se `revisao`) e a lista de fatos abaixo mostra `MarcadorDeTipo` colorido por `tipoFato` (âmbar se `pages`) — os dois no mesmo painel, ao mesmo tempo, se a tarefa selecionada estiver em revisão e tiver um fato do tipo `pages` vinculado.
**Por que importa:** o projeto inteiro se apoia na tese "fato ≠ narrativa" — a cor devia ajudar a distinguir categorias, não embaralhá-las. `MarcadorDeTipo` é texto mono sem fundo e `Etiqueta` é uma pílula preenchida, então o tratamento visual difere; mas a cor em si é idêntica, e cor costuma ser lida antes da forma.
**Correção:** acrescente `papel.aviso` em `tokens.json` (referenciando `ambar.profundo`/`ambar.luz` — o mesmo valor que `status.revisao` já usa, então nada muda visualmente hoje) e troque as duas chamadas de `cores.status(.revisao)` citadas acima por `cores.aviso`. Isso não resolve a coincidência com `tipoFato.pages` — que o próprio JSON declara intencional — mas resolve a parte que não era: hoje um papel de tarefa está fazendo o trabalho de um papel de sistema que não existe.

### COR-03 · O véu do acento não cria uma pílula visível no escuro
**Onde:** `Bancada/tokens.json:88` (`veu.sutil/medio/forte`) · `Bancada/Sources/DesignSystem/Componentes.swift:249` (`Etiqueta`, `cor.opacity(DS.Veu.medio)`) e `:264` (uso análogo em `MarcadorDeTipo`, via `ChipDeEvento` em `TelaCalendario.swift:682`)
**Superfície:** tokens / app
**Gravidade:** média
**Confiança:** confirmado (medido)
**O que está errado:** compondo `acento` (azul) sobre `superficie` no escuro, o resultado tem **Lc 0,0 nas três intensidades de véu** — `sutil` (0,08), `medio` (0,14) e até `forte` (0,22). Por WCAG, o composto fica entre 1,11:1 e 1,42:1 contra a superfície — abaixo de qualquer limiar de UI. No claro, `forte` já chega a Lc 18,7 (visível, embora abaixo do piso de 30 para componente). Ou seja: a pílula de fundo da `Etiqueta`/badge de evento não tem fronteira perceptível no escuro em nenhuma das três forças de véu.
**Por que importa:** o texto por cima do véu é legível (4,4–7,4:1, medido) — quem lê o rótulo lê o rótulo. Mas a `Etiqueta` foi desenhada como pílula preenchida (é a "linguagem de dado" do HTTPie que o sistema cita como referência); no escuro ela não lê como pílula, lê como texto colorido flutuando. É inconsistência de esquema: a mesma peça de UI tem presença visual diferente no claro e no escuro.
**Correção:** os véus foram calibrados olhando para o claro (ou para hex, não para L). Para o escuro, ou os valores de opacidade precisam subir (ex.: `medio` e `forte` trocando de posição relativa, recalculados contra `superficie`/`folha` escuras), ou — mais alinhado à regra de três camadas — criar uma segunda escala de véu por esquema em `papel`/`primitivo`, já que veu hoje é um número único usado nos dois lados sem nunca ter sido medido contra o resultado.

### COR-04 · `#fff` bypassa o papel na regra `.caixa.feita` do site — e falha 3:1 no escuro
**Onde:** `Bancada/scripts/estilo/multipagina.css:111` (`color: #fff`) → propaga para `Bancada/site/estilo.css:306`
**Superfície:** site
**Gravidade:** média (rebaixada de alta: não encontrei nenhum gerador que emita a marcação `.lista-tarefas .caixa` — busquei em `gerar-site.js`, `scripts/markdown.js` e `Sources/VaultKit/Markdown.swift`, que trata `- [x]` como `.tarefa(feita:)` só no Swift, sem espelho HTML. Ou seja: é provável que esta regra seja código morto hoje. Não consegui confirmar 100% sem rodar o gerador linha a linha.)
**Confiança:** confirmado o hex e o contraste; plausível que a regra seja inalcançável
**O que está errado:** é o único hex literal fora da camada `primitivo` em toda a cadeia app→site. Medido contra `--status-concluida`: passa em claro (5,33:1) e **falha em escuro** (2,09:1, abaixo até do 3:1 de componente).
**Por que importa:** viola a regra dura do briefing ("componente nunca lê primitivo... papel referencia primitivo, nunca hex") e, se algum dia a marcação que a alimenta for gerada (uma lista de tarefas renderizada como Markdown no site, por exemplo), o app entrega uma marca de "concluída" ilegível no escuro sem que nenhum teste de paridade avise — `ParidadeDeTokensTests` só olha `Tokens.swift`, nunca o CSS gerado.
**Correção:** trocar `color: #fff` por `color: var(--superficie)` (ou `var(--fundo)`, o que der melhor contraste medido contra o verde) resolve o hex solto; para o contraste, `--superficie` no escuro é `#141518`, que contra `#4FC98A` mede bem acima de 3:1 — confirme antes de aplicar.

### COR-05 · A rampa neutra tem platô nas pontas e um degrau no meio; o espelhamento, porém, se sustenta
**Onde:** `Bancada/tokens.json:15-34` (primitivo.neutro) · `Bancada/Sources/DesignSystem/Tokens.swift:32-46`
**Superfície:** tokens
**Gravidade:** baixa
**Confiança:** confirmado (medido)
**O que está errado:** convertendo os 14 passos para OKLCH, o delta de L entre passos consecutivos varia de 0,009 (passo 0→1) a 0,118 (passo 7→8) — quase 13,5× de diferença. Os quatro primeiros e os quatro últimos passos formam dois platôs comprimidos perto do branco e do preto; os passos 4 a 9 concentram a maior parte do percurso perceptual num "degrau" só. A afirmação de que a rampa é "espelhada em torno do passo 6-7", porém, se confirma bem quando medida em L perceptual para os pares que o sistema de fato usa (`neutro.2`↔`neutro.11`, `neutro.3`↔`neutro.10`, `neutro.6`↔`neutro.7`): a soma L(i)+L(13-i) fica entre 1,189 e 1,205, uma variação de só 1,3%.
**Por que importa:** hoje isso não quebra nenhum papel visível — os papéis usados pulam direto entre platô e degrau sem passar pelos passos intermediários (4, 5, 8, 9 não aparecem em `papel` nenhum). Fica registrado porque, se um papel novo precisar de "um passo a mais escuro que X" no meio da rampa, o resultado vai parecer um salto muito maior do que o mesmo movimento nas pontas.
**Correção:** nenhuma ação necessária para os papéis atuais. Se a rampa crescer, redistribuir os passos 4-9 por L perceptual (não por hex) evita que o próximo papel herde o degrau.

### COR-06 · `violeta` é a matiz mais "lavada" da família, nos dois esquemas
**Onde:** `Bancada/tokens.json:36` (primitivo.violeta)
**Superfície:** tokens
**Gravidade:** baixa
**Confiança:** confirmado (medido contra o teto de gamut sRGB por L/H)
**O que está errado:** medindo quanto de chroma cada matiz usa em relação ao máximo possível para seu próprio L/H em sRGB: `violeta.profundo` usa 43% do teto e `violeta.luz` usa 66% — a família inteira (as outras cinco) fica entre 73–96% (profundo) e 77–84% (luz). `violeta` é sistematicamente a mais distante do próprio teto, nos dois esquemas.
**Por que importa:** as seis matizes existem para funcionar como uma família ("mantém a paleta pequena" — JSON). `teste` (a única consumidora de `violeta` hoje, em `tipoFato`) tende a parecer mais pálida que `commit`, `ui` ou `revisao`/`pages` lado a lado, mesmo tendo L parecido — é chroma relativo, não L, que está desalinhado.
**Correção:** se a intenção é vividez pareada entre as seis, suba a chroma de `violeta.profundo`/`violeta.luz` mantendo H e L (ex.: para ~80% do teto, como `vermelho`), e reverifique que o novo hex ainda passa 4,5:1 contra `fundo`/`superficie`/`cromo` — o teste de paridade já cobre isso.

### COR-07 · O âmbar não está sub-saturado por escolha — amarelo estrutura o problema
**Onde:** `Bancada/tokens.json:35` (primitivo.ambar)
**Superfície:** tokens
**Gravidade:** baixa (informativo)
**Confiança:** confirmado (medido)
**O que está errado:** o escopo pediu para confirmar ou descartar a suspeita de que `#8A6410` é "marrom" por erro de escolha. Medi: `ambar.profundo` usa 95% do chroma máximo alcançável em sRGB para seu H (80,9°) e L (0,529) — mais perto do teto do que qualquer outra matiz do par `profundo`. Não é uma escolha frouxa. O teto em si é baixo (C máx ≈ 0,109 nesse H/L, contra 0,27–0,32 de azul/violeta na mesma faixa de L) porque amarelo/âmbar não consegue ficar vívido em L médio dentro do sRGB — e L médio é o que `ambar.profundo` precisa para bater 4,5:1 contra fundo claro (mede 4,92–5,37:1 hoje, pouca sobra para subir).
**Por que importa:** não é um achado que peça correção de hex — é a explicação de por que qualquer âmbar "profundo" legível em fundo claro vai tender a ler como oliva/marrom, e vale documentar essa tensão no ledger para que ninguém tente "corrigir" trocando por um hex mais dourado e acabe perdendo o AA.
**Correção:** nenhuma ação nos tokens. Se algum dia se quiser um âmbar mais "dourado" para uso decorativo (não-texto, sem exigência de AA), ele precisa de um papel novo e mais claro — não de reescrever `ambar.profundo`.

## O que está bom

- **Paridade JSON → Swift → CSS é limpa.** Fora do achado COR-04, não há um hex solto em nenhuma das três saídas — `gerar-site.js:variaveis()` resolve tudo por `papel`→`primitivo`, e `ParidadeDeTokensTests` trava valor por valor.
- **Os ícones/indicadores de `statusTarefa` e `tipoFato` passam 3:1 (e bem mais) contra as cinco superfícies**, nos dois esquemas — pior caso medido foi 4,63:1, sempre contra `cromo`. O ponto fraco de componente está na borda/divisor, não nas cores semânticas.
- **O espelhamento da rampa neutra em torno do passo 6-7 se sustenta em L perceptual**, não só em hex — ver COR-05.

## O que não consegui verificar

- Se a `Etiqueta`/badge de evento (COR-03) realmente aparece sobre `superficie` na tela ou sobre outra superfície local (ex.: dentro de uma `List` com fundo próprio do AppKit) — não abri o app, então não confirmei o fundo efetivo por trás do véu em cada tela.
- Se a regra `.lista-tarefas .caixa.feita` (COR-04) é de fato inalcançável — busquei em todos os geradores de HTML/Markdown do repositório e não achei emissor, mas não rodei `gerar-site.js` de ponta a ponta para confirmar.
- Coocorrência real de tarefa em `revisao` com fato `pages` vinculado na mesma tela (COR-02) — é plausível pelos dados que o vault aceita, não vi um caso real.
- Contraste do `estilo.css` do site contra fundos de código de terceiros (nenhum existe hoje, mas não há teste que impeça).
