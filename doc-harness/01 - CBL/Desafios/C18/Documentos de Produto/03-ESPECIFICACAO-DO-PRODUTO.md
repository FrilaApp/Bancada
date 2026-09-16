---
tipo: documento-produto
desafio: C18
data_criacao: 2026-09-15
origem: "Frila/Documentos/MD/03-ESPECIFICACAO-DO-PRODUTO.md"
tags: [produto, frila]
---

# Frila — Especificação do Produto

**Versão 1.0 · setembro/2026**

Visão de alto nível do produto: os três produtos, os fluxos principais e os pilares que orientam qualquer decisão de desenho. Este documento não detalha telas, tabelas de funcionalidade por release ou regras de negócio finas — isso é trabalho de fase de build, e ainda não sabemos quais funcionalidades avançadas realmente resolvem a dor do contratante. O objetivo aqui é alinhar o que o produto é, antes de detalhar como ele é construído.

O ciclo do frila em linguagem de negócio, com as personas e o que o Frila não é, está em `02-O-NEGOCIO.md`. A evidência que justifica cada escolha de desenho está em `01-O-PROBLEMA.md`, e a leitura de concorrência que sustenta o despacho ativo, em `04-MERCADO-E-CONCORRENCIA.md`.

---

## Os três produtos

São três interfaces com necessidades diferentes o suficiente para serem tratadas como produtos separados sobre uma base comum.

**App do Profissional** — mobile + web. Contexto de uso: na rua, no intervalo, em Android de entrada majoritariamente, com sinal ruim e plano de dados limitado. Precisa ser leve, rápido, funcionar offline para leitura, e notificar com confiabilidade.

**App do Estabelecimento** — mobile + web, com dois contextos de uso bem diferentes:
- **No celular, sob estresse.** São 16h de sexta, faltou gente, o maître está no salão. Publicar uma vaga precisa levar menos de 60 segundos.
- **No computador, planejando.** O operador de buffet monta a escala de uma formatura de 40 pessoas duas semanas antes — trabalho de mesa, com teclado e tela grande.

**Painel de Operação** — web, interno. Frequentemente esquecido, e é o que impede o negócio de quebrar no primeiro mês: quando um frila não preenche às 17h30 de sexta, alguém da operação precisa ver, ligar para três pessoas e resolver na mão.

**Plataformas:** app iOS nativo é requisito já decidido, independentemente da stack escolhida. Também existem app Android e versão web para as duas personas — Android como prioridade de alcance, já que é a plataforma da maioria do trabalhador de base no Brasil. A decisão entre nativo nas duas plataformas ou uma base compartilhada ainda não foi tomada.

---

## Fluxos principais

**Publicar vaga.** O estabelecimento publica um turno — função, data, janela, valor, número de posições — em menos de 60 segundos. Poucos campos, porque quem publica está no meio de um problema, não sentado num computador.

**Despacho ativo e busca de vagas.** A vaga não fica num mural esperando ser encontrada — ela é notificada ativamente aos profissionais elegíveis (função, raio, disponibilidade, histórico), priorizando quem tem melhor taxa de comparecimento. O profissional também pode navegar pelas vagas abertas na região, mas no caso urgente quem só procura chega tarde — o despacho ativo decide a maioria dos casos. É o núcleo do produto: um marketplace que manda tudo para todo mundo treina o usuário a ignorar notificação, e aí morre.

É também a aposta que separa o Frila dos concorrentes. O padrão que mais se repete em `04-MERCADO-E-CONCORRENCIA.md` é a distância entre cadastro e liquidez: a Freela Serviços declara 198 mil profissionais cadastrados e 203 contratações concluídas. Esperar que a pessoa certa encontre a vaga sozinha é o que produz esse número.

**Candidatura.** Um toque. Sem carta de apresentação, sem processo seletivo longo, sem negociação de valor — o valor já está no anúncio. No modo urgência, o primeiro aprovado leva; para eventos com antecedência, o estabelecimento escolhe entre candidatos.

**Confirmação.** Os dois lados recebem local, horário, função, valor e um contato — a partir daqui existe compromisso registrado.

**Execução do turno.** Lembrete pré-turno e um canal de suporte disponível enquanto o turno acontece.

**Reputação.** Depois de cada turno, os dois avaliam um ao outro com uma pergunta binária — "você chamaria essa pessoa de novo?" / "você trabalharia nesse local de novo?" — em vez de uma nota de 1 a 5. A taxa de comparecimento (quantas vezes a pessoa aceitou e apareceu) é o sinal mais objetivo do sistema, e o aval é herdável do mundo informal: quem já trabalhou com alguém fora do app pode atestar por essa pessoa.

**Organizar equipe.** O estabelecimento pode reunir os profissionais que já trabalharam bem por lá e chamá-los primeiro e, para eventos, montar a escala de uma formatura ou casamento com semanas de antecedência, em vez de vaga por vaga.

---

## Pilares da experiência

**Simplicidade.** Vaga publicada em menos de 60 segundos, poucos campos, candidatura em um toque. Cada fricção a mais é um turno que não vai ser preenchido a tempo.

**Confiança.** Reputação binária ("chamaria de novo?"), taxa de comparecimento como sinal objetivo, aval externo herdado do mundo informal, e avaliação nos dois sentidos — o profissional também avalia o estabelecimento. É o que substitui o "eu já conheço essa pessoa" do WhatsApp por algo que funciona entre desconhecidos.

A avaliação nos dois sentidos e o custo zero para o profissional não são detalhe de desenho. As piores notas do setor vêm quase sempre do lado de quem trabalha, e por motivos estruturais: pagamento retido, bloqueio de cadastro sem processo justo, moeda gasta sem retorno. As queixas estão transcritas em `01-O-PROBLEMA.md` §3.1 e mapeadas por empresa em `04-MERCADO-E-CONCORRENCIA.md`.

**Rapidez.** Despacho ativo por geolocalização resolve uma urgência em minutos, não em dias — a vaga vai até quem é elegível, em vez de esperar ser encontrada.

**Organização.** Painel de operação interno para quando um frila não preenche, múltiplos usuários por estabelecimento, e escala de evento em lote para formaturas e casamentos — o que tira a contratação avulsa da bagunça de conversa de WhatsApp e memória.

---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
