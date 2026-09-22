---
tipo: documento-produto
desafio: C18
data_criacao: 2026-09-15
origem: "Frila/Documentos/MD/03-ESPECIFICACAO-DO-PRODUTO.md"
tags: [produto, frila]
---

# Frila — Especificação do Produto

**Versão 1.0 · setembro/2026**

Visão de alto nível do produto: o app e seus dois perfis, os fluxos principais e os pilares que orientam qualquer decisão de desenho. Este documento não detalha telas, tabelas de funcionalidade por release ou regras de negócio finas — isso é trabalho de fase de build, e ainda não sabemos quais funcionalidades avançadas realmente resolvem a dor do contratante. O objetivo aqui é alinhar o que o produto é, antes de detalhar como ele é construído.

O ciclo do frila em linguagem de negócio, com as personas e o que o Frila não é, está em `02-O-NEGOCIO.md`. A evidência que justifica cada escolha de desenho está em `01-O-PROBLEMA.md`, e a leitura de concorrência que sustenta o despacho ativo, em `04-MERCADO-E-CONCORRENCIA.md`.

---

## Um app, dois perfis

O Frila é um app só, com dois perfis. Cada conta tem um perfil, escolhido no cadastro e fixo: quem quiser usar o outro lado cria outra conta, com outro e-mail, e o telefone pode ser o mesmo. A entrada é por código enviado ao e-mail, sem senha. Os dois perfis têm necessidades diferentes o suficiente para que cada um veja só as próprias telas.

**Perfil de profissional** — mobile + web. Contexto de uso: na rua, no intervalo, em Android de entrada majoritariamente, com sinal ruim e plano de dados limitado. Precisa ser leve, rápido, funcionar offline para leitura, e notificar com confiabilidade.

**Perfil de contratante**, do estabelecimento — mobile + web, com dois contextos de uso bem diferentes:
- **No celular, sob estresse.** São 16h de sexta, faltou gente, o maître está no salão. Publicar uma vaga precisa ser rápido, com poucos campos.
- **No computador, planejando.** O operador de buffet monta a escala de uma formatura de 40 pessoas duas semanas antes — trabalho de mesa, com teclado e tela grande.

**Painel do gestor** — na versão web do Frila, no perfil de contratante. É o dashboard em que o gestor acompanha vagas, candidatos, contratados, check-ins e turnos. Não é ferramenta interna do Frila: não existe operação manual nem plantão da equipe Frila. O alerta de vaga ainda vazia e a confirmação de check-in manual também chegam no app, pelo celular.

**Plataformas:** o mesmo app em iOS nativo (Swift/SwiftUI), Android nativo (Kotlin) e versão web, com os dois perfis — Android como prioridade de alcance, já que é a plataforma da maioria do trabalhador de base no Brasil. As regras críticas ficam no backend (Supabase), escritas uma vez para as três versões. Para a entrega na loja em 13/11, o iOS é o mínimo.

---

## Fluxos principais

**Publicar vaga.** O estabelecimento publica um turno — função, data, janela, endereço, valor, número de posições, o que está incluso (refeição, transporte, material próprio) e quem recebe no local — com poucos campos. Traje, rateio dos 10% e observações são opcionais. Poucos campos, porque quem publica está no meio de um problema, não sentado num computador.

**Despacho ativo e busca de vagas.** A vaga não fica num mural esperando ser encontrada — ela é notificada ativamente, de uma vez, aos profissionais elegíveis: têm a função, estão disponíveis no horário e estão a até 15 km do local (a equipe de confiança do estabelecimento recebe mesmo mais longe). Cada profissional recebe no máximo uma notificação a cada 30 minutos, com vagas próximas no tempo agrupadas. O profissional também pode navegar pela lista com todas as vagas do DF, das mais próximas para as mais distantes, mas no caso urgente quem só procura chega tarde — o despacho ativo decide a maioria dos casos. É o núcleo do produto: um marketplace que manda tudo para todo mundo treina o usuário a ignorar notificação, e aí morre. No perfil, a tela "Por que recebo vagas" explica esses critérios e permite pedir revisão.

É também a aposta que separa o Frila dos concorrentes. O padrão que mais se repete em `04-MERCADO-E-CONCORRENCIA.md` é a distância entre cadastro e liquidez: a Freela Serviços declara 198 mil profissionais cadastrados e 203 contratações concluídas. Esperar que a pessoa certa encontre a vaga sozinha é o que produz esse número.

**Candidatura.** Direta, sem formulário. Sem carta de apresentação, sem processo seletivo longo, sem negociação de valor — o valor já está no anúncio. No modo urgência, o primeiro aprovado leva; para eventos com mais de 24 horas de antecedência, o estabelecimento escolhe entre candidatos, e a vaga fecha sozinha 24 horas antes se ninguém for escolhido.

**Confirmação.** Os dois lados recebem local, horário, função, valor e um contato, visível até 7 dias depois do fim do turno — a partir daqui existe compromisso registrado.

**Execução do turno.** Lembrete 24 horas e 3 horas antes, check-in e check-out geolocalizados (a até 200 metros, lidos só no toque), alerta ao contratante se o profissional não chegar em 15 minutos e aviso aos dois quando o horário de fim passa. Suporte por e-mail, com prazo de resposta declarado, e botões para denunciar e bloquear.

**Reputação.** Depois de cada turno, os dois avaliam um ao outro com uma pergunta binária — "você chamaria essa pessoa de novo?" / "você trabalharia nesse local de novo?" — em vez de uma nota de 1 a 5. Só avalia quem trabalhou junto, depois de um turno com presença verificada. A taxa de comparecimento (turnos com presença entre os turnos confirmados) é o sinal mais objetivo do sistema.

**Organizar equipe.** O estabelecimento pode reunir os profissionais que já trabalharam bem por lá, que passam a receber as vagas da casa mesmo estando longe, e, para eventos, montar a escala de uma formatura ou casamento com semanas de antecedência, em vez de vaga por vaga.

---

## Pilares da experiência

**Simplicidade.** Vaga publicada com poucos campos e candidatura sem formulário. Cada fricção a mais é um turno que não vai ser preenchido a tempo.

**Confiança.** Reputação binária ("chamaria de novo?"), taxa de comparecimento como sinal objetivo, e avaliação nos dois sentidos — o profissional também avalia o estabelecimento. É o que substitui o "eu já conheço essa pessoa" do WhatsApp por algo que funciona entre desconhecidos.

A avaliação nos dois sentidos e o valor integral do turno para o profissional (sem comissão descontada) não são detalhe de desenho. As piores notas do setor vêm quase sempre do lado de quem trabalha, e por motivos estruturais: pagamento retido, bloqueio de cadastro sem processo justo, moeda gasta sem retorno. As queixas estão transcritas em `01-O-PROBLEMA.md` §3.1 e mapeadas por empresa em `04-MERCADO-E-CONCORRENCIA.md`.

**Rapidez.** Despacho ativo por geolocalização resolve uma urgência em minutos, não em dias — a vaga vai até quem é elegível, em vez de esperar ser encontrada.

**Organização.** Painel do gestor na web e alerta de vaga vazia no app para quando um frila não preenche, múltiplos usuários por estabelecimento, e escala de evento em lote para formaturas e casamentos — o que tira a contratação avulsa da bagunça de conversa de WhatsApp e memória.

---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
