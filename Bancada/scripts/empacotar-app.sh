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

# Os dois padrões são o build local; o workflow de Release sobrescreve para
# empacotar o binário universal e carimbar a versão da tag no Info.plist.
BINARIO="${BANCADA_BINARIO:-./Bancada}"
APP="./Bancada.app"
VERSAO="${BANCADA_VERSAO:-}"

if [ ! -x "$BINARIO" ]; then
  echo "✗ $BINARIO não existe. Rode ./build.sh primeiro." >&2
  exit 1
fi

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cp "$BINARIO" "$APP/Contents/MacOS/Bancada"
cp scripts/Info.plist "$APP/Contents/Info.plist"

# Sem versão explícita, o build local se identifica pela tag mais próxima:
# `0.4.0` exatamente na tag, `0.4.0-2-g1a2b3c4` dois commits depois, com
# `-dirty` se houver mudança não commitada. É o que deixa o atualizador
# comparar: enquanto todo build local saía como 1.0, ele parecia mais novo que
# qualquer release 0.x e a máquina nunca mais recebia atualização. Sem tag à
# vista, vale o 0.0.0 do Info.plist, que o atualizador lê como "sem versão".
if [ -z "$VERSAO" ]; then
  VERSAO=$(git describe --tags --match 'v[0-9]*' --dirty 2>/dev/null || true)
  VERSAO="${VERSAO#v}"
fi

if [ -n "$VERSAO" ]; then
  # CFBundleVersion só aceita dígitos e pontos — um "1.0.0-rc1" faz o macOS
  # tratar o bundle como malformado. A versão legível fica na outra chave.
  BUILD=$(printf '%s' "${VERSAO%%-*}" | tr -cd '0-9.')
  /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSAO" "$APP/Contents/Info.plist"
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BUILD:-1}" "$APP/Contents/Info.plist"
fi
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
