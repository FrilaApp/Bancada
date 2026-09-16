---
tipo: home
---

# 🏠 Início

Diário de bordo do **Challenge 18**, compartilhado pela equipe. Este vault é também o repositório Git — o que você escreve aqui chega aos outros com um `push`.

## As frentes

- [[01 - CBL/00 - Índice CBL|📘 CBL]] — o framework de Challenge Based Learning: desafios ativos e concluídos que guiam o aprendizado e as decisões do produto. Os documentos `.pages` do ciclo vivem aqui, com um `.md` derivado ao lado para que o Git mostre o que mudou no texto.
- [[02 - Atualizações Diárias/00 - Índice Diário|📅 Atualizações Diárias]] — a narrativa do dia a dia: o que foi feito, decisões, bloqueios e aprendizados.
- [[03 - Roadmap/Roadmap - Sumário de Iterações|🗺️ Roadmap]] — sumário cronológico das iterações, consolidando o que vem do CBL e das atualizações diárias.
- [[04 - Tarefas/00 - Índice Tarefas|✅ Tarefas]] — o quadro da equipe. Uma nota por tarefa, agrupada por status em [[04 - Tarefas/Quadro.base|Quadro]].
- [[05 - Registros/00 - Índice Registros|📋 Registros]] — o log de fatos, escrito pelos hooks. É a matéria-prima do diário, e não se edita à mão.
- [[06 - Design/Sistema de Design|🎛 Design]] — o sistema que governa a aparência da Bancada e do site: as três camadas de token, as três vozes e o porquê de cada decisão. A [[06 - Design/Revisão de UI - 2026-09-09|revisão de UI de 09/09]] registra o quanto o app cumpre isso hoje, com a captura de cada achado.
- [[07 - Arquitetura/Diagrama de Arquitetura|🏗 Arquitetura]] — as decisões técnicas que o código do **Frila** vai seguir: a [[07 - Arquitetura/Modelagem de Banco de Dados|modelagem de banco]], o [[07 - Arquitetura/Diagrama de Classe|diagrama de classe]] e o desenho do sistema. Preenchem a Seção 6 do Documento de Requisitos e marcam `[H]` tudo o que ainda é hipótese.

## Como o registro funciona

O sistema separa **fato** de **narrativa**, e é isso que mantém o histórico honesto:

```
commit / documento / sessão  →  05 - Registros   (automático, verificável)
                                      ↓  /diario
                             02 - Atualizações Diárias   (narrativa do dia)
                                      ↓  /iteracao
                             03 - Roadmap  +  01 - CBL   (o que ficou)
```

Nenhuma frase do diário existe sem um fato que a sustente.

## No dia a dia

| Comando | Quando usar |
|---|---|
| `/entrar` | Ao começar — puxa o trabalho da equipe e mostra o quadro |
| `/tarefa` | Quando surge algo a fazer |
| `/documento` | Depois de mexer num `.pages` |
| `/diario` | Ao terminar o dia |
| `/iteracao` | Quando algo merece subir para o Roadmap |

As regras completas estão no `CLAUDE.md` na raiz do repositório.
