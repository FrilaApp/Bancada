#!/usr/bin/env node
// Converte os blocos ```mermaid das notas em PNG, gravados em Anexos/ ao lado.
//
// Existe porque o Mermaid só renderiza no Obsidian: o site escapa o bloco como
// código (ver scripts/markdown.js) e o app da Bancada faz o mesmo em
// Markdown.swift. Um diagrama que vive só no fence fica ilegível justamente
// para mentor e avaliador, que são quem o site existe para atender.
//
// A fonte de verdade continua sendo o bloco dentro do .md — versionável, com
// diff legível. O PNG é derivado, e é regenerado quando o bloco muda.
//
// Uso:
//   mermaid-export.js                converte todos os blocos do vault
//   mermaid-export.js <nota.md> …    converte apenas os das notas indicadas
'use strict';

const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..');

function slug(texto) {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/// Cada bloco é nomeado pelo título da seção que o precede, e não por um
/// número de ordem: inserir um diagrama no meio da nota não deve renomear os
/// outros e sujar o diff de todas as imagens.
function blocosDe(markdown) {
  const linhas = markdown.split('\n');
  const blocos = [];
  let titulo = 'diagrama';
  let dentro = false;
  let atual = [];

  for (const bruta of linhas) {
    // O bloco pode estar dentro de um callout `> [!note]- Fonte`, que é como
    // as notas guardam a fonte sem mostrar o diagrama duas vezes no Obsidian.
    // Tirar o `> ` aqui deixa o resto da função alheio a essa diferença.
    const linha = bruta.replace(/^>\s?/, '');

    const cabecalho = linha.match(/^#{2,4}\s+(.+?)\s*$/);
    if (cabecalho && !dentro) titulo = cabecalho[1];

    if (/^```mermaid\s*$/.test(linha)) { dentro = true; atual = []; continue; }
    if (dentro && /^```\s*$/.test(linha)) {
      dentro = false;
      blocos.push({ titulo, codigo: atual.join('\n') });
      continue;
    }
    if (dentro) atual.push(linha);
  }
  return blocos;
}

function nomeUnico(blocos) {
  const vistos = new Map();
  return blocos.map((b) => {
    const base = slug(b.titulo) || 'diagrama';
    const n = (vistos.get(base) || 0) + 1;
    vistos.set(base, n);
    return { ...b, nome: n === 1 ? base : `${base}-${n}` };
  });
}

function notasDoVault() {
  const encontradas = [];
  (function varrer(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith('.') || item.name === 'node_modules') continue;
      const caminho = path.join(dir, item.name);
      if (item.isDirectory()) varrer(caminho);
      else if (item.name.endsWith('.md')) encontradas.push(caminho);
    }
  })(RAIZ);
  return encontradas;
}

const alvos = process.argv.length > 2
  ? process.argv.slice(2).map((p) => path.resolve(p))
  : notasDoVault();

let gerados = 0;
let pulados = 0;

for (const nota of alvos) {
  if (!fs.existsSync(nota)) { console.error(`  ✗ não encontrado: ${nota}`); continue; }

  const markdown = fs.readFileSync(nota, 'utf8');
  const blocos = nomeUnico(blocosDe(markdown));
  if (!blocos.length) continue;

  const anexos = path.join(path.dirname(nota), 'Anexos');
  fs.mkdirSync(anexos, { recursive: true });
  const prefixo = slug(path.basename(nota, '.md'));

  for (const bloco of blocos) {
    const destino = path.join(anexos, `${prefixo}-${bloco.nome}.png`);
    const marca = path.join(anexos, `.${prefixo}-${bloco.nome}.hash`);
    const hash = crypto.createHash('sha256').update(bloco.codigo).digest('hex');

    // Pula o que já está em dia, como pages-export.sh faz com o .pages.
    if (fs.existsSync(destino) && fs.existsSync(marca)
        && fs.readFileSync(marca, 'utf8').trim() === hash) {
      pulados += 1;
      continue;
    }

    const fonte = path.join(anexos, `.${prefixo}-${bloco.nome}.mmd`);
    fs.writeFileSync(fonte, bloco.codigo, 'utf8');
    try {
      // Fundo branco e escala 2 porque o PNG é lido em tela retina e dentro
      // do .docx, onde fundo transparente vira cinza imprevisível.
      execFileSync('mmdc', [
        '-i', fonte, '-o', destino,
        '-b', 'white', '-t', 'default', '-s', '2',
      ], { stdio: 'pipe' });
      fs.writeFileSync(marca, hash, 'utf8');
      console.log(`  ✓ ${path.basename(destino)}`);
      gerados += 1;
    } catch (e) {
      const saida = e.stderr ? e.stderr.toString().trim() : e.message;
      console.error(`  ✗ ${path.basename(destino)}: ${saida}`);
    } finally {
      fs.rmSync(fonte, { force: true });
    }
  }
}

console.log(`${gerados} diagrama(s) gerado(s), ${pulados} já em dia.`);
