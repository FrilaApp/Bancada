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
echo "✓ Bancada compilada. Rode com ./Bancada"
