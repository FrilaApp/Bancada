#!/bin/bash
# Integração dos hooks com clone comum e worktree, sem remoto externo ou Touch ID.
# Uso: bash doc-harness/scripts/testes/git-hooks.sh [pasta dos scripts a testar]
set -euo pipefail
scripts="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
scripts="$(cd "$scripts" && pwd -P)"
temporario="$(mktemp -d "${TMPDIR:-/tmp}/bancada-hooks.XXXXXX")"
trap 'rm -rf "$temporario"' EXIT
unset SKIP_BIOMETRICS DOC_HARNESS_SEM_REGISTRO PERMITIR_REPARO_DE_FATO
falhas=0
verificar() {
  if "$@"; then return 0; fi
  echo "FALHOU ($caso): $*" >&2
  falhas=$((falhas + 1))
}
contar_fato() {
  local quantidade
  quantidade=$(grep -rhF -- "\`$1\`" 'doc-harness/05 - Registros' | wc -l | tr -d ' ')
  [ "$quantidade" = "$2" ]
}
sem_registros_na_raiz() {
  [ ! -e '05 - Registros' ] && [ -z "$(git ls-tree --name-only HEAD -- '05 - Registros')" ]
}

for caso in clone worktree; do
  mkdir -p "$temporario/$caso/semente/doc-harness/scripts"
  cp "$scripts/lib.sh" "$scripts/registrar-fato.sh" "$temporario/$caso/semente/doc-harness/scripts/"
  cp -R "$scripts/git-hooks" "$temporario/$caso/semente/doc-harness/scripts/"
  cd "$temporario/$caso/semente"
  # Substituto local: não desliga o hook nem o registro; evita prompt e compilação.
  printf '#!/bin/bash\nexit 0\n' > doc-harness/scripts/auth-touchid
  chmod +x doc-harness/scripts/auth-touchid
  git init -q -b main
  git config user.name 'Teste dos hooks'
  git config user.email 'hooks@example.invalid'
  git -c core.hooksPath=/dev/null add .
  git -c core.hooksPath=/dev/null commit -qm 'test: cria fato antigo'
  antigo=$(git rev-parse --short HEAD)
  bash doc-harness/scripts/registrar-fato.sh commit
  git add .
  git -c core.hooksPath=/dev/null commit -qm 'Registra no log os fatos publicados'
  printf 'já publicado\n' > antigo-sem-registro.txt
  git add antigo-sem-registro.txt
  git -c core.hooksPath=/dev/null commit -qm 'test: cria histórico remoto sem registro'
  remoto_antigo=$(git rev-parse --short HEAD)
  git clone -q --bare . ../remoto.git
  git clone -q ../remoto.git ../clone
  cd ../clone
  git config user.name 'Teste dos hooks'
  git config user.email 'hooks@example.invalid'
  git config core.hooksPath doc-harness/scripts/git-hooks
  if [ "$caso" = worktree ]; then
    git worktree add -q -b novo ../worktree
    cd ../worktree
  else
    git switch -qc novo
  fi
  # Verifica também a fronteira do pre-commit com GIT_DIR herdado pelo worktree.
  log=$(find 'doc-harness/05 - Registros' -name '*.md' -type f | head -1)
  cp "$log" "$temporario/$caso/log-original"
  printf '\nTentativa manual de teste\n' >> "$log"
  git add -- "$log"
  if git commit -qm 'test: tenta editar fato' > "$temporario/$caso/pre-commit.log" 2>&1; then
    echo "FALHOU ($caso): pre-commit aceitou edição manual" >&2
    falhas=$((falhas + 1))
  else
    verificar grep -q 'altera o log de fatos à mão' "$temporario/$caso/pre-commit.log"
  fi
  # Restaura apenas o fixture de teste, inclusive se a base aceitou a edição.
  cp "$temporario/$caso/log-original" "$log"
  git add -- "$log"
  printf 'novo\n' > novo.txt
  git add novo.txt
  git commit -qm 'test: publica fato novo'
  novo=$(git rev-parse --short HEAD)
  git push -q origin HEAD:novo
  verificar sem_registros_na_raiz
  verificar contar_fato "$antigo" 1
  verificar contar_fato "$novo" 1
  verificar contar_fato "$remoto_antigo" 0
  verificar test -z "$(git status --porcelain)"
  git push -q origin HEAD:novo
  verificar sem_registros_na_raiz
  verificar contar_fato "$antigo" 1
  verificar contar_fato "$novo" 1
  verificar contar_fato "$remoto_antigo" 0
  verificar test -z "$(git status --porcelain)"
  # Atualização de ramo existente também precisa registrar só a novidade.
  printf 'outro\n' >> novo.txt
  git add novo.txt
  git commit -qm 'test: atualiza ramo publicado'
  outro=$(git rev-parse --short HEAD)
  git push -q origin HEAD:novo
  verificar sem_registros_na_raiz
  verificar contar_fato "$antigo" 1
  verificar contar_fato "$novo" 1
  verificar contar_fato "$outro" 1
  verificar contar_fato "$remoto_antigo" 0
  verificar test -z "$(git status --porcelain)"
  echo "Caso $caso verificado."
done
[ "$falhas" -eq 0 ] || { echo "$falhas verificações falharam." >&2; exit 1; }
echo 'Hooks aprovados em clone comum e worktree.'
