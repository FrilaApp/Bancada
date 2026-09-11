#!/bin/bash
# Publica uma nova release da Bancada com Zona de Segurança.
#
# Protege contra:
# 1. Testes locais falhando (não distribui app quebrado)
# 2. Conflito/divergência com origin/main (quarentena se outro dev já publicou)
# 3. Concorrência no CI (não dispara se já houver release rodando no Actions)
# 4. Publicação não autorizada (gate biométrico via ActionShelf / Touch ID)
#
# Uso:
#   ./scripts/publicar-bancada.sh           # calcula a próxima versão automaticamente
#   ./scripts/publicar-bancada.sh 0.2.0     # especifica a versão desejada
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
raiz="$(cd "$script_dir/.." && pwd)"
cd "$raiz"

# ---------------------------------------------------------------------------
# Funções de Notificação e Fallback
# ---------------------------------------------------------------------------
quarentena_fallback() {
  local motivo="$1"
  local instrucao="$2"

  cat <<MSG

⚠️  ======================= ZONA DE SEGURANÇA =======================
    QUARENTENA ATIVADA: Publicação Retida
    -----------------------------------------------------------------
MSG
  printf "    Motivo: %b\n\n" "$motivo"
  cat <<MSG
    AÇÃO DE FALLBACK EXECUTADA:
    ✓ Nenhuma tag foi enviada ao repositório remoto.
    ✓ Nenhum runner do CI foi consumido.
    ✓ Seu ambiente de trabalho local está preservado.

    COMO RESOLVER:
MSG
  printf "%b\n" "$instrucao"
  cat <<MSG
====================================================================
MSG
  exit 1
}

# ---------------------------------------------------------------------------
# 1. Pré-voo: Testes locais (não publicar app com defeito)
# ---------------------------------------------------------------------------
echo "▸ [1/5] Validando integridade do código local (swift test)..."

# Os testes rodam sobre o que está no disco, mas a tag vai no HEAD. Com mudança
# solta na pasta — inclusive arquivo novo, que o SwiftPM compila sem perguntar —
# o script validaria um código e publicaria outro.
pendentes=$(git -c core.quotepath=off status --porcelain)
if [ -n "$pendentes" ]; then
  quarentena_fallback \
    "Há alterações não commitadas na pasta de trabalho. Os testes validariam um código diferente do que a tag vai publicar:\n\n$(printf '%s\n' "$pendentes" | sed 's/^/      · /')" \
    "    1. Faça commit das alterações, ou guarde-as com 'git stash -u'.\n    2. Execute './scripts/publicar-bancada.sh' com a pasta limpa."
fi

if ! swift test >/dev/null 2>&1; then
  quarentena_fallback \
    "A suíte de testes locais (VaultKit / DesignSystem) falhou." \
    "    1. Rode 'swift test' no terminal para inspecionar os erros.\n    2. Corrija as falhas antes de tentar publicar novamente."
fi
echo "  ✓ Testes passaram com sucesso."

# ---------------------------------------------------------------------------
# 2. Pré-voo: Sincronia com origin/main (anti-colisão Git)
# ---------------------------------------------------------------------------
echo "▸ [2/5] Verificando sincronia com o repositório remoto..."
git fetch origin main --quiet 2>/dev/null || true

branch_atual=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
if [ "$branch_atual" != "main" ]; then
  quarentena_fallback \
    "Você está na branch '$branch_atual'. Releases da Bancada só devem ser publicadas a partir da branch 'main'." \
    "    1. Faça commit ou merge de suas alterações na 'main':\n       git checkout main && git merge $branch_atual\n    2. Execute './scripts/publicar-bancada.sh' a partir da 'main'."
fi

# Checa se origin/main está à frente da branch atual
atrasados=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
if [ "$atrasados" -gt 0 ]; then
  commits_divergentes=$(git log -n "$atrasados" --format="      · %h — %s (%an)" origin/main)
  quarentena_fallback \
    "O repositório remoto avançou $atrasados commit(s) à frente da sua branch.\n    Outro desenvolvedor já publicou alterações na origin/main:\n\n$commits_divergentes" \
    "    1. Puxe as atualizações mais recentes:\n       git pull --rebase origin main\n    2. Revalide seu build com './build.sh'\n    3. Tente publicar novamente."
fi
echo "  ✓ Nenhuma divergência com a origin/main."

# ---------------------------------------------------------------------------
# 3. Pré-voo: Concorrência no CI (evitar dois releases simultâneos)
# ---------------------------------------------------------------------------
echo "▸ [3/5] Verificando se há builds de release em andamento no CI..."
if command -v gh >/dev/null 2>&1; then
  em_andamento=$(gh run list --repo BlendOps/Bancada --workflow=release.yml --status=in_progress --json databaseId --jq 'length' 2>/dev/null || echo "0")
  if [ "$em_andamento" -gt 0 ]; then
    quarentena_fallback \
      "Já existe uma compilação de release em andamento no GitHub Actions." \
      "    1. Aguarde a conclusão do build em execução para evitar sobreposição:\n       gh run list --repo BlendOps/Bancada --workflow=release.yml\n    2. Tente publicar assim que o status estiver concluído."
  fi
fi
echo "  ✓ CI livre para compilar."

# ---------------------------------------------------------------------------
# 4. Cálculo da Versão
# ---------------------------------------------------------------------------
echo "▸ [4/5] Definindo versão da release..."
if [ -n "${1:-}" ]; then
  versao="${1#v}"
else
  # Descobre a maior tag semântica atual
  ultima_tag=$(git tag -l "v*" | sort -V | tail -n 1)
  if [ -z "$ultima_tag" ]; then
    versao="0.1.0"
  else
    versao_limpa="${ultima_tag#v}"
    maior=$(echo "$versao_limpa" | cut -d. -f1)
    menor=$(echo "$versao_limpa" | cut -d. -f2)
    correcao=$(echo "$versao_limpa" | cut -d. -f3)

    # Incremento menor automático (ex: 0.1.0 -> 0.2.0)
    menor=$((menor + 1))
    correcao=0
    versao="${maior}.${menor}.${correcao}"
  fi
fi
tag="v$versao"

# Verifica se a tag já existe no git remoto
if git ls-remote --tags origin "$tag" 2>/dev/null | grep -q "$tag"; then
  quarentena_fallback \
    "A tag $tag já existe no repositório remoto." \
    "    Informe uma versão superior explicitamente:\n    ./scripts/publicar-bancada.sh <nova-versão>"
fi
echo "  ✓ Próxima versão definida: $tag"

# ---------------------------------------------------------------------------
# 5. Confirmação de Identidade / Biometria (ActionShelf / Touch ID)
# ---------------------------------------------------------------------------
if [ -z "${SKIP_BIOMETRICS:-}" ]; then
  actionshelf_bin="$raiz/../ActionShelf/ActionShelf"
  if [ -x "$actionshelf_bin" ]; then
    echo "🔐 Exibindo Action Shelf na Notch (Touch ID / macOS)…"
    if ! "$actionshelf_bin" --reason "Autorizar a publicação da Release Bancada $tag"; then
      quarentena_fallback "Autenticação biométrica cancelada pelo usuário." "    Execute novamente quando estiver pronto para autorizar."
    fi
    echo "  ✓ Identidade confirmada pela Action Shelf."
  elif [ -x "$raiz/../doc-harness/scripts/auth-touchid" ]; then
    echo "🔐 Solicitando autenticação biométrica (Touch ID)…"
    if ! "$raiz/../doc-harness/scripts/auth-touchid"; then
      quarentena_fallback "Autenticação biométrica cancelada pelo usuário." "    Execute novamente quando estiver pronto para autorizar."
    fi
    echo "  ✓ Identidade confirmada."
  fi
fi

# ---------------------------------------------------------------------------
# Disparo Seguro
# ---------------------------------------------------------------------------
echo "▸ [5/5] Todas as checagens passaram! Criando tag $tag..."
git tag -a "$tag" -m "Release $versao da Bancada"

echo "▸ Enviando tag para o GitHub..."
if ! git push origin "$tag"; then
  # Se o push falhar, faz rollback da tag local
  git tag -d "$tag" >/dev/null 2>&1 || true
  quarentena_fallback \
    "Falha de rede ou de permissão ao enviar a tag $tag para origin." \
    "    Verifique suas credenciais do GitHub (gh auth refresh -s workflow) e tente novamente."
fi

cat <<MSG

🎉 ====================================================================
   RELEASE DISPARADA COM SUCESSO!
   Tag: $tag
   
   O GitHub Actions está compilando o bundle universal da Bancada.
   Acompanhe o progresso em tempo real:
   gh run watch -R BlendOps/Bancada || open https://github.com/BlendOps/Bancada/actions
====================================================================
MSG
