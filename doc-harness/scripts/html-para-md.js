#!/usr/bin/env node
// Converte o HTML produzido por `textutil -convert html` em Markdown limpo.
// Sem dependências: o textutil emite um subconjunto pequeno e previsível de HTML.
//
// Uso: html-para-md.js <arquivo.html>   (escreve o Markdown na saída padrão)

const fs = require('fs');

const entrada = process.argv[2];
if (!entrada) {
  console.error('uso: html-para-md.js <arquivo.html>');
  process.exit(2);
}

let html = fs.readFileSync(entrada, 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (corpo) html = corpo[1];

const ENTIDADES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
};

function desescapar(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m);
}

function inline(s) {
  return desescapar(
    s
      .replace(/<\s*(b|strong)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (_, __, t) => `**${t.trim()}**`)
      .replace(/<\s*(i|em)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (_, __, t) => `*${t.trim()}*`)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/\*\s*\*/g, '')
    .replace(/[ \t ]+/g, ' ')
    .trim();
}

const blocos = [];
const RE_BLOCO = /<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
let m;
while ((m = RE_BLOCO.exec(html)) !== null) {
  const tag = m[1].toLowerCase();
  const texto = inline(m[2]);
  if (!texto) continue;

  if (/^h[1-6]$/.test(tag)) {
    blocos.push({ tipo: 'titulo', texto: '#'.repeat(Number(tag[1])) + ' ' + texto.replace(/\*\*/g, '') });
  } else if (tag === 'li') {
    blocos.push({ tipo: 'item', texto: '- ' + texto });
  } else {
    // No Pages quase ninguém aplica estilo de parágrafo: um parágrafo
    // inteiramente em negrito é, na prática, um título.
    const soNegrito = /^\*\*[\s\S]+\*\*$/.test(texto) && !texto.slice(2, -2).includes('**');
    blocos.push(
      soNegrito
        ? { tipo: 'titulo', texto: '## ' + texto.slice(2, -2).trim() }
        : { tipo: 'paragrafo', texto }
    );
  }
}

// Itens de lista consecutivos ficam colados; o resto separado por linha em branco.
let md = '';
blocos.forEach((b, i) => {
  if (i > 0) {
    const anterior = blocos[i - 1];
    md += anterior.tipo === 'item' && b.tipo === 'item' ? '\n' : '\n\n';
  }
  md += b.texto;
});

process.stdout.write(md.replace(/\n{3,}/g, '\n\n').trim() + '\n');
