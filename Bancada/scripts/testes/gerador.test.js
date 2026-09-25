// O que o gerador entrega ao "O que há de novo": a raiz de cada documento, as
// regiões que o diff ignora, o manifesto embutido, as bases de 7 dias e o
// `versao.json`.
//
// Mesmo arranjo do `barra-lateral.test.js`: roda o `Site.gerar()` de verdade
// contra um índice de mentira, com os caminhos reais do vault. O
// `construirNovidades` também é de mentira: a história do git não entra aqui,
// só o que o gerador faz com ela.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/gerador.test.js

const { test, before } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Site } = require('../gerar-site');

const RAIZ_PROJETO = path.resolve(__dirname, '..', '..');
const DESAFIO = '01 - CBL/Desafios/C18';
const PRODUTO = `${DESAFIO}/Documentos de Produto`;

function nota(caminho, tipo, titulo, campos = {}, corpo = null) {
  return {
    caminho,
    tipo,
    titulo,
    corpo: corpo || `# ${titulo}\n\nTexto de teste com uma frase inteira para o gerador ler.\n`,
    campos: { tipo, desafio: 'C18', ...campos },
    tags: [],
    rotuloDoTipo: '',
    somenteLeitura: false,
  };
}

const CBL = [`${DESAFIO}/C18.md`, `${DESAFIO}/Documentos/CBL_C18.md`];
const LEIA_PRIMEIRO = `${PRODUTO}/00-LEIA-PRIMEIRO.md`;
const VISAO = `${PRODUTO}/Frila_Documento_de_Visao.md`;
const ESCOPO = `${PRODUTO}/05-ESCOPO-DO-MVP.md`;
const PENDENCIAS = '07 - Arquitetura/Pendências Técnicas Para Codar.md';
const TAREFA = '04 - Tarefas/T-0011 - Alinhar escopo e fluxos do protótipo de baixa fidelidade.md';
const DIARIO = '02 - Atualizações Diárias/2026/09/2026-09-18.md';

// Duas seções `##` fazem o masthead montar a navegação por âncoras.
const COM_SECOES = `# Pendências Técnicas\n\nTexto de abertura com uma frase inteira para o gerador ler.\n\n## Contexto\n\nO que já se sabe.\n\n## Decisões\n\nO que foi decidido.\n`;

const indice = {
  versaoDoFormato: 1,
  geradoEm: '2026-09-24T18:00:00Z',
  raiz: '/vault',
  fatos: [],
  fatosNaoReconhecidos: [],
  midias: [],
  arvoreDeRegistros: [],
  invalidas: [],
  templates: [],
  notas: [
    nota(CBL[0], 'cbl-desafio', 'Challenge 18'),
    nota(CBL[1], 'documento-derivado', 'CBL_C18'),
    nota(`${DESAFIO}/Agenda - C18.md`, 'agenda', 'Agenda — C18'),
    nota(LEIA_PRIMEIRO, 'documento-produto', 'Frila — Leia primeiro'),
    nota(`${PRODUTO}/01-O-PROBLEMA.md`, 'documento-produto', 'Frila — O Problema'),
    nota(`${PRODUTO}/02-O-NEGOCIO.md`, 'documento-produto', 'Frila — O Negócio'),
    nota(`${PRODUTO}/03-ESPECIFICACAO-DO-PRODUTO.md`, 'documento-produto', 'Frila — Especificação do Produto'),
    nota(`${PRODUTO}/04-MERCADO-E-CONCORRENCIA.md`, 'documento-produto', 'Frila — Mercado e Concorrência'),
    nota(ESCOPO, 'documento-produto', 'Frila — Escopo do MVP'),
    nota(`${PRODUTO}/EVIDENCIAS.md`, 'documento-produto', 'Frila — Evidências'),
    nota(`${PRODUTO}/Frila_Documento_de_Requisitos.md`, 'documento-derivado', 'Frila_Documento_de_Requisitos'),
    nota(VISAO, 'documento-derivado', 'Frila_Documento_de_Visao'),
    nota(`${PRODUTO}/Frila_Historias_de_Usuario_e_Backlog.md`, 'documento-produto', 'Histórias de Usuário e Backlog do Produto — Frila'),
    nota(`${PRODUTO}/Frila_Roteiro_de_Validacao_de_Campo.md`, 'documento-produto', 'Roteiro e Protocolo de Validação de Campo no DF — Frila'),
    nota(`${PRODUTO}/README.md`, 'documento-produto', 'Frila'),
    nota('07 - Arquitetura/Diagrama de Arquitetura.md', 'arquitetura', 'Diagrama de Arquitetura — Frila'),
    nota('07 - Arquitetura/Diagrama de Casos de Uso.md', 'arquitetura', 'Diagrama de Casos de Uso — Frila'),
    // Um título com o que quebraria um JSON embutido em <script>.
    nota('07 - Arquitetura/Diagrama de Classe.md', 'arquitetura', 'Classes </script> & "entidades" — Frila'),
    // Com descrição no frontmatter: o lead do masthead sai dela, e não do corpo.
    nota('07 - Arquitetura/Modelagem de Banco de Dados.md', 'arquitetura', 'Modelagem de Banco de Dados — Frila', {
      descricao: 'Esquema relacional do Frila, com as tabelas e as regras de acesso de cada uma.',
    }),
    nota(PENDENCIAS, 'arquitetura', 'Pendências Técnicas — Antes de Colocar a Mão no Código', {}, COM_SECOES),
    nota(DIARIO, 'atualizacao-diaria', '2026-09-18', { data: '2026-09-18' }),
    nota(TAREFA, 'tarefa', 'T-0011 — Alinhar escopo e fluxos do protótipo de baixa fidelidade', {
      id: 'T-0011', status: 'em-andamento', responsavel: 'cauecarneiroc',
    }),
  ],
};

const lerTokens = () => JSON.parse(fs.readFileSync(path.join(RAIZ_PROJETO, 'tokens.json'), 'utf8'));

/** Gera o site num diretório temporário e devolve todo arquivo de texto dele. */
function gerar(opcoes = {}, indiceUsado = indice) {
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-gerador-'));
  try {
    const site = new Site(indiceUsado, lerTokens(), path.join(destino, 'vault'), destino, false, opcoes);
    site.gerar();
    const arquivos = new Map();
    (function ler(pasta) {
      for (const entrada of fs.readdirSync(path.join(destino, pasta), { withFileTypes: true })) {
        const relativo = pasta ? `${pasta}/${entrada.name}` : entrada.name;
        if (entrada.isDirectory()) ler(relativo);
        else arquivos.set(relativo, fs.readFileSync(path.join(destino, relativo), 'utf8'));
      }
    })('');
    return { site, arquivos };
  } finally {
    fs.rmSync(destino, { recursive: true, force: true });
  }
}

/** Um `Site` montado num diretório vazio, para provar que nada foi escrito nele. */
function siteSemGerar(opcoes = {}, tokens = lerTokens()) {
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-gerador-puro-'));
  return {
    destino,
    site: new Site(indice, tokens, path.join(destino, 'vault'), destino, false, opcoes),
    limpar: () => fs.rmSync(destino, { recursive: true, force: true }),
  };
}

// O `construirNovidades` de mentira: devolve a forma combinada com o
// historico, com três casos à mão (uma página mudada com base, uma nova e o
// documento CBL mudado) e o resto igual à base.
const BASE = { sha: '8122fef', em: '2026-09-17T18:00:00.000Z' };
const AGORA = new Date('2026-09-24T18:00:00.000Z');
const CONTEXTO = { repoRaiz: '/repo', binario: '/repo/Bancada/.build/release/bancada-indice', agora: AGORA };

function construirDeMentira(args) {
  const chaveDe = (caminho) => args.site.arquivoDaNota(caminho).replace(/\.html$/, '');
  const paginas = {};
  for (const d of args.site.paginasDeDocumento()) {
    paginas[d.chave] = { h: `h-${d.chave}`, hb: `h-${d.chave}`, temBase: false, nova: false, t: null };
  }
  paginas[chaveDe(VISAO)] = { h: 'h-visao', hb: 'hb-visao', temBase: true, nova: false, t: '2026-09-22T16:00:00.000Z' };
  paginas[chaveDe(ESCOPO)] = { h: 'h-escopo', hb: null, temBase: false, nova: true, t: '2026-09-23T13:00:00.000Z' };
  paginas['documento-cbl'] = { h: 'h-cbl', hb: 'hb-cbl', temBase: true, nova: false, t: '2026-09-21T12:00:00.000Z' };
  const embrulho = (chave, miolo) =>
    `<div data-novidades-base data-novidades-chave="${chave}" data-novidades-em="${BASE.em}">${miolo}</div>`;
  return {
    paginas,
    base: BASE,
    basesHtml: {
      [chaveDe(VISAO)]: embrulho(chaveDe(VISAO), '<article>Visão de antes</article>'),
      'documento-cbl': embrulho('documento-cbl', '<article>CBL de antes</article>'),
    },
    linhaDoTempo: { dias: [] },
    avisos: ['aviso de teste: diário de 17/09 fora da base'],
  };
}

// Só o build principal registra as chamadas: os outros testes geram de novo,
// e a contagem não pode depender da ordem em que eles rodam.
const chamadas = [];
const avisos = [];
let site;
let arquivos;

before(() => {
  ({ site, arquivos } = gerar({
    ...CONTEXTO,
    construirNovidades: (args) => {
      chamadas.push(args);
      return construirDeMentira(args);
    },
    avisar: (texto) => avisos.push(texto),
  }));
});

const arquivo = (caminho) => site.arquivoDaNota(caminho);
const chaveDaNota = (caminho) => arquivo(caminho).replace(/\.html$/, '');
const paginas = () => [...arquivos].filter(([nome]) => nome.endsWith('.html') && !nome.startsWith('novidades/'));

/** As aberturas de `<article>` marcadas como raiz do diff, com a chave de cada uma. */
function raizes(html) {
  return [...html.matchAll(/<article\b[^>]*\bdata-novidades-raiz\b[^>]*>/g)].map(([tag]) => {
    const chave = tag.match(/\bdata-novidades-chave="([^"]*)"/);
    return chave ? chave[1] : null;
  });
}

// MARK: - Raiz do diff e masthead

test('cada página de documento tem uma raiz só, com a chave da própria página', () => {
  const documentoCBL = ['index.html', ...CBL.map(arquivo)];
  let conferidas = 0;
  for (const [pagina, html] of paginas()) {
    if (!pagina.startsWith('notas/') && pagina !== 'index.html') continue;
    const esperada = documentoCBL.includes(pagina) ? 'documento-cbl' : pagina.replace(/\.html$/, '');
    assert.deepStrictEqual(raizes(html), [esperada], pagina);
    conferidas++;
  }
  assert.ok(conferidas >= 20, `só ${conferidas} páginas de documento`);

  // Um caso escrito à mão, para a regra não ser só "o nome do arquivo".
  assert.deepStrictEqual(
    raizes(arquivos.get(arquivo(ESCOPO))),
    ['notas/01-cbl-desafios-c18-documentos-de-produto-05-escopo-do-mvp'],
  );
  // A tarefa individual também é documento.
  assert.deepStrictEqual(raizes(arquivos.get(arquivo(TAREFA))), [chaveDaNota(TAREFA)]);
});

test('as páginas que não são documento ficam sem raiz', () => {
  for (const pagina of ['tarefas.html', 'registros.html', 'galeria.html', 'novidades.html']) {
    assert.deepStrictEqual(raizes(arquivos.get(pagina)), [], pagina);
  }
});

const RESUMO = '<p class="nov-resumo" data-nov-resumo data-novidades="ignorar" hidden></p>';

test('o espaço do resumo vem logo depois do h1, dentro da raiz', () => {
  for (const [pagina, html] of paginas()) {
    const quantos = (html.match(/data-nov-resumo/g) || []).length;
    if (!raizes(html).length) {
      assert.strictEqual(quantos, 0, pagina);
      continue;
    }
    assert.strictEqual(quantos, 1, pagina);
    assert.ok(html.includes(RESUMO), `${pagina}: espaço do resumo fora do formato`);
    assert.match(html, /<\/h1>\s*<p class="nov-resumo"/, pagina);
    assert.ok(html.indexOf('data-novidades-raiz') < html.indexOf(RESUMO), `${pagina}: resumo fora da raiz`);
  }
});

test('o diff ignora o eyebrow, o colofão e a navegação de seções do masthead', () => {
  const regioes = ['cbl-masthead-eyebrow', 'cbl-colofao', 'cbl-nav-ancoras'];
  const aberturas = (html, classe) => [...html.matchAll(new RegExp(`<(?:div|nav) class="${classe}"[^>]*>`, 'g'))].map(([tag]) => tag);

  for (const [pagina, html] of paginas()) {
    if (!raizes(html).length) continue;
    for (const classe of regioes) {
      for (const tag of aberturas(html, classe)) {
        assert.match(tag, /\bdata-novidades="ignorar"/, `${pagina}: ${tag}`);
      }
    }
  }

  // As três regiões existem de fato numa nota com seções e no documento CBL,
  // para a varredura acima não passar por não achar nada.
  for (const pagina of [arquivo(PENDENCIAS), 'index.html', arquivo(CBL[1])]) {
    for (const classe of regioes) {
      assert.strictEqual(aberturas(arquivos.get(pagina), classe).length, 1, `${pagina}: ${classe}`);
    }
  }
});

test('o lead tirado do corpo fica fora do diff; o que vem do frontmatter conta', () => {
  const lead = (pagina) => {
    const m = arquivos.get(pagina).match(/<p class="cbl-masthead-lead"([^>]*)>([^<]*)<\/p>/);
    assert.ok(m, `${pagina}: sem lead`);
    return { ignorado: /\bdata-novidades="ignorar"/.test(m[1]), texto: m[2] };
  };
  const CORPO = 'Texto de teste com uma frase inteira para o gerador ler.';

  // Sem descrição, o lead repete o primeiro parágrafo do corpo. Contado duas
  // vezes, um parágrafo novo apareceria no lead e de novo no texto.
  assert.deepStrictEqual(lead(arquivo(ESCOPO)), { ignorado: true, texto: CORPO });
  assert.ok(arquivos.get(arquivo(ESCOPO)).includes(`<p>${CORPO}</p>`), 'o parágrafo do corpo sumiu');

  // Do frontmatter, o lead é texto que só existe ali: fica no diff.
  assert.deepStrictEqual(lead(arquivo('07 - Arquitetura/Modelagem de Banco de Dados.md')), {
    ignorado: false,
    texto: 'Esquema relacional do Frila, com as tabelas e as regras de acesso de cada uma.',
  });
  // O lead fixo do gerador também só existe ali, e também fica.
  assert.strictEqual(lead(arquivo(VISAO)).ignorado, false);
});

// MARK: - paginasDeDocumento

test('paginasDeDocumento lista cada documento uma vez e não escreve nada', () => {
  const { destino, site: s, limpar } = siteSemGerar();
  try {
    const lista = s.paginasDeDocumento();
    assert.deepStrictEqual(fs.readdirSync(destino), [], 'paginasDeDocumento escreveu no destino');
    assert.strictEqual(s.paginasDeDocumento(), lista, 'a segunda chamada devia reaproveitar a primeira');

    for (const d of lista) {
      assert.deepStrictEqual(
        Object.keys(d).sort(),
        ['arquivo', 'chave', 'conta', 'conteudo', 'fontes', 'grupo', 'hrefs', 'titulo'],
        d.chave,
      );
    }
    const chaves = lista.map((d) => d.chave);
    assert.strictEqual(new Set(chaves).size, chaves.length, 'chave repetida');

    // O documento CBL entra uma vez, com os três endereços em que aparece.
    const [cbl, ...repetidos] = lista.filter((d) => d.chave === 'documento-cbl');
    assert.deepStrictEqual(repetidos, []);
    assert.deepStrictEqual(cbl.hrefs, [
      'index.html',
      'notas/01-cbl-desafios-c18-c18.html',
      'notas/01-cbl-desafios-c18-documentos-cbl-c18.html',
    ]);
    assert.strictEqual(cbl.arquivo, 'index.html');
    assert.strictEqual(cbl.titulo, 'Documento Oficial CBL');
    assert.deepStrictEqual(cbl.fontes, ['Bancada/scripts/cbl-dados.json']);
    assert.strictEqual(cbl.conta, true);
    assert.strictEqual(cbl.grupo, null);

    // Contam o documento CBL e as 15 páginas da barra; o resto não.
    assert.strictEqual(lista.filter((d) => d.conta).length, 16);
    const porChave = new Map(lista.map((d) => [d.chave, d]));
    const doc = (caminho) => porChave.get(chaveDaNota(caminho));
    for (const oculta of [LEIA_PRIMEIRO, TAREFA, DIARIO]) {
      assert.strictEqual(doc(oculta).conta, false, oculta);
      assert.strictEqual(doc(oculta).grupo, null, oculta);
    }
    assert.deepStrictEqual(
      [doc(VISAO), doc(PENDENCIAS)].map((d) => [d.conta, d.grupo]),
      [[true, 'produto'], [true, 'arquitetura']],
    );

    // Notas: um endereço só, a fonte no repositório e o rótulo da barra.
    assert.deepStrictEqual(doc(VISAO).hrefs, [arquivo(VISAO)]);
    assert.strictEqual(doc(VISAO).arquivo, arquivo(VISAO));
    assert.deepStrictEqual(doc(VISAO).fontes, [`doc-harness/${VISAO}`]);
    assert.strictEqual(doc(VISAO).titulo, 'Documento de Visão');
  } finally {
    limpar();
  }
});

test('paginasDeDocumento cobre exatamente os documentos que gerar() publica', () => {
  const lista = site.paginasDeDocumento();
  const publicados = paginas().map(([pagina]) => pagina).filter((p) => p === 'index.html' || p.startsWith('notas/')).sort();
  assert.deepStrictEqual(lista.flatMap((d) => d.hrefs).sort(), publicados);

  // O conteúdo é o <article> que o leitor vê, e começa pela raiz do diff.
  for (const d of lista) {
    assert.match(d.conteudo.trim(), /^<article\b[^>]*\bdata-novidades-raiz\b[^>]*>[\s\S]*<\/article>$/, d.chave);
    assert.ok(arquivos.get(d.arquivo).includes(d.conteudo.trim()), `${d.chave}: conteúdo diferente da página`);
  }
});

test('sem o módulo CBL (base antiga sem ele), o documento CBL fica de fora', () => {
  const { site: s, limpar } = siteSemGerar({ cbl: null });
  try {
    const chaves = s.paginasDeDocumento().map((d) => d.chave);
    assert.ok(!chaves.includes('documento-cbl'));
    assert.ok(chaves.includes(chaveDaNota(VISAO)));
    assert.ok(!chaves.some((c) => CBL.map(arquivo).includes(`${c}.html`)), 'nota CBL entrou como documento comum');

    // Só a lista de documentos funciona sem ele: a capa é o documento CBL, e
    // gerar o site sem o módulo recusa logo, dizendo por quê.
    assert.throws(() => s.gerar(), /módulo do documento CBL/);
  } finally {
    limpar();
  }
});

// MARK: - Barra lateral e topo

function barra(html) {
  const m = html.match(/<aside>([\s\S]*?)<\/aside>/);
  assert.ok(m, 'página sem <aside>');
  return m[1];
}

function navDoTopo(html) {
  const m = html.match(/<header>[\s\S]*?<nav>([\s\S]*?)<\/nav>/);
  assert.ok(m, 'página sem <nav> no <header>');
  return m[1];
}

/** Um `href` da página, resolvido para o caminho relativo à raiz do site. */
const resolver = (pagina, href) => path.posix.normalize(path.posix.join(path.posix.dirname(pagina), href));

/** Cada `<a>` do trecho, com o endereço resolvido, a `data-chave` e o rótulo. */
function linksComChave(pagina, trecho) {
  return [...trecho.matchAll(/<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)].map(([, href, atributos, miolo]) => ({
    alvo: resolver(pagina, href),
    atributos,
    chave: (atributos.match(/\bdata-chave="([^"]*)"/) || [])[1],
    rotulo: miolo.replace(/<[^>]+>/g, '').trim(),
  }));
}

test('a barra abre com o item Novidades, antes dos grupos', () => {
  for (const [pagina, html] of paginas()) {
    const inicio = barra(html).match(/<div class="sidebar-inner">\s*(<a [^>]*>[\s\S]*?<\/a>)\s*<details class="grupo"/);
    assert.ok(inicio, `${pagina}: a barra não começa pelo item Novidades`);
    const [item] = linksComChave(pagina, inicio[1]);
    assert.strictEqual(item.alvo, 'novidades.html', pagina);
    assert.strictEqual(item.chave, 'novidades', pagina);
    assert.match(item.atributos, /class="sidebar-novidades[" ]/, pagina);
    assert.strictEqual(item.rotulo, 'Novidades', pagina);
    assert.match(inicio[1], /<span class="nov-contagem" hidden><\/span>/, pagina);
    // Aceso só na própria página Novidades, e do jeito dos outros links.
    const aceso = pagina === 'novidades.html';
    assert.strictEqual(/aria-current="page"/.test(item.atributos), aceso, pagina);
    assert.strictEqual(/class="sidebar-novidades ativo"/.test(item.atributos), aceso, pagina);
  }
  assert.ok(arquivos.has('novidades.html'));
});

test('os links da barra e do topo levam a chave da página que abrem', () => {
  const documentoCBL = ['index.html', ...CBL.map(arquivo)];
  const chaveEsperada = (alvo) => (documentoCBL.includes(alvo) ? 'documento-cbl' : alvo.replace(/\.html$/, ''));

  for (const [pagina, html] of paginas()) {
    const daBarra = linksComChave(pagina, barra(html));
    const doTopo = linksComChave(pagina, navDoTopo(html));
    assert.strictEqual(daBarra.length, 16, pagina);
    assert.strictEqual(doTopo.length, 4, pagina);
    for (const link of [...daBarra, ...doTopo]) {
      assert.strictEqual(link.chave, chaveEsperada(link.alvo), `${pagina}: ${link.rotulo}`);
    }
  }

  // O "Desafio" do topo é a entrada do documento CBL, que não tem item na barra.
  const topo = linksComChave('index.html', navDoTopo(arquivos.get('index.html')));
  assert.deepStrictEqual(topo.map((l) => [l.rotulo, l.chave]), [
    ['Desafio', 'documento-cbl'],
    ['Tarefas', 'tarefas'],
    ['Registros', 'registros'],
    ['Galeria', 'galeria'],
  ]);
});

// MARK: - construirNovidades e o manifesto

test('gerar() chama o construirNovidades uma vez, com o site e o contexto do repositório', () => {
  assert.strictEqual(chamadas.length, 1);
  const [args] = chamadas;
  assert.strictEqual(args.site, site);
  assert.strictEqual(args.repoRaiz, CONTEXTO.repoRaiz);
  assert.strictEqual(args.binario, CONTEXTO.binario);
  assert.strictEqual(args.agora, AGORA);
  assert.deepStrictEqual(args.tokens, lerTokens());
  // Os avisos não fatais do construir aparecem no log do build.
  assert.ok(avisos.some((a) => a.includes('aviso de teste: diário de 17/09 fora da base')), avisos.join('\n'));
});

/** O manifesto embutido na página, lido como o navegador leria. */
function manifesto(html) {
  const blocos = [...html.matchAll(/<script type="application\/json" id="nov-manifesto">([\s\S]*?)<\/script>/g)];
  assert.strictEqual(blocos.length, 1, 'esperava um manifesto por página');
  return { cru: blocos[0][1], dados: JSON.parse(blocos[0][1]) };
}

const CAMPOS_DA_PAGINA = ['h', 'hb', 'temBase', 't', 'nova', 'conta', 'titulo', 'href', 'grupo'];

test('o manifesto traz as páginas que contam, mais a atual, na forma combinada', () => {
  const contam = site.paginasDeDocumento().filter((d) => d.conta).map((d) => d.chave).sort();
  assert.strictEqual(contam.length, 16);
  const versao = JSON.parse(arquivos.get('versao.json')).versao;

  const casos = [
    ['index.html', 'documento-cbl', []],
    [arquivo(CBL[1]), 'documento-cbl', []],
    [arquivo(VISAO), chaveDaNota(VISAO), []],
    [arquivo(LEIA_PRIMEIRO), chaveDaNota(LEIA_PRIMEIRO), [chaveDaNota(LEIA_PRIMEIRO)]],
    [arquivo(TAREFA), chaveDaNota(TAREFA), [chaveDaNota(TAREFA)]],
    ['tarefas.html', 'tarefas', []],
    ['registros.html', 'registros', []],
    ['novidades.html', 'novidades', []],
  ];
  const { conteudo } = JSON.parse(arquivos.get('versao.json'));
  for (const [pagina, atual, extras] of casos) {
    const { dados } = manifesto(arquivos.get(pagina));
    assert.deepStrictEqual(Object.keys(dados), ['v', 'versao', 'conteudo', 'gerado', 'base', 'atual', 'paginas'], pagina);
    assert.strictEqual(dados.v, 1, pagina);
    assert.strictEqual(dados.versao, versao, pagina);
    assert.strictEqual(dados.conteudo, conteudo, pagina);
    // No mesmo formato do `t` que o construir manda, para as datas do
    // manifesto se compararem entre si.
    assert.strictEqual(dados.gerado, '2026-09-24T18:00:00.000Z', pagina);
    assert.deepStrictEqual(dados.base, BASE, pagina);
    assert.strictEqual(dados.atual, atual, pagina);
    assert.deepStrictEqual(Object.keys(dados.paginas).sort(), [...contam, ...extras].sort(), pagina);
    for (const [chave, entrada] of Object.entries(dados.paginas)) {
      assert.deepStrictEqual(Object.keys(entrada), CAMPOS_DA_PAGINA, `${pagina}: ${chave}`);
    }
  }

  // As entradas juntam o que o construir mediu com o que o site sabe da página.
  // O título é o rótulo que a barra mostra.
  const { dados } = manifesto(arquivos.get(arquivo(TAREFA)));
  assert.deepStrictEqual(dados.paginas[chaveDaNota(VISAO)], {
    h: 'h-visao', hb: 'hb-visao', temBase: true, t: '2026-09-22T16:00:00.000Z', nova: false,
    conta: true, titulo: 'Documento de Visão', href: arquivo(VISAO), grupo: 'produto',
  });
  assert.deepStrictEqual(dados.paginas[chaveDaNota(ESCOPO)], {
    h: 'h-escopo', hb: null, temBase: false, t: '2026-09-23T13:00:00.000Z', nova: true,
    conta: true, titulo: 'Escopo do MVP', href: arquivo(ESCOPO), grupo: 'produto',
  });
  assert.deepStrictEqual(dados.paginas['documento-cbl'], {
    h: 'h-cbl', hb: 'hb-cbl', temBase: true, t: '2026-09-21T12:00:00.000Z', nova: false,
    conta: true, titulo: 'Documento Oficial CBL', href: 'index.html', grupo: null,
  });
  const tarefa = dados.paginas[chaveDaNota(TAREFA)];
  assert.deepStrictEqual([tarefa.conta, tarefa.grupo, tarefa.href], [false, null, arquivo(TAREFA)]);
});

test('o manifesto chega inteiro dentro do <script>, mesmo com título que o fecharia', () => {
  for (const [pagina, html] of paginas()) {
    const { cru, dados } = manifesto(html);
    assert.ok(!cru.includes('<'), `${pagina}: "<" cru no manifesto`);
    const classes = dados.paginas['notas/07-arquitetura-diagrama-de-classe'];
    assert.strictEqual(classes.titulo, 'Classes </script> & "entidades"', pagina);
  }
});

/** O texto de um trecho de HTML, com as entidades que o `escapar` produz de volta. */
const textoDoHtml = (trecho) => trecho
  .replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .trim();

test('o título de cada página no manifesto é o rótulo da barra, sem o ponto literal', () => {
  const PONTO = String.fromCharCode(0xb7);
  const FINO = String.fromCharCode(0x2009);

  for (const [pagina, html] of paginas()) {
    const { dados } = manifesto(html);
    for (const [chave, entrada] of Object.entries(dados.paginas)) {
      assert.ok(!entrada.titulo.includes(PONTO), `${pagina}: ${chave} → ${entrada.titulo}`);
    }
    // O mesmo texto que o leitor vê no link da barra (DESIGN.md §2.5: o
    // ponto de metadado é um span, nunca o caractere).
    for (const [, href, , miolo] of barra(html).matchAll(/<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)) {
      const chave = resolver(pagina, href).replace(/\.html$/, '');
      if (chave === 'novidades') continue;
      assert.strictEqual(dados.paginas[chave].titulo, textoDoHtml(miolo), `${pagina}: ${chave}`);
    }
  }

  // Fora da barra, onde o rótulo separaria id e título com o ponto, volta o
  // travessão com espaços finos do .cbl-travessao.
  const tarefa = site.paginasDeDocumento().find((d) => d.chave === chaveDaNota(TAREFA));
  assert.strictEqual(tarefa.titulo, `T-0011${FINO}—${FINO}Alinhar escopo e fluxos do protótipo de baixa fidelidade`);
  for (const d of site.paginasDeDocumento()) assert.ok(!d.titulo.includes(PONTO), `${d.chave} → ${d.titulo}`);
});

test('toda página carrega o novidades.js e o referencias.js do lugar certo, depois do manifesto', () => {
  for (const [pagina, html] of paginas()) {
    const base = pagina.startsWith('notas/') ? '../' : '';
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]*)"[^>]*><\/script>/g)];
    assert.deepStrictEqual(
      scripts.map(([tag, src]) => [src, /\bdefer\b/.test(tag)]),
      [[`${base}novidades.js`, true], [`${base}referencias.js`, true]],
      pagina
    );
    assert.ok(html.indexOf('id="nov-manifesto"') < html.indexOf('novidades.js'), pagina);
  }
});

test('o aviso ao vivo chega só como marcação: quem consulta o versao.json é o novidades.js', () => {
  for (const [pagina, html] of paginas()) {
    assert.match(html, /<div id="atualizacao" hidden role="status" aria-live="polite">[\s\S]*?<button type="button"[^>]*>Atualizar<\/button>\s*<\/div>/, pagina);
    const embutidos = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, js]) => js);
    assert.ok(!embutidos.some((js) => js.includes('versao.json') || js.includes('setInterval')), `${pagina}: consulta embutida`);
  }
});

// MARK: - Arquivos do build: bases, versao.json, novidades.js e a página Novidades

test('cada base de 7 dias vira novidades/base/<chave>.html, do jeito que o construir mandou', () => {
  const visao = chaveDaNota(VISAO);
  const bases = [...arquivos.keys()].filter((nome) => nome.startsWith('novidades/base/')).sort();
  assert.deepStrictEqual(bases, ['novidades/base/documento-cbl.html', `novidades/base/${visao}.html`].sort());
  assert.strictEqual(
    arquivos.get(`novidades/base/${visao}.html`),
    `<div data-novidades-base data-novidades-chave="${visao}" data-novidades-em="${BASE.em}"><article>Visão de antes</article></div>`,
  );
  // Base não é página: não entra na contagem do build.
  assert.strictEqual(site.paginasEscritas, paginas().length);
  assert.strictEqual(site.basesEscritas, 2);
});

test('uma chave de base que sairia da pasta das bases é recusada', () => {
  const recusas = [];
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-gerador-base-'));
  try {
    const s = new Site(indice, lerTokens(), path.join(destino, 'vault'), path.join(destino, 'site'), false, {
      construirNovidades: () => ({
        paginas: {}, base: null, linhaDoTempo: null, avisos: [],
        basesHtml: { '../../fora': '<div>fora</div>', 'notas/Maiuscula': '<div>x</div>', 'notas/ok': '<div data-novidades-base>ok</div>' },
      }),
      avisar: (texto) => recusas.push(texto),
    });
    s.gerar();
    assert.ok(!fs.existsSync(path.join(destino, 'fora.html')));
    assert.deepStrictEqual(fs.readdirSync(path.join(destino, 'site', 'novidades', 'base', 'notas')), ['ok.html']);
    assert.strictEqual(recusas.filter((r) => r.includes('chave inválida')).length, 2, recusas.join('\n'));
  } finally {
    fs.rmSync(destino, { recursive: true, force: true });
  }
});

test('versao.json traz a versão, a do conteúdo, a hora do build e o h de todas as páginas', () => {
  const v = JSON.parse(arquivos.get('versao.json'));
  assert.deepStrictEqual(Object.keys(v), ['versao', 'conteudo', 'geradoEm', 'paginas']);
  assert.match(v.versao, /^[0-9a-f]{16}$/);
  assert.match(v.conteudo, /^[0-9a-f]{16}$/);
  assert.strictEqual(v.geradoEm, indice.geradoEm);

  // Todas, não só as que contam na barra: o aviso ao vivo também vale para
  // quem está lendo uma tarefa.
  const esperado = {};
  for (const d of site.paginasDeDocumento()) esperado[d.chave] = `h-${d.chave}`;
  Object.assign(esperado, { [chaveDaNota(VISAO)]: 'h-visao', [chaveDaNota(ESCOPO)]: 'h-escopo', 'documento-cbl': 'h-cbl' });
  assert.deepStrictEqual(v.paginas, esperado);
  assert.ok(Object.keys(v.paginas).includes(chaveDaNota(TAREFA)));
});

test('a versão muda quando o texto de uma página muda, e só então', () => {
  const versaoCom = (trocar) => {
    const { arquivos: a } = gerar({
      construirNovidades: (args) => {
        const r = construirDeMentira(args);
        trocar(r.paginas);
        return r;
      },
      avisar: () => {},
    });
    return JSON.parse(a.get('versao.json')).versao;
  };
  const original = versaoCom(() => {});
  assert.strictEqual(versaoCom(() => {}), original);
  assert.notStrictEqual(versaoCom((p) => { p['documento-cbl'].h = 'h-cbl-outro'; }), original);
  // O que a história diz (base, data) não é texto publicado: não muda a versão.
  assert.strictEqual(versaoCom((p) => { p['documento-cbl'].t = null; p['documento-cbl'].hb = 'outra'; }), original);
});

test('a versão do conteúdo muda com o índice, mesmo sem texto de documento mudar, e não com a hora do build', () => {
  const versaoDe = (indiceUsado) => {
    const { arquivos: a } = gerar({ construirNovidades: construirDeMentira, avisar: () => {} }, indiceUsado);
    return JSON.parse(a.get('versao.json'));
  };
  const original = versaoDe(indice);

  // Um fato novo nos registros não muda texto de documento nenhum, mas quem
  // está com registros.html aberto precisa saber que há coisa nova.
  const fatoNovo = { data: '2026-09-24', hora: '17:55', tipo: 'commit', autor: 'Cauê Carneiro', detalhe: 'teste' };
  const comFato = versaoDe({ ...indice, fatos: [fatoNovo] });
  assert.strictEqual(comFato.versao, original.versao);
  assert.notStrictEqual(comFato.conteudo, original.conteudo);

  // A hora do build muda a cada execução e não é conteúdo.
  assert.strictEqual(versaoDe({ ...indice, geradoEm: '2026-09-24T19:30:00Z' }).conteudo, original.conteudo);
});

test('novidades.js junta o núcleo e o cliente, nessa ordem, e é um script válido', () => {
  const vm = require('vm');
  const js = arquivos.get('novidades.js');
  let desde = 0;
  for (const nome of ['nucleo', 'cliente']) {
    const fonte = path.join(__dirname, '..', 'novidades', `${nome}.js`);
    // Sem uma das partes, o site sai sem o marca-texto ou sem o aviso ao
    // vivo: isso tem de aparecer no log do build, e não só na falta de efeito.
    const avisado = avisos.some((a) => a.includes(`scripts/novidades/${nome}.js`));
    if (!fs.existsSync(fonte)) {
      assert.ok(avisado, `${nome}.js falta e o build não avisou`);
      continue;
    }
    assert.ok(!avisado, `${nome}.js existe e o build avisou que falta`);
    const onde = js.indexOf(fs.readFileSync(fonte, 'utf8'), desde);
    assert.ok(onde >= desde, `${nome}.js fora do novidades.js, ou fora de ordem`);
    desde = onde;
  }
  assert.doesNotThrow(() => new vm.Script(js, { filename: 'novidades.js' }));
});

const PAGINA_NOVIDADES = path.join(__dirname, '..', 'novidades', 'pagina.js');

test('a página Novidades sai na raiz, com a barra, o manifesto e um título só', () => {
  const html = arquivos.get('novidades.html');
  assert.match(html, /<title>Novidades\b/);
  assert.match(html, /<link rel="stylesheet" href="estilo\.css">/);
  assert.strictEqual(manifesto(html).dados.atual, 'novidades');
  assert.strictEqual((html.match(/<h1\b/g) || []).length, 1);
});

test('o corpo da página Novidades é o que o pagina.js monta com a linha do tempo do construir', {
  skip: !fs.existsSync(PAGINA_NOVIDADES) && 'novidades/pagina.js ainda não existe',
}, () => {
  const { paginaNovidades } = require(PAGINA_NOVIDADES);
  assert.ok(arquivos.get('novidades.html').includes(paginaNovidades({ dias: [] })));

  // Sem história, o pagina.js recebe null e diz que a linha do tempo não veio.
  const { arquivos: falho } = gerar({ ...CONTEXTO, construirNovidades: () => { throw new Error('sem git'); }, avisar: () => {} });
  assert.ok(falho.get('novidades.html').includes(paginaNovidades(null)));
});

// MARK: - Quando a história falta

/** Os dois módulos do núcleo que o build usa para medir o texto. */
const MOTOR = ['html', 'nucleo'].map((m) => path.join(__dirname, '..', 'novidades', `${m}.js`));

test('se o construir falha, o site sai inteiro, sem base nem linha do tempo, e o log diz por quê', () => {
  const recebidos = [];
  const { arquivos: falho } = gerar({
    ...CONTEXTO,
    construirNovidades: () => { throw new Error('git: histórico raso demais'); },
    avisar: (texto) => recebidos.push(texto),
  });

  const nomes = [...falho.keys()];
  assert.deepStrictEqual(
    nomes.filter((n) => n.endsWith('.html') && !n.startsWith('novidades/')).sort(),
    paginas().map(([p]) => p).sort(),
  );
  assert.ok(recebidos.some((t) => t.includes('git: histórico raso demais')), recebidos.join('\n'));
  assert.deepStrictEqual(nomes.filter((n) => n.startsWith('novidades/base/')), []);
  assert.ok(falho.has('novidades.html') && falho.has('novidades.js'));

  const { dados } = manifesto(falho.get('index.html'));
  assert.strictEqual(dados.base, null);
  assert.strictEqual(Object.keys(dados.paginas).length, 16);
  for (const [chave, e] of Object.entries(dados.paginas)) {
    assert.deepStrictEqual([e.hb, e.temBase, e.nova, e.t], [null, false, false, null], chave);
  }
  const versao = JSON.parse(falho.get('versao.json'));
  assert.strictEqual(versao.versao, dados.versao);

  // O h não depende de história: sai do próprio build, e o navegador segue
  // comparando uma visita com a outra.
  if (MOTOR.every((m) => fs.existsSync(m))) {
    for (const [chave, h] of Object.entries(versao.paginas)) assert.match(String(h), /^[0-9a-f]{14}$/, chave);
  }
});

test('sem o construir, o h de cada página é o hash do texto que o leitor vê', {
  skip: !MOTOR.every((m) => fs.existsSync(m)) && 'novidades/html.js ou nucleo.js ainda não existe',
}, () => {
  const { blocosDeHtml } = require(MOTOR[0]);
  const { hashDeBlocos } = require(MOTOR[1]);
  const { site: s, arquivos: semHistoria } = gerar();
  const { paginas: hashes } = JSON.parse(semHistoria.get('versao.json'));

  for (const d of s.paginasDeDocumento()) {
    assert.match(String(hashes[d.chave]), /^[0-9a-f]{14}$/, d.chave);
    // Do mesmo jeito que o navegador: a página inteira, achando a raiz nela.
    // Nos três endereços do documento CBL, o mesmo h.
    for (const href of d.hrefs) {
      assert.strictEqual(hashDeBlocos(blocosDeHtml(semHistoria.get(href))), hashes[d.chave], `${d.chave} em ${href}`);
    }
  }
});

// MARK: - CSS e página única

/** Os quatro blocos de variáveis do CSS: o claro e o escuro, pelo sistema e pelo botão. */
function blocosDeTema(css) {
  const bloco = (re) => {
    const m = css.match(re);
    assert.ok(m, `bloco não encontrado: ${re}`);
    return m[1];
  };
  return {
    claro: bloco(/^:root \{([\s\S]*?)^\}/m),
    escuroDoSistema: bloco(/:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\}/),
    escuroDoBotao: bloco(/:root\[data-theme="dark"\] \{([\s\S]*?)\}/),
    claroDoBotao: bloco(/:root\[data-theme="light"\] \{([\s\S]*?)\}/),
  };
}

test('as cores de mudança saem nos dois temas, também quando o botão escolhe o tema', () => {
  const tokens = lerTokens();
  tokens.mudanca = {
    acrescimo: { claro: 'verde.profundo', escuro: 'verde.luz' },
    tinta: { claro: 'neutro.13', escuro: 'neutro.2' },
  };
  const { site: s, limpar } = siteSemGerar({}, tokens);
  try {
    const temas = blocosDeTema(s.css());
    const { verde, neutro } = tokens.primitivo;
    for (const bloco of [temas.claro, temas.claroDoBotao]) {
      assert.ok(bloco.includes(`--mudanca-acrescimo: ${verde.profundo};`), bloco);
      assert.ok(bloco.includes(`--mudanca-tinta: ${neutro[13]};`), bloco);
    }
    for (const bloco of [temas.escuroDoSistema, temas.escuroDoBotao]) {
      assert.ok(bloco.includes(`--mudanca-acrescimo: ${verde.luz};`), bloco);
      assert.ok(bloco.includes(`--mudanca-tinta: ${neutro[2]};`), bloco);
    }
  } finally {
    limpar();
  }
});

const CSS_NOVIDADES = path.join(__dirname, '..', 'estilo', 'novidades.css');

const CSS_REFERENCIAS = path.join(__dirname, '..', 'estilo', 'referencias.css');

test('o CSS do site termina com o novidades.css e, depois dele, o referencias.css', {
  skip: !fs.existsSync(CSS_NOVIDADES) && 'estilo/novidades.css ainda não existe',
}, () => {
  const css = arquivos.get('estilo.css').trimEnd();
  const referencias = fs.readFileSync(CSS_REFERENCIAS, 'utf8').trimEnd();
  assert.ok(css.endsWith(referencias));
  assert.ok(css.slice(0, -referencias.length).trimEnd().endsWith(fs.readFileSync(CSS_NOVIDADES, 'utf8').trimEnd()));
});

test('a página única fica fora do "O que há de novo"', () => {
  const { destino, limpar } = siteSemGerar();
  try {
    const tokens = lerTokens();
    tokens.mudanca = { acrescimo: { claro: 'verde.profundo', escuro: 'verde.luz' } };
    tokens.movimento = { ...tokens.movimento, leitura: 0.6 };
    const html = new Site(indice, tokens, path.join(destino, 'vault'), destino, true).htmlPaginaUnica();
    for (const vestigio of ['nov-manifesto', 'novidades.js', 'data-novidades', 'data-nov-', 'nov-resumo',
      'sidebar-novidades', 'data-chave', '--mudanca-', '--mov-leitura']) {
      assert.ok(!html.includes(vestigio), `página única com ${vestigio}`);
    }
  } finally {
    limpar();
  }
});
