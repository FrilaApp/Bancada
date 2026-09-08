---
description: Converte os documentos .pages alterados em Markdown versionável
---

Rode `./scripts/pages-export.sh` e relate o resultado.

- Sem argumento, ele varre todos os `.pages` do repositório e pula os que já estão em dia (compara o hash do original com o `hash_origem` do `.md`).
- Para um documento específico, passe o caminho.

Depois de rodar:

1. Mostre quais documentos foram convertidos.
2. Se algum saiu com `conversao: pendente` no frontmatter, avise que o Pages não está instalado nesta máquina — o `.md` tem só a prévia embutida, e outra pessoa da equipe precisa regenerar.
3. Se um `.md` derivado mudou, vale olhar o `git diff` dele: é ali que dá para ver o que mudou no texto do documento.

Nunca edite um `.md` com `tipo: documento-derivado` — ele é sobrescrito na próxima conversão.
