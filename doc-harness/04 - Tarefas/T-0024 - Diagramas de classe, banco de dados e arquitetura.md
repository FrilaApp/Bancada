---
tipo: tarefa
id: T-0024
status: revisao
responsavel: [Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva]
desafio: C18
data_criacao: 2026-09-15
tags: [tarefa, cbl, c18, arquitetura, frila]
---

# Diagramas de classe, banco de dados e arquitetura

## Contexto
Insumo técnico para [[04 - Tarefas/T-0012 - Coletar decisões técnicas e gerar diagramas de engenharia|T-0012]], que reserva à PO/PM a curadoria e a formatação final no documento de requisitos. Três dos milestones do [[01 - CBL/Desafios/C18/C18|C18]] — diagrama de classe, modelagem de banco de dados e diagrama de arquitetura — estavam com o link vazio, e as Seções 6.2, 6.3 e 6.4 do Documento de Requisitos traziam as tabelas descritivas com a marca *"Inserir o diagrama aqui"*. O material existia em texto; faltavam o desenho e as decisões que a tabela deixava implícitas.

A tarefa fecha essa lacuna a partir do que [[04 - Tarefas/T-0009 - Desenvolvimento do documento de visão|T-0009]] e o Documento de Requisitos já estabeleceram, sem inventar decisão: a stack do backend segue em aberto, e o que é hipótese está marcado com `[H]`.

## Feito quando
- [x] Modelagem de banco de dados escrita, com DDL e as restrições que codificam RN02, RN07, RN18, RN19 e RN20.
- [x] Diagrama de classe reorganizado por camada, com os enums que o Documento de Requisitos citava sem definir.
- [x] Diagrama de arquitetura em três níveis, com as decisões em aberto apresentadas como trade-off.
- [x] Diagramas gerados em PNG e embutidos nas Seções 6.2, 6.3 e 6.4 do `.docx`.
- [x] Os três documentos exportados em PDF, para circular com quem não abre o vault.
- [ ] Revisão e validação pelos desenvolvedores (Cauê, João Paulo e Matheus), como pede T-0012.
- [ ] Curadoria e padronização visual por [[04 - Tarefas/T-0012 - Coletar decisões técnicas e gerar diagramas de engenharia|T-0012]] (Júlia Clovandi).
- [ ] Decisões D1 a D13 levadas à equipe — em especial D1 (turnos sobrepostos) e D9 (backend próprio ou gerenciado).

## Notas
- 2026-09-15 — Documentos criados em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]], [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]] e [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]], em pasta nova `07 - Arquitetura/`, com os tipos `arquitetura` e `documento-produto` acrescentados ao vault.
- 2026-09-16 — Renumerada de T-0010 para T-0024: a equipe publicou T-0010 a T-0023 no mesmo dia, e o id colidiu. O escopo permanece subordinado a T-0012.
- 2026-09-16 — O Mermaid saiu do pipeline. O auto-layout cruzava linhas e sobrepunha rótulos justamente nos diagramas densos, que são os que vão para apresentação. No lugar entrou um kit de desenho em SVG (`Frila/Documentos/PY/diagramas.py`), com coordenadas escritas à mão: 13 diagramas, organizados em `banco-de-dados/`, `classes/` e `arquitetura/`.
- 2026-09-15 — A Seção 6.1 (casos de uso) ficou deliberadamente fora do escopo e mantém o placeholder.
- 2026-09-15 — Levantada uma regra que os requisitos não enunciam: nada impede hoje que o mesmo profissional seja confirmado para dois turnos sobrepostos, o que derrubaria a taxa de comparecimento dele por falha do sistema. Registrada como decisão D1.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
