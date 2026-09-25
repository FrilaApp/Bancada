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
4. **Escala de mudança (`mudanca`)**: As cores do marca-texto de novidades são uma categoria de dado, como `statusTarefa` e `tipoFato`: verde é acréscimo, âmbar é correção e vermelho é remoção. `tinta` é o texto sobre as três. A escala vive em `tokens.json` → `mudanca`, só com referências a primitivo (`marca.verde`, `verde.luz`, `neutro.13`), e chega ao CSS como `--mudanca-acrescimo`, `--mudanca-correcao`, `--mudanca-remocao` e `--mudanca-tinta`. Fica fora de `papel` de propósito: é do site e não tem espelho em `Tokens.swift`. Nunca vira decoração nem estado de interface; um verde de acréscimo num botão diria "isto é novo" onde nada mudou. Anatomia, contraste e a exceção sancionada do tema claro estão em §5.10.

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

### 5.10. Marca-texto de novidades
O site mostra a cada leitor o texto que mudou desde a última visita dele; quem nunca visitou vê os últimos 7 dias. A mudança aparece como marca-texto chapado: preenchimento sólido e opaco, tinta escura, sem borda nem sombra, repetido em cada linha quebrada. Depois de lida, a marca esmaece e não volta na visita seguinte. O CSS vive em `estilo/novidades.css`; o cliente (`novidades/cliente.js`) só põe as classes.

```html
<p>O profissional recebe o valor integral do turno<del class="nov nov--remocao nov--inicio nov--fim" tabindex="-1"><span class="nov-sr">Removido: </span>, descontada a comissão da plataforma</del>, e a avaliação pergunta <mark class="nov nov--correcao nov--inicio nov--fim" tabindex="-1"><span class="nov-sr">Corrigido: </span>"Chamaria de novo?"<span class="nov-sr"> (antes: "Você recomendaria este profissional?")</span></mark>.</p>
```

**Anatomia**:
- **Três categorias, duas tags**: `mark.nov.nov--acrescimo` e `mark.nov.nov--correcao` para o texto que está na página; `del.nov.nov--remocao` para o texto que saiu e volta tachado. Cada uma pinta com a sua `--mudanca-*` e a tinta `--mudanca-tinta`.
- **Peças**: um trecho que atravessa elementos (texto, depois `<strong>`, um link, um travessão) vira várias peças. Só a primeira (`.nov--inicio`) e a última (`.nov--fim`) levam respiro de `0.14em` e canto de 2px nas pontas; as do meio encostam e o preenchimento corre sem emenda. Uma peça única leva as duas classes. Com `box-decoration-break: clone` (e o prefixo `-webkit-`), cada linha quebrada repete preenchimento, respiro e canto.
- **Dentro de link**: a tinta cobre a cor do link, então a peça ganha sublinhado de 1px como pista de que ali se clica.
- **Correção**: só o texto novo é marcado, com sublinhado tracejado de 1,5px na tinta. O texto de antes aparece no balão compartilhado `#nov-antes` ("Antes: …"), aberto por ponteiro, toque ou foco e fechado com Esc. O balão usa as cores invertidas do tema (`--texto` de fundo, `--fundo` de texto), raio de 6px e nenhuma sombra.
- **Remoção curta**: volta inline, tachada, com `user-select: none`; copiar o parágrafo não leva junto o que já não está no documento.
- **Remoção longa** (25 palavras ou mais, ou um trecho que atravessa blocos): vira `details.nov-removido`, um bloco fechado da família da síntese (§5.5), com raio de 12px, véu de 2,5% e fio de 7% sobre `--texto`. O resumo diz "Trecho removido" e a contagem de palavras, com a amostra vermelha à frente e um chevron geométrico na ponta. Na tabela, o bloco ocupa uma `<tr>` inteira sem caixa própria; na lista, entra num `<li>` que não ganha o ponto de lista nem conta na numeração de uma `<ol>`.
- **Texto para leitor de tela** (`.nov-sr`): "Novo:", "Corrigido: … (antes: …)" e "Removido:". Vai dentro da marca: o rótulo abre a primeira peça e, na correção, o "(antes: …)" fecha a última. Fica fora da tela e fora da seleção.
- **Linha de resumo** (`.nov-resumo`), logo abaixo do título: "Desde sua visita de 22 set:" seguido de um chip por categoria (`.nov-chip`, um botão com fundo de 5% e raio de 6px), com a amostra quadrada de 10px (`.nov-amostra`) e a contagem, e por fim "Marcar como lidas". As variantes são "Nos últimos 7 dias:", "Página nova", "Tudo lido nesta página", o aviso de página reescrita e o de página muito alterada (em Estados, abaixo). Um chip cuja categoria já foi toda lida fica apagado (`disabled`), para a linha não pular.

**Cores e contraste** (tinta `neutro.13`, `#0C0D0F`, nos dois temas; fundos medidos são os que o `multipagina.css` desenha, `#F8F9FA` no claro e `#000000` no escuro):

| Categoria | Claro (pastel) | Escuro (`luz`) | Tinta sobre a marca | Marca contra o fundo | Pista além da cor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Acréscimo | `marca.verde` `#B6F2CB` | `verde.luz` `#4FC98A` | 15,32:1 / 9,31:1 | 1,20:1 / 10,05:1 | contagem no resumo e texto oculto |
| Correção | `marca.ambar` `#FFE08A` | `ambar.luz` `#D9A84E` | 15,07:1 / 8,94:1 | 1,22:1 / 9,66:1 | sublinhado tracejado |
| Remoção | `marca.vermelho` `#FFC2BC` | `vermelho.luz` `#F0837A` | 12,68:1 / 7,62:1 | 1,45:1 / 8,23:1 | tachado |

**O pastel e a exceção ao WCAG 1.4.11**: No tema claro o preenchimento é pastel por decisão do usuário, em 2026-09-24, depois de ver lado a lado os tons médios (`#3E9E6C`, `#B3851B`, `#D9645B`), que passam nos 3:1 contra o papel mas pesam mais e não parecem marca-texto. Contra o papel, o pastel fica entre 1,2 e 1,5:1, abaixo dos 3:1 que o critério 1.4.11 (contraste não textual) pede ao preenchimento como indicador. É uma exceção consciente, e ela se apoia em compensações que não dependem de enxergar o fundo:
1. **Texto para leitor de tela**: cada marca anuncia a categoria e, na correção, o texto de antes.
2. **Resumo com contagem**: a linha sob o título diz quantas mudanças há e de que tipo antes de o leitor procurar por elas.
3. **Navegação pelos chips**: cada chip leva o foco à próxima marca não lida da categoria, com o anel de foco padrão (2px de acento), e volta ao começo no fim; Esc devolve o foco ao chip.
4. **Tracejado e tachado**: as duas categorias que mudam o sentido do texto (correção e remoção) têm uma pista de forma, e não só de cor.
5. **Tinta sempre legível**: sobre qualquer marca, nos dois temas, o texto fica acima de 7,6:1. O que perde contraste é a borda da marca, nunca o que está escrito nela.

No modo de alto contraste do sistema (`forced-colors`), as marcas passam às cores de marca-texto do próprio sistema (`Mark` e `MarkText`), e o tracejado e o tachado continuam separando as categorias. No escuro nenhuma exceção é necessária: os tons `luz` passam de 7:1 contra o fundo. `scripts/testes/tokens.test.js` cobra a tinta em 4,5:1 nos dois temas e os 3:1 no escuro; no claro, mostra a medida e aponta para esta seção. Se algum leitor relatar que não enxerga as marcas no claro, os tons médios acima são o caminho de volta.

**Estados**:
- **Não lida**: preenchimento chapado, como descrito acima.
- **Lida** (`.nov--lida`): o cliente considera lida a marca que ficou 2 s na tela, com metade dela à vista (ou metade da tela, se for alta) e a aba ativa. O fundo esmaece e sobra um traço fino, de 1,5px, na cor da categoria até o fim da visita: sublinhado no acréscimo, tracejado na correção, tachado na remoção. No claro o traço é o pastel misturado a 55% com a tinta (entre 4,1 e 4,7:1 contra o papel); no escuro, o tom `luz` puro. A remoção lida passa o texto para `--textoSutil`. O bloco de remoção longa lido segue o mesmo esmaecer: perde o véu, rótulo e texto vão para o `--textoSutil`, a amostra fica vazada no traço da categoria e o texto antigo sai tachado nesse traço. Na visita seguinte a marca nem é desenhada.
- **Página muito alterada**: com mais de 150 trechos não lidos (`LIMITE_TRECHOS` em `cliente.js`), a página abre sem marcas. A linha de resumo diz "esta página mudou muito (624 trechos)" e oferece "Mostrar as marcas", que desenha tudo só naquela visita, e "Marcar como lida", que aceita a página inteira. Enquanto as marcas estão escondidas, nada conta como lido, e os pontos da barra e das âncoras continuam. Num documento revisado de ponta a ponta, como o Documento de Requisitos na passagem da v1.1 para a v2.0, centenas de marcas viram ruído, e quem decide se quer o detalhe é o leitor.
- **Foco**: o anel padrão de `:focus-visible`, com o canto da marca (2px) em vez dos 4px gerais.
- **Impressão**: a marca vira texto comum; remoções, resumo e balão não saem no papel, que mostra o documento de hoje.

**Movimento**:
- **Leitura**: o fundo e o traço mudam em `movimento.leitura` (0,6 s, `ease`), a única transição do sistema que o leitor não pediu, e por isso lenta. A cor do texto não cruza com o fundo: troca de uma vez na metade do tempo. No escuro, tinta e texto claro cruzados sobre um verde médio chegariam perto de 1:1 no meio do caminho; com a troca na metade, o pior momento fica perto de 3:1.
- **Balão**: entra em 140 ms, com opacidade e 3px de deslocamento, e sai sem animação.
- **`prefers-reduced-motion`**: sem transição nenhuma. A regra global de `base.css` zera a dos elementos; o chevron do bloco de remoção longa, que é pseudo-elemento e escapa do `*`, tem regra própria.

**Página Novidades** (`novidades.html`, corpo em `novidades/pagina.js`): canvas aberto na coluna de 840px, sem cartões. No topo fica "Para você", a lista que o cliente monta com as páginas que este leitor ainda não leu. Abaixo vem a linha do tempo, dia a dia, com uma régua de 1px abrindo cada dia. As três vozes seguem §1.2: o assunto do commit é narrativa; hora, hash, prefixo do Conventional Commits e identificador de tarefa são fato, em mono; o resto é chrome. O selo de página nova ou removida usa o próprio preenchimento do marca-texto; "alterada", o caso comum, fica neutra, para a cor continuar sendo exceção. Transições de tarefa usam as pílulas `.status-*`, que no tema claro voltam aos tokens de status.

### 5.11. Referências cruzadas (citação, prévia e volta)
Os documentos do Frila se citam por identificador o tempo todo: RN25, RF01, UC08, US07, T-0011, D6. No site, toda citação de um identificador que alguém define vira link para a definição, e todo wikilink do vault, inclusive `[[Nota#Seção]]` e `[[#Seção]]`, leva à seção certa. O build decide o que liga (`scripts/referencias/indice.js`); o navegador cuida da prévia e da volta (`referencias/cliente.js`, publicado como `referencias.js`); o CSS vive em `estilo/referencias.css`.

```html
<p>A conta é criada como em <a class="ref" href="#ref-rf01" data-ref="RF1">RF01</a>, com o perfil de contratante (<a class="ref" href="#ref-rn25" data-ref="RN25">RN25</a>).</p>
```

**Onde mora a definição**: uma linha de tabela cuja primeira célula é só o identificador (`| RN25 | Cada conta DEVE… |`) ou um título que começa por ele (`#### US07: Notificação…`). A tarefa `T-0011` é a própria página da tarefa. Citação no meio de uma frase nunca é definição. Quando duas páginas definem o mesmo identificador (o Requisitos define RN21 e a Modelagem repete RN21 para dizer como o banco a garante), vale a **casa da família**, a página que define mais identificadores dela. `RF01` e `RF1`, `D07` e `D7` são o mesmo. A linha que define ganha `id="ref-rn25"`, e o link de uma página para ela mesma fica só no `#`, sem recarregar.

**O que não vira link**: citação dentro de título, cabeçalho de tabela, código, link ou trecho que o "O que há de novo" ignora; a célula que define o próprio identificador; identificador que ninguém define (`UTF-8`, `B15`). As hipóteses `H1` a `H8` do Roteiro ficam de fora de propósito: nas revisões de design, "H1" é o nível de título. Ligar não muda uma letra do texto, e por isso não acende novidade.

**Anatomia**:
- **Citação** (`a.ref`): mesma cor e peso do texto em volta; o que diz que é link é o sublinhado pontilhado no acento a 55%, e o cursor. No hover e no foco vira link inteiro, no acento, com sublinhado sólido. Numa página de requisitos com 200 citações, 200 links azuis seriam ruído; o pontilhado deixa o texto ler como texto.
- **Prévia** (`#ref-previa`): parar o ponteiro 350 ms sobre um link (80 ms, se outra prévia acabou de fechar) mostra o que ele cita sem sair da página. Uma superfície que flutua abaixo do link, ou acima quando não cabe: `--superficie`, borda de 1px, raio de 12px e sombra curta. A linha de cima traz o identificador em mono e onde ele mora ("Documento de Requisitos", ou "Nesta página" e a seção), separados pelo `.cbl-ponto-sep`. Depois vêm o título, se a definição tem um, o texto na voz de leitura (cortado em sete linhas) e, sob um fio de 1px, os detalhes curtos da linha da tabela com o título da coluna: prioridade, ator, requisitos ligados, responsável. Wikilinks para outro documento mostram o grupo, o título e o lead dele; para uma seção, o título e o primeiro parágrafo. A prévia acompanha o link quando a página rola e some quando ele sai da tela. Enquanto está aberta, a página de destino já vem para o cache.
- **Folha do toque** (`.ref-previa--folha`): no celular não existe "passar por cima". A primeira batida numa citação abre a mesma prévia presa ao pé da tela, ao alcance do polegar, com "Abrir RN25" (acento, 44px de alvo) e "Fechar". A segunda batida no mesmo link segue o link, e tocar fora fecha a folha. Wikilink para documento segue direto na primeira batida: ali quem toca quer ir.
- **Pílula de volta** (`.ref-volta`): quem segue um link dentro do conteúdo ganha, no destino, "Voltar para Documento de Requisitos" (ou "Voltar para onde você estava", no mesmo documento). A pílula fica no pé da tela, com o mesmo lugar e a mesma forma do aviso de conteúdo novo, e sobe quando ele aparece. A volta leva ao ponto exato de onde o leitor saiu: o link seguido fica na mesma altura da tela em que estava, e pisca uma vez. Saltos encadeados voltam um a um. O botão Voltar do navegador faz o mesmo que a pílula, que só o deixa à vista, e o × dispensa. Sumários (`.cbl-nav-ancoras`) e chips do resumo não criam volta.
- **Chegada**: o destino de um salto pisca uma vez no acento a 16% (22% no escuro): a linha de tabela pinta as células, e o título ganha um halo de 6px que não empurra o texto. Enquanto a página se arruma (fontes, a linha de resumo do "O que há de novo" abrindo acima), o destino fica preso no lugar por até 2,5 s, e solta no primeiro gesto de quem lê.

**Movimento**: a prévia entra em 140 ms, com opacidade e 3px de deslocamento, e a pílula em 180 ms, com 8px. O piscar dura 1,6 s: segura a cor por um terço e esmaece. Com `prefers-reduced-motion`, nada anima. O destaque fica parado enquanto dura e some de uma vez.

**Acessibilidade**: a prévia abre também pelo foco do teclado (`:focus-visible`), liga `aria-describedby` no link e fecha com Esc. A folha é um `role="dialog"` que recebe o foco e o devolve ao link ao fechar. A pílula é feita de dois `<button>` com o anel de foco padrão. Tudo é camada: sem JavaScript, as citações continuam links comuns.

---

## 6. Navegação, Header e Modo Zen (Distraction-Free)

### 6.1. Header / HUD Superior Minimalista
- **Altura**: `44px` fixo, sticky no topo com `backdrop-filter: blur(16px)`.
- **Marca**: Ícone discreto (15×15px) acompanhado de `Challenge 18`. Sem subtítulos redundantes.
- **Celular (até 640px)**: a marca fica só com o ícone, as abas encolhem, e se ainda faltar espaço quem rola é a faixa das abas, nunca a página. Página mais larga que a tela desloca tudo que é `position: fixed` (o aviso de conteúdo novo, a prévia e a pílula de volta).
- **Botão de Alternância de Tema**: Botão compacto quadrado de 28×28px (`.btn-tema`), raio de 6px, com ícones SVG centralizados de Sol e Lua, sem rótulo de texto para economizar espaço horizontal.
- **Indicador de Status**: Ponto pulsante verde suave (`status-pulsar`, animação de pulsação radial de 2s) acompanhado de `Live`.

### 6.2. Barra Lateral (Sidebar) e Árvore Colapsável
- **Posicionamento**: Recuada para a margem esquerda com espaçamento uniforme (`width: 220px`).
- **Chevrons de Grupo**: Ícone vetorial proporcional desenhado em matriz 16×16px (`viewBox="0 0 16 16"` com path `m6 4 4 4-4 4"`), rotacionando de 0° (fechado, apontando para a direita `›`) a 90° (aberto, apontando para baixo `⌄`) com transição de `180ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Linha de Recuo Indentada**: A lista interna de cada grupo colapsável possui um traço sutil à esquerda (`border-left: 1px solid rgba(255, 255, 255, 0.08)` no escuro / `rgba(0, 0, 0, 0.08)` no claro) que guia visualmente a hierarquia.
- **Itens de Navegação**: Raio de 5px, padding vertical compacto (5px 8px), estado ativo com destaque translúcido sem borda saturada.
- **Escopo da Barra**: Lista apenas **Produto** e **Arquitetura** (seções com `naBarra` em `SECOES`, no `gerar-site.js`). Planejamento, Diário, Design e as notas de `foraDaBarra` (Leia Primeiro e README do Produto) continuam publicados e acessíveis pelo endereço, mas sem entrada na barra.
- **Estado Inicial dos Grupos**: Todo grupo nasce fechado; só o grupo que contém a página atual chega aberto, com o link ativo marcado por `aria-current="page"`. O estado é resolvido no build, sem persistência por grupo: abrir ou fechar um grupo vale só para aquela página. Só o recolhimento da barra inteira (⌘B) fica guardado entre páginas.
- **Item Novidades**: Primeiro item da barra, acima dos grupos, com o mesmo desenho dos itens e o link para `novidades.html` (`a.sidebar-novidades`). Na ponta direita fica a contagem (`.nov-contagem`): o número de páginas com novidade que este leitor ainda não leu, em número puro, sem cápsula, no acento, com algarismos tabulares. Sem novidade, a contagem some.
- **Ponto de não lido**: Um círculo geométrico de 6px em `var(--acento)`, o "não lido" da Apple, nunca um glifo (o `•` muda de altura de uma fonte para outra). O cliente só liga o atributo `data-novidade`, e o desenho é do CSS. O ponto aparece em quatro lugares:
  - na ponta direita do item da barra, alinhado com a contagem;
  - no grupo, só enquanto ele está fechado (aberto, quem mostra o ponto são os itens);
  - nas âncoras de seção (`.cbl-link-ancora`), depois do rótulo, quando a seção tem marcas não lidas;
  - no "Desafio" do topo, dentro do respiro à direita do rótulo, sem empurrar os vizinhos.

  O ponto some quando as marcas daquela página ou seção são lidas.

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
- [ ] **Referências Ligadas**: Identificadores novos (RN, RF, US, UC, D…) estão definidos numa linha de tabela ou num título que começa por eles, para as citações virarem link (§5.11)?

