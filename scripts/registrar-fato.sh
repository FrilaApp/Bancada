#!/bin/bash
# Única porta de escrita no log de fatos (05 - Registros/).
#
# Uso:
#   registrar-fato.sh commit                 registra o HEAD atual
#   registrar-fato.sh <tipo> <descrição…>    registra um fato arbitrário
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

case "${1:-}" in
  commit)
    sha=$(git -C "$REPO_ROOT" rev-parse --short HEAD)
    assunto=$(git -C "$REPO_ROOT" log -1 --pretty=%s)
    n=$(git -C "$REPO_ROOT" show --pretty="" --name-only HEAD | grep -c . || true)
    registrar commit "\`$sha\` — $assunto · $n arquivo(s)"
    ;;
  "")
    echo "uso: registrar-fato.sh <tipo> <descrição…>" >&2
    exit 2
    ;;
  *)
    tipo="$1"; shift
    registrar "$tipo" "$*"
    ;;
esac
