---
tipo: tarefa
id: T-0003
status: a-fazer
responsavel: fbtostadev
desafio: C18
data_criacao: 2026-09-09
tags: [tarefa, urgente]
---

# Corrigir atualização automática da Bancada em relação ao Obsidian

## Contexto
A Bancada fecha o processo inteiro quando a última janela é fechada
(`applicationShouldTerminateAfterLastWindowClosed` retorna `true`). Sem o
processo rodando, o `ObservadorDeVault` (FSEvents) não existe mais, então
qualquer mudança feita no vault pelo Obsidian ou por hooks do Git para de
"chegar" na Bancada até alguém reabrir o app manualmente — o que parece um
bug de atualização, mas é o processo simplesmente não estar mais vivo.

Modelo sugerido para a implementação: **Opus**.

## Feito quando
- [ ] Decidido e implementado o comportamento correto: manter o app vivo em segundo plano ao fechar a janela (reabrindo-a ao clicar no ícone da Dock) e/ou reforçar que o dado é sempre lido do disco na hora, nunca de cache — para que reabrir a janela sempre mostre o vault atual.
- [ ] `ObservadorDeVault` confirmado ativo durante todo o tempo em que o app está rodando em segundo plano, refletindo mudanças do Obsidian sem precisar fechar e reabrir.
- [ ] Testado manualmente: editar uma nota pelo Obsidian com a Bancada aberta (e depois com a janela fechada, se o app continuar em segundo plano) e confirmar que a mudança aparece sem ação manual.

## Notas
- Diagnosticado nesta sessão: o app estava simplesmente fechado (sem processo rodando), não com o observador quebrado — confirmado testando o watcher com o app aberto (funcionou, atualizou sozinho em ~4s).

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
