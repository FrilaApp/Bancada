---
tipo: design
desafio: C18
data_criacao: 2026-09-10
tags: [design, revisao, anexo]
---

# Revisão profunda de UI · Detalhe de interface

> Relatório bruto de uma das sete lentes. A nota consolidada, com os achados
> agrupados por causa e já verificados, é
> [[06 - Design/Revisão Profunda de UI - 2026-09-10|Revisão Profunda de UI - 2026-09-10]].

# Achados de UI — lente: detalhe de interface (better-ui)

Escopo: `Componentes.swift`, `Telas/*.swift`, `JanelaPrincipal.swift` (app) e
`estilo.css` + `scripts/estilo/*.css` + `bordo.html` (site). Nenhum arquivo do
projeto foi editado. Não abri o app nem tirei captura — as 9 capturas
existentes foram usadas só para calibrar ritmo/densidade; todo achado abaixo
foi confirmado lendo o código atual, pós V-01 a V-05.

Confirmei em código que V-01 (markdown cru), V-02 (grade do Acervo vazando),
V-04 (modo inicial do calendário) e V-05 (dois seletores/dois rodapés) estão
corrigidos: `TextoDeNota.swift` agora renderiza blocos de Markdown;
`TelaAcervo.swift` usa grade adaptativa com o cartão contendo a miniatura;
`TelaAjustes.swift` consome `SeletorSegmentado` do DS; `JanelaPrincipal.swift`
usa `List` nativa para Ajustes no rodapé, igual às outras seções.

---

### UI-01 · A prévia do calendário — o substituto do popover recusado — aparece e some sem transição
**Onde:** `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:302-313` (overlay condicional), `:597-613` (`agendarPreview`/`cancelarPreview`/`fecharPreview`, nenhuma envolvida em `withAnimation`), `:322-324` (a lista de `.animation(value:)` da grade não inclui `previewDoDia`)
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código)
**O que está errado:** `Sobreposicao` só existe porque o `popover` nativo trazia a sombra que o sistema recusa (V-03, já corrigido). Mas a substituição resolveu a sombra e perdeu a entrada suave que o `popover` nativo dava de fábrica: `previewDoDia = data`/`= nil` muda direto, sem `withAnimation`, e o `if let ancora, let data = previewDoDia …` que decide se `Sobreposicao` existe não tem `.transition()`. O resultado é um corte abrupto — o oposto do que "Superfície que flutua sobre o resto" promete no comentário do próprio componente (`Componentes.swift:171-180`).
**Por que importa:** é overlay contextual e pouco frequente (só depois de 600 ms parado sobre um dia com evento) — exatamente o caso em que uma entrada de opacidade/blur é barata e o corte seco chama atenção errada, o oposto de "restraint" alcançado por omissão.
**Correção:** envolver as três mutações de `previewDoDia` em `withAnimation(DS.Movimento.rapido)` e aplicar `.transition(.opacity.combined(with: .scale(scale: 0.96)))` (ou blur, seguindo o padrão de ícone contextual) no conteúdo de `Sobreposicao` dentro do `overlayPreferenceValue`.

### UI-02 · Todo hover do app é funcional, nenhum é visual
**Onde:** `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:394` (`.onHover` da célula) e `:452` (`.onHover` do puxador); `Bancada/Sources/DesignSystem/Componentes.swift:107` (`Pilula`), `:575` (`ChipRemovivel`), `:634` (`SeletorSegmentado`) — todos `.buttonStyle(.plain)` sem contrapartida
**Superfície:** app
**Gravidade:** alta
**Confiança:** confirmado (li o código)
**O que está errado:** a revisão anterior contou "2 hover" e tratou como progresso. Lendo o corpo dos dois: a célula do calendário usa `onHover` só para agendar/cancelar a prévia (`if dentro, !eventos.isEmpty { agendarPreview(…) }`), sem mudar nada visualmente; o puxador usa `onHover` só para trocar o cursor do sistema. Nenhum dos dois pinta hover. Some para zero o número de elementos clicáveis do app com **algum** retorno visual de "isto responde ao ponteiro" — pílulas de filtro, o X do `ChipRemovivel`, as opções não-ativas do `SeletorSegmentado`, os 12 `.buttonStyle(.plain)` inteiros.
**Por que importa:** num app de mouse (macOS), a ausência de qualquer feedback de ponteiro é o que faz um controle parecer texto morto até o clique confirmar que era botão. É a mesma causa por trás de "0 pressed" já registrado — aprofundamento: mostra que os "2 hover" existentes não contradizem essa causa, só mascaram a contagem.
**Correção:** um único `ButtonStyle` no DS (`EstiloDeBotaoDS` ou análogo) que aplique `configuration.isPressed` → leve escurecimento/veú e, via `.onHover` interno, um véu de `DS.Veu.sutil` sobre `cores.superficie`/`cores.dado` — aplicado nos quatro pontos acima em vez de reinventado tela por tela.

### UI-03 · O site inteiro não declara nenhuma `transition`
**Onde:** `Bancada/scripts/estilo/multipagina.css:14,27`; `Bancada/scripts/estilo/pagina-unica.css:29,69,119`; refletido em `Bancada/site/bordo.html:209,222` (herdado) e `:223,263,313` (modo página única) — busca por `transition` no CSS gerado só encontra o bloco de `prefers-reduced-motion` desativando transições que não existem
**Superfície:** site
**Gravidade:** alta
**Confiança:** confirmado (`grep -n "transition" site/estilo.css scripts/estilo/*.css site/bordo.html` só retorna a regra de `prefers-reduced-motion`)
**O que está errado:** `header nav a:hover`, `aside a:hover`, `nav button:hover`, `.dia:hover` e `.arvore summary:hover .dito` mudam `color`/`background` na régua, sem uma linha de `transition` em nenhum dos dois modos do site. Todo hover corta instantâneo. Também não há um único `:active` no site inteiro.
**Por que importa:** é o oposto do que o app já faz certo em `Pilula`/`SeletorSegmentado` (que ao menos animam `value: ativo`/`value: selecao`) — o site, que deveria ser a superfície mais barata de corrigir (CSS puro, zero dependência), está pior que o app nesse ponto específico. Esta revisão anterior não cobriu o site; é achado novo.
**Correção:** uma linha central em `base.css` — `a, button, summary { transition: color 120ms ease-out, background-color 120ms ease-out; }` — usando o valor de `rapido` (0.12) que o app já usa para o mesmo tipo de mudança de estado, para as duas superfícies pelo menos combinarem a duração.

### UI-04 · Raio fora da escala em dois pontos, sem passar pelo token
**Onde:** `Bancada/Sources/Bancada/Telas/TelaRegistros.swift:251` e `Bancada/Sources/Bancada/Telas/TelaCalendario.swift:682` — ambos `RoundedRectangle(cornerRadius: 3)`
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (li o código; `DS.Raio` só define `sm=6, md=10, lg=16, pilula`)
**O que está errado:** a etiqueta de versão no Cartão Comparativo (`TelaRegistros.swift:251`) e o chip de evento na grade do calendário (`ChipDeEvento`, `TelaCalendario.swift:682`) desenham raio `3` — um valor que não existe em `DS.Raio` e não é derivado de nenhum dele. É o mesmo tipo de furo que o sistema já persegue em cor (papel faltando) e em tipografia (16 tamanhos fora da escala), só que na métrica de raio, que a revisão anterior não mediu.
**Por que importa:** dois elementos pequenos e frequentes (badge de versão, chip de evento) com raio que nenhum outro componente do app usa — visualmente quase impossível notar isolado, mas é exatamente o tipo de valor solto que o teste de paridade não pega porque paridade só compara JSON↔Swift, não uso.
**Correção:** os dois pedem um raio menor que `sm` para elemento tão pequeno — acrescentar `DS.Raio.xs = 4` (papel de métrica que falta, não um hex) e trocar os dois literais por ele.

### UI-05 · O ícone de `Bloco` não declara peso nem tamanho — fica ao sabor do ambiente, ao lado de texto semibold
**Onde:** `Bancada/Sources/DesignSystem/Componentes.swift:157-159`
**Superfície:** app
**Gravidade:** média
**Confiança:** confirmado (o código não tem nenhum `.font()`/`.imageScale()` no `Image`); o efeito visual exato é plausível — não pude renderizar para medir o resultado
**O que está errado:** `Image(systemName: simbolo).foregroundStyle(corDoSimbolo ?? .primary)` — sem `.font(.system(size:weight:))` — ao lado de `Text(titulo).font(DS.Tipografia.secao)` (15pt, semibold). Todo `Bloco(..., simbolo:)` (Ajustes: "Vault consistente", "Notas fora da convenção", "Linhas de registro fora do formato") herda esse par sem controle de peso/tamanho relativo ao texto.
**Por que importa:** é a regra "o ícone carrega o peso óptico do texto ao lado" (traço fino ao lado de semibold lê como quebrado). Aqui nem é escolha — é ausência de escolha, porque ninguém fixou tamanho nem peso.
**Correção:** `Image(systemName: simbolo).font(.system(size: 14, weight: .semibold)).foregroundStyle(…)` — 14pt para casar com o cap-height de `secao` (15pt) e `.semibold` para casar o peso do traço com o peso do texto.

### UI-06 · `callout` e `pre` têm raio diferente entre os dois modos do site
**Onde:** `Bancada/site/estilo.css:268,282` (`border-radius: var(--raio)` → 10px) vs. `Bancada/scripts/estilo/pagina-unica.css:82,91` (`border-radius: 8px`, literal)
**Superfície:** site
**Gravidade:** média
**Confiança:** confirmado (li os dois arquivos; ambos os seletores renderizam o mesmo callout/bloco de código vindos do mesmo pipeline de Markdown)
**O que está errado:** o mesmo callout do Obsidian (`> [!info]`) e o mesmo bloco de código saem com 10px de raio no modo multipágina (via `var(--raio)`) e 8px no modo página única (número solto, não referencia a variável que o próprio arquivo já importa de `estilo.css`). Mesma função, dois valores.
**Por que importa:** é o padrão que V-05 já flagrou para seletor segmentado e seleção de barra lateral — "mesmo controle, mesma função, dois vocabulários" — agora no site, em raio em vez de cor.
**Correção:** trocar os dois literais de `pagina-unica.css` por `var(--raio)`; se o desenho mais compacto da página única quer um raio menor de propósito, isso pede um segundo papel de raio (ex. `--raio-compacto`), não um número solto.

### UI-07 · `Thumbnail` resolve o carregamento sem transição
**Onde:** `Bancada/Sources/Bancada/Telas/Thumbnail.swift:32-35`
**Superfície:** app
**Gravidade:** baixa
**Confiança:** confirmado (li o código: troca de `ZStack` de placeholder para `Image(nsImage:)` sem `.transition()`/`.animation()`)
**O que está errado:** é o único estado de `loading` que existe no app (`carregando` de `EstadoDaBancada` nunca é lido). Quando o `QLThumbnailGenerator` termina, a imagem substitui o `ProgressView` no próximo frame, sem crossfade.
**Por que importa:** miniaturas chegam em momentos diferentes (Acervo e o Cartão Comparativo carregam várias ao mesmo tempo); sem crossfade, a grade pisca peça por peça em vez de assentar.
**Correção:** `.transition(.opacity.animation(DS.Movimento.padrao))` no `if let imagem` — reaproveita o token que já existe, não pede valor novo.

### UI-08 · O botão de tema da página única, que o próprio CSS já prevê, não existe no código
**Onde:** `Bancada/site/bordo.html:53-83` (comentário e regras `data-theme`) vs. `Bancada/site/bordo.html:1298-1326` (todo o `<script>` do site — só navegação entre seções, nenhum `setAttribute('data-theme', …)`); confirmado também em `Bancada/scripts/gerar-site.js` (nenhuma ocorrência de `data-theme` fora do bloco de CSS emitido)
**Superfície:** site
**Gravidade:** baixa
**Confiança:** confirmado que o botão/script não existe no código gerado atual; não confirmei se é trabalho pendente conhecido ou nota desatualizada — precisaria do histórico/backlog do time para saber a intenção
**O que está errado:** o comentário em `estilo.css`/`bordo.html` diz literalmente que `data-theme` "só existe para o botão da página única sobrepor essa escolha", e o CSS tem as duas regras (`:root:not([data-theme="light"])` e `:root[data-theme="dark"]`) prontas — mas não há botão, nem script que grave o atributo, nem `localStorage` para lembrar a escolha. É código morto hoje.
**Por que importa:** é pequeno, mas é exatamente o tipo de nota que envelhece mal — quem ler o Sistema de Design confia que o controle existe.
**Correção:** ou implementar o botão (toggle de três estados, espelhando `Aparencia` do app) ou atualizar a nota para dizer que o override do site ainda não tem controle de UI.

---

## O que está bom

- **V-01, V-02, V-04, V-05 seguem corrigidos** no código atual — nada regrediu.
- **O site não usa nenhuma `box-shadow`** em nenhum dos dois modos — a doutrina "fio, nunca sombra difusa" se sustenta mesmo na superfície que a revisão anterior não olhou.
- `Pilula` e `SeletorSegmentado` já animam a própria mudança de estado com token (`DS.Movimento.rapido`) — o problema em UI-02 é a ausência de estado de *ponteiro*, não a ausência de token de movimento.

## O que não consegui verificar

- Nenhuma captura de tela nova — todo achado veio de leitura de código; onde a consequência visual exata (ex. UI-05, UI-01) depende de renderização, marquei `plausível` e disse o que falta.
- Não rodei `swift build`/`swift test` porque nenhum achado dependia de compilar — todos são legíveis diretamente no fonte.
- Não confirmei a intenção por trás do botão de tema ausente (UI-08) — pode já estar no backlog do time.