// Referências cruzadas: onde cada identificador é definido, como as citações
// viram link e como o navegador decide a prévia e a volta.
//
// Três blocos: o registro e o ligador (referencias/indice.js), o gerador
// inteiro contra um índice de mentira (wikilinks, referencias.json) e a
// lógica pura do cliente (referencias/cliente.js).
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/referencias.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ref = require('../referencias/indice');
const cliente = require('../referencias/cliente');
const { Site } = require('../gerar-site');

const REQUISITOS = 'notas/requisitos.html';
const MODELAGEM = 'notas/modelagem.html';
const BACKLOG = 'notas/backlog.html';

const tabela = (cabecalho, linhas) =>
  `<table><thead><tr>${cabecalho.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${linhas
    .map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;

const HTML_REQUISITOS = `<article>
<h2 id="2-1-regras">2.1 Regras</h2>
${tabela(['#', 'Regra', 'Contexto'], [
  ['<strong>RN01</strong>', 'O sistema NÃO DEVE descontar comissão do valor pago ao profissional pelo turno.', 'Concorrentes cobram.'],
  ['<strong>RN05</strong>', 'Uma vaga fecha quando todas as posições forem confirmadas pelo contratante.', 'Evita excesso.'],
  ['<strong>RN21</strong>', 'Um profissional NÃO DEVE ter dois turnos confirmados que se sobreponham.', 'Garantido no banco.'],
])}
<h2 id="3-1-lista">3.1 Lista</h2>
${tabela(['#', 'Requisito', 'Prioridade'], [
  ['<strong>RF01</strong>', 'O sistema deve permitir o cadastro por código enviado ao e-mail, sem senha (RN01).', 'Alta'],
])}
<h2 id="3-2-estimativas">3.2 Estimativas</h2>
${tabela(['#', 'Horas'], [['RF01', '12']])}
<p>A RN21 vale para o RF01 e para o <code>RN05</code>.</p>
</article>`;

const HTML_MODELAGEM = `<article>
<h2 id="garantias">Garantias</h2>
${tabela(['Regra', 'Como o banco garante', 'Mecanismo'], [['RN21', 'Sem sobreposição', 'EXCLUDE USING gist']])}
${tabela(['#', 'Decisão', 'Resposta'], [['D07', 'Onde roda o despacho', 'Fora da requisição: um job separado faz as notificações e os lembretes.']])}
<p>Ver D7 e a regra RN21.</p>
</article>`;

const HTML_BACKLOG = `<article>
<h4 id="us01-cadastro-simples">US01: Cadastro Simples</h4>
<p>Como profissional, quero me cadastrar sem senha, para receber vagas.</p>
<h4 id="us02-funcoes">US02 — Funções</h4>
<p>Como profissional, quero escolher funções.</p>
<p>A US01 depende da RN01. H1 é o nível de título, E2E é teste, UTF-8 é codificação, v1.2.0 é versão.</p>
<p>RF01/RN05 lado a lado.</p>
</article>`;

const DOCUMENTOS = [
  { arquivo: REQUISITOS, titulo: 'Documento de Requisitos', conteudo: HTML_REQUISITOS },
  { arquivo: MODELAGEM, titulo: 'Modelagem de Banco de Dados', conteudo: HTML_MODELAGEM },
  { arquivo: BACKLOG, titulo: 'Histórias de Usuário', conteudo: HTML_BACKLOG },
];
const TAREFAS = [{ id: 'T-0011', arquivo: 'notas/t-0011.html', titulo: 'Alinhar escopo', status: 'Em andamento', responsavel: 'Júlia Clovandi' }];

const registro = () => ref.construirRegistro({ documentos: DOCUMENTOS, tarefas: TAREFAS });

// MARK: - Definições

test('definição é a linha de tabela cuja primeira célula é só o identificador', () => {
  const defs = ref.definicoesDoHtml(HTML_REQUISITOS);
  assert.deepEqual(defs.map((d) => d.rotulo), ['RN01', 'RN05', 'RN21', 'RF01', 'RF01']);
  const rn01 = defs[0];
  assert.equal(rn01.chave, 'RN1');
  assert.equal(rn01.forma, 'linha');
  assert.equal(rn01.secao, '2.1 Regras');
  assert.equal(rn01.texto, 'O sistema NÃO DEVE descontar comissão do valor pago ao profissional pelo turno.');
  assert.equal(rn01.titulo, null);
});

test('coluna curta vira título, a longa vira texto e as curtas que sobram vão como detalhe', () => {
  const [rf01] = ref.definicoesDoHtml(HTML_REQUISITOS).filter((d) => d.rotulo === 'RF01');
  assert.deepEqual(rf01.detalhes, [{ rotulo: 'Prioridade', valor: 'Alta' }]);
  const [d7] = ref.definicoesDoHtml(HTML_MODELAGEM).filter((d) => d.rotulo === 'D07');
  assert.equal(d7.titulo, 'Onde roda o despacho');
  assert.match(d7.texto, /^Fora da requisição/);
});

test('definição também é o título que começa pelo identificador', () => {
  const defs = ref.definicoesDoHtml(HTML_BACKLOG);
  assert.deepEqual(defs.map((d) => [d.rotulo, d.ancora, d.titulo]), [
    ['US01', 'us01-cadastro-simples', 'Cadastro Simples'],
    ['US02', 'us02-funcoes', 'Funções'],
  ]);
  assert.equal(defs[0].texto, 'Como profissional, quero me cadastrar sem senha, para receber vagas.');
});

test('citação no meio da frase nunca é definição', () => {
  assert.deepEqual(ref.definicoesDoHtml('<p>A RN01 vale.</p><h2 id="x">Sobre a RN01</h2>'), []);
});

// MARK: - Registro

test('a casa de uma família é a página que mais a define, e vence a repetição de outra página', () => {
  const r = registro();
  assert.equal(r.ids.get('RN21').arquivo, REQUISITOS);
  assert.equal(r.ids.get('RN21').ancora, 'ref-rn21');
  assert.equal(r.ids.get('RN21').pagina, 'Documento de Requisitos');
  // A Modelagem repete RN21, mas a linha dela não ganha id.
  assert.deepEqual([...r.linhas.get(MODELAGEM).keys()], ['D7']);
});

test('RF01 e RF1, D07 e D7 são a mesma chave; a primeira ocorrência da página é a definição', () => {
  const r = registro();
  assert.equal(ref.chaveDoId('RF', '01'), ref.chaveDoId('RF', '1'));
  assert.equal(r.ids.get('D7').rotulo, 'D07');
  assert.equal(r.ids.get('RF1').secao, '3.1 Lista');
});

test('tarefa é definida pela própria página, com status e responsável', () => {
  const t = registro().ids.get('T-11');
  assert.deepEqual([t.arquivo, t.ancora, t.forma, t.status, t.responsavel], ['notas/t-0011.html', null, 'tarefa', 'Em andamento', 'Júlia Clovandi']);
});

test('as hipóteses H1 a H8 ficam de fora: nas revisões de design, H1 é nível de título', () => {
  const r = ref.construirRegistro({
    documentos: [{ arquivo: 'notas/roteiro.html', titulo: 'Roteiro', conteudo: tabela(['#', 'Hipótese'], [['H1', 'Bares sofrem desfalques pelo menos duas vezes por mês.']]) }],
  });
  assert.equal(r.ids.has('H1'), false);
});

// MARK: - Ligador

const ligar = (html, arquivo, extra = {}) => ref.ligarReferencias(html, { registro: registro(), arquivo, ...extra });

test('citação vira link para a definição, e da mesma página fica só o #', () => {
  const html = ligar(HTML_REQUISITOS, REQUISITOS);
  assert.match(html, /<p>A <a class="ref" href="#ref-rn21" data-ref="RN21">RN21<\/a> vale para o <a class="ref" href="#ref-rf01" data-ref="RF1">RF01<\/a>/);
  assert.match(html, /\(<a class="ref" href="#ref-rn01" data-ref="RN1">RN01<\/a>\)/);
});

test('a linha que define ganha id, e a célula do identificador não vira link para si mesma', () => {
  const html = ligar(HTML_REQUISITOS, REQUISITOS);
  assert.match(html, /<tr id="ref-rn01"><td data-ref-definicao><strong>RN01<\/strong><\/td>/);
  // Só a primeira linha de RF01 é definição; a da tabela de estimativas é citação.
  assert.equal((html.match(/id="ref-rf01"/g) || []).length, 1);
  assert.match(html, /<tr><td><a class="ref" href="#ref-rf01" data-ref="RF1">RF01<\/a><\/td><td>12<\/td><\/tr>/);
});

test('a repetição de outra página vira link para a casa', () => {
  const html = ligar(HTML_MODELAGEM, MODELAGEM);
  assert.match(html, /<td><a class="ref" href="requisitos.html#ref-rn21" data-ref="RN21">RN21<\/a><\/td>/);
  assert.match(html, /Ver <a class="ref" href="#ref-d07" data-ref="D7">D7<\/a>/);
});

test('código, título, cabeçalho, link e trecho ignorado ficam como estão', () => {
  const html = ligar(
    '<h2 id="a">RN01</h2><table><thead><tr><th>RN01</th></tr></thead></table><p><code>RN01</code> <a href="x.html">RN01</a> <span data-novidades="ignorar">RN01 <b>RN01</b></span> RN01</p>',
    BACKLOG
  );
  assert.equal((html.match(/class="ref"/g) || []).length, 1);
  assert.match(html, / <a class="ref" href="requisitos.html#ref-rn01" data-ref="RN1">RN01<\/a><\/p>$/);
});

test('só vira link o que alguém define, com as bordas certas', () => {
  const html = ligar(HTML_BACKLOG, BACKLOG);
  assert.match(html, /A <a class="ref" href="#us01-cadastro-simples" data-ref="US1">US01<\/a> depende da <a class="ref" href="requisitos.html#ref-rn01"/);
  for (const texto of ['H1 é', 'E2E', 'UTF-8', 'v1.2.0']) assert.ok(html.includes(texto), texto);
  assert.match(html, /<a class="ref"[^>]*>RF01<\/a>\/<a class="ref"[^>]*>RN05<\/a> lado a lado/);
});

test('o caminho do link é relativo à página que cita', () => {
  assert.equal(ref.caminhoRelativo('index.html', 'notas/x.html'), 'notas/x.html');
  assert.equal(ref.caminhoRelativo('notas/a.html', 'notas/x.html'), 'x.html');
  assert.equal(ref.caminhoRelativo('notas/a.html', 'tarefas.html'), '../tarefas.html');
  const html = ligar('<p>Ver T-0011.</p>', 'index.html');
  assert.match(html, /<a class="ref" href="notas\/t-0011.html" data-ref="T-11">T-0011<\/a>/);
});

test('a página da tarefa não se liga a si mesma', () => {
  assert.equal(ligar('<p>T-0011 segue.</p>', 'notas/t-0011.html'), '<p>T-0011 segue.</p>');
});

test('#seção que não existe no destino some do link; a que existe pede prévia', () => {
  const ancoras = new Map([[BACKLOG, new Set(['us01-cadastro-simples'])], [REQUISITOS, new Set(['2-1-regras'])]]);
  const pedidas = [];
  const html = ligar('<p><a href="backlog.html#sumiu">a</a> <a href="backlog.html#us01-cadastro-simples">b</a> <a href="#2-1-regras">c</a></p>', REQUISITOS, {
    ancorasPorArquivo: ancoras,
    aoLigar: (alvo) => pedidas.push(alvo),
  });
  assert.match(html, /<a href="backlog.html">a<\/a>/);
  assert.match(html, /<a href="backlog.html#us01-cadastro-simples">b<\/a>/);
  assert.deepEqual(pedidas, [`${BACKLOG}#us01-cadastro-simples`, `${REQUISITOS}#2-1-regras`]);
});

test('link de sumário é conferido, mas não pede prévia', () => {
  const ancoras = new Map([[REQUISITOS, new Set(['2-1-regras'])]]);
  const pedidas = [];
  ligar('<nav data-novidades="ignorar"><a href="#2-1-regras">2.1</a></nav>', REQUISITOS, {
    ancorasPorArquivo: ancoras,
    aoLigar: (alvo) => pedidas.push(alvo),
  });
  assert.deepEqual(pedidas, []);
});

test('ligar não muda uma letra do texto que o leitor vê', () => {
  const texto = (html) => html.replace(/<[^>]*>/g, '');
  for (const d of DOCUMENTOS) {
    assert.equal(texto(ligar(d.conteudo, d.arquivo)), texto(d.conteudo), d.arquivo);
  }
});

test('prévia de página e de seção', () => {
  assert.equal(ref.previaDaPagina('<header><p class="cbl-masthead-lead">O lead.</p></header><div class="narrativa"><p>Corpo.</p></div>'), 'O lead.');
  assert.equal(ref.previaDaPagina('<div class="narrativa"><p data-novidades="ignorar"></p><p>Corpo.</p></div>'), 'Corpo.');
  assert.deepEqual(ref.previaDaSecao(HTML_BACKLOG, 'us02-funcoes'), { titulo: 'US02 — Funções', texto: 'Como profissional, quero escolher funções.' });
});

// MARK: - Gerador

const DIARIO = '02 - Atualizações Diárias/2026/09/2026-09-18.md';
const REQ_MD = '01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos.md';
const MODELAGEM_MD = '07 - Arquitetura/Modelagem de Banco de Dados.md';
const TAREFA_MD = '04 - Tarefas/T-0011 - Alinhar escopo e fluxos do protótipo de baixa fidelidade.md';

function nota(caminho, tipo, titulo, corpo, campos = {}) {
  return { caminho, tipo, titulo, corpo, campos: { tipo, desafio: 'C18', ...campos }, tags: [], rotuloDoTipo: '', somenteLeitura: false };
}

function gerarSite() {
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
      nota('01 - CBL/Desafios/C18/C18.md', 'cbl-desafio', 'Challenge 18', '# Challenge 18\n\nTexto.\n'),
      nota(REQ_MD, 'documento-derivado', 'Frila_Documento_de_Requisitos',
        '# Requisitos\n\n## Regras\n\n| # | Regra | Contexto |\n|---|---|---|\n| **RN25** | Cada conta DEVE ter um único perfil, escolhido no cadastro e sem troca depois. | Simplicidade. |\n\nA RN25 vale em T-0011.\n'),
      // O índice traz o caminho como o Mac grava, em NFD; o wikilink, em NFC.
      nota(MODELAGEM_MD.normalize('NFD'), 'arquitetura', 'Modelagem de Banco de Dados — Frila',
        '# Modelagem\n\nAbertura com uma frase inteira.\n\n## Políticas de acesso (RLS)\n\nCada tabela liga o RLS.\n\nVer [[#Políticas de acesso (RLS)]] e [[#Seção que não existe|essa]].\n'),
      nota(DIARIO.normalize('NFD'), 'atualizacao-diaria', '2026-09-18',
        '# 18/09\n\nRevisada a RN25. Ver [[07 - Arquitetura/Modelagem de Banco de Dados#Políticas de acesso (RLS)|as políticas]], [[2026-09-18|o próprio dia]] e [[T-0011 - Alinhar escopo e fluxos do protótipo de baixa fidelidade|a tarefa]].\n',
        { data: '2026-09-18' }),
      nota(TAREFA_MD.normalize('NFD'), 'tarefa', 'T-0011 — Alinhar escopo e fluxos do protótipo de baixa fidelidade', '# T-0011\n\nTexto.\n',
        { id: 'T-0011', status: 'em-andamento', responsavel: '[[Júlia Clovandi]]' }),
    ],
  };
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'tokens.json'), 'utf8'));
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-referencias-'));
  try {
    const site = new Site(indice, tokens, path.join(destino, 'vault'), destino, false, { construirNovidades: null });
    site.gerar();
    const arquivos = new Map();
    (function ler(pasta) {
      for (const entrada of fs.readdirSync(path.join(destino, pasta), { withFileTypes: true })) {
        const relativo = pasta ? `${pasta}/${entrada.name}` : entrada.name;
        if (entrada.isDirectory()) ler(relativo);
        else if (/\.(html|js|json|css)$/.test(entrada.name)) arquivos.set(relativo, fs.readFileSync(path.join(destino, relativo), 'utf8'));
      }
    })('');
    return { site, ler: (nome) => arquivos.get(nome) };
  } finally {
    fs.rmSync(destino, { recursive: true, force: true });
  }
}

let gerado = null;
function comSite() {
  if (!gerado) gerado = gerarSite();
  return gerado;
}

test('gerador: wikilink com acento resolve mesmo com o índice em NFD, com #seção e pelo nome curto', () => {
  const { site, ler } = comSite();
  const diario = ler(site.arquivoDaNota(DIARIO.normalize('NFD')));
  const modelagem = path.basename(site.arquivoDaNota(MODELAGEM_MD.normalize('NFD')));
  assert.match(diario, new RegExp(`<a href="${modelagem}#politicas-de-acesso-rls">as políticas</a>`));
  assert.match(diario, /<a href="02-atualizacoes-diarias-2026-09-2026-09-18.html">o próprio dia<\/a>/);
  assert.match(diario, /<a href="04-tarefas-t-0011-[^"]+\.html">a tarefa<\/a>/);
  assert.ok(!diario.includes('link-ausente'));
});

test('gerador: [[#Seção]] leva à seção da própria página, com o nome dela; seção inexistente leva ao topo', () => {
  const { site, ler } = comSite();
  const html = ler(site.arquivoDaNota(MODELAGEM_MD.normalize('NFD')));
  assert.match(html, /<a href="#politicas-de-acesso-rls">Políticas de acesso \(RLS\)<\/a>/);
  assert.match(html, /<span class="link-ausente"[^>]*>essa<\/span>|<a href="#secao-que-nao-existe">essa<\/a>/);
});

test('gerador: citações do diário e da capa viram link, e o referencias.json descreve cada uma', () => {
  const { site, ler } = comSite();
  const diario = ler(site.arquivoDaNota(DIARIO.normalize('NFD')));
  assert.match(diario, /Revisada a <a class="ref" href="01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-requisitos.html#ref-rn25" data-ref="RN25">RN25<\/a>/);
  const requisitos = ler(site.arquivoDaNota(REQ_MD));
  assert.match(requisitos, /<tr id="ref-rn25"><td data-ref-definicao><strong>RN25<\/strong>/);
  assert.match(requisitos, /em <a class="ref" href="04-tarefas-t-0011-[^"]+\.html" data-ref="T-11">T-0011<\/a>/);

  const dados = JSON.parse(ler('referencias.json'));
  assert.equal(dados.v, 1);
  assert.deepEqual(
    { ...dados.ids.RN25, texto: undefined },
    {
      detalhes: [{ rotulo: 'Contexto', valor: 'Simplicidade.' }],
      rotulo: 'RN25',
      href: 'notas/01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-requisitos#ref-rn25',
      forma: 'linha',
      pagina: 'Documento de Requisitos',
      secao: 'Regras',
      titulo: null,
      texto: undefined,
      status: null,
      responsavel: null,
    }
  );
  assert.equal(dados.ids['T-11'].status, 'Em andamento');
  assert.equal(dados.ids['T-11'].responsavel, 'Júlia Clovandi');
  const secao = dados.secoes[`${site.arquivoDaNota(MODELAGEM_MD.normalize('NFD')).replace(/\.html$/, '')}#politicas-de-acesso-rls`];
  assert.deepEqual(secao, { pagina: 'Modelagem de Banco de Dados', titulo: 'Políticas de acesso (RLS)', texto: 'Cada tabela liga o RLS.' });
});

test('gerador: o referencias.js sai do cliente e toda página o carrega', () => {
  const { ler } = comSite();
  assert.ok(ler('referencias.js').includes(fs.readFileSync(path.join(__dirname, '..', 'referencias', 'cliente.js'), 'utf8')));
  assert.match(ler('index.html'), /<script defer src="referencias.js"><\/script>/);
  assert.match(ler('tarefas.html'), /<script defer src="referencias.js"><\/script>/);
});

// MARK: - Cliente

test('cliente: o endereço vira o do registro, sem .html, sem index e com a raiz do site', () => {
  assert.equal(cliente.normalizarCaminho('/notas/x.html', '/'), 'notas/x');
  assert.equal(cliente.normalizarCaminho('/notas/x', '/'), 'notas/x');
  assert.equal(cliente.normalizarCaminho('/', '/'), 'index');
  assert.equal(cliente.normalizarCaminho('/index.html', '/'), 'index');
  assert.equal(cliente.normalizarCaminho('/site/notas/x.html', '/site/'), 'notas/x');
  assert.equal(cliente.normalizarCaminho('/notas/a%C3%A7%C3%A3o', '/'), 'notas/ação');
  assert.equal(cliente.lugarDe('/notas/x.html', '#ref-rn25', '/'), 'notas/x#ref-rn25');
  assert.equal(cliente.lugarDe('/notas/x', '#', '/'), 'notas/x');
});

const saida = (id, de, para, extra = {}) => ({ id, de, para, titulo: 'Origem', mesmaPagina: false, ...extra });

test('cliente: ao chegar onde a saída apontava, a pílula oferece a volta', () => {
  const trilha = [saida('a', 'notas/x', 'notas/y#ref-rn25')];
  const r = cliente.aoChegar(trilha, 'notas/y#ref-rn25', null, null);
  assert.equal(r.mostrar.id, 'a');
  assert.equal(r.voltouPara, null);
  assert.equal(cliente.aoChegar(trilha, 'notas/z', null, null).mostrar, null);
});

test('cliente: ao voltar para a origem, a saída sai da trilha, e a anterior volta a valer', () => {
  const trilha = [saida('a', 'notas/x', 'notas/y'), saida('b', 'notas/y', 'notas/z#d6')];
  const r = cliente.aoChegar(trilha, 'notas/y', { refOrigem: 'b', refDestino: 'a' }, null);
  assert.equal(r.voltouPara.id, 'b');
  assert.deepEqual(r.trilha.map((e) => e.id), ['a']);
  assert.equal(r.mostrar.id, 'a');
});

test('cliente: a origem recarregada pela pílula também conta como volta', () => {
  const trilha = [saida('a', 'notas/x#ref-rf01', 'notas/y')];
  const r = cliente.aoChegar(trilha, 'notas/x#ref-rf01', null, 'a');
  assert.equal(r.voltouPara.id, 'a');
  assert.deepEqual(r.trilha, []);
});

test('cliente: estado velho no histórico não finge uma volta', () => {
  const trilha = [saida('a', 'notas/x', 'notas/y')];
  const r = cliente.aoChegar(trilha, 'notas/w', { refOrigem: 'a' }, null);
  assert.equal(r.voltouPara, null);
  assert.deepEqual(r.trilha.map((e) => e.id), ['a']);
});

test('cliente: a trilha guarda no máximo as últimas saídas', () => {
  let t = [];
  for (let i = 0; i < 25; i++) t = cliente.empilhar(t, { id: String(i) }, 20);
  assert.equal(t.length, 20);
  assert.equal(t[0].id, '5');
});

test('cliente: o rótulo da pílula diz para onde volta', () => {
  assert.equal(cliente.rotuloDaVolta({ titulo: 'Documento de Requisitos', mesmaPagina: false }), 'Voltar para Documento de Requisitos');
  assert.equal(cliente.rotuloDaVolta({ titulo: 'Documento de Requisitos', mesmaPagina: true }), 'Voltar para onde você estava');
  assert.equal(cliente.tituloCurto('Documento de Requisitos · Challenge 18'), 'Documento de Requisitos');
  assert.equal(cliente.tituloCurto('Modelagem de Banco de Dados · Frila · Challenge 18'), 'Modelagem de Banco de Dados');
});

test('cliente: a prévia fica abaixo do link, sobe quando não cabe e nunca sai da tela', () => {
  const tela = { width: 400, height: 800 };
  assert.deepEqual(cliente.posicionar({ top: 100, bottom: 120, left: 50 }, { width: 300, height: 150 }, tela), { top: 128, left: 50, lado: 'abaixo' });
  assert.deepEqual(cliente.posicionar({ top: 700, bottom: 720, left: 50 }, { width: 300, height: 150 }, tela), { top: 542, left: 50, lado: 'acima' });
  assert.equal(cliente.posicionar({ top: 100, bottom: 120, left: 380 }, { width: 300, height: 150 }, tela).left, 88);
  assert.equal(cliente.posicionar({ top: 100, bottom: 120, left: 2 }, { width: 300, height: 150 }, tela).left, 12);
});

test('cliente: o que a prévia mostra de cada tipo de link', () => {
  const dados = {
    ids: {
      RN25: { rotulo: 'RN25', href: 'notas/req#ref-rn25', forma: 'linha', pagina: 'Documento de Requisitos', secao: '2.1 Regras', titulo: null, texto: 'Cada conta…', detalhes: [{ rotulo: 'Prioridade', valor: 'Alta' }] },
      'T-11': { rotulo: 'T-0011', href: 'notas/t', forma: 'tarefa', pagina: 'Tarefa', titulo: 'Alinhar escopo', texto: '', status: 'Em andamento', responsavel: 'Júlia' },
    },
    paginas: { 'notas/modelagem': { titulo: 'Modelagem', grupo: 'Arquitetura', texto: 'Esquema.' } },
    secoes: { 'notas/modelagem#rls': { pagina: 'Modelagem', titulo: 'RLS', texto: 'Cada tabela.' } },
  };
  assert.deepEqual(cliente.montarPrevia(dados, { tipo: 'id', chave: 'RN25' }, 'notas/diario'), {
    id: 'RN25', contexto: ['Documento de Requisitos'], titulo: '', texto: 'Cada conta…', detalhes: [{ rotulo: 'Prioridade', valor: 'Alta' }],
  });
  assert.deepEqual(cliente.montarPrevia(dados, { tipo: 'id', chave: 'RN25' }, 'notas/req').contexto, ['Nesta página', '2.1 Regras']);
  assert.deepEqual(cliente.montarPrevia(dados, { tipo: 'id', chave: 'T-11' }, 'index'), {
    id: 'T-0011', contexto: ['Tarefa', 'Em andamento'], titulo: 'Alinhar escopo', texto: '', detalhes: [{ rotulo: 'Responsável', valor: 'Júlia' }],
  });
  assert.equal(cliente.montarPrevia(dados, { tipo: 'lugar', lugar: 'notas/modelagem#rls' }, 'index').titulo, 'RLS');
  assert.deepEqual(cliente.montarPrevia(dados, { tipo: 'lugar', lugar: 'notas/modelagem' }, 'index').contexto, ['Arquitetura']);
  // Link para a página em que já se está não tem o que mostrar.
  assert.equal(cliente.montarPrevia(dados, { tipo: 'lugar', lugar: 'notas/modelagem' }, 'notas/modelagem'), null);
  assert.equal(cliente.montarPrevia(dados, { tipo: 'id', chave: 'X9' }, 'index'), null);
  assert.equal(cliente.montarPrevia(null, { tipo: 'id', chave: 'RN25' }, 'index'), null);
});
