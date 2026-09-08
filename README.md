# doc-harness

Diário de bordo do **Challenge 18** — o registro compartilhado das nossas iterações no ciclo CBL.

Este repositório é, ao mesmo tempo, um **vault do Obsidian**. Você clona e abre a pasta no Obsidian: não há passo de importação, não há cópia paralela.

## O que ele faz

Cada commit, cada documento `.pages` alterado e cada sessão de trabalho viram uma linha de **fato** num log automático. A partir desses fatos, escrevemos a narrativa do dia — que sobe para o roadmap e para o desafio CBL. O histórico se monta sozinho, e nada nele é inventado: toda frase do diário tem um fato por trás.

## Começando (5 minutos)

```bash
git clone https://github.com/BlendOps/doc-harness.git
cd doc-harness
./scripts/bootstrap.sh
```

O `bootstrap.sh` instala os hooks do Git, confere as dependências e mostra o que falta.

Depois:

1. **Obsidian** → `Abrir pasta como vault` → selecione a pasta `doc-harness`.
2. O Obsidian vai sugerir instalar o plugin **MCP Connector**. Aceite se você usa o Claude Code com o Obsidian (recomendado). O token gerado é seu e nunca é versionado.
3. Comece pela nota **🏠 Início**.

### Requisitos

| O quê | Para quê | Se faltar |
|---|---|---|
| Obsidian 1.13+ | Ler e escrever o vault | Obrigatório |
| Claude Code | Os comandos `/diario`, `/tarefa`, `/iteracao` | Obrigatório |
| Pages (Apple) | Converter os `.pages` em Markdown | Degrada com aviso — outra pessoa converte |

## Como se trabalha aqui

| Comando | Quando |
|---|---|
| `/entrar` | Ao sentar para trabalhar — puxa o que os colegas fizeram |
| `/tarefa` | Quando surge algo a fazer |
| `/documento` | Depois de mexer num `.pages` |
| `/diario` | Ao terminar o dia — escreve a narrativa a partir dos fatos |
| `/iteracao` | Quando algo merece entrar no roadmap ou no desafio CBL |

As regras completas de escrita estão em [`CLAUDE.md`](CLAUDE.md) — é o contrato que mantém os cinco Claudes da equipe consistentes entre si.

## Organização

```
01 - CBL/            Desafios do ciclo + documentos (.pages e .md derivado)
02 - Atualizações    Uma nota por dia — a narrativa
     Diárias/
03 - Roadmap/        Sumário de iterações, mais recente primeiro
04 - Tarefas/        Uma nota por tarefa; Quadro.base é o board
05 - Registros/      Log de fatos, escrito por máquina — não editar
scripts/             Automação
```

## Duas coisas para não fazer

- **Não edite `05 - Registros/`.** É append-only e escrito pelos hooks.
- **Não edite um `.md` marcado como `tipo: documento-derivado`.** Ele é regenerado a partir do `.pages`; sua edição se perde. Mexa no `.pages`.
