// Núcleo do "O que há de novo": puro, sem DOM e sem dependências.
//
// Roda igual no Node (build e testes) e no navegador (cliente). No Node sai
// por `module.exports`; no navegador, em `window.BancadaNovidades`. Vai para o
// navegador sem transpilar: nada de `??=`, `||=`, campos privados, lookbehind
// ou await no topo. Safari 14 é o piso.

(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.BancadaNovidades = fabrica();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ── Regras de extração ────────────────────────────────────────────────────
  //
  // Como o texto de uma página vira blocos. O build (`html.js`, sobre o HTML)
  // e o cliente (sobre o DOM) seguem as mesmas regras e precisam chegar aos
  // mesmos blocos, senão o hash do build não bate com o do navegador:
  //
  // 1. Raiz: o primeiro elemento com `data-novidades-raiz`; na falta dele, o
  //    primeiro `article.cbl-documento`; na falta dos dois, o documento todo.
  // 2. A árvore é percorrida em ordem. Um elemento ignorado some com tudo o que
  //    tem dentro: tag em `tagsIgnoradas`, classe em `classesIgnoradas` ou
  //    atributo de `atributosIgnorados` com aquele valor (`seletorIgnorado`
  //    junta tudo num seletor CSS).
  // 3. Todo nó de texto vai para o bloco corrente.
  // 4. Entrar ou sair de um elemento de `tagsDeBloco` fecha o bloco corrente.
  // 5. Entrar ou sair de um elemento de `tagsSeparadoras` põe um espaço no
  //    bloco corrente: a linha da tabela é um bloco só, com as células
  //    separadas, e `<br>` separa palavras sem partir o parágrafo.
  // 6. Cada bloco fechado passa por `normalizar()`; se ficar vazio, sai.
  //
  // Mudou alguma regra? Suba a VERSAO_EXTRACAO: os snapshots guardados com a
  // versão antiga deixam de valer.

  const VERSAO_EXTRACAO = 1;

  const TAGS_DE_BLOCO = [
    'address', 'article', 'aside', 'blockquote', 'body', 'caption', 'center', 'dd', 'details', 'dialog',
    'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'header', 'hgroup', 'hr', 'html', 'legend', 'li', 'listing', 'main', 'menu', 'nav', 'ol', 'p',
    'pre', 'search', 'section', 'summary', 'table', 'tbody', 'tfoot', 'thead', 'tr', 'ul',
  ];
  const TAGS_SEPARADORAS = ['td', 'th', 'br'];
  const TAGS_IGNORADAS = [
    'script', 'style', 'svg', 'math', 'button', 'template', 'noscript', 'textarea', 'iframe', 'object',
    'select', 'title', 'canvas', 'audio', 'video', 'xmp', 'noembed', 'noframes',
  ];
  // As do módulo CBL antigo (sem os atributos) e as que o próprio cliente põe
  // na página: texto de leitor de tela, remoções mostradas e o resumo.
  const CLASSES_IGNORADAS = [
    'nov-sr', 'nov-removido', 'nov--remocao', 'nov-resumo',
    'cbl-colofao', 'cbl-nav-ancoras', 'cbl-masthead-eyebrow',
  ];
  const ATRIBUTOS_IGNORADOS = { 'data-novidades': 'ignorar', 'aria-hidden': 'true' };

  const REGRAS = Object.freeze({
    tagsDeBloco: Object.freeze(TAGS_DE_BLOCO),
    tagsSeparadoras: Object.freeze(TAGS_SEPARADORAS),
    tagsIgnoradas: Object.freeze(TAGS_IGNORADAS),
    classesIgnoradas: Object.freeze(CLASSES_IGNORADAS),
    atributosIgnorados: Object.freeze(ATRIBUTOS_IGNORADOS),
    seletorIgnorado: TAGS_IGNORADAS
      .concat(CLASSES_IGNORADAS.map((c) => `.${c}`))
      .concat(Object.keys(ATRIBUTOS_IGNORADOS).map((a) => `[${a}="${ATRIBUTOS_IGNORADOS[a]}"]`))
      .join(','),
  });

  // ── Normalização ──────────────────────────────────────────────────────────

  // Somem sem deixar espaço: hífen suave, zero-width space/non-joiner/joiner,
  // word joiner, operadores invisíveis e BOM. Vem antes do teste de espaço,
  // porque o `\s` do JavaScript inclui o U+FEFF.
  const SOME = /[­᠎​-‍⁠-⁤﻿]/;
  const ESPACO = /\s/;

  // Variantes que valem a mesma coisa para o leitor. O alvo é o que o vault
  // já escreve: travessão na prosa, hífen e aspas retas do teclado.
  const TROCAS = {
    '‒': '—', '–': '—', '―': '—', '⸺': '—', '⸻': '—',
    '‐': '-', '‑': '-', '−': '-', '﹣': '-', '－': '-',
    '“': '"', '”': '"', '„': '"', '‟': '"', '«': '"', '»': '"',
    '″': '"', '＂': '"',
    '‘': "'", '’': "'", '‚': "'", '‛': "'", '′': "'", '‹': "'",
    '›': "'", '＇': "'",
  };

  // Acento e outras marcas combinantes, e as vogais e finais do hangul, que o
  // NFC compõe com o caractere anterior: ficam no mesmo aglomerado que ele.
  const COMBINA = /[\p{M}ᅠ-ᇿힰ-퟿]/u;

  /**
   * A normalização de verdade, sobre uma lista de segmentos lidos como um
   * fluxo só. Em ordem: some o que não tem largura, espaços de todo tipo viram
   * um espaço, travessões e aspas se unificam, cada aglomerado (letra + marcas)
   * passa pelo NFC e os espaços se juntam, sem sobrar nas pontas.
   *
   * Com `comMapa`, guarda para cada unidade do texto de saída onde começa e
   * onde termina, no fluxo bruto, o trecho que a produziu. `normalizar` e
   * `mapearOffsets` passam pelo mesmo caminho: o texto dos dois é sempre igual.
   */
  function processar(segmentos, comMapa) {
    let saida = '';
    const mapaIni = comMapa ? [] : null;
    const mapaFim = comMapa ? [] : null;
    let aglomerado = '';
    let aglIni = 0;
    let aglFim = 0;
    let espacoPendente = false;
    let espIni = 0;
    let espFim = 0;

    function emitir(texto, ini, fim) {
      saida += texto;
      if (comMapa) {
        for (let i = 0; i < texto.length; i++) { mapaIni.push(ini); mapaFim.push(fim); }
      }
    }

    function fecharAglomerado() {
      if (!aglomerado) return;
      if (espacoPendente) emitir(' ', espIni, espFim);
      espacoPendente = false;
      emitir(aglomerado.length === 1 && aglomerado < '̀' ? aglomerado : aglomerado.normalize('NFC'), aglIni, aglFim);
      aglomerado = '';
    }

    let base = 0;
    for (let s = 0; s < segmentos.length; s++) {
      const texto = String(segmentos[s] == null ? '' : segmentos[s]);
      let pos = 0;
      for (const c of texto) {
        const ini = base + pos;
        pos += c.length;
        const fim = base + pos;
        if (SOME.test(c)) continue;
        if (ESPACO.test(c)) {
          fecharAglomerado();
          if (saida && !espacoPendente) { espacoPendente = true; espIni = ini; espFim = fim; }
          continue;
        }
        if (aglomerado && COMBINA.test(c)) {
          aglomerado += c;
          aglFim = fim;
          continue;
        }
        fecharAglomerado();
        aglomerado = TROCAS[c] || c;
        aglIni = ini;
        aglFim = fim;
      }
      base += texto.length;
    }
    fecharAglomerado();
    return { texto: saida, mapaIni, mapaFim, base };
  }

  function normalizar(s) {
    return processar([s], false).texto;
  }

  /**
   * Normaliza um bloco lido nó a nó e diz de onde veio cada caractere.
   * `segmentos` são os textos crus dos nós, na ordem. Devolve o `texto`
   * normalizado (igual a `normalizar(segmentos.join(''))`) e `localizar`:
   * - `localizar(i)`: onde começa, no nó de origem, o caractere `i` do texto;
   * - `localizar(i, true)`: o ponto logo depois do caractere `i - 1`, que é
   *   onde termina um trecho `[ini, i)`. Pula espaços juntados e o que sumiu.
   * As duas dão `{seg, offset}`: o índice do segmento e a posição dentro dele.
   */
  function mapearOffsets(segmentos) {
    const lista = segmentos || [];
    const r = processar(lista, true);
    const inicios = [];
    let acumulado = 0;
    for (let s = 0; s < lista.length; s++) {
      inicios.push(acumulado);
      acumulado += String(lista[s] == null ? '' : lista[s]).length;
    }

    // O último segmento que começa em `g` ou antes. Segmentos vazios dividem o
    // começo com o seguinte, e a busca cai sempre no que tem o caractere.
    function segmentoDe(g) {
      let lo = 0;
      let hi = inicios.length - 1;
      while (lo < hi) {
        const meio = (lo + hi + 1) >> 1;
        if (inicios[meio] <= g) lo = meio;
        else hi = meio - 1;
      }
      return lo;
    }

    function localizar(i, fim) {
      const total = r.texto.length;
      if (!inicios.length || !total) return { seg: 0, offset: 0 };
      if ((fim && i > 0) || i >= total) {
        const g = r.mapaFim[Math.min(i, total) - 1];
        const seg = segmentoDe(g - 1);
        return { seg, offset: g - inicios[seg] };
      }
      const g = r.mapaIni[Math.max(i, 0)];
      const seg = segmentoDe(g);
      return { seg, offset: g - inicios[seg] };
    }

    return { texto: r.texto, localizar };
  }

  // ── Tokens ────────────────────────────────────────────────────────────────

  // Palavra: letras, marcas e dígitos, podendo emendar por . , : / ' ’ - quando
  // há letra ou dígito dos dois lados (1,50 · 08/09/2026 · T-0011 · d'água).
  // Todo o resto que não é espaço vira um token de um caractere só.
  const RE_TOKEN = /[\p{L}\p{M}\p{N}]+(?:[.,:/'’-][\p{L}\p{M}\p{N}]+)*|\S/gu;
  const RE_PALAVRA = /^[\p{L}\p{M}\p{N}]/u;
  // Só a primeira alternativa do RE_TOKEN: acha as mesmas palavras, pulando o resto.
  const RE_PALAVRAS = /[\p{L}\p{M}\p{N}]+(?:[.,:/'’-][\p{L}\p{M}\p{N}]+)*/gu;

  /**
   * A chave de palavras de um texto: só as palavras, em minúsculas, unidas por
   * um espaço. É por ela que dois blocos se casam, e é dela que sai o hash.
   */
  function chaveDePalavras(texto) {
    const palavras = texto.toLowerCase().match(RE_PALAVRAS);
    return palavras ? palavras.join(' ') : '';
  }

  /**
   * Tokens de um texto já normalizado: `{t, k, ini, fim, pont}`.
   * `k` é a chave de comparação em minúsculas. O pt-BR não tem regra própria
   * de caixa (só tr, az e lt têm), então `toLowerCase()` dá o mesmo que
   * `toLocaleLowerCase('pt-BR')`, e bem mais rápido.
   * `pont` é verdadeiro para tudo que não é palavra: pontuação e símbolos.
   */
  function tokenizar(s) {
    const texto = String(s == null ? '' : s);
    const tokens = [];
    RE_TOKEN.lastIndex = 0;
    let m;
    while ((m = RE_TOKEN.exec(texto)) !== null) {
      const t = m[0];
      tokens.push({ t, k: t.toLowerCase(), ini: m.index, fim: m.index + t.length, pont: !RE_PALAVRA.test(t) });
    }
    return tokens;
  }

  // ── Hash ──────────────────────────────────────────────────────────────────

  /** cyrb53 (bryc, domínio público): 53 bits, em 14 dígitos hexadecimais. */
  function hashTexto(s) {
    const texto = String(s == null ? '' : s);
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < texto.length; i++) {
      const c = texto.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }

  /**
   * O hash de uma página: o fluxo de palavras de todos os blocos, em
   * minúsculas e unido por um espaço, sem pontuação e sem fronteira de bloco.
   * Mudar só pontuação, caixa ou marcação não muda o hash.
   */
  function hashDeBlocos(blocos) {
    const chaves = [];
    for (const bloco of blocos || []) {
      const chave = chaveDePalavras(normalizar(bloco));
      if (chave) chaves.push(chave);
    }
    return hashTexto(chaves.join(' '));
  }

  // ── Myers ─────────────────────────────────────────────────────────────────

  /**
   * Myers O(ND) sobre duas listas de inteiros. Devolve os pares que casam
   * numa maior subsequência comum, como duas listas paralelas `{a, b}` de
   * índices em ordem crescente, ou `null` se a distância passar de `maxD`.
   * Prefixo e sufixo comuns saem antes, de graça.
   */
  function myers(a, b, maxD) {
    const n = a.length;
    const m = b.length;
    let p = 0;
    while (p < n && p < m && a[p] === b[p]) p++;
    let s = 0;
    while (s < n - p && s < m - p && a[n - 1 - s] === b[m - 1 - s]) s++;

    const pares = { a: [], b: [] };
    for (let i = 0; i < p; i++) { pares.a.push(i); pares.b.push(i); }
    if (!caminhoDoMeio(a, p, n - s, b, p, m - s, maxD, pares)) return null;
    for (let i = 0; i < s; i++) { pares.a.push(n - s + i); pares.b.push(m - s + i); }
    return pares;
  }

  /** O miolo do Myers, entre `[a0, a1)` e `[b0, b1)`. Acrescenta os pares em `pares`. */
  function caminhoDoMeio(a, a0, a1, b, b0, b1, maxD, pares) {
    const n = a1 - a0;
    const m = b1 - b0;
    if (n === 0 || m === 0) return n + m <= maxD;

    const limite = Math.min(n + m, maxD);
    const desloc = limite + 1;
    const v = new Int32Array(2 * limite + 3);
    const rastro = [];
    let dFinal = -1;

    for (let d = 0; d <= limite && dFinal < 0; d++) {
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && v[desloc + k - 1] < v[desloc + k + 1])) x = v[desloc + k + 1];
        else x = v[desloc + k - 1] + 1;
        let y = x - k;
        while (x < n && y < m && a[a0 + x] === b[b0 + y]) { x++; y++; }
        v[desloc + k] = x;
        if (x >= n && y >= m) { dFinal = d; break; }
      }
      // O estado depois do passo d: é dele que o passo d + 1 lê, e a volta também.
      rastro.push(v.slice(desloc - d, desloc + d + 1));
    }
    if (dFinal < 0) return false;

    // Volta do fim ao começo, recolhendo as diagonais (os elementos iguais).
    const ra = [];
    const rb = [];
    let x = n;
    let y = m;
    for (let d = dFinal; d > 0; d--) {
      const k = x - y;
      const antes = rastro[d - 1];
      const em = (kk) => antes[kk + d - 1];
      const veioDeCima = k === -d || (k !== d && em(k - 1) < em(k + 1));
      const kAntes = veioDeCima ? k + 1 : k - 1;
      const xAntes = em(kAntes);
      const xInicio = veioDeCima ? xAntes : xAntes + 1;
      for (let t = x - 1; t >= xInicio; t--) { ra.push(a0 + t); rb.push(b0 + t - k); }
      x = xAntes;
      y = xAntes - kAntes;
    }
    for (let t = x - 1; t >= 0; t--) { ra.push(a0 + t); rb.push(b0 + t); }
    for (let i = ra.length - 1; i >= 0; i--) { pares.a.push(ra[i]); pares.b.push(rb[i]); }
    return true;
  }

  // ── Diff ──────────────────────────────────────────────────────────────────

  const LIMITES = { limiteD: 1500, limiteGap: 6000, limiteDGap: 800 };

  // A fronteira entre dois blocos entra no fluxo como um token próprio, com
  // uma chave que nenhum token de texto tem (tokens nunca contêm espaço). O
  // Myers prefere casar fronteira com fronteira, e o ponto final de um
  // parágrafo não vai parar no parágrafo vizinho. Ela nunca aparece num hunk.
  const FRONTEIRA = '\n';

  /** Os tokens de uma faixa de blocos, lidos como um fluxo só. */
  function fluxoDeBlocos(textos, de, ate) {
    const f = { t: [], k: [], bloco: [], ini: [], fim: [], pont: [], fronteiras: [0], primeiro: {}, ultimo: {} };
    const empurrar = (t, k, bloco, ini, fim, pont) => {
      f.t.push(t); f.k.push(k); f.bloco.push(bloco); f.ini.push(ini); f.fim.push(fim); f.pont.push(pont);
      f.fronteiras.push(f.fronteiras[f.fronteiras.length - 1] + (k === FRONTEIRA ? 1 : 0));
    };
    for (let bloco = de; bloco < ate; bloco++) {
      const tokens = tokenizar(textos[bloco]);
      if (!tokens.length) continue;
      if (f.t.length) empurrar('', FRONTEIRA, -1, 0, 0, true);
      f.primeiro[bloco] = f.t.length;
      for (const tk of tokens) empurrar(tk.t, tk.k, bloco, tk.ini, tk.fim, tk.pont);
      f.ultimo[bloco] = f.t.length - 1;
    }
    return f;
  }

  const ehFronteira = (f, i) => f.k[i] === FRONTEIRA;

  /**
   * Parte um trecho mudado que atravessa fronteiras de bloco. De cada lado,
   * o que vem antes da primeira fronteira (cabeça) continua o bloco anterior,
   * o que vem depois da última (cauda) começa o bloco seguinte, e o meio são
   * blocos inteiros. Cabeça casa com cabeça e cauda com cauda; blocos
   * inteiros do meio viram remoção ou acréscimo à parte. Um lado sem
   * fronteira fica inteiro com a cabeça do outro (ou com a cauda, se a cabeça
   * do outro for vazia). "Corrige o fim de uma linha e insere a linha de
   * baixo" dá uma correção e um acréscimo, e não uma correção nas duas.
   */
  function partirNasFronteiras(h, fa, fb) {
    const fronteirasEm = (f, de, ate) => {
      const lista = [];
      for (let i = de; i < ate; i++) if (ehFronteira(f, i)) lista.push(i);
      return lista;
    };
    const sa = fronteirasEm(fa, h.x0, h.x1);
    const sb = fronteirasEm(fb, h.y0, h.y1);
    if (!sa.length && !sb.length) return [h];

    const partes = [];
    const parte = (x0, x1, y0, y1) => { if (x1 > x0 || y1 > y0) partes.push({ x0, x1, y0, y1 }); };
    const ultimo = (lista) => lista[lista.length - 1];
    // Blocos inteiros entre fronteiras seguidas, um por um.
    const blocosDoMeio = (s, cada) => { for (let i = 0; i + 1 < s.length; i++) cada(s[i] + 1, s[i + 1]); };

    if (sa.length && sb.length) {
      parte(h.x0, sa[0], h.y0, sb[0]);
      if (sa.length > 1) parte(sa[0] + 1, ultimo(sa), sb[0], sb[0]);
      blocosDoMeio(sb, (y0, y1) => parte(ultimo(sa), ultimo(sa), y0, y1));
      parte(ultimo(sa) + 1, h.x1, ultimo(sb) + 1, h.y1);
    } else if (sb.length) {
      if (sb[0] > h.y0) {
        parte(h.x0, h.x1, h.y0, sb[0]);
        blocosDoMeio(sb, (y0, y1) => parte(h.x1, h.x1, y0, y1));
        parte(h.x1, h.x1, ultimo(sb) + 1, h.y1);
      } else {
        blocosDoMeio(sb, (y0, y1) => parte(h.x0, h.x0, y0, y1));
        parte(h.x0, h.x1, ultimo(sb) + 1, h.y1);
      }
    } else if (sa[0] > h.x0) {
      parte(h.x0, sa[0], h.y0, h.y1);
      if (sa.length > 1) parte(sa[0] + 1, ultimo(sa), h.y1, h.y1);
      parte(ultimo(sa) + 1, h.x1, h.y1, h.y1);
    } else {
      if (sa.length > 1) parte(sa[0] + 1, ultimo(sa), h.y0, h.y0);
      parte(ultimo(sa) + 1, h.x1, h.y0, h.y1);
    }
    return partes;
  }

  /**
   * Entre alinhamentos de mesmo custo, prefere o que encaixa as mudanças nas
   * fronteiras de bloco. Um par casado pode trocar de parceiro por um token
   * igual dentro do trecho mudado vizinho (o mesmo D, a mesma subsequência):
   * troca quando, com isso, o trecho mudado passa a começar ou terminar numa
   * fronteira. Assim "edita o parágrafo A e apaga o B" dá uma correção em A
   * e uma remoção de B inteiro, em vez de um hunk só atravessando os dois.
   * `lado` é a lista de índices dos pares naquele fluxo (`p.a` ou `p.b`).
   */
  function preferirFronteiras(lado, f) {
    const total = f.t.length;
    // Para baixo: o par vai para um token igual antes dele, colado numa fronteira.
    for (let i = 0; i < lado.length; i++) {
      const antes = i > 0 ? lado[i - 1] : -1;
      for (let x = lado[i] - 2; x > antes; x--) {
        if (f.k[x] === f.k[lado[i]] && ehFronteira(f, x + 1)) { lado[i] = x; break; }
      }
    }
    // Para cima: o par vai para um token igual depois dele, logo após uma fronteira.
    for (let i = lado.length - 1; i >= 0; i--) {
      const depois = i + 1 < lado.length ? lado[i + 1] : total;
      for (let x = lado[i] + 2; x < depois; x++) {
        if (f.k[x] === f.k[lado[i]] && ehFronteira(f, x - 1)) { lado[i] = x; break; }
      }
    }
  }
  /** Há fronteira de bloco em `[x0, x1)`? */
  const cruzaBloco = (f, x0, x1) => f.fronteiras[x1] - f.fronteiras[x0] > 0;
  /** O token de texto mais perto de `i`, andando no sentido `passo` (±1); -1 se não há. */
  function tokenDeTexto(f, i, passo) {
    while (i >= 0 && i < f.t.length && ehFronteira(f, i)) i += passo;
    return i >= 0 && i < f.t.length ? i : -1;
  }

  /** As chaves das palavras de `[x0, x1)` num fluxo, unidas por um espaço. */
  function palavrasDoFluxo(f, x0, x1) {
    const saida = [];
    for (let i = x0; i < x1; i++) if (!f.pont[i]) saida.push(f.k[i]);
    return saida;
  }

  /**
   * `[x0, x1)` de um fluxo em trechos por bloco. Um bloco coberto por inteiro
   * vai inteiro; nos das pontas, a pontuação solta fica de fora.
   */
  function trechosDoFluxo(f, textos, x0, x1) {
    if (x0 >= x1) return [];
    let t0 = x0;
    let t1 = x1;
    while (t0 < t1 && f.pont[t0]) t0++;
    while (t1 > t0 && f.pont[t1 - 1]) t1--;
    const trechos = [];
    let i = x0;
    while (i < x1) {
      if (ehFronteira(f, i)) { i++; continue; }
      const bloco = f.bloco[i];
      const fimDoBloco = Math.min(f.ultimo[bloco] + 1, x1);
      if (i === f.primeiro[bloco] && fimDoBloco === f.ultimo[bloco] + 1) {
        trechos.push({ bloco, ini: 0, fim: textos[bloco].length });
      } else {
        const de = Math.max(i, t0);
        const ate = Math.min(fimDoBloco, t1);
        if (de < ate) trechos.push({ bloco, ini: f.ini[de], fim: f.fim[ate - 1] });
      }
      i = fimDoBloco;
    }
    return trechos;
  }

  /**
   * Até 3 palavras antes do ponto `offset` do bloco novo `bloco`, voltando
   * pelos blocos anteriores se preciso. É o contexto que estabiliza o id.
   */
  function contextoAntes(novos, chaves, bloco, offset) {
    let palavras = bloco < novos.length ? chaveDePalavras(novos[bloco].slice(0, offset)).split(' ').filter(Boolean) : [];
    for (let j = Math.min(bloco, novos.length) - 1; palavras.length < 3 && j >= 0; j--) {
      if (chaves[j]) palavras = chaves[j].split(' ').concat(palavras);
    }
    return palavras.slice(-3).join(' ');
  }

  function diffBlocos(antigos, novos, opcoes) {
    const o = Object.assign({}, LIMITES, opcoes || {});
    const A = antigos || [];
    const B = novos || [];
    const chavesA = A.map(chaveDePalavras);
    const chavesB = B.map(chaveDePalavras);

    // As chaves viram inteiros: o Myers compara números, não textos.
    const numeros = new Map();
    const numero = (c) => {
      let v = numeros.get(c);
      if (v === undefined) { v = numeros.size; numeros.set(c, v); }
      return v;
    };
    const pares = myers(chavesA.map(numero), chavesB.map(numero), o.limiteD);
    if (!pares) return { hunks: [], reescrita: true, degradado: false };

    const hunks = [];
    let degradado = false;
    const vistos = new Map();

    // id = hash(categoria|antigo|novo|3 palavras antes), só com as palavras em
    // minúsculas, para que pontuação em volta não troque o id. Dois hunks
    // iguais no mesmo contexto (linhas repetidas de tabela) ganham a ordem de
    // aparição no hash, e cada um é lido por conta própria.
    function novoHunk(categoria, antigoPalavras, novoPalavras, contexto, campos) {
      const base = [categoria, antigoPalavras, novoPalavras, contexto].join('|');
      const vezes = vistos.get(base) || 0;
      vistos.set(base, vezes + 1);
      const id = hashTexto(vezes ? `${base}|${vezes}` : base);
      hunks.push(Object.assign({ id, categoria }, campos));
    }

    /**
     * Onde mostrar uma remoção que saiu entre os tokens `q - 1` e `q` do fluxo
     * novo. Dentro de um bloco, é o ponto logo depois do token anterior. Na
     * fronteira entre blocos: blocos antigos inteiros ficam entre os blocos
     * (`aposBloco`); o fim de um bloco antigo vai para o fim do bloco anterior;
     * o começo de um, para o começo do seguinte.
     */
    function lugarDaRemocao(fa, fb, x0, x1, q, ja) {
      const anterior = tokenDeTexto(fb, q - 1, -1);
      const seguinte = tokenDeTexto(fb, q, 1);
      if (anterior >= 0 && seguinte >= 0 && fb.bloco[anterior] === fb.bloco[seguinte]) {
        return { bloco: fb.bloco[anterior], offset: fb.fim[anterior] };
      }
      const blocoAnterior = anterior >= 0 ? fb.bloco[anterior] : ja - 1;
      const primeiroSaido = tokenDeTexto(fa, x0, 1);
      const ultimoSaido = tokenDeTexto(fa, x1 - 1, -1);
      const comecaNoBloco = primeiroSaido === fa.primeiro[fa.bloco[primeiroSaido]];
      const terminaNoBloco = ultimoSaido === fa.ultimo[fa.bloco[ultimoSaido]];
      if (comecaNoBloco && terminaNoBloco) return { aposBloco: blocoAnterior };
      if (anterior >= 0 && !comecaNoBloco) return { bloco: blocoAnterior, offset: B[blocoAnterior].length };
      if (seguinte >= 0) return { bloco: fb.bloco[seguinte], offset: 0 };
      return { aposBloco: blocoAnterior };
    }

    // Lacuna só de inserção: um acréscimo por bloco, cada um com sua lacuna,
    // para que ler metade de uma seção nova não traga a outra metade de volta.
    // `ia` é onde os blocos entram na lista antiga.
    function lacunaInserida(ia, ja, jb) {
      for (let j = ja; j < jb; j++) {
        if (!chavesB[j]) continue;
        novoHunk('acrescimo', '', chavesB[j], contextoAntes(B, chavesB, j, 0), {
          novos: [{ bloco: j, ini: 0, fim: B[j].length }],
          antigoTexto: '',
          remocao: null,
          palavras: chavesB[j].split(' ').length,
          lacuna: { ia, ib: ia, ja: j, jb: j + 1 },
        });
      }
    }

    // Blocos antigos inteiros que saíram, mostrados entre os blocos novos.
    function lacunaRemovida(ia, ib, ja) {
      const palavras = chavesA.slice(ia, ib).filter(Boolean).join(' ');
      if (!palavras) return;
      novoHunk('remocao', palavras, '', contextoAntes(B, chavesB, ja, 0), {
        novos: [],
        antigoTexto: A.slice(ia, ib).join('\n'),
        remocao: { aposBloco: ja - 1 },
        palavras: palavras.split(' ').length,
        lacuna: { ia, ib, ja, jb: ja },
      });
    }

    // Lacuna grande demais para o diff por token: o que saiu vira uma remoção
    // de blocos inteiros e o que entrou, acréscimos de blocos inteiros.
    function lacunaDegradada(ia, ib, ja, jb) {
      degradado = true;
      lacunaRemovida(ia, ib, ja);
      lacunaInserida(ib, ja, jb);
    }

    // Lacuna mista: Myers por token no fluxo concatenado dos blocos da lacuna.
    function lacunaMista(ia, ib, ja, jb) {
      const fa = fluxoDeBlocos(A, ia, ib);
      const fb = fluxoDeBlocos(B, ja, jb);
      if (fa.t.length + fb.t.length > o.limiteGap) return lacunaDegradada(ia, ib, ja, jb);
      const numerosT = new Map();
      const numeroT = (c) => {
        let v = numerosT.get(c);
        if (v === undefined) { v = numerosT.size; numerosT.set(c, v); }
        return v;
      };
      const p = myers(fa.k.map(numeroT), fb.k.map(numeroT), o.limiteDGap);
      if (!p) return lacunaDegradada(ia, ib, ja, jb);
      preferirFronteiras(p.a, fa);
      preferirFronteiras(p.b, fb);

      // Os trechos entre pares casados são os hunks crus.
      const crus = [];
      let x = 0;
      let y = 0;
      for (let i = 0; i <= p.a.length; i++) {
        const xa = i < p.a.length ? p.a[i] : fa.t.length;
        const yb = i < p.b.length ? p.b[i] : fb.t.length;
        if (xa > x || yb > y) crus.push({ x0: x, x1: xa, y0: y, y1: yb });
        x = xa + 1;
        y = yb + 1;
      }

      // Um trecho que atravessa blocos vira um por bloco.
      const partidos = [];
      for (const h of crus) Array.prototype.push.apply(partidos, partirNasFronteiras(h, fa, fb));

      // Fora os que só mudam pontuação ou caixa: as mesmas palavras dos dois
      // lados. Sai antes de juntar, para uma vírgula trocada não servir de
      // ponte entre duas mudanças de verdade.
      const reais = [];
      for (const h of partidos) {
        const velhas = palavrasDoFluxo(fa, h.x0, h.x1);
        const novas = palavrasDoFluxo(fb, h.y0, h.y1);
        if (velhas.join(' ') === novas.join(' ')) continue;
        reais.push({ x0: h.x0, x1: h.x1, y0: h.y0, y1: h.y1, temDel: velhas.length > 0, temIns: novas.length > 0 });
      }

      // Junta vizinhos a até 2 tokens de distância, dentro do mesmo bloco dos
      // dois lados. Duas remoções puras não se juntam: a ponte entre elas
      // apareceria riscada e viva ao mesmo tempo.
      const juntos = [];
      for (const h of reais) {
        const ultimo = juntos[juntos.length - 1];
        const perto = ultimo && Math.max(h.x0 - ultimo.x1, h.y0 - ultimo.y1) <= 2
          && !cruzaBloco(fa, ultimo.x0, h.x1) && !cruzaBloco(fb, ultimo.y0, h.y1);
        if (perto && (ultimo.temIns || h.temIns)) {
          ultimo.x1 = h.x1;
          ultimo.y1 = h.y1;
          ultimo.temDel = ultimo.temDel || h.temDel;
          ultimo.temIns = ultimo.temIns || h.temIns;
        } else {
          juntos.push(h);
        }
      }

      for (const h of juntos) {
        const velhas = palavrasDoFluxo(fa, h.x0, h.x1);
        const novas = palavrasDoFluxo(fb, h.y0, h.y1);
        const categoria = h.temDel && h.temIns ? 'correcao' : h.temIns ? 'acrescimo' : 'remocao';
        const antigoTexto = categoria === 'acrescimo' ? ''
          : trechosDoFluxo(fa, A, h.x0, h.x1).map((t) => A[t.bloco].slice(t.ini, t.fim)).join('\n');
        const trechos = categoria === 'remocao' ? [] : trechosDoFluxo(fb, B, h.y0, h.y1);
        const anterior = tokenDeTexto(fb, h.y0 - 1, -1);
        const antes = anterior >= 0 ? contextoAntes(B, chavesB, fb.bloco[anterior], fb.fim[anterior]) : contextoAntes(B, chavesB, ja, 0);
        novoHunk(categoria, categoria === 'acrescimo' ? '' : velhas.join(' '), categoria === 'remocao' ? '' : novas.join(' '), antes, {
          novos: trechos,
          antigoTexto,
          remocao: categoria === 'remocao' ? lugarDaRemocao(fa, fb, h.x0, h.x1, h.y0, ja) : null,
          palavras: categoria === 'remocao' ? velhas.length : novas.length,
          lacuna: { ia, ib, ja, jb },
        });
      }
    }

    let ia = 0;
    let ja = 0;
    for (let i = 0; i <= pares.a.length; i++) {
      const ib = i < pares.a.length ? pares.a[i] : A.length;
      const jb = i < pares.b.length ? pares.b[i] : B.length;
      if (ib === ia && jb > ja) lacunaInserida(ia, ja, jb);
      else if (jb === ja && ib > ia) lacunaRemovida(ia, ib, ja);
      else if (ib > ia && jb > ja) lacunaMista(ia, ib, ja, jb);
      ia = ib + 1;
      ja = jb + 1;
    }

    return { hunks, reescrita: false, degradado };
  }

  // ── Leitura ───────────────────────────────────────────────────────────────

  const chaveDaLacuna = (l) => `${l.ia},${l.ib},${l.ja},${l.jb}`;

  /**
   * O snapshot depois da leitura. `hunks` são os de `diffBlocos(snapBlocos,
   * novos)`, sem mexer (cada um traz a `lacuna` de onde saiu), e `lidos` os
   * ids já lidos. Uma lacuna com todos os hunks lidos passa a ter o texto
   * novo; uma com algum hunk não lido guarda o antigo, e o próximo diff traz
   * de volta os mesmos hunks, com os mesmos ids. Com tudo lido, o snapshot é
   * a página nova. Devolve `{blocos, lidos}`: em `lidos`, só os ids lidos das
   * lacunas que ainda não foram gravadas.
   */
  function consolidar(snapBlocos, novos, hunks, lidos) {
    const A = snapBlocos || [];
    const B = novos || [];
    const lista = hunks || [];
    const jaLidos = new Set(lidos || []);

    const pendentes = new Map();
    for (const h of lista) {
      if (!jaLidos.has(h.id)) pendentes.set(chaveDaLacuna(h.lacuna), h.lacuna);
    }
    const ordem = Array.from(pendentes.values()).sort((x, y) => x.ja - y.ja || x.jb - y.jb || x.ia - y.ia);

    const blocos = [];
    let j = 0;
    let p = 0;
    while (p < ordem.length || j < B.length) {
      if (p < ordem.length && ordem[p].ja <= j) {
        const l = ordem[p++];
        if (l.ja < j) continue;
        for (let i = l.ia; i < l.ib; i++) blocos.push(A[i]);
        j = l.jb;
        continue;
      }
      if (j >= B.length) break;
      blocos.push(B[j++]);
    }

    const aindaLidos = lista
      .filter((h) => jaLidos.has(h.id) && pendentes.has(chaveDaLacuna(h.lacuna)))
      .map((h) => h.id);
    return { blocos, lidos: aindaLidos };
  }

  return {
    VERSAO_EXTRACAO,
    REGRAS,
    normalizar,
    tokenizar,
    hashTexto,
    hashDeBlocos,
    mapearOffsets,
    diffBlocos,
    consolidar,
  };
});
