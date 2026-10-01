---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/grupo-4-sintese.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Síntese do Grupo 4: Bicos e Aplicativos Menores

**Data:** 01 de outubro de 2026  
**Responsável:** Worker Antigravity 2  
**Repositório:** `FrilaApp/frila-docs`  
**Branch:** `pesquisa/concorrentes-grupo-4`  
**Apps Analisados:** Bicos, BIKO, Trampei Serviços, JobHunter (Freelances e Bicos) e Meu Freelance.

---

## 1. Contexto e Perfil do Grupo 4

O **Grupo 4** reúne os entrantes recentes, micro-marketplaces e aplicativos da cauda longa brasileira focados em "bicos", trabalho eventual e freelancers operacionais. Diferente dos líderes de staffing corporativo (Grupo 1) ou dos marketplaces consolidados de serviços (Grupo 2), o Grupo 4 é caracterizado por:
- Operações enxutas, sem investimento externo encontrado, de desenvolvedores individuais, pequenas empresas ou de uma empresa ligada a uma holding (BIKO), em Americana, Barueri, Santo Anastácio, Uberlândia e Niterói.
- Primeiras versões entre 2024 (JobHunter, no Android desde pelo menos setembro de 2024) e 2026 (Meu Freelance, BIKO no iOS).
- Forte apelo popular de linguagem (*"bicos"*, *"trampo"*, *"freela descomplicado"*, *"sem pegadinha"*).
- Tração polarizada: um player com mais de 52 mil cadastrados declarados, taxa zero e grupos de WhatsApp (JobHunter), um player técnico com boa proposta em eventos e PIX rápido (BIKO), e três aplicativos pequenos: Bicos (sem tração pública), Trampei (site fora do ar e queixas de login) e Meu Freelance (domínio expirado e sinais de abandono). Bicos e Trampei seguem recebendo atualizações em 2026.

---

## 2. Tabela Comparativa do Grupo 4

| App | Desenvolvedor / Empresa | Quem Paga | Quanto (Preço / Taxa) | Pagamento no App? | Cobertura Declarada | Presença Ativa no DF? | Nota e Avaliações (Lojas) | Tração Pública | Features-Chave |
|---|---|---|---|---|---|---|---|---|---|
| **Bicos** (`app.bicos`) | Hybriun Desenvolvimento LTDA (domínio em nome de Vitor Facioli) | Contratante | Taxa não divulgada (buscado em: lojas, site e política de privacidade); cadastro grátis para o profissional | **Sim** (Cartão de crédito com custódia/*escrow*) | Não declarada (a captura mostra endereço de exemplo em Vitória da Conquista, BA) | **Sem evidência** (buscado em: site, lojas e termos) | iOS: 0 avaliações<br>Android: sem nota exibida (1 avaliação com texto, 1 estrela) | 1.000+ downloads (Google Play) | Custódia no cartão, liberação após aceite, chat com fotos, filtros regionais |
| **BIKO** (`br.net.biko.app`) | BIKO Tecnologia e Serviços LTDA (Barueri/SP; sócios incluem a BRK) | Contratante (Empresa) | Diária + % de taxa de serviço negociada, paga com créditos pré-pagos (percentual não publicado); cobrança do trabalhador não mencionada no FAQ | **Sim** (Carteira in-app; PIX em minutos depois que a empresa libera, em até 1 dia útil) | Não declarada (indícios de São Paulo: captura, DDD 11, sede em Barueri) | **Sem evidência** (buscado em: lojas, FAQ e site) | iOS: 4,3 (4 reviews)<br>Android: 3,5 (50 reviews) | 1.000+ downloads (Google Play) | Contagem regressiva para início do turno, check-in por GPS, PIX rápido (relatado em menos de 20 min por usuário na Google Play [4]), histórico de turnos |
| **Trampei** (`com.trampreiservicos.ltda`) | Trampei Serviços (Gustavo Barreto) | Profissional e empresa | Plano Profissional R$ 29,90 e Plano Empresarial R$ 99,90 (assinaturas na App Store; o que liberam não é publicado) | **Não** (pagamento do serviço não citado nas lojas) | Brasil (proposta aberta sem recorte regional) | **Sem evidência** (buscado em: lojas, termos e site) | iOS: 4,0 (2 reviews)<br>Android: 3,2 (16 reviews) | 5.000+ downloads (Google Play) | 3 tipos de conta no onboarding (PF, Empresa, Profissional), planos pagos, chat |
| **JobHunter** (`com.mycompany.jobhunter`) | Alessandre Henrique de Freitas Santos Junior | Ninguém (100% gratuito) | **R$ 0,00** (receita declarada só de anúncios no app; Google, Meta e Tappx no `app-ads.txt`) | **Não** (Combinado e pago direto no WhatsApp) | 240+ cidades declaradas (Polos em Uberlândia/MG e Goiânia/GO) | **Sem evidência** (buscado em: lista de cidades do site e redes; o painel classifica como "Indícios" pela alegação de atuar em todo o Brasil) | iOS: 0 avaliações<br>Android: 4,3 (164 reviews) | 10.000+ downloads (Google Play); +52.000 cadastrados declarados | Campo de alimentação inclusa (marmitex), botões de WhatsApp, gestão de candidaturas |
| **Meu Freelance** (`com.bruno...`) | MEU FREELANCE TECNOLOGIA LTDA (Thiago Oliveira) | Modelo indefinido | Grátis para download; a Google Play indica compras no app, sem preço publicado | **Não** (não documentado) | Não declarada (captura com vaga em Goiânia/GO; empresa em Niterói/RJ) | **Sem evidência** (buscado em: lojas e WHOIS) | iOS: 0 avaliações<br>Android: 1,5 (6 reviews) | 1.000+ downloads (Google Play) | Agenda de turnos confirmados, indicador percentual de perfil completo (83%), feed local |

---

## 3. Padrões do Grupo: O que Funciona e o que Falha

### 3.1. O que Funciona (Alavancas Reais de Tração)

1. **A Alavanca da Gratuidade Absoluta aliada a Grupos de WhatsApp:**
   - O **JobHunter**, com taxa zero para os dois lados, tem a maior base do grupo: 52 mil cadastrados declarados e 10 mil+ downloads, em cerca de dois anos no Android (desde 2024). Inferência: a gratuidade e os grupos locais de WhatsApp ajudam a capturar a demanda informal que já circulava na comunidade; a contribuição de cada fator não é medida, e há concentração de avaliações 5 estrelas em dois dias (jan/2025 e fev/2025).
2. **Repasse Financeiro Instantâneo via PIX:**
   - O ponto alto do **BIKO** é a liquidação rápida: pelo FAQ, a empresa libera em até 1 dia útil e o PIX cai em minutos; uma avaliação na Google Play (ago/2026) fala em "menos de 20 minutos", outra (abr/2026) em 24 horas. Pagamento rápido é o elogio mais repetido nas avaliações 5 estrelas; efeito sobre retenção não é medido.
3. **Contagem Regressiva e Certeza do Compromisso:**
   - A interface do **BIKO** estampa uma contagem regressiva em dias, horas, minutos e segundos para o início do evento (`04-14-34-52`, na captura da loja). Inferência: ancora o compromisso e pode reduzir o esquecimento e o *no-show*; não há dado público do efeito.
4. **Transparência sobre Benefícios Básicos (O "Efeito Marmitex"):**
   - O **JobHunter** coloca como campo de primeiro nível no anúncio se o contratante fornece alimentação no local (ex.: *"Fornece alimentação, marmitex no local"*, captura da loja). Inferência: na hospitalidade e eventos, saber se a refeição está garantida pesa no aceite de uma diária; a CCT do DF obriga refeição gratuita no serviço de buffet (`pesquisa/Frila_Varredura_2026-09-20.md`, §2.1).

---

### 3.2. O que Falha (Os Erros Críticos que Destroem os Apps)

1. **A Armadilha do Marketplace Vazio (O Caso Meu Freelance):**
   - Publicar o app sem recorte de cidade e sem contratantes ativos leva trabalhadores a um feed vazio e a notas de 1 estrela. O **Meu Freelance** (1 mil+ downloads, nota 1,5, 3 de 6 avaliações relatando falta de vagas) é o caso documentado. No **Bicos**, a base é pequena (1 mil+ downloads), mas não há avaliações suficientes para afirmar o mesmo.
2. **Cobrar do Trabalhador para Ver Vagas (O Erro Fatal do Trampei):**
   - O **Trampei** cobra assinatura do prestador (Plano Profissional, R$ 29,90; o que o plano libera não é publicado), lógica parecida com a do GetNinjas. Em um mercado onde o trabalhador já está descapitalizado e o app tem relatos de falta de serviço, essa cobrança gera queixa (*"tem que colocar dinheiro"*, avaliação na Google Play, ago/2026). A nota é 3,2; o efeito da cobrança sobre a nota e a retenção não é medido.
3. **A Frustração da "Candidatura no Vácuo":**
   - No **BIKO** e no **JobHunter**, vários candidatos se inscrevem para uma única vaga (a captura do JobHunter mostra 7). Quando o contratante escolhe um, ou quando a vaga expira, os outros candidatos não recebem nenhum feedback de encerramento. Pior: no JobHunter, o anúncio simplesmente desaparece da tela sem aviso, gerando nos usuários a percepção de que o aplicativo travou ou foi fraudado.
4. **Desintermediação pelo WhatsApp sem Retenção:**
   - O **JobHunter** facilita a ponte, mas empurra a conversa para o WhatsApp (*"Contratou. Combinou no WhatsApp"*). Inferência: com isso, o restaurante e o garçom trocam telefones, fecham os próximos turnos por fora e o aplicativo perde o ciclo de vida do cliente e qualquer possibilidade de monetizar a recorrência.
5. **Fragilidade de Infraestrutura e Falta de Governança Básica:**
   - O Grupo 4 exibe falhas técnicas inaceitáveis: domínios oficiais que expiram e ficam suspensos no Registro.br (**Meu Freelance** com status `on-hold`), sites fora do ar (**Trampei**, com a hospedagem suspensa), releases com nomes amadores na App Store (*"versao autenticacao"* no Trampei), recuperação de senha quebrada e queixas de usuários do **BIKO** que não conseguiam excluir a conta e os dados (o site justifica a retenção de alguns dados por até 5 anos com obrigação legal e defesa em processos).

---

## 4. Lições Concretas para o Frila

Cada lição abaixo foi extraída diretamente das evidências documentadas nas fichas individuais do grupo:

### Lição 1: O "Efeito Marmitex" e a Especificação Obrigatória do Turno
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/jobhunter|JobHunter]] (§2 e §8) e a Varredura do DF (`pesquisa/Frila_Varredura_2026-09-20.md`, §2.1 e §3).
* **Achado:** A Convenção Coletiva do DF (Sindhobar × SECHOSC-DF) torna obrigatória a refeição gratuita no serviço de buffet. O JobHunter coloca explicitamente no card da vaga se o contratante oferece marmitex/alimentação; o efeito disso no engajamento não é medido.
* **Aplicação no Frila:** O formulário de criação de turno no Frila (`frila-frontend/iOS` e `frila-backend`) deve conter campos estruturados obrigatórios:
  1. **Refeição inclusa:** Sim/Não (com detalhe: lanche, almoço/jantar da equipe).
  2. **Traje/Uniforme exigido:** (ex.: calça preta, camisa social preta, sapato fechado).
  3. **Horário de pausa/descanso.**
  Isso elimina dúvidas no chat e acelera a decisão de aceite do profissional.

### Lição 2: Contagem Regressiva Visual contra o No-Show
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/biko|BIKO]] (§2 e §5).
* **Achado:** O BIKO exibe um widget de contagem regressiva em tempo real até o início do turno (`04-14-34-52`, dias-horas-minutos-segundos, na captura da loja). O efeito sobre a abstenção não é medido.
* **Aplicação no Frila:** Na tela inicial do profissional do Frila, quando um turno está confirmado, o card principal deve exibir a contagem regressiva para o início da jornada e o botão de rota no mapa (Apple Maps / Waze). Faltando 2 horas para o início, o app deve disparar notificação *Time-Sensitive* de pré-embarque.

### Lição 3: Apoio ao Custo Zero para o Profissional
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/trampei|Trampei Serviços]] (§3 e §8) e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/jobhunter|JobHunter]] (§3).
* **Achado:** O Trampei cobra assinatura do profissional (Plano Profissional, R$ 29,90) e 6 das suas 11 avaliações com texto são de 1 estrela, uma delas sobre ter de pagar. O JobHunter oferece gratuidade absoluta e declara 52 mil cadastrados. É correlação, não prova.
* **Aplicação no Frila:** Manter de forma inegociável o **custo zero para o profissional** (`produto/04-MERCADO-E-CONCORRENCIA.md`; a RN14 trata de verificação progressiva de identidade, não de preço) — o garçom, cozinheiro ou barman jamais pagará para ver vagas, se cadastrar ou receber diárias. Quem paga a taxa do Frila é o estabelecimento comercial, que obtém valor na pontualidade, triagem e resolução emergencial de escala.

### Lição 4: O Algoritmo de Despacho Instantâneo supera a "Candidatura no Vácuo"
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/biko|BIKO]] (§8) e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/jobhunter|JobHunter]] (§8).
* **Achado:** Em marketplaces com candidatura manual, várias pessoas se candidatam e ficam "no vácuo" sem saber se foram escolhidas (avaliações do BIKO de jun/2026 e ago/2026). Quando a vaga é preenchida, o anúncio é apagado e o candidato sente que o app não funciona.
* **Aplicação no Frila:** A tese central do Frila é comprovada por essa dor de mercado: **despacho ordenado com aceite instantâneo ("o primeiro que aceita leva")**. O profissional elegível recebe a oferta; se ele aceita, a vaga é dele imediatamente, sem triagem humilhante de currículos para turnos de urgência de 6 horas. Quando a vaga é preenchida, o app exibe feedback explícito aos demais: *"Vaga preenchida por outro profissional"*.

### Lição 5: Liquidez Hiperlocal e Foco no DF antes de Qualquer Expansão
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/meu-freelance|Meu Freelance]] (§4 e §10) e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/bicos|Bicos]] (§11).
* **Achado:** Abrir cadastro sem recorte de cidade e sem força comercial em nenhuma delas tende a gerar plataformas vazias (inferência). O Meu Freelance foi publicado sem cidade declarada, tem relatos de falta de vagas até em SP, domínio expirado e nota 1,5; a empresa segue ativa na Receita.
* **Aplicação no Frila:** O Frila deve ser **100% restrito ao Distrito Federal** em sua fase 1. Nenhuma vaga deve ser aberta fora do DF. A equipe deve garantir densidade líquida nos polos gastronômicos de Brasília (Asa Sul, Asa Norte, Águas Claras, Sudoeste) antes de gastar um único centavo em expansão interestadual.

### Lição 6: Agenda Pessoal Integrada para Evitar Conflito de Turnos
* **Origem da Evidência:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/meu-freelance|Meu Freelance]] (§2 e §9).
* **Achado:** O Meu Freelance tem um módulo de "Agenda" (captura da loja e descrição: "Organizar sua agenda com facilidade"), permitindo ao autônomo visualizar seus dias ocupados. Nenhuma avaliação elogia esse recurso especificamente.
* **Aplicação no Frila:** No app do profissional, o Frila deve bloquear automaticamente ofertas de turnos cujos horários colidam com turnos já aceitos pelo trabalhador, além de fornecer uma visão de calendário semanal das diárias confirmadas.

---

## 5. Análise de Ameaça para o Frila no Distrito Federal

| Concorrente | Nível de Ameaça no DF | Justificativa Estratégica |
|---|---|---|
| **JobHunter** | **Médio** | É o único concorrente do grupo com tração relevante (52 mil cadastrados declarados) e declara estar mais forte em **Goiânia/GO** (3ª cidade em destaque no site, a cerca de 200 km de Brasília). Se expandir a criação de grupos de WhatsApp para o DF, pode disputar a base de garçons locais pela gratuidade. No entanto, é vulnerável pela falta de verificação, desintermediação e receita frágil de anúncios. |
| **BIKO** | **Baixo** | Possui features modernas (PIX rápido, contagem regressiva, check-in por GPS), não declara área de operação, tem indícios de concentração em São Paulo e não tem evidência pública de operação no DF. Não possui base conhecida nem histórico em Brasília. |
| **Trampei** | **Nulo** | Modelo de cobrar assinatura do profissional (Plano Profissional, R$ 29,90), site institucional fora do ar e sem evidência pública de operação no DF. Não compete com o Frila no DF. |
| **Bicos** | **Nulo** | Focado em serviços domésticos (marido de aluguel, pedreiro, encanador), sem atuação em bares/restaurantes e sem evidência pública de operação no DF. |
| **Meu Freelance** | **Nulo** | Aplicativo abandonado, domínio congelado no Registro.br e sem evidência pública de operação ativa. |

### Conclusão do Grupo 4
Nos cinco apps menores estudados aqui, os erros se repetem: **abrir o cadastro sem recorte de cidade antes de ter densidade local, cobrar do profissional sem entregar demanda, ou empurrar o contato para o WhatsApp e perder a transação**. Só o Meu Freelance mostra sinais claros de abandono; os outros quatro tiveram atualização em 2026.

O **JobHunter** e o **BIKO** mostram os dois lados da moeda: o JobHunter venceu na distribuição ao se aliar ao WhatsApp com taxa zero, mas perdeu o controle da operação; o BIKO desenhou a melhor experiência de turno (PIX rápido e contagem regressiva), mas pecou no feedback ao usuário e tem base ainda pequena (1 mil+ downloads).

O **Frila** ocupa exatamente o espaço deixado por essas falhas: **despacho instantâneo sem candidatura no vácuo, taxa zero para o trabalhador, validação presencial de comparecimento e foco geográfico obsessivo no Distrito Federal.**

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
