# Bancada

Leitor nativo do vault do **doc-harness** — tabela de tarefas, galeria com miniaturas reais e o log de fatos com indentação, em vez de lista plana.

A Bancada **não substitui o Obsidian**: as duas ferramentas leem os mesmos arquivos `.md` e podem ficar abertas ao mesmo tempo. Nada é migrado, nada é importado, e nenhum hook do doc-harness muda. Se a Bancada não vingar, é só parar de abri-la.

## Começando

### Baixar o app pronto

Em [Releases](https://github.com/BlendOps/Bancada/releases), baixe o `Bancada-<versão>.zip` da última versão, descompacte e arraste o `Bancada.app` para onde preferir — `/Applications`, a Dock, a mesa.

```bash
gh release download -R BlendOps/Bancada --pattern '*.zip'   # se preferir o terminal
```

O binário é universal (Apple Silicon e Intel). O repositório é privado, então o download pede estar autenticado no GitHub com acesso à organização BlendOps — quem está fora da equipe não precisa do app: para mentores e avaliadores existe [o site](#o-site-para-quem-está-fora).

#### A primeira abertura

Como o app **não é assinado** por uma conta de desenvolvedor Apple, o macOS bloqueia a primeira abertura de um arquivo que veio da internet. Uma vez só:

1. Dê um duplo clique no `Bancada.app` e confirme o aviso.
2. Vá em **Ajustes do Sistema → Privacidade e Segurança**, role até o fim e clique em **Abrir Mesmo Assim**.

O atalho antigo — botão direito → **Abrir** — deixou de funcionar no macOS 15 para apps não assinados. Assinar com Developer ID e notarizar resolveria o atrito de vez, e **ficou decidido não fazer isso por ora**: o app circula dentro de uma equipe de cinco pessoas, e a conta de desenvolvedor traria gestão de certificado e senha no CI para poupar dois cliques uma vez por pessoa. Se a Bancada sair da equipe, a decisão se revê.

#### Apontar o vault

A Bancada procura uma pasta `doc-harness` ao lado do app, subindo alguns níveis — que é o arranjo de quem clonou o repositório dentro de `Challenge18/`. Um app baixado para `/Applications` não tem esse vizinho: use o botão de pasta na barra de ferramentas para escolher a mesma pasta que você abre no Obsidian. A escolha fica salva.

### Compilar localmente

Para contribuir, ou para ter o app sem esperar por uma release:

```bash
./build.sh     # roda os testes, compila e empacota Bancada.app
./Bancada      # abre a janela direto pelo binário
open ./Bancada.app   # ou pelo bundle, como qualquer app do Finder
```

`./build.sh` sempre gera `Bancada.app` na raiz do projeto (não versionado — é artefato de build, como o binário `./Bancada`). O build local é arm64 apenas; o universal sai do workflow de release.

### Deixar na Dock

Com o app rodando, clique e segure o ícone na Dock → **Opções** → **Manter na Dock**.

### Atualização automática para a equipe

Ao rodar `/entrar` no Claude Code (ou executar `./scripts/atualizar-bancada.sh`), o `Bancada.app` é checado contra as releases do GitHub e atualizado automaticamente via swap seguro e remoção de quarentena do Gatekeeper.

### Publicar uma nova versão (com Zona de Segurança)

Para publicar uma nova versão com testes locais, proteção anti-concorrência e gate biométrico:

```bash
./scripts/publicar-bancada.sh          # calcula a versão automaticamente
./scripts/publicar-bancada.sh 0.2.0    # ou informa uma versão específica
```

No Claude Code, você também pode usar `/publicar-bancada`. O script ativa a **Zona de Segurança**: se houver divergência com `origin/main` ou release concorrente em voo no CI, a operação entra em **quarentena** e orienta o fallback no terminal antes de gerar tags remotas.

O workflow `.github/workflows/release.yml` roda os testes, compila o universal, empacota o `.app` e publica a Release.

### Verificar sem abrir janela

```bash
./Bancada --verificar ../doc-harness
```

Imprime as contagens do vault e a árvore de registros agrupada. Sai com `0` se o vault está consistente e `2` se há nota fora da convenção ou linha de registro fora do formato dos hooks — serve para CI.

## O site para quem está fora

Mentores e avaliadores não vão instalar app nenhum, então o mesmo vault também vira um site estático — **no ar em https://bancada-buu.pages.dev**.

Desde 2026-09-11 ele se republica sozinho: todo push em `main` que toque `doc-harness/` ou `Bancada/` dispara o build, que compila o `bancada-indice`, verifica o vault, gera o HTML e publica na Cloudflare Pages. Leva cerca de dois minutos. Quem estiver com a aba aberta recebe um aviso de conteúdo novo.

> ⚠️ O site está **aberto na internet**. O `noindex` pede a buscadores que não indexem, mas não é controle de acesso. Fechar com lista de e-mails: `docs/cloudflare.md`.

Antes de publicar, o build roda `--verificar` como portão: vault inconsistente reprova, o build falha e o site anterior continua no ar. Publicar tarde é melhor que publicar um registro que se contradiz.

Para gerar local, sem publicar:

```bash
./build.sh --com-site          # compila e gera em site/
node scripts/gerar-site.js ../doc-harness [destino]
```

Sai HTML puro e sem dependência de npm — o colapso dos grupos de registro usa `<details>`. O JavaScript é pouco e dispensável: o tema, a barra recolhível, o aviso de conteúdo novo (que consulta o `versao.json` a cada 30 segundos) e o "O que há de novo" (`novidades.js`). Sem ele o site continua sendo o HTML estático que sempre foi. Tema claro e escuro acompanham o sistema do leitor.

**O que há de novo.** Cada leitor vê marcado o texto que mudou desde a última visita dele; quem nunca visitou vê os últimos 7 dias. Verde é acréscimo, âmbar é correção e vermelho é remoção, e a marca esmaece depois de lida. A barra lateral ganha o item Novidades, com a contagem de páginas por ler, e um ponto em cada página com novidade. A comparação roda no navegador, contra o que aquele leitor já viu, guardado no `localStorage` dele. O build entrega três coisas: o hash do texto de cada página, a versão de 7 dias atrás dos documentos que mudaram (`novidades/base/`) e a linha do tempo do git, que vira a página Novidades. Nada disso precisa de servidor; sem histórico do git o build segue, só sem a base e sem a linha do tempo. O desenho e as cores estão no `DESIGN.md` (§5.10).

**Ao criar um `tipo` de nota novo no vault**, acrescente-o em `SECOES` no `scripts/gerar-site.js`, senão a nota não chega ao site. O build avisa quando um tipo fica de fora — o aviso existe porque o tipo `agenda` passou um dia inteiro fora do site sem ninguém notar.

**O gerador não parseia nada.** Ele chama `./Bancada --indice`, que emite o vault inteiro como JSON já parseado e agrupado, e só renderiza. Isso é o ponto: duas implementações da mesma regra divergem com o tempo, e um registro que conta histórias diferentes conforme quem olha perde a serventia inteira.

O que fica de fora do site, de propósito:

- **Índices** (`00 - Índice *.md`) — listas de wikilinks que só fazem sentido dentro do Obsidian; a barra lateral do site cumpre esse papel.
- **Templates** — andaimes cheios de `{{marcadores}}`, que fariam o registro parecer preenchido pela metade justo para quem vai avaliá-lo.
- **O rodapé de navegação** de cada nota, que aponta para os índices não publicados.

As páginas levam `noindex, nofollow`. Isso pede a buscadores que não indexem, mas **não é controle de acesso**: quem tiver a URL vê o conteúdo. Se o site for hospedado, a proteção precisa vir de onde ele estiver.

## O que ela mostra

| Seção | O que resolve |
|---|---|
| **Calendário** | O que aconteceu em cada dia, em linguagem de gente: a agenda da Academy, a narrativa do dia e o trabalho agrupado por tarefa. O log cru fica no fim, recolhido, para quem precisa conferir |
| **Trabalho** | A tabela de tarefas (colunas ordenáveis, filtro por status) com os fatos logo abaixo. Selecionar uma tarefa mostra só os fatos que citam o ID dela; sem seleção, o log inteiro indentado por dia → tipo → grupo, com a repetição colapsada — cinco commits "Registra os fatos da sessão" viram um nó `5× … [20:21–22:05]`, que abre e mostra os cinco |
| **Diário** | A narrativa do dia ao lado dos fatos que a sustentam — a regra de ouro do vault, verificável de relance |
| **Acervo** | Imagens, vídeos, PDFs e `.pages`, cada um com miniatura de verdade. Selecionar um `.pages` traz o `.md` derivado no painel ao lado |
| **Onboarding** | Guia essencial e interativo de setup em 3 abas: fluxo diário em 3 passos, catálogo de Slash Commands com cópia em 1 clique e relação entre doc-harness e Bancada |
| **Ajustes do Sistema** | Na barra utilitária no rodapé da barra lateral (ou via ⌘,): seletor de aparência (sistema/claro/escuro); monitor de sincronização FSEvents em tempo real; ambiente e automações de doc-harness; geração e abertura direta da superfície para mentores (site web e diário de bordo); conformidade de notas e atalhos |

A pasta aberta e a hora da última leitura ficam no centro do cabeçalho da janela, visíveis em qualquer seção. Clicar na cápsula revela o vault diretamente no Finder (comportamento canônico de proxy de documento do macOS). O relógio andando sozinho é o que prova que a janela não está mostrando um estado velho: o conteúdo vem do disco a cada leitura, nunca de cache, e os hooks escrevem no vault por fora do app.

A barra lateral é dedicada à navegação de conteúdo (**Calendário**, **Trabalho**, **Diário**, **Acervo** e **Onboarding**), contando com uma **barra utilitária** em seu rodapé com atalhos rápidos para o **Guia de Setup**, o indicador de integridade do vault e os **Ajustes do Sistema** (⌘,).

Nada ficou inalcançável na fusão. A árvore inteira de registros continua a um clique — é o que o painel mostra quando nenhuma tarefa está selecionada —, e o painel diz quantos fatos não citam tarefa nenhuma, para que o recorte nunca se passe por log inteiro.

### O vínculo entre fato e tarefa

É literal, nunca inferido: `Vinculo` procura `T-0001` na descrição do fato, e só. Adivinhar por semelhança de texto atribuiria trabalho à tarefa errada — num app cuja premissa é que o registro é confiável, isso é pior que não ter vínculo. Para um fato aparecer na tarefa, **cite o ID na mensagem de commit**.

### O calendário

`VaultKit/Calendario.swift` já agrega o vault em `DiaDoCalendario` — fatos, diários e tarefas criadas por data — e `DataISO` converte as datas do frontmatter ancorando ao meio-dia, para que fuso e horário de verão nunca joguem um evento para a véspera. A tela foi lista enquanto a grade não estava pronta — uma grade incompleta pareceria pronta. Desde `99bfabf` são três modos: Mês, Semana e Lista, com um puxador que comprime a grade entre uma faixa de sete dias e o mês inteiro, navegação entre meses e seleção de dia.

O calendário não mostra o log como ele foi gravado. A linha `` `df873d0` — Registra os fatos da sessão · 1 arquivo(s) `` é escrita para auditoria, e na célula o que cabia dela era o hash. Entre o vault e a tela há uma camada de tradução, toda em `VaultKit` e coberta por teste:

- **`LeituraDeFato`** separa a mensagem do hash e da contagem de arquivos, e marca como **bastidor** o que é o vault registrando a si mesmo ("Registra os fatos da sessão", `sessao`, atualizações da narrativa) — 37% dos fatos dos três primeiros dias.
- **`Equipe`** lê a tabela de contatos do `CLAUDE.md` do vault e troca o login do Git pelo primeiro nome: `fbtostadev` vira Fabrício. Quem não casa com ninguém sai como veio.
- **`ResumoDoDia`** lê o dia em camadas: agenda, os itens de "O que foi feito" da narrativa (sem a referência técnica do fim), o trabalho agrupado pela tarefa citada na mensagem, o bastidor e, por último, o log intacto.

A célula mostra agenda e nome das tarefas; a prévia, uma frase ("Fabrício e Cauê avançaram 5 tarefas, com mais 9 registros fora delas"); o painel, as camadas nessa ordem. O hash continua a um repouso do ponteiro e no "Registro completo".

## Como o agrupamento decide o que juntar

Nada de similaridade difusa: dois fatos entram no mesmo grupo quando coincidem em **(tipo, autor, descrição normalizada)**, e normalizar descarta apenas o que varia mecanicamente entre repetições — o hash do commit e as contagens (`· 25 arquivo(s)`, `4365 palavras`, `1 nota(s)`).

Números em geral **não** são removidos: senão "Abre o desafio C17" e "Abre o desafio C18" colapsariam num grupo só, e o agrupamento passaria a mentir sobre o que aconteceu.

Nenhum fato é descartado — colapsar é escolha de leitura, e os originais continuam dentro do nó. Isso importa num sistema cuja premissa inteira é que o registro é confiável.

## As regras do vault, aqui

O `scripts/guarda.sh` do doc-harness protege as ferramentas do Claude Code; ele não protege um app. Então as mesmas regras são **estruturais** na Bancada:

- Notas com `tipo: registro` e `tipo: documento-derivado` são somente leitura no nível do modelo (`TipoNota.somenteLeitura`) — não existe caminho de código que escreva nelas.
- O modo `--verificar` é estritamente leitura.

## Estrutura

```
Sources/VaultKit/     Leitura do vault, sem UI — testável e reaproveitável
  Frontmatter.swift     Parser do subconjunto YAML que o vault usa
  Nota.swift            Modelos; tipos e status como enums fechados
  Fato.swift            Parser das linhas de 05 - Registros/
  Agrupador.swift       A regra de colapso descrita acima
  Vinculo.swift         Que fato pertence a que tarefa — pelo ID, nunca por semelhança
  Calendario.swift      Eventos por dia (agenda, fato, diário, tarefa) e datas ISO
  Leitura.swift         O fato traduzido para leitura: mensagem primeiro, hash à parte
  Equipe.swift          Login do Git → nome da pessoa, pela tabela do CLAUDE.md
  ResumoDoDia.swift     O dia em camadas: agenda, narrativa, tarefas, bastidor, log
  Vault.swift           Varredura da pasta e catálogo de mídia
  Observador.swift      FSEvents — os hooks escrevem por fora do app

Sources/Bancada/      A interface
  DS/                   Tokens e componentes (espelho de tokens.json)
  Telas/                Uma por seção

Tests/VaultKitTests/  Fixture: o log real do primeiro dia de uso do vault
```

Os testes usam `Fixtures/registro-2026-09-08.md`, copiado sem edição de `05 - Registros/`. Um parser que não reproduz aquele arquivo não serve: é o formato que os hooks realmente produzem, não o que a documentação diz que produzem.

## Por que SwiftPM e não `.xcodeproj`

Mesmo motivo de `ActionShelf/`: com cinco pessoas commitando no mesmo repositório, um `.xcodeproj` versionado é fábrica de conflito. `swift build` e pronto.
