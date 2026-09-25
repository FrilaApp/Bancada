// A história que o build entrega ao "O que há de novo": o hash de cada
// página (`h`), o da mesma página 7 dias atrás (`hb`), o HTML dessa base e a
// linha do tempo.
//
// De verdade, só o git e o hash (o do `nucleo.js` sobre os blocos do
// `html.js`). O resto é de mentira: um repositório descartável em
// `os.tmpdir()` com commits retroativos, um `bancada-indice` (um script Node
// que lista as notas do vault) e um `Site` com a mesma interface do
// `gerar-site.js`. Assim o teste roda antes de compilar o Swift, como os
// outros do gerador no CI.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/construir.test.js

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { construirNovidades } = require('../novidades/construir');

process.env.GIT_CONFIG_NOSYSTEM = '1';
process.env.GIT_CONFIG_GLOBAL = os.devNull;

const temporarios = [];
after(() => {
  for (const pasta of temporarios) fs.rmSync(pasta, { recursive: true, force: true });
});

function pastaTemporaria(prefixo) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), prefixo));
  temporarios.push(pasta);
  return pasta;
}

function git(raiz, args, env = {}) {
  return execFileSync('git', args, { cwd: raiz, env: { ...process.env, ...env }, encoding: 'utf8' });
}

function commitar(raiz, em, arquivos, mensagem = 'Atualiza o vault') {
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    const alvo = path.join(raiz, caminho);
    if (conteudo === null) {
      fs.rmSync(alvo);
    } else {
      fs.mkdirSync(path.dirname(alvo), { recursive: true });
      fs.writeFileSync(alvo, conteudo);
    }
  }
  git(raiz, ['add', '-A']);
  const quem = { GIT_AUTHOR_NAME: 'Cauê Carneiro', GIT_AUTHOR_EMAIL: 'cauecarneiroc@gmail.com' };
  git(raiz, ['-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', mensagem], {
    ...quem, GIT_COMMITTER_NAME: quem.GIT_AUTHOR_NAME, GIT_COMMITTER_EMAIL: quem.GIT_AUTHOR_EMAIL,
    GIT_AUTHOR_DATE: em, GIT_COMMITTER_DATE: em,
  });
  return git(raiz, ['rev-parse', 'HEAD']).trim();
}

function criarRepo() {
  const raiz = pastaTemporaria('bancada-construir-repo-');
  git(raiz, ['init', '-q', '-b', 'main']);
  return raiz;
}

/** Um `cbl-documento.js` de mentira: prosa no código, dados no JSON ao lado. */
function moduloCbl(prosa) {
  return `const fs = require('fs');
const path = require('path');
function renderizarDocumentoCBL(base = '../') {
  const dados = JSON.parse(fs.readFileSync(path.join(__dirname, 'cbl-dados.json'), 'utf8'));
  return '<article data-novidades-raiz data-novidades-chave="documento-cbl"><h1>CBL</h1><p>${prosa}</p><p>' + dados.bigIdea + '</p></article>';
}
module.exports = { renderizarDocumentoCBL };
`;
}
const dadosCbl = (bigIdea) => `${JSON.stringify({ bigIdea })}\n`;
const notaMd = (titulo, corpo, campos = 'tipo: documento-produto') => `---\n${campos}\n---\n\n# ${titulo}\n\n${corpo}\n`;

/**
 * O `bancada-indice` de mentira: `--indice <vault>` imprime as notas `.md`
 * do vault, como o binário de verdade, com título, campos do frontmatter e
 * corpo, e os campos de topo que o `Site` de verdade lê (este binário também
 * roda sob o `gerar-site.js`).
 */
function binarioDeMentira() {
  const pasta = pastaTemporaria('bancada-construir-bin-');
  const binario = path.join(pasta, 'bancada-indice');
  fs.writeFileSync(binario, `#!${process.execPath}
const fs = require('fs');
const path = require('path');
const [flag, vault] = process.argv.slice(2);
if (flag !== '--indice' || !fs.existsSync(vault)) { console.error('vault não existe: ' + vault); process.exit(2); }
const notas = [];
(function ler(pasta) {
  for (const e of fs.readdirSync(path.join(vault, pasta), { withFileTypes: true })) {
    const rel = pasta ? pasta + '/' + e.name : e.name;
    if (e.isDirectory()) ler(rel);
    else if (e.name.endsWith('.md')) {
      const bruto = fs.readFileSync(path.join(vault, rel), 'utf8');
      const fm = bruto.match(/^---\\n([\\s\\S]*?)\\n---\\n/);
      const campos = {};
      for (const linha of fm ? fm[1].split('\\n') : []) {
        const m = linha.match(/^(\\w+):\\s*(.*)$/);
        if (m) campos[m[1]] = m[2];
      }
      const texto = fm ? bruto.slice(fm[0].length) : bruto;
      const titulo = (texto.match(/^# (.+)$/m) || [, rel])[1];
      notas.push({
        caminho: rel, tipo: campos.tipo || 'documento-produto', titulo, campos,
        corpo: texto.replace(/^# .+$/m, '').trim(), tags: [], rotuloDoTipo: '', somenteLeitura: false,
      });
    }
  }
})('');
process.stdout.write(JSON.stringify({
  versaoDoFormato: 1, geradoEm: '2026-09-24T15:00:00Z', raiz: vault, fatos: [], fatosNaoReconhecidos: [],
  midias: [], arvoreDeRegistros: [], invalidas: [], templates: [], notas,
}));
`);
  fs.chmodSync(binario, 0o755);
  return binario;
}

/**
 * O `Site` de mentira, com a interface que o `construir` usa do de verdade:
 * o construtor de seis argumentos (com `opcoes.cbl`, e `null` omitindo o
 * documento CBL), `paginasDeDocumento()`, `arquivoDaNota()`, `chaveDoArquivo()`
 * e `ehDocumentoCBL()`. Como no de verdade, as `fontes` das notas saem de
 * `opcoes.vaultNoRepo`, o caminho do vault no repositório ('doc-harness' se
 * ninguém disser outro).
 */
class SiteDeMentira {
  constructor(indice, tokens, vault, destino, paginaUnica = false, opcoes = {}) {
    Object.assign(this, { indice, tokens, vault, destino, paginaUnica, opcoes });
    this.cbl = opcoes.cbl;
    this.vaultNoRepo = opcoes.vaultNoRepo === undefined ? 'doc-harness' : opcoes.vaultNoRepo;
  }

  arquivoDaNota(caminho) {
    const slug = caminho.replace(/\.md$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return `notas/${slug}.html`;
  }

  chaveDoArquivo(arquivo) {
    return arquivo === 'index.html' ? 'documento-cbl' : arquivo.replace(/\.html$/, '');
  }

  ehDocumentoCBL(nota) {
    const nome = path.basename(nota.caminho);
    return nome === 'C18.md' || nome === 'CBL_C18.md';
  }

  paginasDeDocumento() {
    const paginas = [];
    if (this.cbl) {
      paginas.push({
        chave: 'documento-cbl', hrefs: ['index.html'], arquivo: 'index.html', titulo: 'Documento Oficial CBL',
        conta: true, grupo: null, fontes: ['Bancada/scripts/cbl-dados.json'], conteudo: this.cbl.renderizarDocumentoCBL(''),
      });
    }
    for (const nota of this.indice.notas) {
      // Uma nota que o gerador de hoje não sabe mais ler.
      if (nota.corpo.includes('{{formato antigo}}')) throw new Error('nota no formato antigo');
      const arquivo = this.arquivoDaNota(nota.caminho);
      const chave = this.chaveDoArquivo(arquivo);
      paginas.push({
        chave, hrefs: [arquivo], arquivo, titulo: nota.titulo, conta: true, grupo: 'produto',
        fontes: [[this.vaultNoRepo, nota.caminho].filter(Boolean).join('/')],
        conteudo: `<article data-novidades-raiz data-novidades-chave="${chave}"><h1>${nota.titulo}</h1><p>${nota.corpo}</p></article>`,
      });
    }
    return paginas;
  }
}

/**
 * O site de agora: o índice do working tree e o `cbl-documento.js` de agora.
 * `vaultNoRepo` diz onde o vault fica no repositório; `cbl`, se vier, é o
 * módulo do CBL de fora do repositório, como o da Bancada quando o vault é
 * de outra pessoa.
 */
function siteAtual(raiz, binario, { vaultNoRepo = 'doc-harness', cbl } = {}) {
  const vault = path.join(raiz, vaultNoRepo);
  const indice = JSON.parse(execFileSync(binario, ['--indice', vault], { encoding: 'utf8' }));
  const modulo = path.join(raiz, 'Bancada/scripts/cbl-documento.js');
  if (cbl === undefined) cbl = fs.existsSync(modulo) ? require(modulo) : null;
  return new SiteDeMentira(indice, {}, vault, path.join(raiz, 'site'), false, { cbl, vaultNoRepo });
}

// O hash é o do nucleo (cyrb53, 14 hex) sobre os blocos do html.js. O teste
// não recalcula hash nenhum: compara `h` com `hb` e lê o texto da base.
const HASH = /^[0-9a-f]{14}$/;

const AGORA = new Date('2026-09-24T12:00:00-03:00');

test('base de 7 dias: h, hb, temBase e nova por página, com o CBL antigo renderizado pelo módulo antigo', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  const [VISAO, NEGOCIO, ESCOPO] = ['Visão', 'Negócio', 'Escopo'].map((n) => `doc-harness/Produto/${n}.md`);
  const sha7 = commitar(raiz, '2026-09-10T10:00:00-03:00', {
    [VISAO]: notaMd('Visão', 'Primeira versão da visão.'),
    [NEGOCIO]: notaMd('Negócio', 'O negócio não muda.'),
    'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa do CBL.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Trabalho'),
  });
  commitar(raiz, '2026-09-20T10:00:00-03:00', {
    [VISAO]: notaMd('Visão', 'Segunda versão da visão.'),
    [ESCOPO]: notaMd('Escopo', 'O escopo do MVP.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Freelancer'),
  }, 'Reescreve a visão, cria o escopo e troca a Big Idea');

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.avisos, []);
  assert.deepStrictEqual(r.base, { sha: sha7.slice(0, 7), em: '2026-09-10T13:00:00.000Z' });

  const visao = r.paginas['notas/produto-visao'];
  assert.match(visao.h, HASH);
  assert.match(visao.hb, HASH);
  assert.notStrictEqual(visao.hb, visao.h);
  assert.deepStrictEqual([visao.temBase, visao.nova, visao.t], [true, false, '2026-09-20T13:00:00.000Z']);

  const negocio = r.paginas['notas/produto-negocio'];
  assert.match(negocio.h, HASH);
  assert.strictEqual(negocio.hb, negocio.h);
  assert.deepStrictEqual([negocio.temBase, negocio.nova, negocio.t], [false, false, null]);

  const escopo = r.paginas['notas/produto-escopo'];
  assert.deepStrictEqual([escopo.hb, escopo.temBase, escopo.nova, escopo.t], [null, false, true, '2026-09-20T13:00:00.000Z']);

  // O CBL da base sai do cbl-documento.js e do cbl-dados.json de 7 dias atrás.
  const cbl = r.paginas['documento-cbl'];
  assert.match(cbl.hb, HASH);
  assert.match(r.basesHtml['documento-cbl'], /<p>Prosa do CBL\.<\/p><p>Trabalho<\/p>/);
  assert.deepStrictEqual([cbl.temBase, cbl.nova, cbl.t], [true, false, '2026-09-20T13:00:00.000Z']);

  // Base só de quem mudou, já embrulhada para `novidades/base/<chave>.html`.
  assert.deepStrictEqual(Object.keys(r.basesHtml).sort(), ['documento-cbl', 'notas/produto-visao']);
  assert.strictEqual(
    r.basesHtml['notas/produto-visao'],
    '<div data-novidades-base data-novidades-chave="notas/produto-visao" data-novidades-em="2026-09-10T13:00:00.000Z">'
      + '<article data-novidades-raiz data-novidades-chave="notas/produto-visao"><h1>Visão</h1><p>Primeira versão da visão.</p></article>'
      + '</div>',
  );

  // A linha do tempo liga o commit às páginas pelas `fontes` do site atual.
  assert.deepStrictEqual(r.linhaDoTempo.dias.flatMap((d) => d.entradas).map((e) => e.paginas), [[
    { chave: 'documento-cbl', titulo: 'Documento Oficial CBL', href: 'index.html', tipo: 'alterada' },
    { chave: 'notas/produto-escopo', titulo: 'Escopo', href: 'notas/produto-escopo.html', tipo: 'nova' },
    { chave: 'notas/produto-visao', titulo: 'Visão', href: 'notas/produto-visao.html', tipo: 'alterada' },
  ]]);
});

test('sem o cbl-documento.js 7 dias atrás, o CBL fica sem base e não conta como novo', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  const VISAO = 'doc-harness/Produto/Visão.md';
  commitar(raiz, '2026-09-10T10:00:00-03:00', { [VISAO]: notaMd('Visão', 'Primeira versão.') });
  // O módulo do CBL nasce depois da base, como o 6508968 em 21/09.
  commitar(raiz, '2026-09-21T19:44:00-03:00', {
    'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa do CBL.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Freelancer'),
    [VISAO]: notaMd('Visão', 'Segunda versão.'),
  });

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.avisos, []);
  const cbl = r.paginas['documento-cbl'];
  assert.deepStrictEqual([cbl.hb, cbl.temBase, cbl.nova], [null, false, false]);
  assert.ok(!('documento-cbl' in r.basesHtml));
  // O resto da base sai normalmente.
  assert.strictEqual(r.paginas['notas/produto-visao'].temBase, true);
  assert.match(r.basesHtml['notas/produto-visao'], /Primeira versão\./);
});

test('mudou e a linha do tempo não sabe quando: t é o do último commit do código que renderiza', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  commitar(raiz, '2026-09-10T10:00:00-03:00', {
    'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa antiga.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Freelancer'),
    'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto.'),
  });
  // Só a prosa, que mora no código e fica fora da linha do tempo.
  commitar(raiz, '2026-09-22T10:00:00-03:00', { 'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa nova.') });
  // Depois, código que não muda texto de página: testes e estilo.
  commitar(raiz, '2026-09-23T10:00:00-03:00', {
    'Bancada/scripts/testes/x.test.js': '// teste\n',
    'Bancada/scripts/estilo/x.css': 'p {}\n',
  });

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.linhaDoTempo, { dias: [] });
  // Fixo de um build para o outro: não anda com o `gerado`.
  assert.deepStrictEqual([r.paginas['documento-cbl'].temBase, r.paginas['documento-cbl'].t], [true, '2026-09-22T13:00:00.000Z']);
  assert.strictEqual(r.paginas['notas/produto-visao'].t, null);
});

/** O `cbl-documento.js` do working tree com outra prosa, sem commit: a edição local de quem desenvolve. */
function editarProsaSemCommit(raiz, prosa) {
  fs.writeFileSync(path.join(raiz, 'Bancada/scripts/cbl-documento.js'), moduloCbl(prosa));
}

test('mudou e nenhum commit explica (edição local sem commit): t é o gerado do build', () => {
  const raiz = repoComUmaMudanca();
  const binario = binarioDeMentira();
  editarProsaSemCommit(raiz, 'Prosa nova, ainda sem commit.');

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  // O `geradoEm` do índice é o `gerado` do manifesto.
  assert.deepStrictEqual([r.paginas['documento-cbl'].temBase, r.paginas['documento-cbl'].t], [true, '2026-09-24T15:00:00.000Z']);
});

const pastasDaBase = () => fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('bancada-novidades-base-')).sort();

/** Um vault com uma nota mudada depois da base, pronto para os caminhos de erro. */
function repoComUmaMudanca() {
  const raiz = criarRepo();
  commitar(raiz, '2026-09-10T10:00:00-03:00', {
    'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Freelancer'),
    'doc-harness/Produto/Visão.md': notaMd('Visão', 'Primeira versão.'),
  });
  commitar(raiz, '2026-09-22T10:00:00-03:00', { 'doc-harness/Produto/Visão.md': notaMd('Visão', 'Segunda versão.') }, 'Reescreve a visão');
  return raiz;
}

test('sem o binário, sai sem base, mas com h e com a linha do tempo', () => {
  const raiz = repoComUmaMudanca();
  const site = siteAtual(raiz, binarioDeMentira());
  const antes = pastasDaBase();

  const r = construirNovidades({ site, binario: path.join(raiz, 'nao-existe'), tokens: {}, agora: AGORA });

  assert.strictEqual(r.avisos.length, 1);
  assert.match(r.avisos[0], /^sem a base de 7 dias: .*bancada-indice/);
  assert.strictEqual(r.base, null);
  assert.deepStrictEqual(r.basesHtml, {});
  const { h, ...resto } = r.paginas['notas/produto-visao'];
  assert.match(h, HASH);
  assert.deepStrictEqual(resto, { hb: null, temBase: false, nova: false, t: '2026-09-22T13:00:00.000Z' });
  assert.strictEqual(r.linhaDoTempo.dias.length, 1);
  assert.deepStrictEqual(pastasDaBase(), antes);
});

test('com o binário falhando no vault antigo, sai sem base e apaga a pasta temporária', () => {
  const raiz = repoComUmaMudanca();
  const binario = binarioDeMentira();
  const site = siteAtual(raiz, binario);
  const quebrado = path.join(pastaTemporaria('bancada-construir-bin-'), 'bancada-indice');
  fs.writeFileSync(quebrado, `#!${process.execPath}\nconsole.error('nota fora da convenção');\nprocess.exit(2);\n`);
  fs.chmodSync(quebrado, 0o755);
  const antes = pastasDaBase();

  const r = construirNovidades({ site, binario: quebrado, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.avisos, ['sem a base de 7 dias: nota fora da convenção']);
  assert.strictEqual(r.base, null);
  assert.deepStrictEqual(pastasDaBase(), antes);
});

test('vault fora de um repositório git: nada lança, e sai sem base e sem linha do tempo, com um aviso', () => {
  const raiz = pastaTemporaria('bancada-construir-sem-git-');
  fs.mkdirSync(path.join(raiz, 'doc-harness/Produto'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'doc-harness/Produto/Visão.md'), notaMd('Visão', 'Texto.'));
  const binario = binarioDeMentira();

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.strictEqual(r.avisos.length, 1);
  assert.match(r.avisos[0], /^sem histórico: o vault não está num repositório git/);
  // null, e não `{dias: []}`: a página Novidades diz "não está disponível" em
  // vez de "nada mudou nos últimos 14 dias".
  assert.deepStrictEqual([r.base, r.basesHtml, r.linhaDoTempo], [null, {}, null]);
  const { h, ...resto } = r.paginas['notas/produto-visao'];
  assert.match(h, HASH);
  assert.deepStrictEqual(resto, { hb: null, temBase: false, nova: false, t: null });
});

test('sem commit antes de 7 dias atrás, sai sem base e com a linha do tempo', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  commitar(raiz, '2026-09-20T10:00:00-03:00', { 'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto.') }, 'Cria a visão');

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.strictEqual(r.avisos.length, 1);
  assert.match(r.avisos[0], /^sem a base de 7 dias: nenhum commit antes de 2026-09-17T15:00:00\.000Z/);
  assert.strictEqual(r.base, null);
  // Sem base não há como dizer que a página é nova.
  assert.strictEqual(r.paginas['notas/produto-visao'].nova, false);
  assert.strictEqual(r.linhaDoTempo.dias.length, 1);
});

// Quebra ao renderizar e quebra ao carregar: nos dois casos, perde a base só o CBL.
const cblsQuebrados = [
  ['ao renderizar', 'module.exports = { renderizarDocumentoCBL() { throw new Error("formato antigo"); } };\n', /formato antigo/],
  ['ao carregar', 'module.exports = {\n', /SyntaxError|Unexpected end of input/],
];
for (const [quando, fonte, erro] of cblsQuebrados) {
  test(`se o cbl-documento.js antigo quebra ${quando}, só o CBL fica sem base`, () => {
    const raiz = criarRepo();
    const binario = binarioDeMentira();
    commitar(raiz, '2026-09-10T10:00:00-03:00', {
      'Bancada/scripts/cbl-documento.js': fonte,
      'Bancada/scripts/cbl-dados.json': dadosCbl('Trabalho'),
      'doc-harness/Produto/Visão.md': notaMd('Visão', 'Primeira versão.'),
    });
    commitar(raiz, '2026-09-22T10:00:00-03:00', {
      'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa.'),
      'doc-harness/Produto/Visão.md': notaMd('Visão', 'Segunda versão.'),
    });

    const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

    assert.strictEqual(r.avisos.length, 1);
    assert.match(r.avisos[0], /^documento-cbl sem base: /);
    assert.match(r.avisos[0], erro);
    assert.notStrictEqual(r.base, null);
    const cbl = r.paginas['documento-cbl'];
    assert.deepStrictEqual([cbl.hb, cbl.temBase, cbl.nova], [null, false, false]);
    assert.strictEqual(r.paginas['notas/produto-visao'].temBase, true);
  });
}

test('num clone raso como o antigo fetch-depth: 2, sai sem base e com a linha do tempo null', () => {
  const origem = repoComUmaMudanca();
  commitar(origem, '2026-09-23T10:00:00-03:00', { 'doc-harness/Produto/Visão.md': notaMd('Visão', 'Terceira versão.') }, 'Revisa a visão');
  const raso = pastaTemporaria('bancada-construir-raso-');
  git(os.tmpdir(), ['clone', '-q', '--depth', '2', `file://${origem}`, raso]);
  const binario = binarioDeMentira();

  const r = construirNovidades({ site: siteAtual(raso, binario), binario, tokens: {}, agora: AGORA });

  assert.strictEqual(r.avisos.length, 2);
  assert.match(r.avisos[0], /^sem a base de 7 dias: nenhum commit antes de/);
  assert.match(r.avisos[1], /^sem a linha do tempo: clone raso/);
  assert.deepStrictEqual([r.base, r.linhaDoTempo], [null, null]);
  assert.match(r.paginas['notas/produto-visao'].h, HASH);
});

test('com um geradoEm que não é data, t cai no agora do build em vez de derrubar tudo', () => {
  const raiz = repoComUmaMudanca();
  const binario = binarioDeMentira();
  editarProsaSemCommit(raiz, 'Prosa nova, ainda sem commit.');
  const site = siteAtual(raiz, binario);
  site.indice.geradoEm = 'ontem à noite';

  const r = construirNovidades({ site, binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.avisos, []);
  assert.deepStrictEqual([r.paginas['documento-cbl'].temBase, r.paginas['documento-cbl'].t], [true, AGORA.toISOString()]);
});

test('apagar nota que não era página própria (a home, o CBL do vault) não vira página removida', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  const [HOME, CBL_VAULT, RASCUNHO] = ['🏠 Início.md', '01 - CBL/Desafios/C18/Documentos/CBL_C18.md', 'Produto/Rascunho.md'].map((c) => `doc-harness/${c}`);
  commitar(raiz, '2026-09-10T10:00:00-03:00', {
    [HOME]: notaMd('Início', 'Bem-vindo ao vault.', 'tipo: home'),
    [CBL_VAULT]: notaMd('CBL_C18', 'Derivado do .pages.', 'tipo: documento-derivado'),
    [RASCUNHO]: notaMd('Rascunho do pitch', 'Texto.'),
    'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto.'),
  });
  commitar(raiz, '2026-09-22T10:00:00-03:00', { [HOME]: null, [CBL_VAULT]: null, [RASCUNHO]: null }, 'Limpa o vault');

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  // A capa segue no ar com o CBL, e a home nunca foi página: só o rascunho some.
  assert.deepStrictEqual(r.linhaDoTempo.dias.flatMap((d) => d.entradas).map((e) => e.paginas), [[
    { chave: 'notas/produto-rascunho', titulo: 'Rascunho do pitch', href: null, tipo: 'removida' },
  ]]);
});

test('se o Site de hoje não lê uma nota antiga, o aviso culpa a base, e não o cbl-documento.js', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  commitar(raiz, '2026-09-10T10:00:00-03:00', {
    'Bancada/scripts/cbl-documento.js': moduloCbl('Prosa.'),
    'Bancada/scripts/cbl-dados.json': dadosCbl('Freelancer'),
    'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto {{formato antigo}}.'),
  });
  commitar(raiz, '2026-09-22T10:00:00-03:00', { 'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto.') });

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.avisos, ['sem a base de 7 dias: nota no formato antigo']);
  assert.strictEqual(r.base, null);
});

test('nota que nasce e some na janela sem nunca ter sido página (tipo home) não aparece', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  commitar(raiz, '2026-09-05T10:00:00-03:00', { 'doc-harness/Produto/Visão.md': notaMd('Visão', 'Texto.') });
  commitar(raiz, '2026-09-15T10:00:00-03:00', { 'doc-harness/Mapa do vault.md': notaMd('Mapa do vault', 'Links.', 'tipo: home') }, 'Cria o mapa');
  // Um commit no meio: a remoção não é filha direta da criação.
  commitar(raiz, '2026-09-16T10:00:00-03:00', { 'Bancada/scripts/x.js': '1;\n' }, 'Mexe no código');
  commitar(raiz, '2026-09-22T10:00:00-03:00', { 'doc-harness/Mapa do vault.md': null }, 'Apaga o mapa');

  const r = construirNovidades({ site: siteAtual(raiz, binario), binario, tokens: {}, agora: AGORA });

  assert.deepStrictEqual(r.linhaDoTempo, { dias: [] });
});

/** O `cbl-documento.js` de agora, de fora do repositório do vault: o da Bancada, quando o vault é outro. */
function cblDeFora(prosa) {
  const pasta = pastaTemporaria('bancada-construir-cbl-');
  fs.writeFileSync(path.join(pasta, 'cbl-documento.js'), moduloCbl(prosa));
  fs.writeFileSync(path.join(pasta, 'cbl-dados.json'), dadosCbl('Freelancer'));
  return require(path.join(pasta, 'cbl-documento.js'));
}

// O vault de outra pessoa, no repositório dela: no Mac, o "Gerar site" da
// Bancada aponta para qualquer vault. Nada de `doc-harness` e nada do
// `Bancada/scripts` do monorepo ali dentro.
for (const [onde, vaultNoRepo] of [['numa subpasta que não é doc-harness', 'Documentos/Meu Vault'], ['na raiz do repositório', '']]) {
  test(`vault ${onde}: a base e a linha do tempo saem do repositório do vault`, () => {
    const raiz = criarRepo();
    const binario = binarioDeMentira();
    const no = (caminho) => [vaultNoRepo, caminho].filter(Boolean).join('/');
    const [VISAO, NEGOCIO, ESCOPO] = ['Visão', 'Negócio', 'Escopo'].map((n) => no(`Produto/${n}.md`));
    const sha7 = commitar(raiz, '2026-09-10T10:00:00-03:00', {
      [VISAO]: notaMd('Visão', 'Primeira versão da visão.'),
      [NEGOCIO]: notaMd('Negócio', 'O negócio não muda.'),
    });
    commitar(raiz, '2026-09-20T10:00:00-03:00', {
      [VISAO]: notaMd('Visão', 'Segunda versão da visão.'),
      [ESCOPO]: notaMd('Escopo', 'O escopo do MVP.'),
    }, 'Reescreve a visão e cria o escopo');
    const site = siteAtual(raiz, binario, { vaultNoRepo, cbl: cblDeFora('Prosa do CBL.') });

    const r = construirNovidades({ site, binario, tokens: {}, agora: AGORA });

    assert.deepStrictEqual(r.avisos, []);
    assert.deepStrictEqual(r.base, { sha: sha7.slice(0, 7), em: '2026-09-10T13:00:00.000Z' });
    const [visao, negocio, escopo, cbl] = ['notas/produto-visao', 'notas/produto-negocio', 'notas/produto-escopo', 'documento-cbl'].map((c) => r.paginas[c]);
    assert.deepStrictEqual([visao.temBase, visao.nova], [true, false]);
    assert.match(r.basesHtml['notas/produto-visao'], /Primeira versão da visão\./);
    assert.strictEqual(negocio.hb, negocio.h);
    assert.deepStrictEqual([escopo.hb, escopo.nova], [null, true]);
    // Sem `Bancada/scripts` no repositório, o CBL fica sem base, sem virar novo.
    assert.deepStrictEqual([cbl.hb, cbl.temBase, cbl.nova], [null, false, false]);
    assert.deepStrictEqual(r.linhaDoTempo.dias.flatMap((d) => d.entradas).map((e) => [e.assunto, e.paginas.map((p) => `${p.chave} ${p.tipo} ${p.href}`)]), [
      ['Reescreve a visão e cria o escopo', [
        'notas/produto-escopo nova notas/produto-escopo.html',
        'notas/produto-visao alterada notas/produto-visao.html',
      ]],
    ]);
  });
}

// MARK: - O gerar-site.js de verdade

const GERAR_SITE = path.join(__dirname, '..', 'gerar-site.js');
/** Uma data `dias` antes de agora, no formato que o git aceita. */
const haDias = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');

/**
 * Roda o `gerar-site.js` como o CI e o "Gerar site" da Bancada do Mac, com o
 * binário de mentira. Aqui vale a hora de verdade: o `main()` não recebe `agora`.
 */
function gerarSite(vault, binario) {
  const destino = pastaTemporaria('bancada-construir-site-');
  const env = { ...process.env, BANCADA_BIN: binario };
  delete env.BANCADA_INDICE_JSON;
  const r = spawnSync(process.execPath, [GERAR_SITE, vault, destino], { env, encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  return { destino, saida: r.stdout, avisos: r.stderr };
}

test('gerar-site.js lê a história do repositório do vault que recebe, e não do repositório da Bancada', () => {
  const raiz = criarRepo();
  const binario = binarioDeMentira();
  const VAULT = 'Documentos/Meu Vault';
  const [VISAO, ESCOPO] = ['Visão', 'Escopo'].map((n) => `${VAULT}/Produto/${n}.md`);
  const sha7 = commitar(raiz, haDias(10), { [VISAO]: notaMd('Visão', 'Primeira versão da visão.') });
  commitar(raiz, haDias(2), {
    [VISAO]: notaMd('Visão', 'Segunda versão da visão.'),
    [ESCOPO]: notaMd('Escopo', 'O escopo do MVP.'),
  }, 'Reescreve a visão e cria o escopo');

  const { destino, saida, avisos } = gerarSite(path.join(raiz, VAULT), binario);

  assert.doesNotMatch(avisos, /Novidades:/);
  assert.match(saida, new RegExp(`base de 7 dias em ${sha7.slice(0, 7)}`));
  assert.match(fs.readFileSync(path.join(destino, 'novidades/base/notas/produto-visao.html'), 'utf8'), /Primeira versão da visão\./);
  // A entrada liga as páginas pelas `fontes`, que precisam do caminho certo do vault.
  const novidades = fs.readFileSync(path.join(destino, 'novidades.html'), 'utf8');
  assert.match(novidades, /Reescreve a visão e cria o escopo/);
  assert.match(novidades, /href="notas\/produto-escopo\.html"/);
  assert.match(novidades, /href="notas\/produto-visao\.html"/);
});

test('gerar-site.js com o vault fora do git: avisa, e o site sai sem base e sem linha do tempo', () => {
  const vault = pastaTemporaria('bancada-construir-sem-git-');
  fs.mkdirSync(path.join(vault, 'Produto'));
  fs.writeFileSync(path.join(vault, 'Produto/Visão.md'), notaMd('Visão', 'Texto.'));

  const { destino, saida, avisos } = gerarSite(vault, binarioDeMentira());

  assert.match(avisos, /Novidades: o vault não está num repositório git/);
  assert.match(saida, /novidades: sem base de 7 dias/);
  assert.ok(!fs.existsSync(path.join(destino, 'novidades/base')));
  assert.match(fs.readFileSync(path.join(destino, 'novidades.html'), 'utf8'), /não está disponível/);
  assert.ok(fs.existsSync(path.join(destino, 'notas/produto-visao.html')));
});
