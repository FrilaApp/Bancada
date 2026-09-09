#!/bin/bash
# Consulta e atualiza o Bancada.app local para a versão mais recente da Release.
#
# Executado automaticamente pelo comando /entrar no Claude Code ou manualmente.
# Protege contra corrupção com swap atômico e restauração de backup em caso de falha.
# Remove a quarentena do Gatekeeper para abrir sem atrito.
#
# Uso:
#   ./scripts/atualizar-bancada.sh
#   ./scripts/atualizar-bancada.sh /Applications/Bancada.app
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
raiz="$(cd "$script_dir/.." && pwd)"

# 1. Determina o destino do Bancada.app
if [ -n "${1:-}" ]; then
  destino="$1"
elif [ -d "/Applications/Bancada.app" ]; then
  destino="/Applications/Bancada.app"
else
  destino="$raiz/Bancada.app"
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ℹ️  GitHub CLI ('gh') não encontrado. Pulei a verificação de atualização da Bancada."
  exit 0
fi

# 2. Descobre a versão da última release no GitHub
tag_remota=$(gh release view -R BlendOps/Bancada --json tagName --jq .tagName 2>/dev/null || true)
if [ -z "$tag_remota" ]; then
  # Se não estiver logado ou não houver release, não quebra a rotina do usuário
  exit 0
fi
versao_remota="${tag_remota#v}"

# Se o destino for o app dentro do repositório, protege o trabalho de quem está desenvolvendo
if [ "$destino" = "$raiz/Bancada.app" ] && [ -d "$raiz/.git" ]; then
  branch_atual=$(git -C "$raiz" symbolic-ref --short HEAD 2>/dev/null || echo "")
  if [ "$branch_atual" != "main" ]; then
    echo "ℹ️  Bancada está na branch de desenvolvimento '$branch_atual'. Mantendo o build local."
    exit 0
  fi
fi

# 3. Lê a versão instalada localmente
versao_local=""
if [ -d "$destino/Contents" ]; then
  versao_local=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$destino/Contents/Info.plist" 2>/dev/null || echo "0.0.0")
fi

# Comparação semântica: só atualiza se a versão remota for estritamente superior à local
if [ -n "$versao_local" ] && [ "$versao_local" != "0.0.0" ]; then
  maior=$(printf '%s\n%s\n' "$versao_local" "$versao_remota" | sort -V | tail -n 1)
  if [ "$maior" = "$versao_local" ]; then
    echo "✓ Bancada.app está em dia (v$versao_local)."
    exit 0
  fi
fi

echo "▸ Atualização da Bancada encontrada: $tag_remota (versão atual: ${versao_local:-nenhuma})"
echo "▸ Baixando e instalando em $destino..."

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

if ! gh release download "$tag_remota" -R BlendOps/Bancada --pattern '*.zip' --dir "$tmp" >/dev/null 2>&1; then
  echo "⚠️  Não foi possível baixar a release $tag_remota (verifique sua conexão ou login do gh)." >&2
  exit 0
fi

zip_file=$(ls "$tmp"/*.zip 2>/dev/null | head -n 1)
if [ -z "$zip_file" ]; then
  echo "⚠️  Nenhum arquivo zip encontrado na release $tag_remota." >&2
  exit 0
fi

# Descompacta preservando permissões e symlinks
mkdir -p "$tmp/extraido"
ditto -x -k "$zip_file" "$tmp/extraido"

novo_app="$tmp/extraido/Bancada.app"
if [ ! -d "$novo_app/Contents/MacOS" ]; then
  echo "❌ Erro de integridade: o arquivo baixado não contém um Bancada.app válido." >&2
  exit 1
fi

# Remove atributo de quarentena do Gatekeeper (evita bloqueio do macOS 15)
xattr -cr "$novo_app" 2>/dev/null || true

# 4. Troca atômica com rollback
if [ -d "$destino" ]; then
  mv "$destino" "$destino.backup"
fi

mkdir -p "$(dirname "$destino")"
if mv "$novo_app" "$destino"; then
  rm -rf "$destino.backup"
  echo "🎉 Bancada.app atualizado com sucesso para $tag_remota!"
else
  if [ -d "$destino.backup" ]; then
    mv "$destino.backup" "$destino"
    echo "⚠️  Falha ao mover a nova versão. Versão anterior restaurada." >&2
  fi
  exit 1
fi
