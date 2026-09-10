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
  registrar_em "$(hoje)" "$(agora)" "$(autor)" "$tipo" "$*"
}

# Acrescenta um fato ao log de uma data específica, com hora e autor dados.
#
# Existe porque o fato sobre um commit pertence ao dia em que o commit foi
# feito, não ao dia em que ele foi publicado. Enquanto o registro acontecia no
# `post-commit` os dois coincidiam sempre; com o registro no `pre-push` podem
# não coincidir — quem commita na sexta e publica na segunda tem o trabalho
# lançado no dia certo.
#
# Uso: registrar_em <AAAA-MM-DD> <HH:MM> <autor> <tipo> <descrição…>
registrar_em() {
  local data="$1" hora="$2" quem="$3" tipo="$4"; shift 4
  local arq; arq="$(garantir_log "$data")"
  printf -- '- `%s` · **%s** · `%s` · %s\n' "$hora" "$quem" "$tipo" "$*" >> "$arq"
}

# Um fato sobre este commit já foi registrado em algum dia?
#
# A busca é no acervo inteiro, não só no log de hoje: um commit antigo publicado
# hoje foi lançado no dia dele, e registrá-lo de novo criaria fato duplicado.
fato_ja_registrado() {
  local sha="$1"
  grep -rqF -- "\`$sha\`" "$REPO_ROOT/$PASTA_REGISTROS" 2>/dev/null
}

# O Pages pode estar renomeado no disco — resolver sempre pelo bundle ID.
caminho_pages_app() {
  osascript -e "POSIX path of (path to application id \"$PAGES_BUNDLE_ID\")" 2>/dev/null
}
tem_pages() { [ -n "$(caminho_pages_app)" ]; }
