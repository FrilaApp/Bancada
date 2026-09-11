---
description: Cria uma nota de tarefa no quadro
argument-hint: [título da tarefa]
---

Crie uma nova tarefa em `04 - Tarefas/`.

## Passos

1. Descubra o próximo id: liste `04 - Tarefas/T-*.md` e pegue o maior número + 1, formatado com quatro dígitos (`T-0007`).
2. Crie `04 - Tarefas/T-NNNN - <título>.md` a partir de `04 - Tarefas/Template - Tarefa.md`.
3. Preencha o frontmatter:
   - `id`: o id novo
   - `status`: `a-fazer`
   - `responsavel`: quem vai tocar; se não foi dito, use `git config user.name`
   - `desafio`: o desafio ativo em `01 - CBL/Desafios/` (frontmatter `status: ativo`), se houver
   - `data_criacao`: hoje, em ISO
4. Escreva `## Contexto` ligando a tarefa à pergunta do desafio que ela ajuda a responder, e `## Feito quando` com critérios verificáveis — não "melhorar X", mas algo que dá para conferir.

O título vem de: $ARGUMENTS

Se o título não foi dado, pergunte antes de criar. Uma tarefa sem título claro vira lixo no quadro.
