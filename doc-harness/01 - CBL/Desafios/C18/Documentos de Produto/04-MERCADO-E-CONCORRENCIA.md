---
tipo: documento-produto
desafio: C18
data_criacao: 2026-09-15
origem: "Frila/Documentos/MD/04-MERCADO-E-CONCORRENCIA.md"
tags: [produto, frila]
data_atualizacao: 2026-10-01
---

# Frila — Mercado e Concorrência

**Versão 1.2 · 1º de outubro de 2026**

Como o mercado de trabalho avulso em food service, eventos e campanha política funciona hoje, quem já compete nele, e por que grupo de WhatsApp ainda é o canal dominante apesar dos concorrentes existirem.

> **Campanha política saiu do radar do produto em 21/09/2026.** A evidência fica registrada como oportunidade futura.

Convenções: `[H]` = hipótese ou estimativa, nunca confirmada em campo. Números de tração de concorrentes são **o que cada empresa declara** — nenhum foi auditado, salvo quando sinalizado o contrário. Pesquisa original feita em 2026-09-10, aprofundada em setembro/2026. A varredura da App Store de 23/09/2026 acrescentou oito fichas, lidas só na loja naquele dia.

**Revisão de 01/10/2026.** Esta versão incorpora a [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Pesquisa_de_Concorrentes_2026-10-01|pesquisa de concorrentes e de modelo de negócio de 01/10/2026]]: 22 fichas, dois painéis, o mapa da concorrência no DF, as referências globais e o estudo de modelo de negócio, todos em [`pesquisa/concorrentes/analises/`](https://github.com/FrilaApp/frila-docs/blob/main/pesquisa/concorrentes/analises). O que vem dela está marcado como **pesquisa de 01/10** e aponta para o documento de origem. Nenhum agente abriu os apps: tudo é leitura de fonte pública. Worc, Toopa e 7shifts não entraram na pesquisa e seguem com o registro de 14/09.

**O que mudou na versão 1.2:**

- **O DF não está vazio de concorrência especializada.** A estaff declara 31 clientes e 6.544 jobs no DF. Não há vaga aberta nem cliente nomeado, e quem atende o mercado formalmente são agências de evento sem preço público (seções 1, 3 e 7).
- **O despacho com "primeiro que aceita leva" não é inédito.** O Freelas Now já faz isso em São Paulo (seções 1, 4 e 7).
- **A eFreela cobra 10% do freelancer**, não do contratante. A **Closeer** cobra na recarga de uma carteira pré-paga. Os números de **estaff** e **Switch** foram reconciliados (seções 3 e 4).
- **A falência da Qwick não se confirmou** (seção 5).
- **A convenção coletiva vigente no DF é a CCT 2026/2028**, com tabela nova de extra de buffet (seção 2.4).
- A tabela da seção 3 passou a ter os **22 apps** pesquisados; a seção 5 resume **dez referências globais**; as seções 8 e 9 são novas e trazem os **padrões de modelo de negócio**, a **recomendação por fase** e as **decisões do Cauê de 01/10/2026**.

Este é o documento de origem da pesquisa de mercado e concorrência. As avaliações de quem trabalha nesses aplicativos estão transcritas em `01-O-PROBLEMA.md` §3.1, o que o Frila propõe em resposta está em `02-O-NEGOCIO.md` e `03-ESPECIFICACAO-DO-PRODUTO.md`, e a versão resumida de tudo, em `README.md`.

---

## 1. Resumo

O Distrito Federal **não está vazio** de concorrência especializada, ao contrário do que as versões anteriores deste documento afirmavam. A estaff declara, no endpoint que alimenta o mapa do próprio site, 5.197 profissionais, 31 clientes e 6.544 jobs realizados no DF — dado da empresa, não auditado e sem período informado. Fora o contador, não há rastro público dessa operação: nenhuma das 43 vagas fixas publicadas no site em 01/10 é no DF, não há cliente nomeado nem notícia local, e o verificador de cidade só reconhece "Brasília". Os turnos de freela dela só aparecem dentro do app, que ninguém abriu. As duas coisas são verdade ao mesmo tempo, e confirmar a operação é tarefa de campo. Dos outros 21 apps pesquisados, o GetNinjas tem páginas locais de Brasília, mas é generalista e cobra do profissional; o 99Freelas está no DF só em projetos digitais; os demais não têm evidência pública aqui. Quem atende o DF formalmente hoje são **agências de evento e de facilities** — pelo menos seis, nenhuma com preço público — e canais que não aparecem em portal de vagas ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|mapa do DF]]; [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-df-e-lojas|painel]]).

O padrão mais forte que se repete entre praticamente todos os concorrentes pesquisados não é falta de usuários cadastrados — é a desproporção entre cadastro e liquidez real. A Freela Serviços declara 202.743 profissionais cadastrados, 412 contratantes e apenas 223 contratações concluídas. A estaff declara 1.483.918 cadastrados, dos quais 39.317 "experientes". A Worc chegou a anunciar mais de 1.400 vagas abertas numa página de marketing que, na mesma sessão, mostrou zero vagas no próprio quadro ao vivo. Cadastro não é liquidez — e é exatamente esse hiato que o despacho ativo do Frila tenta fechar, notificando quem é elegível em vez de esperar alguém procurar. A pesquisa de 01/10 acrescenta um segundo aviso: **passar o dinheiro pelo app também não cria liquidez sozinho**. A Freela Serviços tem pagamento no app, seguro e tabela pública, e é dela o hiato acima.

**O mecanismo de urgência do Frila já está publicado.** As oito fichas da varredura de 23/09 viraram fichas completas, e a do **Freelas Now** mostra o modo urgência inteiro: na vaga aberta, "todos os profissionais qualificados e disponíveis na sua região recebem a notificação ao mesmo tempo. O primeiro a aceitar em até 2 minutos é contratado", com o valor em custódia pelo Mercado Pago. Ele só opera em São Paulo capital e tem cerca de 4,3 mil instalações, sem nenhum número de uso. O recado é duplo: o mecanismo não é diferencial por si, e mecanismo sem rede local não preenche turno. A vantagem do Frila tem de ser **densidade e comparecimento medido**.

Do lado de quem trabalha, a queixa se repete de empresa para empresa, independente do modelo de cobrança: bloqueio de cadastro sem explicação (estaff), pagamento retido quando o contratante não abre ou não fecha o turno no app (Closeer, eFreela), saque que não cai (eFreela), moeda gasta sem retorno (GetNinjas) e candidatura sem resposta ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-reclame-aqui|painel do Reclame Aqui]]). A instabilidade institucional do setor também é maior do que a superfície sugere: a Toopa parece ter saído do mercado, e o controlador do GetNinjas está sob investigação por infiltração do crime organizado no mercado de capitais, sem publicar balanço desde 2024 (registros de 14/09, não revistos em 01/10). Um mercado com vários concorrentes "estabelecidos" pode, na prática, estar mais aberto do que parece.

---

## 2. O mercado

### 2.1. Tamanho

| Dado | Valor | Fonte |
|---|---|---|
| Estabelecimentos de alimentação e hospedagem no DF | quase **30 mil** | Abrasel-DF, via Correio Braziliense (05/2026) |
| Trabalhadores nesses estabelecimentos no DF | cerca de **100 mil** | idem |
| Base representada pelo Sindhobar-DF | 14 mil estabelecimentos | idem |
| Estabelecimentos de alimentação com CNPJ ativo no Brasil | cerca de **1,5 milhão** | Receita Federal até 2024, via OndeAbrir — **fonte secundária** |
| Faturamento do setor de alimentação fora do lar, 2025 | R$ 495 bilhões | Abrasel |

Sem um modelo de cobrança validado, não há base para estimar TAM/SAM/SOM em reais — essa conta depende de um preço que ainda não existe. O que se pode afirmar hoje é só o tamanho do universo de contratantes potenciais no DF: por volta de 30 mil estabelecimentos, empregando cerca de 100 mil pessoas. Quantos desses efetivamente usam trabalho avulso com regularidade é uma lacuna — a única pesquisa encontrada sobre isso é da própria Closeer (64,58% dos respondentes, fim de 2021, amostra e método desconhecidos — fonte interessada pesquisando o próprio mercado).

### 2.2. A dor, em números

- **Rotatividade de 73,49%** entre dez/2024 e nov/2025 — como se cada bar ou restaurante trocasse a equipe inteira a cada 16 meses (Abrasel; a página primária bloqueou acesso automatizado, dado confirmado pelo Monitor Mercantil).
- **Margem apertada no DF:** 43% dos estabelecimentos tiveram lucro, 33% ficaram no equilíbrio, 21% no prejuízo; 40% relatam inadimplência de clientes (Abrasel-DF, via Correio Braziliense, 09/2025). Leitura: sensibilidade a preço tende a ser alta.

### 2.3. Vetor regulatório a favor: fim da escala 6x1

A PEC 221/2019 foi aprovada na Câmara em 27/05/2026 (472 × 22 no primeiro turno) e na CCJ do Senado em 02/09/2026; falta o plenário do Senado. O texto prevê transição gradual de 44 para 40 horas semanais. A CNC estima alta de quase 20% na folha se houver contratação adicional; a Abrasel-DF projeta repasse de até 8% no cardápio.

**Inferência, não fato:** com dois dias de folga por semana, a cobertura de turno avulso tende a crescer — mais buracos de escala para tapar sem aumentar o quadro fixo. Modo de falha: a PEC pode ser alterada ou barrada no Senado, e a transição gradual pode diluir o efeito por anos.

### 2.4. Preço de referência no DF *(pesquisa de 01/10)*

**A convenção coletiva vigente é a CCT 2026/2028** entre Sindhobar e SECHOSC-DF, registro no MTE **DF000380/2026**, de 19/06/2026, com vigência de 01/05/2026 a 30/04/2028. A CCT 2024/2026 e o aditivo 2025/2026, citados pela varredura de 20/09, venceram em 30/04/2026. **Dado**, conferido no PDF publicado pelo Sindhobar ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|mapa do DF]], seção 4.1).

- **Piso:** R$ 1.750,68 para 220 horas mensais.
- **Extra de buffet**, por serviço de até 7 horas, com refeição gratuita assegurada e hora além da 7ª com acréscimo de 50%:

| Função | Fora do estabelecimento | Dentro do estabelecimento |
|---|---|---|
| Maître e chefe de cozinha | R$ 375 | R$ 265 |
| Churrasqueiro e cozinheiro | R$ 305 | R$ 220 |
| Garçom, barman e chapeiro | **R$ 252** | **R$ 178** |
| Ajudante de cozinha, de bar e copeiro | **R$ 202** | **R$ 146** |

**Como ler.** A tabela é a referência normativa do extra de buffet no DF, não um piso geral de diária para qualquer freela de bar.

**Diária anunciada.** Numa amostra de 22 anúncios de freela do DF, de julho a setembro de 2026, a diária vai de R$ 100 a R$ 250; 10 dos 16 anúncios que informam o valor ficam entre R$ 150 e R$ 190, e o garçom aparece entre R$ 150 e R$ 220. Por hora, isso dá de R$ 11,76 a R$ 35,00, abaixo dos R$ 36,00 por hora da tabela de buffet para o garçom fora do estabelecimento ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|mapa do DF]], seção 4.2). O preço de diária praticado além dessa amostra segue como pergunta de campo.

### 2.5. O que o DF diz da própria dor *(pesquisa de 01/10)*

- **Falta de gente:** "a mão de obra não existe mais em Brasília, acabou", disse o presidente do Sindhobar em setembro de 2026. **Relato** de fonte interessada.
- **Medo trabalhista:** em pesquisa nacional da Abrasel (março/2025), 90% dos empresários acham difícil contratar e 56% temem problemas com o trabalho de extras e eventuais, a principal preocupação trabalhista do setor.
- **Transporte noturno:** o metrô do DF fecha às 23h30 de segunda a sábado, e metade das vagas de tarde e noite da amostra com hora de fim informada termina depois disso.

A frequência da falta de última hora e o tamanho do mercado informal continuam **sem fonte pública** ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|mapa do DF]], seções 5 e 6).

---

## 3. Panorama competitivo

Os 22 apps da pesquisa de 01/10, na ordem dos grupos. Notas das lojas, reputação no Reclame Aqui (RA) e presença no DF são de 01/10/2026, dos dois painéis. O detalhe de cada linha está na ficha do app, em [`pesquisa/concorrentes/analises/`](https://github.com/FrilaApp/frila-docs/blob/main/pesquisa/concorrentes/analises).

| Concorrente | Foco | Como cobra | Tração declarada (não auditado) | Presença no DF | Nota agregada |
|---|---|---|---|---|---|
| **Closeer** | Food service, hotelaria, varejo, cozinha industrial, eventos; também vaga fixa | Contratante: **taxa na recarga de uma carteira pré-paga**, mais mensalidade no plano inicial (valores não públicos). Parceria com a Abrasel: mensalidade grátis e 50% na primeira taxa de recarga | 1,1 mi de jobs, 670 mil cadastrados, 6 mil unidades, R$ 150 mi pagos a profissionais | Sem evidência pública | App Store 4,2 (641) · Google Play 4,6 (6,76 mil) · RA 8,5 |
| **estaff** | Bares, restaurantes, buffets, eventos, hotéis — modelo dual freela + CLT | Comissão do contratante, com "planos e condições distintas" (não pública); grátis para o profissional | 1.483.918 cadastrados, dos quais 524.519 "disponíveis" e 39.317 "experientes"; 998 mil jobs; 1.515 clientes; R$ 128,9 mi repassados | **Declarada pela empresa:** 5.197 profissionais, 31 clientes e 6.544 jobs. Nenhuma vaga fixa aberta no DF | App Store 3,1 (561) · Google Play 4,4 (5,32 mil) · RA 6,8 |
| **eFreela** | Bares, restaurantes, hotéis, eventos; hoje se vende como "sistema para gestão de freelancers" | **10% retidos do freelancer**; 3% por depósito do contratante; plano PRO e software de gestão (preço não público) | "Mais de 300 mil freelancers" e "mais de 100 mil serviços" | Sem evidência pública — GO, MG, SP, RJ, MA, AL | App Store 4,6 (1.524) · Google Play 4,6 (2,41 mil) · RA 6,7 |
| **Switch** | Bares, restaurantes, hotéis, supermercados; também recrutamento fixo | Contratante paga hora tabelada, com a margem embutida (tabela não pública); +10% com menos de 24 h; 1 hora por cancelamento tardio; 50% do salário-base na efetivação | 75 mil serviços, 30 mil profissionais e 1.200 empresas na home; 80 mil no blog. Contadores parados desde 2023 e 2025 | Sem evidência pública — Grande Vitória, SP, BH, Rio | App Store 4,8 (2.170) · Google Play 4,7 (6,54 mil) · RA "Não recomendada" |
| **Bravo Eventos** | Staff de eventos — app de recrutamento de uma agência | Produtora paga a agência, por cotação (não público); a agência paga o profissional por fora do app | Não publica; cerca de 208 mil instalações no Android | Sem evidência pública — São Paulo | App Store 2,5 (66) · Google Play 2,5 (181) · RA "Não recomendada" |
| **Fiverr** | Freelance digital 100% remoto — referência de modelo, não concorrente direto | 20% do vendedor; 5,5% do comprador; assinatura Seller Plus de US$ 25 e US$ 49 por mês | 2T26: US$ 97,8 mi de receita e 2,7 mi de compradores anuais | Não aplicável (remoto) | App Store 4,8 (3.286) · Google Play 3,1 (361 mil) |
| **99Freelas** | Projetos digitais remotos — referência de modelo | Intermediação de 10% a 20% (mínimo R$ 5) e assinatura do profissional; o preço do plano muda conforme o canal | +3 mi de freelancers e +130 mil projetos, cumulativos | Só projetos digitais; sem turnos | App Store 1,1 (8) · Google Play 2,5 (967) · RA 7,7 |
| **GetNinjas** | Serviços gerais — não especializado | Profissional compra "moedas" para desbloquear o contato; contratante não paga | +2 milhões de profissionais, +3 mil cidades (registro de 14/09). Prospecto: 112 mil profissionais ativos e 4,2 mi de pedidos em 2020 | **Confirmada** — páginas locais ativas em Brasília, inclusive eventos | App Store 4,2 (16,8 mil) · Google Play 3,7 (182 mil) · RA 8,5 |
| **TradePRO Freelance** | Trade marketing no varejo — adjacente | A empresa paga o trabalho; a cobrança da plataforma não é pública; exige MEI do promotor | Não divulgada | Indícios genéricos; sem vaga de hospitalidade | App Store 3,1 (21) · Google Play 2,9 (135) |
| **Freelancer** (na loja, "Hire & Find Jobs") | Projetos remotos, global — referência de modelo | 10% do trabalhador (mínimo US$ 5) e 3% do cliente (mínimo US$ 3); assinaturas | Receita de A$ 53,2 mi em 2025 (grupo, inclui pagamentos) | Não aplicável (remoto) | App Store 4,3 (181) · Google Play 3,8 (73,3 mil) |
| **UmFreela** | Gastronomia, hotelaria e eventos | Contratante: R$ 3,99 por vaga concluída, a primeira grátis; ou R$ 34,90 por mês mais R$ 1,49 por vaga. Pagamento do turno por fora | 100+ downloads | Indícios genéricos ("todo o Brasil"); operação no RS | App Store 4,3 (6) · Google Play sem nota |
| **StaffPRO** | Staff de eventos para produtoras; MEI obrigatório | Cotação por evento (não público); repasse em 5 a 15 dias úteis | +6.000 eventos, +35 mil diárias, +32 mil freelancers, R$ 6 mi em serviços prestados (não é faturamento) | Indícios genéricos; SP e RJ | App Store 3,1 (17) · Google Play 3,1 (153) |
| **Staff BR** | Estádios e, desde 2025, hospitalidade — da Futebolcard | Percentual por vaga preenchida e concluída; falta não é faturada (percentual não público) | 98% de comparecimento e 11 minutos até o primeiro aceite | Indícios: a Futebolcard opera jogos no Mané Garrincha; sem chamada pública de bar ou evento | App Store 4,4 (7) · Google Play 4,2 (13) |
| **Freelas Eventos** | Eventos no interior de SP | Sem cobrança hoje; pagamento por fora | 1 mil+ downloads | Sem evidência pública | App Store 3,7 (3) · Google Play sem nota |
| **Lan Up** | SaaS de ponto, escala e pagamento para terceirizadas; nasceu como banco de freelas | R$ 200 a R$ 2.000 por mês, mais módulos | 50 mil+ downloads | Sem evidência pública | App Store 3,8 (30) · Google Play 3,2 (202) |
| **Bicos** | Serviço doméstico e pequenos reparos — adjacente | Não divulgado; pagamento no cartão, retido até o cliente confirmar | 1 mil+ downloads | Sem evidência pública | Sem nota nas duas lojas |
| **BIKO** | Eventos, hospitalidade, logística | Contratante: diária mais percentual "negociado" (não publicado), com créditos pré-pagos | 1 mil+ downloads | Sem evidência pública | App Store 4,3 (4) · Google Play 3,5 (50) |
| **Trampei Serviços** | Serviços em geral — adjacente | Assinatura do profissional (R$ 29,90) e da empresa (R$ 99,90) | 5 mil+ downloads | Sem evidência pública | App Store 4,0 (2) · Google Play 3,2 (16) |
| **JobHunter** | Classificados de bicos; fecha no WhatsApp | Gratuito para os dois lados; receita de anúncio | 52 mil cadastrados em 240+ cidades (eram cerca de 33 mil em 14/09) | Indícios genéricos; mais forte em Uberlândia e Goiânia | App Store sem avaliação · Google Play 4,3 (164) |
| **Meu Freelance** | Trabalho avulso, sem segmento declarado | Não encontrado | 1 mil+ downloads; sinais de abandono | Sem evidência pública | App Store sem avaliação · Google Play 1,5 (6) |
| **Freela Serviços** | Eventos, bares, festas; em 2026, também fretes, entregas, vaga CLT e **campanha política** | Mensalidade de R$ 0, R$ 49,90, R$ 299,90 ou R$ 499, mais taxa de 20%, 20%, 15% ou 10% por vaga. As perguntas frequentes do mesmo site dizem "sem taxa e sem mensalidade" | 202.743 profissionais, 412 contratantes e **223 contratações** | Indícios genéricos ("todo o Brasil") | App Store 3,8 (16) · Google Play 3,5 (45) |
| **Freelas Now** | Bares e restaurantes — urgência, "pra agora"; só São Paulo capital | Contratante: 12% da diária (10% no Premium de R$ 29,90 por mês) pelos termos; as lojas dizem 10% e 8%. O freelancer paga 5% se quiser receber na hora | Não divulgada; cerca de 4,3 mil instalações | Sem evidência pública — lista de espera fora de SP | App Store 5,0 (4) · Google Play sem nota |

Fontes da tabela: [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-df-e-lojas|painel de lojas e DF]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-reclame-aqui|painel do Reclame Aqui]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/estudo-modelo-de-negocio-e-features|estudo de modelo de negócio]], seção 1.

**Fora da pesquisa de 01/10** (registro de 14/09/2026, não revisto):

| Concorrente | Foco | Como cobra | Tração declarada (não auditado) | Presença no DF | Nota agregada |
|---|---|---|---|---|---|
| **Worc** | Recrutamento/gestão de mão de obra para foodservice (B2B) | Assinatura mensal/trimestral do contratante; grátis para o candidato | 3 números diferentes na própria home (40 mil / 2 mi / 5 mi+ "oportunidades") | Não verificado | Reclame Aqui 4,3/10 — "Não Recomendada" |
| **Toopa** | Bares, restaurantes, hotéis, eventos | 10% do contratante, sem mensalidade | 500+ estabelecimentos, 2 mil candidatos (dado de 2021) | Tinha o DF no roadmap de 2021, nunca confirmado — empresa provavelmente **inativa em 2026** | Sem reviews localizadas em nenhuma fonte |

**Sobre a loja.** A tabela de `01-O-PROBLEMA.md` §3.1 mede parte desses aplicativos em outra data, e por isso os números diferem. No Brasil o Android concentra muito mais avaliação: a Closeer tem 6,76 mil avaliações no Google Play contra 641 na App Store. **Toda nota só significa alguma coisa junto com a loja e a data.** E nota alta em loja convive com reputação ruim no Reclame Aqui: a Switch tem 4,8 na App Store e "Não recomendada" no RA.

**Quem atende o DF hoje** *(pesquisa de 01/10)*:

| Quem | O que se sabe com fonte |
|---|---|
| **Os 22 apps** | Só a **estaff** declara operação no DF: 31 clientes e 6.544 jobs no contador do próprio site, sem período informado. Não há vaga aberta no DF, cliente nomeado nem notícia local. O GetNinjas tem página de garçons em Brasília. O 99Freelas está no DF só em projetos digitais. Os demais não têm evidência pública |
| **Agências de evento e de facilities** | Pelo menos seis: Way, M3F, Green House, Mary Help (três unidades), Garçom Classe A e 61 Eventos (esta sem garçom). **Nenhuma publica preço**; o atendimento é por orçamento |
| **Agências de RH nos portais** | A Gi Group anunciou 100 vagas de "Garçom - Brasília na modalidade eventual"; outras recrutadoras publicam freela de restaurante "na diária" |
| **Portais de vagas** | Anúncio de freela é raro: só 0,7% dos posts do Brasília Empregos e 0,5% dos do Hora do Emprego DF, de julho a setembro, contêm a palavra "freelancer", em qualquer setor. **Inferência:** a demanda corre por outros canais, provavelmente WhatsApp e indicação — hipótese para o campo, não fato |

Fonte: [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|mapa da concorrência real no DF]], com 77 fontes abertas uma a uma.

---

## 4. Concorrentes — perfis

Cada perfil abaixo resume a ficha de 01/10/2026 do mesmo nome em [`pesquisa/concorrentes/analises/`](https://github.com/FrilaApp/frila-docs/blob/main/pesquisa/concorrentes/analises), que traz as fontes numeradas. O que ficou do registro de 14/09 está sinalizado.

### GetNinjas

O único concorrente com página local pública no Distrito Federal: `getninjas.com.br/local/df/brasilia` e `/eventos/df/brasilia` estão no ar, com categorias como garçom, bartender, segurança e DJ listadas para Brasília. **Dado**, verificado por acesso direto em 14/09/2026 e de novo em 01/10. Quantos serviços são de fato executados no DF não tem fonte pública.

Não é especializado em food service ou eventos — é um marketplace geral de serviços (reforma, aulas, beleza, tecnologia, e também eventos). Contratante não paga nada; profissional paga por um sistema de moedas pré-pagas para desbloquear o contato de cada pedido. A plataforma não cobra comissão sobre o valor do serviço fechado e não processa o pagamento do trabalho. O registro de 14/09 trazia 1 moeda = R$ 0,15 e pacotes de R$ 149 a R$ 599; a ficha de 01/10 não encontrou tabela pública vigente: o preço é dinâmico, e as moedas valem três meses.

**Como o modelo mudou:** nasceu em 2011 vendendo assinatura que dava um volume de pedidos; em 2016 trocou por moedas por contato escolhido. A empresa declarou breakeven em 2019, mas a demonstração financeira enviada à CVM mostra prejuízo de R$ 3,0 milhões naquele ano; o único lucro líquido da série, em 2023, veio dos juros do caixa do IPO ([pesquisa de monetização](https://github.com/FrilaApp/frila-docs/blob/main/pesquisa/modelo-de-negocio/monetizacao-e-precos-de-referencia.md), seção 1.5).

**Tração declarada:** +2 milhões de profissionais cadastrados, +3 mil cidades — não auditado (registro de 14/09). O prospecto do IPO falava em 112 mil profissionais ativos e 4,2 milhões de pedidos em 2020, dado histórico.

**Pontos fortes:** volume de avaliação muito maior que qualquer outro concorrente pesquisado (App Store 16,8 mil avaliações, 4,2/5; Google Play 182 mil, 3,7/5). No Reclame Aqui, nota 8,5 nos últimos seis meses e 8,8 no geral, com selo RA1000; 99,2% das reclamações respondidas.

**Pontos fracos — o sistema de moedas é a queixa dominante de quem trabalha.** São 16.538 reclamações no Reclame Aqui, 1.672 nos últimos seis meses, quase todas de profissionais que pagaram por contato. **Relato**: "coloquei quase R$ 500 em moedas e todos os clientes que peguei nenhum responde" (reclamação no Reclame Aqui, 2026). O cliente pode receber propostas de até 4 profissionais ao mesmo tempo — todos gastam moeda, só um fecha. Uma crítica jornalística independente chama o modelo de "leilão digital de trabalho humano" (Outras Palavras/DMT em Debate — texto bloqueado para leitura direta, título via busca). É o único dos 22 que cobra apenas do profissional.

**Risco institucional, fora do produto** (registro de 14/09, não revisto em 01/10): a controladora, Reag Investimentos, é um dos alvos da "Operação Carbono Oculto" — investigação de infiltração do crime organizado no mercado de capitais — e anunciou a venda do próprio controle acionário. Valor de mercado caiu de R$550 milhões (IPO 2021) para a faixa de R$250 milhões, sem publicar balanço desde o 3T24. **Dado** (Money Times, InvestNews, Times Brasil, acesso 14/09/2026).

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/getninjas|GetNinjas]] (01/10/2026) · [getninjas.com.br — Brasília](https://www.getninjas.com.br/local/df/brasilia) · [getninjas.com.br — eventos DF](https://www.getninjas.com.br/eventos/df/brasilia) · [App Store](https://apps.apple.com/br/app/getninjas-para-profissional/id969564418) · [Google Play](https://play.google.com/store/apps/details?id=br.com.getninjas.pro) · [Money Times — Reag Invest](https://www.moneytimes.com.br/getninjas-ninj3-trocara-de-nome-para-reag-invest-empresa-ganhara-novo-ticker-rnda/) · [Times Brasil — venda de controle da Reag](https://timesbrasil.com.br/brasil/reag-investimentos-tratativas-venda-controle/) · [InvestNews — crise Reag](https://investnews.com.br/negocios/getninjas-crise-reag-aquisicao/).

### Switch

Marketplace de bares, restaurantes, hotéis e supermercados, nascido em 2018 em Vitória/ES. **Operou três anos por WhatsApp e planilha antes de ter app**: o produto foi escrito em 2021, depois de 25 mil serviços. Contratante paga por hora conforme a função, sem mensalidade, com a margem da plataforma embutida no preço — mais sobretaxas: 10% extra para pedidos com menos de 24h de antecedência, o valor de 1 hora no cancelamento tardio, e 50% do salário-base se efetivar o profissional. O profissional recebe às quintas-feiras, pelos serviços da semana anterior. **Dado**, termos de uso.

**A contradição de tração, reconciliada.** Os números diferentes de "serviços atendidos" que este documento apontava são **contadores de anos diferentes que ficaram no ar**: 40 mil em 2022, 60 mil em 2023, 75 mil em 2025. Em outubro de 2026 a home ainda diz 75 mil serviços, 30 mil profissionais e 1.200 empresas, e o blog fala em 80 mil. Não é fraude de número; é contador parado. Trate como piso de marketing.

**Presença no DF:** sem evidência pública — as páginas oficiais citam sempre as mesmas 4 praças (Grande Vitória, São Paulo, Belo Horizonte, Rio de Janeiro). Ficou quatro anos só na Grande Vitória antes de abrir a segunda.

**Pontos fortes:** nota 4,8/5 na App Store (2.170 avaliações) e 4,7 no Google Play (6,54 mil) do lado do profissional — as notas agregadas mais altas do grupo. Treinamento obrigatório e preço de urgência escritos em contrato.

**Pontos fracos:** a nota alta convive com queixa de remuneração baixa e de repasse lento. **Relato** (App Store): "turno de R$100 vira ~R$73" (01/02/2022); "turno de 6h por R$60–70. Vale só se passando fome" (02/12/2025). **No Reclame Aqui a reputação é "Não recomendada":** 14 reclamações e 1 resposta nos últimos seis meses; nota 4,2 em três anos, com 47 reclamações. As queixas incluem valor não devolvido ao contratante e desvio de função. Não há registro de presença no local: a falta é informada pelo estabelecimento.

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/switch-profissionais|Switch Profissionais]] (01/10/2026) · [switchapp.com.br](https://switchapp.com.br/) · [switchapp.com.br/sobre](https://switchapp.com.br/sobre/) · [switchapp.com.br/termos-clientes](https://switchapp.com.br/termos-clientes/) · [App Store — profissionais](https://apps.apple.com/br/app/switch-profissionais/id1563290269) · [App Store — estabelecimentos](https://apps.apple.com/br/app/switch-estabelecimentos/id1563022915).

### Closeer

Plataforma de gestão e pagamento de mão de obra freelancer operacional (cozinha, restaurante, hotel, bar, eventos, varejo, cozinha industrial). O contratante **deposita numa carteira pré-paga**, cria o job, e a plataforma o oferece em cascata: se o primeiro profissional recusa ou não confirma, a oferta passa ao próximo. Início e fim do trabalho são registrados por QR Code, e o valor vai para a carteira digital do profissional ao fim do job.

**Como cobra, corrigido.** Não é "percentual por job": a taxa incide **na recarga da carteira**, e há mensalidade no plano inicial. Os valores não são públicos; a página da parceria com a Abrasel oferece "Mensalidade 100% Grátis" e "50% OFF na Taxa de Recarga".

**Como o modelo mudou:** lançou em dezembro de 2018, grátis por seis meses para os dois lados; o plano era cobrar depois 10% por job **do profissional** mais mensalidade do contratante. Em 2021 só o contratante pagava. Em 2024 se reposicionou como plataforma de gestão; em 2025 acrescentou vaga fixa. **Dado** (Gazeta do Povo, 14/12/2018; Projeto Draft, 07/06/2021; ficha de 01/10).

**Tração declarada:** 1,1 milhão de jobs, R$150 milhões pagos a profissionais, 670 mil cadastrados, 6 mil unidades de negócio, "+350 cidades" — não auditado. O valor pago a profissionais é repasse, não receita da Closeer.

**Presença no DF:** sem evidência pública. Em janeiro de 2019 a empresa disse que queria chegar a Brasília em 2020; não há registro de que chegou.

**Pontos fortes:** reputação "Ótimo" no Reclame Aqui (8,5 nos últimos seis meses, 120 reclamações, 100% respondidas, 84,3% resolvidas); 4,2/5 na App Store (641 avaliações) e 4,6/5 no Google Play (6,76 mil), o maior volume de avaliação entre os especializados.

**Pontos fracos:** o pagamento automático depende de o contratante abrir e fechar o job no app; quando ele esquece, o dinheiro fica preso. E a loja cancela em cima da hora, com o profissional já a caminho. **Relato**: "Você trabalha e eles te pagam quando querem. Não indico" (Google Play, 03/05/2022); "o gerente disse que a vaga foi cancelada... e quem perdeu vida fui eu" (reclamação no Reclame Aqui, 2026).

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/closeer|Closeer]] (01/10/2026) · [closeer.com.br](https://www.closeer.com.br/) · [Google Play](https://play.google.com/store/apps/details?id=com.closeer.closeer_worker) · [App Store](https://apps.apple.com/br/app/closeer-trabalho-freelancer/id1440858117) · [Projeto Draft (07/06/2021)](https://www.projetodraft.com/a-closeer-conecta-freelancers-da-area-operacional-a-empresas-dos-setores-de-food-service-hotelaria-e-varejo/) · [Gazeta do Povo (14/12/2018)](https://www.gazetadopovo.com.br/economia/aplicativos-conectam-bares-e-restaurantes-a-trabalhadores-intermitentes-f2oaed3lryqk6bb9tqunka2fi/).

### estaff

Modelo dual — vagas freela **e** vagas fixas CLT na mesma plataforma, atendendo bares, restaurantes, casas noturnas, hotéis e empresas de eventos. Nasceu em 2020 dentro do grupo da Eshows, marketplace de música ao vivo para bares: segundo produto para o mesmo cliente. Gratuito para o profissional; contratante paga comissão de intermediação com "planos e condições distintas" não divulgadas publicamente. O repasse ao profissional sai, na prática, na semana seguinte.

**É o único concorrente especializado com operação declarada no DF.** O endpoint público que alimenta o mapa do site (`estaff.com.br/api/metrics/regions`, conferido em 01/10) declara, para o DF, **5.197 profissionais, 31 clientes e 6.544 jobs realizados** — o quarto estado dela em jobs e em clientes. O dado é da própria empresa e não tem período. Fora o contador, não há rastro público: nenhuma das 43 vagas fixas do site é no DF, o verificador de cidade só reconhece "Brasília" (Taguatinga, Águas Claras e Ceilândia devolvem "Cidade não encontrada"), e não há cliente nomeado. A ficha classifica a ameaça no DF como **alta**.

**Tração declarada, reconciliada.** O "1,4 milhão" contra "686 mil" que este documento apontava são definições diferentes: 1.483.918 cadastrados, 524.519 "disponíveis" (soma por estado) e 39.317 "experientes", ou 2,6% do cadastro. São 998 mil jobs e R$ 128,9 milhões repassados a profissionais. **São Paulo concentra 93,9% dos jobs.**

**Pontos fracos — a nota mais baixa do grupo na App Store.** 3,1/5 (561 avaliações); no Google Play, 4,4 (5,32 mil). **Relato**: bloqueio de cadastro sem aviso claro após desistências, mesmo com antecedência ("Cancelei um freela com 2 dias de antecedência e fui punida ficando bloqueada 1 semana inteira", 1★); aprovação de candidatura chegando 30 minutos antes do horário da vaga; percepção de viés a favor do contratante em disputas. Reclame Aqui: reputação "Regular", nota 6,8 nos últimos seis meses, com 183 reclamações e 66,2% resolvidas; o tema dominante é banimento sem explicação.

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/estaff|eStaff]] (01/10/2026) · [estaff.com.br](https://estaff.com.br/) · [números por estado](https://estaff.com.br/api/metrics/regions) · [estaff.com.br/para-profissionais](https://estaff.com.br/para-profissionais) · [App Store](https://apps.apple.com/br/app/estaff-para-freelancers/id6470943542).

### eFreela

Marketplace de bicos para eventos e hospitalidade, de Goiânia: desenvolvimento a partir de outubro de 2022, operação desde janeiro de 2023.

**Como cobra, corrigido.** A taxa de 10% **é descontada do valor do freelancer**, não paga pelo contratante: os termos dizem que a eFreela "retém um percentual fixo de 10% sobre o valor total do trabalho realizado pelo Freelancer". O contratante paga 3% em cada depósito, pré-pago por Pix. É o único app de turno pesquisado que declara cobrar de quem trabalha como regra. Regras com número: multa de 5% por falta, bloqueio de 15 e de 30 dias, e trava que impede a mesma empresa de contratar o mesmo prestador por mais de 2 dias na semana.

**Como o modelo mudou:** depois de março de 2025, o site passou a vender um "sistema para gestão de freelancers" — presença, escala e pagamento — no lugar do marketplace. O motivo não é declarado.

**Tração declarada:** "mais de 300 mil freelancers" e "mais de 100 mil serviços realizados". O hiato que este documento apontava, de 300 mil usuários contra "100 mil+ instalações", era efeito da faixa exibida pela loja: o contador interno do Google Play marca 278 mil instalações.

**Presença no DF:** sem evidência pública — opera em 6 estados (GO, MG, SP, RJ, MA, AL), sem o DF.

**Pontos fortes:** bem avaliada nas duas lojas — App Store 4,6 (1.524) e Google Play 4,6 (2,41 mil); a nota 3,1 com 178 avaliações que este documento registrava para o Android não se confirma. Saque rápido e comunidade local, com cursos e encontro presencial mensal.

**Pontos fracos:** **Relato**: dificuldade recorrente de saque ("Não consigo sacar o dinheiro na plataforma de jeito nenhum", 12/09/2024). Reclame Aqui "Regular", nota 6,7 nos últimos seis meses; a resposta leva 10 dias em média no período e 68 dias no histórico de três anos. Quando o contratante esquece o checkout, o pagamento fica retido. Queixa de valor injusto: "11 horas por menos de 100 reais".

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/efreela|eFreela]] (01/10/2026) · [efreela.app](https://efreela.app/) · [App Store — Profissionais](https://apps.apple.com/br/app/efreela-profissionais/id1635147551) · [App Store — Empresas](https://apps.apple.com/br/app/efreela-empresas/id1635147083) · [Google Play](https://play.google.com/store/apps/details?id=com.lextar.efreelaapp) · [Revista Zelo (19/07/2023)](https://revistazelo.com.br/conheca-o-efreela-plataforma-para-contratar-freelancers-sem-burocracia/).

### Freela Serviços

Marketplace que cobre bares, restaurantes, eventos, buffets e — overlap direto com o segmento de **campanhas eleitorais**, hoje fora do radar do produto — panfletagem, bandeirista e coordenação. A empresa é de Jundiaí (SP), com CNPJ de 2023; os apps só chegaram às lojas no fim de maio de 2026. No mesmo ano abriu fretes, entregas e vagas CLT. Contratante paga mensalidade mais taxa decrescente por vaga: Grátis (R$0, 20%, 4 vagas/mês) · Básico (R$49,90/mês, 20%, 30 vagas) · VIP (R$299,90/mês, 15%, ilimitado) · Grandes Redes (R$499/mês, 10%, ilimitado), sem fidelidade. As perguntas frequentes do mesmo site dizem "sem taxa e sem mensalidade", o que contradiz a tabela. Declara seguro de acidentes pessoais em toda contratação, sem nomear a seguradora. O pagamento passa pelo app.

**Tração declarada, com o maior hiato de todo o grupo pesquisado:** os contadores do site mostravam, em 01/10, 202.743 profissionais cadastrados, **412 contratantes e 223 contratações concluídas** — eram 198.232, 392 e 203 em 14/09. No Google Play, o app tem 10 mil+ instalações e 45 avaliações, nota 3,5; o registro anterior de "1.000+ instalações e 1 avaliação" estava errado. Não há matéria de imprensa independente sobre a empresa, e ela não tem página no Reclame Aqui.

**Presença no DF:** sem evidência pública — alega "todo o Brasil"; as vagas vistas são do interior de SP, de São Paulo, Curitiba e BH.

**Pontos fortes:** estrutura de planos pública e sem fidelidade; elogios pontuais de pagamento em dia.

**Pontos fracos:** estreia com onda de notas baixas por erro de login e de senha; queixa de "não aparece vaga na minha região". A linha Freela Entregas retém 20% do entregador, contra a promessa de custo zero.

**Nota lateral:** o nome "Freela" (sem "Serviços"), citado isoladamente numa lista solta de concorrentes deste projeto, **não é a Freela Serviços** — é ambiguidade de marca. Existiu um "Freela Brasil" (app de eventos, hoje extinto, nome reaproveitado por terceiros associados a golpe de curso) e outras empresas homônimas sem relação; a página "Freela" do Reclame Aqui é de outra empresa, com outro CNPJ. Não há um concorrente oculto atrás do nome.

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/freela-servicos|Freela Serviços]] (01/10/2026) · [freelaservicos.com.br](https://www.freelaservicos.com.br/) · [App Store](https://apps.apple.com/br/app/freela-servi%C3%A7os/id6762235967) · [Google Play](https://play.google.com/store/apps/details?id=com.freela.freelancers) · [econodata.com.br — CNPJ](https://www.econodata.com.br/consulta-empresa/49745133000186-freela-servicos-de-aplicativos-ltda).

### Worc

*(Registro de 14/09/2026; fora da pesquisa de 01/10.)*

Plataforma B2B de recrutamento e gestão de mão de obra para foodservice — cobra do **contratante** via assinatura mensal/trimestral (preço só sob consulta comercial), grátis para o candidato. Fundada no fim de 2018 em São Paulo; captou R$20 milhões em seed do SoftBank em 2021 (maior seed da América Latina à época — dado independente), e fez duas aquisições em 2022 (Hrestart, Ponto Predict).

**Sinal de alerta forte: a própria empresa publica três números de tração diferentes na mesma sessão de navegação.** A home diz "5+ milhões de oportunidades geradas" e "R$500+ milhões em GMV"; a página de vagas do mesmo site, no mesmo acesso, diz "mais de 2 milhões"; uma matéria de 2021 falava em "mais de 40.000". O quadro de vagas ao vivo do próprio site retornou **zero vagas** no acesso de 14/09/2026, apesar de uma página de marketing alegar "1.400+ vagas abertas" — contradição direta, observada ao vivo. O rodapé do site ainda diz "© Worc 2024".

**Presença no DF:** não confirmada — parcerias recentes são Rio de Janeiro (SindRio, jul/2026), São Paulo e Curitiba.

**Pontos fortes:** ainda operando ativamente (parceria nova com o SindRio em julho/2026); histórico de M&A mostra alguma capacidade de execução.

**Pontos fracos — as queixas vêm do lado contratante, não do trabalhador (padrão invertido em relação ao resto do grupo).** Reclame Aqui: reputação "Não Recomendada", 4,3/10, só 42,9% resolvidas, só 21,4% voltariam a negociar. **Relato** (7 relatos vistos): empresa que pagou mensalidade e "não recebeu ninguém para entrevistas"; renovação de contrato "sem eu deixar", inclusive após cancelamento confirmado por vídeo chamada; "não tinha banco de currículos qualificado nem para São Paulo". Um relato de ex-funcionário no Glassdoor menciona demissão de "mais de 70% do quadro" (nota agregada 2,9/5, 44% recomendam).

**Fontes:** [worc.com.br](https://www.worc.com.br/) · [app.worc.com.br/nossas-vagas](https://app.worc.com.br/nossas-vagas) · [app.worc.com.br/contrate-a-worc](https://app.worc.com.br/contrate-a-worc) · [Exame — aporte SoftBank](https://exame.com/tecnologia/startup-worc-de-recursos-humanos-recebe-aporte-de-r20-mi-do-softbank/) · [SindRio — parceria (07/2026)](https://www.sindrio.com.br/2026/07/banco-de-curriculos-sindrio-worc/) · [Reclame Aqui](https://www.reclameaqui.com.br/empresa/worc-plataforma-digital/) · [Glassdoor](https://www.glassdoor.com.br/Avalia%C3%A7%C3%B5es/Worc-Plataforma-Digital-S%C3%A3o-Paulo-SP-Avalia%C3%A7%C3%B5es-EI_IE4735042.0,23_IL.24,36_IC2479061.htm) — acesso 14/09/2026.

### Toopa

*(Registro de 14/09/2026; fora da pesquisa de 01/10.)*

**Provavelmente inativa em 2026.** Conectava bares, restaurantes, hotéis e eventos via geolocalização, com contratante pagando 10% do valor à plataforma, sem mensalidade, repasse ao freelancer em até 3 dias úteis — dado de agosto/2021. Meta declarada para 2022 era 10 mil estabelecimentos e 100 mil profissionais, partindo de 500+ estabelecimentos e 2 mil candidatos em 2021 — nunca encontramos confirmação de que essa meta foi atingida.

**Sinais convergentes de que saiu do ar:** o domínio toopa.com.br não resolve por DNS; a ficha da App Store retorna erro 404; não há cobertura de imprensa depois de agosto/2021; não há nenhuma review de usuário localizável em nenhuma fonte. Nenhuma fonte isolada diz "a Toopa fechou" — é a convergência de sinais técnicos que sustenta essa leitura, registrada como achado, não como certeza absoluta.

**Sobre o DF:** em agosto de 2021, a empresa declarou à imprensa planos de expandir para mais 5 cidades ainda naquele ano, incluindo Brasília — nunca confirmado como executado, e hoje irrelevante dado o provável encerramento da operação.

**Fontes:** [Forbes Brasil (08/2021)](https://forbes.com.br/forbes-tech/2021/08/exclusiva-aplicativo-conecta-bares-e-restaurantes-a-funcionarios-freelancers-para-apoiar-a-retomada-do-setor/) · [ABC da Comunicação (08/2021)](https://www.abcdacomunicacao.com.br/retomada-startup-cria-aplicativo-para-conectar-bares-e-restaurantes-a-mao-de-obra-qualificada/) · [Guia do Freela (31/05/2023)](https://guiadofreela.com.br/4-aplicativos-para-freelancer-de-servicos-gerais/) — acesso 14/09/2026; teste de DNS e App Store realizado diretamente em 14/09/2026.

### TradePRO Freelance e JobHunter — concorrência adjacente

Nenhum dos dois compete diretamente no food service/eventos/campanha política — seguem catalogados aqui só por já terem sido citados no projeto.

**TradePRO Freelance:** conecta promotores de trade marketing (MEI obrigatório) a empresas para execução pontual em ponto de venda. A empresa paga o trabalho pelo app; como a plataforma cobra não é público. Nasceu em 2011 como software de gestão de campo e lançou o Freelance em 2019, sobre a base de clientes do software. Mantém um segundo produto de gestão de equipes de campo ("TradePRO Promoter"); o app Android do Freelance não é atualizado desde janeiro de 2025. Sem número de tração encontrado.

**JobHunter:** classificados de bicos, gratuito para os dois lados, com receita declarada só de anúncios no app. O contato do contratante pelo WhatsApp é liberado assim que o freelancer se candidata ("Contratou. Combinou no WhatsApp"), e o app "não toca em dinheiro nenhum". Declara mais de 52 mil cadastrados em 240+ cidades, com Uberlândia e Goiânia como praças mais fortes; eram cerca de 33 mil em 14/09. **Correção:** o app Android está no ar desde pelo menos setembro de 2024, e não desde abril de 2026, data do iOS — a base se formou em cerca de dois anos, não em meses. O campo "fornece alimentação" na vaga é citado pelos usuários. Goiânia fica a cerca de 200 km de Brasília.

**Fontes:** fichas [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/tradepro|TradePRO]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/jobhunter|JobHunter]] (01/10/2026) · [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/auditoria-grupo-4|auditoria do grupo 4]] · [tradepro.com.br/freelance](https://tradepro.com.br/freelance/) · [home.jobhunterbr.com](https://home.jobhunterbr.com/).

### Os oito da varredura de 23/09, agora com ficha

A varredura da App Store de 23/09/2026 devolveu oito aplicativos que a pesquisa não tinha, lidos só na loja. Em 01/10 cada um ganhou ficha completa, e as do grupo 4 passaram por auditoria número por número. As imagens seguem em `pesquisa/concorrentes/`.

**Freelas Now** — o mais próximo da tese do Frila, e mais próximo do que a captura mostrava. Além do mapa de "Freelancers Próximos" e do "Pra agora", a vaga aberta é **notificada a todos os disponíveis da região ao mesmo tempo, e o primeiro que aceita em 2 minutos é contratado**, com reoferta automática se ele desiste. No aceite, o valor fica em custódia pelo Mercado Pago; o freelancer recebe às 10h do dia seguinte, ou na hora com desconto de 5%. Cobra do contratante 12% da diária (10% no Premium de R$ 29,90 por mês) pelos termos de maio de 2026 — as lojas dizem 10% e 8%. Tem check-in por código de 4 dígitos, alerta quando a mesma dupla trabalha 3 vezes na semana e compensação de 20% ao freelancer no cancelamento tardio. É obra de pessoa física, só funciona em São Paulo capital, está sem atualização desde julho de 2026 e não publica nenhum número de uso.

**Freelas Eventos** (na loja, "Freelas") — o mais próximo da nossa camada de confiança. A ficha do profissional traz ranking com desempenho, confiança em porcentagem, trabalhos realizados e cancelamentos; o evento declara função, valor por vaga, uniforme, lanche e descanso. É reputação com denominador, feita de outro jeito: sem taxa de comparecimento medida por check-in. Tem lista de favoritos e eventos de vários dias. Foco declarado no interior de São Paulo, sem cobrança hoje e com pagamento por fora.

**UmFreela** — "a nossa tese no ar", com preço público: R$ 3,99 por vaga concluída, a primeira grátis, ou R$ 34,90 por mês mais R$ 1,49 por vaga. Profissional não paga e recebe o valor integral, direto do contratante. Lançado em março de 2026, em Porto Alegre; cerca de 100 downloads no Android.

**Os outros cinco.** **BIKO** (eventos, hospitalidade e logística) é operado pela BIKO Tecnologia e Serviços, de Barueri; a empresa compra créditos pré-pagos, paga diária mais um percentual "negociado" e libera o pagamento em até 1 dia útil; tem check-in por GPS, contagem regressiva do turno e favoritos. **Staff BR**, da Futebolcard, nasceu em 2025 para estádios e abriu para hospitalidade; cobra percentual só da vaga concluída e declara Pix no checkout. **Meu Freelance** tem candidaturas e agenda, e mostra sinais de abandono: domínio expirado em setembro de 2026 e nota 1,5 no Google Play. **Trampei Serviços** é generalista e cobra assinatura do profissional (R$ 29,90) e da empresa (R$ 99,90). **Bicos** é serviço doméstico e entra como adjacente, junto de TradePRO e JobHunter.

**O que isso muda para o posicionamento.** Proximidade, urgência, reputação bilateral, contato direto depois do aceite **e o próprio "primeiro que aceita leva"** já estão publicados na App Store brasileira, ainda que em apps pequenos e sem liquidez visível. O diferencial defensável do Frila não é o mecanismo. É o que nenhum dos 22 mostra: **taxa de comparecimento medida por check-in com denominador explícito, reputação binária e densidade num território** — além de contato limitado a sete dias e nenhum custo para o profissional, que é requisito do mercado e não diferencial.

**Fontes:** fichas [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/freelas-now|Freelas Now]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/freelas-eventos|Freelas Eventos]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/umfreela|UmFreela]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/biko|BIKO]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/staff-br|Staff BR]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/meu-freelance|Meu Freelance]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/trampei|Trampei]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/bicos|Bicos]].

### Os que entraram em 01/10: Bravo Eventos, StaffPRO, Lan Up, 99Freelas e Freelancer

**Bravo Eventos** — não é marketplace: é o app de recrutamento de uma agência de staff de eventos de São Paulo, de 2012, que lançou o app em 2023. A produtora paga a agência por cotação, e a agência paga o profissional dias depois do evento. Cerca de 208 mil instalações no Android e as piores notas do grupo (2,5 nas duas lojas). No Reclame Aqui, "Não recomendada": 29 reclamações, quase todas sem resposta, incluindo profissional confirmada e barrada na porta do evento.

**StaffPRO** — staff de eventos para produtoras, em SP e RJ, com MEI obrigatório do profissional. Cobra por cotação e repassa em 5 a 15 dias úteis; a nota nas duas lojas é 3,1. Declara mais de 6.000 eventos e R$ 6 milhões em serviços prestados, que não é faturamento.

**Lan Up** — empresa de 2020, de Santo André, que lançou o app em 2021 como banco de talentos de freelances para bares, restaurantes e eventos, e virou SaaS de ponto, escala e pagamento para empresas terceirizadas, de R$ 200 a R$ 2.000 por mês. Receita e motivo do pivô não são públicos.

**99Freelas** e **Freelancer** — marketplaces de projeto remoto, sem turno presencial; entram como referência de modelo, ao lado do Fiverr. O 99Freelas cobra intermediação de 10% a 20% e assinatura do profissional, com três preços diferentes para o mesmo plano conforme o canal. O Freelancer cobra 10% do trabalhador e 3% do cliente.

**Fontes:** fichas [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/bravo-eventos|Bravo Eventos]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/staffpro|StaffPRO]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/lan-up|Lan Up]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/99freelas|99Freelas]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/freelancer-hire-find-jobs|Freelancer]].

### Fiverr — referência de modelo, não concorrente direto

Marketplace global 100% remoto (design, programação, redação, marketing) — sem componente presencial, categoricamente diferente do Frila. Relevante aqui só como referência de modelo de cobrança: **20% do vendedor e 5,5% do comprador** por contrato, mais uma assinatura opcional do lado do profissional (Seller Plus, de US$ 25 e US$ 49 por mês). O "take rate" de 28,0% (12 meses até jun/2026) que este documento registrava é a receita sobre o volume transacionado, não a comissão contratual.

**Como o modelo mudou:** nasceu em 2010 com serviço a US$ 5; liberou o preço em 2015, criou curadoria em 2017 e assinatura em 2021.

**O dado mais relevante para o Frila:** nos resultados financeiros públicos mais recentes, a receita de marketplace (comissão pura) caiu 15,5% ano a ano, enquanto a receita de "serviços" (que inclui a camada de assinatura) cresceu 2% — sinal de que receita recorrente por assinatura é mais resiliente que comissão pura, mesmo para quem já domina a transação. Compradores ativos caíram 21,9% a/a; a empresa atribui isso à adoção de IA comprimindo trabalho de baixo valor.

**Reviews:** Trustpilot 2,5/5, fortemente polarizado (49% dão 5 estrelas, 35% dão 1 estrela); queixas recorrentes de suporte lento e disputas de reembolso que raramente favorecem o comprador; onda de banimento de conta de vendedor em 2026 sem processo de apelação claro. No Reclame Aqui, "Não recomendada": a empresa não responde.

**Fontes:** ficha [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/fiverr|Fiverr]] · [StockTitan — resultado Q2 2026](https://www.stocktitan.net/news/FVRR/fiverr-announces-second-quarter-2026-o0quisjjfetp.html) · [Fiverr Help Center — Seller Plus](https://help.fiverr.com/hc/en-us/articles/360017140717-Seller-Plus-Standard-and-Premium-Advanced-tools-for-business-growth) · [Trustpilot](https://www.trustpilot.com/review/www.fiverr.com).

---

## 5. Referências internacionais

Fora do Brasil, os players de staffing sob demanda cobram do contratante sobre a hora trabalhada, não assinatura. A pesquisa de 01/10 estudou dez deles — como nasceram, como o modelo mudou e o que deu errado — em [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/referencias-globais-staffing|referências globais de staffing por turno]], conferidas por [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/auditoria-referencias-globais|auditoria]].

| Empresa | Onde e quando nasceu | Quem pagava e quanto no início | Vínculo no início → hoje | Situação em 2026 |
|---|---|---|---|---|
| **Instawork** | 2015, São Francisco. Mural de vagas fixas para cozinha de restaurante | Restaurante: US$ 100 por contratação; depois US$ 10 por turno (2019) | Nenhum → autônomo → misto | Ativa; 46 regiões nos EUA e 2 no Canadá |
| **Wonolo** | 2013/2014, São Francisco. Reposição e armazém, dentro da Coca-Cola | Empresa; hoje 45% sobre o autônomo e 55% sobre o empregado | Autônomo → misto | Ativa |
| **Syft / Indeed Flex** | 2015, Londres. Hospitalidade e eventos | Empresa: 15% sobre o salário | Agência empregadora desde o início | Ativa, dentro da Recruit/Indeed, que a comprou em 2019 |
| **Coople** | 2009, Zurique. Varejo, alimentação coletiva e eventos | Empresa: fator sobre o salário (não público) | Empregadora desde o início | Só Suíça; fechou o Reino Unido no fim de 2025 |
| **Qwick** | 2017, Phoenix. Camareira de hotel, depois alimentos e bebidas | Empresa: 40% sobre o pagamento (dado de 2022) | Autônomo → misto | Opera com a Gigpro; **falência reportada e não confirmada** |
| **Shiftsmart** | 2015, São Francisco. Recrutamento para apps de entrega | Não encontrado | Autônomo → autônomo | Ativa; virou terceirização de execução no varejo |
| **Jobandtalent** | 2009, Madri. Site de vagas | Anúncios; desde 2016, 10% do salário bruto | Nenhum → empregadora | Ativa; prejuízo em todos os anos |
| **GigSmart** | 2016, Denver, Cincinnati e Las Vegas | Empresa: 25%, depois 35% e 45% | Autônomo → misto | Ativa |
| **Apli** | 2016, Cidade do México. **Turnos de um dia para bares, restaurantes e eventos** | Empresa: 100 pesos por contratado; depois US$ 5 a 10 por pessoa por dia | Não encontrado | Virou software de recrutamento por assinatura; comprada em 2025 |
| **Time Jobs** | 2017/2018, Chile. Varejo, alimentação, eventos | Empresa: comissão (percentual não encontrado) | Autônomo | Matriz fechada; a filial do Peru ficou com a carteira |

**O que as dez mostram:**

- **Nenhuma cobrou do trabalhador no começo, e nenhuma começou com assinatura.** As taxas ao trabalhador vieram depois e são pequenas: seguro por hora e saque instantâneo.
- **A cobrança inicial teve só dois formatos:** valor fixo por contratação ou por turno, quando a plataforma não controlava o dinheiro (Instawork de 2016, Apli), e percentual sobre o salário, quando controlava.
- **Quase todas nasceram numa cidade só**, a dos fundadores ou a do cliente-âncora. A exceção é a GigSmart, que abriu três cidades de uma vez e colheu queixas de turno "a horas de distância" e de falta de gente em algumas regiões.
- **O vínculo é o passivo que explode.** Nos EUA, quem usa autônomo pagou acordo ou mudou o vínculo: de US$ 400 mil (Instawork, Colorado) a US$ 4,17 milhões (Shiftsmart). Quatro das cinco americanas passaram a oferecer também empregado registrado, por empresa separada; a Shiftsmart segue só com autônomo. Entre as que são empregadoras, a margem bruta fica entre 8,6% e 12,4%.
- **A Apli é a referência mais parecida com o começo do Frila** — uma cidade, bares e restaurantes, valor fixo por pessoa — e abandonou o turno em cerca de três anos, a favor de software por assinatura.

**Instawork** (EUA/Canadá) — tarifa horária "all-inclusive" (pagamento + markup), com percentual que a empresa não divulga mais. **Correção:** não nasceu como staffing por turno; nasceu como mural de vagas fixas e chegou ao turno "como experimento". Taxa de efetivação de US$2.500, reduzida a US$1.000 após 320h da mesma pessoa na empresa. Criou em 2021 uma afiliada empregadora, por pressão de clientes.

**Qwick** (EUA) — markup de ~40% por turno. **Correção:** a versão anterior deste documento registrava que a empresa "entrou em processo de falência". A pesquisa de 01/10 **não confirmou a falência**. O que se confirma é o acordo de US$2,1 milhões por má classificação de trabalhadores, em fevereiro de 2024, com conversão dos trabalhadores da Califórnia em empregados, e que hoje a Qwick opera com a Gigpro, sob a "Qwick GP LLC". Na Covid, a receita dela caiu 80%.

**7shifts** *(registro de 14/09; fora da pesquisa de 01/10)* — não é marketplace de mão de obra, é software de escala/gestão de turnos para restaurantes (categoria adjacente, não concorrente). Preço em camadas por unidade: grátis até 15 funcionários, até US$134,99/mês nos planos maiores — confirmado por fonte atualizada de julho/2026.

**Fontes:** [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/referencias-globais-staffing|referências globais]] · [help.instawork.com](https://help.instawork.com/en/articles/9658444-choose-pricing) · [ShiftNOW — Qwick vs. Instawork (22/06/2026)](https://www.shiftnow.com/blog/qwick-vs-instawork) · [Bloomberg Law](https://news.bloomberglaw.com/litigation/qwick-will-pay-2-1-million-to-settle-misclassification-suit) · [Daily Journal — reportagem sobre a Qwick](https://www.dailyjournal.com/article/385916-payouts-in-jeopardy-as-staffing-platform-qwick-enters-bankruptcy) · [costbench.com — 7shifts (verificado 30/07/2026)](https://costbench.com/software/employee-scheduling/7shifts/).

---

## 6. Por que o WhatsApp ainda vence

`01-O-PROBLEMA.md` já mostra os números: WhatsApp está em 98,3% dos smartphones brasileiros e é o canal comercial de 82% dos pequenos negócios — grátis, universal, sem fricção de cadastro. A pesquisa de concorrência aprofunda essa leitura por outro ângulo: mesmo com 22 apps brasileiros diretos ou adjacentes já publicados, nenhum deles resolveu o problema bem o suficiente para deslocar o grupo de WhatsApp como canal dominante. Três razões aparecem nos dados:

**1. Cadastro não é liquidez, e isso se repete em quase todo concorrente pesquisado.** A Freela Serviços declara 202.743 profissionais cadastrados contra 223 contratações concluídas. A estaff tem 2,6% do cadastro como "experiente". A Worc chegou a anunciar "1.400+ vagas abertas" numa página que, na mesma sessão, mostrou zero vagas no próprio quadro ao vivo. Um grupo de WhatsApp não promete uma base cadastrada — promete uma vaga publicada agora, vista por quem está no grupo agora. Para quem precisa resolver uma falta em duas horas, isso pesa mais que qualquer número de cadastro.

**2. A queixa dominante de quem trabalha é não ser chamado, não falta de vaga** (já registrado em `01-O-PROBLEMA.md` §3.1) — e a pesquisa de concorrência mostra que isso se repete além dos três apps já analisados lá: GetNinjas (moeda gasta sem retorno), estaff (bloqueio de cadastro sem processo justo), Closeer e eFreela (pagamento retido quando o contratante não fecha o turno no app), e candidatura sem resposta em estaff, Switch, Closeer, Bravo, BIKO e JobHunter. Um grupo de WhatsApp não tem esse tipo de fricção estrutural — quem está no grupo vê a vaga e se candidata direto para quem publicou, sem intermediário decidindo quem é "escolhido".

**3. No Distrito Federal, o trabalho avulso de hospitalidade quase não aparece em canal público.** Um concorrente especializado declara operação aqui (estaff), mas sem vaga aberta nem cliente nomeado; as agências de evento não publicam preço; e nos portais de vagas do DF só 0,5% a 0,7% dos posts contêm a palavra "freelancer". **Inferência:** a demanda de extra corre por contato direto e WhatsApp — hipótese para o campo, não fato. Isso não é evidência de que o WhatsApp "vence" tecnicamente; é evidência de que, no mercado que o Frila quer atender primeiro, ele é a ferramenta já testada localmente e sem rastro público de alternativa.

**O que isso não permite concluir** (mantendo o mesmo rigor de `01-O-PROBLEMA.md` §4.1): não há medida independente de que o WhatsApp "funcione mal" — o que existe é ausência de garantia estrutural, e agora evidência de que os concorrentes que prometem essa garantia também falham nela com frequência, só que de um jeito mais visível e documentado (reviews, Reclame Aqui) do que o WhatsApp, que não deixa rastro público de falha.

---

## 7. Insights estratégicos

**O Distrito Federal não está vazio de concorrência especializada, mas está sem concorrente com rastro público.** A estaff declara 31 clientes e 6.544 jobs no DF, e a ficha dela classifica a ameaça como alta; fora o contador, não há vaga aberta, cliente nomeado nem notícia local. A estratégia territorial do Frila (dominar o DF antes de expandir) compete contra o WhatsApp, contra agências de evento sem preço público e contra um incumbente nacional cuja operação local ainda precisa ser medida em campo. É o que sustenta a densidade no DF como primeira barreira de entrada em `02-O-NEGOCIO.md` §6, com a ressalva de que janela aberta não é vantagem permanente. **Quem são os 31 clientes da estaff e como avaliam o serviço é pergunta para as entrevistas.**

**A tese já está publicada, e o mecanismo não é diferencial.** O Freelas Now faz, em São Paulo, o modo urgência inteiro: aviso a todos os disponíveis, primeiro que aceita em 2 minutos leva, reoferta automática. Tem cerca de 4,3 mil instalações e nenhum sinal de uso. O custo de publicar um app desses é baixo, e o diferencial do Frila precisa estar na execução — gente perto, comparecimento medido por check-in, reputação com denominador — e não na ideia.

**O padrão "cadastro não é liquidez" é a vulnerabilidade estrutural mais repetida do setor**, presente em praticamente todo concorrente pesquisado com número de tração verificável. O despacho ativo do Frila — notificar quem é elegível em vez de esperar candidatura — ataca esse ponto especificamente, em vez de competir em volume de cadastro. O desenho desse mecanismo está em `03-ESPECIFICACAO-DO-PRODUTO.md`. A métrica a mostrar é turno cumprido, nunca cadastro.

**As piores avaliações do setor vêm quase sempre do lado de quem trabalha, independente do modelo de cobrança** — pagamento retido (Closeer, eFreela), bloqueio sem processo justo (estaff), moeda gasta sem retorno (GetNinjas), candidatura sem resposta. Isso reforça, agora com evidência de mercado e não só de pesquisa de problema, que a aposta do Frila em reputação binária e ausência de custo para o profissional mira o ponto certo. Custo zero para o profissional, porém, é **requisito do mercado**: em 13 dos 22 apps só o contratante paga, e só o GetNinjas cobra apenas do profissional.

**Todo app de turno com escala comprovada faz o dinheiro passar por ele — e isso é a maior tensão com a RN09.** É leitura do estudo a partir das fichas, não dado de mercado: nenhum app de turno com pagamento por fora mostrou receita relevante. Mas o dinheiro no app também não cria liquidez (Freela Serviços, Freelas Now) e gera a sua própria queixa, de dinheiro preso. A decisão de 01/10 sobre isso está na seção 9.

**O mercado é mais instável do que a lista de concorrentes sugere à primeira vista.** A Toopa parece ter saído de operação; a Worc publica três números de tração contraditórios na própria home e tem reputação "Não Recomendada"; o controlador do GetNinjas está sob investigação e não publica balanço desde 2024; o Meu Freelance deixou o domínio expirar; a Switch quase parou de responder no Reclame Aqui em 2026. Vários concorrentes "estabelecidos" carregam problemas sérios de execução ou de saúde institucional — o que é mais oportunidade do que ameaça para um entrante regional com densidade real.

**A Freela Serviços já atende campanha política** — é o único concorrente com overlap direto nesse segmento, que saiu do radar do produto em 21/09/2026. Vale investigar mais de perto se a campanha política voltar a ser prioridade.

---

## 8. Padrões de modelo de negócio *(pesquisa de 01/10)*

O detalhe, com a evidência de cada linha, está no [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/estudo-modelo-de-negocio-e-features|estudo de modelo de negócio e features]], seções 1, 2 e 4. São padrões observados nas fichas, não leis de mercado.

**Como os maiores nasceram e para onde foram:**

| Caso | Nasceu como | Virou | Lição |
|---|---|---|---|
| Closeer | Grátis por 6 meses para os dois lados (dez/2018); o plano era 10% do profissional mais mensalidade do contratante | Carteira pré-paga do contratante, com taxa na recarga; gestão e vaga fixa | Tirou a cobrança do trabalhador e passou a monetizar o fluxo de dinheiro do contratante |
| estaff | Segundo produto do grupo Eshows (2020) | Freela e vaga CLT, com escala, favoritos e relatórios | Entrou pelo cliente que já existia; 93,9% dos jobs em SP |
| eFreela | Marketplace grátis para a empresa, 10% do freelancer (2023) | "Sistema para gestão de freelancers" | Foi da conexão para a gestão em 2 a 3 anos |
| Switch | 3 anos operando por WhatsApp antes do app | Hora tabelada, urgência a +10%, efetivação a 50% do salário-base | Validar a operação antes do produto; cobrar urgência e efetivação |
| Lan Up | Banco de talentos para bares e eventos | SaaS de ponto e escala para terceirizadas | Da conexão para a gestão; receita e motivo não são públicos |
| GetNinjas | Assinatura por volume de pedidos | Moedas por contato (2016) | Receita sem processar o pagamento, com o risco no profissional — e a queixa vem daí |
| Instawork | Mural de vagas; US$ 100 por contratação | Staffing por turno com pagamento intermediado | Valor fixo enquanto não controla o dinheiro |
| Apli | Turno de um dia; valor por pessoa por dia | Software de recrutamento por assinatura | O turno sozinho não segurou o modelo |
| YOLO Club (Brasília) | Passaporte impresso com 60 restaurantes, parceiros buscados porta a porta (2017) | App; cerca de 6 anos até São Paulo | Densidade local antes de expandir; abrir praça com líder local e pré-lista |
| Duo Gourmet (BH) | Guia impresso (2013); 37 restaurantes na edição de 2015 | 235 cidades; plano anual de R$ 210 para R$ 708 | Entra barato e sobe o preço com a densidade |

YOLO e Duo são clubes de assinatura de restaurante, não marketplaces de trabalho: aproveita-se deles o caminho territorial, não a mecânica ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/casos-yolo-e-duogourmet|casos]]).

**O que se repete:**

- **Quem paga é o contratante.** Em 13 dos 22 só ele paga; em 5, os dois; só o GetNinjas cobra apenas do profissional.
- **Barato ou grátis na entrada; o preço sobe com a densidade.** O preço de entrada é baixo, fixo e só incide sobre o que deu certo: o UmFreela cobra por vaga concluída, o Staff BR não fatura a falta.
- **Valor fixo enquanto não processa o pagamento; percentual quando processa.** Todos os que cobram percentual controlam o dinheiro.
- **Da conexão para a gestão.** Closeer, eFreela, Lan Up e estaff, aqui; Apli, Coople, Indeed Flex e Instawork, lá fora. O contratante paga com mais constância por controle da equipe do que por um contato novo.
- **Da transação para a receita recorrente:** assinatura, SaaS, urgência e efetivação.
- **Papel antes do app, rede curada antes da rede aberta.** Switch, YOLO, Duo, Instawork e Coople operaram à mão antes de programar.
- **Anos na primeira praça.** YOLO, cerca de 6; Instawork e Switch, 4; Duo, 2,5.
- **O preço quase nunca é público.** Só 7 dos 22 publicam o que o contratante paga, e 3 deles com preços que não batem entre canais.

**O que diferencia em features** (matriz na seção 3 do estudo): o básico — notificação, candidatura, seleção, avaliação, reputação e chat — todos têm. O que diferencia é presença verificada no local (8 apps), saque rápido (4), favoritos (7) e escala (11).

**Erros que se repetem:**

- cobrar antes de haver vaga;
- crescer antes da densidade (Freela Serviços, eFreela em parte, GigSmart);
- deixar a relação ir para o WhatsApp sem ter o que vender depois;
- pagamento lento (5 a 15 dias úteis na StaffPRO, dias depois do evento na Bravo);
- preço diferente em cada canal (99Freelas, Freela Serviços, Freelas Now);
- tratar o vínculo como detalhe.

---

## 9. Recomendação por fase e decisões de 01/10/2026 *(pesquisa de 01/10)*

### 9.1. Decisões do Cauê em 01/10/2026

1. **O pagamento do turno continua por fora do app. A RN09 está mantida.** O Frila não processa, não retém e não custodia o valor do turno.
2. **O valor por posição e o valor da assinatura ficam em aberto.** A direção recomendada pela pesquisa é cobrar do contratante um **valor fixo por posição preenchida com presença verificada**, mais uma **assinatura pela gestão da equipe de confiança**. É direção, não tabela: o preço se define no piloto. Nenhum número foi fixado.
3. **Vínculo e parceria com agência de trabalho temporário: em aberto.** Fica registrado como questão aberta, sem decisão.

### 9.2. Por que essa direção de cobrança

Com o dinheiro do turno fora do app, o Frila não sabe nem controla quanto foi pago — e a pesquisa mostra que **percentual sempre veio junto com o controle do dinheiro**. O que o Frila sabe é se houve check-in. Por isso a forma compatível com a RN09 é valor fixo por posição com presença verificada, sem cobrar a falta. A assinatura cobre o que o contratante recorrente continua precisando depois que já conhece as pessoas: equipe de confiança, escala, relatório.

As âncoras públicas que existem, para referência e não como proposta de preço: R$ 3,99 por vaga concluída e R$ 34,90 por mês (UmFreela); R$ 29,90 por mês (Freelas Now Premium); R$ 49,90 a R$ 499 por mês (Freela Serviços); R$ 200 a R$ 2.000 por mês (Lan Up); US$ 10 por turno (Instawork, 2019). Quem processa o pagamento no Brasil cobra de 10% a 20%. A disposição a pagar do contratante do DF só o campo responde ([[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/estudo-modelo-de-negocio-e-features|estudo]], seção 5.3).

### 9.3. O que fazer, por fase

Os limiares marcados com `[H]` são hipóteses de partida do [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/casos-yolo-e-duogourmet|playbook YOLO/Duo]], a calibrar no piloto de 13/11. Nenhuma fonte pública os dá.

| | Fase 1 — Nascer no DF | Fase 2 — Dominar o DF | Fase 3 — Expandir |
|---|---|---|---|
| **Onde** | Um núcleo dentro do raio de 15 km do despacho, não o DF inteiro | As regiões administrativas, uma a uma | Uma cidade parecida com o DF, onde um cliente atual já tenha unidade, com líder local e pré-lista |
| **Preço** | Grátis, com o preço futuro já mostrado e um prazo ou limite anunciado | Contratante paga valor fixo por posição preenchida com presença verificada, mais assinatura pela gestão da equipe de confiança. **Valores em aberto.** Uma tabela só, pública | O mesmo, mais planos de rede |
| **Dinheiro do turno** | Por fora (RN09) | Por fora (RN09 mantida em 01/10) | Por fora |
| **Vínculo** | Autônomo | **Em aberto** | **Em aberto** |
| **Aquisição** | Âncoras de evento e buffet, rede curada porta a porta, operação manual | Indicação dos dois lados | Líder local e pré-lista na cidade nova |
| **Sinal para avançar** `[H]` | 8 semanas com 80% dos turnos preenchidos, aceite em até 15 minutos, 90% de comparecimento e 50% de contratantes que voltam | Dois trimestres estáveis, margem positiva sem subsídio, roteiro de abertura escrito e demanda espontânea na cidade-alvo | — |
| **Erro a evitar** | Marketplace vazio; esconder o preço; exigir MEI | Percentual sem controlar o pagamento; punição automática | Abrir várias cidades de uma vez |

**Features que a evidência sugere e que não estão no escopo** (seções 5.2 e 7.3 do estudo) — sugestões para o backlog, não decisões: confirmação "paguei" e "recebi" pelos dois lados; taxa de cancelamento do estabelecimento na reputação; QR Code ou código como segunda via de check-in; aviso a quem não levou a vaga; alerta de recorrência da mesma dupla na semana.

### 9.4. O que a RN09 mantida deixa em aberto

Manter o pagamento por fora dá o prazo do melhor concorrente — Pix no fim do turno — sem custódia, sem depósito prévio e sem aproximar o Frila do papel de quem paga. O custo conhecido é que o Frila não vê se o contratante pagou. Sem custódia, a única forma de saber é os dois lados confirmarem; se o piloto mostrar calote ou atraso relevante, a queixa cai no app do mesmo jeito. É o dado a medir desde o primeiro turno.

### 9.5. O que só o campo responde

- Quanto o contratante do DF aceita pagar, e se prefere fixo, percentual ou assinatura.
- Frequência da falta de última hora e tamanho do mercado informal no DF.
- Quem são os 31 clientes da estaff no DF.
- Os limiares `[H]` das fases.

---

## Fontes

As fontes de cada concorrente estão listadas ao final do respectivo perfil, nas seções 4 e 5. Abaixo, as fontes de mercado usadas na seção 2 e os documentos da pesquisa de 01/10.

**Mercado**
- [Setor de bares e restaurantes do DF e o fim da 6x1 — Correio Braziliense (05/2026)](https://www.correiobraziliense.com.br/euestudante/trabalho-e-formacao/2026/05/7426839-setor-de-bares-e-restaurantes-do-df-preve-alta-de-ate-8-nos-cardapios-com-fim-da-6x1.html)
- [Mais da metade de bares e restaurantes opera sem lucro no DF — Correio Braziliense (09/2025)](https://www.correiobraziliense.com.br/cidades-df/2025/09/7240809-mais-da-metade-de-bares-e-restaurantes-opera-sem-lucro-no-df.html)
- [Faturamento do setor em 2025 — Abrasel](https://abrasel.com.br/noticias/noticias/bares-e-restaurantes-faturaram-mais-em-2025-diz-pesquisa-de-servicos/)
- [Rotatividade no setor — Abrasel](https://abrasel.com.br/noticias/noticias/rotatividade-de-mao-de-obra-segue-alta-nos-bares-e-restaurantes/) · [Monitor Mercantil](https://monitormercantil.com.br/rotatividade-de-mao-de-obra-segue-alta-em-bares-e-restaurantes/)
- [Quantos restaurantes tem no Brasil — OndeAbrir (fonte secundária)](https://ondeabrir.com/blog/quantos-restaurantes-tem-no-brasil)
- [PEC do Fim da Escala 6x1 — Wikipédia (atualizada em 03/09/2026)](https://pt.wikipedia.org/wiki/PEC_do_Fim_da_Escala_6x1)

**Pesquisa de 01/10/2026**
- [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Pesquisa_de_Concorrentes_2026-10-01|Relatório consolidado]]
- [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/estudo-modelo-de-negocio-e-features|Estudo de modelo de negócio e features]]
- [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/mapa-df-concorrencia-real|Mapa da concorrência real no DF]] — CCT 2026/2028, anúncios, agências e portais
- [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-df-e-lojas|Painel de lojas e presença no DF]] · [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/painel-reclame-aqui|Painel do Reclame Aqui]]
- [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/referencias-globais-staffing|Referências globais de staffing por turno]] · [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/casos-yolo-e-duogourmet|Casos YOLO Club e Duo Gourmet]]
- Sínteses dos grupos [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/grupo-1-sintese|1]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/grupo-2-sintese|2]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/grupo-3-sintese|3]], [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/grupo-4-sintese|4]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/grupo-extra-sintese|extra]]
- Auditorias dos grupos [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/auditoria-grupo-3|3]] e [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/auditoria-grupo-4|4]] e das [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/auditoria-referencias-globais|referências globais]]

---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
