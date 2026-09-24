---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-17
tags: [arquitetura, engenharia, pendencias, frila]
---

# Pendências Técnicas — Antes de Colocar a Mão no Código

Extraído dos documentos de arquitetura (T-0024): [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]], [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]] e [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]], em `doc-harness/07 - Arquitetura/`. Os PDFs correspondentes ficam no repositório do Frila, em `Documentos/Diagramas:Documentos/`.

**Objetivo deste arquivo:** listar toda decisão técnica que a equipe precisava fechar antes do backend e do Android começarem. Gerado em 17/09/2026.

> [!info] Atualizado em 22/09/2026
> As treze decisões foram respondidas no quadro 03 de pendências do FigJam, em 21/09/2026, com um ajuste na D8 em 22/09. Este arquivo passa a registrar as respostas; o código de resposta de cada uma (B01, D07…) é o da pergunta no quadro.
> Também em 22/09, o Cauê respondeu as pendências que ainda faltavam para começar o código (seção “Respondidas em 22/09/2026”, logo abaixo).

---

## ✅ Respondidas em 21/09/2026

| # | Decisão | Resposta | Pergunta no quadro |
|---|---|---|---|
| D1 | Turnos sobrepostos | Aprovada: virou RN21, garantida no banco por `EXCLUDE USING gist`. O profissional não pode aceitar dois turnos que se cruzam | B04 |
| D2 | Tamanho da leva e intervalo entre levas | Não há levas: a notificação sai de uma vez para quem tem a função, está disponível e a até 15 km do local, e a equipe de confiança recebe mesmo além. Teto de uma notificação a cada 30 minutos por profissional, com agrupamento (RN23) | D07 |
| D3 | Prazo até a candidatura expirar | A candidatura vale até a vaga fechar. Modo seleção só para vaga que começa em mais de 24 horas; sem escolha até 24 horas antes, a vaga fecha sozinha e os candidatos são liberados (RN24) | D05 |
| D4 | Janela crítica fixa ou por tipo de vaga | Um padrão igual para todas — 3 horas antes do início —, que o contratante ajusta ao publicar. O alerta chega ao contratante por notificação | B18 |
| D5 | PostgreSQL com PostGIS, ou backend gerenciado | É a mesma decisão da D9: Supabase, que é Postgres com PostGIS | B06 |
| D6 | O despacho roda como serviço próprio ou dentro da API | Fora da requisição: publicar só grava e responde; um job separado (Edge Function, `pg_cron` e fila `pgmq`) faz notificações, agrupamento, teto, lembretes, alertas e fechamentos | B15 |
| D7 | Cache local | SwiftData, com iOS 17 como mínimo (RNF04 sobe de iOS 16 para iOS 17) | B19 |
| D8 | Domínio compartilhado entre plataformas | Não há pacote de código comum entre Swift e Kotlin. As regras críticas moram no backend, em funções do Supabase, escritas uma vez; cada app tem o próprio domínio para a tela e os testes (ajustada em 22/09) | B20 |
| D9 | Backend | Supabase (Postgres + PostGIS, autenticação, Edge Functions, `pg_cron`, `pgmq`). Começa no plano gratuito, que atende até 50 mil usuários ativos por mês; a migração é reavaliada a partir de certa rentabilidade | B02 |
| D10 | Plataforma | Nativo em cada plataforma: Swift e SwiftUI no iOS, Kotlin no Android. Para a loja em 13/11, o iOS é o mínimo; Android e web são a meta | B01, B03 |
| D11 | Contrato | A especificação é escrita antes do backend, pelo menos das rotas centrais (publicar vaga, candidatar-se, confirmar, check-in, avaliar). Com o Supabase, o contrato são as funções RPC documentadas. Escrita em 22/09: `Frila/Documentos/API/openapi.yaml` (OpenAPI 3.1, v0.1.0) | B16 |
| D12 | Testes | Swift Testing para a lógica e XCTest só para a interface, com XCUITest. Os dois convivem no mesmo projeto; os 195 testes XCTest da Bancada ficam como estão | B21 |
| D13 | Push | FCM nos dois sistemas; no iOS, o FCM entrega pela APNs | B17 |

---

## ✅ Respondidas em 22/09/2026 — para começar o código

| Pendência | Resposta |
|---|---|
| Um app ou dois | Um app só, com dois perfis, o do profissional e o do contratante, e uma ficha em cada loja |
| Uma conta pode ter os dois perfis | Não. Cada conta tem um perfil, escolhido no cadastro e fixo (RN25). Para o outro lado, a pessoa cria outra conta, com outro e-mail; o telefone pode se repetir |
| Login | Código de uso único enviado ao e-mail, sem senha e sem SMS. O envio embutido do Supabase só serve para teste; antes do piloto entra um provedor de e-mail próprio (SMTP) |
| Telefone | Obrigatório, porque é o contato do turno (RN10), e sem verificação: o app confere só o formato |
| Duração do "disponível agora" | A feature saiu. Vale só a grade semanal de disponibilidade |
| Onde fica o código | No repositório do Frila: `supabase/` e `ios/` primeiro; `android/` e `web/` depois |
| Políticas de acesso (RLS) | Escritas na [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]], uma por tabela e operação; entram nas migrações quando o código começar |
| Estimativa da US15 | 8 pontos. O MUST do Backlog passa a somar 90 |
| Tecnologia da web | Escolhida depois do iOS |
| Identificador do app (bundle ID) | `com.frila.org.app`, definido ao criar o projeto iOS em 23/09/2026. O App ID está registrado no Apple Developer com Push Notifications, e o mesmo identificador está no app do App Store Connect e nos apps iOS dos projetos Firebase |
| Wireframes (T-0011) | Protótipo clicável, gerado pelo Claude |
| Estrutura inicial do código | Criada só quando o Cauê pedir |

---

## ✅ Continua valendo

- **Domínio isolado:** nenhuma seta sai da camada de domínio (Clean Architecture/MVVM). Permite testar em milissegundos, sem tela, rede ou banco, o que o app decide sozinho.
- **Android e web continuam no escopo:** para a entrega na loja em 13/11, o iOS é o mínimo, e Android e web entram assim que couberem (B03). O Android segue como prioridade de alcance.
- **Confirmação dupla:** tratada como corrida entre requisições. A resposta é `200` (confirmado), `409` (já ocupado por outra corrida) ou `422` (regra de negócio violada). Com o Supabase, é o `UPDATE` condicional dentro de uma função RPC.

---

## ⚙️ Processo — não é decisão técnica, é etapa que falta acontecer

- [x] Revisão pelos desenvolvedores (Cauê, João Paulo, Matheus) dos quatro documentos técnicos — Classe, Banco de Dados, Arquitetura e Casos de Uso (B05), feita em 22/09.
- [ ] Curadoria e padronização visual pela Júlia Clovandi, conforme [[04 - Tarefas/T-0012 - Coletar decisões técnicas e gerar diagramas de engenharia|T-0012]].
- [x] Escrever a especificação das rotas centrais como funções RPC do Supabase (D11): `Frila/Documentos/API/openapi.yaml`, 22/09/2026; versão 0.2.0 no mesmo dia, com a entrada por e-mail e o perfil por conta.
- [ ] Escolher o provedor de e-mail (SMTP) do código de entrada, antes do piloto. O custo, se houver, entra no C09.
- [ ] Decidir quem paga a infraestrutura (C09), em debate no time.
- [ ] Atualizar a seção "Arquitetura Técnica · Frila" do FigJam (board Challenge 18): as decisões D1 a D13 passam para a coluna "Decisões Fechadas", com as respostas acima.

---

## Onde ler mais

| Documento | Onde |
|---|---|
| Diagrama de Classe | `doc-harness/07 - Arquitetura/Diagrama de Classe.md` · `Documentos/Diagramas:Documentos/classes/Diagrama de Classe.pdf` |
| Modelagem de Banco de Dados | `doc-harness/07 - Arquitetura/Modelagem de Banco de Dados.md` · `Documentos/Diagramas:Documentos/banco-de-dados/Modelagem de Banco de Dados.pdf` |
| Diagrama de Arquitetura | `doc-harness/07 - Arquitetura/Diagrama de Arquitetura.md` · `Documentos/Diagramas:Documentos/arquitetura/Diagrama de Arquitetura.pdf` |
| Diagrama de Casos de Uso | `doc-harness/07 - Arquitetura/Diagrama de Casos de Uso.md` · `Documentos/Diagramas:Documentos/casos-de-uso/Diagrama de Casos de Uso.pdf` |
| Tarefa que originou os documentos | `doc-harness/04 - Tarefas/T-0024 - Diagramas de classe, banco de dados e arquitetura.md` |

---
← [[🏠 Início|Início]]
