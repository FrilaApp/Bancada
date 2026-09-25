// A lógica pura do cliente do "O que há de novo" (novidades/cliente.js).
//
// O cliente roda no navegador, mas as regras que decidem alguma coisa não
// dependem do DOM: sessão e limite, ponto de novidade, chave da página,
// "Hoje"/"Ontem", aviso ao vivo e ordem de despejo dos snapshots. No Node, o
// arquivo exporta só essas funções.

const test = require('node:test');
const assert = require('node:assert/strict');
const cliente = require('../novidades/cliente');

const MIN = 60 * 1000;
const DIA = 24 * 60 * MIN;
const AGORA = Date.UTC(2026, 8, 24, 15, 0); // 24/09/2026 12:00 em São Paulo

test('sessão: a primeira visita abre uma sessão sem fim anterior', () => {
  assert.deepEqual(cliente.atualizarSessao(null, AGORA), { inicio: AGORA, ultima: AGORA, fimAnterior: null });
});

test('sessão: menos de 30 min parado continua a mesma sessão', () => {
  const sessao = { inicio: AGORA - 50 * MIN, ultima: AGORA - 29 * MIN, fimAnterior: AGORA - 3 * DIA };
  assert.deepEqual(cliente.atualizarSessao(sessao, AGORA), { inicio: AGORA - 50 * MIN, ultima: AGORA, fimAnterior: AGORA - 3 * DIA });
});

test('sessão: 30 min parado abre outra, e o fim da anterior é a última atividade', () => {
  const sessao = { inicio: AGORA - 2 * DIA, ultima: AGORA - 30 * MIN, fimAnterior: AGORA - 5 * DIA };
  assert.deepEqual(cliente.atualizarSessao(sessao, AGORA), { inicio: AGORA, ultima: AGORA, fimAnterior: AGORA - 30 * MIN });
});

test('sessão: estado estragado vira sessão nova', () => {
  assert.deepEqual(cliente.atualizarSessao({ ultima: 'ontem' }, AGORA), { inicio: AGORA, ultima: AGORA, fimAnterior: null });
});

test('limite: sem sessão anterior, são os últimos 7 dias', () => {
  assert.equal(cliente.limiteDaSessao({ inicio: AGORA, ultima: AGORA, fimAnterior: null }, AGORA), AGORA - 7 * DIA);
});

test('limite: o fim da sessão anterior, se for mais recente que 7 dias', () => {
  const sessao = { inicio: AGORA, ultima: AGORA, fimAnterior: AGORA - 2 * DIA };
  assert.equal(cliente.limiteDaSessao(sessao, AGORA), AGORA - 2 * DIA);
});

test('limite: nunca mais antigo que 7 dias', () => {
  const sessao = { inicio: AGORA, ultima: AGORA, fimAnterior: AGORA - 20 * DIA };
  assert.equal(cliente.limiteDaSessao(sessao, AGORA), AGORA - 7 * DIA);
});

// Regra do ponto (contrato): com estado, `aceito≠h || pend>0`; sem estado,
// `(nova || (hb && hb≠h)) && (t ?? gerado) > limite`.
const LIMITE = AGORA - 2 * DIA;
const GERADO = new Date(AGORA - 1 * DIA).toISOString();
const recente = new Date(AGORA - 1 * DIA).toISOString();
const antiga = new Date(AGORA - 5 * DIA).toISOString();

test('ponto com estado: aceitou o h de agora e não tem pendência, sem ponto', () => {
  assert.equal(cliente.temNovidade({ h: 'h1' }, { aceito: 'h1', pend: 0 }, LIMITE, GERADO), false);
});

test('ponto com estado: aceitou outro h, com ponto', () => {
  assert.equal(cliente.temNovidade({ h: 'h1' }, { aceito: 'h0', pend: 0 }, LIMITE, GERADO), true);
});

test('ponto com estado: trechos pendentes dão ponto mesmo com o h aceito', () => {
  assert.equal(cliente.temNovidade({ h: 'h1' }, { aceito: 'h1', pend: 2 }, LIMITE, GERADO), true);
});

test('ponto sem estado: mudou desde a base e depois do limite', () => {
  assert.equal(cliente.temNovidade({ h: 'h1', hb: 'h0', t: recente }, null, LIMITE, GERADO), true);
});

test('ponto sem estado: mudou antes do limite, sem ponto', () => {
  assert.equal(cliente.temNovidade({ h: 'h1', hb: 'h0', t: antiga }, null, LIMITE, GERADO), false);
});

test('ponto sem estado: página nova sem `t` usa o `gerado` do manifesto', () => {
  assert.equal(cliente.temNovidade({ h: 'h1', hb: null, nova: true, t: null }, null, LIMITE, GERADO), true);
});

test('ponto sem estado: igual à base, ou sem base e não nova, sem ponto', () => {
  assert.equal(cliente.temNovidade({ h: 'h1', hb: 'h1', t: recente }, null, LIMITE, GERADO), false);
  assert.equal(cliente.temNovidade({ h: 'h1', hb: null, nova: false, t: recente }, null, LIMITE, GERADO), false);
});

test('ponto: página sem hash nunca tem ponto', () => {
  assert.equal(cliente.temNovidade({ h: null, nova: true, t: recente }, null, LIMITE, GERADO), false);
  assert.equal(cliente.temNovidade({ h: null }, { aceito: 'x', pend: 3 }, LIMITE, GERADO), false);
});

// A chave da página vem de `data-novidades-chave`. O endereço é o plano B, e
// precisa dar a mesma chave com e sem `.html` (a Cloudflare tira a extensão).
test('chave do endereço: nota com e sem extensão', () => {
  assert.equal(cliente.chaveDoEndereco('/notas/07-arquitetura-diagrama-de-classe.html', '/'), 'notas/07-arquitetura-diagrama-de-classe');
  assert.equal(cliente.chaveDoEndereco('/notas/07-arquitetura-diagrama-de-classe', '/'), 'notas/07-arquitetura-diagrama-de-classe');
});

test('chave do endereço: a capa é o documento CBL', () => {
  assert.equal(cliente.chaveDoEndereco('/', '/'), 'documento-cbl');
  assert.equal(cliente.chaveDoEndereco('/index.html', '/'), 'documento-cbl');
  assert.equal(cliente.chaveDoEndereco('/index', '/'), 'documento-cbl');
});

test('chave do endereço: site servido de uma subpasta', () => {
  assert.equal(cliente.chaveDoEndereco('/site/notas/x.html', '/site/'), 'notas/x');
  assert.equal(cliente.chaveDoEndereco('/site/novidades', '/site/'), 'novidades');
});

test('chave do endereço: percent-encoding volta a texto', () => {
  assert.equal(cliente.chaveDoEndereco('/notas/caf%C3%A9.html', '/'), 'notas/café');
});

test('dia em São Paulo: 01:30 UTC ainda é o dia anterior', () => {
  assert.equal(cliente.diaEmSaoPaulo(Date.UTC(2026, 8, 25, 1, 30)), '2026-09-24');
  assert.equal(cliente.diaEmSaoPaulo(Date.UTC(2026, 8, 25, 3, 0)), '2026-09-25');
});

test('rótulo relativo: hoje, ontem e nada mais', () => {
  assert.equal(cliente.rotuloRelativo('2026-09-24', '2026-09-24'), 'Hoje');
  assert.equal(cliente.rotuloRelativo('2026-09-23', '2026-09-24'), 'Ontem');
  assert.equal(cliente.rotuloRelativo('2026-09-22', '2026-09-24'), null);
  assert.equal(cliente.rotuloRelativo('2026-09-25', '2026-09-24'), null);
});

test('rótulo relativo: ontem atravessa mês e ano', () => {
  assert.equal(cliente.rotuloRelativo('2026-08-31', '2026-09-01'), 'Ontem');
  assert.equal(cliente.rotuloRelativo('2025-12-31', '2026-01-01'), 'Ontem');
});

test('rótulo relativo: data malformada não vira rótulo', () => {
  assert.equal(cliente.rotuloRelativo('', '2026-09-24'), null);
  assert.equal(cliente.rotuloRelativo('24/09/2026', '2026-09-24'), null);
});

test('data curta: dia e mês abreviado em São Paulo, ano só se for outro', () => {
  assert.equal(cliente.dataCurta(Date.UTC(2026, 8, 22, 12), AGORA), '22 set');
  assert.equal(cliente.dataCurta(Date.UTC(2026, 8, 23, 1), AGORA), '22 set');
  assert.equal(cliente.dataCurta(Date.UTC(2025, 11, 30, 12), AGORA), '30 dez 2025');
});

// Aviso ao vivo, decisão B: o versao.json traz o h de todas as páginas; o
// manifesto inline, só as que contam e a atual.
const manifesto = {
  versao: 'v1',
  conteudo: 'c1',
  atual: 'notas/a',
  paginas: {
    'notas/a': { h: 'a1', conta: true },
    'notas/b': { h: 'b1', conta: true },
    'notas/c': { h: 'c1', conta: true },
  },
};

test('aviso: nada mudou, nada a dizer', () => {
  const versao = { versao: 'v1', conteudo: 'c1', paginas: { 'notas/a': 'a1', 'notas/b': 'b1', 'notas/c': 'c1' } };
  assert.equal(cliente.decidirAviso(manifesto, versao), null);
});

test('aviso: resposta inválida (a capa servida no lugar do JSON) não avisa', () => {
  assert.equal(cliente.decidirAviso(manifesto, null), null);
  assert.equal(cliente.decidirAviso(manifesto, 'x'), null);
});

test('aviso: o h da página atual mudou, "Esta página mudou."', () => {
  const versao = { versao: 'v2', conteudo: 'c2', paginas: { 'notas/a': 'a2', 'notas/b': 'b2', 'notas/c': 'c1' } };
  const decisao = cliente.decidirAviso(manifesto, versao);
  assert.deepEqual(decisao, { tipo: 'pagina' });
  assert.equal(cliente.textoDoAviso(decisao), 'Esta página mudou.');
});

test('aviso: mudaram outras páginas, com o número delas', () => {
  const duas = { versao: 'v2', conteudo: 'c2', paginas: { 'notas/a': 'a1', 'notas/b': 'b2', 'notas/c': 'c2' } };
  assert.deepEqual(cliente.decidirAviso(manifesto, duas), { tipo: 'paginas', n: 2 });
  assert.equal(cliente.textoDoAviso({ tipo: 'paginas', n: 2 }), 'Há novidades em 2 páginas.');
  assert.equal(cliente.textoDoAviso({ tipo: 'paginas', n: 1 }), 'Há novidades em 1 página.');
});

test('aviso: só o conteúdo do vault (tarefas, registros), o aviso genérico', () => {
  const versao = { versao: 'v1', conteudo: 'c2', paginas: { 'notas/a': 'a1', 'notas/b': 'b1', 'notas/c': 'c1' } };
  assert.deepEqual(cliente.decidirAviso(manifesto, versao), { tipo: 'conteudo' });
  assert.equal(cliente.textoDoAviso({ tipo: 'conteudo' }), 'Há conteúdo novo no vault.');
});

test('aviso: mudou só uma página fora do manifesto (uma tarefa), o aviso genérico', () => {
  const versao = { versao: 'v2', conteudo: 'c1', paginas: { 'notas/a': 'a1', 'notas/b': 'b1', 'notas/c': 'c1', 'notas/t': 't2' } };
  assert.deepEqual(cliente.decidirAviso(manifesto, versao), { tipo: 'conteudo' });
});

test('aviso: página que não é documento (tarefas.html) conta só as outras', () => {
  const m = Object.assign({}, manifesto, { atual: 'tarefas' });
  const versao = { versao: 'v2', conteudo: 'c2', paginas: { 'notas/a': 'a2', 'notas/b': 'b1', 'notas/c': 'c1' } };
  assert.deepEqual(cliente.decidirAviso(m, versao), { tipo: 'paginas', n: 1 });
});

test('despejo: o snapshot visto há mais tempo sai primeiro, e a página atual nunca', () => {
  const paginas = { a: { visto: 30 }, b: { visto: 10 }, c: {}, d: { visto: 20 } };
  assert.deepEqual(cliente.ordemDeDespejo(paginas, ['a', 'b', 'c', 'd'], ['b']), ['c', 'd', 'a']);
});

test('despejo: snapshot sem entrada no índice vai antes de todos', () => {
  assert.deepEqual(cliente.ordemDeDespejo({ a: { visto: 5 } }, ['a', 'orfao'], []), ['orfao', 'a']);
});

test('rótulos: chip com singular e plural', () => {
  assert.equal(cliente.rotuloDoChip('acrescimo', 1), '1 acréscimo');
  assert.equal(cliente.rotuloDoChip('acrescimo', 3), '3 acréscimos');
  assert.equal(cliente.rotuloDoChip('correcao', 2), '2 correções');
  assert.equal(cliente.rotuloDoChip('remocao', 1), '1 remoção');
});

test('rótulos: contagem da barra para leitor de tela', () => {
  assert.equal(cliente.rotuloDaContagem(1), 'Novidades, 1 página com novidade');
  assert.equal(cliente.rotuloDaContagem(3), 'Novidades, 3 páginas com novidade');
});

// A remoção inline entra logo depois do token anterior, sem espaço.
test('remoção inline: espaço antes quando cola numa palavra, depois quando a próxima começa palavra', () => {
  assert.deepEqual(cliente.espacosDaRemocao('a d', 1), { antes: true, depois: false });
  assert.deepEqual(cliente.espacosDaRemocao('foo, baz', 3), { antes: true, depois: false });
  assert.deepEqual(cliente.espacosDaRemocao('Texto do bloco', 0), { antes: false, depois: true });
  assert.deepEqual(cliente.espacosDaRemocao('Fim.', 4), { antes: true, depois: false });
  assert.deepEqual(cliente.espacosDaRemocao('(bar)', 1), { antes: false, depois: true });
});

test('remoção longa: 25 palavras, atravessar blocos ou sair entre blocos', () => {
  assert.equal(cliente.ehRemocaoLonga({ palavras: 3, antigoTexto: 'um dois três', remocao: { bloco: 0, offset: 4 } }), false);
  assert.equal(cliente.ehRemocaoLonga({ palavras: 25, antigoTexto: 'x', remocao: { bloco: 0, offset: 4 } }), true);
  assert.equal(cliente.ehRemocaoLonga({ palavras: 4, antigoTexto: 'fim de um\ncomeço', remocao: { bloco: 0, offset: 4 } }), true);
  assert.equal(cliente.ehRemocaoLonga({ palavras: 2, antigoTexto: 'bloco curto', remocao: { aposBloco: -1 } }), true);
});

// Chip: a próxima marca não lida da categoria abaixo da tela; em sequência,
// a seguinte à última visitada; no fim, volta ao começo. `cursor` é null
// sem navegação anterior, ou o índice do último candidato na posição da
// última marca visitada ou antes dela (-1: antes de todos).
test('chip: sem cursor, a primeira que não cabe inteira na tela', () => {
  assert.equal(cliente.escolherProximo([100, 700, 1500], null, 800), 2);
  assert.equal(cliente.escolherProximo([100, 900, 1500], null, 800), 1);
});

test('chip: sem cursor e todas acima ou dentro da tela, volta à primeira', () => {
  assert.equal(cliente.escolherProximo([100, 200], null, 800), 0);
});

test('chip: com cursor, a seguinte, dando a volta no fim', () => {
  assert.equal(cliente.escolherProximo([100, 900, 1500], 0, 800), 1);
  assert.equal(cliente.escolherProximo([100, 900, 1500], 2, 800), 0);
});

test('chip: cursor antes de todas (a visitada já foi lida), a primeira mesmo visível', () => {
  assert.equal(cliente.escolherProximo([100, 900, 1500], -1, 800), 0);
});

test('chip: sem candidatos, nenhum', () => {
  assert.equal(cliente.escolherProximo([], null, 800), -1);
});

// O rótulo do resumo: de quando é a referência do diff.
test('resumo: diff com a base de 7 dias buscada agora, "Nos últimos 7 dias"', () => {
  assert.deepEqual(cliente.referenciaDoResumo({ origem: '7d', em: AGORA - 7 * DIA }, null, AGORA, true), { tipo: '7d' });
});

test('resumo: snapshot de 7 dias guardado e ainda recente, "Nos últimos 7 dias"', () => {
  assert.deepEqual(cliente.referenciaDoResumo({ origem: '7d', em: AGORA - 7 * DIA }, { pend: 3 }, AGORA, false), { tipo: '7d' });
});

test('resumo: snapshot de 7 dias guardado há semanas, "Desde <data da base>"', () => {
  const em = AGORA - 20 * DIA;
  assert.deepEqual(cliente.referenciaDoResumo({ origem: '7d', em }, { pend: 3 }, AGORA, false), { tipo: 'desde', em });
});

test('resumo: visita que terminou com tudo lido, a data da última visita', () => {
  const estado = { aceito: 'h0', pend: 0, visto: AGORA - 1 * DIA };
  assert.deepEqual(cliente.referenciaDoResumo({ origem: 'visita', em: AGORA - 4 * DIA }, estado, AGORA, false), { tipo: 'visita', em: AGORA - 1 * DIA });
});

test('resumo: visita que deixou trechos pendentes, a data do snapshot', () => {
  const estado = { aceito: null, pend: 2, visto: AGORA - 1 * DIA };
  assert.deepEqual(cliente.referenciaDoResumo({ origem: 'visita', em: AGORA - 4 * DIA }, estado, AGORA, false), { tipo: 'visita', em: AGORA - 4 * DIA });
});

test('feed: ponto nas entradas depois da última visita à página Novidades', () => {
  const visto = Date.UTC(2026, 8, 23, 12);
  assert.equal(cliente.entradaNova('2026-09-23T13:00:00.000Z', visto, AGORA - 7 * DIA), true);
  assert.equal(cliente.entradaNova('2026-09-23T11:00:00.000Z', visto, AGORA - 7 * DIA), false);
});

test('feed: sem visita anterior, vale o limite da sessão', () => {
  assert.equal(cliente.entradaNova('2026-09-20T12:00:00.000Z', null, Date.UTC(2026, 8, 19)), true);
  assert.equal(cliente.entradaNova('2026-09-18T12:00:00.000Z', null, Date.UTC(2026, 8, 19)), false);
  assert.equal(cliente.entradaNova('não é data', null, 0), false);
});

// Guarda a entrada mais nova que a página mostrou, e não o relógio: quem
// recarrega pelo aviso ao vivo ainda vê o ponto no que chegou nesse meio-tempo.
test('feed: o visto passa a ser a entrada mais nova exibida, nunca volta atrás', () => {
  const emS = ['2026-09-22T10:00:00.000Z', '2026-09-24T13:24:35.000Z', '2026-09-23T20:12:30.000Z'];
  assert.equal(cliente.feedVistoDepois(null, emS), Date.parse('2026-09-24T13:24:35.000Z'));
  assert.equal(cliente.feedVistoDepois(Date.UTC(2026, 8, 25), emS), Date.UTC(2026, 8, 25));
  assert.equal(cliente.feedVistoDepois(123, []), 123);
});

// Marcas sob demanda: acima de LIMITE_TRECHOS trechos, a página abre limpa e
// o resumo oferece "Mostrar as marcas" e "Marcar como lida".
test('limite de trechos: 150', () => {
  assert.equal(cliente.LIMITE_TRECHOS, 150);
});

test('recolher: só acima do limite', () => {
  assert.equal(cliente.recolherMarcas(0), false);
  assert.equal(cliente.recolherMarcas(150), false);
  assert.equal(cliente.recolherMarcas(151), true);
  assert.equal(cliente.recolherMarcas(684), true);
});

test('rótulo recolhido: base de 7 dias', () => {
  assert.equal(cliente.textoDoRotulo({ tipo: '7d' }, 684, AGORA), 'Nos últimos 7 dias: esta página mudou muito (684 trechos).');
});

test('rótulo recolhido: desde a visita, com a data em São Paulo', () => {
  assert.equal(cliente.textoDoRotulo({ tipo: 'visita', em: Date.UTC(2026, 8, 22, 12) }, 200, AGORA), 'Desde sua visita de 22 set: esta página mudou muito (200 trechos).');
});

test('rótulo recolhido: desde a data de uma base antiga', () => {
  assert.equal(cliente.textoDoRotulo({ tipo: 'desde', em: Date.UTC(2026, 8, 4, 12) }, 151, AGORA), 'Desde 4 set: esta página mudou muito (151 trechos).');
});

test('rótulo recolhido: singular e milhar', () => {
  assert.equal(cliente.textoMudouMuito(1), 'esta página mudou muito (1 trecho).');
  assert.equal(cliente.textoMudouMuito(1024), 'esta página mudou muito (1.024 trechos).');
});

test('rótulo das marcas: o mesmo começo, sem a frase de mudou muito', () => {
  assert.equal(cliente.textoDoRotulo({ tipo: '7d' }, null, AGORA), 'Nos últimos 7 dias:');
  assert.equal(cliente.textoDoRotulo({ tipo: 'visita', em: Date.UTC(2026, 8, 22, 12) }, null, AGORA), 'Desde sua visita de 22 set:');
  assert.deepEqual(cliente.partesDoRotulo({ tipo: 'visita', em: 5 }, null), { antes: 'Desde sua visita de ', em: 5, depois: ':' });
});
