// Construtor do documento HTML semântico e interativo do CBL (Challenge 18).
// Substitui a visualização baseada em imagem de PDF por uma página editorial limpa,
// 100% selecionável, com marcações semânticas, tabelas estruturadas, hyperlinks reais
// e preparada para a feature de "What Is New" / Diffs com marcadores de texto.

const fs = require('fs');
const path = require('path');

function carregarDados() {
  const caminhoDados = path.join(__dirname, 'cbl-dados.json');
  return JSON.parse(fs.readFileSync(caminhoDados, 'utf8'));
}

function escapar(s) {
  const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(s || '').replace(/[&<>"']/g, (c) => escapes[c]);
}

function iconeLinkExterno() {
  return `<svg class="cbl-icone-externo" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
}

function iconeMarco() {
  return `<svg class="cbl-icone-marco" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>`;
}

function iconeDesign() {
  return `<svg class="cbl-cat-icone-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
}

function iconeProduto() {
  return `<svg class="cbl-cat-icone-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
}

function iconeIA() {
  return `<svg class="cbl-cat-icone-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v2"/><path d="M15 1v2"/><path d="M9 21v2"/><path d="M15 21v2"/><path d="M1 9h2"/><path d="M1 15h2"/><path d="M21 9h2"/><path d="M21 15h2"/></svg>`;
}

function iconeVisao() {
  return `<svg class="cbl-doc-ref-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function iconeRequisitos() {
  return `<svg class="cbl-doc-ref-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`;
}

function iconeBacklog() {
  return `<svg class="cbl-doc-ref-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
}

function renderizarTabelaPerguntas(perguntas, idTabela) {
  const linhas = perguntas.map((p, i) => {
    let fonteHtml = '';
    if (p.link) {
      fonteHtml = `<a href="${escapar(p.link.url)}" target="_blank" rel="noopener noreferrer" class="cbl-badge-fonte" title="Abrir fonte original">${iconeLinkExterno()}<span>${escapar(p.link.label)}</span></a>`;
    } else if (p.fonte && p.fonte.toLowerCase().includes('sem fonte')) {
      fonteHtml = `<span class="cbl-badge-sem-fonte">Sem fonte pública</span>`;
    } else if (p.fonte) {
      fonteHtml = `<span class="cbl-badge-fonte-texto">${escapar(p.fonte)}</span>`;
    }

    return `
      <tr class="cbl-linha-pergunta" id="${idTabela}-q${i + 1}">
        <td class="cbl-cel-conteudo">
          <div class="cbl-pergunta-texto"><strong>${escapar(p.pergunta)}</strong></div>
          ${p.resposta ? `<div class="cbl-resposta-texto">${escapar(p.resposta)}</div>` : ''}
        </td>
        <td class="cbl-cel-recurso">${fonteHtml}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="tabela-cbl-wrapper" id="${idTabela}">
      <table class="tabela-cbl tabela-cbl-perguntas">
        <thead>
          <tr>
            <th style="width: 78%;">Guiding Questions &amp; Respostas</th>
            <th style="width: 22%;">Recurso / Fonte</th>
          </tr>
        </thead>
        <tbody>
          ${linhas}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarTabelaAtividade(atividade, idTabela) {
  if (!atividade) return '';
  return `
    <div class="tabela-cbl-wrapper" id="${idTabela}">
      <table class="tabela-cbl tabela-cbl-atividade">
        <thead>
          <tr>
            <th style="width: 32%;">Atividade</th>
            <th style="width: 12%;">Data</th>
            <th style="width: 26%;">Recursos</th>
            <th style="width: 30%;">Feedback &amp; Aprendizado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="cbl-cel-atividade"><strong>${escapar(atividade.atividade)}</strong></td>
            <td class="cbl-cel-data"><span class="cbl-badge-data">${escapar(atividade.data)}</span></td>
            <td class="cbl-cel-recursos">${escapar(atividade.recursos)}</td>
            <td class="cbl-cel-feedback">${escapar(atividade.feedback)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderizarCardMarco({ fase, badge, titulo, texto, destaque, id }) {
  return `
    <aside class="cbl-card-marco fase-${fase}" id="${id}" data-cbl-marco="${id}">
      <div class="cbl-marco-topo">
        <div class="cbl-marco-icone">${iconeMarco()}</div>
        <div class="cbl-marco-rotulo">${escapar(badge)}</div>
      </div>
      <div class="cbl-marco-corpo">
        <h4 class="cbl-marco-titulo">${escapar(titulo)}</h4>
        ${destaque ? `<blockquote class="cbl-marco-destaque">${destaque}</blockquote>` : ''}
        ${texto ? `<div class="cbl-marco-texto">${texto}</div>` : ''}
      </div>
    </aside>
  `;
}

function renderizarDocumentoCBL(base = '../') {
  const dados = carregarDados();
  const pdfHref = `${base}midia/01 - CBL/Desafios/C18/Documentos/CBL_C18.pdf`;

  // Mapeamento das categorias dos 22 Learning Goals
  const categoriasGoals = [
    {
      categoria: 'Design & Experiência',
      iconeSvg: iconeDesign(),
      indices: [0, 1, 2, 3, 4, 5] // Design System, Consistency, IA no Design, Iteração, UI Doc, Acessibilidade
    },
    {
      categoria: 'Produto, Negócios & Legal',
      iconeSvg: iconeProduto(),
      indices: [6, 7, 8, 9, 10] // Business, Product Strategy, Marketing, Empreendedorismo, Legal
    },
    {
      categoria: 'Inteligência Artificial & Engenharia',
      iconeSvg: iconeIA(),
      indices: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] // Fundamentos IA, Prompt, AI-Assisted, Rules, Tools, RAG, Agentes, Multi-Agent, Arquitetura IA, Avaliação, Mobile IA
    }
  ];

  let goalsHtml = '';
  categoriasGoals.forEach(cat => {
    const cards = cat.indices.map(idx => {
      const g = dados.learningGoals[idx];
      if (!g) return '';
      const itens = g.objetivos.map(obj => `<li>${escapar(obj)}</li>`).join('');
      return `
        <article class="cbl-goal-card" id="goal-${idx + 1}">
          <div class="cbl-goal-header">
            <span class="cbl-goal-badge">Goal ${String(idx + 1).padStart(2, '0')}</span>
            <h4 class="cbl-goal-titulo">${escapar(g.titulo)}</h4>
            <p class="cbl-goal-descricao">${escapar(g.descricao)}</p>
          </div>
          <div class="cbl-goal-objetivos">
            <div class="cbl-goal-subtitulo">Learning Objectives</div>
            <ul>${itens}</ul>
          </div>
        </article>
      `;
    }).join('');

    goalsHtml += `
      <div class="cbl-goals-categoria">
        <h3 class="cbl-goals-cat-titulo">
          <span class="cat-icone">${cat.iconeSvg}</span>
          <span>${cat.categoria}</span>
        </h3>
        <div class="cbl-goals-grade">
          ${cards}
        </div>
      </div>
    `;
  });

  const rubricRowsHtml = dados.rubric.map(r => `
    <tr>
      <td class="cbl-rubrica-nivel"><span class="cbl-tag-nivel">${escapar(r.nivel)}</span></td>
      <td class="cbl-rubrica-desc">${escapar(r.descricao)}</td>
    </tr>
  `).join('');

  return `
    <article class="cbl-documento" id="cbl-documento-oficial">
      <!-- Topo Editorial do Documento -->
      <header class="cbl-cabecalho-doc">
        <div class="cbl-doc-meta-linha">
          <div class="cbl-doc-badges">
            <span class="cbl-badge-principal">Documento Oficial</span>
            <span class="cbl-badge-neutro">Challenge Based Learning</span>
            <span class="cbl-badge-neutro">Apple Developer Academy</span>
          </div>
          <div class="cbl-doc-acoes">
            <a href="${pdfHref}" class="cbl-btn-link-pdf" download="CBL_C18.pdf" title="Baixar PDF original de 28 páginas (9.1 MB)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>PDF Original (9.1 MB)</span>
            </a>
          </div>
        </div>

        <h1 class="cbl-doc-titulo">Documento Oficial CBL — Challenge 18</h1>
        <p class="cbl-doc-subtitulo">Framework Challenge Based Learning aplicado à concepção, pesquisa empírica de mercado e especificação técnica do produto <strong>Frila</strong>.</p>

        <div class="cbl-grid-metadados">
          <div class="cbl-meta-bloco">
            <span class="cbl-meta-rotulo">Equipe BlendOps</span>
            <div class="cbl-meta-valor">
              <span>708 Cauê Carneiro</span> · <span>714 Fabrício Tosta</span> · <span>721 João Paulo</span><br>
              <span>724 Júlia Clovandi</span> · <span>737 Matheus Silva</span>
            </div>
          </div>
          <div class="cbl-meta-bloco">
            <span class="cbl-meta-rotulo">Mentores</span>
            <div class="cbl-meta-valor">Felipe Carvalho · Victor Zerefos</div>
          </div>
          <div class="cbl-meta-bloco">
            <span class="cbl-meta-rotulo">Ciclo</span>
            <div class="cbl-meta-valor">08/09/2026 a 04/12/2026</div>
          </div>
          <div class="cbl-meta-bloco">
            <span class="cbl-meta-rotulo">Links Externos</span>
            <div class="cbl-meta-valor cbl-links-destaque">
              <a href="https://www.figma.com/board/CN1bghQyOzUgR2qvmANbe6/Challenge-18" target="_blank" rel="noopener noreferrer">${iconeLinkExterno()} FigJam C18</a>
              <a href="https://github.com/BlendOps/Frila" target="_blank" rel="noopener noreferrer">${iconeLinkExterno()} GitHub Frila</a>
            </div>
          </div>
        </div>

        <!-- Barra de Navegação Discreta por Âncoras -->
        <nav class="cbl-nav-ancoras" aria-label="Navegação rápida pelas seções do CBL">
          <span class="cbl-nav-legenda">Seções</span>
          <a href="#cbl-engage" class="cbl-link-ancora"><span class="cbl-ancora-num">01</span><span>Engage</span></a>
          <a href="#cbl-investigate" class="cbl-link-ancora"><span class="cbl-ancora-num">02</span><span>Investigate</span></a>
          <a href="#cbl-act" class="cbl-link-ancora"><span class="cbl-ancora-num">03</span><span>Act</span></a>
          <a href="#cbl-learning-goals" class="cbl-link-ancora"><span class="cbl-ancora-num">04</span><span>Learning Goals</span></a>
        </nav>
      </header>

      <!-- FASE 1: ENGAGE -->
      <section class="cbl-fase-secao cbl-fase-engage" id="cbl-engage" data-cbl-fase="engage">
        <div class="cbl-fase-topo">
          <div class="cbl-fase-tag">Fase 01</div>
          <h2 class="cbl-fase-nome">Engage</h2>
          <p class="cbl-fase-descricao">Definição da Big Idea, exploração de perguntas essenciais e formulação do desafio delimitado no tempo e no território.</p>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">1.1</span>
            <h3>Big Idea Generation</h3>
          </div>
          
          <div class="cbl-card-big-idea">
            <div class="cbl-big-idea-rotulo">Big Idea</div>
            <div class="cbl-big-idea-termo">Freelancer</div>
            <p class="cbl-big-idea-expl">O trabalho operacional sob demanda, a cobertura de turnos avulsos e a economia informal no setor de food service e eventos.</p>
          </div>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">1.2</span>
            <h3>Essential Questioning</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Reflexões iniciais levantadas pela equipe para mapear os pontos de atrito entre estabelecimentos e trabalhadores:</p>

          <div class="cbl-caixa-perguntas-essenciais">
            <div class="cbl-caixa-perguntas-topo">
              <span class="cbl-caixa-perguntas-rotulo">Essential Questions</span>
              <span class="cbl-caixa-perguntas-qtd">7 reflexões fundamentais</span>
            </div>
            <ol class="cbl-lista-perguntas-essenciais">
              ${dados.essentialQuestions.map((q, i) => `
                <li class="cbl-item-pergunta-essencial">
                  <span class="cbl-num-pergunta">${String(i + 1).padStart(2, '0')}</span>
                  <div class="cbl-texto-pergunta">${escapar(q)}</div>
                </li>
              `).join('')}
            </ol>
          </div>

          ${renderizarCardMarco({
            fase: 'engage',
            badge: 'Milestone CBL',
            titulo: 'Main Essential Question (Pergunta Essencial do Desafio)',
            destaque: 'Como estabelecimentos de food service e profissionais freelancers podem confiar um no outro rápido o suficiente para cobrir uma vaga que abre e fecha em poucas horas?',
            texto: '<p>Essa é a pergunta que melhor direciona o grupo, por três motivos: <strong>nomeia as duas pontas</strong> (e não só o contratante), <strong>carrega a restrição de tempo</strong> (que separa esse problema de recrutamento comum) e <strong>não presume a solução</strong>.</p>',
            id: 'marco-essential-question'
          })}

          ${renderizarCardMarco({
            fase: 'engage',
            badge: 'Milestone CBL',
            titulo: 'Challenge Statement',
            destaque: 'Tornar possível que um estabelecimento e um profissional que nunca trabalharam juntos fechem um turno com confiança suficiente para os dois, em menos de uma hora, no Distrito Federal.',
            texto: '<p>Fixa a restrição geográfica no <strong>Distrito Federal</strong> e impõe a métrica de tempo operacional de fechamento em menos de 60 minutos.</p>',
            id: 'marco-challenge-statement'
          })}
        </div>
      </section>

      <!-- FASE 2: INVESTIGATE -->
      <section class="cbl-fase-secao cbl-fase-investigate" id="cbl-investigate" data-cbl-fase="investigate">
        <div class="cbl-fase-topo">
          <div class="cbl-fase-tag">Fase 02</div>
          <h2 class="cbl-fase-nome">Investigate</h2>
          <p class="cbl-fase-descricao">Pesquisa empírica estruturada em três ciclos: Pesquisa Geral (dados setoriais), Pesquisa de Domínio (queixas em lojas de apps) e Benchmarking de Concorrência.</p>
        </div>

        <!-- 2.1 General Research -->
        <div class="cbl-bloco-conteudo" id="investigate-general">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">2.1</span>
            <h3>Ciclo Exploratório — General Research</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Levantamento em fontes setoriais públicas (Abrasel, ABRAPE, Sebrae, TSE) com separação rigorosa entre dado consolidado, relato e hipótese [H]:</p>

          ${renderizarTabelaPerguntas(dados.generalResearch.questions, 'tabela-gr-perguntas')}
          
          <div class="cbl-espaco-sm"></div>
          <h4>Atividade Registrada</h4>
          ${renderizarTabelaAtividade(dados.generalResearch.activity, 'tabela-gr-atividade')}

          <div class="cbl-sintese-card">
            <div class="cbl-sintese-topo">Síntese da Pesquisa Geral</div>
            <ul class="cbl-sintese-lista">
              <li><strong>Contratar é difícil e crônico:</strong> 90% dos empresários declaram dificuldade extrema e a rotatividade de 73,49% garante que o buraco na equipe se reabra constantemente.</li>
              <li><strong>O concorrente real é o WhatsApp:</strong> Custo zero, alcance em 98,3% dos smartphones e sem burocracia de cadastro. Qualquer solução compete contra essa fluidez.</li>
              <li><strong>Ausência de garantia vs. funcionar mal:</strong> O WhatsApp não tem garantia de comparecimento nem custódia, mas não há estudo independente que comprove falha em massa. A falta de garantias é o ponto de intervenção.</li>
              <li><strong>A grande lacuna é a frequência:</strong> Nenhuma fonte pública mede com precisão quantas vezes um estabelecimento do DF fica sem pessoal de última hora nem o prejuízo exato de um salão desfalcado. Esse dado sustenta a validação em campo.</li>
            </ul>
          </div>

          ${renderizarCardMarco({
            fase: 'investigate',
            badge: 'Milestone CBL',
            titulo: 'Challenge Statement Refinado',
            destaque: 'Tornar possível que um estabelecimento e um profissional que nunca trabalharam juntos fechem um turno com confiança suficiente para os dois, em menos de uma hora, no Distrito Federal.',
            texto: '<p>Ratificado após a pesquisa geral como o foco definitivo do projeto.</p>',
            id: 'marco-challenge-statement-refinado'
          })}
        </div>

        <!-- 2.2 Domain Research -->
        <div class="cbl-bloco-conteudo" id="investigate-domain">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">2.2</span>
            <h3>Ciclo Exploratório — Domain Research</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Mineração de avaliações públicas reais nas lojas Google Play e Apple App Store dos concorrentes (eStaff, Closeer, Switch, eFreela):</p>

          ${renderizarTabelaPerguntas(dados.domainResearch.questions, 'tabela-dr-perguntas')}

          <div class="cbl-espaco-sm"></div>
          <h4>Atividade Registrada</h4>
          ${renderizarTabelaAtividade(dados.domainResearch.activity, 'tabela-dr-atividade')}

          <div class="cbl-sintese-card">
            <div class="cbl-sintese-topo">Síntese do Domínio</div>
            <ul class="cbl-sintese-lista">
              <li><strong>A dor do trabalhador é a falta de acesso:</strong> A queixa unânime não é escassez de vagas, mas ser ignorado em marketplaces passivos ("centenas de inscritos para uma vaga", "clube fechado").</li>
              <li><strong>Barreira de onboarding afasta antes do trabalho:</strong> Selfies que não validam, falhas em OCR de documentos e desconfiança na entrega de dados pessoais barram profissionais qualificados logo no início.</li>
              <li><strong>Notificação não é acessório, é o core:</strong> Avisos de vaga que atrasam geram frustração imediata para quem depende da agilidade da diária para fechar o mês.</li>
              <li><strong>Assimetria extrema de satisfação:</strong> Apps do contratante exibem nota alta (ex: 4,9 na App Store), enquanto o app do trabalhador acumula queixas severas sobre chamados e remuneração.</li>
            </ul>
          </div>

          ${renderizarCardMarco({
            fase: 'investigate',
            badge: 'Milestone CBL',
            titulo: 'Personas Primárias',
            destaque: 'Lado Contratante: O Maître sob Estresse · Lado Trabalhador: Quem se Candidata e Nunca é Chamado',
            texto: `
              <div class="cbl-personas-grid">
                <div class="cbl-persona-item">
                  <div class="cbl-persona-topo">
                    <span class="cbl-persona-tag">Contratante</span>
                    <h5 class="cbl-persona-nome">O Maître sob estresse</h5>
                  </div>
                  <p>Trabalha no salão, não na sala. São 16h de uma sexta, faltou um garçom e o movimento começa em duas horas. Não é o dono, mas é quem sente o problema e escolhe a ferramenta: hoje, o grupo de WhatsApp. O que ele precisa não é de um banco de currículos, é de uma pessoa confirmada. Publicar uma vaga precisa levar menos de um minuto. <span class="cbl-persona-status">Proto-persona de desk research, ainda não validada em campo.</span></p>
                </div>
                <div class="cbl-persona-item">
                  <div class="cbl-persona-topo">
                    <span class="cbl-persona-tag">Profissional</span>
                    <h5 class="cbl-persona-nome">Quem se candidata e nunca é chamado</h5>
                  </div>
                  <p>Tem experiência real, muitas vezes anos dela, mas nenhum jeito de provar isso para um estabelecimento que não o conhece. Usa Android de entrada, com plano de dados limitado, e acompanha vários grupos de WhatsApp ao mesmo tempo. Já se cadastrou em pelo menos um app do setor e desistiu, seja porque nunca foi chamado, seja porque o cadastro travou. Não está implorando por qualquer vaga: escolhe, e a diária avulsa paga melhor que o dia de CLT. <span class="cbl-persona-status">Proto-persona, ainda não validada em campo.</span></p>
                </div>
              </div>
            `,
            id: 'marco-persona'
          })}
        </div>

        <!-- 2.3 Business Research & Benchmarking -->
        <div class="cbl-bloco-conteudo" id="investigate-business">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">2.3</span>
            <h3>Ciclo Exploratório — Business Research &amp; Benchmarking de Concorrência</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Mapeamento detalhado de 14 players (GetNinjas, Switch, Closeer, eStaff, eFreela, Worc, Toopa, Instawork, Fiverr):</p>

          ${renderizarTabelaPerguntas(dados.benchmarking.questions, 'tabela-bm-perguntas')}

          <div class="cbl-espaco-sm"></div>
          <h4>Atividade Registrada</h4>
          ${renderizarTabelaAtividade(dados.benchmarking.activity, 'tabela-bm-atividade')}

          <div class="cbl-sintese-card">
            <div class="cbl-sintese-topo">Síntese de Negócios e Concorrência</div>
            <ul class="cbl-sintese-lista">
              <li><strong>O Distrito Federal está sem concorrência especializada:</strong> Quase todas as plataformas focam no eixo Rio-SP. No DF, apenas o GetNinjas possui indexação genérica, sem nenhum foco no food service imediato.</li>
              <li><strong>"Cadastro não é liquidez":</strong> É a falha estrutural do modelo de marketplace passivo. Plataformas que anunciam centenas de milhares de cadastros não entregam velocidade de preenchimento quando o turno é urgente.</li>
              <li><strong>Custo zero para o profissional é premissa moral e econômica:</strong> Cobrar do trabalhador ou reter percentual de sua diária gera revolta nas avaliações e incentiva a desintermediação (troca de contatos fora da plataforma).</li>
            </ul>
          </div>

          ${renderizarCardMarco({
            fase: 'investigate',
            badge: 'Milestone CBL',
            titulo: 'Modelo de Negócios (Frila)',
            destaque: 'SaaS B2B &amp; Taxa de Conexão (Pay-per-Match) cobrado exclusivamente do contratante, sem intermediação nem custódia financeira da diária.',
            texto: `
              <ul class="cbl-modelo-pilares">
                <li><strong>Custo Zero para o Profissional:</strong> Sem taxa de cadastro, de uso ou de saque. A diária é combinada no anúncio e paga diretamente no local (Pix direto ou dinheiro), eliminando regulação bancária e passivos trabalhistas.</li>
                <li><strong>Cobrança por Conexão (Fase 1 - MVP):</strong> Taxa de R$ 15,00 a R$ 20,00 por turno preenchido com sucesso. Vagas não atendidas não geram cobrança.</li>
                <li><strong>Assinatura Recorrente (Fase 2):</strong> Planos de R$ 149 a R$ 249/mês para bares e buffets com alto volume de turnos semanais.</li>
                <li><strong>Unit Economics no DF:</strong> Custos variáveis de ~R$ 1,50 (cloud e mensageria) gerando margem de contribuição de ~90% (R$ 13,50 a R$ 18,50 líquidos por turno). Ponto de equilíbrio atingido com menos de 5 turnos diários no DF inteiro.</li>
              </ul>
            `,
            id: 'marco-modelo-negocios'
          })}
        </div>
      </section>

      <!-- FASE 3: ACT -->
      <section class="cbl-fase-secao cbl-fase-act" id="cbl-act" data-cbl-fase="act">
        <div class="cbl-fase-topo">
          <div class="cbl-fase-tag">Fase 03</div>
          <h2 class="cbl-fase-nome">Act</h2>
          <p class="cbl-fase-descricao">Materialização da solução Frila, arquitetura técnica, prototipagem, validação de campo e documentos de engenharia de software.</p>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">3.1</span>
            <h3>Solution Concept</h3>
          </div>

          ${renderizarCardMarco({
            fase: 'act',
            badge: 'Milestone CBL',
            titulo: 'Solution Concept — Frila',
            destaque: 'Uma plataforma horizontal de despacho ativo por turno avulso para profissionais operacionais, com foco inicial nos setores de maior urgência e densidade do DF (food service, eventos e campanhas), viabilizando fechamento em menos de 1 hora com confiança mútua.',
            texto: `
              <p>Os três pilares da solução respondem diretamente às evidências empíricas coletadas:</p>
              <ol>
                <li><strong>Despacho Ativo por Proximidade:</strong> Resolve a queixa <em>"cadastro não é liquidez"</em> ao levar a oportunidade diretamente aos profissionais elegíveis em raio curto, em vez de esperar que naveguem passivamente.</li>
                <li><strong>Reputação Binária e Taxa de Comparecimento:</strong> Resolve a escassez de confiança através de métricas objetivas (turnos concluídos com sucesso e pontualidade), dispensando currículos extensos.</li>
                <li><strong>Sem Custódia Financeira (Custo Zero para o Trabalhador):</strong> Protege a margem do trabalhador e desonera a plataforma de atritos regulatórios bancários.</li>
              </ol>
            `,
            id: 'marco-solution-concept'
          })}
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">3.2</span>
            <h3>Engenharia de Software &amp; Documentos de Produto</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Os entregáveis técnicos derivados do Act estão integrados à Bancada e podem ser acessados diretamente:</p>

          <div class="cbl-links-produtos-grid">
            <a href="01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-visao.html" class="cbl-card-doc-ref">
              <span class="cbl-doc-ref-icone">${iconeVisao()}</span>
              <div class="cbl-doc-ref-corpo">
                <span class="cbl-doc-ref-badge">Milestone Engenharia</span>
                <strong>Documento de Visão</strong>
                <p>Alinhamento de escopo, personas e proposta de valor do Frila.</p>
              </div>
            </a>

            <a href="01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-requisitos.html" class="cbl-card-doc-ref">
              <span class="cbl-doc-ref-icone">${iconeRequisitos()}</span>
              <div class="cbl-doc-ref-corpo">
                <span class="cbl-doc-ref-badge">Milestone Engenharia</span>
                <strong>Documento de Requisitos</strong>
                <p>Requisitos funcionais, não-funcionais e regras de negócio.</p>
              </div>
            </a>

            <a href="01-cbl-desafios-c18-documentos-de-produto-frila-historias-de-usuario-e-backlog.html" class="cbl-card-doc-ref">
              <span class="cbl-doc-ref-icone">${iconeBacklog()}</span>
              <div class="cbl-doc-ref-corpo">
                <span class="cbl-doc-ref-badge">Milestone Engenharia</span>
                <strong>Histórias de Usuário &amp; Backlog</strong>
                <p>User stories detalhadas com critérios de aceite e priorização MoSCoW.</p>
              </div>
            </a>
          </div>

          <div class="cbl-bloco-milestones-tecnicos">
            <div class="cbl-item-milestone-tec">
              <span class="cbl-tec-badge">Diagramas</span>
              <strong>Diagramas de Casos de Uso &amp; Classes:</strong> Modelação conceitual dos fluxos de solicitação de turno, despacho push, aceite e confirmação por geofencing.
            </div>
            <div class="cbl-item-milestone-tec">
              <span class="cbl-tec-badge">Dados</span>
              <strong>Modelagem de Banco de Dados:</strong> Entidades relacionais separando Contratante, Freelancer, Vaga, Turno e Eventos de Auditoria.
            </div>
            <div class="cbl-item-milestone-tec">
              <span class="cbl-tec-badge">Arquitetura</span>
              <strong>Diagrama de Arquitetura:</strong> Stack moderna com front-end mobile nativo em Swift/iOS e backend modular em microsserviços.
            </div>
          </div>
        </div>
      </section>

      <!-- FASE 4: OBJETIVOS DE APRENDIZAGEM & COMPETÊNCIAS -->
      <section class="cbl-fase-secao cbl-fase-goals" id="cbl-learning-goals" data-cbl-fase="learning-goals">
        <div class="cbl-fase-topo">
          <div class="cbl-fase-tag">Fase 04</div>
          <h2 class="cbl-fase-nome">Learning Goals &amp; Competências</h2>
          <p class="cbl-fase-descricao">Mapeamento dos 22 objetivos de aprendizagem do ciclo CBL, divididos em Design, Negócios e Inteligência Artificial, sustentados pela rubrica de progressão pedagógica da Apple Developer Academy.</p>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">4.1</span>
            <h3>Rubrica de Níveis de Competência</h3>
          </div>

          <div class="tabela-cbl-wrapper">
            <table class="tabela-cbl tabela-cbl-rubrica">
              <thead>
                <tr>
                  <th style="width: 25%;">Nível</th>
                  <th style="width: 75%;">Critério de Evidência &amp; Domínio</th>
                </tr>
              </thead>
              <tbody>
                ${rubricRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">4.2</span>
            <h3>Os 22 Objetivos de Aprendizagem Detalhados</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Competências desenvolvidas e evidenciadas na prática durante a execução do Challenge 18:</p>

          ${goalsHtml}
        </div>
      </section>
    </article>
  `;
}

module.exports = {
  renderizarDocumentoCBL
};
