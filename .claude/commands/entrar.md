---
description: Puxa o trabalho da equipe e resume o que mudou desde a última vez
---

Prepare o início do trabalho.

## Passos

1. `git status --short` — se houver mudança local não commitada, mostre e **pergunte** antes de puxar. Não descarte trabalho de ninguém.
2. `git pull --rebase`
3. Resuma o que chegou: `git log --oneline -20 --since="2 days ago"` e o log de fatos dos últimos dias em `05 - Registros/`.
4. Mostre o estado do quadro: tarefas em `04 - Tarefas/` com `status: em-andamento` ou `revisao`, e quem é o responsável de cada uma.
5. Diga qual é o desafio ativo em `01 - CBL/Desafios/`.

Se o rebase der conflito, pare e explique o conflito. Não resolva sozinho conflito em nota de outra pessoa — a narrativa dela é dela.
