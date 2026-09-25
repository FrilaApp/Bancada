// Página Novidades: `paginaNovidades(linhaDoTempo)` em `novidades/pagina.js`.
//
// A função é pura, então o teste compara texto: a mesma linha do tempo tem de
// dar o mesmo HTML, com cada valor vindo do git escapado, e com os ganchos
// que o cliente usa no navegador (`data-em`, `data-dia`, "Para você").
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/pagina.test.js

const { test } = require('node:test');
const assert = require('node:assert');
const { paginaNovidades } = require('../novidades/pagina');

/** A forma que `historico.js` entrega, com um dia, um merge e uma remoção. */
function linhaDoTempo() {
  return {
    dias: [
      {
        data: '2026-09-24',
        rotulo: '24 de setembro',
        diario: 'notas/02-atualizacoes-diarias-2026-09-2026-09-24.html',
        entradas: [
          {
            sha: '0f064f9',
            quando: '2026-09-24T18:52:10.000Z',
            hora: '15:52',
            autores: ['Cauê Carneiro', 'Júlia Clovandi'],
            assunto: 'refactor(site): enxugar barra lateral e abrir só a pasta da página atual',
            merge: false,
            paginas: [
              { chave: 'notas/escopo', titulo: 'Frila · Escopo do MVP', href: 'notas/escopo.html', tipo: 'alterada' },
              { chave: 'notas/pendencias', titulo: 'Pendências Técnicas', href: 'notas/pendencias.html', tipo: 'nova' },
              { chave: 'notas/readme', titulo: 'Frila (README)', href: null, tipo: 'removida' },
            ],
            transicoes: [
              { id: 'T-0011', de: 'em-andamento', para: 'revisao' },
              { id: 'T-0014', de: null, para: 'a-fazer' },
            ],
          },
          {
            sha: '7e3a585',
            quando: '2026-09-24T14:10:00.000Z',
            hora: '11:10',
            autores: ['Fabrício Tosta', 'Júlia Clovandi'],
            assunto: '3 commits de Fabrício Tosta, Júlia Clovandi',
            merge: true,
            paginas: [],
            transicoes: [{ id: 'T-0013', de: 'revisao', para: 'concluida' }],
          },
        ],
      },
      {
        data: '2026-09-22',
        rotulo: '22 de setembro',
        diario: null,
        entradas: [
          {
            sha: 'b0e7b31',
            quando: '2026-09-22T15:05:00.000Z',
            hora: '12:05',
            autores: ['Matheus Silva'],
            assunto: 'Anota o bundle ID com.frila.org.app nas Pendências Técnicas Para Codar',
            merge: false,
            paginas: [],
            transicoes: [],
          },
        ],
      },
    ],
  };
}

/** Todos os `<li class="nov-entrada" …>` com seus atributos. */
const entradas = (html) => [...html.matchAll(/<li class="nov-entrada"([^>]*)>([\s\S]*?)<\/li>\s*(?=<li class="nov-entrada"|<\/ol>)/g)];

test('abre com o masthead da página e a janela de dias no eyebrow', () => {
  const html = paginaNovidades(linhaDoTempo());
  assert.match(html, /^<article class="cbl-documento pagina-novidades">/);
  assert.match(html, /<h1 class="cbl-masthead-titulo">Novidades<\/h1>/);
  assert.match(html, /<span class="cbl-eyebrow-item">Últimos 14 dias<\/span>/);
  assert.match(paginaNovidades(linhaDoTempo(), { janelaDias: 30 }), /Últimos 30 dias/);
});

test('"Para você" sai vazia e escondida, para o cliente preencher', () => {
  const html = paginaNovidades(linhaDoTempo());
  assert.match(html, /<section class="nov-para-voce" data-nov-para-voce hidden aria-labelledby="nov-para-voce-titulo">/);
  assert.match(html, /<ul class="nov-paginas" data-nov-para-voce-lista><\/ul>/);
});

test('cada entrada leva data-em com o instante ISO, e a hora em mono', () => {
  const html = paginaNovidades(linhaDoTempo());
  const lista = entradas(html);
  assert.strictEqual(lista.length, 3);
  assert.deepStrictEqual(
    lista.map(([, atributos]) => atributos.match(/data-em="([^"]*)"/)[1]),
    ['2026-09-24T18:52:10.000Z', '2026-09-24T14:10:00.000Z', '2026-09-22T15:05:00.000Z']
  );
  assert.match(lista[0][2], /<time class="nov-hora" datetime="2026-09-24T18:52:10.000Z">15:52<\/time>/);
});

test('o dia leva data-dia e o rótulo absoluto; o relativo fica para o cliente', () => {
  const html = paginaNovidades(linhaDoTempo());
  assert.match(html, /<section class="nov-dia" data-dia="2026-09-24" aria-labelledby="nov-dia-2026-09-24">/);
  assert.match(html, /<span class="nov-dia-relativo" hidden><\/span> <time class="nov-dia-data" datetime="2026-09-24">24 de setembro<\/time>/);
  assert.ok(!/Hoje|Ontem/.test(html), 'a página estática não escreve "Hoje" nem "Ontem"');
});

test('o diário do dia vira link só quando existe', () => {
  const html = paginaNovidades(linhaDoTempo());
  assert.match(html, /<a class="nov-dia-diario" href="notas\/02-atualizacoes-diarias-2026-09-2026-09-24\.html">Diário do dia<svg/);
  assert.strictEqual((html.match(/class="nov-dia-diario"/g) || []).length, 1);
});

test('três vozes: prefixo convencional e hash em mono, autores por vírgula', () => {
  const [primeira] = entradas(paginaNovidades(linhaDoTempo()));
  const corpo = primeira[2];
  assert.match(corpo, /<p class="nov-assunto"><code class="nov-assunto-tipo">refactor\(site\)<\/code>enxugar barra lateral/);
  assert.match(corpo, /<span class="nov-autor">Cauê Carneiro, Júlia Clovandi<\/span><span class="cbl-ponto-sep" aria-hidden="true"><\/span><code class="nov-sha">0f064f9<\/code>/);
});

test('nada de ponto médio literal nem de emoji no HTML', () => {
  const html = paginaNovidades(linhaDoTempo());
  const semTitulos = html.replace(/Frila · Escopo do MVP/g, '');
  assert.ok(!semTitulos.includes('·'), 'ponto médio literal fora de um título vindo do vault');
  assert.ok(!/\p{Extended_Pictographic}/u.test(html), 'emoji no HTML');
});

test('selo por tipo de página; página removida não vira link', () => {
  const [primeira] = entradas(paginaNovidades(linhaDoTempo()));
  const corpo = primeira[2];
  assert.match(corpo, /<span class="nov-tipo nov-tipo--alterada">Alterada<\/span><a href="notas\/escopo\.html">Frila · Escopo do MVP<\/a>/);
  assert.match(corpo, /<span class="nov-tipo nov-tipo--nova">Nova<\/span><a href="notas\/pendencias\.html">Pendências Técnicas<\/a>/);
  assert.match(corpo, /<span class="nov-tipo nov-tipo--removida">Removida<\/span><span class="nov-pagina-titulo">Frila \(README\)<\/span>/);
});

test('tipo desconhecido cai em alterada, e página sem título usa a chave', () => {
  const linha = linhaDoTempo();
  linha.dias[0].entradas[0].paginas = [{ chave: 'notas/x', titulo: null, href: 'notas/x.html', tipo: 'renomeada' }];
  const html = paginaNovidades(linha);
  assert.match(html, /<span class="nov-tipo nov-tipo--alterada">Alterada<\/span><a href="notas\/x\.html">notas\/x<\/a>/);
});

test('transição de status usa as pílulas .status-* e fala "para" ao leitor de tela', () => {
  const html = paginaNovidades(linhaDoTempo());
  assert.match(html, /<code class="nov-transicao-id">T-0011<\/code><span class="etiqueta status-em-andamento"><span class="status-ponto" aria-hidden="true"><\/span>Em andamento<\/span><svg class="nov-transicao-seta"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span class="nov-sr">para<\/span><span class="etiqueta status-revisao">/);
  assert.match(html, /<code class="nov-transicao-id">T-0014<\/code><span class="nov-transicao-rotulo">entrou em<\/span><span class="etiqueta status-a-fazer">/);
});

test('merge: sem repetir os autores que o assunto já diz', () => {
  const [, fusao] = entradas(paginaNovidades(linhaDoTempo()));
  assert.match(fusao[2], /<p class="nov-assunto">3 commits de Fabrício Tosta, Júlia Clovandi<\/p>/);
  assert.match(fusao[2], /<div class="nov-entrada-meta"><span class="nov-fusao">Fusão no main<\/span><span class="cbl-ponto-sep" aria-hidden="true"><\/span><code class="nov-sha">7e3a585<\/code><\/div>/);
  assert.ok(!fusao[2].includes('nov-autor'));
});

test('tudo que vem do git é escapado, em texto e em atributo', () => {
  const ataque = '"><script>alert(1)</script>';
  const linha = linhaDoTempo();
  const e = linha.dias[0].entradas[0];
  e.assunto = `fix: ${ataque}`;
  e.autores = [ataque];
  e.quando = ataque;
  e.hora = ataque;
  e.sha = ataque;
  e.paginas = [{ chave: 'x', titulo: ataque, href: `x.html${ataque}`, tipo: 'nova' }];
  e.transicoes = [{ id: ataque, de: ataque, para: 'revisao' }];
  linha.dias[0].diario = `d.html${ataque}`;
  linha.dias[0].rotulo = ataque;
  const html = paginaNovidades(linha);
  const escapado = '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;';
  assert.ok(!html.includes('<script'), 'tag <script> crua no HTML');
  assert.ok(html.includes(`data-em="${escapado}"`), 'data-em escapado');
  assert.ok(html.includes(`<a href="x.html${escapado}">${escapado}</a>`), 'href e título escapados');
  assert.ok(html.includes(`<a class="nov-dia-diario" href="d.html${escapado}">`), 'link do diário escapado');
  assert.ok(html.includes(`<span class="nov-autor">${escapado}</span>`), 'autor escapado');
  // Status desconhecido vira rótulo, nunca classe.
  for (const [, classe] of html.matchAll(/class="etiqueta status-([^"]*)"/g)) {
    assert.match(classe, /^[a-z0-9-]+$/, `classe de status suja: ${classe}`);
  }
  assert.match(html, /<span class="etiqueta"><span class="status-ponto" aria-hidden="true"><\/span>&quot;&gt;&lt;script&gt;/);
});

test('sem mudanças na janela: estado vazio, sem dias', () => {
  const html = paginaNovidades({ dias: [] });
  assert.match(html, /<p class="nov-vazio-titulo">Nada mudou nos últimos 14 dias\.<\/p>/);
  assert.ok(!html.includes('class="nov-dia"'));
  assert.match(paginaNovidades({ dias: [] }, { janelaDias: 7 }), /Nada mudou nos últimos 7 dias\./);
});

test('dia sem entradas não aparece; se nenhum sobra, vale o estado vazio', () => {
  const html = paginaNovidades({ dias: [{ data: '2026-09-23', rotulo: '23 de setembro', diario: null, entradas: [] }] });
  assert.ok(!html.includes('data-dia="2026-09-23"'));
  assert.match(html, /Nada mudou nos últimos 14 dias\./);
});

test('sem histórico do git (null): a página diz que a linha do tempo não veio', () => {
  for (const entrada of [null, undefined, {}]) {
    const html = paginaNovidades(entrada);
    assert.match(html, /<p class="nov-vazio-titulo">A linha do tempo não está disponível nesta publicação\.<\/p>/);
    assert.match(html, /<h1 class="cbl-masthead-titulo">Novidades<\/h1>/);
  }
});

test('é pura: não altera a entrada e repete a saída', () => {
  const congelar = (o) => {
    Object.values(o).forEach((v) => v && typeof v === 'object' && congelar(v));
    return Object.freeze(o);
  };
  const linha = congelar(linhaDoTempo());
  const a = paginaNovidades(linha);
  const b = paginaNovidades(linha);
  assert.strictEqual(a, b);
});
