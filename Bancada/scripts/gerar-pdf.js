#!/usr/bin/env node
// Gera PDF de uma nota do vault, para circular fora do Obsidian e do site.
//
// Reaproveita o mesmo `markdown.js` que o site usa: uma regra de conversão só,
// para que o PDF não conte uma história diferente da página web da mesma nota.
// A paginação é do Chrome, que já veio junto do mermaid-cli.
//
// Uso: gerar-pdf.js <nota.md> … --saida <pasta>
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { renderizar, escapar } = require('./markdown');

const puppeteer = require(
  execSync('npm root -g', { encoding: 'utf8' }).trim() +
  '/@mermaid-js/mermaid-cli/node_modules/puppeteer',
);

function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return [{}, texto];
  const dados = {};
  for (const linha of m[1].split('\n')) {
    const par = linha.match(/^([a-z_]+):\s*(.*)$/);
    if (par) dados[par[1]] = par[2].trim();
  }
  return [dados, texto.slice(m[0].length)];
}

// O rodapé `← [[…]]` serve para navegar dentro do Obsidian; num PDF vira
// um link morto no pé da última página.
const semRodape = (t) => t.replace(/\n-{3,}\s*\n\s*←[^\n]*\n?\s*$/, '\n');

const ESTILO = `
  @page { size: A4; margin: 17mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font: 10.5pt/1.55 -apple-system, "Helvetica Neue", Arial, sans-serif;
    color: #1A1A1A; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  /* ── Capa ─────────────────────────────────────────────── */
  .capa { height: 247mm; display: flex; flex-direction: column; justify-content: center;
          page-break-after: always; }
  .capa .eyebrow { font-size: 10pt; letter-spacing: .14em; text-transform: uppercase;
                   color: #2FA84F; font-weight: 700; margin-bottom: 14mm; }
  .capa h1 { font-size: 30pt; line-height: 1.12; margin: 0 0 6mm; color: #1E6B3A; font-weight: 700; }
  .capa .sub { font-size: 12.5pt; color: #555; margin: 0 0 18mm; max-width: 135mm; line-height: 1.5; }
  .capa dl { display: grid; grid-template-columns: 34mm 1fr; gap: 3mm 6mm;
             font-size: 9.5pt; margin: 0; border-top: 1px solid #D9D9D9; padding-top: 6mm; }
  .capa dt { color: #8C8C8C; }
  .capa dd { margin: 0; }

  /* ── Texto ────────────────────────────────────────────── */
  h1 { font-size: 17pt; color: #1E6B3A; margin: 0 0 5mm; padding-bottom: 2.5mm;
       border-bottom: 2px solid #1E6B3A; page-break-after: avoid; }
  h2 { font-size: 13.5pt; color: #1E6B3A; margin: 9mm 0 3mm; page-break-after: avoid; }
  h3 { font-size: 11.5pt; margin: 6mm 0 2mm; page-break-after: avoid; }
  p { margin: 0 0 3mm; text-align: justify; hyphens: auto; }
  strong { font-weight: 650; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }
  a { color: #1A1A1A; text-decoration: none; border-bottom: .4pt solid #B9D8C4; }
  .link-ausente { color: #1A1A1A; border-bottom: .4pt dotted #C9C9C9; }
  hr { border: 0; border-top: 1px solid #E6E6E6; margin: 7mm 0; }

  /* ── Tabelas ──────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; font-size: 8.8pt; margin: 3mm 0 5mm;
          page-break-inside: avoid; }
  th { background: #DFEFE0; color: #1E6B3A; text-align: left; font-weight: 700;
       padding: 2mm 2.5mm; border: .5pt solid #C8DCCB; }
  td { padding: 2mm 2.5mm; border: .5pt solid #E0E0E0; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #FAFAFA; }

  /* ── Código ───────────────────────────────────────────── */
  pre { background: #F7F9F7; border: .5pt solid #DCE6DD; border-left: 2.5pt solid #2FA84F;
        border-radius: 2px; padding: 3mm 3.5mm; overflow-x: hidden;
        font: 8.2pt/1.45 "SF Mono", Menlo, Consolas, monospace; margin: 0 0 4mm;
        white-space: pre-wrap; word-break: break-word; page-break-inside: avoid; }
  code { font: .88em/1 "SF Mono", Menlo, Consolas, monospace; background: #F2F4F2;
         padding: .4mm 1mm; border-radius: 2px; }
  pre code { background: none; padding: 0; font-size: inherit; }

  /* ── Figuras ──────────────────────────────────────────── */
  figure { margin: 5mm -9mm 6mm; text-align: center; page-break-inside: avoid; }
  figure img { max-width: 100%; height: auto; border: .5pt solid #E6E6E6; border-radius: 3px; }
  figcaption { font-size: 8.4pt; color: #8C8C8C; margin-top: 2mm; font-style: italic; }

  /* ── Callouts do Obsidian ─────────────────────────────── */
  blockquote { margin: 4mm 0; padding: 3mm 4mm; background: #F7F9F7;
               border-left: 2.5pt solid #2FA84F; border-radius: 2px; page-break-inside: avoid; }
  blockquote p { margin: 0 0 1.5mm; text-align: left; }
  blockquote p:last-child { margin-bottom: 0; }
  .callout-titulo { font-weight: 700; color: #1E6B3A; display: block; margin-bottom: 1.5mm; }
`;

// Os callouts (`> [!info] Título`) chegam como citação comum; aqui o título
// ganha destaque e a marca `[!tipo]` sai do texto.
function tratarCallouts(html) {
  return html.replace(
    /<blockquote>\s*<p>\[!(\w+)\][-+]?\s*([^<]*)/g,
    (_, _tipo, titulo) =>
      `<blockquote><p><span class="callout-titulo">${escapar(titulo.trim())}</span>`,
  );
}

function montar(md, arquivo, raizVault) {
  const [meta, corpo] = frontmatter(md);
  const semTitulo = corpo.replace(/^\s*#\s+(.+)$/m, '');
  const titulo = (corpo.match(/^\s*#\s+(.+)$/m) || [, path.basename(arquivo, '.md')])[1];
  const [nome, subtitulo] = titulo.split(' — ');

  let html = renderizar(semRodape(semTitulo), () => null);
  html = tratarCallouts(html);
  // O markdown.js escreve `midia/<caminho>` porque é o que o site serve; no
  // PDF o Chrome lê do disco.
  html = html.replace(/src="midia\/([^"]+)"/g,
    (_, rel) => `src="${encodeURI(rel)}"`);

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${escapar(titulo)}</title><style>${ESTILO}</style></head><body>
<section class="capa">
  <div class="eyebrow">Frila · Challenge 18 · BlendOps</div>
  <h1>${escapar(nome)}</h1>
  <p class="sub">${escapar(subtitulo || '')}</p>
  <dl>
    <dt>Documento</dt><dd>${escapar(titulo)}</dd>
    <dt>Projeto</dt><dd>Frila — contratação por turno avulso</dd>
    <dt>Equipe</dt><dd>Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva</dd>
    <dt>Desafio</dt><dd>${escapar(meta.desafio || 'C18')} · Apple Developer Academy</dd>
    <dt>Criado em</dt><dd>${escapar(meta.data_criacao || '')}</dd>
    <dt>Gerado em</dt><dd>${new Date().toISOString().slice(0, 10)}</dd>
  </dl>
</section>
<h1>${escapar(nome)}</h1>
${html}
</body></html>`;
}

(async () => {
  const args = process.argv.slice(2);
  const iSaida = args.indexOf('--saida');
  const saida = iSaida >= 0 ? path.resolve(args[iSaida + 1]) : process.cwd();
  const notas = (iSaida >= 0 ? args.slice(0, iSaida) : args).map((p) => path.resolve(p));

  if (!notas.length) { console.error('Uso: gerar-pdf.js <nota.md> … --saida <pasta>'); process.exit(1); }
  fs.mkdirSync(saida, { recursive: true });

  const navegador = await puppeteer.launch({ headless: 'shell' });

  for (const nota of notas) {
    const raizVault = path.resolve(path.dirname(nota), '..');
    const html = montar(fs.readFileSync(nota, 'utf8'), nota, raizVault);

    const temporario = path.join(raizVault, `.pdf-${process.pid}.html`);
    fs.writeFileSync(temporario, html, 'utf8');

    const pagina = await navegador.newPage();
    await pagina.goto(`file://${encodeURI(temporario)}`, { waitUntil: 'load' });
    const destino = path.join(saida, path.basename(nota, '.md') + '.pdf');
    await pagina.pdf({
      path: destino,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-size:7.5pt;color:#8C8C8C;padding:0 16mm;'
        + 'font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between">'
        + '<span>Frila · Challenge 18 · BlendOps</span>'
        + '<span class="pageNumber"></span></div>',
      margin: { top: '17mm', bottom: '20mm', left: '16mm', right: '16mm' },
    });
    await pagina.close();
    fs.rmSync(temporario, { force: true });

    const kb = Math.round(fs.statSync(destino).size / 1024);
    console.log(`  ✓ ${path.basename(destino)} · ${kb} KB`);
  }

  await navegador.close();
  console.log(`${notas.length} PDF(s) em ${saida}`);
})();
