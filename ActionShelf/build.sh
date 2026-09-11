#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .cache
echo "▸ Compilando ActionShelf (macOS arm64)..."
swiftc -O -module-cache-path .cache Sources/ActionShelf/*.swift -o ActionShelf
chmod +x ActionShelf
echo "✓ ActionShelf compilado com sucesso."
