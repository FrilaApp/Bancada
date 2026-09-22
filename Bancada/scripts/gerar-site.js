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
const { renderizarDocumentoCBL } = require('./cbl-documento');

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
  avisarSobreTiposNaoPublicados(indice);
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
  const candidatos = [
    process.env.BANCADA_BIN ? path.resolve(process.env.BANCADA_BIN) : null,
    path.join(RAIZ_PROJETO, '.build/release/bancada-indice'),
    path.join(RAIZ_PROJETO, '..', '.build/release/bancada-indice'),
    path.join(RAIZ_PROJETO, 'Bancada'),
  ].filter(Boolean);
  const binario = candidatos.find((c) => fs.existsSync(c));
  if (!binario) {
    console.error(process.env.BANCADA_BIN
      ? `✗ BANCADA_BIN aponta para um binário que não existe: ${process.env.BANCADA_BIN}`
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

// Ordem de leitura essencial: Produto primeiro, seguido pela arquitetura técnica,
// planejamento do ciclo, registro diário e sistema de design.
const SECOES = [
  { id: 'produto',      titulo: 'Produto',      tipos: ['documento-produto', 'documento-derivado'] },
  { id: 'arquitetura',  titulo: 'Arquitetura',  tipos: ['arquitetura'] },
  { id: 'planejamento', titulo: 'Planejamento', tipos: ['agenda', 'roadmap'] },
  { id: 'diario',       titulo: 'Diário',       tipos: ['atualizacao-diaria'] },
  { id: 'design',       titulo: 'Design',       tipos: ['design'] },
];

/// Avisa quando um tipo de nota existe no vault mas não chega ao site.
function avisarSobreTiposNaoPublicados(indice) {
  // Tipos que não entram em SECOES por decisão, e não por esquecimento.
  const tratadosEmOutroLugar = new Set([
    'tarefa',      // tem página própria (tarefas.html)
    'registro',    // idem (registros.html)
    'indice',      // listas de wikilinks que só fazem sentido no Obsidian
    'home',        // a capa do site cumpre esse papel
    'cbl-desafio', // a capa do site cumpre esse papel (Desafio na navbar / index.html)
  ]);

  const publicados = new Set(SECOES.flatMap((s) => s.tipos));
  const orfaos = [...new Set(indice.notas.map((n) => n.tipo))]
    .filter((t) => !publicados.has(t) && !tratadosEmOutroLugar.has(t));

  if (!orfaos.length) return;

  console.warn(`\n⚠︎  ${orfaos.length} tipo(s) de nota fora do site:`);
  for (const tipo of orfaos) {
    const quantas = indice.notas.filter((n) => n.tipo === tipo).length;
    console.warn(`      ${tipo} — ${quantas} nota(s) não publicada(s)`);
  }
  console.warn('    Acrescente em SECOES, ou em `tratadosEmOutroLugar` se for de propósito.\n');
}

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

    const jaEscritas = new Set();
    for (const secao of SECOES) {
      for (const nota of this.notasDaSecao(secao)) {
        this.escrever(this.arquivoDaNota(nota.caminho), this.paginaDeNota(nota, secao));
        jaEscritas.add(nota.caminho);
      }
    }

    // Gera todas as notas restantes do vault para garantir integridade de wikilinks
    for (const nota of this.notas) {
      if (['tarefa', 'registro', 'indice', 'home'].includes(nota.tipo) || jaEscritas.has(nota.caminho)) continue;
      this.escrever(this.arquivoDaNota(nota.caminho), this.paginaDeNota(nota, { titulo: '' }));
    }

    for (const nota of this.notasDe('tarefa')) {
      this.escrever(this.arquivoDaNota(nota.caminho), this.paginaDeNota(nota, { titulo: 'Tarefas' }));
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

  notasDaSecao(secao) {
    let notas = this.notas.filter((n) => secao.tipos.includes(n.tipo));
    if (secao.id === 'produto') {
      // Exclui CBL_C18 porque ele é o documento do desafio na capa
      notas = notas.filter((n) => !n.caminho.includes('CBL_C18'));
    }
    if (secao.id === 'design') {
      // Exclui anexos internos de revisão para manter a barra lateral limpa
      notas = notas.filter((n) => !n.caminho.toLowerCase().includes('anexos/'));
    }
    if (secao.id === 'diario') {
      return notas.sort((a, b) => (b.campos.data || '').localeCompare(a.campos.data || ''));
    }
    if (secao.id === 'planejamento') {
      return notas.sort((a, b) => {
        if (a.tipo === 'agenda') return -1;
        if (b.tipo === 'agenda') return 1;
        return a.titulo.localeCompare(b.titulo, 'pt-BR');
      });
    }
    if (secao.id === 'produto') {
      const ordem = [
        'visao',
        'requisitos',
        'especificacao',
        'historias',
        'problema',
        'negocio',
        'mercado',
        'validacao',
        'evidencias',
        'leia-primeiro',
        'readme',
      ];
      const pontuacao = (nota) => {
        const slug = nota.caminho.toLowerCase();
        for (let i = 0; i < ordem.length; i++) {
          if (slug.includes(ordem[i])) return i;
        }
        return 99;
      };
      return notas.sort((a, b) => {
        const pA = pontuacao(a);
        const pB = pontuacao(b);
        if (pA !== pB) return pA - pB;
        return a.titulo.localeCompare(b.titulo, 'pt-BR');
      });
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

  limparRotuloSidebar(rotulo, tipo) {
    let s = rotulo.replace(/^[\p{Extended_Pictographic}\u200d\ufe0f]+\s*/u, '').trim();

    // Se for data diária ISO (2026-09-18), exibe legível sem hífens: 18 set 2026
    if (tipo === 'atualizacao-diaria' || /^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const partes = s.split('-');
      if (partes.length === 3) {
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const dia = parseInt(partes[2], 10);
        const mes = meses[parseInt(partes[1], 10) - 1];
        return `${dia} ${mes} ${partes[0]}`;
      }
    }

    // Documentos derivados específicos: títulos limpos e humanos
    if (tipo === 'documento-derivado') {
      if (s === 'CBL_C18') return 'Documento Oficial CBL';
      if (s === 'Frila_Documento_de_Requisitos') return 'Documento de Requisitos';
      if (s === 'Frila_Documento_de_Visao') return 'Documento de Visão';
      s = s.replace(/^Frila_/i, '').replace(/_/g, ' ');
    }

    // Seção Design: remover prefixos repetitivos e formatar datas
    if (tipo === 'design') {
      if (/^Revisão profunda de UI\s*[·—–-]\s*\d{4}-\d{2}-\d{2}/i.test(s)) {
        const matchData = s.match(/\d{4}-\d{2}-\d{2}/);
        if (matchData) {
          const [ano, mes, dia] = matchData[0].split('-');
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          return `Revisão profunda (${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]})`;
        }
      }
      if (/^Revisão de UI da Bancada\s*[·—–-]\s*\d{4}-\d{2}-\d{2}/i.test(s)) {
        const matchData = s.match(/\d{4}-\d{2}-\d{2}/);
        if (matchData) {
          const [ano, mes, dia] = matchData[0].split('-');
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          return `Revisão da Bancada (${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]})`;
        }
      }
      s = s.replace(/^Revisão profunda de UI\s*[·—–-]\s*/i, '');
    }

    // Remove prefixos redundantes com travessão, hífen ou ponto
    s = s.replace(/^(Frila|C18|Roadmap)\s*[·—–-]\s*/i, '');

    // Remove sufixos redundantes com travessão, hífen ou ponto
    s = s.replace(/\s*[·—–-]\s*(Frila|C18)$/i, '');

    // Simplificações limpas sem travessões banais
    if (s === 'Challenge 18' || s === 'C18') return 'Challenge 18';
    if (s === 'Agenda') return 'Agenda C18';
    if (s === 'Frila') return 'Visão geral';
    if (s.startsWith('Roteiro e Protocolo de Validação de Campo')) return 'Validação de Campo no DF';
    if (s.startsWith('Histórias de Usuário e Backlog')) return 'Histórias de Usuário e Backlog';
    if (s.startsWith('Pendências Técnicas')) return 'Pendências Técnicas';
    if (s === 'Roadmap - Sumário de Iterações' || s === 'Sumário de Iterações') return 'Sumário de Iterações';

    // Substitui travessão ou hífen banal solto por ponto central elegante
    s = s.replace(/\s+[—–-]\s+/g, ' · ');

    return s.trim();
  }

  limparTitulo(titulo, tipo = '', nota = null) {
    let t = String(titulo || '').replace(/^[\p{Extended_Pictographic}\u200d\ufe0f]+\s*/u, '').trim();
    if (t === 'C18 — Challenge 18' || t === 'C18 - Challenge 18' || t === 'C18') {
      return 'Challenge 18';
    }

    const mapaTitulos = {
      'Frila_Documento_de_Requisitos': 'Documento de Requisitos de Software',
      'Frila_Documento_de_Visao': 'Documento de Visão do Produto',
      'Frila_Historias_de_Usuario_e_Backlog': 'Histórias de Usuário e Backlog do Produto',
      'Frila_Roteiro_de_Validacao_de_Campo': 'Roteiro de Validação de Campo no DF',
      '00-LEIA-PRIMEIRO': 'Leia Primeiro — Guia de Leitura',
      '01-O-PROBLEMA': 'O Problema',
      '02-O-NEGOCIO': 'O Negócio e Monetização',
      '03-ESPECIFICACAO-DO-PRODUTO': 'Especificação do Produto',
      '04-MERCADO-E-CONCORRENCIA': 'Mercado e Análise de Concorrência',
      'EVIDENCIAS': 'Evidências e Pesquisa de Campo',
      'Agenda - C18': 'Agenda Oficial — Challenge 18',
      'Roadmap - Sumário de Iterações': 'Sumário de Iterações e Roadmap',
      'Diagrama de Arquitetura': 'Diagrama de Arquitetura do Sistema',
      'Diagrama de Casos de Uso': 'Diagrama de Casos de Uso',
      'Diagrama de Classe': 'Diagrama de Classes',
      'Modelagem de Banco de Dados': 'Modelagem e Esquema de Banco de Dados',
      'Pendências Técnicas Para Codar': 'Pendências Técnicas e Débito de Engenharia',
      'Sistema de Design': 'Sistema de Design da Bancada',
    };

    if (mapaTitulos[t]) return mapaTitulos[t];

    if (tipo === 'atualizacao-diaria' || (nota && nota.tipo === 'atualizacao-diaria')) {
      const d = (nota && nota.campos && nota.campos.data) || t;
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(d))) {
        const [ano, mes, dia] = String(d).split('-');
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${ano}`;
      }
    }

    t = t.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, ano, mes, dia) => {
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${ano}`;
    });

    if (nota && nota.campos && nota.campos.titulo && !nota.campos.titulo.includes('_')) {
      t = nota.campos.titulo;
    }

    t = t.replace(/^Frila_/i, '');
    t = t.replace(/^\d{1,3}[\s\-_]+/i, '');
    t = t.replace(/_/g, ' ');

    t = t.replace(/^(T-\d+)\s*[-—–]\s*/i, '$1 · ');
    t = t.replace(/\s+[—–-]\s+/g, ' · ');
    return t.trim();
  }

  renderizarMastheadNota(nota, secao, base, corpoMarkdown, tituloLimpo) {
    const campos = nota.campos || {};

    let eyebrowSecao = (secao && secao.titulo) ? secao.titulo.toUpperCase() : 'DOCUMENTO';
    let eyebrowSub = 'CHALLENGE 18';

    if (secao && secao.id === 'produto') {
      eyebrowSub = 'FRILA';
    } else if (secao && secao.id === 'arquitetura') {
      eyebrowSub = 'ARQUITETURA DO SISTEMA';
    } else if (secao && secao.id === 'planejamento') {
      eyebrowSub = 'CBL C18';
    } else if (secao && secao.id === 'diario') {
      eyebrowSub = 'DIÁRIO DE BORDO';
    } else if (secao && secao.id === 'design') {
      eyebrowSub = 'SISTEMA DE DESIGN';
    } else if (nota.tipo === 'tarefa') {
      eyebrowSecao = 'TAREFA';
      eyebrowSub = campos.id || 'C18';
    }

    const eyebrowHtml = `<span class="cbl-eyebrow-item">${escapar(eyebrowSecao)}</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">${escapar(eyebrowSub)}</span>`;

    let linkOriginalHtml = '';
    const origemRel = campos.origem || '';
    if (origemRel) {
      const nomeArquivo = path.basename(origemRel);
      const ext = path.extname(nomeArquivo).toLowerCase();
      let rotuloExt = ext.replace('.', '').toUpperCase();
      if (rotuloExt === 'DOCX') rotuloExt = 'DOCX Original';
      else if (rotuloExt === 'PAGES') rotuloExt = 'Pages Original';
      else if (rotuloExt === 'PDF') rotuloExt = 'PDF Original';
      else rotuloExt = `${rotuloExt} Original`;

      let caminhoMidia = `${base}midia/${origemRel.replace(/^doc-harness\//, '')}`;
      if (ext === '.pages' || ext === '.docx') {
        const pdfEquivalente = origemRel.replace(/^doc-harness\//, '').replace(/\.(pages|docx)$/, '.pdf');
        const pdfAlvoFisico = path.join(this.destino, 'midia', pdfEquivalente);
        if (fs.existsSync(pdfAlvoFisico)) {
          caminhoMidia = `${base}midia/${pdfEquivalente}`;
          rotuloExt = 'PDF Original';
        }
      }

      linkOriginalHtml = `
        <a href="${caminhoMidia}" class="cbl-masthead-pdf" download="${path.basename(caminhoMidia)}" title="Baixar arquivo original">
          <span>${rotuloExt}</span>
          <span class="cbl-seta" aria-hidden="true">↗</span>
        </a>
      `;
    }

    let lead = campos.subtitulo || campos.descricao || campos.resumo || '';
    if (!lead) {
      const mapaLeads = {
        'Documento de Requisitos': 'Especificação técnica formal de requisitos funcionais, não funcionais e regras de negócio do produto Frila.',
        'Documento de Requisitos de Software': 'Especificação técnica formal de requisitos funcionais, não funcionais e regras de negócio do produto Frila.',
        'Documento de Visão': 'Visão estratégica, posicionamento de mercado, personas e proposta de valor do produto Frila.',
        'Documento de Visão do Produto': 'Visão estratégica, posicionamento de mercado, personas e proposta de valor do produto Frila.',
        'Histórias de Usuário e Backlog': 'Tradução funcional dos requisitos em Histórias de Usuário (INVEST / BDD) priorizadas via MoSCoW.',
        'Histórias de Usuário e Backlog do Produto': 'Tradução funcional dos requisitos em Histórias de Usuário (INVEST / BDD) priorizadas via MoSCoW.',
        'O Problema': 'Pesquisa empírica e síntese de dados sobre os gargalos de contratação de freelancers no food service e eventos.',
        'O Negócio e Monetização': 'Tese de valor, modelo de sustentabilidade e estratégia de monetização do Frila.',
        'Especificação do Produto': 'Definição de escopo do MVP, jornadas de contratante e profissional e funcionalidades essenciais.',
        'Mercado e Análise de Concorrência': 'Benchmarking e mapeamento de concorrentes diretos e indiretos de contratação avulsa.',
        'Evidências e Pesquisa de Campo': 'Compilação de evidências públicas, dados setoriais e validações com o mercado do DF.',
        'Roteiro de Validação de Campo no DF': 'Protocolo de entrevistas presenciais e validação empírica com estabelecimentos do DF.',
        'Leia Primeiro — Guia de Leitura': 'Roteiro de leitura crítica e ordem recomendada para navegação nos documentos do produto.',
        'Diagrama de Arquitetura do Sistema': 'Arquitetura técnica, serviços em nuvem e fluxos de dados do aplicativo Frila.',
        'Diagrama de Casos de Uso': 'Mapeamento de atores, interações e fluxos operacionais de contratantes e profissionais.',
        'Diagrama de Classes': 'Modelagem conceitual de domínio e relacionamentos de entidades em código.',
        'Modelagem e Esquema de Banco de Dados': 'Estrutura relacional de tabelas, índices e integridade referencial do sistema.',
        'Pendências Técnicas e Débito de Engenharia': 'Mapeamento de decisões de arquitetura e itens técnicos a codar.',
        'Sistema de Design da Bancada': 'Especificação de design tokens, grid, tipografia e componentes canônicos da Bancada.',
      };
      lead = mapaLeads[tituloLimpo] || '';
    }

    if (!lead && corpoMarkdown) {
      const matchParagrafo = corpoMarkdown.match(/(?:^|\n\n)([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ][^\n#|]{40,250}\.)(?:\n|$)/);
      if (matchParagrafo) {
        lead = matchParagrafo[1].replace(/\*\*|\*/g, '').trim();
      }
    }

    const mapaNomes = {
      'cauecarneiroc': 'Cauê Carneiro',
      'fbtostadev': 'Fabrício Tosta',
      'joaopaulo': 'João Paulo',
      'juliaclovandi': 'Júlia Clovandi',
      'matheussilva': 'Matheus Silva',
    };

    const normalizarPessoas = (val) => {
      if (!val) return '';
      const arr = Array.isArray(val) ? val : String(val).replace(/^\[|\]$/g, '').split(',');
      const nomes = arr.map((p) => {
        const limpo = String(p).trim().replace(/<[^>]+>/g, '').trim();
        return mapaNomes[limpo.toLowerCase()] || limpo;
      }).filter(Boolean);
      return nomes.join(', ');
    };

    const formatarDataHumana = (d) => {
      if (!d) return '';
      const s = String(d).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const [ano, mes, dia] = s.slice(0, 10).split('-');
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${ano}`;
      }
      return s;
    };

    const itensColofao = [];

    let autoresFormatados = '';
    if (campos.autor || campos.autores) {
      autoresFormatados = normalizarPessoas(campos.autor || campos.autores);
    } else if (campos.responsavel && nota.tipo === 'tarefa') {
      autoresFormatados = normalizarPessoas(campos.responsavel);
    } else {
      autoresFormatados = 'Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva';
    }

    const rotuloAutores = (campos.responsavel && nota.tipo === 'tarefa') ? 'Responsável' : 'Equipe BlendOps';
    itensColofao.push(`
      <div class="cbl-colofao-item">
        <span class="cbl-colofao-rotulo">${rotuloAutores}</span>
        <div class="cbl-colofao-valor">${escapar(autoresFormatados)}</div>
      </div>
    `);

    const dataVal = campos.data || campos.data_criacao || campos.exportado_em;
    if (dataVal) {
      itensColofao.push(`
        <div class="cbl-colofao-item">
          <span class="cbl-colofao-rotulo">Data</span>
          <div class="cbl-colofao-valor"><time>${escapar(formatarDataHumana(dataVal))}</time></div>
        </div>
      `);
    } else {
      itensColofao.push(`
        <div class="cbl-colofao-item">
          <span class="cbl-colofao-rotulo">Ciclo</span>
          <div class="cbl-colofao-valor"><time datetime="2026-09-08">08/09/2026</time> — <time datetime="2026-12-04">04/12/2026</time></div>
        </div>
      `);
    }

    let versao = campos.versao || '';
    if (!versao && corpoMarkdown) {
      const versoes = [...corpoMarkdown.matchAll(/\b(v\d+\.\d+(?:\.\d+)?)\b/g)].map((m) => m[1]);
      if (versoes.length > 0) {
        versao = versoes.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
      }
    }
    if (versao) {
      itensColofao.push(`
        <div class="cbl-colofao-item">
          <span class="cbl-colofao-rotulo">Versão</span>
          <div class="cbl-colofao-valor">${escapar(versao)}</div>
        </div>
      `);
    }

    if (campos.status) {
      const rotulosStatus = {
        'a-fazer': 'A fazer',
        'em-andamento': 'Em andamento',
        revisao: 'Revisão',
        concluida: 'Concluída',
        ativo: 'Ativo',
        aprovado: 'Aprovado',
      };
      const rotStatus = rotulosStatus[campos.status] || campos.status;
      itensColofao.push(`
        <div class="cbl-colofao-item">
          <span class="cbl-colofao-rotulo">Status</span>
          <div class="cbl-colofao-valor">
            <span class="etiqueta status-${escapar(campos.status)}"><span class="status-ponto"></span>${escapar(rotStatus)}</span>
          </div>
        </div>
      `);
    }

    itensColofao.push(`
      <div class="cbl-colofao-item">
        <span class="cbl-colofao-rotulo">Contexto</span>
        <div class="cbl-colofao-valor">Frila<span class="cbl-ponto-sep" aria-hidden="true"></span>Challenge 18 (Apple Developer Academy)</div>
      </div>
    `);

    if (nota.somenteLeitura || campos.conversao || campos.hash_origem) {
      const hashCurto = campos.hash_origem ? campos.hash_origem.slice(0, 8) : 'sync';
      let autorOuOrigem = 'Conversão automática';
      if (campos.exportado_por) {
        autorOuOrigem = normalizarPessoas(campos.exportado_por);
      }
      itensColofao.push(`
        <div class="cbl-colofao-item">
          <span class="cbl-colofao-rotulo">Auditoria</span>
          <div class="cbl-colofao-valor cbl-colofao-auditoria">
            <span class="cbl-colofao-autor">${escapar(autorOuOrigem)}</span><span class="cbl-ponto-sep" aria-hidden="true"></span><code class="cbl-colofao-hash">${escapar(hashCurto)}</code>
          </div>
        </div>
      `);
    }

    const secoesAncoras = [];
    if (/^Histórico de Versões/m.test(corpoMarkdown)) {
      secoesAncoras.push({ titulo: 'Histórico de Versões', id: 'historico-de-versoes' });
    }
    if (/^Glossário/m.test(corpoMarkdown)) {
      secoesAncoras.push({ titulo: 'Glossário', id: 'glossario' });
    }

    const reSecao = /^(?:##\s+|(\d+)\.\s+)([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ][^\n#|.!?:]{2,55})$/gm;
    let matchSecao;
    while ((matchSecao = reSecao.exec(corpoMarkdown)) !== null) {
      const tit = matchSecao[0].replace(/^##\s+/, '').trim();
      if (!/^(ESPECIFICAÇÃO|DOCUMENTO DE VISÃO|PROJETO|VISÃO DO PRODUTO)/i.test(tit)) {
        const id = tit.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!secoesAncoras.some((s) => s.id === id)) {
          secoesAncoras.push({ titulo: tit, id });
        }
      }
      if (secoesAncoras.length >= 8) break;
    }

    let navAncorasHtml = '';
    if (secoesAncoras.length >= 2) {
      const linksAncoras = secoesAncoras.map((s, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const titCurto = s.titulo.length > 25 ? s.titulo.slice(0, 24) + '…' : s.titulo;
        return `<a href="#${s.id}" class="cbl-link-ancora"><span class="cbl-ancora-num">${num}</span> ${escapar(titCurto)}</a>`;
      }).join('<span class="cbl-ancora-sep">/</span>');

      navAncorasHtml = `
        <nav class="cbl-nav-ancoras" aria-label="Navegação rápida pelas seções">
          <span class="cbl-nav-legenda">Seções</span>
          ${linksAncoras}
        </nav>
      `;
    }

    return `
      <header class="cbl-masthead-doc">
        <div class="cbl-masthead-eyebrow">
          <span class="cbl-masthead-rotulo">${eyebrowHtml}</span>
          ${linkOriginalHtml}
        </div>

        <h1 class="cbl-masthead-titulo">${escapar(tituloLimpo)}</h1>
        ${lead ? `<p class="cbl-masthead-lead">${escapar(lead)}</p>` : ''}

        <div class="cbl-colofao">
          ${itensColofao.join('')}
        </div>

        ${navAncorasHtml}
      </header>
    `;
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

  pagina({ titulo, subtitulo, corpo, ativo, daPasta, semConteudoTopo = false }) {
    const base = daPasta === 'notas' ? '../' : '';
    const nav = [
      ['index.html', 'Desafio'],
      ['tarefas.html', 'Tarefas'],
      ['registros.html', 'Registros'],
      ['galeria.html', 'Galeria'],
    ]
      .map(([href, rotulo]) => {
        const isDesafio = href === 'index.html' && (ativo === 'index.html' || (ativo && (ativo.includes('cbl-c18') || ativo.includes('C18') || ativo.includes('cbl-desafio'))));
        const classe = (ativo === href || isDesafio) ? ' class="ativo"' : '';
        return `<a href="${base}${href}"${classe}>${rotulo}</a>`;
      })
      .join('');

    const secoes = SECOES.map((s) => {
      const notas = this.notasDaSecao(s);
      if (!notas.length) return '';
      const temAtivo = notas.some((n) => ativo === this.arquivoDaNota(n.caminho));
      const itens = notas
        .map((n) => {
          const href = base + this.arquivoDaNota(n.caminho);
          const classe = ativo === this.arquivoDaNota(n.caminho) ? ' class="ativo"' : '';
          const rotulo = n.tipo === 'atualizacao-diaria' ? (n.campos.data || n.titulo) : n.titulo;
          const rotuloLimpo = this.limparRotuloSidebar(rotulo, n.tipo);
          return `<li><a href="${href}"${classe}><span>${escapar(rotuloLimpo)}</span></a></li>`;
        })
        .join('');
      return `<details class="grupo" open data-secao="${s.id}">
        <summary class="grupo-titulo">
          <svg class="chevron" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 4 4 4-4 4"/></svg>
          <span class="grupo-rotulo">${s.titulo}</span>
        </summary>
        <ul>${itens}</ul>
      </details>`;
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${base}estilo.css">
<script>
(function() {
  var salvo = localStorage.getItem('bancada_theme');
  var prefereDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var tema = salvo || (prefereDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', tema);
})();
</script>
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header>
  <div class="marca-container">
    <button type="button" class="btn-sidebar-toggle" id="btn-sidebar-toggle" aria-label="Recolher barra lateral" title="Recolher barra lateral (⌘B)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
    </button>
    <a class="marca" href="${base}index.html">
      <span class="marca-simbolo">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
      </span>
      <span>Challenge 18</span>
    </a>
  </div>
  <nav>${nav}</nav>
  <div class="header-direita">
    <button type="button" class="btn-tema" id="btn-tema" aria-label="Alternar modo claro/escuro" title="Alternar modo claro/escuro">
      <svg class="icone-sol" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      <svg class="icone-lua" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    </button>
    <div class="header-status">
      <span class="status-pulsar"></span>
      <span class="status-texto">Live</span>
    </div>
  </div>
</header>
<div class="colunas">
  <aside>
    <div class="sidebar-inner">${secoes}</div>
  </aside>
  <main id="conteudo" tabindex="-1">
    ${semConteudoTopo ? '' : `
    <div class="conteudo-topo">
      <h1>${escapar(titulo)}</h1>
      ${subtitulo ? `<p class="subtitulo">${escapar(subtitulo)}</p>` : ''}
    </div>`}
    ${corpo}
  </main>
</div>
<footer>
  <div class="footer-inner">
    <span>Gerado a partir do vault <code>doc-harness</code> em ${escapar(geradoEm)}.</span>
    <span>A narrativa deste registro é escrita a partir de fatos automáticos.</span>
  </div>
</footer>
${this.avisoDeAtualizacao(base)}
<script>
(function() {
  var chave = 'bancada_sidebar_colapso';
  var estado = {};
  try { estado = JSON.parse(localStorage.getItem(chave) || '{}'); } catch(e) {}
  document.querySelectorAll('aside details.grupo[data-secao]').forEach(function(d) {
    var secao = d.dataset.secao;
    var temAtivo = d.querySelector('a.ativo') !== null;
    if (temAtivo) {
      d.open = true;
    } else if (estado[secao] === false) {
      d.open = false;
    }
    d.addEventListener('toggle', function() {
      if (!d.querySelector('a.ativo')) {
        estado[secao] = d.open;
        try { localStorage.setItem(chave, JSON.stringify(estado)); } catch(e) {}
      }
    });
  });

  var btnTema = document.getElementById('btn-tema');
  if (btnTema) {
    function atualizarBotao(t) {
      var rotulo = btnTema.querySelector('.btn-tema-rotulo');
      if (rotulo) rotulo.textContent = t === 'light' ? 'Escuro' : 'Claro';
      btnTema.setAttribute('aria-label', t === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
      btnTema.setAttribute('title', t === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
    }
    var atual = document.documentElement.getAttribute('data-theme') || 'dark';
    atualizarBotao(atual);
    btnTema.addEventListener('click', function() {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      var proximo = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', proximo);
      try { localStorage.setItem('bancada_theme', proximo); } catch(e) {}
      atualizarBotao(proximo);
    });
  }

  // Alternância e Recolhimento da Barra Lateral para a Margem
  var btnSidebar = document.getElementById('btn-sidebar-toggle');
  if (btnSidebar) {
    var recolhida = localStorage.getItem('bancada_sidebar_recolhida') === 'true';
    if (recolhida) {
      document.body.classList.add('sidebar-colapsada');
      btnSidebar.setAttribute('aria-label', 'Expandir barra lateral');
      btnSidebar.setAttribute('title', 'Expandir barra lateral (⌘B)');
    }
    function alternarSidebar() {
      var ativa = document.body.classList.toggle('sidebar-colapsada');
      try { localStorage.setItem('bancada_sidebar_recolhida', String(ativa)); } catch(e) {}
      btnSidebar.setAttribute('aria-label', ativa ? 'Expandir barra lateral' : 'Recolher barra lateral');
      btnSidebar.setAttribute('title', (ativa ? 'Expandir barra lateral' : 'Recolher barra lateral') + ' (⌘B)');
    }
    btnSidebar.addEventListener('click', alternarSidebar);
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          alternarSidebar();
        }
      }
    });
  }

  // Offset Dinâmico para Scroll no Documento CBL (Modo Zen)
  var docCBL = document.querySelector('.cbl-documento');
  if (docCBL) {
    var ultimoScroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
    var ticking = false;
    var LIMIAR_TOPO = 60;
    var DELTA_MIN = 8;
    var navegandoPorAncora = false;
    var timeoutAncora = null;

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href*="#"]');
      if (link) {
        var href = link.getAttribute('href');
        if (href && (href.startsWith('#') || href.includes('#'))) {
          navegandoPorAncora = true;
          clearTimeout(timeoutAncora);
          timeoutAncora = setTimeout(function() {
            navegandoPorAncora = false;
            ultimoScroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
          }, 800);
        }
      }
    }, { passive: true });

    function atualizarHUD() {
      var atualScroll = Math.max(0, window.scrollY || window.pageYOffset || 0);
      var delta = atualScroll - ultimoScroll;

      if (!navegandoPorAncora) {
        if (atualScroll <= LIMIAR_TOPO) {
          document.documentElement.classList.remove('cbl-hud-oculta');
          document.body.classList.remove('cbl-hud-oculta');
        } else if (delta > DELTA_MIN && atualScroll > LIMIAR_TOPO) {
          document.documentElement.classList.add('cbl-hud-oculta');
          document.body.classList.add('cbl-hud-oculta');
        } else if (delta < -DELTA_MIN) {
          document.documentElement.classList.remove('cbl-hud-oculta');
          document.body.classList.remove('cbl-hud-oculta');
        }
      }

      ultimoScroll = atualScroll;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(atualizarHUD);
        ticking = true;
      }
    }, { passive: true });
  }
})();
</script>
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
    const diarios = this.notasDe('atualizacao-diaria');

    const ultimos = diarios
      .slice(0, 5)
      .map((n) => {
        const href = this.arquivoDaNota(n.caminho);
        const n_fatos = this.indice.fatos.filter((f) => f.data === n.campos.data).length;
        const rotuloData = this.limparRotuloSidebar(n.campos.data || n.titulo, 'atualizacao-diaria');
        const fatosRotulo = n_fatos === 1 ? '1 fato' : `${n_fatos} fatos`;
        return `<li><a href="${href}" class="link-dia-card"><span class="dia-data">${escapar(rotuloData)}</span><div class="dia-meta"><span class="apoio">${fatosRotulo}</span><svg class="seta-dia" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></div></a></li>`;
      })
      .join('');

    let corpo = renderizarDocumentoCBL('');

    corpo += `<div class="secao-ultimos-dias secao-ultimos-dias-home">
      <h2>Últimas atualizações diárias</h2>
      ${ultimos ? `<ul class="lista-dias">${ultimos}</ul>` : `<p class="vazio">Nenhuma nota diária ainda.</p>`}
    </div>`;

    return this.pagina({
      titulo: 'Documento Oficial CBL',
      subtitulo: 'Challenge 18 · Apple Developer Academy · Equipe BlendOps',
      corpo,
      ativo: 'index.html',
      daPasta: '',
      semConteudoTopo: true,
    });
  }

  formatarTabelasDesestruturadas(texto) {
    if (!texto) return '';

    // 1. Tabela de Histórico de Versões
    texto = texto.replace(
      /(?:^|\n)(?:##\s*)?Histórico de Versões\s*\n+Versão\s*\n+Data\s*\n+Autor\(es\)\s*\n+Descrição da Mudança\s*\n+([\s\S]*?)(?=\n+(?:(?:##\s*)?Glossário|\d+\.|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 3 < linhas.length; i += 4) {
          const v = linhas[i];
          const d = linhas[i + 1];
          const a = linhas[i + 2];
          const m = linhas[i + 3];
          linhasTabela.push(`| **${v}** | ${d} | ${a} | ${m} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n## Histórico de Versões\n\n| Versão | Data | Autores | Descrição da Mudança |\n|---|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 2. Tabela de Glossário
    texto = texto.replace(
      /(?:^|\n)(?:##\s*)?Glossário\s*\n+Termo \/ Sigla\s*\n+Definição\s*\n+Contexto de Uso\s*\n+([\s\S]*?)(?=\n+(?:\d+\.|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          const t = linhas[i];
          const d = linhas[i + 1];
          const c = linhas[i + 2];
          linhasTabela.push(`| **${t}** | ${d} | ${c} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n## Glossário\n\n| Termo / Sigla | Definição | Contexto de Uso |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 3. Tabela de Regras de Negócio (2.1 Regras Obrigatórias)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?2\.1 Regras Obrigatórias\s*\n+#\s*\n+Regra\s*\n+Contexto \/ Justificativa\s*\n+([\s\S]*?)(?=\n+(?:\d+\.|#{1,3}|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          const id = linhas[i];
          const regra = linhas[i + 1];
          const contexto = linhas[i + 2];
          linhasTabela.push(`| **${id}** | ${regra} | ${contexto} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 2.1 Regras Obrigatórias\n\n| # | Regra | Contexto / Justificativa |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 4. Tabela de Requisitos Funcionais (3.1 Lista de Requisitos Funcionais)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.1 Lista de Requisitos Funcionais\s*\n+#\s*\n+Requisito Funcional\s*\n+Prioridade\s*\n+Critério de aceitação\s*\n+([\s\S]*?)(?=\n+(?:\d+\.|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 3 < linhas.length; i += 4) {
          const id = linhas[i];
          const req = linhas[i + 1];
          const prio = linhas[i + 2];
          const crit = linhas[i + 3];
          linhasTabela.push(`| **${id}** | ${req} | ${prio} | ${crit} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 3.1 Lista de Requisitos Funcionais\n\n| # | Requisito Funcional | Prioridade | Critério de Aceitação |\n|---|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 5. Tabela de Estimativa de RFs (3.2 Tempo e Custo Estimados por RF)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.2 Tempo e Custo Estimados por RF\s*([\s\S]*?)\n+#\s*\n+Tempo Estimado\s*\n+Custo Estimado\s*\n+([\s\S]*?)(?=\n+(?:###?\s*3\.3|3\.3|\d+\.|\Z))/i,
      (match, intro, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          const id = linhas[i];
          const tempo = linhas[i + 1];
          const custo = linhas[i + 2];
          linhasTabela.push(`| **${id}** | ${tempo} | ${custo} |`);
        }
        if (linhasTabela.length > 0) {
          const introTxt = intro.trim() ? `\n\n${intro.trim()}` : '';
          return `\n### 3.2 Tempo e Custo Estimados por RF${introTxt}\n\n| # | Tempo Estimado | Custo Estimado |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 6. Matriz Impacto × Esforço (3.3 Matriz Impacto × Esforço)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.3 Matriz Impacto × Esforço\s*\n+Impacto ↓ Esforço →\s*\n+Esforço Baixo\s*\n+Esforço Médio\s*\n+Esforço Alto\s*\n+Impacto Alto\s*\n+Quick wins, faça primeiro\s*\n+([^\n]+)\s*\n+Planeje bem, vale o esforço\s*\n+([^\n]+)\s*\n+Grande projeto, divida em partes\s*\n+([^\n]+)\s*\n+Impacto Médio\s*\n+Secundário\s*\n+([^\n]+)\s*\n+Avalie\s*\n+([^\n]+)\s*\n+Evite por ora\s*\n+([^\n]+)\s*\n+Impacto Baixo\s*\n+Se sobrar tempo\s*\n+([^\n]+)\s*\n+Baixa prioridade\s*\n+([^\n]+)\s*\n+Descarte ou adie\s*\n+([^\n]+)/i,
      (match, r1, r2, r3, r4, r5, r6, r7, r8, r9) => {
        return `\n### 3.3 Matriz Impacto × Esforço\n\n| Impacto ↓ \\ Esforço → | Esforço Baixo | Esforço Médio | Esforço Alto |\n|---|---|---|---|\n| **Impacto Alto** | **Quick wins, faça primeiro**<br>${r1} | **Planeje bem, vale o esforço**<br>${r2} | **Grande projeto, divida em partes**<br>${r3} |\n| **Impacto Médio** | **Secundário**<br>${r4} | **Avalie**<br>${r5} | **Evite por ora**<br>${r6} |\n| **Impacto Baixo** | **Se sobrar tempo**<br>${r7} | **Baixa prioridade**<br>${r8} | **Descarte ou adie**<br>${r9} |\n\n`;
      }
    );

    // 7. Tabela de Requisitos Não Funcionais (4.1 Lista de Requisitos Não Funcionais)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?4\.1 Lista de Requisitos Não Funcionais\s*\n+#\s*\n+Requisito Não Funcional\s*\n+Categoria\s*\n+Critério de Aceitação\s*\n+([\s\S]*?)(?=\n+(?:\d+\.|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 3 < linhas.length; i += 4) {
          const id = linhas[i];
          const req = linhas[i + 1];
          const cat = linhas[i + 2];
          const crit = linhas[i + 3];
          linhasTabela.push(`| **${id}** | ${req} | ${cat} | ${crit} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 4.1 Lista de Requisitos Não Funcionais\n\n| # | Requisito Não Funcional | Categoria | Critério de Aceitação |\n|---|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 8. Tabela de Estimativa de RNFs (4.2 Tempo e Custo Estimados por RNF)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?4\.2 Tempo e Custo Estimados por RNF\s*\n+#\s*\n+Tempo Estimado\s*\n+Custo Estimado\s*\n+([\s\S]*?)(?=\n+(?:5\.|\d+\.|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          const id = linhas[i];
          const tempo = linhas[i + 1];
          const custo = linhas[i + 2];
          linhasTabela.push(`| **${id}** | ${tempo} | ${custo} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 4.2 Tempo e Custo Estimados por RNF\n\n| # | Tempo Estimado | Custo Estimado |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 9. Tabela de 1.3 Referências (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?1\.3 Referências\s*\n+Documento\s*\n+Versão\s*\n+Link \/ Localização\s*\n+([\s\S]*?)(?=\n+(?:1\.4[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          const doc = linhas[i];
          const ver = linhas[i + 1];
          const link = linhas[i + 2];
          linhasTabela.push(`| **${doc}** | ${ver} | ${link} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 1.3 Referências\n\n| Documento | Versão | Link / Localização |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 10. Tabela RUP 2.2 Instrução do Problema (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?2\.2 Instrução do Problema\s*\n+([\s\S]*?)(?=\n+(?:2\.3[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 1 < linhas.length; i += 2) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 2.2 Instrução do Problema\n\n| Elemento | Descrição |\n|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 11. Tabela RUP 2.3 Instrução de Posição do Produto (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?2\.3 Instrução de Posição do Produto\s*\n+([\s\S]*?)(?=\n+(?:3\.[ \t]+[A-ZÀ-Ú]|3\.1|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 1 < linhas.length; i += 2) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 2.3 Instrução de Posição do Produto\n\n| Elemento | Declaração |\n|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 12. Tabela 3.2 Resumo das Partes Interessadas (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.2 Resumo das Partes Interessadas\s*\n+Nome \/ Grupo\s*\n+Descrição\s*\n+Responsabilidades\s*\n+([\s\S]*?)(?=\n+(?:3\.3[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 3.2 Resumo das Partes Interessadas\n\n| Nome / Grupo | Descrição | Responsabilidades |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 13. Tabela 3.3 Resumo dos Usuários (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.3 Resumo dos Usuários\s*\n+Nome \/ Perfil\s*\n+Descrição\s*\n+Stakeholder responsável\s*\n+([\s\S]*?)(?=\n+(?:3\.4[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 3.3 Resumo dos Usuários\n\n| Nome / Perfil | Descrição | Stakeholder Responsável |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 14. Perfis detalhados de Stakeholder e Usuário (3.5 e 3.6 de Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,4}\s*)?(Stakeholder \d+:[^\n]+)\s*\n+([\s\S]*?)(?=(?:\n+Stakeholder \d+|\n+#{1,3}|\Z))/g,
      (match, cabecalho, corpoPerfil) => {
        const linhas = corpoPerfil.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 1 < linhas.length; i += 2) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n#### ${cabecalho.trim()}\n\n| Campo | Descrição |\n|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );
    texto = texto.replace(
      /(?:^|\n)(?:#{1,4}\s*)?(Usuário \d+:[^\n]+)\s*\n+([\s\S]*?)(?=(?:\n+Usuário \d+|\n+#{1,3}|\Z))/g,
      (match, cabecalho, corpoPerfil) => {
        const linhas = corpoPerfil.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 1 < linhas.length; i += 2) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n#### ${cabecalho.trim()}\n\n| Campo | Descrição |\n|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 15. Tabela 3.7 Principais Necessidades (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?3\.7 Principais Necessidades[^\n]*\s*\n+Necessidade\s*\n+Prioridade\s*\n+Solução Atual\s*\n+Solução Proposta\s*\n+([\s\S]*?)(?=\n+(?:4\.[ \t]+[A-ZÀ-Ú]|4\.1|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 3 < linhas.length; i += 4) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} | ${linhas[i + 3]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 3.7 Principais Necessidades das Partes Interessadas e Usuários\n\n| Necessidade | Prioridade | Solução Atual | Solução Proposta |\n|---|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 16. Tabela 4.2 Resumo das Capacidades (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?4\.2 Resumo das Capacidades\s*\n+Benefício para o Cliente \/ Usuário\s*\n+Recurso que o Suporta\s*\n+([\s\S]*?)(?=\n+(?:4\.3[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 1 < linhas.length; i += 2) {
          linhasTabela.push(`| ${linhas[i]} | **${linhas[i + 1]}** |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 4.2 Resumo das Capacidades\n\n| Benefício para o Cliente / Usuário | Recurso que o Suporta |\n|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 17. Tabela 4.3 Suposições e Dependências (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?4\.3 Suposições e Dependências\s*\n+Tipo\s*\n+Descrição\s*\n+Impacto se não atendido\s*\n+([\s\S]*?)(?=\n+(?:4\.4[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 4.3 Suposições e Dependências\n\n| Tipo | Descrição | Impacto se não atendido |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 18. Tabelas de 4.4 Custo e Precificação (Concorrentes e Custos)
    texto = texto.replace(
      /Concorrente\s*\n+Modelo de cobrança\s*\n+Quem paga\s*\n+([\s\S]*?)(?=\n+(?:Também não há base|Item|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n| Concorrente | Modelo de Cobrança | Quem Paga |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );
    texto = texto.replace(
      /Item\s*\n+Natureza\s*\n+Custo estimado\s*\n+([\s\S]*?)(?=\n+(?:5\.[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n| Item | Natureza | Custo Estimado |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 19. Tabela 5. Recursos do Produto (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?5\. Recursos do Produto\s*([\s\S]*?)\n+ID\s*\n+Recurso\s*\n+Descrição\s*\n+Prioridade\s*\n+([\s\S]*?)(?=\n+(?:6\.[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, intro, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 3 < linhas.length; i += 4) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} | ${linhas[i + 3]} |`);
        }
        if (linhasTabela.length > 0) {
          const introTxt = intro.trim() ? `\n\n${intro.trim()}` : '';
          return `\n### 5. Recursos do Produto${introTxt}\n\n| ID | Recurso | Descrição | Prioridade |\n|---|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 20. Tabela 6. Faixas de Qualidade (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?6\. Faixas de Qualidade\s*\n+Atributo\s*\n+Definição \/ Expectativa\s*\n+Critério de Aceitação\s*\n+([\s\S]*?)(?=\n+(?:7\.[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 6. Faixas de Qualidade\n\n| Atributo | Definição / Expectativa | Critério de Aceitação |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    // 21. Tabela 7.4 Rótulo e Embalagem (Frila_Documento_de_Visao)
    texto = texto.replace(
      /(?:^|\n)(?:#{1,3}\s*)?7\.4 Rótulo e Embalagem\s*\n+Item\s*\n+Descrição\s*\n+Status\s*\n+([\s\S]*?)(?=\n+(?:8\.[ \t]+[A-ZÀ-Ú]|##|\Z))/i,
      (match, blocoItens) => {
        const linhas = blocoItens.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const linhasTabela = [];
        for (let i = 0; i + 2 < linhas.length; i += 3) {
          linhasTabela.push(`| **${linhas[i]}** | ${linhas[i + 1]} | ${linhas[i + 2]} |`);
        }
        if (linhasTabela.length > 0) {
          return `\n### 7.4 Rótulo e Embalagem\n\n| Item | Descrição | Status |\n|---|---|---|\n${linhasTabela.join('\n')}\n\n`;
        }
        return match;
      }
    );

    return texto;
  }

  paginaDeNota(nota, secao) {
    const ehDocumentoCBL = (nota.caminho.endsWith('/C18.md') || nota.caminho.endsWith('C18.md')) && !nota.caminho.includes('Agenda') || nota.caminho.includes('CBL_C18');
    if (ehDocumentoCBL) {
      return this.paginaDocumentoCBL(nota, secao);
    }

    const tituloLimpo = this.limparTitulo(nota.titulo, nota.tipo, nota);

    // 1. O H1 vira o título da página no Masthead; retira do corpo para não duplicar.
    let corpoLimpo = nota.corpo.replace(/^#\s+[^\n]+\n+/, '');

    // 2. Retira o rodapé do Obsidian ("--- ← [[...]]")
    corpoLimpo = this.semRodapeDoObsidian(corpoLimpo);

    // 3. Tira avisos e callouts redundantes de geração automática
    corpoLimpo = corpoLimpo.replace(/>\s*\[!info\]\s*Gerado automaticamente[\s\S]*?(?=\n\n|\n[A-Z0-9#]|$)\n*/gi, '');

    // 4. Remove blocos de capa de documentos convertidos do Word/Pages (ex: ESPECIFICAÇÃO DE REQUISITOS... Data 18/09/2026)
    corpoLimpo = corpoLimpo.replace(/^\s*(?:ESPECIFICAÇÃO DE REQUISITOS|DOCUMENTO DE VISÃO|DOCUMENTO DE REQUISITOS|VISÃO DO PRODUTO)[\s\S]*?(?:Data\s*\n+\d{1,2}\/\d{1,2}\/\d{4}\s*\n*)/i, '');

    // 5. Remove cabeçalhos de bloco de citação repetitivos (Autores / Equipe / Desafio / Data / Versão)
    corpoLimpo = corpoLimpo.replace(/^\s*>\s*\*\*Documento de[^\n]*\n(?:>\s*[^\n]*\n*)+(\n*---\s*\n*)?/i, '');

    // 6. Limpa linhas divisórias horizontais órfãs no início do documento
    corpoLimpo = corpoLimpo.replace(/^\s*---\s*\n+/, '');

    // 7. Estrutura tabelas provenientes de conversão crua de .docx
    corpoLimpo = this.formatarTabelasDesestruturadas(corpoLimpo);

    // 8. Rebaixa qualquer H1 remanescente no corpo para H2 para manter a hierarquia canônica de DESIGN.md (único H1 no Masthead)
    corpoLimpo = corpoLimpo.replace(/^#\s+([^\n]+)/gm, '## $1');

    // Renderiza o Masthead editorial canônico
    const mastheadHtml = this.renderizarMastheadNota(nota, secao, '../', corpoLimpo, tituloLimpo);

    let chamadaCBL = '';
    if (nota.caminho === '01 - CBL/Desafios/C18/C18.md') {
      chamadaCBL = `<section class="cbl-editorial-chamada">
        <div class="cbl-chamada-eyebrow">
          <span class="cbl-chamada-tag">Documento Oficial</span>
          <span class="cbl-chamada-sep">/</span>
          <span class="cbl-chamada-origem">Apple Developer Academy<span class="cbl-ponto-sep" aria-hidden="true"></span>CBL</span>
        </div>
        <h3 class="cbl-chamada-titulo">Documento Oficial CBL — Challenge 18</h3>
        <p class="cbl-chamada-lead">Framework Challenge Based Learning aplicado à concepção do Frila: Big Idea, Essential Questions, Pesquisa de Campo e 22 Objetivos de Aprendizagem.</p>
        <div class="cbl-chamada-acoes">
          <a href="01-cbl-desafios-c18-documentos-cbl-c18.html" class="cbl-chamada-link-primario">
            <span>Abrir Documento Completo</span>
            <span class="cbl-seta" aria-hidden="true">→</span>
          </a>
          <a href="../midia/01 - CBL/Desafios/C18/Documentos/CBL_C18.pdf" class="cbl-chamada-link-secundario" download="CBL_C18.pdf" title="Baixar PDF original (9.1 MB)">
            <span>PDF Original (9.1 MB)</span>
            <span class="cbl-seta" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>`;
    }

    const corpo = `
      <article class="cbl-documento pagina-conteudo-centralizado">
        ${mastheadHtml}
        ${chamadaCBL}
        <div class="narrativa">
          ${this.md(corpoLimpo, 'notas')}
        </div>
      </article>
    `;

    return this.pagina({
      titulo: tituloLimpo,
      subtitulo: secao.titulo,
      corpo,
      ativo: this.arquivoDaNota(nota.caminho),
      daPasta: 'notas',
      semConteudoTopo: true,
    });
  }

  paginaDocumentoCBL(nota, secao) {
    const base = '../';
    const corpo = renderizarDocumentoCBL(base);
    return this.pagina({
      titulo: 'Documento Oficial CBL',
      subtitulo: 'Challenge 18 · Ciclo CBL · Framework & Concepção do Frila',
      corpo,
      ativo: this.arquivoDaNota(nota.caminho),
      daPasta: 'notas',
      semConteudoTopo: true,
    });
  }

  paginaTarefas() {
    const tarefas = this.indice.notas.filter((n) => n.tipo === 'tarefa');
    if (!tarefas.length) {
      return this.pagina({
        titulo: 'Tarefas',
        subtitulo: 'Quadro de trabalho e backlog do ciclo CBL',
        corpo: '<p class="vazio">Nenhuma tarefa registrada ainda.</p>',
        ativo: 'tarefas.html',
        daPasta: '',
      });
    }

    const colunasStatus = [
      { id: 'a-fazer',      rotulo: 'A fazer',      cor: '#888d92' },
      { id: 'em-andamento', rotulo: 'Em andamento', cor: '#3b9eff' },
      { id: 'revisao',      rotulo: 'Revisão',      cor: '#f59e0b' },
      { id: 'concluida',    rotulo: 'Concluída',    cor: '#3ad389' },
    ];
    const rotulos = Object.fromEntries(colunasStatus.map((c) => [c.id, c.rotulo]));

    // Mapeia logins/usernames para nomes humanos
    const mapaNomesResponsaveis = {
      'cauecarneiroc': 'Cauê Carneiro',
      'fbtostadev': 'Fabrício Tosta',
      'joaopaulo': 'João Paulo',
      'juliaclovandi': 'Júlia Clovandi',
      'matheussilva': 'Matheus Silva',
    };

    const normalizarNome = (nome) => {
      const chave = nome.trim().toLowerCase();
      return mapaNomesResponsaveis[chave] || nome.trim();
    };

    // Extrai lista única de responsáveis
    const todosResponsaveis = new Set();
    tarefas.forEach((t) => {
      const resp = t.campos.responsavel;
      if (resp) {
        const limpo = resp.replace(/^\[|\]$/g, '');
        limpo.split(',').map((s) => normalizarNome(s)).filter(Boolean).forEach((r) => todosResponsaveis.add(r));
      }
    });
    const listaResponsaveis = Array.from(todosResponsaveis).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const formatarDataLegivel = (d) => {
      if (!d) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [ano, mes, dia] = d.split('-');
        return `${dia}/${mes}/${ano}`;
      }
      return d;
    };

    const itensTarefas = tarefas.map((t) => {
      const id = t.campos.id || '';
      const s = t.campos.status || 'a-fazer';
      const respBruta = (t.campos.responsavel || '').replace(/^\[|\]$/g, '').trim();
      const resp = respBruta
        ? respBruta.split(',').map((p) => normalizarNome(p)).filter(Boolean).join(', ')
        : '—';
      const desafio = t.campos.desafio || 'C18';
      const dataIso = t.campos.data_criacao || '';
      const dataFormatada = formatarDataLegivel(dataIso);
      const href = this.arquivoDaNota(t.caminho);
      return {
        id,
        titulo: t.titulo,
        status: s,
        responsavel: resp,
        desafio,
        data: dataIso,
        dataFormatada,
        href,
      };
    });

    // Toolbar de controle
    const toolbar = `<div class="tarefas-toolbar">
      <div class="toolbar-esquerda">
        <div class="visao-seletor" role="tablist" aria-label="Modo de visualização">
          <button type="button" class="btn-visao ativo" id="btn-visao-quadro" role="tab" aria-selected="true" data-modo="quadro">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
            <span>Quadro</span>
          </button>
          <button type="button" class="btn-visao" id="btn-visao-tabela" role="tab" aria-selected="false" data-modo="tabela">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>
            <span>Tabela</span>
          </button>
        </div>
        <span class="tarefas-total-badge" id="tarefas-contador-total">${itensTarefas.length} tarefas</span>
      </div>

      <div class="toolbar-direita">
        <div class="busca-container">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="search" id="filtro-busca" placeholder="Buscar tarefa, ID ou autor..." autocomplete="off">
        </div>

        <select id="filtro-status" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option value="a-fazer">A fazer</option>
          <option value="em-andamento">Em andamento</option>
          <option value="revisao">Revisão</option>
          <option value="concluida">Concluída</option>
        </select>

        <select id="filtro-responsavel" aria-label="Filtrar por responsável">
          <option value="">Todos os responsáveis</option>
          ${listaResponsaveis.map((r) => `<option value="${escapar(r)}">${escapar(r)}</option>`).join('')}
        </select>

        <select id="filtro-ordem" aria-label="Ordenar tarefas">
          <option value="id-asc">ID (crescente)</option>
          <option value="id-desc">ID (decrescente)</option>
          <option value="data-desc">Mais recente primeiro</option>
          <option value="data-asc">Mais antiga primeiro</option>
          <option value="titulo-asc">Título (A → Z)</option>
        </select>
      </div>
    </div>`;

    // 1. Visão Kanban Board
    const colunasHtml = colunasStatus.map((col) => {
      const tarefasNaColuna = itensTarefas.filter((t) => t.status === col.id);
      const cartoesHtml = tarefasNaColuna.map((t) => `
        <div class="kanban-card" data-id="${escapar(t.id)}" data-status="${escapar(t.status)}" data-responsavel="${escapar(t.responsavel.toLowerCase())}" data-titulo="${escapar(t.titulo.toLowerCase())}" data-data="${escapar(t.data)}">
          <div class="kanban-card-topo">
            <a href="${t.href}" class="kanban-card-id">${escapar(t.id)}</a>
            <span class="kanban-card-desafio">${escapar(t.desafio)}</span>
          </div>
          <a href="${t.href}" class="kanban-card-titulo">${escapar(t.titulo)}</a>
          <div class="kanban-card-rodape">
            <span class="kanban-card-responsavel" title="${escapar(t.responsavel)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>${escapar(t.responsavel)}</span>
            </span>
            ${t.dataFormatada ? `<span class="kanban-card-data">${escapar(t.dataFormatada)}</span>` : ''}
          </div>
        </div>
      `).join('');

      return `<div class="kanban-coluna" data-coluna-status="${col.id}">
        <div class="kanban-coluna-cabecalho">
          <div class="kanban-coluna-titulo">
            <span class="status-ponto" style="background: ${col.cor};"></span>
            <h3>${col.rotulo}</h3>
          </div>
          <span class="kanban-coluna-qtd" id="qtd-${col.id}">${tarefasNaColuna.length}</span>
        </div>
        <div class="kanban-cards-lista" data-coluna-cartoes="${col.id}">
          ${cartoesHtml}
          <div class="coluna-vazia" ${tarefasNaColuna.length ? 'hidden' : ''}>Nenhuma tarefa</div>
        </div>
      </div>`;
    }).join('');

    const quadroHtml = `<div id="quadro-container" class="kanban-quadro">${colunasHtml}</div>`;

    // 2. Visão Tabela
    const linhasTabela = itensTarefas.map((t) => {
      const rotuloStatus = rotulos[t.status] || t.status;
      return `<tr data-id="${escapar(t.id)}" data-status="${escapar(t.status)}" data-responsavel="${escapar(t.responsavel.toLowerCase())}" data-titulo="${escapar(t.titulo.toLowerCase())}" data-data="${escapar(t.data)}">
        <td class="mono"><a href="${t.href}" class="link-id">${escapar(t.id)}</a></td>
        <td><a href="${t.href}" class="link-titulo">${escapar(t.titulo)}</a></td>
        <td><span class="etiqueta status-${escapar(t.status)}"><span class="status-ponto"></span>${escapar(rotuloStatus)}</span></td>
        <td>${escapar(t.responsavel)}</td>
        <td>${escapar(t.desafio)}</td>
        <td class="mono">${escapar(t.dataFormatada || '—')}</td>
      </tr>`;
    }).join('');

    const tabelaHtml = `<div id="tabela-container" class="tabela-container" hidden>
      <div class="rolagem">
        <table id="tabela-tarefas">
          <thead>
            <tr>
              <th data-sort="id" title="Clique para ordenar por ID">ID ↕</th>
              <th data-sort="titulo" title="Clique para ordenar por título">Tarefa ↕</th>
              <th data-sort="status">Status</th>
              <th data-sort="responsavel">Responsável</th>
              <th data-sort="desafio">Desafio</th>
              <th data-sort="data" title="Clique para ordenar por data">Criada em ↕</th>
            </tr>
          </thead>
          <tbody>${linhasTabela}</tbody>
        </table>
      </div>
    </div>`;

    // Estado Vazio
    const vazioHtml = `<div id="tarefas-vazio" class="tarefas-vazio" hidden>
      <p>Nenhuma tarefa encontrada para os filtros selecionados.</p>
    </div>`;

    // Script interativo
    const scriptInterativo = `<script>
(function() {
  var modoAtual = localStorage.getItem('bancada_tarefas_modo') || 'quadro';
  var btnQuadro = document.getElementById('btn-visao-quadro');
  var btnTabela = document.getElementById('btn-visao-tabela');
  var containerQuadro = document.getElementById('quadro-container');
  var containerTabela = document.getElementById('tabela-container');
  var contadorTotal = document.getElementById('tarefas-contador-total');
  var estadoVazio = document.getElementById('tarefas-vazio');

  var filtroBusca = document.getElementById('filtro-busca');
  var filtroStatus = document.getElementById('filtro-status');
  var filtroResp = document.getElementById('filtro-responsavel');
  var filtroOrdem = document.getElementById('filtro-ordem');

  function aplicarModo(modo) {
    modoAtual = modo;
    try { localStorage.setItem('bancada_tarefas_modo', modo); } catch(e) {}
    var ehQuadro = modo === 'quadro';
    btnQuadro.classList.toggle('ativo', ehQuadro);
    btnQuadro.setAttribute('aria-selected', ehQuadro ? 'true' : 'false');
    btnTabela.classList.toggle('ativo', !ehQuadro);
    btnTabela.setAttribute('aria-selected', !ehQuadro ? 'true' : 'false');
    containerQuadro.hidden = !ehQuadro;
    containerTabela.hidden = ehQuadro;
  }

  btnQuadro.addEventListener('click', function() { aplicarModo('quadro'); });
  btnTabela.addEventListener('click', function() { aplicarModo('tabela'); });
  aplicarModo(modoAtual);

  function atualizarFiltros() {
    var termo = (filtroBusca.value || '').trim().toLowerCase();
    var statusSel = filtroStatus.value;
    var respSel = (filtroResp.value || '').toLowerCase();
    var ordemSel = filtroOrdem.value;

    var cartoes = Array.from(document.querySelectorAll('.kanban-card'));
    var linhas = Array.from(document.querySelectorAll('#tabela-tarefas tbody tr'));

    var visiveisTotal = 0;
    var contadoresColunas = { 'a-fazer': 0, 'em-andamento': 0, 'revisao': 0, 'concluida': 0 };

    function casaFiltro(el) {
      var id = (el.dataset.id || '').toLowerCase();
      var tit = (el.dataset.titulo || '').toLowerCase();
      var st = el.dataset.status || '';
      var resp = (el.dataset.responsavel || '').toLowerCase();

      var bateTermo = !termo || id.indexOf(termo) !== -1 || tit.indexOf(termo) !== -1 || resp.indexOf(termo) !== -1;
      var bateStatus = !statusSel || st === statusSel;
      var bateResp = !respSel || resp.indexOf(respSel) !== -1;

      return bateTermo && bateStatus && bateResp;
    }

    cartoes.forEach(function(card) {
      var ok = casaFiltro(card);
      card.hidden = !ok;
      if (ok) {
        visiveisTotal++;
        var st = card.dataset.status;
        if (contadoresColunas[st] !== undefined) contadoresColunas[st]++;
      }
    });

    Object.keys(contadoresColunas).forEach(function(st) {
      var badge = document.getElementById('qtd-' + st);
      if (badge) badge.textContent = contadoresColunas[st];
      var coluna = document.querySelector('[data-coluna-cartoes="' + st + '"]');
      if (coluna) {
        var vaziaEl = coluna.querySelector('.coluna-vazia');
        if (vaziaEl) vaziaEl.hidden = contadoresColunas[st] > 0;
      }
    });

    linhas.forEach(function(tr) {
      tr.hidden = !casaFiltro(tr);
    });

    contadorTotal.textContent = visiveisTotal + (visiveisTotal === 1 ? ' tarefa' : ' tarefas');
    estadoVazio.hidden = visiveisTotal > 0;

    function comparar(a, b) {
      if (ordemSel === 'id-asc') return (a.dataset.id || '').localeCompare(b.dataset.id || '');
      if (ordemSel === 'id-desc') return (b.dataset.id || '').localeCompare(a.dataset.id || '');
      if (ordemSel === 'data-desc') return (b.dataset.data || '').localeCompare(a.dataset.data || '');
      if (ordemSel === 'data-asc') return (a.dataset.data || '').localeCompare(b.dataset.data || '');
      if (ordemSel === 'titulo-asc') return (a.dataset.titulo || '').localeCompare(b.dataset.titulo || '');
      return 0;
    }

    ['a-fazer', 'em-andamento', 'revisao', 'concluida'].forEach(function(st) {
      var lista = document.querySelector('[data-coluna-cartoes="' + st + '"]');
      if (!lista) return;
      var cardsDaColuna = Array.from(lista.querySelectorAll('.kanban-card'));
      cardsDaColuna.sort(comparar);
      cardsDaColuna.forEach(function(c) { lista.appendChild(c); });
    });

    var tbody = document.querySelector('#tabela-tarefas tbody');
    if (tbody) {
      linhas.sort(comparar);
      linhas.forEach(function(r) { tbody.appendChild(r); });
    }
  }

  filtroBusca.addEventListener('input', atualizarFiltros);
  filtroStatus.addEventListener('change', atualizarFiltros);
  filtroResp.addEventListener('change', atualizarFiltros);
  filtroOrdem.addEventListener('change', atualizarFiltros);

  document.querySelectorAll('#tabela-tarefas th[data-sort]').forEach(function(th) {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function() {
      var campo = th.dataset.sort;
      if (campo === 'id') {
        filtroOrdem.value = filtroOrdem.value === 'id-asc' ? 'id-desc' : 'id-asc';
      } else if (campo === 'titulo') {
        filtroOrdem.value = 'titulo-asc';
      } else if (campo === 'data') {
        filtroOrdem.value = filtroOrdem.value === 'data-desc' ? 'data-asc' : 'data-desc';
      }
      atualizarFiltros();
    });
  });
})();
</script>`;

    const contagemStatus = colunasStatus.map((c) => {
      const qtd = tarefas.filter((t) => t.campos.status === c.id).length;
      return `${qtd} ${escapar(c.rotulo.toLowerCase())}`;
    }).join('<span class="cbl-ponto-sep" aria-hidden="true"></span>');

    const mastheadTarefas = `
      <header class="cbl-masthead-doc">
        <div class="cbl-masthead-eyebrow">
          <span class="cbl-masthead-rotulo"><span class="cbl-eyebrow-item">APPLE DEVELOPER ACADEMY</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">CICLO CBL C18</span></span>
        </div>

        <h1 class="cbl-masthead-titulo">Tarefas e Backlog</h1>
        <p class="cbl-masthead-lead">Quadro de execução operacional, priorização MoSCoW e acompanhamento das entregas da equipe BlendOps para o Frila.</p>

        <div class="cbl-colofao">
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Total de Tarefas</span>
            <div class="cbl-colofao-valor">${tarefas.length} tarefas catalogadas</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Equipe BlendOps</span>
            <div class="cbl-colofao-valor">Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Ciclo</span>
            <div class="cbl-colofao-valor"><time datetime="2026-09-08">08/09/2026</time> — <time datetime="2026-12-04">04/12/2026</time></div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Distribuição</span>
            <div class="cbl-colofao-valor">${contagemStatus}</div>
          </div>
        </div>
      </header>
    `;

    const corpo = `
      <article class="cbl-documento pagina-tarefas-canvas">
        ${mastheadTarefas}
        ${toolbar}
        ${quadroHtml}
        ${tabelaHtml}
        ${vazioHtml}
        ${scriptInterativo}
      </article>
    `;

    return this.pagina({
      titulo: 'Tarefas e Backlog',
      subtitulo: 'Quadro operacional e backlog do ciclo CBL',
      corpo,
      ativo: 'tarefas.html',
      daPasta: '',
      semConteudoTopo: true,
    });
  }

  paginaRegistros() {
    if (!this.indice.arvoreDeRegistros.length) {
      return this.pagina({
        titulo: 'Registros',
        corpo: '<p class="vazio">Nenhum fato registrado ainda.</p>',
        ativo: 'registros.html',
        daPasta: '',
        semConteudoTopo: true,
      });
    }

    const mapaNomes = {
      'cauecarneiroc': 'Cauê Carneiro',
      'fbtostadev': 'Fabrício Tosta',
      'joaopaulo': 'João Paulo',
      'juliaclovandi': 'Júlia Clovandi',
      'matheussilva': 'Matheus Silva',
    };

    const normalizarTexto = (texto) => {
      if (!texto) return '';
      let s = String(texto);
      for (const [login, nome] of Object.entries(mapaNomes)) {
        s = s.replace(new RegExp(`\\b${login}\\b`, 'gi'), nome);
      }
      return s;
    };

    const formatarDataHumana = (d) => {
      if (!d) return '';
      const s = String(d).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const [ano, mes, dia] = s.slice(0, 10).split('-');
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${ano}`;
      }
      return s;
    };

    const totalFatos = this.indice.fatos ? this.indice.fatos.length : 0;

    const mastheadRegistros = `
      <header class="cbl-masthead-doc">
        <div class="cbl-masthead-eyebrow">
          <span class="cbl-masthead-rotulo"><span class="cbl-eyebrow-item">AUDITORIA CONTÍNUA</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">GIT HOOKS &amp; AUTOMAÇÃO</span></span>
        </div>

        <h1 class="cbl-masthead-titulo">Linha do Tempo e Registros</h1>
        <p class="cbl-masthead-lead">Registro cronológico imutável gerado pelos hooks do Git e da Bancada a cada commit, conversão de documento e sessão de trabalho no ciclo CBL.</p>

        <div class="cbl-colofao">
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Volume Auditado</span>
            <div class="cbl-colofao-valor">${totalFatos} eventos e fatos registrados</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Contribuidores</span>
            <div class="cbl-colofao-valor">Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Ciclo</span>
            <div class="cbl-colofao-valor"><time datetime="2026-09-08">08/09/2026</time> — <time datetime="2026-12-04">04/12/2026</time></div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Origem</span>
            <div class="cbl-colofao-valor">Hooks do Git<span class="cbl-ponto-sep" aria-hidden="true"></span>bancada-indice<span class="cbl-ponto-sep" aria-hidden="true"></span>automação local</div>
          </div>
        </div>
      </header>
    `;

    // `<details>` faz o colapso sem uma linha de JavaScript: o site é
    // estático de verdade, e continua funcionando sem scripts.
    const no = (n, nivel) => {
      let rotuloExibido = n.rotulo;
      if (nivel === 0 && /^\d{4}-\d{2}-\d{2}$/.test(n.rotulo)) {
        rotuloExibido = formatarDataHumana(n.rotulo);
      }
      const detalheExibido = normalizarTexto(n.detalhe);

      if (!n.filhos) {
        return `<li class="fato"><span class="rotulo">${escapar(rotuloExibido)}</span>
          <span class="apoio">${escapar(detalheExibido)}</span></li>`;
      }
      const filhos = n.filhos.map((f) => no(f, nivel + 1)).join('');
      const aberto = nivel === 0 ? ' open' : '';
      const classe = n.ocorrencias > 1 && nivel === 2 ? ' class="grupo-repetido"' : '';
      const marcaDeTipo = nivel === 1 ? ` data-tipo="${escapar(n.rotulo)}"` : '';
      return `<li><details${aberto}${classe}${marcaDeTipo}>
        <summary><span class="rotulo">${escapar(rotuloExibido)}</span>
        <span class="apoio">${escapar(detalheExibido)}</span></summary>
        <ul>${filhos}</ul>
      </details></li>`;
    };

    const corpo = `
      <article class="cbl-documento pagina-registros-canvas">
        ${mastheadRegistros}
        <ul class="arvore">${this.indice.arvoreDeRegistros.map((n) => no(n, 0)).join('')}</ul>
      </article>
    `;

    return this.pagina({
      titulo: 'Linha do Tempo e Registros',
      subtitulo: 'Auditoria contínua do Challenge 18',
      corpo,
      ativo: 'registros.html',
      daPasta: '',
      semConteudoTopo: true,
    });
  }

  paginaGaleria() {
    const midias = this.indice.midias;
    if (!midias.length) {
      return this.pagina({
        titulo: 'Galeria',
        corpo: '<p class="vazio">Nenhuma mídia versionada no vault ainda.</p>',
        ativo: 'galeria.html',
        daPasta: '',
        semConteudoTopo: true,
      });
    }

    const mastheadGaleria = `
      <header class="cbl-masthead-doc">
        <div class="cbl-masthead-eyebrow">
          <span class="cbl-masthead-rotulo"><span class="cbl-eyebrow-item">ACERVO VISUAL</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">RECURSOS GRÁFICOS</span></span>
        </div>

        <h1 class="cbl-masthead-titulo">Galeria de Mídia</h1>
        <p class="cbl-masthead-lead">Acervo visual, capturas de tela das iterações, diagramas de engenharia e materiais de apoio do produto Frila e da Bancada.</p>

        <div class="cbl-colofao">
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Total de Mídias</span>
            <div class="cbl-colofao-valor">${midias.length} arquivos catalogados</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Formatos</span>
            <div class="cbl-colofao-valor">PNG, JPG, SVG, MP4, MOV, .pages, .docx</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Contexto</span>
            <div class="cbl-colofao-valor">Frila<span class="cbl-ponto-sep" aria-hidden="true"></span>Challenge 18 (Apple Developer Academy)</div>
          </div>
        </div>
      </header>
    `;

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

    const corpo = `
      <article class="cbl-documento pagina-galeria-canvas">
        ${mastheadGaleria}
        <div class="grade">${cartoes}</div>
      </article>
    `;

    return this.pagina({
      titulo: 'Galeria de Mídia',
      subtitulo: 'Acervo visual e diagramas do Challenge 18',
      corpo,
      ativo: 'galeria.html',
      daPasta: '',
      semConteudoTopo: true,
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
      for (const nota of this.notasDaSecao(s)) {
        const rotulo = nota.tipo === 'atualizacao-diaria'
          ? (nota.campos.data || nota.titulo)
          : nota.titulo;
        registrar(this.ancora(nota.caminho), this.limparRotuloSidebar(rotulo, nota.tipo), s.titulo, this.telaDeNota(nota));
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
      // Tipografia de alta precisão (Geist / Inter / Geist Mono):
      '  --sans: "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  --serif: "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  --mono: "Geist Mono", "CommitMono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;'
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

:root[data-theme="light"] {
${cores('claro')}
  color-scheme: light;
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
