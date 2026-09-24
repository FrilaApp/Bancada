# Sistema de Design da Bancada: Especificação e Gramática Visual (DESIGN.md)

> **Documento Normativo de Design e Interface**  
> **Referência Canônica**: Documento Oficial CBL (`cbl-documento.js`), Estilos Multipágina (`multipagina.css`), Gerador de Páginas (`gerar-site.js`) e Dicionário de Tokens (`tokens.json`).  
> **Finalidade**: Este documento especifica integralmente a forma, a interface, a hierarquia tipográfica, a geometria de componentes, as micro-interações e o comportamento tátil introduzidos e aperfeiçoados no documento CBL. Ele atua como o contrato e manual de referência mandatório para retratar e propagar o mesmo padrão visual e refinamento em todas as demais páginas do ecossistema da Bancada (`tarefas.html`, `registros.html`, `galeria.html` e notas individuais em `notas/`).

---

## 1. Tese e Princípios Fundamentais

O design da Bancada é fundamentado em três princípios essenciais que rejeitam o "card soup" (empilhamento indiscriminado de caixas e cartões), os degradês extravagantes e os padrões visuais genéricos gerados por inteligência artificial ("AI slop"):

### 1.1. Containerless / Borderless First (O Canvas como Superfície Aberta)
- **A tela respira**: O conteúdo repousa diretamente no canvas, sem a necessidade de envelopar cada parágrafo ou título dentro de retângulos artificiais com sombras pesadas.
- **Hierarquia por tipografia e espaço**: A separação entre blocos de informação é estabelecida pela escala tipográfica, entrelinhas generosas, respiro vertical consciente e, quando estritamente necessário, divisores horizontais *hairline* de 1px.
- **Cartões são exceções reservadas**: Componentes fechados e contidos são empregados unicamente quando agrupam itens acionáveis autônomos (ex.: cartões de atualização diária, blocos de síntese destacados) e recebem acabamento sutil de inspiração Apple.

### 1.2. A Regra de Ouro das Três Vozes
A forma de um elemento declara a sua procedência e natureza semiótica. Se duas coisas com propósitos distintos tivessem a mesma aparência, a interface estaria desmentindo o dado:

| Voz | Família Tipográfica | Onde Atua | Significado Semiótico |
| :--- | :--- | :--- | :--- |
| **Interface** (Chrome) | **Sans-serif** (`IBM Plex Sans` / `SF Pro`) | Barra lateral, abas, botões, cabeçalhos de tabela, rótulos, metadados | O aplicativo/sistema falando |
| **Narrativa** (Conteúdo) | **Sans/Serif** (`IBM Plex Sans` / `IBM Plex Serif`) | Corpo do texto, parágrafos, manifestos, sínteses, notas explicativas | Uma pessoa/autor falando |
| **Fato** (Auditoria) | **Monospace** (`IBM Plex Mono` / `SF Mono`) | Hashes de commit, comandos, datas ISO puras, identificadores de tarefa (`T-0001`) | O Git/hook de automação falando |

### 1.3. O Fio vs. A Sombra
- **Sem sombras difusas na estrutura**: A interface recusa sombras para elevação estrutural. Profundidade e limite vêm exclusivamente de tom de superfície e fios precisos de 1px.
- **Dois fios distintos, nunca um**:
  - `var(--borda)`: Contorna peças, cartões e cabeçalhos de tabela (neutro suave).
  - `var(--divisor)`: Separa painéis, regiões macro e linhas estruturais de dados (carrega mais peso ótico).
- **Sem colisões perpendiculares**: É proibido deixar linhas verticais abertas (`border-left`) encostarem ou cruzarem réguas horizontais (`border-top` / `border-bottom`), evitando junções em "T" ou cruzamentos de linhas.

---

## 2. Paleta Cromática e Paridade Claro / Escuro

O sistema cromático nasce em `Bancada/tokens.json` e divide-se estritamente em **Primitivos** (rampa acromática e matizes) e **Papéis Semânticos** (vocabulário consumido pelo CSS).

### 2.1. Tokens de Papel (CSS Variables)

```css
:root {
  /* Modo Escuro (Default) */
  --fundo: #0c0d0f;            /* neutro.13 — tela de fundo imersiva */
  --superficie: #141518;       /* neutro.12 — cartões e sobreposições */
  --superficieSutil: #1b1d21;  /* neutro.11 — hovers e preenchimentos sutis */
  --borda: #26282d;            /* neutro.10 — contornos de peças e caixas */
  --divisor: #33363c;          /* neutro.9  — réguas horizontais e divisões macro */
  --texto: #f4f5f7;            /* neutro.2  — títulos e leitura primária */
  --textoSutil: #8a8f98;       /* neutro.6  — apoios, resumos e metadados */
  --acento: #7c95f0;           /* azul.luz  — foco, links e estados ativos */
  --perigo: #f0837a;           /* vermelho.luz — ações destrutivas */
  --aviso: #d9a84e;            /* ambar.luz — notas de cautela */
  --sucesso: #4fc98a;          /* verde.luz — metas concluídas e status live */
}

:root[data-theme="light"] {
  /* Modo Claro (Superfície limpa sem amarelados) */
  --fundo: #f4f5f7;            /* neutro.2  — fundo do aplicativo */
  --superficie: #ffffff;       /* neutro.0  — folha branca de leitura */
  --superficieSutil: #f4f5f7;  /* neutro.2  — áreas operacionais e hovers */
  --borda: #e6e7ea;            /* neutro.3  — traço sutil de contorno */
  --divisor: #d3d6db;          /* neutro.4  — linha divisória de contraste */
  --texto: #141518;            /* neutro.12 — legibilidade máxima */
  --textoSutil: #6b6f76;       /* neutro.7  — metadados e legendas */
  --acento: #2f5bd8;           /* azul.profundo — link e foco */
  --perigo: #c0362b;           /* vermelho.profundo */
  --aviso: #8a6410;            /* ambar.profundo */
  --sucesso: #1e7a4c;          /* verde.profundo */
}
```

### 2.2. Regras Rígidas de Cor
1. **Um único acento**: O azul (`--acento`) é estritamente reservado a ações primárias, estados ativos, links e foco. Nunca é utilizado como preenchimento de grandes superfícies.
2. **Sem arco-íris**: Cores semânticas adicionais (verde, âmbar, vermelho, violeta) são restritas à tipologia de dado (status de tarefa, categoria de fato, severidade), nunca à decoração estética.
3. **Equilíbrio ótico no escuro**: Textos primários utilizam `#f4f5f7`, evitando `#ffffff` puro sobre preto absoluto para prevenir fadiga visual (halos óticos).

---

## 3. Grid, Escala e Métricas de Leitura

### 3.1. Largura Máxima e Centralização
A experiência de leitura do documento CBL e de todas as páginas deriva de uma coluna centralizada com respiro lateral generoso:

- **Largura Máxima do Container Principal**: `max-width: min(100%, 840px);`
- **Alinhamento do Canvas**: `margin: 0 auto;` (centralizado na viewport).
- **Teto de Linha de Leitura (Comprimento Oticamente Ideal)**: `max-width: 66ch;`  
  *Justificativa*: Linhas de texto corrido que ultrapassam 75 caracteres degradam a retenção da leitura. Todo elemento de narrativa (leads, parágrafos, descrições de fases, resumos de personas e objetivos) deve ser limitado a 66ch.

```css
.cbl-documento,
.pagina-conteudo-centralizado {
  max-width: min(100%, 840px);
  margin: 0 auto 80px;
  color: var(--texto);
  font-family: var(--sans);
  line-height: 1.6;
}

.cbl-masthead-lead,
.cbl-paragrafo-apoio,
.cbl-declaracao-texto,
.cbl-fase-descricao,
.cbl-library-item-desc {
  max-width: 66ch;
  text-wrap: pretty;
}
```

---

## 4. Escala Tipográfica e Ritmo Vertical

O sistema define papéis tipográficos claros com `clamp()` fluido para garantir equilíbrio entre monitores ultrawide, telas retina de MacBook e dispositivos compactos:

| Papel | Tamanho / Clamp | Peso | Tracking | Entrelinha | Text Wrap | Exemplo de Aplicação |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `clamp(2rem, 3.2vw, 2.6rem)` | 600 | `-0.035em` | `1.16` | `balance` | Título do documento CBL, títulos principais de páginas |
| **Fase / Macro H2**| `1.75rem` (28px) | 600 | `-0.025em` | `1.22` | `balance` | Títulos de Fase (`Engage`, `Investigate`, `Act`) |
| **Subseção H3** | `1.15rem` (18.4px) | 600 | `-0.015em` | `1.35` | `balance` | Ciclos exploratórios, rubricas, objetivos |
| **Card / Item H4** | `14.5px` a `15px` | 600 | `-0.015em` | `1.4` | `balance` | Nome de persona, título de learning goal, documento técnico |
| **Manifesto Pull-Quote** | `clamp(1.35rem, 2.2vw, 1.7rem)`| 500 | `-0.02em` | `1.35` | `balance` | Challenge Statements, Main Essential Question, Solution Concept |
| **Big Idea Termo** | `clamp(2.1rem, 3.6vw, 2.8rem)`| 600 | `-0.03em` | `1.12` | `balance` | Palavra-chave principal ("Freelancer") |
| **Corpo / Leitura** | `14px` a `15px` | 400 | `0` | `1.6` | `pretty` | Parágrafos explicativos, argumentação, contexto |
| **Subtexto / Apoio** | `13px` a `13.5px` | 400 | `0` | `1.55` | `pretty` | Respostas de perguntas, descrições de metas, itens de lista |
| **Eyebrow / Rótulo**| `11px` | 600 | `+0.06em` | `1.2` | `nowrap` | Micro-caps (`EQUIPE BLENDOFS`, `FASE 01`, `MILESTONE CBL`) |
| **Contadores / Tabular**| `11px` a `13px` | 600 | `0` | `1.0` | `nowrap` | Numeração de perguntas (`01`, `02`), contadores de fatos (`3 fatos`) |

### 4.1. Travessão Editorial e Prevenção de Quebras Órfãs (`.cbl-travessao`)
- **Proibição de espaço comum ao redor de travessões**: Em textos em prosa ou narrativa intercalada, a sequência ` — ` com espaços normais é expressamente proibida no HTML renderizado. Espaços normais somados ao comprimento do travessão geram um vazio de até 1.5em e fazem com que o travessão caia isolado no início da linha seguinte (órfão visual).
- **Tratamento Canônico**: O parser Markdown (`markdown.js`) substitui automaticamente a ocorrência por:
  ```html
  <span class="cbl-travessao">&thinsp;—&thinsp;</span>
  ```
- **CSS Aplicado**:
  ```css
  .cbl-travessao {
    white-space: nowrap;
    opacity: 0.85;
    letter-spacing: -0.05em;
  }
  ```

---

## 5. Gramática dos Componentes Canônicos

### 5.1. Masthead e Colofão Editorial Aberto
O cabeçalho do documento elimina caixas fechadas, adotando uma estrutura editorial fluida:

```html
<header class="cbl-masthead-doc">
  <div class="cbl-masthead-eyebrow">
    <span class="cbl-masthead-rotulo">Documento Oficial · Apple Developer Academy · CBL</span>
    <a href="midia/.../CBL_C18.pdf" class="cbl-masthead-pdf" download>
      <span>PDF Original (28p · 9.1 MB)</span>
      <span class="cbl-seta">↗</span>
    </a>
  </div>

  <h1 class="cbl-masthead-titulo">Documento Oficial CBL — Challenge 18</h1>
  <p class="cbl-masthead-lead">Framework Challenge Based Learning aplicado à concepção, pesquisa empírica de mercado e especificação técnica do produto <strong>Frila</strong>.</p>

  <!-- Colofão em grid fluido, separado por réguas hairline -->
  <div class="cbl-colofao">
    <div class="cbl-colofao-item">
      <span class="cbl-colofao-rotulo">Equipe BlendOps</span>
      <div class="cbl-colofao-valor">
        <span>Cauê Carneiro</span>, <span>Fabrício Tosta</span>, <span>João Paulo</span>, <span>Júlia Clovandi</span>, <span>Matheus Silva</span>
      </div>
    </div>
    <div class="cbl-colofao-item">
      <span class="cbl-colofao-rotulo">Mentores</span>
      <div class="cbl-colofao-valor">Felipe Carvalho, Victor Zerefos</div>
    </div>
    <div class="cbl-colofao-item">
      <span class="cbl-colofao-rotulo">Ciclo</span>
      <div class="cbl-colofao-valor"><time datetime="2026-09-08">08/09/2026</time> — <time datetime="2026-12-04">04/12/2026</time></div>
    </div>
    <div class="cbl-colofao-item">
      <span class="cbl-colofao-rotulo">Recursos</span>
      <div class="cbl-colofao-valor cbl-colofao-links">
        <a href="https://figma.com/..." target="_blank">FigJam C18 <span class="cbl-seta">↗</span></a>
        <span class="cbl-colofao-sep">/</span>
        <a href="https://github.com/..." target="_blank">GitHub Frila <span class="cbl-seta">↗</span></a>
      </div>
    </div>
  </div>

  <!-- Navegação rápida aberta (sem botões de pílula) -->
  <nav class="cbl-nav-ancoras">
    <span class="cbl-nav-legenda">Seções</span>
    <a href="#cbl-engage" class="cbl-link-ancora"><span class="cbl-ancora-num">01</span> Engage</a>
    <span class="cbl-ancora-sep">/</span>
    <a href="#cbl-investigate" class="cbl-link-ancora"><span class="cbl-ancora-num">02</span> Investigate</a>
  </nav>
</header>
```

**Regras Mandatórias**:
- **Nomes de pessoas**: Separados estritamente por vírgula (`Nome 1, Nome 2`), **nunca** por pontos centrais (`·`). O ponto central é reservado para separar metadados analíticos.
- **Micro-ponto geométrico em metadados (`.cbl-ponto-sep`)**: Proibido utilizar o caractere de glifo literal `·` (bullet/middot) no HTML de cabeçalhos e metadados. Cada fonte (SF Pro, IBM Plex, Geist) possui uma métrica vertical distinta para o middot, o que causa oscilações de baseline de até 2.5px. Exige-se o uso exclusivo do elemento:
  ```html
  <span class="cbl-ponto-sep" aria-hidden="true"></span>
  ```
  ```css
  .cbl-ponto-sep {
    display: inline-block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.35;
    margin: 0 7.5px;
    vertical-align: middle;
    flex-shrink: 0;
  }
  ```
- **Auditoria no Colofão (Regra das Três Vozes)**: No item de auditoria, o autor do commit deve ser renderizado em sans-serif (`.cbl-colofao-autor`), enquanto o hash do commit deve repousar estritamente em monospace (`<code class="cbl-colofao-hash">`).
- **Links externos**: Acompanhados do glifo `↗` (`.cbl-seta`), que translada discretamente `transform: translate(2px, -2px)` no estado hover.

---

### 5.2. Manifestos Tipográficos (Pull-Quotes de Milestones)
Usados para *Big Idea*, *Essential Questions*, *Challenge Statements* e *Solution Concept*. Nunca utilizam contorno ou fundo de caixa:

```html
<div class="cbl-declaracao-marco" id="marco-challenge-statement">
  <div class="cbl-declaracao-eyebrow">
    <span class="cbl-declaracao-rotulo">Milestone CBL</span>
    <span class="cbl-declaracao-sep">/</span>
    <span class="cbl-declaracao-titulo">Challenge Statement</span>
  </div>
  <div class="cbl-declaracao-destaque">
    Tornar possível que um estabelecimento e um profissional que nunca trabalharam juntos fechem um turno com confiança suficiente para os dois, em menos de uma hora, no Distrito Federal.
  </div>
  <div class="cbl-declaracao-texto">
    <p>Fixa a restrição geográfica no <strong>Distrito Federal</strong> e impõe a métrica de tempo operacional de fechamento em menos de 60 minutos.</p>
  </div>
</div>
```

---

### 5.3. Tabelas Editoriais Abertas (Data Tables sem Moldura Externa)
Substituem tabelas convencionais cheias de caixilhos por uma apresentação limpa inspirada em publicações de design suíço:

```html
<div class="cbl-tabela-container">
  <table class="cbl-tabela-aberta">
    <thead>
      <tr>
        <th style="width: 76%;">Guiding Questions &amp; Respostas</th>
        <th style="width: 24%;">Fonte / Referência</th>
      </tr>
    </thead>
    <tbody>
      <tr class="cbl-linha-pergunta">
        <td class="cbl-cel-conteudo">
          <div class="cbl-pergunta-texto"><strong>Qual é o tamanho da dor de falta de funcionários no food service?</strong></div>
          <div class="cbl-resposta-texto">90% das empresas enfrentam escassez recorrente, segundo levantamento nacional da Abrasel...</div>
        </td>
        <td class="cbl-cel-recurso">
          <a href="https://..." class="cbl-link-fonte" target="_blank">Abrasel 2026 <span class="cbl-seta">↗</span></a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Diretrizes de Estilo**:
- `border: none;` na tabela e no container.
- Cabeçalhos (`th`) com texto em 11px uppercase e borda inferior sutil `1px solid var(--borda)`.
- Células com espaçamento vertical de 16px, separadas por `1px solid var(--divisor)`. A última linha suprime a borda inferior.
- Efeito hover sutil por linha (`background: rgba(255, 255, 255, 0.025)`).

---

### 5.4. Registro de Atividade em Faixa Aberta
Tabela de metadados compactos em grade horizontal aberta:

```html
<div class="cbl-atividade-registro">
  <div class="cbl-atividade-col cbl-col-principal">
    <span class="cbl-meta-rotulo">Atividade</span>
    <span class="cbl-atividade-valor"><strong>Desk Research &amp; Levantamento Setorial</strong></span>
  </div>
  <div class="cbl-atividade-col cbl-col-data">
    <span class="cbl-meta-rotulo">Data</span>
    <span class="cbl-atividade-valor"><time>08/09/2026</time></span>
  </div>
  <div class="cbl-atividade-col cbl-col-recursos">
    <span class="cbl-meta-rotulo">Recursos</span>
    <span class="cbl-atividade-valor">Abrasel, IBGE, Sebrae</span>
  </div>
  <div class="cbl-atividade-col cbl-col-feedback">
    <span class="cbl-meta-rotulo">Feedback &amp; Aprendizado</span>
    <span class="cbl-atividade-valor">Dados validados com a equipe de mentoria.</span>
  </div>
</div>
```

---

### 5.5. Cartão de Síntese Estilo Apple (Callout Contido)
Desenvolvido para consolidar conclusões e aprendizados de pesquisa sem linhas verticais abertas que entrem em conflito com réguas adjacentes:

```html
<div class="cbl-sintese-bloco">
  <div class="cbl-sintese-rotulo">Síntese do Domínio</div>
  <ul class="cbl-sintese-lista">
    <li><strong>A dor do trabalhador é a falta de acesso:</strong> A queixa unânime não é escassez de vagas, mas ser ignorado em marketplaces passivos.</li>
    <li><strong>Barreira de onboarding afasta antes do trabalho:</strong> Selfies que não validam e falhas em OCR de documentos barram profissionais qualificados.</li>
  </ul>
</div>
```

**Parâmetros de Construção**:
- `border-radius: 12px;` (curvatura padrão Apple).
- `border: 1px solid rgba(255, 255, 255, 0.07);` (no escuro) / `border: 1px solid rgba(0, 0, 0, 0.08);` (no claro).
- `background: rgba(255, 255, 255, 0.025);` (no escuro) / `background: rgba(0, 0, 0, 0.02);` (no claro).
- Marcador de lista com ponto acento azul (`var(--acento)`).
- Destaque semântico em negrito no início de cada tópico.

---

### 5.6. Cartões de Lista Estilo Apple (Últimas Atualizações / Itens Clicáveis)
Padrão obrigatório para listas interativas, links de registros, histórico e cartões navegáveis:

```html
<ul class="lista-dias">
  <li>
    <a href="notas/2026-09-18.html" class="link-dia-card">
      <span class="dia-data">18 set 2026</span>
      <div class="dia-meta">
        <span class="apoio">3 fatos</span>
        <svg class="seta-dia" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
    </a>
  </li>
</ul>
```

**Comportamento e Geometria**:
- `<a>` ocupa 100% da área do card (`padding: 13px 18px`), tornando a área inteira clicável.
- `border-radius: 12px;` com outline atenuado (`1px solid rgba(255, 255, 255, 0.06)`).
- Data em fonte sans limpa e legível em formato humano (`18 set 2026`), nunca string crua ISO `2026-09-18`.
- Apoio/Contador (`.apoio`) com tipografia tabular sutil (`12.5px`), sem caixas pesadas ao redor.
- Micro-chevron `›` que avança suavemente `transform: translateX(2px)` ao passar o mouse.
- Elevação tátil no hover: `transform: translateY(-1px)` e iluminação do fundo.

---

### 5.7. Personas Primárias (Apresentação Tipográfica em Grade)
Apresenta personas como entidades vivas de produto, sem caixas artificiais tipo "ficha de RPG":

```html
<div class="cbl-personas-container">
  <div class="cbl-persona-coluna">
    <div class="cbl-persona-eyebrow">
      <span class="cbl-meta-rotulo">Contratante</span>
    </div>
    <h4 class="cbl-persona-nome">O Maître sob estresse</h4>
    <p class="cbl-persona-desc">Trabalha no salão, não na sala. São 16h de uma sexta, faltou um garçom e o movimento começa em duas horas...</p>
    <span class="cbl-persona-status">Proto-persona de desk research, validada em campo.</span>
  </div>
  <div class="cbl-persona-coluna">
    <div class="cbl-persona-eyebrow">
      <span class="cbl-meta-rotulo">Profissional</span>
    </div>
    <h4 class="cbl-persona-nome">Quem se candidata e nunca é chamado</h4>
    <p class="cbl-persona-desc">Tem experiência real, muitas vezes anos dela, mas nenhum jeito de provar isso para um estabelecimento que não o conhece...</p>
    <span class="cbl-persona-status">Proto-persona, validada em campo no DF.</span>
  </div>
</div>
```

---

### 5.8. Learning Goals & Competências (Estilo Library de Raphael Salaja)
Grid editorial aberto com numeração tabular e micro-interação por linha:

```html
<article class="cbl-library-item" id="goal-01">
  <div class="cbl-library-item-topo">
    <span class="cbl-library-num">01</span>
    <div class="cbl-library-item-corpo">
      <div class="cbl-library-item-linha">
        <h4 class="cbl-library-item-titulo">Design System &amp; Tokens</h4>
        <span class="cbl-library-item-cat">Design &amp; Experiência</span>
      </div>
      <p class="cbl-library-item-desc">Arquitetura de design tokens com sincronização entre Figma, JSON e código nativo.</p>
      <div class="cbl-library-item-objetivos">
        <span class="cbl-library-obj-rotulo">Learning Objectives</span>
        <ul class="cbl-library-obj-lista">
          <li>Estruturar biblioteca de tokens com paridade claro/escuro.</li>
          <li>Garantir aderência às WCAG 2.2 em contrastes de leitura.</li>
        </ul>
      </div>
    </div>
  </div>
</article>
```

---

### 5.9. Micro-Badges de Evidência CBL (Taxonomia de Pesquisa)
Substituem rótulos genéricos por marcadores semânticos de rigor investigativo nas tabelas e seções de pesquisa:

```html
<span class="cbl-evidencia-tag tag-dado">Dado</span>
<span class="cbl-evidencia-tag tag-relato">Relato</span>
<span class="cbl-evidencia-tag tag-hipotese">Hipótese</span>
<span class="cbl-evidencia-tag tag-lacuna">Lacuna</span>
```

**Parâmetros de Estilo**:
- **Geometria**: `display: inline-flex; align-items: center; padding: 2px 6.5px; border-radius: 4px; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1;`.
- **Dado** (`.tag-dado`): cor `#38bdf8`, fundo `rgba(56, 189, 248, 0.08)`, contorno `1px solid rgba(56, 189, 248, 0.22)`.
- **Relato** (`.tag-relato`): cor `#c084fc`, fundo `rgba(192, 132, 252, 0.08)`, contorno `1px solid rgba(192, 132, 252, 0.22)`.
- **Hipótese** (`.tag-hipotese`): cor `#fbbf24`, fundo `rgba(251, 191, 36, 0.08)`, contorno `1px solid rgba(251, 191, 36, 0.22)`.
- **Lacuna** (`.tag-lacuna`): cor `#fb7185`, fundo `rgba(251, 113, 133, 0.08)`, contorno `1px solid rgba(251, 113, 133, 0.22)`.

---

## 6. Navegação, Header e Modo Zen (Distraction-Free)

### 6.1. Header / HUD Superior Minimalista
- **Altura**: `44px` fixo, sticky no topo com `backdrop-filter: blur(16px)`.
- **Marca**: Ícone discreto (15×15px) acompanhado de `Challenge 18`. Sem subtítulos redundantes.
- **Botão de Alternância de Tema**: Botão compacto quadrado de 28×28px (`.btn-tema`), raio de 6px, com ícones SVG centralizados de Sol e Lua, sem rótulo de texto para economizar espaço horizontal.
- **Indicador de Status**: Ponto pulsante verde suave (`status-pulsar`, animação de pulsação radial de 2s) acompanhado de `Live`.

### 6.2. Barra Lateral (Sidebar) e Árvore Colapsável
- **Posicionamento**: Recuada para a margem esquerda com espaçamento uniforme (`width: 220px`).
- **Chevrons de Grupo**: Ícone vetorial proporcional desenhado em matriz 16×16px (`viewBox="0 0 16 16"` com path `m6 4 4 4-4 4"`), rotacionando de 0° (fechado, apontando para a direita `›`) a 90° (aberto, apontando para baixo `⌄`) com transição de `180ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Linha de Recuo Indentada**: A lista interna de cada grupo colapsável possui um traço sutil à esquerda (`border-left: 1px solid rgba(255, 255, 255, 0.08)` no escuro / `rgba(0, 0, 0, 0.08)` no claro) que guia visualmente a hierarquia.
- **Itens de Navegação**: Raio de 5px, padding vertical compacto (5px 8px), estado ativo com destaque translúcido sem borda saturada.

### 6.3. Modo Zen Automático (Scroll HUD)
- **Comportamento de Rolagem**: Ao rolar a página para baixo após o masthead inicial (>140px com delta descendente > 8px), o Header translada suavemente para cima (`transform: translateY(-100%); opacity: 0;`), maximizando o campo visual e reduzindo distrações para imersão total na leitura. Qualquer rolagem ascendente (delta < -6px) ou retorno ao topo (< 80px) traz o HUD de volta instantaneamente.
- **Transição e Desempenho**:
  ```css
  .cbl-hud {
    transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
    will-change: transform;
  }
  ```
- **Compensação de Âncoras**: Quando a classe `.cbl-hud-oculta` é ativada em `html` e `body`, o documento adota `scroll-padding-top: 28px;` para assegurar que a navegação por âncoras não cole cabeçalhos no limite cego superior da viewport.

---

## 7. Diretrizes de Propagação para as Demais Páginas

Para que o site da Bancada mantenha coerência estética integral, os padrões do documento CBL devem ser imediatamente replicados nas outras páginas:

### 7.1. Em `tarefas.html` (Quadro e Tabela de Tarefas)
- **Tabela de Tarefas**: Adotar a estrutura de `.cbl-tabela-aberta`, eliminando o caixote cinza pesado ao redor da tabela.
- **Filtros e Contadores**: Devem seguir o padrão dos contadores de metadados (`font-variant-numeric: tabular-nums; font-size: 11.5px; text-transform: uppercase; color: var(--textoSutil)`).
- **Badges de Status**: Usar pílulas refinadas com ponto colorido sutil (`.status-ponto`), sem bordas pesadas ou fundos berrantes.

### 7.2. Em `registros.html` (Timeline e Fatos de Auditoria)
- **Linhas de Registro**: Aplicar o padrão `.cbl-atividade-registro` e `.cbl-linha-pergunta`, onde cada fato é uma linha fluida com hora/tipo em mono, autor em sans e narrativa explicativa legível.
- **Sem colisão de bordas**: Garantir que agrupadores de data usem réguas limpas de 1px com espaçamento vertical de 24px a 32px.

### 7.3. Em `galeria.html` (Acervo Visual de Mídia)
- **Cartões de Mídia**: Abandonar molduras pesadas. Imagens devem repousar em cartões de `border-radius: 12px` com borda tênue de `1px solid var(--borda)`, hover com elevação de `translateY(-2px)` e legendas em sans 13px.

### 7.4. Em Notas de Markdown Derivadas (`site/notas/*.html`)
- **Metadados do Frontmatter (`.campos`)**: Não criar caixinhas isoladas. Alinhar como pares horizontais chave-valor inspirados no colofão (`.campo-chave` em uppercase 11px, `.campo-valor` em 13px).
- **Callouts e Avisos**: Adotar o estilo dos blocos de síntese (`.cbl-sintese-bloco`), com cantos arredondados de 12px, fundo translúcido suave e traço perimetral delicado, abolindo callouts que tenham apenas uma barra lateral solta encostando em outras bordas.

---

---

## 8. Design de Produto, Wireframes e Gramática Funcional (Frila)

O ecossistema visual da Bancada serve de espelho e fundamentação para o produto principal concebido no Challenge 18: o **Frila** (aplicativo nativo iOS voltado ao fechamento de turnos avulsos no Distrito Federal).

### 8.1. Referência Canônica de Wireframes de Baixa Fidelidade
- **Protótipo Interativo Oficial**: O protótipo clicável em escala de cinza estruturado no Claude Artifact (`https://claude.ai/artifact/MUQ4VxtiJMCvG8H86WJD7q`), registrado na tarefa `T-0011` e no documento de escopo `05-ESCOPO-DO-MVP.md`.
- **Composição**: 17 telas funcionais sem ornamentos, focadas exclusivamente na arquitetura de informação e no fechamento do ciclo de valor.
- **Divisão de Fluxos**:
  1. *Entrada Comum*: Onboarding e autenticação passwordless por código enviado ao e-mail, compartilhada por ambos os perfis. Perfil fixo por conta (`RN25`).
  2. *Contratante*: Publicação de vaga em modo urgência com poucos campos, visualização de candidatos, confirmação de profissional, alerta de vaga vazia e confirmação de check-in manual.
  3. *Profissional*: Despacho por proximidade geográfica (< 15 km) com teto de frequência (máximo 1 notificação a cada 30 minutos, `RN23`), candidatura direta sem preenchimento de formulário e check-in geolocalizado a até 200 m do estabelecimento (`RN22`).

### 8.2. Princípio da Honestidade Operacional (Sem Metas Arbitrárias de UX)
- **Expurgamento de Promessas Prematuras**: É terminantemente proibido inserir promessas não mensuradas de tempo ou cliques na interface, na documentação de produto ou em materiais de marketing (ex.: "vaga publicada em 60 segundos", "candidatura com 1 toque", "cadastro em 3 minutos", "3 toques para fechar").
- **Diretriz de Design**: A interface deve ser projetada para ser enxuta e de fricção mínima ("poucos campos", "sem formulário"), mas qualquer métrica quantitativa só poderá ser declarada formalmente após medição empírica e cronometrada durante o piloto real com usuários no DF.
- **Remuneração Integral**: A interface do profissional sempre apresenta o valor bruto integral do turno, sem dedução de taxas ou comissões do trabalhador (`RN01`).

### 8.3. Mecanismo de Confiança e Reputação Binária
- **Rejeição de Escalas Arbitrárias (1 a 5 estrelas)**: O produto recusa notas de 1 a 5 estrelas, que sofrem de inflação de notas e subjetividade.
- **Pergunta Binária Direta**: Após o turno confirmado e verificado por presença, ambas as partes respondem: *"Chamaria de novo?"* ou *"Trabalharia lá de novo?"* (Sim / Não).
- **Denominador Explícito**: A reputação exibida no perfil declara sempre o total de turnos avaliados (ex.: `7 de 7 chamariam de novo`), acompanhada da taxa percentual de comparecimento.

---

## 9. Checklist de Revisão de Design (Pre-flight Gate)

Antes de aprovar qualquer alteração, nova página ou componente no ecossistema:

- [ ] **Sem "Card Soup"**: O conteúdo repousa diretamente no canvas aberto, sem caixotes artificiais desnecessários?
- [ ] **Sem Linhas Cruzadas**: Nenhuma borda vertical (`border-left`) colide perpendicularmente com divisores horizontais?
- [ ] **Sem Pontos Centrais entre Pessoas**: Nomes de autores e membros estão estritamente separados por vírgula (`Nome A, Nome B`)?
- [ ] **Micro-Pontos Geométricos**: Metadados em cabeçalhos e colofões utilizam `<span class="cbl-ponto-sep" aria-hidden="true"></span>` em vez do glifo literal `·`?
- [ ] **Travessão Editorial**: O travessão (`—`) em prosa utiliza a classe `.cbl-travessao` com espaços finos não-quebráveis?
- [ ] **Comprimento de Linha**: Parágrafos de leitura e blocos narrativos respeitam o limite de `66ch` (`text-wrap: pretty;`)?
- [ ] **Cantos Arredondados de 12px**: Todos os cartões de lista, sínteses e recipientes fechados adotam o raio padrão Apple?
- [ ] **Bordas Suaves**: Contornos de cartões utilizam traço translúcido sutil (`rgba(..., 0.06)` a `0.07`), nunca bordas sólidas pesadas?
- [ ] **Paridade de Tema**: A interface foi validada nos modos claro (`data-theme="light"`) e escuro sem quebras de contraste?
- [ ] **Sem Emojis Decorativos**: Glifos de sistema e ícones SVG vetoriais precisos foram utilizados no lugar de emojis soltos no chrome?
- [ ] **Regra das Três Vozes**: Chrome em Sans, narrativa em Serif/Sans editorial, auditoria e identificadores em Monospace?
- [ ] **Sem Metas Prematuras no Produto**: Textos de interface e requisitos não contêm promessas quantitativas de tempo/toque não medidas em campo?
- [ ] **VoiceOver e Teclado**: Todo componente interativo possui foco visível (`:focus-visible`) e é plenamente acessível?

