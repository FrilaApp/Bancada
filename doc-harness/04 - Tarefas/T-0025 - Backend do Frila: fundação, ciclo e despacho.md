---
tipo: tarefa
id: T-0025
status: em-andamento
responsavel: [Matheus Silva, Cauê Carneiro, João Paulo]
desafio: C18
data_criacao: 2026-09-22
tags: [tarefa, cbl, c18, backend, frila, supabase]
---

# Backend do Frila: fundação, ciclo e despacho

## Contexto

Até 22/09/2026 o Frila tinha documentação completa e **nenhuma linha de código**: TRL 2,
conceito formulado e nada implementado. As treze pendências técnicas D1 a D13 foram
respondidas em 21 e 22/09 ([[07 - Arquitetura/Pendências Técnicas Para Codar|Pendências
Técnicas]]), o contrato da API foi escrito antes do backend (D11) e a
[[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]] traz o DDL
das dezenove tabelas com as restrições que codificam as regras de negócio.

Faltava transformar isso em banco de verdade. Esta tarefa é a execução da trilha Backend
dos Sprints 0 a 3 do [quadro do Trello](https://trello.com/b/0eyqvbRJ/frila) — 48 cartões
com etiqueta Backend até a loja, de 22/09 a 13/11.

O prazo da loja, 13/11, não se move, e o backend anda uma etapa à frente do iOS: o app
precisa de RPC de pé para ligar tela, e o TestFlight de 27/10 precisa do ciclo fechando
com push de verdade.

## Onde o código mora

Repositório novo, **[BlendOps/frila-backend](https://github.com/BlendOps/frila-backend)**.

Diverge do que as Pendências Técnicas registraram em 22/09 (*"No repositório do Frila:
`supabase/` e `ios/` primeiro"*). O motivo é operacional: com quatro pessoas mexendo ao
mesmo tempo, separar o backend do projeto Xcode mantém a integração contínua de cada um
independente da outra, e o repositório do Frila continua sendo o dono dos documentos e do
contrato. O `openapi.yaml` é espelhado em `contrato/`, e a CI recusa o espelho divergente.

## Feito quando

- [x] Repositório criado, com os cinco sócios como colaboradores, e estrutura de
      `supabase/`, `contrato/`, `agents/`, `scripts/` e CI.
- [x] **Bloco A · Fundação** — migrações iniciais: 19 tabelas, enums, PostGIS, os índices
      do caminho quente e as restrições que codificam RN02, RN07, RN18, RN20, RN21, RN22,
      RN24 e RN25. Catálogo de 32 funções na semente.
- [x] **Ambiente compartilhado** — `frila-dev` no Supabase (`jcobftbhbqdikratzizz`,
      `sa-east-1`, Postgres 17.6), com as migrações aplicadas e o advisor de segurança
      sem nenhum alerta.
- [x] **Políticas de acesso (RLS)** — o schema `privado` com 12 auxiliares, 19 políticas
      de leitura e o relógio `privado.agora()`, com teste entrando como profissional,
      como contratante de outro estabelecimento e como conta bloqueada.
- [x] **Entrada por código no e-mail e `criar_conta`** com o perfil fixo da conta (RN25),
      maioridade verificada no banco e o aceite dos termos registrado. O contrato subiu
      para 0.2.1 por causa dele.
- [ ] **Bloco B · Ciclo principal** — as RPCs de `publicar_vaga` a `avaliar`, com a
      confirmação sem duplicidade de RN19 provada sob concorrência.
- [ ] **Bloco C · Despacho e turno** — motor de elegibilidade, teto e agrupamento de
      notificações, push pelo FCM, lembretes, alertas e os direitos do usuário.
- [ ] **Bloco D · Produção** — endurecimento, retenção de dados, auditoria e as consultas
      quentes com o volume do DF simulado.

> [!info] Estado detalhado
> O handoff completo — ambientes, portões, divergências registradas e por onde continuar —
> está em `frila-backend/docs/ESTADO.md`. Esta nota guarda o que interessa ao time; lá
> está o que interessa a quem for escrever a próxima linha de SQL.

## Notas

- 2026-09-22 — Esquema inicial aplicado e verde: oito migrações datadas, 19 tabelas, 30
  restrições `CHECK`, uma de exclusão, 50 índices e 33 comentários de finalidade (LGPD,
  RNF08). Cobertura em **85 asserções pgTAP** distribuídas em cinco arquivos.
- 2026-09-22 — Os testes cobrem também **o que não pode existir**: `pagamento`,
  `carteira`, `comissao`, `mensagem`, `nota` e `comentario`; coluna de coordenada em
  `turno`; coluna de patrocínio ou prioridade em `vaga`. A ausência dessas quatro é
  decisão de produto (RN01, RN06, RN07, RN09, RN10, RN22), e decisão que ninguém testa
  volta sozinha na primeira semana de pressa.
- 2026-09-22 — Uma divergência deliberada com a Modelagem: `turno.checkout_distancia_m`
  entrou **sem** o teto de 200 m que a tabela original traz. Com o teto, o profissional
  que se afasta do local não consegue encerrar o turno, e o registro fica sem check-out
  em vez de com um check-out distante — pior para os dois lados e para a auditoria. A
  distância entra como medida; quem classifica é a regra. Está na fila do cartão
  `S0 · Produto · Decisões de produto que travam o código`, prazo 02/10, e isolada numa
  migração própria.
- 2026-09-22 — `pg_cron`, `pgmq` e `pg_net` ficaram para a migração do despacho, no
  Sprint 2. Ligar agendador sem job é superfície sem uso.
- 2026-09-22 — O trabalho passou a rodar por um pipeline de cinco agentes versionados em
  `agents/`, iguais nas quatro máquinas: criação de cartão, auditoria do quadro,
  investigação por medição, implementação e revisão de código. O cartão sai do Trello,
  vira branch, vira PR revisado contra a checklist de aceite, e volta ao quadro.
- 2026-09-22 — Cada PR passa por um agente de revisão antes do merge. Não é cerimônia:
  na primeira rodada do PR #1 ele mediu que o RLS estava **desligado** nas dezenove
  tabelas e que a chave publicável do app tinha `INSERT`, `UPDATE` e `DELETE` em todas
  — um buraco que teria ido para o `frila-dev` e ficado aberto até alguém olhar.
- 2026-09-22 — Daí saiu `scripts/mutacao.sh`, que derruba cada restrição, trigger e
  política, uma por vez, e exige que o pgTAP fique vermelho. Ele achou o buraco
  seguinte: **10 das 19 políticas de leitura sobreviviam** aos testes. Derrubar uma
  política *fecha* dado em vez de abrir, então uma suíte só com asserções do tipo
  "fulano não lê" segue verde sem ela. Hoje são 53 de 53 regras cobertas, e o portão
  está na integração contínua.
- 2026-09-22 — O `frila-dev` não precisou ser criado: já existia um projeto vazio na
  org, criado no mesmo dia e ainda com o nome padrão. Renomeado e usado, porque o plano
  gratuito dá dois projetos ativos por organização e o outro é do `frila-prod`.
- 2026-09-22 — O advisor de segurança do Supabase apontou uma função que ninguém do
  time escreveu: um *event trigger* que liga RLS sozinho em toda tabela nova, vindo do
  painel e existente **só no `frila-dev`**. Trazido para migração. É o caso que a
  Modelagem nomeia: mudança feita pelo painel e não versionada é mudança que o próximo
  ambiente não tem — e o ambiente onde a falha aparece não é o ambiente onde ela foi
  escrita.
- 2026-09-22 — O contrato subiu para **0.2.1** (BlendOps/Frila#1) por três divergências
  que apareceram ao implementar a entrada por e-mail: `criar_conta` precisava de um campo
  de aceite dos termos que a 0.2.0 não tinha, a rota `minha_conta` não existia no
  documento, e o trecho de `erro()` publicado na descrição não funciona — falta a chave
  `headers`, e sem ela o PostgREST devolve 500 em toda recusa de regra de negócio. A
  terceira importa além do Frila: quem copiasse aquele trecho para outro serviço herdaria
  a falha.
- 2026-09-22 — Duas vezes no mesmo dia a suíte de testes passou inteira sobre uma regra
  ausente: 11 de 31 restrições e 10 de 19 políticas podiam ser removidas sem nada
  reclamar. E uma terceira vez, mais sutil: os testes da primeira RPC conferiam só o
  `sqlstate` da exceção, nunca o código — trocar `menor_de_idade` por qualquer outra
  coisa deixava tudo verde. Nos três casos quem achou foi medição, não leitura.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
