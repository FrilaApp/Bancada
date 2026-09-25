// Linha do tempo da página Novidades, lida do git.
//
// Cada teste monta um repositório git descartável em `os.tmpdir()`, com datas
// de autor e de commit retroativas, e nunca lê o histórico real do projeto:
// um commit novo no vault não pode mudar o resultado de um teste que não mudou.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/historico.test.js

const { test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { lerLinhaDoTempo } = require('../novidades/historico');

// Git hermético: a configuração global de quem roda o teste (assinatura de
// commit, hooks, `log.showSignature`) não pode vazar para o resultado.
process.env.GIT_CONFIG_NOSYSTEM = '1';
process.env.GIT_CONFIG_GLOBAL = os.devNull;

const repos = [];
after(() => {
  for (const raiz of repos) fs.rmSync(raiz, { recursive: true, force: true });
});

function git(raiz, args, env = {}) {
  return execFileSync('git', args, { cwd: raiz, env: { ...process.env, ...env }, encoding: 'utf8' });
}

function criarRepo() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-historico-'));
  repos.push(raiz);
  git(raiz, ['init', '-q', '-b', 'main']);
  return raiz;
}

const CAUE = 'Cauê Carneiro <cauecarneiroc@gmail.com>';

function envDeAutor(autor, em) {
  const [, nome, email] = autor.match(/^(.*) <(.*)>$/);
  return {
    GIT_AUTHOR_NAME: nome, GIT_AUTHOR_EMAIL: email, GIT_AUTHOR_DATE: em,
    GIT_COMMITTER_NAME: nome, GIT_COMMITTER_EMAIL: email, GIT_COMMITTER_DATE: em,
  };
}

/**
 * Escreve (ou apaga, com `null`) os arquivos e faz um commit datado. `mover`
 * passa por `git mv` antes, para o git enxergar a renomeação.
 */
function commitar(raiz, { em, autor = CAUE, mensagem = 'Atualiza o vault', arquivos = {}, mover = [] }) {
  for (const [de, para] of mover) {
    fs.mkdirSync(path.dirname(path.join(raiz, para)), { recursive: true });
    git(raiz, ['mv', de, para]);
  }
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
  git(raiz, ['-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', mensagem], envDeAutor(autor, em));
  return git(raiz, ['rev-parse', 'HEAD']).trim();
}

/** `git merge --no-ff` datado, como o merge do vault que chega ao `main`. */
function fundir(raiz, ramo, { em, autor = CAUE, mensagem = `merge: ${ramo}` }) {
  git(raiz, ['-c', 'commit.gpgsign=false', 'merge', '-q', '--no-ff', '--no-verify', '-m', mensagem, ramo], envDeAutor(autor, em));
  return git(raiz, ['rev-parse', 'HEAD']).trim();
}

/**
 * O "site atual" de mentira: toda nota `.md` que existe hoje no vault do
 * repositório (`vault` é o caminho dele no repositório; '' é a raiz) é uma
 * página, com a chave igual ao caminho no vault sem `.md`.
 * Removida, a nota ainda ganha chave, mas sem título nem href: é o que o site
 * de verdade consegue dizer de uma página que não gera mais.
 */
function mapeador(raiz, vault = 'doc-harness') {
  const prefixo = vault ? `${vault}/` : '';
  return (caminho, { removida = false } = {}) => {
    if (caminho === 'Bancada/scripts/cbl-dados.json') {
      return { chave: 'documento-cbl', titulo: 'Documento CBL', href: 'index.html' };
    }
    if (!caminho.startsWith(prefixo) || !caminho.endsWith('.md')) return null;
    const chave = caminho.slice(prefixo.length, -'.md'.length);
    if (removida) return { chave, titulo: null, href: null };
    if (!fs.existsSync(path.join(raiz, caminho))) return null;
    return { chave, titulo: path.basename(chave), href: `notas/${chave}.html` };
  };
}

function nota(corpo, campos = { tipo: 'documento-produto' }) {
  const frontmatter = Object.entries(campos).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `---\n${frontmatter}\n---\n\n${corpo}\n`;
}

const AGORA = new Date('2026-09-24T12:00:00-03:00');
const ler = (raiz, extra = {}) => lerLinhaDoTempo({ repoRaiz: raiz, agora: AGORA, mapearCaminho: mapeador(raiz), ...extra });

test('uma nota nova vira uma entrada no dia dela, com autor, hora e a página como nova', () => {
  const raiz = criarRepo();
  const sha = commitar(raiz, {
    em: '2026-09-22T14:05:00-03:00',
    mensagem: 'Cria o documento de visão',
    arquivos: { 'doc-harness/Produto/Visão.md': nota('# Visão\n\nO Frila fecha turnos avulsos no DF.') },
  });

  const { dias, tPorChave } = ler(raiz);

  assert.deepStrictEqual(dias, [{
    data: '2026-09-22',
    rotulo: '22 de setembro',
    diario: null,
    entradas: [{
      sha: sha.slice(0, 7),
      quando: '2026-09-22T17:05:00.000Z',
      hora: '14:05',
      autores: ['Cauê Carneiro'],
      assunto: 'Cria o documento de visão',
      merge: false,
      paginas: [{ chave: 'Produto/Visão', titulo: 'Visão', href: 'notas/Produto/Visão.html', tipo: 'nova' }],
      transicoes: [],
    }],
  }]);
  assert.deepStrictEqual(tPorChave, { 'Produto/Visão': '2026-09-22T17:05:00.000Z' });
});

test('os dias são os de Brasília: 01h30 UTC ainda é o dia anterior', () => {
  const raiz = criarRepo();
  // Quinze dias antes de AGORA: fora da janela de 14.
  commitar(raiz, { em: '2026-09-09T12:00:00-03:00', arquivos: { 'doc-harness/Velha.md': nota('# Velha') } });
  commitar(raiz, { em: '2026-09-23T01:30:00Z', arquivos: { 'doc-harness/A.md': nota('# A') } });
  commitar(raiz, { em: '2026-09-23T12:00:00-03:00', arquivos: { 'doc-harness/B.md': nota('# B') } });
  commitar(raiz, { em: '2026-09-24T00:10:00-03:00', arquivos: { 'doc-harness/C.md': nota('# C') } });

  const { dias, tPorChave } = ler(raiz);

  // O rótulo é a data por extenso, nunca "Hoje" ou "Ontem": o site só é
  // gerado a cada push, e quem abre dois dias depois leria o dia errado.
  assert.deepStrictEqual(dias.map((d) => [d.data, d.rotulo, d.entradas.map((e) => e.hora)]), [
    ['2026-09-24', '24 de setembro', ['00:10']],
    ['2026-09-23', '23 de setembro', ['12:00']],
    ['2026-09-22', '22 de setembro', ['22:30']],
  ]);
  assert.strictEqual(tPorChave.A, '2026-09-23T01:30:00.000Z');
  assert.ok(!('Velha' in tPorChave));
});

test('o primeiro dia do mês se escreve 1º', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-10-01T09:00:00-03:00', arquivos: { 'doc-harness/A.md': nota('# A') } });

  const { dias } = ler(raiz, { agora: new Date('2026-10-05T12:00:00-03:00') });

  assert.deepStrictEqual(dias.map((d) => d.rotulo), ['1º de outubro']);
});

test('nota alterada conta pelo corpo ou por campo visível, nunca só por frontmatter técnico', () => {
  const raiz = criarRepo();
  const REQ = 'doc-harness/Requisitos.md';
  const tecnicos = { hash_origem: 'aaa', exportado_em: '2026-09-01T10:00', exportado_por: 'Cauê', data_criacao: '2026-09-01' };
  const campos = { tipo: 'documento-derivado', ...tecnicos, versao: 'v1.0' };
  const reexportados = { hash_origem: 'bbb', exportado_em: '2026-09-20T10:00', exportado_por: 'Júlia', data_criacao: '2026-09-02' };
  // Antes da janela: a nota já existia.
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { [REQ]: nota('# Requisitos\n\nRF01.', campos) } });
  commitar(raiz, {
    em: '2026-09-20T10:00:00-03:00', mensagem: 'Reexporta o documento de requisitos',
    arquivos: { [REQ]: nota('# Requisitos\n\nRF01.', { ...campos, ...reexportados }) },
  });
  commitar(raiz, {
    em: '2026-09-21T10:00:00-03:00', mensagem: 'Sobe a versão',
    arquivos: { [REQ]: nota('# Requisitos\n\nRF01.', { ...campos, ...reexportados, versao: 'v1.1' }) },
  });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Acrescenta o RF02',
    arquivos: { [REQ]: nota('# Requisitos\n\nRF01.\n\nRF02.', { ...campos, ...reexportados, versao: 'v1.1' }) },
  });

  const { dias, tPorChave } = ler(raiz);

  const entradas = dias.flatMap((d) => d.entradas);
  assert.deepStrictEqual(entradas.map((e) => [e.assunto, e.paginas.map((p) => `${p.chave} ${p.tipo}`)]), [
    ['Acrescenta o RF02', ['Requisitos alterada']],
    ['Sobe a versão', ['Requisitos alterada']],
  ]);
  assert.strictEqual(tPorChave.Requisitos, '2026-09-22T13:00:00.000Z');
});

test('status que muda numa tarefa vira transição, com o id da tarefa', () => {
  const raiz = criarRepo();
  const T11 = 'doc-harness/04 - Tarefas/T-0011 - Alinhar escopo do protótipo.md';
  const T12 = 'doc-harness/04 - Tarefas/T-0012 - Coletar decisões técnicas.md';
  const VISAO = 'doc-harness/Produto/Visão.md';
  const tarefa = (campos, corpo = '# Tarefa\n\n- [ ] Fechar o escopo.') => nota(corpo, { tipo: 'tarefa', ...campos });
  commitar(raiz, {
    em: '2026-09-01T10:00:00-03:00',
    arquivos: {
      [T11]: tarefa({ id: 'T-0011', status: 'a-fazer' }),
      // Sem `id` no frontmatter: o id sai do nome do arquivo.
      [T12]: tarefa({ status: 'revisao' }),
      [VISAO]: nota('# Visão', { tipo: 'documento-produto', status: 'rascunho' }),
    },
  });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Move a T-0011 e conclui a T-0012',
    arquivos: {
      [T11]: tarefa({ id: 'T-0011', status: 'em-andamento' }),
      [T12]: tarefa({ status: '"concluida"' }),
      // Documento com status não é tarefa: muda a página, sem transição.
      [VISAO]: nota('# Visão', { tipo: 'documento-produto', status: 'revisao' }),
    },
  });
  commitar(raiz, {
    em: '2026-09-23T10:00:00-03:00', mensagem: 'Marca um item da T-0011',
    arquivos: { [T11]: tarefa({ id: 'T-0011', status: 'em-andamento' }, '# Tarefa\n\n- [x] Fechar o escopo.') },
  });

  const entradas = ler(raiz).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas.map((e) => [e.assunto, e.transicoes, e.paginas.map((p) => p.chave)]), [
    ['Marca um item da T-0011', [], ['04 - Tarefas/T-0011 - Alinhar escopo do protótipo']],
    ['Move a T-0011 e conclui a T-0012', [
      { id: 'T-0011', de: 'a-fazer', para: 'em-andamento' },
      { id: 'T-0012', de: 'revisao', para: 'concluida' },
    ], [
      '04 - Tarefas/T-0011 - Alinhar escopo do protótipo',
      '04 - Tarefas/T-0012 - Coletar decisões técnicas',
      'Produto/Visão',
    ]],
  ]);
});

test('um merge vira uma entrada só, "N commits de X", com os autores do ramo pelo .mailmap', () => {
  const raiz = criarRepo();
  const [VISAO, NEGOCIO, ESCOPO] = ['Visão', 'Negócio', 'Escopo'].map((n) => `doc-harness/Produto/${n}.md`);
  commitar(raiz, {
    em: '2026-09-01T10:00:00-03:00',
    arquivos: {
      '.mailmap': 'Fabrício Tosta <fbtostadev@gmail.com>\nJúlia Clovandi <juhclovandi14@gmail.com>\n',
      [VISAO]: nota('# Visão\n\nPrimeira versão.'),
      [NEGOCIO]: nota('# Negócio\n\nPrimeira versão.'),
    },
  });
  git(raiz, ['checkout', '-q', '-b', 'vault']);
  commitar(raiz, { em: '2026-09-22T03:00:00-03:00', mensagem: 'Aplica as pendências', arquivos: { [VISAO]: nota('# Visão\n\nSegunda versão.') } });
  commitar(raiz, {
    em: '2026-09-22T03:30:00-03:00', autor: 'Júlia Clovandi Vasconcelos <juhclovandi14@gmail.com>',
    mensagem: 'Tira as metas de tempo', arquivos: { [NEGOCIO]: nota('# Negócio\n\nSegunda versão.') },
  });
  commitar(raiz, { em: '2026-09-22T10:32:00-03:00', mensagem: 'Espelha o Escopo do MVP', arquivos: { [ESCOPO]: nota('# Escopo') } });
  // Commit só de código no ramo: a linha do tempo é do vault, e ele não entra na conta.
  commitar(raiz, { em: '2026-09-22T11:00:00-03:00', mensagem: 'Refatora o gerador', arquivos: { 'Bancada/scripts/x.js': '1;\n' } });
  git(raiz, ['checkout', '-q', 'main']);
  const sha = fundir(raiz, 'vault', {
    em: '2026-09-22T15:57:05-03:00', autor: 'fbtostadev <fbtostadev@gmail.com>',
    mensagem: 'merge: sincronizar atualizacoes de documentos do vault em main',
  });

  const entradas = ler(raiz).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas, [{
    sha: sha.slice(0, 7),
    quando: '2026-09-22T18:57:05.000Z',
    hora: '15:57',
    autores: ['Cauê Carneiro', 'Júlia Clovandi'],
    assunto: '3 commits de Cauê Carneiro, Júlia Clovandi',
    merge: true,
    paginas: [
      { chave: 'Produto/Escopo', titulo: 'Escopo', href: 'notas/Produto/Escopo.html', tipo: 'nova' },
      { chave: 'Produto/Negócio', titulo: 'Negócio', href: 'notas/Produto/Negócio.html', tipo: 'alterada' },
      { chave: 'Produto/Visão', titulo: 'Visão', href: 'notas/Produto/Visão.html', tipo: 'alterada' },
    ],
    transicoes: [],
  }]);
});

test('renomear leva a página para a chave nova, e o status que muda junto vira transição', () => {
  const raiz = criarRepo();
  const [ESCOPO, ESCOPO_MVP] = ['doc-harness/Produto/Escopo.md', 'doc-harness/Produto/Escopo do MVP.md'];
  const [T11, T11_NOVA] = ['doc-harness/04 - Tarefas/T-0011 - Protótipo.md', 'doc-harness/04 - Tarefas/T-0011 - Protótipo de baixa fidelidade.md'];
  // Texto longo o bastante para o git reconhecer a renomeação mesmo com edição.
  const corpo = `# Escopo\n\n${'Uma frase inteira sobre o escopo do MVP do Frila.\n'.repeat(8)}`;
  commitar(raiz, {
    em: '2026-09-01T10:00:00-03:00',
    arquivos: { [ESCOPO]: nota(corpo), [T11]: nota(corpo, { tipo: 'tarefa', status: 'a-fazer' }) },
  });
  commitar(raiz, { em: '2026-09-21T10:00:00-03:00', mensagem: 'Renomeia o Escopo', mover: [[ESCOPO, ESCOPO_MVP]] });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Renomeia a T-0011 e começa por ela',
    mover: [[T11, T11_NOVA]],
    arquivos: { [T11_NOVA]: nota(`${corpo}Mais uma frase.\n`, { tipo: 'tarefa', status: 'em-andamento' }) },
  });

  const { dias, tPorChave } = ler(raiz);

  const entradas = dias.flatMap((d) => d.entradas);
  assert.deepStrictEqual(entradas.map((e) => [e.assunto, e.paginas.map((p) => `${p.chave} ${p.tipo}`), e.transicoes]), [
    ['Renomeia a T-0011 e começa por ela', ['04 - Tarefas/T-0011 - Protótipo de baixa fidelidade alterada'], [
      { id: 'T-0011', de: 'a-fazer', para: 'em-andamento' },
    ]],
    ['Renomeia o Escopo', ['Produto/Escopo do MVP alterada'], []],
  ]);
  assert.strictEqual(tPorChave['Produto/Escopo do MVP'], '2026-09-21T13:00:00.000Z');
  assert.ok(!('Produto/Escopo' in tPorChave));
});

test('renomear sem mudar a chave nem o texto não é novidade', () => {
  const raiz = criarRepo();
  const [COM_ACENTO, SEM_ACENTO] = ['doc-harness/Produto/Visão.md', 'doc-harness/Produto/Visao.md'];
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { [COM_ACENTO]: nota('# Visão\n\nO texto não muda.') } });
  commitar(raiz, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Tira o acento do nome', mover: [[COM_ACENTO, SEM_ACENTO]] });

  // Como no slug do site, o acento some da chave: os dois nomes dão a mesma página.
  const mapear = mapeador(raiz);
  const semAcento = (caminho, extra) => {
    const pagina = mapear(caminho, extra);
    return pagina && { ...pagina, chave: pagina.chave.normalize('NFD').replace(/[\u0300-\u036f]/g, '') };
  };

  assert.deepStrictEqual(ler(raiz, { mapearCaminho: semAcento }).dias, []);
});

test('nota apagada aparece como removida, com o título que tinha e sem link', () => {
  const raiz = criarRepo();
  const [PESQUISA, RASCUNHO, FOTO] = ['Pesquisa antiga.md', 'Rascunho.md', 'Anexos/foto.png'].map((n) => `doc-harness/Produto/${n}`);
  commitar(raiz, {
    em: '2026-09-01T10:00:00-03:00',
    arquivos: {
      [PESQUISA]: nota('# Pesquisa com bares da Asa Sul\n\nTexto.'),
      [RASCUNHO]: nota('# Rascunho do pitch', { tipo: 'documento-produto', titulo: '"Pitch da Apple Review"' }),
      [FOTO]: 'png',
    },
  });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Apaga a pesquisa antiga e o rascunho',
    arquivos: { [PESQUISA]: null, [RASCUNHO]: null, [FOTO]: null },
  });

  const { dias, tPorChave } = ler(raiz);

  assert.deepStrictEqual(dias.flatMap((d) => d.entradas).map((e) => e.paginas), [[
    { chave: 'Produto/Pesquisa antiga', titulo: 'Pesquisa com bares da Asa Sul', href: null, tipo: 'removida' },
    { chave: 'Produto/Rascunho', titulo: 'Pitch da Apple Review', href: null, tipo: 'removida' },
  ]]);
  // Página que não existe mais não tem "quando mudou".
  assert.deepStrictEqual(tPorChave, {});
});

test('registros, índices, templates, CLAUDE.md e .claude/ ficam fora, mesmo virando página', () => {
  const raiz = criarRepo();
  commitar(raiz, {
    em: '2026-09-21T10:00:00-03:00', mensagem: 'Mexe só no que não se lê',
    arquivos: {
      'doc-harness/05 - Registros/2026/09/2026-09-21.md': nota('- 10:00 fato'),
      'doc-harness/02 - Atualizações Diárias/00 - Índice Diário.md': nota('# Índice Diário'),
      'doc-harness/04 - Tarefas/Template - Tarefa.md': nota('# {{título da tarefa}}', { tipo: 'tarefa', status: 'a-fazer' }),
      'doc-harness/CLAUDE.md': '# Regras do vault\n',
      'doc-harness/.claude/agents/revisor.md': '# Revisor\n',
    },
  });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Registra o dia e cria a visão',
    arquivos: {
      'doc-harness/05 - Registros/2026/09/2026-09-22.md': nota('- 10:00 fato'),
      'doc-harness/Produto/Visão.md': nota('# Visão'),
    },
  });
  commitar(raiz, {
    em: '2026-09-23T10:00:00-03:00', mensagem: 'Promove o template a tarefa',
    mover: [['doc-harness/04 - Tarefas/Template - Tarefa.md', 'doc-harness/04 - Tarefas/T-0030 - Nova tarefa.md']],
  });

  const entradas = ler(raiz).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas.map((e) => [e.assunto, e.paginas.map((p) => `${p.chave} ${p.tipo}`)]), [
    ['Promove o template a tarefa', ['04 - Tarefas/T-0030 - Nova tarefa nova']],
    ['Registra o dia e cria a visão', ['Produto/Visão nova']],
  ]);
});

test('cada dia leva ao diário daquele dia, se o diário existir', () => {
  const raiz = criarRepo();
  const DIARIO = 'doc-harness/02 - Atualizações Diárias/2026/09/2026-09-21.md';
  commitar(raiz, {
    em: '2026-09-21T23:00:00-03:00', mensagem: 'Escreve o diário de 21/09',
    arquivos: { [DIARIO]: nota('# 2026-09-21', { tipo: 'atualizacao-diaria', data: '2026-09-21' }) },
  });
  commitar(raiz, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Cria a visão', arquivos: { 'doc-harness/Produto/Visão.md': nota('# Visão') } });

  const { dias } = ler(raiz);

  assert.deepStrictEqual(dias.map((d) => [d.data, d.diario]), [
    ['2026-09-22', null],
    ['2026-09-21', 'notas/02 - Atualizações Diárias/2026/09/2026-09-21.html'],
  ]);
});

test('mudar o cbl-dados.json é mudar o documento CBL', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { 'Bancada/scripts/cbl-dados.json': '{"bigIdea":"Trabalho"}\n' } });
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Troca a Big Idea',
    arquivos: { 'Bancada/scripts/cbl-dados.json': '{"bigIdea":"Freelancer"}\n', 'Bancada/scripts/cbl-documento.js': '// prosa\n' },
  });

  const { dias, tPorChave } = ler(raiz);

  assert.deepStrictEqual(dias.flatMap((d) => d.entradas).map((e) => [e.assunto, e.paginas]), [
    ['Troca a Big Idea', [{ chave: 'documento-cbl', titulo: 'Documento CBL', href: 'index.html', tipo: 'alterada' }]],
  ]);
  assert.strictEqual(tPorChave['documento-cbl'], '2026-09-22T13:00:00.000Z');
});

test('a página tocada duas vezes no mesmo commit aparece uma vez só', () => {
  const raiz = criarRepo();
  const [COM_ACENTO, SEM_ACENTO] = ['doc-harness/Produto/Visão.md', 'doc-harness/Produto/Visao.md'];
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { [COM_ACENTO]: nota('# Visão\n\nUm texto que vai embora inteiro.') } });
  // Texto todo novo: o git vê uma remoção e uma criação, não uma renomeação.
  commitar(raiz, {
    em: '2026-09-22T10:00:00-03:00', mensagem: 'Reescreve a visão',
    arquivos: { [COM_ACENTO]: null, [SEM_ACENTO]: nota('# Visão\n\nOutra coisa, do começo ao fim, sem nada do antigo.') },
  });
  const mapear = mapeador(raiz);
  const semAcento = (caminho, extra) => {
    const pagina = mapear(caminho, extra);
    return pagina && { ...pagina, chave: pagina.chave.normalize('NFD').replace(/[\u0300-\u036f]/g, '') };
  };

  const entradas = ler(raiz, { mapearCaminho: semAcento }).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas.map((e) => e.paginas), [[
    { chave: 'Produto/Visao', titulo: 'Visao', href: 'notas/Produto/Visao.html', tipo: 'alterada' },
  ]]);
});

test('num clone raso que corta a janela, a linha do tempo se recusa em vez de sair pela metade', () => {
  const origem = criarRepo();
  commitar(origem, { em: '2026-09-20T10:00:00-03:00', arquivos: { 'doc-harness/A.md': nota('# A'), 'doc-harness/B.md': nota('# B') } });
  commitar(origem, { em: '2026-09-21T10:00:00-03:00', mensagem: 'Altera a A', arquivos: { 'doc-harness/A.md': nota('# A\n\nMais texto.') } });
  commitar(origem, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Altera a B', arquivos: { 'doc-harness/B.md': nota('# B\n\nMais texto.') } });
  const raso = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-historico-raso-'));
  repos.push(raso);
  git(os.tmpdir(), ['clone', '-q', '--depth', '2', `file://${origem}`, raso]);

  // "Altera a A" é a borda: no clone ela não tem pai, e o git a mostraria
  // criando o vault inteiro. E o que veio antes dela, dentro da janela, falta.
  assert.throws(() => ler(raso), /clone raso/);
});

test('num clone raso cuja borda fica antes da janela, a linha do tempo sai inteira', () => {
  const origem = criarRepo();
  commitar(origem, { em: '2026-09-01T10:00:00-03:00', arquivos: { 'doc-harness/A.md': nota('# A') } });
  commitar(origem, { em: '2026-09-02T10:00:00-03:00', mensagem: 'Altera a A', arquivos: { 'doc-harness/A.md': nota('# A\n\nMais texto.') } });
  commitar(origem, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Cria a B', arquivos: { 'doc-harness/B.md': nota('# B') } });
  const raso = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-historico-raso-'));
  repos.push(raso);
  git(os.tmpdir(), ['clone', '-q', '--depth', '2', `file://${origem}`, raso]);

  const entradas = ler(raso).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas.map((e) => e.assunto), ['Cria a B']);
});

test('com relógio adiantado ou atrasado numa máquina, os dias saem do mais novo ao mais antigo', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-09-22T10:00:00-03:00', arquivos: { 'doc-harness/A.md': nota('# A') } });
  // Chega depois, com a data de um relógio atrasado.
  commitar(raiz, { em: '2026-09-21T10:00:00-03:00', arquivos: { 'doc-harness/B.md': nota('# B') } });
  commitar(raiz, { em: '2026-09-23T10:00:00-03:00', arquivos: { 'doc-harness/C.md': nota('# C') } });

  assert.deepStrictEqual(ler(raiz).dias.map((d) => d.data), ['2026-09-23', '2026-09-22', '2026-09-21']);
});

test('um commit com relógio muito atrasado no meio do main não corta a janela', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-09-20T10:00:00-03:00', mensagem: 'Cria a A', arquivos: { 'doc-harness/A.md': nota('# A') } });
  // Chega depois da A, com a data de um relógio parado em 1º de setembro. O
  // `--since` do git para de andar no primeiro commit mais velho que o corte.
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', mensagem: 'Cria a B', arquivos: { 'doc-harness/B.md': nota('# B') } });
  commitar(raiz, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Cria a C', arquivos: { 'doc-harness/C.md': nota('# C') } });

  const assuntos = ler(raiz).dias.flatMap((d) => d.entradas).map((e) => e.assunto);

  // A B fica de fora pela data que traz; a A, que veio antes dela, não.
  assert.deepStrictEqual(assuntos, ['Cria a C', 'Cria a A']);
});

test('criar o cbl-dados.json altera o documento CBL, que já existia: nova é só a nota que nasce no vault', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { 'doc-harness/Desafio/C18.md': nota('# C18') } });
  // Como o 6508968: a capa já mostrava o CBL, e os dados passam a vir do JSON.
  commitar(raiz, { em: '2026-09-21T19:44:00-03:00', mensagem: 'Transforma o documento CBL', arquivos: { 'Bancada/scripts/cbl-dados.json': '{}\n' } });

  assert.deepStrictEqual(ler(raiz).dias.flatMap((d) => d.entradas).map((e) => e.paginas.map((p) => `${p.chave} ${p.tipo}`)), [
    ['documento-cbl alterada'],
  ]);
});

test('o merge que importa o histórico de outro repositório (subtree) não vira uma enxurrada de páginas novas', () => {
  const raiz = criarRepo();
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { 'Bancada/README.md': 'Bancada\n' } });
  // O vault tinha repositório próprio, com as notas na raiz.
  git(raiz, ['checkout', '-q', '--orphan', 'vault-antigo']);
  git(raiz, ['rm', '-rq', '--cached', '.']);
  fs.rmSync(path.join(raiz, 'Bancada'), { recursive: true });
  commitar(raiz, { em: '2026-09-05T10:00:00-03:00', arquivos: { 'Visão.md': nota('# Visão'), 'Negócio.md': nota('# Negócio') } });
  git(raiz, ['checkout', '-q', '-f', 'main']);
  // Como o 59a7c9f: as notas entram em doc-harness/, com o histórico junto.
  const env = envDeAutor('Jota Pe <jotape@Jotas-MacBook-Pro.local>', '2026-09-11T15:17:00-03:00');
  git(raiz, ['merge', '-q', '-s', 'ours', '--no-commit', '--allow-unrelated-histories', 'vault-antigo'], env);
  git(raiz, ['read-tree', '--prefix=doc-harness/', '-u', 'vault-antigo'], env);
  git(raiz, ['-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'Merge histórico de doc-harness como subdiretório'], env);
  commitar(raiz, { em: '2026-09-22T10:00:00-03:00', mensagem: 'Revisa a visão', arquivos: { 'doc-harness/Visão.md': nota('# Visão\n\nRevista.') } });

  const entradas = ler(raiz).dias.flatMap((d) => d.entradas);

  assert.deepStrictEqual(entradas.map((e) => e.assunto), ['Revisa a visão']);
});

test('a edição de antes de uma renomeação ou remoção na janela continua, na página de hoje', () => {
  const raiz = criarRepo();
  const [ESCOPO, ESCOPO_MVP, PESQUISA] = ['Escopo', 'Escopo do MVP', 'Pesquisa'].map((n) => `doc-harness/Produto/${n}.md`);
  const escopo = (extra = '') => nota(`# Escopo\n\n${'Uma frase inteira sobre o escopo do MVP do Frila.\n'.repeat(8)}${extra}`);
  commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { [ESCOPO]: escopo(), [PESQUISA]: nota('# Pesquisa\n\nTexto.') } });
  commitar(raiz, { em: '2026-09-15T10:00:00-03:00', mensagem: 'Edita o escopo', arquivos: { [ESCOPO]: escopo('Mais uma frase.\n') } });
  commitar(raiz, { em: '2026-09-16T10:00:00-03:00', mensagem: 'Edita a pesquisa', arquivos: { [PESQUISA]: nota('# Pesquisa\n\nTexto revisto.') } });
  commitar(raiz, { em: '2026-09-20T10:00:00-03:00', mensagem: 'Renomeia o escopo', mover: [[ESCOPO, ESCOPO_MVP]] });
  commitar(raiz, { em: '2026-09-21T10:00:00-03:00', mensagem: 'Apaga a pesquisa', arquivos: { [PESQUISA]: null } });

  const { dias, tPorChave } = ler(raiz);

  assert.deepStrictEqual(dias.flatMap((d) => d.entradas).map((e) => [e.assunto, e.paginas.map((p) => `${p.chave} ${p.tipo} ${p.href}`)]), [
    ['Apaga a pesquisa', ['Produto/Pesquisa removida null']],
    ['Renomeia o escopo', ['Produto/Escopo do MVP alterada notas/Produto/Escopo do MVP.html']],
    // A página não existe mais: a edição fica, sem link.
    ['Edita a pesquisa', ['Produto/Pesquisa alterada null']],
    // A edição foi em Escopo.md, e a página hoje se chama Escopo do MVP.
    ['Edita o escopo', ['Produto/Escopo do MVP alterada notas/Produto/Escopo do MVP.html']],
  ]);
  assert.deepStrictEqual(tPorChave, { 'Produto/Escopo do MVP': '2026-09-20T13:00:00.000Z' });
});

test('nota que nasce e some na janela tem o mesmo título nas duas entradas', () => {
  const raiz = criarRepo();
  const RASCUNHO = 'doc-harness/Produto/Rascunho.md';
  commitar(raiz, { em: '2026-09-15T10:00:00-03:00', mensagem: 'Cria o rascunho', arquivos: { [RASCUNHO]: nota('# Rascunho do pitch\n\nTexto.') } });
  // Um commit no meio: a remoção não é filha direta da criação.
  commitar(raiz, { em: '2026-09-16T10:00:00-03:00', mensagem: 'Mexe no código', arquivos: { 'Bancada/scripts/x.js': '1;\n' } });
  commitar(raiz, { em: '2026-09-20T10:00:00-03:00', mensagem: 'Apaga o rascunho', arquivos: { [RASCUNHO]: null } });

  assert.deepStrictEqual(ler(raiz).dias.flatMap((d) => d.entradas).map((e) => e.paginas.map((p) => `${p.titulo} ${p.tipo} ${p.href}`)), [
    ['Rascunho do pitch removida null'],
    ['Rascunho do pitch nova null'],
  ]);
});

// O vault não precisa ser o `doc-harness` do monorepo: na Bancada do Mac, o
// "Gerar site" aponta para o vault que a pessoa escolher, no repositório dele.
for (const [onde, vault] of [['numa subpasta qualquer', 'Documentos/Meu Vault'], ['na raiz do repositório', '']]) {
  test(`vault ${onde}: exclusões, transições e diário valem do mesmo jeito`, () => {
    const raiz = criarRepo();
    const no = (caminho) => (vault ? `${vault}/${caminho}` : caminho);
    const T1 = no('04 - Tarefas/T-0001 - Primeira tarefa.md');
    commitar(raiz, { em: '2026-09-01T10:00:00-03:00', arquivos: { [T1]: nota('# Tarefa', { tipo: 'tarefa', status: 'a-fazer' }) } });
    commitar(raiz, {
      em: '2026-09-22T10:00:00-03:00', mensagem: 'Começa a T-0001 e escreve o diário',
      arquivos: {
        [T1]: nota('# Tarefa', { tipo: 'tarefa', status: 'em-andamento' }),
        [no('02 - Atualizações Diárias/2026/09/2026-09-22.md')]: nota('# 2026-09-22', { tipo: 'atualizacao-diaria' }),
        [no('05 - Registros/2026/09/2026-09-22.md')]: nota('- 10:00 fato'),
      },
    });

    const { dias } = ler(raiz, { vault, extras: [], mapearCaminho: mapeador(raiz, vault) });

    assert.deepStrictEqual(dias.map((d) => [d.data, d.diario, d.entradas.map((e) => [e.paginas.map((p) => `${p.chave} ${p.tipo}`), e.transicoes])]), [
      ['2026-09-22', 'notas/02 - Atualizações Diárias/2026/09/2026-09-22.html', [[
        ['02 - Atualizações Diárias/2026/09/2026-09-22 nova', '04 - Tarefas/T-0001 - Primeira tarefa alterada'],
        [{ id: 'T-0001', de: 'a-fazer', para: 'em-andamento' }],
      ]]],
    ]);
  });
}
