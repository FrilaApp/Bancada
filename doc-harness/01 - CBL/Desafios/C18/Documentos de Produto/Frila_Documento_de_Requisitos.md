---
tipo: documento-derivado
origem: "doc-harness/01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos.docx"
hash_origem: e37a259fd41ac18c92fe869534e55d17cd13125855a039921fa842fd32f3b935
exportado_em: 2026-09-22T03:09
exportado_por: Cauê Carneiro <cauecarneiroc@gmail.com>
conversao: ok
tags: [documento]
---

# Frila_Documento_de_Requisitos

> [!info] Gerado automaticamente
> Este arquivo é derivado de `Frila_Documento_de_Requisitos.docx` e é **sobrescrito** a cada conversão.
> Para mudar o conteúdo, edite o `.docx` original.

ESPECIFICAÇÃO DE REQUISITOS

Documento de Requisitos de Software

Projeto

Frila

Grupo / Equipe

BlendOps, Challenge 18 da Apple Developer Academy

Autor(es)

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Versão

v1.2.0

Data

22/09/2026

Histórico de Versões

Versão

Data

Autor(es)

Descrição da Mudança

v1.0.0

14/09/2026

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Criação inicial. Deriva as regras de negócio, requisitos e casos de uso do Documento de Visão v1.0.0 e dos documentos 00 a 04 revisados em setembro/2026.

v1.1.0

18/09/2026

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Seção 6.1 completa: diagrama de casos de uso em três vistas, tabela de atores, UC01 a UC08 revisados (despacho sem ampliar raio, turnos sobrepostos barrados, fluxos alternativos que faltavam) e UC09 a UC16 novos, cobrindo os RFs que não tinham caso de uso. Matriz de rastreabilidade e numeração das figuras atualizadas.

v1.2.0

22/09/2026

Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva

Aplica as respostas do quadro 03 de pendências (21 e 22/09): plataforma horizontal e sem campanha política; despacho por proximidade (até 15 km), sem raio configurável e sem levas, com teto de notificações (RN23); check-in geolocalizado a 200 m com confirmação manual (RN22); avaliação só com presença verificada e nova definição de taxa de comparecimento; aval herdado retirado (RF17 e UC12); Painel como feature web do gestor e Equipe Frila só por e-mail; denúncia e bloqueio (RF26 e UC17); explicação do despacho (RF27); turnos sobrepostos (RN21) e modo seleção (RN24) viram regra; stack decidida (Swift/SwiftUI, Kotlin, Supabase, FCM, SwiftData); entidade Dispositivo e contrato da API em Documentos/API/openapi.yaml; metas de tempo de publicação e de número de toques retiradas até haver medição no piloto.

Glossário

Termo / Sigla

Definição

Contexto de Uso

RF

Requisito Funcional. Algo que o sistema deve fazer do ponto de vista do usuário.

Seção 3

RNF

Requisito Não Funcional. Qualidade que o sistema deve ter (desempenho, segurança, acessibilidade).

Seção 4

RN

Regra de Negócio. Restrição ou comportamento obrigatório definido pelo produto.

Seção 2

UC

Use Case (Caso de Uso). Interação entre ator e sistema para atingir um objetivo.

Seção 6.1

Ator

Quem interage com o sistema para atingir um objetivo: pessoa ou papel, nunca o próprio sistema.

Seção 6.1

«include» / «extend»

Relações entre casos de uso. «include»: o caso incluído sempre acontece dentro do outro. «extend»: o caso acontece só sob uma condição, a partir de um ponto do outro.

Seção 6.1

DER

Diagrama Entidade-Relacionamento. Representação visual do banco de dados.

Seção 6.2

Frila / turno avulso

Uma única jornada de trabalho contratada de forma pontual, sem vínculo continuado. É a unidade de trabalho do sistema.

Todo o documento

Vaga

Registro publicado pelo contratante descrevendo um turno a ser coberto: função, data, horário, endereço, valor, número de posições, o que está incluso e quem recebe o profissional no local.

Seções 2, 3 e 6

Posição

Cada unidade preenchível de uma vaga. Uma vaga de 4 garçons tem 4 posições.

Seções 3 e 6

Despacho ativo

Envio da vaga por notificação, de uma vez, aos profissionais elegíveis: com a função, disponíveis no horário e a até 15 km do local, mais a equipe de confiança do estabelecimento. Não há ordem de envio nem levas.

Seções 2, 3 e 6

Elegibilidade

Conjunto de critérios que define quem recebe a notificação de uma vaga específica (RN05).

Seções 2, 3 e 6

Equipe de confiança

Profissionais que o estabelecimento marcou para receber a notificação das suas vagas mesmo além de 15 km, sem exclusividade de tempo.

Seções 3 e 6

Taxa de comparecimento

Turnos com presença divididos por turnos confirmados. Presença é check-in geolocalizado ou manual confirmado pelo contratante; falta é não aparecer ou cancelar com menos de 24 horas. Não entram na conta: candidatura não escolhida, cancelamento com mais de 24 horas e turno não verificado.

Seções 2, 3 e 6

Turno não verificado

Turno com check-in manual que o contratante não confirmou. Não conta a favor nem contra na taxa de comparecimento.

Seções 2, 3 e 6

Reputação binária

Resposta única (“chamaria de novo?” ou “trabalharia de novo?”), exibida com o denominador e nunca como média de 1 a 5.

Seções 2, 3 e 6

Modo urgência / modo seleção

Dois comportamentos de preenchimento: no primeiro, o primeiro candidato elegível que aceita fica com a posição; no segundo, o contratante escolhe entre os candidatos. O modo seleção só vale para vaga que começa em mais de 24 horas.

Seções 2, 3 e 6

Janela crítica

Antecedência em que, com a posição ainda vaga, o contratante recebe um alerta por notificação. O padrão é 3 horas antes do início, ajustável na publicação.

Seções 2, 3 e 6

Painel

Feature da versão web do app do estabelecimento: dashboard do gestor para acompanhar vagas, contratados e turnos. Não é ferramenta interna do Frila.

Seções 3 e 6

Equipe Frila

Pessoas do time Frila que respondem, por e-mail, suporte, denúncias, contestações e pedidos de revisão do despacho. Não acompanham turnos.

Seções 3 e 6

[H]

Hipótese não confirmada em campo. Marca herdada da documentação de pesquisa do projeto.

Todo o documento

1. Introdução e Visão Geral

1.1 Propósito do Documento

Este documento especifica os requisitos funcionais, os requisitos não funcionais, as regras de negócio e os casos de uso do sistema Frila, servindo de referência para o time de desenvolvimento, para os testes e para a validação com as partes interessadas. O posicionamento de mercado, as personas e a justificativa de cada escolha estão no Documento de Visão v1.1.0, que este documento complementa e não repete.

Uma ressalva de leitura, herdada da documentação de pesquisa do projeto: o Frila está em TRL 2, sem código escrito e sem validação de campo. As regras e os requisitos aqui derivam de evidência pública sobre o mercado e das falhas observadas nos concorrentes, mas as premissas de comportamento do usuário no Distrito Federal permanecem hipóteses, marcadas com [H]. Requisitos que dependem diretamente de uma hipótese trazem a marca no próprio texto, para que a revisão posterior saiba onde mexer.

1.2 Escopo

Objetivo do Produto

Permitir que um contratante publique um turno avulso e o preencha em poucas horas com um profissional em quem possa confiar, ainda que as duas partes nunca tenham trabalhado juntas. O sistema resolve isso levando a vaga ativamente até quem pode aceitá-la e dando a cada lado um sinal verificável sobre o outro antes da decisão.

Público-alvo

Qualquer negócio que precise cobrir um turno avulso, de qualquer setor: bares, restaurantes, cafeterias, buffets, produtoras de evento, varejo, logística, serviços domésticos e outros. Food service e eventos são o foco da divulgação inicial. Do outro lado, os profissionais que trabalham por turno avulso. Praça inicial: Distrito Federal.

Plataformas

Dois aplicativos, o do Profissional e o do Estabelecimento, cada um em iOS nativo (Swift e SwiftUI), Android nativo (Kotlin) e versão web. O Painel é uma feature da versão web do app do estabelecimento, usada pelo gestor. O backend é o Supabase, onde ficam as regras que precisam valer igual nos três clientes. Para a entrega na loja em 13/11, o iOS é o mínimo; Android e web são a meta.

Fora do Escopo

Processamento, custódia ou repasse de pagamento. O valor é combinado e pago diretamente entre as partes, e o sistema apenas registra o que foi acordado. Também estão fora: contratação em regime CLT e processo seletivo, emissão de contrato ou nota fiscal, chat interno, avaliação por nota de 1 a 5, feed ou rede social, aval de quem trabalhou com o profissional fora da plataforma, atendimento ao vivo ou plantão da equipe Frila, operação fora do DF antes da consolidação local e qualquer cobrança dentro do aplicativo enquanto o modelo de monetização não estiver definido. Vaga remota faz parte do escopo do produto, mas fica para depois do MVP: na primeira versão, toda vaga é presencial.

1.3 Visão Geral do Documento

Este documento está organizado da seguinte forma: a Seção 2 define as Regras de Negócio, que originam os requisitos; a Seção 3 especifica os Requisitos Funcionais, com prioridade, critério de aceitação, estimativa e matriz de impacto por esforço; a Seção 4 descreve os Requisitos Não Funcionais; a Seção 5 lista o Escopo Não Contemplado; a Seção 6 apresenta os diagramas de casos de uso, de banco de dados, de classes e de arquitetura; e a Seção 7 reúne a matriz de rastreabilidade completa.

2. Regras de Negócio

2.1 Regras Obrigatórias

#

Regra

Contexto / Justificativa

RN01

O sistema NÃO DEVE descontar comissão ou taxa do valor pago ao profissional pelo turno: o valor anunciado na vaga é o valor integral que ele recebe.

Em todos os concorrentes pesquisados, e independentemente do modelo de cobrança, as piores avaliações vêm do lado de quem trabalha. O modelo de moedas do GetNinjas acumula relatos de gasto sem retorno. É a única definição fechada do modelo de receita.

RN02

Uma vaga NÃO DEVE ser publicada sem função, data, horário de início e fim, endereço, valor por posição, número de posições, o que está incluso (refeição, transporte e material próprio) e o nome de quem recebe o profissional no local.

O profissional precisa decidir com informação completa antes de aceitar. Avaliações dos concorrentes relatam chegada ao local “sem muita informação”, e aceite sem tempo de deslocamento. Refeição, transporte e material mudam o valor real de uma diária: sem esses campos, dois anúncios com o mesmo valor não são comparáveis.

RN03

O valor NÃO DEVE ser negociável dentro do fluxo de candidatura: o que está no anúncio é o que vale.

Candidatura sem formulário e sem negociação é o que torna possível preencher um turno a tempo. Negociação reintroduz o funil que o produto existe para eliminar.

RN04

O sistema DEVE despachar ativamente toda vaga publicada aos profissionais elegíveis, por notificação, e NUNCA apenas expô-la em um mural à espera de ser encontrada.

É o mecanismo central do produto e a resposta ao padrão “cadastro não é liquidez”, presente em praticamente todo concorrente com número verificável.

RN05

O sistema NÃO DEVE notificar profissional inelegível para a vaga: sem a função, indisponível no horário, a mais de 15 km do local (salvo quem é da equipe de confiança do estabelecimento), com perfil suspenso, com bloqueio entre as partes ou com turno confirmado sobreposto.

Um marketplace que manda tudo para todo mundo treina o usuário a ignorar notificação, e aí o canal morre. A notificação é o produto. A distância de 15 km é parâmetro do sistema, a ajustar com dado do piloto [H]; a vaga continua visível para todo o DF na lista.

RN06

Nenhuma notificação, prioridade ou posição na lista de vagas DEVE poder ser comprada, patrocinada ou promovida. A taxa de comparecimento aparece no perfil e NÃO altera quem recebe a notificação.

Qualquer venda de prioridade reintroduz o leilão de trabalho que o projeto rejeita. A taxa de comparecimento serve para o contratante decidir, não para filtrar quem fica sabendo da vaga.

RN07

A avaliação DEVE ser binária e bidirecional, só entre quem trabalhou junto pelo Frila, e liberada somente após o fim previsto de um turno com presença verificada (RN22). Quem não compareceu não é avaliado. O sistema NÃO DEVE exibir média de 1 a 5.

Nota média com poucas avaliações não informa nada; “sete de sete chamariam de novo” informa. A avaliação nos dois sentidos corrige a assimetria observada no setor, em que só o contratante avalia. A falta já pesa na taxa de comparecimento e não pesa duas vezes.

RN08

A reputação exibida DEVE sempre mostrar o denominador (ex.: “7 de 7”) e o número de turnos considerados.

Um percentual sem denominador esconde amostra pequena e produz falsa confiança.

RN09

O sistema NÃO DEVE processar, custodiar ou repassar pagamento. O valor acordado é registrado; o pagamento é combinado diretamente entre as partes.

Decisão de escopo da versão 1. Pagamento retido ou atrasado é a queixa recorrente em Switch, Closeer e eFreela; assumir a custódia sem operação madura repetiria o problema.

RN10

O contato direto entre as partes SÓ DEVE ser liberado após a confirmação da posição e fica visível até 7 dias depois do fim do turno. A tela de aceite avisa que telefone e WhatsApp serão mostrados à outra parte; quem não quiser compartilhar não aceita a vaga.

Antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones. Depois dela, o contato é necessário para combinar detalhes e o pagamento. A base legal é a execução do contrato (LGPD, art. 7º, V), e o prazo de 7 dias limita a exposição do dado.

RN11

O sistema DEVE registrar o check-in, o check-out e o valor acordado do turno, e disponibilizar esse registro aos dois lados.

Hoje tudo isso vive em conversa de WhatsApp e memória. O registro geolocalizado é o que vale: o Frila não arbitra divergência, e quem discordar registra isso na avaliação. É também a base da taxa de comparecimento.

RN12

Todo cancelamento DEVE registrar autor, momento, antecedência e motivo, e DEVE reabrir a posição com nova notificação imediata.

Uma posição cancelada e não reaberta é um turno que falha em silêncio. A antecedência separa o cancelamento que não conta (mais de 24 horas) da falta (menos de 24 horas).

RN13

O sistema NÃO DEVE suspender ou bloquear um perfil sem motivo registrado e sem canal de contestação com resposta em até 5 dias úteis. A suspensão só acontece por denúncia grave confirmada (assédio, fraude ou documento falso); cancelamento nunca suspende, só afeta a taxa de comparecimento.

Punição percebida como injusta é queixa recorrente: bloqueio por duas desistências, inclusive com dois dias de antecedência, e punição por falta a uma vaga que havia sumido do aplicativo.

RN14

O cadastro mínimo do profissional NÃO DEVE exigir mais do que o necessário para receber a primeira notificação de vaga; a verificação de identidade é progressiva.

Cadastro travado antes de qualquer trabalho é uma barreira documentada nos concorrentes: selfie que não centraliza, documento que não sobe, e recusa explícita por desconfiança.

RN15

Dados pessoais e documentos de identificação NÃO DEVEM aparecer em log nem ser usados fora da finalidade declarada ao titular.

LGPD, e resposta direta à desconfiança registrada: “não acho seguro adicionar minha foto segurando meus documentos”.

RN16

O sistema NÃO DEVE criar subordinação, exclusividade ou escala obrigatória: o profissional escolhe o que aceita e recusar vaga NÃO DEVE gerar penalidade.

Mitigação do risco de caracterização de vínculo empregatício, hoje em discussão no Tema 1.291 do STF e no PLP 12/2024. Recusar é diferente de aceitar e não comparecer.

RN17

O sistema DEVE permitir ao contratante exportar o relatório consolidado de turnos realizados com data, horários auditados, valor acordado e profissional alocado.

Garante suporte ao fechamento contábil e à conciliação financeira de quem contrata, e à prestação de contas de produções de grande porte.

RN18

Valores monetários DEVEM ser armazenados em centavos, como inteiro, em reais (BRL), e horários DEVEM ser gravados em UTC e exibidos no fuso America/Sao_Paulo.

Evita erro de arredondamento em dinheiro e ambiguidade de horário em turno que vira a madrugada.

RN19

Uma posição NÃO DEVE ser confirmada para mais de um profissional, mesmo sob candidaturas simultâneas.

Confirmação dupla produz pessoa que se desloca sem ter trabalho, o tipo de falha que destrói confiança de uma vez só.

RN20

O cadastro DEVE ser restrito a maiores de 18 anos.

Exigência legal para trabalho em bares, eventos com venda de bebida alcoólica e trabalho noturno.

RN21

Um profissional NÃO DEVE ter dois turnos confirmados que se sobreponham no tempo. A regra é garantida no banco de dados, e não só na tela.

Sem ela, o profissional aceita de boa-fé dois turnos no mesmo horário e falta a um, derrubando a própria taxa de comparecimento por falha do sistema (decisão D1).

RN22

O check-in e o check-out DEVEM ser geolocalizados, com a localização lida só no momento do toque, e valem a até 200 m do endereço da vaga. Se a geolocalização falhar, o check-in manual SÓ conta como presença depois de confirmado pelo contratante; sem confirmação, o turno fica “não verificado” e não conta a favor nem contra na taxa de comparecimento.

Ler a localização só no toque respeita a regra de não rastrear o profissional (RN16) e o pedido de permissão da App Store. Os 200 m cobrem o erro comum de GPS em área urbana [H]. A confirmação manual resolve subsolo, sinal ruim e permissão negada sem inventar presença.

RN23

O sistema NÃO DEVE enviar ao mesmo profissional mais de uma notificação de vaga a cada 30 minutos. Vagas próximas no tempo são agrupadas numa única notificação; vaga do modo urgência que começa em menos de 2 horas fura o agrupamento, mas conta no teto.

Com vários estabelecimentos publicando ao mesmo tempo, notificar cada vaga separadamente vira spam, e o profissional desliga as notificações. O teto protege o canal que é o produto.

RN24

O modo seleção SÓ PODE ser escolhido para vaga que começa em mais de 24 horas. Se o contratante não escolher até 24 horas antes do início, a vaga fecha automaticamente e os candidatos são avisados e liberados; o profissional pode retirar a candidatura sem penalidade enquanto não for escolhido.

Sem prazo, a posição fica presa esperando uma escolha que pode não vir, e o profissional deixa de aceitar outras vagas. Vaga para menos de 24 horas é urgência por natureza.

3. Requisitos Funcionais

3.1 Lista de Requisitos Funcionais

#

Requisito Funcional

Prioridade

Critério de aceitação

RF01

O sistema deve permitir que o profissional se cadastre e autentique com dados mínimos: nome, telefone, e-mail e confirmação de maioridade.

Alta

Um profissional conclui o cadastro e fica apto a receber notificações de vaga sem enviar documento.

RF02

O sistema deve permitir que o contratante cadastre o estabelecimento com razão social ou nome, documento (CNPJ ou CPF), endereço e responsável.

Alta

Um contratante conclui o cadastro e publica a primeira vaga na mesma sessão, sem onboarding assistido.

RF03

O sistema deve permitir que o profissional declare suas funções, seu ponto base e sua disponibilidade por dia e faixa de horário, e marque que está disponível agora.

Alta

Alterações de função, ponto base e disponibilidade passam a valer na notificação seguinte, sem exigir novo login; não existe distância configurável pelo profissional.

RF04

O sistema deve permitir que o contratante publique uma vaga com os campos obrigatórios de RN02 e, se quiser, traje exigido, participação no rateio dos 10% da taxa de serviço e observações.

Alta

A publicação pede só os campos de RN02, com o local pré-preenchido pelo endereço do estabelecimento; o modo de preenchimento e a antecedência do alerta de vaga vazia (padrão de 3 horas) são escolhidos na publicação; a vaga é rejeitada com mensagem clara se algum campo obrigatório de RN02 faltar.

RF05

O sistema deve permitir republicar uma vaga a partir de outra já publicada, alterando apenas data e horário.

Média

A republicação copia todos os campos da vaga de origem e pede só a nova data e o novo horário.

RF06

O sistema deve notificar a vaga, de uma vez, aos profissionais elegíveis (RN05), respeitando o teto e o agrupamento de RN23.

Alta

A notificação é enviada ao provedor em até 30 segundos após a publicação; nenhum profissional inelegível a recebe; nenhum profissional recebe mais de uma notificação de vaga a cada 30 minutos, salvo a exceção de urgência de RN23.

RF07

O sistema deve permitir que o profissional liste e filtre todas as vagas abertas do DF, por função, data e distância.

Média

A lista traz todas as vagas abertas, das mais próximas para as mais distantes; vagas de outro estado aparecem no fim.

RF08

O sistema deve permitir que o profissional se candidate a uma vaga direto da notificação ou da lista, sem formulário.

Alta

A candidatura sai da notificação ou da lista sem formulário, sem carta de apresentação e sem negociação de valor.

RF09

O sistema deve oferecer dois modos de preenchimento: urgência, em que o primeiro candidato elegível que aceita ocupa a posição, e seleção, em que o contratante escolhe entre os candidatos (RN24).

Alta

O modo é escolhido na publicação, e o seleção só aparece para vaga que começa em mais de 24 horas; em urgência, a posição é ocupada automaticamente pelo primeiro candidato elegível; em seleção, se ninguém for escolhido, a vaga fecha sozinha 24 horas antes do início, e os candidatos são avisados e liberados.

RF10

O sistema deve confirmar a posição e notificar os dois lados com função, local, horário, valor e identificação da contraparte.

Alta

A confirmação é enviada aos dois lados pelo provedor de push, na meta de RNF02; a posição some das vagas abertas; nenhuma posição é confirmada para dois profissionais (RN19).

RF11

O sistema deve liberar o contato direto entre as partes (telefone e WhatsApp) somente após a confirmação, com aviso na tela de aceite (RN10).

Alta

O contato é inacessível antes da confirmação, fica disponível para ambos logo depois dela e some da tela 7 dias após o fim do turno; a tela de aceite avisa que o contato será mostrado à outra parte.

RF12

O sistema deve enviar lembrete pré-turno para os dois lados, 24 horas e 3 horas antes do início.

Média

Os dois lembretes são entregues nos horários definidos e trazem endereço, horário e contato da contraparte.

RF13

O sistema deve registrar o check-in e o check-out do profissional por geolocalização (RN22), com check-in manual confirmado pelo contratante quando a localização falhar.

Alta

O check-in a até 200 m grava a hora e a distância medida; fora disso, o check-in manual só vale com a confirmação do contratante, no app ou no Painel web; no horário de início sem check-in, o profissional recebe um lembrete; aos 15 minutos sem check-in, o contratante é alertado e decide esperar ou reabrir a vaga; ao passar o fim previsto sem check-out, os dois são avisados.

RF14

O sistema deve permitir o cancelamento por qualquer das partes, com motivo e registro de antecedência, reabrindo a posição com nova notificação imediata.

Alta

O cancelamento registra autor, momento, antecedência e motivo; a posição volta a aparecer como aberta e a notificação é enviada em até 30 segundos; cancelamento do profissional com menos de 24 horas conta como falta na taxa de comparecimento.

RF15

O sistema deve solicitar a avaliação binária de cada lado após o fim previsto de um turno com presença verificada (RN07).

Alta

A avaliação só fica disponível após o horário de término e só para turno com check-in geolocalizado ou manual confirmado; cada lado responde “sim” ou “não” a uma única pergunta; nenhuma nota de 1 a 5 é oferecida; quem não compareceu não é avaliado.

RF16

O sistema deve exibir, no perfil de cada parte, a reputação com denominador e a taxa de comparecimento.

Alta

O perfil mostra “N de M chamariam de novo” e a taxa de comparecimento com o total de turnos considerados; perfis sem histórico são exibidos explicitamente como sem histórico, e não como nota zero.

RF17

Retirado em 21/09/2026: o aval de quem trabalhou com o profissional fora da plataforma saiu do produto. O número fica reservado e não é reutilizado.

—

—

RF18

O sistema deve permitir que o estabelecimento mantenha uma equipe de confiança, que recebe a notificação das suas vagas mesmo além de 15 km.

Média

Profissionais da equipe com a função e disponíveis recebem a notificação das vagas do estabelecimento, independentemente da distância; não há exclusividade de tempo nem prioridade sobre os demais.

RF19

O sistema deve permitir montar uma escala de evento em lote, com múltiplas funções e posições, publicadas de uma vez e com antecedência.

Média

É possível publicar pelo menos 40 posições distribuídas em várias funções numa única operação, com acompanhamento do preenchimento por função.

RF20

O sistema deve alertar o contratante, por notificação, quando uma posição segue vaga dentro da janela crítica, e oferecer ao gestor, na versão web, um Painel para acompanhar vagas, contratados e turnos.

Alta

Toda posição aberta a 3 horas do início, ou na antecedência escolhida na publicação, gera alerta ao contratante no app; o Painel web mostra vagas, candidatos, confirmados, check-ins e turnos não verificados, e permite confirmar check-in manual, o que também é possível no app.

RF21

O sistema deve permitir múltiplos usuários por estabelecimento, com papéis distintos (administrador e operador).

Média

Um novo usuário é incluído sem compartilhamento de senha; o histórico do estabelecimento permanece ao trocar de responsável.

RF22

O sistema deve manter o histórico de turnos das duas partes e permitir sua exportação em CSV e PDF.

Média

O arquivo exportado contém data, função, horário registrado, valor acordado e contraparte de cada turno do período selecionado.

RF23

O sistema deve oferecer um canal de suporte por e-mail, aberto a partir do turno, com prazo de resposta declarado.

Média

O app abre o e-mail já com os dados do turno; o prazo de resposta de até 5 dias úteis é mostrado ao usuário; não há atendimento ao vivo; em risco imediato, o app orienta o contato com as autoridades (190 e 180).

RF24

O sistema deve permitir que um perfil suspenso consulte o motivo e abra contestação.

Alta

O motivo da suspensão é exibido ao titular; o botão “Contestar” envia a contestação à Equipe Frila, com resposta em até 5 dias úteis (RN13); se aceita, a conta volta na hora.

RF25

O sistema deve permitir que o usuário exporte seus dados pessoais e exclua a conta de dentro do aplicativo, nos dois apps.

Alta

O perfil sai do despacho e da busca na hora; os dados pessoais são apagados em até 15 dias; os turnos já realizados são anonimizados em vez de apagados, preservando o histórico da contraparte; atende à diretriz 5.1.1(v) da App Store.

RF26

O sistema deve permitir que qualquer usuário denuncie e bloqueie outro a partir do perfil ou do turno.

Alta

A denúncia registra o motivo (assédio, discriminação, risco à segurança ou outro) e chega à Equipe Frila, com resposta em até 5 dias úteis; o bloqueio é imediato e impede que as partes voltem a se cruzar em notificações, listas e candidaturas.

RF27

O sistema deve explicar ao profissional por que ele recebe notificações de vagas e permitir pedir revisão.

Média

A tela “Por que recebo vagas” mostra os critérios (função, disponibilidade e distância de até 15 km); o botão “Contestar” gera um pedido de revisão respondido em até 5 dias úteis (LGPD, art. 20).

3.2 Tempo e Custo Estimados por RF

Estimativas em dias de trabalho de uma equipe de cinco pessoas, considerando sprint de duas semanas. Custo de desenvolvimento é R$ 0 por ser trabalho interno da equipe; onde há custo, ele é de infraestrutura ou de serviço externo. Como não há código escrito, todas as estimativas são preliminares e devem ser revistas ao fim da primeira sprint. [H]

#

Tempo Estimado

Custo Estimado

RF01

4 dias / 0,5 sprint

R$ 0 (interno)

RF02

4 dias / 0,5 sprint

R$ 0 (interno)

RF03

5 dias / 0,5 sprint

R$ 0 (interno)

RF04

6 dias / 0,5 sprint

R$ 0 (interno)

RF05

2 dias

R$ 0 (interno)

RF06

15 dias / 1,5 sprint

R$ 0 (interno) + push e geolocalização em camada gratuita

RF07

5 dias / 0,5 sprint

R$ 0 (interno) + serviço de mapa

RF08

3 dias

R$ 0 (interno)

RF09

8 dias / 1 sprint

R$ 0 (interno)

RF10

5 dias / 0,5 sprint

R$ 0 (interno)

RF11

2 dias

R$ 0 (interno)

RF12

3 dias

R$ 0 (interno)

RF13

6 dias / 0,5 sprint

R$ 0 (interno)

RF14

8 dias / 1 sprint

R$ 0 (interno)

RF15

4 dias / 0,5 sprint

R$ 0 (interno)

RF16

5 dias / 0,5 sprint

R$ 0 (interno)

RF17

—

Retirado

RF18

6 dias / 0,5 sprint

R$ 0 (interno)

RF19

12 dias / 1,5 sprint

R$ 0 (interno)

RF20

10 dias / 1 sprint

R$ 0 (interno)

RF21

6 dias / 0,5 sprint

R$ 0 (interno)

RF22

6 dias / 0,5 sprint

R$ 0 (interno)

RF23

2 dias

R$ 0 (interno)

RF24

5 dias / 0,5 sprint

R$ 0 (interno)

RF25

6 dias / 0,5 sprint

R$ 0 (interno)

RF26

5 dias / 0,5 sprint

R$ 0 (interno)

RF27

2 dias

R$ 0 (interno)

3.3 Matriz Impacto × Esforço

Impacto ↓ Esforço →

Esforço Baixo

Esforço Médio

Esforço Alto

Impacto Alto

Quick wins, faça primeiro

RF04, RF08, RF10, RF11

Planeje bem, vale o esforço

RF01, RF02, RF03, RF13, RF15, RF16, RF20, RF24, RF25, RF26

Grande projeto, divida em partes

RF06, RF09, RF14

Impacto Médio

Secundário

RF05, RF07, RF12, RF23, RF27

Avalie

RF18, RF21, RF22

Evite por ora

RF19

Impacto Baixo

Se sobrar tempo

Nenhum

Baixa prioridade

Nenhum

Descarte ou adie

Nenhum

*RF06 (despacho ativo) é o maior esforço da lista e também o coração do produto: sem ele o Frila vira mais um mural passivo, que é exatamente o modo de falha identificado em todos os concorrentes. RF19 (escala de evento em lote) tem impacto alto na estratégia de entrada pelo segmento de eventos, mas foi classificado como médio nesta matriz porque o ciclo básico precisa funcionar antes, e é candidato natural à segunda fase de construção. RF25 e RF26 estão entre os de impacto alto porque a App Store rejeita o app sem eles (diretrizes 5.1.1(v) e 1.2). O RF17 foi retirado e não aparece na matriz.*

4. Requisitos Não Funcionais

4.1 Lista de Requisitos Não Funcionais

#

Requisito Não Funcional

Categoria

Critério de Aceitação

RNF01

As telas principais devem carregar em menos de 2 segundos em conexão 4G.

Desempenho

Medição em aparelho Android de entrada e em rede 4G real, com percentil 95 dentro do limite.

RNF02

As notificações de vaga devem ser entregues ao provedor de push (APNs/FCM) de forma verificável, com reenvio automático em caso de falha e estado consultável.

Confiabilidade

99% das notificações aceitas pelo provedor (APNs/FCM) em até 60 segundos após o despacho, medido em janela móvel de 7 dias; toda falha registra motivo. A entrega no aparelho depende do sistema operacional: o Frila não usa notificação Time Sensitive nem pede isenção de economia de bateria.

RNF03

A notificação de uma vaga deve ser enviada ao provedor de push em até 30 segundos após a publicação.

Desempenho

Medição do intervalo entre o registro da vaga e o envio ao provedor de push, no percentil 95.

RNF04

O aplicativo deve funcionar em Android 9 ou superior com 2 GB de memória, em iOS 17 ou superior (exigência do SwiftData), e nos navegadores modernos em versão desktop e móvel.

Compatibilidade

Execução dos fluxos principais sem degradação em aparelho de referência de entrada e nas duas últimas versões dos navegadores suportados.

RNF05

Uma sessão típica de consulta e candidatura deve consumir menos de 1 MB de dados.

Desempenho

Medição do tráfego da sessão típica; imagens servidas comprimidas e sob demanda.

RNF06

Turnos confirmados devem permanecer legíveis sem conexão por pelo menos 24 horas, e ações feitas offline devem ser enfileiradas e sincronizadas.

Tolerância a falhas

Em modo avião, endereço, horário, função, valor e contato do turno confirmado continuam visíveis; nenhuma ação enfileirada é perdida ao restabelecer a conexão.

RNF07

Todo tráfego deve usar HTTPS, dados sensíveis devem ser criptografados em repouso e credenciais devem ficar no keychain do sistema.

Segurança

Nenhuma comunicação em texto claro; varredura de segurança sem achado crítico ou alto antes da publicação.

RNF08

O tratamento de dados pessoais deve observar a LGPD, com minimização, finalidade declarada por tipo de dado e exclusão atendida em prazo definido.

Privacidade

Base legal e finalidade documentadas por campo coletado; exclusão de conta atendida em até 15 dias; canal do encarregado publicado; documento e dado pessoal ausentes de qualquer log.

RNF09

O produto deve ser utilizável sem treinamento por público não familiarizado com aplicativos profissionais.

Usabilidade

Em teste com usuários reais, um profissional de primeira viagem conclui uma candidatura e um contratante publica uma vaga, os dois sem ajuda. Metas de tempo e de número de toques só serão definidas depois de medidas no piloto.

RNF10

O produto deve ser utilizável por pessoas com deficiência visual e motora.

Acessibilidade

Compatível com VoiceOver e TalkBack em todos os fluxos principais; contraste conforme WCAG 2.1 nível AA; tipografia dinâmica até o maior tamanho sem quebra de layout.

RNF11

O sistema deve suportar o universo da praça-piloto sem reescrita de arquitetura.

Escalabilidade

Teste de carga simulando o DF, cerca de 30 mil estabelecimentos e a base de profissionais correspondente, mantendo RNF01 e RNF03.

RNF12

O sistema deve estar disponível no horário de pico do setor.

Disponibilidade

Disponibilidade mensal de 99,5%; nenhuma manutenção programada no horário de pico, de quinta a domingo, das 16h às 02h.

RNF13

Publicação, despacho, candidatura, confirmação, execução, cancelamento e avaliação devem deixar registro consultável e exportável.

Auditabilidade

Todo evento do ciclo do turno grava data, hora, autor e estado anterior; o histórico é exportável por período.

RNF14

O sistema deve tratar concorrência sem perder candidatura nem produzir confirmação dupla.

Robustez

Teste de candidaturas simultâneas à mesma posição resulta em exatamente uma confirmação e em retorno claro para os demais candidatos.

RNF15

A interface deve ser em português do Brasil, com moeda em reais e horários no fuso America/Sao_Paulo.

Localização

Nenhum texto não traduzido nas telas de uso; valores exibidos em reais; turnos que atravessam a meia-noite exibidos corretamente.

RNF16

O produto não deve exibir publicidade nem promover perfis mediante pagamento.

Integridade do produto

Ausência de qualquer espaço publicitário e de mecanismo de promoção paga na notificação ou na lista de vagas (RN06).

4.2 Tempo e Custo Estimados por RNF

#

Tempo Estimado

Custo Estimado

RNF01

Contínuo, 3 dias por sprint de ajuste

R$ 0 (interno)

RNF02

8 dias / 1 sprint

R$ 0 (interno). FCM sem custo no volume previsto (no iOS, via APNs)

RNF03

Incluído em RF06

R$ 0 (interno)

RNF04

5 dias de adequação e testes

R$ 0 (interno) + aparelhos de teste já disponíveis

RNF05

3 dias

R$ 0 (interno) + serviço de otimização de imagem

RNF06

8 dias / 1 sprint

R$ 0 (interno)

RNF07

6 dias / 0,5 sprint

R$ 0 (interno) + certificado TLS gerenciado

RNF08

8 dias / 1 sprint

R$ 0 (interno). Exige revisão jurídica externa

RNF09

Contínuo, 2 rodadas de teste de usabilidade

R$ 0 (interno)

RNF10

7 dias / 1 sprint

R$ 0 (interno)

RNF11

5 dias de teste de carga

Custo de infraestrutura durante o teste

RNF12

Contínuo, na operação

Plano gratuito do Supabase no piloto; o custo recorrente depois dele ainda está em aberto

RNF13

6 dias / 0,5 sprint

R$ 0 (interno) + armazenamento de histórico

RNF14

5 dias / 0,5 sprint

R$ 0 (interno)

RNF15

2 dias

R$ 0 (interno)

RNF16

Sem custo de implementação, é decisão de produto

R$ 0

5. Escopo Não Contemplado

Funcionalidade / Recurso

Justificativa da Exclusão

Previsão

Processamento, custódia e repasse de pagamento (carteira, split, escrow)

Exige operação financeira madura, conformidade regulatória e capital de giro. Pagamento retido ou atrasado é a queixa recorrente em Switch, Closeer e eFreela, e assumir a custódia sem estrutura repetiria o problema que o produto quer evitar.

v2.0, condicionado à validação

Cobrança dentro do aplicativo e qualquer modelo de monetização

O modelo de receita está deliberadamente em aberto até a validação de campo. Toda conta de receita depende de um preço que ainda não existe.

Indefinido

Contratação em regime CLT, processo seletivo e banco de currículos

Outro negócio, com outro ciclo, outro comprador e outro tempo de decisão. Currículo e processo seletivo não cabem num turno que começa em duas horas.

Nunca

Emissão de contrato, recibo ou nota fiscal

Depende da definição do modelo de intermediação e de revisão jurídica sobre vínculo. O registro do turno cobre a necessidade imediata de comprovação.

v2.0

Chat interno entre as partes

Na v1 o contato é liberado por WhatsApp ou e-mail após a confirmação, que é onde as pessoas já estão. Construir um canal paralelo adiciona superfície de produto sem resolver nada novo.

v2.0, se a validação indicar necessidade

Avaliação por nota de 1 a 5 e comentários abertos

Média com poucas avaliações não informa nada, e comentário aberto abre frente de moderação. A reputação binária com denominador é a aposta central do produto.

Nunca

Feed, seguidores, perfil público e qualquer camada social

O Frila não é rede social profissional. Não há conteúdo, não há audiência e não há motivo para alguém voltar ao app fora do ciclo do turno.

Nunca

Vagas remotas (design, programação, redação e similares)

Entram no escopo do produto, mas não no MVP. Sem presença no local não há check-in, notificação por distância nem presença verificada para liberar a avaliação: a vaga remota precisa de um fluxo próprio.

Depois do MVP

Aval de quem trabalhou com o profissional fora da plataforma

Retirado em 21/09/2026. Só avalia quem trabalhou junto pelo Frila: um atestado externo é fácil de forjar e não tem turno registrado por trás.

Nunca

Atendimento ao vivo e plantão da equipe Frila

O acompanhamento dos turnos é do gestor do contratante, pelo Painel. A equipe Frila só responde e-mail, em até 5 dias úteis.

Não previsto

Notificação Time Sensitive no iOS e pedido de isenção de economia de bateria no Android

Decisão de 21/09/2026. As metas de notificação passam a ser medidas no provedor de push (RNF02 e RNF03).

Indefinido

Operação fora do Distrito Federal

A estratégia é territorial e sequencial: dominar o DF antes de abrir qualquer outra praça. Densidade é difícil de construir e fácil de perder.

Depois da consolidação no DF

Verificação de antecedentes criminais

Custo por consulta relevante, impacto direto na barreira de entrada do profissional e implicações de discriminação que exigem análise jurídica.

Indefinido

Seguro de acidentes pessoais para o profissional

Praticado por pelo menos um concorrente e possivelmente relevante, mas depende de parceria e de um modelo de receita que ainda não existe.

Indefinido

Geolocalização em tempo real do profissional a caminho do turno

Custo de bateria e de privacidade alto demais para o benefício, e tensiona a regra que evita caracterizar subordinação (RN16). O check-in lê a localização só no toque (RN22).

Nunca na forma contínua

Integrações com PDV, sistema de ponto e folha de pagamento

O público-alvo primário são operações pequenas, cuja infraestrutura de software costuma ser o celular de quem está no salão.

Indefinido

6. Diagramas

6.1 Diagrama de Casos de Uso

Dezesseis casos de uso ativos cobrem os vinte e seis requisitos funcionais ativos: nenhum RF fica sem caso de uso na matriz da Seção 7.1. O UC12 e o RF17 foram retirados em 21/09/2026, junto com o aval herdado, e os números ficam reservados. Um único desenho com todos eles e quatro atores vira um emaranhado de linhas, então o diagrama é apresentado em três vistas, cada uma respondendo a uma pergunta. Um caso de uso pode aparecer em mais de uma vista.

O despacho (UC02) não tem ator primário. Ele é incluído pela publicação (UC01) e pela reabertura (UC08), e o agrupamento das notificações, os lembretes, os alertas de atraso e de vaga vazia, o fechamento automático do modo seleção e o pedido de avaliação são disparados pelo agendador do sistema. Desenhar o próprio sistema como ator colocaria o Frila do lado de fora do Frila.

*Figura 1 — Ciclo do turno: da publicação à avaliação (UC01 a UC08)*

*Figura 2 — Cadastro, perfil e confiança (UC09 a UC11 e UC13)*

*Figura 3 — Suporte e direitos de quem usa (UC14 a UC17)*

Atores

Ator

Quem é

Casos de Uso

Profissional

Quem executa turnos avulsos: garçom, bartender, cozinheiro, recepcionista, promotor e outras funções operacionais. Maior de 18 anos.

UC03, UC05, UC06, UC08, UC09, UC13, UC14, UC15, UC16, UC17

Contratante

Usuário de um estabelecimento que publica turnos: bar, restaurante, buffet, produtora, loja, residência ou outro negócio. Age com papel de administrador ou de operador do estabelecimento (RF21) e, como gestor, acompanha vagas e turnos pelo Painel.

UC01, UC04, UC05, UC06, UC07, UC08, UC10, UC11, UC13, UC14, UC15, UC16, UC17

Equipe Frila

Pessoa da equipe Frila que responde, por e-mail, suporte, denúncias, contestações e pedidos de revisão do despacho. Não acompanha turnos nem intervém neles.

UC09, UC14, UC15, UC17

Usuário

Generalização de Profissional e Contratante, usada onde os dois têm o mesmo direito.

UC14, UC15, UC16, UC17

Descrição dos Casos de Uso

UC01: Publicar vaga

Ator(es)

Contratante (administrador ou operador do estabelecimento)

Pré-condição

O contratante está autenticado e o estabelecimento tem cadastro completo (UC10).

Fluxo Principal

1. O contratante escolhe publicar uma vaga.

2. O sistema apresenta o formulário com os campos obrigatórios de RN02 (função, data, horário de início e fim, endereço, valor por posição, número de posições, o que está incluso e quem recebe no local), os opcionais (traje exigido, participação no rateio dos 10% e observações), o modo de preenchimento (urgência ou seleção) e a antecedência do alerta de vaga vazia, com padrão de 3 horas.

3. O contratante preenche os campos. O endereço é pré-preenchido com o do estabelecimento.

4. O sistema valida a obrigatoriedade dos campos conforme RN02.

5. O contratante confirma a publicação.

6. O sistema registra a vaga, cria uma posição por unidade solicitada e inclui UC02.

Fluxo Alternativo

2a. A vaga começa em menos de 24 horas: o modo seleção não é oferecido, e a vaga é publicada em modo urgência (RN24).

3a. O contratante opta por republicar uma vaga anterior: o sistema pré-preenche todos os campos e solicita apenas a nova data e o novo horário (RF05).

3b. O contratante monta a escala de um evento: informa várias funções, cada uma com seu número de posições, e o sistema publica tudo numa única operação, acompanhando o preenchimento por função (RF19).

4a. Algum campo obrigatório está ausente ou inválido: o sistema indica o campo e impede a publicação.

Pós-condição

Vaga publicada, posições criadas com estado aberto e despacho iniciado.

Regras Relacionadas

RN02, RN03, RN04, RN18, RN24

Critério de Aceito (BDD)

Dado que sou um contratante autenticado com estabelecimento cadastrado, quando preencho os campos obrigatórios e confirmo, então a vaga é publicada e a notificação aos profissionais elegíveis é disparada.

UC02: Despachar vaga aos profissionais elegíveis

Ator(es)

Nenhum ator primário. Incluído por UC01 e UC08; o agrupamento das notificações e o reenvio de falhas são feitos pelo agendador do sistema.

Pré-condição

Existe ao menos uma posição aberta na vaga.

Fluxo Principal

1. O sistema seleciona os profissionais elegíveis (RN05): função compatível, disponibilidade no horário, até 15 km entre o ponto base e o local, perfil ativo, nenhum bloqueio entre as partes e nenhum turno confirmado que se sobreponha ao da vaga.

2. O sistema inclui os profissionais da equipe de confiança do estabelecimento que tenham a função e estejam disponíveis, mesmo além de 15 km (UC11).

3. Para cada elegível, o sistema aplica o teto de RN23: se ele não recebeu notificação de vaga nos últimos 30 minutos, a notificação sai agora; se recebeu, a vaga entra na próxima notificação agrupada.

4. O sistema envia as notificações de uma vez, sem ordem entre os elegíveis, e registra o envio e o estado de entrega de cada uma.

5. A vaga fica visível na lista de todo o DF enquanto houver posição aberta.

Fluxo Alternativo

1a. Não há nenhum elegível: a vaga segue visível na lista do DF, e o contratante é avisado de que ninguém próximo e disponível foi encontrado.

3a. A vaga é do modo urgência e começa em menos de 2 horas: ela fura o agrupamento e sai na hora, mas conta no teto do profissional (RN23).

4a. O profissional ignora ou recusa a notificação: nada é registrado contra ele (RN16), e ele segue elegível para as próximas vagas.

4b. A entrega da notificação falha: o sistema reenvia e registra o motivo (RNF02).

5a. A posição entra na janela crítica ainda aberta: o contratante recebe o alerta de vaga vazia (RF20).

Pós-condição

Profissionais elegíveis notificados, com registro de envio e de entrega.

Regras Relacionadas

RN04, RN05, RN06, RN16, RN23

Critério de Aceito (BDD)

Dado que uma vaga foi publicada com posições abertas, quando o despacho é executado, então apenas profissionais elegíveis são notificados, em até 30 segundos e sem ordem entre eles, nenhum inelegível recebe a notificação e nenhum profissional recebe mais de uma notificação de vaga a cada 30 minutos.

UC03: Candidatar-se a uma posição

Ator(es)

Profissional

Pré-condição

O profissional está autenticado, tem perfil ativo e recebeu a notificação (UC02) ou encontrou a vaga na lista do DF (RF07).

Fluxo Principal

1. O profissional abre a notificação ou a vaga na lista.

2. O sistema exibe função, endereço, data, horário, valor, o que está incluso e o perfil do contratante com reputação e denominador.

3. O profissional se candidata, sem formulário. A tela avisa que, se ele for confirmado, telefone e WhatsApp serão mostrados ao estabelecimento (RN10).

4. O sistema registra a candidatura e a submete a UC04.

Fluxo Alternativo

3a. A posição já foi preenchida enquanto o profissional visualizava: o sistema informa o encerramento e oferece outras vagas próximas.

3b. O profissional já tem turno confirmado que se sobrepõe a este: o sistema impede a candidatura e mostra o turno em conflito. A regra é garantida no banco de dados, e não só na tela (RN21).

3c. O perfil está suspenso: o sistema mostra o motivo e o caminho para contestar (UC15).

3d. Há bloqueio entre o profissional e o estabelecimento: a vaga não aparece para ele, nem na notificação nem na lista (RF26).

Pós-condição

Candidatura registrada e submetida ao fluxo de confirmação.

Regras Relacionadas

RN03, RN05, RN08, RN10, RN21

Critério de Aceito (BDD)

Dado que recebi a notificação de uma vaga elegível, quando toco em candidatar-me, então a candidatura é registrada sem formulário e sem negociação de valor.

UC04: Confirmar profissional na posição

Ator(es)

Contratante no modo seleção. No modo urgência, a confirmação é automática.

Pré-condição

Existe ao menos uma candidatura válida para a posição.

Fluxo Principal

1. No modo urgência, o sistema confirma automaticamente o primeiro candidato elegível que aceita.

2. No modo seleção, o sistema apresenta os candidatos ao contratante com reputação, denominador e taxa de comparecimento, e o contratante escolhe.

3. O sistema marca a posição como preenchida e garante que nenhuma outra confirmação ocorra para ela.

4. O sistema notifica os dois lados com função, local, horário, valor e identificação da contraparte.

5. O sistema libera o contato direto entre as partes, visível até 7 dias depois do fim do turno (RN10).

Fluxo Alternativo

2a. No modo seleção, o contratante não escolhe até 24 horas antes do início: a vaga fecha automaticamente, e os candidatos são avisados e liberados (RN24).

2b. O profissional retira a candidatura antes de ser escolhido: a retirada não gera penalidade, e ele segue livre para outras vagas (RN24).

3a. Duas confirmações chegam simultaneamente: o sistema confirma exatamente uma, e a outra recebe a resposta de posição já ocupada.

Pós-condição

Posição preenchida, ambas as partes notificadas e contato liberado.

Regras Relacionadas

RN08, RN10, RN19, RN24

Critério de Aceito (BDD)

Dado que há candidaturas para uma posição, quando a confirmação ocorre, então os dois lados recebem a notificação com os dados completos do turno, o contato é liberado e a posição deixa de aparecer entre as vagas abertas.

UC05: Registrar a execução do turno

Ator(es)

Profissional e Contratante

Pré-condição

Existe uma posição confirmada cujo horário de início se aproxima.

Fluxo Principal

1. O sistema envia o lembrete pré-turno para os dois lados, 24 horas e 3 horas antes do início, com endereço, horário e contato da contraparte (RF12).

2. Ao chegar, o profissional faz o check-in. O app lê a localização só nesse toque e confere se ele está a até 200 m do endereço da vaga (RN22).

3. O sistema grava a hora e a distância medida e avisa o contratante.

4. Ao terminar, o profissional faz o check-out da mesma forma.

5. O sistema grava início, fim e valor acordado, e disponibiliza o registro aos dois.

Fluxo Alternativo

2a. A geolocalização falha (sem sinal, permissão negada, GPS impreciso ou a mais de 200 m): o profissional faz check-in manual, e o contratante confirma com um toque, no app ou no Painel web. Sem confirmação, o turno fica “não verificado” e não conta a favor nem contra na taxa de comparecimento.

2b. Chega o horário de início sem check-in: o profissional recebe um lembrete.

2c. Passam 15 minutos do início sem check-in: o contratante é alertado e decide esperar ou reabrir a vaga. Se reabrir, conta como falta do profissional, e a posição segue para UC08.

4a. O fim previsto passa sem check-out: os dois lados recebem uma notificação. O que acontece com o valor fica entre as partes; o sistema não calcula hora extra.

4b. O contratante discorda do registro: vale o registro geolocalizado. O Frila não arbitra, e o contratante pode registrar a discordância na avaliação (UC06).

Pós-condição

Turno registrado com horários, distância medida e valor, e avaliação liberada após o término previsto quando a presença foi verificada.

Regras Relacionadas

RN09, RN11, RN18, RN22

Critério de Aceito (BDD)

Dado que um turno confirmado começou, quando faço check-in a até 200 m do endereço, então o sistema grava a hora e a distância, avisa o contratante e disponibiliza o registro para consulta e exportação pelos dois (UC13).

UC06: Avaliar após o turno

Ator(es)

Profissional e Contratante

Pré-condição

O horário de término previsto do turno já passou, e a presença foi verificada: check-in geolocalizado ou manual confirmado pelo contratante (RN22).

Fluxo Principal

1. O sistema solicita a avaliação a cada lado.

2. Cada um responde a uma única pergunta: “Você chamaria essa pessoa de novo?” para o contratante, “Você trabalharia nesse local de novo?” para o profissional.

3. O sistema registra a resposta e atualiza a reputação da contraparte.

4. O sistema recalcula a taxa de comparecimento a partir dos registros de UC05.

Fluxo Alternativo

2a. Uma das partes não responde: a reputação da outra não é alterada, e o denominador exibido considera apenas as respostas efetivamente dadas.

3a. O turno foi cancelado antes de começar ou o profissional não compareceu: nenhuma avaliação é solicitada. A falta conta só na taxa de comparecimento, para não pesar duas vezes.

3b. O turno ficou “não verificado”: nenhuma avaliação é solicitada, e o turno não entra na taxa de comparecimento.

Pós-condição

Reputação e taxa de comparecimento atualizadas para os dois lados.

Regras Relacionadas

RN07, RN08, RN22

Critério de Aceito (BDD)

Dado que um turno com presença verificada terminou, quando ambas as partes respondem à pergunta binária, então a reputação de cada uma é atualizada e passa a ser exibida com o denominador, sem que nenhuma média de 1 a 5 seja apresentada.

UC07: Acompanhar vagas e turnos pelo Painel

Ator(es)

Contratante, como gestor do estabelecimento, na versão web. O alerta de vaga vazia e a confirmação de check-in manual também existem no app.

Pré-condição

O contratante está autenticado, e o estabelecimento tem vagas publicadas ou turnos confirmados.

Fluxo Principal

1. O gestor abre o Painel na versão web do app do estabelecimento.

2. O sistema mostra as vagas abertas, os candidatos, os profissionais confirmados, os check-ins do dia e os turnos não verificados.

3. As posições ainda vagas dentro da janela crítica aparecem destacadas, com o tempo que falta para o início.

4. O gestor confirma check-ins manuais pendentes, escolhe candidatos do modo seleção (UC04) ou cancela e reabre posições (UC08).

5. O sistema registra cada ação no turno.

Fluxo Alternativo

3a. Uma posição entra na janela crítica ainda vaga: o contratante recebe um alerta por notificação, 3 horas antes do início ou na antecedência escolhida na publicação (RF20).

4a. O gestor está no celular: o alerta de vaga vazia e a confirmação de check-in manual estão no app, sem precisar do Painel.

Pós-condição

Vagas e turnos acompanhados pelo próprio estabelecimento, sem participação da equipe Frila.

Regras Relacionadas

RN12, RN22, RN24

Critério de Aceito (BDD)

Dado que uma posição continua vaga a 3 horas do início, quando o prazo é atingido, então o contratante recebe o alerta no app, e a posição aparece destacada no Painel web com o tempo que falta para o início.

UC08: Cancelar e reabrir posição

Ator(es)

Profissional ou Contratante

Pré-condição

Existe uma posição confirmada ainda não executada, ou um não comparecimento em que o contratante decidiu reabrir a vaga (UC05).

Fluxo Principal

1. A parte solicita o cancelamento e informa o motivo.

2. O sistema registra autor, momento, antecedência e motivo.

3. O sistema notifica a contraparte.

4. O sistema devolve a posição ao estado aberto e inclui UC02 imediatamente.

5. O sistema contabiliza o evento no histórico da parte que cancelou: cancelamento do profissional com mais de 24 horas não entra na taxa de comparecimento; com menos de 24 horas, ou não comparecimento, conta como falta.

Fluxo Alternativo

4a. O horário de início já passou: a posição não é reaberta, e o contratante é avisado de que o turno ficou descoberto.

5a. Uma parte cancela com frequência: o sistema não suspende nem bloqueia; o efeito é só na taxa de comparecimento, exibida no perfil (RN13).

Pós-condição

Cancelamento registrado, posição reaberta quando cabível e histórico atualizado.

Regras Relacionadas

RN12, RN13, RN16

Critério de Aceito (BDD)

Dado que uma posição confirmada é cancelada antes do início do turno, quando o motivo é informado, então a contraparte é notificada, a posição volta a ficar aberta e uma nova notificação é disparada em até 30 segundos.

UC09: Cadastrar-se e manter o perfil profissional

Ator(es)

Profissional

Pré-condição

Não existe conta ativa com o mesmo telefone ou e-mail.

Fluxo Principal

1. O profissional informa nome, telefone e e-mail e confirma ter 18 anos ou mais.

2. O sistema confirma o telefone por código.

3. O profissional declara suas funções, o ponto base e a disponibilidade por dia e faixa de horário. Não há distância para configurar: a notificação vai para quem está a até 15 km do local (RN05).

4. O sistema ativa o perfil, que passa a receber notificações de vaga.

5. A qualquer momento, o profissional altera funções, ponto base ou disponibilidade, ou marca que está disponível agora, e a mudança vale na notificação seguinte, sem novo login.

Fluxo Alternativo

1a. A pessoa declara ter menos de 18 anos: o cadastro é recusado, e nada além do necessário para registrar a recusa é guardado (RN20).

3a. O profissional sai antes de declarar funções e ponto base: o cadastro fica salvo, mas o perfil não recebe notificação até completá-los.

5a. O sistema pede verificação de identidade: ela é progressiva e acontece depois da primeira notificação, nunca como barreira de entrada. O documento não aparece em log (RN14, RN15).

5b. O profissional abre “Por que recebo vagas”: o sistema explica os critérios (função, disponibilidade e distância de até 15 km) e oferece o botão “Contestar”, que envia um pedido de revisão à Equipe Frila, respondido em até 5 dias úteis (RF27).

Pós-condição

Perfil ativo e apto a receber notificações de vaga, sem nenhuma cobrança no cadastro.

Regras Relacionadas

RN01, RN05, RN14, RN15, RN20

Critério de Aceito (BDD)

Dado que tenho 18 anos ou mais, quando informo nome, telefone, e-mail, funções, ponto base e disponibilidade, então fico apto a receber notificações de vaga sem enviar documento e sem pagar nada.

UC10: Cadastrar o estabelecimento e gerenciar seus usuários

Ator(es)

Contratante com papel de administrador do estabelecimento

Pré-condição

O responsável tem 18 anos ou mais e uma conta de acesso.

Fluxo Principal

1. O contratante informa nome ou razão social, documento (CNPJ ou CPF), endereço e responsável.

2. O sistema valida o documento e localiza o endereço no mapa.

3. O sistema cria o estabelecimento, com o responsável como administrador.

4. O administrador convida outros usuários por telefone ou e-mail e atribui a cada um o papel de administrador ou de operador do estabelecimento.

5. O convidado aceita com a própria conta, sem compartilhar senha.

Fluxo Alternativo

2a. O endereço não é localizado com precisão: o sistema pede que o contratante confirme o ponto no mapa.

4a. O administrador remove um usuário: o acesso é revogado na hora, e o histórico do estabelecimento permanece.

4b. O responsável muda: a administração é transferida, e vagas, turnos e reputação continuam com o estabelecimento.

Pós-condição

Estabelecimento apto a publicar vagas (UC01), com usuários e papéis registrados.

Regras Relacionadas

RN15, RN20

Critério de Aceito (BDD)

Dado que cadastrei o estabelecimento, quando convido um gerente como operador, então ele passa a publicar e acompanhar vagas com a própria conta, sem compartilhamento de senha, e o histórico permanece com o estabelecimento se eu sair.

UC11: Manter a equipe de confiança

Ator(es)

Contratante

Pré-condição

O profissional tem perfil ativo no Frila.

Fluxo Principal

1. O contratante abre o perfil de um profissional, a partir do histórico de turnos (UC13) ou de uma candidatura.

2. O contratante adiciona o profissional à equipe de confiança do estabelecimento.

3. O sistema registra a inclusão, e o profissional passa a receber a notificação das próximas vagas do estabelecimento para as quais tiver a função e estiver disponível, mesmo além de 15 km (UC02).

4. O contratante pode remover o profissional da equipe a qualquer momento.

Fluxo Alternativo

3a. O profissional da equipe não tem a função ou não está disponível: ele não é notificado. A equipe dispensa só o limite de distância, nunca os outros critérios de elegibilidade (RN05).

3b. O profissional recusa vagas da equipe: não há penalidade nem remoção automática (RN16).

3c. A equipe não tem prioridade de tempo: a notificação sai para ela e para os demais elegíveis ao mesmo tempo.

Pós-condição

Equipe atualizada, valendo a partir da próxima vaga.

Regras Relacionadas

RN05, RN16, RN23

Critério de Aceito (BDD)

Dado que um profissional está na equipe de confiança do meu estabelecimento, tem a função e está disponível, quando publico uma vaga a mais de 15 km dele, então ele recebe a notificação ao mesmo tempo que os demais elegíveis.

UC12: Retirado

Situação

Retirado em 21/09/2026, junto com o RF17. O aval de quem trabalhou com o profissional fora da plataforma saiu do produto: só avalia quem trabalhou junto pelo Frila (RN07). O número fica reservado e não é reutilizado.

UC13: Consultar e exportar o histórico de turnos

Ator(es)

Profissional e Contratante

Pré-condição

Existe ao menos um turno registrado em UC05.

Fluxo Principal

1. O usuário escolhe o período.

2. O sistema lista os turnos com data, função, horários registrados, valor acordado e contraparte.

3. O usuário pede a exportação em CSV ou PDF.

4. O sistema gera o arquivo e o disponibiliza para download ou envio por e-mail.

Fluxo Alternativo

1a. O período não tem turnos: o sistema informa e não gera arquivo vazio.

2a. Um turno ficou “não verificado”: ele aparece marcado assim, sem entrar na taxa de comparecimento.

Pós-condição

Arquivo gerado com os turnos do período. O valor é o acordado e registrado, nunca um pagamento processado pelo Frila.

Regras Relacionadas

RN09, RN11, RN17, RN18

Critério de Aceito (BDD)

Dado que tenho turnos registrados no mês, quando exporto o período, então o arquivo traz data, função, horários auditados, valor acordado e contraparte de cada turno, pronto para o fechamento contábil.

UC14: Acionar suporte durante o turno

Ator(es)

Usuário (Profissional ou Contratante), atendido pela Equipe Frila por e-mail

Pré-condição

Existe um turno confirmado em andamento ou prestes a começar.

Fluxo Principal

1. O usuário aciona o suporte a partir da tela do turno.

2. O app abre o e-mail do suporte já com os dados do turno, e o usuário escolhe o motivo (endereço, atraso, conduta, segurança ou outro) e descreve o caso.

3. O app mostra o prazo de resposta declarado: até 5 dias úteis.

4. A Equipe Frila responde por e-mail.

Fluxo Alternativo

2a. O motivo é de segurança: além do e-mail, o app mostra atalhos para ligar para o 190 (Polícia) e o 180 (Central de Atendimento à Mulher).

2b. O caso é assédio, discriminação ou risco: o app oferece também denunciar e bloquear a outra parte (UC17).

4a. Não há atendimento ao vivo: questões práticas do turno em andamento são combinadas direto com a outra parte, pelo contato liberado (RN10).

Pós-condição

E-mail enviado com os dados do turno e respondido no prazo declarado.

Regras Relacionadas

RN10, RN11, RN15

Critério de Aceito (BDD)

Dado que estou num turno confirmado, quando aciono o suporte, então o e-mail abre já com os dados do turno, e eu vejo o prazo de resposta de até 5 dias úteis.

UC15: Consultar e contestar suspensão

Ator(es)

Usuário suspenso (Profissional ou Contratante), atendido pela Equipe Frila por e-mail

Pré-condição

O perfil foi suspenso por denúncia grave confirmada, com motivo registrado (UC17).

Fluxo Principal

1. Ao entrar, o usuário vê o motivo e a data da suspensão.

2. O usuário toca em “Contestar” e escreve o motivo, com evidência se quiser.

3. O sistema envia a contestação à Equipe Frila e informa o prazo de resposta: até 5 dias úteis.

4. A Equipe Frila apura e decide, registrando o fundamento.

5. O sistema comunica a decisão. Se a contestação for aceita, a conta volta na hora.

Fluxo Alternativo

4a. O prazo vence sem decisão: o usuário é avisado do atraso.

5a. A suspensão é mantida: o usuário recebe o fundamento por escrito.

Pós-condição

Contestação decidida, com fundamento registrado.

Regras Relacionadas

RN13, RN15, RN16

Critério de Aceito (BDD)

Dado que meu perfil foi suspenso, quando abro o aplicativo, então vejo o motivo registrado e consigo contestar, com resposta em até 5 dias úteis.

UC16: Exportar dados pessoais e excluir a conta

Ator(es)

Usuário (Profissional ou Contratante)

Pré-condição

O usuário está autenticado.

Fluxo Principal

1. O usuário abre as configurações de privacidade da conta.

2. O usuário pede a exportação, e o sistema gera um arquivo com seus dados pessoais.

3. O usuário pede a exclusão da conta dentro do aplicativo e confirma.

4. O sistema registra a solicitação, encerra as sessões e tira o perfil do despacho e da busca na hora.

5. Em até 15 dias, os dados pessoais são apagados, e os turnos já realizados são anonimizados, preservando o histórico da contraparte.

Fluxo Alternativo

3a. O usuário tem turnos confirmados no futuro: o sistema avisa que a exclusão os cancela e, confirmada a exclusão, aplica UC08 com o motivo “exclusão de conta”.

3b. O usuário é o único administrador de um estabelecimento com outros usuários: o sistema pede que ele transfira a administração antes (UC10).

Pós-condição

Conta excluída; histórico da contraparte preservado de forma anônima.

Regras Relacionadas

RN15

Critério de Aceito (BDD)

Dado que quero sair do Frila, quando peço a exclusão dentro do aplicativo, então a conta deixa de aparecer na hora e é excluída em até 15 dias, sem precisar de e-mail ou site externo, como exige a diretriz 5.1.1(v) da App Store.

UC17: Denunciar e bloquear

Ator(es)

Usuário (Profissional ou Contratante); a denúncia é respondida pela Equipe Frila por e-mail

Pré-condição

O usuário está autenticado e vê o perfil ou o turno da outra parte.

Fluxo Principal

1. O usuário toca em “Denunciar” no perfil ou no turno da outra parte.

2. O usuário escolhe o motivo (assédio, discriminação, risco à segurança ou outro) e descreve o caso.

3. O sistema registra a denúncia, envia à Equipe Frila e mostra o prazo de resposta: até 5 dias úteis.

4. O sistema oferece bloquear a outra parte.

5. A Equipe Frila apura e responde por e-mail.

Fluxo Alternativo

1a. O usuário só quer bloquear: toca em “Bloquear”, e o bloqueio vale na hora, sem denúncia.

4a. Com o bloqueio, as partes não voltam a se cruzar: o profissional não recebe notificação nem vê vagas do estabelecimento, e o estabelecimento não recebe candidatura dele.

5a. A denúncia grave é confirmada (assédio, fraude ou documento falso): o perfil denunciado é suspenso, com motivo registrado e direito de contestar (UC15).

5b. Há risco imediato: o app mostra atalhos para o 190 e o 180, sem esperar a resposta da Equipe Frila.

Pós-condição

Denúncia registrada e respondida no prazo, e bloqueio em vigor quando pedido.

Regras Relacionadas

RN13, RN15

Critério de Aceito (BDD)

Dado que sofri assédio num turno, quando denuncio e bloqueio a outra parte, então a denúncia chega à Equipe Frila com prazo de resposta de até 5 dias úteis, e a outra parte deixa de aparecer para mim, e eu para ela, na hora. É o mecanismo que a diretriz 1.2 da App Store exige.

6.2 Diagrama de Banco de Dados (DER)

O eixo do modelo é uma cadeia só — vaga → posição → turno → avaliação —, o ciclo de vida de uma unidade de trabalho da publicação à reputação. Despacho, notificação e candidatura penduram-se nela como o registro de quem foi chamado e quem respondeu. As vistas abaixo são do mesmo esquema: separá-las evita o emaranhado de linhas que um único desenho com dezoito entidades produz.

*Figura 4 — O ciclo de uma vaga: da publicação à avaliação*

*Figura 5 — Uma conta de acesso, dois papéis*

*Figura 6 — O que decide quem recebe o despacho*

*Figura 7 — Os estados de uma posição e as transições válidas*

Descrição das Entidades Principais

Entidade

Descrição

Atributos Principais

Relacionamentos

Usuario

Conta de acesso, comum a todos os perfis. A credencial fica no Supabase Auth, e o id é o mesmo da conta de autenticação.

id, nome, telefone, email, nascimento, estado, criado_em, anonimizado_em

1:1 com Profissional; N:N com Estabelecimento via MembroEstabelecimento

Profissional

Perfil de quem executa turnos.

id, usuario_id, ponto_base, disponivel_agora_ate, taxa_comparecimento, turnos_realizados, estado

1:1 com Usuario; N:N com Funcao; 1:N com Disponibilidade, Candidatura e Avaliacao

Estabelecimento

Contratante de qualquer setor: bar, restaurante, buffet, produtora, loja, residência ou outro negócio.

id, nome, documento, tipo, endereco, geo_lat, geo_lng, criado_em

1:N com Vaga e EquipeConfianca; N:N com Usuario via MembroEstabelecimento

MembroEstabelecimento

Vínculo entre um usuário e um estabelecimento, com papel.

id, usuario_id, estabelecimento_id, papel, criado_em

N:1 com Usuario; N:1 com Estabelecimento

Funcao

Catálogo de funções operacionais (garçom, bartender, chapeiro, montador, repositor…).

id, nome, categoria, ativo

N:N com Profissional; 1:N com Vaga

Vaga

Turno publicado por um estabelecimento.

id, estabelecimento_id, funcao_id, inicio_em, fim_em, endereco, geo_lat, geo_lng, valor_centavos, posicoes, inclui_refeicao, inclui_transporte, exige_material_proprio, responsavel_local, traje, participa_rateio, observacoes, modo, alerta_antecedencia, estado, publicado_em, chave_cliente

N:1 com Estabelecimento e Funcao; 1:N com Posicao e Despacho

Posicao

Unidade preenchível de uma vaga. Uma vaga de 4 garçons tem 4 posições.

id, vaga_id, estado, profissional_id, confirmado_em, falta, inicio_em, fim_em

N:1 com Vaga; 1:N com Candidatura; 1:1 com Turno

Disponibilidade

Janelas em que o profissional aceita trabalhar.

id, profissional_id, dia_semana, hora_inicio, hora_fim

N:1 com Profissional

Despacho

Registro de cada vaga enviada a um profissional elegível.

id, vaga_id, profissional_id, notificacao_id, criado_em

N:1 com Vaga, Profissional e Notificacao

Notificacao

Cada notificação enviada a um profissional, com uma ou mais vagas agrupadas. É o que sustenta o teto de RN23.

id, profissional_id, enviada_em, urgente, estado_entrega, entregue_em, motivo_falha

N:1 com Profissional; 1:N com Despacho

Candidatura

Manifestação de interesse de um profissional por uma posição.

id, posicao_id, profissional_id, criada_em, estado

N:1 com Posicao; N:1 com Profissional

Turno

Execução efetiva de uma posição confirmada.

id, posicao_id, checkin_em, checkin_tipo, checkin_distancia_m, checkin_confirmado_em, checkout_em, checkout_distancia_m, verificacao, valor_acordado_centavos

1:1 com Posicao; 1:N com Avaliacao

Avaliacao

Resposta binária de um lado sobre o outro, após turno com presença verificada.

id, turno_id, autor_tipo, autor_id, alvo_tipo, alvo_id, resposta, criada_em

N:1 com Turno

EquipeConfianca

Profissionais que recebem as vagas do estabelecimento mesmo além de 15 km.

id, estabelecimento_id, profissional_id, adicionado_em

N:1 com Estabelecimento; N:1 com Profissional

Evento

Agrupamento de vagas de um mesmo evento, para escala em lote.

id, estabelecimento_id, nome, data, local

N:1 com Estabelecimento; 1:N com Vaga

Ocorrencia

Registro de cancelamento, suspensão, contestação, suporte, denúncia ou pedido de revisão do despacho.

id, tipo, turno_id, posicao_id, autor_id, motivo, criada_em, resultado, chave_cliente

N:1 com Posicao; N:1 com Turno

Bloqueio

Bloqueio entre duas partes: impede que voltem a se cruzar.

id, autor_id, bloqueado_id, criado_em

N:1 com Usuario (autor e bloqueado)

Dispositivo

Token de push (FCM) de cada aparelho do usuário. Sem ele, a notificação não tem destino.

id, usuario_id, token_fcm, plataforma, atualizado_em

N:1 com Usuario

6.3 Diagrama de Classes

A regra de dependência vale em toda seta: o domínio é alvo de todas e origem de nenhuma. Quando precisa falar com o mundo, declara um protocolo e espera que alguém o implemente — é o que permite testar despacho, elegibilidade e reputação sem rede, sem interface e sem simulador. As regras que precisam valer igual nos três clientes são garantidas no backend (Seção 6.4); o domínio do app as espelha para a tela e para os testes.

*Figura 8 — A regra de dependência entre as camadas*

*Figura 9 — Camada de domínio: entidades e serviços*

*Figura 10 — Portas e implementações: produção e teste*

*Figura 11 — Camada de apresentação*

Descrição das Classes Principais

Classe

Responsabilidade

Atributos Principais

Métodos Principais

Vaga

Representar o turno publicado e seu estado.

id: UUID, funcao: Funcao, inicio: Date, fim: Date, local: Local, valorCentavos: Int, inclusos: Inclusos, responsavelLocal: String, modo: ModoPreenchimento, alertaAntecedencia: TimeInterval, posicoes: [Posicao]

posicoesAbertas(): [Posicao], estaNaJanelaCritica(): Bool, aceitaModoSelecao(): Bool, encerrar(): Void

Posicao

Controlar o preenchimento de uma unidade da vaga.

id: UUID, estado: EstadoPosicao, profissional: Profissional?, candidaturas: [Candidatura]

confirmar(_: Profissional) throws, reabrir(motivo: String): Void

Profissional

Guardar perfil, elegibilidade e reputação de quem executa.

id: UUID, funcoes: [Funcao], pontoBase: Coordenada, disponibilidades: [Disponibilidade], disponivelAgoraAte: Date?, taxaComparecimento: Double?

estaElegivel(para: Vaga): Bool, atualizarComparecimento(_: Turno): Void

Estabelecimento

Representar o contratante e sua equipe.

id: UUID, nome: String, endereco: Local, membros: [Membro], equipeConfianca: [Profissional]

publicar(_: Vaga) throws, incluirNaEquipe(_: Profissional): Void

Turno

Registrar o check-in, o check-out e a presença.

id: UUID, posicao: Posicao, checkin: RegistroDePresenca?, checkout: RegistroDePresenca?, verificacao: Verificacao, valorAcordadoCentavos: Int

registrarCheckin(distanciaMetros: Double?, em: Date): Void, confirmarCheckinManual(por: Ator): Void, registrarCheckout(distanciaMetros: Double?, em: Date): Void, temPresencaVerificada(): Bool

Avaliacao

Guardar a resposta binária de um lado sobre o outro.

id: UUID, turno: Turno, autor: Ator, alvo: Ator, resposta: Bool

aplicar(): Void

Reputacao

Calcular e formatar o sinal de confiança exibido.

positivas: Int, total: Int, taxaComparecimento: Double?, turnosConsiderados: Int

descricao(): String, temHistorico(): Bool

DespachoService

Selecionar os elegíveis e notificar de uma vez, respeitando teto e agrupamento (RN23).

vaga: Vaga, distanciaMaximaKm: Double (15), tetoIntervalo: TimeInterval (30 min)

elegiveis(): [Profissional], notificar() async

NotificacaoService

Agrupar, enviar, acompanhar a entrega e reenviar notificações.

provedor: ProvedorPush, pendentes: [Notificacao]

agrupar(_: [Vaga], para: Profissional): Notificacao, enviar(_: Notificacao) async throws, confirmarEntrega(_: UUID): Void, reenviarFalhas() async

ElegibilidadeSpec

Isolar as regras de quem pode receber uma vaga.

distanciaMaximaKm: Double, exigeFuncao: Bool, exigeDisponibilidade: Bool

satisfaz(_: Profissional, _: Vaga): Bool

VagaRepository

Persistir e consultar vagas, posições e candidaturas.

fonte: FonteDeDados

salvar(_: Vaga) async throws, abertas(ordenadasPorDistanciaDe: Coordenada, filtro: FiltroVagas) async -> [Vaga], confirmar(posicao: UUID, profissional: UUID) async throws

PublicarVagaViewModel

Orquestrar a tela de publicação e validar RN02.

rascunho: RascunhoVaga, erros: [CampoInvalido], estado: EstadoTela

validar(): Bool, publicar() async, carregarDeVagaAnterior(_: UUID): Void

FeedVagasViewModel

Orquestrar a lista de vagas do DF e a candidatura do profissional.

vagas: [Vaga], filtro: FiltroVagas, estado: EstadoTela

carregar() async, candidatar(a: Posicao) async

AcompanhamentoViewModel

Orquestrar, no app do estabelecimento, as vagas em alerta e a confirmação de check-in manual. O Painel do gestor é web.

emAlerta: [Posicao], checkinsPendentes: [Turno]

carregar() async, confirmarCheckin(_: Turno) async

SessaoUsuario

Guardar identidade, perfil ativo e permissões.

usuario: Usuario, perfilAtivo: Perfil, token: Token

trocarPerfil(_: Perfil): Void, encerrar(): Void

6.4 Arquitetura

A arquitetura foi decidida em 21/09/2026. Os aplicativos são nativos: Swift e SwiftUI no iOS, Kotlin no Android, e há uma versão web. O backend é o Supabase (Postgres com PostGIS, autenticação, Edge Functions, pg_cron e fila pgmq), escolhido pelo plano gratuito de até 50 mil usuários ativos por mês; a migração será reavaliada a partir de certa rentabilidade.

As regras que precisam valer igual nos três clientes ficam no backend e são escritas uma vez, como funções e restrições no banco: quem recebe a notificação (RN05 e RN23), a confirmação sem duplicidade (RN19), o turno sobreposto (RN21), o check-in a até 200 m (RN22) e o fechamento do modo seleção (RN24). O despacho roda fora da requisição: publicar só grava e responde, e um job separado faz as notificações, os lembretes e os alertas. Cada app mantém o próprio domínio para a tela e para os testes.

O contrato entre os apps e o backend foi escrito antes do código (decisão B16) e está em Documentos/API/openapi.yaml (OpenAPI 3.1, versão 0.1.0, de 22/09/2026). Cada operação com regra de negócio é uma função RPC do Supabase; as recusas de regra voltam com código estável, como posicao_ja_preenchida (409) e inelegivel (422), e reenviar a mesma escrita devolve o mesmo resultado.

Dentro do aplicativo iOS, as camadas são quatro:

• Apresentação: telas em SwiftUI e view models por funcionalidade, sem regra de negócio.

• Domínio: entidades, especificação de elegibilidade e regras de reputação, espelhando o que o backend garante. É a camada que precisa ser testável sem rede e sem interface.

• Dados: repositórios, cliente do Supabase, cache local em SwiftData e fila de ações offline.

• Infraestrutura: notificação push (FCM, que entrega no iOS via APNs), geolocalização lida no toque, mapa, keychain e telemetria.

Dependências e Pacotes

Pacote / Lib

Finalidade

SwiftUI

Produção de telas nos aplicativos iOS

Swift Concurrency (async/await, actors)

Operações assíncronas e isolamento de estado na sincronização e na fila offline

CoreLocation

Leitura da localização no momento do check-in e do check-out, nunca em segundo plano

MapKit

Exibição do local do turno e da distância até ele

UserNotifications

Recebimento e apresentação das notificações de vaga

Supabase Swift

Autenticação, acesso às tabelas e chamada das funções RPC do backend

Keychain Services

Armazenamento de credenciais e token de sessão

Firebase Cloud Messaging (FCM)

Push de vaga no Android e no iOS (no iOS, via APNs)

SwiftData

Cache local dos turnos confirmados e fila de ações offline (exige iOS 17)

Swift Testing

Testes de unidade das regras de domínio

XCTest (XCUITest)

Testes de interface dos fluxos principais

Supabase (backend)

Postgres com PostGIS, autenticação, Edge Functions, pg_cron e pgmq: persistência, regras críticas, despacho e envio de push

Diagrama de arquitetura

*Figura 12 — Contexto: atores e dependências externas*

*Figura 13 — Contêineres: três clientes, o Supabase e o despacho em fila*

*Figura 14 — A estratégia decidida para iOS, Android e web: nativo em cada plataforma, regras críticas no backend*

*Figura 15 — As quatro camadas dentro do aplicativo*

*Figura 16 — Da publicação à confirmação, com os prazos de cada etapa*

Módulo 1 (obrigatório)

Nome do Módulo

Frila-iOS, aplicativo do Profissional e do Estabelecimento

Padrão Arquitetural

MVVM com camada de domínio isolada (Clean Architecture enxuta)

Justificativa

MVVM é o padrão idiomático de SwiftUI e mantém as telas livres de regra de negócio. A camada de domínio separada é o ponto que importa neste produto: elegibilidade, presença e reputação sustentam a tese inteira e precisam ser testáveis sem interface, sem rede e sem simulador, inclusive porque vão mudar conforme a validação de campo corrigir as hipóteses. As regras que precisam valer igual no Android e na web moram no backend; o domínio do app as espelha para a tela e para os testes.

Linguagem / Framework

Swift e SwiftUI

Frila-iOS/

├── Sources/

│ ├── Features/ # Publicação, Feed, Turno, Reputação, Perfil

│ ├── Domain/ # Entidades, ElegibilidadeSpec, DespachoService, Reputacao

│ ├── Data/ # Repositórios, cliente Supabase, cache SwiftData e fila offline

│ ├── Infra/ # Push (FCM), localização no toque, keychain, telemetria

│ └── UI/ # Componentes, tokens de estilo e acessibilidade

├── Tests/ # Swift Testing (domínio) e XCUITest (interface)

└── Resources/ # Assets, strings pt-BR e configurações

7. Documentação de Apoio

7.1 Matriz de Rastreabilidade Completa

RF

Descrição Resumida

RN(s) Relacionadas

RNF(s) Relacionados

UC(s) Relacionadas

RF01

Cadastro e autenticação do profissional

RN14, RN15, RN20

RNF07, RNF08, RNF09

UC09

RF02

Cadastro do estabelecimento

RN15, RN20

RNF07, RNF08

UC10

RF03

Funções, ponto base e disponibilidade do profissional

RN05

RNF09

UC09, UC02

RF04

Publicação de vaga

RN02, RN03, RN18, RN24

RNF01, RNF09

UC01

RF05

Republicação de vaga anterior

RN02

RNF01

UC01

RF06

Notificação da vaga aos elegíveis

RN04, RN05, RN06, RN23

RNF02, RNF03, RNF11

UC02

RF07

Lista de vagas do DF

RN05, RN06

RNF01, RNF05

UC03

RF08

Candidatura sem formulário

RN03, RN21

RNF09

UC03

RF09

Modo urgência e modo seleção

RN19, RN24

RNF14

UC01, UC04

RF10

Confirmação e notificação das partes

RN10, RN19, RN21

RNF02, RNF14

UC04

RF11

Liberação do canal de contato

RN10

RNF07, RNF08

UC04

RF12

Lembrete pré-turno (24 h e 3 h)

Nenhuma

RNF02

UC05

RF13

Check-in e check-out geolocalizados

RN11, RN18, RN22

RNF06, RNF13

UC05, UC07

RF14

Cancelamento com reabertura

RN12, RN16

RNF03, RNF13

UC08

RF15

Avaliação binária bidirecional

RN07, RN22

RNF13

UC06

RF16

Exibição de reputação e comparecimento

RN07, RN08

RNF09, RNF10

UC03, UC04, UC06

RF17

Retirado (aval externo)

—

—

— (UC12 retirado)

RF18

Equipe de confiança

RN05, RN23

RNF03

UC11, UC02

RF19

Escala de evento em lote

RN02, RN18

RNF01, RNF11

UC01

RF20

Alerta de vaga vazia e Painel do gestor

RN12, RN22, RN24

RNF12, RNF13

UC07

RF21

Múltiplos usuários por estabelecimento

RN15

RNF07

UC10

RF22

Histórico e exportação de turnos

RN11, RN17

RNF13

UC13

RF23

Suporte por e-mail

RN10, RN15

RNF12

UC14

RF24

Consulta e contestação de suspensão

RN13, RN16

RNF13

UC15

RF25

Exportação e exclusão de dados pessoais

RN15

RNF08, RNF13

UC16

RF26

Denúncia e bloqueio

RN13, RN15

RNF08, RNF13

UC17

RF27

Explicação do despacho e pedido de revisão

RN05, RN06

RNF09

UC09

*RN01 (sem desconto no valor do turno), RN09 (não processar pagamento) e RN20 (maioridade) não aparecem vinculadas a um único requisito porque são restrições de produto que valem sobre o sistema inteiro: a primeira e a segunda determinam o que não existe, e a terceira condiciona todo o cadastro. Elas são verificadas por ausência, já que nenhum fluxo pode introduzi-las, e não por um requisito específico que as implemente. O RF17 e o UC12 foram retirados em 21/09/2026 e seguem na tabela só para preservar a numeração.*
