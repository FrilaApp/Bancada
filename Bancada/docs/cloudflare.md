# Publicar o site na Cloudflare

O que falta para o site do vault sair do artefato de build e ir para uma URL
com login. São três coisas na Cloudflare e dois secrets aqui — nenhuma mudança
de código.

O workflow (`.github/workflows/site.yml`) já está pronto e roda a cada push no
`doc-harness`. Enquanto os secrets não existirem, ele compila, testa, gera o
site, sobe como artefato e **termina verde**, pulando a publicação.

## Por que Cloudflare e não Vercel

O vault é o registro interno da equipe: tarefas, narrativas diárias, e o log de
fatos com nome e horário de cada pessoa. Publicar sem autenticação entrega isso
a quem receber a URL encaminhada — o `noindex` do gerador pede a buscadores que
não indexem, mas não é controle de acesso, e o README do projeto já diz isso.

Proteger por senha na Vercel exige o plano Pro (US$ 20 por usuário/mês). O Zero
Trust da Cloudflare faz allowlist por e-mail de graça até 50 usuários, e a
equipe tem cinco pessoas mais os mentores.

## 1. Criar o projeto Pages

1. Conta em [dash.cloudflare.com](https://dash.cloudflare.com) (o plano grátis
   basta).
2. **Workers & Pages → Create → Pages → Upload assets**, nome do projeto
   `bancada`.

   Upload direto, e **não** a conexão com o GitHub: quem constrói o site é o
   workflow daqui, que precisa do Swift para rodar o `bancada-indice`. O build
   da Cloudflare não tem Swift e não conseguiria gerar o índice.
3. Pode subir qualquer arquivo para criar o projeto — o primeiro deploy do
   workflow substitui tudo.

Se mudar o nome do projeto, mude junto o `--project-name=bancada` no
`site.yml`.

## 2. Criar o API token

**Meu perfil → API Tokens → Create Token → Create Custom Token**:

| Campo | Valor |
|---|---|
| Permissão | `Account` · `Cloudflare Pages` · **Edit** |
| Account Resources | Include · a sua conta |
| TTL | à vontade — sem expiração evita o site parar de atualizar sozinho um dia |

O **Account ID** está na barra lateral de qualquer página da conta, ou na URL
do dashboard depois de `dash.cloudflare.com/`.

## 3. Fechar o acesso com o Access

Sem este passo o site fica público para quem tiver a URL.

**Zero Trust → Access → Applications → Add an application → Self-hosted**:

- **Application domain**: `bancada-buu.pages.dev` (o subdomínio real do projeto — a Cloudflare sufixou porque `bancada` já estava tomado)
- **Policy**: `Allow`, com regra **Emails** listando o time e os mentores
- **Identity provider**: `One-time PIN` já resolve — cada pessoa recebe um
  código por e-mail, sem criar senha nova e sem depender de conta Google

Dá para revogar uma pessoa tirando o e-mail da lista, sem mexer no site.

## 4. Inserir os dois secrets

```bash
gh secret set CLOUDFLARE_API_TOKEN  -R BlendOps/Bancada   # cola o token do passo 2
gh secret set CLOUDFLARE_ACCOUNT_ID -R BlendOps/Bancada   # cola o Account ID
```

Depois disso, publicar é rodar o workflow:

```bash
gh workflow run site.yml -R BlendOps/Bancada
gh run watch -R BlendOps/Bancada
```

## Nenhum token do GitHub é necessário

Enquanto `doc-harness` era outro repositório, o build precisava de um token
pessoal para duas coisas: clonar o vault e disparar o workflow de fora. A
unificação dos três repositórios em 11/09/2026 resolveu as duas de uma vez —
um `actions/checkout` traz o conteúdo e o leitor juntos, e `on: push` dispensa
o `repository_dispatch`.

O `GITHUB_TOKEN` que o próprio workflow recebe basta. Não há token pessoal para
criar, aprovar na org, nem rotacionar.

## Conferindo sem publicar nada

Enquanto nada disso existe, o resultado já é inspecionável:

```bash
gh run download -R BlendOps/Bancada -n site
open site/index.html
```

É o site inteiro, funcionando local, exatamente como será publicado — só sem o
`versao.json` sendo servido por HTTP, então o aviso de conteúdo novo fica
quieto.
