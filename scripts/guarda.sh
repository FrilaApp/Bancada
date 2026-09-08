#!/bin/bash
# Guarda de ferramentas do doc-harness.
#
# Transforma as regras do CLAUDE.md de política (prosa que um modelo segue quase
# sempre) em mecanismo (verificação determinística antes da ferramenta rodar).
# "Quase sempre" não serve para o log de fatos: ele existe justamente para ser
# confiável, e uma única edição indevida destrói a procedência sem deixar rastro.
#
# Chamado pelo hook PreToolUse, com o JSON da chamada no stdin.
#   guarda.sh arquivo → Write/Edit
#   guarda.sh bash    → Bash

entrada="$(cat)"

decidir() { # decidir <allow|deny|ask> <motivo>
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $d, permissionDecisionReason: $r}}'
  exit 0
}

# O `--` encerra as opções do grep: sem ele, um padrão que começa com "-"
# (como --no-verify) seria lido como flag e o teste falharia em silêncio.
casa() { printf '%s' "$1" | grep -qE -- "$2"; }

# Sem jq não dá para inspecionar a chamada. Devolve a decisão para a pessoa em
# vez de liberar em silêncio: um guarda cego que aprova é pior que guarda nenhum.
if ! command -v jq >/dev/null 2>&1; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"jq ausente: a guarda do doc-harness nao conseguiu verificar esta chamada."}}'
  exit 0
fi

case "${1:-}" in

  arquivo)
    caminho="$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')"
    [ -n "$caminho" ] || exit 0

    case "$caminho" in
      *"05 - Registros/"*)
        decidir deny "05 - Registros/ é o log de fatos: escrito apenas pelos hooks, via scripts/registrar-fato.sh. Editar aqui destrói a procedência do diário — e a procedência é o que dá valor ao registro. Se algo está errado, corrija a narrativa em 02 - Atualizações Diárias/, não o fato."
        ;;
    esac

    if [ -f "$caminho" ] && head -20 "$caminho" | grep -q '^tipo: documento-derivado$'; then
      origem="$(sed -n 's/^origem: "\(.*\)"$/\1/p' "$caminho" | head -1)"
      decidir deny "Este arquivo é gerado a partir de ${origem:-um .pages} e será sobrescrito na próxima conversão — sua edição se perderia em silêncio. Edite o .pages original e rode /documento."
    fi
    exit 0
    ;;

  bash)
    cmd="$(printf '%s' "$entrada" | jq -r '.tool_input.command // empty')"
    [ -n "$cmd" ] || exit 0

    # Escrever no log de fatos por fora do registrar-fato.sh
    if casa "$cmd" '05 - Registros' \
       && casa "$cmd" '(>>?|[[:space:]]tee[[:space:]]|sed -i|truncate|[[:space:]]rm[[:space:]]|[[:space:]]mv[[:space:]])' \
       && ! casa "$cmd" 'registrar-fato\.sh'; then
      decidir deny "Esta chamada escreve em 05 - Registros/ por fora de scripts/registrar-fato.sh, que é a única porta de escrita do log de fatos."
    fi

    # Destrutivos e contornos de gate: devolvem a decisão para a pessoa.
    # Necessário porque o modo de permissão aqui é 'auto' — sem isto não há
    # ninguém no circuito para nenhuma chamada.
    if casa "$cmd" '\brm\b[^|;&]*[[:space:]]-[a-zA-Z]*[rR]'; then
      decidir ask "Remoção recursiva de arquivos. Confirme o alvo antes de prosseguir."
    fi
    if casa "$cmd" 'git[[:space:]]+reset[[:space:]]+.*--hard|git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f|git[[:space:]]+checkout[[:space:]]+--[[:space:]]+\.|git[[:space:]]+restore[[:space:]]+.*\.'; then
      decidir ask "Este comando descarta alterações não commitadas, que o Git não recupera depois."
    fi
    if casa "$cmd" 'git[[:space:]]+push[[:space:]]+.*(--force|--force-with-lease|[[:space:]]-f\b)'; then
      decidir ask "Force push reescreve a história de um repositório com mais quatro pessoas. Confirme que ninguém mais está sobre esses commits."
    fi
    if casa "$cmd" 'git[[:space:]]+branch[[:space:]]+-D'; then
      decidir ask "Exclusão forçada de branch, incluindo commits ainda não mesclados."
    fi
    if casa "$cmd" '--no-verify|SKIP_BIOMETRICS=|SKIP_PAGES='; then
      decidir ask "Esta chamada contorna um dos gates do repositório (hooks de commit, conversão de .pages ou confirmação de identidade no push). Só faz sentido com uma decisão humana explícita."
    fi
    exit 0
    ;;

  *)
    exit 0
    ;;
esac
