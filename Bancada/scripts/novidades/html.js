// Blocos de texto de uma página, a partir do HTML gerado. Só no Node (build).
//
// No navegador, o cliente tira os mesmos blocos do DOM. Aqui não há DOM:
// um scanner lê as tags com uma pilha e aplica as mesmas `REGRAS` do núcleo
// (ver o topo de `nucleo.js`). O que importa para os dois lados darem o mesmo
// resultado é a sequência de fronteiras de bloco e de texto, e não a árvore
// exata; por isso o scanner só imita do parser do navegador o que muda essa
// sequência ou o alcance de uma região ignorada.

'use strict';

const { REGRAS, normalizar } = require('./nucleo');

const BLOCO = new Set(REGRAS.tagsDeBloco);
const SEPARADORA = new Set(REGRAS.tagsSeparadoras);

// ── Entidades ────────────────────────────────────────────────────────────────
//
// O conjunto do HTML 4 e os nomes do HTML5 de uso comum. O site só escreve
// meia dúzia (o markdown escapa o & do vault), mas uma entidade que o
// navegador conhece e este scanner não faria o hash do build divergir.

const LATIN1 = (
  'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 ' +
  'acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml ' +
  'Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde ' +
  'Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ' +
  'ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide ' +
  'oslash ugrave uacute ucirc uuml yacute thorn yuml'
).split(' ');

const OUTRAS = {
  quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, QUOT: 34, AMP: 38, LT: 60, GT: 62, COPY: 169, REG: 174,
  excl: 33, num: 35, dollar: 36, percnt: 37, lpar: 40, rpar: 41, ast: 42, plus: 43, comma: 44, period: 46,
  sol: 47, colon: 58, semi: 59, equals: 61, quest: 63, commat: 64, lsqb: 91, lbrack: 91, bsol: 92, rsqb: 93,
  rbrack: 93, lowbar: 95, grave: 96, lcub: 123, lbrace: 123, verbar: 124, vert: 124, rcub: 125, rbrace: 125,
  Tab: 9, NewLine: 10,
  OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732,
  ensp: 8194, emsp: 8195, emsp13: 8196, emsp14: 8197, numsp: 8199, puncsp: 8200, thinsp: 8201, hairsp: 8202,
  ZeroWidthSpace: 8203, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, hyphen: 8208, dash: 8208,
  ndash: 8211, mdash: 8212, horbar: 8213, lsquo: 8216, rsquo: 8217, rsquor: 8217, sbquo: 8218,
  lsquor: 8218, ldquo: 8220, rdquo: 8221, rdquor: 8221, bdquo: 8222, ldquor: 8222, dagger: 8224,
  Dagger: 8225, bull: 8226, bullet: 8226, nldr: 8229, hellip: 8230, mldr: 8230, permil: 8240, prime: 8242,
  Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, MediumSpace: 8287, NoBreak: 8288,
  euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501,
  larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, nwarr: 8598, nearr: 8599, searr: 8600,
  swarr: 8601, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660,
  forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715,
  prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736,
  and: 8743, or: 8744, cap: 8745, cup: 8746, int: 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776,
  ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839,
  oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971,
  lang: 10216, rang: 10217, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830,
  starf: 9733, star: 9734, check: 10003, cross: 10007,
  thetasym: 977, upsih: 978, piv: 982, sigmaf: 962,
};

const GREGAS = 'Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron Pi Rho _ Sigma Tau Upsilon Phi Chi Psi Omega'.split(' ');

const ENTIDADES = new Map();
LATIN1.forEach((nome, i) => ENTIDADES.set(nome, String.fromCodePoint(160 + i)));
Object.keys(OUTRAS).forEach((nome) => ENTIDADES.set(nome, String.fromCodePoint(OUTRAS[nome])));
GREGAS.forEach((nome, i) => {
  if (nome === '_') return;
  ENTIDADES.set(nome, String.fromCodePoint(913 + i));
  ENTIDADES.set(nome.toLowerCase(), String.fromCodePoint(945 + i));
});

// As que o navegador ainda aceita sem ponto e vírgula (no texto).
const LEGADAS = new Set(LATIN1.concat(['quot', 'amp', 'lt', 'gt', 'QUOT', 'AMP', 'LT', 'GT', 'COPY', 'REG']));

// Referências numéricas na faixa C1 são lidas como Windows-1252.
const WINDOWS_1252 = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
  0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018,
  0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC,
  0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
};

function caractereNumerico(n) {
  if (!(n > 0) || n > 0x10FFFF || (n >= 0xD800 && n <= 0xDFFF)) return '�';
  return String.fromCodePoint(WINDOWS_1252[n] || n);
}

const RE_ENTIDADE = /&(?:#[xX]([0-9A-Fa-f]+);?|#([0-9]+);?|([A-Za-z][A-Za-z0-9]*)(;?))/g;

/**
 * Decodifica as referências de caractere numa passada só, como o parser:
 * `&amp;nbsp;` vira o texto "&nbsp;", e não um espaço. Num atributo, uma
 * entidade legada sem ponto e vírgula seguida de letra, dígito ou "=" fica
 * como está.
 */
function decodificar(s, emAtributo) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(RE_ENTIDADE, (tudo, hex, dec, nome, pv) => {
    if (hex !== undefined) return caractereNumerico(parseInt(hex, 16));
    if (dec !== undefined) return caractereNumerico(parseInt(dec, 10));
    if (pv && ENTIDADES.has(nome)) return ENTIDADES.get(nome);
    for (let k = nome.length; k >= 2; k--) {
      const prefixo = nome.slice(0, k);
      if (!LEGADAS.has(prefixo)) continue;
      const resto = nome.slice(k) + pv;
      if (emAtributo && /^[A-Za-z0-9=]/.test(resto)) return tudo;
      return ENTIDADES.get(prefixo) + resto;
    }
    return tudo;
  });
}

// ── Tokens ──────────────────────────────────────────────────────────────────

const ehEspaco = (c) => c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f';
const ehLetra = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

/**
 * Uma tag a partir do nome (logo depois de `<` ou `</`): nome em minúsculas,
 * atributos (o primeiro de cada nome vale, como no navegador), a barra de
 * autofechamento e onde a tag termina. Valor entre aspas pode ter `>`.
 */
function lerTag(html, p) {
  const n = html.length;
  let j = p;
  while (j < n && !ehEspaco(html[j]) && html[j] !== '/' && html[j] !== '>') j++;
  const nome = html.slice(p, j).toLowerCase();
  const attrs = Object.create(null);
  let autoFecha = false;
  while (j < n) {
    const c = html[j];
    if (c === '>') return { nome, attrs, autoFecha, fim: j + 1 };
    if (ehEspaco(c)) { j++; continue; }
    if (c === '/') { autoFecha = html[j + 1] === '>'; j++; continue; }
    autoFecha = false;
    let k = j + 1;
    while (k < n && !ehEspaco(html[k]) && html[k] !== '/' && html[k] !== '>' && html[k] !== '=') k++;
    const nomeAttr = html.slice(j, k).toLowerCase();
    j = k;
    while (j < n && ehEspaco(html[j])) j++;
    let valor = '';
    if (html[j] === '=') {
      j++;
      while (j < n && ehEspaco(html[j])) j++;
      const aspa = html[j];
      if (aspa === '"' || aspa === "'") {
        const f = html.indexOf(aspa, j + 1);
        const fimValor = f < 0 ? n : f;
        valor = html.slice(j + 1, fimValor);
        j = fimValor + 1;
      } else {
        k = j;
        while (k < n && !ehEspaco(html[k]) && html[k] !== '>') k++;
        valor = html.slice(j, k);
        j = k;
      }
    }
    if (!(nomeAttr in attrs)) attrs[nomeAttr] = decodificar(valor, true);
  }
  return { nome, attrs, autoFecha, fim: n };
}

/** Onde termina o comentário que começa em `i` (`<!--`), como no parser. */
function fimDoComentario(html, i) {
  if (html.startsWith('<!-->', i)) return i + 5;
  if (html.startsWith('<!--->', i)) return i + 6;
  const candidatos = [html.indexOf('-->', i + 4), html.indexOf('--!>', i + 4)].filter((f) => f >= 0);
  if (!candidatos.length) return html.length;
  const f = Math.min.apply(null, candidatos);
  return f + (html.startsWith('-->', f) ? 3 : 4);
}

// Elementos cujo conteúdo é texto até a tag de fechamento, sem tags dentro
// (como o tokenizador do navegador). No RCDATA as entidades valem.
const TEXTO_CRU = new Set(['script', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'plaintext']);
const RCDATA = new Set(['textarea', 'title']);

/**
 * Quebra o HTML em texto (já decodificado) e tags, na ordem. Comentários,
 * doctype e `<?…?>` somem; um `<` que não abre tag é texto.
 */
function tokens(html) {
  const lista = [];
  const n = html.length;
  let i = 0;
  let texto = '';
  const soltarTexto = () => {
    if (texto) lista.push({ tipo: 'texto', texto: decodificar(texto, false) });
    texto = '';
  };
  const pularAte = (fim) => { soltarTexto(); i = fim; };

  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { texto += html.slice(i); break; }
    texto += html.slice(i, lt);
    i = lt;
    const c1 = html[i + 1];

    if (html.startsWith('<!--', i)) { pularAte(fimDoComentario(html, i)); continue; }
    if (c1 === '!' || c1 === '?') {
      const f = html.indexOf('>', i + 2);
      pularAte(f < 0 ? n : f + 1);
      continue;
    }
    if (c1 === '/') {
      const c2 = html[i + 2];
      if (c2 === '>') { i += 3; continue; }
      if (!ehLetra(c2 || '')) {
        const f = html.indexOf('>', i + 2);
        pularAte(f < 0 ? n : f + 1);
        continue;
      }
      const tag = lerTag(html, i + 2);
      soltarTexto();
      lista.push({ tipo: 'fecha', nome: tag.nome });
      i = tag.fim;
      continue;
    }
    if (ehLetra(c1 || '')) {
      const tag = lerTag(html, i + 1);
      soltarTexto();
      lista.push({ tipo: 'abre', nome: tag.nome, attrs: tag.attrs, autoFecha: tag.autoFecha });
      i = tag.fim;
      if (TEXTO_CRU.has(tag.nome) || RCDATA.has(tag.nome)) {
        const fechamento = new RegExp(`</${tag.nome}[\\t\\n\\f\\r />]`, 'ig');
        fechamento.lastIndex = i;
        const achou = tag.nome === 'plaintext' ? null : fechamento.exec(html);
        const fimDoTexto = achou ? achou.index : n;
        const bruto = html.slice(i, fimDoTexto);
        if (bruto) lista.push({ tipo: 'texto', texto: RCDATA.has(tag.nome) ? decodificar(bruto, false) : bruto });
        i = fimDoTexto;
      }
      continue;
    }
    texto += '<';
    i += 1;
  }
  soltarTexto();
  return lista;
}

// ── Árvore ──────────────────────────────────────────────────────────────────

const VAZIAS = new Set([
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const temClasse = (tk, classe) => (tk.attrs.class || '').split(/[ \t\n\f\r]+/).indexOf(classe) >= 0;

const IGNORADAS = new Set(REGRAS.tagsIgnoradas);
const CLASSES_IGNORADAS = REGRAS.classesIgnoradas;
const ATRIBUTOS_IGNORADOS = Object.keys(REGRAS.atributosIgnorados);

/** O elemento sai da extração, com tudo o que tem dentro? */
function ignorado(tk) {
  if (IGNORADAS.has(tk.nome)) return true;
  for (const a of ATRIBUTOS_IGNORADOS) if (tk.attrs[a] === REGRAS.atributosIgnorados[a]) return true;
  if (tk.attrs.class) for (const c of CLASSES_IGNORADAS) if (temClasse(tk, c)) return true;
  return false;
}

// Dentro de SVG e MathML, `<x/>` fecha o próprio elemento.
const ESTRANGEIRAS = new Set(['svg', 'math']);

// O que o parser do navegador fecha sem ninguém pedir, e onde uma busca por
// elemento aberto para ("escopo"). Só o necessário para a sequência de
// fronteiras e o alcance das regiões ignoradas saírem iguais aos do DOM.
const FECHA_P = new Set([
  'address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li',
  'listing', 'main', 'menu', 'nav', 'ol', 'p', 'plaintext', 'pre', 'search', 'section', 'summary', 'table', 'ul',
  'xmp', 'dd', 'dt',
]);
const ESPECIAIS = new Set([
  'address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br',
  'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'keygen', 'li', 'link', 'listing', 'main',
  'marquee', 'menu', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext',
  'pre', 'script', 'search', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp',
]);
const ESCOPO = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template',
  'foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'];
const ESCOPO_PADRAO = new Set(ESCOPO);
const ESCOPO_BOTAO = new Set(ESCOPO.concat(['button']));
const ESCOPO_LISTA = new Set(ESCOPO.concat(['ol', 'ul']));
const ESCOPO_TABELA = new Set(['html', 'table', 'template']);
const ESTRUTURA_DE_TABELA = new Set(['table', 'caption', 'colgroup', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th']);
const TITULOS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/**
 * Onde começa o conteúdo: o primeiro elemento com `data-novidades-raiz`; na
 * falta, o primeiro `article.cbl-documento` (o módulo CBL antigo não tem os
 * atributos); na falta dos dois, -1, e vale o HTML inteiro.
 */
function acharRaiz(lista) {
  for (let t = 0; t < lista.length; t++) {
    if (lista[t].tipo === 'abre' && 'data-novidades-raiz' in lista[t].attrs) return t;
  }
  for (let t = 0; t < lista.length; t++) {
    const tk = lista[t];
    if (tk.tipo === 'abre' && tk.nome === 'article' && temClasse(tk, 'cbl-documento')) return t;
  }
  return -1;
}

/**
 * Os blocos de texto de um HTML, já normalizados, na ordem da página.
 * Aceita a página inteira ou só o `<article>`: procura a raiz sozinho.
 */
function blocosDeHtml(html) {
  const lista = tokens(String(html == null ? '' : html));
  const raiz = acharRaiz(lista);
  const blocos = [];
  let corrente = '';
  const fecharBloco = () => {
    const t = normalizar(corrente);
    if (t) blocos.push(t);
    corrente = '';
  };
  // Na entrada e na saída de um elemento: bloco fecha o bloco corrente;
  // separador (célula, <br>) só põe um espaço, que o normalizar() junta.
  const fronteira = (nome) => {
    if (BLOCO.has(nome)) fecharBloco();
    else if (SEPARADORA.has(nome)) corrente += ' ';
  };

  // Cada elemento aberto guarda se está numa região ignorada e se está em
  // conteúdo estrangeiro (SVG, MathML); os dois passam de pai para filho.
  const pilha = [];
  const topo = () => pilha[pilha.length - 1];
  const ignorando = () => Boolean(topo() && topo().ignorado);
  const fechar = (el) => { if (!el.ignorado) fronteira(el.nome); };
  const fecharAte = (k) => { while (pilha.length > k) fechar(pilha.pop()); };
  /** O elemento aberto mais perto do topo que satisfaz `casa`, sem passar de um limite de escopo. */
  const emEscopo = (casa, limites) => {
    for (let k = pilha.length - 1; k >= 0; k--) {
      if (casa(pilha[k].nome)) return k;
      if (limites.has(pilha[k].nome)) return -1;
    }
    return -1;
  };
  const chamado = (nome) => (n) => n === nome;

  // Um <li> fecha o <li> aberto; um <dd> ou <dt>, o <dd> ou <dt> aberto. A
  // busca para num elemento especial que não seja address, div ou p.
  const fecharItemAberto = (nomes) => {
    for (let k = pilha.length - 1; k >= 0; k--) {
      const n = pilha[k].nome;
      if (nomes.indexOf(n) >= 0) { fecharAte(k); return; }
      if (ESPECIAIS.has(n) && n !== 'address' && n !== 'div' && n !== 'p') return;
    }
  };

  for (let t = raiz < 0 ? 0 : raiz; t < lista.length; t++) {
    const tk = lista[t];
    if (tk.tipo === 'texto') {
      if (!ignorando()) corrente += tk.texto;
      continue;
    }

    if (tk.tipo === 'abre') {
      if (tk.nome === 'li') fecharItemAberto(['li']);
      else if (tk.nome === 'dd' || tk.nome === 'dt') fecharItemAberto(['dd', 'dt']);
      if (FECHA_P.has(tk.nome)) {
        const p = emEscopo(chamado('p'), ESCOPO_BOTAO);
        if (p >= 0) fecharAte(p);
      }
      const pai = topo();
      const el = {
        nome: tk.nome,
        ignorado: Boolean(pai && pai.ignorado) || ignorado(tk),
        estrangeiro: Boolean(pai && pai.estrangeiro) || ESTRANGEIRAS.has(tk.nome),
      };
      if (!el.ignorado) fronteira(el.nome);
      if (VAZIAS.has(el.nome) || (tk.autoFecha && el.estrangeiro)) fechar(el);
      else pilha.push(el);
      continue;
    }

    // Fechamento. `</p>` sem <p> aberto vira um <p></p> vazio, e `</br>`, um
    // <br>: nos dois casos, só a fronteira.
    const nome = tk.nome;
    let alvo;
    if (nome === 'p') {
      alvo = emEscopo(chamado('p'), ESCOPO_BOTAO);
      if (alvo < 0) { if (!ignorando()) fronteira('p'); continue; }
    } else if (nome === 'br') {
      if (!ignorando()) fronteira('br');
      continue;
    } else if (nome === 'li') {
      alvo = emEscopo(chamado('li'), ESCOPO_LISTA);
    } else if (TITULOS.has(nome)) {
      alvo = emEscopo((n) => TITULOS.has(n), ESCOPO_PADRAO);
    } else if (ESTRUTURA_DE_TABELA.has(nome)) {
      alvo = emEscopo(chamado(nome), ESCOPO_TABELA);
    } else if (ESPECIAIS.has(nome)) {
      alvo = emEscopo(chamado(nome), ESCOPO_PADRAO);
    } else {
      // Qualquer outro: o mais perto do topo, sem atravessar um especial.
      alvo = -1;
      for (let k = pilha.length - 1; k >= 0; k--) {
        if (pilha[k].nome === nome) { alvo = k; break; }
        if (ESPECIAIS.has(pilha[k].nome)) break;
      }
    }
    if (alvo < 0) continue;
    fecharAte(alvo);
    if (raiz >= 0 && !pilha.length) break;
  }
  fecharBloco();
  return blocos;
}

module.exports = { blocosDeHtml };
