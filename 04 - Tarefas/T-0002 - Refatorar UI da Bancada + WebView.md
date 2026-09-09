---
tipo: tarefa
id: T-0002
status: em-andamento
responsavel: fbtostadev
desafio: C18
data_criacao: 2026-09-09
tags: [tarefa]
---

# Refatorar UI da Bancada + WebView

## Contexto
A Bancada é o leitor Mac nativo do vault, hoje somente leitura e coexistindo com o Obsidian; a Fase 2 (site para pessoas externas) ainda está pendente. Refatorar a UI e a WebView agora prepara o app para essa fase seguinte, melhorando a experiência de leitura interna antes de expor o conteúdo para fora.

## Feito quando
- [x] Seis seções reduzidas a cinco, sem perder capacidade: **Trabalho** (tarefas + registros ligados pelo ID citado no log), **Acervo** (galeria + o painel de Markdown derivado do `.pages`) e **Ajustes** (a saúde do vault e a pasta aberta).
- [x] `VaultKit/Vinculo.swift` — o vínculo fato ↔ tarefa por ID literal, com testes que provam que ele não inventa vínculo.
- [x] `VaultKit/Calendario.swift` + `DataISO` — eventos por dia (fato, diário, tarefa criada) e datas ancoradas ao meio-dia, com testes.
- [x] Medidas novas em `DS`/`tokens.json`, nenhuma solta dentro das views.
- [x] `--verificar` sai com `0` e o JSON de `--indice` segue no `versaoDoFormato: 1` — o gerador de site continua funcionando sem alteração.
- [ ] UI revisada visualmente por quem usa (a refatoração roda; falta o olho).
- [ ] Grade mensal do calendário — o andaime está de pé, a tela é uma lista.
- [ ] WebView / site estático alinhado à nova hierarquia (fora do escopo desta rodada, por decisão).

## Notas
- Escopo detalhado e executado em 2026-09-09: fusão das seções e andaime do calendário. O gerador de site (`scripts/gerar-site.js`) ficou intocado de propósito — o contrato JSON não mudou, e alinhá-lo é trabalho próprio.
- Pendência conhecida no código tocado: `CartaoComparativoUI`, em `TelaRegistros.swift`, tem metadados de commit escritos à mão (`f7efef3`, `d622a3a`, `94a7665`, `e501854`) e medidas fixas. Num app cuja premissa é que o registro é confiável, metadado digitado à mão passa a mentir assim que o log muda. Merece tarefa própria.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
