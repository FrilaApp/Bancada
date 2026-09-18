---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-18
tags: [arquitetura, frila, casos-de-uso]
---

# Diagrama de Casos de Uso — Frila

Preenche a Seção 6.1 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que até a v1.0.0 tinha as descrições de UC01 a UC08 e um espaço reservado no lugar do diagrama. A revisão de 18/09 fez três coisas: desenhou o diagrama, corrigiu os casos de uso que contradiziam regras já fechadas e acrescentou UC09 a UC16, porque onze dos vinte e cinco requisitos funcionais não tinham caso de uso nenhum ou estavam pendurados num caso que não os descrevia.

O modelo de dados que sustenta estes fluxos está em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]]; as classes, em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o sistema em volta, em [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]].

---

## Os atores

| Ator | Quem é | Casos de uso |
|---|---|---|
| **Profissional** | Quem executa turnos avulsos em funções operacionais. Maior de 18 anos | UC03, UC05, UC06, UC08, UC09, UC13, UC14, UC15, UC16 |
| **Contratante** | Usuário de um estabelecimento que publica turnos, com papel de administrador ou de operador do estabelecimento (RF21) | UC01, UC04, UC05, UC06, UC08, UC10 a UC16 |
| **Operador do Painel** | Pessoa da equipe Frila que cuida da janela crítica, do suporte e das contestações | UC07, UC08, UC14, UC15 |
| **Usuário** | Generalização dos dois primeiros, onde eles têm o mesmo direito | UC14, UC15, UC16 |

> [!note] Não existe o ator "Sistema"
> A versão anterior previa "Sistema (despacho automático)" como ator. O despacho (UC02) é o próprio Frila trabalhando: ele é **incluído** pela publicação e pela reabertura, e as levas seguintes, o lembrete e o pedido de avaliação saem do agendador. Desenhar o sistema como ator colocaria o Frila do lado de fora do Frila.

> [!warning] Dois "operadores"
> *Operador do estabelecimento* é um papel do contratante (RF21). *Operador do Painel* é da equipe Frila. Os documentos usam as duas expressões; nos diagramas, o segundo sempre aparece com "do Painel".

---

## O diagrama em três vistas

Dezesseis casos de uso e quatro atores num quadro só viram um emaranhado de linhas — o mesmo problema que levou o DER e o diagrama de classes a serem divididos. Cada vista responde a uma pergunta, e um caso de uso pode aparecer em mais de uma.

### Ciclo do turno

![[07 - Arquitetura/Anexos/casos-de-uso/ciclo-do-turno.png|UC01 a UC08: da publicação à avaliação]]

A coluna da esquerda é só do contratante, a da direita só do profissional, e o meio é o que os dois fazem juntos. As cinco setas tracejadas são o comportamento que liga os casos:

- **UC01 «include» UC02** — publicar sempre dispara o despacho.
- **UC08 «include» UC02** — reabrir sempre despacha de novo (RN12).
- **UC08 «extend» UC05** — o cancelamento entra no registro do turno quando alguém não comparece.
- **UC07 «extend» UC02** e **UC08 «extend» UC07** — o operador entra quando o despacho não basta e pode cancelar e reabrir depois de apurar.

### Cadastro, perfil e confiança

![[07 - Arquitetura/Anexos/casos-de-uso/cadastro-e-confianca.png|UC09 a UC13: como cada lado entra e o que se acumula com o uso]]

### Suporte e direitos de quem usa

![[07 - Arquitetura/Anexos/casos-de-uso/suporte-e-direitos.png|UC07 e UC14 a UC16: suporte, contestação e dados pessoais]]

UC16 existe porque a App Store exige: todo app com criação de conta tem que permitir a exclusão da conta **de dentro do app** (diretriz 5.1.1(v)). Turnos já realizados são anonimizados em vez de apagados, para não sumir com o histórico da contraparte.

---

## Os dezesseis casos de uso

| UC | Nome | Ator principal | Requisitos | Regras |
|---|---|---|---|---|
| UC01 | Publicar vaga | Contratante | RF04, RF05, RF09, RF19 | RN02, RN03, RN04, RN18 |
| UC02 | Despachar vaga aos profissionais elegíveis | — (incluído) | RF03, RF06, RF18 | RN04, RN05, RN06, RN16 |
| UC03 | Candidatar-se a uma posição | Profissional | RF07, RF08, RF16 | RN03, RN05, RN08, RN10 |
| UC04 | Confirmar profissional na posição | Contratante | RF09, RF10, RF11, RF16 | RN08, RN10, RN19 |
| UC05 | Registrar a execução do turno | Profissional e Contratante | RF12, RF13 | RN09, RN11, RN18 |
| UC06 | Avaliar após o turno | Profissional e Contratante | RF15, RF16 | RN07, RN08 |
| UC07 | Intervir em turno em risco | Operador do Painel | RF20, RF23 | RN12, RN13, RN16 |
| UC08 | Cancelar e reabrir posição | Os três | RF14 | RN12, RN13, RN16 |
| UC09 | Cadastrar-se e manter o perfil profissional | Profissional | RF01, RF03 | RN01, RN14, RN15, RN20 |
| UC10 | Cadastrar o estabelecimento e gerenciar usuários | Contratante | RF02, RF21 | RN15, RN20 |
| UC11 | Manter a equipe de confiança | Contratante | RF18 | RN05, RN06, RN16 |
| UC12 | Registrar aval externo | Contratante | RF17 | RN08 |
| UC13 | Consultar e exportar o histórico de turnos | Profissional e Contratante | RF22 | RN09, RN11, RN17, RN18 |
| UC14 | Acionar suporte durante o turno | Usuário | RF23 | RN11, RN15 |
| UC15 | Consultar e contestar suspensão | Usuário | RF24 | RN13, RN15, RN16 |
| UC16 | Exportar dados pessoais e excluir a conta | Usuário | RF25 | RN15 |

As descrições completas — pré-condição, fluxo principal, fluxos alternativos, pós-condição e critério de aceite em BDD — estão na Seção 6.1 do Documento de Requisitos.

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

---

## Decisões que este documento abre

| Onde | Pergunta | Por que importa |
|---|---|---|
| UC04 · D3 | Qual o prazo até a candidatura expirar no modo seleção? | Sem prazo, a posição fica presa até a janela crítica |
| UC05 | Qual a tolerância de atraso antes de alertar o contratante? | Curta demais gera alarme falso; longa demais, turno descoberto |
| UC08 | Quantos cancelamentos num período disparam apuração humana? | RN13 exige apuração, nunca bloqueio automático; falta o número |
| UC14 | Qual o tempo de resposta declarado do suporte, e em que horário existe atendimento? | Promessa exibida ao usuário no meio do turno |
| UC15 | Qual o prazo de resposta de uma contestação? | RN13 exige prazo definido |

---
← [[🏠 Início|Início]]
