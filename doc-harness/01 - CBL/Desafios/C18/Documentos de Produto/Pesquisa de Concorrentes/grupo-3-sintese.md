---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/grupo-3-sintese.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Síntese do Grupo 3: Staffing de Nicho

O **Grupo 3** reúne cinco plataformas brasileiras dedicadas ao fornecimento pontual e gestão de mão de obra para hospitalidade, bares, restaurantes e eventos: **UmFreela**, **StaffPRO**, **Staff BR**, **Freelas Eventos** e **Lan Up**. 

Diferente dos marketplaces generalistas (Grupo 2) ou dos líderes nacionais consolidados em grandes capitais (Grupo 1), os integrantes deste grupo operam em recortes específicos: experimentações regionais independentes, spin-offs corporativos com foco em tecnologia e casos de migração/pivô para modelos B2B SaaS.

---

## 1. Tabela Comparativa do Grupo 3

| App | Empresa / CNPJ | Quem paga | Quanto custa | Pagamento no app? | Cobertura principal | Atua no DF? | Nota lojas (iOS / Android) | Tração / Downloads | Features-chave |
|---|---|---|---|---|---|---|---|---|---|
| **UmFreela** | MJM Sistemas de Software Ltda | Contratante | Starter: R$ 0/mês + R$ 3,99/vaga (1ª grátis); Pro: R$ 34,90/mês + R$ 1,49/vaga | **Não** (Pix direto no balcão contratante -> freela) | RS (Porto Alegre e Santa Maria) | **Sem evidência pública** (0 vagas ativas) | iOS: 4,3 (6) <br>Android: s/ nota | Google Play: 100+ downloads | Feed de vagas aberto, 1ª vaga grátis, 0% de desconto da diária do freela, chat direto |
| **StaffPRO** | STAFF PRO APLICATIVO LTDA <br>(CNPJ 59.088.370/0001-75) | Contratante (Produtoras B2B) | Não divulgado (cotação fechada sob demanda por evento B2B) | **Sim** (Repasse centralizado pós-evento em 5 a 15 dias) | SP (Capital e Litoral) e RJ | **Sem evidência pública** (sem eventos regulares no DF) | iOS: 3,1 (17) <br>Android: 3,1 (153) | Google Play: 10.000+ <br>Declarado: 35k diárias, R$ 6M transacionados, 32k freelas | MEI obrigatório, controle severo de atrasos por GPS, equipes massivas de camarotes/shows |
| **Staff BR** | FUTEBOLCARD SISTEMAS LTDA <br>(CNPJ 01.329.666/0001-50) | Contratante | Grátis para freela; Contratante paga taxa % só sobre vaga preenchida com sucesso | **Sim** (Pix no checkout; 30s declarados pela empresa) | Floripa (SC), SP (SP) e Recife (PE) | **Sem evidência pública** (sem operação ativa) | iOS: 4,4 (7) <br>Android: 4,2 (13) | Google Play: 1.000+ <br>Declarado: 98% comparecimento, 11 min p/ 1º aceite | Reconhecimento facial nativo, Pix no checkout (30s declarados pela empresa), matching por IA, substituição automática |
| **Freelas Eventos** | Leandro Porta / Portapps | Contratante / Comunitário | Acesso comunitário / sem tabela pública no onboarding 2026 | **Não** (Apontamento no app, liquidação direta) | Interior de SP (festas, formaturas e casamentos) | **Sem evidência pública** (sem operação) | iOS: 3,7 (3) <br>Android: s/ nota (<5) | Google Play: 1.000+ downloads | Gestão de "Eventos Multi-dias", lista de favoritos com aceite automático, ranking de confiança, chat por evento |
| **Lan Up** | LANUP TECNOLOGIA LTDA <br>(CNPJ 37.424.705/0001-46) | Contratante (Terceirizadas) | SaaS B2B: R$ 200 a R$ 2.000/mês + módulos (Admissão R$ 10, ASO R$ 40, Ponto R$ 100/mês) | **Sim** (Módulo de pagamento em lote via Pix) | SP / Grande ABC (clientes corporativos) | **Sem evidência pública** (não opera marketplace de vagas) | iOS: 3,8 (30) <br>Android: 3,2 (202) | Google Play: 50.000+ downloads | Relógio de Ponto Portaria 671 MTE com geolocalização, admissão digital eSocial, exames SST/ASO |

---

## 2. Padrões do Grupo: O Que Funciona e O Que Falha

A análise cruzada dos 5 concorrentes do Grupo 3 revela padrões estruturais sobre a mecânica de trabalho sob demanda no Brasil:

### O Que Funciona
1. **Pix Automático no Encerramento do Turno (O "Efeito Staff BR"):** A maior fonte de atrito na vida do trabalhador avulso é a incerteza do recebimento. Enquanto a StaffPRO retém repasses por até 15 dias (gerando nota 3,1 e avalanche de queixas), o **Staff BR** acertou em cheio ao atrelar o checkout do gerente ao disparo de um Pix instantâneo (a empresa declara liquidação em até 30 segundos no site institucional; avaliações de usuários confirmam recebimento imediato). É a feature mais elogiada pelos usuários nas lojas.
2. **Reconhecimento Facial e Validação Anti-Fraude:** Em operações de grandes eventos e bares movimentados, a identidade do profissional é crítica. O modelo do Staff BR (aproveitando o know-how biométrico de estádios da Futebolcard) elimina a clássica fraude do trabalhador que envia um terceiro não qualificado em seu lugar.
3. **Mecanismo de "Favoritos" e Escala Consecutiva (Freelas Eventos):** Contratantes de eventos e bares odeiam ter que entrevistar desconhecidos a cada rodada. O recurso do Freelas Eventos que permite "favoritar os melhores garçons" e emitir convites prioritários automáticos com suporte a múltiplos dias espelha perfeitamente a dinâmica real da hotelaria e dos buffets.
4. **Segurança Jurídica e Ponto Eletrônico Fiel (Lan Up):** A conformidade com a Portaria 671 do MTE e cerca virtual dá ao contratante a tranquilidade documental necessária para não sofrer passivos trabalhistas com alegações de horas extras ou vínculo empregatício.

### O Que Falha
1. **O Modelo "Lista Telefônica" com Pagamento Externo (UmFreela):** Deixar a transação financeira 100% por fora do aplicativo para fugir da complexidade de pagamentos é uma armadilha fatal. O contratante e o freelancer trocam contatos de WhatsApp no primeiro turno e nunca mais abrem o app para novas diárias (desintermediação instantânea).
2. **Burocracia Excessiva no Onboarding Inicial (StaffPRO):** Exigir MEI formal, upload de contratos sociais e selfies com validação manual lenta antes de permitir que o garçom pegue uma diária afasta mais de 80% dos interessados. O aplicativo acumula centenas de cadastros "em análise" que nunca são ativados.
3. **Assimetria e Abandono de Plataformas:**
   - O **Lan Up** abandonou a versão iOS sem atualizações desde dezembro de 2022, concentrando-se no Android e no painel web e frustrando gerentes e donos de restaurantes que operam com iPhone.
   - O **Freelas Eventos** possui versões para iOS e Android (1.000+ downloads no Google Play), mas sofre com desintermediação e falta de liquidação financeira própria.
4. **A Crise de Identidade do Marketplace vs. SaaS (Lan Up):** O Lan Up pivotou de um marketplace aberto de freelancers para um software corporativo fechado de terceirizadas, mas manteve o mesmo app com 50 mil downloads na loja. O resultado são centenas de avaliações de 1 estrela de pessoas que baixaram buscando bicos e encontraram uma tela vazia de ponto eletrônico.
5. **Vazio no Centro-Oeste e Ausência Absoluta no DF:** **Nenhum** dos 5 concorrentes do grupo possui presença, equipe de vendas, liquidez de vagas ou rede de parceiros no Distrito Federal. O mercado de Brasília continua totalmente refém de grupos desorganizados de WhatsApp.

---

## 3. Lições Concretas para o Frila

Cada uma das cinco análises individuais traz lições diretas para a arquitetura, modelo de negócio e estratégia de go-to-market do Frila:

### 1. De [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/umfreela|UmFreela]]: Como evitar a desintermediação e atrair os primeiros bares
* **A Lição:** O UmFreela comprovou que a **primeira vaga gratuita** e a **taxa zero para o profissional** são as melhores armas para convencer o dono do bar a testar a plataforma no momento de aperto. Contudo, deixar o pagamento da diária fora do app destrói a retenção a médio prazo.
* **Aplicação no Frila:** Oferecer a 1ª contratação com isenção de comissão para novos estabelecimentos no DF, mas **manter a liquidação financeira obrigatoriamente dentro do app** para garantir retenção, histórico de renda e governança.

### 2. De [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/staffpro|StaffPRO]]: O risco do pagamento tardio e do onboarding travado
* **A Lição:** A StaffPRO acumulou R$ 6 milhões em serviços prestados (volume transacionado/GMV declarado pela empresa, não faturamento próprio) focando no cliente B2B, mas foi punida nas lojas (nota 3,1) por pagar os freelancers com 5 a 15 dias de atraso e por ter um fluxo de validação de MEI burocrático e excludente.
* **Aplicação no Frila:** Não exigir MEI obrigatório no primeiro cadastro (permitir contratação de autônomo com CPF regularizado). Eliminar o prazo de espera: a liquidação financeira no Frila deve ser contínua e previsível, transformando o pagamento ágil no maior argumento de atração de mão de obra de qualidade no DF.

### 3. De [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/staff-br|Staff BR]]: A regra de ouro do Pix no Checkout e da Biometria Facial
* **A Lição:** O Staff BR alcançou a melhor avaliação das lojas (4,4 no iOS e 4,2 no Android) graças à combinação de: (a) Pix disparado no checkout após validação do turno (tempo de até 30 segundos declarado pela empresa no site); (b) reconhecimento facial que previne fraudes; e (c) mecanismo de substituição automática para combater faltas (com 98% de presença declarada).
* **Aplicação no Frila:** O Frila deve adotar como princípio sagrado de produto: **turno aprovado pelo contratante = Pix instantâneo na conta do freela**. Adicionar validação biométrica/facial simples no celular do trabalhador para dar aos restaurantes de Brasília total certeza de que a pessoa avaliada é quem realmente compareceu.

### 4. De [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/freelas-eventos|Freelas Eventos]]: A dinâmica real de buffets com múltiplos dias e favoritos
* **A Lição:** O Freelas Eventos identificou que o setor de eventos trabalha com "escalas de fim de semana" (sexta a domingo) e com "equipes de confiança" (atingindo 1.000+ downloads no Android e presença no iOS). Contudo, ao deixar o pagamento fora do app e sem garantia, fica vulnerável à desintermediação via WhatsApp após a formação inicial das equipes.
* **Aplicação no Frila:** Criar no Frila suporte nativo para turnos encadeados (ex: eventos de 2 a 3 dias) e a funcionalidade de "profissionais favoritos" com disparo prioritário antes de abrir a vaga para o feed público. Garantir paridade e excelência nativa em ambas as plataformas (iOS e Android).

### 5. De [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/lan-up|Lan Up]]: O valor do ponto eletrônico geolocalizado e a armadilha do posicionamento
* **A Lição:** A Lan Up provou que empresas contratantes valorizam controle de presença com validade jurídica (Portaria 671 MTE e cerca virtual) e pagamentos em lote via Pix. No entanto, errou ao deixar seu aplicativo público em confusão entre "mural de bicos" e "software fechado de terceirizadas".
* **Aplicação no Frila:** O check-in do Frila por geolocalização deve gerar um comprovante de presença com registro imutável de horário para blindar o restaurante parceiro contra passivos trabalhistas. A comunicação do app deve ser cristalina: um marketplace ágil de turnos avulsos para o ecossistema de hospitalidade.

---

## 4. O Vazio no DF e a Janela de Oportunidade do Frila

A constatação mais estratégica desta varredura é inequívoca: **nenhum dos cinco concorrentes possui operação, presença de campo ou densidade no Distrito Federal.**

* O **UmFreela** está restrito ao Rio Grande do Sul.
* O **StaffPRO** e a **Lan Up** estão concentrados na Grande São Paulo e circuito de megaeventos do Sudeste.
* O **Freelas Eventos** opera em escala artesanal no interior paulista.
* O **Staff BR** está posicionado no triângulo Florianópolis–São Paulo–Recife.

O Distrito Federal (com a terceira maior concentração de bares, restaurantes e embaixadas do país, além de um mercado bilionário de eventos corporativos e casamentos em Brasília) é uma **terra desabitada por plataformas dedicadas de staffing**.

A estratégia delineada no briefing — **nascer no DF, criar densidade orgânica local inexpugnável bairro a bairro (Asa Sul, Asa Norte, Águas Claras, Sudoeste, Pontão do Lago Sul) e consolidar os melhores estabelecimentos da capital antes de expandir nacionalmente** — encontra um cenário competitivo totalmente aberto, sem concorrentes diretos com liquidez ou relacionamento construído no mercado local.

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
