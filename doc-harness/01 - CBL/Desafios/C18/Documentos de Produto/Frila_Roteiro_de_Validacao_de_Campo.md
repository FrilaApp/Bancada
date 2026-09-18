---
tipo: documento-produto
titulo: "Roteiro e Protocolo de Validação de Campo no DF"
versao: "v1.0.0"
autor: "Júlia Clovandi (Product Owner / PM)"
desafio: C18
data: 2026-09-18
status: em-andamento
origem: "01 - CBL/Desafios/C18/Documentos de Produto/Frila_Roteiro_de_Validacao_de_Campo.md"
tags: [produto, validacao, customer-discovery, entrevistas, df, frila]
---

# 🎯 Roteiro e Protocolo de Validação de Campo no DF — Frila

> **Documento de Validação Empírica & Customer Discovery**  
> **Autora**: Júlia Clovandi (Product Owner / PM)  
> **Equipe BlendOps**: Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva  
> **Desafio**: CBL C18 — Apple Developer Academy (UCB)  
> **Data**: 18 de setembro de 2026 | **Versão**: v1.0.0  
> **Vinculação Operacional**: [[04 - Tarefas/T-0015 - Roteiro e entrevistas de validação de campo no DF|T-0015]]

---

## 1. Contexto e Objetivos

O projeto **Frila** encontra-se em estágio **TRL 2 (Conceito Tecnológico Formulado)**. Toda a modelagem financeira, a precificação B2B SaaS ([[04 - Tarefas/T-0010 - Estruturar o modelo de negócio e monetização do Frila|T-0010]]) e a arquitetura técnica ([[04 - Tarefas/T-0024 - Diagramas de classe, banco de dados e arquitetura|T-0024]]) apoiam-se em hipóteses formuladas a partir de dados públicos, métricas de concorrentes e relatórios setoriais (Abrasel, RAIS/CAGED, Reclame Aqui).

Para a **1ª Apple Review (28/09/2026)** e para a segurança do produto, é imperativo confrontar essas premissas com a realidade operacional de quem vive o dia a dia gastronômico no Distrito Federal.

### 1.1 Metas de Campo
- **50 conversas de descoberta** (meta final do ciclo), sendo:
  - **Mínimo de 15 Estabelecimentos Contratantes** (restaurantes de salão, bares de alto giro, hamburguerias e buffets de eventos).
  - **Mínimo de 15 Profissionais Autônomos** (garçons, cumins, bartenders, ajudantes de cozinha, cozinheiros).
  - **Mapeamento passivo de grupos de WhatsApp/Telegram de freela no DF** para extração de volumetria e diárias médias.

---

## 2. Princípios de Entrevista (The Mom Test)

Para evitar respostas de polidez ("nossa, que app legal, eu com certeza usaria"), as entrevistas devem seguir rigorosamente o método **The Mom Test**:

1. **Fale sobre a vida deles, não sobre a nossa ideia:** Nunca comece apresentando o Frila ou mostrando telas logo no início.
2. **Pergunte sobre fatos passados e números concretos, nunca sobre suposições futuras:**
   - ❌ *"Você usaria um aplicativo para chamar garçom em 20 minutos?"* (Gera falso positivo).
   - ✅ *"Quando foi a última vez que faltou alguém na sua equipe? O que você fez naquele momento e quanto tempo levou até resolver?"* (Gera dado real).
3. **Escute mais, fale menos:** O entrevistador deve falar menos de 20% do tempo. Deixe o silêncio agir para que o entrevistado detalhe as dores reais.

---

## 3. Roteiro A: Contratantes (Dono, Gerente, Maître)

*Público-alvo*: Gerentes operacionais, maîtres ou sócios-proprietários responsáveis pela escala de equipe em bares e restaurantes do DF.  
*Duração estimada*: 15 a 20 minutos.

### 3.1 Bloco 1: Contexto e Operação
1. Qual é o perfil do estabelecimento (salão à la carte, bar noturno, eventos) e quantos funcionários fixos compõem a operação hoje?
2. Em quais dias ou horários da semana o movimento costuma ter pico ou imprevisibilidade?
3. Vocês utilizam profissionais extras/freelancers com regularidade? Quantos por semana em média?

### 3.2 Bloco 2: A Dor do Desfalque e o "No-Show" (Furo)
4. Pensando nos **últimos três meses**, quantas vezes você precisou cobrir uma falta de última hora (no mesmo dia ou de véspera)?
5. Qual é o motivo mais comum para esses desfalques (atestado, imprevisto, simplesmente não apareceu)?
6. Quando uma pessoa combinada fura (*no-show*), como você fica sabendo? Ela avisa antes ou você descobre na hora que o turno começou?
7. **Impacto financeiro e operacional:** O que acontece na operação quando o salão ou a cozinha fica desfalcado num dia de pico? Já precisou fechar mesas, atrasou pedidos ou perdeu faturamento? Quanto você estima que um turno descoberto custa?

### 3.3 Bloco 3: O Fluxo Atual e a Inércia do WhatsApp
8. Me conte o passo a passo da **última vez** que você precisou de um freela urgente:
   - Quem você contatou primeiro?
   - Onde você postou (grupos de WhatsApp, lista de transmissão, ligação direta)?
   - Quanto tempo demorou entre a postagem e a confirmação de alguém seguro?
9. O que mais te irrita no processo atual pelo WhatsApp? (Ex: excesso de mensagens não qualificadas, gente perguntando o que já estava no anúncio, ter que ficar salvando contato novo na agenda).
10. Você já testou alguma plataforma ou aplicativo de contratação? Se sim, qual e por que não continuou usando? Se não, por que nunca buscou?

### 3.4 Bloco 4: Confiança, Seleção e Decisão
11. O que é inegociável para você colocar um profissional para dentro do seu salão ou cozinha pela primeira vez?
12. Ter a garantia de que o profissional já trabalhou em outros estabelecimentos conhecidos do DF e foi bem avaliado faria diferença?
13. Quem dá a palavra final na contratação de um extra: você, o maître ou o sócio?

### 3.5 Bloco 5: Economia e Disposição a Pagar (Validação de Monetização)
14. Qual é o valor médio da diária paga para um garçom/ajudante extra no DF hoje? O pagamento é feito ao final do turno (Pix/dinheiro)?
15. Você já precisou pagar um valor acima da tabela para conseguir alguém numa emergência? Quanto a mais?
16. *Cenário de teste de valor:* Se existisse uma solução que notificasse instantaneamente centenas de profissionais avaliados na sua região e garantisse alguém confirmado no seu estabelecimento com antecedência, você preferiria:
    - Pagar uma taxa avulsa por contratação bem-sucedida (ex: R$ 15 a R$ 25)?
    - Ou pagar uma mensalidade fixa para publicar chamados ilimitados no mês?

---

## 4. Roteiro B: Profissionais Autônomos (Freelancers)

*Público-alvo*: Garçons, baristas, bartenders, auxiliares de salão e cozinha que realizam plantões avulsos no DF.  
*Duração estimada*: 12 a 15 minutos.

### 4.1 Bloco 1: Perfil e Dependência Financeira
1. Há quanto tempo você trabalha no ramo de gastronomia/eventos?
2. O trabalho como freelancer/extra é sua **renda principal** ou um complemento?
3. Em média, quantos turnos ou diárias avulsas você costuma fazer por semana/mês?
4. Em quais regiões do DF você prefere trabalhar? Até que distância você costuma aceitar turnos?

### 4.2 Bloco 2: A Descoberta de Oportunidades e Agilidade
5. Onde você fica sabendo das vagas de freela hoje? Em quantos grupos de WhatsApp você está?
6. Quando uma vaga boa aparece no grupo, quanto tempo você tem para responder antes que outro pegue?
7. Você precisa ficar olhando o celular o dia todo para não perder oportunidade? Como isso atrapalha sua rotina?
8. O que faz você decidir se candidatar a uma vaga ou ignorá-la (valor da diária, distância/transporte, reputação do local, refeição inclusa)?

### 4.3 Bloco 3: Confiança, Calote e Cancelamentos
9. Você já passou pela situação de combinar um turno e, ao chegar lá, o restaurante dizer que não precisava mais ou cancelar em cima da hora? O que aconteceu?
10. **Segurança de pagamento:** Você já levou calote ou teve atraso no pagamento da diária? Como você faz hoje para saber se o contratante é confiável e paga certinho?
11. Como é feita a confirmação de que você realmente está escalado para o trabalho?

### 4.4 Bloco 4: Reputação e Valorização
12. Quando você faz um excelente trabalho num restaurante, como você faz para ser chamado novamente? O estabelecimento guarda seu contato ou te perde no meio de conversas?
13. Se existisse um perfil profissional no seu celular acumulando todas as avaliações positivas dos gerentes para quem você trabalhou, isso te ajudaria a conseguir mais diárias e negociar valores melhores?
14. Você pagaria para usar um aplicativo de vagas ou considera obrigatório que o app seja **100% gratuito** para quem trabalha?

---

## 5. Mapeamento de Polos Gastronômicos e Alvos no DF

Brasília possui polos gastronômicos concentrados com altíssima densidade de salão e turnover, permitindo entrevistas presenciais rápidas (circuito de campo).

### 5.1 Polos Prioritários para Abordagem Presencial

| Polo Geográfico | Concentração de Estabelecimentos | Perfil Predominante | Horário Ideal de Abordagem |
|---|---|---|---|
| **Asa Sul (CLS 404 / 405)** | *Rua dos Restaurantes* (alta gastronomia, salão formal) | Garçons clássicos, cartas de vinho, alta exigência de postura | 15:00 às 17:00 (entre almoço e jantar) |
| **Asa Sul (CLS 201 / 202)** | Bares tradicionais, cervejarias, alto fluxo de chope | Cumins, garçons dinâmicos, equipes volumosas | 15:30 às 17:30 |
| **Asa Norte (CLN 408 / 409)** | Cafeterias, bistrôs, hamburguerias artesanais e bares | Baristas, atendentes multitarefa, cozinheiros | 15:00 às 17:00 |
| **Águas Claras (Castanheiras / Metrópole)** | Bares de alto giro noturno, espetinhos, pubs | Garçons jovens, extrema rotatividade nos fins de semana | 16:00 às 18:00 |
| **Sudoeste (CLSW 101 a 105)** | Restaurantes familiares, pizzarias, comida japonesa | Salão médio, necessidade recorrente de cobrir folgas | 15:00 às 17:00 |
| **Setor Hoteleiro e Eventos** | Centros de convenções, buffets do Lago Sul | Brigadas grandes de 20 a 50 garçons por evento | Agendamento prévio com maîtres |

### 5.2 Tabela de Controle de Abordagens (Pipeline de Campo)

| # | Estabelecimento / Nome do Profissional | Polo / Região | Contato / Cargo | Data Contato | Status | Responsável |
|---|---|---|---|---|---|---|
| 01 | *Restaurante Alvo 1* | Asa Sul | Gerente Geral | - | A contactar | Júlia |
| 02 | *Bar Alvo 2* | Asa Norte | Sócio Operacional | - | A contactar | Júlia |
| 03 | *Buffet Alvo 3* | Lago Sul | Chefe de Salão | - | A contactar | Júlia |
| 04 | *Bar Alvo 4* | Águas Claras | Gerente | - | A contactar | Equipe |
| ...| ... | ... | ... | - | ... | ... |

---

## 6. Matriz de Hipóteses a Validar

Cada entrevista deve pontuar a confirmação ou refutação das seguintes hipóteses centrais do modelo Frila:

| ID | Hipótese do Modelo | Evidência de Validação (O que buscamos ouvir) | Evidência de Refutação (Sinal de alerta) | Impacto no Produto |
|---|---|---|---|---|
| **H1** | Bares e restaurantes do DF sofrem desfalques urgentes pelo menos 2 a 4 vezes por mês. | Relatos frequentes de faltas de última hora e desespero para cobrir escala. | "Minha equipe é 100% fixa e nunca precisamos de freela de urgência." | Sustentação do volume transacional. |
| **H2** | O processo atual via WhatsApp leva entre 1 e 3 horas e consome tempo excessivo do gestor. | Queixas de tempo gasto respondendo dezenas de mensagens e falta de resposta. | "Mando no grupo e em 2 minutos tenho 10 garçons confiáveis confirmados." | Proposta de valor do despacho rápido (<60s). |
| **H3** | A taxa de "no-show" (pessoa que confirma e não vai) via canais informais é superior a 15-20%. | Casos reais de atrasos graves ou profissionais que deixaram o salão na mão. | "Ninguém nunca furou comigo no WhatsApp." | Necessidade da RN05 / RN16 (avaliação mútua e penalidade). |
| **H4** | O estabelecimento está disposto a pagar taxa de R$ 15 a R$ 25 por vaga preenchida com segurança. | Gestor reconhece que o custo da falta (perda de clientes) supera em muito R$ 20. | "Não pago 1 centavo além da diária seca do garçom." | Viabilidade do modelo de monetização B2B. |
| **H5** | O freelancer considera inadmissível pagar taxa ou ter desconto na diária do turno. | Freelancer declara revolta com apps que cobram percentual da sua diária. | "Eu pagaria mensalidade feliz se o app me desse vagas." | Blindagem da premissa de custo zero ao trabalhador. |
| **H6** | O pagamento direto no final do turno é mandatório no DF (recusa de saldo retido no app). | Ambas as partes exigem quitação imediata via Pix ao término do trabalho. | Ambos preferem que o dinheiro fique retido na carteira digital do app. | Confirmação da RN17 (pagamento fora do app no MVP). |

---

## 7. Ficha de Registro Rápido Pós-Entrevista (Template)

```markdown
### Registro de Entrevista #[Número]
- **Data e Hora**: AAAA-MM-DD HH:MM
- **Tipo**: [ ] Contratante  |  [ ] Freelancer
- **Identificador**: [Nome / Estabelecimento / Função] (Pode ser anonimizado se solicitado)
- **Localização**: [Região Administrativa / Polo Gastronômico]
- **Entrevistador**: [Nome do membro da equipe]

#### Respostas-Chave e Fatos Extraídos:
1. Frequência de desfalque / turnos realizados:
2. Processo atual e canais utilizados:
3. Tempo médio de resposta / resolução:
4. Experiência com furos (no-show) ou calote:
5. Disposição a pagar / visão sobre taxas:

#### Frases Marcantes (Citações Diretas):
> "[Inserir frase textual que sintetiza a dor ou comportamento]"

#### Impacto na Matriz de Hipóteses:
- H1: [Validada / Refutada / Neutra]
- H2: [Validada / Refutada / Neutra]
- ...

#### Insights Não Previstos (Novas Dores/Oportunidades):
- [Anotar qualquer comportamento surpreendente descoberto]
```

---

## 8. Próximos Passos Operacionais

1. **Compartilhar o protocolo com a equipe BlendOps** para que todos os membros que visitarem estabelecimentos sigam o mesmo roteiro padronizado.
2. **Realizar as 6 primeiras abordagens piloto** entre hoje (18/09) e o fim de semana nos polos da Asa Sul e Asa Norte.
3. **Consolidar os resultados quantitativos e qualitativos** até 24/09 para alimentar os slides de *Problem & Market Validation* da **1ª Apple Review (28/09)**.

---
← [[04 - Tarefas/T-0015 - Roteiro e entrevistas de validação de campo no DF|T-0015]] · [[01 - CBL/Desafios/C18/Documentos de Produto/01-O-PROBLEMA|01-O-PROBLEMA]] · [[01 - CBL/00 - Índice CBL|Índice CBL]]
