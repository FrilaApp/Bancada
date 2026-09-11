---
tipo: design
desafio: C18
data_criacao: 2026-09-09
tags: [design, sistema]
---

# Sistema de Design da Bancada

O que governa a aparência das duas superfícies do projeto: o app nativo
(`Bancada`) e o site estático da Fase 2. Uma fonte só — `Bancada/tokens.json` —
lida pelo app, pelos dois modos do site e pelo gerador do ícone.

Esta nota é a parte que o código não consegue dizer: **por que** cada decisão
existe, e a quem recorrer quando aparecer um caso novo.

## A tese

> Fato e narrativa não se parecem.

É a regra de ouro do vault ([[CLAUDE]]) virada forma. Fatos são escritos pelos
hooks do Git, são append-only e ninguém os edita. Narrativa é escrita por gente,
e nenhuma frase dela existe sem um fato que a sustente. Se as duas coisas
tivessem a mesma aparência, a interface estaria desmentindo o vault.

Então o sistema tem **três vozes**, e a escolha de voz nunca é estética:

| Voz | Onde | O que significa |
|---|---|---|
| **Interface** — sans | barra lateral, botões, rótulos, tabelas | o app falando |
| **Narrativa** — serif | diário, corpo de nota, Markdown derivado | uma pessoa falando |
| **Fato** — mono | hora, tipo, autor, hash, caminho de arquivo | um hook falando |

A superfície de leitura **renderiza** o Markdown; não o exibe. Enquanto o
Diário mostrava `# 2026-09-09` e as crases como caractere, a voz serifada
estava desmentindo a si mesma — a serifa existe porque narrativa é uma pessoa
falando, e o que estava na tela era o arquivo-fonte falando. Pior: a serifa
fazia a falha parecer intenção. O parser vive em `VaultKit/Markdown.swift`,
espelha o mesmo subconjunto que `scripts/markdown.js` entrega ao site, e faz a
mesma promessa: o que ele não cobre **degrada, não quebra**.

Dentro do texto renderizado, as vozes se cruzam de propósito: um hash de commit
ou um caminho de arquivo entre crases sai em mono mesmo no meio de uma frase em
serifa. É a regra de ouro do vault na largura de uma palavra.

O token é o **papel**, não o arquivo de fonte: o app usa a superfamília do
sistema (SF · New York · SF Mono), o site usa IBM Plex Sans/Serif/Mono. Se um
dia a Bancada virar iPad ou o site virar outra coisa, a regra sobrevive à troca
de família.

## As três camadas

O que dá modularidade não é a quantidade de tokens; é a separação entre eles.

**1 · Primitivo** — as rampas. Uma rampa neutra de 14 passos e seis matizes com
dois passos cada. **Todo hex do sistema nasce aqui e só aqui.**

**2 · Papel** — o vocabulário que a interface fala: `fundo`, `superficie`,
`cromo`, `folha`, `dado`, `borda`, `texto`, `textoSutil`, `acento`, `foco`,
`perigo`, `divisor`. Cada papel é um par claro/escuro e **referencia** um
primitivo — nunca carrega hex. Trocar um passo da rampa propaga sozinho para o
app, para os dois modos do site e para o ícone.

**3 · Componente** — `DS/Componentes.swift` e `scripts/estilo/*.css`. Só leem
papel.

> [!info] A regra que sustenta tudo
> Componente nunca lê primitivo. Se um componente precisa de uma cor que nenhum
> papel oferece, **o papel é que está faltando** — acrescente o papel, não o
> hex. É por isso que expandir o sistema é barato.

Papéis distintos podem hoje resolver para o mesmo valor (`cromo`, `dado` e
`superficieSutil` são o mesmo passo da rampa). Isso não é redundância: é a
liberdade de divergi-los depois sem tocar em componente nenhum.

## De onde veio a direção

Três produtos, e cada um com um trabalho delimitado — o sistema **não** é a
média dos três.

| Referência | O que governa | O que trouxe |
|---|---|---|
| **Linear** | o chrome | canvas quase-acromático, camadas por tom em vez de sombra, densidade compacta (8px), rótulos de grupo em micro-caps, um acento raro |
| **Craft** | a superfície de leitura | a nota como folha flutuante sobre o chrome, entrelinha generosa **só** no conteúdo, painel segmentado, destrutivo em vermelho no rótulo e no ícone |
| **HTTPie** | a linguagem de dado | mono como cidadão de primeira classe, cor semântica restrita a tipo de dado, fio de 1px entre painéis, badge micro-caps para estado |

A divisão espelha a própria arquitetura da Bancada: chrome, narrativa, fato.

### Ledger de decisões

Toda escolha grande tem procedência. Sem procedência, não é decisão de design —
é gosto.

| Decisão | Fonte | Por quê |
|---|---|---|
| Base neutra, não creme/terracota | as três referências | a paleta antiga era o default "editorial calmo"; nenhuma referência é quente |
| Elevação é mais clara nos dois esquemas | Linear (surfaces 0-3) | simetria pura poria a superfície abaixo do fundo no escuro, e um cartão pareceria buraco |
| Um acento só, raro | Linear (o lime é exclusivo de CTA) | impede o sistema de virar arco-íris ao crescer |
| Densidade compacta no chrome, folgada na leitura | Craft | cinco seções precisam caber; o texto que alguém lê, não |
| Mono para tudo que saiu de hook | HTTPie | a regra de ouro do vault, na largura de uma linha |
| Cor semântica só em tipo de dado | HTTPie (métodos HTTP) | a cor informa categoria; se decorar, deixa de informar |
| Fio de 1px, nunca sombra difusa | as três | um recurso de profundidade que não precisa de calibragem separada por esquema |
| `texto` escuro é o passo 2, não o 1 | — | branco puro sobre quase-preto ofusca |
| `a-fazer` não tem cor | — | ainda não é estado; ganhar cor seria fingir que é |
| Tipo de fato desconhecido cai no neutro | `registrar-fato.sh` aceita tipo arbitrário | categoria que o sistema não conhece não empresta a cor de outra |
| Aparência tem três estados, com `Sistema` no padrão | convenção do macOS | um par claro/escuro sem "Sistema" obriga a reescolher toda vez que o Mac troca sozinho |

## O que o sistema recusa

- **Sombra difusa como elevação.** Profundidade vem de camada e de fio — e isso
  vale também para o que flutua. Prévia, dica e painel contextual usam
  `Sobreposicao`: superfície um passo acima do fundo, fio de 1px, raio `lg`,
  sem sombra. A regra precisou virar componente depois que o único overlay que
  o app não desenhava — um `popover` nativo — apareceu contradizendo a
  doutrina. Enquanto "não use sombra" foi só uma frase, o controle nativo
  passou por baixo dela.
- **Um segundo acento.** Se algo novo precisa se destacar, ou usa o acento
  existente, ou usa hierarquia — não uma cor nova.
- **Acento como fundo de área.** Ação primária, estado ativo, link e foco. Só.
- **Vermelho fora de destrutivo e erro.** Aviso é âmbar; ênfase não é cor.
- **Serifada em controle de interface.** A voz de narrativa é do conteúdo.
- **Controle nativo onde o sistema já tem o seu.** Dois vocabulários para a
  mesma função — o azul sólido do `Picker(.segmented)` numa tela e a pílula
  cinza do `SeletorSegmentado` na outra — é divergência fabricada por quem tem
  componente e não consome. E o inverso também: reimplementar à mão seleção,
  recuo ou realce que a `List` já desenha.
- **Peça de sistema sem consumidor.** Componente ou papel que ninguém usa não é
  vocabulário, é peso morto — e envelhece sem ninguém notar. `Distintivo` saiu
  quando perdeu o último ponto de uso.
- **Mono em texto escrito por gente.** A voz de fato é de quem não digitou.
- **Estado vazio que se desculpa ou inventa exemplo.** Um dia sem registro é um
  dado, não um problema a esconder.
- **Comentário que promete comportamento.** Neste repositório o comentário
  carrega doutrina — é onde as decisões moram —, e por isso ele é lido como
  contrato. `main.swift` dizia "com Dock e menu" e o menu nunca era montado;
  `TelaAcervo` dizia "mesma superfície de leitura, mesmo tratamento" e a linha
  seguinte chamava `TextoDeNota` sem a `Folha`. Comentário que promete e não
  entrega é código não escrito com aparência de código escrito.
- **Número solto onde falta um passo na escala.** Dezessete `.font(.system(size:))`
  crus não eram indisciplina: treze eram **ícone**, e não existia escala de
  ícone. Quando o mesmo número aparece em vários pontos de uso, o sistema não
  tem um problema de obediência — tem um passo faltando. Daí vieram `DS.Icone` e
  `Raio.xs`.
- **Peça de sistema com consumidor parcial.** É a terceira face do mesmo
  defeito, e a mais difícil de ver: `LinhaDeFato` era consumida por duas telas
  das quatro que desenhavam a mesma linha, e `LinhaDeValor` não cobria o peso de
  destaque que Registros precisava — então Registros forkou. Peça que não cobre
  o caso real vira peça bifurcada, e bifurcação ninguém revisa.
- **Papel nomeado em prosa e ausente dos tokens.** Esta nota dizia "Aviso é
  âmbar" enquanto o código tomava `statusTarefa.revisao` emprestado em dois
  pontos — um deles pintando um triângulo de alerta com cor de *status de
  tarefa*. Se a doutrina nomeia um papel, o papel existe.

## Acessibilidade

Acessibilidade não é auditoria depois — é vocabulário, do mesmo jeito que cor e
tipografia são. A nota não dizia uma palavra sobre isso até a revisão de
2026-09-10, e o resultado foi um app que chegava ao VoiceOver lendo "2, 5, 2, 6"
e que não tinha **menu nenhum**, logo não tinha Cmd+C num leitor de vault.

**Todo componente que expõe uma ação declara nome, papel e estado antes de
declarar aparência.** Sem isso não está pronto, mesmo parecendo pronto na tela.

**Foco é peça, não intenção.** `DS.Cor.foco` e `DS.Traco.foco` existiram desde o
começo sem um único ponto de uso — projetados e nunca implementados. Hoje têm
consumidor: o modificador `.anelDeFoco(_:)`. O desenho do anel é **um** para o
app inteiro, porque a lição já apareceu três vezes aqui: regra que não é peça
não se cumpre.

**Controle que só responde a arrasto ou clique precisa de caminho de teclado
antes de ser considerado terminado.** O cartão do Acervo era `onTapGesture` e
virou `Button`: teclado, foco, hover e pressionado vieram juntos, do mesmo lugar
que o resto do app. `onTapGesture` não é foco.

**Texto que parece link é clicável, ou não recebe essa aparência.** O sistema
não empresta a linguagem visual de ação a texto que não age — era o caso do link
de Markdown, que saía sublinhado sobre um texto sem gesto, sem teclado e sem
traço de link.

**Imagem ao lado de texto que já a nomeia é decorativa e se marca como tal.**
Imagem sozinha precisa de rótulo que descreva o que ela mostra, nunca o nome do
arquivo.

**Um controle desabilitado é uma decisão de estado, não a ausência de uma.**
Declare a condição exata, e prefira manter habilitado e comunicar com clareza a
desabilitar sem explicar.

Nada disso é novo em espécie: são as mesmas regras de camada, papel e voz que já
governam cor e tipo, aplicadas a quem não vê a tela ou não usa mouse.

## O que a medição de 2026-09-10 mudou

A [[06 - Design/Revisão Profunda de UI - 2026-09-10|revisão profunda]] mediu o
que até então era afirmação. Três decisões saíram de lá, e ficam aqui porque
mudaram o sistema, não só o código.

**A elevação no claro subiu um passo.** `fundo` era `neutro.1` e virou
`neutro.2`. A folha separava do fundo por ΔL 0,87 no claro contra 3,71 no
escuro — a elevação valia um quarto de um lado, e era a causa real de a
superfície de leitura não se ler como superfície. Agora separa por 3,00.

O custo é declarado: no claro, `fundo` e `cromo` passam a dividir o passo. **No
claro o sistema tem duas superfícies, não três** — cinza para o que opera,
branco para o que se lê. Separar as duas custaria a elevação da folha, e a folha
é o que a tese precisa. `testFolhaSeSeparaDoFundoNosDoisEsquemas` trava isso.

**O fio virou dois.** `borda` contorna peça; `divisor` separa painel de painel.
Eram o mesmo passo, e o divisor — que numa linguagem sem sombra é quem diz onde
uma região acaba — media 1,13:1. `divisor` desceu para `neutro.4`/`neutro.9` e
ganhou 18% de presença, mantendo separação equivalente nos dois esquemas.

**E o sistema recusa, com número, perseguir os 3:1 da WCAG no fio.** Contra
branco, o primeiro passo da rampa que chega a 3:1 é o `neutro.6` (`#8A8F98`,
3,25:1). A 1px isso é régua, não fio: destruiria a linguagem inteira para
satisfazer um critério escrito para *identificar controle*, não para separar
região. A regra fica: **o fio não carrega sozinho o trabalho da camada.** Quando
a separação precisa ser lida com certeza, ela vem do tom — e o fio confirma.

O âmbar do claro segue marrom, e isso também é medição, não descuido: matiz 81°
a L 52,9 é oliva. Não há âmbar mais claro que passe em 4,5:1 sobre superfície
quase branca — amarelo escurecido vira terra, e é uma propriedade do amarelo.
Onde o âmbar precisar brilhar, ele é indicador (3:1), não texto.

## Aparência: o padrão e o override

A Bancada acompanha a aparência do macOS — continua sendo a regra, e é o valor
padrão. `Ajustes → Aparência` acrescenta o override, com **três** estados e não
dois: `Sistema` · `Claro` · `Escuro`.

Três, e não dois, porque um par claro/escuro sem "Sistema" é pior que não ter
opção: obriga a pessoa a escolher de novo toda vez que o Mac troca de aparência
sozinho ao anoitecer. É também o que o próprio macOS faz nas Ajustes dele.

A preferência muda a aparência do `NSApplication` inteiro, não só das views —
barra de título, menus e o painel de escolher vault acompanham. Como o
`NSHostingView` deriva o `ColorScheme` da aparência efetiva, `CoresDoAmbiente`
segue junto sem que nenhuma view saiba que existe uma preferência. Nenhum
componente precisou mudar: é o que o par claro/escuro em todo token já
garantia.

## Como não deixar divergir

`tokens.json` é a fonte; `DS/Tokens.swift` é um espelho manual dela, por escolha
(verificação em tempo de compilação, sem recurso extra no executável). O custo
dessa escolha era um comentário pedindo "mexa nos dois" — e comentário não
segura divergência.

Agora quem segura é `Tests/DesignSystemTests/ParidadeDeTokensTests.swift`, que
quebra se:

- um valor divergir entre o JSON e o Swift;
- um papel existir só de um lado;
- um papel carregar hex literal em vez de referenciar primitivo;
- a rampa deixar de ser monotônica;
- a elevação parar de subir em algum dos esquemas;
- o fio passar a separar diferente no claro e no escuro;
- qualquer papel de texto cair abaixo de 4,5:1 (AA) contra fundo, superfície ou
  chrome, em qualquer dos dois esquemas.

O sistema de design tem alvo próprio no `Package.swift` justamente por isso: um
teste consegue importá-lo, e a fronteira `public` obriga cada componente a
declarar a própria API.

## O que ainda não está no sistema

Registrado para não parecer pronto:

- **A ActionShelf não participa.** `MotionTokens.Theme` (escuro, cyan, Liquid
  Glass) e este `DS` são duas identidades, em dois repositórios. Unificar — ou
  decidir formalmente que são marcas distintas — está em aberto.
- **Movimento tem dois valores só.** O suficiente para o que muda de estado
  hoje. Uma escala de mola como a da ActionShelf vem quando houver o que animar.
- **`folha` e `perigo` ainda não aparecem no site.** São papéis que o app usa e
  o site não — o site não tem ação destrutiva nem superfície de leitura
  flutuante. Ficam no vocabulário porque o vocabulário é um só.
- **A escolha de aparência não chega ao site.** `Ajustes → Aparência` vale só
  para a janela; o site multi-página segue `prefers-color-scheme` e só a página
  única tem botão de tema. São superfícies diferentes com donos diferentes da
  preferência, e por ora isso está certo.
- **A conformidade do app ao sistema não é verificada.** A regra "componente
  nunca lê primitivo" é prosa em três arquivos: nada impede um valor solto numa
  view, e o teste de paridade compara tamanho de fonte só contra `> 0`. A
  [[06 - Design/Revisão de UI - 2026-09-09|revisão de UI de 09/09]] mede o
  buraco — 16 tamanhos fora da escala e os véus reescritos à mão em
  `TelaTarefas`.
- **Acessibilidade não entrou no sistema.** Nada aqui fala de rótulo acessível,
  ordem de leitura ou anel de foco, e o resultado aparece na revisão: `Cor.foco`
  e `Traco.foco` existem sem nenhum ponto de uso, e a barra lateral chega ao
  VoiceOver sem nome.

---
← [[🏠 Início|Início]]
