// Cliente do "O que há de novo": o que roda no navegador de quem lê.
//
// O gerador concatena este arquivo depois do núcleo (nucleo.js) em
// `site/novidades.js`, carregado com `defer` em toda página. O núcleo deixa
// `window.BancadaNovidades` pronto com a extração, o diff e a consolidação;
// daqui sai o resto: estado no localStorage, pontos e contagem na barra,
// marca-texto no documento, leitura, página Novidades e aviso ao vivo.
//
// No Node (testes), o arquivo só exporta a lógica pura, sem tocar em DOM.
//
// Vai para o navegador sem transpilar. Safari 14 é o piso: nada de `??=`,
// campos privados, lookbehind ou await no topo. Tudo roda dentro de
// try/catch: um erro aqui nunca pode quebrar a página.

(function (raiz, fabrica) {
  var modulo = fabrica(raiz);
  if (typeof module === 'object' && module && module.exports) module.exports = modulo.puro;
  else modulo.iniciar();
})(typeof globalThis !== 'undefined' ? globalThis : this, function (raiz) {
  'use strict';

  var MINUTO = 60 * 1000;
  var DIA = 24 * 60 * MINUTO;
  // Parado por mais que isso, a próxima visita é outra sessão.
  var SESSAO_OCIOSA = 30 * MINUTO;
  // Sem estado, "novo" nunca vai mais longe que isso.
  var JANELA = 7 * DIA;

  // ── Lógica pura ─────────────────────────────────────────────────────────

  function numero(v) {
    return typeof v === 'number' && isFinite(v) ? v : null;
  }

  /**
   * A sessão depois de uma atividade em `agora`. Mais de 30 min parado abre
   * uma sessão nova, e o fim da anterior (a última atividade dela) vira
   * `fimAnterior`: é dele que sai o limite do que ainda conta como novo.
   */
  function atualizarSessao(sessao, agora) {
    var ultima = sessao ? numero(sessao.ultima) : null;
    if (ultima !== null && agora - ultima < SESSAO_OCIOSA) {
      var inicio = numero(sessao.inicio);
      return { inicio: inicio === null ? agora : inicio, ultima: agora, fimAnterior: numero(sessao.fimAnterior) };
    }
    return { inicio: agora, ultima: agora, fimAnterior: ultima };
  }

  /** `limite = max(fimAnterior ?? −∞, agora − 7d)`. */
  function limiteDaSessao(sessao, agora) {
    var fim = sessao ? numero(sessao.fimAnterior) : null;
    return Math.max(fim === null ? -Infinity : fim, agora - JANELA);
  }

  /**
   * A regra do ponto de uma página. `pagina` é a entrada do manifesto;
   * `estado`, a do índice local (ou null, se o leitor nunca abriu a página).
   * - Com estado: ponto se `aceito≠h || pend>0`.
   * - Sem estado: ponto se `(nova || (hb && hb≠h)) && (t ?? gerado) > limite`.
   * Página sem hash no manifesto não tem com o que comparar: sem ponto.
   */
  function temNovidade(pagina, estado, limite, gerado) {
    if (!pagina || !pagina.h) return false;
    if (estado) return estado.aceito !== pagina.h || estado.pend > 0;
    var mudou = Boolean(pagina.nova) || Boolean(pagina.hb && pagina.hb !== pagina.h);
    if (!mudou) return false;
    var t = Date.parse(pagina.t || gerado || '');
    return t > limite;
  }

  /**
   * A chave de uma página a partir do endereço, quando a raiz não traz
   * `data-novidades-chave`: o caminho relativo à raiz do site, sem `.html`
   * (a Cloudflare serve sem extensão) e sem `index`. A capa é o documento CBL.
   */
  function chaveDoEndereco(caminho, base) {
    var rel = String(caminho || '');
    var prefixo = String(base || '/');
    if (rel.indexOf(prefixo) === 0) rel = rel.slice(prefixo.length);
    rel = rel.replace(/^\/+/, '');
    try { rel = decodeURIComponent(rel); } catch (e) { /* fica como veio */ }
    rel = rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '').replace(/\/+$/, '');
    return rel || 'documento-cbl';
  }

  // Dias e horas saem sempre no horário de Brasília, como a linha do tempo
  // do build. Sem Intl com fuso, UTC−3 fixo: o Brasil não tem mais horário
  // de verão desde 2019.
  var FUSO = 'America/Sao_Paulo';
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var formatoDoDia = null;

  function partesEmSaoPaulo(ms) {
    try {
      if (!formatoDoDia) {
        formatoDoDia = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, year: 'numeric', month: 'numeric', day: 'numeric' });
      }
      var p = {};
      formatoDoDia.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
      if (p.year && p.month && p.day) return { ano: Number(p.year), mes: Number(p.month), dia: Number(p.day) };
    } catch (e) { /* segue para o fuso fixo */ }
    var d = new Date(ms - 3 * 60 * MINUTO);
    return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
  }

  function doisDigitos(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /** 'AAAA-MM-DD' do instante `ms` em São Paulo. */
  function diaEmSaoPaulo(ms) {
    var p = partesEmSaoPaulo(ms);
    return p.ano + '-' + doisDigitos(p.mes) + '-' + doisDigitos(p.dia);
  }

  var DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

  /** "Hoje" ou "Ontem" para o dia `dia` visto de `hoje` (os dois 'AAAA-MM-DD'); senão null. */
  function rotuloRelativo(dia, hoje) {
    var h = DATA_ISO.exec(String(hoje || ''));
    if (!h || !DATA_ISO.test(String(dia || ''))) return null;
    if (dia === hoje) return 'Hoje';
    var ontem = new Date(Date.UTC(Number(h[1]), Number(h[2]) - 1, Number(h[3])) - DIA).toISOString().slice(0, 10);
    return dia === ontem ? 'Ontem' : null;
  }

  /** "22 set", ou "30 dez 2025" quando o ano não é o de `agora`. */
  function dataCurta(ms, agora) {
    var p = partesEmSaoPaulo(ms);
    var a = partesEmSaoPaulo(agora);
    return p.dia + ' ' + MESES[p.mes - 1] + (p.ano !== a.ano ? ' ' + p.ano : '');
  }

  /**
   * O que o aviso ao vivo diz depois de ler o `versao.json` (decisão B), ou
   * null. Em ordem: mudou o h da página atual; mudou o h de outras páginas
   * que o manifesto conhece (as que contam); mudou qualquer outra coisa
   * (tarefas, registros, galeria, uma página fora do manifesto).
   */
  function decidirAviso(manifesto, versao) {
    if (!manifesto || !versao || typeof versao !== 'object') return null;
    var paginas = manifesto.paginas || {};
    var hashes = versao.paginas && typeof versao.paginas === 'object' ? versao.paginas : null;
    var atual = manifesto.atual;
    if (hashes && paginas[atual] && paginas[atual].h && hashes[atual] !== paginas[atual].h) {
      return { tipo: 'pagina' };
    }
    var n = 0;
    if (hashes) {
      Object.keys(paginas).forEach(function (chave) {
        var p = paginas[chave];
        if (chave !== atual && p && p.h && hashes[chave] !== p.h) n++;
      });
    }
    if (n > 0) return { tipo: 'paginas', n: n };
    var mudouVersao = typeof versao.versao === 'string' && versao.versao !== manifesto.versao;
    var mudouConteudo = typeof versao.conteudo === 'string' && versao.conteudo !== manifesto.conteudo;
    return mudouVersao || mudouConteudo ? { tipo: 'conteudo' } : null;
  }

  function textoDoAviso(decisao) {
    if (!decisao) return '';
    if (decisao.tipo === 'pagina') return 'Esta página mudou.';
    if (decisao.tipo === 'paginas') return 'Há novidades em ' + decisao.n + (decisao.n === 1 ? ' página.' : ' páginas.');
    return 'Há conteúdo novo no vault.';
  }

  /**
   * Em que ordem os snapshots saem quando a cota do localStorage estoura: o
   * visto há mais tempo primeiro (sem entrada no índice, antes de todos). As
   * `protegidas` (a página aberta) nunca saem.
   */
  function ordemDeDespejo(paginas, chaves, protegidas) {
    var mapa = paginas || {};
    var fora = {};
    (protegidas || []).forEach(function (c) { fora[c] = true; });
    function visto(c) {
      var v = mapa[c] ? numero(mapa[c].visto) : null;
      return v === null ? -Infinity : v;
    }
    return (chaves || []).filter(function (c) { return !fora[c]; }).sort(function (x, y) {
      var a = visto(x);
      var b = visto(y);
      if (a !== b) return a < b ? -1 : 1;
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  var NOMES = {
    acrescimo: ['acréscimo', 'acréscimos'],
    correcao: ['correção', 'correções'],
    remocao: ['remoção', 'remoções'],
  };

  function rotuloDoChip(categoria, n) {
    return n + ' ' + NOMES[categoria][n === 1 ? 0 : 1];
  }

  function rotuloDaContagem(n) {
    return 'Novidades, ' + n + (n === 1 ? ' página com novidade' : ' páginas com novidade');
  }

  // Uma remoção inline entra no ponto logo depois do token anterior, sem
  // espaço. O espaço que separa o texto riscado dos vizinhos fica fora da
  // marca e fora do diff; aqui só se decide de que lado ele vai.
  var FECHA_PALAVRA = /[\p{L}\p{M}\p{N}.,;:!?)\]}»"'%…]/u;
  var ABRE_PALAVRA = /[\p{L}\p{N}(\[{«"'¿¡]/u;

  function espacosDaRemocao(texto, offset) {
    var s = String(texto || '');
    var antes = offset > 0 ? s.charAt(offset - 1) : '';
    var depois = offset < s.length ? s.charAt(offset) : '';
    return {
      antes: antes !== '' && FECHA_PALAVRA.test(antes),
      depois: depois !== '' && ABRE_PALAVRA.test(depois),
    };
  }

  var PALAVRAS_REMOCAO_LONGA = 25;

  /**
   * Remoção longa vira bloco fechado (`details.nov-removido`) em vez de
   * `<del>` no meio da frase: 25 palavras ou mais, um trecho que atravessa
   * blocos (o `antigoTexto` junta blocos com "\n") ou blocos inteiros que
   * saíram entre dois blocos (`aposBloco`), que não têm frase onde entrar.
   */
  function ehRemocaoLonga(h) {
    var r = h && h.remocao;
    if (!r || r.aposBloco !== undefined) return true;
    return h.palavras >= PALAVRAS_REMOCAO_LONGA || String(h.antigoTexto || '').indexOf('\n') >= 0;
  }

  /**
   * O candidato para onde o chip leva. `fundos` é a borda de baixo de cada
   * candidato na tela, na ordem do documento. `cursor` é null na primeira
   * vez: vale o primeiro que não cabe inteiro na tela (abaixo de
   * `fundoDaTela`), e sem nenhum, o primeiro. Depois, é o índice do último
   * candidato na posição da marca visitada ou antes dela, e vale o seguinte,
   * dando a volta no fim.
   */
  function escolherProximo(fundos, cursor, fundoDaTela) {
    var n = fundos.length;
    if (!n) return -1;
    if (cursor !== null && cursor !== undefined) return (cursor + 1 + n) % n;
    for (var i = 0; i < n; i++) if (fundos[i] > fundoDaTela) return i;
    return 0;
  }

  /**
   * De quando é a referência que o resumo mostra.
   * - Diff com a base buscada nesta visita: "Nos últimos 7 dias".
   * - Snapshot da base guardado numa visita anterior: o mesmo rótulo
   *   enquanto a base tiver uns 7 dias; depois, "Desde <data da base>".
   * - Snapshot de visita: se a visita anterior terminou sem pendência, o
   *   snapshot é a página daquela visita, e vale a data dela (`visto`);
   *   senão, a do snapshot, que é a das partes ainda não lidas.
   */
  function referenciaDoResumo(snap, estadoAnterior, agora, daBase) {
    var em = numero(snap && snap.em);
    if (daBase) return { tipo: '7d' };
    if (snap && snap.origem === '7d') {
      if (em === null || agora - em <= JANELA + DIA) return { tipo: '7d' };
      return { tipo: 'desde', em: em };
    }
    var visto = estadoAnterior ? numero(estadoAnterior.visto) : null;
    if (estadoAnterior && estadoAnterior.aceito && !(estadoAnterior.pend > 0) && visto !== null) {
      em = em === null ? visto : Math.max(em, visto);
    }
    return { tipo: 'visita', em: em === null ? agora : em };
  }

  // Acima disso, marcar trecho a trecho inunda a página (o Requisitos chega a
  // 600 trechos na base de 7 dias): ela abre limpa, e as marcas vêm a pedido.
  var LIMITE_TRECHOS = 150;

  function recolherMarcas(n) {
    return n > LIMITE_TRECHOS;
  }

  /** 1024 → "1.024". Sem Intl: o separador de milhar do pt-BR é o ponto. */
  function milhar(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function textoMudouMuito(n) {
    return 'esta página mudou muito (' + milhar(n) + (n === 1 ? ' trecho' : ' trechos') + ').';
  }

  /**
   * O rótulo do resumo em partes: o texto antes da data, a data (ms, ou null
   * quando não há) e o texto depois dela. Com `n`, a página está recolhida e
   * o rótulo diz quanto ela mudou.
   */
  function partesDoRotulo(ref, n) {
    var fim = n === null || n === undefined ? '' : ' ' + textoMudouMuito(n);
    if (ref.tipo === '7d') return { antes: 'Nos últimos 7 dias:' + fim, em: null, depois: '' };
    return { antes: ref.tipo === 'desde' ? 'Desde ' : 'Desde sua visita de ', em: ref.em, depois: ':' + fim };
  }

  /** O mesmo rótulo como texto corrido, com a data como aparece na página. */
  function textoDoRotulo(ref, n, agora) {
    var p = partesDoRotulo(ref, n);
    return p.antes + (p.em === null ? '' : dataCurta(p.em, agora)) + p.depois;
  }

  /** A entrada da linha do tempo (quando: ISO) chegou depois da última visita à página Novidades? */
  function entradaNova(quando, feedVistoEm, limite) {
    var t = Date.parse(quando || '');
    var referencia = numero(feedVistoEm);
    return t > (referencia === null ? limite : referencia);
  }

  /** O novo `feedVistoEm`: a entrada mais nova que a página mostrou, sem voltar atrás. */
  function feedVistoDepois(anterior, quandos) {
    var maior = numero(anterior);
    (quandos || []).forEach(function (q) {
      var t = Date.parse(q || '');
      if (t === t && (maior === null || t > maior)) maior = t;
    });
    return maior;
  }

  // ── Navegador ───────────────────────────────────────────────────────────

  var CHAVE_INDICE = 'bancada_novidades_v1';
  var PREFIXO_SNAP = 'bancada_novidades_v1_snap:';
  // Tempo contínuo à vista, com a aba visível, para uma marca contar como lida.
  var LEITURA_MS = 2000;
  var ESPERA_GRAVAR = 250;
  var INTERVALO_VERSAO = 30000;
  // A mesma forma de chave que o gerador aceita para escrever a base.
  var CHAVE_VALIDA = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
  // De 10 em 10%: "metade da marca" e "metade da tela" são conferidos a cada
  // passo, e uma peça alta (maior que a tela) também cruza os dois limites.
  var LIMIARES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  var CATEGORIAS = ['acrescimo', 'correcao', 'remocao'];
  // Nós de texto direto dentro destes só têm espaço (entre linhas, entre
  // itens). Uma marca ali seria filho inválido de tabela ou lista.
  var PAIS_SEM_TEXTO = conjunto(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'ul', 'ol', 'dl', 'select', 'optgroup', 'datalist']);

  function conjunto(lista) {
    var o = {};
    (lista || []).forEach(function (x) { o[x] = true; });
    return o;
  }

  function relatar(e) {
    try {
      if (raiz.console && raiz.console.warn) raiz.console.warn('[novidades]', e);
    } catch (x) { /* nada a fazer */ }
  }

  /** Um tratador de evento que nunca deixa um erro escapar para a página. */
  function seguro(fn) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        relatar(e);
        return undefined;
      }
    };
  }

  function relogio() {
    try {
      return raiz.performance && raiz.performance.now ? raiz.performance.now() : Date.now();
    } catch (e) {
      return Date.now();
    }
  }

  // ── Armazenamento ───────────────────────────────────────────────────────
  //
  // localStorage, com try/catch em todo acesso: modo privado, cota zerada e
  // armazenamento bloqueado viram "sem estado", nunca erro. Um índice
  // pequeno (`bancada_novidades_v1`) e um snapshot por página
  // (`bancada_novidades_v1_snap:<chave>`), para ler uma página não custar o
  // parse de todas.

  function criarArmazem() {
    var ls = null;
    try {
      ls = raiz.localStorage || null;
      if (ls) ls.getItem(CHAVE_INDICE);
    } catch (e) {
      ls = null;
    }

    function ler(k) {
      if (!ls) return null;
      try { return ls.getItem(k); } catch (e) { return null; }
    }

    function lerJSON(k) {
      var s = ler(k);
      if (s === null) return null;
      try { return JSON.parse(s); } catch (e) { return null; }
    }

    function remover(k) {
      if (!ls) return;
      try { ls.removeItem(k); } catch (e) { /* segue */ }
    }

    function chavesDeSnapshot() {
      var r = [];
      if (!ls) return r;
      try {
        for (var i = 0; i < ls.length; i++) {
          var k = ls.key(i);
          if (k && k.indexOf(PREFIXO_SNAP) === 0) r.push(k.slice(PREFIXO_SNAP.length));
        }
      } catch (e) { /* segue com o que achou */ }
      return r;
    }

    function cotaEsgotada(e) {
      return Boolean(e) && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
    }

    /**
     * Grava `valor` como JSON. Se a cota estourar, tira o snapshot visto há
     * mais tempo (nunca os de `protegidas`) e tenta de novo, até caber ou
     * não sobrar o que tirar.
     */
    function gravar(k, valor, protegidas) {
      if (!ls) return false;
      var texto;
      try { texto = JSON.stringify(valor); } catch (e) { return false; }
      for (var tentativa = 0; tentativa < 200; tentativa++) {
        try {
          ls.setItem(k, texto);
          return true;
        } catch (e) {
          if (!cotaEsgotada(e)) {
            relatar(e);
            return false;
          }
          var indice = lerJSON(CHAVE_INDICE);
          var ordem = ordemDeDespejo(indice && indice.paginas, chavesDeSnapshot(), protegidas);
          if (!ordem.length) return false;
          remover(PREFIXO_SNAP + ordem[0]);
        }
      }
      return false;
    }

    return { ls: ls, ler: ler, lerJSON: lerJSON, gravar: gravar, remover: remover };
  }

  // ── Início ──────────────────────────────────────────────────────────────

  function iniciar() {
    var doc = raiz.document;
    if (!doc || typeof raiz.addEventListener !== 'function') return;
    // Só dá para saber de onde veio o script enquanto ele roda: é daqui que
    // sai a raiz do site, para achar versao.json e as bases de qualquer pasta.
    var script = null;
    try {
      script = doc.currentScript || doc.querySelector('script[src$="novidades.js"]');
    } catch (e) { /* sem raiz, sem aviso e sem base */ }

    var N = raiz.BancadaNovidades;
    if (!N || typeof N !== 'object') {
      N = {};
      raiz.BancadaNovidades = N;
    }
    var app = null;

    /**
     * Para conferir à mão e no ponta a ponta: `hashLocal` é o hash dos blocos
     * tirados da página agora (as marcas não mudam a extração) e tem de ser
     * igual ao `h` do manifesto. `ms` é o tempo da extração mais o do diff.
     */
    N.depurar = function () {
      try { return app ? app.depurar() : null; } catch (e) { relatar(e); return null; }
    };
    /** Consulta o versao.json agora, sem esperar os 30 s. Devolve a decisão. */
    N.verificarVersao = function () {
      try { return app ? app.verificarVersao() : Promise.resolve(null); } catch (e) { relatar(e); return Promise.resolve(null); }
    };

    var comecar = seguro(function () {
      app = executar(doc, N, script);
    });
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', comecar);
    else comecar();
  }

  function executar(doc, N, script) {
    var win = raiz;
    var armazem = criarArmazem();

    var manifesto = null;
    try {
      var elManifesto = doc.getElementById('nov-manifesto');
      manifesto = elManifesto ? JSON.parse(elManifesto.textContent) : null;
    } catch (e) {
      manifesto = null;
    }
    if (!manifesto || typeof manifesto !== 'object' || !manifesto.paginas) return null;

    var raizDoSite = null;
    try {
      raizDoSite = new URL('./', script && script.src ? script.src : win.location.href);
    } catch (e) { /* sem raiz: nada de rede */ }

    var nucleoOk = Boolean(N.REGRAS && N.diffBlocos && N.normalizar && N.mapearOffsets && N.consolidar && N.hashDeBlocos);
    var agora = Date.now();
    var gerado = manifesto.gerado || null;

    // ── Índice ────────────────────────────────────────────────────────────

    function lerIndice() {
      var d = armazem.lerJSON(CHAVE_INDICE);
      if (!d || typeof d !== 'object' || Array.isArray(d)) d = {};
      if (!d.paginas || typeof d.paginas !== 'object' || Array.isArray(d.paginas)) d.paginas = {};
      return d;
    }

    /** Lê o índice de novo (outra aba pode ter escrito), aplica `fn` e grava. */
    function mudarIndice(fn) {
      var d = lerIndice();
      fn(d);
      armazem.gravar(CHAVE_INDICE, d, chave ? [chave] : []);
      return d;
    }

    function registrarAtividade(d) {
      d.sessao = atualizarSessao(d.sessao, Date.now());
    }

    var indice = mudarIndice(function (d) {
      d.sessao = atualizarSessao(d.sessao, agora);
    });
    var limite = limiteDaSessao(indice.sessao, agora);
    var feedVistoAntes = numero(indice.feedVistoEm);

    // ── Página de conteúdo ────────────────────────────────────────────────

    var raizConteudo = doc.querySelector('[data-novidades-raiz]');
    var chave = null;
    var pagina = null;
    if (raizConteudo) {
      chave = raizConteudo.getAttribute('data-novidades-chave') || manifesto.atual ||
        chaveDoEndereco(win.location.pathname, raizDoSite ? raizDoSite.pathname : '/');
      pagina = manifesto.paginas[chave] || null;
    }

    var estadoAnterior = null; // a entrada do índice antes desta visita
    var estadoAtual = null; // a desta visita: vale para o ponto da própria página
    var leitura = null; // os trechos marcados nesta visita e o que já foi lido
    var medidas = { extracao: null, diff: null, marcas: null, hashBase: null };
    var elResumo = raizConteudo ? (raizConteudo.querySelector('[data-nov-resumo]') || raizConteudo.querySelector('.nov-resumo')) : null;

    // As regras de extração do núcleo, em forma de consulta rápida.
    var R = N.REGRAS || {};
    var BLOCO = conjunto(R.tagsDeBloco);
    var SEPARADORA = conjunto(R.tagsSeparadoras);
    var TAG_IGNORADA = conjunto(R.tagsIgnoradas);
    var CLASSES_IGNORADAS = (R.classesIgnoradas || []).slice();
    var ATRIBUTOS = R.atributosIgnorados || {};
    var NOMES_ATRIBUTOS = Object.keys(ATRIBUTOS);

    /** O elemento sai da extração com tudo o que tem dentro (regra 2 do núcleo). */
    function ignorado(el) {
      if (TAG_IGNORADA[el.localName]) return true;
      for (var i = 0; i < NOMES_ATRIBUTOS.length; i++) {
        if (el.getAttribute(NOMES_ATRIBUTOS[i]) === ATRIBUTOS[NOMES_ATRIBUTOS[i]]) return true;
      }
      var cl = el.classList;
      if (cl && cl.length) {
        for (var j = 0; j < CLASSES_IGNORADAS.length; j++) if (cl.contains(CLASSES_IGNORADAS[j])) return true;
      }
      return false;
    }

    /**
     * Os blocos de texto de `raizEl`, pelas mesmas regras do `html.js`:
     * elemento de bloco fecha o bloco corrente ao entrar e ao sair; célula e
     * `<br>` põem um espaço; elemento ignorado não conta nada, nem espaço.
     * Para cada bloco guarda também os segmentos (o nó de texto e o texto
     * cru, ou `no: null` para o espaço de uma célula) e o elemento de bloco
     * que o contém, para as marcas voltarem ao DOM.
     */
    function extrair(raizEl) {
      var blocos = [];
      var segs = [];
      var hosts = [];
      var atual = [];
      var texto = '';
      var host = null;
      var ordem = 0;

      function fechar() {
        if (atual.length) {
          var t = N.normalizar(texto);
          if (t) {
            blocos.push(t);
            segs.push(atual);
            hosts.push(host);
          }
        }
        atual = [];
        texto = '';
        host = null;
      }

      function separar() {
        atual.push({ no: null, t: ' ', o: -1 });
        texto += ' ';
      }

      function visitar(el, hostDoPai) {
        var nome = el.localName;
        var ehBloco = BLOCO[nome] === true;
        var ehSeparadora = !ehBloco && SEPARADORA[nome] === true;
        if (ehBloco) fechar();
        else if (ehSeparadora) separar();
        var h = ehBloco ? el : hostDoPai;
        for (var f = el.firstChild; f; f = f.nextSibling) {
          if (f.nodeType === 3) {
            if (host === null) host = h;
            atual.push({ no: f, t: f.data, o: ordem++ });
            texto += f.data;
          } else if (f.nodeType === 1 && !ignorado(f)) {
            visitar(f, h);
          }
        }
        if (ehBloco) fechar();
        else if (ehSeparadora) separar();
      }

      visitar(raizEl, raizEl);
      fechar();
      return { blocos: blocos, segs: segs, hosts: hosts };
    }

    function lerSnapshot() {
      var s = armazem.lerJSON(PREFIXO_SNAP + chave);
      if (!s) return null;
      if (s.x !== N.VERSAO_EXTRACAO || !Array.isArray(s.blocos)) {
        // Extraído por outra regra: não compara com nada de hoje.
        armazem.remover(PREFIXO_SNAP + chave);
        return null;
      }
      if (!Array.isArray(s.lidos)) s.lidos = [];
      return s;
    }

    function gravarSnapshot(s) {
      return armazem.gravar(PREFIXO_SNAP + chave, {
        x: N.VERSAO_EXTRACAO,
        origem: s.origem,
        em: s.em,
        blocos: s.blocos,
        lidos: s.lidos || [],
      }, [chave]);
    }

    function salvarEstado() {
      if (!chave || !estadoAtual) return;
      indice = mudarIndice(function (d) {
        d.paginas[chave] = { aceito: estadoAtual.aceito, pend: estadoAtual.pend, visto: estadoAtual.visto };
        registrarAtividade(d);
      });
    }

    /** A página de agora vira a referência: sem marcas, sem pendência. */
    function aceitar(ext) {
      var e = ext || extrair(raizConteudo);
      gravarSnapshot({ origem: 'visita', em: agora, blocos: e.blocos, lidos: [] });
      estadoAtual = { aceito: pagina.h, pend: 0, visto: agora };
      salvarEstado();
      atualizarCromo();
    }

    /**
     * A regra de carga do contrato, na ordem, com um atalho na frente que dá
     * o mesmo resultado: `aceito===h` sem pendência quer dizer que o
     * snapshot já é esta página, e o diff não acharia nada.
     */
    function processarPagina() {
      if (!raizConteudo || !pagina || !pagina.h || !nucleoOk || !chave) return;
      var est = indice.paginas[chave];
      estadoAnterior = est && typeof est === 'object' ? { aceito: est.aceito || null, pend: est.pend, visto: est.visto } : null;

      if (estadoAnterior && estadoAnterior.aceito === pagina.h && !(estadoAnterior.pend > 0)) {
        estadoAtual = { aceito: pagina.h, pend: 0, visto: agora };
        // O snapshot pode ter saído por falta de espaço: volta, para a
        // próxima mudança ter com o que comparar.
        if (armazem.ler(PREFIXO_SNAP + chave) === null) aceitar(null);
        else salvarEstado();
        return;
      }

      // 1. Snapshot desta leitora.
      var snap = lerSnapshot();
      if (snap) {
        mostrarDiff(snap, false);
        return;
      }
      // 2. Já aceita, mas o snapshot se perdeu.
      if (estadoAnterior && estadoAnterior.aceito === pagina.h) {
        aceitar(null);
        return;
      }
      // 3. Página que não existia na base de 7 dias.
      if (pagina.nova) {
        aceitar(null);
        resumoSimples('Página nova');
        voltarAoAlvoDoEndereco();
        return;
      }
      // 4. A versão de 7 dias atrás, se o build escreveu uma.
      if (pagina.temBase && raizDoSite && CHAVE_VALIDA.test(chave)) {
        buscarBase().then(seguro(function (base) {
          if (base) mostrarDiff(base, true);
          else aceitar(null);
        }), seguro(function () {
          aceitar(null);
        }));
        return;
      }
      // 5. Nada com o que comparar.
      aceitar(null);
    }

    /**
     * A base de 7 dias desta página, como um snapshot de origem '7d', ou null.
     * A Cloudflare responde 200 com a capa para endereço que não existe; por
     * isso só vale um documento com `data-novidades-base` e a mesma chave.
     */
    function buscarBase() {
      var url = new URL('novidades/base/' + chave + '.html', raizDoSite).href;
      var controle = typeof AbortController === 'function' ? new AbortController() : null;
      var prazo = controle ? setTimeout(function () { controle.abort(); }, 10000) : null;
      var opcoes = { credentials: 'same-origin' };
      if (controle) opcoes.signal = controle.signal;
      return fetch(url, opcoes)
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (html) {
          if (prazo) clearTimeout(prazo);
          if (!html || typeof DOMParser !== 'function') return null;
          var d = new DOMParser().parseFromString(html, 'text/html');
          var candidatos = d.querySelectorAll('[data-novidades-base]');
          var embrulho = null;
          for (var i = 0; i < candidatos.length; i++) {
            if (candidatos[i].getAttribute('data-novidades-chave') === chave) { embrulho = candidatos[i]; break; }
          }
          if (!embrulho) return null;
          var raizBase = embrulho.querySelector('[data-novidades-raiz]') || embrulho.querySelector('article.cbl-documento') || embrulho;
          var blocos = extrair(raizBase).blocos;
          medidas.hashBase = N.hashDeBlocos(blocos);
          var em = Date.parse(embrulho.getAttribute('data-novidades-em') || '');
          return { origem: '7d', em: em === em ? em : agora - JANELA, blocos: blocos, lidos: [] };
        });
    }

    function mostrarDiff(snap, daBase) {
      var t0 = relogio();
      var ext = extrair(raizConteudo);
      var t1 = relogio();
      var r = N.diffBlocos(snap.blocos, ext.blocos);
      var t2 = relogio();
      medidas.extracao = t1 - t0;
      medidas.diff = t2 - t1;
      var referencia = referenciaDoResumo(snap, estadoAnterior, agora, daBase);

      // Mudou demais para marcar trecho a trecho: só o aviso, e a página de
      // agora vira a referência (não há marca para ler).
      if (r.reescrita) {
        medidas.reescrita = true;
        aceitar(ext);
        resumoReescrita(referencia);
        voltarAoAlvoDoEndereco();
        return;
      }

      var jaLidos = conjunto(snap.lidos);
      var pendentes = r.hunks.filter(function (h) { return !jaLidos[h.id]; });
      medidas.degradado = r.degradado;
      if (!pendentes.length) {
        aceitar(ext);
        return;
      }

      var diff = { snap: snap, daBase: daBase, ext: ext, r: r, pendentes: pendentes, referencia: referencia };
      if (recolherMarcas(pendentes.length)) recolher(diff);
      else aplicarMarcas(diff, false);
    }

    /**
     * Marca a página e liga a leitura. `aPedido`: veio de "Mostrar as marcas"
     * numa página recolhida, que já gravou a base e o estado ao abrir.
     */
    function aplicarMarcas(diff, aPedido) {
      var t3 = relogio();
      marcar(diff.pendentes, diff.ext);
      medidas.marcas = relogio() - t3;

      var mostradas = diff.pendentes.filter(function (h) { return h.pecas.length > 0; });
      if (!mostradas.length) {
        if (aPedido) lerTudoSemMarcas(diff);
        else aceitar(diff.ext);
        return;
      }

      leitura = {
        snap: diff.snap,
        blocos: diff.ext.blocos,
        hunks: diff.r.hunks,
        pendentes: diff.pendentes,
        mostradas: mostradas,
        lidos: new Set(diff.snap.lidos),
        restantes: mostradas.length,
        sujo: false,
      };
      // O que não achou lugar na página não tem como ser visto: conta como lido.
      diff.pendentes.forEach(function (h) {
        if (!h.pecas.length) { h.lido = true; leitura.lidos.add(h.id); leitura.sujo = true; }
      });

      estadoAtual = { aceito: estadoAnterior ? estadoAnterior.aceito : null, pend: leitura.restantes, visto: aPedido ? Date.now() : agora };
      // A base vira o snapshot já: recarregar sem ler mostra as mesmas marcas.
      if (diff.daBase && !aPedido) gravarSnapshot(diff.snap);
      if (leitura.sujo) gravarLeitura();
      else salvarEstado();

      prepararLeitura();
      montarResumo(diff.referencia);
      prepararAncoras(leitura.mostradas, function (h) { return h.embrulho || h.alvo; });
      voltarAoAlvoDoEndereco();
      atualizarCromo();
      // Outra aba pode ter lido parte desta página enquanto esta estava recolhida.
      if (aPedido) sincronizarLeitura();
    }

    // ── Página que mudou demais ───────────────────────────────────────────
    //
    // Mais de LIMITE_TRECHOS trechos: a página abre limpa, e o resumo diz que
    // ela mudou muito, com "Mostrar as marcas" e "Marcar como lida". Recolhida,
    // nada conta como lido só por estar à vista (não há marca à vista); os
    // pontos da barra ficam até ela ser lida, e os das âncoras mostram as
    // seções que mudaram. Nada disso é gravado: na próxima visita, se ainda
    // passar do limite, ela abre recolhida de novo.

    var recolhido = null; // o diff pronto, à espera de "Mostrar as marcas"

    function recolher(diff) {
      recolhido = diff;
      diff.pendentes.forEach(function (h) { h.lido = false; h.pecas = []; });
      estadoAtual = { aceito: estadoAnterior ? estadoAnterior.aceito : null, pend: diff.pendentes.length, visto: agora };
      if (diff.daBase) gravarSnapshot(diff.snap);
      salvarEstado();
      resumoRecolhido(diff);
      prepararAncoras(diff.pendentes, function (h) { return lugarNoTexto(h, diff.ext); });
      voltarAoAlvoDoEndereco();
      atualizarCromo();
    }

    /** O elemento de bloco onde o trecho está, ou onde estava, numa remoção. */
    function lugarNoTexto(h, ext) {
      var n = ext.hosts.length;
      if (!n) return null;
      var j;
      if (h.novos && h.novos.length) j = h.novos[0].bloco;
      else if (h.remocao && h.remocao.bloco !== undefined) j = h.remocao.bloco;
      else if (h.remocao && h.remocao.aposBloco !== undefined) j = h.remocao.aposBloco;
      else return null;
      return ext.hosts[Math.max(0, Math.min(j, n - 1))];
    }

    function mostrarMarcasAgora() {
      var diff = recolhido;
      if (!diff) return;
      recolhido = null;
      aplicarMarcas(diff, true);
      // O botão saiu junto com o resumo recolhido: o foco vai para o primeiro
      // chip, o próximo passo natural. (Sem nenhuma marca possível, a página
      // ficou lida, e `tudoLido` já pôs o foco no resumo.)
      var chip = elResumo ? elResumo.querySelector('.nov-chip:not(:disabled)') : null;
      if (chip) {
        try { chip.focus({ preventScroll: true }); } catch (e) { chip.focus(); }
      }
    }

    /** "Marcar como lida": `consolidar` com todos os trechos lidos, e `aceito = h`. */
    function lerTudoRecolhido() {
      var diff = recolhido;
      if (!diff) return;
      recolhido = null;
      lerTudoSemMarcas(diff);
    }

    function lerTudoSemMarcas(diff) {
      var todos = diff.r.hunks.map(function (h) { return h.id; });
      var r = N.consolidar(diff.snap.blocos, diff.ext.blocos, diff.r.hunks, todos);
      var quando = Date.now();
      gravarSnapshot({ origem: 'visita', em: quando, blocos: r.blocos, lidos: r.lidos });
      estadoAtual = { aceito: pagina.h, pend: 0, visto: quando };
      salvarEstado();
      diff.pendentes.forEach(function (h) { h.lido = true; });
      atualizarAncoras();
      tudoLido();
      atualizarCromo();
    }

    /** Lida por inteiro em outra aba: fica lida aqui também, sem gravar de novo. */
    function sincronizarRecolhido() {
      if (!recolhido) return;
      var est = lerIndice().paginas[chave];
      if (!est || est.aceito !== pagina.h || est.pend > 0) return;
      recolhido.pendentes.forEach(function (h) { h.lido = true; });
      recolhido = null;
      estadoAtual = { aceito: pagina.h, pend: 0, visto: numero(est.visto) || Date.now() };
      atualizarAncoras();
      tudoLido();
      atualizarCromo();
    }

    function resumoRecolhido(diff) {
      if (!elResumo) return;
      limpar(elResumo);
      elResumo.appendChild(rotuloDoResumo(diff.referencia, diff.pendentes.length));
      // Os dois com a cara de "Marcar como lidas", que já existe no CSS.
      var mostrar = doc.createElement('button');
      mostrar.type = 'button';
      mostrar.className = 'nov-marcar-lidas nov-mostrar-marcas';
      mostrar.textContent = 'Mostrar as marcas';
      mostrar.addEventListener('click', seguro(mostrarMarcasAgora));
      var lida = doc.createElement('button');
      lida.type = 'button';
      lida.className = 'nov-marcar-lidas';
      lida.textContent = 'Marcar como lida';
      lida.addEventListener('click', seguro(lerTudoRecolhido));
      elResumo.appendChild(mostrar);
      elResumo.appendChild(lida);
      mostrarResumo();
    }

    // ── Marcas ────────────────────────────────────────────────────────────

    var pecaDe = new Map(); // peça (mark, del, details) → hunk
    var alvos = new Set(); // o que recebe foco: a primeira peça, ou o summary

    function textoAntigo(h) {
      return String(h.antigoTexto || '').replace(/\s*\n\s*/g, ' ');
    }

    function textoSr(texto) {
      var s = doc.createElement('span');
      s.className = 'nov-sr';
      s.textContent = texto;
      return s;
    }

    /**
     * Põe as marcas no DOM. Cada trecho vira peças por nó de texto, sem nunca
     * atravessar a fronteira de um elemento; as operações vão da direita para
     * a esquerda, e o nó original guarda sempre o começo do texto, então as
     * posições das que faltam continuam valendo.
     */
    function marcar(pendentes, ext) {
      var mapas = {};
      function mapa(b) {
        if (mapas[b] === undefined) {
          var m = ext.segs[b] ? N.mapearOffsets(ext.segs[b].map(function (s) { return s.t; })) : null;
          mapas[b] = m && m.texto === ext.blocos[b] ? m : null;
        }
        return mapas[b];
      }

      var ops = [];
      var emBloco = [];
      pendentes.forEach(function (h) {
        h.pecas = [];
        h.ops = [];
        h.lido = false;
        h.timer = null;
        h.alvo = null;
        h.secao = -1;
        if (h.categoria === 'remocao') {
          var ponto = ehRemocaoLonga(h) ? null : pontoDaRemocao(h, ext, mapa);
          if (ponto) { ops.push(ponto); h.ops.push(ponto); } else emBloco.push(h);
          return;
        }
        (h.novos || []).forEach(function (tr, k) {
          var segs = ext.segs[tr.bloco];
          var m = mapa(tr.bloco);
          if (!m) return;
          var ini = m.localizar(tr.ini);
          var fim = m.localizar(tr.fim, true);
          for (var s = ini.seg; s <= fim.seg; s++) {
            var seg = segs[s];
            if (!seg || !seg.no) continue;
            var a = s === ini.seg ? ini.offset : 0;
            var b = s === fim.seg ? fim.offset : seg.t.length;
            if (b <= a || !/\S/.test(seg.t.slice(a, b))) continue;
            var pai = seg.no.parentNode;
            if (!pai || PAIS_SEM_TEXTO[pai.localName]) continue;
            var op = { tipo: 'marca', no: seg.no, o: seg.o, a: a, b: b, h: h, trecho: k, el: null };
            ops.push(op);
            h.ops.push(op);
          }
        });
      });

      // Direita para a esquerda: nó de texto mais adiante primeiro; no mesmo
      // nó, o trecho que começa mais adiante (e, empatado, o mais longo).
      ops.sort(function (x, y) { return y.o - x.o || y.a - x.a || y.b - x.b; });
      ops.forEach(function (op) {
        try {
          if (op.tipo === 'marca') envolver(op);
          else inserirDel(op);
        } catch (e) {
          op.el = null;
        }
      });

      pendentes.forEach(function (h) {
        if (h.categoria === 'remocao') {
          if (h.ops.length && h.ops[0].el) {
            h.pecas = [h.ops[0].el];
            h.alvo = h.ops[0].el;
          }
        } else {
          acabarMarcas(h);
        }
      });

      var depoisDe = new Map();
      emBloco.forEach(function (h) {
        try { inserirRemocaoEmBloco(h, ext, depoisDe); } catch (e) { relatar(e); }
      });

      pendentes.forEach(function (h) {
        h.pecas.forEach(function (p) { pecaDe.set(p, h); });
        if (h.alvo) alvos.add(h.alvo);
        delete h.ops;
      });
    }

    function envolver(op) {
      var no = op.no;
      if (op.b > no.data.length) return;
      no.splitText(op.b);
      var meio = no.splitText(op.a);
      var el = doc.createElement('mark');
      el.className = 'nov nov--' + op.h.categoria;
      el.setAttribute('tabindex', '-1');
      meio.parentNode.insertBefore(el, meio);
      el.appendChild(meio);
      op.el = el;
    }

    /**
     * Classes e texto de leitor de tela das peças de um acréscimo ou correção.
     * Padding e canto só nas pontas de cada trecho (`--inicio`, `--fim`): no
     * meio, as peças encostam e o preenchimento corre sem emenda.
     */
    function acabarMarcas(h) {
      var pecas = h.ops.filter(function (op) { return op.el; })
        .sort(function (x, y) { return x.o - y.o || x.a - y.a; });
      if (!pecas.length) return;
      pecas.forEach(function (op, i) {
        var ant = pecas[i - 1];
        var prox = pecas[i + 1];
        if (!ant || ant.trecho !== op.trecho) op.el.classList.add('nov--inicio');
        if (!prox || prox.trecho !== op.trecho) op.el.classList.add('nov--fim');
      });
      var primeira = pecas[0].el;
      var ultima = pecas[pecas.length - 1].el;
      primeira.insertBefore(textoSr(h.categoria === 'correcao' ? 'Corrigido: ' : 'Novo: '), primeira.firstChild);
      if (h.categoria === 'correcao') ultima.appendChild(textoSr(' (antes: ' + textoAntigo(h) + ')'));
      h.pecas = pecas.map(function (op) { return op.el; });
      h.alvo = primeira;
    }

    /** Onde entra uma remoção curta: o ponto logo depois do token anterior. */
    function pontoDaRemocao(h, ext, mapa) {
      var r = h.remocao;
      if (!r || r.bloco === undefined || !ext.segs[r.bloco]) return null;
      var m = mapa(r.bloco);
      if (!m) return null;
      var loc = r.offset > 0 ? m.localizar(r.offset, true) : m.localizar(0);
      var seg = ext.segs[r.bloco][loc.seg];
      if (!seg || !seg.no || !seg.no.parentNode || PAIS_SEM_TEXTO[seg.no.parentNode.localName]) return null;
      return {
        tipo: 'ponto', no: seg.no, o: seg.o, a: loc.offset, b: loc.offset, h: h, el: null,
        espacos: espacosDaRemocao(ext.blocos[r.bloco], r.offset),
      };
    }

    // Um espaço visível que não é texto do documento: `aria-hidden` o tira
    // da extração (e do leitor de tela), e o diff continua vendo a frase de hoje.
    function espacador() {
      var s = doc.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ' ';
      return s;
    }

    function inserirDel(op) {
      var resto = op.no.splitText(op.a);
      var del = doc.createElement('del');
      del.className = 'nov nov--remocao nov--inicio nov--fim';
      del.setAttribute('tabindex', '-1');
      del.appendChild(textoSr('Removido: '));
      del.appendChild(doc.createTextNode(textoAntigo(op.h)));
      var frag = doc.createDocumentFragment();
      if (op.espacos.antes) frag.appendChild(espacador());
      frag.appendChild(del);
      if (op.espacos.depois) frag.appendChild(espacador());
      resto.parentNode.insertBefore(frag, resto);
      op.el = del;
    }

    function criarDetalhes(h) {
      var d = doc.createElement('details');
      d.className = 'nov-removido';
      var s = doc.createElement('summary');
      var amostra = doc.createElement('span');
      amostra.className = 'nov-amostra';
      amostra.setAttribute('aria-hidden', 'true');
      var rotulo = doc.createElement('span');
      rotulo.className = 'nov-removido-rotulo';
      rotulo.textContent = 'Trecho removido';
      var contagem = doc.createElement('span');
      contagem.className = 'nov-removido-contagem';
      contagem.textContent = h.palavras + (h.palavras === 1 ? ' palavra' : ' palavras');
      s.appendChild(amostra);
      s.appendChild(rotulo);
      s.appendChild(textoSr(', '));
      s.appendChild(contagem);
      var corpo = doc.createElement('div');
      corpo.className = 'nov-removido-texto';
      String(h.antigoTexto || '').split('\n').forEach(function (linha) {
        if (!/\S/.test(linha)) return;
        var p = doc.createElement('p');
        p.textContent = linha;
        corpo.appendChild(p);
      });
      d.appendChild(s);
      d.appendChild(corpo);
      return d;
    }

    function colunasDe(tr) {
      var n = 0;
      var celulas = tr.cells || [];
      for (var i = 0; i < celulas.length; i++) n += celulas[i].colSpan || 1;
      return Math.max(1, n);
    }

    function primeiroNo(ext, j) {
      var segs = ext.segs[j] || [];
      for (var i = 0; i < segs.length; i++) if (segs[i].no) return segs[i].no;
      return null;
    }

    /**
     * Onde entra uma remoção de bloco: antes ou depois do elemento de bloco
     * vizinho. "Depois do bloco j" vira "antes do bloco j+1" quando o
     * elemento de j contém o de j+1 (item de lista com sublista), para a
     * remoção não ir parar depois dos filhos.
     */
    function posicaoDaRemocao(h, ext) {
      var r = h.remocao || {};
      var n = ext.hosts.length;
      if (!n) return null;
      function antesDe(k) {
        return { ref: ext.hosts[Math.max(0, Math.min(k, n - 1))], lado: 'antes' };
      }
      function depoisDe(k) {
        if (k < 0) return antesDe(0);
        if (k >= n - 1) return { ref: ext.hosts[n - 1], lado: 'depois' };
        var proximo = primeiroNo(ext, k + 1);
        if (proximo && ext.hosts[k].contains(proximo)) return antesDe(k + 1);
        return { ref: ext.hosts[k], lado: 'depois' };
      }
      if (r.aposBloco !== undefined) return depoisDe(r.aposBloco);
      if (r.bloco === undefined) return null;
      return r.offset > 0 ? depoisDe(r.bloco) : antesDe(r.bloco);
    }

    function inserirRemocaoEmBloco(h, ext, depoisDe) {
      var pos = posicaoDaRemocao(h, ext);
      if (!pos || !pos.ref) return;
      var ref = pos.ref;
      var details = criarDetalhes(h);
      var embrulho = details;
      if (ref.localName === 'tr') {
        embrulho = doc.createElement('tr');
        embrulho.className = 'nov-removido';
        var td = doc.createElement('td');
        td.colSpan = colunasDe(ref);
        td.appendChild(details);
        embrulho.appendChild(td);
      } else if (ref.localName === 'li') {
        embrulho = doc.createElement('li');
        embrulho.className = 'nov-removido';
        embrulho.appendChild(details);
      }
      // A raiz não tem vizinho dentro do conteúdo: entra nela, na ponta.
      if (ref === raizConteudo || !raizConteudo.contains(ref)) {
        if (pos.lado === 'antes') raizConteudo.insertBefore(embrulho, raizConteudo.firstChild);
        else raizConteudo.appendChild(embrulho);
      } else if (pos.lado === 'antes') {
        ref.parentNode.insertBefore(embrulho, ref);
      } else {
        var apos = depoisDe.get(ref) || ref;
        // Não separa o título da linha de resumo logo abaixo dele.
        while (apos.nextElementSibling && apos.nextElementSibling.hasAttribute('data-nov-resumo')) apos = apos.nextElementSibling;
        apos.parentNode.insertBefore(embrulho, apos.nextSibling);
        depoisDe.set(ref, embrulho);
      }
      h.pecas = [details];
      h.embrulho = embrulho;
      h.alvo = details.querySelector('summary');
    }

    // ── Leitura ───────────────────────────────────────────────────────────

    var observador = null;
    var visivel = new Map(); // peça → está à vista pela regra dos 50%
    var timerGravar = null;

    function prepararLeitura() {
      // A ordem do documento, para o chip andar de marca em marca.
      leitura.ordem = leitura.mostradas.slice().sort(function (x, y) {
        var p = x.alvo.compareDocumentPosition(y.alvo);
        return p & 4 ? -1 : p & 2 ? 1 : 0;
      });
      leitura.ordem.forEach(function (h, i) { h.ordem = i; });
      if (typeof raiz.IntersectionObserver !== 'function') return;
      observador = new raiz.IntersectionObserver(seguro(aoCruzar), { threshold: LIMIARES });
      pecaDe.forEach(function (h, peca) {
        if (!h.lido) observador.observe(peca);
      });
    }

    function aoCruzar(entradas) {
      entradas.forEach(function (en) {
        var h = pecaDe.get(en.target);
        if (!h || h.lido) return;
        var altura = en.rootBounds ? en.rootBounds.height : win.innerHeight;
        var ok = en.isIntersecting && (en.intersectionRatio >= 0.5 || en.intersectionRect.height >= 0.5 * altura);
        visivel.set(en.target, ok);
        avaliar(h);
      });
    }

    function hunkVisivel(h) {
      for (var i = 0; i < h.pecas.length; i++) if (visivel.get(h.pecas[i]) === true) return true;
      return false;
    }

    /** Liga ou desliga os 2 s de um trecho: à vista, com a aba visível, e sem parar. */
    function avaliar(h) {
      if (h.lido) return;
      var conta = hunkVisivel(h) && doc.visibilityState === 'visible';
      if (conta && !h.timer) {
        h.timer = setTimeout(seguro(function () {
          h.timer = null;
          if (hunkVisivel(h) && doc.visibilityState === 'visible') lerHunk(h);
        }), LEITURA_MS);
      } else if (!conta && h.timer) {
        clearTimeout(h.timer);
        h.timer = null;
      }
    }

    function lerHunk(h, lote) {
      if (!h || h.lido) return false;
      h.lido = true;
      if (h.timer) { clearTimeout(h.timer); h.timer = null; }
      h.pecas.forEach(function (p) {
        p.classList.add('nov--lida');
        if (observador) observador.unobserve(p);
      });
      if (h.embrulho && h.embrulho !== h.pecas[0]) h.embrulho.classList.add('nov--lida');
      leitura.lidos.add(h.id);
      leitura.restantes--;
      leitura.sujo = true;
      if (!lote) depoisDeLer();
      return true;
    }

    var telaAgendada = false;

    function depoisDeLer() {
      estadoAtual.pend = leitura.restantes;
      if (leitura.restantes === 0) estadoAtual.aceito = pagina.h;
      agendarGravacao();
      // Uma tabela que entra na tela lê vários trechos no mesmo instante:
      // resumo, âncoras e barra se atualizam uma vez só, no próximo quadro.
      if (telaAgendada) return;
      telaAgendada = true;
      var rodar = seguro(function () {
        telaAgendada = false;
        atualizarResumo();
        atualizarAncoras();
        atualizarCromo();
      });
      if (win.requestAnimationFrame) win.requestAnimationFrame(rodar);
      else setTimeout(rodar, 16);
    }

    function agendarGravacao() {
      if (timerGravar) clearTimeout(timerGravar);
      timerGravar = setTimeout(seguro(gravarLeitura), ESPERA_GRAVAR);
    }

    /**
     * Grava o que foi lido: `consolidar` sobre o snapshot com que a visita
     * começou e o diff inteiro, com todos os ids lidos até agora. Lacuna toda
     * lida passa a ter o texto novo; com tudo lido, o snapshot é a página.
     */
    function gravarLeitura() {
      if (timerGravar) { clearTimeout(timerGravar); timerGravar = null; }
      if (!leitura || !leitura.sujo) return;
      var r = N.consolidar(leitura.snap.blocos, leitura.blocos, leitura.hunks, Array.from(leitura.lidos));
      var fim = leitura.restantes === 0;
      var quando = Date.now();
      gravarSnapshot({
        origem: fim ? 'visita' : leitura.snap.origem,
        em: fim ? quando : leitura.snap.em,
        blocos: r.blocos,
        lidos: r.lidos,
      });
      estadoAtual.visto = quando;
      salvarEstado();
      leitura.sujo = false;
    }

    function marcarTodas() {
      if (!leitura) return;
      leitura.mostradas.forEach(function (h) { lerHunk(h, true); });
      depoisDeLer();
      gravarLeitura();
    }

    /**
     * Outra aba leu trechos desta mesma página: o que já não está pendente
     * no snapshot dela é marcado como lido aqui também. Assim a próxima
     * gravação desta aba inclui o que a outra leu, em vez de desfazer.
     */
    function sincronizarLeitura() {
      if (!leitura || leitura.restantes === 0) return;
      var s = armazem.lerJSON(PREFIXO_SNAP + chave);
      if (!s || s.x !== N.VERSAO_EXTRACAO || !Array.isArray(s.blocos)) return;
      var r = N.diffBlocos(s.blocos, leitura.blocos);
      if (r.reescrita) return;
      var lidosLa = conjunto(s.lidos);
      var pendentesLa = {};
      r.hunks.forEach(function (h) { if (!lidosLa[h.id]) pendentesLa[h.id] = true; });
      var mudou = false;
      leitura.mostradas.forEach(function (h) {
        if (!h.lido && !pendentesLa[h.id]) mudou = lerHunk(h, true) || mudou;
      });
      if (mudou) depoisDeLer();
    }

    // ── Resumo sob o título ───────────────────────────────────────────────

    var chips = {};
    var cursores = {};
    var ultimoChip = null;

    function limpar(el) {
      while (el.firstChild) el.removeChild(el.firstChild);
    }

    function span(classe, texto) {
      var s = doc.createElement('span');
      s.className = classe;
      if (texto !== undefined) s.textContent = texto;
      return s;
    }

    function tempo(ms) {
      var t = doc.createElement('time');
      t.setAttribute('datetime', new Date(ms).toISOString());
      t.textContent = dataCurta(ms, Date.now());
      return t;
    }

    /** `.nov-resumo-rotulo` com a data em `<time>`; com `n`, a frase de página recolhida. */
    function rotuloDoResumo(ref, n) {
      var p = partesDoRotulo(ref, n);
      var rot = span('nov-resumo-rotulo');
      rot.appendChild(doc.createTextNode(p.antes));
      if (p.em !== null) rot.appendChild(tempo(p.em));
      if (p.depois) rot.appendChild(doc.createTextNode(p.depois));
      return rot;
    }

    function rotuloComData(antes, ms, depois) {
      var rot = span('nov-resumo-rotulo');
      rot.appendChild(doc.createTextNode(antes));
      rot.appendChild(tempo(ms));
      rot.appendChild(doc.createTextNode(depois));
      return rot;
    }

    function mostrarResumo() {
      if (elResumo) elResumo.hidden = false;
    }

    function resumoSimples(texto) {
      if (!elResumo) return;
      limpar(elResumo);
      elResumo.appendChild(span('nov-resumo-rotulo', texto));
      mostrarResumo();
    }

    function resumoReescrita(ref) {
      if (!elResumo) return;
      limpar(elResumo);
      if (ref.tipo === '7d') elResumo.appendChild(span('nov-resumo-rotulo', 'Página reescrita nos últimos 7 dias'));
      else elResumo.appendChild(rotuloComData(ref.tipo === 'desde' ? 'Página reescrita desde ' : 'Página reescrita desde sua visita de ', ref.em, ''));
      mostrarResumo();
    }

    function montarResumo(ref) {
      if (!elResumo) return;
      limpar(elResumo);
      elResumo.appendChild(rotuloDoResumo(ref, null));

      chips = {};
      CATEGORIAS.forEach(function (cat) {
        var total = leitura.mostradas.filter(function (h) { return h.categoria === cat; }).length;
        if (!total) return;
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'nov-chip nov-chip--' + cat;
        var amostra = span('nov-amostra');
        amostra.setAttribute('aria-hidden', 'true');
        b.appendChild(amostra);
        b.appendChild(doc.createTextNode(rotuloDoChip(cat, total)));
        var sr = textoSr(', ir para o próximo');
        b.appendChild(sr);
        b.addEventListener('click', seguro(function () { navegar(cat, b); }));
        elResumo.appendChild(b);
        chips[cat] = { el: b, sr: sr };
      });

      var todas = doc.createElement('button');
      todas.type = 'button';
      todas.className = 'nov-marcar-lidas';
      todas.textContent = 'Marcar como lidas';
      todas.addEventListener('click', seguro(marcarTodas));
      elResumo.appendChild(todas);
      mostrarResumo();
      atualizarResumo();
    }

    function atualizarResumo() {
      if (!leitura || !elResumo) return;
      if (leitura.restantes === 0) {
        tudoLido();
        return;
      }
      Object.keys(chips).forEach(function (cat) {
        var faltam = leitura.mostradas.some(function (h) { return h.categoria === cat && !h.lido; });
        var c = chips[cat];
        if (c.el.disabled !== !faltam) c.el.disabled = !faltam;
        var texto = faltam ? ', ir para o próximo' : ', todos lidos';
        if (c.sr.textContent !== texto) c.sr.textContent = texto;
      });
    }

    function tudoLido() {
      if (!elResumo || elResumo.getAttribute('data-nov-lido') === 'sim') return;
      var tinhaFoco = elResumo.contains(doc.activeElement);
      limpar(elResumo);
      elResumo.appendChild(span('nov-resumo-rotulo', 'Tudo lido nesta página'));
      elResumo.setAttribute('data-nov-lido', 'sim');
      chips = {};
      // O botão que tinha o foco sumiu: o foco fica no próprio resumo, e o
      // leitor de tela lê "Tudo lido nesta página".
      if (tinhaFoco) focarResumo();
    }

    function focarResumo() {
      if (!elResumo) return;
      elResumo.setAttribute('tabindex', '-1');
      try { elResumo.focus({ preventScroll: true }); } catch (e) { elResumo.focus(); }
    }

    /**
     * O pedaço da página que está à vista, nas coordenadas de
     * getBoundingClientRect. Com zoom de pinça (ou uma página mais larga que
     * a tela do celular), a área visível é menor que a janela de layout e
     * anda dentro dela; `innerHeight` sozinho mentiria.
     */
    function areaVisivel() {
      var vv = win.visualViewport;
      if (vv && vv.height) {
        return { topo: vv.offsetTop, base: vv.offsetTop + vv.height, esquerda: vv.offsetLeft, direita: vv.offsetLeft + vv.width };
      }
      return { topo: 0, base: win.innerHeight, esquerda: 0, direita: doc.documentElement.clientWidth || win.innerWidth };
    }

    /** Chama `fn` quando a rolagem (suave ou não) parar, ou em 1,5 s. */
    function quandoPararDeRolar(fn) {
      var anterior = null;
      var parado = 0;
      var inicio = Date.now();
      var passo = seguro(function () {
        var pos = (win.pageXOffset || 0) + ',' + (win.pageYOffset || 0);
        if (pos === anterior) parado++;
        else { parado = 0; anterior = pos; }
        if (parado >= 3 || Date.now() - inicio > 1500) fn();
        else if (win.requestAnimationFrame) win.requestAnimationFrame(passo);
        else setTimeout(passo, 16);
      });
      if (win.requestAnimationFrame) win.requestAnimationFrame(passo);
      else setTimeout(passo, 16);
    }

    function movimentoReduzido() {
      try {
        return Boolean(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) {
        return false;
      }
    }

    function abrirAncestrais(el) {
      for (var p = el.parentElement; p; p = p.parentElement) {
        if (p.localName === 'details' && !p.open && !p.classList.contains('nov-removido')) p.open = true;
      }
    }

    /**
     * O chip leva à próxima marca não lida da categoria. Na primeira vez, a
     * primeira que ainda não está inteira na tela; depois, a seguinte à
     * última visitada por ele, dando a volta no fim.
     */
    function navegar(cat, chip) {
      if (!leitura) return;
      ultimoChip = chip;
      var candidatos = leitura.ordem.filter(function (h) { return !h.lido && h.categoria === cat && h.alvo; });
      if (!candidatos.length) return;
      var cursor = null;
      if (cursores[cat] !== undefined) {
        cursor = -1;
        candidatos.forEach(function (h, i) { if (h.ordem <= cursores[cat]) cursor = i; });
      }
      var fundos = candidatos.map(function (h) { return h.alvo.getBoundingClientRect().bottom; });
      var i = escolherProximo(fundos, cursor, areaVisivel().base);
      if (i < 0) return;
      var h = candidatos[i];
      cursores[cat] = h.ordem;
      abrirAncestrais(h.alvo);
      h.alvo.scrollIntoView({ block: 'center', behavior: movimentoReduzido() ? 'auto' : 'smooth' });
      try { h.alvo.focus({ preventScroll: true }); } catch (e) { h.alvo.focus(); }
      // O foco abriu o balão da correção com a marca ainda longe, se a
      // rolagem é suave. Ele vive em coordenadas do documento e acompanha o
      // texto; quando a rolagem para, só se escolhe de novo o lado.
      quandoPararDeRolar(function () {
        if (balao && !balao.hidden && balaoHunk === h && doc.activeElement === h.alvo) abrirBalao(h.alvo);
      });
    }

    // ── Balão da correção ─────────────────────────────────────────────────

    var balao = null;
    var balaoHunk = null;
    var timerFechar = null;
    var ultimoPonteiro = 'mouse';

    function obterBalao() {
      if (balao && balao.parentNode) return balao;
      balao = doc.getElementById('nov-antes');
      if (!balao) {
        balao = doc.createElement('div');
        balao.id = 'nov-antes';
        balao.setAttribute('aria-hidden', 'true');
        balao.hidden = true;
        balao.appendChild(span('nov-antes-rotulo', 'Antes:'));
        balao.appendChild(doc.createTextNode(' '));
        balao.appendChild(span('nov-antes-texto'));
        doc.body.appendChild(balao);
      }
      return balao;
    }

    function pecaDeCorrecao(alvo) {
      var el = alvo && alvo.nodeType === 1 ? alvo : alvo && alvo.parentElement;
      var m = el && el.closest ? el.closest('mark.nov--correcao') : null;
      return m && pecaDe.has(m) ? m : null;
    }

    /** A origem do bloco de posicionamento do balão, em coordenadas da tela. */
    function origemDoBalao(b) {
      var cb = b.offsetParent;
      if (!cb || ((cb === doc.body || cb === doc.documentElement) && win.getComputedStyle(cb).position === 'static')) {
        return { x: -(win.pageXOffset || 0), y: -(win.pageYOffset || 0) };
      }
      var r = cb.getBoundingClientRect();
      return { x: r.left + cb.clientLeft - cb.scrollLeft, y: r.top + cb.clientTop - cb.scrollTop };
    }

    var alturaDoBalao = 40;

    function abrirBalao(peca) {
      var h = pecaDe.get(peca);
      if (!h || h.categoria !== 'correcao') return;
      if (timerFechar) { clearTimeout(timerFechar); timerFechar = null; }
      var b = obterBalao();
      if (balaoHunk !== h || b.hidden) b.querySelector('.nov-antes-texto').textContent = textoAntigo(h);

      var linhas = peca.getClientRects();
      var primeira = linhas.length ? linhas[0] : peca.getBoundingClientRect();
      var ultima = linhas.length ? linhas[linhas.length - 1] : primeira;
      var area = areaVisivel();
      var folga = 6;
      // O lado sai antes de mostrar, com a altura da última vez: a entrada
      // (@starting-style) anima para o lado certo desde o primeiro quadro.
      // Embaixo da última linha, se couber; senão, em cima da primeira.
      var abaixo = ultima.bottom + folga + alturaDoBalao <= area.base - 8 || primeira.top - folga - alturaDoBalao < area.topo + 8;
      if (abaixo) b.removeAttribute('data-lado');
      else b.setAttribute('data-lado', 'acima');
      b.hidden = false;

      var largura = b.offsetWidth;
      alturaDoBalao = b.offsetHeight || alturaDoBalao;
      var ancora = abaixo ? ultima : primeira;
      var topo = abaixo ? ancora.bottom + folga : ancora.top - folga - alturaDoBalao;
      var esquerda = Math.max(area.esquerda + 16, Math.min(ancora.left, area.direita - 16 - largura));
      var o = origemDoBalao(b);
      b.style.left = Math.round(esquerda - o.x) + 'px';
      b.style.top = Math.round(topo - o.y) + 'px';
      balaoHunk = h;
    }

    function fecharBalao() {
      if (timerFechar) { clearTimeout(timerFechar); timerFechar = null; }
      if (!balao || balao.hidden) return false;
      balao.hidden = true;
      balaoHunk = null;
      return true;
    }

    function agendarFecharBalao() {
      if (timerFechar) clearTimeout(timerFechar);
      // Um respiro para o ponteiro passar de uma peça à outra do mesmo trecho
      // sem o balão sumir e entrar de novo.
      timerFechar = setTimeout(seguro(fecharBalao), 120);
    }

    function ligarBalao() {
      // O toque decide pelo estado de antes dele: tocar a marca também a foca
      // (tabindex -1), e o foco abre o balão antes do click chegar.
      var abertoAntesDoToque = false;
      doc.addEventListener('pointerdown', function (e) {
        ultimoPonteiro = e.pointerType || 'mouse';
        var peca = pecaDeCorrecao(e.target);
        abertoAntesDoToque = Boolean(peca && balao && !balao.hidden && balaoHunk === pecaDe.get(peca));
      }, true);
      doc.addEventListener('pointerover', seguro(function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        var peca = pecaDeCorrecao(e.target);
        if (peca) abrirBalao(peca);
      }));
      doc.addEventListener('pointerout', seguro(function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        var peca = pecaDeCorrecao(e.target);
        if (!peca) return;
        var destino = pecaDeCorrecao(e.relatedTarget);
        if (destino && pecaDe.get(destino) === pecaDe.get(peca)) return;
        var focada = pecaDeCorrecao(doc.activeElement);
        if (focada && pecaDe.get(focada) === pecaDe.get(peca)) return;
        agendarFecharBalao();
      }));
      // Toque: tocar abre e tocar de novo fecha. Com mouse, o hover já abriu.
      doc.addEventListener('click', seguro(function (e) {
        var peca = pecaDeCorrecao(e.target);
        if (peca) {
          if (ultimoPonteiro !== 'mouse') {
            if (abertoAntesDoToque) fecharBalao();
            else abrirBalao(peca);
          }
          return;
        }
        if (balao && !balao.hidden && !pecaDeCorrecao(doc.activeElement)) fecharBalao();
      }));
      doc.addEventListener('focusin', seguro(function (e) {
        var peca = pecaDeCorrecao(e.target);
        if (peca) abrirBalao(peca);
      }));
      doc.addEventListener('focusout', seguro(function (e) {
        var peca = pecaDeCorrecao(e.target);
        if (!peca) return;
        var destino = pecaDeCorrecao(e.relatedTarget);
        if (destino && pecaDe.get(destino) === pecaDe.get(peca)) return;
        fecharBalao();
      }));
      win.addEventListener('resize', seguro(fecharBalao));
      // Esc fecha o balão e, se o foco veio de um chip, devolve o foco a ele.
      doc.addEventListener('keydown', seguro(function (e) {
        if (e.key !== 'Escape' && e.key !== 'Esc') return;
        var fechou = fecharBalao();
        var ativo = doc.activeElement;
        if (ultimoChip && ativo && (alvos.has(ativo) || pecaDe.has(ativo))) {
          if (!ultimoChip.disabled && doc.contains(ultimoChip)) ultimoChip.focus();
          else focarResumo();
          e.preventDefault();
        } else if (fechou) {
          e.preventDefault();
        }
      }));
    }

    // ── Âncoras de seção ──────────────────────────────────────────────────

    var ancoras = null;

    function lerAncoras() {
      ancoras = [];
      var links = raizConteudo.querySelectorAll('.cbl-link-ancora[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        var id;
        try { id = decodeURIComponent(links[i].getAttribute('href').slice(1)); } catch (e) { continue; }
        var alvo = id ? doc.getElementById(id) : null;
        if (alvo) ancoras.push({ link: links[i], alvo: alvo });
      }
      ancoras.sort(function (x, y) {
        var p = x.alvo.compareDocumentPosition(y.alvo);
        return p & 4 ? -1 : p & 2 ? 1 : 0;
      });
    }

    /**
     * A seção de cada trecho é o último alvo de âncora antes dele ou que o
     * contém. `posicaoDe` dá o elemento do trecho: a peça marcada ou, com a
     * página recolhida, o bloco onde ele está.
     */
    function prepararAncoras(lista, posicaoDe) {
      if (!raizConteudo) return;
      if (!ancoras) lerAncoras();
      lista.forEach(function (h) {
        var el = posicaoDe(h);
        h.secao = -1;
        if (!el) return;
        for (var k = 0; k < ancoras.length; k++) {
          var alvoK = ancoras[k].alvo;
          if (alvoK === el || alvoK.compareDocumentPosition(el) & 4) h.secao = k;
          else break;
        }
      });
      atualizarAncoras();
    }

    /** Os trechos desta visita: os marcados, ou os da página recolhida. */
    function trechosDaVisita() {
      if (leitura) return leitura.mostradas;
      if (recolhido) return recolhido.pendentes;
      return [];
    }

    function atualizarAncoras() {
      if (!ancoras || !ancoras.length) return;
      var com = {};
      trechosDaVisita().forEach(function (h) { if (!h.lido && h.secao >= 0) com[h.secao] = true; });
      ancoras.forEach(function (a, k) { pontoEm(a.link, a.link, Boolean(com[k])); });
    }

    // ── Pontos, contagem e "Para você" ────────────────────────────────────

    /**
     * Liga ou desliga o ponto: `data-novidade` em `el` (o CSS desenha) e o
     * texto ", com novidade" para leitor de tela dentro de `alvoSr`.
     */
    function pontoEm(el, alvoSr, ligar) {
      var sr = null;
      for (var c = alvoSr.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 1 && c.hasAttribute('data-nov-ponto')) { sr = c; break; }
      }
      if (ligar) {
        if (!el.hasAttribute('data-novidade')) el.setAttribute('data-novidade', '');
        if (!sr) {
          sr = textoSr(', com novidade');
          sr.setAttribute('data-nov-ponto', '');
          alvoSr.appendChild(sr);
        }
      } else {
        if (el.hasAttribute('data-novidade')) el.removeAttribute('data-novidade');
        if (sr) alvoSr.removeChild(sr);
      }
    }

    function novidadesAgora() {
      var ind = lerIndice();
      var com = {};
      Object.keys(manifesto.paginas).forEach(function (c) {
        var est = c === chave && estadoAtual ? estadoAtual : ind.paginas[c];
        com[c] = temNovidade(manifesto.paginas[c], est && typeof est === 'object' ? est : null, limite, gerado);
      });
      return com;
    }

    var cromoAgendado = false;

    function agendarCromo() {
      if (cromoAgendado) return;
      cromoAgendado = true;
      var rodar = seguro(function () { cromoAgendado = false; atualizarCromo(); });
      if (win.requestAnimationFrame) win.requestAnimationFrame(rodar);
      else setTimeout(rodar, 16);
    }

    function atualizarCromo() {
      var com = novidadesAgora();
      var links = doc.querySelectorAll('aside a[data-chave], body > header nav a[data-chave]');
      for (var i = 0; i < links.length; i++) {
        var c = links[i].getAttribute('data-chave');
        pontoEm(links[i], links[i], Boolean(manifesto.paginas[c] && com[c]));
      }
      var grupos = doc.querySelectorAll('aside details.grupo');
      for (var g = 0; g < grupos.length; g++) {
        var resumoDoGrupo = grupos[g].querySelector('summary') || grupos[g];
        pontoEm(grupos[g], resumoDoGrupo, Boolean(grupos[g].querySelector('a[data-novidade]')));
      }

      var n = 0;
      Object.keys(com).forEach(function (k) { if (com[k] && manifesto.paginas[k].conta) n++; });
      var item = doc.querySelector('.sidebar-novidades');
      var contagem = item && item.querySelector('.nov-contagem');
      if (contagem) {
        if (n > 0) {
          contagem.textContent = String(n);
          contagem.hidden = false;
          item.setAttribute('aria-label', rotuloDaContagem(n));
        } else {
          contagem.textContent = '';
          contagem.hidden = true;
          item.removeAttribute('aria-label');
        }
      }
      paraVoce(com);
    }

    function rotuloDoGrupo(grupo) {
      if (!grupo) return '';
      var el = doc.querySelector('aside details.grupo[data-secao="' + String(grupo).replace(/[^a-z0-9-]/gi, '') + '"] .grupo-rotulo');
      return el ? el.textContent.trim() : grupo.charAt(0).toUpperCase() + grupo.slice(1);
    }

    /** O rótulo da própria barra, que já sai limpo; na falta, o título do manifesto. */
    function nomeDaPagina(c, p) {
      var link = doc.querySelector('aside a[data-chave="' + c.replace(/["\\]/g, '') + '"]');
      var texto = link ? (link.querySelector('span') || link).textContent.trim() : '';
      return texto || String(p.titulo || c);
    }

    function paraVoce(com) {
      var secao = doc.querySelector('section[data-nov-para-voce]');
      var lista = secao && secao.querySelector('[data-nov-para-voce-lista]');
      if (!lista) return;
      var itens = Object.keys(com).filter(function (c) {
        var p = manifesto.paginas[c];
        return com[c] && p.conta && typeof p.href === 'string' && !/^[a-z][a-z0-9+.-]*:/i.test(p.href);
      }).map(function (c) {
        return { chave: c, p: manifesto.paginas[c], t: Date.parse(manifesto.paginas[c].t || gerado || '') || 0 };
      });
      itens.sort(function (x, y) { return y.t - x.t || (x.p.titulo < y.p.titulo ? -1 : 1); });
      limpar(lista);
      itens.forEach(function (it) {
        var li = doc.createElement('li');
        li.className = 'nov-pagina';
        var ponto = span('nov-ponto');
        ponto.setAttribute('aria-hidden', 'true');
        var a = doc.createElement('a');
        a.setAttribute('href', raizDoSite ? new URL(it.p.href, raizDoSite).href : it.p.href);
        a.textContent = nomeDaPagina(it.chave, it.p);
        li.appendChild(ponto);
        li.appendChild(a);
        var grupo = it.chave === 'documento-cbl' && !it.p.grupo ? desafioRotulo() : rotuloDoGrupo(it.p.grupo);
        if (grupo) li.appendChild(span('nov-pagina-grupo', grupo));
        lista.appendChild(li);
      });
      secao.hidden = itens.length === 0;
    }

    function desafioRotulo() {
      var a = doc.querySelector('body > header nav a[data-chave="documento-cbl"]');
      return a ? a.firstChild && a.firstChild.nodeType === 3 ? a.firstChild.data.trim() : a.textContent.trim() : 'Desafio';
    }

    // ── Página Novidades ──────────────────────────────────────────────────

    var quandosDoFeed = null;

    function prepararFeed() {
      var entradas = doc.querySelectorAll('.nov-entrada[data-em]');
      if (!entradas.length && !doc.querySelector('section.nov-dia')) return;
      quandosDoFeed = [];
      for (var i = 0; i < entradas.length; i++) {
        var li = entradas[i];
        var quando = li.getAttribute('data-em');
        quandosDoFeed.push(quando);
        if (entradaNova(quando, feedVistoAntes, limite)) {
          li.setAttribute('data-novidade', '');
          var corpo = li.querySelector('.nov-entrada-corpo') || li;
          corpo.insertBefore(textoSr('Novidade desde a sua última visita. '), corpo.firstChild);
        }
      }
      // "Hoje" e "Ontem" saem na hora da leitura: o HTML estático envelhece
      // entre um build e outro.
      var hoje = diaEmSaoPaulo(Date.now());
      var dias = doc.querySelectorAll('section.nov-dia[data-dia]');
      for (var d = 0; d < dias.length; d++) {
        var rotulo = rotuloRelativo(dias[d].getAttribute('data-dia'), hoje);
        var el = dias[d].querySelector('.nov-dia-relativo');
        if (rotulo && el) {
          el.textContent = rotulo;
          el.hidden = false;
        }
      }
    }

    // ── Aviso ao vivo ─────────────────────────────────────────────────────

    var urlVersao = raizDoSite ? new URL('versao.json', raizDoSite).href : null;
    var timerVersao = null;
    var avisoMostrado = false;
    var consultando = null;

    function verificarVersao() {
      if (avisoMostrado || !urlVersao || typeof fetch !== 'function') return Promise.resolve(null);
      if (consultando) return consultando;
      // 'no-store': o que se quer é o estado do servidor, não o do cache.
      consultando = fetch(urlVersao, { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (versao) {
          consultando = null;
          var decisao = decidirAviso(manifesto, versao);
          if (decisao) mostrarAviso(decisao);
          return decisao;
        })
        .catch(function () {
          consultando = null;
          return null; // a rede caiu; a próxima passada tenta de novo
        });
      return consultando;
    }

    // Avisa, não recarrega: quem decide é quem está lendo.
    function mostrarAviso(decisao) {
      var painel = doc.getElementById('atualizacao');
      if (!painel) return;
      var texto = painel.querySelector('span');
      if (texto) texto.textContent = textoDoAviso(decisao);
      painel.hidden = false;
      avisoMostrado = true;
      if (timerVersao) { clearInterval(timerVersao); timerVersao = null; }
    }

    // ── Endereço com âncora ───────────────────────────────────────────────

    var interagiu = false;

    function ligarInteracao() {
      var marcar = function () { interagiu = true; };
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (tipo) {
        win.addEventListener(tipo, marcar, { passive: true, capture: true, once: true });
      });
    }

    function rolarAte(alvo) {
      if (interagiu) return;
      // Sem animação: é correção de posição, não navegação. O `smooth` do CSS
      // do site calcularia o destino agora e chegaria depois, com o layout
      // já mudado.
      try { alvo.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { alvo.scrollIntoView(true); }
    }

    /**
     * As marcas mexem no texto acima do alvo: volta a ele, se ninguém rolou
     * ainda. E de novo quando as fontes chegam, que também mexem no layout.
     */
    function voltarAoAlvoDoEndereco() {
      if (interagiu || !win.location.hash || win.location.hash.length < 2) return;
      var id;
      try { id = decodeURIComponent(win.location.hash.slice(1)); } catch (e) { return; }
      var alvo = doc.getElementById(id);
      if (!alvo) return;
      rolarAte(alvo);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(seguro(function () { rolarAte(alvo); }));
    }

    // ── Ciclo de vida ─────────────────────────────────────────────────────

    function aoEsconder() {
      if (leitura) {
        leitura.mostradas.forEach(function (h) { if (h.timer) { clearTimeout(h.timer); h.timer = null; } });
        gravarLeitura();
      }
      mudarIndice(function (d) {
        registrarAtividade(d);
        if (quandosDoFeed) d.feedVistoEm = feedVistoDepois(d.feedVistoEm, quandosDoFeed);
      });
    }

    function ligarCicloDeVida() {
      doc.addEventListener('visibilitychange', seguro(function () {
        if (doc.visibilityState === 'hidden') {
          aoEsconder();
        } else {
          if (leitura) leitura.mostradas.forEach(avaliar);
          verificarVersao();
        }
      }));
      win.addEventListener('pagehide', seguro(aoEsconder));
      // Voltando pelo histórico (bfcache), a página volta como estava: o
      // estado pode ter andado em outra página nesse meio-tempo.
      win.addEventListener('pageshow', seguro(function (e) {
        if (!e.persisted) return;
        mudarIndice(registrarAtividade);
        sincronizarLeitura();
        sincronizarRecolhido();
        atualizarCromo();
        verificarVersao();
      }));
      win.addEventListener('storage', seguro(function (e) {
        if (armazem.ls && e.storageArea && e.storageArea !== armazem.ls) return;
        if (e.key === null || e.key === CHAVE_INDICE) agendarCromo();
        if (leitura && (e.key === null || e.key === PREFIXO_SNAP + chave)) sincronizarLeitura();
        if (recolhido && (e.key === null || e.key === CHAVE_INDICE)) sincronizarRecolhido();
      }));
    }

    // ── Depuração ─────────────────────────────────────────────────────────

    function depurar() {
      var r = {
        chave: chave,
        h: pagina ? pagina.h : null,
        hb: pagina ? pagina.hb : null,
        hashLocal: null,
        hunks: [],
        ms: null,
        origem: leitura ? leitura.snap.origem : recolhido ? recolhido.snap.origem : null,
        pendentes: leitura ? leitura.restantes : recolhido ? recolhido.pendentes.length : 0,
        recolhido: Boolean(recolhido),
        medidas: {
          extracao: medidas.extracao,
          diff: medidas.diff,
          marcas: medidas.marcas,
          hashBase: medidas.hashBase,
          reescrita: Boolean(medidas.reescrita),
          degradado: Boolean(medidas.degradado),
        },
      };
      if (raizConteudo && nucleoOk) r.hashLocal = N.hashDeBlocos(extrair(raizConteudo).blocos);
      if (medidas.extracao !== null && medidas.diff !== null) r.ms = Math.round((medidas.extracao + medidas.diff) * 100) / 100;
      var lista = leitura ? leitura.pendentes : recolhido ? recolhido.pendentes : null;
      if (lista) {
        r.hunks = lista.map(function (h) {
          return { id: h.id, categoria: h.categoria, palavras: h.palavras, lido: Boolean(h.lido), pecas: h.pecas.length, secao: h.secao };
        });
      }
      return r;
    }

    // ── Em ordem ──────────────────────────────────────────────────────────

    ligarInteracao();
    ligarBalao();
    ligarCicloDeVida();
    atualizarCromo();
    try {
      processarPagina();
    } catch (e) {
      relatar(e);
    }
    prepararFeed();
    if (urlVersao) timerVersao = setInterval(seguro(verificarVersao), INTERVALO_VERSAO);

    return { depurar: depurar, verificarVersao: verificarVersao };
  }

  return {
    puro: {
      atualizarSessao: atualizarSessao,
      limiteDaSessao: limiteDaSessao,
      temNovidade: temNovidade,
      chaveDoEndereco: chaveDoEndereco,
      diaEmSaoPaulo: diaEmSaoPaulo,
      rotuloRelativo: rotuloRelativo,
      dataCurta: dataCurta,
      decidirAviso: decidirAviso,
      textoDoAviso: textoDoAviso,
      ordemDeDespejo: ordemDeDespejo,
      rotuloDoChip: rotuloDoChip,
      rotuloDaContagem: rotuloDaContagem,
      espacosDaRemocao: espacosDaRemocao,
      ehRemocaoLonga: ehRemocaoLonga,
      escolherProximo: escolherProximo,
      referenciaDoResumo: referenciaDoResumo,
      entradaNova: entradaNova,
      feedVistoDepois: feedVistoDepois,
      LIMITE_TRECHOS: LIMITE_TRECHOS,
      recolherMarcas: recolherMarcas,
      textoMudouMuito: textoMudouMuito,
      partesDoRotulo: partesDoRotulo,
      textoDoRotulo: textoDoRotulo,
    },
    iniciar: iniciar,
  };
});
