---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-17
tags: [arquitetura, engenharia, pendencias, frila]
---

# Pendências Técnicas — Antes de Colocar a Mão no Código

Extraído dos três documentos de arquitetura (T-0024): `Diagrama de Classe`, `Modelagem de Banco de Dados` e `Diagrama de Arquitetura`, em `doc-harness/07 - Arquitetura/`. PDFs correspondentes em `Documentos/PDF/`.

**Objetivo deste arquivo:** listar toda decisão em aberto que a equipe precisa fechar antes do backend e do Android começarem. Serve de fonte para atualizar o FigJam (board Challenge 18 → seção "Arquitetura Técnica · Frila") — quem tiver limite de API livre pode puxar os itens abaixo e colar nos cartões correspondentes.

Gerado em 17/09/2026.

---

## 🔴 Bloqueiam a v1 — precisam de resposta antes da primeira linha de código

Nenhuma delas trava o protótipo de baixa-fidelidade. Todas travam a primeira versão que alguém use de verdade.

| # | Decisão | Pergunta direta | Por que importa |
|---|---|---|---|
| D9 | Backend | Próprio (PostgreSQL + PostGIS) ou gerenciado (Supabase, Firebase)? | Muda o significado de metade das restrições do banco — sem transação multi-chave, RN19 (confirmação dupla) deixa de ser garantia do banco e vira código de aplicação. |
| D10 | Plataforma | iOS nativo com núcleo de regras compartilhado, ou nativo puro nas 3 plataformas (iOS, Android, Web)? | Confirmar **antes com a Academy** o que "iOS nativo" exige — a leitura errada elimina a opção de núcleo compartilhado por completo. Trocar depois custa reescrever o que já funciona. |
| D6 | Despacho | O motor de despacho roda como serviço próprio ou dentro da API? | Afeta o orçamento de 30 segundos da primeira leva (RNF03). |
| D11 | Contrato | A especificação OpenAPI é escrita antes do backend, ou junto com ele? | Importa se os 3 clientes (iOS, Android, Web) forem construídos em paralelo — sem contrato fechado antes, cada um implementa uma leitura diferente. |
| D13 | Push Android | Provedor de push no Android: FCM ou alternativa? | Precisa de resposta assim que o Android entrar em desenvolvimento. |

---

## 🟡 Pendências menores — não travam o protótipo, mas precisam de dono e prazo

| # | Decisão | Pergunta direta |
|---|---|---|
| D2 | Despacho | Qual o tamanho da leva e o intervalo entre levas? |
| D3 | Candidatura | Qual o prazo até a candidatura expirar? Sem prazo, o modo seleção (RF09) trava a posição indefinidamente. |
| D4 | Urgência | A janela crítica é fixa ou varia por tipo de vaga? (buffet de formatura ≠ bar de sexta) |
| D7 | Cache local | SwiftData ou Core Data? A escolha pode esperar o primeiro cache real — está isolada atrás do protocolo `CacheLocal`. |
| D8 | Domínio compartilhado | O domínio vira pacote compartilhável entre plataformas? **Depende da resposta de D10.** |
| D12 | Testes | Manter XCTest (195 testes já escritos na Bancada) ou migrar para Swift Testing? Recomendação dos documentos: manter. |

---

## ✅ Já decidido — não precisa de confirmação, só de leitura

Para não gerar retrabalho perguntando algo que os documentos já fecharam:

- **D1 — Turnos sobrepostos:** vira restrição de banco (`EXCLUDE USING gist`). Nada nos requisitos originais impedia o mesmo profissional aceitar dois turnos que se cruzam — o que derrubaria a taxa de comparecimento dele por falha do sistema.
- **Domínio isolado:** nenhuma seta sai da camada de domínio (Clean Architecture/MVVM). Permite trocar a regra de elegibilidade sem tocar em tela, rede ou banco.
- **Android e Web não são hipótese:** o Documento de Visão fecha os dois como escopo confirmado — não `[H]`. (Os 3 documentos técnicos foram corrigidos nesta revisão; se algum outro material do projeto ainda marcar Android/Web como hipótese, está desatualizado.)
- **Confirmação dupla:** tratada como corrida entre requisições. A API responde `200` (confirmado), `409` (já ocupado por outra corrida) ou `422` (regra de negócio violada).

---

## ⚙️ Processo — não é decisão técnica, é etapa que falta acontecer

- [ ] Revisão pelos desenvolvedores (Cauê, João Paulo, Matheus) dos três documentos técnicos.
- [ ] Curadoria e padronização visual pela Júlia Clovandi, conforme [[04 - Tarefas/T-0012 - Coletar decisões técnicas e gerar diagramas de engenharia|T-0012]].
- [ ] Atualizar o FigJam do board (Challenge 18) com os itens deste arquivo — a seção "Arquitetura Técnica · Frila" já existe com as colunas "Decisões Fechadas" e "Bloqueiam a v1" preenchidas; falta a coluna **"Pendências Menores"** (os 6 itens D2/D3/D4/D7/D8/D12 acima) e a nota de processo.
- [ ] Corrigir um cartão desatualizado que já existia na seção "Dúvidas" do FigJam: ele pergunta sobre "duas plataformas" (iOS/Android); hoje são três (iOS, Android e Web), com Web e Android como escopo confirmado, não hipótese. Sugestão de texto novo:
  > iOS nativo puro ou núcleo de regras compartilhado com Android e Web?
  >
  > Decisão D10 ainda aberta — Android e Web já são escopo confirmado, não hipótese.

---

## Onde ler mais

| Documento | Onde |
|---|---|
| Diagrama de Classe | `doc-harness/07 - Arquitetura/Diagrama de Classe.md` · `Documentos/PDF/Diagrama de Classe.pdf` |
| Modelagem de Banco de Dados | `doc-harness/07 - Arquitetura/Modelagem de Banco de Dados.md` · `Documentos/PDF/Modelagem de Banco de Dados.pdf` |
| Diagrama de Arquitetura | `doc-harness/07 - Arquitetura/Diagrama de Arquitetura.md` · `Documentos/PDF/Diagrama de Arquitetura.pdf` |
| Tarefa que originou os 3 documentos | `doc-harness/04 - Tarefas/T-0024 - Diagramas de classe, banco de dados e arquitetura.md` |
