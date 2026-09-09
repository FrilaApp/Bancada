# Bancada

Leitor nativo do vault do **doc-harness** — tabela de tarefas, galeria com miniaturas reais e o log de fatos com indentação, em vez de lista plana.

A Bancada **não substitui o Obsidian**: as duas ferramentas leem os mesmos arquivos `.md` e podem ficar abertas ao mesmo tempo. Nada é migrado, nada é importado, e nenhum hook do doc-harness muda. Se a Bancada não vingar, é só parar de abri-la.

## Começando

### Baixar o app pronto

Em [Releases](https://github.com/BlendOps/Bancada/releases), baixe o `Bancada-<versão>.zip` da última versão, descompacte e arraste o `Bancada.app` para onde preferir — `/Applications`, a Dock, a mesa.

```bash
gh release download -R BlendOps/Bancada --pattern '*.zip'   # se preferir o terminal
```

O binário é universal (Apple Silicon e Intel). O repositório é privado, então o download pede estar autenticado no GitHub com acesso à organização BlendOps — quem está fora da equipe não precisa do app: para mentores e avaliadores existe [o site](#o-site-para-quem-está-fora).

#### A primeira abertura

Como o app **não é assinado** por uma conta de desenvolvedor Apple, o macOS bloqueia a primeira abertura de um arquivo que veio da internet. Uma vez só:

1. Dê um duplo clique no `Bancada.app` e confirme o aviso.
2. Vá em **Ajustes do Sistema → Privacidade e Segurança**, role até o fim e clique em **Abrir Mesmo Assim**.

O atalho antigo — botão direito → **Abrir** — deixou de funcionar no macOS 15 para apps não assinados. Assinar com Developer ID e notarizar resolveria o atrito de vez, e **ficou decidido não fazer isso por ora**: o app circula dentro de uma equipe de cinco pessoas, e a conta de desenvolvedor traria gestão de certificado e senha no CI para poupar dois cliques uma vez por pessoa. Se a Bancada sair da equipe, a decisão se revê.

#### Apontar o vault

A Bancada procura uma pasta `doc-harness` ao lado do app, subindo alguns níveis — que é o arranjo de quem clonou o repositório dentro de `Challenge18/`. Um app baixado para `/Applications` não tem esse vizinho: use o botão de pasta na barra de ferramentas para escolher a mesma pasta que você abre no Obsidian. A escolha fica salva.

### Compilar localmente

Para contribuir, ou para ter o app sem esperar por uma release:

```bash
./build.sh     # roda os testes, compila e empacota Bancada.app
./Bancada      # abre a janela direto pelo binário
open ./Bancada.app   # ou pelo bundle, como qualquer app do Finder
```

`./build.sh` sempre gera `Bancada.app` na raiz do projeto (não versionado — é artefato de build, como o binário `./Bancada`). O build local é arm64 apenas; o universal sai do workflow de release.

### Deixar na Dock

Com o app rodando, clique e segure o ícone na Dock → **Opções** → **Manter na Dock**.

### Publicar uma nova versão

O workflow `.github/workflows/release.yml` roda os testes, compila o universal, empacota o `.app` e publica a Release. O gatilho é a tag:

```bash
git tag v1.1.0 && git push origin v1.1.0
```

Também dá para disparar pela aba **Actions → Release → Run workflow**, informando a versão — a tag é criada junto. A versão informada vai para o `Info.plist` do bundle, então ela é a que aparece em "Sobre a Bancada".

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
| **Calendário** | Os dias do vault com o que aconteceu em cada um: fatos do log, notas diárias e tarefas criadas. *Andaime — a grade de mês ainda não existe; ver abaixo* |
| **Trabalho** | A tabela de tarefas (colunas ordenáveis, filtro por status) com os fatos logo abaixo. Selecionar uma tarefa mostra só os fatos que citam o ID dela; sem seleção, o log inteiro indentado por dia → tipo → grupo, com a repetição colapsada — cinco commits "Registra os fatos da sessão" viram um nó `5× … [20:21–22:05]`, que abre e mostra os cinco |
| **Diário** | A narrativa do dia ao lado dos fatos que a sustentam — a regra de ouro do vault, verificável de relance |
| **Acervo** | Imagens, vídeos, PDFs e `.pages`, cada um com miniatura de verdade. Selecionar um `.pages` traz o `.md` derivado no painel ao lado |
| **Ajustes** | No pé da barra lateral, fora da lista de seções: qual pasta está aberta e quando foi lida; o resumo do conteúdo do vault; notas sem frontmatter válido e linhas de registro fora do formato dos hooks |

A pasta aberta e a hora da última leitura ficam no centro do cabeçalho da janela, visíveis em qualquer seção — clicar abre a pasta no Finder. O relógio andando sozinho é o que prova que a janela não está mostrando um estado velho: o conteúdo vem do disco a cada leitura, nunca de cache, e os hooks escrevem no vault por fora do app.

Eram seis seções até a refatoração de 09/09: três pares contavam a mesma história por ângulos diferentes. **Tarefas e Registros** viraram *Trabalho* porque o log já cita o ID da tarefa (`… conclui a T-0004`) — a ligação existia no dado e não na interface. **Galeria e Documentos** viraram *Acervo* porque a segunda era a primeira com um painel a mais. E **Saúde** virou *Ajustes*: é diagnóstico do vault, não conteúdo dele.

Nada ficou inalcançável na fusão. A árvore inteira de registros continua a um clique — é o que o painel mostra quando nenhuma tarefa está selecionada —, e o painel diz quantos fatos não citam tarefa nenhuma, para que o recorte nunca se passe por log inteiro.

### O vínculo entre fato e tarefa

É literal, nunca inferido: `Vinculo` procura `T-0001` na descrição do fato, e só. Adivinhar por semelhança de texto atribuiria trabalho à tarefa errada — num app cuja premissa é que o registro é confiável, isso é pior que não ter vínculo. Para um fato aparecer na tarefa, **cite o ID na mensagem de commit**.

### O calendário

`VaultKit/Calendario.swift` já agrega o vault em `DiaDoCalendario` — fatos, diários e tarefas criadas por data — e `DataISO` converte as datas do frontmatter ancorando ao meio-dia, para que fuso e horário de verão nunca joguem um evento para a véspera. A tela é, de propósito, uma lista e não uma grade pela metade: uma grade incompleta pareceria pronta. Falta a grade mensal, a navegação entre meses e a seleção de dia.

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
  Vinculo.swift         Que fato pertence a que tarefa — pelo ID, nunca por semelhança
  Calendario.swift      Eventos por dia (fato, diário, tarefa) e datas ISO
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
