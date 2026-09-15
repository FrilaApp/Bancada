---
tipo: documento-derivado
origem: "doc-harness/01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Visao.docx"
hash_origem: 98388cc1f30c0ecc8acd876ba3dc90783022d16546d9a9836821958b52747754
exportado_em: 2026-09-15T11:44
exportado_por: Cauê Carneiro <cauecarneiroc@gmail.com>
conversao: ok
tags: [documento]
---

# Frila_Documento_de_Visao

> [!info] Gerado automaticamente
> Este arquivo é derivado de `Frila_Documento_de_Visao.docx` e é **sobrescrito** a cada conversão.
> Para mudar o conteúdo, edite o `.docx` original.

DOCUMENTO DE VISÃO

Visão do Produto e Posicionamento de Mercado

Projeto

Frila

Grupo / Equipe

BlendOps, Challenge 18 da Apple Developer Academy

Autor(es)

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Versão

v1.0.0

Data

14/09/2026

Histórico de Versões

Versão

Data

Autor(es)

Descrição da Mudança

v1.0.0

14/09/2026

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Criação inicial. Consolida os documentos 00 a 04 revisados em setembro/2026, a matriz CSD do FigJam e os milestones do CBL C18.

Glossário

Termo / Sigla

Definição

Contexto de Uso

Frila / turno avulso

Uma única jornada de trabalho contratada de forma pontual, sem vínculo continuado. É a unidade de trabalho do produto e a origem do nome.

Todo o documento

Contratante

Quem publica a vaga: estabelecimento de food service, produtor de evento, buffet ou coordenação de campanha política.

Seções 2 e 3

Profissional

Quem executa o turno: garçom, bartender, chapeiro, montador, credenciamento, panfletagem, limpeza pós-evento, entre outras funções operacionais.

Seções 2 e 3

Despacho ativo

Mecanismo que envia a vaga aos profissionais elegíveis por função, raio geográfico, disponibilidade e histórico, em vez de esperar que alguém a encontre num mural.

Seções 4 e 5

Reputação binária

Avaliação de resposta única (“chamaria essa pessoa de novo?” ou “trabalharia nesse local de novo?”), exibida sempre com o denominador, e não como média de 1 a 5.

Seções 4 e 5

Taxa de comparecimento

Proporção entre turnos aceitos e turnos efetivamente cumpridos. É o sinal mais objetivo do sistema e define a prioridade no despacho.

Seções 4, 5 e 6

Aval herdado

Atestado de alguém que já trabalhou com o profissional fora da plataforma, para que ele não comece do zero.

Seções 4 e 5

Liquidez

Capacidade real de um marketplace de fechar transações. Distinta de volume de cadastro, e a distância entre as duas é o padrão mais repetido entre os concorrentes.

Seções 2 e 4

Painel de Operação

Interface web interna que mostra os turnos em risco de não serem preenchidos, para intervenção manual da operação.

Seções 3 e 5

Dado / Relato / Fonte interessada / [H] / Lacuna

Marcas de origem usadas na documentação do projeto. Dado: fonte identificada com link e data. Relato: pessoa falando. Fonte interessada: quem vende no mercado. [H]: hipótese sem confirmação. Lacuna: só campo responde.

Todo o documento

Matriz CSD

Certezas, Suposições e Dúvidas. Quadro de validação mantido no FigJam do grupo.

Seções 2 e 4

TRL

Technology Readiness Level. O projeto está em TRL 2: conceito formulado, nada implementado.

Seções 1 e 4

DF

Distrito Federal, primeiro e único mercado da estratégia territorial.

Todo o documento

1. Introdução

1.1 Propósito

Este documento descreve a visão geral do produto Frila: o problema que ele endereça, seu posicionamento de mercado, as partes interessadas, os perfis de usuário e os recursos de alto nível que o compõem. Ele é a referência de negócio do projeto e serve a quem precisa entender o produto sem abrir a documentação completa: equipe de desenvolvimento, mentores, avaliadores da Apple Developer Academy, parceiros e potenciais interessados.

O detalhamento de requisitos funcionais, não funcionais, regras de negócio, casos de uso e diagramas está no Documento de Especificação de Requisitos, e não aqui.

Uma ressalva de leitura vale para o documento inteiro. O Frila está em TRL 2: conceito formulado, nenhuma linha de código escrita e nenhuma validação de campo realizada. Os números de contexto de mercado têm fonte pública identificada; as afirmações sobre o comportamento concreto do contratante e do profissional no Distrito Federal são hipóteses, marcadas com [H] ao longo do texto. A expectativa explícita do grupo é que parte delas esteja errada e seja corrigida com dado real.

1.2 Escopo

Frila é uma plataforma de contratação por turno avulso. O contratante publica o turno que precisa cobrir, com função, data, janela de horário, local e valor, e a vaga é enviada ativamente para os profissionais próximos que podem aceitá-la, em vez de ficar num mural esperando ser encontrada. O profissional se candidata com um toque, a confirmação chega para os dois lados com todos os dados do turno, e depois da execução cada um responde se chamaria o outro de novo.

Está dentro do escopo do produto:

• Publicação de turno avulso em food service, eventos e campanha política, em menos de 60 segundos.

• Despacho ativo por geolocalização, priorizado por taxa de comparecimento.

• Candidatura em um toque, confirmação e liberação de contato entre as partes.

• Registro de início, fim e valor acordado do turno.

• Reputação binária bidirecional, com aval herdado do mundo informal.

• Organização de equipe de confiança e montagem de escala de evento em lote.

• Painel de operação interno para turnos em risco de não serem preenchidos.

• Aplicativo iOS nativo, aplicativo Android e versão web, com todos os perfis de usuário atendidos nas duas vias e proposta de valor distinta por perfil.

Está explicitamente fora do escopo:

• Processar, custodiar ou repassar pagamento. O pagamento é combinado diretamente entre as partes; a plataforma registra o valor acordado, não o movimenta.

• Contratação efetiva em regime CLT, processo seletivo e banco de currículos, que são outro negócio, outro ciclo, outro comprador.

• Marketplace genérico de serviços e freelance remoto ou digital.

• Rede social profissional: não há feed, seguidores nem produção de conteúdo.

• Limpeza residencial convencional, que já possui canais próprios consolidados.

• Operação fora do Distrito Federal antes de o DF estar consolidado.

• Modelo de monetização, que permanece deliberadamente em aberto até a validação de campo.

1.3 Referências

Documento

Versão

Link / Localização

Frila: Leia primeiro

1.0

Documentos/MD/00-LEIA-PRIMEIRO.md

Frila: O Problema

1.0

Documentos/MD/01-O-PROBLEMA.md

Frila: O Negócio

1.0

Documentos/MD/02-O-NEGOCIO.md

Frila: Especificação do Produto

1.0

Documentos/MD/03-ESPECIFICACAO-DO-PRODUTO.md

Frila: Mercado e Concorrência

1.0

Documentos/MD/04-MERCADO-E-CONCORRENCIA.md

Frila: Evidências

1.0

Documentos/MD/EVIDENCIAS.md

Documento de Especificação de Requisitos

v1.0.0

Documentos/Frila_Documento_de_Requisitos.docx

CBL do Challenge 18

1.0

CBL/TemplateCBL_C18.docx

Roteiro de validação por áudio no WhatsApp

1.0

Validacao/Roteiro-de-Validacao-WhatsApp.docx

Matriz CSD e quadro do Challenge 18 (FigJam)

n/a

https://www.figma.com/board/CN1bghQyOzUgR2qvmANbe6/Challenge-18

Repositório do projeto

n/a

https://github.com/BlendOps/Frila

Abrasel: dificuldade de contratação no setor

n/a

https://abrasel.com.br/noticias/noticias/apesar-salario-medio-recorde-bares-restaurantes-dificuldade-preencher-vagas/

Abrasel: rotatividade de mão de obra

n/a

https://abrasel.com.br/noticias/noticias/rotatividade-de-mao-de-obra-segue-alta-nos-bares-e-restaurantes/

ABRAPE: setor de eventos em 2026

n/a

https://www.abrape.com.br/setor-de-eventos-mantem-recordes-de-emprego-e-consumo-no-inicio-de-2026/

Mobile Time e Opinion Box: Super Panorama WhatsApp

06/2026

https://www.mobiletime.com.br/noticias/09/06/2026/whatsapp-super-panorama/

Agência Sebrae: Pulso dos Pequenos Negócios, 12ª ed.

03/2026

https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/

TSE: limites de contratação de pessoal, Eleições 2026

Portaria 444/2026

https://www.tse.jus.br/comunicacao/noticias/2026/Julho/tse-divulga-limites-de-contratacao-de-pessoal-para-as-eleicoes-gerais-2026

1.4 Visão Geral do Documento

A Seção 2 trata do posicionamento do produto: a oportunidade de mercado, a instrução do problema e a instrução de posição. A Seção 3 descreve as partes interessadas e os usuários, com perfil individual de cada um e a síntese de suas necessidades. As Seções 4 e 5 detalham o produto: perspectiva, capacidades, suposições, dependências, custo e a lista de recursos de alto nível. As Seções 6 e 7 abordam as faixas de qualidade esperadas e os requisitos de documentação.

2. Posicionamento

2.1 Oportunidade de Negócio

Contratar pessoas para cobrir um turno de última hora, seja um garçom que faltou, um bartender para o sábado ou uma equipe inteira para uma formatura, ainda depende de grupo de WhatsApp, indicação e sorte. Esse é o estado da arte do mercado que o Frila quer atender, e ele é grande.

Do lado do food service, 90% dos empresários de bares e restaurantes classificam a contratação como difícil ou muito difícil, sendo os motivos principais a escassez de profissionais qualificados (64%) e a ausência de interessados nas vagas (61%). A rotatividade do setor foi de 73,49% entre dezembro de 2024 e novembro de 2025, o equivalente a trocar a equipe inteira a cada 16 meses. Só no Distrito Federal há quase 30 mil estabelecimentos de alimentação e hospedagem, empregando cerca de 100 mil trabalhadores. A margem, porém, é apertada: em setembro de 2025, 43% das casas do DF tiveram lucro, 33% ficaram no equilíbrio e 21% no prejuízo, o que sugere sensibilidade alta a preço. (Abrasel; Abrasel-DF via Correio Braziliense)

Do lado de eventos, o setor movimentou R$ 25,33 bilhões apenas no primeiro bimestre de 2026, o maior valor da série histórica iniciada em 2019, com projeção de 143 mil novas vagas formais no ano. O trabalho de um dia, como o garçom da formatura ou quem bipa o ingresso do show, não entra nessa estatística, e é justamente o segmento que o Frila quer atender. (ABRAPE)

Há ainda um vetor regulatório possivelmente favorável: a PEC que encerra a escala 6x1 foi aprovada na Câmara em maio de 2026 e na CCJ do Senado em setembro, prevendo transição de 44 para 40 horas semanais. Com dois dias de folga por semana, a cobertura de turno avulso tende a crescer. É inferência, não fato: o texto ainda pode ser alterado no plenário e a transição gradual pode diluir o efeito por anos.

O canal onde essa contratação acontece hoje não é uma plataforma: o WhatsApp está instalado em 98,3% dos smartphones brasileiros e é o principal canal comercial de 82% dos pequenos negócios. Existem grupos de freela organizados por cidade, cujas regras publicadas tratam apenas de conduta, nada sobre pagamento, comparecimento ou responsabilidade. Não há nenhuma medida independente de que o WhatsApp funcione mal; o que se verifica é que o canal não tem garantia embutida, o que é coisa diferente. (Mobile Time/Opinion Box; Sebrae)

A oportunidade específica aparece quando se olha a concorrência. Foram mapeados onze concorrentes brasileiros em food service, eventos e trabalho avulso, e apenas um tem presença comprovável em Brasília: o GetNinjas, que sequer é especializado neste nicho. Nenhum dos especializados (Switch, Closeer, estaff, eFreela, Freela Serviços e Worc) demonstra operação real no DF. E todos compartilham a mesma vulnerabilidade estrutural: cadastro não é liquidez. A Freela Serviços declara 198 mil profissionais cadastrados contra 203 contratações concluídas; a eFreela alega 300 mil usuários contra pouco mais de 100 mil instalações mensuráveis no Android; a Worc anunciou mais de 1.400 vagas abertas numa página que, na mesma sessão de navegação, exibiu zero vagas no próprio quadro ao vivo.

A oportunidade, portanto, não é disputar um incumbente local. É ocupar um vácuo, competindo contra o WhatsApp e contra a ausência de alternativa, com um mecanismo que ataca exatamente o ponto onde todos os concorrentes falham: a distância entre cadastrar-se e ser efetivamente chamado.

A ressalva honesta, e ela é grande: nenhuma fonte pública encontrada mede com que frequência um estabelecimento ou um produtor fica sem uma pessoa em cima da hora, nem quanto isso custa. Esse é o número que sustenta ou derruba a razão de ser do Frila, e ele só existe em campo. A validação está em curso, com roteiro de entrevista já produzido e 50 conversas como meta. [H]

2.2 Instrução do Problema

O problema de

Fechar um turno avulso em poucas horas entre duas partes que nunca trabalharam juntas, sem ter como verificar se a pessoa vai aparecer, se sabe fazer o trabalho e se o combinado será cumprido.

Afeta

De um lado, quem opera na linha de fogo e escolhe a ferramenta: maître, chefe de salão, chefe de cozinha, gerente de unidade, produtor de evento, operador de buffet e coordenação de campanha política. Do outro, o profissional operacional avulso (garçom, bartender, chapeiro, montador, credenciamento, limpeza pós-evento, panfletagem) que tem experiência real e nenhum jeito de prová-la para quem não o conhece.

Cujo impacto é

Para o contratante: turno descoberto numa noite cheia, serviço degradado, mesa mal atendida, comanda errada, cliente perdido, equipe fixa esticada em hora extra. A decisão é tomada sob pressão e no escuro, porque não há nada que informe sobre um desconhecido.

Para o profissional: candidatar-se muitas vezes e nunca ser chamado, que é a queixa dominante nas avaliações públicas de três aplicativos concorrentes de empresas diferentes. Começar do zero a cada estabelecimento novo, aceitar trabalho sem registro do que foi combinado e receber o pagamento como promessa, quando acontece.

Para os dois: nenhum registro de quantas horas foram trabalhadas, de quanto ficou acertado ou de quem faltou. Tudo vive em conversa de WhatsApp e memória.

Uma solução bem-sucedida seria

Levar a vaga ativamente até quem pode aceitá-la, em vez de esperar que ela seja encontrada; dar a cada lado um sinal objetivo e verificável sobre o outro antes de decidir; e registrar o combinado (horário, função e valor) de forma que os dois possam consultar depois. Tudo isso rápido o bastante para resolver uma urgência que começa em poucas horas, e simples o bastante para não trocar a informalidade do grupo de WhatsApp por burocracia.

2.3 Instrução de Posição do Produto

Para

Estabelecimentos de food service, contratantes de evento e campanhas políticas do Distrito Federal, e para os profissionais operacionais que trabalham por turno avulso na região.

Que

Precisam fechar um turno específico em poucas horas com alguém de confiança, e não de um banco de currículos, de um processo seletivo ou de um mural com centenas de candidatos.

O produto

Frila

É um(a)

Plataforma de contratação por turno avulso, disponível como aplicativo iOS nativo, aplicativo Android e versão web, com proposta de valor distinta por perfil de usuário.

Que

Leva a vaga até quem é elegível por função, proximidade e disponibilidade, em vez de esperar que alguém a encontre, e mostra a cada lado um histórico verificável do outro: taxa de comparecimento e uma resposta binária de quem já trabalhou com a pessoa.

Diferente de

Grupos de WhatsApp, que resolvem distribuição com custo zero mas não garantem comparecimento nem pagamento; e dos marketplaces existentes (GetNinjas, Switch, Closeer, estaff, eFreela, Freela Serviços e Worc), que acumulam cadastro e deixam o profissional esperando ser escolhido.

Nosso produto

Despacho ativo em vez de mural passivo; reputação binária, bidirecional e herdável do mundo informal, em vez de média de estrelas; custo zero para o profissional, sem moedas nem desbloqueio de contato; e densidade territorial construída em um mercado por vez, começando pelo DF.

3. Partes Interessadas e Usuários

3.1 Demográficos de Mercado

Indicador

Valor

Fonte e data

Estabelecimentos de alimentação e hospedagem no DF

~30 mil

Abrasel-DF via Correio Braziliense, 05/2026

Trabalhadores nesses estabelecimentos no DF

~100 mil

idem

Base representada pelo Sindhobar-DF

14 mil estabelecimentos

idem

Estabelecimentos de alimentação com CNPJ ativo no Brasil

~1,5 milhão

Receita Federal até 2024, via fonte secundária

Faturamento do setor de alimentação fora do lar, 2025

R$ 495 bilhões

Abrasel

Empresários que consideram a contratação difícil ou muito difícil

90%

Abrasel

Rotatividade no setor (dez/2024 a nov/2025)

73,49%

Abrasel

Estabelecimentos do DF com lucro / equilíbrio / prejuízo

43% / 33% / 21%

Abrasel-DF via Correio Braziliense, 09/2025

Setor de eventos: movimentação no 1º bimestre de 2026

R$ 25,33 bilhões

ABRAPE, maior da série histórica

Setor de eventos: empregos formais do núcleo (fev/2026)

205.538 vínculos

ABRAPE, +84,5% sobre 2019

Projeção de novas vagas formais em eventos em 2026

143 mil

ABRAPE / Diário do Turismo

Trabalhadores de cultura e lazer na informalidade

71,1%

Teberga/UFT (2020), base IPEA 2018. Dado antigo

WhatsApp instalado em smartphones brasileiros

98,3%

Mobile Time/Opinion Box, 06/2026, 4.138 respondentes

Pequenos negócios que usam WhatsApp como canal comercial

82%

Sebrae, Pulso 12ª ed., 8,2 mil ouvidos, fevereiro e março de 2026

Limite de contratação de pessoal de campanha no DF

a partir de 300 pessoas por chapa

Portaria TSE nº 444/2026

Concorrentes com presença comprovada no DF

1 de 11, e não especializado

Pesquisa própria, 14/09/2026

*Não existe, em fonte pública encontrada, número de trabalhadores avulsos por evento no Brasil, nem medida de frequência de falta de última hora em bares e restaurantes. O segmento que o Frila quer atender é justamente o que nenhuma estatística oficial conta, o que torna a validação de campo condição para qualquer dimensionamento de receita.*

3.2 Resumo das Partes Interessadas

Nome / Grupo

Descrição

Responsabilidades

Equipe BlendOps (5 sócios)

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi e Matheus Silva. Time responsável por pesquisa, produto, design e construção.

Conduzir a validação de campo, decidir escopo, projetar, implementar, testar e manter o produto.

Mentoria e Apple Developer Academy

Felipe Carvalho e Victor Zerefos como mentores, dentro do Challenge 18 e da metodologia CBL.

Orientar o percurso, revisar entregas e marcos, validar a aderência à metodologia.

Estabelecimentos de food service do DF

Bares, restaurantes, cafeterias, pizzarias, hamburguerias, dark kitchens e similares. Contratantes recorrentes e fonte de frequência de uso.

Publicar turnos, confirmar profissionais, avaliar após a execução e pagar o combinado.

Contratantes de evento

Buffets, produtoras e empresas de staff que operam formaturas, casamentos, shows e eventos corporativos. Fonte de volume e de construção da oferta.

Montar escalas com antecedência, absorver picos de última hora, avaliar profissionais.

Coordenação de campanha política

Responsáveis por militância e mobilização de rua, sujeitos a teto legal de contratação e à obrigação de prestar contas.

Contratar dentro do limite legal, registrar quem trabalhou, quando e por quanto.

Profissionais avulsos do DF

Trabalhadores operacionais de gastronomia, eventos, varejo, logística, limpeza, beleza e pets.

Manter perfil, função, raio e disponibilidade atualizados; aceitar, comparecer, executar e avaliar.

Operação interna do Frila

Função exercida pela própria equipe na fase inicial, através do painel web.

Monitorar turnos em risco, intervir manualmente, mediar conflitos e apurar incidentes.

Entidades setoriais (Abrasel-DF, Sindhobar-DF)

Representam quase 30 mil estabelecimentos e 14 mil associados no DF. Parceiros potenciais de distribuição e de credibilidade local.

Não têm papel formal no produto; podem viabilizar acesso a base e a dados setoriais.

Órgãos reguladores

ANPD (LGPD), Justiça do Trabalho (caracterização de vínculo, Tema 1.291) e TSE (Portaria 444/2026, contratação de pessoal de campanha).

Definem restrições que o produto precisa respeitar por desenho, não por política interna.

Lojas de aplicativo

App Store e Google Play, canais obrigatórios de distribuição.

Aprovar as publicações; definem exigências de privacidade, conteúdo e metadados.

3.3 Resumo dos Usuários

Nome / Perfil

Descrição

Stakeholder responsável

Contratante de food service

Maître, chefe de salão, chefe de cozinha, gerente de unidade ou o próprio dono-operador. Publica sob pressão, no celular, no meio do turno.

Estabelecimentos de food service do DF

Contratante de evento

Produtor, operador de buffet ou empresa de staff. Planeja escala de dezenas de posições com semanas de antecedência e absorve furos agudos de última hora.

Contratantes de evento

Coordenador de campanha

Responsável por mobilização de rua. Contrata em volume, dentro de teto legal, e precisa de registro auditável para prestação de contas.

Coordenação de campanha política

Profissional avulso

Trabalhador operacional que compõe a renda com turnos avulsos. Usa Android de entrada, com plano de dados limitado, e acompanha vários grupos de WhatsApp ao mesmo tempo.

Profissionais avulsos do DF

Operador do painel

Pessoa da equipe Frila que acompanha os turnos em risco e intervém manualmente quando o despacho não resolve.

Operação interna do Frila

3.4 Ambiente do Usuário

O produto é usado majoritariamente em mobilidade e sob pressão de tempo, e isso condiciona todas as decisões de desenho.

O profissional acessa da rua, do intervalo e do transporte, em aparelho Android de entrada, com sinal instável e plano de dados limitado. Sessões são curtas: consultar uma vaga, aceitar, conferir endereço e horário. A confiabilidade da notificação é a parte mais crítica do ambiente dele: nas avaliações públicas dos concorrentes, a segunda queixa mais repetida é o aviso que não chega, relatada tanto por quem elogia o produto quanto por quem o detesta. Um aviso que não chega equivale a uma vaga que não existiu.

O contratante tem dois ambientes opostos. No celular, sob estresse: são 16h de uma sexta, faltou gente, o movimento começa em duas horas e quem publica está no salão, não sentado à mesa. Nesse contexto, publicar precisa levar menos de 60 segundos e exigir poucos campos. No computador, planejando: o operador de buffet monta a escala de uma formatura de 40 pessoas duas semanas antes. É trabalho de mesa, com teclado e tela grande, onde a densidade de informação ajuda em vez de atrapalhar. Por isso todos os perfis têm acesso tanto ao aplicativo quanto à web.

A concentração temporal de uso é conhecida: picos de quinta a domingo, na virada da tarde para a noite, além de datas sazonais como Black Friday, Natal, Dia das Mães e temporada de formaturas. A janela crítica de disponibilidade do sistema é quinta a domingo, entre 16h e 02h.

Quanto a plataformas, o aplicativo iOS nativo é requisito já fechado do projeto. Android não pode ficar para depois, por ser a plataforma da maioria esmagadora do trabalhador de base no Brasil, já que lançar só em iOS excluiria a maior parte do lado da oferta. A versão web atende os dois perfis. A escolha entre nativo nas duas plataformas ou uma base compartilhada ainda não foi tomada.

Estimativa de uso simultâneo no lançamento: dezenas de usuários ativos ao mesmo tempo na janela de pico, com picos de despacho concentrados nos minutos seguintes a cada publicação de vaga. O número é derivado do tamanho da praça-piloto, não de medição. [H]

3.5 Perfil das Partes Interessadas

Stakeholder 1: Equipe BlendOps

Representante

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi e Matheus Silva

Descrição

Os cinco sócios do projeto, responsáveis por pesquisa, produto, design, desenvolvimento e operação inicial. Acumulam também o papel de operação interna enquanto não houver equipe dedicada.

Tipo

Patrocinador e executor

Responsabilidades

Conduzir a validação de campo; decidir escopo e prioridade; projetar, implementar, testar e publicar o produto; manter a documentação atualizada com a evidência coletada.

Critérios de sucesso

Turnos efetivamente preenchidos no DF, com taxa de comparecimento medida; hipóteses do projeto convertidas em dado ou descartadas; produto publicado nas duas lojas.

Envolvimento

Integral e diário: definição de requisitos, construção, testes e operação.

Principais preocupações

Validar a frequência do problema antes de construir; não repetir o erro do setor de acumular cadastro sem liquidez; não ultrapassar a capacidade de uma equipe de cinco pessoas sem código escrito.

Stakeholder 2: Mentoria e Apple Developer Academy

Representante

Felipe Carvalho e Victor Zerefos (mentores do Challenge 18)

Descrição

Instância de orientação e avaliação do projeto dentro da metodologia CBL, com marcos definidos de Engage, Investigate e Act.

Tipo

Mentor e avaliador

Responsabilidades

Orientar o percurso de descoberta, revisar entregas, questionar premissas e validar aderência à metodologia.

Critérios de sucesso

Milestones do CBL entregues e sustentados por evidência; coerência entre Big Idea, Essential Question, Challenge Statement e solução proposta.

Envolvimento

Revisões periódicas e checkpoints do calendário da C18, incluindo a Apple Review de apresentação de escopo.

Principais preocupações

Que o grupo construa antes de validar; que o escopo inche além do executável no período do challenge.

Stakeholder 3: Entidades setoriais do DF

Representante

Abrasel-DF e Sindhobar-DF

Descrição

Representam quase 30 mil estabelecimentos de alimentação e hospedagem no DF, dos quais 14 mil na base do Sindhobar. Parceiros potenciais de acesso e credibilidade local.

Tipo

Parceiro potencial e fonte de dados

Responsabilidades

Nenhuma no produto. Podem viabilizar acesso à base associada, divulgação e dados setoriais do DF.

Critérios de sucesso

Redução percebida da dificuldade de contratação entre os associados.

Envolvimento

Ainda inexistente. Aproximação prevista após a validação de campo.

Principais preocupações

Associar a entidade a uma plataforma ainda não testada; sensibilidade a custo do setor, com 21% dos estabelecimentos do DF no prejuízo.

Stakeholder 4: Órgãos reguladores

Representante

ANPD, Justiça do Trabalho e TSE

Descrição

Definem o contorno legal em que o produto opera: proteção de dados pessoais, caracterização de vínculo empregatício em plataformas e limites de contratação de pessoal em campanha eleitoral.

Tipo

Regulador

Responsabilidades

Fiscalizar o tratamento de dados pessoais; julgar a natureza da relação entre plataforma e trabalhador (Tema 1.291 e PLP 12/2024); fixar e fiscalizar o teto de contratação de campanha (Portaria TSE 444/2026).

Critérios de sucesso

Conformidade demonstrável, sem autuação e sem passivo trabalhista.

Envolvimento

Indireto e permanente, por meio das normas aplicáveis.

Principais preocupações

Uso indevido de dado sensível e de documento de identificação; subordinação disfarçada de intermediação; contratação de pessoal de campanha acima do teto legal, que pode configurar corrupção eleitoral.

3.6 Perfil dos Usuários

Usuário 1: Contratante de food service (persona primária)

Representante

O maître sob estresse: maître, chefe de salão, chefe de cozinha, gerente de unidade ou dono-operador

Descrição

Trabalha no salão, não na sala. São 16h de uma sexta, faltou um garçom e o movimento começa em duas horas. Não é o dono, mas é quem sente o problema e escolhe a ferramenta: hoje, o grupo de WhatsApp. O dono aprova o teto de gasto; quem está na ponta resolve em dez minutos. [H]. Proto-persona de desk research, ainda não validada em campo.

Tipo

Usuário primário

Responsabilidades

Publicar a vaga com função, data, janela, local e valor; confirmar o profissional; receber quem chega; avaliar depois do turno; garantir o pagamento combinado.

Critérios de sucesso

O turno foi coberto a tempo, por alguém que apareceu e soube trabalhar, sem que ele precisasse ficar mandando mensagem em grupo durante o serviço.

Envolvimento

Episódico e concentrado: picos de quinta a domingo e em datas sazonais, com uso intenso na virada da tarde para a noite. Frequência real por estabelecimento é a principal lacuna do projeto. [H]

Principais necessidades

Saber, antes de confirmar, se a pessoa costuma aparecer. Publicar em menos de um minuto, com poucos campos. Ter um plano B quando ninguém aceita. Não assumir risco trabalhista ao contratar avulso.

Comentários

É a persona que define o tom do produto inteiro: a pressa é do lado que contrata, e por isso não há funil nem processo seletivo. O aplicativo do estabelecimento dos concorrentes costuma ter nota alta, sinal de que este lado já é razoavelmente bem servido e de que a diferenciação terá de vir de confiança, não de conveniência.

Usuário 2: Profissional avulso (persona primária)

Representante

Quem se candidata e nunca é chamado

Descrição

Tem experiência real, muitas vezes anos dela, mas nenhum jeito de prová-la para um estabelecimento que não o conhece. Usa Android de entrada, com plano de dados limitado, e acompanha vários grupos de WhatsApp ao mesmo tempo. Já se cadastrou em pelo menos um aplicativo do setor e desistiu, porque nunca foi chamado ou porque o cadastro travou. Não está implorando por qualquer vaga: escolhe, e a diária avulsa paga melhor que o dia de CLT. [H]. Proto-persona, ainda não validada em campo.

Tipo

Usuário primário

Responsabilidades

Manter função, raio de atuação e disponibilidade atualizados; aceitar, comparecer e executar; registrar início e fim do turno; avaliar o estabelecimento.

Critérios de sucesso

Ser efetivamente chamado, e não apenas cadastrado. Preencher a semana com turnos que cabem na agenda, receber o combinado e acumular um histórico que ele carregue consigo.

Envolvimento

Diário na consulta e na resposta a notificações; episódico na execução.

Principais necessidades

Ser notificado de verdade, e a tempo. Cadastro curto, sem exigência pesada de documento antes de qualquer trabalho acontecer. Saber endereço, horário e valor antes de aceitar. Não pagar nada para trabalhar. Não ser bloqueado sem motivo nem sem direito de contestar.

Comentários

As evidências mais fortes do projeto vêm deste lado: “a plataforma parece um clube fechado, onde sempre os mesmos freelancers são escolhidos” (estaff, 1★); “são centenas de freelancers para uma única vaga” (eFreela, 1★); “as notificações de job que te oferecem não chegam” (Closeer, 1★). O padrão aparece em três aplicativos de empresas diferentes, o que indica falha estrutural do marketplace passivo, não defeito de um produto.

Usuário 3: Contratante de evento

Representante

Produtor de evento, operador de buffet ou empresa de staff

Descrição

Opera formaturas, casamentos, shows e eventos corporativos. O que muda em relação ao bar é o volume: uma formatura consome de 20 a 40 profissionais numa noite. A demanda é planejada, porque o evento foi marcado meses antes, com furos agudos de última hora por cima.

Tipo

Usuário primário, com fluxo próprio

Responsabilidades

Montar a escala com antecedência; repor posições que caem; conferir presença no dia; avaliar a equipe inteira depois.

Critérios de sucesso

A escala fechada antes do evento e mantida no dia, sem buraco em posição crítica.

Envolvimento

Concentrado em ciclos: planejamento semanas antes, execução intensa em uma noite.

Principais necessidades

Publicar dezenas de posições de uma vez, em várias funções. Ver quem se candidatou e escolher, em vez de aceitar o primeiro. Reaproveitar equipes que já funcionaram.

Comentários

Estrategicamente é a porta de entrada do produto: o evento é como se constrói a oferta, o bar fixo é como se ganha frequência. Uma noite de formatura coloca 40 profissionais no mesmo salão, todos trabalhando à vista, e nenhum formulário de cadastro produz um banco curado assim.

Usuário 4: Coordenação de campanha política

Representante

Coordenador de mobilização de rua de uma chapa

Descrição

Contrata em volume para militância, panfletagem, bandeirismo e apoio logístico, dentro de teto legal: no DF, a partir de 300 pessoas por chapa, subindo uma contratação a cada mil eleitores adicionais. Estourar o limite pode configurar corrupção eleitoral e abuso de poder econômico.

Tipo

Usuário primário sazonal

Responsabilidades

Contratar dentro do limite; registrar quem trabalhou, quando e por quanto; prestar contas da despesa de pessoal.

Critérios de sucesso

Equipe de rua completa nos dias que importam e registro exportável que sustente a prestação de contas.

Envolvimento

Fortemente sazonal, concentrado no período eleitoral.

Principais necessidades

Volume rápido, controle de teto e registro auditável do que foi pago a quem.

Comentários

Segmento sustentado hoje por uma única portaria e por inferência do grupo. Não foi encontrada nenhuma fonte descrevendo como essas pessoas são recrutadas e pagas na prática, nem qual a dor de quem organiza. [H]. É a lacuna mais larga do documento. A Freela Serviços já atende o segmento e é o único concorrente com overlap direto.

Usuário 5: Operador do painel (interno)

Representante

Pessoa da equipe Frila em plantão na janela crítica

Descrição

Acompanha, pela web, os turnos que não estão sendo preenchidos e intervém na mão. É o perfil mais esquecido em produtos deste tipo, e é o que impede o negócio de quebrar no primeiro mês: quando um turno não preenche às 17h30 de sexta, alguém precisa ver, ligar para três pessoas e resolver.

Tipo

Usuário interno

Responsabilidades

Monitorar turnos em risco; acionar profissionais manualmente; mediar conflitos entre as partes; apurar incidentes de não comparecimento e de pagamento.

Critérios de sucesso

Nenhum turno publicado terminar sem resposta e sem que alguém tenha tentado resolver.

Envolvimento

Contínuo durante a janela crítica de quinta a domingo.

Principais necessidades

Ver, em uma tela, o que está prestes a falhar, com tempo restante e contato das partes. Registrar o que foi feito.

Comentários

Na fase inicial o papel é exercido pelos próprios sócios. O painel é também o instrumento de medição do produto: é dele que sairão os primeiros números reais de taxa de preenchimento e de comparecimento.

3.7 Principais Necessidades das Partes Interessadas e Usuários

Necessidade

Prioridade

Solução Atual

Solução Proposta

Saber, antes de confirmar, se um desconhecido vai aparecer e sabe trabalhar

Alta

Indicação de conhecido, intuição e sorte. O grupo de WhatsApp não garante comparecimento nem responsabiliza ninguém, já que as regras publicadas tratam só de conduta.

Reputação binária bidirecional exibida com denominador, taxa de comparecimento como sinal objetivo e aval herdado de quem já trabalhou com a pessoa fora do app.

Cobrir um turno que começa em poucas horas

Alta

Mensagem em um ou vários grupos de WhatsApp, torcendo para alguém ver e responder.

Despacho ativo por geolocalização, notificando quem é elegível em ordem de taxa de comparecimento, mais busca livre por vagas na região.

Ser efetivamente chamado, e não apenas estar cadastrado

Alta

Candidatar-se em murais concorridos e não receber resposta. É a queixa dominante nas avaliações de três concorrentes de empresas diferentes.

Despacho dirigido a quem é elegível, em vez de exposição passiva; prioridade construída por comparecimento e não por antiguidade ou por preferência do contratante.

Receber o aviso da vaga a tempo

Alta

Checar o aplicativo de dez em dez minutos, ou acompanhar vários grupos simultaneamente.

Notificação como requisito de primeira ordem, com entrega verificável, reentrega e estado consultável, tratada como parte do produto e não como detalhe técnico.

Entrar na plataforma sem barreira antes de qualquer trabalho

Alta

Cadastros longos, upload de documento e reconhecimento facial que falham. Há recusa explícita por desconfiança: “não acho seguro adicionar minha foto segurando meus documentos”.

Cadastro mínimo para o primeiro despacho e verificação progressiva, exigida só quando necessária e com finalidade declarada.

Ter registro do que foi combinado

Alta

Conversa de WhatsApp e memória. Não há registro de horas, de valor nem de quem faltou.

Registro de início, fim e valor acordado do turno, disponível para consulta e exportação pelos dois lados.

Não pagar para trabalhar

Alta

Modelos que cobram do profissional: moedas pré-pagas para desbloquear contato de um cliente que pode nem responder, com relatos de gasto sem retorno.

Custo zero para o profissional, em qualquer modalidade. É a única definição fechada do modelo de receita.

Não ser bloqueado sem motivo nem sem direito de resposta

Média

Bloqueios relatados após poucas desistências, inclusive com aviso prévio, e em um caso por falta a uma vaga que havia sumido do aplicativo.

Suspensão sempre com motivo registrado e canal de contestação, com apuração pelo painel de operação.

Montar uma equipe grande com antecedência

Média

Planilha, telefone e indicação, posição por posição.

Escala de evento em lote, com várias funções e posições publicadas de uma vez, e equipes de confiança reaproveitáveis.

Chamar primeiro quem já funcionou bem

Média

Lista de contatos pessoal do maître ou do produtor, que se perde quando ele sai.

Equipe de confiança por estabelecimento, com prioridade de despacho e histórico que pertence ao estabelecimento, não a uma pessoa.

Comprovar quem trabalhou, quando e por quanto

Média

Recibos avulsos e controle manual, quando existe.

Histórico exportável do turno, útil para prestação de contas de campanha e para controle do contratante.

Não assumir risco de vínculo empregatício ao contratar avulso

Média

Informalidade total, com o risco assumido sem ser avaliado.

Desenho de produto que não cria subordinação nem exclusividade: sem escala obrigatória, sem penalidade por recusar vaga, com o profissional escolhendo o que aceita.

Ter um plano B quando ninguém aceita a vaga

Alta

Nenhum. Se ninguém responde ao grupo, o turno simplesmente fica descoberto.

Painel de operação interno que enxerga o turno em risco dentro da janela crítica e permite intervenção manual antes de ele falhar.

4. Visão Geral do Produto

4.1 Perspectiva do Produto

O Frila é um sistema novo e independente. Não é módulo, extensão nem substituição de um sistema existente do cliente: não depende de PDV, de sistema de ponto, de folha de pagamento ou de software de escala já instalado no estabelecimento. Essa independência é deliberada, porque o público-alvo primário são operações pequenas, cuja infraestrutura de software costuma resumir-se ao celular de quem está no salão.

O produto se organiza em três interfaces sobre uma base comum, com necessidades diferentes o bastante para serem tratadas como produtos distintos:

• Aplicativo do Profissional, em iOS, Android e web. Leve, tolerante a sinal ruim, com leitura offline dos turnos confirmados e notificação confiável.

• Aplicativo do Estabelecimento, em iOS, Android e web, cobrindo os dois contextos: publicação sob estresse no celular e planejamento de escala no computador.

• Painel de Operação, web e interno, para os turnos em risco de não serem preenchidos.

Em relação ao ecossistema existente, o Frila não tenta eliminar o WhatsApp do fluxo: depois da confirmação, o contato entre as partes pode acontecer por WhatsApp ou e-mail, porque é onde as pessoas já estão. O que o produto substitui é a etapa anterior, a de encontrar alguém e decidir confiar nele, que hoje acontece sem nenhum registro e sem nenhum sinal verificável.

As dependências externas previstas são serviço de notificação push das plataformas, serviços de geolocalização e mapa, e um backend cuja stack ainda não foi escolhida. O único requisito técnico fechado é a existência de um aplicativo iOS nativo; o backend pode ser externo. O pagamento fica fora do sistema por decisão de escopo, e não por limitação técnica.

4.2 Resumo das Capacidades

Benefício para o Cliente / Usuário

Recurso que o Suporta

O turno cobrado em cima da hora chega a quem pode aceitá-lo, em vez de esperar ser encontrado

Despacho ativo por geolocalização, com elegibilidade por função, raio, disponibilidade e histórico (REC02)

Publicar não interrompe o serviço de quem está no salão

Publicação de turno em menos de 60 segundos, com poucos campos e reaproveitamento de vagas anteriores (REC01, REC05)

Aceitar um trabalho não exige preencher formulário nem negociar

Candidatura em um toque, com valor já definido no anúncio (REC03)

Os dois lados sabem exatamente o que foi combinado

Confirmação com função, local, horário, valor e contato liberado para ambos (REC04)

É possível decidir sobre um desconhecido com informação, e não no escuro

Reputação binária bidirecional exibida com denominador e taxa de comparecimento (REC06, REC07)

Quem tem experiência não começa do zero

Aval herdado do mundo informal, registrado por quem já trabalhou com a pessoa fora do app (REC08)

Quem já funcionou bem é chamado primeiro na próxima vez

Equipe de confiança por estabelecimento, com prioridade de despacho (REC09)

Uma formatura de 40 posições não precisa ser montada vaga a vaga

Escala de evento em lote, com múltiplas funções e posições (REC10)

Um turno que não preenche não falha em silêncio

Painel de operação interno, com alerta por janela crítica e intervenção manual (REC11)

O histórico do que foi trabalhado e acordado fica disponível

Registro de início, fim e valor do turno, com exportação (REC12, REC14)

Mais de uma pessoa do estabelecimento pode operar sem compartilhar login

Múltiplos usuários por estabelecimento, com papéis (REC13)

Trabalhar na plataforma não custa nada para quem trabalha

Ausência de qualquer cobrança do profissional, em todas as modalidades (regra de negócio, não recurso opcional)

4.3 Suposições e Dependências

Tipo

Descrição

Impacto se não atendido

Suposição [H]

A falta de pessoal de última hora acontece com frequência suficiente para sustentar um negócio.

É a hipótese mais cara do projeto. Se a frequência for baixa, não há recorrência, não há densidade e o produto não se sustenta, independentemente da qualidade da execução.

Suposição [H]

Há profissional disponível numa sexta à noite, num bairro específico, com duas horas de antecedência.

Abundância no agregado das plataformas não é abundância no instante. Se faltar oferta na hora, o despacho ativo não tem a quem despachar e a promessa central falha.

Suposição [H]

O estabelecimento paga a mais por urgência, e em valor relevante.

Sem prêmio de urgência, o incentivo para o profissional aceitar em cima da hora enfraquece e a janela de resposta se alarga.

Suposição [H]

O profissional aceita um chamado em menos de 30 minutos com frequência útil.

Se a resposta típica for mais lenta, o produto deixa de resolver urgência e vira apenas mais um mural, exatamente o que ele se propõe a não ser.

Suposição [H]

Quem decide chamar é o maître, o gerente ou o produtor, e não o dono.

Erra o alvo de comunicação, de onboarding e de desenho de tela. Mudaria o tom do produto inteiro.

Suposição [H]

A desintermediação, que é contratar direto na segunda vez, é administrável.

Se as partes saírem da plataforma após o primeiro turno, não há base para nenhum modelo de receita, qualquer que seja ele.

Suposição [H]

A ausência de garantia do WhatsApp incomoda o suficiente para alguém trocar de ferramenta.

É a lacuna mais importante de todas. Não existe medida independente de falha do WhatsApp; se o incômodo não for real, não há motivo de troca.

Suposição [H]

A reputação binária informa mais que a média de 1 a 5 e é compreendida pelos usuários.

Se o sinal não for lido como informativo, a confiança não se transfere e o diferencial central se perde.

Suposição [H]

O aval herdado do mundo informal será efetivamente usado pelos profissionais.

Sem ele, todo profissional novo começa em zero e o problema de cold start do lado da oferta permanece.

Suposição [H]

A dor do produtor de evento é suficientemente parecida com a do dono de bar.

Se forem problemas distintos, o nicho aberto se quebra e o produto precisa escolher um segmento, com perda de densidade.

Suposição [H]

O fim da escala 6x1 amplia a demanda por cobertura avulsa.

Perde-se um vetor de crescimento previsto. A PEC ainda pode ser alterada no plenário do Senado e a transição gradual pode diluir o efeito por anos.

Dependência

Serviços de notificação push das plataformas (APNs e FCM) com entrega confiável.

A notificação é o produto. Falha de entrega equivale a vaga inexistente, que é a segunda queixa mais repetida nas avaliações dos concorrentes.

Dependência

Serviços de geolocalização e mapa, e permissão de localização concedida pelo usuário.

Sem raio geográfico confiável, o despacho perde precisão e passa a notificar quem não pode chegar a tempo, treinando o usuário a ignorar avisos.

Dependência

Conectividade móvel de qualidade variável e aparelhos Android de entrada com pouca memória.

Um aplicativo pesado exclui a maior parte do lado da oferta, que é onde a densidade precisa ser construída.

Dependência

Aprovação e permanência nas lojas App Store e Google Play.

Sem distribuição, não há produto. Exigências de privacidade e de metadados precisam ser atendidas desde a primeira submissão.

Dependência

Backend e infraestrutura, com stack ainda não decidida.

A decisão está deliberadamente em aberto; adiá-la além do início da construção trava o desenvolvimento.

Dependência

Marco legal em evolução: Tema 1.291 do STF, PLP 12/2024 e LGPD.

Mudança na caracterização de vínculo em plataformas pode exigir revisão do modelo de intermediação e do desenho de regras.

4.4 Custo e Precificação

O modelo de monetização não está definido, e essa é uma decisão consciente. Toda conta de receita depende de um preço que ainda não existe, e a pesquisa de concorrência mostrou que errar aqui é caro: cobrar do profissional gera desgaste público documentado, e comissão pura perde para receita recorrente mesmo em quem domina a transação. No Fiverr, a receita de marketplace caiu 15,5% ano a ano enquanto a receita que inclui assinatura cresceu 2%.

Uma única definição está fechada: não se cobra do profissional, em nenhuma modalidade. Ela vem da evidência de que, em todos os concorrentes pesquisados e independentemente do modelo de cobrança, as piores avaliações vêm do lado de quem trabalha.

Os modelos praticados pelos concorrentes servem de referência, não de resposta:

Concorrente

Modelo de cobrança

Quem paga

Switch

Valor por hora conforme a função, com sobretaxa de 10% para pedidos com menos de 24h de antecedência, taxa de cancelamento e multa por atraso

Contratante

Closeer

Percentual por job, valor não divulgado

Contratante

eFreela

Cerca de 10% por contratação (não confirmado em primeira mão)

Contratante

estaff

Comissão de intermediação, percentual não público; modelo dual freela e CLT

Contratante

Freela Serviços

Híbrido: mensalidade decrescente de R$ 0 a R$ 499 mais taxa de 10% a 20%

Contratante

Worc

Assinatura mensal ou trimestral, preço sob consulta

Contratante

GetNinjas

Moedas pré-pagas para desbloquear o contato do lead (1 moeda = R$ 0,15)

Profissional. Modelo descartado pelo Frila

Instawork (EUA/Canadá)

Tarifa horária all-inclusive, com taxa de efetivação decrescente por horas acumuladas

Contratante

Qwick (EUA)

Markup de cerca de 40% por turno

Contratante

Também não há base para estimar TAM, SAM e SOM em reais enquanto não houver preço validado. O que se pode afirmar hoje é o tamanho do universo de contratantes potenciais no DF: por volta de 30 mil estabelecimentos de alimentação e hospedagem, empregando cerca de 100 mil pessoas, mais o setor de eventos, cujo trabalho avulso nenhuma estatística pública conta.

Como projeto acadêmico sem fins comerciais, os custos hoje envolvidos são de desenvolvimento e publicação:

Item

Natureza

Custo estimado

Trabalho da equipe (5 sócios)

Interno, sem remuneração

R$ 0

Apple Developer Program

Obrigatório para publicar na App Store

US$ 99/ano, coberto pela Academy durante o challenge

Google Play Developer

Taxa única de registro

US$ 25, pagamento único

Infraestrutura de backend e banco de dados

Externa, stack ainda não decidida

Camada gratuita na fase de validação; a definir na construção

Serviço de notificação push

APNs e FCM

Sem custo nos volumes previstos

Serviços de mapa e geocodificação

Dependente da escolha de provedor

Camada gratuita prevista para o volume do piloto

Ferramentas de design e documentação

Figma, FigJam e repositório

Licenças já disponíveis à equipe

5. Recursos do Produto

Cada linha é uma capacidade de alto nível. O detalhamento em requisitos funcionais, com critério de aceitação, está no Documento de Especificação de Requisitos.

ID

Recurso

Descrição

Prioridade

REC01

Publicação de turno

O contratante publica um turno com função, data, janela de início e fim, local, valor e número de posições, em menos de 60 segundos, pelo celular.

Alta

REC02

Despacho ativo por geolocalização

A vaga é notificada ativamente aos profissionais elegíveis por função, raio, disponibilidade e histórico, priorizando quem tem melhor taxa de comparecimento. É o núcleo do produto.

Alta

REC03

Candidatura em um toque

O profissional aceita sem carta de apresentação, sem processo seletivo e sem negociação de valor, porque o valor já está no anúncio.

Alta

REC04

Confirmação e liberação de contato

Os dois lados recebem função, local, horário e valor, e o canal de contato direto é liberado somente após a confirmação.

Alta

REC05

Reaproveitamento de vaga

Republicar um turno a partir de outro já publicado, reduzindo o tempo de publicação nos casos recorrentes.

Média

REC06

Reputação binária bidirecional

Depois do turno, cada lado responde se chamaria o outro de novo. A exibição mostra sempre o denominador, como em “sete de sete chamariam de novo”, e nunca uma média isolada.

Alta

REC07

Taxa de comparecimento

Proporção entre turnos aceitos e cumpridos, calculada pelo sistema e usada como prioridade de despacho. É o principal incentivo do produto e não custa dinheiro.

Alta

REC08

Aval herdado do mundo informal

Quem já trabalhou com o profissional fora da plataforma pode atestar por ele, para que ninguém comece em zero.

Média

REC09

Equipe de confiança

O estabelecimento reúne quem já trabalhou bem por lá e chama essas pessoas primeiro nas próximas vagas.

Média

REC10

Escala de evento em lote

Montagem de escala com várias funções e dezenas de posições, com semanas de antecedência, em vez de vaga por vaga.

Média

REC11

Painel de operação interno

Visão web dos turnos em risco de não serem preenchidos dentro da janela crítica, com contato das partes e registro da intervenção.

Alta

REC12

Registro do turno

Início, fim e valor acordado registrados e disponíveis aos dois lados, substituindo a conversa de WhatsApp e a memória.

Alta

REC13

Múltiplos usuários por estabelecimento

Mais de uma pessoa opera a mesma conta com papéis distintos, sem compartilhar login. O histórico pertence ao estabelecimento, não a uma pessoa.

Média

REC14

Histórico e exportação

Consulta e exportação dos turnos realizados, útil para controle do contratante e para prestação de contas de campanha política.

Baixa

REC15

Busca de vagas na região

O profissional também pode navegar pelas vagas abertas próximas. Complementa o despacho; em urgência, quem só procura chega tarde.

Média

6. Faixas de Qualidade

Atributo

Definição / Expectativa

Critério de Aceitação

Desempenho

O produto responde sem atraso perceptível, inclusive em aparelho de entrada e conexão móvel instável.

Telas principais carregam em menos de 2 segundos em 4G; o fluxo completo de publicação de vaga é concluído em menos de 60 segundos.

Confiabilidade de notificação

É o atributo mais crítico do produto. Uma notificação que não chega equivale a uma vaga que não existiu, e é a segunda queixa mais repetida nas avaliações dos concorrentes.

99% das notificações de vaga entregues em até 60 segundos após o despacho; estado de entrega consultável; reentrega automática em caso de falha.

Latência de despacho

A vaga chega a quem pode aceitá-la enquanto ainda é útil.

Primeira leva de profissionais elegíveis notificada em até 30 segundos após a publicação.

Robustez

O produto lida com entradas inesperadas e com concorrência sem travar nem perder dados.

Nenhum crash nos fluxos cobertos por testes de integração; duas candidaturas simultâneas à mesma posição nunca resultam em confirmação dupla.

Tolerância a falhas

As informações essenciais continuam disponíveis mesmo sem conexão, porque o profissional as consulta na rua.

Turnos confirmados, com endereço, horário, função, valor e contato, legíveis offline por pelo menos 24 horas; ações feitas offline são enfileiradas e sincronizadas.

Usabilidade

O produto é usado sob pressão, por público sem treinamento e sem paciência para tutorial.

Um profissional de primeira viagem conclui uma candidatura em até 3 toques a partir da notificação, sem ajuda; um contratante publica a primeira vaga sem onboarding assistido.

Alcance e compatibilidade

O aplicativo precisa caber no aparelho do trabalhador de base, que é onde a densidade da oferta é construída.

Funciona em Android 9 ou superior com 2 GB de memória; em iOS 16 ou superior; e nos navegadores modernos em versão desktop e móvel.

Economia de dados

O plano de dados do profissional é limitado e o consumo precisa ser proporcional.

Sessão típica de consulta e candidatura abaixo de 1 MB; imagens servidas comprimidas e sob demanda.

Segurança

Dados pessoais e documentos de identificação são protegidos em trânsito e em repouso.

Todo tráfego em HTTPS; dados sensíveis criptografados em repouso; documento e dado pessoal nunca aparecem em log; credenciais no keychain do sistema.

Privacidade e conformidade

O tratamento de dados pessoais respeita a LGPD, com minimização e finalidade declarada.

Base legal e finalidade declaradas por tipo de dado; exclusão de conta e de dados atendida em até 15 dias; canal de contato do encarregado publicado.

Acessibilidade

O produto é utilizável por pessoas com deficiência visual e motora.

Compatível com VoiceOver no iOS e TalkBack no Android; contraste conforme WCAG 2.1 nível AA; suporte a tipografia dinâmica sem quebra de layout.

Disponibilidade

O sistema está no ar quando o problema acontece, que é uma janela conhecida e concentrada.

Disponibilidade mensal de 99,5%, sem manutenção programada entre quinta e domingo, das 16h às 02h.

Escalabilidade

O produto suporta a praça-piloto inteira sem reescrita.

Opera o universo do DF, cerca de 30 mil estabelecimentos e a base de profissionais correspondente, mantendo as faixas de desempenho e de latência de despacho.

Auditabilidade

Publicação, confirmação, execução, cancelamento e avaliação deixam rastro consultável.

Todo evento relevante do ciclo do turno é registrado com data, hora e autor, e pode ser exportado.

Justiça de processo

Bloqueio e suspensão não acontecem sem explicação. A queixa por punição percebida como injusta aparece de forma recorrente nas avaliações dos concorrentes.

Nenhuma suspensão sem motivo registrado e sem canal de contestação com resposta em prazo definido.

7. Requisitos de Documentação

7.1 Notas de Liberação / Leia-me

Cada versão publicada deve trazer uma nota de liberação contendo: resumo das mudanças em linguagem de usuário, funcionalidades novas, correções relevantes, mudanças de comportamento que afetem vagas ou reputação, e instruções de migração quando aplicável. Mudanças em regras de reputação, em critérios de despacho ou em política de cancelamento são destacadas separadamente, porque afetam diretamente a chance de alguém ser chamado, e a percepção de injustiça nesses pontos é uma das queixas mais frequentes do setor. O repositório mantém o histórico completo das versões.

7.2 Ajuda Online

O produto deve oferecer ajuda acessível de dentro da própria interface, sem exigir busca externa. O conjunto mínimo é: uma seção de perguntas frequentes no menu de configurações, cobrindo como funciona o despacho, por que uma vaga pode não aparecer, como a reputação é calculada, o que acontece em caso de cancelamento e como o pagamento é combinado entre as partes; um texto curto explicando cada permissão pedida, especialmente localização e notificação, no momento em que é pedida; a política de privacidade e os termos de uso em linguagem direta; e um canal de suporte acionável durante o turno, com tempo de resposta declarado.

7.3 Guias de Instalação

Não há instalação técnica do lado do usuário além do download nas lojas. O que precisa existir é um guia de primeiro acesso por perfil, exibido no início e consultável depois. Para o profissional: cadastro mínimo, escolha de funções, definição de raio de atuação e de disponibilidade, e ativação da notificação, com explicação de que é ela que traz a vaga. Para o estabelecimento: cadastro, publicação da primeira vaga com um exemplo preenchido, e inclusão de outros usuários da equipe. Para a operação interna: manual do painel, com os critérios de janela crítica e o procedimento de intervenção manual. A documentação técnica de instalação e configuração do ambiente de desenvolvimento fica no repositório, junto ao código.

7.4 Rótulo e Embalagem

Item

Descrição

Status

Nome de exibição (App Store / Play)

“Frila”. O nome nomeia a unidade de trabalho, o turno avulso, e não o setor, o que o mantém válido em qualquer expansão de escopo ou de país. Convenção prevista para diferenciar os dois públicos nas lojas: “Frila Profissionais” e “Frila Estabelecimentos”.

Definido para a marca; separação por público pendente

Ícone do app

Ícone único por aplicativo, nos tamanhos e formatos exigidos por cada loja, legível em tela pequena e reconhecível em lista de notificações.

Pendente

Screenshots e vídeo preview

Capturas por perfil, mostrando o que cada lado ganha: para o contratante, a vaga publicada e preenchida; para o profissional, a notificação de vaga próxima e o histórico de comparecimento.

Pendente

Descrição da loja

Texto de apresentação por público, sem prometer o que não está validado. Em particular, sem afirmar frequência de falta nem tempo médio de preenchimento antes de haver medição.

Pendente

Palavras-chave (ASO)

Termos previstos: frila, freela, freelancer, turno avulso, bico, diária, garçom, bartender, evento, staff, extra, vaga de um dia, Brasília, DF.

Pendente

Política de privacidade e rótulo de dados

Declaração de coleta exigida pelas duas lojas, coerente com a minimização adotada: localização, dados de contato, identificadores e conteúdo do turno, com finalidade declarada para cada item.

Pendente

Classificação etária e categoria

Categoria de negócios ou produtividade; classificação etária compatível com uso profissional e restrição de cadastro a maiores de 18 anos.

Pendente
