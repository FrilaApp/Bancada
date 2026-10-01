---
tipo: documento-produto
desafio: C18
data_criacao: 2026-09-15
origem: "Frila/Documentos/MD/README.md"
tags: [produto, frila]
data_atualizacao: 2026-10-01
---

# Frila

**Versão 1.1 · 1º de outubro de 2026**

Frila é uma plataforma para contratar gente por turno avulso. O estabelecimento publica o turno que precisa cobrir, a vaga é enviada para quem está perto e pode aceitar, e a pessoa se candidata sem formulário. Depois do turno, os dois respondem se chamariam o outro de novo.

A estratégia é territorial. Nascer no Distrito Federal e dominar aqui antes de abrir qualquer outra praça: restaurantes, bares, buffets, casas de evento, festas, eventos sociais, serviços domésticos. A plataforma é horizontal: aceita vaga de turno avulso de qualquer setor, e food service e eventos são só o foco da divulgação inicial. Consolidado o DF, o passo seguinte é o resto do Brasil, e só então outros países. A pesquisa de 01/10/2026 afinou o primeiro passo: nascer em um núcleo do DF que caiba no raio de despacho de 15 km, e só então abrir as outras regiões administrativas, uma a uma.

Este documento é a visão geral. Ele reúne, em texto corrido, o que está espalhado pelos cinco documentos numerados do projeto, e o lastro de cada número está em [[01 - CBL/Desafios/C18/Documentos de Produto/EVIDENCIAS|EVIDENCIAS.md]], com fonte, data e o que não foi possível verificar. Quando alguma seção aqui não bastar, o rodapé indica qual documento abrir.

> **Revisão de 01/10/2026 (versão 1.1).** Este documento incorpora a [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Pesquisa_de_Concorrentes_2026-10-01|pesquisa de concorrentes e de modelo de negócio de 01/10/2026]] e três decisões do Cauê do mesmo dia: o pagamento do turno continua por fora do app (RN09 mantida); o valor por posição e o da assinatura ficam em aberto; vínculo e parceria com agência de trabalho temporário ficam em aberto. Mudaram as seções "O mercado e quem já compete nele", "Por que o WhatsApp ainda vence", "O que o Frila não é" e "Decidido, e em aberto".

---

## O problema

Contratar alguém para cobrir um turno de última hora ainda depende de grupo de WhatsApp, indicação e sorte. Um garçom que faltou, um bartender para o sábado, uma equipe inteira para uma formatura: o jeito de resolver é sempre o mesmo.

O contratante não sabe se quem ele chamar vai aparecer, vai saber trabalhar, ou vai sumir no meio do turno. Numa sexta cheia, mandar um desconhecido para o salão é risco operacional: mesa mal atendida, comanda errada, cliente perdido.

Do outro lado, o profissional não tem como provar seu histórico para quem ainda não trabalhou com ele. Cada estabelecimento novo é começar do zero. E o pagamento é uma promessa, combinado na confiança, sem registro de quantas horas foram trabalhadas nem de quanto ficou acertado.

O que a pesquisa mostrou, e que muda a leitura do problema, é que falta gente não é a questão. Nas plataformas que já existem, sobra gente se candidatando e sendo ignorada. A queixa dominante de quem trabalha não é ausência de vaga, é nunca ser chamado, e ela aparece em três aplicativos de empresas diferentes. O que é escasso é motivo para o contratante confiar em alguém que ele não conhece.

Os números de contexto existem e são grandes. Noventa por cento dos empresários de bares e restaurantes classificam a contratação como difícil ou muito difícil. A rotatividade do setor foi de 73,49% em doze meses, como se cada casa trocasse a equipe inteira a cada 16 meses. O setor de eventos movimentou R$ 25,33 bilhões só no primeiro bimestre de 2026, o maior valor da série histórica.

O que nenhuma fonte pública mede é a frequência. Quantas vezes por mês um estabelecimento ou um produtor fica sem uma pessoa em cima da hora, e quanto isso custa. Esse número sustenta ou derruba a razão de ser do Frila, e ele só existe em campo.

---

## Para quem é

### O profissional

Os tipos de trabalho que cabem num turno avulso, por setor.

**Gastronomia e food service.** Chapeiro, pizzaiolo, sushiman, churrasqueiro, confeiteiro e salgadeiro auxiliar, steward, embalador de delivery, barista. Muitos estabelecimentos operam no limite durante a semana e explodem de quinta a domingo ou no almoço corporativo. Confeitaria e salgados têm pico sazonal em Páscoa, Natal e Dia das Mães.

**Eventos, shows, congressos e feiras.** O setor praticamente vive de diária. Na técnica e montagem: carregador, roadie, montador de estande e cenografia, operador básico de som, projeção e telão. No atendimento: credenciamento e check-in, hostess e promotor de estande, camareira de camarim (apoio ao elenco e à banda), chapelaria, recreador infantil, valet com CNH. Na organização: orientador de público e fiscal de fila, bombeiro civil, este último obrigatório por lei acima de determinado público e pago como diária especializada.

**Varejo, comércio e shoppings.** Vendedor extra, promotor de degustação, empacotador de balcão de presentes, repositor de gôndola, estoquista temporário, inventariante. A sazonalidade é extrema: fim de semana, Black Friday, Natal, Dia das Mães. A contagem de estoque costuma ser turno fechado, noturno ou de fim de semana.

**Logística, e-commerce e galpões.** Chapa para carga e descarga, pago estritamente por diária ou por caminhão. Separador de pedidos, etiquetador, conferente auxiliar, muitas vezes em campanhas ou madrugadas.

**Limpeza especializada e facilities.** Faxina pesada pré e pós-evento, para entregar o espaço limpo na manhã seguinte ao show. Limpeza pós-obra, de diária mais alta. Cobertura de portaria e zeladoria em folgas e faltas imprevistas. A faxina residencial avulsa também pode ser publicada.

**Beleza, bem-estar e pets.** Escovista e auxiliar de cabeleireiro, manicure extra, massoterapeuta para ativações corporativas e SIPATs, auxiliar de banho e tosa, dog walker de reforço. Picos de quinta a sábado e em vésperas de feriado.

O profissional quer preencher a semana, receber rápido, e não precisar provar quem é toda vez. O Frila oferece turnos que cabem na agenda dele, e um histórico que ele carrega consigo, inclusive se mudar de cidade.

### O estabelecimento

Equipe fixa enxuta, dimensionada para a média da semana, que quebra nos picos e entra em colapso com falta ou atestado de última hora.

Cabem aqui bares, restaurantes, pubs, hamburguerias, pizzarias, sushi bars, cafeterias, padarias e confeitarias, dark kitchens e hubs de delivery. Também lojas de shopping e de rua, supermercados e atacarejos, farmácias de grande fluxo, quiosques sazonais. Dark stores e galpões urbanos de last mile, transportadoras, centros de triagem. Condomínios e coworkings para cobertura pontual de portaria. Empresas de limpeza terceirizada, quando um CLT falta num contrato crítico. Salões, barbearias, esmalterias, pet shops e creches para animais.

Quem realmente usa quase nunca é o dono. É quem está na linha de fogo: o maître, o chefe de salão ou o chefe de cozinha no restaurante (ou o próprio dono, quando é ele quem opera o salão), o gerente de loja ou encarregado de estoque no varejo, o supervisor de turno na logística, o gerente da unidade no salão e no pet shop. O dono aprova o teto de gastos. Quem está na ponta sente o desespero do salão cheio e escolhe a ferramenta mais rápida para resolver em dez minutos. O produto e a comunicação são para essa pessoa.

### O contratante de evento

Buffet, produtora, empresa de staff. Formatura, casamento, corporativo.

O que muda é o volume: uma formatura consome de 20 a 40 profissionais numa noite. E a demanda é planejada, porque o evento foi marcado meses antes, com furos agudos de última hora por cima.

Daí a assimetria que orienta a entrada no mercado. O evento é como se constrói a oferta, o bar fixo é como se ganha frequência. Uma noite de formatura coloca 40 profissionais no mesmo salão, todos trabalhando na sua frente. Nenhum formulário de cadastro produz um banco curado assim. Por isso a entrada é por evento.

---

## Como funciona

**Publicar.** O estabelecimento publica um turno com função, data, hora de início e fim, endereço, valor, número de posições, o que está incluso (refeição, transporte, material próprio) e quem recebe no local. Traje, rateio dos 10% e observações são opcionais. Formato padronizado, poucos campos, publicável pelo celular, porque quem publica está no meio de um problema e não sentado num computador.

**Despacho ativo.** A vaga não fica num mural esperando ser encontrada. Ela é notificada, de uma vez, a quem atende os critérios: tem a função, está disponível naquele horário e está a até 15 km do local. A equipe de confiança do estabelecimento recebe mesmo mais longe. Não há ordem de envio, a notificação não pode ser comprada, e cada profissional recebe no máximo uma a cada 30 minutos, com vagas próximas no tempo agrupadas. O profissional também pode navegar pela lista com todas as vagas do DF, das mais próximas para as mais distantes, mas em urgência quem só procura chega tarde.

**Candidatura.** Direta, sem formulário. Sem carta de apresentação, sem processo seletivo, sem negociação: o valor já está no anúncio. No modo de urgência, o primeiro aprovado leva. Para eventos com mais de 24 horas de antecedência, o estabelecimento vê quem se candidatou e escolhe; se não escolher até 24 horas antes, a vaga fecha sozinha.

**Confirmação.** Os dois lados recebem local, horário, função, valor e um contato, visível até 7 dias depois do fim do turno. A partir daqui existe compromisso registrado, e eles podem falar por e-mail ou WhatsApp.

**O turno.** Lembrete 24 horas e 3 horas antes, check-in e check-out geolocalizados a até 200 metros do endereço, alerta ao contratante se o profissional não chegar em 15 minutos, e suporte por e-mail com prazo de resposta declarado. Os dois lados podem denunciar e bloquear.

**Pagamento.** Combinado diretamente entre as duas partes. O Frila não processa pagamento. A regra (RN09) foi mantida em 01/10/2026.

**Reputação.** Depois do turno, os dois avaliam, e a pergunta não é uma nota de 1 a 5. É binária: você chamaria essa pessoa de novo, você trabalharia nesse local de novo. Nota média com poucas avaliações não informa nada; "sete de sete chamariam de novo" informa. É a pergunta que o maître já faz de cabeça. Só avalia quem trabalhou junto pelo Frila, e só depois de um turno com presença verificada.

**Organizar equipe.** O estabelecimento reúne quem já trabalhou bem por lá, e essas pessoas recebem as vagas da casa mesmo estando longe. Para eventos, monta a escala de uma formatura ou de um casamento com semanas de antecedência, em vez de vaga por vaga.

### Um app, dois perfis

O Frila é um app só, com dois perfis. Cada conta tem um perfil, escolhido no cadastro e fixo; quem quiser usar o outro lado cria outra conta, com outro e-mail. A entrada é por código enviado ao e-mail, sem senha.

O **perfil de profissional** é usado na rua, no intervalo, em Android de entrada, com sinal ruim e plano de dados limitado. Precisa ser leve, funcionar offline para leitura e notificar com confiabilidade.

O **perfil de contratante**, do estabelecimento, tem dois contextos opostos. No celular, sob estresse: são 16h de sexta, faltou gente, o maître está no salão. No computador, planejando: o operador de buffet monta a escala de uma formatura de 40 pessoas duas semanas antes.

O **painel do gestor** fica na versão web do Frila, no perfil de contratante: é onde o gestor acompanha vagas, contratados, check-ins e turnos. Não existe operação manual da equipe Frila; quando um turno não preenche, o contratante recebe o alerta no celular, 3 horas antes do início.

### Os pilares

**Simplicidade.** Vaga publicada com poucos campos e candidatura sem formulário. Cada fricção a mais é um turno que não é preenchido a tempo.

**Confiança.** Reputação binária, taxa de comparecimento como sinal objetivo, avaliação nos dois sentidos, denúncia e bloqueio. É o que substitui o "eu já conheço essa pessoa" por algo que funciona entre desconhecidos.

**Rapidez.** Despacho ativo por proximidade. A vaga vai até quem é elegível, em vez de esperar ser encontrada.

**Organização.** Painel do gestor, múltiplos usuários por estabelecimento, escala de evento em lote. É o que tira a contratação avulsa da memória e da conversa solta.

---

## O que o Frila não é

Esta lista existe para impedir que o escopo volte a inchar.

| Não é | Por quê |
|---|---|
| Um mural de vagas passivo | A vaga existe, mas quem resolve a urgência é o despacho ativo. Currículo e processo seletivo longo não cabem num turno que começa em duas horas |
| Uma plataforma de emprego CLT | Contratação efetiva é outro negócio, com outro ciclo e outro comprador |
| Uma plataforma de trabalho remoto, no MVP | O MVP é só presencial: sem presença não há check-in nem notificação por distância. O remoto entra depois |
| Uma rede social profissional | Não há feed, não há seguidores, não há conteúdo |
| Uma carteira ou um processador de pagamento | O valor do turno é pago direto entre contratante e profissional. A RN09 foi mantida em 01/10/2026 |

---

## O mercado e quem já compete nele

O Distrito Federal tem quase 30 mil estabelecimentos de alimentação e hospedagem, empregando cerca de 100 mil trabalhadores. A margem é apertada: em setembro de 2025, 43% das casas tiveram lucro, 33% ficaram no equilíbrio e 21% no prejuízo. Sensibilidade a preço tende a ser alta.

Um vetor regulatório pode ajudar. A PEC que acaba com a escala 6x1 passou na Câmara em maio de 2026 e na CCJ do Senado em setembro, e prevê transição de 44 para 40 horas semanais. Com dois dias de folga por semana, a cobertura de turno avulso tende a crescer. É inferência, não fato: a PEC ainda pode ser alterada no plenário, e a transição gradual pode diluir o efeito por anos.

A pesquisa de 01/10/2026 estudou 22 apps brasileiros de trabalho avulso e dez referências de fora. **O Distrito Federal não está vazio de concorrência especializada:** a estaff declara, no próprio site, 31 clientes e 6.544 jobs realizados aqui. É dado da empresa, sem vaga aberta no DF, cliente nomeado ou notícia local que o confirme, e a operação dela ainda precisa ser medida em campo. O GetNinjas tem páginas locais de Brasília, mas é generalista e cobra do profissional. Os demais não têm evidência pública no DF. Quem atende o mercado formalmente hoje são agências de evento e de facilities, pelo menos seis, nenhuma com preço público. O Frila vai disputar com o WhatsApp, com essas agências e com um incumbente nacional cuja presença local ainda é uma incógnita.

O preço de referência está escrito. A convenção coletiva vigente no DF, a CCT 2026/2028, fixa o extra de buffet de até 7 horas em R$ 252 fora do estabelecimento e R$ 178 dentro, para garçom, barman e chapeiro, e em R$ 202 e R$ 146 para ajudante e copeiro. Nos anúncios públicos de freela do DF, a diária vai de R$ 100 a R$ 250.

Quatro padrões se repetem entre os concorrentes, e cada um deles diz algo sobre onde há espaço.

**Cadastro não é liquidez.** A Freela Serviços declara 202.743 profissionais cadastrados e 223 contratações concluídas. A estaff declara 1,48 milhão de cadastrados, dos quais 39 mil "experientes". A Worc anunciou mais de 1.400 vagas abertas numa página que, na mesma sessão de navegação, mostrou zero vagas no próprio quadro ao vivo. É o hiato que o despacho ativo tenta fechar, notificando quem é elegível em vez de esperar alguém procurar. Passar o dinheiro pelo app também não resolve sozinho: a Freela Serviços faz isso, e é dela o hiato acima.

**O mecanismo de urgência já está publicado.** O Freelas Now, em São Paulo, avisa todos os disponíveis da região e fecha com o primeiro que aceita em 2 minutos. Tem cerca de 4,3 mil instalações e nenhum número de uso. O diferencial do Frila não é o mecanismo: é ter gente perto e medir comparecimento.

**As piores avaliações vêm de quem trabalha, qualquer que seja o modelo de cobrança.** Pagamento retido na Closeer e na eFreela, quando o contratante não fecha o turno no app, e repasse lento na Switch. Bloqueio de cadastro sem processo justo na estaff. Moeda gasta sem retorno no GetNinjas, onde o profissional paga para desbloquear o contato de um cliente que pode nem responder. A eFreela ainda desconta 10% da diária do freelancer. A aposta do Frila em reputação binária e no valor integral do turno para o profissional, sem comissão descontada, mira esse ponto. Custo zero para o profissional, porém, é requisito do mercado e não diferencial: em 13 dos 22 apps só o contratante paga.

**O setor é mais instável do que a lista sugere.** A Toopa parece ter saído de operação: domínio fora do ar, ficha na App Store retornando 404, nenhuma cobertura de imprensa desde agosto de 2021. A Worc publica três números de tração contraditórios na própria home e tem reputação "Não Recomendada" no Reclame Aqui. A controladora do GetNinjas está sob investigação por infiltração do crime organizado no mercado de capitais e não publica balanço desde 2024. Lá fora, a Qwick pagou acordo de US$ 2,1 milhões por má classificação de trabalhadores; a falência que este documento registrava não se confirmou. Vários concorrentes "estabelecidos" carregam problema sério de execução ou de saúde institucional, o que é mais oportunidade do que ameaça para um entrante regional.

Vale uma nota sobre campanha política: a Freela Serviços já atende esse segmento, com panfletagem, bandeirista, motorista e coordenação. O segmento saiu do radar do produto em 21/09/2026, e a evidência fica registrada como oportunidade futura.

---

## Por que o WhatsApp ainda vence

O WhatsApp está em 98,3% dos smartphones brasileiros e é o principal canal comercial de 82% dos pequenos negócios. Para publicar um turno, ele é imbatível em velocidade e em preço: custo zero, alcance quase universal, nenhuma fricção de cadastro. Existem grupos de freela organizados por cidade, com regras publicadas que tratam só de conduta e nada de pagamento ou comparecimento.

Mesmo com 22 apps já publicados, nenhum deslocou o grupo de WhatsApp. No DF, o trabalho avulso de hospitalidade quase não aparece em canal público: nos portais de vagas locais, só 0,5% a 0,7% dos posts contêm a palavra "freelancer". A inferência é que a demanda corre por contato direto e WhatsApp, o que ainda é hipótese para o campo. Um grupo não promete uma base cadastrada, promete uma vaga publicada agora, vista por quem está no grupo agora. Para quem precisa resolver uma falta em duas horas, isso pesa mais que qualquer número de cadastro. E não há intermediário decidindo quem é escolhido, que é exatamente a fricção que aparece nas avaliações dos concorrentes.

Aqui é onde é mais fácil concluir antes da hora, então vale separar com cuidado. **Não existe nenhuma medida independente de que o WhatsApp funcione mal.** Não encontramos uma única fonte neutra medindo taxa de furo, calote ou insatisfação de quem contrata por grupo. O que existe é conteúdo de fornecedores de software vendendo o contrário do WhatsApp, e uma característica verificável do canal: nada ali garante que alguém apareça ou que alguém pague.

Se a ausência de garantia incomoda o suficiente para alguém trocar de ferramenta, e pagar por isso, é a pergunta que este projeto ainda não respondeu. É a lacuna mais importante de todas.

---

## Decidido, e em aberto

**Já decidido.** Brasília é o primeiro mercado, e não um laboratório: o objetivo não é só validar, é dominar o DF antes de sair dele. O app iOS nativo, em Swift/SwiftUI, é requisito fechado, e o Android também será nativo, em Kotlin, com as regras críticas no backend (Supabase), escritas uma vez para as três versões. Para a entrega na loja em 13/11, o iOS é o mínimo. Android não pode ficar para depois, porque é a plataforma de cerca de 75% do uso de celular no Brasil (75,45%, StatCounter, ago/2026), e lançar só em iOS excluiria a maior parte do lado da oferta. Haverá também versão web para as duas personas.

O nome também é uma decisão. "Frila" nomeia a unidade de trabalho, o turno avulso, e não o setor. Isso não trava o produto em nenhum nicho e sobrevive a qualquer expansão de escopo ou de país.

**Decidido em 01/10/2026.** O pagamento do turno continua por fora do app: a RN09 está mantida. Quem paga o Frila é o contratante, nunca o profissional. A direção de cobrança recomendada pela pesquisa é um valor fixo por posição preenchida com presença verificada, mais uma assinatura pela gestão da equipe de confiança.

**Em aberto.** Quanto cobrar por posição e pela assinatura: nenhum número foi fixado, e o preço se define no piloto. E se, e como, atender o contratante que exigir vínculo formal: a parceria com uma agência de trabalho temporário é questão registrada, sem decisão. Fica registrado também o que o projeto afirma sem prova:

- Que a falta acontece com frequência suficiente para sustentar um negócio
- Que há profissional disponível numa sexta à noite, no bairro certo, com duas horas de antecedência
- Que o estabelecimento paga a mais pela urgência, e quanto
- Que o profissional aceita um chamado em menos de 30 minutos com frequência útil
- Que o maître, e não o dono, é quem decide
- Que a desintermediação, contratar direto na segunda vez, é administrável
- Que o pagamento por fora do app se sustenta sem calote ou atraso relevante
- Quanto o contratante do DF aceita pagar, e se prefere valor fixo, percentual ou assinatura

A segunda dessas hipóteses é o que sobrou de uma tese antiga do projeto, de que o profissional seria o lado escasso do mercado. A pesquisa desfez a versão ampla dessa tese: quem é escasso é o candidato a vaga fixa, porque a diária avulsa paga mais que o dia de CLT e 61% dos empresários reclamam de não ter interessados. Para turno avulso sobra gente, e o que falta é confiança verificável. O que ninguém mediu é o instante da urgência, num bairro específico, com duas horas de antecedência. Abundância no agregado não é abundância na hora.

**Estado atual.** Cinco sócios: Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi e Matheus Silva. Em 22/09 o projeto estava em TRL 2, com o conceito formulado; desde então há código, o backend no Supabase e o app iOS, com builds internos no TestFlight, testados em ambiente de desenvolvimento. Nenhuma validação de campo feita, receita zero.

**O próximo passo** é validação de campo: 50 conversas. Sem isso, todo número deste projeto é hipótese. A medida mais barata disponível hoje é entrar nos grupos de WhatsApp de freela do DF e contar quantas vagas aparecem por dia, de que funções, com que antecedência, a que valores, e quantas são reabertas por falta de resposta.

As perguntas que só campo responde estão listadas em [[01 - CBL/Desafios/C18/Documentos de Produto/EVIDENCIAS|EVIDENCIAS.md]], junto com tudo que sustenta os números deste documento.

Um documento de estratégia que continua igual depois de cinquenta conversas com clientes é um documento que ninguém usou. A expectativa é que parte destes números esteja errada.

---

## Onde aprofundar

Este documento resume. Cada seção tem um documento detalhado por trás, e é lá que mora a profundidade.

| Seção daqui | Documento detalhado |
|---|---|
| O problema | [[01 - CBL/Desafios/C18/Documentos de Produto/01-O-PROBLEMA\|`01-O-PROBLEMA.md`]], com cada afirmação separada entre dado, relato e hipótese |
| Para quem é, o que o Frila não é, e como pretende cobrar e crescer | [[01 - CBL/Desafios/C18/Documentos de Produto/02-O-NEGOCIO\|`02-O-NEGOCIO.md`]], o documento de referência para apresentar o projeto |
| Como funciona, os dois perfis do app, os pilares | [[01 - CBL/Desafios/C18/Documentos de Produto/03-ESPECIFICACAO-DO-PRODUTO\|`03-ESPECIFICACAO-DO-PRODUTO.md`]] |
| O mercado, a concorrência, por que o WhatsApp vence | [[01 - CBL/Desafios/C18/Documentos de Produto/04-MERCADO-E-CONCORRENCIA\|`04-MERCADO-E-CONCORRENCIA.md`]], com dossiê de cada concorrente, padrões de modelo de negócio e recomendação por fase |
| A pesquisa de 01/10/2026: 22 concorrentes, o DF, referências globais | [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Pesquisa_de_Concorrentes_2026-10-01\|Relatório consolidado]] e as fichas em [`pesquisa/concorrentes/analises/`](https://github.com/FrilaApp/frila-docs/blob/main/pesquisa/concorrentes/analises) |
| Tese e estado do projeto | [[01 - CBL/Desafios/C18/Documentos de Produto/00-LEIA-PRIMEIRO\|`00-LEIA-PRIMEIRO.md`]] |
| O que entra em cada versão, sprints e o quadro do Trello | [[01 - CBL/Desafios/C18/Documentos de Produto/05-ESCOPO-DO-MVP\|`05-ESCOPO-DO-MVP.md`]] |

Onde este resumo divergir do documento detalhado, o detalhado vale, porque é onde cada número carrega sua marca de origem.

---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
