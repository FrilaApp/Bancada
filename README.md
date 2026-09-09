# Bancada

Leitor nativo do vault do **doc-harness** — tabela de tarefas, galeria com miniaturas reais e o log de fatos com indentação, em vez de lista plana.

A Bancada **não substitui o Obsidian**: as duas ferramentas leem os mesmos arquivos `.md` e podem ficar abertas ao mesmo tempo. Nada é migrado, nada é importado, e nenhum hook do doc-harness muda. Se a Bancada não vingar, é só parar de abri-la.

## Rodar

```bash
./build.sh     # roda os testes, compila e empacota Bancada.app
./Bancada      # abre a janela direto pelo binário
open ./Bancada.app   # ou pelo bundle, como qualquer app do Finder
```

Ao abrir pela primeira vez, ela procura a pasta `doc-harness` ao lado. Para apontar outra, use o botão de pasta na barra de ferramentas.

### Deixar na Dock

`./build.sh` sempre gera `Bancada.app` na raiz do projeto (não versionado — é
artefato de build, como o binário `./Bancada`). Para fixar na Dock:

1. Rode `./build.sh` (ou só `./scripts/empacotar-app.sh` se o binário já
   estiver compilado).
2. Abra `Bancada.app` pelo Finder (duplo clique) ou `open ./Bancada.app`.
3. Com o app rodando, clique e segure o ícone na Dock → **Opções** →
   **Manter na Dock**.

Como o app não é assinado por uma conta de desenvolvedor Apple, o Gatekeeper
pode barrar a primeira abertura — clique com o botão direito no ícone e
escolha **Abrir** para confirmar uma vez.

### Verificar sem abrir janela

```bash
./Bancada --verificar ../doc-harness
```

Imprime as contagens do vault e a árvore de registros agrupada. Sai com `0` se o vault está consistente e `2` se há nota fora da convenção ou linha de registro fora do formato dos hooks — serve para CI.

## O site para quem está fora

Mentores e avaliadores não vão instalar app nenhum, então o mesmo vault também vira um site estático:

```bash
./build.sh --com-site          # compila e gera em site/
node scripts/gerar-site.js ../doc-harness [destino]
```

Sai HTML puro, sem JavaScript e sem dependência de npm — o colapso dos grupos de registro usa `<details>`. Tema claro e escuro acompanham o sistema do leitor.

**O gerador não parseia nada.** Ele chama `./Bancada --indice`, que emite o vault inteiro como JSON já parseado e agrupado, e só renderiza. Isso é o ponto: duas implementações da mesma regra divergem com o tempo, e um registro que conta histórias diferentes conforme quem olha perde a serventia inteira.

O que fica de fora do site, de propósito:

- **Índices** (`00 - Índice *.md`) — listas de wikilinks que só fazem sentido dentro do Obsidian; a barra lateral do site cumpre esse papel.
- **Templates** — andaimes cheios de `{{marcadores}}`, que fariam o registro parecer preenchido pela metade justo para quem vai avaliá-lo.
- **O rodapé de navegação** de cada nota, que aponta para os índices não publicados.

As páginas levam `noindex, nofollow`. Isso pede a buscadores que não indexem, mas **não é controle de acesso**: quem tiver a URL vê o conteúdo. Se o site for hospedado, a proteção precisa vir de onde ele estiver.

## O que ela mostra

| Seção | O que resolve |
|---|---|
| **Registros** | O log de fatos indentado por dia → tipo → grupo. Repetição colapsa: cinco commits "Registra os fatos da sessão" viram um nó `5× … [20:21–22:05]`, que abre e mostra os cinco |
| **Tarefas** | Tabela nativa com colunas ordenáveis e filtro por status |
| **Galeria** | Imagens, vídeos, PDFs e `.pages`, cada um com miniatura de verdade |
| **Documentos** | O `.pages` e seu `.md` derivado lado a lado |
| **Diário** | A narrativa do dia ao lado dos fatos que a sustentam — a regra de ouro do vault, verificável de relance |
| **Saúde** | Notas sem frontmatter válido e linhas de registro fora do formato dos hooks |

## Como o agrupamento decide o que juntar

Nada de similaridade difusa: dois fatos entram no mesmo grupo quando coincidem em **(tipo, autor, descrição normalizada)**, e normalizar descarta apenas o que varia mecanicamente entre repetições — o hash do commit e as contagens (`· 25 arquivo(s)`, `4365 palavras`, `1 nota(s)`).

Números em geral **não** são removidos: senão "Abre o desafio C17" e "Abre o desafio C18" colapsariam num grupo só, e o agrupamento passaria a mentir sobre o que aconteceu.

Nenhum fato é descartado — colapsar é escolha de leitura, e os originais continuam dentro do nó. Isso importa num sistema cuja premissa inteira é que o registro é confiável.

## As regras do vault, aqui

O `scripts/guarda.sh` do doc-harness protege as ferramentas do Claude Code; ele não protege um app. Então as mesmas regras são **estruturais** na Bancada:

- Notas com `tipo: registro` e `tipo: documento-derivado` são somente leitura no nível do modelo (`TipoNota.somenteLeitura`) — não existe caminho de código que escreva nelas.
- O modo `--verificar` é estritamente leitura.

## Estrutura

```
Sources/VaultKit/     Leitura do vault, sem UI — testável e reaproveitável
  Frontmatter.swift     Parser do subconjunto YAML que o vault usa
  Nota.swift            Modelos; tipos e status como enums fechados
  Fato.swift            Parser das linhas de 05 - Registros/
  Agrupador.swift       A regra de colapso descrita acima
  Vault.swift           Varredura da pasta e catálogo de mídia
  Observador.swift      FSEvents — os hooks escrevem por fora do app

Sources/Bancada/      A interface
  DS/                   Tokens e componentes (espelho de tokens.json)
  Telas/                Uma por seção

Tests/VaultKitTests/  Fixture: o log real do primeiro dia de uso do vault
```

Os testes usam `Fixtures/registro-2026-09-08.md`, copiado sem edição de `05 - Registros/`. Um parser que não reproduz aquele arquivo não serve: é o formato que os hooks realmente produzem, não o que a documentação diz que produzem.

## Por que SwiftPM e não `.xcodeproj`

Mesmo motivo de `ActionShelf/`: com cinco pessoas commitando no mesmo repositório, um `.xcodeproj` versionado é fábrica de conflito. `swift build` e pronto.
