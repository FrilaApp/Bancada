---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-18
tags: [arquitetura, frila, casos-de-uso]
---

# Diagrama de Casos de Uso — Frila

Preenche a Seção 6.1 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que até a v1.0.0 tinha as descrições de UC01 a UC08 e um espaço reservado no lugar do diagrama. A revisão de 18/09 fez três coisas: desenhou o diagrama, corrigiu os casos de uso que contradiziam regras já fechadas e acrescentou UC09 a UC16, porque onze dos vinte e cinco requisitos funcionais não tinham caso de uso nenhum ou estavam pendurados num caso que não os descrevia. A revisão de 22/09 aplicou as respostas do quadro 03 de pendências: saiu o operador do Frila, saiu o aval externo (UC12) e entrou denunciar e bloquear (UC17) — ver [[#Revisão de 22/09]].

O modelo de dados que sustenta estes fluxos está em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]]; as classes, em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o sistema em volta, em [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]].

---

## Os atores

| Ator | Quem é | Casos de uso |
|---|---|---|
| **Profissional** | Quem executa turnos avulsos em funções operacionais. Maior de 18 anos | UC03, UC05, UC06, UC08, UC09, UC13, UC14, UC15, UC16, UC17 |
| **Contratante** | Usuário de um estabelecimento que publica turnos, com papel de administrador ou de operador do estabelecimento (RF21). Na versão web, o gestor acompanha tudo pelo Painel | UC01, UC04, UC05, UC06, UC07, UC08, UC10, UC11, UC13 a UC17 |
| **Equipe Frila** | Pessoa da equipe Frila que responde, por e-mail, suporte, denúncias, contestações e pedidos de revisão do despacho, em até 5 dias úteis. Não acompanha turnos | UC14, UC15, UC17 |
| **Usuário** | Generalização dos dois primeiros, onde eles têm o mesmo direito | UC14, UC15, UC16, UC17 |

> [!note] Não existe o ator "Sistema"
> A versão anterior previa "Sistema (despacho automático)" como ator. O despacho (UC02) é o próprio Frila trabalhando: ele é **incluído** pela publicação e pela reabertura, e as notificações agrupadas, os lembretes, os alertas e o pedido de avaliação saem do agendador. Desenhar o sistema como ator colocaria o Frila do lado de fora do Frila.

> [!note] Um operador só
> *Operador do estabelecimento* é um papel do contratante (RF21). Até 21/09 existia também o *Operador do Painel*, da equipe Frila, que acompanhava a janela crítica e intervinha em turno em risco. Ele saiu com a decisão de que o Frila não opera turnos (D01) e de que o Painel é do gestor do estabelecimento (B09). Quem responde e-mail em nome do Frila aparece nos diagramas como **Equipe Frila**.

---

## O diagrama em três vistas

Dezesseis casos de uso ativos e quatro atores num quadro só viram um emaranhado de linhas — o mesmo problema que levou o DER e o diagrama de classes a serem divididos. Cada vista responde a uma pergunta, e um caso de uso pode aparecer em mais de uma.

### Ciclo do turno

![[07 - Arquitetura/Anexos/casos-de-uso/ciclo-do-turno.png|UC01 a UC08: da publicação à avaliação]]

A coluna da esquerda é só do contratante, a da direita só do profissional, e o meio é o que os dois fazem juntos. As três setas tracejadas são o comportamento que liga os casos:

- **UC01 «include» UC02** — publicar sempre dispara a notificação da vaga.
- **UC08 «include» UC02** — reabrir sempre notifica de novo (RN12).
- **UC08 «extend» UC05** — o cancelamento entra no registro do turno quando alguém não comparece; reabrir por não comparecimento conta como falta.

O UC07 não tem seta. É o contratante acompanhando vagas e turnos pelo Painel: quando a posição chega à janela crítica ainda vaga, ele recebe o alerta, e dali, ou do alerta de atraso, pode reabrir a vaga pelo UC08.

### Cadastro, perfil e confiança

![[07 - Arquitetura/Anexos/casos-de-uso/cadastro-e-confianca.png|UC09 a UC13, sem o UC12: como cada lado entra e o que se acumula com o uso]]

UC09 inclui a tela "Por que recebo vagas", com o botão "Contestar" (RF27): o profissional vê os critérios da notificação — função, disponibilidade e distância de até 15 km — e pode pedir revisão, respondida pela Equipe Frila em até 5 dias úteis (LGPD, art. 20).

### Suporte e direitos de quem usa

![[07 - Arquitetura/Anexos/casos-de-uso/suporte-e-direitos.png|UC14 a UC17: suporte, contestação, dados pessoais, denúncia e bloqueio]]

UC16 existe porque a App Store exige: todo app com criação de conta tem que permitir a exclusão da conta **de dentro do app** (diretriz 5.1.1(v)). Turnos já realizados são anonimizados em vez de apagados, para não sumir com o histórico da contraparte.

UC17 também é exigência da App Store: app com perfis e conteúdo de usuário tem que permitir denunciar e bloquear (diretriz 1.2). A denúncia chega à Equipe Frila por e-mail; o bloqueio é imediato e não depende de ninguém.

---

## Os dezesseis casos de uso ativos

| UC | Nome | Ator principal | Requisitos | Regras |
|---|---|---|---|---|
| UC01 | Publicar vaga | Contratante | RF04, RF05, RF09, RF19 | RN02, RN03, RN04, RN18, RN24 |
| UC02 | Despachar vaga aos profissionais elegíveis | — (incluído) | RF03, RF06, RF18 | RN04, RN05, RN06, RN16, RN23 |
| UC03 | Candidatar-se a uma posição | Profissional | RF07, RF08, RF16 | RN03, RN05, RN08, RN10, RN21 |
| UC04 | Confirmar profissional na posição | Contratante | RF09, RF10, RF11, RF16 | RN08, RN10, RN19, RN24 |
| UC05 | Registrar a execução do turno | Profissional e Contratante | RF12, RF13 | RN09, RN11, RN18, RN22 |
| UC06 | Avaliar após o turno | Profissional e Contratante | RF15, RF16 | RN07, RN08, RN22 |
| UC07 | Acompanhar vagas e turnos pelo Painel | Contratante | RF20 | RN12, RN22 |
| UC08 | Cancelar e reabrir posição | Profissional ou Contratante | RF14 | RN12, RN13, RN16 |
| UC09 | Cadastrar-se e manter o perfil profissional | Profissional | RF01, RF03, RF27 | RN01, RN05, RN14, RN15, RN20, RN25 |
| UC10 | Cadastrar o estabelecimento e gerenciar usuários | Contratante | RF02, RF21 | RN15, RN20, RN25 |
| UC11 | Manter a equipe de confiança | Contratante | RF18 | RN05, RN06, RN16 |
| UC12 | *Retirado em 21/09/2026* — era "Registrar aval externo" | — | RF17 (retirado) | — |
| UC13 | Consultar e exportar o histórico de turnos | Profissional e Contratante | RF22 | RN09, RN11, RN17, RN18 |
| UC14 | Acionar suporte durante o turno | Usuário | RF23 | RN11, RN15 |
| UC15 | Consultar e contestar suspensão | Usuário | RF24 | RN13, RN15, RN16 |
| UC16 | Exportar dados pessoais e excluir a conta | Usuário | RF25 | RN15 |
| UC17 | Denunciar e bloquear | Usuário | RF26 | RN05, RN13, RN15 |

O UC12 e o RF17 ficam com o número reservado, sem reutilizar, para que nenhuma referência antiga aponte para outra coisa. As descrições completas — pré-condição, fluxo principal, fluxos alternativos, pós-condição e critério de aceite em BDD — estão na Seção 6.1 do Documento de Requisitos.

---

## O que a revisão corrigiu em UC01 a UC08

| UC | Antes | Agora | Por quê |
|---|---|---|---|
| UC02 | Esgotados os elegíveis, "o sistema amplia o raio" | O sistema encerra as levas e sinaliza no Painel; o raio nunca é ampliado | RN05 proíbe notificar fora do raio que o **profissional** declarou |
| UC03 | Turno sobreposto: "alerta e pede confirmação explícita" | A candidatura é impedida e o conflito é mostrado | Turnos sobrepostos viraram restrição do banco (D1); não há confirmação que passe por ela |
| UC02 | Elegibilidade sem perfil ativo nem conflito de horário | Os dois critérios entram | Coerência com UC15 (suspensão) e com D1 |
| UC02 | Recusar não aparecia | Ignorar ou recusar não gera registro contra o profissional | RN16 |
| UC01 | Ator "food service, evento ou campanha"; escala em lote ausente | Contratante de qualquer estabelecimento; fluxo 3b de escala de evento | Plataforma horizontal; RF19 estava mapeado aqui sem fluxo |
| UC04 | Sem expiração de candidatura | Fluxo 2b, com o prazo marcado como decisão D3 em aberto | Sem prazo, o modo seleção trava a posição |
| UC05 | Contratante que não confirma o início não estava previsto | Fluxo 3a | Caso comum no salão cheio |
| UC08 | Operador como ator, mas sem fluxo | Fluxo 1a: cancelamento depois de apuração em UC07 | Coerência com o diagrama |

A tabela acima é a revisão de 18/09 e fica como registro. Parte do que ela descreve — raio declarado, levas, Painel de Operação, operador — foi substituída pela revisão de 22/09, logo abaixo.

---

## Revisão de 22/09

Aplica as respostas do quadro 03 de pendências (21 e 22/09):

| Onde | Antes | Agora | Por quê |
|---|---|---|---|
| Atores | Operador do Painel, da equipe Frila, acompanhava a janela crítica e intervinha | Equipe Frila só responde e-mail: suporte, denúncia, contestação e revisão do despacho | O Frila não opera turnos (D01); o Painel é do gestor (B09) |
| UC02 | Levas ordenadas por equipe de confiança e taxa de comparecimento; sem elegíveis, sinalização no Painel | Notificação de uma vez para quem tem a função, está disponível e a até 15 km; a equipe de confiança recebe mesmo além; teto de uma notificação a cada 30 minutos, com agrupamento (RN23) | B07, D07; a taxa só aparece no perfil (RN06) |
| UC03 | Busca na região, dentro do raio declarado | Todas as vagas do DF, das mais próximas às mais distantes; bloqueio entre as partes esconde a vaga | B07, RF26 |
| UC04 | Expiração da candidatura em aberto (D3) | A candidatura vale até a vaga fechar; seleção só com mais de 24 horas; sem escolha, a vaga fecha 24 horas antes e libera os candidatos (RN24) | D05 |
| UC05 | Início e fim registrados pelas duas partes; divergência ia ao Painel | Check-in e check-out geolocalizados a até 200 m; o manual só vale confirmado pelo contratante; sem confirmação, "não verificado"; lembrete no início, alerta ao contratante aos 15 minutos, aviso aos dois quando o fim passa | A07, A08, D06, A09; o Frila não arbitra |
| UC06 | Avaliação liberada após o fim previsto | Só com presença verificada; quem faltou não é avaliado | A10, A12 (RN07) |
| UC07 | Intervir em turno em risco, pelo Operador do Painel | Acompanhar vagas e turnos pelo Painel, pelo Contratante, na web; o alerta de vaga vazia e a confirmação de check-in também no app | B09, B18 |
| UC08 | O operador cancelava depois de apurar; excesso de cancelamentos ia para apuração humana | Só as partes cancelam; cancelamento nunca suspende, e só conta como falta com menos de 24 horas | D04, D03 |
| UC09 | Raio de atuação declarado pelo profissional | Ponto base e grade semanal de disponibilidade; tela "Por que recebo vagas" (RF27) | B07, C05 |
| UC12 | Registrar aval externo | Retirado | A12: só avalia quem trabalhou junto pelo Frila |
| UC14, UC15 | Chamado no Painel, com prazos em aberto | E-mail à Equipe Frila, resposta em até 5 dias úteis | D02, D03 |
| UC17 | Não existia | Denunciar e bloquear, dos dois lados | A13 revista em 22/09; App Store, diretriz 1.2 |

### Ajuste das pendências para codar (22/09)

Depois do quadro 03, as respostas sobre o app e o cadastro mudaram dois casos de uso:

| Onde | Antes | Agora | Por quê |
|---|---|---|---|
| UC09 | Telefone confirmado por código; botão "disponível agora" | Entrada por código no e-mail, sem senha e sem SMS; telefone obrigatório, só com o formato conferido; perfil de profissional fixo na conta; só a grade semanal de disponibilidade | Um app só, com um perfil por conta (RN25) |
| UC10 | Conta de acesso qualquer; convite por telefone ou e-mail | Conta de contratante, criada com código no e-mail; convite pelo e-mail; conta de profissional não aceita convite | RN25 |

---

## Decisões respondidas em 21/09/2026

| Onde | Pergunta | Resposta |
|---|---|---|
| UC04 · D3 | Qual o prazo até a candidatura expirar no modo seleção? | Vale até a vaga fechar. O modo seleção só vale para vaga com mais de 24 horas; sem escolha até 24 horas antes do início, a vaga fecha e os candidatos são liberados (D05, RN24) |
| UC05 | Qual a tolerância de atraso antes de alertar o contratante? | 15 minutos. No horário de início sem check-in, o profissional recebe um lembrete; aos 15 minutos, o contratante é alertado e decide esperar ou reabrir a vaga — reabrir conta como falta (D06) |
| UC08 | Quantos cancelamentos num período disparam apuração humana? | Nenhum limite: cancelamento nunca suspende nem bloqueia, só afeta a taxa de comparecimento (D04) |
| UC14 | Qual o tempo de resposta declarado do suporte, e em que horário existe atendimento? | Só e-mail, sem atendimento ao vivo, com resposta em até 5 dias úteis (D02) |
| UC15 | Qual o prazo de resposta de uma contestação? | Até 5 dias úteis; se a contestação for aceita, a conta volta na hora (D03) |

---
← [[🏠 Início|Início]]
