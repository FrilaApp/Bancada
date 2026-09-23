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
#
# O caminho é relativo à **raiz do git**, não à do vault, e desde a migração para o
# monorepo os dois deixaram de ser a mesma pasta. Enquanto isto dizia
# `scripts/git-hooks` fixo, apontava para um caminho inexistente na raiz do monorepo:
# o git não reclama de hooksPath que não existe, simplesmente não roda hook nenhum. O
# registro de fatos ficou parado de 2026-09-10 a 2026-09-23 sem uma linha de aviso.
hooks_rel="${PREFIXO_NO_REPO}scripts/git-hooks"
git -C "$GIT_ROOT" config core.hooksPath "$hooks_rel"
chmod +x scripts/*.sh scripts/git-hooks/* 2>/dev/null || true

if [ -d "$GIT_ROOT/$hooks_rel" ]; then
  echo "$ok hooks apontando para $hooks_rel"
else
  echo "$aviso core.hooksPath aponta para $hooks_rel, que não existe em $GIT_ROOT"
  echo "     nenhum hook vai rodar, e o git não avisa. Confira a árvore do repositório."
fi

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
