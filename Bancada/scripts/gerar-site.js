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
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { renderizar, escapar } = require('./markdown');

const RAIZ_PROJETO = path.resolve(__dirname, '..');

/// Identidade do conteúdo publicado, para o site saber que mudou.
///
/// `geradoEm` sai do cálculo de propósito: é `.now` no momento do build, então
/// entraria diferente a cada execução e o aviso de "conteúdo novo" dispararia
/// sem nada ter mudado. Um aviso que aparece à toa é um aviso que se aprende a
/// ignorar — e aí não serve mais quando o conteúdo muda de verdade.
function hashDoIndice(indice) {
  const { geradoEm, ...conteudo } = indice;
  return crypto.createHash('sha256')
    .update(JSON.stringify(conteudo))
    .digest('hex')
    .slice(0, 16);
}

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
  const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;
  console.log(`  ${plural(site.paginasEscritas, 'página', 'páginas')} · ${plural(site.midiasCopiadas, 'arquivo', 'arquivos')} de mídia`);
  console.log(`  abra com: open ${path.join(destino, 'index.html')}`);
}

function lerIndice(vault) {
  // Índice já pronto: o caminho do CI quando o build separa produzir de
  // renderizar. Também serve para depurar o gerador contra um índice salvo,
  // sem precisar de um vault por perto.
  if (process.env.BANCADA_INDICE_JSON) {
    const arquivo = path.resolve(process.env.BANCADA_INDICE_JSON);
    if (!fs.existsSync(arquivo)) {
      console.error(`✗ BANCADA_INDICE_JSON aponta para um arquivo que não existe: ${arquivo}`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  }

  // `BANCADA_BIN` existe por causa do CI: o runner é Linux e compila o
  // `bancada-indice`, enquanto na máquina de quem desenvolve o binário é o
  // `./Bancada` do macOS. Os dois emitem o mesmo JSON — é o mesmo `NucleoCLI`.
  const binario = process.env.BANCADA_BIN
    ? path.resolve(process.env.BANCADA_BIN)
    : path.join(RAIZ_PROJETO, 'Bancada');
  if (!fs.existsSync(binario)) {
    console.error(process.env.BANCADA_BIN
      ? `✗ BANCADA_BIN aponta para um binário que não existe: ${binario}`
      : '✗ O binário da Bancada não existe. Rode ./build.sh primeiro.');
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
  { tipo: 'design',            titulo: 'Design' },
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

    // O arquivo que as abas abertas consultam. Fica separado do índice de
    // propósito: o índice passa de 300 KB, e baixá-lo a cada 30 segundos só
    // para descobrir que nada mudou desperdiçaria a banda de quem está lendo.
    this.escrever('versao.json', JSON.stringify({
      versao: hashDoIndice(this.indice),
      geradoEm: this.indice.geradoEm,
    }) + '\n');

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
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${base}estilo.css">
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header>
  <a class="marca" href="${base}index.html">Challenge 18</a>
  <nav>${nav}</nav>
</header>
<div class="colunas">
  <aside>${secoes}</aside>
  <main id="conteudo" tabindex="-1">
    <h1>${escapar(titulo)}</h1>
    ${subtitulo ? `<p class="subtitulo">${escapar(subtitulo)}</p>` : ''}
    ${corpo}
  </main>
</div>
<footer>
  Gerado a partir do vault <code>doc-harness</code> em ${escapar(geradoEm)}.
  A narrativa deste registro é escrita a partir de fatos automáticos — nada aqui é preenchido por suposição.
</footer>
${this.avisoDeAtualizacao(base)}
</body>
</html>`;
  }

  /// O aviso de conteúdo novo — a única peça de JavaScript do site multipágina.
  ///
  /// O vault muda por fora de quem está lendo: os hooks do Git escrevem em
  /// `05 - Registros/` a cada commit, e o build republica em poucos minutos.
  /// Sem isso, uma aba aberta mostra um registro velho sem dar nenhum sinal —
  /// que é exatamente a falha que a Bancada nativa evita com o relógio andando
  /// no cabeçalho.
  ///
  /// **Avisa, não recarrega.** Recarregar sozinho jogaria fora a posição de
  /// quem está no meio de um registro longo. Quem decide é quem lê.
  ///
  /// Degrada em silêncio: sem JS, ou com a rede caindo, o site continua sendo
  /// o HTML estático que já era. O `<details>` do colapso de registros nunca
  /// dependeu de script e continua não dependendo.
  avisoDeAtualizacao(base) {
    if (this.paginaUnica) return '';
    const versao = hashDoIndice(this.indice);
    return `<div id="atualizacao" hidden role="status" aria-live="polite">
  <span>Há conteúdo novo no vault.</span>
  <button type="button" onclick="location.reload()">Atualizar</button>
</div>
<script>
(function () {
  var atual = ${JSON.stringify(versao)};
  var painel = document.getElementById('atualizacao');
  var alvo = ${JSON.stringify(base + 'versao.json')};

  function checar() {
    // 'no-store' porque o que se quer saber é o estado do servidor. Um 304 do
    // cache responderia "igual ao que você já tem", que é sempre verdade e
    // nunca útil.
    fetch(alvo, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dados) {
        if (dados && dados.versao && dados.versao !== atual) {
          painel.hidden = false;
          clearInterval(timer);
        }
      })
      .catch(function () { /* rede caiu; a próxima passada tenta de novo */ });
  }

  var timer = setInterval(checar, 30000);

  // Voltar para a aba é quando a chance de ter perdido algo é maior, e é o
  // momento em que esperar mais 30s pareceria o site estar quebrado.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) checar();
  });
})();
</script>`;
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

    // A voz de narrativa e o teto de 66ch vivem em `.narrativa` desde sempre,
    // e o gerador multipágina nunca envolvia o corpo nela — só o de página
    // única fazia. Toda narrativa do site (diário, roadmap, CBL) saía em sans,
    // sem teto de medida, perto de 110 caracteres por linha. É o V-01 do site:
    // a tese declarada e não entregue justamente na superfície de leitura.
    corpo += `<article class="narrativa">${this.md(corpoSemTitulo, 'notas')}</article>`;

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
      // O nível 1 da árvore é o tipo do fato. Marcá-lo é o que deixa o site
      // colorir a categoria como o app faz em `MarcadorDeTipo` — antes o site
      // pintava todo tipo com o acento, jogando fora o próprio código de cor.
      const marcaDeTipo = nivel === 1 ? ` data-tipo="${escapar(n.rotulo)}"` : '';
      return `<li><details${aberto}${classe}${marcaDeTipo}>
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
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
   * As variáveis CSS, resolvidas a partir de `tokens.json`.
   *
   * `papel` referencia `primitivo` — "neutro.3", "azul.profundo" — e nunca
   * carrega hex. Resolver aqui é o que faz trocar um passo da rampa propagar
   * para as duas saídas do site e, via `Tokens.swift`, para o app.
   *
   * Emissão única de propósito: os dois modos tinham cada um a sua, e por isso
   * `tipoFato` só existia no bloco claro — as cores de fato não adaptavam ao
   * modo escuro em metade do site.
   */
  variaveis() {
    const t = this.tokens;

    const resolver = (referencia) => {
      const [grupo, chave] = referencia.split('.');
      const primitivo = t.primitivo[grupo];
      if (primitivo === undefined) {
        throw new Error(`tokens.json: primitivo.${grupo} não existe (visto em "${referencia}")`);
      }
      const valor = Array.isArray(primitivo) ? primitivo[Number(chave)] : primitivo[chave];
      if (valor === undefined) {
        throw new Error(`tokens.json: primitivo.${referencia} não existe`);
      }
      return valor;
    };

    const cores = (modo) => {
      const linhas = [];
      for (const [nome, par] of Object.entries(t.papel)) {
        if (nome.startsWith('_')) continue;
        linhas.push(`  --${nome}: ${resolver(par[modo])};`);
      }
      for (const [nome, par] of Object.entries(t.statusTarefa)) {
        linhas.push(`  --status-${nome}: ${resolver(par[modo])};`);
      }
      for (const [nome, par] of Object.entries(t.tipoFato)) {
        linhas.push(`  --fato-${nome}: ${resolver(par[modo])};`);
      }
      return linhas.join('\n');
    };

    // Métrica e tipografia não mudam com o esquema, então saem uma vez só.
    const invariantes = [
      ...Object.entries(t.espaco).map(([n, v]) => `  --espaco-${n}: ${v}px;`),
      ...Object.entries(t.raio).map(([n, v]) => `  --raio-${n}: ${v}px;`),
      `  --raio: ${t.raio.md}px;`,
      ...Object.entries(t.traco).map(([n, v]) => `  --traco-${n}: ${v}px;`),
      ...Object.entries(t.veu).map(([n, v]) => `  --veu-${n}: ${v};`),
      // Movimento sai do mesmo lugar que o do app. O site tinha `transition:
      // none` para quem pede menos movimento e nenhuma `transition` para quem
      // não pede — os tokens existiam em tokens.json e nunca chegavam ao CSS.
      ...Object.entries(t.movimento)
        .filter(([n]) => !n.startsWith('_'))
        .map(([n, v]) => `  --mov-${n}: ${v}s;`),
      `  --tipo-titulo: ${t.tipografia.interface.titulo.tamanho}px;`,
      `  --galeria-card: ${t.metrica.galeria.larguraMinimaCard}px;`,
      `  --galeria-thumb: ${t.metrica.galeria.alturaThumbnail}px;`,
      // Uma superfamília, três vozes. O token é o papel, não o arquivo de
      // fonte: o app nativo usa SF / New York / SF Mono pela mesma regra.
      '  --sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;',
      '  --serif: "IBM Plex Serif", ui-serif, Georgia, serif;',
      '  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;'
    ].join('\n');

    // A pílula de status usa o véu do sistema, não um percentual solto.
    const pilulas = Object.keys(t.statusTarefa)
      .map(
        (s) =>
          `.status-${s} { color: var(--status-${s});\n` +
          `  background: color-mix(in srgb, var(--status-${s}) calc(var(--veu-medio) * 100%), transparent); }`
      )
      .join('\n');

    // Cor por tipo de fato, como no app. Geradas a partir de tokens.json para
    // que um tipo novo — `registrar-fato.sh` aceita tipo arbitrário — ganhe
    // regra sem ninguém vir editar CSS.
    const tipos = Object.keys(t.tipoFato)
      .map(
        (tipo) =>
          `details[data-tipo="${tipo}"] > summary .dito,\n` +
          `details[data-tipo="${tipo}"] > summary .rotulo { color: var(--fato-${tipo}); }`
      )
      .join('\n');

    return `:root {
${cores('claro')}
${invariantes}
  color-scheme: light;
}

/* O site acompanha a aparência do sistema, igual ao app. O atributo
   data-theme só existe para o botão da página única sobrepor essa escolha. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${cores('escuro')}
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
${cores('escuro')}
  color-scheme: dark;
}

${pilulas}

${tipos}
`;
  }

  /** Lê um arquivo de `scripts/estilo/`. */
  folhaDeEstilo(nome) {
    return fs.readFileSync(path.join(__dirname, 'estilo', `${nome}.css`), 'utf8');
  }

  cssPaginaUnica() {
    return `${this.variaveis()}
${this.folhaDeEstilo('base')}
${this.folhaDeEstilo('pagina-unica')}`;
  }

  css() {
    return `/* Gerado por scripts/gerar-site.js a partir de tokens.json — não editar à mão.
   Os mesmos valores alimentam o app nativo (Sources/DesignSystem/Tokens.swift)
   e o ícone (scripts/gerar-icone.py). O corpo do CSS vive em
   scripts/estilo/*.css; aqui só entram as variáveis resolvidas. */

${this.variaveis()}
${this.folhaDeEstilo('base')}
${this.folhaDeEstilo('multipagina')}`;
  }
}

main();
