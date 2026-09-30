---
tipo: documento-produto
titulo: "Histórias de Usuário e Backlog do Produto (Frila)"
versao: "v1.2.1"
autor: "Júlia Clovandi (Product Owner) & Fabrício Tosta"
desafio: C18
data: 2026-09-30
status: revisao
origem: "01 - CBL/Desafios/C18/Documentos de Produto/Frila_Historias_de_Usuario_e_Backlog.pages"
hash_origem: 3c052318304af4dcac1399a561030ba8ba0c24e750e6f092af2a0d17f6de0401
tags: [documento, user-stories, backlog, moscow, produto, frila]
---

# HISTÓRIAS DE USUÁRIO E BACKLOG

Backlog do Produto e Especificação Ágil (MoSCoW / BDD)

| **Projeto** | Frila |
|---|---|
| **Grupo / Equipe** | BlendOps, Challenge 18 da Apple Developer Academy |
| **Autor(es)** | Júlia Clovandi (Product Owner) & Fabrício Tosta (Product Designer) |
| **Versão** | v1.2.1 |
| **Data** | 30/09/2026 |

## Histórico de Versões

| **Versão** | **Data** | **Autor(es)** | **Descrição da Mudança** |
|---|---|---|---|
| v1.0.0 | 17/09/2026 | Júlia Clovandi & Fabrício Tosta | Criação do Backlog do Produto com 25 Histórias de Usuário priorizadas via MoSCoW e especificadas em formato BDD (INVEST), derivadas da Especificação de Requisitos v1.0.0 e do Documento de Visão v1.0.0 para orientar o protótipo de baixa fidelidade e o MVP. |
| v1.1.0 | 22/09/2026 | Cauê Carneiro | Aplica as respostas do quadro 03 de pendências (21 e 22/09), alinhado à Especificação de Requisitos v1.2.0 e ao Documento de Visão v1.1.0: despacho por proximidade (até 15 km), sem raio configurável e sem levas, com teto de notificações; check-in geolocalizado a 200 m com confirmação manual; avaliação só com presença verificada; aval herdado retirado (US19); persona interna retirada, com Painel do gestor na web e Equipe Frila só por e-mail; modo seleção com fechamento automático; novas US26 (denúncia e bloqueio) e US27 (explicação do despacho); referências de RF e RN corrigidas; metas de tempo de publicação e de número de toques retiradas até haver medição no piloto. |
| v1.2.0 | 22/09/2026 | Cauê Carneiro | Aplica as respostas das pendências para codar (22/09), alinhado à Especificação de Requisitos v1.3.0 e ao Documento de Visão v1.2.0: um app só, com um perfil por conta (RN25, em US01, US03 e US24); entrada por código no e-mail, sem senha e sem SMS (US01); cenário “Disponível agora” retirado (US02); US15 reestimada de 5 para 8 pontos. |
| v1.2.1 | 30/09/2026 | Cauê Carneiro | Publicação consolidada das decisões de produto de 28/09 e revisão de consistência para a entrega parcial de 02/10, alinhada à Especificação de Requisitos v1.4.0, ao Documento de Visão v1.3.0, ao Escopo do MVP e ao contrato da API 0.2.26: maioridade pela data de nascimento (US01); região administrativa (US03, US04, US08); republicar muda data e horário (US05); US07 escrita do ponto de vista do profissional; equipe de confiança pelo administrador e com turno cumprido (US09); o toque na notificação abre o detalhe da vaga com o aviso de RN10 (US10); lembrete sem telefone e “estou a caminho” na v1.1 (US14); falta para quem termina o turno sem check-in (US15); a vaga ganha posição nova no cancelamento (US16); um voto por lado (US17); taxa de comparecimento só do profissional (US18); exclusão sem falta (US25); épicos, datas, componentes de engenharia e metas de tempo corrigidos. Pontos e prioridades MoSCoW não mudaram. |

## Glossário e Metodologia

| **Termo / Conceito** | **Definição** | **Aplicação no Frila** |
|---|---|---|
| INVEST | Critérios de qualidade para histórias ágeis: Independente, Negociável, Valiosa, Estimável, Pequena e Testável. | Todas as 26 histórias de usuário ativas |
| MoSCoW | Framework de priorização: Must Have (obrigatório), Should Have (desejável), Could Have (futuro), Won't Have (fora de escopo). | Classificação do backlog do MVP |
| BDD | Behavior-Driven Development: cenários de comportamento verificáveis no formato Dado / Quando / Então. | Critérios de aceitação de cada história |
| Turno avulso | Jornada pontual de trabalho avulso (diária), sem vínculo continuado. É o núcleo atômico do sistema. | Entidade central do modelo |
| Despacho ativo | Motor que envia a vaga, de uma vez, aos profissionais elegíveis: com a função, disponíveis no horário e a até 15 km do local, mais a equipe de confiança do estabelecimento. No máximo uma notificação a cada 30 minutos por profissional. | Épico 3 (Motor de Despacho) |
| No-show | Furo de comparecimento: profissional confirmado que não aparece no turno. Conta como falta na taxa de comparecimento, inclusive quando o turno termina sem check-in nenhum, e não é avaliado. | Épicos 5 e 6 (Mitigação e reputação) |
| Reputação binária | Avaliação mútua simplificada baseada na pergunta 'Chamaria de novo?', exibida com denominador, só entre quem trabalhou junto e com presença verificada. | Épico 6 (Reputação) |
| Taxa de comparecimento | Turnos com presença divididos pelos turnos confirmados. Falta é não aparecer ou cancelar com menos de 24 h do início; turno não verificado não entra na conta. | US17, US18 |
| Equipe Frila | Pessoas do time que respondem, por e-mail, suporte, denúncias, contestações e pedidos de revisão do despacho, em até 5 dias úteis, e que podem ocultar vaga com conteúdo impróprio. Não acompanham turnos. | US22, US23, US26, US27 |

## 1. Visão Geral e Metodologia

Este documento consolida a tradução funcional do Documento de Visão e da Especificação de Requisitos em Histórias de Usuário (User Stories) orientadas a valor e em um Backlog do Produto priorizado via MoSCoW. O objetivo primordial é municiar a engenharia de software (Cauê Carneiro, João Paulo e Matheus Silva) com especificações de comportamento verificáveis (BDD) e o design de produto (Fabrício Tosta) com os fluxos operacionais necessários para a prototipagem de baixa fidelidade (T-0011), levada à 1ª Apple Review (28 e 29/09/2026), e para o MVP, com publicação na App Store prevista para 13/11/2026.

### 1.1 Critérios de Qualidade (INVEST)

Todas as histórias de usuário foram estruturadas segundo o acrônimo INVEST:

- I (Independent): Redução ao máximo de acoplamento direto entre histórias para viabilizar entregas paralelas.

- N (Negotiable): Espaço para ajustes de implementação acordados entre PO e engenharia.

- V (Valuable): Benefício concreto e perceptível gerado para uma persona real do ecossistema.

- E (Estimable): Escopo delimitado por critérios de aceitação objetivos em BDD.

- S (Small): Granularidade adequada para sprints curtas, de 1 a 2 semanas.

- T (Testable): Critérios de aceitação binários no padrão Dado / Quando / Então.

### 1.2 Personas Mapeadas

| **Persona** | **Perfil Operacional** | **Dor Central** | **Ganho Esperado no Frila** |
|---|---|---|---|
| **Marcos<br> (Gerente de Salão)** | Contratante de Food Service em bar/restaurante de alto giro (40 turnos/mês). | Garçom faltou na sexta às 18h; WhatsApp é caótico e grupos não dão garantia de comparecimento. | Publicar turno com poucos campos, saber antes de confirmar se a pessoa costuma aparecer e ser avisado se a vaga seguir vazia perto do horário. |
| **Carla<br> (Produtora de Eventos)** | Contratante de Eventos / Staff em Lote para congressos e festas. | Precisa fechar equipe de 15 pessoas para montagem/bar e prestar contas sem risco fiscal. | Escala em lote e relatório consolidado auditável de presença e valores combinados. |
| **Lucas<br> (Garçom Freelancer)** | Profissional Operacional Avulso com experiência em salão. | Não fica sabendo das vagas a tempo; cansa de preencher cadastros longos e de levar calote ou pagar taxas. | Notificação direta no bolso com vaga perto de casa, candidatura sem formulário e o valor integral da diária, sem comissão. |

A persona interna de operação saiu na v1.1.0: o Frila não tem plantão nem operação manual de turnos. Quem acompanha vagas e turnos é o gestor do estabelecimento (Marcos ou Carla): no app, pelo alerta de vaga vazia e pela confirmação de check-in, e pelo Painel da versão web, na v1.2; a Equipe Frila só responde e-mail.

## 2. Estrutura de Épicos do Produto

O backlog do Frila divide-se em 7 Épicos centrais que cobrem a jornada completa das duas pontas:

| **Épico** | **Nome do Épico** | **Objetivo Primário** | **Requisitos Atendidos** |
|---|---|---|---|
| **ÉPICO 1** | Onboarding e Perfil Operacional Enxuto | Garantir entrada com atrito zero para o profissional e validação cadastral expressa. | RF01, RF02, RF03 |
| **ÉPICO 2** | Publicação e Gestão de Vagas Expressas | Permitir que o contratante lance uma vaga com poucos campos ou reutilize vagas anteriores. | RF04, RF05, RF19 |
| **ÉPICO 3** | Motor de Despacho Ativo e Matching | Notificar a vaga, de uma vez, a quem tem a função, está disponível e está a até 15 km, com teto de notificações, listar todas as vagas do DF e explicar o critério ao profissional. | RF06, RF07, RF18, RF27 |
| **ÉPICO 4** | Candidatura e Confirmação Instantânea | Possibilitar candidatura sem formulário, confirmação automática no modo urgência e liberação imediata de contato direto. | RF08, RF09, RF10, RF11 |
| **ÉPICO 5** | Execução do Turno, Check-in e Contingência | Mitigar no-show com lembretes pré-turno, check-in geolocalizado e reabertura rápida. | RF12, RF13, RF14 |
| **ÉPICO 6** | Confiança e Reputação Binária | Gerar reputação justa pós-turno ('Chamaria de novo?') com denominador visível, só entre quem trabalhou junto e com presença verificada. | RF15, RF16 |
| **ÉPICO 7** | Auditoria, Prestação de Contas e Suporte | Oferecer relatório consolidado auditável, alerta de vaga vazia e Painel do gestor, suporte por e-mail, contestação de suspensão, múltiplos membros por estabelecimento, denúncia e bloqueio, e respeito total à LGPD. | RF20, RF21, RF22, RF23, RF24, RF25, RF26 |

## 3. Detalhamento das Histórias de Usuário (US01 a US27)

A US19 foi retirada na v1.1.0 e o número fica reservado. As US26 e US27 entraram na mesma versão.

## ÉPICO 1: Onboarding e Perfil Operacional Enxuto

### US01: Cadastro Simples do Profissional com Verificação de Maioridade

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF01, RN14, RN15, RN20, RN25 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como profissional freelancer operacional,”

“quero me cadastrar no aplicativo com meu e-mail, sem senha, informando apenas meu nome, telefone e data de nascimento,”

“para que eu possa começar a receber convites de trabalho sem atritos burocráticos e sem expor fotos de documentos desnecessariamente.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Cadastro realizado com sucesso**

**Dado que **o profissional faz o primeiro acesso ao Frila iOS e escolhe o perfil de profissional,

**Quando **ele digita o código de uso único que chegou no e-mail, informa nome completo, telefone com WhatsApp e data de nascimento e aceita a versão vigente dos termos e da política de privacidade,

**Então **a conta é criada no estado ativo, com o perfil de profissional fixo (RN25), o token de sessão é salvo no Keychain e ele é encaminhado para a definição de funções operacionais.

- **• Cenário 2: Tentativa de cadastro de menor de idade**

**Dado que **a data de nascimento informada indica menos de 18 anos (RN20),

**Quando **ele toca em 'Continuar',

**Então **o servidor recusa o cadastro e o app exibe a mensagem de que a plataforma é exclusiva para maiores de 18 anos.

- **• Cenário 3: Minimização de dados (LGPD)**

**Dado que **o fluxo de cadastro do profissional é apresentado,

**Quando **o formulário é renderizado na tela,

**Então **nenhuma foto de documento (RG/CNH) ou selfie com documento é solicitada, em estrito cumprimento da RN14.

- **• Cenário 4: Outro perfil com o mesmo telefone**

**Dado que **a pessoa já tem uma conta de contratante no Frila,

**Quando **cria uma conta de profissional com outro e-mail e o mesmo telefone,

**Então **o cadastro é aceito, e as duas contas seguem separadas, cada uma com o próprio perfil e a própria reputação (RN25).

### US02: Configuração de Funções, Ponto Base e Disponibilidade

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF03, RN05 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como profissional freelancer,”

“quero selecionar as funções que sei desempenhar, meu ponto base e os dias/turnos em que tenho disponibilidade,”

“para que eu só seja notificado sobre vagas pertinentes ao meu trabalho, no meu horário e perto de onde estou.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Seleção de funções operacionais**

**Dado que **o profissional está na tela de configuração de perfil,

**Quando **seleciona pelo menos uma função do catálogo oficial (ex.: Garçom, Bartender), informa o ponto base e marca a grade semanal de disponibilidade,

**Então **os critérios de elegibilidade daquele perfil passam a valer na próxima notificação, sem novo login; a distância até a vaga (até 15 km) é calculada a partir do ponto base, não há raio a configurar, e a vaga só chega se o turno inteiro couber numa janela da grade.

- **• Cenário 2: Perfil sem funções selecionadas**

**Dado que **o profissional desmarca todas as funções operacionais,

**Quando **tenta salvar o perfil,

**Então **o sistema alerta que é obrigatório manter ao menos uma função ativa para receber despachos.

### US03: Cadastro Ágil do Estabelecimento Contratante

| **Persona Principal** | Marcos (Gerente de Salão) / Carla (Produtora) |
|---|---|
| **Requisitos Vinculados** | RF02, RN15, RN20, RN25 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como gestor de estabelecimento ou produtor de eventos,”

“quero cadastrar meu restaurante ou negócio, de qualquer setor, com nome, CNPJ (ou CPF, quando for pessoa física), tipo de negócio, endereço completo e região administrativa do DF,”

“para que eu possa publicar vagas com identificação institucional clara e localização precisa para check-in dos profissionais.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Cadastro completo com endereço georreferenciado**

**Dado que **o gestor informa CNPJ válido e dados do estabelecimento,

**Quando **o sistema valida o CNPJ e obtém as coordenadas geográficas exatas via MapKit,

**Então **o perfil corporativo é criado, com quem cadastrou como administrador, e habilitado a publicar turnos avulsos.

- **• Cenário 2: Conta com o perfil de contratante**

**Dado que **o gestor entra pela primeira vez com o código enviado ao e-mail e escolhe o perfil de contratante,

**Quando **conclui o cadastro do estabelecimento,

**Então **a conta fica com o perfil de contratante fixo (RN25) e ele pode publicar a primeira vaga na mesma sessão.

## ÉPICO 2: Publicação e Gestão de Vagas Expressas

### US04: Publicação de Turno Avulso com Poucos Campos

| **Persona Principal** | Marcos (Gerente de Bar/Restaurante) |
|---|---|
| **Requisitos Vinculados** | RF04, RN02, RN03, RN04, RN24 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como gerente com equipe desfalcada na hora do pico,”

“quero publicar um turno avulso preenchendo só função, data, horário de início/fim, endereço e região administrativa, valor da diária, número de posições, o que está incluso (refeição, transporte e material próprio) e quem recebe o profissional no local,”

“para que a vaga entre em despacho imediatamente, sem digitação longa no celular.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Publicação expressa com parâmetros válidos**

**Dado que **o contratante preenche data, horário, endereço, função 'Garçom', valor de R$ 140,00, o que está incluso e o nome de quem recebe no local,

**Quando **toca em 'Publicar Vaga',

**Então **a vaga é publicada, com as posições abertas, e o despacho aos profissionais elegíveis é disparado (UC02); traje, rateio dos 10% da taxa de serviço e observações ficam como campos opcionais.

- **• Cenário 2: Tentativa de publicação com campo obrigatório ausente ou horário inválido**

**Dado que **o contratante tenta publicar turno sem um campo obrigatório da RN02 ou com horário de fim anterior ao início,

**Quando **tenta submeter o formulário,

**Então **o sistema bloqueia o envio e destaca o campo inválido com aviso contextual.

- **• Cenário 3: Modo seleção em vaga próxima demais**

**Dado que **o contratante escolhe o modo seleção para uma vaga que começa em menos de 24 horas,

**Quando **tenta publicar,

**Então **o sistema informa que vaga com menos de 24 horas de antecedência é sempre do modo urgência (RN24).

### US05: Republicação de Vaga Anterior

| **Persona Principal** | Marcos (Gerente de Bar/Restaurante) |
|---|---|
| **Requisitos Vinculados** | RF05 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como gerente que contrata o mesmo perfil todo fim de semana,”

“quero repetir um turno anterior informando só a nova data e o novo horário,”

“para que eu não precise reescrever descrição, uniforme ou valores toda vez.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Duplicação de turno a partir do histórico**

**Dado que **o gestor visualiza a lista de turnos passados e toca em 'Repetir Turno',

**Quando **escolhe a nova data e o novo horário e confirma,

**Então **uma nova vaga é publicada com função, local, valor, inclusos e instruções da original, pronta para despacho.

### US06: Publicação de Escala de Evento em Lote

| **Persona Principal** | Carla (Produtora de Eventos) |
|---|---|
| **Requisitos Vinculados** | RF19 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 8 Story Points |

**Declaração da História:**

“Como produtora organizando um congresso ou festival,”

“quero publicar múltiplos postos para o mesmo evento de uma só vez (ex.: 10 garçons, 4 bartenders, 2 coordenadores),”

“para que eu monte a brigada inteira em um único fluxo consolidado.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Criação de grade em lote**

**Dado que **a produtora define o evento e adiciona 3 funções com quantidades distintas,

**Quando **confirma a publicação da escala,

**Então **o sistema cria posições avulsas independentes para cada vaga sob o mesmo ID de evento agrupador.

## ÉPICO 3: Motor de Despacho Ativo e Matching

### US07: Notificação Única por Proximidade, com Teto e Agrupamento

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF06, RN05, RN06, RN23 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 8 Story Points |

**Declaração da História:**

“Como profissional freelancer,”

“quero receber de uma vez a notificação de cada vaga da minha função, perto de mim (até 15 km) e no meu horário, no máximo uma a cada 30 minutos,”

“para ficar sabendo a tempo sem que a notificação vire ruído que eu aprendo a ignorar.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Notificação dos elegíveis**

**Dado que **uma nova vaga de Garçom é publicada na Asa Sul,

**Quando **o motor de despacho é acionado,

**Então **a notificação é enviada ao provedor em até 30 segundos para todos os garçons disponíveis naquele horário a até 15 km do local, sem ordem de envio e sem levas; a taxa de comparecimento não altera quem recebe.

- **• Cenário 2: Várias vagas em pouco tempo**

**Dado que **três vagas compatíveis com o mesmo profissional são publicadas em menos de 30 minutos,

**Quando **o motor de despacho monta as notificações,

**Então **o profissional recebe uma única notificação agrupada ('3 vagas novas perto de você'), e nunca mais de uma a cada 30 minutos.

- **• Cenário 3: Vaga urgente começando em menos de 2 horas**

**Dado que **uma vaga do modo urgência começa em menos de 2 horas,

**Quando **o motor de despacho monta as notificações,

**Então **a vaga fura o agrupamento e é notificada na hora, mas conta no teto de 30 minutos daquele profissional.

- **• Cenário 4: Ninguém é elegível**

**Dado que **não há profissional com a função disponível a até 15 km,

**Quando **o motor de despacho termina a seleção,

**Então **ninguém fora dos critérios é notificado, a vaga continua na lista de todo o DF e o contratante recebe o alerta de vaga vazia na janela crítica.

### US08: Lista de Vagas de Todo o DF

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF07 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como profissional buscando trabalho ativamente,”

“quero abrir o app e ver todas as vagas abertas do DF, das mais próximas para as mais distantes, com filtros por função, data e distância,”

“para que eu encontre oportunidades caso não tenha recebido ou visto a notificação push.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Visualização da lista**

**Dado que **o profissional abre a aba 'Oportunidades',

**Quando **o app ordena as vagas pela distância até o ponto base do profissional,

**Então **são exibidos cartões claros com nome do local, região administrativa, função, horário, valor da diária e o que está incluso; a vaga que já começou sai da lista, salvo a que tem posição reaberta por atraso.

- **• Cenário 2: Filtro**

**Dado que **o profissional quer só vagas de bartender no fim de semana,

**Quando **aplica os filtros de função e data,

**Então **a lista mostra só essas vagas, mantendo a ordem por distância.

### US09: Equipe de Confiança Sempre Notificada

| **Persona Principal** | Marcos (Contratante) / Lucas (Profissional) |
|---|---|
| **Requisitos Vinculados** | RF18, RN05 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como gerente que já trabalhou com excelentes profissionais pelo Frila,”

“quero, como administrador do estabelecimento, que a minha equipe de confiança sempre receba a notificação das vagas da minha casa, mesmo quem mora além de 15 km,”

“para chamar de novo quem já prestou excelente serviço aqui.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Vaga notificada à equipe de confiança**

**Dado que **um profissional da equipe de confiança tem a função e está disponível, mas mora a 22 km do local,

**Quando **a vaga é despachada,

**Então **ele recebe a notificação junto com os demais elegíveis, sem exclusividade de tempo e sem atrasar os outros.

- **• Cenário 2: Profissional da equipe indisponível**

**Dado que **o profissional da equipe não tem a função da vaga ou não está disponível no horário,

**Quando **a vaga é despachada,

**Então **ele não é notificado: a equipe amplia a distância, nunca os outros critérios.

- **• Cenário 3: Inclusão sem turno cumprido na casa**

**Dado que **o administrador tenta incluir um profissional que nunca cumpriu turno com presença verificada no estabelecimento,

**Quando **confirma a inclusão,

**Então **o sistema recusa e explica que só entra na equipe quem já trabalhou na casa; um operador também não consegue incluir nem remover.

### US27: Entender Por Que Recebo Vagas e Pedir Revisão

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF27 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como profissional que quer entender por que recebe (ou não) notificações de vagas,”

“quero ver os critérios do despacho e poder pedir uma revisão,”

“para confiar que a decisão automática é justa e contestá-la se achar que não é (LGPD, art. 20).”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Explicação do critério**

**Dado que **o profissional abre 'Por que recebo vagas' no perfil,

**Quando **a tela carrega,

**Então **ele lê: 'Você recebe notificação de vagas da sua função, perto de você, quando o turno inteiro cabe nos horários em que marcou disponibilidade. Todas as vagas do DF aparecem na lista.'

- **• Cenário 2: Pedido de revisão**

**Dado que **o profissional acha que deveria ter recebido uma vaga,

**Quando **toca em 'Contestar' e descreve o caso,

**Então **o pedido chega à Equipe Frila e é respondido em até 5 dias úteis.

## ÉPICO 4: Candidatura e Confirmação Instantânea

### US10: Candidatura Direta (Sem Currículo nem Chat)

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF08, RN03 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como profissional com o tempo corrido no celular,”

“quero me candidatar a partir da notificação ou da lista, sem formulário,”

“para assegurar a oportunidade sem precisar digitar mensagens ou enviar currículo em PDF.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Candidatura a partir da notificação**

**Dado que **o profissional recebe o push da vaga com diária e horário,

**Quando **toca na notificação, o app abre o detalhe da vaga com o aviso de que telefone e WhatsApp serão mostrados à outra parte (RN10), e ele toca em 'Candidatar-me',

**Então **a candidatura é enviada e, no modo urgência, confirmada na hora se ainda houver posição aberta.

- **• Cenário 2: Sem a função da vaga**

**Dado que **o profissional abre na lista uma vaga de uma função que não declarou,

**Quando **toca em 'Candidatar-me',

**Então **a candidatura é recusada e o app leva à tela de funções.

### US11: Preenchimento Automático em Modo Urgência (First-Come, First-Served)

| **Persona Principal** | Marcos (Contratante) |
|---|---|
| **Requisitos Vinculados** | RF09, RN19 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como gerente com falta urgente de última hora,”

“quero que o primeiro profissional elegível que aceitar a vaga seja confirmado automaticamente pelo sistema,”

“para que o problema seja resolvido no menor tempo físico possível.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Fechamento instantâneo da vaga**

**Dado que **uma vaga urgente recebe o primeiro aceite de um profissional elegível,

**Quando **a transação de bloqueio atômico é processada,

**Então **a posição muda para o estado 'confirmada', o profissional é alocado e quem aceitar depois recebe o aviso de que a posição já foi preenchida (RN19).

### US12: Escolha de Candidatos em Modo Seleção

| **Persona Principal** | Carla (Produtora de Eventos) |
|---|---|
| **Requisitos Vinculados** | RF09, RN24 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como contratante que publica com mais de 24 horas de antecedência para eventos especiais,”

“quero receber uma lista de candidatos interessados e aprovar manualmente quem melhor se adequa ao perfil,”

“para ter controle fino sobre a brigada escalada.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Aprovação manual de candidato**

**Dado que **o contratante visualiza 4 profissionais que se candidataram ao turno,

**Quando **ele compara o indicador 'Chamaria de novo' e a taxa de comparecimento de cada um e toca em 'Confirmar',

**Então **o escolhido é notificado de sua aprovação e a vaga é preenchida.

- **• Cenário 2: Fechamento automático sem escolha**

**Dado que **o contratante não escolheu ninguém até 24 horas antes do início do turno,

**Quando **o prazo vence,

**Então **a vaga fecha automaticamente: as posições ainda abertas são canceladas, as candidaturas pendentes expiram e todos os candidatos são avisados e liberados para outras vagas.

- **• Cenário 3: Retirada da candidatura**

**Dado que **o profissional se candidatou e ainda não foi escolhido,

**Quando **toca em 'Retirar candidatura',

**Então **a candidatura sai da lista do contratante sem nenhuma penalidade para o profissional.

### US13: Liberação de Contato Direto Pós-Confirmação

| **Persona Principal** | Marcos (Contratante) e Lucas (Profissional) |
|---|---|
| **Requisitos Vinculados** | RF11, RN10 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como contratante ou profissional com turno confirmado,”

“quero ter acesso imediato ao botão de ligação e WhatsApp do outro,”

“para combinar detalhes práticos de chegada (ponto de encontro, portaria) sem fricção de chat interno.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Aviso antes de aceitar**

**Dado que **o profissional ou o contratante está na tela de aceitar ou confirmar a posição,

**Quando **a tela é exibida,

**Então **um aviso fixo informa que telefone e WhatsApp serão mostrados à outra parte para combinar o turno; quem não quiser compartilhar não aceita a vaga.

- **• Cenário 2: Acesso ao link direto do WhatsApp**

**Dado que **o turno atinge o status 'Confirmado',

**Quando **o usuário abre o card de detalhes do turno no app,

**Então **o botão 'Chamar no WhatsApp' abre diretamente a conversa com o número da outra parte.

- **• Cenário 3: Fim da visibilidade do contato**

**Dado que **passaram 7 dias desde o fim do turno,

**Quando **o usuário abre o turno no histórico,

**Então **telefone e WhatsApp da outra parte não aparecem mais.

## ÉPICO 5: Execução do Turno, Check-in e Contingência

### US14: Lembrete Inteligente Pré-Turno

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF12 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como profissional com turno agendado para o dia seguinte,”

“quero receber lembretes automáticos 24 h e 3 h antes do início e, na v1.1, avisar o estabelecimento que estou a caminho,”

“para não me esquecer do compromisso e deixar o contratante tranquilo.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Lembrete sem dado pessoal na tela de bloqueio (v1.0)**

**Dado que **faltam 24 horas ou 3 horas para o início do turno,

**Quando **o lembrete chega,

**Então **ele mostra função, horário e região administrativa, sem telefone nem endereço com número (RN10, RN15); ao tocar, o app abre o turno com endereço e contato.

- **• Cenário 2: Estou a caminho (v1.1)**

**Dado que **faltam 3 horas ou menos para o início, ou passaram até 15 minutos dele,

**Quando **o profissional toca em 'Estou a caminho',

**Então **o estabelecimento vê a hora do aviso no acompanhamento; o aviso não conta como presença nem substitui o check-in.

### US15: Check-in e Check-out Geolocalizados

| **Persona Principal** | Lucas (Profissional) e Marcos (Contratante) |
|---|---|
| **Requisitos Vinculados** | RF13, RN11, RN22 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 8 Story Points |

**Declaração da História:**

“Como contratante e profissional,”

“quero que o aplicativo registre o início e o término do turno com a localização lida no momento do toque, a até 200 m do endereço da vaga,”

“para atestar o cumprimento da jornada com precisão, sem livro de ponto manual e sem rastreamento em segundo plano.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Check-in geolocalizado**

**Dado que **o profissional está a até 200 m do endereço da vaga, entre 60 minutos antes do início e o fim previsto,

**Quando **ele toca em 'Fazer Check-in',

**Então **o app lê a localização só nesse toque e envia só a distância; o servidor grava o horário e a distância medida, e o gerente é notificado; vale o horário registrado.

- **• Cenário 2: Geolocalização falha**

**Dado que **não há sinal, a permissão foi negada, o GPS está impreciso ou o profissional está a mais de 200 m,

**Quando **ele toca em 'Fazer Check-in',

**Então **o app registra um check-in manual, que só conta como presença depois que o contratante confirma com um toque, no app ou no Painel web.

- **• Cenário 3: Check-in manual sem confirmação**

**Dado que **o contratante não confirma o check-in manual,

**Quando **o turno termina,

**Então **o turno fica 'não verificado' e não conta nem a favor nem contra na taxa de comparecimento.

- **• Cenário 4: Atraso no início**

**Dado que **chega o horário de início sem check-in, e o profissional recebe um lembrete,

**Quando **passam 15 minutos sem check-in,

**Então **o contratante é alertado e decide esperar ou reabrir a vaga; reabrir por não comparecimento conta como falta, e a posição nova aceita candidatura até 1 hora antes do fim.

- **• Cenário 5: Horário de fim excedido**

**Dado que **o horário de fim previsto passa sem check-out,

**Quando **o sistema confere o turno,

**Então **os dois recebem uma notificação; o que acontece com o valor fica entre as partes, e o app não calcula hora extra.

- **• Cenário 6: Discordância sobre o horário**

**Dado que **o contratante discorda do horário registrado,

**Quando **consulta o turno,

**Então **vale o registro geolocalizado; o Frila não arbitra, e o contratante registra a discordância na avaliação.

- **• Cenário 7: Turno sem check-in nenhum**

**Dado que **o contratante esperou e o profissional não fez check-in,

**Quando **o horário de fim previsto passa,

**Então **o sistema cancela a posição com falta do profissional; o turno fica 'não verificado' e não abre avaliação.

### US16: Cancelamento Justificado com Reabertura Imediata da Vaga

| **Persona Principal** | Marcos (Contratante) e Lucas (Profissional) |
|---|---|
| **Requisitos Vinculados** | RF14, RN12, RN16 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como gerente cujo profissional cancelou de última hora ou como profissional com imprevisto grave,”

“quero que o cancelamento reabra a vaga para despacho automático instantaneamente,”

“para que outro profissional cubra o posto em tempo hábil minimizando o prejuízo.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Cancelamento pelo profissional e reabertura automática**

**Dado que **o profissional cancela o turno 2 horas antes do início informando justificativa,

**Quando **o sistema grava autor, momento, antecedência e motivo,

**Então **a vaga ganha uma posição nova, aberta, e uma nova notificação é disparada em até 30 segundos; como faltavam menos de 24 horas, o cancelamento conta como falta na taxa de comparecimento, sem suspensão nem bloqueio.

- **• Cenário 2: Cancelamento com mais de 24 horas de antecedência**

**Dado que **o profissional cancela o turno 3 dias antes do início,

**Quando **o sistema grava o cancelamento com o motivo,

**Então **a vaga ganha uma posição nova, com nova notificação, e o cancelamento não entra na taxa de comparecimento.

## ÉPICO 6: Confiança e Reputação Binária

### US17: Avaliação Binária Bidirecional Pós-Turno ('Chamaria de novo?')

| **Persona Principal** | Marcos (Contratante) e Lucas (Profissional) |
|---|---|
| **Requisitos Vinculados** | RF15, RN07 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como contratante ou profissional ao final de um turno em que trabalhamos juntos,”

“quero responder apenas SIM ou NÃO para a pergunta 'Chamaria de novo?' ou 'Trabalharia de novo?',”

“para avaliar a outra parte com honestidade e numa resposta só, sem a inflação artificial de notas de 1 a 5 estrelas.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Avaliação mútua simples e rápida**

**Dado que **o fim previsto do turno já passou e a presença foi verificada (check-in geolocalizado ou manual confirmado),

**Quando **uma tela modal exibe a pergunta binária com botões 'Sim' e 'Não',

**Então **o voto é computado no histórico do avaliado e a tela é liberada; cada lado vota uma vez por turno, e pelo estabelecimento vale a primeira resposta de qualquer membro.

- **• Cenário 2: Profissional que não compareceu**

**Dado que **o profissional confirmado não apareceu ou o turno ficou 'não verificado',

**Quando **chega o fim previsto do turno,

**Então **nenhuma avaliação é aberta; a falta pesa só na taxa de comparecimento, para não pesar duas vezes.

### US18: Exibição Clara de Reputação com Denominador e Taxa de Comparecimento

| **Persona Principal** | Marcos (Contratante) e Lucas (Profissional) |
|---|---|
| **Requisitos Vinculados** | RF16 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como contratante avaliando um candidato ou profissional avaliando um local,”

“quero ver exatamente quantos turnos a pessoa já cumpriu e a proporção real de recomendações (ex.: 18 de 20 contratantes chamariam de novo, 90%),”

“para tomar uma decisão baseada em histórico comprovado e sem notas mascaradas.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Perfil do profissional**

**Dado que **o contratante abre o perfil de um profissional,

**Quando **o app renderiza o total de turnos realizados, a taxa de comparecimento (turnos com presença divididos pelos turnos confirmados) e o indicador binário com denominador explícito,

**Então **nenhuma média decimal de estrelas é mostrada em nenhum lugar do sistema, e perfil sem histórico aparece como 'Sem histórico'.

- **• Cenário 2: Perfil do estabelecimento**

**Dado que **o profissional abre o perfil de um estabelecimento,

**Quando **o app renderiza o indicador binário ('N de M trabalhariam lá de novo'),

**Então **o perfil mostra só a reputação com denominador: a taxa de comparecimento é do profissional.

### US19: Retirada na v1.1.0

A US19 (aval de quem trabalhou com o profissional fora da plataforma) saiu do produto em 21/09/2026, junto com a RF17. Só avalia quem trabalhou junto pelo Frila. O número fica reservado e não é reutilizado.

## ÉPICO 7: Auditoria, Prestação de Contas e Suporte

### US20: Exportação de Relatório Consolidado de Turnos Realizados

| **Persona Principal** | Carla (Produtora) / Marcos (Gerente) |
|---|---|
| **Requisitos Vinculados** | RF22, RN17 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como contratante que precisa prestar contas ao financeiro ou à coordenação do evento,”

“quero exportar um relatório em PDF/CSV com todos os turnos executados, horários de check-in e valores combinados,”

“para fechar o pagamento dos extras com um registro auditável do que foi combinado e cumprido.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Geração de extrato mensal**

**Dado que **o gestor seleciona o período de 01 a 31 do mês e toca em 'Exportar Relatório',

**Quando **o sistema compila todos os turnos confirmados, nomes dos profissionais, funções e timestamps de check-in,

**Então **um documento consolidado em PDF/CSV é gerado para download.

### US21: Alerta de Vaga Vazia e Painel do Gestor

| **Persona Principal** | Marcos (Gerente de Bar/Restaurante) |
|---|---|
| **Requisitos Vinculados** | RF20 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 8 Story Points |

**Declaração da História:**

“Como gerente que publicou uma vaga,”

“quero ser avisado no celular quando ela seguir vazia perto do horário e acompanhar, no Painel da versão web, vagas, contratados e turnos da minha casa,”

“para agir a tempo antes de o salão ficar desfalcado, sem depender de ninguém do Frila.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Alerta de vaga vazia na janela crítica**

**Dado que **uma vaga na Asa Norte está a 3 horas do início com posição ainda aberta (antecedência padrão, ajustável na publicação),

**Quando **a janela crítica começa,

**Então **o contratante recebe uma notificação no app e pode, por exemplo, ajustar a vaga ou procurar por fora; o Frila não intervém.

- **• Cenário 2: Acompanhamento no Painel web**

**Dado que **o gestor abre o Painel na versão web do Frila, com a conta de contratante,

**Quando **a tela carrega,

**Então **ele vê as vagas abertas e em alerta, os candidatos, os confirmados, os check-ins feitos e os turnos não verificados.

- **• Cenário 3: Confirmação de check-in manual**

**Dado que **um profissional fez check-in manual porque a localização falhou,

**Quando **o gestor toca em 'Confirmar' no app ou no Painel,

**Então **a presença passa a contar e o turno deixa de ficar 'não verificado'.

### US22: Suporte por E-mail Durante o Turno

| **Persona Principal** | Lucas (Profissional) e Marcos (Contratante) |
|---|---|
| **Requisitos Vinculados** | RF23 |
| **Classificação MoSCoW** | SHOULD HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como usuário enfrentando um imprevisto durante a execução de um turno,”

“quero acionar o suporte a partir da tela do turno, com os dados já preenchidos,”

“para registrar o problema por escrito e saber em quanto tempo terei resposta.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Acionamento do suporte**

**Dado que **o profissional toca em 'Ajuda no Turno',

**Quando **o app abre um e-mail para a Equipe Frila com os dados do turno já contextualizados,

**Então **o prazo de resposta de até 5 dias úteis é mostrado na tela; não há atendimento ao vivo.

- **• Cenário 2: Risco imediato**

**Dado que **o motivo é de segurança,

**Quando **o usuário escolhe esse motivo,

**Então **além do e-mail, o app orienta o contato imediato com as autoridades (190 e 180).

### US23: Transparência e Contestação de Suspensão

| **Persona Principal** | Lucas (Profissional Freelancer) |
|---|---|
| **Requisitos Vinculados** | RF24, RN13 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como profissional que teve a conta suspensa depois de uma denúncia grave confirmada,”

“quero visualizar o motivo registrado e contestar com meu relato e, se quiser, uma evidência,”

“para ter meu direito de defesa assegurado e reativar meu acesso à plataforma.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Envio de contestação**

**Dado que **o profissional com suspensão ativa toca em 'Contestar' e escreve o motivo,

**Quando **a contestação chega à Equipe Frila por e-mail,

**Então **o prazo de resposta de até 5 dias úteis é exibido; se a contestação for aceita, a conta volta na hora.

- **• Cenário 2: Cancelamento não suspende**

**Dado que **o profissional cancelou vários turnos,

**Quando **o sistema atualiza o histórico,

**Então **a conta não é suspensa nem bloqueada: os cancelamentos com menos de 24 horas só entram como falta na taxa de comparecimento.

### US24: Múltiplos Membros por Estabelecimento com Controle de Acesso

| **Persona Principal** | Dono do estabelecimento (administrador) |
|---|---|
| **Requisitos Vinculados** | RF21, RN15, RN25 |
| **Classificação MoSCoW** | COULD HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como dono de restaurante,”

“quero convidar meus gerentes e maîtres para publicar e gerenciar turnos vinculados ao meu estabelecimento,”

“para que a operação não dependa exclusivamente do meu aparelho celular.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Convidar gerente**

**Dado que **o administrador envia convite via e-mail para um colaborador,

**Quando **o colaborador aceita,

**Então **ele pode publicar e confirmar turnos em nome daquele estabelecimento.

- **• Cenário 2: Convite aberto numa conta de profissional**

**Dado que **o colaborador abre o convite numa conta de profissional,

**Quando **tenta aceitar,

**Então **o sistema recusa e explica que é preciso entrar com uma conta de contratante (RN25).

### US25: Exportação e Exclusão de Dados Pessoais (LGPD)

| **Persona Principal** | Lucas (Profissional) / Qualquer Usuário |
|---|---|
| **Requisitos Vinculados** | RF25, RN15 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 3 Story Points |

**Declaração da História:**

“Como usuário cadastrado, em qualquer um dos dois perfis,”

“quero solicitar o download ou a exclusão definitiva dos meus dados pessoais a qualquer momento, de dentro do app,”

“para que minha privacidade seja respeitada em total conformidade com a LGPD e com a diretriz 5.1.1(v) da App Store.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Solicitação de exclusão definitiva**

**Dado que **o usuário solicita exclusão de conta dentro do app e não possui turnos pendentes,

**Quando **o sistema registra a solicitação,

**Então **a sessão é finalizada, o perfil sai do despacho e da busca na hora, os dados pessoais são apagados em até 15 dias e os turnos já realizados são anonimizados, preservando o histórico da contraparte.

- **• Cenário 2: Exclusão com turnos marcados**

**Dado que **o usuário tem turnos confirmados no futuro,

**Quando **confirma a exclusão depois do aviso de que eles serão cancelados,

**Então **os turnos são cancelados sem contar falta, a contraparte é avisada e cada vaga ganha uma posição nova.

### US26: Denunciar e Bloquear

| **Persona Principal** | Lucas (Profissional) e Marcos (Contratante) |
|---|---|
| **Requisitos Vinculados** | RF26, RN05, RN13 |
| **Classificação MoSCoW** | MUST HAVE |
| **Estimativa / Complexidade** | 5 Story Points |

**Declaração da História:**

“Como profissional ou contratante que passou por assédio, discriminação ou uma situação de risco,”

“quero denunciar e bloquear a outra parte a partir do perfil ou do turno,”

“para que o caso chegue à Equipe Frila e eu nunca mais cruze com essa pessoa na plataforma.”

**Critérios de Aceitação (BDD):**

- **• Cenário 1: Denúncia**

**Dado que **o usuário toca em 'Denunciar' no perfil ou no turno,

**Quando **escolhe o motivo (assédio, discriminação, risco à segurança ou outro) e descreve o caso,

**Então **a denúncia chega à Equipe Frila por e-mail, com resposta em até 5 dias úteis; denúncia grave confirmada leva à suspensão, sempre com direito de contestar (US23).

- **• Cenário 2: Bloqueio**

**Dado que **o usuário toca em 'Bloquear',

**Quando **confirma,

**Então **o bloqueio é imediato: as partes não voltam a se cruzar em notificações, listas e candidaturas.

## 4. Matriz de Priorização MoSCoW

A priorização MoSCoW estabelece o cronograma de engenharia e design para as entregas do MVP, com o TestFlight em outubro/2026 e a App Store em 13/11/2026, e das versões subsequentes:

| **Prioridade MoSCoW** | **Critério Estratégico** | **Histórias de Usuário Incluídas** |
|---|---|---|
| **MUST HAVE<br> (MVP / loja em 13/11)** | Indispensável para viabilizar a jornada ponta a ponta: publicação com poucos campos, notificação por proximidade com teto, candidatura sem formulário, check-in geolocalizado, avaliação binária, alerta de vaga vazia e as exigências da App Store (denúncia e bloqueio, exclusão de conta). A contestação entra junto porque a RN13 a exige sempre que houver suspensão. Da US21, a v1.0 leva a parte do app; o Painel web vem com a versão web, na v1.2. | US01, US02, US03, US04, US05, US07, US08, US10, US11, US13, US14, US15, US16, US17, US18, US21, US23, US25, US26<br> (19 Histórias · 90 Pontos) |
| **SHOULD HAVE<br> (Versão 1.1)** | Alto valor operacional para escala e retenção, implementadas logo após a estabilização do fluxo principal. | US06 (Escala em lote), US09 (Equipe de confiança), US12 (Modo seleção), US20 (Relatório consolidado), US22 (Suporte por e-mail), US27 (Explicação do despacho)<br> (6 Histórias · 31 Pontos) |
| **COULD HAVE<br> (Versão 1.2)** | Melhorias de conveniência que agregam valor contínuo sem bloquear a validação da tese inicial. | US24 (Múltiplos membros do estabelecimento)<br> (1 História · 3 Pontos) |
| **WON'T HAVE<br> (Fora de Escopo)** | Recursos rejeitados deliberadamente para mitigar riscos trabalhistas, fiscais e fricção operacional. | • Custódia/processamento in-app de pagamento (RN09)<br> • Desconto de comissão sobre o valor do turno (RN01)<br> • Chat interno (substituído por WhatsApp)<br> • Avaliação de 1 a 5 estrelas<br> • Contratação CLT ou processo seletivo formal<br> • Aval de quem trabalhou fora da plataforma (US19 retirada)<br> • Plantão, atendimento ao vivo ou operação manual de turnos pelo Frila<br> • Vaga remota no MVP (entra depois do MVP) |

## 5. Rastreabilidade com Engenharia e Design

Mapeamento direto entre as Histórias de Usuário e os componentes descritos no Diagrama de Classe e no Diagrama de Arquitetura (frila-docs/arquitetura/). A prioridade MoSCoW é a do backlog do MVP e não repete a prioridade Alta, Média ou Baixa dos RFs: US05, US08 e US14 são MUST porque o ciclo da v1.0 depende delas, embora RF05, RF07 e RF12 sejam de prioridade média no Documento de Requisitos.

| **Componente Arquitetural** | **Responsabilidade Primária** | **Histórias Atendidas** |
|---|---|---|
| **PublicarVagaViewModel** | Orquestra a tela de publicação, a validação de RN02 e a republicação de uma vaga anterior (RPC republicar_vaga). | US04, US05, US06 |
| **DespachoService / ElegibilidadeSpec** | Especificação da seleção por função, disponibilidade e distância de até 15 km, mais a equipe de confiança, com teto e agrupamento (RN23). A regra roda no backend, em privado.elegiveis e privado.despachar_vaga, e vale igual para iOS, Android e web. | US02, US07, US09, US27 |
| **FeedVagasViewModel / CandidaturaViewModel** | Lista de todas as vagas do DF ordenada por distância, com filtros, e envio da candidatura, confirmada de forma atômica no modo urgência. | US08, US10, US11 |
| **Turno / RegistroDePresenca** | Check-in e check-out pelas RPCs fazer_checkin, fazer_checkout e confirmar_checkin_manual, com a localização lida no toque; lembretes, alertas de atraso e de fim de turno e reabertura, pelo agendador do backend. | US14, US15, US16 |
| **Reputacao / Avaliacao** | Exibição da taxa de comparecimento (presença ÷ confirmados) e da razão binária ('Chamaria de novo?'), só com presença verificada; o cálculo e a reconciliação ficam no backend. | US17, US18 |
| **Exportação de turnos** | Edge Function exportar-turnos, em CSV ou PDF, com dados consolidados auditáveis (RN17), na v1.1. | US20 |
| **AcompanhamentoViewModel** | No perfil de contratante: vagas em alerta e confirmação de check-in manual. | US21 |
| **Painel do gestor (web)** | Acompanhamento de vagas, candidatos, contratados, check-ins e turnos na versão web do Frila, no perfil de contratante. | US21 |
| **Canal de e-mail da Equipe Frila** | Suporte, denúncias, contestações e pedidos de revisão do despacho, com resposta em até 5 dias úteis. | US22, US23, US26, US27 |

## 6. Próximos Passos de Execução

- Alinhamento com Fabrício Tosta (T-0011): as histórias do grupo MUST HAVE guiaram o protótipo de baixa fidelidade, em escala de cinza, levado à 1ª Apple Review (28 e 29/09).

- Distribuição de Engenharia (Cauê, João Paulo e Matheus): cartões técnicos no quadro do Trello do Frila a partir dos critérios BDD, começando pelas US01, US04, US07, US10 e US15.

- Apple Review de 09 e 10/11 (primeira versão do produto): demonstrar as histórias MUST HAVE funcionando no app iOS, antes da publicação na App Store em 13/11.
