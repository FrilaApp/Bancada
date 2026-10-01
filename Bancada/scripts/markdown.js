// Markdown → HTML, sem dependências.
//
// Mesmo espírito do `html-para-md.js` do doc-harness: o vault escreve um
// subconjunto pequeno e previsível de Markdown — títulos, listas, tabelas,
// citações, ênfase, código e wikilinks —, fixado pelo CLAUDE.md e pelos
// templates. Cobrir esse subconjunto custa menos que arrastar uma dependência
// de npm para dentro de um projeto que hoje não tem nenhuma.
//
// O que ele não cobre (HTML embutido, listas aninhadas fundas, referências)
// não aparece no vault. Se aparecer, o texto sai como parágrafo — degrada,
// não quebra.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function slugificar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Trechos inline: código, negrito, itálico, links e wikilinks.
 *
 * O código entre crases é extraído antes de tudo e devolvido no fim, para
 * que `**` dentro de um trecho de código não seja lido como negrito.
 */
function inline(texto, resolverWikilink) {
  const codigos = [];
  let s = texto.replace(/`([^`]+)`/g, (_, c) => {
    codigos.push(c);
    return `__CBL_CODE_${codigos.length - 1}__`;
  });

  s = escapar(s);

  // Imagens embutidas: wikilink `![[alvo|alt]]` e Markdown `![alt](href)`
  s = s.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, alvo, alt) => {
    const limpo = alvo.trim();
    const nome = limpo.split('/').pop();
    const rotulo = escapar(alt || nome);
    return `<figure class="figura-embutida"><img src="midia/${escapar(limpo)}" alt="${rotulo}" loading="lazy"><figcaption>${rotulo}</figcaption></figure>`;
  });

  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, rotulo, href) => {
    const alt = escapar(rotulo || href.split('/').pop());
    return `<figure class="figura-embutida"><img src="${escapar(href)}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`;
  });

  // Wikilink antes do link normal: `[[a|b]]` casaria parcialmente com `[x](y)`.
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, alvo, alias) => {
    // `[[#Seção]]` sem apelido mostra só o nome da seção, como no Obsidian.
    const rotulo = escapar(alias || alvo.replace(/^#\s*/, ''));
    const href = resolverWikilink ? resolverWikilink(alvo.trim()) : null;
    return href
      ? `<a href="${href}">${rotulo}</a>`
      // Wikilink para nota que não foi publicada: vira texto marcado, não um
      // link quebrado que o mentor clica e não vai a lugar nenhum.
      : `<span class="link-ausente" title="nota não publicada">${rotulo}</span>`;
  });

  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, rotulo, href) => {
    const externo = /^https?:/i.test(href);
    const extra = externo ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapar(href)}"${extra}>${rotulo}</a>`;
  });

  // Prefixos de evidência e taxonomia do ciclo CBL (Dado, Relato, Hipótese, Lacuna)
  s = s.replace(/\*\*([^*]+)\*\*/g, (_, conteudo) => {
    const matchEvidencia = conteudo.match(/^(Dado|Relato|Hipótese|Hipotese|Lacuna)(?:(\s+[—–-]\s+)(.*)|(\s+central\.?)|[:.]\s*(.*)|$)/i);
    if (matchEvidencia) {
      const tipoOriginal = matchEvidencia[1];
      const tipoSlug = tipoOriginal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const rotuloExibido = tipoSlug === 'hipotese' ? 'Hipótese' : (tipoSlug.charAt(0).toUpperCase() + tipoSlug.slice(1));
      const titulo = (matchEvidencia[3] || matchEvidencia[4] || matchEvidencia[5] || '').trim();
      if (titulo) {
        return `<span class="cbl-evidencia-prefixo"><span class="cbl-badge-evidencia tag-${tipoSlug}">${rotuloExibido}</span> <strong class="cbl-evidencia-titulo">${titulo}</strong></span>`;
      }
      return `<span class="cbl-evidencia-prefixo"><span class="cbl-badge-evidencia tag-${tipoSlug}">${rotuloExibido}</span></span>`;
    }
    return `<strong>${conteudo}</strong>`;
  });

  // Travessão de oração intercalada na prosa (ex.: "um turno — função..."):
  // Substitui espaços regulares por thin spaces não-quebráveis com classe semântica,
  // impedindo travessões órfãos no início de linha e eliminando rasgos óticos de 1.5em.
  s = s.replace(/(\S)\s+[—–]\s+(\S)/g, '$1<span class="cbl-travessao">&thinsp;—&thinsp;</span>$2');

  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return s.replace(/__CBL_CODE_(\d+)__/g, (_, i) => `<code>${escapar(codigos[+i])}</code>`);
}

function renderizar(markdown, resolverWikilink) {
  const linhas = String(markdown).split('\n');
  const saida = [];
  let i = 0;

  const emInline = (t) => inline(t, resolverWikilink);

  while (i < linhas.length) {
    const linha = linhas[i];
    const limpa = linha.trim();

    if (!limpa) { i++; continue; }

    // Regra horizontal
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(limpa)) {
      saida.push('<hr>');
      i++;
      continue;
    }

    // Título Markdown explícito (# ...)
    const titulo = limpa.match(/^(#{1,6})\s+(.*)$/);
    if (titulo) {
      const n = titulo[1].length;
      const texto = titulo[2].trim();
      const id = slugificar(texto);
      saida.push(`<h${n} id="${id}">${emInline(texto)}</h${n}>`);
      i++;
      continue;
    }

    // Seções especiais sem prefixo Markdown
    if (/^(Histórico de Versões|Glossário)$/i.test(limpa)) {
      const id = slugificar(limpa);
      saida.push(`<h2 id="${id}">${emInline(limpa)}</h2>`);
      i++;
      continue;
    }

    // Títulos de subseção numerada (ex.: "1.1 Propósito do Documento", "2.1 Regras Obrigatórias")
    const subsecao = limpa.match(/^(\d+\.\d+)\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ].*)$/);
    if (subsecao) {
      const id = slugificar(subsecao[0]);
      saida.push(`<h3 id="${id}">${emInline(subsecao[0])}</h3>`);
      i++;
      continue;
    }

    const subsubsecao = limpa.match(/^(\d+\.\d+\.\d+)\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ].*)$/);
    if (subsubsecao) {
      const id = slugificar(subsubsecao[0]);
      saida.push(`<h4 id="${id}">${emInline(subsubsecao[0])}</h4>`);
      i++;
      continue;
    }

    // Títulos de macro-seção numerada (ex.: "1. Introdução e Visão Geral", "2. Regras de Negócio")
    const macroSecao = limpa.match(/^(\d+)\.\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ].*)$/);
    if (macroSecao && (
      limpa.length < 90 && !/[.!?]$/.test(limpa) && (
        !linhas[i + 1] || !linhas[i + 1].trim().startsWith(String(Number(macroSecao[1]) + 1) + '.')
      )
    )) {
      const id = slugificar(macroSecao[0]);
      saida.push(`<h2 id="${id}">${emInline(macroSecao[0])}</h2>`);
      i++;
      continue;
    }

    // Bloco de código cercado
    if (limpa.startsWith('```')) {
      const idioma = limpa.slice(3).trim();
      const corpo = [];
      i++;
      while (i < linhas.length && !linhas[i].trim().startsWith('```')) {
        corpo.push(linhas[i]);
        i++;
      }
      i++;
      const classe = idioma ? ` class="lang-${escapar(idioma)}"` : '';
      saida.push(`<pre><code${classe}>${escapar(corpo.join('\n'))}</code></pre>`);
      continue;
    }

    // Citação — e o callout do Obsidian, que é uma citação cujo primeiro
    // conteúdo é `[!tipo] Título`. Sem tratá-lo, o marcador vaza como texto
    // cru para a página que o mentor lê.
    if (limpa.startsWith('>')) {
      const corpo = [];
      while (i < linhas.length && linhas[i].trim().startsWith('>')) {
        corpo.push(linhas[i].trim().replace(/^>\s?/, ''));
        i++;
      }

      const callout = corpo[0] && corpo[0].match(/^\[!(\w+)\]\s*(.*)$/);
      if (callout) {
        const especie = callout[1].toLowerCase();
        const titulo = callout[2].trim();
        const resto = renderizar(corpo.slice(1).join('\n'), resolverWikilink);
        const cabecalho = titulo ? `<b>${inline(titulo, resolverWikilink)}</b>` : '';
        saida.push(`<div class="callout callout-${escapar(especie)}">${cabecalho}${resto}</div>`);
      } else {
        saida.push(`<blockquote>${renderizar(corpo.join('\n'), resolverWikilink)}</blockquote>`);
      }
      continue;
    }

    // Tabela: cabeçalho, separador, corpo
    if (limpa.startsWith('|') && i + 1 < linhas.length && /^\|[\s:|-]+\|$/.test(linhas[i + 1].trim())) {
      // `\|` é a barra escapada do Obsidian: deixa um wikilink com apelido
      // (`[[nota\|rótulo]]`) dentro da célula sem abrir uma coluna nova.
      const celulas = (l) => l.trim().replace(/^\||(?<!\\)\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
      const cabecalho = celulas(linhas[i]);
      i += 2;

      const corpo = [];
      while (i < linhas.length && linhas[i].trim().startsWith('|')) {
        corpo.push(celulas(linhas[i]));
        i++;
      }

      const th = cabecalho.map((c) => `<th>${emInline(c)}</th>`).join('');
      const tr = corpo
        .map((l) => `<tr>${l.map((c) => `<td>${emInline(c)}</td>`).join('')}</tr>`)
        .join('');
      // A tabela rola dentro do próprio container: numa tela estreita, ela não
      // pode empurrar a página inteira para o lado.
      saida.push(`<div class="rolagem cbl-tabela-container"><table class="cbl-tabela-aberta"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`);
      continue;
    }

    // Listas
    // O `\s*` no fim é o que reconhece um marcador sem conteúdo — os
    // templates do vault têm vários (`- ` esperando ser preenchido). Sem
    // isso, a linha cairia em parágrafo e o traço apareceria solto no texto.
    const marcador = limpa.match(/^([-*+]|\d+\.)(\s+|\s*$)/);
    if (marcador) {
      const ordenada = /\d/.test(marcador[1]);
      const itens = [];
      let temTarefa = false;

      while (i < linhas.length) {
        const atual = linhas[i].trim();
        const m = atual.match(/^([-*+]|\d+\.)(?:\s+(.*))?$/);
        if (!m) break;

        let texto = m[2] || '';
        if (!texto) { itens.push('<li class="vazio-item"></li>'); i++; continue; }
        const tarefa = texto.match(/^\[([ xX])\]\s*(.*)$/);
        if (tarefa) {
          temTarefa = true;
          const marcado = tarefa[1].toLowerCase() === 'x';
          texto = `<span class="caixa${marcado ? ' feita' : ''}">${marcado ? '✓' : ''}</span>${emInline(tarefa[2])}`;
          itens.push(`<li class="tarefa">${texto}</li>`);
        } else {
          itens.push(`<li>${emInline(texto)}</li>`);
        }
        i++;
      }

      const tag = ordenada ? 'ol' : 'ul';
      const classe = temTarefa ? ' class="lista-tarefas"' : '';
      saida.push(`<${tag}${classe}>${itens.join('')}</${tag}>`);
      continue;
    }

    // Parágrafo: junta até a linha em branco
    const paragrafo = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#{1,6}\s|>|```|\||([-*+]|\d+\.)\s)/.test(linhas[i].trim())) {
      paragrafo.push(linhas[i].trim());
      i++;
    }
    if (paragrafo.length) {
      saida.push(`<p>${emInline(paragrafo.join(' '))}</p>`);
    } else {
      i++;
    }
  }

  return saida.join('\n');
}

module.exports = { renderizar, inline, escapar, slugificar };
