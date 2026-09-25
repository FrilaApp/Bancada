'use strict';

// Página Novidades: a linha do tempo do git virada HTML.
//
// Função pura. Recebe a linha do tempo que `historico.js` monta no build e
// devolve o corpo da página; o gerador embrulha no molde do site, com a
// barra lateral e o topo (`semConteudoTopo`, porque o masthead vem daqui).
// Nada aqui lê disco, relógio ou git: a mesma entrada dá o mesmo HTML, e é
// isso que deixa o teste comparar texto.
//
// A seção "Para você" sai vazia e escondida. Só o cliente, no navegador,
// sabe o que este leitor ainda não leu; ele preenche a lista e tira o
// `hidden`. Cada entrada leva `data-em` para o cliente acender o ponto nas
// que chegaram depois da última visita à página.
//
// Três vozes (DESIGN.md §1.2): chrome em sans, o assunto do commit como
// narrativa, e hora, hash e identificador de tarefa em mono.

const { escapar } = require('../markdown');

const ROTULOS_STATUS = {
  'a-fazer': 'A fazer',
  'em-andamento': 'Em andamento',
  revisao: 'Revisão',
  concluida: 'Concluída',
  ativo: 'Ativo',
  aprovado: 'Aprovado',
};

const ROTULOS_TIPO = { nova: 'Nova', alterada: 'Alterada', removida: 'Removida' };

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Tipos do Conventional Commits que o repositório usa. O prefixo sai do
// assunto e vira identificador em mono; o resto é a frase de quem escreveu.
const PREFIXO_CONVENCIONAL = /^((?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\([^()\s]+\))?!?):\s+(\S[\s\S]*)$/i;

// Assunto que o historico.js monta para um merge: "3 commits de Ana, Beto".
// Ele já nomeia os autores, e a linha de baixo não repete.
const ASSUNTO_DE_MERGE = /^\d+ commits? de /;

const SLUG = /^[a-z0-9-]+$/;

const CHEVRON = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 4 4 4-4 4"/></svg>';

const SETA = '<svg class="nov-transicao-seta" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 8h10"/><path d="m9 4 4 4-4 4"/></svg>';

const PONTO = '<span class="cbl-ponto-sep" aria-hidden="true"></span>';

/** Texto escapado; nulo e indefinido viram vazio, e não "null". */
const texto = (valor) => escapar(valor == null ? '' : valor);

/** "24 de setembro" a partir de 'AAAA-MM-DD', com o ordinal do dia 1. */
function dataPorExtenso(data) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(data || ''));
  if (!m) return '';
  const mes = MESES[Number(m[2]) - 1];
  if (!mes) return '';
  const dia = Number(m[3]);
  return `${dia === 1 ? '1º' : dia} de ${mes}`;
}

function pilulaDeStatus(status) {
  const slug = String(status);
  const classe = SLUG.test(slug) ? ` status-${slug}` : '';
  const rotulo = ROTULOS_STATUS[slug] || slug;
  return `<span class="etiqueta${classe}"><span class="status-ponto" aria-hidden="true"></span>${texto(rotulo)}</span>`;
}

function transicao({ id, de, para }) {
  const inicio = de
    ? `${pilulaDeStatus(de)}${SETA}<span class="nov-sr">para</span>`
    : '<span class="nov-transicao-rotulo">entrou em</span>';
  return `<li class="nov-transicao"><code class="nov-transicao-id">${texto(id)}</code>${inicio}${pilulaDeStatus(para)}</li>`;
}

function pagina({ titulo, href, tipo, chave }) {
  const tipoValido = ROTULOS_TIPO[tipo] ? tipo : 'alterada';
  const nome = texto(titulo || chave || 'Página sem título');
  // Página removida não tem para onde levar: o título fica, sem link.
  const alvo = href && tipoValido !== 'removida'
    ? `<a href="${texto(href)}">${nome}</a>`
    : `<span class="nov-pagina-titulo">${nome}</span>`;
  return `<li><span class="nov-tipo nov-tipo--${tipoValido}">${ROTULOS_TIPO[tipoValido]}</span>${alvo}</li>`;
}

function assunto(textoDoAssunto) {
  const bruto = String(textoDoAssunto || '').trim();
  const m = PREFIXO_CONVENCIONAL.exec(bruto);
  if (!m) return `<p class="nov-assunto">${texto(bruto)}</p>`;
  return `<p class="nov-assunto"><code class="nov-assunto-tipo">${texto(m[1])}</code>${texto(m[2])}</p>`;
}

function entrada(e) {
  const autores = (Array.isArray(e.autores) ? e.autores : [e.autores]).filter(Boolean);
  const meta = [];
  // Nomes separados só por vírgula (AGENTS.md §2.5). Num merge, o assunto
  // já diz de quem são os commits.
  if (autores.length && !(e.merge && ASSUNTO_DE_MERGE.test(String(e.assunto || '')))) {
    meta.push(`<span class="nov-autor">${autores.map(texto).join(', ')}</span>`);
  }
  if (e.merge) meta.push('<span class="nov-fusao">Fusão no main</span>');
  if (e.sha) meta.push(`<code class="nov-sha">${texto(String(e.sha).slice(0, 7))}</code>`);

  const paginas = Array.isArray(e.paginas) ? e.paginas : [];
  const transicoes = (Array.isArray(e.transicoes) ? e.transicoes : []).filter((t) => t && t.para);

  return `<li class="nov-entrada" data-em="${texto(e.quando)}">
          <time class="nov-hora" datetime="${texto(e.quando)}">${texto(e.hora)}</time>
          <div class="nov-entrada-corpo">
            ${assunto(e.assunto)}
            <div class="nov-entrada-meta">${meta.join(PONTO)}</div>${paginas.length ? `
            <ul class="nov-paginas">${paginas.map(pagina).join('')}</ul>` : ''}${transicoes.length ? `
            <ul class="nov-transicoes">${transicoes.map(transicao).join('')}</ul>` : ''}
          </div>
        </li>`;
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function dia(d) {
  const data = DATA_ISO.test(String(d.data || '')) ? d.data : null;
  const idTitulo = `nov-dia-${data || 'sem-data'}`;
  // O rótulo é a data absoluta ("24 de setembro"). "Hoje" e "Ontem" ficariam
  // velhos entre um build e outro: quem os escreve é o cliente, na hora da
  // leitura, no espaço `.nov-dia-relativo`, a partir de `data-dia`.
  const rotulo = d.rotulo || (data && dataPorExtenso(data)) || d.data || '';
  const diario = typeof d.diario === 'string' ? d.diario : d.diario && d.diario.href;
  const linkDiario = diario
    ? `<a class="nov-dia-diario" href="${texto(diario)}">Diário do dia${CHEVRON}</a>`
    : '';
  const entradas = Array.isArray(d.entradas) ? d.entradas : [];
  return `<section class="nov-dia"${data ? ` data-dia="${data}"` : ''} aria-labelledby="${idTitulo}">
      <header class="nov-dia-cabecalho">
        <h3 class="nov-dia-titulo" id="${idTitulo}"><span class="nov-dia-relativo" hidden></span> <time class="nov-dia-data"${data ? ` datetime="${data}"` : ''}>${texto(rotulo)}</time></h3>
        ${linkDiario}
      </header>
      <ol class="nov-entradas">
        ${entradas.map(entrada).join('\n        ')}
      </ol>
    </section>`;
}

function vazio(titulo, explicacao) {
  return `<div class="nov-vazio">
      <p class="nov-vazio-titulo">${titulo}</p>
      <p class="nov-vazio-texto">${explicacao}</p>
    </div>`;
}

/**
 * O corpo da página Novidades.
 *
 * @param {{dias: object[]}|null} linhaDoTempo a saída de `lerLinhaDoTempo()`,
 *   ou null quando o build não teve histórico do git.
 * @param {{janelaDias?: number}} [opcoes]
 * @returns {string} HTML do `<article>`, pronto para o molde do site.
 */
function paginaNovidades(linhaDoTempo, opcoes = {}) {
  const janela = Number.isInteger(opcoes.janelaDias) && opcoes.janelaDias > 0 ? opcoes.janelaDias : 14;
  const dias = linhaDoTempo && Array.isArray(linhaDoTempo.dias)
    ? linhaDoTempo.dias.filter((d) => d && Array.isArray(d.entradas) && d.entradas.length)
    : null;

  let linha;
  if (dias === null) {
    linha = vazio(
      'A linha do tempo não está disponível nesta publicação.',
      'O build não teve acesso ao histórico do git. As páginas continuam marcando o que mudou desde a sua última visita.'
    );
  } else if (!dias.length) {
    linha = vazio(
      `Nada mudou nos últimos ${janela} dias.`,
      'Quando alguém da equipe alterar um documento do desafio, a mudança aparece aqui, com o dia, a hora e o nome de quem mudou.'
    );
  } else {
    linha = dias.map(dia).join('\n    ');
  }

  return `<article class="cbl-documento pagina-novidades">
  <header class="cbl-masthead-doc">
    <div class="cbl-masthead-eyebrow">
      <span class="cbl-masthead-rotulo"><span class="cbl-eyebrow-item">Challenge 18</span>${PONTO}<span class="cbl-eyebrow-item">Últimos ${janela} dias</span></span>
    </div>
    <h1 class="cbl-masthead-titulo">Novidades</h1>
    <p class="cbl-masthead-lead">O que mudou nos documentos do desafio, dia a dia e com o nome de quem mudou. Dentro de cada página, o texto novo aparece marcado até você ler.</p>
  </header>

  <section class="nov-para-voce" data-nov-para-voce hidden aria-labelledby="nov-para-voce-titulo">
    <h2 class="nov-secao-titulo" id="nov-para-voce-titulo">Para você</h2>
    <p class="nov-secao-lead">Páginas com trechos que você ainda não leu.</p>
    <ul class="nov-paginas" data-nov-para-voce-lista></ul>
  </section>

  <section class="nov-linha" aria-labelledby="nov-linha-titulo">
    <h2 class="nov-secao-titulo" id="nov-linha-titulo">Linha do tempo</h2>
    <p class="nov-secao-lead">Cada mudança publicada, da mais recente para a mais antiga, no horário de Brasília.</p>
    ${linha}
  </section>
</article>`;
}

module.exports = { paginaNovidades };
