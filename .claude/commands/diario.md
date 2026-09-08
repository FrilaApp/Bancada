---
description: Escreve a narrativa do dia na nota diária a partir dos fatos registrados
---

Escreva a **narrativa de hoje** na nota diária, a partir dos fatos já registrados.

## Passos

1. Leia o log de fatos de hoje em `05 - Registros/AAAA/MM/AAAA-MM-DD.md`.
2. Leia também `git log --since=midnight --oneline` e `git status --short`, para pegar o que aconteceu antes dos hooks estarem ativos ou fora deles.
3. Abra a nota diária correspondente em `02 - Atualizações Diárias/AAAA/MM/AAAA-MM-DD.md`. Se não existir, crie a partir de `02 - Atualizações Diárias/Template - Atualização Diária.md`.
4. Preencha as seções fixas — `## O que foi feito`, `## Decisões`, `## Bloqueios`, `## Aprendizados`, `## Próximos passos`. Não renomeie, não crie seções novas.
5. Adicione a nota ao `00 - Índice Diário.md` se ainda não estiver lá.

## Regras inegociáveis

- **Cada bullet precisa vir de um fato.** Se não há fato que sustente a frase, a frase não entra. Não preencha lacuna com suposição plausível.
- Se o log estiver vazio, diga isso e pare. Um dia sem registro é um dado.
- Não edite nada dentro de `05 - Registros/`. Você só lê de lá.
- Preserve o que já estava escrito na nota — some ao conteúdo, não substitua.
- Nas seções `## Decisões`, `## Bloqueios` e `## Aprendizados`, pergunte antes de inventar: essas são interpretações humanas, não derivam mecanicamente de commits. Se houver sinal claro na conversa desta sessão, use; senão, pergunte ou deixe vazio.
- Português, um bullet por ideia, direto. Assine mudanças de outra pessoa com o nome que aparece no fato.
