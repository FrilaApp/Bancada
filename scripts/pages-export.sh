#!/bin/bash
# Converte documentos .pages em Markdown versionável, gravado ao lado do original.
# O .pages continua sendo a fonte de verdade editável; o .md existe para que o
# Git mostre o que mudou no texto, e não apenas que o arquivo mudou.
#
# Uso:
#   pages-export.sh                     converte todos os .pages do repositório
#   pages-export.sh <arquivo.pages> …   converte apenas os indicados
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

CACHE="$REPO_ROOT/scripts/.cache"
mkdir -p "$CACHE"

# Converte um arquivo. Devolve 0 se gravou, 1 se pulou (já em dia).
converter() {
  local src="$1"
  local dest="${src%.pages}.md"
  local nome; nome="$(basename "${src%.pages}")"
  local rel; rel="${src#"$REPO_ROOT"/}"
  local hash; hash="$(shasum -a 256 "$src" | cut -d' ' -f1)"

  if [ -f "$dest" ] && grep -q "^hash_origem: $hash\$" "$dest" 2>/dev/null; then
    return 1
  fi

  local corpo aviso=""
  if tem_pages; then
    local docx="$CACHE/$$.docx" htm="$CACHE/$$.html"
    rm -f "$docx" "$htm"
    osascript >/dev/null 2>&1 <<APPLESCRIPT
tell application id "$PAGES_BUNDLE_ID"
    set d to open POSIX file "$src"
    export d to POSIX file "$docx" as Microsoft Word
    close d saving no
end tell
APPLESCRIPT
    if [ -s "$docx" ]; then
      textutil -convert html -output "$htm" "$docx" 2>/dev/null
      corpo="$(node "$REPO_ROOT/scripts/html-para-md.js" "$htm")"
    fi
    rm -f "$docx" "$htm"
  fi

  if [ -z "${corpo:-}" ]; then
    # Sem Pages nesta máquina (ou exportação falhou): guarda o preview embutido
    # no .pages para não bloquear ninguém. Quem tiver o Pages regenera depois.
    local prev="${src%.pages} (prévia).jpg"
    unzip -p "$src" preview.jpg > "$prev" 2>/dev/null || rm -f "$prev"
    aviso="pendente"
    corpo="> [!warning] Conversão pendente
> Este documento não pôde ser convertido nesta máquina — o Pages não está instalado
> ou a exportação falhou. Abaixo fica apenas a prévia embutida no arquivo original.
> Quem tiver o Pages regenera este \`.md\` no próximo commit.

![[$(basename "$prev")]]"
  fi

  cat > "$dest" <<EOF
---
tipo: documento-derivado
origem: "$rel"
hash_origem: $hash
exportado_em: $(date +%Y-%m-%dT%H:%M)
exportado_por: $(autor)
conversao: ${aviso:-ok}
tags: [documento]
---

# $nome

> [!info] Gerado automaticamente
> Este arquivo é derivado de \`$(basename "$src")\` e é **sobrescrito** a cada conversão.
> Para mudar o conteúdo, edite o \`.pages\` original.

$corpo
EOF

  local palavras; palavras="$(wc -w < "$dest" | tr -d ' ')"
  registrar pages "$(basename "$src") → $(basename "$dest") · ${palavras} palavras${aviso:+ · $aviso}"
  return 0
}

alvos=()
if [ $# -gt 0 ]; then
  alvos=("$@")
else
  while IFS= read -r -d '' f; do alvos+=("$f"); done \
    < <(find "$REPO_ROOT" -name '*.pages' -not -path '*/.git/*' -print0)
fi

[ ${#alvos[@]} -eq 0 ] && { echo "Nenhum .pages encontrado."; exit 0; }

convertidos=0
for f in "${alvos[@]}"; do
  [ -f "$f" ] || { echo "  ✗ não encontrado: $f" >&2; continue; }
  if converter "$(cd "$(dirname "$f")" && pwd)/$(basename "$f")"; then
    echo "  ✓ $(basename "$f")"
    convertidos=$((convertidos + 1))
  else
    echo "  · $(basename "$f") já em dia"
  fi
done
echo "$convertidos documento(s) convertido(s)."
