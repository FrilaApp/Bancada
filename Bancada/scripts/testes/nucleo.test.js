// Núcleo do "O que há de novo": normalização, tokens, hash, diff e leitura.
//
// O núcleo é puro e roda igual no Node e no navegador. Estes testes falam só
// com a API pública (`novidades/nucleo.js`), a mesma que o cliente usa.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/nucleo.test.js

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const N = require('../novidades/nucleo');

test('REGRAS descrevem a extração: blocos, separadores e o que fica de fora', () => {
  assert.ok(Number.isInteger(N.VERSAO_EXTRACAO) && N.VERSAO_EXTRACAO >= 1);
  const { tagsDeBloco, tagsSeparadoras, tagsIgnoradas, classesIgnoradas, atributosIgnorados, seletorIgnorado } = N.REGRAS;
  for (const tag of ['p', 'li', 'h1', 'h6', 'dt', 'dd', 'figcaption', 'pre', 'tr', 'div', 'blockquote', 'article']) {
    assert.ok(tagsDeBloco.includes(tag), tag);
  }
  // A linha da tabela é o bloco; célula e quebra de linha só separam palavras.
  assert.deepStrictEqual(tagsSeparadoras.slice().sort(), ['br', 'td', 'th']);
  assert.ok(!tagsDeBloco.includes('td') && !tagsDeBloco.includes('span'));
  for (const tag of ['script', 'style', 'svg', 'button', 'template']) assert.ok(tagsIgnoradas.includes(tag), tag);
  for (const classe of ['nov-sr', 'nov-removido', 'cbl-colofao', 'cbl-nav-ancoras', 'cbl-masthead-eyebrow']) {
    assert.ok(classesIgnoradas.includes(classe), classe);
  }
  assert.deepStrictEqual(atributosIgnorados, { 'data-novidades': 'ignorar', 'aria-hidden': 'true' });
  // O mesmo conjunto como seletor CSS, para o cliente usar com `closest()`.
  for (const parte of ['script', '.nov-sr', '.cbl-colofao', '[data-novidades="ignorar"]', '[aria-hidden="true"]']) {
    assert.ok(seletorIgnorado.split(',').includes(parte), parte);
  }
  assert.ok(Object.isFrozen(N.REGRAS));
});

test('normalizar troca nbsp, thin space e narrow nbsp por espaço comum e junta os espaços', () => {
  assert.strictEqual(N.normalizar('um turno — função ok'), 'um turno — função ok');
  assert.strictEqual(N.normalizar('  vários \n\t espaços  '), 'vários espaços');
});

test('normalizar tira hífen suave e caracteres de largura zero sem abrir espaço', () => {
  assert.strictEqual(N.normalizar('pala­vra​junta‌‍⁠﻿'), 'palavrajunta');
  assert.strictEqual(N.normalizar('﻿início'), 'início');
});

test('normalizar unifica travessões, hífens e aspas', () => {
  // Travessão, meia-risca, figure dash e barra horizontal viram o travessão.
  assert.strictEqual(N.normalizar('a – b ‒ c ― d — e'), 'a — b — c — d — e');
  // Hífen tipográfico, hífen inseparável e sinal de menos viram o hífen comum.
  assert.strictEqual(N.normalizar('pós‐venda T‑0011 −5'), 'pós-venda T-0011 -5');
  assert.strictEqual(N.normalizar('“Chamaria de novo?” «sim» „não“'), '"Chamaria de novo?" "sim" "não"');
  assert.strictEqual(N.normalizar('d’água ‘ok’ ‚x‛'), "d'água 'ok' 'x'");
});

test('normalizar compõe em NFC, mesmo com largura zero entre a letra e o acento', () => {
  assert.strictEqual(N.normalizar('Função'), 'Função');
  assert.strictEqual(N.normalizar('cafe‍́'), 'café');
  assert.strictEqual(N.normalizar('Å'), 'Å');
});

/** Só o que importa de cada token, para as asserções ficarem legíveis. */
const resumo = (s) => N.tokenizar(s).map((x) => (x.pont ? `[${x.t}]` : x.t));

test('tokenizar separa dinheiro, porcentagem e ids sem quebrar os números', () => {
  assert.deepStrictEqual(resumo('R$ 1,50'), ['R', '[$]', '1,50']);
  assert.deepStrictEqual(resumo('73,49%'), ['73,49', '[%]']);
  assert.deepStrictEqual(resumo('T-0011 fecha US01 e RN25.'), ['T-0011', 'fecha', 'US01', 'e', 'RN25', '[.]']);
  assert.deepStrictEqual(resumo("d'água, e-mail em 08/09/2026: ok"), ["d'água", '[,]', 'e-mail', 'em', '08/09/2026', '[:]', 'ok']);
});

test('tokenizar dá posição, chave em minúsculas e marca a pontuação', () => {
  assert.deepStrictEqual(N.tokenizar('Frila — Ágil.'), [
    { t: 'Frila', k: 'frila', ini: 0, fim: 5, pont: false },
    { t: '—', k: '—', ini: 6, fim: 7, pont: true },
    { t: 'Ágil', k: 'ágil', ini: 8, fim: 12, pont: false },
    { t: '.', k: '.', ini: 12, fim: 13, pont: true },
  ]);
});

test('hashTexto é o cyrb53 em 14 dígitos hexadecimais', () => {
  // Vetores publicados no README do cyrb53 (bryc/code, jshash), em decimal:
  // 'a' → 7929297801672961 e 'revenge' → 4051478007546757.
  assert.strictEqual(N.hashTexto('a'), '1c2ba782c97901');
  assert.strictEqual(N.hashTexto('revenge'), '0e64cc3b748385');
  assert.match(N.hashTexto(''), /^[0-9a-f]{14}$/);
});

test('hashDeBlocos hasheia só as palavras, em minúsculas, unidas por um espaço', () => {
  assert.strictEqual(N.hashDeBlocos(['O Frila cobra', 'R$ 15,00.']), N.hashTexto('o frila cobra r 15,00'));
  // A fronteira de bloco, a pontuação e a caixa não mudam o hash.
  assert.strictEqual(N.hashDeBlocos(['a b', 'c']), N.hashDeBlocos(['a', 'b c']));
  assert.strictEqual(N.hashDeBlocos(['Chamaria de novo?']), N.hashDeBlocos(['chamaria, de novo']));
  assert.notStrictEqual(N.hashDeBlocos(['7 de 7']), N.hashDeBlocos(['6 de 7']));
});

test('mapearOffsets devolve o mesmo texto que normalizar sobre os segmentos unidos', () => {
  const casos = [
    ['O Frila ', '—', ' cobra ', 'R$ 15'],
    ['pala­', 'vra'],
    ['abc   ', '  def'],
    ['cafe', '́ ok'],
    ['', 'abc', ''],
    ['  ', '​'],
    [],
  ];
  for (const segmentos of casos) {
    assert.strictEqual(N.mapearOffsets(segmentos).texto, N.normalizar(segmentos.join('')), JSON.stringify(segmentos));
  }
});

test('mapearOffsets localiza o começo de cada caractere no nó de texto de origem', () => {
  const m = N.mapearOffsets(['O Frila ', '—', ' cobra ', 'R$ 15']);
  assert.strictEqual(m.texto, 'O Frila — cobra R$ 15');
  assert.deepStrictEqual(m.localizar(0), { seg: 0, offset: 0 });
  assert.deepStrictEqual(m.localizar(8), { seg: 1, offset: 0 }); // o travessão
  assert.deepStrictEqual(m.localizar(10), { seg: 2, offset: 1 }); // o "c" de cobra
  assert.deepStrictEqual(m.localizar(19), { seg: 3, offset: 3 }); // o "1" de 15
  assert.deepStrictEqual(N.mapearOffsets(['', 'abc']).localizar(0), { seg: 1, offset: 0 });
});

test('mapearOffsets com fim=true localiza o ponto logo depois do caractere anterior', () => {
  const espacos = N.mapearOffsets(['abc   ', '  def']);
  assert.strictEqual(espacos.texto, 'abc def');
  assert.deepStrictEqual(espacos.localizar(4), { seg: 1, offset: 2 }); // começo de "def"
  assert.deepStrictEqual(espacos.localizar(3, true), { seg: 0, offset: 3 }); // fim de "abc", sem os espaços
  assert.deepStrictEqual(espacos.localizar(7, true), { seg: 1, offset: 5 }); // fim do texto

  const hifen = N.mapearOffsets(['pala­', 'vra']);
  assert.deepStrictEqual(hifen.localizar(4), { seg: 1, offset: 0 });
  assert.deepStrictEqual(hifen.localizar(4, true), { seg: 0, offset: 4 }); // antes do hífen suave

  const acento = N.mapearOffsets(['cafe', '́ ok']);
  assert.strictEqual(acento.texto, 'café ok');
  assert.deepStrictEqual(acento.localizar(3), { seg: 0, offset: 3 }); // o "é" começa no "e"
  assert.deepStrictEqual(acento.localizar(4, true), { seg: 1, offset: 1 }); // e termina depois do acento
});

test('tokenizar depois de normalizar trata thin space como espaço', () => {
  assert.deepStrictEqual(resumo(N.normalizar('um turno — função')), ['um', 'turno', '[—]', 'função']);
});

// ── diffBlocos ───────────────────────────────────────────────────────────────

/** O trecho novo que um hunk marca, bloco a bloco, unido por " | ". */
const marcado = (novos, h) => h.novos.map((n) => novos[n.bloco].slice(n.ini, n.fim)).join(' | ');

test('diffBlocos sem mudança não dá hunk', () => {
  const blocos = ['Frila', 'O profissional recebe o valor integral do turno.', 'Sem comissão.'];
  assert.deepStrictEqual(N.diffBlocos(blocos, blocos.slice()), { hunks: [], reescrita: false, degradado: false });
});

test('diffBlocos acha a correção dentro da frase e guarda o texto de antes', () => {
  const antigos = ['Remuneração', 'O profissional recebe o valor integral do turno.', 'Sem comissão.'];
  const novos = ['Remuneração', 'O profissional recebe o valor cheio do turno.', 'Sem comissão.'];
  const { hunks, reescrita, degradado } = N.diffBlocos(antigos, novos);
  assert.strictEqual(reescrita, false);
  assert.strictEqual(degradado, false);
  assert.strictEqual(hunks.length, 1);
  const [h] = hunks;
  assert.strictEqual(h.categoria, 'correcao');
  assert.strictEqual(h.antigoTexto, 'integral');
  assert.deepStrictEqual(h.novos, [{ bloco: 1, ini: 30, fim: 35 }]);
  assert.strictEqual(marcado(novos, h), 'cheio');
  assert.strictEqual(h.remocao, null);
  assert.strictEqual(h.palavras, 1);
  assert.match(h.id, /^[0-9a-f]{14}$/);
});

test('diffBlocos classifica só inserção como acréscimo', () => {
  const antigos = ['O Frila cobra do contratante no DF.'];
  const novos = ['O Frila cobra só do contratante no DF, por turno fechado.'];
  const { hunks } = N.diffBlocos(antigos, novos);
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, marcado(novos, h), h.antigoTexto, h.remocao, h.palavras]), [
    ['acrescimo', 'só', '', null, 1],
    // A vírgula solta na ponta fica fora da marca.
    ['acrescimo', 'por turno fechado', '', null, 3],
  ]);
});

test('diffBlocos classifica só remoção como remoção e diz onde ela estava', () => {
  const antigos = ['Regra', 'O profissional recebe o valor integral do turno, sem desconto.'];
  const novos = ['Regra', 'O profissional recebe o valor do turno.'];
  const { hunks } = N.diffBlocos(antigos, novos);
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, h.antigoTexto, h.novos, h.remocao, h.palavras]), [
    // Logo depois de "valor" (fim em 29) e de "turno" (fim em 38) no texto novo.
    ['remocao', 'integral', [], { bloco: 1, offset: 29 }, 1],
    ['remocao', 'sem desconto', [], { bloco: 1, offset: 38 }, 2],
  ]);
});

test('diffBlocos ignora mudança só de pontuação ou só de caixa', () => {
  assert.deepStrictEqual(N.diffBlocos(['O Frila, app de turnos.'], ['O Frila; app de turnos!']).hunks, []);
  assert.deepStrictEqual(N.diffBlocos(['o frila cobra do contratante'], ['O Frila Cobra do Contratante']).hunks, []);
  assert.deepStrictEqual(N.diffBlocos(['Turno - avulso'], ['Turno — avulso']).hunks, []);

  // No mesmo bloco de uma mudança de verdade, a pontuação trocada não vira hunk.
  const antigos = ['O Frila, app de turnos avulsos no DF, cobra só do contratante.'];
  const novos = ['O frila; app de turnos avulsos no DF, cobra apenas do contratante.'];
  const { hunks } = N.diffBlocos(antigos, novos);
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, marcado(novos, h), h.antigoTexto]), [['correcao', 'apenas', 'só']]);
});

test('diffBlocos divide por bloco uma lacuna que é só inserção', () => {
  const antigos = ['Título', 'Parágrafo um.', 'Fim.'];
  const novos = ['Título', 'Parágrafo um.', 'Seção nova', 'Primeiro parágrafo novo.', 'Segundo parágrafo, novo.', 'Fim.'];
  const { hunks } = N.diffBlocos(antigos, novos);
  // Cada bloco novo é um acréscimo inteiro, com pontuação e tudo: ler metade
  // da seção não traz a outra metade de volta.
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, h.novos, h.antigoTexto, h.palavras]), [
    ['acrescimo', [{ bloco: 2, ini: 0, fim: 10 }], '', 2],
    ['acrescimo', [{ bloco: 3, ini: 0, fim: 24 }], '', 3],
    ['acrescimo', [{ bloco: 4, ini: 0, fim: 24 }], '', 3],
  ]);
  assert.strictEqual(new Set(hunks.map((h) => h.id)).size, 3);
});

test('diffBlocos junta numa remoção só os blocos inteiros que saíram, entre os blocos novos', () => {
  const meio = N.diffBlocos(['Título', 'Trecho que sai.', 'Outro que sai.', 'Fim.'], ['Título', 'Fim.']).hunks;
  assert.deepStrictEqual(meio.map((h) => [h.categoria, h.antigoTexto, h.novos, h.remocao, h.palavras]), [
    ['remocao', 'Trecho que sai.\nOutro que sai.', [], { aposBloco: 0 }, 6],
  ]);
  const comeco = N.diffBlocos(['Sai.', 'Fica.'], ['Fica.']).hunks;
  assert.deepStrictEqual(comeco.map((h) => h.remocao), [{ aposBloco: -1 }]);
  // Seção grande que sai inteira não precisa de diff por token: não degrada.
  const grande = N.diffBlocos(['a', 'um dois três quatro cinco seis', 'z'], ['a', 'z'], { limiteGap: 3 });
  assert.strictEqual(grande.degradado, false);
  assert.deepStrictEqual(grande.hunks.map((h) => [h.categoria, h.remocao]), [['remocao', { aposBloco: 0 }]]);
});

test('diffBlocos: parágrafo que vira tabela não dá hunk', () => {
  const paragrafo = ['Taxas', 'Nome: Frila. Preço: R$ 15 por turno; sem mensalidade.', 'Fim.'];
  // Uma linha da tabela é um bloco, com as células separadas por espaço...
  const linhas = ['Taxas', 'Nome Frila', 'Preço R$ 15 por turno', 'sem mensalidade', 'Fim.'];
  assert.deepStrictEqual(N.diffBlocos(paragrafo, linhas).hunks, []);
  // ...e mesmo com uma célula por bloco o resultado é o mesmo.
  const celulas = ['Taxas', 'Nome', 'Frila', 'Preço', 'R$ 15 por turno', 'sem mensalidade', 'Fim.'];
  assert.deepStrictEqual(N.diffBlocos(paragrafo, celulas).hunks, []);
  // O cabeçalho que a tabela ganhou é o único acréscimo.
  const comCabecalho = ['Taxas', 'Campo Valor', 'Nome Frila', 'Preço R$ 15 por turno', 'sem mensalidade', 'Fim.'];
  const { hunks } = N.diffBlocos(paragrafo, comCabecalho);
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, marcado(comCabecalho, h)]), [['acrescimo', 'Campo Valor']]);
});

test('diffBlocos: linha inserida numa tabela é um acréscimo só, da linha inteira', () => {
  const antigos = ['Regras', 'Regra Descrição', 'RN01 Remuneração integral do turno', 'RN22 Check-in a 200 m do local'];
  const novos = ['Regras', 'Regra Descrição', 'RN01 Remuneração integral do turno', 'RN23 No máximo 1 push a cada 30 min', 'RN22 Check-in a 200 m do local'];
  const { hunks } = N.diffBlocos(antigos, novos);
  assert.deepStrictEqual(hunks.map((h) => [h.categoria, h.novos]), [['acrescimo', [{ bloco: 3, ini: 0, fim: novos[3].length }]]]);
});

test('diffBlocos dá ids estáveis: a mesma mudança mantém o id quando o resto da página muda', () => {
  const antigos = ['Regras', 'O valor integral do turno.', 'Fim.'];
  const antes = N.diffBlocos(antigos, ['Regras', 'O valor cheio do turno.', 'Fim.']).hunks;
  const outraVez = N.diffBlocos(antigos, ['Regras', 'O valor cheio do turno.', 'Fim.']).hunks;
  assert.deepStrictEqual(outraVez.map((h) => h.id), antes.map((h) => h.id));

  // Um bloco novo no topo e outra mudança no fim não mexem no contexto da correção.
  const depois = N.diffBlocos(antigos, ['Introdução nova', 'Regras', 'O valor cheio do turno.', 'Fim do documento.']).hunks;
  const correcao = depois.find((h) => h.categoria === 'correcao');
  assert.strictEqual(correcao.id, antes[0].id);

  // Outro texto novo, outro id.
  const outra = N.diffBlocos(antigos, ['Regras', 'O valor total do turno.', 'Fim.']).hunks;
  assert.notStrictEqual(outra[0].id, antes[0].id);
});

test('diffBlocos dá ids diferentes a dois hunks iguais no mesmo contexto', () => {
  const { hunks } = N.diffBlocos(['Status do turno', 'Status do turno'], ['Status do turno fechado', 'Status do turno fechado']);
  assert.strictEqual(hunks.length, 2);
  assert.notStrictEqual(hunks[0].id, hunks[1].id);
});

test('diffBlocos marca reescrita, sem hunks, quando a distância por bloco passa do limite', () => {
  assert.deepStrictEqual(N.diffBlocos(['a', 'b', 'c'], ['x', 'y', 'z'], { limiteD: 5 }), { hunks: [], reescrita: true, degradado: false });
  // Com o limite padrão (1500): 800 blocos trocados por outros 800 dão D = 1600.
  const velhos = Array.from({ length: 800 }, (_, i) => `bloco velho ${i}`);
  const novos = Array.from({ length: 800 }, (_, i) => `bloco novo ${i}`);
  assert.strictEqual(N.diffBlocos(velhos, novos).reescrita, true);
  // No limite ainda não é reescrita.
  assert.strictEqual(N.diffBlocos(['a', 'b', 'c'], ['x', 'y', 'z'], { limiteD: 6 }).reescrita, false);
});

test('diffBlocos degrada para blocos inteiros a lacuna grande demais', () => {
  const antigos = ['Título', 'um dois três quatro', 'Fim'];
  const novos = ['Título', 'um dois cinco seis', 'Fim'];
  const esperado = [
    ['remocao', 'um dois três quatro', [], { aposBloco: 0 }],
    ['acrescimo', '', [{ bloco: 1, ini: 0, fim: 18 }], null],
  ];
  const resumoDe = (r) => r.hunks.map((h) => [h.categoria, h.antigoTexto, h.novos, h.remocao]);

  // Mais tokens na lacuna (4 + 4) que o limiteGap.
  const porTamanho = N.diffBlocos(antigos, novos, { limiteGap: 7 });
  assert.strictEqual(porTamanho.degradado, true);
  assert.strictEqual(porTamanho.reescrita, false);
  assert.deepStrictEqual(resumoDe(porTamanho), esperado);

  // Distância por token (4) acima do limiteDGap.
  const porDistancia = N.diffBlocos(antigos, novos, { limiteDGap: 3 });
  assert.strictEqual(porDistancia.degradado, true);
  assert.deepStrictEqual(resumoDe(porDistancia), esperado);

  // Dentro dos limites, é a correção fina de sempre.
  const normal = N.diffBlocos(antigos, novos, { limiteGap: 8, limiteDGap: 4 });
  assert.strictEqual(normal.degradado, false);
  assert.deepStrictEqual(normal.hunks.map((h) => [h.categoria, marcado(novos, h), h.antigoTexto]), [['correcao', 'cinco seis', 'três quatro']]);
});

test('diffBlocos põe a remoção no bloco certo quando ela encosta numa fronteira', () => {
  const resumoDe = (antigos, novos) => N.diffBlocos(antigos, novos).hunks.map((h) => [h.categoria, h.antigoTexto, h.remocao]);

  // Um bloco antigo inteiro sai junto com uma correção no bloco de cima.
  assert.deepStrictEqual(
    resumoDe(['T', 'Parágrafo A velho.', 'Parágrafo B sai inteiro.', 'Fim'], ['T', 'Parágrafo A novo.', 'Fim']),
    [['correcao', 'velho', null], ['remocao', 'Parágrafo B sai inteiro.', { aposBloco: 1 }]],
  );

  // O fim de um bloco sai: a remoção vai para o fim do bloco de cima.
  assert.deepStrictEqual(
    resumoDe(['T', 'Frase um. Frase dois sai.', 'Parágrafo X velho.'], ['T', 'Frase um.', 'Parágrafo X novo.']),
    [['remocao', 'Frase dois sai', { bloco: 1, offset: 9 }], ['correcao', 'velho', null]],
  );

  // O começo de um bloco sai: a remoção vai para o começo do bloco de baixo.
  assert.deepStrictEqual(
    resumoDe(['T', 'Parágrafo um.', 'Sai no começo. Fica o resto.'], ['T', 'Parágrafo um mudou.', 'Fica o resto.']),
    [['acrescimo', '', null], ['remocao', 'Sai no começo', { bloco: 2, offset: 0 }]],
  );

  // O espelho: o bloco que sai vem antes do que foi corrigido.
  assert.deepStrictEqual(
    resumoDe(['T', 'Parágrafo B sai inteiro.', 'Parágrafo A velho.', 'Fim'], ['T', 'Parágrafo A novo.', 'Fim']),
    [['remocao', 'Parágrafo B sai inteiro.', { aposBloco: 0 }], ['correcao', 'velho', null]],
  );
});

test('diffBlocos parte na fronteira de bloco a mudança que o Myers entrega junta', () => {
  // Correção no fim de uma linha e uma linha nova logo abaixo: não há token
  // igual entre as duas, e o Myers devolve um trecho mudado só.
  const antes = ['Regra Descrição', 'RN01 Remuneração integral', 'RN23 1 push a cada 30 min'];
  const depois = ['Regra Descrição', 'RN01 Remuneração cheia', 'RN22 Check-in a 200 m do local', 'RN23 1 push a cada 30 min'];
  assert.deepStrictEqual(
    N.diffBlocos(antes, depois).hunks.map((h) => [h.categoria, h.novos, h.antigoTexto, h.remocao]),
    [
      ['correcao', [{ bloco: 1, ini: 17, fim: 22 }], 'integral', null],
      ['acrescimo', [{ bloco: 2, ini: 0, fim: 30 }], '', null],
    ],
  );
  // O contrário: a linha de baixo sai e a de cima é corrigida.
  assert.deepStrictEqual(
    N.diffBlocos(depois, antes).hunks.map((h) => [h.categoria, h.novos, h.antigoTexto, h.remocao]),
    [
      ['correcao', [{ bloco: 1, ini: 17, fim: 25 }], 'cheia', null],
      ['remocao', [], 'RN22 Check-in a 200 m do local', { aposBloco: 1 }],
    ],
  );
});

test('diffBlocos separa a correção de um bloco do parágrafo novo ao lado', () => {
  const depois = ['T', 'a b X.', 'q r s.', 'Fim'];
  assert.deepStrictEqual(
    N.diffBlocos(['T', 'a b c.', 'Fim'], depois).hunks.map((h) => [h.categoria, h.novos]),
    [['correcao', [{ bloco: 1, ini: 4, fim: 5 }]], ['acrescimo', [{ bloco: 2, ini: 0, fim: 6 }]]],
  );
  const antes = ['T', 'q r s.', 'a b X.', 'Fim'];
  assert.deepStrictEqual(
    N.diffBlocos(['T', 'a b c.', 'Fim'], antes).hunks.map((h) => [h.categoria, h.novos]),
    [['acrescimo', [{ bloco: 1, ini: 0, fim: 6 }]], ['correcao', [{ bloco: 2, ini: 4, fim: 5 }]]],
  );
});

// ── consolidar ──────────────────────────────────────────────────────────────

test('consolidar: com tudo lido, o snapshot vira a página nova', () => {
  const snap = ['T', 'O valor integral do turno.', 'Fim.'];
  const novos = ['T', 'O valor cheio do turno.', 'Fim.'];
  const { hunks } = N.diffBlocos(snap, novos);
  assert.deepStrictEqual(N.consolidar(snap, novos, hunks, hunks.map((h) => h.id)), { blocos: novos, lidos: [] });
  // Sem hunk nenhum (página reescrita, ou só pontuação mudou), também.
  assert.deepStrictEqual(N.consolidar(['Frila, app.'], ['Frila; app!'], [], []), { blocos: ['Frila; app!'], lidos: [] });
});

test('consolidar: sem nada lido, as lacunas guardam o texto antigo', () => {
  const snap = ['T', 'O valor integral do turno.', 'Fim.'];
  const novos = ['T', 'O valor cheio do turno.', 'Fim.'];
  const { hunks } = N.diffBlocos(snap, novos);
  assert.deepStrictEqual(N.consolidar(snap, novos, hunks, []), { blocos: snap, lidos: [] });
});

test('consolidar: leitura parcial grava só a lacuna lida e o diff seguinte traz o resto com o mesmo id', () => {
  const snap = ['T', 'A velho.', 'meio', 'B velho.', 'Fim'];
  const novos = ['T', 'A novo.', 'meio', 'B novo.', 'Fim'];
  const { hunks } = N.diffBlocos(snap, novos);
  assert.strictEqual(hunks.length, 2);
  const r = N.consolidar(snap, novos, hunks, [hunks[0].id]);
  assert.deepStrictEqual(r, { blocos: ['T', 'A novo.', 'meio', 'B velho.', 'Fim'], lidos: [] });
  const depois = N.diffBlocos(r.blocos, novos).hunks;
  assert.deepStrictEqual(depois.map((h) => h.id), [hunks[1].id]);
});

test('consolidar: lacuna mista só é gravada com todos os hunks dela lidos', () => {
  const snap = ['T', 'a b c d e f g', 'Fim'];
  const novos = ['T', 'a X c d e f Y', 'Fim'];
  const { hunks } = N.diffBlocos(snap, novos);
  assert.strictEqual(hunks.length, 2);
  // Um dos dois lido: o bloco fica antigo e o id lido continua guardado.
  const parcial = N.consolidar(snap, novos, hunks, [hunks[0].id, 'id-que-nao-existe-mais']);
  assert.deepStrictEqual(parcial, { blocos: snap, lidos: [hunks[0].id] });
  assert.deepStrictEqual(N.diffBlocos(parcial.blocos, novos).hunks.map((h) => h.id), hunks.map((h) => h.id));
  // Os dois lidos: grava.
  assert.deepStrictEqual(N.consolidar(snap, novos, hunks, hunks.map((h) => h.id)), { blocos: novos, lidos: [] });
});

test('consolidar: numa seção nova, cada bloco lido entra sozinho no snapshot', () => {
  const snap = ['T', 'Fim'];
  const novos = ['T', 'Primeiro bloco novo', 'Segundo bloco novo', 'Fim'];
  const { hunks } = N.diffBlocos(snap, novos);
  const r = N.consolidar(snap, novos, hunks, [hunks[1].id]);
  assert.deepStrictEqual(r, { blocos: ['T', 'Segundo bloco novo', 'Fim'], lidos: [] });
  assert.deepStrictEqual(N.diffBlocos(r.blocos, novos).hunks.map((h) => h.id), [hunks[0].id]);
});

test('consolidar: numa lacuna degradada, a remoção e cada bloco novo são lidos em separado', () => {
  const snap = ['Título', 'um dois três quatro', 'Fim'];
  const novos = ['Título', 'um dois cinco seis', 'Fim'];
  const { hunks } = N.diffBlocos(snap, novos, { limiteGap: 7 });
  const [remocao, acrescimo] = hunks;
  assert.deepStrictEqual(N.consolidar(snap, novos, hunks, [remocao.id]), { blocos: ['Título', 'Fim'], lidos: [] });
  const soAcrescimo = N.consolidar(snap, novos, hunks, [acrescimo.id]);
  assert.deepStrictEqual(soAcrescimo, { blocos: ['Título', 'um dois três quatro', 'um dois cinco seis', 'Fim'], lidos: [] });
  assert.deepStrictEqual(N.diffBlocos(soAcrescimo.blocos, novos).hunks.map((h) => h.id), [remocao.id]);
});

test('diffBlocos junta hunks separados por até 2 tokens iguais', () => {
  const casos = [
    // 1 token igual ("em") entre as duas mudanças: uma correção só.
    ['O turno fecha em uma hora.', 'O turno é fechado em menos de uma hora.', [['correcao', 'é fechado em menos de', 'fecha em']]],
    // 2 tokens iguais ("leva dois"): ainda junta.
    ['a vaga leva dois campos', 'a oferta leva dois itens', [['correcao', 'oferta leva dois itens', 'vaga leva dois campos']]],
    // 3 tokens iguais ("leva só dois"): ficam separados.
    ['a vaga leva só dois campos', 'a oferta leva só dois itens', [['correcao', 'oferta', 'vaga'], ['correcao', 'itens', 'campos']]],
    // Dois acréscimos perto um do outro viram um acréscimo só.
    ['o valor do turno', 'o valor integral do turno completo', [['acrescimo', 'integral do turno completo', '']]],
  ];
  for (const [antigo, novo, esperado] of casos) {
    const { hunks } = N.diffBlocos([antigo], [novo]);
    assert.deepStrictEqual(hunks.map((h) => [h.categoria, marcado([novo], h), h.antigoTexto]), esperado, novo);
  }
});

// ── desempenho ──────────────────────────────────────────────────────────────

const PRODUTO = path.resolve(__dirname, '..', '..', '..', 'doc-harness', '01 - CBL', 'Desafios', 'C18', 'Documentos de Produto');

/**
 * Um documento de verdade do tamanho do Requisitos (~85 KB de markdown), sem
 * frontmatter. Se um dia ele encolher, completa com outros do mesmo lugar.
 */
function documentoGrande() {
  const ler = (nome) => fs.readFileSync(path.join(PRODUTO, nome), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
  let md = ler('Frila_Documento_de_Requisitos.md');
  for (const extra of ['Frila_Documento_de_Visao.md', 'EVIDENCIAS.md', '05-ESCOPO-DO-MVP.md']) {
    if (md.length < 80000) md += `\n\n${ler(extra)}`;
  }
  return md;
}

test('desempenho: diff de um documento de ~85 KB com cinco edições', { skip: !fs.existsSync(PRODUTO) && 'vault ausente' }, (t) => {
  const { renderizar } = require('../markdown');
  const { blocosDeHtml } = require('../novidades/html');
  const md = documentoGrande();
  const html = renderizar(md);
  const t0 = performance.now();
  const antigos = blocosDeHtml(html);
  const msExtracao = performance.now() - t0;

  // Cinco edições em pontos fixos do documento, escolhidas pela forma e não
  // pelo texto, para o teste não quebrar quando o vault mudar.
  const novos = antigos.slice();
  const comPalavras = (fracao, minimo) => {
    let i = Math.floor(novos.length * fracao);
    while (novos[i].split(' ').filter((p) => /\p{L}/u.test(p)).length < minimo) i++;
    return i;
  };
  const trocar = (i, fn) => { const partes = novos[i].split(' '); fn(partes); novos[i] = partes.join(' '); };
  const indiceDePalavra = (partes, desde) => { let k = desde; while (!/\p{L}/u.test(partes[k])) k++; return k; };
  trocar(comPalavras(0.1, 6), (p) => { p[indiceDePalavra(p, 2)] = 'trocadíssima'; });
  trocar(comPalavras(0.3, 6), (p) => { p.splice(2, 0, 'com', 'um', 'trecho', 'novo'); });
  trocar(comPalavras(0.5, 6), (p) => { p.splice(indiceDePalavra(p, 3), 1); });
  novos.splice(comPalavras(0.7, 3), 0, 'Parágrafo inteiramente novo, inserido para medir o diff.');
  novos.splice(comPalavras(0.9, 3), 1);

  const t1 = performance.now();
  const r = N.diffBlocos(antigos, novos);
  const msFrio = performance.now() - t1;
  const quentes = [];
  for (let i = 0; i < 5; i++) {
    const t2 = performance.now();
    N.diffBlocos(antigos, novos);
    quentes.push(performance.now() - t2);
  }
  quentes.sort((a, b) => a - b);
  t.diagnostic(`markdown ${(md.length / 1024).toFixed(1)} KB, html ${(html.length / 1024).toFixed(1)} KB, ${antigos.length} blocos`);
  t.diagnostic(`blocosDeHtml: ${msExtracao.toFixed(1)} ms; diffBlocos: ${msFrio.toFixed(1)} ms a frio, mediana ${quentes[2].toFixed(1)} ms a quente`);

  assert.strictEqual(r.reescrita, false);
  assert.strictEqual(r.degradado, false);
  const contagem = {};
  for (const h of r.hunks) contagem[h.categoria] = (contagem[h.categoria] || 0) + 1;
  assert.deepStrictEqual(contagem, { correcao: 1, acrescimo: 2, remocao: 2 });
  // Limite generoso para o CI não oscilar; a meta é < 50 ms.
  assert.ok(msFrio < 500, `diffBlocos levou ${msFrio.toFixed(1)} ms`);
});
