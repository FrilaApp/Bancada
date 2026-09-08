---
description: Promove o que foi significativo do dia para o Roadmap e para o desafio CBL ativo
---

Promova o que aconteceu recentemente para as camadas superiores do registro.

## Passos

1. Leia a nota diária de hoje em `02 - Atualizações Diárias/AAAA/MM/AAAA-MM-DD.md`. Se ela ainda não foi escrita, rode `/diario` primeiro e avise.
2. Decida o que é **significativo**: mudou o rumo, fechou uma frente, revelou algo que muda decisões futuras. Ajuste fino de texto e commit de manutenção não sobem.
3. Em `03 - Roadmap/Roadmap - Sumário de Iterações.md`, adicione uma entrada sob o heading `## AAAA-MM-DD` (crie o heading se não existir). **Mais recente sempre no topo.** Cada entrada resume a mudança em uma ou duas frases e linka de volta: `Ver [[02 - Atualizações Diárias/AAAA/MM/AAAA-MM-DD|nota do dia]].`
4. Se houver um desafio ativo em `01 - CBL/Desafios/` (frontmatter `status: ativo`), alimente as seções `## Implementação` e — quando fizer sentido — `## Avaliação e Reflexão`, linkando a nota diária.

## Regras

- Não duplique: se a entrada do dia já existe no Roadmap, complemente em vez de criar outra.
- Seções do desafio CBL são fixas pelo framework. Não invente seção nova.
- Se nada do dia for significativo, diga isso e não escreva nada. Roadmap inflado perde utilidade.
