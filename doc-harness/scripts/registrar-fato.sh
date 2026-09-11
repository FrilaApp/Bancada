#!/bin/bash
# Única porta de escrita no log de fatos (05 - Registros/).
#
# Uso:
#   registrar-fato.sh commit                 registra o HEAD atual
#   registrar-fato.sh commit <sha>           registra um commit específico
#   registrar-fato.sh publicados <intervalo> registra os commits de um intervalo
#   registrar-fato.sh <tipo> <descrição…>    registra um fato arbitrário
set -euo pipefail
# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

# Um commit vira uma linha de fato — com a data e a hora dele, e o autor dele.
#
# O autor sai do commit e não da máquina que registra: quem publica o trabalho
# de outra pessoa (depois de um merge, por exemplo) não rouba a autoria do fato.
# O commit que publica o próprio log é escrituração, não trabalho — e um fato
# sobre ele não diz nada que o fato ao lado já não diga. Ficava de fora por
# acidente da aritmética de intervalo (`remoto..local` exclui o remoto); aqui
# fica de fora por decisão, que é o que sobrevive a um merge pondo esse commit
# no meio do intervalo.
ASSUNTO_DO_LOG="Registra no log os fatos publicados"

registrar_commit() {
  local ref="$1" sha assunto n data hora quem
  sha=$(git -C "$REPO_ROOT" rev-parse --short "$ref")

  if fato_ja_registrado "$sha"; then
    return 0
  fi

  assunto=$(git -C "$REPO_ROOT" log -1 --pretty=%s "$ref")
  [ "$assunto" = "$ASSUNTO_DO_LOG" ] && return 0
  n=$(git -C "$REPO_ROOT" show --pretty="" --name-only "$ref" | grep -c . || true)
  data=$(git -C "$REPO_ROOT" log -1 --date=format:%Y-%m-%d --pretty=%ad "$ref")
  hora=$(git -C "$REPO_ROOT" log -1 --date=format:%H:%M --pretty=%ad "$ref")
  quem=$(git -C "$REPO_ROOT" log -1 --pretty=%an "$ref")

  local arquivos
  if [ "$n" -eq 1 ]; then arquivos="1 arquivo"; else arquivos="$n arquivos"; fi

  registrar_em "$data" "$hora" "$quem" commit "\`$sha\` — $assunto · $arquivos"
}

case "${1:-}" in
  commit)
    registrar_commit "${2:-HEAD}"
    ;;

  publicados)
    # Registra cada commit de um intervalo, do mais antigo para o mais novo,
    # para que o log saia em ordem cronológica.
    #
    # Chamado pelo `pre-push`, e só por ele: é lá que a identidade do commit
    # deixa de poder mudar. Registrar no `post-commit` gravava um hash que um
    # rebase posterior podia reescrever — e reescrevia, deixando o log apontando
    # para um commit que não existe em ramo nenhum.
    intervalo="${2:?uso: registrar-fato.sh publicados <intervalo>}"
    while IFS= read -r sha; do
      [ -n "$sha" ] || continue
      registrar_commit "$sha"
    done < <(git -C "$REPO_ROOT" rev-list --reverse "$intervalo")
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
