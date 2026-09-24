# AGENTS.md

> **Instruções Operacionais e Contrato Canônico para Agentes de IA**  
> Este arquivo é a fonte primária e mandatória de contexto, regras e restrições para qualquer agente de IA (Worker, Orchestrator ou Subagente) operando no repositório **Challenge 18**.
> **Regra Básica de Raciocínio**: Privilegie raciocínio orientado à recuperação (*retrieval-led*). Consulte os arquivos locais de documentação e código antes de propor suposições ou criar componentes.

---

## 1. Contexto do Projeto

- **Projeto**: **Challenge 18 (C18)** — Ciclo do *Challenge Based Learning (CBL)* da **Apple Developer Academy** (08/09/2026 a 04/12/2026).
- **Equipe (Org BlendOps)**: Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva.
- **Mentores**: Felipe Carvalho, Victor Zerefos.
- **Produto Principal**: **Frila** — Plataforma iOS nativa (iOS 17+) para fechamento confiável de turnos avulsos no Distrito Federal (DF), com backend no Supabase (Postgres com Row Level Security - RLS), autenticação passwordless por código de e-mail e despacho por proximidade.
- **Ferramental e Ecossistema**: **Bancada** — Monorepo contendo:
  - App macOS nativo SwiftUI (`Bancada/Bancada/`)
  - Site gerador e leitor editorial web da documentação CBL (`Bancada/scripts/`) publicado em `https://bancada-buu.pages.dev`
  - Diário de bordo e vault compartilhado do Obsidian (`doc-harness/`)
  - Dicionário de tokens de design (`Bancada/tokens.json`)
  - Biblioteca auxiliar `ActionShelf/` e diretório de agentes (`.agents/`)

---

## 2. Regras Críticas de Design Engineering e Gramática Visual

O ecossistema visual da Bancada e do site foi rigorosamente depurado (commits `02f24cd` a `bd6484b`) e rejeita "AI-slop", excesso de caixas e ornamentos gratuitos. Qualquer alteração de UI **deve** obedecer:

### 2.1. Arquitetura Containerless / Borderless First
- **O canvas é uma superfície aberta**: O conteúdo repousa diretamente na tela. É **expressamente proibido** o empilhamento indiscriminado de caixas ("card soup"). A separação entre blocos de informação vem da escala tipográfica, entrelinhas generosas, respiro vertical consciente e, quando estritamente necessário, divisores horizontais *hairline* de 1px.
- **Cartões são exceções reservadas**: Apenas componentes acionáveis autônomos (ex.: `.link-dia-card` na lista de dias) recebem borda perimetral e fundo contido.

### 2.2. A Regra de Ouro das Três Vozes
A forma tipográfica declara a procedência semiótica do dado:
1. **Interface (Chrome)**: `IBM Plex Sans` / `SF Pro` (`var(--sans)`). Usada em barras de navegação, abas, botões, cabeçalhos de tabela, contadores e rótulos.
2. **Narrativa (Conteúdo)**: `IBM Plex Serif` / `New York` ou Sans editorial (`line-height: 1.6` a `1.65`). Usada em parágrafos, manifestos, diários e notas explicativas.
3. **Fato (Auditoria e Máquina)**: `IBM Plex Mono` / `SF Mono` (`var(--mono)`). Usada em hashes de commit, comandos, datas ISO puras e identificadores técnicos (`T-0001`, `US01`, `RN25`).

### 2.3. Sem Colisões Perpendiculares em "T"
- **Sem barras laterais soltas**: É terminantemente proibido aplicar `border-left` solto em caixas ou callouts que encostem ou cruzem réguas horizontais (`border-top` / `border-bottom`).
- **Callouts e Sínteses**: Devem ser blocos fechados com `border-radius: 12px`, fundo translúcido suave (`rgba(..., 0.025)`) e contorno atenuado (`rgba(..., 0.06)` a `0.07`), como em `.cbl-sintese-bloco`.

### 2.4. Medida de Leitura Rígida (66ch)
- Parágrafos de texto corrido, leads, descrições de personas e narrativas de diário **devem obrigatoriamente** possuir `max-width: 66ch; text-wrap: pretty;`. Linhas longas (>75 caracteres) degradam a retenção cognitiva e são proibidas.
- O container principal centraliza na viewport com `max-width: min(100%, 840px); margin: 0 auto;`.

### 2.5. Delimitadores, Pontuação e Higiene Tipográfica
- **Nomes de pessoas**: Separados **estritamente por vírgula** (`Nome 1, Nome 2, Nome 3`). É proibido usar pontos centrais (`·`) entre pessoas.
- **Micro-ponto geométrico em metadados (`.cbl-ponto-sep`)**: Proibido utilizar o caractere literal `·` (bullet/middot) no HTML de metadados. O glifo literal sofre oscilação de baseline de até 2.5px entre fontes. Use sempre:
  ```html
  <span class="cbl-ponto-sep" aria-hidden="true"></span>
  ```
- **Travessão Editorial (`.cbl-travessao`)**: Em prosa ou orações intercaladas, nunca escreva ` — ` com espaços comuns no HTML renderizado. O parser substitui automaticamente pela classe com espaços finos não-quebráveis:
  ```html
  <span class="cbl-travessao">&thinsp;—&thinsp;</span>
  ```
- **Proibido Emojis no Chrome**: Jamais use emojis soltos (🚀, 💡, ⚡️, 📋, 👔) em botões, menus, tabelas ou cabeçalhos. Toda iconografia deve ser SVG vetorial de traço fino (estilo Apple/Feather).

### 2.6. Tokens e Paridade Claro / Escuro
- **Nenhum valor hexadecimal avulso**: Cores devem consumir exclusivamente as variáveis semânticas de `Bancada/tokens.json` (`var(--fundo)`, `var(--superficie)`, `var(--borda)`, `var(--divisor)`, `var(--texto)`, `var(--textoSutil)`, `var(--acento)`).
- **Paridade Obrigatória**: Toda tela deve ser verificada nos modos escuro (`:root`) e claro (`:root[data-theme="light"]`).
- **Raio Padrão Apple**: Cartões e sínteses com `border-radius: 12px`; botões com `border-radius: 6px`; micro-badges com `border-radius: 4px`.

---

## 3. Diretrizes de Engenharia de Produto (Frila)

Ao lidar com requisitos, especificações, marketing ou código do Frila:

1. **PROIBIDO Inventar Metas de Tempo ou Toques**:
   - É terminantemente vedado escrever promessas de tempo pré-fixadas ("publicar vaga em 60 segundos", "candidatura com 1 toque", "cadastro em 3 minutos", "fechar em 3 toques") em requisitos, tarefas ou materiais de marketing (commits `6355da3`, `0c03a23`).
   - A diretriz de produto é a simplicidade operacional ("poucos campos", "sem formulário de candidatura"). Métricas quantitativas de velocidade só poderão ser estipuladas após medição empírica durante o piloto real com usuários no DF.
2. **Wireframes Oficiais de Baixa Fidelidade**:
   - A especificação visual canônica é o protótipo clicável em escala de cinza de **17 telas** gerado no Claude Artifact (`https://claude.ai/artifact/MUQ4VxtiJMCvG8H86WJD7q`), registrado na tarefa `T-0011`.
3. **Escopo do MVP (v1.0)**:
   - 19 histórias MUST do Backlog v1.2.0 (90 pontos), documentadas em `05-ESCOPO-DO-MVP.md`.
   - Inclui: Onboarding passwordless por código no e-mail, publicação simplificada em modo urgência, despacho por proximidade (<15 km, máx 1 push/30 min pela `RN23`), candidatura direta sem formulário, check-in por geolocalização a 200m (`RN22`), mecanismo de reputação binária e exclusão de conta em conformidade com as diretrizes da App Store.
4. **Remuneração Integral (`RN01`)**:
   - O profissional recebe o valor integral do turno. Não há comissão deduzida do turno do trabalhador.
5. **Reputação Binária**:
   - Avaliação pós-turno com pergunta direta: *"Chamaria de novo?"* ou *"Trabalharia lá de novo?"* (Sim / Não).
   - O perfil sempre expõe o denominador explícito: *"7 de 7 chamariam de novo"* + taxa de comparecimento (nada de estrelas de 1 a 5).

---

## 4. Regras do Repositório e Vault (`doc-harness`)

1. **A Regra de Ouro: Fato ≠ Narrativa**:
   - `05 - Registros/` armazena fatos brutos de auditoria escritos exclusivamente pelos hooks em `git push`. **Nunca edite arquivos em `05 - Registros/` manualmente.**
   - `02 - Atualizações Diárias/`: Narrativa diária. Ao redigir `## O que foi feito`, use **formato ultra-resumido em pequenos chunks concisos por alteração**, diretos e objetivos — nunca parágrafos longos ou narrativas prolixas.
2. **Documentos Derivados de .pages (`tipo: documento-derivado`)**:
   - O arquivo `.pages` é a fonte original. **Nunca edite o `.md` derivado diretamente**, pois ele é regenerado automaticamente e o hook `pre-commit` recusará a alteração.
3. **Frontmatter Obrigatório**:
   - Toda nota Markdown no vault exige frontmatter YAML válido (`tipo`, `desafio`, `status`, etc.).
4. **Validação de Inconsistências**:
   - Antes de submeter commits que alterem o vault, verifique a conformidade com o binário:
     ```bash
     cd Bancada && ./bancada-indice --verificar ../doc-harness
     ```
5. **Commits**:
   - Em português-BR, imperativo, conciso e seguindo Conventional Commits, referenciando o id da tarefa quando aplicável (ex.: `refactor(ui): ... (T-0011)`).

---

## 5. Comandos de Build, Teste e Verificação

- **Testes Unitários da Bancada (App Mac)**:
  ```bash
  cd Bancada && swift test
  ```
- **Compilação do Executável da Bancada**:
  ```bash
  cd Bancada && swift build
  ```
- **Regeneração do Site Editorial Web**:
  ```bash
  cd Bancada && node scripts/gerar-site.js
  ```
- **Verificação das 68 Páginas e Tokens**:
  ```bash
  cd Bancada && swift test --filter ParidadeDeTokensTests
  ```

---

## 6. Índice Rápido de Documentação

- `DESIGN.md`: Especificação e manual normativo do Design System (containerless, tipografia, componentes Apple, 66ch, Modo Zen).
- `Bancada/tokens.json`: Dicionário oficial de tokens de cor primitivos e papéis semânticos.
- `Bancada/doc-harness/01 - CBL/Desafios/C18/Documentos de Produto/05-ESCOPO-DO-MVP.md`: Detalhamento completo do escopo da v1.0 do Frila (19 histórias MUST).
- `Bancada/doc-harness/04 - Tarefas/T-0011 - Alinhar escopo e fluxos do protótipo de baixa fidelidade.md`: Definição dos wireframes de 17 telas e critérios de aceitação.
- `Bancada/doc-harness/07 - Arquitetura/`: Modelagem de banco de dados (19 tabelas, RLS), diagramas de classe e arquitetura de contêineres.
- `Bancada/doc-harness/CLAUDE.md`: Regras de convivência no vault do Obsidian e publicação Cloudflare Pages.
