---
tipo: tarefa
id: T-0004
status: em-andamento
responsavel: [fbtostadev, cauecarneiroc]
desafio: C18
data_criacao: 2026-09-09
tags: [tarefa]
---

# Distribuir Bancada.app pré-compilado via GitHub Releases

## Contexto
`Bancada.app` (e o binário `./Bancada`) são artefatos de build, ignorados no `.gitignore` do repositório — por isso todo mundo que clona a Bancada tem que rodar `./build.sh` antes de ter um app funcionando. Isso já pegou dois colaboradores (Cauê e Júlia) que clonaram o repo e não encontraram o executável.

A correção imediata (documentar o `./build.sh` mais cedo no README) resolve o "não sabia que precisava buildar", mas não elimina o passo em si. Esta tarefa vai além: publicar o `Bancada.app` já compilado como asset de uma GitHub Release, para que novos colaboradores possam baixar o app pronto em vez de compilar localmente.

Trade-off já identificado na conversa: isso troca "5 min de build local" por manutenção de CI/release, e não resolve sozinho o aviso do Gatekeeper (app não assinado por conta de desenvolvedor Apple) — cada download ainda vai pedir o "Abrir" manual na primeira vez.

## Feito quando
- [x] Decidido o gatilho da release: **tag `v*`**, com `workflow_dispatch` junto para disparar sem criar tag à mão. Release é decisão deliberada, e runner macOS em repositório privado conta minutos a 10x — push em `main` gastaria isso a cada commit.
- [x] Workflow criado em `.github/workflows/release.yml`: `swift test`, `swift build -c release --arch arm64 --arch x86_64`, `scripts/empacotar-app.sh` e `ditto -c -k --keepParent` para o `.zip` do bundle. Não chama `build.sh` — o build local segue arm64 e intocado; o empacotador ganhou `BANCADA_BINARIO` e `BANCADA_VERSAO` opcionais, com os padrões de antes.
- [ ] Release de teste publicada e validada. **Publicada**: `v0.1.0`, run verde em 1m27s. **Validado aqui**: asset universal (`lipo` → `x86_64 arm64`), versão `0.1.0` no `Info.plist`, assinatura ad-hoc íntegra (`codesign --verify --deep --strict`), e o binário do bundle baixado lê o vault (`--verificar` sai 0). Com quarentena simulada, `spctl` responde `rejected` — o bloqueio que o README manda contornar. **Falta**: abrir numa máquina que não seja a de quem compilou, que é a parte do Cauê.
- [x] `README.md` reescrito: "Começando" abre pelo download da Release, o build local virou o caminho de quem contribui, e entrou uma seção de como publicar versão nova.
- [x] Decisão registrada, no README e na mensagem do commit: **fica sem assinatura de Developer ID por ora**. O app circula entre cinco pessoas, e certificado + senha de app no CI custaria mais do que os dois cliques que pouparia uma vez por pessoa. Revê-se se a Bancada sair da equipe.

## Notas
- Tarefa compartilhada entre Fabrício e Cauê.
- Depende do estado atual de `build.sh` e `scripts/empacotar-app.sh` (não alterar o comportamento do build local sem necessidade — só adicionar a distribuição por cima).

### O que apareceu no caminho

- **A detecção do vault vizinho não funcionava fora do terminal.** `EstadoDaBancada.vaultVizinho()` partia de `FileManager.default.currentDirectoryPath`, e um app aberto pelo Finder herda `/` como diretório de trabalho — então o duplo clique já não achava o `doc-harness` antes desta tarefa; só o `./Bancada` do terminal achava. Agora parte de `Bundle.main.bundleURL` e sobe até três níveis, com o cwd como último candidato. Um app em `/Applications` continua sem vizinho, e isso é o esperado: cai no seletor de pasta, uma vez, e o caminho fica salvo.
- **O repositório é privado**, então o asset só baixa autenticado — `gh release download` ou navegador logado com acesso à `BlendOps`. Serve para a equipe; quem está fora continua no site estático, como já era o plano.
- **O Gatekeeper mudou.** O README mandava clicar com o botão direito e escolher "Abrir", atalho que o macOS 15 removeu para apps não assinados. O caminho atual é Ajustes do Sistema → Privacidade e Segurança → "Abrir Mesmo Assim", e é o que está documentado agora.
- **O push exigiu o escopo `workflow` no token do `gh`** (`gh auth refresh -h github.com -s workflow`). Quem for mexer no workflow depois vai esbarrar no mesmo bloqueio.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
