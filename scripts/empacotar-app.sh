#!/bin/bash
# Empacota o executável já compilado (./Bancada) num bundle Bancada.app.
#
# É o que falta para o app aparecer na Dock com ícone, poder ser aberto pelo
# Finder/Spotlight e ficar fixado — um executável solto do SwiftPM não tem
# nada disso. Não criamos um .xcodeproj para chegar lá: a estrutura de um
# bundle é só pastas + um Info.plist, e isso dá para montar num script sem
# nenhum arquivo de projeto do Xcode para 5 pessoas conflitarem.
set -euo pipefail
cd "$(dirname "$0")/.."

BINARIO="./Bancada"
APP="./Bancada.app"

if [ ! -x "$BINARIO" ]; then
  echo "✗ $BINARIO não existe. Rode ./build.sh primeiro." >&2
  exit 1
fi

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cp "$BINARIO" "$APP/Contents/MacOS/Bancada"
cp scripts/Info.plist "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

if [ -f scripts/AppIcon.icns ]; then
  cp scripts/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
else
  echo "⚠ scripts/AppIcon.icns não encontrado — rode python3 scripts/gerar-icone.py. Empacotando sem ícone." >&2
fi

# Assinatura ad-hoc: sem ela o Gatekeeper barra o app na primeira abertura.
# Mesmo esquema já usado no binário solto pelo build.sh.
codesign -s - -f "$APP" >/dev/null 2>&1 || true

echo "✓ Bancada.app pronto. Abra com 'open ./Bancada.app' ou arraste para a Dock."
