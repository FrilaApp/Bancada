---
tipo: documento-derivado
origem: "doc-harness/01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos.docx"
hash_origem: a77fd332f97e99f57513038e8bf5f01823805d3b0389f293934a0ab575474d52
exportado_em: 2026-09-18T14:08
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

v1.1.0

Data

18/09/2026

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

Registro publicado pelo contratante descrevendo um turno a ser coberto: função, data, janela, local, valor e número de posições.

Seções 2, 3 e 6

Posição

Cada unidade preenchível de uma vaga. Uma vaga de 4 garçons tem 4 posições.

Seções 3 e 6

Despacho ativo

Envio dirigido da vaga aos profissionais elegíveis por função, raio, disponibilidade e histórico, ordenado por taxa de comparecimento.

Seções 2, 3 e 6

Elegibilidade

Conjunto de critérios que define quem recebe o despacho de uma vaga específica.

Seções 2, 3 e 6

Taxa de comparecimento

Proporção entre turnos aceitos e turnos efetivamente cumpridos pelo profissional.

Seções 2, 3 e 6

Reputação binária

Resposta única (“chamaria de novo?” ou “trabalharia de novo?”), exibida com o denominador e nunca como média de 1 a 5.

Seções 2, 3 e 6

Aval herdado

Atestado registrado por alguém que já trabalhou com o profissional fora da plataforma.

Seções 3 e 6

Modo urgência / modo seleção

Dois comportamentos de preenchimento: no primeiro, o primeiro candidato aprovado leva a posição; no segundo, o contratante escolhe entre os candidatos.

Seções 2, 3 e 6

Janela crítica

Intervalo antes do início do turno em que uma posição ainda vaga passa a exigir intervenção da operação.

Seções 2, 3 e 6

[H]

Hipótese não confirmada em campo. Marca herdada da documentação de pesquisa do projeto.

Todo o documento

1. Introdução e Visão Geral

1.1 Propósito do Documento

Este documento especifica os requisitos funcionais, os requisitos não funcionais, as regras de negócio e os casos de uso do sistema Frila, servindo de referência para o time de desenvolvimento, para os testes e para a validação com as partes interessadas. O posicionamento de mercado, as personas e a justificativa de cada escolha estão no Documento de Visão v1.0.0, que este documento complementa e não repete.

Uma ressalva de leitura, herdada da documentação de pesquisa do projeto: o Frila está em TRL 2, sem código escrito e sem validação de campo. As regras e os requisitos aqui derivam de evidência pública sobre o mercado e das falhas observadas nos concorrentes, mas as premissas de comportamento do usuário no Distrito Federal permanecem hipóteses, marcadas com [H]. Requisitos que dependem diretamente de uma hipótese trazem a marca no próprio texto, para que a revisão posterior saiba onde mexer.

1.2 Escopo

Objetivo do Produto

Permitir que um contratante publique um turno avulso e o preencha em poucas horas com um profissional em quem possa confiar, ainda que as duas partes nunca tenham trabalhado juntas. O sistema resolve isso levando a vaga ativamente até quem pode aceitá-la e dando a cada lado um sinal verificável sobre o outro antes da decisão.

Público-alvo

Contratantes de food service (bares, restaurantes, cafeterias e similares), contratantes de evento (buffets, produtoras e empresas de staff), coordenações de campanha, e profissionais operacionais que trabalham por turno avulso. Praça inicial: Distrito Federal.

Plataformas

Aplicativo iOS nativo (requisito fechado do projeto), aplicativo Android e versão web. Todos os perfis de usuário são atendidos nas duas vias, com proposta de valor distinta por perfil. O Painel de Operação é exclusivamente web e interno. A decisão entre nativo nas duas plataformas ou base compartilhada ainda não foi tomada; o backend pode ser externo.

Fora do Escopo

Processamento, custódia ou repasse de pagamento. O valor é combinado e pago diretamente entre as partes, e o sistema apenas registra o que foi acordado. Também estão fora: contratação em regime CLT e processo seletivo, emissão de contrato ou nota fiscal, chat interno, avaliação por nota de 1 a 5, feed ou rede social, freelance remoto e digital, limpeza residencial convencional, operação fora do DF antes da consolidação local e qualquer cobrança dentro do aplicativo enquanto o modelo de monetização não estiver definido.

1.3 Visão Geral do Documento

Este documento está organizado da seguinte forma: a Seção 2 define as Regras de Negócio, que originam os requisitos; a Seção 3 especifica os Requisitos Funcionais, com prioridade, critério de aceitação, estimativa e matriz de impacto por esforço; a Seção 4 descreve os Requisitos Não Funcionais; a Seção 5 lista o Escopo Não Contemplado; a Seção 6 apresenta os diagramas de casos de uso, de banco de dados, de classes e de arquitetura; e a Seção 7 reúne a matriz de rastreabilidade completa.

2. Regras de Negócio

2.1 Regras Obrigatórias

#

Regra

Contexto / Justificativa

RN01

O sistema NÃO DEVE cobrar nada do profissional, em nenhuma modalidade: sem taxa de cadastro, sem assinatura, sem moeda e sem desbloqueio de contato.

Em todos os concorrentes pesquisados, e independentemente do modelo de cobrança, as piores avaliações vêm do lado de quem trabalha. O modelo de moedas do GetNinjas acumula relatos de gasto sem retorno. É a única definição fechada do modelo de receita.

RN02

Uma vaga NÃO DEVE ser publicada sem função, data, horário de início e fim, local e valor por posição definidos.

O profissional precisa decidir com informação completa antes de aceitar. Avaliações dos concorrentes relatam chegada ao local “sem muita informação”, e aceite sem tempo de deslocamento.

RN03

O valor NÃO DEVE ser negociável dentro do fluxo de candidatura: o que está no anúncio é o que vale.

Candidatura em um toque é o que torna possível preencher um turno em minutos. Negociação reintroduz o funil que o produto existe para eliminar.

RN04

O sistema DEVE despachar ativamente toda vaga publicada aos profissionais elegíveis, e NUNCA apenas expô-la em um mural à espera de ser encontrada.

É o mecanismo central do produto e a resposta ao padrão “cadastro não é liquidez”, presente em praticamente todo concorrente com número verificável.

RN05

O sistema NÃO DEVE notificar profissional inelegível para a vaga, isto é, fora do raio, sem a função ou indisponível na janela.

Um marketplace que manda tudo para todo mundo treina o usuário a ignorar notificação, e aí o canal morre. A notificação é o produto.

RN06

A ordem de despacho DEVE ser determinada por taxa de comparecimento e histórico, e NÃO DEVE poder ser comprada, patrocinada ou promovida.

O único incentivo do sistema é comparecer, e ele não custa dinheiro. Qualquer venda de prioridade reintroduz o leilão de trabalho que o projeto rejeita.

RN07

A avaliação DEVE ser binária e bidirecional, liberada somente após o fim previsto do turno, e o sistema NÃO DEVE exibir média de 1 a 5.

Nota média com poucas avaliações não informa nada; “sete de sete chamariam de novo” informa. A avaliação nos dois sentidos corrige a assimetria observada no setor, em que só o contratante avalia.

RN08

A reputação exibida DEVE sempre mostrar o denominador (ex.: “7 de 7”) e o número de turnos considerados.

Um percentual sem denominador esconde amostra pequena e produz falsa confiança.

RN09

O sistema NÃO DEVE processar, custodiar ou repassar pagamento. O valor acordado é registrado; o pagamento é combinado diretamente entre as partes.

Decisão de escopo da versão 1. Pagamento retido ou atrasado é a queixa recorrente em Switch, Closeer e eFreela; assumir a custódia sem operação madura repetiria o problema.

RN10

O contato direto entre as partes SÓ DEVE ser liberado após a confirmação da posição.

Antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones. Depois dela, o contato é necessário para combinar detalhes e o pagamento.

RN11

O sistema DEVE registrar início e fim efetivos do turno e o valor acordado, e disponibilizar esse registro aos dois lados.

Hoje tudo isso vive em conversa de WhatsApp e memória. O registro é o que permite resolver divergência e é a base da taxa de comparecimento.

RN12

Todo cancelamento DEVE registrar autor, momento e motivo, e DEVE reabrir a posição com novo despacho imediato.

Uma posição cancelada e não reaberta é um turno que falha em silêncio. O registro do motivo é o que separa desistência de imprevisto na apuração.

RN13

O sistema NÃO DEVE suspender ou bloquear um perfil sem motivo registrado e sem canal de contestação com prazo de resposta.

Punição percebida como injusta é queixa recorrente: bloqueio por duas desistências, inclusive com dois dias de antecedência, e punição por falta a uma vaga que havia sumido do aplicativo.

RN14

O cadastro mínimo do profissional NÃO DEVE exigir mais do que o necessário para receber o primeiro despacho; a verificação de identidade é progressiva.

Cadastro travado antes de qualquer trabalho é uma barreira documentada nos concorrentes: selfie que não centraliza, documento que não sobe, e recusa explícita por desconfiança.

RN15

Dados pessoais e documentos de identificação NÃO DEVEM aparecer em log nem ser usados fora da finalidade declarada ao titular.

LGPD, e resposta direta à desconfiança registrada: “não acho seguro adicionar minha foto segurando meus documentos”.

RN16

O sistema NÃO DEVE criar subordinação, exclusividade ou escala obrigatória: o profissional escolhe o que aceita e recusar vaga NÃO DEVE gerar penalidade.

Mitigação do risco de caracterização de vínculo empregatício, hoje em discussão no Tema 1.291 do STF e no PLP 12/2024. Recusar é diferente de aceitar e não comparecer.

RN17

O sistema DEVE permitir ao contratante exportar o relatório consolidado de turnos realizados com data, horários auditados, valor acordado e profissional alocado.

Garante suporte ao fechamento contábil e conciliação financeira de restaurantes, bares e buffets, bem como à prestação de contas exigida em campanhas e produções de grande porte.

RN18

Valores monetários DEVEM ser armazenados em centavos, como inteiro, em reais (BRL), e horários DEVEM ser gravados em UTC e exibidos no fuso America/Sao_Paulo.

Evita erro de arredondamento em dinheiro e ambiguidade de horário em turno que vira a madrugada.

RN19

Uma posição NÃO DEVE ser confirmada para mais de um profissional, mesmo sob candidaturas simultâneas.

Confirmação dupla produz pessoa que se desloca sem ter trabalho, o tipo de falha que destrói confiança de uma vez só.

RN20

O cadastro DEVE ser restrito a maiores de 18 anos.

Exigência legal para trabalho em bares, eventos com venda de bebida alcoólica e trabalho noturno.

3. Requisitos Funcionais

3.1 Lista de Requisitos Funcionais

#

Requisito Funcional

Prioridade

Critério de aceitação

RF01

O sistema deve permitir que o profissional se cadastre e autentique com dados mínimos: nome, telefone, e-mail e confirmação de maioridade.

Alta

Um profissional conclui o cadastro e fica apto a receber despacho em menos de 3 minutos, sem envio de documento.

RF02

O sistema deve permitir que o contratante cadastre o estabelecimento com razão social ou nome, documento (CNPJ ou CPF), endereço e responsável.

Alta

Um contratante conclui o cadastro e publica a primeira vaga na mesma sessão, sem onboarding assistido.

RF03

O sistema deve permitir que o profissional declare suas funções, seu raio de atuação e sua disponibilidade por dia e faixa de horário.

Alta

Alterações de função, raio e disponibilidade passam a valer no despacho seguinte, sem exigir novo login.

RF04

O sistema deve permitir que o contratante publique uma vaga com função, data, horário de início e fim, local, valor por posição e número de posições.

Alta

O fluxo completo de publicação é concluído em menos de 60 segundos no celular, e a vaga é rejeitada com mensagem clara se algum campo obrigatório de RN02 faltar.

RF05

O sistema deve permitir republicar uma vaga a partir de outra já publicada, alterando apenas data e horário.

Média

A republicação de uma vaga recorrente é concluída em menos de 20 segundos.

RF06

O sistema deve despachar a vaga aos profissionais elegíveis, ordenados por taxa de comparecimento, notificando em levas sucessivas enquanto houver posição aberta.

Alta

A primeira leva é notificada em até 30 segundos após a publicação; nenhum profissional inelegível recebe a notificação; a leva seguinte é disparada se a posição continuar aberta ao fim do intervalo configurado.

RF07

O sistema deve permitir que o profissional liste e busque vagas abertas na região, por função, data e distância.

Média

A lista traz as vagas abertas dentro do raio declarado, ordenadas por proximidade e por horário de início.

RF08

O sistema deve permitir que o profissional se candidate a uma posição em um único toque a partir da notificação ou da lista.

Alta

A candidatura é concluída em no máximo 3 toques contados desde a notificação, sem formulário e sem negociação de valor.

RF09

O sistema deve oferecer dois modos de preenchimento: urgência, em que o primeiro candidato aprovado ocupa a posição, e seleção, em que o contratante escolhe entre os candidatos.

Alta

O modo é escolhido na publicação; em urgência, a posição é ocupada automaticamente pelo primeiro candidato elegível; em seleção, a posição permanece aberta até a escolha do contratante.

RF10

O sistema deve confirmar a posição e notificar os dois lados com função, local, horário, valor e identificação da contraparte.

Alta

Ambos recebem a confirmação em até 60 segundos; a posição some das vagas abertas; nenhuma posição é confirmada para dois profissionais (RN19).

RF11

O sistema deve liberar o canal de contato direto entre as partes (WhatsApp ou e-mail) somente após a confirmação.

Alta

O contato é inacessível antes da confirmação e fica disponível para ambos imediatamente depois dela.

RF12

O sistema deve enviar lembrete pré-turno para os dois lados, em intervalo configurável.

Média

O lembrete é entregue no intervalo definido e traz endereço, horário e contato da contraparte.

RF13

O sistema deve permitir registrar o início e o fim efetivos do turno pelas duas partes.

Alta

O registro grava data, hora e autor; divergência entre os dois registros é sinalizada e enviada ao Painel de Operação.

RF14

O sistema deve permitir o cancelamento por qualquer das partes, com motivo e registro de antecedência, reabrindo a posição com novo despacho imediato.

Alta

O cancelamento registra autor, momento e motivo; a posição volta a aparecer como aberta e a primeira leva de despacho é disparada em até 30 segundos.

RF15

O sistema deve solicitar a avaliação binária de cada lado após o fim previsto do turno.

Alta

A avaliação só fica disponível após o horário de término; cada lado responde “sim” ou “não” a uma única pergunta; nenhuma nota de 1 a 5 é oferecida.

RF16

O sistema deve exibir, no perfil de cada parte, a reputação com denominador e a taxa de comparecimento.

Alta

O perfil mostra “N de M chamariam de novo” e a taxa de comparecimento com o total de turnos considerados; perfis sem histórico são exibidos explicitamente como sem histórico, e não como nota zero.

RF17

O sistema deve permitir que um contratante registre aval externo para um profissional com quem já trabalhou fora da plataforma.

Média

O aval é atribuído a um contratante identificado, aparece separado do histórico interno e nunca é somado à taxa de comparecimento.

RF18

O sistema deve permitir que o estabelecimento mantenha uma equipe de confiança e a priorize no despacho das próximas vagas.

Média

Profissionais da equipe recebem o despacho na primeira leva, antes da ordenação geral por taxa de comparecimento.

RF19

O sistema deve permitir montar uma escala de evento em lote, com múltiplas funções e posições, publicadas de uma vez e com antecedência.

Média

É possível publicar pelo menos 40 posições distribuídas em várias funções numa única operação, com acompanhamento do preenchimento por função.

RF20

O sistema deve apresentar, no Painel de Operação, os turnos com posição aberta dentro da janela crítica, com tempo restante e contato das partes.

Alta

Toda posição que entra na janela crítica aparece no painel; o operador registra a intervenção realizada e o resultado.

RF21

O sistema deve permitir múltiplos usuários por estabelecimento, com papéis distintos (administrador e operador).

Média

Um novo usuário é incluído sem compartilhamento de senha; o histórico do estabelecimento permanece ao trocar de responsável.

RF22

O sistema deve manter o histórico de turnos das duas partes e permitir sua exportação em CSV e PDF.

Média

O arquivo exportado contém data, função, horário registrado, valor acordado e contraparte de cada turno do período selecionado.

RF23

O sistema deve oferecer um canal de suporte acionável durante o turno.

Média

O acionamento abre um chamado vinculado ao turno, visível no Painel de Operação, com tempo de resposta declarado ao usuário.

RF24

O sistema deve permitir que um perfil suspenso consulte o motivo e abra contestação.

Média

O motivo da suspensão é exibido ao titular; a contestação gera um chamado com prazo de resposta definido (RN13).

RF25

O sistema deve permitir que o usuário exporte seus dados pessoais e solicite a exclusão da conta.

Média

A solicitação é registrada e atendida em até 15 dias; os dados de turnos já realizados são anonimizados em vez de apagados, preservando o histórico da contraparte.

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

5 dias / 0,5 sprint

R$ 0 (interno)

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

7 dias / 1 sprint

R$ 0 (interno) + ferramenta de atendimento, se contratada

RF24

5 dias / 0,5 sprint

R$ 0 (interno)

RF25

6 dias / 0,5 sprint

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

RF01, RF02, RF03, RF13, RF15, RF16, RF20

Grande projeto, divida em partes

RF06, RF09, RF14

Impacto Médio

Secundário

RF05, RF07, RF12

Avalie

RF17, RF18, RF21, RF22, RF25

Evite por ora

RF19, RF23

Impacto Baixo

Se sobrar tempo

Nenhum

Baixa prioridade

RF24

Descarte ou adie

Nenhum

*RF06 (despacho ativo) é o maior esforço da lista e também o coração do produto: sem ele o Frila vira mais um mural passivo, que é exatamente o modo de falha identificado em todos os concorrentes. RF19 (escala de evento em lote) tem impacto alto na estratégia de entrada pelo segmento de eventos, mas foi classificado como médio nesta matriz porque o ciclo básico precisa funcionar antes, e é candidato natural à segunda leva de construção.*

4. Requisitos Não Funcionais

4.1 Lista de Requisitos Não Funcionais

#

Requisito Não Funcional

Categoria

Critério de Aceitação

RNF01

As telas principais devem carregar em menos de 2 segundos em conexão 4G, e o fluxo completo de publicação de vaga deve ser concluído em menos de 60 segundos.

Desempenho

Medição em aparelho Android de entrada e em rede 4G real, com percentil 95 dentro do limite.

RNF02

As notificações de vaga devem ser entregues de forma verificável, com reentrega automática em caso de falha e estado consultável pelo suporte.

Confiabilidade

99% das notificações entregues em até 60 segundos após o despacho, medido em janela móvel de 7 dias; toda falha registra motivo.

RNF03

A primeira leva de despacho deve ser notificada em até 30 segundos após a publicação da vaga.

Desempenho

Medição do intervalo entre o registro da vaga e o envio ao provedor de push, no percentil 95.

RNF04

O aplicativo deve funcionar em Android 9 ou superior com 2 GB de memória, em iOS 16 ou superior, e nos navegadores modernos em versão desktop e móvel.

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

Em teste com usuários reais, um profissional de primeira viagem conclui uma candidatura em até 3 toques a partir da notificação, sem ajuda, em pelo menos 8 de 10 tentativas.

RNF10

O produto deve ser utilizável por pessoas com deficiência visual e motora.

Acessibilidade

Compatível com VoiceOver e TalkBack em todos os fluxos principais; contraste conforme WCAG 2.1 nível AA; tipografia dinâmica até o maior tamanho sem quebra de layout.

RNF11

O sistema deve suportar o universo da praça-piloto sem reescrita de arquitetura.

Escalabilidade

Teste de carga simulando o DF, cerca de 30 mil estabelecimentos e a base de profissionais correspondente, mantendo RNF01 e RNF03.

RNF12

O sistema deve estar disponível na janela em que o problema acontece.

Disponibilidade

Disponibilidade mensal de 99,5%; nenhuma manutenção programada entre quinta e domingo, das 16h às 02h.

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

Ausência de qualquer espaço publicitário e de mecanismo de promoção paga na ordenação do despacho (RN06).

4.2 Tempo e Custo Estimados por RNF

#

Tempo Estimado

Custo Estimado

RNF01

Contínuo, 3 dias por sprint de ajuste

R$ 0 (interno)

RNF02

8 dias / 1 sprint

R$ 0 (interno). APNs e FCM sem custo no volume previsto

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

Infraestrutura mensal, a definir com a stack

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

Freelance remoto e digital (design, programação, redação)

Categoria diferente, sem componente presencial, já atendida por marketplaces globais. Confiança não transfere entre setores e a diluição mata a densidade.

Nunca

Limpeza residencial convencional e serviços domésticos recorrentes

Já possuem canais próprios consolidados e uma dinâmica de recorrência diferente da do turno avulso.

Nunca

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

Custo de bateria e de privacidade alto demais para o benefício, e tensiona a regra que evita caracterizar subordinação (RN16).

Nunca na forma contínua

Integrações com PDV, sistema de ponto e folha de pagamento

O público-alvo primário são operações pequenas, cuja infraestrutura de software costuma ser o celular de quem está no salão.

Indefinido

6. Diagramas

6.1 Diagrama de Casos de Uso

Dezesseis casos de uso cobrem os vinte e cinco requisitos funcionais: nenhum RF fica sem caso de uso na matriz da Seção 7.1. Um único desenho com todos eles e quatro atores vira um emaranhado de linhas, então o diagrama é apresentado em três vistas, cada uma respondendo a uma pergunta. Um caso de uso pode aparecer em mais de uma vista, como o UC07.

O despacho (UC02) não tem ator primário. Ele é incluído pela publicação (UC01) e pela reabertura (UC08), e as levas seguintes, o lembrete pré-turno e o pedido de avaliação são disparados pelo agendador do sistema. Desenhar o próprio sistema como ator colocaria o Frila do lado de fora do Frila.

*Figura 1 — Ciclo do turno: da publicação à avaliação (UC01 a UC08)*

*Figura 2 — Cadastro, perfil e confiança (UC09 a UC13)*

*Figura 3 — Suporte e direitos de quem usa (UC07, UC14 a UC16)*

Atores

Ator

Quem é

Casos de Uso

Profissional

Quem executa turnos avulsos: garçom, bartender, cozinheiro, recepcionista, promotor e outras funções operacionais. Maior de 18 anos.

UC03, UC05, UC06, UC08, UC09, UC13, UC14, UC15, UC16

Contratante

Usuário de um estabelecimento que publica turnos: bar, restaurante, buffet, produtora ou outro negócio. Age com papel de administrador ou de operador do estabelecimento (RF21).

UC01, UC04, UC05, UC06, UC08, UC10, UC11, UC12, UC13, UC14, UC15, UC16

Operador do Painel

Pessoa da equipe Frila que acompanha a janela crítica, atende suporte e apura contestações. Não confundir com o operador do estabelecimento.

UC07, UC08, UC14, UC15

Usuário

Generalização de Profissional e Contratante, usada onde os dois têm o mesmo direito.

UC14, UC15, UC16

Descrição dos Casos de Uso

UC01: Publicar vaga

Ator(es)

Contratante (administrador ou operador do estabelecimento)

Pré-condição

O contratante está autenticado e o estabelecimento tem cadastro completo (UC10).

Fluxo Principal

1. O contratante escolhe publicar uma vaga.

2. O sistema apresenta o formulário com função, data, horário de início e fim, local, valor por posição, número de posições e modo de preenchimento (urgência ou seleção).

3. O contratante preenche os campos. O local é pré-preenchido com o endereço do estabelecimento.

4. O sistema valida a obrigatoriedade dos campos conforme RN02.

5. O contratante confirma a publicação.

6. O sistema registra a vaga, cria uma posição por unidade solicitada e inclui UC02.

Fluxo Alternativo

3a. O contratante opta por republicar uma vaga anterior: o sistema pré-preenche todos os campos e solicita apenas a nova data e o novo horário (RF05).

3b. O contratante monta a escala de um evento: informa várias funções, cada uma com seu número de posições, e o sistema publica tudo numa única operação, acompanhando o preenchimento por função (RF19).

4a. Algum campo obrigatório está ausente ou inválido: o sistema indica o campo e impede a publicação.

Pós-condição

Vaga publicada, posições criadas com estado aberto e despacho iniciado.

Regras Relacionadas

RN02, RN03, RN04, RN18

Critério de Aceito (BDD)

Dado que sou um contratante autenticado com estabelecimento cadastrado, quando preencho função, data, horário, local, valor e número de posições e confirmo, então a vaga é publicada em menos de 60 segundos e a primeira leva de despacho é disparada.

UC02: Despachar vaga aos profissionais elegíveis

Ator(es)

Nenhum ator primário. Incluído por UC01 e UC08; as levas seguintes são disparadas pelo agendador do sistema.

Pré-condição

Existe ao menos uma posição aberta na vaga.

Fluxo Principal

1. O sistema seleciona os profissionais elegíveis: função compatível, local dentro do raio declarado pelo profissional, disponibilidade na janela, perfil ativo e nenhum turno confirmado que se sobreponha ao da vaga.

2. O sistema ordena os elegíveis: equipe de confiança do estabelecimento primeiro (UC11), depois por taxa de comparecimento e histórico.

3. O sistema monta a primeira leva e envia a notificação.

4. O sistema registra o envio e o estado de entrega de cada notificação.

5. Esgotado o intervalo da leva com a posição ainda aberta, o sistema dispara a leva seguinte e repete até preencher a posição, esgotar os elegíveis ou atingir o horário de início.

Fluxo Alternativo

1a. Não há nenhum elegível: o sistema registra a ausência de oferta e sinaliza a vaga no Painel de Operação (UC07).

3a. O profissional ignora ou recusa a notificação: nada é registrado contra ele (RN16), e ele segue elegível para as próximas vagas.

4a. A entrega da notificação falha: o sistema reagenda a entrega e registra o motivo (RNF02).

5a. Os elegíveis se esgotam antes do preenchimento: o sistema encerra as levas e sinaliza a vaga no Painel de Operação (UC07). O raio declarado pelo profissional nunca é ampliado pelo sistema (RN05).

5b. A posição entra na janela crítica ainda aberta: as levas continuam e a posição passa a constar também no Painel de Operação (UC07).

Pós-condição

Profissionais elegíveis notificados, com registro de envio e de entrega.

Regras Relacionadas

RN04, RN05, RN06, RN16

Critério de Aceito (BDD)

Dado que uma vaga foi publicada com posições abertas, quando o despacho é executado, então apenas profissionais elegíveis são notificados, em até 30 segundos, na ordem de prioridade definida, e nenhum profissional inelegível recebe a notificação.

UC03: Candidatar-se a uma posição

Ator(es)

Profissional

Pré-condição

O profissional está autenticado, tem perfil ativo e recebeu o despacho (UC02) ou encontrou a vaga na busca por região (RF07).

Fluxo Principal

1. O profissional abre a notificação ou a vaga na lista.

2. O sistema exibe função, endereço, data, horário, valor e o perfil do contratante com reputação e denominador.

3. O profissional se candidata com um toque.

4. O sistema registra a candidatura e a submete a UC04.

Fluxo Alternativo

3a. A posição já foi preenchida enquanto o profissional visualizava: o sistema informa o encerramento e oferece outras vagas próximas.

3b. O profissional já tem turno confirmado que se sobrepõe a este: o sistema impede a candidatura e mostra o turno em conflito. A regra é garantida no banco de dados, e não só na tela (decisão D1).

3c. O perfil está suspenso: o sistema mostra o motivo e o caminho para contestar (UC15).

Pós-condição

Candidatura registrada e submetida ao fluxo de confirmação.

Regras Relacionadas

RN03, RN05, RN08, RN10

Critério de Aceito (BDD)

Dado que recebi a notificação de uma vaga elegível, quando toco em candidatar-me, então a candidatura é registrada em no máximo 3 toques contados desde a notificação, sem formulário e sem negociação de valor.

UC04: Confirmar profissional na posição

Ator(es)

Contratante no modo seleção. No modo urgência, a confirmação é automática.

Pré-condição

Existe ao menos uma candidatura válida para a posição.

Fluxo Principal

1. No modo urgência, o sistema confirma automaticamente o primeiro candidato elegível.

2. No modo seleção, o sistema apresenta os candidatos ao contratante com reputação, denominador e taxa de comparecimento, e o contratante escolhe.

3. O sistema marca a posição como preenchida e garante que nenhuma outra confirmação ocorra para ela.

4. O sistema notifica os dois lados com função, local, horário, valor e identificação da contraparte.

5. O sistema libera o canal de contato direto entre as partes.

Fluxo Alternativo

2a. O contratante não escolhe até a janela crítica: a posição entra no Painel de Operação (UC07).

2b. A candidatura expira sem escolha: o candidato é avisado e segue livre para outras vagas. O prazo de expiração é a decisão D3, ainda aberta.

3a. Duas confirmações chegam simultaneamente: o sistema confirma exatamente uma, e a outra recebe a resposta de posição já ocupada.

Pós-condição

Posição preenchida, ambas as partes notificadas e contato liberado.

Regras Relacionadas

RN08, RN10, RN19

Critério de Aceito (BDD)

Dado que há candidaturas para uma posição, quando a confirmação ocorre, então os dois lados recebem a notificação com os dados completos do turno em até 60 segundos, o contato é liberado e a posição deixa de aparecer entre as vagas abertas.

UC05: Registrar a execução do turno

Ator(es)

Profissional e Contratante

Pré-condição

Existe uma posição confirmada cujo horário de início se aproxima.

Fluxo Principal

1. O sistema envia o lembrete pré-turno para os dois lados, com endereço, horário e contato da contraparte (RF12).

2. O profissional registra o início ao chegar.

3. O contratante confirma o início.

4. Ao término, qualquer das partes registra o fim e a outra confirma.

5. O sistema grava início, fim e valor acordado, e disponibiliza o registro aos dois.

Fluxo Alternativo

2a. O profissional não registra o início dentro da tolerância: o sistema alerta o contratante e sinaliza a posição no Painel de Operação (UC07).

2b. O profissional não comparece: o contratante registra a ausência, o que afeta a taxa de comparecimento, e a posição pode ser reaberta (UC08).

3a. O contratante não confirma o início: vale o registro do profissional, marcado como não confirmado, e o caso vai ao Painel de Operação.

4a. Os registros das partes divergem: o sistema mantém os dois, sinaliza a divergência e a encaminha ao Painel de Operação.

Pós-condição

Turno registrado com horários e valor, e avaliação liberada após o término previsto.

Regras Relacionadas

RN09, RN11, RN18

Critério de Aceito (BDD)

Dado que um turno confirmado foi executado, quando as duas partes registram início e fim, então o sistema grava os horários e o valor acordado e disponibiliza o registro para consulta e exportação por ambos (UC13).

UC06: Avaliar após o turno

Ator(es)

Profissional e Contratante

Pré-condição

O horário de término previsto do turno já passou.

Fluxo Principal

1. O sistema solicita a avaliação a cada lado.

2. Cada um responde a uma única pergunta: “Você chamaria essa pessoa de novo?” para o contratante, “Você trabalharia nesse local de novo?” para o profissional.

3. O sistema registra a resposta e atualiza a reputação da contraparte.

4. O sistema recalcula a taxa de comparecimento a partir dos registros de UC05.

5. As reputações atualizadas passam a valer no próximo despacho.

Fluxo Alternativo

2a. Uma das partes não responde: a reputação da outra não é alterada, e o denominador exibido considera apenas as respostas efetivamente dadas.

3a. O turno foi cancelado antes de começar: nenhuma avaliação é solicitada, e o cancelamento é registrado separadamente.

Pós-condição

Reputação e taxa de comparecimento atualizadas para os dois lados. O aval externo (UC12) nunca entra nesse cálculo.

Regras Relacionadas

RN07, RN08

Critério de Aceito (BDD)

Dado que um turno terminou, quando ambas as partes respondem à pergunta binária, então a reputação de cada uma é atualizada e passa a ser exibida com o denominador, sem que nenhuma média de 1 a 5 seja apresentada.

UC07: Intervir em turno em risco pelo Painel de Operação

Ator(es)

Operador do Painel

Pré-condição

Existe posição aberta dentro da janela crítica, ou um caso sinalizado por ausência de elegíveis, divergência de registro, não comparecimento, chamado de suporte (UC14) ou contestação (UC15).

Fluxo Principal

1. O sistema lista no painel as posições em risco, com tempo restante, histórico de despacho e contato das partes.

2. O operador escolhe um caso e analisa o que já foi tentado.

3. O operador aciona profissionais manualmente ou contata o contratante para ajustar valor, horário ou função.

4. O operador registra a intervenção e o resultado.

5. Preenchida a posição, ela sai da lista de risco.

Fluxo Alternativo

3a. Não há como preencher: o operador registra o turno como não preenchido, com o motivo, e comunica o contratante. O caso alimenta a revisão de raio, valor e antecedência.

3b. O caso é uma divergência de registro ou uma disputa entre as partes: o operador apura, registra a decisão e, se aplicável, aciona UC08 ou a suspensão prevista em RN13, sempre com motivo registrado.

Pós-condição

Intervenção registrada e posição preenchida ou encerrada com motivo.

Regras Relacionadas

RN12, RN13, RN16

Critério de Aceito (BDD)

Dado que uma posição entra na janela crítica sem estar preenchida, quando abro o Painel de Operação, então ela aparece na lista de risco com tempo restante e contatos, e toda ação que eu registrar fica vinculada ao turno.

UC08: Cancelar e reabrir posição

Ator(es)

Profissional, Contratante ou Operador do Painel

Pré-condição

Existe uma posição confirmada ainda não executada, ou um não comparecimento registrado em UC05.

Fluxo Principal

1. A parte solicita o cancelamento e informa o motivo.

2. O sistema registra autor, momento, antecedência e motivo.

3. O sistema notifica a contraparte.

4. O sistema devolve a posição ao estado aberto e inclui UC02 imediatamente.

5. O sistema contabiliza o evento no histórico da parte que cancelou, distinguindo cancelamento com antecedência de não comparecimento.

Fluxo Alternativo

1a. O cancelamento parte do operador, depois de apurar um caso em UC07: o motivo registrado é o da apuração.

4a. O horário de início já passou: a posição não é reaberta; o caso vai para o Painel de Operação como turno não coberto.

5a. O padrão de cancelamentos de uma parte ultrapassa o limite definido: o sistema sinaliza para apuração humana, nunca para bloqueio automático (RN13).

Pós-condição

Cancelamento registrado, posição reaberta quando cabível e histórico atualizado.

Regras Relacionadas

RN12, RN13, RN16

Critério de Aceito (BDD)

Dado que uma posição confirmada é cancelada antes do início do turno, quando o motivo é informado, então a contraparte é notificada, a posição volta a ficar aberta e um novo despacho é disparado em até 30 segundos.

UC09: Cadastrar-se e manter o perfil profissional

Ator(es)

Profissional

Pré-condição

Não existe conta ativa com o mesmo telefone ou e-mail.

Fluxo Principal

1. O profissional informa nome, telefone e e-mail e confirma ter 18 anos ou mais.

2. O sistema confirma o telefone por código.

3. O profissional declara suas funções, o ponto base com o raio de atuação e a disponibilidade por dia e faixa de horário.

4. O sistema ativa o perfil, que passa a entrar no despacho.

5. A qualquer momento, o profissional altera funções, raio ou disponibilidade, e a mudança vale no despacho seguinte, sem novo login.

Fluxo Alternativo

1a. A pessoa declara ter menos de 18 anos: o cadastro é recusado, e nada além do necessário para registrar a recusa é guardado (RN20).

3a. O profissional sai antes de declarar funções e raio: o cadastro fica salvo, mas o perfil não entra em nenhum despacho até completá-los.

5a. O sistema pede verificação de identidade: ela é progressiva e acontece depois do primeiro despacho, nunca como barreira de entrada. O documento não aparece em log (RN14, RN15).

Pós-condição

Perfil ativo e apto a receber despacho, sem nenhuma cobrança.

Regras Relacionadas

RN01, RN14, RN15, RN20

Critério de Aceito (BDD)

Dado que tenho 18 anos ou mais, quando informo nome, telefone, e-mail, funções, raio e disponibilidade, então fico apto a receber despacho em menos de 3 minutos, sem enviar documento e sem pagar nada.

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

3. O sistema registra a inclusão, e o profissional passa a receber a primeira leva das próximas vagas para as quais for elegível (UC02).

4. O contratante pode remover o profissional da equipe a qualquer momento.

Fluxo Alternativo

3a. O profissional da equipe não é elegível para uma vaga, por função, raio ou disponibilidade: ele não é notificado. A equipe muda a ordem do despacho, nunca a regra de elegibilidade (RN05).

3b. O profissional recusa vagas da equipe: não há penalidade nem remoção automática (RN16).

Pós-condição

Equipe atualizada, valendo a partir do próximo despacho.

Regras Relacionadas

RN05, RN06, RN16

Critério de Aceito (BDD)

Dado que um profissional está na equipe de confiança do meu estabelecimento e é elegível para a vaga, quando publico, então ele é notificado na primeira leva, antes da ordenação geral por taxa de comparecimento.

UC12: Registrar aval externo

Ator(es)

Contratante

Pré-condição

O contratante está identificado e já trabalhou com o profissional fora da plataforma.

Fluxo Principal

1. O contratante localiza o profissional pelo telefone ou pelo perfil.

2. O contratante declara ter trabalhado com ele, informando a função e o período aproximado.

3. O sistema registra o aval, atribuído ao contratante identificado.

4. O aval passa a aparecer no perfil do profissional, separado do histórico interno.

Fluxo Alternativo

1a. O profissional ainda não tem perfil: o sistema oferece um convite para o cadastro (UC09), e o aval só é registrado quando o perfil existir.

3a. O mesmo contratante já registrou aval para esse profissional: o sistema atualiza o registro existente em vez de somar outro.

Pós-condição

Aval visível no perfil do profissional e nunca somado à taxa de comparecimento.

Regras Relacionadas

RN08

Critério de Aceito (BDD)

Dado que trabalhei com um profissional fora da plataforma, quando registro o aval, então ele aparece no perfil do profissional atribuído a mim, separado do histórico interno, e não altera a taxa de comparecimento.

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

2a. Um turno tem registros divergentes: ele aparece marcado como em apuração, com os dois registros lado a lado.

Pós-condição

Arquivo gerado com os turnos do período. O valor é o acordado e registrado, nunca um pagamento processado pelo Frila.

Regras Relacionadas

RN09, RN11, RN17, RN18

Critério de Aceito (BDD)

Dado que tenho turnos registrados no mês, quando exporto o período, então o arquivo traz data, função, horários auditados, valor acordado e contraparte de cada turno, pronto para o fechamento contábil.

UC14: Acionar suporte durante o turno

Ator(es)

Usuário (Profissional ou Contratante), atendido pelo Operador do Painel

Pré-condição

Existe um turno confirmado em andamento ou prestes a começar.

Fluxo Principal

1. O usuário aciona o suporte a partir da tela do turno.

2. O usuário escolhe o motivo (endereço, atraso, conduta, segurança ou outro) e descreve o caso.

3. O sistema abre um chamado vinculado ao turno e mostra o tempo de resposta declarado.

4. O chamado aparece no Painel de Operação (UC07).

5. O operador responde e registra a resolução.

Fluxo Alternativo

2a. O motivo é de segurança: além do chamado, o sistema orienta o contato imediato com as autoridades.

5a. O tempo de resposta declarado se esgota: o chamado sobe de prioridade no painel e o usuário é avisado.

Pós-condição

Chamado registrado, vinculado ao turno e respondido.

Regras Relacionadas

RN11, RN15

Critério de Aceito (BDD)

Dado que estou num turno confirmado, quando aciono o suporte, então um chamado vinculado ao turno aparece no Painel de Operação e eu vejo o tempo de resposta declarado.

UC15: Consultar e contestar suspensão

Ator(es)

Usuário suspenso (Profissional ou Contratante), atendido pelo Operador do Painel

Pré-condição

O perfil foi suspenso com motivo registrado (UC07).

Fluxo Principal

1. Ao entrar, o usuário vê o motivo e a data da suspensão.

2. O usuário abre uma contestação com relato e, se quiser, evidência.

3. O sistema cria o chamado com prazo de resposta e informa o prazo ao usuário.

4. O operador apura e decide, registrando o fundamento.

5. O sistema comunica a decisão. Se a suspensão for revertida, o perfil volta a ficar ativo.

Fluxo Alternativo

4a. O prazo vence sem decisão: o chamado é escalado e o usuário é avisado do novo prazo.

5a. A suspensão é mantida: o usuário recebe o fundamento por escrito.

Pós-condição

Contestação decidida, com fundamento registrado.

Regras Relacionadas

RN13, RN15, RN16

Critério de Aceito (BDD)

Dado que meu perfil foi suspenso, quando abro o aplicativo, então vejo o motivo registrado e consigo abrir uma contestação que recebe prazo de resposta definido.

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

6.2 Diagrama de Banco de Dados (DER)

O eixo do modelo é uma cadeia só — vaga → posição → turno → avaliação —, o ciclo de vida de uma unidade de trabalho da publicação à reputação. Despacho e candidatura penduram-se nela como o registro de quem foi chamado e quem respondeu. As duas vistas abaixo são do mesmo esquema: separá-las evita o emaranhado de linhas que um único desenho com dezesseis entidades produz.

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

Conta de acesso, comum a todos os perfis.

id, nome, telefone, email, senha_hash, criado_em, estado, maioridade_confirmada

1:1 com Profissional; N:N com Estabelecimento via MembroEstabelecimento

Profissional

Perfil de quem executa turnos.

id, usuario_id, raio_km, ponto_base, taxa_comparecimento, turnos_realizados, estado

1:1 com Usuario; N:N com Funcao; 1:N com Disponibilidade, Candidatura e Avaliacao

Estabelecimento

Contratante: bar, restaurante, buffet, produtora ou coordenação de campanha.

id, nome, documento, tipo, endereco, geo_lat, geo_lng, criado_em

1:N com Vaga e EquipeConfianca; N:N com Usuario via MembroEstabelecimento

MembroEstabelecimento

Vínculo entre um usuário e um estabelecimento, com papel.

id, usuario_id, estabelecimento_id, papel, criado_em

N:1 com Usuario; N:1 com Estabelecimento

Funcao

Catálogo de funções operacionais (garçom, bartender, chapeiro, montador…).

id, nome, categoria, ativo

N:N com Profissional; 1:N com Vaga

Vaga

Turno publicado por um estabelecimento.

id, estabelecimento_id, funcao_id, inicio_em, fim_em, local, geo_lat, geo_lng, valor_centavos, modo, estado, publicado_em

N:1 com Estabelecimento e Funcao; 1:N com Posicao e Despacho

Posicao

Unidade preenchível de uma vaga. Uma vaga de 4 garçons tem 4 posições.

id, vaga_id, estado, profissional_id, confirmado_em

N:1 com Vaga; 1:N com Candidatura; 1:1 com Turno

Disponibilidade

Janelas em que o profissional aceita trabalhar.

id, profissional_id, dia_semana, hora_inicio, hora_fim

N:1 com Profissional

Despacho

Registro de cada envio de vaga a um profissional elegível.

id, vaga_id, profissional_id, leva, enviado_em, estado_entrega, entregue_em, motivo_falha

N:1 com Vaga; N:1 com Profissional

Candidatura

Manifestação de interesse de um profissional por uma posição.

id, posicao_id, profissional_id, criada_em, estado

N:1 com Posicao; N:1 com Profissional

Turno

Execução efetiva de uma posição confirmada.

id, posicao_id, inicio_registrado_em, fim_registrado_em, registrado_por, valor_acordado_centavos, divergencia

1:1 com Posicao; 1:N com Avaliacao

Avaliacao

Resposta binária de um lado sobre o outro, após o turno.

id, turno_id, autor_tipo, autor_id, alvo_tipo, alvo_id, resposta, criada_em

N:1 com Turno

AvalExterno

Aval de quem trabalhou com o profissional fora da plataforma.

id, profissional_id, estabelecimento_id, texto, verificado_em

N:1 com Profissional; N:1 com Estabelecimento

EquipeConfianca

Profissionais que um estabelecimento prioriza no despacho.

id, estabelecimento_id, profissional_id, adicionado_em

N:1 com Estabelecimento; N:1 com Profissional

Evento

Agrupamento de vagas de um mesmo evento, para escala em lote.

id, estabelecimento_id, nome, data, local

N:1 com Estabelecimento; 1:N com Vaga

Ocorrencia

Registro de intervenção, cancelamento, suspensão ou contestação.

id, tipo, turno_id, posicao_id, autor_id, motivo, criada_em, resultado

N:1 com Posicao; N:1 com Turno

6.3 Diagrama de Classes

A regra de dependência vale em toda seta: o domínio é alvo de todas e origem de nenhuma. Quando precisa falar com o mundo, declara um protocolo e espera que alguém o implemente — é o que permite testar despacho, elegibilidade e reputação sem rede, sem interface e sem simulador.

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

id: UUID, funcao: Funcao, inicio: Date, fim: Date, local: Local, valorCentavos: Int, modo: ModoPreenchimento, posicoes: [Posicao]

posicoesAbertas(): [Posicao], estaNaJanelaCritica(): Bool, encerrar(): Void

Posicao

Controlar o preenchimento de uma unidade da vaga.

id: UUID, estado: EstadoPosicao, profissional: Profissional?, candidaturas: [Candidatura]

confirmar(_: Profissional) throws, reabrir(motivo: String): Void

Profissional

Guardar perfil, elegibilidade e reputação de quem executa.

id: UUID, funcoes: [Funcao], raioKm: Double, pontoBase: Coordenada, disponibilidades: [Disponibilidade], taxaComparecimento: Double

estaElegivel(para: Vaga): Bool, atualizarComparecimento(_: Turno): Void

Estabelecimento

Representar o contratante e sua equipe.

id: UUID, nome: String, endereco: Local, membros: [Membro], equipeConfianca: [Profissional]

publicar(_: Vaga) throws, priorizar(_: Profissional): Void

Turno

Registrar a execução e os horários efetivos.

id: UUID, posicao: Posicao, inicioRegistrado: Date?, fimRegistrado: Date?, valorAcordadoCentavos: Int

registrarInicio(por: Ator): Void, registrarFim(por: Ator): Void, temDivergencia(): Bool

Avaliacao

Guardar a resposta binária de um lado sobre o outro.

id: UUID, turno: Turno, autor: Ator, alvo: Ator, resposta: Bool

aplicar(): Void

Reputacao

Calcular e formatar o sinal de confiança exibido.

positivas: Int, total: Int, taxaComparecimento: Double, turnosConsiderados: Int

descricao(): String, temHistorico(): Bool

DespachoService

Selecionar, ordenar e notificar os elegíveis em levas.

vaga: Vaga, tamanhoLeva: Int, intervaloLeva: TimeInterval

elegiveis(): [Profissional], ordenar(_: [Profissional]): [Profissional], despacharProximaLeva() async

NotificacaoService

Enviar, acompanhar a entrega e reenviar notificações.

provedor: ProvedorPush, pendentes: [Despacho]

enviar(_: Despacho) async throws, confirmarEntrega(_: UUID): Void, reenviarFalhas() async

ElegibilidadeSpec

Isolar as regras de quem pode receber uma vaga.

raio: Double, exigeFuncao: Bool, exigeDisponibilidade: Bool

satisfaz(_: Profissional, _: Vaga): Bool

VagaRepository

Persistir e consultar vagas, posições e candidaturas.

fonte: FonteDeDados

salvar(_: Vaga) async throws, abertasProximas(de: Coordenada, raio: Double) async -> [Vaga], confirmar(posicao: UUID, profissional: UUID) async throws

PublicarVagaViewModel

Orquestrar a tela de publicação e validar RN02.

rascunho: RascunhoVaga, erros: [CampoInvalido], estado: EstadoTela

validar(): Bool, publicar() async, carregarDeVagaAnterior(_: UUID): Void

FeedVagasViewModel

Orquestrar a lista de vagas e a candidatura do profissional.

vagas: [Vaga], filtro: FiltroVagas, estado: EstadoTela

carregar() async, candidatar(a: Posicao) async

PainelOperacaoViewModel

Orquestrar a visão de turnos em risco e as intervenções.

emRisco: [Posicao], filtroJanela: TimeInterval

carregar() async, registrarIntervencao(_: Ocorrencia) async

SessaoUsuario

Guardar identidade, perfil ativo e permissões.

usuario: Usuario, perfilAtivo: Perfil, token: Token

trocarPerfil(_: Perfil): Void, encerrar(): Void

6.4 Arquitetura

A arquitetura descrita aqui é a proposta de partida do grupo, não uma decisão ratificada. O único requisito técnico fechado no projeto é a existência de um aplicativo iOS nativo; a escolha entre nativo nas duas plataformas ou base compartilhada, e a stack do backend, permanecem em aberto. As camadas e a separação de responsabilidades abaixo valem independentemente dessa escolha. [H]

As camadas previstas são quatro:

• Apresentação: telas em SwiftUI e view models por funcionalidade, sem regra de negócio.

• Domínio: entidades, especificações de elegibilidade e serviços de despacho e reputação. É a camada que precisa ser testável sem rede e sem interface.

• Dados: repositórios, cliente de rede, cache local e fila de ações offline.

• Infraestrutura: notificação push, geolocalização, mapa, keychain e telemetria.

Dependências e Pacotes

Pacote / Lib

Finalidade

SwiftUI

Produção de telas nos aplicativos iOS

Swift Concurrency (async/await, actors)

Operações assíncronas e isolamento de estado no despacho e na sincronização

CoreLocation

Localização do usuário e cálculo de raio de elegibilidade

MapKit

Exibição do local do turno e da distância até ele

UserNotifications

Recebimento e apresentação das notificações de vaga

URLSession

Comunicação com o backend

Keychain Services

Armazenamento de credenciais e token de sessão

SwiftData ou Core Data

Cache local dos turnos confirmados e fila de ações offline, com a escolha ainda em aberto

Swift Testing / XCTest

Testes de unidade das regras de domínio e de integração dos fluxos

Backend (stack a definir)

Persistência, despacho, autenticação e envio de push. Pode ser serviço externo

Diagrama de arquitetura

*Figura 12 — Contexto: atores e dependências externas*

*Figura 13 — Contêineres: quatro clientes, uma API, o despacho em fila*

*Figura 14 — As duas estratégias para iOS, Android e web*

*Figura 15 — As quatro camadas dentro do aplicativo*

*Figura 16 — Da publicação à confirmação, com os prazos de cada etapa*

Módulo 1 (obrigatório)

Nome do Módulo

Frila-iOS, aplicativo do Profissional e do Estabelecimento

Padrão Arquitetural

MVVM com camada de domínio isolada (Clean Architecture enxuta)

Justificativa

MVVM é o padrão idiomático de SwiftUI e mantém as telas livres de regra de negócio. A camada de domínio separada é o ponto que importa neste produto: o despacho, a elegibilidade e a reputação são as regras que sustentam a tese inteira, e precisam ser testáveis sem interface, sem rede e sem simulador, inclusive porque vão mudar conforme a validação de campo corrigir as hipóteses. A separação também permite compartilhar o domínio com o cliente Android ou com a web caso a decisão de stack aponte para uma base comum.

Linguagem / Framework

Swift e SwiftUI

Frila-iOS/

├── Sources/

│ ├── Features/ # Publicação, Feed, Turno, Reputação, Perfil

│ ├── Domain/ # Entidades, ElegibilidadeSpec, DespachoService, Reputacao

│ ├── Data/ # Repositórios, cliente HTTP, cache e fila offline

│ ├── Infra/ # Push, localização, keychain, telemetria

│ └── UI/ # Componentes, tokens de estilo e acessibilidade

├── Tests/ # Testes de domínio e de integração dos fluxos

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

Funções, raio e disponibilidade do profissional

RN05

RNF09

UC09, UC02

RF04

Publicação de vaga

RN02, RN03, RN18

RNF01, RNF09

UC01

RF05

Republicação de vaga anterior

RN02

RNF01

UC01

RF06

Despacho ativo em levas

RN04, RN05, RN06

RNF02, RNF03, RNF11

UC02

RF07

Busca de vagas na região

RN05

RNF01, RNF05

UC03

RF08

Candidatura em um toque

RN03

RNF09

UC03

RF09

Modo urgência e modo seleção

RN19

RNF14

UC01, UC04

RF10

Confirmação e notificação das partes

RN10, RN19

RNF02, RNF14

UC04

RF11

Liberação do canal de contato

RN10

RNF07, RNF08

UC04

RF12

Lembrete pré-turno

Nenhuma

RNF02

UC05

RF13

Registro de início e fim do turno

RN11, RN18

RNF06, RNF13

UC05

RF14

Cancelamento com reabertura

RN12, RN16

RNF03, RNF13

UC08

RF15

Avaliação binária bidirecional

RN07

RNF13

UC06

RF16

Exibição de reputação e comparecimento

RN07, RN08

RNF09, RNF10

UC03, UC04, UC06

RF17

Aval externo herdado

RN08

RNF13

UC12

RF18

Equipe de confiança

RN06

RNF03

UC11, UC02

RF19

Escala de evento em lote

RN02, RN18

RNF01, RNF11

UC01

RF20

Painel de operação e janela crítica

RN12, RN13

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

Suporte durante o turno

RN13

RNF12

UC14, UC07

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

*RN01 (não cobrar do profissional), RN09 (não processar pagamento) e RN20 (maioridade) não aparecem vinculadas a um único requisito porque são restrições de produto que valem sobre o sistema inteiro: a primeira e a segunda determinam o que não existe, e a terceira condiciona todo o cadastro. Elas são verificadas por ausência, já que nenhum fluxo pode introduzi-las, e não por um requisito específico que as implemente.*
