# Achados medidos por mim (não por agente)

Base: `medicoes-cor.txt` (script determinístico, `medir.py`) e leitura direta do fonte.
Tudo aqui é **confirmado**, não inferido.

---

### FT-01 · O fio de 1px, que sustenta a doutrina de profundidade, está em 1,2:1

**Onde:** `Bancada/tokens.json` → `papel.borda` e `papel.divisor` (`neutro.3` no claro, `neutro.10` no escuro)
**Superfície:** tokens · **Gravidade:** alta · **Confiança:** confirmado (medido)

O Sistema de Design declara: *"Profundidade vem de camada e de fio."* A revisão
anterior registrou que os 3:1 de componente nunca foram medidos. Medidos agora,
contra as seis superfícies, nos dois esquemas:

| | fundo | superficie | superficieSutil | cromo | folha | dado |
|---|---|---|---|---|---|---|
| **borda/divisor · claro** | 1,21 | 1,24 | 1,13 | 1,13 | 1,24 | 1,13 |
| **borda/divisor · escuro** | 1,32 | 1,24 | 1,14 | 1,14 | 1,24 | 1,14 |

**Doze de doze abaixo de 3:1.** Nenhuma chega à metade do alvo.

Ressalva honesta: o separador nativo do macOS opera em faixa parecida
(`separatorColor` fica por volta de 1,2:1 no claro), então isto **não** é um
desvio da plataforma. O que torna o número um achado aqui é a doutrina: neste
sistema o fio não decora, ele **é** a separação — ver FT-02.

**Correção:** não é engrossar o fio. É reconhecer que `borda` e `divisor` hoje
são o mesmo papel com dois nomes, e separá-los: `divisor` (estrutural, entre
painéis) precisa de um passo mais contrastado que `borda` (contorno de peça).
Falta um papel, não um hex.

---

### FT-02 · No claro, a elevação por camada praticamente não existe

**Onde:** `Bancada/tokens.json` → `papel.fundo`/`superficie`/`folha`
**Superfície:** tokens · **Gravidade:** alta · **Confiança:** confirmado (medido)

Diferença de lightness perceptual (OKLCH) entre as superfícies que deveriam
formar camadas:

| par | claro | escuro |
|---|---|---|
| `fundo` × `superficie` | **ΔL 0,87** (1,03:1) | ΔL 3,71 (1,06:1) |
| `fundo` × `cromo` | ΔL 2,14 (1,06:1) | ΔL 7,15 (1,15:1) |
| `superficie` × `cromo` | ΔL 3,00 | ΔL 3,44 |

`superficie` e `folha` são o mesmo passo; `superficieSutil`, `cromo` e `dado`
também — isso já é decisão registrada e não é achado. O achado é outro: **a
elevação no claro vale um quarto da elevação no escuro** (ΔL 0,87 contra 3,71).
`#FFFFFF` sobre `#FCFCFD` é imperceptível.

Isto é a **causa** do que o V-07 anotou como sintoma ("a folha do Diário quase
não se separa"). Não é a folha: é que no claro a camada não faz trabalho
nenhum, e o fio — que por FT-01 está em 1,2:1 — fica sozinho sustentando a
doutrina inteira. Duas peças fracas empilhadas, cada uma contando com a outra.

**Correção:** no claro, `fundo` deveria descer um passo (`neutro.2`) ou
`superficie` subir, para que a camada tenha ΔL comparável ao do escuro. Custa um
papel remapeado, zero hex novo.

---

### FT-03 · A janela mínima declarada é 220pt menor do que a tela mais larga precisa

**Onde:** `Bancada/Sources/Bancada/JanelaPrincipal.swift:16`, `Telas/TelaDiario.swift:45,56,92`, `Telas/TelaAcervo.swift:58,66`
**Superfície:** app · **Gravidade:** alta · **Confiança:** confirmado (aritmética do fonte)

A revisão anterior deixou isto como suspeita: *"o comportamento de `HSplitView`
perto do mínimo não foi testado — e V-02 sugere que é onde mais quebra."* É
aritmética:

| tela | painéis (minWidth) | soma |
|---|---|---|
| **Diário** | lista 160 + folha 320 + fatos 260 | **740** |
| **Acervo** | grade 2×180 + detalhe 320 | **680** |
| garantido | `.frame(minWidth: 520)` na coluna de detalhe | **520** |

O Diário pede **740** e a moldura garante **520**: déficit de **220pt**. Somando
a barra lateral (min 180), o mínimo real do app é **920**, e a janela abre em
**1080** — restam **160pt** de folga antes de a tela mais larga começar a ser
espremida.

Pior: `Sources/Bancada/main.swift:24` cria a `NSWindow` **sem `contentMinSize`**.
A ausência do `contentMinSize` é fato do fonte; a **consequência** — se o
`NSHostingView` deixa arrastar abaixo dos 520 do SwiftUI — está marcada como
*a verificar na tela*, e é o primeiro teste que eu faço com o app aberto. Se
deixar, o `setFrameAutosaveName("BancadaPrincipal")` **restaura o tamanho
encolhido** na abertura seguinte e o estado quebrado vira permanente.

**Correção:** `contentMinSize` na `NSWindow` com o número real (≈920×400), e os
`minWidth` internos revistos para caber nele. O número tem que sair da soma, não
de estimativa.

---

### FT-04 · O âmbar no claro é marrom, e as seis matizes não têm peso comparável

**Onde:** `Bancada/tokens.json` → `primitivo.ambar.profundo` e as seis matizes
**Superfície:** tokens · **Gravidade:** média · **Confiança:** confirmado (medido)

Em OKLCH, os passos `profundo` (os que pesam sobre superfície clara):

| matiz | L | C | H° |
|---|---|---|---|
| azul | 51,8 | **0,198** | 265 |
| vermelho | 54,0 | 0,177 | 29 |
| violeta | 50,0 | 0,138 | 296 |
| verde | 51,5 | 0,112 | 156 |
| âmbar | 52,9 | 0,104 | 81 |
| turquesa | 53,0 | **0,087** | 204 |

A lightness está bem controlada (50,0–54,0, faixa de 4 pontos). **A chroma
varia 2,3×.** O azul do acento é muito mais saturado que suas irmãs, e a
turquesa — que é a cor de `commit`, o tipo de fato mais frequente do vault — é a
mais fraca das seis.

O âmbar `#8A6410` confirma a suspeita: matiz 81° é amarelo-alaranjado, mas a
L de 52,9 com C de 0,104 é exatamente a receita de **oliva/marrom**. Amarelo
escurecido não fica âmbar, fica terra. No escuro o mesmo matiz a L 76,0 lê
âmbar de verdade.

Nos passos `luz`, a L varia 69,0 (azul) a 76,0 (âmbar) — **7 pontos**. No
escuro, `em-andamento` (azul) lê visivelmente mais pesado que `concluida`
(verde) no mesmo papel.

**Correção:** normalizar as seis por L e C alvo em OKLCH em vez de por hex
escolhido a olho. O âmbar do claro precisa perder escuridão e ganhar chroma para
sair do marrom.

---

### Não-achado, verificado e descartado

**Deriva de matiz na rampa neutra.** Medi: H° passeia entre 259° e 286° ao longo
dos 14 passos. Parece muito, mas a chroma máxima da rampa é **0,0146** (passo 6)
e nos extremos cai para 0,0013 — em chroma dessa ordem o matiz é
matematicamente instável e opticamente invisível. **A rampa é limpa.** Registro
para que ninguém volte a medir isto achando que achou algo.

**Progressão da rampa.** Os passos de ΔL vão de 0,87 nas pontas a 11,8 no meio.
É irregular de propósito e está certo: as pontas são onde moram as superfícies e
precisam de controle fino; o meio só precisa atravessar. Mesma estratégia das
rampas do Radix. **Não é achado.**

---

### FT-05 · Sete dos dezessete tamanhos fora de escala estão dentro do próprio Design System

**Onde:** `Sources/DesignSystem/Componentes.swift:373,445,458,537,573,622` e `TextoDeNota.swift:171`
**Superfície:** app · **Gravidade:** alta · **Confiança:** confirmado (grep + leitura)

A revisão anterior contou "16 `.font(.system(size:))` cru" e tratou como desvio
das telas. Contei de novo: são **17**, e a distribuição é o que importa.

| camada | ocorrências | tamanhos introduzidos |
|---|---|---|
| `Sources/DesignSystem/` | **7** | 28, 12, 11, 11, 10, 7, 10 |
| `Sources/Bancada/Telas/` | 10 | 20, 14, 10, 11, 9, 10, 7, 9, 9, 10 |

Isto não é tela driblando o sistema. É **o sistema não obedecendo a si mesmo**:
`Componentes.swift` é a camada que define a escala 22/15/13/11/10 e escreve
`size: 28`, `size: 12`, `size: 7` dentro dos próprios componentes. `Etiqueta`,
`ChipRemovivel`, `MenuDeFiltro` e `SeletorSegmentado` — peças que toda tela
consome — carregam o desvio para dentro de quem as usa corretamente.

Nenhum dos 17 passa pelo overload `View.font(_ estilo:)`, então **nenhum recebe
o tracking** que a escala define. Um `size: 11` cru e o estilo `detalhe` (11pt,
tracking 0) são quase iguais; um `size: 10` cru e `rotulo` (10pt, tracking 0,6,
caixa alta) não são a mesma coisa de jeito nenhum.

**Correção:** a ordem certa é de dentro para fora — consertar os 7 do DS
primeiro. Enquanto o vocabulário desobedecer, cobrar obediência das telas é
cobrar do lado errado. E os dois `size: 7` (o X do `ChipRemovivel`, o puxador do
calendário) não têm passo correspondente na escala: ou a escala ganha um passo
de glifo, ou os dois elementos estão pequenos demais para existir — ver a lente
de acessibilidade, que mede o alvo de ponteiro deles.

---

### FT-06 · No Acervo, selecionar e abrir são gestos de camadas diferentes, e a instrução some na hora que serve

**Onde:** `Sources/Bancada/Telas/TelaAcervo.swift:51` (seleção), `:131` (abertura), `:198-202` (a instrução)
**Superfície:** app · **Gravidade:** média · **Confiança:** confirmado

O clique simples que **seleciona** está no pai, na grade (`:51`,
`.onTapGesture { selecionada = midia.id }`). O clique duplo que **abre** está
dentro do componente (`:131`, `.onTapGesture(count: 2)`). Mesmo cartão, dois
gestos, dois donos — e o cartão não sabe que é selecionável.

O consequente é que o `CartaoDeMidia` não pode sinalizar nada: não tem hover, não
tem cursor de ponteiro, não tem estado pressionado. A única affordance é o anel
de acento **depois** que já aconteceu.

E a instrução — *"Clique num item da grade para ver o detalhe. Duplo clique abre
no app do macOS"* — vive no estado vazio do painel de detalhe (`:198-202`), que
**desaparece no instante em que você seleciona o primeiro item**. Ou seja: o
texto que ensina o duplo clique só é visível para quem ainda não descobriu o
clique simples, e some para sempre assim que descobre.

**Correção:** os dois gestos pertencem ao cartão. Com ele dono do próprio
estado, hover e pressionado passam a ser possíveis — e aí a affordance não
precisa ser escrita em lugar nenhum.
