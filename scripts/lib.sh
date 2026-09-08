#!/bin/bash
# Funções comuns da automação do doc-harness.
# Uso: source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# Raiz do repositório. BASH_SOURCE só existe em bash — quando o arquivo é
# carregado de outro shell (zsh), caímos no git, que é confiável dentro do repo.
_raiz=""
[ -n "${BASH_SOURCE[0]:-}" ] && _raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)"
if [ -z "$_raiz" ] || [ ! -d "$_raiz/scripts" ]; then
  _raiz="$(git rev-parse --show-toplevel 2>/dev/null)"
fi
REPO_ROOT="$_raiz"
unset _raiz

PASTA_REGISTROS="05 - Registros"
PAGES_BUNDLE_ID="com.apple.Pages"

autor() { git -C "$REPO_ROOT" config user.name 2>/dev/null || echo "desconhecido"; }
hoje()  { date +%Y-%m-%d; }
agora() { date +%H:%M; }

# Caminho do log de fatos de uma data (padrão: hoje).
caminho_log() {
  local d="${1:-$(hoje)}"
  printf '%s/%s/%s/%s/%s.md' "$REPO_ROOT" "$PASTA_REGISTROS" "${d:0:4}" "${d:5:2}" "$d"
}

# Caminho da nota diária (narrativa) de uma data.
caminho_diario() {
  local d="${1:-$(hoje)}"
  printf '%s/02 - Atualizações Diárias/%s/%s/%s.md' "$REPO_ROOT" "${d:0:4}" "${d:5:2}" "$d"
}

# Cria o log do dia se não existir e devolve o caminho.
garantir_log() {
  local d="${1:-$(hoje)}" arq
  arq="$(caminho_log "$d")"
  if [ ! -f "$arq" ]; then
    mkdir -p "$(dirname "$arq")"
    cat > "$arq" <<EOF
---
tipo: registro
data: $d
tags: [registro]
---

# Registros — $d

> Log de fatos, escrito automaticamente pelos hooks. Não editar à mão.
> A narrativa deste dia fica em [[02 - Atualizações Diárias/${d:0:4}/${d:5:2}/$d|$d]].

EOF
  fi
  printf '%s' "$arq"
}

# Acrescenta uma linha de fato ao log do dia.
# Uso: registrar <tipo> <descrição…>
registrar() {
  local tipo="$1"; shift
  local arq; arq="$(garantir_log)"
  printf -- '- `%s` · **%s** · `%s` · %s\n' "$(agora)" "$(autor)" "$tipo" "$*" >> "$arq"
}

# O Pages pode estar renomeado no disco — resolver sempre pelo bundle ID.
caminho_pages_app() {
  osascript -e "POSIX path of (path to application id \"$PAGES_BUNDLE_ID\")" 2>/dev/null
}
tem_pages() { [ -n "$(caminho_pages_app)" ]; }
