// O que o build sabe da história de cada página, para o "O que há de novo".
//
// O navegador compara o texto que o leitor já viu com o de agora, e o build
// entrega só o que ele não tem como saber sozinho:
//
// - `h`, o hash do texto de cada documento hoje;
// - `hb`, o hash do mesmo documento 7 dias atrás, e o HTML daquela versão,
//   para quem chega sem ter visitado antes;
// - a linha do tempo dos últimos 14 dias, tirada do git (`historico.js`).
//
// A história sai do repositório git onde o vault mora, que não é,
// necessariamente, o da Bancada: no Mac, o "Gerar site" aponta para o vault
// que a pessoa escolher. No CI é o `doc-harness` do monorepo.
//
// A base de 7 dias é o site de 7 dias atrás, renderizado de novo: o vault
// daquele commit, indexado pelo `bancada-indice`, passa pelo mesmo `Site` de
// hoje. O documento CBL não vem do vault (a prosa mora no `cbl-documento.js`
// e os números no `cbl-dados.json`), então os dois também saem daquele commit,
// quando existem naquele repositório.
//
// Nada aqui derruba o build: sem histórico, sem binário ou com qualquer erro,
// o motivo vai para `avisos` e o site sai sem base, sem linha do tempo ou sem
// as duas.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { escapar } = require('../markdown');
const { lerLinhaDoTempo } = require('./historico');
const { hashDeBlocos } = require('./nucleo');
const { blocosDeHtml } = require('./html');

const DIA_MS = 24 * 60 * 60 * 1000;
const CBL_DOCUMENTO = 'Bancada/scripts/cbl-documento.js';
const CBL_DADOS = 'Bancada/scripts/cbl-dados.json';

// Páginas cuja versão de 7 dias atrás não pode ir ao ar: a correção tirou delas
// um dado pessoal, e a base publicaria o texto antigo de volta (inclusive no
// marca-texto do que saiu). Elas seguem na linha do tempo, só sem a base.
const SEM_BASE = new Set([
  'notas/02-atualizacoes-diarias-2026-09-2026-09-10',
]);

/** O hash do texto de um documento, como o navegador o mede. */
function hashDoConteudo(conteudo) {
  return hashDeBlocos(blocosDeHtml(conteudo));
}

function git(repoRaiz, args) {
  return execFileSync('git', args, { cwd: repoRaiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * Onde o vault mora no git: `{repoRaiz, vaultNoRepo}`, com `vaultNoRepo` em
 * POSIX e relativo à raiz do repositório ('' quando o vault é a própria raiz,
 * 'doc-harness' no monorepo). Lança quando o vault não está num repositório.
 */
function localizarVault(vault) {
  let repoRaiz;
  try {
    repoRaiz = git(vault, ['rev-parse', '--show-toplevel']).trim();
  } catch (e) {
    throw new Error(`o vault não está num repositório git (${vault})`);
  }
  const relativo = path.relative(fs.realpathSync(repoRaiz), fs.realpathSync(vault));
  if (relativo.startsWith('..') || path.isAbsolute(relativo)) {
    throw new Error(`o vault fica fora do repositório ${repoRaiz}`);
  }
  return { repoRaiz, vaultNoRepo: relativo.split(path.sep).join('/') };
}

/** Os caminhos, entre os pedidos, que existem na árvore de `rev` (`-z`: sem aspas). */
function existentesEm(repoRaiz, rev, caminhos) {
  return git(repoRaiz, ['ls-tree', '-z', '--name-only', rev, '--', ...caminhos]).split('\0').filter(Boolean);
}

/** A mensagem que interessa de um erro de processo filho: o stderr, se houver. */
function motivo(erro) {
  const stderr = erro && erro.stderr ? erro.stderr.toString().trim() : '';
  return stderr || (erro && erro.message) || String(erro);
}

/**
 * O `cbl-documento.js` de 7 dias atrás, carregado da árvore extraída. O
 * caminho é novo a cada build, então o `require` não reaproveita o módulo de
 * hoje; o módulo lê o `cbl-dados.json` da própria pasta, que é o antigo.
 * null quando o módulo ainda não existia naquele commit.
 */
function carregarCblAntigo(pasta, carregados) {
  const arquivo = path.join(pasta, CBL_DOCUMENTO);
  if (!fs.existsSync(arquivo)) return null;
  const resolvido = require.resolve(arquivo);
  carregados.push(resolvido);
  return require(resolvido);
}

/**
 * O site de `antesDe` renderizado de novo: `{sha, curto, em, conteudos,
 * temCbl}`, com o `<article>` de cada documento por chave. Lança o motivo quando não
 * dá; quem chama transforma em aviso.
 */
function renderizarBase({ site, repoRaiz, vaultNoRepo, binario, tokens, antesDe, avisos }) {
  const sha = git(repoRaiz, ['rev-list', '-1', '--first-parent', `--before=${antesDe.toISOString()}`, 'HEAD']).trim();
  if (!sha) throw new Error(`nenhum commit antes de ${antesDe.toISOString()} (clone raso ou repositório novo)`);
  const curto = sha.slice(0, 7);
  const em = new Date(git(repoRaiz, ['show', '-s', '--no-show-signature', '--format=%cI', sha]).trim()).toISOString();
  if (!binario) throw new Error('falta o caminho do bancada-indice');
  if (!fs.existsSync(binario)) throw new Error(`o bancada-indice não existe: ${binario}`);

  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'bancada-novidades-base-'));
  const carregados = [];
  try {
    // Só o que existia naquele commit: o `git archive` recusa caminho que não
    // existe. Com o vault na raiz, o repositório inteiro é o vault.
    let caminhos = ['.'];
    if (vaultNoRepo) {
      caminhos = existentesEm(repoRaiz, sha, [vaultNoRepo, CBL_DOCUMENTO, CBL_DADOS]);
      if (!caminhos.includes(vaultNoRepo)) throw new Error(`o vault não existe em ${curto}`);
    }
    // A árvore numa pasta só dela: um vault na raiz não esbarra no tar nem no destino.
    const arvore = path.join(pasta, 'arvore');
    fs.mkdirSync(arvore);
    const tar = path.join(pasta, 'base.tar');
    git(repoRaiz, ['archive', '--format=tar', `--output=${tar}`, sha, '--', ...caminhos]);
    execFileSync('tar', ['-xf', tar, '-C', arvore], { stdio: ['ignore', 'pipe', 'pipe'] });
    fs.rmSync(tar);

    // O binário explícito sobre o vault antigo. Nada de `BANCADA_INDICE_JSON`:
    // ele apontaria para o índice de hoje.
    const vault = path.join(arvore, vaultNoRepo);
    const saida = execFileSync(binario, ['--indice', vault], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    const indice = JSON.parse(saida.toString('utf8'));

    // `site.constructor`, e não um `require('../gerar-site')`: o gerador é quem
    // carrega este módulo, e o `require` de volta seria circular.
    const Site = site.constructor;
    const destino = path.join(pasta, 'site');
    const renderizar = (cbl) => new Site(indice, tokens, vault, destino, false, { cbl }).paginasDeDocumento();
    let cbl = null;
    let documentos = null;
    try {
      cbl = carregarCblAntigo(arvore, carregados);
      if (cbl) documentos = renderizar(cbl);
    } catch (e) {
      // O módulo antigo é código de outra semana, chamado pelo `Site` de hoje.
      // Se não se entendem, perde a base só o CBL, e não o site inteiro. A
      // culpa só é dele se sem ele a base sai; senão, o erro é da base.
      documentos = renderizar(null);
      avisos.push(`documento-cbl sem base: o cbl-documento.js de ${curto} falhou (${motivo(e)})`);
      cbl = null;
    }
    if (!documentos) documentos = renderizar(null);
    const conteudos = new Map(documentos.map((p) => [p.chave, p.conteudo]));
    return { sha, curto, em, conteudos, temCbl: cbl !== null };
  } finally {
    for (const resolvido of carregados) delete require.cache[resolvido];
    fs.rmSync(pasta, { recursive: true, force: true });
  }
}

// Tipos de nota que o gerador nunca publica como página própria (o filtro do
// construtor do `Site` e o de `notasPublicadas()`).
const TIPOS_SEM_PAGINA = new Set(['home', 'indice', 'registro']);

/**
 * O momento, em ISO, do último commit do primeiro pai depois de `sha` que
 * mexeu no código que renderiza as páginas: os `.js` de `Bancada/scripts`, sem
 * as subpastas (testes, estilo, o próprio "O que há de novo"). null sem base,
 * sem commit ou com erro.
 */
function ultimoCommitDoCodigo(repoRaiz, sha) {
  if (!sha) return null;
  try {
    const quando = git(repoRaiz, ['log', '-1', '--first-parent', '--no-show-signature', '--format=%cI', `${sha}..HEAD`, '--', ':(glob)Bancada/scripts/*.js']).trim();
    return quando ? new Date(quando).toISOString() : null;
  } catch {
    return null;
  }
}

/**
 * Caminho do repositório → página do site atual, pelas `fontes` de cada
 * documento. Uma nota apagada não está mais no site: a chave dela sai da
 * mesma regra de slug do gerador, sem título nem endereço. Não vira página
 * removida o que nunca foi página: a home, os índices, os registros e as
 * notas do documento CBL, cuja página é a capa e segue no ar.
 */
function mapeadorDoSite(site, documentos, vaultNoRepo) {
  const prefixo = vaultNoRepo ? `${vaultNoRepo}/` : '';
  const porFonte = new Map();
  for (const d of documentos) {
    for (const fonte of d.fontes || []) {
      porFonte.set(fonte.normalize('NFC'), { chave: d.chave, titulo: d.titulo, href: d.arquivo });
    }
  }
  return (caminho, { removida = false, tipo = null } = {}) => {
    const pagina = porFonte.get(caminho.normalize('NFC'));
    if (pagina || !removida) return pagina || null;
    if (!caminho.startsWith(prefixo) || !caminho.endsWith('.md')) return null;
    const relativo = caminho.slice(prefixo.length);
    if (TIPOS_SEM_PAGINA.has(tipo) || site.ehDocumentoCBL({ caminho: relativo })) return null;
    return { chave: site.chaveDoArquivo(site.arquivoDaNota(relativo)), titulo: null, href: null };
  };
}

/**
 * O repositório vem do vault (`site.vault`), e não de quem chama: o `repoRaiz`
 * que o gerador passa só diz que a história deve rodar.
 *
 * @param {object} opcoes
 * @param {object} opcoes.site o `Site` de hoje, com `vault` e `paginasDeDocumento()`.
 * @param {string} opcoes.binario o `bancada-indice` que indexa o vault antigo.
 * @param {object} opcoes.tokens o `tokens.json`, que o `Site` da base também recebe.
 * @param {Date} [opcoes.agora] o momento do build.
 * @param {Set<string>} [opcoes.semBase] chaves que nunca ganham base (ver `SEM_BASE`).
 * @returns {{paginas: object, base: {sha: string, em: string}|null, basesHtml: object, linhaDoTempo: {dias: object[]}|null, avisos: string[]}}
 */
function construirNovidades({
  site,
  binario,
  tokens,
  agora = new Date(),
  semBase = SEM_BASE,
  desdeDias = 14,
  janelaBaseDias = 7,
}) {
  const avisos = [];
  const documentos = site.paginasDeDocumento();
  const paginas = {};
  for (const d of documentos) {
    paginas[d.chave] = { h: hashDoConteudo(d.conteudo), hb: null, temBase: false, nova: false, t: null };
  }

  let onde;
  try {
    onde = localizarVault(site.vault);
  } catch (e) {
    avisos.push(`sem histórico: ${motivo(e)}`);
    return { paginas, base: null, basesHtml: {}, linhaDoTempo: null, avisos };
  }
  const { repoRaiz, vaultNoRepo } = onde;

  let base = null;
  let shaDaBase = null;
  const basesHtml = {};
  try {
    const antesDe = new Date(agora.getTime() - janelaBaseDias * DIA_MS);
    const renderizada = renderizarBase({ site, repoRaiz, vaultNoRepo, binario, tokens, antesDe, avisos });
    base = { sha: renderizada.curto, em: renderizada.em };
    shaDaBase = renderizada.sha;
    for (const [chave, p] of Object.entries(paginas)) {
      const conteudo = renderizada.conteudos.get(chave);
      if (conteudo === undefined) {
        // Fora da base é página nova, menos o CBL sem o módulo antigo: não há
        // como saber o CBL de antes, e ele só fica sem base até o módulo
        // completar 7 dias.
        p.nova = chave !== 'documento-cbl' || renderizada.temCbl;
        continue;
      }
      if (semBase.has(chave)) continue;
      p.hb = hashDoConteudo(conteudo);
      p.temBase = p.hb != null && p.hb !== p.h;
      if (p.temBase) {
        basesHtml[chave] = `<div data-novidades-base data-novidades-chave="${escapar(chave)}" `
          + `data-novidades-em="${escapar(base.em)}">${conteudo}</div>`;
      }
    }
  } catch (e) {
    avisos.push(`sem a base de ${janelaBaseDias} dias: ${motivo(e)}`);
  }

  // null quando não deu para ler: a página Novidades diz "não está
  // disponível", e não "nada mudou" (que é `{dias: []}`).
  let linhaDoTempo = null;
  let tPorChave = {};
  try {
    // O `cbl-dados.json` só entra se existir neste repositório: num vault de
    // fora do monorepo, o caminho nem faz sentido.
    const extras = existentesEm(repoRaiz, 'HEAD', [CBL_DADOS]);
    const lida = lerLinhaDoTempo({
      repoRaiz, vault: vaultNoRepo, extras, agora, desdeDias,
      mapearCaminho: mapeadorDoSite(site, documentos, vaultNoRepo),
    });
    linhaDoTempo = { dias: lida.dias };
    tPorChave = lida.tPorChave;
  } catch (e) {
    avisos.push(`sem a linha do tempo: ${motivo(e)}`);
  }

  // `t`: quando a última mudança de conteúdo chegou. Mudou e a linha do tempo
  // não sabe quando? Então quem mudou o texto foi o código que renderiza (a
  // prosa do CBL mora no `cbl-documento.js`), e vale o último commit dele
  // depois da base: fixo de um build para o outro. Só sem commit que explique
  // (uma edição local) vale o momento do build, o mesmo `gerado` do manifesto.
  const geradoEm = new Date(site.indice ? site.indice.geradoEm : NaN);
  const gerado = (Number.isNaN(geradoEm.getTime()) ? agora : geradoEm).toISOString();
  let doCodigo;
  const quandoMudouOCodigo = () => {
    if (doCodigo === undefined) doCodigo = ultimoCommitDoCodigo(repoRaiz, shaDaBase);
    return doCodigo;
  };
  for (const [chave, p] of Object.entries(paginas)) {
    p.t = tPorChave[chave] || (p.temBase || p.nova ? quandoMudouOCodigo() || gerado : null);
  }

  return { paginas, base, basesHtml, linhaDoTempo, avisos };
}

module.exports = { construirNovidades, localizarVault, SEM_BASE };
