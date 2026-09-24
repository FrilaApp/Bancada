// Barra lateral e navegação do topo do site gerado.
//
// Roda o `Site.gerar()` de verdade contra um índice de mentira, montado com os
// caminhos e títulos reais do vault. De mentira por dois motivos: no CI este
// teste vem antes de compilar o `bancada-indice`, e um índice fixo impede que
// uma nota nova no vault quebre o teste sem que o gerador tenha quebrado.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/barra-lateral.test.js

const { test, before } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Site, SECOES } = require('../gerar-site');

const RAIZ_PROJETO = path.resolve(__dirname, '..', '..');
const DESAFIO = '01 - CBL/Desafios/C18';
const PRODUTO = `${DESAFIO}/Documentos de Produto`;

function nota(caminho, tipo, titulo, campos = {}) {
  return {
    caminho,
    tipo,
    titulo,
    corpo: `# ${titulo}\n\nTexto de teste com uma frase inteira para o gerador ler.\n`,
    campos: { tipo, desafio: 'C18', ...campos },
    tags: [],
    rotuloDoTipo: '',
    somenteLeitura: false,
  };
}

const CBL = [`${DESAFIO}/C18.md`, `${DESAFIO}/Documentos/CBL_C18.md`];
const AGENDA = `${DESAFIO}/Agenda - C18.md`;
const LEIA_PRIMEIRO = `${PRODUTO}/00-LEIA-PRIMEIRO.md`;
const README = `${PRODUTO}/README.md`;
const ROADMAP = '03 - Roadmap/Roadmap - Sumário de Iterações.md';
const DIARIOS = ['2026-09-17', '2026-09-18'].map((d) => `02 - Atualizações Diárias/2026/09/${d}.md`);
const DESIGN = ['06 - Design/Sistema de Design.md', '06 - Design/Revisão de UI - 2026-09-09.md'];

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
    nota(AGENDA, 'agenda', 'Agenda — C18'),
    nota(ROADMAP, 'roadmap', 'Roadmap — Sumário de Iterações'),
    nota(LEIA_PRIMEIRO, 'documento-produto', 'Frila — Leia primeiro'),
    nota(`${PRODUTO}/01-O-PROBLEMA.md`, 'documento-produto', 'Frila — O Problema'),
    nota(`${PRODUTO}/02-O-NEGOCIO.md`, 'documento-produto', 'Frila — O Negócio'),
    nota(`${PRODUTO}/03-ESPECIFICACAO-DO-PRODUTO.md`, 'documento-produto', 'Frila — Especificação do Produto'),
    nota(`${PRODUTO}/04-MERCADO-E-CONCORRENCIA.md`, 'documento-produto', 'Frila — Mercado e Concorrência'),
    nota(`${PRODUTO}/05-ESCOPO-DO-MVP.md`, 'documento-produto', 'Frila — Escopo do MVP'),
    nota(`${PRODUTO}/EVIDENCIAS.md`, 'documento-produto', 'Frila · Evidências'),
    nota(`${PRODUTO}/Frila_Documento_de_Requisitos.md`, 'documento-derivado', 'Frila_Documento_de_Requisitos'),
    nota(`${PRODUTO}/Frila_Documento_de_Visao.md`, 'documento-derivado', 'Frila_Documento_de_Visao'),
    nota(`${PRODUTO}/Frila_Historias_de_Usuario_e_Backlog.md`, 'documento-produto', 'Histórias de Usuário e Backlog do Produto — Frila'),
    nota(`${PRODUTO}/Frila_Roteiro_de_Validacao_de_Campo.md`, 'documento-produto', 'Roteiro e Protocolo de Validação de Campo no DF — Frila'),
    nota(README, 'documento-produto', 'Frila'),
    nota('07 - Arquitetura/Diagrama de Arquitetura.md', 'arquitetura', 'Diagrama de Arquitetura — Frila'),
    nota('07 - Arquitetura/Diagrama de Casos de Uso.md', 'arquitetura', 'Diagrama de Casos de Uso — Frila'),
    nota('07 - Arquitetura/Diagrama de Classe.md', 'arquitetura', 'Diagrama de Classe — Frila'),
    nota('07 - Arquitetura/Modelagem de Banco de Dados.md', 'arquitetura', 'Modelagem de Banco de Dados — Frila'),
    nota('07 - Arquitetura/Pendências Técnicas Para Codar.md', 'arquitetura', 'Pendências Técnicas — Antes de Colocar a Mão no Código'),
    ...DIARIOS.map((c) => nota(c, 'atualizacao-diaria', path.basename(c, '.md'), { data: path.basename(c, '.md') })),
    nota(DESIGN[0], 'design', 'Sistema de Design da Bancada'),
    nota(DESIGN[1], 'design', 'Revisão de UI da Bancada — 2026-09-09'),
  ],
};

// Gera uma vez, antes dos testes, e lê todas as páginas para a memória. Dentro
// do `before()`, um erro do gerador aparece como teste falho, e não como
// arquivo que nem carregou; o `finally` apaga o diretório temporário em
// qualquer caso. O vault não é lido: sem mídia no índice, `copiarMidia()` não
// tem o que copiar.
let site;
const paginas = new Map();

before(() => {
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-barra-'));
  try {
    const tokens = JSON.parse(fs.readFileSync(path.join(RAIZ_PROJETO, 'tokens.json'), 'utf8'));
    site = new Site(indice, tokens, path.join(destino, 'vault'), destino);
    site.gerar();
    (function ler(pasta) {
      for (const entrada of fs.readdirSync(path.join(destino, pasta), { withFileTypes: true })) {
        const relativo = pasta ? `${pasta}/${entrada.name}` : entrada.name;
        if (entrada.isDirectory()) ler(relativo);
        else if (entrada.name.endsWith('.html')) paginas.set(relativo, fs.readFileSync(path.join(destino, relativo), 'utf8'));
      }
    })('');
  } finally {
    fs.rmSync(destino, { recursive: true, force: true });
  }
});

const arquivo = (caminho) => site.arquivoDaNota(caminho);

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

/** Grupos da barra, na ordem em que aparecem, com os links de cada um. */
function grupos(html) {
  return [...barra(html).matchAll(/<details class="grupo"( open)? data-secao="([^"]+)">([\s\S]*?)<\/details>/g)]
    .map(([, aberto, secao, miolo]) => ({
      secao,
      aberto: Boolean(aberto),
      links: [...miolo.matchAll(/<a href="([^"]+)"([^>]*)><span>([^<]*)<\/span><\/a>/g)]
        .map(([, href, atributos, rotulo]) => ({ href, atributos, rotulo })),
    }));
}

/** Um `href` da página, resolvido para o caminho relativo à raiz do site. */
const resolver = (pagina, href) => path.posix.normalize(path.posix.join(path.posix.dirname(pagina), href));

test('toda página lista só Produto e Arquitetura na barra, com 10 e 5 itens', () => {
  const foraDaBarra = SECOES.filter((s) => !s.naBarra).map((s) => s.id);
  assert.deepStrictEqual(foraDaBarra, ['planejamento', 'diario', 'design']);
  assert.ok(paginas.size > 0);
  for (const [pagina, html] of paginas) {
    const gs = grupos(html);
    assert.deepStrictEqual(gs.map((g) => g.secao), ['produto', 'arquitetura'], pagina);
    assert.deepStrictEqual(gs.map((g) => g.links.length), [10, 5], pagina);
    assert.strictEqual((barra(html).match(/<a /g) || []).length, 15, pagina);
  }
});

test('o Produto segue a ordem de leitura combinada', () => {
  const [produto] = grupos(paginas.get('index.html'));
  assert.deepStrictEqual(produto.links.map((l) => l.rotulo), [
    'Documento de Visão',
    'Documento de Requisitos',
    'Histórias de Usuário e Backlog',
    'Escopo do MVP',
    'Especificação do Produto',
    'O Problema',
    'O Negócio',
    'Mercado e Concorrência',
    'Validação de Campo no DF',
    'Evidências',
  ]);
});

test('na capa, todo grupo chega fechado', () => {
  assert.deepStrictEqual(grupos(paginas.get('index.html')).filter((g) => g.aberto), []);
});

test('só o grupo da página atual chega aberto', () => {
  const casos = [
    [arquivo(`${PRODUTO}/Frila_Documento_de_Visao.md`), ['produto']],
    [arquivo(`${PRODUTO}/05-ESCOPO-DO-MVP.md`), ['produto']],
    [arquivo('07 - Arquitetura/Modelagem de Banco de Dados.md'), ['arquitetura']],
    // Página publicada, mas sem entrada na barra: nada abre.
    [arquivo(LEIA_PRIMEIRO), []],
    [arquivo(AGENDA), []],
    [arquivo(CBL[1]), []],
    ['tarefas.html', []],
  ];
  for (const [pagina, esperado] of casos) {
    const abertos = grupos(paginas.get(pagina)).filter((g) => g.aberto).map((g) => g.secao);
    assert.deepStrictEqual(abertos, esperado, pagina);
  }
  // E em toda página: aberto se, e só se, o grupo contém o link ativo.
  for (const [pagina, html] of paginas) {
    for (const g of grupos(html)) {
      const temAtivo = g.links.some((l) => l.atributos.includes('class="ativo"'));
      assert.strictEqual(g.aberto, temAtivo, `${pagina} (${g.secao})`);
    }
  }
});

test('na barra, o link da página atual leva aria-current="page", e só ele', () => {
  const pagina = arquivo('07 - Arquitetura/Diagrama de Classe.md');
  const atuais = grupos(paginas.get(pagina))
    .flatMap((g) => g.links)
    .filter((l) => l.atributos.includes('aria-current="page"'));
  assert.deepStrictEqual(atuais.map((l) => resolver(pagina, l.href)), [pagina]);
  assert.match(atuais[0].atributos, /class="ativo"/);

  for (const [p, html] of paginas) {
    for (const l of grupos(html).flatMap((g) => g.links)) {
      assert.strictEqual(l.atributos.includes('aria-current="page"'), l.atributos.includes('class="ativo"'), `${p}: ${l.href}`);
    }
  }
});

test('o documento CBL é reconhecido pelo nome exato do arquivo', () => {
  assert.deepStrictEqual(indice.notas.filter((n) => site.ehDocumentoCBL(n)).map((n) => n.caminho), CBL);
  // Casavam com o teste antigo por pedaço de nome (`endsWith('C18.md')`,
  // `includes('CBL_C18')`) e seriam publicadas como o documento CBL.
  const parecidas = [AGENDA, `${DESAFIO}/Retrospectiva - C18.md`, `${DESAFIO}/Documentos/CBL_C18 - rascunho.md`];
  for (const caminho of parecidas) assert.strictEqual(site.ehDocumentoCBL({ caminho }), false, caminho);
});

test('"Desafio" acende só na capa e nas duas páginas do documento CBL, com aria-current', () => {
  const acesas = [...paginas]
    .filter(([, html]) => /href="(?:\.\.\/)?index\.html" class="ativo"/.test(navDoTopo(html)))
    .map(([pagina]) => pagina)
    .sort();
  assert.deepStrictEqual(acesas, ['index.html', ...CBL.map(arquivo)].sort());
  for (const pagina of acesas) {
    assert.match(navDoTopo(paginas.get(pagina)), /index\.html" class="ativo" aria-current="page">Desafio</, pagina);
  }

  const apagadas = [AGENDA, `${PRODUTO}/Frila_Documento_de_Visao.md`, `${PRODUTO}/05-ESCOPO-DO-MVP.md`, LEIA_PRIMEIRO];
  for (const caminho of apagadas) {
    assert.doesNotMatch(navDoTopo(paginas.get(arquivo(caminho))), /class="ativo"|aria-current/, caminho);
  }

  // No topo, como na barra: aria-current anda junto com o .ativo, nunca sozinho.
  assert.match(navDoTopo(paginas.get('tarefas.html')), /href="tarefas\.html" class="ativo" aria-current="page">Tarefas</);
  for (const [pagina, html] of paginas) {
    const links = [...navDoTopo(html).matchAll(/<a href="[^"]+"([^>]*)>([^<]*)<\/a>/g)];
    const comAtivo = links.filter(([, atributos]) => atributos.includes('class="ativo"')).map(([, , rotulo]) => rotulo);
    const comAtual = links.filter(([, atributos]) => atributos.includes('aria-current="page"')).map(([, , rotulo]) => rotulo);
    assert.deepStrictEqual(comAtual, comAtivo, pagina);
  }
});

test('as notas fora da barra seguem publicadas, sem link na barra nem no topo', () => {
  const ocultas = [LEIA_PRIMEIRO, README, AGENDA, ROADMAP, ...DIARIOS, ...DESIGN].map(arquivo);
  for (const pagina of ocultas) assert.ok(paginas.has(pagina), `página não gerada: ${pagina}`);

  for (const [pagina, html] of paginas) {
    const hrefs = [...(barra(html) + navDoTopo(html)).matchAll(/href="([^"]+)"/g)].map((m) => resolver(pagina, m[1]));
    for (const oculta of ocultas) assert.ok(!hrefs.includes(oculta), `${pagina} aponta para ${oculta}`);
  }

  // Continuam geradas pela própria seção, com o mesmo cabeçalho de antes.
  const cabecalhos = [
    [LEIA_PRIMEIRO, 'PRODUTO', 'FRILA'],
    [AGENDA, 'PLANEJAMENTO', 'CBL C18'],
    [ROADMAP, 'PLANEJAMENTO', 'CBL C18'],
    [DIARIOS[0], 'DIÁRIO', 'DIÁRIO DE BORDO'],
    [DESIGN[0], 'DESIGN', 'SISTEMA DE DESIGN'],
  ];
  for (const [caminho, secao, sub] of cabecalhos) {
    const html = paginas.get(arquivo(caminho));
    assert.ok(html.includes(`<span class="cbl-eyebrow-item">${secao}</span>`), `${caminho}: sem eyebrow ${secao}`);
    assert.ok(html.includes(`<span class="cbl-eyebrow-item">${sub}</span>`), `${caminho}: sem eyebrow ${sub}`);
  }
});
