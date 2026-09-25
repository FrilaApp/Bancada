// Tokens do marca-texto de novidades (`primitivo.marca` e escala `mudanca`).
//
// Três travas:
// 1. `mudanca` só referencia primitivo, nunca hex, e toda referência resolve.
// 2. A tinta tem de ser legível sobre cada marca nos dois temas (AA, 4,5:1).
// 3. No escuro a marca também se separa do fundo (WCAG 1.4.11, 3:1). No claro
//    ela não se separa, e isso é decisão registrada: o pastel foi escolhido
//    sabendo que fica entre 1,2 e 1,5:1 contra o papel (DESIGN.md, "Marca-texto
//    de novidades"). O teste mostra a medida em vez de cobrar os 3:1.
//
// O contraste é medido contra os fundos que o site desenha de verdade: o
// multipagina.css redeclara --fundo e --superficie por tema com hex próprio,
// e é essa cor que fica atrás da marca, não a do papel em tokens.json.
//
// Uso, de dentro de `Bancada/`: node --test scripts/testes/tokens.test.js

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RAIZ_PROJETO = path.resolve(__dirname, '..', '..');
const tokens = JSON.parse(fs.readFileSync(path.join(RAIZ_PROJETO, 'tokens.json'), 'utf8'));
const multipagina = fs.readFileSync(path.join(__dirname, '..', 'estilo', 'multipagina.css'), 'utf8');
const novidades = fs.readFileSync(path.join(__dirname, '..', 'estilo', 'novidades.css'), 'utf8');

const CATEGORIAS = ['acrescimo', 'correcao', 'remocao'];
const TEMAS = ['claro', 'escuro'];

/** "neutro.13" ou "marca.verde" para o hex do primitivo; lança se não existir. */
function resolver(referencia) {
  const [grupo, chave, ...resto] = String(referencia).split('.');
  assert.strictEqual(resto.length, 0, `referência malformada: ${referencia}`);
  const primitivo = tokens.primitivo[grupo];
  assert.ok(primitivo !== undefined, `primitivo.${grupo} não existe (visto em "${referencia}")`);
  const valor = Array.isArray(primitivo) ? primitivo[Number(chave)] : primitivo[chave];
  assert.ok(typeof valor === 'string' && /^#[0-9a-f]{6}$/i.test(valor), `primitivo.${referencia} não é um hex`);
  return valor;
}

/** Luminância relativa do WCAG 2. */
function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const fmt = (n) => n.toFixed(2).replace('.', ',');

/**
 * `--fundo` e `--superficie` do bloco `:root[data-theme="<tema>"]` do
 * multipagina.css. Sem o bloco, vale o papel de tokens.json: é o que o site
 * desenharia sem a redeclaração.
 */
function fundosEmVigor(tema) {
  const atributo = tema === 'escuro' ? 'dark' : 'light';
  const bloco = multipagina.match(new RegExp(`:root\\[data-theme="${atributo}"\\]\\s*\\{([^}]*)\\}`));
  const ler = (nome, papel) => {
    const m = bloco && bloco[1].match(new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{6})`));
    return m ? m[1] : resolver(tokens.papel[papel][tema]);
  };
  return { fundo: ler('fundo', 'fundo'), superficie: ler('superficie', 'superficie') };
}

test('primitivo.marca guarda os três preenchimentos do claro, em hex', () => {
  assert.deepStrictEqual(Object.keys(tokens.primitivo.marca).sort(), ['ambar', 'verde', 'vermelho']);
  for (const [nome, valor] of Object.entries(tokens.primitivo.marca)) {
    assert.match(valor, /^#[0-9A-F]{6}$/, `marca.${nome}`);
  }
});

test('mudanca tem as quatro chaves, cada uma com claro e escuro', () => {
  assert.deepStrictEqual(Object.keys(tokens.mudanca).sort(), ['acrescimo', 'correcao', 'remocao', 'tinta']);
  for (const [nome, par] of Object.entries(tokens.mudanca)) {
    assert.deepStrictEqual(Object.keys(par).sort(), TEMAS, `mudanca.${nome}`);
  }
  assert.ok(typeof tokens._mudanca === 'string' && tokens._mudanca.includes('Categoria de dado'),
    '_mudanca documenta a escala como categoria de dado');
});

test('mudanca não carrega hex: toda entrada referencia um primitivo que existe', () => {
  for (const [nome, par] of Object.entries(tokens.mudanca)) {
    for (const tema of TEMAS) {
      assert.ok(!String(par[tema]).startsWith('#'), `mudanca.${nome}.${tema} = "${par[tema]}" é hex literal`);
      resolver(par[tema]);
    }
  }
});

test('mudanca fica fora de papel, que exige espelho em Tokens.swift', () => {
  for (const chave of ['mudanca', 'marca', ...CATEGORIAS]) {
    assert.ok(!(chave in tokens.papel), `papel.${chave} não pode existir`);
  }
});

test('no claro a marca é o pastel; no escuro, o passo luz da mesma matiz', () => {
  const esperado = { acrescimo: 'verde', correcao: 'ambar', remocao: 'vermelho' };
  for (const [categoria, matiz] of Object.entries(esperado)) {
    assert.strictEqual(tokens.mudanca[categoria].claro, `marca.${matiz}`);
    assert.strictEqual(tokens.mudanca[categoria].escuro, `${matiz}.luz`);
  }
  assert.strictEqual(tokens.mudanca.tinta.claro, 'neutro.13');
  assert.strictEqual(tokens.mudanca.tinta.escuro, 'neutro.13');
});

for (const tema of TEMAS) {
  test(`tinta legível sobre as três marcas no ${tema} (AA, 4,5:1)`, (t) => {
    const tinta = resolver(tokens.mudanca.tinta[tema]);
    for (const categoria of CATEGORIAS) {
      const marca = resolver(tokens.mudanca[categoria][tema]);
      const razao = contraste(tinta, marca);
      t.diagnostic(`${categoria} ${tema}: tinta ${tinta} sobre ${marca} = ${fmt(razao)}:1`);
      assert.ok(razao >= 4.5, `${categoria} no ${tema}: ${fmt(razao)}:1`);
    }
  });
}

test('no escuro a marca se separa do fundo e da superfície (1.4.11, 3:1)', (t) => {
  const { fundo, superficie } = fundosEmVigor('escuro');
  for (const categoria of CATEGORIAS) {
    const marca = resolver(tokens.mudanca[categoria].escuro);
    for (const [nome, atras] of [['fundo', fundo], ['superficie', superficie]]) {
      const razao = contraste(marca, atras);
      t.diagnostic(`${categoria} escuro contra ${nome} ${atras} = ${fmt(razao)}:1`);
      assert.ok(razao >= 3, `${categoria} contra ${nome} no escuro: ${fmt(razao)}:1`);
    }
  }
});

test('no claro a marca contra o papel é a exceção documentada ao 1.4.11', (t) => {
  // Não cobra 3:1: o pastel foi escolhido sabendo que não chega lá. Só mede e
  // mostra, para quem mexer no tom ver o número mudar.
  const { fundo, superficie } = fundosEmVigor('claro');
  for (const categoria of CATEGORIAS) {
    const marca = resolver(tokens.mudanca[categoria].claro);
    t.diagnostic(`${categoria} claro: contra fundo ${fundo} = ${fmt(contraste(marca, fundo))}:1, `
      + `contra superfície ${superficie} = ${fmt(contraste(marca, superficie))}:1 (exceção ao 1.4.11)`);
  }
  const design = fs.readFileSync(path.join(RAIZ_PROJETO, '..', 'DESIGN.md'), 'utf8');
  assert.match(design, /Marca-texto de novidades/i, 'DESIGN.md tem a seção do marca-texto');
  assert.match(design, /1\.4\.11/, 'DESIGN.md registra a exceção ao 1.4.11');
});

test('movimento.leitura é uma duração curta em segundos', () => {
  const leitura = tokens.movimento.leitura;
  assert.ok(typeof leitura === 'number' && leitura > tokens.movimento.padrao && leitura <= 1, `leitura = ${leitura}`);
});

/** Uma lista de seletores dividida nas vírgulas de fora dos parênteses. */
function listaDeSeletores(texto) {
  const partes = [];
  let nivel = 0;
  let atual = '';
  for (const c of texto) {
    if (c === '(') nivel += 1;
    if (c === ')') nivel -= 1;
    if (c === ',' && nivel === 0) {
      partes.push(atual.trim());
      atual = '';
    } else {
      atual += c;
    }
  }
  partes.push(atual.trim());
  return partes;
}

test('novidades.css não põe :has() em lista de seletores', () => {
  // Num navegador sem :has() (Safari < 15.4, Firefox < 121), o seletor
  // inválido derruba a regra inteira, inclusive a parte que só usa classe.
  const semComentarios = novidades.replace(/\/\*[\s\S]*?\*\//g, '');
  const seletores = [...semComentarios.matchAll(/([^{};]+)\{/g)]
    .map(([, s]) => s.trim())
    .filter((s) => s && !s.startsWith('@'));
  const emLista = seletores.filter((s) => s.includes(':has(') && listaDeSeletores(s).length > 1);
  assert.deepStrictEqual(emLista, [], `:has() em lista: ${emLista.join(' | ')}`);
});

test('novidades.css só usa variáveis: nenhum hex, rgb() ou hsl() solto', () => {
  const semComentarios = novidades.replace(/\/\*[\s\S]*?\*\//g, '');
  const soltos = semComentarios.match(/#[0-9a-fA-F]{3,8}\b(?![\w-])|\b(?:rgba?|hsla?)\(/g) || [];
  assert.deepStrictEqual(soltos, [], `cor literal em novidades.css: ${soltos.join(', ')}`);
  for (const nome of ['acrescimo', 'correcao', 'remocao', 'tinta']) {
    assert.ok(semComentarios.includes(`var(--mudanca-${nome})`), `novidades.css não usa --mudanca-${nome}`);
  }
});
