#!/usr/bin/env node
// Gera o site estático de leitura do vault — a superfície para quem está fora
// da equipe e não vai instalar app nenhum.
//
// Não reimplementa nada: o índice vem do binário da Bancada
// (`./Bancada --indice`), que já parseou frontmatter, fatos e agrupamento. É o
// que garante que o site e o app contem a mesma história — duas
// implementações da mesma regra divergem com o tempo, e um registro que muda
// conforme quem olha perde a serventia inteira.
//
// Uso: gerar-site.js <vault> [destino]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderizar, escapar } = require('./markdown');

const RAIZ_PROJETO = path.resolve(__dirname, '..');

function main() {
  const args = process.argv.slice(2);
  const paginaUnica = args.includes('--pagina-unica');
  const posicionais = args.filter((a) => !a.startsWith('--'));

  const vault = path.resolve(posicionais[0] || path.join(RAIZ_PROJETO, '..', 'doc-harness'));
  const indice = lerIndice(vault);
  const tokens = JSON.parse(fs.readFileSync(path.join(RAIZ_PROJETO, 'tokens.json'), 'utf8'));

  // Modo página única: um HTML só, para publicar onde só cabe um arquivo —
  // um Artifact, um anexo de e-mail para o mentor.
  if (paginaUnica) {
    const destino = path.resolve(posicionais[1] || path.join(RAIZ_PROJETO, 'site', 'bordo.html'));
    const site = new Site(indice, tokens, vault, path.dirname(destino), true);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, site.htmlPaginaUnica(), 'utf8');
    const kb = (fs.statSync(destino).size / 1024).toFixed(0);
    console.log(`✓ Página única gerada: ${destino} (${kb} KB)`);
    return;
  }

  const destino = path.resolve(posicionais[1] || path.join(RAIZ_PROJETO, 'site'));
  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });

  const site = new Site(indice, tokens, vault, destino);
  site.gerar();

  console.log(`✓ Site gerado em ${destino}`);
  console.log(`  ${site.paginasEscritas} páginas · ${site.midiasCopiadas} arquivo(s) de mídia`);
  console.log(`  abra com: open ${path.join(destino, 'index.html')}`);
}

function lerIndice(vault) {
  const binario = path.join(RAIZ_PROJETO, 'Bancada');
  if (!fs.existsSync(binario)) {
    console.error('✗ O binário da Bancada não existe. Rode ./build.sh primeiro.');
    process.exit(1);
  }
  try {
    // maxBuffer generoso: o índice carrega o corpo de toda nota, e o
    // documento CBL sozinho passa de 4 mil palavras.
    const saida = execFileSync(binario, ['--indice', vault], { maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(saida.toString('utf8'));
  } catch (e) {
    console.error(`✗ Não deu para ler o vault: ${e.stderr ? e.stderr.toString().trim() : e.message}`);
    process.exit(1);
  }
}

// Ordem de leitura para um mentor: o desafio primeiro, o log por último.
const SECOES = [
  { tipo: 'cbl-desafio',       titulo: 'Desafio' },
  { tipo: 'roadmap',           titulo: 'Roadmap' },
  { tipo: 'atualizacao-diaria', titulo: 'Diário' },
  { tipo: 'documento-derivado', titulo: 'Documentos' },
];

class Site {
  constructor(indice, tokens, vault, destino, paginaUnica = false) {
    this.indice = indice;
    this.tokens = tokens;
    this.vault = vault;
    this.destino = destino;
    this.paginaUnica = paginaUnica;
    this.paginasEscritas = 0;
    this.midiasCopiadas = 0;

    // Duas exclusões, por motivos diferentes:
    //
    // - Índices são listas de wikilinks que só fazem sentido dentro do
    //   Obsidian; a navegação do site cumpre esse papel.
    // - Templates são andaimes internos, cheios de marcadores como
    //   `{{título da tarefa}}`. Publicá-los faria o registro parecer
    //   preenchido pela metade justamente para quem vai avaliá-lo.
    this.notas = indice.notas.filter(
      (n) =>
        n.tipo !== 'indice' &&
        n.tipo !== 'registro' &&
        !path.basename(n.caminho).startsWith('Template - ')
    );
    this.porCaminho = new Map(this.notas.map((n) => [n.caminho, n]));
  }

  gerar() {
    this.escrever('estilo.css', this.css());
    this.escrever('index.html', this.paginaCapa());
    this.escrever('registros.html', this.paginaRegistros());
    this.escrever('tarefas.html', this.paginaTarefas());
    this.escrever('galeria.html', this.paginaGaleria());

    for (const secao of SECOES) {
      for (const nota of this.notasDe(secao.tipo)) {
        this.escrever(this.arquivoDaNota(nota.caminho), this.paginaDeNota(nota, secao));
      }
    }

    this.copiarMidia();
  }

  // MARK: - Utilidades

  escrever(nome, conteudo) {
    const alvo = path.join(this.destino, nome);
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    fs.writeFileSync(alvo, conteudo, 'utf8');
    if (nome.endsWith('.html')) this.paginasEscritas++;
  }

  notasDe(tipo) {
    const notas = this.notas.filter((n) => n.tipo === tipo);
    if (tipo === 'atualizacao-diaria') {
      return notas.sort((a, b) => (b.campos.data || '').localeCompare(a.campos.data || ''));
    }
    return notas.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  }

  arquivoDaNota(caminho) {
    const slug = caminho
      .replace(/\.md$/, '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    return `notas/${slug}.html`;
  }

  /** Wikilinks do vault vêm sem extensão: `02 - Atualizações Diárias/…/2026-09-08`. */
  resolver(alvo, daPasta) {
    const candidatos = [alvo, `${alvo}.md`];
    for (const c of candidatos) {
      if (this.porCaminho.has(c)) {
        if (this.paginaUnica) return `#${this.ancora(c)}`;
        const href = this.arquivoDaNota(c);
        return daPasta === 'notas' ? path.basename(href) : href;
      }
    }
    return null;
  }

  ancora(caminho) {
    return this.arquivoDaNota(caminho).replace(/^notas\//, 'nota-').replace(/\.html$/, '');
  }

  md(texto, daPasta) {
    return renderizar(this.semRodapeDoObsidian(texto), (alvo) => this.resolver(alvo, daPasta));
  }

  /**
   * Tira o rodapé de navegação que toda nota do vault carrega
   * (`--- ← [[…|Índice CBL]]`).
   *
   * Ele existe para andar entre notas dentro do Obsidian; no site a
   * navegação é a barra lateral. Pior: aponta para os índices, que não são
   * publicados — então viraria um "← Índice CBL" morto no pé de cada página.
   */
  semRodapeDoObsidian(texto) {
    return texto.replace(/\n-{3,}\s*\n\s*←[^\n]*\n?\s*$/, '\n');
  }

  // MARK: - Molde

  pagina({ titulo, subtitulo, corpo, ativo, daPasta }) {
    const base = daPasta === 'notas' ? '../' : '';
    const nav = [
      ['index.html', 'Visão geral'],
      ['tarefas.html', 'Tarefas'],
      ['registros.html', 'Registros'],
      ['galeria.html', 'Galeria'],
    ]
      .map(([href, rotulo]) => {
        const classe = ativo === href ? ' class="ativo"' : '';
        return `<a href="${base}${href}"${classe}>${rotulo}</a>`;
      })
      .join('');

    const secoes = SECOES.map((s) => {
      const notas = this.notasDe(s.tipo);
      if (!notas.length) return '';
      const itens = notas
        .map((n) => {
          const href = base + this.arquivoDaNota(n.caminho);
          const classe = ativo === this.arquivoDaNota(n.caminho) ? ' class="ativo"' : '';
          const rotulo = n.tipo === 'atualizacao-diaria' ? (n.campos.data || n.titulo) : n.titulo;
          return `<li><a href="${href}"${classe}>${escapar(rotulo)}</a></li>`;
        })
        .join('');
      return `<div class="grupo"><h3>${s.titulo}</h3><ul>${itens}</ul></div>`;
    }).join('');

    const geradoEm = new Date(this.indice.geradoEm).toLocaleString('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapar(titulo)} · Challenge 18</title>
<link rel="stylesheet" href="${base}estilo.css">
</head>
<body>
<header>
  <a class="marca" href="${base}index.html">Challenge 18</a>
  <nav>${nav}</nav>
</header>
<div class="colunas">
  <aside>${secoes}</aside>
  <main>
    <h1>${escapar(titulo)}</h1>
    ${subtitulo ? `<p class="subtitulo">${escapar(subtitulo)}</p>` : ''}
    ${corpo}
  </main>
</div>
<footer>
  Gerado a partir do vault <code>doc-harness</code> em ${escapar(geradoEm)}.
  A narrativa deste registro é escrita a partir de fatos automáticos — nada aqui é preenchido por suposição.
</footer>
</body>
</html>`;
  }

  // MARK: - Páginas

  paginaCapa() {
    const desafios = this.notasDe('cbl-desafio');
    const ativo = desafios.find((d) => d.campos.status === 'ativo') || desafios[0];
    const diarios = this.notasDe('atualizacao-diaria');
    const tarefas = this.indice.notas.filter((n) => n.tipo === 'tarefa');

    const numeros = [
      ['Fatos registrados', this.indice.fatos.length],
      ['Dias com registro', new Set(this.indice.fatos.map((f) => f.data)).size],
      ['Tarefas', tarefas.length],
      ['Pessoas', new Set(this.indice.fatos.map((f) => f.autor)).size],
    ]
      .map(([r, v]) => `<div class="numero"><strong>${v}</strong><span>${r}</span></div>`)
      .join('');

    const ultimos = diarios
      .slice(0, 5)
      .map((n) => {
        const href = this.arquivoDaNota(n.caminho);
        const n_fatos = this.indice.fatos.filter((f) => f.data === n.campos.data).length;
        return `<li><a href="${href}">${escapar(n.campos.data || n.titulo)}</a>
          <span class="apoio">${n_fatos} fato(s)</span></li>`;
      })
      .join('');

    let corpo = `<div class="numeros">${numeros}</div>`;

    if (ativo) {
      corpo += `<div class="destaque">
        <h2>${escapar(ativo.titulo)}</h2>
        ${this.md(ativo.corpo.split('\n').slice(1).join('\n'), '')}
      </div>`;
    }

    corpo += `<h2>Últimos dias</h2>`;
    corpo += ultimos ? `<ul class="lista-dias">${ultimos}</ul>`
                     : `<p class="vazio">Nenhuma nota diária ainda.</p>`;

    return this.pagina({
      titulo: 'Visão geral',
      subtitulo: 'Registro compartilhado do ciclo CBL — equipe BlendOps',
      corpo,
      ativo: 'index.html',
      daPasta: '',
    });
  }

  paginaDeNota(nota, secao) {
    // O H1 vira o título da página; repeti-lo no corpo seria redundante.
    const corpoSemTitulo = nota.corpo.replace(/^#\s+.*\n?/, '');
    let corpo = '';

    if (nota.somenteLeitura) {
      corpo += `<p class="aviso">Documento derivado de um arquivo <code>.pages</code> — regenerado automaticamente a cada conversão.</p>`;
    }

    const campos = Object.entries(nota.campos)
      .filter(([k]) => !['tipo'].includes(k))
      .map(([k, v]) => `<span><b>${escapar(k)}</b> ${escapar(v)}</span>`)
      .join('');
    if (campos) corpo += `<div class="campos">${campos}</div>`;

    corpo += this.md(corpoSemTitulo, 'notas');

    return this.pagina({
      titulo: nota.titulo,
      subtitulo: secao.titulo,
      corpo,
      ativo: this.arquivoDaNota(nota.caminho),
      daPasta: 'notas',
    });
  }

  paginaTarefas() {
    const tarefas = this.indice.notas.filter((n) => n.tipo === 'tarefa');
    if (!tarefas.length) {
      return this.pagina({
        titulo: 'Tarefas',
        corpo: '<p class="vazio">Nenhuma tarefa registrada ainda.</p>',
        ativo: 'tarefas.html',
        daPasta: '',
      });
    }

    const ordem = ['a-fazer', 'em-andamento', 'revisao', 'concluida'];
    const rotulos = {
      'a-fazer': 'A fazer',
      'em-andamento': 'Em andamento',
      revisao: 'Revisão',
      concluida: 'Concluída',
    };

    const linhas = tarefas
      .slice()
      .sort((a, b) => ordem.indexOf(a.campos.status) - ordem.indexOf(b.campos.status))
      .map((t) => {
        const s = t.campos.status || '';
        return `<tr>
          <td class="mono">${escapar(t.campos.id || '—')}</td>
          <td>${escapar(t.titulo)}</td>
          <td><span class="etiqueta status-${escapar(s)}">${escapar(rotulos[s] || '—')}</span></td>
          <td>${escapar(t.campos.responsavel || '—')}</td>
          <td>${escapar(t.campos.desafio || '—')}</td>
          <td class="mono">${escapar(t.campos.data_criacao || '—')}</td>
        </tr>`;
      })
      .join('');

    const corpo = `<div class="rolagem"><table>
      <thead><tr><th>ID</th><th>Tarefa</th><th>Status</th><th>Responsável</th><th>Desafio</th><th>Criada em</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table></div>`;

    return this.pagina({ titulo: 'Tarefas', corpo, ativo: 'tarefas.html', daPasta: '' });
  }

  paginaRegistros() {
    if (!this.indice.arvoreDeRegistros.length) {
      return this.pagina({
        titulo: 'Registros',
        corpo: '<p class="vazio">Nenhum fato registrado ainda.</p>',
        ativo: 'registros.html',
        daPasta: '',
      });
    }

    // `<details>` faz o colapso sem uma linha de JavaScript: o site é
    // estático de verdade, e continua funcionando sem scripts.
    const no = (n, nivel) => {
      if (!n.filhos) {
        return `<li class="fato"><span class="rotulo">${escapar(n.rotulo)}</span>
          <span class="apoio">${escapar(n.detalhe)}</span></li>`;
      }
      const filhos = n.filhos.map((f) => no(f, nivel + 1)).join('');
      const aberto = nivel === 0 ? ' open' : '';
      const classe = n.ocorrencias > 1 && nivel === 2 ? ' class="grupo-repetido"' : '';
      return `<li><details${aberto}${classe}>
        <summary><span class="rotulo">${escapar(n.rotulo)}</span>
        <span class="apoio">${escapar(n.detalhe)}</span></summary>
        <ul>${filhos}</ul>
      </details></li>`;
    };

    const corpo = `
      <p class="subtitulo">Log escrito automaticamente pelos hooks do Git a cada commit, conversão de documento e sessão de trabalho. Repetições aparecem agrupadas — abra um grupo para ver cada ocorrência.</p>
      <ul class="arvore">${this.indice.arvoreDeRegistros.map((n) => no(n, 0)).join('')}</ul>`;

    return this.pagina({ titulo: 'Registros', corpo, ativo: 'registros.html', daPasta: '' });
  }

  paginaGaleria() {
    const midias = this.indice.midias;
    if (!midias.length) {
      return this.pagina({
        titulo: 'Galeria',
        corpo: '<p class="vazio">Nenhuma mídia versionada no vault ainda.</p>',
        ativo: 'galeria.html',
        daPasta: '',
      });
    }

    const cartoes = midias
      .map((m) => {
        let visual;
        if (m.especie === 'imagem') {
          visual = `<img src="midia/${escapar(m.caminho)}" alt="${escapar(m.nome)}" loading="lazy">`;
        } else if (m.especie === 'video') {
          visual = `<video src="midia/${escapar(m.caminho)}" controls preload="metadata"></video>`;
        } else {
          // Um `.pages` é um bundle proprietário: navegador nenhum o exibe.
          // Em vez de fingir uma prévia, o cartão leva ao Markdown derivado,
          // que é o conteúdo de verdade.
          visual = `<div class="sem-previa">${escapar(m.rotuloDaEspecie)}</div>`;
        }

        const derivado = m.caminhoDerivado && this.porCaminho.has(m.caminhoDerivado)
          ? `<a class="acao" href="${this.arquivoDaNota(m.caminhoDerivado)}">Ler o texto →</a>`
          : '';

        return `<figure class="cartao">
          ${visual}
          <figcaption>
            <b>${escapar(m.nome)}</b>
            <span class="apoio">${escapar(path.dirname(m.caminho))}</span>
            ${derivado}
          </figcaption>
        </figure>`;
      })
      .join('');

    return this.pagina({
      titulo: 'Galeria',
      corpo: `<div class="grade">${cartoes}</div>`,
      ativo: 'galeria.html',
      daPasta: '',
    });
  }

  copiarMidia() {
    for (const m of this.indice.midias) {
      // Bundles (.pages) não são copiados: são pastas, e o navegador não faz
      // nada com eles. O Markdown derivado já carrega o conteúdo.
      if (m.especie === 'pages') continue;
      const origem = path.join(this.vault, m.caminho);
      if (!fs.existsSync(origem) || fs.statSync(origem).isDirectory()) continue;

      const alvo = path.join(this.destino, 'midia', m.caminho);
      fs.mkdirSync(path.dirname(alvo), { recursive: true });
      fs.copyFileSync(origem, alvo);
      this.midiasCopiadas++;
    }
  }

  // MARK: - Página única

  /**
   * Emite o registro inteiro num único HTML, sem `<!doctype>`, `<html>`,
   * `<head>` nem `<body>` — a forma que um Artifact do claude.ai espera.
   *
   * O desenho parte da regra de ouro do vault: fato e narrativa são camadas
   * diferentes e não se misturam. Aqui isso vira tipografia — a narrativa é
   * composta em serifada, e todo fato (hora, autor, tipo, hash) é
   * monoespaçado, do jeito que saiu do hook. O leitor distingue as duas
   * camadas antes de ler uma palavra.
   */
  htmlPaginaUnica() {
    const secoes = [];
    const menu = [];

    const registrar = (id, rotulo, grupo, html, aberta = false) => {
      secoes.push(`<section id="${id}" class="tela"${aberta ? '' : ' hidden'}>${html}</section>`);
      menu.push({ id, rotulo, grupo });
    };

    registrar('visao-geral', 'Visão geral', 'Início', this.telaVisaoGeral(), true);

    for (const s of SECOES) {
      for (const nota of this.notasDe(s.tipo)) {
        const rotulo = s.tipo === 'atualizacao-diaria'
          ? (nota.campos.data || nota.titulo)
          : nota.titulo;
        registrar(this.ancora(nota.caminho), rotulo, s.titulo, this.telaDeNota(nota));
      }
    }

    const tarefas = this.indice.notas.filter((n) => n.tipo === 'tarefa');
    if (tarefas.length) registrar('tarefas', 'Tarefas', 'Trabalho', this.telaTarefas(tarefas));
    registrar('registros', 'Registros', 'Trabalho', this.telaRegistros());
    if (this.indice.midias.length) {
      registrar('galeria', 'Galeria', 'Trabalho', this.telaGaleria());
    }

    const grupos = [];
    for (const item of menu) {
      let g = grupos.find((x) => x.nome === item.grupo);
      if (!g) { g = { nome: item.grupo, itens: [] }; grupos.push(g); }
      g.itens.push(item);
    }

    const navegacao = grupos
      .map(
        (g) => `<div class="grupo-nav">
          <h2>${escapar(g.nome)}</h2>
          <ul>${g.itens
            .map(
              (i) =>
                `<li><button type="button" data-alvo="${i.id}"${i.id === 'visao-geral' ? ' class="ativo" aria-current="true"' : ''}>${escapar(i.rotulo)}</button></li>`
            )
            .join('')}</ul>
        </div>`
      )
      .join('');

    const geradoEm = new Date(this.indice.geradoEm).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    return `<title>Diário de Bordo C18</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${this.cssPaginaUnica()}
</style>

<div class="folha">
  <aside class="lateral">
    <div class="cabeca">
      <p class="carimbo">Apple Developer Academy · turma 714</p>
      <h1>Diário de Bordo<span>Challenge 18</span></h1>
      <p class="equipe">BlendOps · 5 pessoas</p>
    </div>
    <nav>${navegacao}</nav>
  </aside>

  <main>
    ${secoes.join('\n')}
    <footer>
      Gerado a partir do vault <code>doc-harness</code> em ${escapar(geradoEm)}.
      Cada linha do log é escrita por um hook do Git no momento em que o fato acontece;
      a narrativa é escrita depois, a partir dessas linhas.
    </footer>
  </main>
</div>

<script>
(function () {
  var telas = document.querySelectorAll('.tela');
  var botoes = document.querySelectorAll('nav button');

  function mostrar(id) {
    telas.forEach(function (t) { t.hidden = (t.id !== id); });
    botoes.forEach(function (b) {
      var ativo = b.dataset.alvo === id;
      b.classList.toggle('ativo', ativo);
      if (ativo) { b.setAttribute('aria-current', 'true'); }
      else { b.removeAttribute('aria-current'); }
    });
    document.querySelector('main').scrollTo({ top: 0 });
  }

  botoes.forEach(function (b) {
    b.addEventListener('click', function () { mostrar(b.dataset.alvo); });
  });

  // Wikilinks entre notas viram âncoras: interceptar mantém a navegação
  // dentro da página em vez de saltar para um id escondido.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (document.getElementById(id)) { e.preventDefault(); mostrar(id); }
  });
})();
</script>`;
  }

  telaVisaoGeral() {
    const desafios = this.notasDe('cbl-desafio');
    const ativo = desafios.find((d) => d.campos.status === 'ativo') || desafios[0];
    const diarios = this.notasDe('atualizacao-diaria');
    const tarefas = this.indice.notas.filter((n) => n.tipo === 'tarefa');
    const autores = [...new Set(this.indice.fatos.map((f) => f.autor))];

    const numeros = [
      ['fatos registrados', this.indice.fatos.length],
      ['dias com registro', new Set(this.indice.fatos.map((f) => f.data)).size],
      ['tarefas abertas', tarefas.filter((t) => t.campos.status !== 'concluida').length],
      ['pessoas registrando', autores.length],
    ]
      .map(([r, v]) => `<div class="medida"><b>${v}</b><span>${r}</span></div>`)
      .join('');

    const ultimos = diarios
      .slice(0, 6)
      .map((n) => {
        const q = this.indice.fatos.filter((f) => f.data === n.campos.data).length;
        return `<li>
          <button type="button" data-alvo="${this.ancora(n.caminho)}" class="dia">
            <span class="data">${escapar(n.campos.data || n.titulo)}</span>
            <span class="quanto">${q} fato${q === 1 ? '' : 's'}</span>
          </button>
        </li>`;
      })
      .join('');

    let html = `<p class="entrada">
      Este é o registro de bordo do nosso ciclo CBL. Ele se escreve em duas camadas:
      os <b>fatos</b> entram sozinhos — cada commit, cada documento convertido, cada sessão
      de trabalho vira uma linha carimbada no mesmo instante em que acontece —
      e a <b>narrativa</b> é escrita depois, sempre a partir dessas linhas.
      Nenhuma frase daqui existe sem um fato que a sustente.
    </p>
    <div class="medidas">${numeros}</div>`;

    if (ativo) {
      const corpo = this.md(ativo.corpo.replace(/^#\s+.*\n?/, ''), '');
      html += `<article class="narrativa"><h2>${escapar(ativo.titulo)}</h2>${corpo}</article>`;
    }

    if (ultimos) {
      html += `<h2 class="titulo-secao">Últimos dias</h2><ul class="dias">${ultimos}</ul>`;
    }

    return html;
  }

  telaDeNota(nota) {
    let html = `<h2 class="titulo-tela">${escapar(nota.titulo)}</h2>`;

    if (nota.somenteLeitura) {
      html += `<p class="nota-lateral">Texto derivado de um documento <code>.pages</code> do grupo — regenerado a cada conversão, nunca editado à mão.</p>`;
    }

    const campos = Object.entries(nota.campos)
      .filter(([k]) => k !== 'tipo')
      .map(([k, v]) => `<span><i>${escapar(k.replace(/_/g, ' '))}</i>${escapar(v)}</span>`)
      .join('');
    if (campos) html += `<div class="ficha">${campos}</div>`;

    html += `<article class="narrativa">${this.md(nota.corpo.replace(/^#\s+.*\n?/, ''), '')}</article>`;
    return html;
  }

  telaTarefas(tarefas) {
    const ordem = ['a-fazer', 'em-andamento', 'revisao', 'concluida'];
    const rotulos = {
      'a-fazer': 'A fazer', 'em-andamento': 'Em andamento',
      revisao: 'Revisão', concluida: 'Concluída',
    };
    const linhas = tarefas
      .slice()
      .sort((a, b) => ordem.indexOf(a.campos.status) - ordem.indexOf(b.campos.status))
      .map((t) => {
        const s = t.campos.status || '';
        return `<tr>
          <td class="mono">${escapar(t.campos.id || '—')}</td>
          <td>${escapar(t.titulo)}</td>
          <td><span class="pilula status-${escapar(s)}">${escapar(rotulos[s] || '—')}</span></td>
          <td>${escapar(t.campos.responsavel || '—')}</td>
          <td class="mono">${escapar(t.campos.data_criacao || '—')}</td>
        </tr>`;
      })
      .join('');

    return `<h2 class="titulo-tela">Tarefas</h2>
      <div class="rolagem"><table>
        <thead><tr><th>ID</th><th>Tarefa</th><th>Status</th><th>Responsável</th><th>Criada</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table></div>`;
  }

  telaRegistros() {
    const no = (n, nivel) => {
      if (!n.filhos) {
        return `<li class="linha-fato">
          <span class="dito">${escapar(n.rotulo)}</span>
          <span class="carimbo-fato">${escapar(n.detalhe)}</span>
        </li>`;
      }
      const filhos = n.filhos.map((f) => no(f, nivel + 1)).join('');
      const aberto = nivel === 0 ? ' open' : '';
      const repetido = n.ocorrencias > 1 && nivel === 2 ? ' class="repetido"' : '';
      const classeNivel = nivel === 1 ? ` data-tipo="${escapar(n.rotulo)}"` : '';
      return `<li><details${aberto}${repetido}${classeNivel}>
        <summary><span class="dito">${escapar(n.rotulo)}</span>
        <span class="carimbo-fato">${escapar(n.detalhe)}</span></summary>
        <ul>${filhos}</ul>
      </details></li>`;
    };

    return `<h2 class="titulo-tela">Registros</h2>
      <p class="nota-lateral">Escrito pelos hooks do Git, não por pessoas. É append-only: nada aqui é editado depois. Quando o mesmo evento se repete, as ocorrências aparecem reunidas — abra o grupo para ver cada uma com sua hora.</p>
      <ul class="arvore">${this.indice.arvoreDeRegistros.map((n) => no(n, 0)).join('')}</ul>`;
  }

  telaGaleria() {
    const cartoes = this.indice.midias
      .map((m) => {
        const derivado = m.caminhoDerivado && this.porCaminho.has(m.caminhoDerivado)
          ? `<button type="button" class="acao" data-alvo="${this.ancora(m.caminhoDerivado)}">Ler o texto →</button>`
          : '';
        return `<figure class="peca">
          <div class="rotulo-especie">${escapar(m.rotuloDaEspecie)}</div>
          <figcaption>
            <b>${escapar(m.nome)}</b>
            <span class="caminho">${escapar(path.dirname(m.caminho))}</span>
            ${derivado}
          </figcaption>
        </figure>`;
      })
      .join('');

    return `<h2 class="titulo-tela">Galeria</h2>
      <p class="nota-lateral">Documentos e mídia versionados junto às notas. Os arquivos <code>.pages</code> do grupo não são exibíveis num navegador — o texto deles vive no Markdown derivado.</p>
      <div class="pecas">${cartoes}</div>`;
  }

  // MARK: - Estilo

  /**
   * Estilo da página única.
   *
   * As cores vêm de `tokens.json`, o mesmo arquivo que alimenta o app nativo
   * — quem abrir as duas superfícies reconhece a mesma coisa. A tipografia é
   * própria desta página: serifada para narrativa, monoespaçada para tudo
   * que saiu de um hook. É a regra de ouro do vault virada forma.
   */
  cssPaginaUnica() {
    const t = this.tokens;
    const c = t.cor;
    const tokensDe = (modo) =>
      Object.entries(c).map(([n, p]) => `  --${n}: ${p[modo]};`).join('\n') + '\n' +
      Object.entries(t.statusTarefa).map(([n, p]) => `  --status-${n}: ${p[modo]};`).join('\n');

    const pilulas = Object.keys(t.statusTarefa)
      .map((s) => `.status-${s} { color: var(--status-${s});
  background: color-mix(in srgb, var(--status-${s}) 14%, transparent); }`)
      .join('\n');

    return `:root {
${tokensDe('claro')}
  --serif: "Fraunces", ui-serif, Georgia, serif;
  --sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${tokensDe('escuro')}
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
${tokensDe('escuro')}
  color-scheme: dark;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--fundo); color: var(--texto);
  font-family: var(--sans); font-size: 15px; line-height: 1.6;
  -webkit-font-smoothing: antialiased; }
code, .mono { font-family: var(--mono); font-size: 0.88em; }
:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; border-radius: 3px; }

.folha { display: grid; grid-template-columns: 264px minmax(0, 1fr);
  min-height: 100vh; }

/* Lateral ------------------------------------------------------------ */
.lateral { background: var(--superficieSutil); border-right: 1px solid var(--borda);
  padding: 28px 20px; position: sticky; top: 0; align-self: start;
  max-height: 100vh; overflow-y: auto; }
.cabeca { padding-bottom: 20px; margin-bottom: 20px;
  border-bottom: 1px solid var(--borda); }
.carimbo { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--textoSutil); margin: 0 0 10px; }
.cabeca h1 { font-family: var(--serif); font-weight: 600; font-size: 25px;
  line-height: 1.1; margin: 0; letter-spacing: -0.015em; text-wrap: balance; }
.cabeca h1 span { display: block; font-family: var(--mono); font-weight: 400;
  font-size: 12px; letter-spacing: 0.04em; color: var(--acento); margin-top: 7px; }
.equipe { font-size: 12px; color: var(--textoSutil); margin: 12px 0 0; }

.grupo-nav { margin-bottom: 20px; }
.grupo-nav h2 { font-family: var(--mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.09em; color: var(--textoSutil); margin: 0 0 7px; font-weight: 500; }
.grupo-nav ul { list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 1px; }
nav button { width: 100%; text-align: left; background: none; border: 0;
  font: inherit; font-size: 13.5px; color: var(--texto); cursor: pointer;
  padding: 5px 9px; border-radius: 6px; }
nav button:hover { background: color-mix(in srgb, var(--acento) 9%, transparent); }
nav button.ativo { background: color-mix(in srgb, var(--acento) 14%, transparent);
  color: var(--acento); font-weight: 500; }

/* Conteúdo ----------------------------------------------------------- */
main { padding: 40px 44px 60px; max-width: 820px; }
[hidden] { display: none !important; }

.titulo-tela, .titulo-secao { font-family: var(--serif); font-weight: 600;
  letter-spacing: -0.015em; text-wrap: balance; }
.titulo-tela { font-size: 32px; line-height: 1.15; margin: 0 0 22px; }
.titulo-secao { font-size: 20px; margin: 40px 0 14px; }

.entrada { font-family: var(--serif); font-size: 18px; line-height: 1.62;
  max-width: 62ch; margin: 0 0 30px; color: var(--texto); }
.entrada b { font-weight: 600; color: var(--acento); }

/* A narrativa é sempre serifada: é a camada escrita por gente. */
.narrativa { max-width: 66ch; }
.narrativa h2 { font-family: var(--serif); font-size: 21px; font-weight: 600;
  margin: 32px 0 10px; letter-spacing: -0.01em; }
.narrativa h3 { font-family: var(--serif); font-size: 17px; font-weight: 600;
  margin: 26px 0 8px; }
.narrativa p { margin: 0 0 14px; }
.narrativa ul, .narrativa ol { margin: 0 0 14px; padding-left: 20px; }
.narrativa li { margin: 3px 0; }
.narrativa a { color: var(--acento); text-underline-offset: 2px; }
.narrativa hr { border: 0; border-top: 1px solid var(--borda); margin: 28px 0; }

.medidas { display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 1px; background: var(--borda); border: 1px solid var(--borda);
  border-radius: 10px; overflow: hidden; margin-bottom: 34px; }
.medida { background: var(--superficie); padding: 15px 16px; }
.medida b { display: block; font-family: var(--mono); font-size: 27px;
  font-weight: 500; line-height: 1; font-variant-numeric: tabular-nums; }
.medida span { display: block; font-size: 11.5px; color: var(--textoSutil); margin-top: 6px; }

.dias { list-style: none; padding: 0; margin: 0; display: flex;
  flex-direction: column; gap: 1px; }
.dia { width: 100%; display: flex; justify-content: space-between; align-items: baseline;
  background: none; border: 0; border-bottom: 1px solid var(--borda);
  font: inherit; color: var(--texto); cursor: pointer; padding: 11px 4px; }
.dia:hover { background: var(--superficieSutil); }
.dia .data { font-family: var(--mono); font-size: 14px; }
.dia .quanto { font-size: 12px; color: var(--textoSutil); }

.ficha { display: flex; flex-wrap: wrap; gap: 18px; font-size: 12px;
  color: var(--textoSutil); padding-bottom: 16px; margin-bottom: 24px;
  border-bottom: 1px solid var(--borda); }
.ficha i { display: block; font-style: normal; font-family: var(--mono);
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }

.nota-lateral { font-size: 13px; color: var(--textoSutil); max-width: 66ch;
  border-left: 2px solid var(--borda); padding-left: 14px; margin: 0 0 26px; }

.callout { margin: 18px 0; padding: 14px 16px; border-radius: 8px;
  background: var(--superficieSutil); font-size: 14px; max-width: 66ch; }
.callout > b { display: block; font-family: var(--mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.07em; color: var(--acento);
  margin-bottom: 6px; }
.callout > p:last-child { margin-bottom: 0; }
blockquote { margin: 18px 0; padding-left: 16px; border-left: 2px solid var(--borda);
  color: var(--textoSutil); }

pre { background: var(--superficieSutil); padding: 14px; border-radius: 8px;
  overflow-x: auto; }
:not(pre) > code { background: var(--superficieSutil); padding: 1px 5px; border-radius: 4px; }

.vazio-item { list-style: none; }
.vazio-item::before { content: "—"; color: var(--borda); }

/* Tabela ------------------------------------------------------------- */
.rolagem { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
th, td { text-align: left; padding: 9px 14px 9px 0; border-bottom: 1px solid var(--borda); }
th { font-family: var(--mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--textoSutil); font-weight: 500; }
td.mono { font-family: var(--mono); font-variant-numeric: tabular-nums;
  color: var(--textoSutil); }
.pilula { display: inline-block; padding: 2px 10px; border-radius: 999px;
  font-size: 11.5px; font-weight: 500; white-space: nowrap; }
${pilulas}

/* Registros: tudo que veio de hook é monoespaçado. ------------------- */
.arvore, .arvore ul { list-style: none; padding: 0; margin: 0; }
.arvore > li { margin-bottom: 22px; }
.arvore ul { padding-left: 17px; margin-left: 5px; border-left: 1px solid var(--borda); }
.arvore li { margin: 1px 0; }
.arvore summary { cursor: pointer; display: flex; gap: 16px; align-items: baseline;
  justify-content: space-between; padding: 4px 0; }
.arvore summary::marker { color: var(--textoSutil); font-size: 11px; }
.arvore summary:hover .dito { color: var(--acento); }
.linha-fato { display: flex; gap: 16px; align-items: baseline;
  justify-content: space-between; padding: 4px 0; }
.dito { font-family: var(--mono); font-size: 12.5px; line-height: 1.5;
  min-width: 0; word-break: break-word; }
.carimbo-fato { font-family: var(--mono); font-size: 11px; color: var(--textoSutil);
  white-space: nowrap; font-variant-numeric: tabular-nums; }
.arvore > li > details > summary .dito { font-family: var(--serif); font-size: 19px;
  font-weight: 600; letter-spacing: -0.01em; }
details[data-tipo] > summary .dito { color: var(--acento); font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; }
.repetido > summary .dito { font-weight: 500; }

/* Galeria ------------------------------------------------------------ */
.pecas { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px; }
.peca { margin: 0; border: 1px solid var(--borda); border-radius: 10px;
  overflow: hidden; background: var(--superficie); }
.rotulo-especie { background: var(--superficieSutil); padding: 26px 14px;
  font-family: var(--mono); font-size: 10.5px; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--textoSutil); text-align: center; }
.peca figcaption { padding: 13px 14px; display: flex; flex-direction: column; gap: 4px; }
.peca b { font-size: 13.5px; word-break: break-word; }
.peca .caminho { font-family: var(--mono); font-size: 10.5px; color: var(--textoSutil);
  word-break: break-all; }
.acao { align-self: start; background: none; border: 0; padding: 4px 0 0;
  font: inherit; font-size: 12.5px; color: var(--acento); cursor: pointer; }

footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--borda);
  font-size: 11.5px; color: var(--textoSutil); max-width: 66ch; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}

@media (max-width: 860px) {
  .folha { grid-template-columns: 1fr; }
  .lateral { position: static; max-height: none; }
  main { padding: 28px 20px 48px; }
  .titulo-tela { font-size: 26px; }
}
`;
  }

  css() {
    const t = this.tokens;
    const c = t.cor;
    const vars = (modo) =>
      Object.entries(c)
        .map(([nome, par]) => `  --${nome}: ${par[modo]};`)
        .join('\n') +
      '\n' +
      Object.entries(t.statusTarefa)
        .map(([nome, par]) => `  --status-${nome}: ${par[modo]};`)
        .join('\n');

    const tiposDeFato = Object.entries(t.tipoFato)
      .map(([nome, cor]) => `  --fato-${nome}: ${cor};`)
      .join('\n');

    return `/* Gerado por scripts/gerar-site.js a partir de tokens.json — não editar à mão.
   Os mesmos valores alimentam o app nativo (Sources/Bancada/DS/Tokens.swift). */

:root {
${vars('claro')}
${tiposDeFato}
  --espaco-sm: ${t.espaco.sm}px;
  --espaco-md: ${t.espaco.md}px;
  --espaco-lg: ${t.espaco.lg}px;
  --raio: ${t.raio.md}px;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
${vars('escuro')}
    color-scheme: dark;
  }
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--fundo);
  color: var(--texto);
  font: ${t.tipografia.corpo.tamanho + 2}px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }

header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: var(--espaco-lg);
  padding: var(--espaco-md) var(--espaco-lg);
  background: var(--superficie);
  border-bottom: 1px solid var(--borda);
}
.marca { font-weight: 650; color: var(--texto); text-decoration: none; }
header nav { display: flex; gap: var(--espaco-md); flex-wrap: wrap; }
header nav a { color: var(--texto-sutil, var(--textoSutil)); text-decoration: none; font-size: 0.92em; }
header nav a.ativo, header nav a:hover { color: var(--acento); }

.colunas { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: var(--espaco-lg);
  max-width: 1180px; margin: 0 auto; padding: var(--espaco-lg); align-items: start; }

aside { position: sticky; top: 68px; font-size: 0.9em; }
aside .grupo { margin-bottom: var(--espaco-lg); }
aside h3 { margin: 0 0 var(--espaco-sm); font-size: 0.78em; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--textoSutil); }
aside ul { list-style: none; margin: 0; padding: 0; }
aside li { margin: 2px 0; }
aside a { color: var(--texto); text-decoration: none; display: block; padding: 3px 8px;
  border-radius: 6px; }
aside a:hover { background: var(--superficieSutil); }
aside a.ativo { background: var(--superficieSutil); color: var(--acento); font-weight: 600; }

main { min-width: 0; }
main h1 { font-size: ${t.tipografia.titulo.tamanho}px; margin: 0 0 var(--espaco-sm); letter-spacing: -0.01em; }
main h2 { font-size: 1.15em; margin: var(--espaco-lg) 0 var(--espaco-sm); }
main h3 { font-size: 1em; margin: var(--espaco-lg) 0 var(--espaco-sm); }
.subtitulo { color: var(--textoSutil); margin: 0 0 var(--espaco-lg); }

a { color: var(--acento); }
.link-ausente { color: var(--textoSutil); border-bottom: 1px dotted var(--borda); }

.numeros { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--espaco-md); margin-bottom: var(--espaco-lg); }
.numero { background: var(--superficie); border: 1px solid var(--borda);
  border-radius: var(--raio); padding: var(--espaco-md); }
.numero strong { display: block; font-size: 1.7em; line-height: 1.2; }
.numero span { color: var(--textoSutil); font-size: 0.82em; }

.destaque { background: var(--superficie); border: 1px solid var(--borda);
  border-radius: var(--raio); padding: var(--espaco-lg); margin-bottom: var(--espaco-lg); }
.destaque h2 { margin-top: 0; }

.campos { display: flex; flex-wrap: wrap; gap: var(--espaco-md); font-size: 0.85em;
  color: var(--textoSutil); margin-bottom: var(--espaco-lg);
  padding-bottom: var(--espaco-md); border-bottom: 1px solid var(--borda); }
.campos b { color: var(--texto); font-weight: 600; }

.aviso { background: var(--superficieSutil); border-radius: var(--raio);
  padding: var(--espaco-md); font-size: 0.88em; color: var(--textoSutil); }

blockquote { margin: var(--espaco-md) 0; padding: var(--espaco-sm) var(--espaco-md);
  border-left: 3px solid var(--borda); color: var(--textoSutil); }

/* Callouts do Obsidian (> [!info] …) */
.callout { margin: var(--espaco-md) 0; padding: var(--espaco-md);
  border-left: 3px solid var(--acento); border-radius: 0 var(--raio) var(--raio) 0;
  background: var(--superficieSutil); font-size: 0.94em; }
.callout > b { display: block; margin-bottom: 4px; color: var(--acento); }
.callout > p:first-of-type { margin-top: 0; }
.callout > p:last-child { margin-bottom: 0; }
.callout-warning, .callout-aviso { border-left-color: var(--status-revisao); }
.callout-warning > b, .callout-aviso > b { color: var(--status-revisao); }

/* Item de lista ainda não preenchido no vault: ocupa a linha sem fingir
   conteúdo que não existe. */
.vazio-item { list-style: none; min-height: 1.2em; }
.vazio-item::before { content: "—"; color: var(--borda); }

pre { background: var(--superficieSutil); padding: var(--espaco-md);
  border-radius: var(--raio); overflow-x: auto; }
pre code { font-size: 0.86em; }
:not(pre) > code { background: var(--superficieSutil); padding: 1px 5px; border-radius: 4px; }

hr { border: 0; border-top: 1px solid var(--borda); margin: var(--espaco-lg) 0; }

.rolagem { overflow-x: auto; margin: var(--espaco-md) 0; }
table { border-collapse: collapse; width: 100%; font-size: 0.92em; }
th, td { text-align: left; padding: var(--espaco-sm) var(--espaco-md);
  border-bottom: 1px solid var(--borda); }
th { font-size: 0.78em; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--textoSutil); font-weight: 600; }

.etiqueta { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.82em; }
${Object.keys(t.statusTarefa)
  .map(
    (s) =>
      `.status-${s} { color: var(--status-${s}); background: color-mix(in srgb, var(--status-${s}) 15%, transparent); }`
  )
  .join('\n')}

.lista-tarefas { list-style: none; padding-left: 0; }
.lista-tarefas .caixa { display: inline-flex; align-items: center; justify-content: center;
  width: 15px; height: 15px; margin-right: 8px; border: 1px solid var(--borda);
  border-radius: 4px; font-size: 10px; vertical-align: -2px; }
.lista-tarefas .caixa.feita { background: var(--status-concluida); border-color: var(--status-concluida); color: #fff; }

.arvore, .arvore ul { list-style: none; padding-left: 0; margin: 0; }
.arvore ul { padding-left: var(--espaco-lg); border-left: 1px solid var(--borda);
  margin-left: 6px; }
.arvore li { margin: 3px 0; }
.arvore summary { cursor: pointer; padding: 3px 0; display: flex; gap: var(--espaco-md);
  justify-content: space-between; align-items: baseline; }
.arvore summary::marker { color: var(--textoSutil); }
.arvore .rotulo { min-width: 0; }
.arvore .apoio { color: var(--textoSutil); font-size: 0.82em; white-space: nowrap;
  font-variant-numeric: tabular-nums; }
.arvore .fato { display: flex; gap: var(--espaco-md); justify-content: space-between;
  align-items: baseline; padding: 3px 0; }
.grupo-repetido > summary .rotulo { font-weight: 600; }

.lista-dias { list-style: none; padding: 0; }
.lista-dias li { display: flex; justify-content: space-between; padding: var(--espaco-sm) 0;
  border-bottom: 1px solid var(--borda); }

.grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(${t.galeria.larguraMinimaCard}px, 1fr));
  gap: var(--espaco-md); }
.cartao { margin: 0; background: var(--superficie); border: 1px solid var(--borda);
  border-radius: var(--raio); overflow: hidden; }
.cartao img, .cartao video { width: 100%; height: ${t.galeria.alturaThumbnail}px;
  object-fit: cover; display: block; background: var(--superficieSutil); }
.sem-previa { height: ${t.galeria.alturaThumbnail}px; display: flex; align-items: center;
  justify-content: center; background: var(--superficieSutil); color: var(--textoSutil);
  font-size: 0.82em; }
.cartao figcaption { padding: var(--espaco-md); display: flex; flex-direction: column; gap: 3px; }
.cartao .apoio { color: var(--textoSutil); font-size: 0.78em; word-break: break-all; }
.cartao .acao { font-size: 0.85em; margin-top: 4px; }

.vazio { color: var(--textoSutil); }

footer { max-width: 1180px; margin: 0 auto; padding: var(--espaco-lg);
  border-top: 1px solid var(--borda); color: var(--textoSutil); font-size: 0.82em; }

img { max-width: 100%; }

@media (max-width: 800px) {
  .colunas { grid-template-columns: 1fr; }
  aside { position: static; }
}
`;
  }
}

main();
