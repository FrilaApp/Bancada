// Referências cruzadas do site: quem cita o quê, e para onde cada citação leva.
//
// Os documentos do Frila se citam o tempo todo por identificador: RN25, RF01,
// UC08, US07, T-0011, D6. No vault isso é texto puro, e o mentor que lê "RN25"
// no meio de um requisito tinha de achar sozinho, em outra página, o que a
// regra diz. Aqui o build descobre onde cada identificador é definido e
// transforma toda citação dele num link.
//
// Tudo sai do HTML já renderizado, e não do Markdown, pelo mesmo motivo do
// "O que há de novo": o Documento de Requisitos é um .docx achatado que o
// gerador remonta em tabelas, e o documento CBL nem vem do vault. O HTML é o
// único lugar onde todos têm a mesma forma.
//
// Nada aqui muda o texto de uma página, só a marcação. O hash do "O que há de
// novo" é do texto, então ligar as citações não acende novidade nenhuma.
//
// Puro: sem DOM e sem disco. Roda no Node 18 do CI.

'use strict';

/**
 * Um identificador: de 1 a 4 maiúsculas, hífen opcional e de 1 a 4 dígitos.
 *
 * As bordas impedem casar pedaço de outra coisa: `UTF-8` casa, mas só vira
 * link se alguém o definir; `E2E` não casa, porque depois do dígito vem letra;
 * `v1.2.0` não casa, porque é minúsculo; `RF01-a` não casa, e fica como está.
 */
const PADRAO_ID = /(?<![A-Za-z0-9_\-#])([A-Z]{1,4}-?)(\d{1,4})(?![A-Za-z0-9_]|[.,]\d|-[A-Za-z0-9])/g;
const ID_EXATO = /^([A-Z]{1,4}-?)(\d{1,4})$/;

/**
 * Famílias que nunca viram link, mesmo definidas. H1 a H8 são as hipóteses do
 * Roteiro de Validação, mas nas revisões de design "H1" é o nível de título:
 * ligar um ao outro mandaria o leitor para o lugar errado.
 */
const FAMILIAS_EXCLUIDAS = new Set(['H']);

/** Dentro destes elementos, citação fica como texto. */
const SEM_LINK = new Set([
  'a', 'code', 'pre', 'kbd', 'samp', 'script', 'style', 'svg', 'button', 'textarea', 'title',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'summary', 'label', 'select', 'option',
]);

const VAZIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', thinsp: ' ', mdash: '—', ndash: '–', hellip: '…' };

/** A chave de um identificador. `RF01` e `RF1` são o mesmo requisito, e `D07` é o `D7`. */
function chaveDoId(familia, numero) {
  return `${familia}${Number(numero)}`;
}

function familiaDaChave(chave) {
  return chave.replace(/\d+$/, '');
}

function decodificar(texto) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (inteiro, nome) => {
    if (nome[0] === '#') {
      const codigo = nome[1] === 'x' || nome[1] === 'X' ? parseInt(nome.slice(2), 16) : parseInt(nome.slice(1), 10);
      return Number.isFinite(codigo) ? String.fromCodePoint(codigo) : inteiro;
    }
    return ENTIDADES[nome.toLowerCase()] ?? inteiro;
  });
}

/** O texto que o leitor vê num trecho de HTML, em uma linha. */
function textoDoHtml(html) {
  return decodificar(String(html || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?)])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .trim();
}

/** Corta na última palavra inteira antes de `limite`. */
function resumir(texto, limite = 320) {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  const espaco = corte.lastIndexOf(' ');
  return `${corte.slice(0, espaco > limite * 0.6 ? espaco : limite).replace(/[\s,;:.—–-]+$/, '')}…`;
}

function atributo(tag, nome) {
  const m = tag.match(new RegExp(`\\s${nome}="([^"]*)"`));
  return m ? m[1] : null;
}

/** Todos os `id` de uma página: é contra eles que um `#seção` é conferido. */
function idsDoHtml(html) {
  const ids = new Set();
  for (const m of String(html).matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  return ids;
}

/** Os títulos (h2 a h6) com a posição, para saber a seção de um trecho. */
function titulosDoHtml(html) {
  const titulos = [];
  for (const m of String(html).matchAll(/<h([2-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g)) {
    titulos.push({ nivel: Number(m[1]), id: atributo(m[2], 'id'), texto: textoDoHtml(m[3]), inicio: m.index, fim: m.index + m[0].length });
  }
  return titulos;
}

/** A seção de um trecho: o h2 ou h3 mais próximo antes dele. */
function secaoEm(titulos, posicao) {
  let secao = null;
  for (const t of titulos) {
    if (t.inicio > posicao) break;
    if (t.nivel <= 3) secao = t.texto;
  }
  return secao;
}

/** O primeiro parágrafo depois de `posicao` e antes do próximo título. */
function paragrafoDepois(html, posicao) {
  const resto = html.slice(posicao);
  const proximoTitulo = resto.search(/<h[1-6]\b/);
  const trecho = proximoTitulo === -1 ? resto : resto.slice(0, proximoTitulo);
  const m = trecho.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  return m ? textoDoHtml(m[1]) : '';
}

/** Os títulos das colunas da tabela que contém a posição, sem o da primeira. */
function cabecalhoDaTabela(html, posicao) {
  const inicio = html.lastIndexOf('<table', posicao);
  if (inicio === -1) return [];
  const thead = html.slice(inicio, posicao).match(/<thead>([\s\S]*?)<\/thead>/);
  if (!thead) return [];
  return [...thead[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((c) => textoDoHtml(c[1])).slice(1);
}

/**
 * O que a prévia mostra de uma linha de tabela, fora o identificador.
 *
 * As tabelas do vault têm duas formas. Na do Documento de Requisitos, a
 * segunda coluna já é o texto da regra (`| RN25 | Cada conta DEVE… | Contexto |`).
 * Nas outras, ela é um nome curto e o texto vem depois
 * (`| D6 | Onde roda o despacho | Fora da requisição… |`). Nome é curto e não
 * fecha com ponto, como frase fecharia: vira título, e a primeira coluna
 * longa depois dele vira o texto. As colunas curtas que sobram
 * (prioridade, ator, requisitos ligados) vão como detalhes, com o título da
 * coluna. As longas que sobram ficam de fora: a prévia é um resumo.
 */
function conteudoDaLinha(celulas, cabecalho) {
  const CURTA = 90;
  const LONGA = 40;
  if (!celulas.length || !celulas[0]) return null;
  let titulo = null;
  let texto = '';
  const usadas = new Set();
  if (celulas[0].length <= CURTA && !/[.!?…:;]$/.test(celulas[0])) {
    const longa = celulas.findIndex((c, i) => i > 0 && c.length >= LONGA);
    titulo = celulas[0];
    usadas.add(0);
    if (longa !== -1) {
      texto = celulas[longa];
      usadas.add(longa);
    }
  } else {
    texto = celulas[0];
    usadas.add(0);
  }
  const detalhes = [];
  celulas.forEach((valor, i) => {
    if (usadas.has(i) || !valor || valor.length > 120 || !cabecalho[i] || detalhes.length >= 3) return;
    if (/^[—–-]$/.test(valor)) return;
    detalhes.push({ rotulo: cabecalho[i], valor });
  });
  return { titulo, texto, detalhes };
}

/**
 * Onde uma página define identificadores. Duas formas contam:
 *
 * - a linha de tabela cuja primeira célula é só o identificador
 *   (`| RF01 | O sistema deve… |`); o texto é a segunda célula;
 * - o título que começa pelo identificador (`#### US01: Cadastro…`); o texto
 *   é o resto do título mais o primeiro parágrafo depois dele.
 *
 * Citação no meio de uma frase nunca é definição.
 */
function definicoesDoHtml(html) {
  html = String(html || '');
  const titulos = titulosDoHtml(html);
  const definicoes = [];

  const linha = /<tr\b[^>]*>\s*<td\b[^>]*>\s*(?:<(?:strong|b)>)?\s*([A-Z]{1,4}-?\d{1,4})\s*(?:<\/(?:strong|b)>)?\s*<\/td>([\s\S]*?)<\/tr>/g;
  for (const m of html.matchAll(linha)) {
    const partes = m[1].match(ID_EXATO);
    const celulas = [...m[2].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((c) => textoDoHtml(c[1]));
    const conteudo = conteudoDaLinha(celulas, cabecalhoDaTabela(html, m.index));
    if (!conteudo) continue;
    definicoes.push({
      chave: chaveDoId(partes[1], partes[2]),
      rotulo: m[1],
      forma: 'linha',
      ancora: null,
      ...conteudo,
      secao: secaoEm(titulos, m.index),
      posicao: m.index,
    });
  }

  for (const t of titulos) {
    const m = t.texto.match(/^([A-Z]{1,4}-?)(\d{1,4})\s*[:—–.-]?\s+(\S.*)$/);
    if (!m || !t.id) continue;
    definicoes.push({
      chave: chaveDoId(m[1], m[2]),
      rotulo: `${m[1]}${m[2]}`,
      forma: 'titulo',
      ancora: t.id,
      titulo: m[3],
      texto: paragrafoDepois(html, t.fim),
      detalhes: [],
      secao: secaoEm(titulos, t.inicio - 1),
      posicao: t.inicio,
    });
  }

  return definicoes.sort((a, b) => a.posicao - b.posicao);
}

function ancoraDaLinha(rotulo) {
  return `ref-${rotulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/**
 * O registro de referências do site.
 *
 * `documentos`: `[{ arquivo, titulo, grupo, conteudo }]`, na ordem da barra.
 * `tarefas`: `[{ id: 'T-0011', arquivo, titulo, status, responsavel }]`.
 *
 * Um identificador pode aparecer como definição em mais de uma página: o
 * Documento de Requisitos define RN05, e a Modelagem de Banco repete RN05
 * numa tabela que diz como o banco a garante. A casa de uma família é a
 * página que define mais identificadores dela, e a definição canônica de
 * RN05 é a da casa. Só quando a casa não tem aquele número vale a primeira
 * página que o define.
 *
 * Devolve `{ ids, linhas }`:
 * - `ids`: `Map(chave → { rotulo, arquivo, ancora, forma, pagina, secao, titulo, texto, detalhes, status, responsavel })`;
 * - `linhas`: `Map(arquivo → Map(chave → ancora))`, as linhas de tabela que
 *   ganham `id` naquela página.
 */
function construirRegistro({ documentos = [], tarefas = [] } = {}) {
  const ids = new Map();
  const linhas = new Map();

  for (const t of tarefas) {
    const m = String(t.id || '').match(ID_EXATO);
    if (!m) continue;
    ids.set(chaveDoId(m[1], m[2]), {
      rotulo: t.id,
      arquivo: t.arquivo,
      ancora: null,
      forma: 'tarefa',
      pagina: 'Tarefa',
      secao: null,
      titulo: t.titulo,
      texto: '',
      detalhes: [],
      status: t.status || null,
      responsavel: t.responsavel || null,
    });
  }
  const familiasDeTarefa = new Set([...ids.keys()].map(familiaDaChave));

  // Primeira passada: quem define o quê, página por página.
  const porPagina = [];
  const contagem = new Map(); // família → Map(arquivo → número de chaves distintas)
  for (const d of documentos) {
    const definicoes = definicoesDoHtml(d.conteudo).filter((def) => {
      const familia = familiaDaChave(def.chave);
      return !FAMILIAS_EXCLUIDAS.has(familia.replace(/-$/, '')) && !familiasDeTarefa.has(familia);
    });
    porPagina.push({ documento: d, definicoes });
    const vistas = new Set();
    for (const def of definicoes) {
      if (vistas.has(def.chave)) continue;
      vistas.add(def.chave);
      const familia = familiaDaChave(def.chave);
      if (!contagem.has(familia)) contagem.set(familia, new Map());
      const porArquivo = contagem.get(familia);
      porArquivo.set(d.arquivo, (porArquivo.get(d.arquivo) || 0) + 1);
    }
  }

  const casa = new Map();
  for (const [familia, porArquivo] of contagem) {
    let melhor = null;
    for (const [arquivo, n] of porArquivo) {
      if (!melhor || n > melhor.n) melhor = { arquivo, n };
    }
    casa.set(familia, melhor.arquivo);
  }

  // Segunda passada: a definição canônica de cada chave. Na página, vale a
  // primeira ocorrência: o Requisitos lista os RF e depois repete todos na
  // tabela de estimativas.
  const escolhida = new Map();
  for (const { documento, definicoes } of porPagina) {
    for (const def of definicoes) {
      const atual = escolhida.get(def.chave);
      const naCasa = casa.get(familiaDaChave(def.chave)) === documento.arquivo;
      if (!atual || (naCasa && !atual.naCasa)) {
        escolhida.set(def.chave, { def, documento, naCasa });
      }
    }
  }

  for (const [chave, { def, documento }] of escolhida) {
    let ancora = def.ancora;
    if (def.forma === 'linha') {
      ancora = ancoraDaLinha(def.rotulo);
      if (!linhas.has(documento.arquivo)) linhas.set(documento.arquivo, new Map());
      linhas.get(documento.arquivo).set(chave, ancora);
    }
    ids.set(chave, {
      rotulo: def.rotulo,
      arquivo: documento.arquivo,
      ancora,
      forma: def.forma,
      pagina: documento.titulo,
      secao: def.secao,
      titulo: def.titulo,
      texto: resumir(def.texto),
      detalhes: def.detalhes,
      status: null,
      responsavel: null,
    });
  }

  return { ids, linhas };
}

/** O caminho de `alvo` visto de uma página em `origem` (os dois relativos à raiz do site). */
function caminhoRelativo(origem, alvo) {
  const pastaOrigem = origem.includes('/') ? origem.slice(0, origem.lastIndexOf('/') + 1) : '';
  if (pastaOrigem && alvo.startsWith(pastaOrigem)) return alvo.slice(pastaOrigem.length);
  const subir = pastaOrigem ? '../'.repeat(pastaOrigem.split('/').length - 1) : '';
  return subir + alvo;
}

/**
 * Liga as citações de uma página e dá `id` às linhas que definem.
 *
 * - `arquivo`: a página que está sendo escrita, relativa à raiz do site.
 * - `arquivoDasLinhas`: o arquivo pelo qual o registro conhece este conteúdo,
 *   quando ele sai em mais de um endereço (o documento CBL).
 * - `mesmaPagina`: os arquivos que mostram este mesmo conteúdo. O documento
 *   CBL aparece em três endereços; uma citação dele para ele mesmo fica na
 *   página, sem recarregar.
 * - `ancorasPorArquivo`: `Map(arquivo → Set(id))`. Um link `…#seção` cujo id
 *   não existe na página de destino perde o `#seção` e leva ao topo, em vez
 *   de abrir a página num ponto qualquer.
 * - `aoLigar(alvo)`: chamado com cada destino `arquivo#id` de link interno,
 *   para o registro saber de que seções mostrar a prévia.
 *
 * Citação dentro de link, código, título, cabeçalho de tabela ou trecho que o
 * "O que há de novo" ignora (`data-novidades="ignorar"`) fica como está. A
 * célula que define o identificador também.
 */
function ligarReferencias(html, { registro, arquivo, arquivoDasLinhas = arquivo, mesmaPagina = [arquivo], ancorasPorArquivo = null, aoLigar = null }) {
  if (!registro) return html;
  const aqui = new Set(mesmaPagina);
  const linhasAqui = registro.linhas.get(arquivoDasLinhas) || null;
  const jaAncorado = new Set();

  // 1. As linhas que definem ganham id, e a célula do identificador fica
  //    marcada para não virar link para si mesma.
  if (linhasAqui) {
    html = html.replace(
      /<tr\b([^>]*)>(\s*<td\b)([^>]*>\s*(?:<(?:strong|b)>)?\s*([A-Z]{1,4}-?\d{1,4})\s*(?:<\/(?:strong|b)>)?\s*<\/td>)/g,
      (inteiro, attrs, abreTd, restoTd, rotulo) => {
        const m = rotulo.match(ID_EXATO);
        const chave = chaveDoId(m[1], m[2]);
        const ancora = linhasAqui.get(chave);
        if (!ancora || jaAncorado.has(chave) || /\sid="/.test(attrs)) return inteiro;
        jaAncorado.add(chave);
        return `<tr${attrs} id="${ancora}">${abreTd} data-ref-definicao${restoTd}`;
      }
    );
  }

  const destino = (alvoArquivo, ancora) => {
    if (aqui.has(alvoArquivo)) return ancora ? `#${ancora}` : null;
    return caminhoRelativo(arquivo, alvoArquivo) + (ancora ? `#${ancora}` : '');
  };

  const partes = html.split(/(<[^>]*>)/);
  const pilha = []; // [{ nome, pula }]
  let pulando = 0;

  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i];
    if (!parte) continue;

    if (i % 2 === 1) {
      // Tag.
      if (parte.startsWith('<!') || parte.startsWith('<?')) continue;
      const fecha = parte.startsWith('</');
      const nome = (parte.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/) || [])[1];
      if (!nome) continue;
      const nomeMin = nome.toLowerCase();

      if (fecha) {
        for (let k = pilha.length - 1; k >= 0; k--) {
          if (pilha[k].nome === nomeMin) {
            for (let j = pilha.length - 1; j >= k; j--) if (pilha[j].pula) pulando--;
            pilha.length = k;
            break;
          }
        }
        continue;
      }

      // Link de sumário (as âncoras do masthead, que o "O que há de novo"
      // ignora) tem o `#seção` conferido, mas não pede prévia.
      if (nomeMin === 'a' && ancorasPorArquivo) {
        partes[i] = conferirLink(parte, arquivo, aqui, ancorasPorArquivo, pulando > 0 ? null : aoLigar);
      }

      if (VAZIOS.has(nomeMin) || parte.endsWith('/>')) continue;
      const pula = SEM_LINK.has(nomeMin)
        || /\sdata-novidades="ignorar"/.test(parte)
        || /\sdata-ref-definicao/.test(parte);
      pilha.push({ nome: nomeMin, pula });
      if (pula) pulando++;
      continue;
    }

    // Texto.
    if (pulando > 0) continue;
    partes[i] = parte.replace(PADRAO_ID, (inteiro, familia, numero) => {
      if (FAMILIAS_EXCLUIDAS.has(familia.replace(/-$/, ''))) return inteiro;
      const chave = chaveDoId(familia, numero);
      const def = registro.ids.get(chave);
      if (!def) return inteiro;
      const href = destino(def.arquivo, def.ancora);
      if (!href) return inteiro;
      return `<a class="ref" href="${href}" data-ref="${chave}">${inteiro}</a>`;
    });
  }

  return partes.join('');
}

/**
 * Um `<a href>` interno com `#seção`: confere a seção no destino e avisa o
 * registro. Link externo, de mídia ou sem `#` passa direto.
 */
function conferirLink(tag, arquivo, aqui, ancorasPorArquivo, aoLigar) {
  const href = atributo(tag, 'href');
  if (!href || /^[a-z]+:/i.test(href) || href.startsWith('//')) return tag;
  const [caminho, ancora] = href.split('#');
  if (ancora === undefined || !ancora) return tag;

  let alvo;
  if (!caminho) alvo = arquivo;
  else if (!caminho.endsWith('.html')) return tag;
  else alvo = resolverCaminho(arquivo, caminho);
  if (aqui.has(alvo)) alvo = arquivo;

  const ancoras = ancorasPorArquivo.get(alvo);
  if (!ancoras) return tag;
  if (!ancoras.has(ancora)) {
    // A seção não existe (mudou de nome, ou o wikilink aponta um título que
    // o Obsidian aceita e o site não gera): leva ao topo da página.
    const semAncora = caminho || null;
    return semAncora ? tag.replace(`href="${href}"`, `href="${semAncora}"`) : tag;
  }
  if (aoLigar) aoLigar(`${alvo}#${ancora}`);
  return tag;
}

/** `../x.html` visto de `notas/y.html` → `x.html`. */
function resolverCaminho(origem, relativo) {
  const partes = origem.split('/').slice(0, -1);
  for (const p of relativo.split('/')) {
    if (p === '..') partes.pop();
    else if (p && p !== '.') partes.push(p);
  }
  return partes.join('/');
}

/**
 * A prévia de uma página: o lead do masthead, ou o primeiro parágrafo do
 * texto quando não há lead.
 */
function previaDaPagina(conteudo) {
  const html = String(conteudo || '');
  const lead = html.match(/<p\b[^>]*class="[^"]*\bcbl-masthead-lead\b[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  if (lead) return resumir(textoDoHtml(lead[1]), 260);
  const narrativa = html.indexOf('class="narrativa"');
  const m = html.slice(narrativa === -1 ? 0 : narrativa).match(/<p\b(?![^>]*data-novidades)[^>]*>([\s\S]*?)<\/p>/);
  return m ? resumir(textoDoHtml(m[1]), 260) : '';
}

/** A prévia de uma seção: o título e o primeiro parágrafo dela. */
function previaDaSecao(conteudo, id) {
  const html = String(conteudo || '');
  const titulo = titulosDoHtml(html).find((t) => t.id === id);
  if (titulo) return { titulo: titulo.texto, texto: resumir(paragrafoDepois(html, titulo.fim), 260) };
  const linha = html.match(new RegExp(`<tr\\b[^>]*\\sid="${id.replace(/[^a-z0-9-]/gi, '')}"[^>]*>([\\s\\S]*?)</tr>`));
  if (linha) return { titulo: null, texto: resumir(textoDoHtml(linha[1]), 260) };
  return null;
}

module.exports = {
  PADRAO_ID,
  FAMILIAS_EXCLUIDAS,
  chaveDoId,
  textoDoHtml,
  resumir,
  idsDoHtml,
  definicoesDoHtml,
  construirRegistro,
  caminhoRelativo,
  resolverCaminho,
  ligarReferencias,
  previaDaPagina,
  previaDaSecao,
};
