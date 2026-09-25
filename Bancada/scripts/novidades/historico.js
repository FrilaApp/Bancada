// Linha do tempo da página Novidades, lida do git.
//
// Os hooks que escreviam `05 - Registros` não rodam desde a fusão do
// monorepo, então quem conta o que mudou, quando e por quem é o próprio
// histórico. O caminho é o primeiro pai de `main`: é a ordem em que as
// mudanças chegaram ao site, e não a ordem em que foram escritas num ramo.
//
// Este módulo não sabe gerar página nenhuma. Quem transforma um caminho do
// repositório em página (chave, título, href) é a função `mapearCaminho`,
// injetada por quem chama, para a regra de slug existir num lugar só.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIA_MS = 24 * 60 * 60 * 1000;
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Os dias são os de quem publica e de quem lê: Brasília. Um commit das 22h30
// de segunda sai do git como 01h30 UTC de terça, e é na segunda que ele entra.
const RELOGIO = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function git(repoRaiz, args, opcoes = {}) {
  return execFileSync('git', args, {
    cwd: repoRaiz,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    ...opcoes,
  });
}

/** `{data: 'AAAA-MM-DD', hora: 'HH:mm'}` do instante, no fuso de Brasília. */
function emBrasilia(instante) {
  const p = {};
  for (const parte of RELOGIO.formatToParts(instante)) p[parte.type] = parte.value;
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

/**
 * "22 de setembro": a data por extenso, e nunca "Hoje" ou "Ontem". O site só
 * é gerado a cada push, e quem o abre dois dias depois leria o dia errado;
 * o navegador é quem sabe que dia é hoje. O dia 1 leva o ordinal, como se
 * escreve data no Brasil ("1º de outubro"), igual ao `dataPorExtenso` da
 * página Novidades.
 */
function rotuloDoDia(data) {
  const [, mes, dia] = data.split('-').map(Number);
  return `${dia === 1 ? '1º' : dia} de ${MESES[mes - 1]}`;
}

// O `--since` do git para de andar no primeiro commit mais velho que o corte.
// Um commit de uma máquina com o relógio atrasado cortaria a janela ali, e
// tudo o que veio antes dele sumiria. Por isso o git anda com folga e o
// corte de verdade é feito aqui.
const FOLGA_DO_RELOGIO_MS = 30 * DIA_MS;

/**
 * Os commits do primeiro pai desde `desde`, com os arquivos que cada um
 * tocou. `-z` entrega os caminhos crus, sem as aspas e os escapes octais
 * que o git põe em nome com acento.
 */
function lerCommits(repoRaiz, desde, caminhos) {
  const comFolga = new Date(desde.getTime() - FOLGA_DO_RELOGIO_MS);
  const saida = git(repoRaiz, [
    'log', '--first-parent', `--since=${comFolga.toISOString()}`,
    '--format=%H%x1f%cI%x1f%aN%x1f%s%x1f%P%x1e',
    '--name-status', '-M', '--diff-merges=first-parent', '-z', '--no-color', '--no-show-signature',
    '--', ...caminhos,
  ]);

  const commits = [];
  const pedacos = saida.split('\0');
  for (let i = 0; i < pedacos.length; i++) {
    const pedaco = pedacos[i].replace(/^\n+/, '');
    if (!pedaco) continue;
    if (pedaco.includes('\x1f')) {
      const [sha, quando, autor, assunto, pais] = pedaco.replace(/\x1e$/, '').split('\x1f');
      commits.push({ sha, quando, autor, assunto, pais: pais ? pais.split(' ') : [], arquivos: [] });
      continue;
    }
    // Renomeação e cópia trazem dois caminhos (de, para); o resto, um só.
    const status = pedaco[0];
    const de = pedacos[++i];
    const para = status === 'R' || status === 'C' ? pedacos[++i] : de;
    commits[commits.length - 1].arquivos.push({ status, de, para });
  }
  return commits.filter((c) => new Date(c.quando) >= desde);
}

/**
 * Os commits da borda de um clone raso. O git os mostra sem pai, e o diff
 * deles contra o nada põe o vault inteiro como criado naquele commit.
 */
function bordaDoCloneRaso(repoRaiz) {
  try {
    const arquivo = path.resolve(repoRaiz, git(repoRaiz, ['rev-parse', '--git-path', 'shallow']).trim());
    return new Set(fs.readFileSync(arquivo, 'utf8').split('\n').filter(Boolean));
  } catch {
    return new Set(); // clone completo: não há arquivo `shallow`
  }
}

/**
 * O conteúdo de vários `rev:caminho` numa chamada só ao git. Um por
 * `git show` custaria um processo por arquivo, e um merge grande toca dezenas
 * de notas. O que não existe (a nota ainda não nascera) volta como null.
 */
function lerConteudos(repoRaiz, nomes) {
  const conteudos = new Map();
  // O protocolo é uma linha por pedido: caminho com quebra de linha fica sem
  // conteúdo (e conta como mudado), em vez de desalinhar os seguintes.
  const pedidos = [...new Set(nomes)].filter((n) => !n.includes('\n'));
  if (!pedidos.length) return conteudos;
  const entrada = Buffer.from(`${pedidos.join('\n')}\n`, 'utf8');
  const saida = git(repoRaiz, ['cat-file', '--batch'], { input: entrada, encoding: 'buffer' });
  let pos = 0;
  for (const nome of pedidos) {
    const fim = saida.indexOf(0x0a, pos);
    const cabecalho = saida.toString('utf8', pos, fim).match(/^[0-9a-f]+ \w+ (\d+)$/);
    pos = fim + 1;
    if (!cabecalho) {
      conteudos.set(nome, null); // "<nome> missing" ou "ambiguous": só a linha, sem corpo
      continue;
    }
    const tamanho = Number(cabecalho[1]);
    conteudos.set(nome, saida.toString('utf8', pos, pos + tamanho));
    pos += tamanho + 1;
  }
  return conteudos;
}

// Campos que o pipeline de exportação reescreve sozinho a cada `.pages` ou
// `.docx` reexportado. Mudar só eles não muda o que o leitor lê.
const CAMPO_TECNICO = /^(hash_origem|data_criacao|exportado_.*)$/;

/** Frontmatter em campos de topo (com as linhas de continuação) e o corpo. */
function separarNota(texto) {
  const t = texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const m = t.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { campos: [], corpo: t };
  const campos = [];
  for (const linha of m[1].split('\n')) {
    const chave = linha.match(/^([A-Za-z_][\w-]*)\s*:/);
    if (chave) campos.push({ chave: chave[1], texto: linha });
    else if (campos.length) campos[campos.length - 1].texto += `\n${linha}`;
  }
  return { campos, corpo: t.slice(m[0].length) };
}

/**
 * O que da nota chega ao leitor: o corpo e os campos que não são técnicos.
 * Espaço não conta, como não conta no hash das páginas, e a ordem dos campos
 * também não.
 */
function assinaturaVisivel(texto) {
  const { campos, corpo } = separarNota(texto);
  const junto = (s) => s.replace(/\s+/g, ' ').trim();
  const visiveis = campos.filter((c) => !CAMPO_TECNICO.test(c.chave)).map((c) => junto(c.texto)).sort();
  return JSON.stringify([visiveis, junto(corpo)]);
}

/**
 * Quem escreveu o que um merge trouxe: os commits de `pai1..merge`, que são
 * os do ramo, sem os merges de sincronização e só os que tocaram os mesmos
 * caminhos da linha do tempo. `%aN` passa pelo `.mailmap` da raiz. Em ordem de
 * quem mais contribuiu.
 */
function trazidosPeloMerge(repoRaiz, c, caminhos) {
  let saida;
  try {
    saida = git(repoRaiz, ['log', '--no-merges', '--no-show-signature', '--format=%aN', `${c.pais[0]}..${c.sha}`, '--', ...caminhos]);
  } catch {
    return null; // clone raso sem o segundo pai: não dá para saber
  }
  const porAutor = new Map();
  for (const nome of saida.split('\n').filter(Boolean)) porAutor.set(nome, (porAutor.get(nome) || 0) + 1);
  const autores = [...porAutor.keys()].sort((a, b) => porAutor.get(b) - porAutor.get(a) || a.localeCompare(b, 'pt-BR'));
  let total = 0;
  for (const n of porAutor.values()) total += n;
  return { total, autores };
}

/**
 * Autores e assunto da entrada. Um merge vira uma entrada só, "N commits de
 * X": o assunto do merge ("merge: sincronizar…") não diz nada a quem lê, e os
 * commits do ramo, um a um, esconderiam o momento em que chegaram ao site.
 *
 * null para o merge que só importa histórico: nenhum commit do ramo toca
 * estes caminhos, mas o diff contra o primeiro pai traz o vault inteiro, como
 * o 59a7c9f, que juntou o repositório do vault ao monorepo. Aquelas páginas
 * já existiam, só que noutro lugar.
 */
function cabecalhoDaEntrada(repoRaiz, c, caminhos) {
  if (c.pais.length < 2) return { autores: [c.autor], assunto: c.assunto, merge: false };
  const trazidos = trazidosPeloMerge(repoRaiz, c, caminhos);
  if (!trazidos) return { autores: [c.autor], assunto: c.assunto, merge: true };
  const { total, autores } = trazidos;
  if (!total) return null;
  // Nomes de pessoas separados só por vírgula (AGENTS.md §2.5).
  return { autores, assunto: `${total} ${total === 1 ? 'commit' : 'commits'} de ${autores.join(', ')}`, merge: true };
}

/** Valor de um campo simples do frontmatter, sem aspas; null se não houver. */
function campo(texto, nome) {
  if (texto == null) return null;
  const achado = separarNota(texto).campos.find((c) => c.chave === nome);
  if (!achado) return null;
  const valor = achado.texto.slice(achado.texto.indexOf(':') + 1).trim().replace(/^(["'])(.*)\1$/, '$2');
  return valor || null;
}

/**
 * O que existe no vault mas não é leitura: fatos brutos dos hooks, índices
 * de wikilinks, templates e as instruções dos agentes. Recebe o caminho
 * relativo ao vault.
 */
function foraDaLinhaDoTempo(relativo) {
  const partes = relativo.normalize('NFC').split('/');
  const nome = partes[partes.length - 1];
  return partes[0] === '05 - Registros'
    || partes.includes('.claude')
    || nome === 'CLAUDE.md'
    || nome.startsWith('00 - Índice')
    || nome.startsWith('Template - ');
}

/**
 * Uma página por chave em cada entrada. Dois caminhos podem dar na mesma
 * página: apagar `Visão.md` e criar `Visao.md` é, para quem lê, a mesma
 * página alterada. Os dados vêm da ponta que ainda existe.
 */
function umaPorChave(paginas) {
  const porChave = new Map();
  for (const p of paginas) {
    const ja = porChave.get(p.chave);
    if (!ja) porChave.set(p.chave, p);
    else if (ja.tipo !== p.tipo) porChave.set(p.chave, { ...(ja.tipo === 'removida' ? p : ja), tipo: 'alterada' });
  }
  return [...porChave.values()];
}

/** O `titulo` do frontmatter, o primeiro `# ` do corpo ou o nome do arquivo. */
function tituloDaNota(texto, caminho) {
  const doArquivo = caminho.split('/').pop().replace(/\.md$/, '');
  if (texto == null) return doArquivo;
  const h1 = separarNota(texto).corpo.match(/^#[ \t]+(.+?)[ \t#]*$/m);
  return campo(texto, 'titulo') || (h1 && h1[1]) || doArquivo;
}

/**
 * @param {object} opcoes
 * @param {string} opcoes.repoRaiz raiz do repositório git.
 * @param {string} [opcoes.vault] o caminho do vault no repositório, em POSIX; '' quando
 *   o vault é a própria raiz. O padrão é o `doc-harness` do monorepo.
 * @param {(caminho: string, extra?: {removida?: boolean, tipo?: string|null}) => ({chave: string, titulo: string|null, href: string|null}|null)} opcoes.mapearCaminho
 *   caminho relativo ao repositório → página do site atual, ou null se não for página.
 *   Com `removida`, a página de uma nota que o site não gera mais (o `tipo` é o
 *   do frontmatter dela), ou null se ela nunca foi página.
 * @returns {{dias: object[], tPorChave: Object<string, string>}}
 */
function lerLinhaDoTempo({
  repoRaiz,
  mapearCaminho,
  agora = new Date(),
  desdeDias = 14,
  vault = 'doc-harness',
  extras = ['Bancada/scripts/cbl-dados.json'],
}) {
  const desde = new Date(agora.getTime() - desdeDias * DIA_MS);
  // O git não aceita pathspec vazio: o vault na raiz é o repositório inteiro.
  const caminhos = [vault || '.', ...extras];
  const commits = lerCommits(repoRaiz, desde, caminhos);

  // Borda de clone raso dentro da janela: falta o que veio antes dela, e ela
  // mesma apareceria criando o vault inteiro. Uma linha do tempo pela metade
  // engana mais que nenhuma.
  const borda = bordaDoCloneRaso(repoRaiz);
  const cortado = commits.find((c) => borda.has(c.sha));
  if (cortado) {
    throw new Error(`clone raso: o histórico acaba em ${cortado.sha.slice(0, 7)}, dentro dos últimos ${desdeDias} dias`);
  }

  // As duas pontas de cada nota alterada, pedidas ao git de uma vez só. A
  // ponta de antes é o primeiro pai: num merge, é o `main` antes da fusão.
  const antes = (c, a) => `${c.pais[0]}:${a.de}`;
  const depois = (c, a) => `${c.sha}:${a.para}`;
  const pedidos = [];
  for (const c of commits) {
    for (const a of c.arquivos) {
      if (!a.para.endsWith('.md')) continue;
      // A nota criada também: se ela some depois, dentro da janela, o título
      // e o tipo saem daqui.
      if (a.status === 'A') pedidos.push(depois(c, a));
      if (!c.pais.length) continue;
      if ('MTR'.includes(a.status)) pedidos.push(antes(c, a), depois(c, a));
      else if (a.status === 'D') pedidos.push(antes(c, a));
    }
  }
  const conteudos = lerConteudos(repoRaiz, pedidos);
  const mudouParaQuemLe = (c, a) => {
    const [velho, novo] = [conteudos.get(antes(c, a)), conteudos.get(depois(c, a))];
    if (velho == null || novo == null) return true;
    return assinaturaVisivel(velho) !== assinaturaVisivel(novo);
  };

  /** Caminho relativo ao vault, ou null para o que está fora dele. */
  const prefixo = vault ? `${vault}/` : '';
  const noVault = (caminho) => (caminho.startsWith(prefixo) ? caminho.slice(prefixo.length) : null);
  const excluido = (caminho) => noVault(caminho) != null && foraDaLinhaDoTempo(noVault(caminho));

  // O quadro de tarefas não marca novidade; a mudança de status aparece só
  // aqui, como transição ("T-0011: a-fazer → em-andamento").
  const transicao = (c, a) => {
    const nome = (noVault(a.para) || '').match(/^04 - Tarefas\/(T-\d+)[^/]*\.md$/);
    if (!nome) return null;
    const [velho, novo] = [conteudos.get(antes(c, a)), conteudos.get(depois(c, a))];
    const [de, para] = [campo(velho, 'status'), campo(novo, 'status')];
    if (!para || de === para) return null;
    return { id: campo(novo, 'id') || nome[1], de, para };
  };

  // Os commits vêm do mais novo ao mais antigo, e `destinos` leva o caminho
  // de uma nota ao de hoje, pelas renomeações que vieram depois (null se ela
  // foi apagada depois). É o que põe a edição de 15/09 em `Escopo.md` na
  // página que hoje se chama `Escopo do MVP`.
  const destinos = new Map();
  const destinoDe = (caminho) => (destinos.has(caminho) ? destinos.get(caminho) : caminho);
  const paginaDeHoje = (caminho, conteudo) => {
    const hoje = destinoDe(caminho);
    if (hoje !== null) return mapearCaminho(hoje);
    // Apagada depois: a mudança fica na linha do tempo, sem link.
    const apagada = mapearCaminho(caminho, { removida: true, tipo: campo(conteudo, 'tipo') });
    return apagada && { ...apagada, titulo: apagada.titulo || tituloDaNota(conteudo, caminho), href: null };
  };

  /** As páginas que o commit mudou para quem lê, e as transições de status. */
  const oQueMudou = (c) => {
    const paginas = [];
    const transicoes = [];
    for (const arquivo of c.arquivos) {
      if (excluido(arquivo.para)) continue;
      if (arquivo.status === 'D') {
        // O site atual não gera mais a página: o título sai da nota como era.
        const velho = conteudos.get(antes(c, arquivo));
        const removida = mapearCaminho(arquivo.de, { removida: true, tipo: campo(velho, 'tipo') });
        if (removida) {
          const titulo = removida.titulo || tituloDaNota(velho, arquivo.de);
          paginas.push({ ...removida, titulo, href: null, tipo: 'removida' });
        }
        continue;
      }

      const pagina = paginaDeHoje(arquivo.para, conteudos.get(depois(c, arquivo)));
      if (arquivo.status === 'A') {
        // Nova é a página de uma nota que nasce no vault. Um arquivo de fora
        // dele (o `cbl-dados.json`) passa a alimentar uma página que já existia.
        if (pagina) paginas.push({ ...pagina, tipo: noVault(arquivo.para) != null ? 'nova' : 'alterada' });
        continue;
      }

      // M, T e R: a nota já existia, talvez noutro caminho.
      const t = transicao(c, arquivo);
      if (t) transicoes.push(t);
      if (!pagina) continue;
      const mudou = !arquivo.para.endsWith('.md') || mudouParaQuemLe(c, arquivo);
      if (arquivo.status !== 'R') {
        if (mudou) paginas.push({ ...pagina, tipo: 'alterada' });
        continue;
      }
      // Renomear é mudar a página de endereço: ela conta mesmo com o texto
      // igual, a não ser que o endereço também seja o mesmo (um acento a
      // menos no nome some no slug). Se o caminho antigo nem era página, a
      // página é nova.
      const antiga = excluido(arquivo.de) ? null
        : mapearCaminho(arquivo.de, { removida: true, tipo: campo(conteudos.get(antes(c, arquivo)), 'tipo') });
      if (!mudou && antiga && antiga.chave === pagina.chave) continue;
      paginas.push({ ...pagina, tipo: antiga ? 'alterada' : 'nova' });
    }
    // Para os commits mais antigos, que vêm a seguir.
    for (const a of c.arquivos) {
      if (a.status === 'R') destinos.set(a.de, destinoDe(a.para));
      else if (a.status === 'D') destinos.set(a.de, null);
    }
    return { paginas: umaPorChave(paginas), transicoes };
  };

  const dias = new Map();
  const tPorChave = {};
  for (const c of commits) {
    const { paginas, transicoes } = oQueMudou(c);
    if (!paginas.length && !transicoes.length) continue;
    const cabecalho = cabecalhoDaEntrada(repoRaiz, c, caminhos);
    if (!cabecalho) continue;

    const quando = new Date(c.quando).toISOString();
    const { data, hora } = emBrasilia(new Date(c.quando));
    // `t` de uma página: quando chegou a última mudança de conteúdo dela. ISO
    // em UTC, que compara como texto.
    for (const p of paginas) {
      if (p.tipo === 'removida' || !p.href) continue; // página que não existe mais
      if (!(p.chave in tPorChave) || tPorChave[p.chave] < quando) tPorChave[p.chave] = quando;
    }
    if (!dias.has(data)) {
      const [ano, mes] = data.split('-');
      const diario = mapearCaminho(`${prefixo}02 - Atualizações Diárias/${ano}/${mes}/${data}.md`);
      dias.set(data, { data, rotulo: rotuloDoDia(data), diario: diario ? diario.href : null, entradas: [] });
    }
    const { autores, assunto, merge } = cabecalho;
    dias.get(data).entradas.push({ sha: c.sha.slice(0, 7), quando, hora, autores, assunto, merge, paginas, transicoes });
  }

  // A ordem do primeiro pai é a de chegada, mas a data vem do relógio de cada
  // máquina: um relógio atrasado embaralharia os dias.
  const ordenados = [...dias.values()].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  return { dias: ordenados, tPorChave };
}

module.exports = { lerLinhaDoTempo };
