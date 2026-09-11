#!/bin/bash
# Prepara a máquina do colaborador. Idempotente — rode quantas vezes quiser.
set -euo pipefail
raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$raiz"
# shellcheck source=lib.sh
source "$raiz/scripts/lib.sh"

ok="  ✓"; aviso="  ⚠"

echo "doc-harness — preparando o ambiente"
echo

echo "▸ Hooks do Git"
# core.hooksPath faz os hooks morarem no repo (versionados), e não em .git/hooks.
git config core.hooksPath scripts/git-hooks
chmod +x scripts/*.sh scripts/git-hooks/* 2>/dev/null || true
echo "$ok hooks apontando para scripts/git-hooks"

echo "▸ Autenticação Biométrica"
if command -v swiftc >/dev/null 2>&1; then
  swiftc "$raiz/scripts/auth-touchid.swift" -o "$raiz/scripts/auth-touchid" 2>/dev/null && chmod +x "$raiz/scripts/auth-touchid"
  echo "$ok módulo auth-touchid compilado com sucesso"
else
  echo "$aviso swiftc ausente — o push ficará BLOQUEADO nesta máquina"
  echo "     instale com: xcode-select --install"
fi

echo "▸ Identidade"
nome="$(git config user.name 2>/dev/null || true)"
if [ -n "$nome" ]; then
  echo "$ok registros serão assinados como \"$nome\""
else
  echo "$aviso git config user.name não definido — os registros sairão como \"desconhecido\""
  echo "     corrija com: git config user.name \"Seu Nome\""
fi

echo "▸ Dependências"
for cmd in jq textutil osascript; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "$ok $cmd"
  else
    echo "$aviso $cmd ausente"
  fi
done
if tem_pages; then
  echo "$ok Pages encontrado em $(caminho_pages_app)"
else
  echo "$aviso Pages (Apple) não encontrado — a conversão de .pages ficará pendente"
  echo "     nesta máquina; outra pessoa da equipe converte. Instale pela Mac App Store."
fi

echo "▸ Estrutura do dia"
garantir_log >/dev/null && echo "$ok log de fatos de $(hoje) pronto"

echo
echo "Falta só abrir esta pasta no Obsidian:"
echo "  Obsidian → Abrir pasta como vault → $raiz"
echo "Depois aceite a sugestão de instalar o plugin MCP Connector."
