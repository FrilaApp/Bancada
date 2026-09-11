---
description: Valida e publica uma nova Release da Bancada via CI com Zona de Segurança
---

Comando para lançar uma nova versão da Bancada para a equipe.

## Passos

1. Confirme com o usuário se as alterações a serem publicadas foram finalizadas e testadas.
2. Verifique se o repositório da Bancada está limpo e se está na branch `main`.
3. Execute o script com a Zona de Segurança e Quarentena:
   ```bash
   ./scripts/publicar-bancada.sh
   ```
   (ou informe a versão desejada, ex.: `./scripts/publicar-bancada.sh 0.2.0`).
4. Se o script retornar sucesso, informe que a Release foi disparada e que o GitHub Actions está gerando o binário universal.
5. Se a **Quarentena** for acionada (código de saída 1), repasse fielmente o relatório de fallback com as instruções emitidas pelo script. Nunca contorne as travas da quarentena.
