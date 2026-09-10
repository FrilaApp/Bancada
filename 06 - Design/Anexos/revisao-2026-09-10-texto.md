# Revisão de texto de interface — Bancada

Lente: texto que um humano lê (rótulos, estados vazios, erros, botões, plural, vocabulário). Português-BR nativo; convenções mecânicas da skill `better-writing` traduzidas para macOS conforme o escopo pediu — nenhuma proposta de Title Case, `…` só em comando que abre diálogo.

Filtrado antes de escrever: V-01 a V-07, "Decisões registradas" e "O que o sistema recusa" do Sistema de Design, e os débitos já registrados (`Cor.foco` sem uso, escala tipográfica furada, véus reescritos à mão, zero `@FocusState`/`.disabled`/Dynamic Type/Reduzir Movimento). Nenhum desses reaparece abaixo como achado novo.

---

## Achados

### TXT-01 · Mesma ação, dois rótulos — com e sem reticências
**Onde:** `Bancada/Sources/Bancada/JanelaPrincipal.swift:137` (toolbar) e `Bancada/Sources/Bancada/Telas/TelaAjustes.swift:152` (Ajustes)
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código dos dois lados)
**O que está errado:** As duas linhas chamam exatamente a mesma ação (`escolherPasta`, passada para `TelaAjustes` como `aoEscolherPasta`) — abrir o `NSOpenPanel` para trocar o vault. Na toolbar o botão é `Label("Escolher vault", systemImage: "folder")`, sem reticências. Em Ajustes é `Button("Escolher vault…", action: aoEscolherPasta)`, com reticências. Mesmo verbo, mesmo destino, dois contratos visuais diferentes para quem olha as duas telas na mesma sessão.
**Por que importa:** A convenção de macOS que o próprio escopo desta revisão cita — `…` em comando que abre diálogo — só é seguida em metade dos pontos de entrada. Quem aprende com um rótulo desaprende com o outro; o sinal deixa de significar algo.
**Correção:** Escolher um dos dois e replicar. Como as duas abrem diálogo, a forma correta é com reticências nas duas: `Label("Escolher vault…", systemImage: "folder")` na toolbar.

### TXT-02 · "Dia sem fatos" fala com três vozes diferentes
**Onde:** `Bancada/Sources/Bancada/Telas/TelaDiario.swift:70-73`, `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:507-514`, `Bancada/Sources/Bancada/Telas/TelaRegistros.swift:22-25`
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li as três telas)
**O que está errado:** O mesmo fato — "este dia não tem nenhum fato registrado" — vira três estados vazios com vozes distintas:
- Diário: "Dia sem fatos" / "Nada foi registrado nesta data." — plano, sem mecanismo, sem a reasseguração da doutrina.
- Calendário (painel do dia): "Nada registrado em \(ancora)" / "Nem fato, nem narrativa diária, nem tarefa criada." — enumera três ausências, também sem mecanismo.
- Registros (árvore inteira vazia): "Nenhum fato registrado" / "Os hooks do Git escrevem aqui a cada commit. Um dia sem registro é um dado, não um erro." — ensina o mecanismo e reasegura, citando quase literalmente o `CLAUDE.md` do vault.
Só a terceira aplica a doutrina do próprio sistema ("um dia sem registro é um dado, não um problema a esconder", ver `Componentes.swift:355-357`). As outras duas descrevem a ausência sem a defender.
**Por que importa:** É exatamente o risco que o escopo desta revisão nomeou: cinco telas passam no checklist de estado vazio e soam como cinco pessoas. Aqui é o mesmo dado, mostrado em três lugares que a pessoa visita na mesma sessão de trabalho (Trabalho → Registros embutido, Diário, Calendário), com three tons diferentes de segurança sobre se aquele vazio é normal.
**Correção:** Uma frase-molde para "dia sem fato", parametrizada pelo contexto que cada tela já tem (`ancora`/`data`), reaproveitando a reasseguração da doutrina. Ex.: título `"Nada registrado em \(data)"` (ou `"Dia sem fatos"` quando não há data para citar) + detalhe fixo `"Um dia sem registro é um dado, não um erro."` nos três lugares. O Calendário pode manter a enumeração das três origens como informação extra, mas depois da frase-doutrina, não no lugar dela.

### TXT-03 · Contagem de eventos sem plural quando é 1
**Onde:** `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:221`
**Superfície:** app
**Gravidade:** média
**Confiança:** plausível (a lógica está confirmada por leitura — `"\(total) eventos"` é montada sem checar `total`; não confirmei um vault real com `total == 1` para ver o texto renderizado)
**O que está errado:** `contagemDoRecorte` devolve `"\(total) eventos"` quando não há filtro ativo, sempre no plural, sem condicional. Se o vault (ou uma fase inicial dele) tiver exatamente 1 evento no total, a barra mostra "1 eventos". Note que isto é uma falha diferente do "(s)" já conhecido (V-07): aqui não há nem a muleta do "(s)" — é plural fixo, sem nenhuma tentativa de concordância.
**Por que importa:** É um erro de concordância verbal visível toda vez que o vault tiver exatamente um evento — cenário real logo no primeiro dia de um vault novo, que é justamente quando alguém está mais atento à interface.
**Correção:** `total == 1 ? "1 evento" : "\(total) eventos"`, e o mesmo raciocínio para o ramo com filtro (`visiveis`), embora aí o "de N eventos" já funcione como partitivo e não crie a mesma quebra.

### TXT-04 · Um rótulo de tipo em Title Case no meio de puro sentence case
**Onde:** `Bancada/Sources/VaultKit/Nota.swift:26` (`case .atualizacaoDiaria: return "Atualização Diária"`), visível em `Bancada/Sources/Bancada/Telas/TelaAjustes.swift:172` (bloco "Conteúdo do vault") e `Bancada/Sources/Bancada/Verificacao.swift:49` (CLI)
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li o `switch` completo)
**O que está errado:** No mesmo `switch` de `TipoNota.rotulo`, sete dos oito casos capitalizam só a primeira palavra: "Início", "Índice", "Roadmap", "Tarefa", "Registro", "Documento derivado", "Design". Só `.atualizacaoDiaria` capitaliza as duas: "Atualização Diária". Em `TelaAjustes`, essa lista é renderizada em coluna (uma `LinhaDeValor` por tipo) — é o único rótulo em Title Case entre sete em sentence case, na mesma coluna, na mesma tela.
**Por que importa:** A convenção do projeto (que este escopo confirma como o padrão certo para português) é capitalizar só a primeira palavra e nomes próprios. Esse rótulo quebra a própria regra dentro do enum que a define, e aparece lado a lado com os outros sete no painel de Ajustes — é visível sem precisar procurar.
**Correção:** `case .atualizacaoDiaria: return "Atualização diária"`.

### TXT-05 · O cartão de comparativo de UI fala em Title Case; o resto do app não
**Onde:** `Bancada/Sources/Bancada/Telas/TelaRegistros.swift:200` (`"Comparativo Visual de Iterações"`) e `:210` (`Button("Abrir em Alta Resolução")`)
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado
**O que está errado:** Todo rótulo de botão do app é sentence case verbo-primeiro: "Escolher vault…", "Recarregar", "Mostrar no Finder" (5 pontos de uso), "Abrir", "Ver todos os fatos", "Limpar". O `CartaoComparativoUI` — componente que ilustra fatos de UI com screenshots fixos — usa Title Case no título do cartão e no único botão que ele expõe. Ainda no mesmo cartão, a etiqueta ao lado ("4 versões iteradas") já está em sentence case — a inconsistência aparece dentro do próprio componente, não só contra o resto do app.
**Por que importa:** É o único lugar do app em que um botão muda de convenção de capitalização. Não é gosto — é a regra #8 do sistema de escrita da interface (uma política de capitalização por tipo de elemento) quebrada num componente que, por ser usado só para fatos de UI, é fácil de esquecer nas revisões futuras.
**Correção:** `"Comparativo visual de iterações"` e `Button("Abrir em alta resolução")`. Os nomes de versão (`"Base Notch Shelf"`, `"Alinhamento Bezel"`, `"Fade 8 Stops & Glass"`, `"Polimento Final"`, linhas 159-186) são mais defensáveis como nomes próprios de iteração e podem ficar — mas o título do cartão e o botão são texto de interface, não nome de artefato, e devem seguir a regra geral.

### TXT-06 · Motivo de nota inválida funciona concatenado, não sozinho
**Onde:** `Bancada/Sources/VaultKit/Nota.swift:140-142` (`descricao`), correto em `Bancada/Sources/Bancada/Verificacao.swift:81`, quebrado em `Bancada/Sources/Bancada/Telas/TelaAjustes.swift:54`
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado
**O que está errado:** `Motivo.descricao` devolve fragmentos em minúscula por design: `"sem bloco de frontmatter"`, `"frontmatter sem a chave \`tipo\`"`, `"tipo desconhecido: \`\(t)\`"`. Em `Verificacao.swift:81` isso é concatenado depois de um travessão (`"\(caminho) — \(descricao)"`) e funciona. Em `TelaAjustes.swift:54`, a mesma string é exibida sozinha, como segunda linha de um botão, sem nada antes — aparece na tela como frase solta começando com minúscula.
**Por que importa:** É o mesmo texto reaproveitado em dois contextos com necessidades de capitalização opostas; o autor original escreveu para um (CLI) e o segundo uso (SwiftUI) herdou o problema sem ajuste.
**Correção:** Duas opções: (a) capitalizar no ponto de exibição da UI (`descricao.prefix(1).uppercased() + descricao.dropFirst()`), ou (b) manter `descricao` em minúscula (é o formato certo para concatenação) e criar uma segunda propriedade `descricaoCapitalizada` para uso isolado. A opção (b) é mais honesta sobre por que a string existe em minúscula.

### TXT-07 · "Duplo clique" e "clique duas vezes" para o mesmo gesto
**Onde:** `Bancada/Sources/Bancada/Telas/TelaAcervo.swift:201` ("Duplo clique abre no app do macOS.") vs. `Bancada/Sources/Bancada/Telas/TelaRegistros.swift:230` ("Clique duas vezes para abrir...") e `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:705` ("Clique duas vezes para abrir o arquivo")
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado
**O que está errado:** O mesmo gesto (duplo clique) é nomeado de duas formas: como substantivo ("Duplo clique") uma vez, e como instrução verbal ("Clique duas vezes") duas vezes, em telas diferentes.
**Por que importa:** É pequeno, mas o vocabulário de gesto é candidato natural a divergir mais — vale fixar antes de crescer.
**Correção:** Padronizar em "Clique duas vezes" (é a forma majoritária e mais instrutiva — diz o que fazer, não só nomeia o gesto). Ajustar `TelaAcervo.swift:201` para "Clique duas vezes para abrir no app do macOS."

---

## Glossário em uso

| Termo | Onde aparece | Significado observado |
|---|---|---|
| **fato** | Fato.swift (modelo), Trabalho, Registros, Ajustes ("Fatos registrados") | A unidade do log de `05 - Registros/`, escrita só por hooks. |
| **registro** | "Nada registrado", "dia(s) com registro", "Linhas de registro fora do formato" | Usado como sinônimo funcional de "ter um fato": não é um terceiro conceito, é o resultado do verbo "registrar" — consistente, não é colisão. |
| **evento** | TelaCalendario (`EventoDeCalendario`) | Termo guarda-chuva documentado em código (`TelaCalendario.swift:15`): um fato do log **ou** uma nota que o Obsidian edita (diário, tarefa criada). Distinção real, não usada de forma inconsistente — mas nunca explicada na própria UI, só no comentário do código. |
| **nota** / **arquivo** | "Notas fora da convenção", "Clique duas vezes para abrir o arquivo" | "Nota" = entidade com frontmatter; "arquivo" = o arquivo físico por trás de uma nota ou mídia. Uso consistente. |
| **Escolher vault** / **Escolher vault…** | JanelaPrincipal.swift:137 / TelaAjustes.swift:152 | Mesma ação — ver TXT-01. |
| **Duplo clique** / **Clique duas vezes** | TelaAcervo.swift:201 / TelaRegistros.swift:230, TelaCalendario.swift:705 | Mesmo gesto — ver TXT-07. |
| **"Linhas de registro fora do formato"** / **"linha(s) fora do formato dos hooks"** | TelaAjustes.swift:66, Verificacao.swift:84 / TelaRegistros.swift:38 | Mesmo dado (`fatosNaoReconhecidos`), duas frases distintas para descrevê-lo. Baixa gravidade (o sentido não muda), mas é o tipo de deriva que o glossário existe para pegar antes que vire três frases. |
| **"ainda"** | App: só em "Nenhuma tarefa ainda" (TelaTarefas). Site: em todos os quatro estados vazios gerados (`gerar-site.js:286,327,370,409`) | Ver TXT-08 abaixo — divergência de voz entre app e site para o mesmo tipo de estado. |

### TXT-08 · O site sempre diz "ainda"; o app quase nunca diz
**Onde:** `Bancada/scripts/gerar-site.js:286` (`"Nenhuma nota diária ainda."`), `:327` (`"Nenhuma tarefa registrada ainda."`), `:370` (`"Nenhum fato registrado ainda."`), `:409` (`"Nenhuma mídia versionada no vault ainda."`) — comparar com `TelaDiario.swift:31` ("Nenhuma nota diária", sem "ainda") e `TelaRegistros.swift:24` ("Nenhum fato registrado", sem "ainda")
**Superfície:** site
**Gravidade:** baixa
**Confiança:** confirmado
**O que está errado:** As quatro páginas geradas pelo site adicionam "ainda" a todo estado vazio, uniformemente. No app, o mesmo conceito ("Nenhuma nota diária", "Nenhum fato registrado") aparece sem "ainda" — só a tela de Tarefas usa "ainda" ("Nenhuma tarefa ainda"). O site, ao gerar página nova a partir do mesmo dado, não herda essa escolha seletiva; generaliza.
**Por que importa:** "Ainda" enquadra a ausência como coisa pendente, prestes a ser preenchida — o oposto do que a doutrina do próprio sistema defende ("um dia sem registro é um dado, não um problema a esconder", não uma lacuna a antecipar). É sutil, mas é precisamente a voz que a Recusa do Sistema de Design pede para não ter ("Estado vazio que se desculpa ou inventa exemplo") — "ainda" não se desculpa, mas insinua expectativa, o que é um parente próximo.
**Correção:** Tirar "ainda" das quatro strings do gerador (`gerar-site.js`), alinhando com o app: "Nenhuma nota diária.", "Nenhuma tarefa registrada.", "Nenhum fato registrado.", "Nenhuma mídia versionada no vault." Se a equipe decidir que "ainda" é a voz correta, aplicar nas quatro do app também — mas hoje as duas superfícies divergem sem decisão visível.

---

## Tabela completa de plurais

Escopo do V-07 (já conhecido, não reabro): os quatro exemplos citados na revisão anterior — "30 evento(s)", "2 dia(s)", "1 arquivo(s)", "0 nota(s)" — cobrem só o **app**. Abaixo, toda ocorrência que encontrei, com a forma correta e a nota de onde a `(s)` já era conhecida.

| Onde | Forma atual | Caso zero hoje | Forma correta (com zero correto) | Status |
|---|---|---|---|---|
| `TelaCalendario.swift:494` | `"\(n) evento(s)"` | mostra "0 evento(s)" | `n == 0 ? "sem eventos" : n == 1 ? "1 evento" : "\(n) eventos"` | já conhecido (V-07, é o "30 evento(s)" citado) |
| `TelaCalendario.swift:431` | `quantidade == 0 ? "sem registro" : "\(quantidade) evento(s)"` | já tratado (zero vira "sem registro") | falta só singular: `quantidade == 1 ? "1 evento" : "\(quantidade) eventos"` | parcialmente corrigido — zero já é frase própria, singular ainda não |
| `TelaCalendario.swift:164` | `"\(diasFiltrados.count) dia(s) com registro"` | mostra "0 dia(s) com registro" | `n == 0 ? "Nenhum dia com registro" : n == 1 ? "1 dia com registro" : "\(n) dias com registro"` | já conhecido (V-07, "2 dia(s)") |
| `TelaCalendario.swift:221` | `"\(total) eventos"` (sem filtro) | N/A (total nunca é conhecido como zero-vazio nesta tela) | ver TXT-03 — plural sem checagem de `total == 1` | **novo** (não é "(s)", é ausência total de condicional) |
| `TelaTrabalho.swift:91` | `"\(estado.fatosSemTarefa) fato(s) do log..."` | mostra "0 fato(s)" | `n == 0 ? "Nenhum fato do log" : n == 1 ? "1 fato do log" : "\(n) fatos do log"` | já conhecido em espécie (mesma classe do V-07), local novo |
| `TelaRegistros.swift:38` | `"\(n) linha(s) fora do formato dos hooks"` | mostra "0 linha(s)..." (mas só renderiza quando `!naoReconhecidas.isEmpty`, então zero nunca aparece aqui) | `n == 1 ? "1 linha fora do formato..." : "\(n) linhas fora do formato..."` | já conhecido em espécie, local novo |
| `gerar-site.js:271` | `` `${n_fatos} fato(s)` `` (site, "Últimos dias") | confirmado alcançável: `n_fatos` pode ser 0 para um diário sem fato no dia | `n_fatos === 0 ? 'sem fatos' : n_fatos === 1 ? '1 fato' : `${n_fatos} fatos`` | **novo** — o site não foi coberto pela revisão anterior |
| `gerar-site.js:49` | `` `${site.midiasCopiadas} arquivo(s) de mídia` `` (log de terminal, não tela do usuário final) | possível 0 | mesmo padrão condicional | **novo**, mas é saída de terminal para quem roda o script, não interface do site publicado — gravidade mínima |
| `Fato.swift:38` (comentário de doc) | `"25 arquivo(s)"` | — | não é string executada, é exemplo em comentário; ajustar só por rigor | não é achado, é documentação |

**Fora do escopo de correção aqui:** os "arquivo(s)" e "nota(s)" dentro do **texto do próprio fato** (ex.: "Transforma o repositório · 25 arquivo(s)", "Claude · 1 nota(s) com alteração pendente") não vêm da Bancada — são escritos por `doc-harness/scripts/registrar-fato.sh:16` e `doc-harness/scripts/sessao.sh:50`, fora de `Bancada/`. A Bancada só exibe essa string em voz de fato (mono), como o próprio sistema de design manda — "editar" esse texto depois violaria o append-only do log. Se a equipe quiser corrigir, o ponto de mudança é o script do hook, não a Bancada, e só passaria a valer para fatos futuros.

---

## O que está bom

- **Vocabulário de botão de arquivo é limpo.** "Abrir", "Abrir no Pages", "Mostrar no Finder" aparecem em cinco pontos de uso (`TelaAcervo` ×2, `TelaAjustes`, `TelaTarefas`, `CartaoComparativoUI`) com o mesmo texto exato todas as vezes.
- **A barra de filtro do calendário e seus estados vazios já distinguem corretamente vault-vazio de resultado-de-filtro-vazio**, com frase própria para cada caso nas duas visões (dia e lista) — a revisão anterior já elogiou o mecanismo; o texto que sustenta essa distinção também está bem escrito.
- **O erro de leitura do vault é, na prática, bem resolvido.** O único erro que `Vault.ler` lança (`Vault.swift:134-139`) já diz o quê ("`{path}` não parece um vault do doc-harness") e o porquê ("falta a pasta `05 - Registros`") — não precisa de correção.

## O que não consegui verificar

- Não vi o app rodando nem o VoiceOver — todos os achados vêm de leitura de código. Onde a confiança é `plausível` (TXT-03), digo explicitamente o que faltou (um vault real com total de eventos igual a 1).
- Não fui à ActionShelf nem a outras superfícies fora de `Bancada/` e `doc-harness/scripts` (que só toquei para confirmar a origem de "arquivo(s)"/"nota(s)" de fato, não para revisar).
- Não tentei `swift build`/`swift test` para confirmar que os arquivos citados compilam como estão — as citações são de leitura direta do código-fonte, com número de linha conferido no momento da leitura.
- Não há Bancada/CLAUDE.md no repo (só `doc-harness/CLAUDE.md`) — segui a leitura obrigatória do briefing com o que existe.
