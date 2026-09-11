#!/bin/bash
# Ganchos de sessão do Claude Code.
#   sessao.sh inicio → garante as estruturas do dia e imprime o contexto da equipe
#   sessao.sh fim    → registra o fato de encerramento no log
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

case "${1:-}" in
  inicio)
    garantir_log >/dev/null

    echo "## Estado do doc-harness em $(hoje)"
    echo

    desafio="$(grep -rl '^status: ativo$' "$REPO_ROOT/01 - CBL/Desafios" --include='*.md' 2>/dev/null | head -1 || true)"
    if [ -n "$desafio" ]; then
      echo "Desafio ativo: $(basename "${desafio%.md}")"
    else
      echo "Nenhum desafio CBL ativo em 01 - CBL/Desafios/."
    fi

    andamento="$(grep -rl '^status: \(em-andamento\|revisao\)$' "$REPO_ROOT/04 - Tarefas" --include='T-*.md' 2>/dev/null || true)"
    if [ -n "$andamento" ]; then
      echo
      echo "Tarefas abertas:"
      printf '%s\n' "$andamento" | while IFS= read -r t; do
        [ -n "$t" ] || continue
        st="$(sed -n 's/^status: //p' "$t" | head -1)"
        resp="$(sed -n 's/^responsavel: //p' "$t" | head -1)"
        echo "- $(basename "${t%.md}") · $st · ${resp:-sem responsável}"
      done
    fi

    log="$(caminho_log)"
    fatos="$(grep -c '^- `' "$log" 2>/dev/null || echo 0)"
    echo
    echo "Fatos registrados hoje: $fatos"
    if [ "$fatos" -gt 0 ]; then
      echo '```'
      grep '^- `' "$log" | tail -5
      echo '```'
    fi
    echo
    echo "Lembrete: 05 - Registros/ é somente leitura. A narrativa se escreve com /diario."
    ;;

  fim)
    n="$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | grep -c '\.md"\?$' || true)"
    registrar sessao "Claude · ${n} nota(s) com alteração pendente"
    ;;

  *)
    echo "uso: sessao.sh {inicio|fim}" >&2
    exit 2
    ;;
esac
