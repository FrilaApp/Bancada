// Extração de blocos do HTML gerado, no build (`novidades/html.js`).
//
// O build calcula o hash de cada página a partir destes blocos, e o cliente
// faz a mesma extração sobre o DOM. Os casos abaixo seguem as regras do
// núcleo (`REGRAS`) e as armadilhas do HTML que o site gera de verdade.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/html.test.js

const { test } = require('node:test');
const assert = require('node:assert');
const { blocosDeHtml } = require('../novidades/html');
const N = require('../novidades/nucleo');
const { renderizar } = require('../markdown');
const { renderizarDocumentoCBL } = require('../cbl-documento');
const dadosCBL = require('../cbl-dados.json');

// Um pedaço de nota com cada coisa que o vault escreve: título numerado,
// travessão, prefixo de evidência, lista com link, código e tarefa, callout,
// tabela, bloco de código e imagem embutida no meio da frase.
const NOTA = [
  '## 1. Visão Geral',
  '',
  'O **Frila** fecha turnos avulsos no DF — sem comissão do profissional.',
  '',
  '**Dado:** 90% dos donos de bar relatam falta de pessoal.',
  '',
  '- Item com [link](https://exemplo.com) e `código`',
  '- [ ] tarefa aberta',
  '- [x] tarefa feita',
  '',
  '> [!note] Atenção',
  '> O check-in usa a *geolocalização* a 200 m.',
  '',
  '| Regra | Descrição |',
  '|---|---|',
  '| RN01 | Remuneração **integral** |',
  '| RN23 | 1 push a cada 30 min |',
  '',
  '```swift',
  'let x = 1 < 2',
  '```',
  '',
  'Veja ![[wireframes/tela.png|Tela de vagas]] no protótipo.',
].join('\n');

test('blocosDeHtml faz um bloco por parágrafo e por item, sem partir no negrito', () => {
  assert.deepStrictEqual(
    blocosDeHtml('<p>O <strong>Frila</strong> fecha <em>turnos</em>.</p>\n<ul><li>um</li><li>dois</li></ul>'),
    ['O Frila fecha turnos.', 'um', 'dois'],
  );
});

test('blocosDeHtml pula comentários, doctype e instruções, e lê atributo com ">" entre aspas', () => {
  assert.deepStrictEqual(
    blocosDeHtml([
      '<!DOCTYPE html><!-- <p>comentário</p> -->',
      '<P CLASS="x">a<!---->b<!-- x -- y -->c<!-->d</P>',
      `<p title="a > b" data-x='<p>' hidden>depois</p>`,
      '<?xml versao="1"?><p>fim</p>',
    ].join('')),
    ['abcd', 'depois', 'fim'],
  );
});

/** Uma página publicada em volta de um artigo, com tudo o que fica fora da raiz. */
const paginaCom = (artigo) => [
  '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Requisitos — Bancada</title>',
  '<script type="application/json" id="nov-manifesto">{"v":1,"titulo":"</p><p>não é texto"}</script></head>',
  '<body><header><nav><a href="../index.html" data-chave="documento-cbl">Desafio</a></nav></header>',
  '<div class="layout"><aside><a href="novidades.html">Novidades</a><details class="grupo"><summary>Produto</summary>',
  '<a href="x.html">Requisitos</a></details></aside><main>',
  artigo,
  '</main></div><footer><p>Bancada, gerado em 24/09</p></footer></body></html>',
].join('\n');

test('blocosDeHtml acha a raiz sozinho: página inteira e artigo solto dão os mesmos blocos', () => {
  const artigo = [
    '<article class="cbl-documento pagina-conteudo-centralizado" data-novidades-raiz data-novidades-chave="notas/x">',
    '<header class="cbl-masthead-doc"><h1 class="cbl-masthead-titulo">Requisitos</h1></header>',
    '<div class="narrativa"><p>Corpo do texto.</p></div>',
    '</article>',
  ].join('\n');
  const esperado = ['Requisitos', 'Corpo do texto.'];
  assert.deepStrictEqual(blocosDeHtml(artigo), esperado);
  assert.deepStrictEqual(blocosDeHtml(paginaCom(artigo)), esperado);
  // O documento base vem embrulhado num div com a chave.
  const base = `<div data-novidades-base data-novidades-chave="notas/x" data-novidades-em="2026-09-17T12:00:00Z">${artigo}</div>`;
  assert.deepStrictEqual(blocosDeHtml(base), esperado);
});

test('blocosDeHtml usa article.cbl-documento quando falta a raiz (módulo CBL antigo)', () => {
  const antigo = '<article class="cbl-documento" id="cbl-documento-oficial"><h1>Documento Oficial CBL</h1><p>Texto.</p></article>';
  assert.deepStrictEqual(blocosDeHtml(paginaCom(antigo)), ['Documento Oficial CBL', 'Texto.']);
  // A raiz marcada ganha do fallback, mesmo vindo depois.
  const dois = `${antigo}<article class="cbl-documento" data-novidades-raiz><p>Este.</p></article>`;
  assert.deepStrictEqual(blocosDeHtml(dois), ['Este.']);
});

test('blocosDeHtml deixa de fora as regiões ignoradas, com tudo o que têm dentro', () => {
  const html = `<article data-novidades-raiz data-novidades-chave="notas/x">
    <header class="cbl-masthead-doc">
      <div class="cbl-masthead-eyebrow" data-novidades="ignorar"><span>Produto</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span>Requisitos</span></div>
      <h1 class="cbl-masthead-titulo">Título</h1>
      <p class="nov-resumo" data-nov-resumo data-novidades="ignorar" hidden>Desde sua visita: 3 acréscimos</p>
      <div class="cbl-colofao" data-novidades="ignorar"><div class="cbl-colofao-item"><span>Equipe</span><div>Cauê Carneiro, Fabrício Tosta</div></div></div>
      <nav class="cbl-nav-ancoras" data-novidades="ignorar"><span class="cbl-nav-legenda">Seções</span><a href="#a">01 Visão</a></nav>
    </header>
    <p>Leia o <a href="x.html">documento <span class="cbl-seta" aria-hidden="true">↗</span></a> antes.</p>
    <p>Frila<span class="cbl-ponto-sep" aria-hidden="true"></span> Challenge</p>
    <p><mark class="nov nov--acrescimo">texto novo<span class="nov-sr"> (novo)</span></mark> e <del class="nov nov--remocao">texto velho</del>fim.</p>
    <details class="nov-removido"><summary>Trecho removido</summary><p>antigo</p></details>
    <p>Com <button type="button">Copiar</button>botão, <svg viewBox="0 0 1 1"><path d="M0 0"/><text>rótulo</text></svg>ícone e <template><p>modelo</p></template>modelo.</p>
    <script>var x = 1;</script><style>p { color: red }</style><noscript><p>sem js</p></noscript>
    <div class="cbl-colofao">Colofão antigo, sem atributo</div>
    <nav class="cbl-nav-ancoras"><a href="#b">Âncora antiga</a></nav>
    <div class="cbl-masthead-eyebrow">Eyebrow antigo</div>
    <p>Depois.</p>
  </article>`;
  assert.deepStrictEqual(blocosDeHtml(html), [
    'Título',
    'Leia o documento antes.',
    'Frila Challenge',
    'texto novo e fim.',
    'Com botão, ícone e modelo.',
    'Depois.',
  ]);
});

test('blocosDeHtml lê a linha da tabela como um bloco, com as células separadas', () => {
  // Como o markdown.js escreve a tabela: sem espaço nenhum entre as células.
  const tabela = [
    '<div class="rolagem cbl-tabela-container"><table class="cbl-tabela-aberta">',
    '<thead><tr><th>Regra</th><th>Descrição</th></tr></thead>',
    '<tbody><tr><td>RN01</td><td>Remuneração <strong>integral</strong></td></tr>',
    '<tr><td>RN22</td><td>Check-in a 200m</td></tr></tbody></table></div>',
  ].join('');
  assert.deepStrictEqual(blocosDeHtml(tabela), ['Regra Descrição', 'RN01 Remuneração integral', 'RN22 Check-in a 200m']);
  // Como o cbl-documento.js escreve: blocos dentro da célula continuam blocos.
  const perguntas = '<table><tr><td><div><strong>Pergunta?</strong></div><div>Resposta.</div></td><td><a href="#">Fonte</a></td></tr></table>';
  assert.deepStrictEqual(blocosDeHtml(perguntas), ['Pergunta?', 'Resposta.', 'Fonte']);
});

test('blocosDeHtml trata <br> como espaço entre palavras, sem partir o parágrafo', () => {
  assert.deepStrictEqual(blocosDeHtml('<p>linha um<br>linha dois<BR/>três</p>'), ['linha um linha dois três']);
});

test('blocosDeHtml não lê tags dentro de script, style e textarea', () => {
  const html = `<article data-novidades-raiz>
    <div data-novidades="ignorar"><script>var s = "</div><p>falso</p>";</script>segredo</div>
    <p>visível</p>
    <style>p::after { content: "</p><p>estilo" }</style>
    <textarea><p>não é tag</p></textarea>
    <SCRIPT type="application/json">{"x": "</article><p>fora</p>"}</SCRIPT >
    <p>fim</p>
  </article>`;
  assert.deepStrictEqual(blocosDeHtml(html), ['visível', 'fim']);
});

test('blocosDeHtml: figure dentro de p, como o markdown.js escreve a imagem embutida', () => {
  const html = renderizar('Veja a tela ![[wireframes/tela.png|Tela de vagas]] e depois siga.\n\nOutro parágrafo.');
  assert.match(html, /<p>Veja a tela <figure/); // a forma que o navegador corrige
  assert.deepStrictEqual(blocosDeHtml(html), ['Veja a tela', 'Tela de vagas', 'e depois siga.', 'Outro parágrafo.']);
});

test('blocosDeHtml fecha p, li, dt e dd sozinho, como o navegador, também nas regiões ignoradas', () => {
  // O <figure> fecha o <p> ignorado: a legenda e o resto ficam fora dele.
  assert.deepStrictEqual(
    blocosDeHtml('<p data-novidades="ignorar">oculto <figure><figcaption>legenda</figcaption></figure> solto</p>'),
    ['legenda', 'solto'],
  );
  // Um <li> ou <dd> novo fecha o anterior, que não leva o seguinte junto.
  assert.deepStrictEqual(blocosDeHtml('<ul><li aria-hidden="true">x<li>y</ul><dl><dt class="nov-sr">t<dd>d</dl>'), ['y', 'd']);
});

test('blocosDeHtml: tags vazias não abrem nada; <hr> separa blocos e <wbr> não', () => {
  assert.deepStrictEqual(
    blocosDeHtml('<p>a<img src="x.png" alt="imagem">b<input value="v">c<hr>d</p><p>pala<wbr>vra<meta name="x"></p>'),
    ['abc', 'd', 'palavra'],
  );
});

test('fixture real do markdown.js: um bloco por coisa que o leitor vê', () => {
  assert.deepStrictEqual(blocosDeHtml(renderizar(NOTA)), [
    '1. Visão Geral',
    'O Frila fecha turnos avulsos no DF — sem comissão do profissional.',
    // O prefixo de evidência vira um selo e perde os dois-pontos.
    'Dado 90% dos donos de bar relatam falta de pessoal.',
    'Item com link e código',
    'tarefa aberta',
    // O ✓ da caixa vem colado no texto, como no DOM.
    '✓tarefa feita',
    'Atenção',
    'O check-in usa a geolocalização a 200 m.',
    'Regra Descrição',
    'RN01 Remuneração integral',
    'RN23 1 push a cada 30 min',
    'let x = 1 < 2',
    'Veja',
    'Tela de vagas',
    'no protótipo.',
  ]);
});

test('fixture real do cbl-documento.js: conteúdo dentro, masthead de metadados fora', () => {
  const html = renderizarDocumentoCBL('');
  const blocos = blocosDeHtml(html);
  assert.strictEqual(blocos[0], 'Documento Oficial CBL — Challenge 18');
  // Fora: eyebrow, colofão, nav de âncoras e as setas decorativas.
  for (const fora of ['Documento Oficial', 'Apple Developer Academy', 'Equipe BlendOps', 'Mentores', 'Seções']) {
    assert.ok(!blocos.includes(fora), fora);
  }
  assert.ok(!blocos.some((b) => /Felipe Carvalho|FigJam C18|[↗→]/.test(b)));
  // Dentro: cada pergunta essencial é um bloco, e a linha de cabeçalho da rubrica também.
  for (const q of dadosCBL.essentialQuestions) assert.ok(blocos.includes(N.normalizar(q)), q);
  assert.ok(blocos.includes('Nível Critério de Evidência & Domínio'));
  for (const b of blocos) {
    assert.doesNotMatch(b, /<\/?[a-z][a-z0-9]*[\s>]/, b);
    // Entidade só sobra como texto quando o HTML a escapou duas vezes, e aí o
    // navegador também a mostra assim (o cbl-dados.json já traz "&amp;").
    for (const entidade of b.match(/&[a-z#0-9]+;/gi) || []) {
      assert.ok(html.includes(`&amp;${entidade.slice(1)}`), `${entidade} em "${b}"`);
    }
    assert.strictEqual(N.normalizar(b), b);
  }
  // O módulo antigo não tem os atributos: o fallback por classe dá os mesmos blocos.
  const antigo = html
    .replace(/\s(data-novidades-raiz|data-novidades-chave="[^"]*"|data-novidades="ignorar")/g, '')
    .replace(/<p class="nov-resumo"[^>]*><\/p>/, '');
  assert.doesNotMatch(antigo, /data-nov/);
  assert.deepStrictEqual(blocosDeHtml(paginaCom(antigo)), blocos);
});

test('ponta a ponta com o markdown.js: correção numa célula e linha nova na tabela', () => {
  const depois = NOTA
    .replace('Remuneração **integral**', 'Remuneração **cheia**')
    .replace('| RN23 | 1 push a cada 30 min |', '| RN22 | Check-in a 200 m do local |\n| RN23 | 1 push a cada 30 min |');
  const antigos = blocosDeHtml(renderizar(NOTA));
  const novos = blocosDeHtml(renderizar(depois));
  const { hunks } = N.diffBlocos(antigos, novos);
  assert.deepStrictEqual(
    hunks.map((h) => [h.categoria, h.novos.map((n) => novos[n.bloco].slice(n.ini, n.fim)).join(' | '), h.antigoTexto]),
    [['correcao', 'cheia', 'integral'], ['acrescimo', 'RN22 Check-in a 200 m do local', '']],
  );
});

test('blocosDeHtml decodifica as entidades uma vez só, como o navegador', () => {
  assert.deepStrictEqual(
    blocosDeHtml([
      '<p>um turno<span class="cbl-travessao">&thinsp;—&thinsp;</span>função</p>',
      '<p>d&#39;água &quot;ok&quot; &#x2014; &copy; 2026&hellip;</p>',
      // O markdown escapa o & do vault: `&amp;nbsp;` é o texto "&nbsp;" na página.
      '<p>escrito &amp;nbsp; e &lt;br&gt; no vault</p>',
      // & solto não é entidade.
      '<p>Design & Experiência, R&D</p>',
      // Referência numérica da faixa C1 segue o Windows-1252: &#150; é a meia-risca.
      '<p>10&#150;20</p>',
    ].join('')),
    ["um turno — função", `d'água "ok" — © 2026…`, 'escrito &nbsp; e <br> no vault', 'Design & Experiência, R&D', '10—20'],
  );
});
