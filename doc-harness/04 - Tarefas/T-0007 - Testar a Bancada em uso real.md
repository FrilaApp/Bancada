---
tipo: tarefa
id: T-0007
status: em-andamento
responsavel: João Paulo
desafio: C18
data_criacao: 2026-09-10
tags: [tarefa]
---

# Testar a Bancada em uso real

## Contexto
A Bancada já compila, empacota e abre, mas até agora foi verificada por teste
automatizado e por olhada rápida de quem a escreveu. Falta o outro tipo de
prova: alguém da equipe usando o app como leitor do vault no dia a dia, ao lado
do Obsidian, e anotando onde ele erra.

Isso alimenta duas coisas do C18 ao mesmo tempo. A Bancada é a ferramenta com
que o grupo lê o próprio registro de iterações — se ela mente sobre o vault, o
registro perde valor como base para o desafio. E o uso real é o que separa as
tarefas de UI já abertas ([[04 - Tarefas/T-0002 - Refatorar UI da Bancada + WebView|T-0002]],
[[04 - Tarefas/T-0005 - Corrigir atualização automática da Bancada em relação ao Obsidian|T-0005]])
de reclamação genérica: cada ajuste passa a ter um caso concreto atrás.

## Feito quando
- [ ] O app foi aberto e usado em pelo menos três sessões de trabalho distintas, com o Obsidian aberto ao mesmo tempo no mesmo vault, sem que nenhuma das duas ferramentas corrompesse ou travasse arquivo da outra.
- [ ] Cada uma das quatro superfícies foi percorrida com o vault real e comparada com o conteúdo dos `.md`: tabela de tarefas, galeria com miniaturas, log de fatos indentado e calendário (incluindo os eventos vindos de `Agenda - C18.md`).
- [ ] Divergência entre o que a Bancada mostra e o que está no arquivo foi registrada aqui em `## Notas`, com o caminho da nota e o que apareceu errado — ou está escrito que nenhuma foi encontrada.
- [ ] Testado o caminho de quem baixa o app pronto: apontar o vault pelo botão de pasta da barra de ferramentas e confirmar que a escolha sobrevive a fechar e reabrir.
- [ ] Cada problema que não for corrigido no ato virou tarefa própria no quadro, referenciada aqui — nada fica só nesta nota.

## Notas
- 2026-09-10 — build local rodada nesta sessão: 142 testes do VaultKit e do DesignSystem passaram, `swift build -c release` limpo, `Bancada.app` empacotado e aberto. É o ponto de partida do teste manual, não o teste em si.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
