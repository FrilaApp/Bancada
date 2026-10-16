// Construtor do documento HTML semântico e interativo do CBL (Challenge 18).
// Estética minimalista e essencialista inspirada em Raphael Salaja (Design Engineer):
// - Containerless / Borderless: Conteúdo aberto diretamente no canvas, sem "card soup".
// - Tipografia editorial expressiva: Grandes manifestos tipográficos (pull-quotes) para Big Idea,
//   Challenge Statements e Milestones.
// - Colofão editorial fluido com metadados e links discretos em vez de caixinhas.
// - Tabelas e listas abertas com divisores hairline (1px) e micro-interações táteis no estilo Library.
// - Índice refinado para os 22 Learning Goals com numeração mono tabular.

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

function renderizarDeclaracaoMarco({ rotulo, titulo, destaque, texto, id, classeExtra = '' }) {
  return `
    <div class="cbl-declaracao-marco ${classeExtra}" id="${id}" data-cbl-marco="${id}">
      <div class="cbl-declaracao-eyebrow">
        <span class="cbl-declaracao-rotulo">${escapar(rotulo)}</span>
        ${titulo ? `<span class="cbl-declaracao-sep">/</span><span class="cbl-declaracao-titulo">${escapar(titulo)}</span>` : ''}
      </div>
      ${destaque ? `<div class="cbl-declaracao-destaque">${destaque}</div>` : ''}
      ${texto ? `<div class="cbl-declaracao-texto">${texto}</div>` : ''}
    </div>
  `;
}

function renderizarTabelaPerguntas(perguntas, idTabela) {
  const linhas = perguntas.map((p, i) => {
    let fonteHtml = '';
    if (p.link) {
      fonteHtml = `<a href="${escapar(p.link.url)}" target="_blank" rel="noopener noreferrer" class="cbl-link-fonte" title="Abrir fonte original">${escapar(p.link.label)} <span class="cbl-seta" aria-hidden="true">↗</span></a>`;
    } else if (p.fonte && p.fonte.toLowerCase().includes('sem fonte')) {
      fonteHtml = `<span class="cbl-sem-fonte">Sem fonte pública</span>`;
    } else if (p.fonte) {
      fonteHtml = `<span class="cbl-texto-fonte">${escapar(p.fonte)}</span>`;
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
    <div class="cbl-tabela-container" id="${idTabela}">
      <table class="cbl-tabela-aberta cbl-tabela-perguntas">
        <thead>
          <tr>
            <th style="width: 76%;">Guiding Questions &amp; Respostas</th>
            <th style="width: 24%;">Fonte / Referência</th>
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
    <div class="cbl-atividade-registro" id="${idTabela}">
      <div class="cbl-atividade-col cbl-col-principal">
        <span class="cbl-meta-rotulo">Atividade</span>
        <span class="cbl-atividade-valor"><strong>${escapar(atividade.atividade)}</strong></span>
      </div>
      <div class="cbl-atividade-col cbl-col-data">
        <span class="cbl-meta-rotulo">Data</span>
        <span class="cbl-atividade-valor"><time>${escapar(atividade.data)}</time></span>
      </div>
      <div class="cbl-atividade-col cbl-col-recursos">
        <span class="cbl-meta-rotulo">Recursos</span>
        <span class="cbl-atividade-valor">${escapar(atividade.recursos)}</span>
      </div>
      <div class="cbl-atividade-col cbl-col-feedback">
        <span class="cbl-meta-rotulo">Feedback &amp; Aprendizado</span>
        <span class="cbl-atividade-valor">${escapar(atividade.feedback)}</span>
      </div>
    </div>
  `;
}

function renderizarDocumentoCBL(base = '../') {
  const dados = carregarDados();
  const pdfHref = `${base}midia/01 - CBL/Desafios/C18/Documentos/CBL_C18.pdf`;
  const prefixoNotas = base === '' ? 'notas/' : '';

  // Mapeamento das 3 categorias dos 22 Learning Goals
  const categoriasGoals = [
    {
      categoria: 'Design & Experiência',
      indices: [0, 1, 2, 3, 4, 5] // Design System, Consistency, IA no Design, Iteração, UI Doc, Acessibilidade
    },
    {
      categoria: 'Produto, Negócios & Legal',
      indices: [6, 7, 8, 9, 10] // Business, Product Strategy, Marketing, Empreendedorismo, Legal
    },
    {
      categoria: 'Inteligência Artificial & Engenharia',
      indices: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] // Fundamentos IA, Prompt, AI-Assisted, Rules, Tools, RAG, Agentes, Multi-Agent, Arquitetura IA, Avaliação, Mobile IA
    }
  ];

  let goalsHtml = '';
  categoriasGoals.forEach((cat) => {
    const rows = cat.indices.map(idx => {
      const g = dados.learningGoals[idx];
      if (!g) return '';
      const itens = g.objetivos.map(obj => `<li>${escapar(obj)}</li>`).join('');
      return `
        <article class="cbl-library-item" id="goal-${idx + 1}">
          <div class="cbl-library-item-topo">
            <span class="cbl-library-num">${String(idx + 1).padStart(2, '0')}</span>
            <div class="cbl-library-item-corpo">
              <div class="cbl-library-item-linha">
                <h4 class="cbl-library-item-titulo">${escapar(g.titulo)}</h4>
                <span class="cbl-library-item-cat">${escapar(cat.categoria)}</span>
              </div>
              <p class="cbl-library-item-desc">${escapar(g.descricao)}</p>
              <div class="cbl-library-item-objetivos">
                <span class="cbl-library-obj-rotulo">Learning Objectives</span>
                <ul class="cbl-library-obj-lista">${itens}</ul>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    goalsHtml += `
      <div class="cbl-library-secao">
        <div class="cbl-library-secao-header">
          <span class="cbl-library-cat-titulo">${cat.categoria}</span>
          <span class="cbl-library-cat-contagem">${String(cat.indices.length).padStart(2, '0')} metas</span>
        </div>
        <div class="cbl-library-lista">
          ${rows}
        </div>
      </div>
    `;
  });

  const rubricRowsHtml = dados.rubric.map(r => `
    <tr class="cbl-linha-rubrica">
      <td class="cbl-rubrica-nivel"><span class="cbl-rubrica-tag">${escapar(r.nivel)}</span></td>
      <td class="cbl-rubrica-desc">${escapar(r.descricao)}</td>
    </tr>
  `).join('');

  return `
    <article class="cbl-documento" id="cbl-documento-oficial" data-novidades-raiz data-novidades-chave="documento-cbl">
      <!-- Masthead / Colofão Editorial do Documento (Inspirado em Raphael Salaja) -->
      <header class="cbl-masthead-doc">
        <div class="cbl-masthead-eyebrow" data-novidades="ignorar">
          <span class="cbl-masthead-rotulo"><span class="cbl-eyebrow-item">Documento Oficial</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">Apple Developer Academy</span><span class="cbl-ponto-sep" aria-hidden="true"></span><span class="cbl-eyebrow-item">CBL</span></span>
          <a href="${pdfHref}" class="cbl-masthead-pdf" download="CBL_C18.pdf" title="Baixar PDF original de 28 páginas (9.1 MB)">
            <span>PDF Original (28p<span class="cbl-ponto-sep" aria-hidden="true"></span>9.1 MB)</span>
            <span class="cbl-seta" aria-hidden="true">↗</span>
          </a>
        </div>

        <h1 class="cbl-masthead-titulo">Documento Oficial CBL — Challenge 18</h1>
        <p class="nov-resumo" data-nov-resumo data-novidades="ignorar" hidden></p>
        <p class="cbl-masthead-lead">Framework Challenge Based Learning aplicado à concepção, pesquisa empírica de mercado e especificação técnica do produto <strong>Frila</strong>.</p>

        <!-- Colofão Editorial Aberto (Zero Containers Artificiais) -->
        <div class="cbl-colofao" data-novidades="ignorar">
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Equipe BlendOps</span>
            <div class="cbl-colofao-valor">
              <span>Cauê Carneiro</span>, <span>Fabrício Tosta</span>, <span>João Paulo</span>, <span>Júlia Clovandi</span>, <span>Matheus Silva</span>
            </div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Mentores</span>
            <div class="cbl-colofao-valor">Felipe Carvalho, Victor Zerefos</div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Ciclo</span>
            <div class="cbl-colofao-valor"><time datetime="2026-09-08">08/09/2026</time> — <time datetime="2026-12-04">04/12/2026</time></div>
          </div>
          <div class="cbl-colofao-item">
            <span class="cbl-colofao-rotulo">Recursos</span>
            <div class="cbl-colofao-valor cbl-colofao-links">
              <a href="https://www.figma.com/board/CN1bghQyOzUgR2qvmANbe6/Challenge-18" target="_blank" rel="noopener noreferrer">FigJam C18 <span class="cbl-seta" aria-hidden="true">↗</span></a>
              <span class="cbl-colofao-sep">/</span>
              <a href="https://github.com/BlendOps/Frila" target="_blank" rel="noopener noreferrer">GitHub Frila <span class="cbl-seta" aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>

        <!-- Navegação por Seções Minimalista e Aberta -->
        <nav class="cbl-nav-ancoras" data-novidades="ignorar" aria-label="Navegação rápida pelas seções do CBL">
          <span class="cbl-nav-legenda">Seções</span>
          <a href="#cbl-engage" class="cbl-link-ancora"><span class="cbl-ancora-num">01</span> Engage</a>
          <span class="cbl-ancora-sep">/</span>
          <a href="#cbl-investigate" class="cbl-link-ancora"><span class="cbl-ancora-num">02</span> Investigate</a>
          <span class="cbl-ancora-sep">/</span>
          <a href="#cbl-act" class="cbl-link-ancora"><span class="cbl-ancora-num">03</span> Act</a>
          <span class="cbl-ancora-sep">/</span>
          <a href="#cbl-learning-goals" class="cbl-link-ancora"><span class="cbl-ancora-num">04</span> Learning Goals</a>
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
          <!-- Big Idea como Declaração Tipográfica Aberta (Sem Caixotismo) -->
          <div class="cbl-declaracao-marco cbl-declaracao-big-idea" id="marco-big-idea">
            <div class="cbl-declaracao-eyebrow">
              <span class="cbl-declaracao-rotulo">1.1 / Big Idea Generation</span>
            </div>
            <div class="cbl-declaracao-destaque cbl-big-idea-destaque">Freelancer</div>
            <div class="cbl-declaracao-texto">
              <p>O trabalho operacional sob demanda, a cobertura de turnos avulsos e a economia informal no setor de food service e eventos.</p>
            </div>
          </div>
        </div>

        <div class="cbl-bloco-conteudo">
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">1.2</span>
            <h3>Essential Questioning</h3>
          </div>
          <p class="cbl-paragrafo-apoio">Reflexões iniciais levantadas pela equipe para mapear os pontos de atrito entre estabelecimentos e trabalhadores:</p>

          <!-- Perguntas Essenciais Abertas com Numeração Tabular -->
          <div class="cbl-essenciais-bloco">
            <div class="cbl-essenciais-topo">
              <span class="cbl-meta-rotulo">Essential Questions</span>
              <span class="cbl-essenciais-contagem">07 reflexões fundamentais</span>
            </div>
            <div class="cbl-essenciais-lista">
              ${dados.essentialQuestions.map((q, i) => `
                <div class="cbl-essencial-linha">
                  <span class="cbl-essencial-num">${String(i + 1).padStart(2, '0')}</span>
                  <div class="cbl-essencial-texto">${escapar(q)}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Main Essential Question como Manifesto Tipográfico -->
          ${renderizarDeclaracaoMarco({
            rotulo: 'Milestone CBL',
            titulo: 'Main Essential Question',
            destaque: 'Como estabelecimentos de food service e profissionais freelancers podem confiar um no outro rápido o suficiente para cobrir uma vaga que abre e fecha em poucas horas?',
            texto: '<p>Essa é a pergunta que melhor direciona o grupo, por três motivos: <strong>nomeia as duas pontas</strong> (e não só o contratante), <strong>carrega a restrição de tempo</strong> (que separa esse problema de recrutamento comum) e <strong>não presume a solução</strong>.</p>',
            id: 'marco-essential-question'
          })}

          <!-- Challenge Statement como Manifesto Tipográfico -->
          ${renderizarDeclaracaoMarco({
            rotulo: 'Milestone CBL',
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

          <div class="cbl-espaco-md"></div>
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">Registro</span>
            <h3>Atividade em Campo / Desk</h3>
          </div>
          ${renderizarTabelaAtividade(dados.generalResearch.activity, 'tabela-gr-atividade')}

          <!-- Síntese Aberta -->
          <div class="cbl-sintese-bloco">
            <div class="cbl-sintese-rotulo">Síntese da Pesquisa Geral</div>
            <ul class="cbl-sintese-lista">
              <li><strong>Contratar é difícil e crônico:</strong> 90% dos empresários declaram dificuldade extrema e a rotatividade de 73,49% garante que o buraco na equipe se reabra constantemente.</li>
              <li><strong>O concorrente real é o WhatsApp:</strong> Custo zero, alcance em 98,3% dos smartphones e sem burocracia de cadastro. Qualquer solução compete contra essa fluidez.</li>
              <li><strong>Ausência de garantia vs. funcionar mal:</strong> O WhatsApp não tem garantia de comparecimento nem custódia, mas não há estudo independente que comprove falha em massa. A falta de garantias é o ponto de intervenção.</li>
              <li><strong>A grande lacuna é a frequência:</strong> Nenhuma fonte pública mede com precisão quantas vezes um estabelecimento do DF fica sem pessoal de última hora nem o prejuízo exato de um salão desfalcado. Esse dado sustenta a validação em campo.</li>
            </ul>
          </div>

          ${renderizarDeclaracaoMarco({
            rotulo: 'Milestone CBL',
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

          <div class="cbl-espaco-md"></div>
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">Registro</span>
            <h3>Atividade em Campo / Desk</h3>
          </div>
          ${renderizarTabelaAtividade(dados.domainResearch.activity, 'tabela-dr-atividade')}

          <div class="cbl-sintese-bloco">
            <div class="cbl-sintese-rotulo">Síntese do Domínio</div>
            <ul class="cbl-sintese-lista">
              <li><strong>A dor do trabalhador é a falta de acesso:</strong> A queixa unânime não é escassez de vagas, mas ser ignorado em marketplaces passivos ("centenas de inscritos para uma vaga", "clube fechado").</li>
              <li><strong>Barreira de onboarding afasta antes do trabalho:</strong> Selfies que não validam, falhas em OCR de documentos e desconfiança na entrega de dados pessoais barram profissionais qualificados logo no início.</li>
              <li><strong>Notificação não é acessório, é o core:</strong> Avisos de vaga que atrasam geram frustração imediata para quem depende da agilidade da diária para fechar o mês.</li>
              <li><strong>Assimetria extrema de satisfação:</strong> Apps do contratante exibem nota alta (ex: 4,9 na App Store), enquanto o app do trabalhador acumula queixas severas sobre chamados e remuneração.</li>
            </ul>
          </div>

          <!-- Personas em Apresentação Tipográfica Aberta -->
          ${renderizarDeclaracaoMarco({
            rotulo: 'Milestone CBL',
            titulo: 'Personas Primárias',
            destaque: 'Lado Contratante: O Maître sob Estresse <span class="cbl-ponto-sep" aria-hidden="true"></span> Lado Trabalhador: Quem se Candidata e Nunca é Chamado',
            texto: `
              <div class="cbl-personas-container">
                <div class="cbl-persona-coluna">
                  <div class="cbl-persona-eyebrow">
                    <span class="cbl-meta-rotulo">Contratante</span>
                  </div>
                  <h4 class="cbl-persona-nome">O Maître sob estresse</h4>
                  <p class="cbl-persona-desc">Trabalha no salão, não na sala. São 16h de uma sexta, faltou um garçom e o movimento começa em duas horas. Não é o dono, mas é quem sente o problema e escolhe a ferramenta: hoje, o grupo de WhatsApp. O que ele precisa não é de um banco de currículos, é de uma pessoa confirmada. Publicar uma vaga precisa levar menos de um minuto.</p>
                  <span class="cbl-persona-status">Proto-persona de desk research, ainda não validada em campo.</span>
                </div>
                <div class="cbl-persona-coluna">
                  <div class="cbl-persona-eyebrow">
                    <span class="cbl-meta-rotulo">Profissional</span>
                  </div>
                  <h4 class="cbl-persona-nome">Quem se candidata e nunca é chamado</h4>
                  <p class="cbl-persona-desc">Tem experiência real, muitas vezes anos dela, mas nenhum jeito de provar isso para um estabelecimento que não o conhece. Usa Android de entrada, com plano de dados limitado, e acompanha vários grupos de WhatsApp ao mesmo tempo. Já se cadastrou em pelo menos um app do setor e desistiu, seja porque nunca foi chamado, seja porque o cadastro travou. Não está implorando por qualquer vaga: escolhe, e a diária avulsa paga melhor que o dia de CLT.</p>
                  <span class="cbl-persona-status">Proto-persona, ainda não validada em campo.</span>
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

          <div class="cbl-espaco-md"></div>
          <div class="cbl-subcabecalho">
            <span class="cbl-num-secao">Registro</span>
            <h3>Atividade em Campo / Desk</h3>
          </div>
          ${renderizarTabelaAtividade(dados.benchmarking.activity, 'tabela-bm-atividade')}

          <div class="cbl-sintese-bloco">
            <div class="cbl-sintese-rotulo">Síntese de Negócios e Concorrência</div>
            <ul class="cbl-sintese-lista">
              <li><strong>O Distrito Federal está sem concorrência especializada:</strong> Quase todas as plataformas focam no eixo Rio-SP. No DF, apenas o GetNinjas possui indexação genérica, sem nenhum foco no food service imediato.</li>
              <li><strong>"Cadastro não é liquidez":</strong> É a falha estrutural do modelo de marketplace passivo. Plataformas que anunciam centenas de milhares de cadastros não entregam velocidade de preenchimento quando o turno é urgente.</li>
              <li><strong>Custo zero para o profissional é premissa moral e econômica:</strong> Cobrar do trabalhador ou reter percentual de sua diária gera revolta nas avaliações e incentiva a desintermediação (troca de contatos fora da plataforma).</li>
            </ul>
          </div>

          ${renderizarDeclaracaoMarco({
            rotulo: 'Milestone CBL',
            titulo: 'Modelo de Negócios (Frila)',
            destaque: 'Piloto e v1.0 gratuitos. Hipótese para depois do piloto: SaaS B2B &amp; Taxa de Conexão (Pay-per-Match) cobrado exclusivamente do contratante, sem intermediação nem custódia financeira da diária.',
            texto: `
              <ul class="cbl-modelo-pilares">
                <li><strong>Custo Zero para o Profissional:</strong> Sem taxa de cadastro, de uso ou de saque. A diária é combinada no anúncio e paga diretamente no local (Pix direto ou dinheiro), eliminando regulação bancária e passivos trabalhistas.</li>
                <li><strong>Cobrança por Conexão (hipótese, depois do piloto):</strong> Taxa de R$ 15,00 a R$ 20,00 por turno preenchido com sucesso. Vagas não atendidas não geram cobrança.</li>
                <li><strong>Assinatura Recorrente (hipótese, depois do piloto):</strong> Planos de R$ 149 a R$ 249/mês para bares e buffets com alto volume de turnos semanais.</li>
                <li><strong>Unit Economics no DF (hipótese, depois do piloto):</strong> Custos variáveis de ~R$ 1,50 (cloud e mensageria) gerando margem de contribuição de ~90% (R$ 13,50 a R$ 18,50 líquidos por turno). Ponto de equilíbrio estimado com menos de 5 turnos diários no DF inteiro.</li>
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
          ${renderizarDeclaracaoMarco({
            rotulo: '3.1 / Milestone CBL',
            titulo: 'Solution Concept — Frila',
            destaque: 'Uma plataforma horizontal de despacho ativo por turno avulso para profissionais operacionais, com foco inicial nos setores de maior urgência e densidade do DF (food service, eventos e campanhas), viabilizando fechamento em menos de 1 hora com confiança mútua.',
            texto: `
              <p>Os três pilares da solução respondem diretamente às evidências empíricas coletadas:</p>
              <ol class="cbl-pilares-lista">
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
          <p class="cbl-paragrafo-apoio">Entregáveis técnicos do Act integrados à Bancada, acessíveis com navegação direta:</p>

          <!-- Documentos de Produto em Lista Editorial Aberta (Zero Caixas / Zero Badges Pesados) -->
          <div class="cbl-doc-refs-lista">
            <a href="${prefixoNotas}01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-visao.html" class="cbl-doc-ref-item">
              <div class="cbl-doc-ref-corpo">
                <div class="cbl-doc-ref-meta">
                  <span class="cbl-meta-rotulo">Milestone Engenharia</span>
                  <strong class="cbl-doc-ref-nome">Documento de Visão</strong>
                </div>
                <p class="cbl-doc-ref-resumo">Alinhamento de escopo, personas e proposta de valor do Frila.</p>
              </div>
              <span class="cbl-seta cbl-seta-acao" aria-hidden="true">→</span>
            </a>

            <a href="${prefixoNotas}01-cbl-desafios-c18-documentos-de-produto-frila-documento-de-requisitos.html" class="cbl-doc-ref-item">
              <div class="cbl-doc-ref-corpo">
                <div class="cbl-doc-ref-meta">
                  <span class="cbl-meta-rotulo">Milestone Engenharia</span>
                  <strong class="cbl-doc-ref-nome">Documento de Requisitos</strong>
                </div>
                <p class="cbl-doc-ref-resumo">Requisitos funcionais, não-funcionais e regras de negócio.</p>
              </div>
              <span class="cbl-seta cbl-seta-acao" aria-hidden="true">→</span>
            </a>

            <a href="${prefixoNotas}01-cbl-desafios-c18-documentos-de-produto-frila-historias-de-usuario-e-backlog.html" class="cbl-doc-ref-item">
              <div class="cbl-doc-ref-corpo">
                <div class="cbl-doc-ref-meta">
                  <span class="cbl-meta-rotulo">Milestone Engenharia</span>
                  <strong class="cbl-doc-ref-nome">Histórias de Usuário &amp; Backlog</strong>
                </div>
                <p class="cbl-doc-ref-resumo">User stories detalhadas com critérios de aceite e priorização MoSCoW.</p>
              </div>
              <span class="cbl-seta cbl-seta-acao" aria-hidden="true">→</span>
            </a>
          </div>

          <!-- Milestones Técnicos em Linhas Abertas -->
          <div class="cbl-milestones-tecnicos-lista">
            <div class="cbl-milestone-tec-linha">
              <span class="cbl-meta-rotulo">Diagramas</span>
              <div class="cbl-milestone-tec-corpo">
                <strong>Diagramas de Casos de Uso &amp; Classes:</strong> Modelação conceitual dos fluxos de solicitação de turno, despacho push, aceite e confirmação por geofencing.
              </div>
            </div>
            <div class="cbl-milestone-tec-linha">
              <span class="cbl-meta-rotulo">Dados</span>
              <div class="cbl-milestone-tec-corpo">
                <strong>Modelagem de Banco de Dados:</strong> Entidades relacionais separando Contratante, Freelancer, Vaga, Turno e Eventos de Auditoria.
              </div>
            </div>
            <div class="cbl-milestone-tec-linha">
              <span class="cbl-meta-rotulo">Arquitetura</span>
              <div class="cbl-milestone-tec-corpo">
                <strong>Diagrama de Arquitetura:</strong> Stack moderna com front-end mobile nativo em Swift/iOS e backend modular em microsserviços.
              </div>
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

          <div class="cbl-tabela-container">
            <table class="cbl-tabela-aberta cbl-rubrica-tabela">
              <thead>
                <tr>
                  <th style="width: 22%;">Nível</th>
                  <th style="width: 78%;">Critério de Evidência &amp; Domínio</th>
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
          <p class="cbl-paragrafo-apoio">Índice editorial de competências desenvolvidas e evidenciadas na prática durante o Challenge 18:</p>

          <!-- Índice Editorial Refinado (Estilo Library de Raphael Salaja) -->
          ${goalsHtml}
        </div>
      </section>
    </article>
  `;
}

module.exports = {
  renderizarDocumentoCBL
};
