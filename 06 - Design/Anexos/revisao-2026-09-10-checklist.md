# Auditoria por checklist — Bancada

Modo **audit** da skill `checklist-design`, a partir do fonte (não abri o app,
não tirei captura — regra desta rodada). Onde a distinção importa, digo se o
item é "o que existe na tela" (fonte responde bem) ou "como se comporta"
(precisaria de captura — não tenho).

A revisão anterior já rodou três: **Empty State — Web app**, **Filtering
items — Flows**, **Accessibility — Design system**. Não repito nenhum dos três
aqui; onde um achado novo toca a área deles, digo isso explicitamente em vez de
reabrir a tabela.

## Escolha dos cinco checklists

| Checklist | Por quê |
|---|---|
| **Settings — Web app** | Ajustes é uma tela de configurações real (vault, aparência, diagnóstico) — vale ver onde ela se parece com "configurações de SaaS" e onde é, com razão, outra coisa. |
| **Table — Design system** | Trabalho usa uma `Table` nativa de verdade, com coluna ordenável e filtro — o componente mais "de dados" do app. |
| **Single Item Detail — Web app** | O Acervo é grade + painel de detalhe do item selecionado, exatamente a forma que o checklist descreve. |
| **Tabs — Design system** | O `SeletorSegmentado` (Calendário: Mês/Semana/Lista; Ajustes: Sistema/Claro/Escuro) é literalmente um seletor de aba — mesmo componente, dois pontos de uso. |
| **Card — Design system** | A grade do Acervo é cartões (`CartaoDeMidia` sobre `Cartao`), o único componente-cartão do app com instância suficiente para valer o checklist. |

Descartei **Searchbar** (não existe campo de busca em lugar nenhum do app —
confirmei com grep por `TextField`/`magnifyingglass` em todo `Sources/Bancada`
e não há ocorrência; o que a revisão anterior chamou de "lupa" é o ícone do
`MenuDeFiltro`, não uma busca — forçaria checklist que não se aplica). Descartei
também **Color System** (o design system já foi medido a fundo pela
Accessibility da revisão anterior — contraste, foco, tokens semânticos — rodar
de novo com outro nome só repetiria a mesma tabela com IDs diferentes).
"Navegação/barra lateral" e "primeira execução" não têm checklist correspondente
no catálogo que não force o encaixe (os candidatos de app teriam login, conta,
push — nada disso existe aqui).

---

## Auditoria · Settings (Web app)

Checklist [Settings — Web app](https://www.checklist.design/web-app/settings).
Tela: **Ajustes** (`Bancada/Sources/Bancada/Telas/TelaAjustes.swift`).

| | Item | Por quê |
|---|---|---|
| parcial | **Structure** | Blocos com título e ícone (`Bloco`) separam Vault, Aparência e Conteúdo do vault — organização real. Mas dentro do bloco Vault, "Escolher vault…", "Recarregar" e "Mostrar no Finder" (linhas 152–158) têm peso idêntico — é o mesmo ponto que a revisão anterior já registrou como V-07 ("nenhum botão primário"), não um achado novo. |
| n/a | **Account details** | Não há conta de usuário — o app lê uma pasta local, não autentica ninguém. |
| n/a | **Security details** | Sem login, sem 2FA para configurar. |
| n/a | **Notification preferences** | O app não envia notificação nenhuma. |
| n/a | **Billing** | Não há cobrança. |
| tem | **Additional preferences** | Exatamente o exemplo do próprio item — aparência com `Sistema`/`Claro`/`Escuro` (`TelaAjustes.swift:99-107`). |
| n/a | **Danger zone** | Não existe ação destrutiva no app (é somente leitura); "Recarregar" e "Escolher vault" não apagam nada. |

**O que importa aqui:** pouco. Quatro `n/a` de sete é o achado em si — este
checklist é feito para configurações de conta de um SaaS, e a Bancada não tem
conta. O único ponto real (Structure) já está no radar como V-07. Não há
lacuna nova para perseguir nesta tela.

---

## Auditoria · Table (Design system)

Checklist [Table — Design system](https://www.checklist.design/design-system/table).
Tela: **Trabalho** (`Bancada/Sources/Bancada/Telas/TelaTarefas.swift`).

| | Item | Por quê |
|---|---|---|
| tem | **Table header** | `Table` nativa com seis colunas nomeadas (ID, Tarefa, Status, Responsável, Desafio, Criada em), `TelaTarefas.swift:39-79`. Cabeçalho fixo no topo é comportamento padrão do controle nativo, não precisou ser desenhado. |
| tem | **Row style** | Zebra/realce de linha vêm do estilo nativo da `Table` do macOS — não há CSS/estilo próprio sobrescrevendo, o que é a escolha certa aqui. |
| tem | **Spacing** | Larguras mínimas/ideais por coluna (`.width(min:ideal:max:)`, linhas 44-79) seguem a mesma régua do resto do app. |
| falta | **Search** | Não há campo de busca textual sobre nenhuma das seis colunas — só o filtro por status (`barraDeFiltro`, linhas 93-120). Quem quer achar uma tarefa pelo título precisa escanear a coluna visualmente. |
| tem | **Actions** | Duplo clique e menu de contexto abrem a nota no Finder (`primaryAction`/`contextMenu`, linhas 81-88) — a ação possível num app somente leitura. |
| tem | **Filter and sort** | Pílulas de status (linhas 93-120) e ordenação por coluna via `sortOrder`/`KeyPathComparator` (linha 19, 38) — os dois presentes e conectados um ao outro (mudar filtro limpa seleção inválida, linhas 115-119). |
| tem | **Responsiveness** | O próprio checklist aceita rolagem horizontal como alternativa a recompor o layout; as larguras min/max por coluna entregam isso sem precisar de um modo "acordeão". |
| n/a | **Pagination** | O vault tem poucas tarefas hoje; paginar uma lista de poucas dezenas de itens seria complexidade sem uso. Vale revisitar se a contagem crescer para centenas. |

**O que importa aqui:** a busca ausente é o único item de verdade faltando —
com poucas tarefas hoje ela quase não se sente, mas vira fricção assim que o
vault acumular tarefas de vários ciclos. Baixa urgência, gap real.

---

## Auditoria · Single Item Detail (Web app)

Checklist [Single Item Detail — Web app](https://www.checklist.design/web-app/single-item-detail).
Tela: **Acervo**, painel de detalhe (`Bancada/Sources/Bancada/Telas/TelaAcervo.swift:152-226`, `PainelDeMidia`).

| | Item | Por quê |
|---|---|---|
| tem | **Clear title or identifier** | Nome do arquivo em `DS.Tipografia.titulo` e caminho completo em mono logo abaixo (`TelaAcervo.swift:172-176`). |
| n/a | **Status indicator** | Arquivo de mídia não tem estado (ativo/pendente/concluído) — não é esse tipo de entidade. |
| tem | **Key details section** | Miniatura grande, nome, caminho e ações — nessa ordem de prioridade (linhas 166-187). |
| n/a | **Edit action** | O app é somente leitura por construção (ver comentário da própria `TelaAcervo`, linha 6-13); não editar é a regra, não uma lacuna. |
| parcial | **Related items or activity** | Só para `.pages` o painel mostra conteúdo relacionado — o `.md` derivado (linhas 189-192, 207-226). Imagem, vídeo e PDF não têm nada equivalente: sem backlink para a nota que os referencia, sem histórico de commit do próprio arquivo. |
| n/a | **Breadcrumb or back navigation** | É painel encaixado (`HSplitView`), não uma tela navegada — a pasta já aparece no próprio cartão e no painel; não há pilha de navegação para desfazer. |
| n/a | **Destructive actions** | Sem apagar/arquivar — de novo, somente leitura por desenho. |

**O que importa aqui:** o "Related items" parcial é o único ponto real, e é
menor — estender o mesmo tratamento (algo relacionado) para imagem/vídeo/PDF é
uma melhoria de conforto, não uma correção de bug. Nada aqui quebra o uso.

---

## Auditoria · Tabs (Design system)

Checklist [Tabs — Design system](https://www.checklist.design/design-system/tabs).
Componente: `SeletorSegmentado` (`Bancada/Sources/DesignSystem/Componentes.swift:590-648`), nos dois pontos de uso — modo do Calendário (`TelaCalendario.swift:171-178`) e Aparência em Ajustes (`TelaAjustes.swift:99-107`).

| | Item | Por quê |
|---|---|---|
| tem | **Labels** | Ícone + palavra curta em ambos os usos: "Mês"/"Semana"/"Lista" e "Sistema"/"Claro"/"Escuro". |
| tem | **Content area** | Trocar o modo troca a visão do calendário (grade ↔ lista); trocar a aparência recolore o app inteiro via `estado.aparencia`. |
| tem | **Style** | Ativo é pílula preenchida com `cores.superficie` e texto em `cores.texto`; inativo é transparente com `cores.textoSutil` — diferença clara, dentro de um contêiner com borda de 1px (`Componentes.swift:627-643`). |
| tem | **Item order** | Mês→Semana→Lista vai do mais amplo ao mais denso; Sistema→Claro→Escuro repete a ordem que o próprio macOS usa nas Ajustes dele — as duas seguem uma lógica, não estão soltas. |
| parcial | **States** | Padrão e selecionado existem, e o selecionado até carrega `.accessibilityAddTraits(.isSelected)` (linha 635) — que é mais do que a barra lateral principal tem (V-06). Mas `.buttonStyle(.plain)` (linha 634) remove o realce nativo de hover/pressed sem repor nada — é o mesmo débito já registrado (zero hover/pressed no app), e aqui ele pega os dois seletores mais usados da interface, não só um caso isolado. |

**O que importa aqui:** o item "States" é aprofundamento de um débito já
conhecido, não descoberta — mas vale nomear porque uma correção só no
`SeletorSegmentado` (`Componentes.swift:634`) resolve hover/pressed nos dois
lugares de uso ao mesmo tempo. É o ponto de maior alavancagem desta auditoria.

---

## Auditoria · Card (Design system)

Checklist [Card — Design system](https://www.checklist.design/design-system/card).
Componente: `CartaoDeMidia` sobre `Cartao` (`Bancada/Sources/Bancada/Telas/TelaAcervo.swift:98-145`; base em `Bancada/Sources/DesignSystem/Componentes.swift:115-131`).

| | Item | Por quê |
|---|---|---|
| tem | **Style** | Fundo `cores.superficie`, borda de 1px em `cores.borda`, raio `md` — sem sombra, seguindo a regra do sistema contra sombra difusa (`Componentes.swift:123-129`). |
| tem | **Consistency** | Um `Cartao` só, reusado no grid do Acervo, na miniatura do painel de detalhe e em `TelaRegistros` — não há um segundo estilo de cartão concorrente. |
| tem | **Spacing** | Escala `DS.Espaco` (4/8/12/20/32 — todos múltiplos de 4) aplicada no padding interno do cartão. |
| tem | **Responsiveness** | `LazyVGrid` com `.adaptive(minimum: DS.Galeria.larguraMinimaCard)` reflui o número de colunas pela largura da janela, sem contagem fixa. |
| parcial | **Content hierarchy** | Miniatura → nome → caminho é uma ordem sã. Mas nenhuma ação fica visível no cartão em si: abrir e mostrar no Finder só existem via duplo clique ou menu de contexto (`TelaAcervo.swift:131-137`), os dois invisíveis até alguém tentar. Some ao ponto de o próprio painel de detalhe (vazio) precisar explicar em texto: "Duplo clique abre no app do macOS" (linha 201) — o cartão não ensina isso por si. |

**O que importa aqui:** a hierarquia de conteúdo está correta, mas a
descoberta da ação depende de o usuário ler uma dica em texto em outro lugar
da tela. Sem hover (mesmo componente-raiz do problema acima, em outro lugar do
código) não há nem o sinal mínimo de "isto reage ao clique".

---

## As lacunas que importam

- **CHK-01 · Trabalho sem busca textual** (Table, item Search) — `TelaTarefas.swift:93-120` só filtra por status. Real, mas baixa urgência hoje; vira fricção quando o vault acumular tarefas de vários ciclos.
- **CHK-02 · `SeletorSegmentado` sem hover/pressed** (Tabs, item States) — `Componentes.swift:634`. Aprofundamento de débito já registrado, não descoberta — mas é o de maior alavancagem: uma correção no componente resolve Calendário e Ajustes juntos.
- **CHK-03 · Cartão do Acervo sem affordance de ação visível** (Card, item Content hierarchy) — `TelaAcervo.swift:131-137` e `201`. A ação só existe em duplo clique/menu de contexto, sem nenhum sinal no próprio cartão; o app precisa explicar isso em texto em outro lugar.

**Não importam de verdade:**
- Os quatro `n/a` de Settings (Account/Security/Notifications/Billing/Danger zone) — corretos por desenho, não lacunas.
- "Related items" parcial no Acervo (Single Item Detail) — conforto, não quebra nada.
- Structure parcial em Ajustes e "Edit/Destructive actions" n/a — já cobertos por V-07 e pela natureza somente-leitura do app, respectivamente.
