---
tipo: tarefa
id: T-0008
status: a-fazer
responsavel: fbtostadev
desafio: C18
data_criacao: 2026-09-11
tags: [tarefa]
---

# Corrigir contraste entre elementos em row highlight

## Contexto
Ao selecionar uma linha na tabela de tarefas (`TelaTarefas`) ou na lista de notas diárias (`TelaDiario`), o sistema aplica o preenchimento azul vívido de seleção da janela (`Color.accentColor`).

Como as células dessas tabelas aplicavam estilos de texto estáticos com cores escuras ou semitransparentes (`.foregroundStyle(cores.textoSutil)` ou `cores.texto`), e o componente `Etiqueta` utilizava véu escuro/colorido padrão, os elementos secundários (ID `T-0005`, pílula de status, responsável, código de desafio e data) ficavam com contraste baixíssimo contra o fundo azul, dificultando a leitura e quebrando a conformidade de acessibilidade (WCAG) e do Apple HIG.

Esta tarefa assegura que qualquer elemento contido em uma linha selecionada responda ao estado de destaque, adotando tipografia branca com hierarquia adequada e cápsula translúcida nítida para etiquetas.

## Feito quando
- [ ] Na tabela de tarefas (`TelaTarefas`), colunas de ID, Responsável, Desafio e Data invertem a cor para branco com opacidade calibrada quando a linha está selecionada.
- [ ] A `Etiqueta` de status suporta o estado de seleção (`selecionada`), adotando contraste limpo em branco com pílula translúcida e borda nítida sobre o acento.
- [ ] Na lista de diários (`TelaDiario`), a contagem de fatos da linha selecionada também adota cor clara com contraste calibrado.
- [ ] Todos os testes automatizados da Bancada passam com sucesso (`swift test`).
- [ ] Verificação visual em execução comprova a legibilidade imediata de todos os elementos na linha selecionada.

## Notas
- 2026-09-11 — Problema documentado a partir de captura de tela na seção de Trabalho com a linha `T-0005` selecionada.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
