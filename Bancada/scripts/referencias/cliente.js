// Cliente das referências cruzadas: o que roda no navegador de quem lê.
//
// Três coisas, nesta ordem de importância:
//
// 1. Prévia. Parar o ponteiro sobre "RN25" mostra o que a regra diz, sem sair
//    da página. No toque, a primeira batida abre a prévia numa folha no pé da
//    tela, com "Abrir"; a segunda batida no mesmo link segue o link.
// 2. Volta. Quem segue uma citação ganha uma pílula "Voltar para …" no pé da
//    tela. Ela devolve ao ponto exato de onde saiu, com o link que foi seguido
//    piscando para o olho achar o lugar. O botão Voltar do navegador faz o
//    mesmo; a pílula só o deixa à vista.
// 3. Chegada. O destino de um `#` fica preso no lugar enquanto a página ainda
//    se arruma (fontes, marca-texto do "O que há de novo"), e pisca uma vez.
//
// O gerador copia este arquivo para `site/referencias.js`, carregado com
// `defer` em toda página. Os dados da prévia vêm de `referencias.json`,
// baixado uma vez, sem pressa, depois que a página carrega.
//
// No Node (testes), o arquivo só exporta a lógica pura, sem tocar em DOM.
//
// Vai para o navegador sem transpilar. Safari 14 é o piso: nada de `??=`,
// campos privados, lookbehind ou await no topo. Tudo roda dentro de
// try/catch: um erro aqui nunca pode quebrar a página nem um link.

(function (raiz, fabrica) {
  var modulo = fabrica(raiz);
  if (typeof module === 'object' && module && module.exports) module.exports = modulo.puro;
  else modulo.iniciar();
})(typeof globalThis !== 'undefined' ? globalThis : this, function (raiz) {
  'use strict';

  var CHAVE_TRILHA = 'bancada_trilha_v1';
  var CHAVE_RESTAURAR = 'bancada_trilha_restaurar';
  var MAX_TRILHA = 20;
  // O ponteiro que só atravessa um link a caminho de outro lugar não abre
  // nada. Com uma prévia já aberta, a próxima abre quase na hora.
  var ATRASO_ABRIR = 350;
  var ATRASO_TROCAR = 80;
  var ATRASO_FECHAR = 200;
  // Quanto tempo o destino fica preso no lugar enquanto a página se arruma.
  var JANELA_FIXAR = 2500;
  var DESTAQUE = 1600;

  // ── Lógica pura ─────────────────────────────────────────────────────────

  /**
   * O endereço de uma página do site, do jeito que o registro o guarda:
   * relativo à raiz, sem `.html` e sem `index` (a Cloudflare redireciona
   * `x.html` para `x`, e a capa é `/`).
   */
  function normalizarCaminho(pathname, raizPath) {
    var p = String(pathname || '');
    try { p = decodeURI(p); } catch (e) { /* fica como veio */ }
    var r = String(raizPath || '/');
    if (p.indexOf(r) === 0) p = p.slice(r.length);
    else p = p.replace(/^\//, '');
    p = p.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1').replace(/\/$/, '');
    return p || 'index';
  }

  /** Página e seção: `notas/x#ref-rn25`. O `#` vazio não conta. */
  function lugarDe(pathname, hash, raizPath) {
    var h = String(hash || '');
    if (h === '#') h = '';
    try { h = decodeURIComponent(h); } catch (e) { /* fica como veio */ }
    return normalizarCaminho(pathname, raizPath) + h;
  }

  function semSecao(lugar) {
    var i = String(lugar).indexOf('#');
    return i === -1 ? String(lugar) : String(lugar).slice(0, i);
  }

  /** Acrescenta uma saída na trilha, sem passar de `max`. */
  function empilhar(trilha, entrada, max) {
    var nova = (trilha || []).slice();
    nova.push(entrada);
    var limite = max || MAX_TRILHA;
    return nova.length > limite ? nova.slice(nova.length - limite) : nova;
  }

  /**
   * O que fazer ao chegar num lugar.
   *
   * - `voltouPara`: a saída de onde o leitor tinha partido, se ele acabou de
   *   voltar para ela (pelo botão do navegador ou pela pílula). Ela e as
   *   seguintes saem da trilha.
   * - `mostrar`: a saída que trouxe o leitor até aqui, se é para cá que ela
   *   apontava. É ela que a pílula oferece desfazer.
   *
   * `estado` é o `history.state` do lugar, onde a saída deixou o próprio id
   * (`refOrigem`). `restaurar` é o id que a pílula deixa quando precisa
   * recarregar a origem, sem histórico para onde voltar.
   */
  function aoChegar(trilha, lugar, estado, restaurar) {
    var t = (trilha || []).slice();
    var voltouPara = null;
    var procurado = restaurar || (estado && estado.refOrigem) || null;
    if (procurado) {
      for (var i = t.length - 1; i >= 0; i--) {
        if (t[i].id === procurado) {
          if (semSecao(t[i].de) === semSecao(lugar)) {
            voltouPara = t[i];
            t = t.slice(0, i);
          }
          break;
        }
      }
    }
    var topo = t.length ? t[t.length - 1] : null;
    return { trilha: t, voltouPara: voltouPara, mostrar: topo && topo.para === lugar ? topo : null };
  }

  /** O que a pílula diz. */
  function rotuloDaVolta(entrada) {
    if (!entrada) return '';
    if (entrada.mesmaPagina || !entrada.titulo) return 'Voltar para onde você estava';
    return 'Voltar para ' + entrada.titulo;
  }

  /**
   * O título da página a partir do `<title>`: só o nome, sem o
   * " · Challenge 18" que todo título leva nem o " · Frila" de muitos.
   */
  function tituloCurto(titulo) {
    return String(titulo || '').split(/\s+·\s+/)[0].trim();
  }

  /**
   * Onde a prévia fica: abaixo do link, ou acima quando não cabe embaixo;
   * sempre dentro da tela, com 12px de margem.
   *
   * `link` e `tela` em coordenadas da janela; `tamanho` é o da prévia.
   */
  function posicionar(link, tamanho, tela) {
    var margem = 12;
    var folga = 8;
    var embaixo = link.bottom + folga;
    var lado = 'abaixo';
    var top = embaixo;
    if (embaixo + tamanho.height > tela.height - margem && link.top - folga - tamanho.height >= margem) {
      lado = 'acima';
      top = link.top - folga - tamanho.height;
    }
    var left = Math.min(Math.max(link.left, margem), Math.max(margem, tela.width - tamanho.width - margem));
    return { top: Math.round(top), left: Math.round(left), lado: lado };
  }

  /**
   * O que a prévia de um link mostra, a partir do `referencias.json`.
   *
   * `alvo` é `{ tipo: 'id', chave }` ou `{ tipo: 'lugar', lugar }` (página, ou
   * página e seção). `aqui` é o lugar da página aberta, sem seção, para dizer
   * "Nesta página" em vez de repetir o título.
   *
   * Devolve `{ id, contexto, titulo, texto, detalhes }` ou `null`.
   */
  function montarPrevia(dados, alvo, aqui) {
    if (!dados || !alvo) return null;
    if (alvo.tipo === 'id') {
      var d = dados.ids && dados.ids[alvo.chave];
      if (!d) return null;
      var mesma = semSecao(d.href) === aqui;
      var contexto = [];
      if (d.forma === 'tarefa') {
        contexto.push('Tarefa');
        if (d.status) contexto.push(d.status);
      } else {
        contexto.push(mesma ? 'Nesta página' : d.pagina);
        if (d.secao && mesma) contexto.push(d.secao);
      }
      var detalhes = (d.detalhes || []).slice();
      if (d.responsavel) detalhes.push({ rotulo: 'Responsável', valor: d.responsavel });
      return { id: d.rotulo, contexto: contexto, titulo: d.titulo || '', texto: d.texto || '', detalhes: detalhes };
    }
    var lugar = String(alvo.lugar || '');
    var secao = dados.secoes && dados.secoes[lugar];
    if (secao) {
      return {
        id: '',
        contexto: [semSecao(lugar) === aqui ? 'Nesta página' : secao.pagina],
        titulo: secao.titulo || '',
        texto: secao.texto || '',
        detalhes: [],
      };
    }
    var pagina = dados.paginas && dados.paginas[semSecao(lugar)];
    if (pagina && semSecao(lugar) !== aqui) {
      return {
        id: '',
        contexto: pagina.grupo ? [pagina.grupo] : [],
        titulo: pagina.titulo || '',
        texto: pagina.texto || '',
        detalhes: [],
      };
    }
    return null;
  }

  // ── Navegador ───────────────────────────────────────────────────────────

  function iniciar() {
    if (typeof document === 'undefined') return;
    try {
      var script = document.currentScript;
      var raizSite = new URL('.', script && script.src ? script.src : location.href);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { comecar(raizSite); });
      } else {
        comecar(raizSite);
      }
    } catch (e) { /* sem referências, os links continuam links */ }
  }

  function comecar(raizSite) {
    var raizPath = raizSite.pathname;
    var principal = document.getElementById('conteudo') || document.querySelector('main');
    if (!principal) return;

    // ── Dados da prévia ──

    var dados = null;
    var pedido = null;
    function carregar() {
      if (pedido) return pedido;
      pedido = fetch(new URL('referencias.json', raizSite).href, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        // A Cloudflare responde 200 com a capa para endereço que não existe:
        // sem o formato certo, é como se não houvesse dados.
        .then(function (j) { dados = j && j.v === 1 && j.ids ? j : null; return dados; })
        .catch(function () { return null; });
      return pedido;
    }
    var ocioso = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    window.addEventListener('load', function () { ocioso(function () { carregar(); }); });

    function lugarAtual() { return lugarDe(location.pathname, location.hash, raizPath); }
    function paginaAtual() { return normalizarCaminho(location.pathname, raizPath); }

    // ── Que links contam ──

    function noConteudo(a) {
      return a && principal.contains(a);
    }

    function interno(a) {
      if (!a || !a.getAttribute('href')) return null;
      if (a.hasAttribute('download') || (a.target && a.target !== '_self')) return null;
      var url;
      try { url = new URL(a.href, location.href); } catch (e) { return null; }
      if (url.origin !== location.origin || url.pathname.indexOf(raizPath) !== 0) return null;
      if (/\.(pdf|png|jpe?g|gif|svg|webp|zip|json|js|css)$/i.test(url.pathname)) return null;
      return url;
    }

    /** Sumários, chips e botões de marca não são citação: não seguem a trilha. */
    function foraDaTrilha(a) {
      return Boolean(a.closest('.cbl-nav-ancoras, .nov-resumo, [data-sem-trilha]'));
    }

    /** O que a prévia de um link mostraria, ou `null` se ele não tem prévia. */
    function alvoDaPrevia(a) {
      if (!noConteudo(a) || foraDaTrilha(a) || a.closest('[data-sem-previa]')) return null;
      var chave = a.getAttribute('data-ref');
      if (chave) return { tipo: 'id', chave: chave };
      // Links comuns só têm prévia dentro de um documento: no quadro de
      // tarefas ou na linha do tempo, cada link já diz aonde leva.
      if (!a.closest('[data-novidades-raiz]')) return null;
      var url = interno(a);
      if (!url) return null;
      return { tipo: 'lugar', lugar: lugarDe(url.pathname, url.hash, raizPath) };
    }

    // ── Prévia ──

    var previa = null;
    var linkAtual = null;
    var modoFolha = false;
    var timerAbrir = null;
    var timerFechar = null;
    var ultimaAberta = 0;
    var ponteiro = 'mouse';
    var prebuscados = {};

    function criarPrevia() {
      if (previa) return previa;
      previa = document.createElement('div');
      previa.id = 'ref-previa';
      previa.className = 'ref-previa';
      previa.hidden = true;
      previa.addEventListener('pointerenter', function () { clearTimeout(timerFechar); });
      previa.addEventListener('pointerleave', function (e) {
        if (!modoFolha && e.pointerType !== 'touch') agendarFechar();
      });
      document.body.appendChild(previa);
      return previa;
    }

    function el(tag, classe, texto) {
      var n = document.createElement(tag);
      if (classe) n.className = classe;
      if (texto) n.textContent = texto;
      return n;
    }

    function preencher(modelo, a) {
      var p = criarPrevia();
      p.textContent = '';
      var topo = el('p', 'ref-previa-topo');
      if (modelo.id) topo.appendChild(el('span', 'ref-previa-id', modelo.id));
      modelo.contexto.forEach(function (parte) {
        if (topo.childNodes.length) {
          var sep = el('span', 'cbl-ponto-sep');
          sep.setAttribute('aria-hidden', 'true');
          topo.appendChild(sep);
        }
        topo.appendChild(el('span', '', parte));
      });
      if (topo.childNodes.length) p.appendChild(topo);
      if (modelo.titulo) p.appendChild(el('p', 'ref-previa-titulo', modelo.titulo));
      if (modelo.texto) p.appendChild(el('p', 'ref-previa-texto', modelo.texto));
      if (modelo.detalhes.length) {
        var dl = el('dl', 'ref-previa-detalhes');
        modelo.detalhes.forEach(function (d) {
          var linha = el('div');
          linha.appendChild(el('dt', '', d.rotulo));
          linha.appendChild(el('dd', '', d.valor));
          dl.appendChild(linha);
        });
        p.appendChild(dl);
      }
      if (modoFolha) {
        var acoes = el('div', 'ref-previa-acoes');
        var abrir = el('a', 'ref-previa-abrir', modelo.id ? 'Abrir ' + modelo.id : 'Abrir');
        abrir.href = a.href;
        abrir.addEventListener('click', function () { registrarSaida(a); fechar(false); });
        var fecharBtn = el('button', 'ref-previa-fechar', 'Fechar');
        fecharBtn.type = 'button';
        fecharBtn.addEventListener('click', function () { fechar(true); });
        acoes.appendChild(abrir);
        acoes.appendChild(fecharBtn);
        p.appendChild(acoes);
      }
    }

    function mostrar(a) {
      var alvo = alvoDaPrevia(a);
      if (!alvo) return;
      carregar().then(function () {
        if (linkAtual !== a) return;
        var modelo = montarPrevia(dados, alvo, paginaAtual());
        if (!modelo) {
          if (modoFolha) { fechar(false); seguir(a); }
          return;
        }
        preencher(modelo, a);
        var p = previa;
        p.classList.toggle('ref-previa--folha', modoFolha);
        p.setAttribute('role', modoFolha ? 'dialog' : 'tooltip');
        if (modoFolha) {
          p.setAttribute('aria-label', 'Prévia de ' + (modelo.id || modelo.titulo || 'link'));
          p.style.top = '';
          p.style.left = '';
          p.hidden = false;
          p.setAttribute('tabindex', '-1');
          try { p.focus({ preventScroll: true }); } catch (e) { /* foco é cortesia */ }
        } else {
          p.removeAttribute('aria-label');
          p.removeAttribute('tabindex');
          p.style.visibility = 'hidden';
          p.hidden = false;
          reposicionar();
          p.style.visibility = '';
          a.setAttribute('aria-describedby', 'ref-previa');
          prebuscar(a);
        }
        ultimaAberta = Date.now();
      });
    }

    /**
     * Põe a prévia junto do link. Devolve `false` quando o link saiu da tela,
     * e aí não há onde pendurá-la.
     */
    function reposicionar() {
      var a = linkAtual;
      if (!a || !previa || modoFolha) return false;
      var retangulos = a.getClientRects();
      var r = retangulos.length ? retangulos[0] : a.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return false;
      var pos = posicionar(r, { width: previa.offsetWidth, height: previa.offsetHeight }, { width: window.innerWidth, height: window.innerHeight });
      previa.style.top = pos.top + 'px';
      previa.style.left = pos.left + 'px';
      previa.setAttribute('data-lado', pos.lado);
      return true;
    }

    /** A página de destino já vem para o cache enquanto a prévia está aberta. */
    function prebuscar(a) {
      var url = interno(a);
      if (!url) return;
      var pagina = url.origin + url.pathname;
      if (prebuscados[pagina] || normalizarCaminho(url.pathname, raizPath) === paginaAtual()) return;
      prebuscados[pagina] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = pagina;
      document.head.appendChild(link);
    }

    function agendarAbrir(a) {
      clearTimeout(timerFechar);
      if (linkAtual === a && previa && !previa.hidden) return;
      clearTimeout(timerAbrir);
      var aberta = previa && !previa.hidden;
      var atraso = aberta || Date.now() - ultimaAberta < 400 ? ATRASO_TROCAR : ATRASO_ABRIR;
      timerAbrir = setTimeout(function () {
        if (aberta) fechar(false);
        linkAtual = a;
        modoFolha = false;
        mostrar(a);
      }, atraso);
    }

    function agendarFechar() {
      clearTimeout(timerAbrir);
      clearTimeout(timerFechar);
      timerFechar = setTimeout(function () { fechar(false); }, ATRASO_FECHAR);
    }

    function fechar(devolverFoco) {
      clearTimeout(timerAbrir);
      clearTimeout(timerFechar);
      var a = linkAtual;
      if (a) a.removeAttribute('aria-describedby');
      if (previa && !previa.hidden) {
        previa.hidden = true;
        ultimaAberta = Date.now();
      }
      if (devolverFoco && modoFolha && a) {
        try { a.focus({ preventScroll: true }); } catch (e) { /* foco é cortesia */ }
      }
      linkAtual = null;
      modoFolha = false;
    }

    function seguir(a) {
      registrarSaida(a);
      location.href = a.href;
    }

    document.addEventListener('pointerdown', function (e) {
      ponteiro = e.pointerType || 'mouse';
      // Tocar fora da folha fecha a folha.
      if (modoFolha && previa && !previa.hidden && !previa.contains(e.target)) {
        var a = e.target.closest && e.target.closest('a');
        if (a !== linkAtual) fechar(false);
      }
    }, true);

    document.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch' || modoFolha) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && alvoDaPrevia(a)) agendarAbrir(a);
    });

    document.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch' || modoFolha) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var para = e.relatedTarget;
      if (para && (a.contains(para) || (previa && previa.contains(para)))) return;
      if (a === linkAtual) agendarFechar();
      else clearTimeout(timerAbrir);
    });

    document.addEventListener('focusin', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || modoFolha || !alvoDaPrevia(a)) return;
      var visivel = false;
      try { visivel = a.matches(':focus-visible'); } catch (err) { visivel = true; }
      if (!visivel) return;
      clearTimeout(timerAbrir);
      if (previa && !previa.hidden) fechar(false);
      linkAtual = a;
      mostrar(a);
    });

    document.addEventListener('focusout', function (e) {
      if (modoFolha) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && a === linkAtual) fechar(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && previa && !previa.hidden) fechar(true);
    });

    // A prévia flutua em coordenadas da janela: com a página rolando, ela
    // acompanha o link, e fecha quando ele sai da tela. O Tab também rola a
    // página até o link que recebe o foco, e fechar aqui apagaria a prévia de
    // quem navega pelo teclado. A folha do toque fica, presa ao pé da tela.
    var quadro = 0;
    window.addEventListener('scroll', function () {
      if (modoFolha || !previa || previa.hidden || quadro) return;
      quadro = requestAnimationFrame(function () {
        quadro = 0;
        if (!reposicionar()) fechar(false);
      });
    }, { passive: true });
    window.addEventListener('resize', function () { fechar(false); });
    window.addEventListener('pagehide', function () { fechar(false); });

    // ── Clique: folha no toque, trilha no resto ──

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || !noConteudo(a)) return;

      // No toque não há "passar por cima": a primeira batida numa citação
      // abre a prévia, a segunda no mesmo link segue.
      // `detail` 0 é Enter no teclado, que segue direto.
      if (ponteiro === 'touch' && e.detail !== 0 && a.hasAttribute('data-ref') && !(modoFolha && linkAtual === a) && alvoDaPrevia(a)) {
        e.preventDefault();
        fechar(false);
        linkAtual = a;
        modoFolha = true;
        mostrar(a);
        return;
      }
      if (modoFolha) fechar(false);
      if (!foraDaTrilha(a) && interno(a)) registrarSaida(a);
    });

    // ── Trilha ──

    function lerTrilha() {
      try {
        var t = JSON.parse(sessionStorage.getItem(CHAVE_TRILHA) || '[]');
        return Array.isArray(t) ? t : [];
      } catch (e) { return []; }
    }

    function gravarTrilha(t) {
      try { sessionStorage.setItem(CHAVE_TRILHA, JSON.stringify(t)); } catch (e) { /* sem trilha, sem pílula */ }
    }

    function juntarEstado(extra) {
      var estado = {};
      var atual = history.state;
      if (atual && typeof atual === 'object') for (var k in atual) estado[k] = atual[k];
      for (var j in extra) estado[j] = extra[j];
      try { history.replaceState(estado, ''); } catch (e) { /* histórico é cortesia */ }
    }

    /**
     * O nome desta página, como a barra o mostra: é o que a pílula vai dizer
     * na volta. Do registro, se já chegou; senão, do item aceso da barra ou do
     * topo; senão, do `<title>`.
     */
    function nomeDaPagina() {
      var pagina = dados && dados.paginas && dados.paginas[paginaAtual()];
      if (pagina && pagina.titulo) return pagina.titulo;
      var aceso = document.querySelector('aside a[aria-current="page"], body > header nav a[aria-current="page"]');
      var texto = aceso && aceso.textContent.replace(/\s+/g, ' ').trim();
      return texto || tituloCurto(document.title);
    }

    function linksDoConteudo() {
      return principal.querySelectorAll('a[href]');
    }

    function registrarSaida(a) {
      var url = interno(a);
      if (!url) return;
      var para = lugarDe(url.pathname, url.hash, raizPath);
      var de = lugarAtual();
      if (para === de) return;
      var links = linksDoConteudo();
      var indice = Array.prototype.indexOf.call(links, a);
      var entrada = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        de: de,
        deUrl: location.href,
        para: para,
        mesmaPagina: semSecao(para) === semSecao(de),
        titulo: nomeDaPagina(),
        link: indice,
        linkHref: a.getAttribute('href'),
        linkTopo: Math.round(a.getBoundingClientRect().top),
        y: Math.round(window.scrollY || window.pageYOffset || 0),
      };
      gravarTrilha(empilhar(lerTrilha(), entrada, MAX_TRILHA));
      juntarEstado({ refOrigem: entrada.id });
    }

    function acharLink(entrada) {
      var links = linksDoConteudo();
      var a = links[entrada.link];
      if (a && a.getAttribute('href') === entrada.linkHref) return a;
      for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute('href') === entrada.linkHref) return links[i];
      }
      return null;
    }

    // ── Pílula ──

    var volta = null;
    var voltaAtual = null;

    function criarVolta() {
      if (volta) return volta;
      volta = document.createElement('div');
      volta.className = 'ref-volta';
      volta.hidden = true;
      volta.innerHTML =
        '<button type="button" class="ref-volta-botao">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>' +
        '<span class="ref-volta-rotulo"></span></button>' +
        '<button type="button" class="ref-volta-fechar" aria-label="Dispensar">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
      volta.querySelector('.ref-volta-botao').addEventListener('click', voltar);
      volta.querySelector('.ref-volta-fechar').addEventListener('click', dispensar);
      document.body.appendChild(volta);
      return volta;
    }

    function mostrarVolta(entrada) {
      var v = criarVolta();
      voltaAtual = entrada;
      v.querySelector('.ref-volta-rotulo').textContent = rotuloDaVolta(entrada);
      v.querySelector('.ref-volta-botao').title = 'Voltar (o botão Voltar do navegador faz o mesmo)';
      v.hidden = false;
    }

    function esconderVolta() {
      voltaAtual = null;
      if (volta) volta.hidden = true;
    }

    function voltar() {
      var e = voltaAtual;
      if (!e) return;
      esconderVolta();
      // Com a origem logo atrás no histórico, voltar é o próprio Voltar do
      // navegador: a página sai do cache, rolada onde estava. Sem ela (a aba
      // foi recarregada, ou a chegada foi por outro caminho), recarrega a
      // origem e restaura a posição pela trilha.
      if (history.state && history.state.refDestino === e.id) {
        history.back();
        return;
      }
      try { sessionStorage.setItem(CHAVE_RESTAURAR, e.id); } catch (err) { /* segue sem restaurar */ }
      location.href = e.deUrl;
    }

    function dispensar() {
      var e = voltaAtual;
      esconderVolta();
      if (!e) return;
      gravarTrilha(lerTrilha().filter(function (x) { return x.id !== e.id; }));
    }

    // ── Chegada e volta ──

    function semAnimacao(fn) {
      var html = document.documentElement;
      var antes = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      try { fn(); } finally { html.style.scrollBehavior = antes; }
    }

    /**
     * Mantém `alinhar` valendo enquanto a página se arruma: fontes chegando,
     * o marca-texto do "O que há de novo" abrindo a linha de resumo acima do
     * destino. Para no primeiro gesto de quem lê.
     */
    function manterNoLugar(alinhar) {
      var fim = Date.now() + JANELA_FIXAR;
      var parado = false;
      var observador = null;
      function parar() {
        parado = true;
        if (observador) observador.disconnect();
        ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
          window.removeEventListener(t, parar, true);
        });
      }
      function passo() {
        if (parado) return;
        if (Date.now() > fim) { parar(); return; }
        semAnimacao(alinhar);
      }
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
        window.addEventListener(t, parar, { capture: true, passive: true });
      });
      passo();
      if (window.ResizeObserver) {
        observador = new ResizeObserver(passo);
        observador.observe(document.body);
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(passo);
      setTimeout(parar, JANELA_FIXAR);
    }

    function destacar(no, classe) {
      if (!no) return;
      no.classList.remove(classe);
      // Força o recomeço da animação quando o mesmo alvo é visitado de novo.
      void no.offsetWidth;
      no.classList.add(classe);
      setTimeout(function () { no.classList.remove(classe); }, DESTAQUE);
    }

    function alvoDoHash() {
      var h = location.hash.slice(1);
      if (!h) return null;
      try { h = decodeURIComponent(h); } catch (e) { /* fica como veio */ }
      return document.getElementById(h);
    }

    var pendente = null;
    function agendarChegada(origem) {
      clearTimeout(pendente);
      pendente = setTimeout(function () { chegar(origem); }, 0);
    }

    function chegar(origem) {
      fechar(false);
      var restaurar = null;
      try {
        restaurar = sessionStorage.getItem(CHAVE_RESTAURAR);
        if (restaurar) sessionStorage.removeItem(CHAVE_RESTAURAR);
      } catch (e) { /* sem restauração */ }

      var r = aoChegar(lerTrilha(), lugarAtual(), history.state, restaurar);
      gravarTrilha(r.trilha);

      if (r.voltouPara) {
        var entrada = r.voltouPara;
        var link = acharLink(entrada);
        // Volta com o link no mesmo ponto da tela em que estava ao ser
        // clicado. Pela posição do link, e não pelo número de pixels: se a
        // página mudou de altura desde então, o lugar certo continua certo.
        manterNoLugar(function () {
          if (link && link.isConnected) {
            window.scrollBy(0, link.getBoundingClientRect().top - entrada.linkTopo);
          } else {
            window.scrollTo(0, entrada.y);
          }
        });
        if (link) destacar(link, 'ref-voltou');
      } else if (origem !== 'volta') {
        var alvo = alvoDoHash();
        if (alvo) {
          if (origem === 'carga') manterNoLugar(function () { alvo.scrollIntoView({ block: 'start' }); });
          destacar(alvo, 'ref-alvo');
        }
      }

      if (r.mostrar) {
        juntarEstado({ refDestino: r.mostrar.id });
        mostrarVolta(r.mostrar);
      } else {
        esconderVolta();
      }
    }

    // Um clique num `#` da mesma página dispara hashchange e, em alguns
    // navegadores, popstate: `agendarChegada` junta os dois numa chegada só.
    window.addEventListener('hashchange', function () { agendarChegada('hash'); });
    window.addEventListener('popstate', function () { agendarChegada('volta'); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) agendarChegada('volta'); });

    chegar('carga');
  }

  return {
    puro: {
      normalizarCaminho: normalizarCaminho,
      lugarDe: lugarDe,
      semSecao: semSecao,
      empilhar: empilhar,
      aoChegar: aoChegar,
      rotuloDaVolta: rotuloDaVolta,
      tituloCurto: tituloCurto,
      posicionar: posicionar,
      montarPrevia: montarPrevia,
    },
    iniciar: iniciar,
  };
});
