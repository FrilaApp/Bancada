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

- **Nunca edite nada em `05 - Registros/` à mão.** É append-only, escrito por máquina. Você só lê. Desde 2026-09-10 isso não depende mais de boa vontade nem de padrão de texto: o hook `pre-commit` recusa qualquer commit que toque a pasta. Para reparo genuíno — hash órfão depois de um rebase, linha duplicada por hook — existe `PERMITIR_REPARO_DE_FATO=1 git commit`, que é para consertar, nunca para escrever fato novo.
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
06 - Design/        O sistema de design que governa a Bancada e o site. Escrito
                    à mão, mas não é narrativa de um dia: é regra que o código
                    segue. Os valores vivem em Bancada/tokens.json.
scripts/            Automação. Ver README.md.
```

`01 - CBL/Desafios/<id>/Agenda - <id>.md` (`tipo: agenda`) é o cronograma
oficial do desafio publicado pela Academy — não é fato do vault nem narrativa
do dia, é a terceira coisa: compromisso externo com data já marcada. Uma linha
por evento, formato `` `data` ou `data-inicio/data-fim` · **categoria** · rótulo ``,
categorias `rotina` · `marco` · `academia` · `feriado` · `atividade`. Só esse
arquivo alimenta o calendário da Bancada com eventos fora de fato/diário/tarefa,
e eles aparecem com prioridade e destaque maior na grade — ver
`Bancada/Sources/VaultKit/Agenda.swift`.

Nunca crie nota fora dessa estrutura. Se algo não couber em nenhuma pasta, pergunte antes de inventar uma nova.

---

## Convenções de escrita

**Frontmatter YAML é obrigatório** em toda nota. Chaves sem acento, minúsculas. Valores válidos de `tipo`:
`home` · `indice` · `cbl-desafio` · `atualizacao-diaria` · `roadmap` · `tarefa` · `registro` · `documento-derivado` · `design` · `agenda`

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
- Cada commit gera automaticamente uma linha em `05 - Registros/` — não registre manualmente. **O fato é escrito no `git push`, não no `git commit`**: é no push que a identidade do commit para de poder mudar. Enquanto o registro acontecia no `post-commit`, todo rebase sobre trabalho de outra pessoa reescrevia o commit e deixava a linha apontando para um hash inexistente. A linha carrega a data, a hora e o autor **do commit**, então quem commita na sexta e publica na segunda tem o trabalho lançado no dia certo — e o log fica no máximo um push atrás de si mesmo, nunca à frente do que existe.
- Nunca use `--no-verify`. O `pre-commit` é o que mantém os `.md` derivados em dia com os `.pages`.
- **O `push` exige Touch ID.** É um humano confirmando que a publicação é intencional — por isso você nunca deve usar `SKIP_BIOMETRICS=1` por conta própria, nem sugerir isso para contornar o prompt. Se o push falhar por falta do módulo, oriente a rodar `./scripts/bootstrap.sh`.

---

## O site publicado

**https://bancada-buu.pages.dev** — desde 2026-09-11, o vault também é um site.
Existe para mentores e avaliadores, que não vão instalar app nenhum.

**Todo push em `main` republica o site.** Não há passo manual: o GitHub Actions
compila, lê o vault e publica na Cloudflare Pages em cerca de dois minutos.
Quem estiver com a aba aberta vê um aviso de *"há conteúdo novo"* — o site
consulta um `versao.json` a cada 30 segundos e avisa em vez de recarregar
sozinho, para não jogar fora a posição de quem está lendo.

> ⚠️ **O site está aberto na internet.** Qualquer pessoa com a URL lê o vault
> inteiro: tarefas, narrativa diária e o log de fatos com nome e horário de
> cada um. O `noindex` pede a buscadores que não indexem, mas **não é controle
> de acesso**. Fechar é configurar o Cloudflare Access com lista de e-mails —
> passo a passo em `Bancada/docs/cloudflare.md`.

### O portão

Antes de publicar, o build roda `bancada-indice --verificar`. Se houver nota
fora da convenção ou linha de registro fora do formato dos hooks, ele sai com
código 2, **o build falha e o site anterior continua no ar**. Publicar tarde é
melhor que publicar um registro que se contradiz.

Na prática: se o seu push não apareceu no site, provavelmente o vault está
inconsistente. Rode localmente para ver o quê:

```bash
cd Bancada && ./bancada-indice --verificar ../doc-harness
```

### O que vai para o site

Vai: desafio CBL, agenda, roadmap, narrativa diária, documentos derivados,
design, tarefas, log de fatos e o acervo de mídia.

Não vai, por decisão: os índices (`00 - Índice *.md`, que são listas de
wikilinks só úteis dentro do Obsidian), os templates (andaimes cheios de
`{{marcadores}}`, que fariam o registro parecer preenchido pela metade) e o
rodapé de navegação de cada nota.

**Ao criar um `tipo` de nota novo**, acrescente-o em `SECOES`, no
`Bancada/scripts/gerar-site.js` — senão a nota não aparece no site. Isso já
aconteceu: o tipo `agenda` foi criado em 10/09 e a agenda oficial do C18 ficou
fora do site até 11/09, sem erro nenhum, simplesmente ausente. Hoje o build
avisa quando um tipo fica de fora, mas o aviso não conserta sozinho.

### Republicar à mão

Raramente necessário — só se o build falhar por motivo externo, ou para
republicar depois de mexer no gerador sem mexer no vault:

```bash
gh workflow run site.yml -R BlendOps/Bancada
gh run watch -R BlendOps/Bancada
```

O site é gerado a partir do **binário da Bancada**, nunca por um parser
próprio: `./Bancada --indice` emite o vault já parseado e agrupado, e o
gerador só renderiza. Duas implementações da mesma regra divergem com o tempo,
e um registro que conta histórias diferentes conforme quem olha perde a
serventia inteira.

---

## Proibido

Os dois primeiros itens não dependem da sua boa vontade: `scripts/guarda.sh` bloqueia pelo hook `PreToolUse`, e o `pre-commit` do git bloqueia no índice. A diferença importa: a guarda procura padrões no texto do comando e por isso erra em todo jeito de escrever que ela não previu — uma edição por heredoc de Python passou direto em 2026-09-10. O `pre-commit` olha o que está de fato no índice, e por isso vale para qualquer ferramenta. Estão aqui para você entender o porquê, não para você lembrar de obedecer.

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
