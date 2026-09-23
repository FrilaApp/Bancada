---
tipo: documento-produto
desafio: C18
data_criacao: 2026-09-15
origem: "Frila/Documentos/MD/04-MERCADO-E-CONCORRENCIA.md"
tags: [produto, frila]
---

# Frila — Mercado e Concorrência

**Versão 1.1 · 23 de setembro de 2026**

Como o mercado de trabalho avulso em food service, eventos e campanha política funciona hoje, quem já compete nele, e por que grupo de WhatsApp ainda é o canal dominante apesar dos concorrentes existirem.

> **Campanha política saiu do radar do produto em 21/09/2026.** A evidência fica registrada como oportunidade futura.

Convenções: `[H]` = hipótese ou estimativa, nunca confirmada em campo. Números de tração de concorrentes são **o que cada empresa declara** — nenhum foi auditado, salvo quando sinalizado o contrário. Pesquisa original feita em 2026-09-10, aprofundada em setembro/2026. A varredura da App Store de 23/09/2026 acrescentou oito fichas: o que vem dela está marcado como **captura de 23/09** e é só o que a loja mostrava naquele dia — sem instalação, sem conta criada e sem checagem no DF.

Este é o documento de origem da pesquisa de mercado e concorrência. As avaliações de quem trabalha nesses aplicativos estão transcritas em `01-O-PROBLEMA.md` §3.1, o que o Frila propõe em resposta está em `02-O-NEGOCIO.md` e `03-ESPECIFICACAO-DO-PRODUTO.md`, e a versão resumida de tudo, em `README.md`.

---

## 1. Resumo

O Distrito Federal está, até onde a pesquisa alcança, vazio de concorrência especializada. Dos 19 concorrentes brasileiros mapeados em food service, eventos e trabalho avulso, só um — o GetNinjas, que nem é especializado nesse nicho — tem presença comprovável em Brasília, com páginas de categoria e vagas reais na cidade. Todos os outros ou não declaram o DF, ou declaram operação "nacional" sem nenhuma evidência de vaga publicada aqui.

O padrão mais forte que se repete entre praticamente todos os concorrentes pesquisados não é falta de usuários cadastrados — é a desproporção entre cadastro e liquidez real. A Freela Serviços declara quase 200 mil profissionais cadastrados e apenas 203 contratações concluídas. A Worc chegou a anunciar mais de 1.400 vagas abertas numa página de marketing que, na mesma sessão, mostrou zero vagas no próprio quadro ao vivo. A eFreela alega 300 mil usuários contra pouco mais de 100 mil instalações mensuráveis no Android. Cadastro não é liquidez — e é exatamente esse hiato que o despacho ativo do Frila tenta fechar, notificando quem é elegível em vez de esperar alguém procurar.

**Ressalva de 23/09/2026.** Uma varredura direta na App Store acrescentou oito fichas à lista, sete delas inéditas no projeto — e duas mostram, já publicadas, aquilo que o Frila trata como diferencial: o **Freelas Now** abre num mapa de "Freelancers Próximos" com a aba "pra agora", e o **Freelas** mostra ranking de confiança com cancelamentos. Nenhum dos oito foi aberto com endereço em Brasília, então nada aqui derruba ainda o parágrafo acima; o que muda é o tamanho da lista a checar, de dois apps para dez, e o fato de que a barreira de entrada é visivelmente baixa: quase todos têm de 2 a 15 avaliações e vários foram publicados por pessoa física.

Do lado de quem trabalha, a queixa se repete de empresa para empresa, independente do modelo de cobrança: pagamento atrasado ou retido (Switch, Closeer, eFreela), bloqueio de cadastro sem processo justo (estaff), moeda gasta sem retorno (GetNinjas). A instabilidade institucional do setor também é maior do que a superfície sugere: a Toopa parece ter saído do mercado, e o controlador do GetNinjas está sob investigação por infiltração do crime organizado no mercado de capitais, sem publicar balanço desde 2024. Um mercado com vários concorrentes "estabelecidos" pode, na prática, estar mais aberto do que parece.

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

---

## 3. Panorama competitivo

| Concorrente | Foco | Como cobra | Tração declarada (não auditado) | Presença no DF | Nota agregada |
|---|---|---|---|---|---|
| **GetNinjas** | Serviços gerais — não especializado | Profissional paga por "moedas" para desbloquear contato do lead; contratante não paga | +2 milhões de profissionais, +3 mil cidades | **Confirmada** — páginas de categoria ativas em Brasília, inclusive eventos | App Store 4,2/5 (~17 mil) · Google Play 3,7/5 (~182 mil) |
| **Switch** | Bares, restaurantes, hotéis, supermercados | Contratante paga por hora + sobretaxas (urgência, cancelamento, cartão, atraso) | Entre 40 mil e 75 mil "serviços" — 4 números diferentes na própria home, nunca reconciliados | Não — Vitória, SP, BH, RJ | App Store 4,8/5 (2,2 mil) |
| **Closeer** | Food service, hotelaria, varejo, eventos | Percentual por job, pago pelo contratante (valor não divulgado) | 1,1 mi jobs, 670 mil profissionais, 6 mil unidades | Não verificado — sede em SP | App Store 4,1/5 (562) · Google Play 4,6/5 (5.674) · Reclame Aqui 8,5/10 |
| **estaff** | Bares, restaurantes, buffets, eventos, hotéis — único com modelo dual freela + CLT | Comissão do contratante (% não pública); grátis para o profissional | 1,4 milhão de profissionais (inconsistente com captura anterior de 686 mil) | Não verificado | App Store 3,1/5 (546) — a mais baixa do grupo |
| **eFreela** | Bares, restaurantes, hotéis, eventos | ~10% do contratante (não confirmado em 1ª mão) | 300 mil "usam a plataforma" vs. só 100 mil+ instalações no Android | Não — GO, MG, SP, RJ, MA, AL | App Store 4,6/5 (~1,5 mil) · Google Play 3,1/5 (178) |
| **Freela Serviços** | Eventos, bares, festas, **campanha política** | Híbrido: mensalidade decrescente (R$0–499) + taxa de 10–20% | 198 mil profissionais, mas só 203 contratações concluídas | Não verificado — "todo o Brasil" | Google Play: 1.000+ instalações, 1 avaliação · App Store 3,7/5 (15), nº 99 em Negócios em 23/09 |
| **Worc** | Recrutamento/gestão de mão de obra para foodservice (B2B) | Assinatura mensal/trimestral do contratante; grátis para o candidato | 3 números diferentes na própria home (40 mil / 2 mi / 5 mi+ "oportunidades") | Não verificado | Reclame Aqui 4,3/10 — "Não Recomendada" |
| **Toopa** | Bares, restaurantes, hotéis, eventos | 10% do contratante, sem mensalidade | 500+ estabelecimentos, 2 mil candidatos (dado de 2021) | Tinha o DF no roadmap de 2021, nunca confirmado — empresa provavelmente **inativa em 2026** | Sem reviews localizadas em nenhuma fonte |
| **TradePRO Freelance** | Trade marketing no varejo — adjacente | "Taxa zero" para o promotor, exige MEI | Não divulgada | Não verificado | Dados insuficientes |
| **JobHunter** | Classificados genéricos de bicos — adjacente | Gratuito para os dois lados | ~33 mil cadastrados, 200+ cidades | Não verificado | App Store sem avaliação em 23/09; listado em Produtividade, não em Negócios |
| **Freelas Now** *(captura de 23/09)* | Bares e restaurantes — freelancer por proximidade, "pra agora" | Taxa do app cobrada da empresa, visível na tela de contratação (percentual não divulgado); compras dentro do app | Não divulgada | Não verificado — capturas em São Paulo | App Store 5,0/5 (4) |
| **Freelas** *(captura de 23/09)* | Eventos: casamento, buffet, equipe por função | Não observado; a vaga declara pagamento em PIX toda segunda-feira | Não divulgada | Não verificado | App Store 3,7/5 (3) |
| **UmFreela** *(captura de 23/09)* | Gastronomia, hotelaria e eventos | Profissional não paga e recebe o valor integral; "a primeira vaga é sempre grátis" para a empresa (site) | Não divulgada | Declara "todo o Brasil", com filtro por cidade — sem vaga verificada no DF | App Store 4,3/5 (6) |
| **BIKO** *(captura de 23/09)* | Eventos e recepção | Não observado — o app mostra "saldo a receber", logo intermedia o pagamento | Não divulgada | Não verificado — captura em São Paulo | App Store 4,3/5 (4) |
| **Staff BR** *(captura de 23/09)* | Trabalho temporário por diária | Não observado | Não divulgada | Não verificado | App Store 4,4/5 (7) |
| **Meu Freelance** *(captura de 23/09)* | Trabalho avulso com busca "perto de você" | Não observado | Não divulgada | Não verificado | App Store sem avaliação |
| **Trampei Serviços** *(captura de 23/09)* | Serviços em geral — três tipos de conta, inclusive empresa | Compras dentro do app | Não divulgada | Não verificado | App Store 4,0/5 (2) |
| **Bicos** *(captura de 23/09)* | Serviço doméstico: pintura, limpeza, jardinagem, pequenos reparos — adjacente | Não observado | Não divulgada | Não verificado | App Store sem avaliação |
| **Fiverr** | Freelance digital 100% remoto — referência de modelo, não concorrente direto | Take rate ~28% do vendedor + assinatura opcional (US$15–49/mês) | Receita em queda (−10% a/a); receita de assinatura/serviços crescendo (+2% a/a) | Não aplicável (remoto) | Trustpilot 2,5/5, polarizado |

**Sobre a loja.** As notas acima são majoritariamente da App Store. A tabela de `01-O-PROBLEMA.md` §3.1 mede os mesmos aplicativos no Google Play, e por isso os números são bem diferentes: lá a Closeer aparece com 4,6 e 5.674 avaliações, a estaff com 4,0 e 3.263. Não é contradição, é loja diferente — no Brasil o Android concentra muito mais avaliação. **Toda nota só significa alguma coisa junto com a loja e a data.**

Uma correção de rótulo, feita por verificação direta em 14/09/2026: a nota da Closeer registrada antes como "Google Play 4,1 (559)" é da **App Store**, que hoje mostra 4,1 com 562 avaliações ([ficha](https://apps.apple.com/br/app/closeer-trabalho-freelancer/id1440858117)). A nota real da Closeer no Google Play é a de `01`, 4,6 com 5.674.

---

## 4. Concorrentes — perfis

### GetNinjas

O único concorrente com presença comprovável no Distrito Federal — não por alegação de marketing, mas por produto real: `getninjas.com.br/local/df/brasilia` e `/eventos/df/brasilia` estão no ar, com categorias como garçom, bartender, segurança e DJ listadas para Brasília, e páginas de categoria com contadores específicos da cidade (ex.: eletricistas, "1.234 cadastrados desde 2018, ~1.742 ativos"). **Dado**, verificado por acesso direto em 14/09/2026.

Não é especializado em food service ou eventos — é um marketplace geral de serviços (reforma, aulas, beleza, tecnologia, e também eventos). Contratante não paga nada; profissional paga por um sistema de moedas pré-pagas (1 moeda = R$0,15; pacotes históricos de R$149 a R$599, expiram em 3 meses) para desbloquear o contato de cada lead. A plataforma não cobra comissão sobre o valor do serviço fechado. **Fonte interessada** (getninjas.com.br, help.getninjas.com, acesso 14/09/2026).

**Tração declarada:** +2 milhões de profissionais cadastrados, +3 mil cidades — não auditado.

**Pontos fortes:** volume de avaliação muito maior que qualquer outro concorrente pesquisado (App Store ~17 mil avaliações, 4,2/5; Google Play ~182 mil, 3,7/5), dando mais robustez estatística à nota. Reclame Aqui entre 8,8 e 9,1/10, 100% de reclamações respondidas, 92,8% resolvidas.

**Pontos fracos — o sistema de moedas é a queixa dominante de quem trabalha.** Pelo menos 8 relatos distintos no Reclame Aqui com o mesmo padrão: "NÃO VALE A PENA", "PREÇO ABSURDO E LIBERAM MUITOS PROFISSIONAIS PARA CONTACTAR O CLIENTE", profissional que "gastou mais de R$700 em compras de moedas e apenas uma pessoa respondeu" (**Relato**, Reclame Aqui, acesso 14/09/2026). O cliente pode receber propostas de até 4 profissionais ao mesmo tempo — todos gastam moeda, só um fecha. Uma crítica jornalística independente chama o modelo de "leilão digital de trabalho humano" (Outras Palavras/DMT em Debate — texto bloqueado para leitura direta, título via busca).

**Risco institucional novo, fora do produto:** a controladora, Reag Investimentos, é um dos alvos da "Operação Carbono Oculto" — investigação de infiltração do crime organizado no mercado de capitais — e anunciou a venda do próprio controle acionário, com o fundador João Carlos Mansur deixando a presidência do conselho. Valor de mercado caiu de R$550 milhões (IPO 2021) para a faixa de R$250 milhões, sem publicar balanço desde o 3T24, gerando novo processo sancionador da CVM. **Dado** (Money Times, InvestNews, Times Brasil, acesso 14/09/2026).

**Fontes:** [getninjas.com.br — Brasília](https://www.getninjas.com.br/local/df/brasilia) · [getninjas.com.br — eventos DF](https://www.getninjas.com.br/eventos/df/brasilia) · [App Store](https://apps.apple.com/br/app/getninjas-para-profissional/id969564418) · [Google Play](https://play.google.com/store/apps/details?id=br.com.getninjas.pro) · [Money Times — Reag Invest](https://www.moneytimes.com.br/getninjas-ninj3-trocara-de-nome-para-reag-invest-empresa-ganhara-novo-ticker-rnda/) · [Times Brasil — venda de controle da Reag](https://timesbrasil.com.br/brasil/reag-investimentos-tratativas-venda-controle/) · [InvestNews — crise Reag](https://investnews.com.br/negocios/getninjas-crise-reag-aquisicao/) — acesso 14/09/2026.

### Switch

Marketplace de bares, restaurantes, hotéis e supermercados, fundada em 2018 em Vitória/ES. Contratante paga por hora conforme a função, sem mensalidade — mas com sobretaxas: 10% extra para pedidos com menos de 24h de antecedência, taxa de cancelamento, sobretaxa no pagamento por cartão, multa de 2% + juros 0,033%/dia por atraso. **Dado**, Termos de Uso (switchapp.com.br/termos-clientes, acesso 14/09/2026).

**A contradição de tração que o projeto já tinha identificado é real e pior do que parecia.** A própria Switch publica, hoje, em três páginas diferentes do mesmo domínio, quatro números distintos de "serviços atendidos": 40 mil, 50 mil (×2, em páginas diferentes) e 75 mil — nunca reconciliados entre si. **Dado**, verificado por acesso direto em 14/09/2026. Trate qualquer número de tração da Switch como piso de marketing, não como fato.

**Presença no DF:** não confirmada — as páginas oficiais citam sempre as mesmas 4 cidades (Grande Vitória, São Paulo, Belo Horizonte, Rio de Janeiro).

**Pontos fortes:** nota 4,8/5 na App Store (2,2 mil avaliações) do lado do profissional, e 4,9/5 (265 avaliações) do lado do estabelecimento — as notas agregadas mais altas do grupo pesquisado.

**Pontos fracos:** a nota alta convive com reviews textuais majoritariamente negativas — 3 das 4 avaliações com texto legível reclamam de remuneração baixa e atraso de repasse. **Relato** (App Store): "turno de R$100 vira ~R$73" (01/02/2022); "R$9–13/hora" (17/01/2023); "turno de 6h por R$60–70. Vale só se passando fome" (02/12/2025). No Reclame Aqui, apenas 14 reclamações registradas — poucas demais para ter nota de reputação, ao contrário de Closeer e estaff.

**Fontes:** [switchapp.com.br](https://switchapp.com.br/) · [switchapp.com.br/sobre](https://switchapp.com.br/sobre/) · [switchapp.com.br/termos-clientes](https://switchapp.com.br/termos-clientes/) · [App Store — profissionais](https://apps.apple.com/br/app/switch-profissionais/id1563290269) · [App Store — estabelecimentos](https://apps.apple.com/br/app/switch-estabelecimentos/id1563022915) — acesso 14/09/2026.

### Closeer

Plataforma de gestão e pagamento de mão de obra freelancer operacional (cozinha, restaurante, hotel, bar, eventos, varejo), com carteira digital e check-in/check-out por QR code. Fundada em fevereiro de 2019 — o modelo mudou desde então: uma reportagem de 2018 descreve um formato diferente (gratuito por 6 meses, depois 10% + mensalidade dando acesso a outros serviços como chaveiro/eletricista), sinal de pivô de produto ao longo do tempo. **Dado** (Gazeta do Povo, 14/12/2018; Projeto Draft, 07/06/2021). Hoje: percentual por job, pago pelo contratante, valor não divulgado.

**Tração declarada:** 1,1 milhão de jobs, R$150 milhões de renda gerada, 670 mil profissionais, 6 mil unidades de negócio — não auditado. A progressão desde 2020 (13 mil jobs → 35 mil projetados em 2021 → 1,1 milhão hoje) é grande mas plausível para 7 anos de operação.

**Presença no DF:** não confirmada — sede em São Paulo, sem menção ao DF em nenhuma fonte.

**Pontos fortes:** reputação "Ótima" no Reclame Aqui (8,5/10, 85,4% resolvidas, responde 100%); 4,1/5 na App Store (562 avaliações) e 4,6/5 no Google Play (5.674 avaliações), o maior volume de avaliação entre os concorrentes especializados. 6 de 10 reviews textuais coletadas são claramente positivas.

**Pontos fracos:** o tema mais recorrente nas queixas é pagamento — atraso ou falha. **Relato**: "Você trabalha e eles te pagam quando querem. Não indico" (Google Play, 03/05/2022); "Já trabalhei duas vezes de graça pois não recebi a notificação do aplicativo" (Google Play, 08/10/2023).

**Fontes:** [closeer.com.br](https://www.closeer.com.br/) · [Google Play](https://play.google.com/store/apps/details?id=com.closeer.closeer_worker) · [App Store](https://apps.apple.com/br/app/closeer-trabalho-freelancer/id1440858117) · [Projeto Draft (07/06/2021)](https://www.projetodraft.com/a-closeer-conecta-freelancers-da-area-operacional-a-empresas-dos-setores-de-food-service-hotelaria-e-varejo/) · [Gazeta do Povo (14/12/2018)](https://www.gazetadopovo.com.br/economia/aplicativos-conectam-bares-e-restaurantes-a-trabalhadores-intermitentes-f2oaed3lryqk6bb9tqunka2fi/) — acesso 14/09/2026.

### estaff

Único concorrente com modelo dual — vagas freela **e** vagas fixas CLT na mesma plataforma, atendendo bares, restaurantes, casas noturnas, hotéis e empresas de eventos. Gratuito para o profissional; contratante paga comissão de intermediação com "planos e condições distintas" não divulgadas publicamente. **Fonte interessada** (estaff.com.br, acesso 14/09/2026).

**Tração declarada:** inconsistente entre capturas — hoje o site declara 1,4 milhão de profissionais cadastrados; uma captura anterior indicava 686 mil. Mesmo padrão de números não reconciliados visto na Switch.

**Presença no DF:** não confirmada — exemplos de vaga mostrados no site são de São Paulo.

**Pontos fracos — a nota mais baixa do grupo pesquisado.** 3,1/5 na App Store (546 avaliações), e nenhuma das 4 reviews textuais coletadas foi positiva. **Relato**: bloqueio de cadastro sem aviso claro após 2 desistências, mesmo com antecedência de 2 dias ("Cancelei um freela com 2 dias de antecedência e fui punida ficando bloqueada 1 semana inteira", 1★); aprovação de candidatura chegando 30 minutos antes do horário da vaga; percepção de viés a favor do contratante em disputas. Reclame Aqui: nota 7,0/10 ("Bom"), mas satisfação entre quem reclamou é baixa (5,19/10), com 183 reclamações registradas.

**Fontes:** [estaff.com.br](https://estaff.com.br/) · [estaff.com.br/para-profissionais](https://estaff.com.br/para-profissionais) · [App Store](https://apps.apple.com/br/app/estaff-para-freelancers/id6470943542) — acesso 14/09/2026.

### eFreela

Marketplace de bicos para eventos e hospitalidade, fundada em outubro/2022 em Goiânia-GO — a mais nova do grupo. Contratante paga (indicado como ~10% do valor, não confirmado em primeira mão — página de termos bloqueou acesso direto); profissional não paga para se cadastrar.

**Tração declarada, com hiato grande e não explicado:** App Store hoje declara "mais de 300.000 freelancers usam a plataforma"; uma matéria de 2023 falava em 25 mil profissionais e 500+ empresas; a instalação mensurável no Google Play é de apenas 100.000+ (178 avaliações). Nenhuma fonte explica o salto de 25 mil para 300 mil entre 2023 e 2026.

**Presença no DF:** não confirmada — opera em 6 estados (GO, MG, SP, RJ, MA, AL), sem o DF.

**Pontos fortes:** app "Profissionais" bem avaliado na App Store (4,6/5, ~1,5 mil avaliações), com relatos como "Já fiz 8 freelas e não tive nenhum problema" (26/04/2024).

**Pontos fracos:** nota bem mais baixa no Android (3,1/5) que no iOS; app do lado empresa também baixo (3,7/5). **Relato**: dificuldade recorrente de saque ("Não consigo sacar o dinheiro na plataforma de jeito nenhum", 12/09/2024), tempo médio de resposta a reclamações de 66 dias no Reclame Aqui. Queixa de valor injusto: "11 horas por menos de 100 reais".

**Fontes:** [efreela.app](https://efreela.app/) · [App Store — Profissionais](https://apps.apple.com/br/app/efreela-profissionais/id1635147551) · [App Store — Empresas](https://apps.apple.com/br/app/efreela-empresas/id1635147083) · [Google Play](https://play.google.com/store/apps/details?id=com.lextar.efreelaapp) · [Revista Zelo (19/07/2023)](https://revistazelo.com.br/conheca-o-efreela-plataforma-para-contratar-freelancers-sem-burocracia/) — acesso 14/09/2026.

### Freela Serviços

Marketplace nacional que cobre bares, restaurantes, eventos, buffets e — overlap direto com o segmento de **campanhas eleitorais**, hoje fora do radar do produto — (panfletagem, bandeirista, motorista, coordenação). Contratante paga taxa percentual decrescente por volume: Grátis (R$0, 20%, 4 vagas/mês) · Básico (R$49,90/mês, 20%, 30 vagas) · VIP (R$299,90/mês, 15%, ilimitado) · Grandes Redes (R$499/mês, 10%, ilimitado). Seguro de acidentes pessoais incluso em toda contratação. Estrutura confirmada em 14/09/2026.

**Tração declarada, com o maior hiato de todo o grupo pesquisado:** contador ao vivo do site mostra 198.232 profissionais cadastrados, mas só **392 contratantes e 203 contratações concluídas**. No Google Play, o app tem apenas 1.000+ instalações e 1 avaliação. Não há nenhuma matéria de imprensa independente sobre a empresa — todos os números são autodeclarados, e a empresa não está registrada no Reclame Aqui (sem histórico de confiança).

**Presença no DF:** não confirmada — alega "todo o Brasil" sem evidência pontual.

**Pontos fortes:** estrutura de planos transparente e sem fidelidade; elogios pontuais de pagamento em dia.

**Pontos fracos:** bugs recorrentes relatados ("O app fecha na tua cara"; cadastro que trava no upload de vídeo).

**Nota lateral:** o nome "Freela" (sem "Serviços"), citado isoladamente numa lista solta de concorrentes deste projeto, **não é a Freela Serviços** — é ambiguidade de marca. Existiu um "Freela Brasil" (app de eventos, hoje extinto, nome reaproveitado por terceiros associados a golpe de curso) e outras empresas homônimas sem relação. Não há um concorrente oculto atrás do nome.

**Fontes:** [freelaservicos.com.br](https://www.freelaservicos.com.br/) · [App Store](https://apps.apple.com/br/app/freela-servi%C3%A7os/id6762235967) · [Google Play](https://play.google.com/store/apps/details?id=com.freela.freelancers) · [econodata.com.br — CNPJ](https://www.econodata.com.br/consulta-empresa/49745133000186-freela-servicos-de-aplicativos-ltda) — acesso 14/09/2026.

### Worc

Plataforma B2B de recrutamento e gestão de mão de obra para foodservice — cobra do **contratante** via assinatura mensal/trimestral (preço só sob consulta comercial), grátis para o candidato. Fundada no fim de 2018 em São Paulo; captou R$20 milhões em seed do SoftBank em 2021 (maior seed da América Latina à época — dado independente), e fez duas aquisições em 2022 (Hrestart, Ponto Predict).

**Sinal de alerta forte: a própria empresa publica três números de tração diferentes na mesma sessão de navegação.** A home diz "5+ milhões de oportunidades geradas" e "R$500+ milhões em GMV"; a página de vagas do mesmo site, no mesmo acesso, diz "mais de 2 milhões"; uma matéria de 2021 falava em "mais de 40.000". O quadro de vagas ao vivo do próprio site retornou **zero vagas** no acesso de 14/09/2026, apesar de uma página de marketing alegar "1.400+ vagas abertas" — contradição direta, observada ao vivo. O rodapé do site ainda diz "© Worc 2024".

**Presença no DF:** não confirmada — parcerias recentes são Rio de Janeiro (SindRio, jul/2026), São Paulo e Curitiba.

**Pontos fortes:** ainda operando ativamente (parceria nova com o SindRio em julho/2026); histórico de M&A mostra alguma capacidade de execução.

**Pontos fracos — as queixas vêm do lado contratante, não do trabalhador (padrão invertido em relação ao resto do grupo).** Reclame Aqui: reputação "Não Recomendada", 4,3/10, só 42,9% resolvidas, só 21,4% voltariam a negociar. **Relato** (7 relatos vistos): empresa que pagou mensalidade e "não recebeu ninguém para entrevistas"; renovação de contrato "sem eu deixar", inclusive após cancelamento confirmado por vídeo chamada; "não tinha banco de currículos qualificado nem para São Paulo". Um relato de ex-funcionário no Glassdoor menciona demissão de "mais de 70% do quadro" (nota agregada 2,9/5, 44% recomendam).

**Fontes:** [worc.com.br](https://www.worc.com.br/) · [app.worc.com.br/nossas-vagas](https://app.worc.com.br/nossas-vagas) · [app.worc.com.br/contrate-a-worc](https://app.worc.com.br/contrate-a-worc) · [Exame — aporte SoftBank](https://exame.com/tecnologia/startup-worc-de-recursos-humanos-recebe-aporte-de-r20-mi-do-softbank/) · [SindRio — parceria (07/2026)](https://www.sindrio.com.br/2026/07/banco-de-curriculos-sindrio-worc/) · [Reclame Aqui](https://www.reclameaqui.com.br/empresa/worc-plataforma-digital/) · [Glassdoor](https://www.glassdoor.com.br/Avalia%C3%A7%C3%B5es/Worc-Plataforma-Digital-S%C3%A3o-Paulo-SP-Avalia%C3%A7%C3%B5es-EI_IE4735042.0,23_IL.24,36_IC2479061.htm) — acesso 14/09/2026.

### Toopa

**Provavelmente inativa em 2026.** Conectava bares, restaurantes, hotéis e eventos via geolocalização, com contratante pagando 10% do valor à plataforma, sem mensalidade, repasse ao freelancer em até 3 dias úteis — dado de agosto/2021. Meta declarada para 2022 era 10 mil estabelecimentos e 100 mil profissionais, partindo de 500+ estabelecimentos e 2 mil candidatos em 2021 — nunca encontramos confirmação de que essa meta foi atingida.

**Sinais convergentes de que saiu do ar:** o domínio toopa.com.br não resolve por DNS; a ficha da App Store retorna erro 404; não há cobertura de imprensa depois de agosto/2021; não há nenhuma review de usuário localizável em nenhuma fonte. Nenhuma fonte isolada diz "a Toopa fechou" — é a convergência de sinais técnicos que sustenta essa leitura, registrada como achado, não como certeza absoluta.

**Sobre o DF:** em agosto de 2021, a empresa declarou à imprensa planos de expandir para mais 5 cidades ainda naquele ano, incluindo Brasília — nunca confirmado como executado, e hoje irrelevante dado o provável encerramento da operação.

**Fontes:** [Forbes Brasil (08/2021)](https://forbes.com.br/forbes-tech/2021/08/exclusiva-aplicativo-conecta-bares-e-restaurantes-a-funcionarios-freelancers-para-apoiar-a-retomada-do-setor/) · [ABC da Comunicação (08/2021)](https://www.abcdacomunicacao.com.br/retomada-startup-cria-aplicativo-para-conectar-bares-e-restaurantes-a-mao-de-obra-qualificada/) · [Guia do Freela (31/05/2023)](https://guiadofreela.com.br/4-aplicativos-para-freelancer-de-servicos-gerais/) — acesso 14/09/2026; teste de DNS e App Store realizado diretamente em 14/09/2026.

### TradePRO Freelance e JobHunter — concorrência adjacente

Nenhum dos dois compete diretamente no food service/eventos/campanha política — seguem catalogados aqui só por já terem sido citados no projeto.

**TradePRO Freelance:** conecta promotores de trade marketing (MEI) a empresas para execução pontual em ponto de venda. "Taxa zero" para o promotor; cobrança da empresa contratante não é pública. Expandiu para um segundo produto de gestão de equipes de campo ("TradePRO Promoter"). Sem número de tração encontrado.

**JobHunter:** classificados genéricos de bicos, gratuito para os dois lados, sem monetização visível. Declara ~33 mil cadastrados em 200+ cidades (não auditado) — categorização de "bico genérico" segue válida, não especializado em nenhum setor.

**Fontes:** [tradepro.com.br/freelance](https://tradepro.com.br/freelance/) · [home.jobhunterbr.com](https://home.jobhunterbr.com/) — acesso 14/09/2026.

### Varredura da App Store — 23/09/2026: oito fichas novas

Uma busca direta na App Store brasileira, em 23/09/2026, devolveu dez aplicativos de trabalho avulso, **oito deles ausentes de toda a pesquisa anterior** (o JobHunter e a Freela Serviços já estavam mapeados e só ganharam captura nova). Nada aqui foi instalado nem verificado em Brasília: é leitura de ficha de loja e de captura de tela. As imagens estão em `pesquisa/concorrentes/` e o detalhe item a item, na T-0006 do vault.

**Freelas Now** — o mais próximo da tese do Frila. Abre num **mapa de "Freelancers Próximos"** a partir do endereço do restaurante, com filtro por função (auxiliar de cozinha, barista), selo "Super Freela" e três modos de contratação: **Pra agora**, Agendar e Hora de saída. A vaga sai com valor de diária (R$ 130 na captura) e uniforme opcional. Na tela de contratação aparecem **"Taxa do app"** e **"Total cobrado da empresa"** — ou seja, cobra do contratante, como a hipótese do Frila —, além de contratação recorrente que reabre sozinha toda semana. O que o Frila faz diferente, no papel: o despacho notifica quem está perto em vez de mostrar um mapa para o contratante escolher, e o primeiro que aceita leva.

**Freelas ("Trabalhos em eventos")** — o mais próximo da nossa camada de confiança. A ficha do profissional traz **Ranking com Desempenho (5.0/5.0), Confiança em porcentagem, Trabalhos realizados e Cancelamentos**, e o contato sai por celular, WhatsApp e Instagram depois da confirmação. O evento declara função, valor por vaga (R$ 150 para garçom), uniforme, lanche, descanso de 30 minutos e pagamento em PIX às segundas. É reputação com denominador, feita de outro jeito: sem taxa de comparecimento por check-in, sem janela de contato com prazo e com um índice de "confiança" que passa de 100%.

**UmFreela** — já estava registrada na varredura de 20/09 como "a nossa tese no ar", agora com app aberto. O painel do contratante mostra **Vagas Ativas, Contratações e Média/Vaga**, com contratação por hora (R$ 20,00/h para auxiliar de cozinha na captura). O site declara custo zero e valor integral para o profissional e primeira vaga grátis para a empresa.

**Os outros cinco.** **BIKO** (eventos e recepção) mostra saldo a receber, média 4.8, turnos concluídos e contagem regressiva do próximo trabalho — logo intermedia pagamento. **Staff BR** separa cadastro de freelancer "por diárias" e de empresa. **Meu Freelance** tem candidaturas, agenda e busca "perto de você". **Trampei Serviços** abre com três tipos de conta (contratante, profissional e empresa contratante) e é generalista. **Bicos** é serviço doméstico — pintura, limpeza, jardinagem, pequenos reparos — e entra aqui como adjacente, junto de TradePRO e JobHunter, não como concorrente de turno.

**O que isso muda para o posicionamento.** Proximidade, urgência, reputação bilateral e contato direto depois do aceite não são mais território vazio na App Store brasileira: estão publicados, ainda que em apps pequenos e sem liquidez visível. O diferencial defensável do Frila deixa de ser "ninguém faz isso" e passa a ser **como** se faz — despacho que avisa quem é elegível em vez de vitrine, primeiro que aceita leva, taxa de comparecimento medida por check-in com denominador explícito, contato limitado a sete dias e nenhum custo para o profissional. E a checagem no DF, que a varredura de 20/09 pediu para dois apps, agora vale para dez.

**Fontes:** fichas da App Store brasileira e capturas de tela feitas em 23/09/2026; imagens em `pesquisa/concorrentes/concorrente-*.png` e na T-0006 (`04 - Tarefas/Anexos/`).

### Fiverr — referência de modelo, não concorrente direto

Marketplace global 100% remoto (design, programação, redação, marketing) — sem componente presencial, categoricamente diferente do Frila. Relevante aqui só como referência de modelo de cobrança: take rate de marketplace de 28,0% (12 meses até jun/2026), cobrado majoritariamente do vendedor, mais uma assinatura opcional do lado do profissional (Seller Plus, 3 níveis de US$15 a US$49/mês).

**O dado mais relevante para o Frila:** nos resultados financeiros públicos mais recentes, a receita de marketplace (comissão pura) caiu 15,5% ano a ano, enquanto a receita de "serviços" (que inclui a camada de assinatura) cresceu 2% — sinal de que receita recorrente por assinatura é mais resiliente que comissão pura, mesmo para quem já domina a transação. Compradores ativos caíram 21,9% a/a; a empresa atribui isso à adoção de IA comprimindo trabalho de baixo valor.

**Reviews:** Trustpilot 2,5/5, fortemente polarizado (49% dão 5 estrelas, 35% dão 1 estrela); queixas recorrentes de suporte lento e disputas de reembolso que raramente favorecem o comprador; onda de banimento de conta de vendedor em 2026 sem processo de apelação claro.

**Fontes:** [StockTitan — resultado Q2 2026](https://www.stocktitan.net/news/FVRR/fiverr-announces-second-quarter-2026-o0quisjjfetp.html) · [Fiverr Help Center — Seller Plus](https://help.fiverr.com/hc/en-us/articles/360017140717-Seller-Plus-Standard-and-Premium-Advanced-tools-for-business-growth) · [Trustpilot](https://www.trustpilot.com/review/www.fiverr.com) — acesso 14/09/2026.

---

## 5. Referências internacionais

Fora do Brasil, os players de staffing sob demanda para hospitality cobram markup sobre a hora trabalhada, não assinatura:

**Instawork** (EUA/Canadá) — tarifa horária "all-inclusive" (pagamento + markup); o percentual fixo de ~35% citado por comparativos de terceiros não é mais divulgado pela própria empresa, que hoje fala em "piso + tarifa dinâmica". Taxa de efetivação CLT-equivalente de US$2.500, reduzida a US$1.000 após 320h da mesma pessoa na empresa, e zerada após 480h (achado novo). +15 mil empresas, +10 milhões de profissionais pré-avaliados, 400+ cidades — não auditado.

**Qwick** (EUA) — markup de ~40% por turno. **Achado relevante:** há evidência jornalística consistente (Daily Journal, Bloomberg Law, SF Examiner, mais um site dedicado de ação coletiva) de estresse jurídico-financeiro sério — um acordo de US$2,1 milhões por má classificação de trabalhadores, uma decisão judicial de US$1,5 milhão + multas, e reportagem de que a empresa "entrou em processo de falência" colocando em risco pagamentos a ~6.000 ex-trabalhadores. O site institucional, verificado hoje, aparenta operação normal — a reconciliação entre "falência reportada" e "site operando" não foi possível confirmar. **Lacuna** para aprofundamento futuro caso a Qwick vire referência direta de benchmarking.

**7shifts** — não é marketplace de mão de obra, é software de escala/gestão de turnos para restaurantes (categoria adjacente, não concorrente). Preço em camadas por unidade: grátis até 15 funcionários, até US$134,99/mês nos planos maiores — confirmado por fonte atualizada de julho/2026.

**Fontes:** [help.instawork.com](https://help.instawork.com/en/articles/9658444-choose-pricing) · [ShiftNOW — Qwick vs. Instawork (22/06/2026)](https://www.shiftnow.com/blog/qwick-vs-instawork) · [Daily Journal — falência da Qwick](https://www.dailyjournal.com/article/385916-payouts-in-jeopardy-as-staffing-platform-qwick-enters-bankruptcy) · [Bloomberg Law](https://news.bloomberglaw.com/litigation/qwick-will-pay-2-1-million-to-settle-misclassification-suit) · [costbench.com — 7shifts (verificado 30/07/2026)](https://costbench.com/software/employee-scheduling/7shifts/) — acesso 14/09/2026.

---

## 6. Por que o WhatsApp ainda vence

`01-O-PROBLEMA.md` já mostra os números: WhatsApp está em 98,3% dos smartphones brasileiros e é o canal comercial de 82% dos pequenos negócios — grátis, universal, sem fricção de cadastro. A pesquisa de concorrência aprofunda essa leitura por outro ângulo: mesmo com 11 concorrentes brasileiros diretos ou adjacentes já operando, nenhum deles resolveu o problema bem o suficiente para deslocar o grupo de WhatsApp como canal dominante. Três razões aparecem nos dados:

**1. Cadastro não é liquidez, e isso se repete em quase todo concorrente pesquisado.** A Freela Serviços declara 198 mil profissionais cadastrados contra 203 contratações concluídas. A eFreela alega 300 mil usuários contra pouco mais de 100 mil instalações mensuráveis no Android. A Worc chegou a anunciar "1.400+ vagas abertas" numa página que, na mesma sessão, mostrou zero vagas no próprio quadro ao vivo. Um grupo de WhatsApp não promete uma base cadastrada — promete uma vaga publicada agora, vista por quem está no grupo agora. Para quem precisa resolver uma falta em duas horas, isso pesa mais que qualquer número de cadastro.

**2. A queixa dominante de quem trabalha é não ser chamado, não falta de vaga** (já registrado em `01-O-PROBLEMA.md` §3.1) — e a pesquisa de concorrência mostra que isso se repete além dos três apps já analisados lá: GetNinjas (moeda gasta sem retorno), estaff (bloqueio de cadastro sem processo justo), Switch e eFreela (pagamento atrasado ou retido). Um grupo de WhatsApp não tem esse tipo de fricção estrutural — quem está no grupo vê a vaga e se candidata direto para quem publicou, sem intermediário decidindo quem é "escolhido".

**3. Nenhum concorrente pesquisado tem presença comprovável no Distrito Federal, exceto o GetNinjas** — que não é especializado no setor. Isso não é evidência de que o WhatsApp "vence" tecnicamente; é evidência de que, no mercado específico que o Frila quer atender primeiro, o WhatsApp não tem concorrência de produto nenhuma — só tem a opção de continuar sendo usado, porque é a única ferramenta já testada localmente.

**O que isso não permite concluir** (mantendo o mesmo rigor de `01-O-PROBLEMA.md` §4.1): não há medida independente de que o WhatsApp "funcione mal" — o que existe é ausência de garantia estrutural, e agora evidência de que os concorrentes que prometem essa garantia também falham nela com frequência, só que de um jeito mais visível e documentado (reviews, Reclame Aqui) do que o WhatsApp, que não deixa rastro público de falha.

---

## 7. Insights estratégicos

**O Distrito Federal está, até onde esta pesquisa alcança, vazio de concorrência especializada.** Nenhum dos 19 concorrentes brasileiros de food service/eventos declara ou demonstra operação real no DF — a única presença confirmada é do GetNinjas, um marketplace generalista. A estratégia territorial do Frila (dominar o DF antes de expandir) não está competindo contra um incumbente local — está competindo contra o WhatsApp e contra a ausência de alternativa. É o que sustenta a densidade no DF como primeira barreira de entrada em `02-O-NEGOCIO.md` §6, com a ressalva de que janela aberta não é vantagem permanente.

**A janela é mais estreita do que parecia, e a tese já tem cópia publicada.** A varredura de 23/09 mostrou oito aplicativos que a pesquisa não tinha, dois deles com proximidade e urgência na tela inicial (Freelas Now) e reputação com cancelamentos na ficha do profissional (Freelas). Nenhum foi verificado em Brasília e todos são pequenos — de 2 a 15 avaliações na App Store —, mas o recado é o mesmo: o custo de publicar um app desses é baixo e o diferencial do Frila precisa estar na execução do despacho e na medida de comparecimento, não na ideia. Checar os dez no DF é a tarefa que fecha essa dúvida.

**O padrão "cadastro não é liquidez" é a vulnerabilidade estrutural mais repetida do setor**, presente em praticamente todo concorrente pesquisado com número de tração verificável. O despacho ativo do Frila — notificar quem é elegível em vez de esperar candidatura — ataca esse ponto especificamente, em vez de competir em volume de cadastro. O desenho desse mecanismo está em `03-ESPECIFICACAO-DO-PRODUTO.md`.

**As piores avaliações do setor vêm quase sempre do lado de quem trabalha, independente do modelo de cobrança** — pagamento atrasado (Switch, Closeer, eFreela), bloqueio sem processo justo (estaff), moeda gasta sem retorno (GetNinjas). Isso reforça, agora com evidência de mercado e não só de pesquisa de problema, que a aposta do Frila em reputação binária e ausência de custo para o profissional mira o ponto certo.

**O mercado é mais instável do que a lista de concorrentes sugere à primeira vista.** A Toopa parece ter saído de operação; a Worc publica três números de tração contraditórios na própria home e tem reputação "Não Recomendada"; o controlador do GetNinjas está sob investigação por infiltração do crime organizado no mercado de capitais e não publica balanço desde 2024; a Qwick (referência internacional) tem indícios de processo de falência. Vários concorrentes "estabelecidos" carregam problemas sérios de execução ou de saúde institucional — o que é mais oportunidade do que ameaça para um entrante regional com densidade real.

**A Freela Serviços já atende campanha política** — é o único concorrente com overlap direto nesse segmento, que saiu do radar do produto em 21/09/2026. Vale investigar mais de perto se a campanha política voltar a ser prioridade.

---

## Fontes

As fontes de cada concorrente estão listadas ao final do respectivo perfil, nas seções 4 e 5. Abaixo, as fontes de mercado usadas na seção 2.

**Mercado**
- [Setor de bares e restaurantes do DF e o fim da 6x1 — Correio Braziliense (05/2026)](https://www.correiobraziliense.com.br/euestudante/trabalho-e-formacao/2026/05/7426839-setor-de-bares-e-restaurantes-do-df-preve-alta-de-ate-8-nos-cardapios-com-fim-da-6x1.html)
- [Mais da metade de bares e restaurantes opera sem lucro no DF — Correio Braziliense (09/2025)](https://www.correiobraziliense.com.br/cidades-df/2025/09/7240809-mais-da-metade-de-bares-e-restaurantes-opera-sem-lucro-no-df.html)
- [Faturamento do setor em 2025 — Abrasel](https://abrasel.com.br/noticias/noticias/bares-e-restaurantes-faturaram-mais-em-2025-diz-pesquisa-de-servicos/)
- [Rotatividade no setor — Abrasel](https://abrasel.com.br/noticias/noticias/rotatividade-de-mao-de-obra-segue-alta-nos-bares-e-restaurantes/) · [Monitor Mercantil](https://monitormercantil.com.br/rotatividade-de-mao-de-obra-segue-alta-em-bares-e-restaurantes/)
- [Quantos restaurantes tem no Brasil — OndeAbrir (fonte secundária)](https://ondeabrir.com/blog/quantos-restaurantes-tem-no-brasil)
- [PEC do Fim da Escala 6x1 — Wikipédia (atualizada em 03/09/2026)](https://pt.wikipedia.org/wiki/PEC_do_Fim_da_Escala_6x1)

---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
