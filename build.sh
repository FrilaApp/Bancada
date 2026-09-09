#!/bin/bash
# Compila a Bancada e deixa o executável na raiz do projeto.
#
# Diferente do ActionShelf (que usa swiftc direto), aqui passamos pelo SwiftPM
# porque o projeto tem dois alvos — VaultKit e o app — mais os testes.
set -euo pipefail
cd "$(dirname "$0")"

echo "▸ Rodando os testes do VaultKit..."
swift test

echo "▸ Compilando a Bancada (release)..."
swift build -c release

cp .build/release/Bancada ./Bancada
chmod +x ./Bancada
codesign -s - -f ./Bancada >/dev/null 2>&1 || true
echo "✓ Bancada compilada. Rode com ./Bancada"

# O site é gerado a partir do binário recém-compilado, então ele entra aqui e
# não num script separado: assim as duas superfícies nunca ficam uma versão
# atrás da outra.
if [ "${1:-}" = "--com-site" ]; then
  echo "▸ Gerando o site de leitura..."
  node scripts/gerar-site.js "${2:-../doc-harness}"
fi
