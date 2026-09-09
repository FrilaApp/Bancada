# doc-harness — registro de iterações do Challenge 18

Este repositório **é** um vault do Obsidian. Repo e vault são a mesma pasta: quem clona abre esta pasta como vault e tem tudo funcionando. Trabalhamos em português-BR, inclusive commits.

É o diário de bordo compartilhado da equipe (org `BlendOps`, 5 pessoas) durante o ciclo CBL — Challenge Based Learning do Apple Developer Academy.

---

## A regra de ouro: fato ≠ narrativa

O sistema tem duas camadas, e **misturá-las corrompe o registro**:

| Camada | Onde | Quem escreve |
|---|---|---|
| **Fatos** — o que aconteceu, verificável | `05 - Registros/` | Só os hooks, via `scripts/registrar-fato.sh` |
| **Narrativa** — o que aquilo significou | `02 - Atualizações Diárias/`, `03 - Roadmap/`, `01 - CBL/` | Você, sob comando |

Consequências práticas:

- **Nunca edite nada em `05 - Registros/` à mão.** É append-only, escrito por máquina. Você só lê.
- **Nunca escreva narrativa sem fato correspondente.** Ao rodar `/diario`, cada bullet que você escrever tem que sair de uma linha do log do dia. Se não há fato, não há bullet — não preencha lacunas com suposição plausível.
- Se o log estiver vazio, diga que está vazio. Um dia sem registro é um dado, não um problema a esconder.

---

## Mapa das pastas

```
01 - CBL/           Desafios do ciclo. Um subdiretório por desafio, com os
                    documentos .pages e seus .md derivados em Documentos/.
02 - Atualizações   Narrativa do dia, uma nota por data em AAAA/MM/AAAA-MM-DD.md.
     Diárias/
03 - Roadmap/       Sumário de iterações, cronológico invertido (mais recente no topo).
04 - Tarefas/       Uma nota por tarefa. Quadro.base é a visualização.
05 - Registros/     Log de fatos. Leitura apenas.
scripts/            Automação. Ver README.md.
```

Nunca crie nota fora dessa estrutura. Se algo não couber em nenhuma pasta, pergunte antes de inventar uma nova.

---

## Convenções de escrita

**Frontmatter YAML é obrigatório** em toda nota. Chaves sem acento, minúsculas. Valores válidos de `tipo`:
`home` · `indice` · `cbl-desafio` · `atualizacao-diaria` · `roadmap` · `tarefa` · `registro` · `documento-derivado`

Valores válidos de `status` em tarefas: `a-fazer` · `em-andamento` · `revisao` · `concluida`
Em desafios CBL: `ativo` · `concluido` · `pausado`

Datas sempre ISO: `2026-09-08`.

**Wikilinks sempre com caminho completo + alias:**
`[[02 - Atualizações Diárias/2026/09/2026-09-08|2026-09-08]]`

**Rodapé de navegação** ao fim de toda nota:
```
---
← [[01 - CBL/00 - Índice CBL|Índice CBL]]
```

**As seções da nota diária são fixas** — não invente, não renomeie, não remova:
`## O que foi feito` · `## Decisões` · `## Bloqueios` · `## Aprendizados` · `## Próximos passos`

**As seções do desafio CBL são fixas** e seguem o framework:
Big Idea · Pergunta Essencial · Desafio · Perguntas/Atividades/Recursos Norteadores · Solução · Implementação · Avaliação e Reflexão

Índices (`00 - Índice *.md`) são listas de wikilinks mantidas à mão — ao criar uma nota nova, adicione-a ao índice da pasta no mesmo movimento.

---

## Fluxo de trabalho

```
/entrar          → puxa o trabalho dos colegas e resume o que mudou
  … trabalhar …
/tarefa          → cria tarefa nova quando surgir
/documento       → converte .pages alterado em .md
/diario          → escreve a narrativa do dia a partir dos fatos
  … commit …
/iteracao        → promove o que foi significativo para o Roadmap e o desafio CBL
```

Sempre **`/entrar` antes de começar**: 5 pessoas escrevem no mesmo repo, e resolver conflito é mais caro que puxar antes.

---

## Commits

- Mensagem em português, imperativo, uma linha: `Adiciona pipeline de exportação do Pages`
- Se a mudança atende uma tarefa, referencie o id: `… (T-0007)`
- Cada commit gera automaticamente uma linha em `05 - Registros/` — não registre manualmente.
- Nunca use `--no-verify`. O `pre-commit` é o que mantém os `.md` derivados em dia com os `.pages`.
- **O `push` exige Touch ID.** É um humano confirmando que a publicação é intencional — por isso você nunca deve usar `SKIP_BIOMETRICS=1` por conta própria, nem sugerir isso para contornar o prompt. Se o push falhar por falta do módulo, oriente a rodar `./scripts/bootstrap.sh`.

---

## Proibido

Os dois primeiros itens não dependem da sua boa vontade: `scripts/guarda.sh` bloqueia mecanicamente pelo hook `PreToolUse`. Estão aqui para você entender o porquê, não para você lembrar de obedecer.

- **Editar um `.md` derivado de `.pages`** (`tipo: documento-derivado`). É regenerado e sua edição será perdida — mexa no `.pages` original. *(bloqueado)*
- **Escrever no log de fatos** por qualquer caminho que não seja `scripts/registrar-fato.sh` — inclusive por redirecionamento em Bash. *(bloqueado)*
- **Versionar `.obsidian/plugins/`.** Contém o bearer token pessoal do MCP Connector. Já está no `.gitignore`; não force.
- **Depender do MCP do Obsidian em scripts ou hooks.** O servidor só responde com o Obsidian aberto — automação escreve direto no arquivo `.md`. O MCP serve para você navegar e buscar durante a conversa, não para automatizar.

Além disso, comandos destrutivos (`rm -r`, `git reset --hard`, `git clean -f`, `git push --force`, `git branch -D`) e contornos de gate (`--no-verify`, `SKIP_PAGES`, `SKIP_BIOMETRICS`) devolvem a decisão para a pessoa, mesmo em modo de permissão automático. Não tente contornar isso reformulando o comando.

---

## Contexto do ciclo

Os ciclos são nomeados `C13`, `C14`, `C16`, `C17`… O atual é **C18**. Os entregáveis chegam como `.pages` (template CBL, plano de pesquisa, documento de reflexão) e cada um vira um `.md` versionado ao lado do original, para que o Git mostre o que mudou no texto — e não apenas que o arquivo mudou.

---

## Contatos da equipe (org BlendOps, C18)

| Membro | E-mail |
|---|---|
| 708 Cauê Carneiro | cauecarneiroc@gmail.com |
| 714 Fabrício Tosta | fbtostadev@gmail.com |
| 721 João Paulo | joaopauloalbuquerque606@gmail.com |
| 724 Júlia Clovandi | julia.clovandi@a.ucb.br |
| 737 Matheus Silva | blackgg100500@gmail.com |
