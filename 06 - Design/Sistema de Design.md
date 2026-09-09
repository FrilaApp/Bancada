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

- **Sombra difusa como elevação.** Profundidade vem de camada e de fio.
- **Um segundo acento.** Se algo novo precisa se destacar, ou usa o acento
  existente, ou usa hierarquia — não uma cor nova.
- **Acento como fundo de área.** Ação primária, estado ativo, link e foco. Só.
- **Vermelho fora de destrutivo e erro.** Aviso é âmbar; ênfase não é cor.
- **Serifada em controle de interface.** A voz de narrativa é do conteúdo.
- **Mono em texto escrito por gente.** A voz de fato é de quem não digitou.
- **Estado vazio que se desculpa ou inventa exemplo.** Um dia sem registro é um
  dado, não um problema a esconder.

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
- **A grade do calendário continua ausente**, e por isso `metrica.calendario`
  descreve uma célula que ninguém desenhou ainda.

---
← [[🏠 Início|Início]]
