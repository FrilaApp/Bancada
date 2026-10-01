---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/bicos.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Bicos (Bicos app)

![[04 - Tarefas/Anexos/concorrente-bicos.png|Captura da loja: Bicos (Bicos app)]]

> **Nota de Desambiguação:** Na Google Play brasileira existem dois aplicativos com o nome "Bicos":
> 1. **Bicos app** (pacote `app.bicos` no Google Play e ID `6753880443` na App Store), desenvolvido pela **Hybriun Desenvolvimento LTDA** (Americana-SP; o domínio `hybriun.com.br` está em nome de Vitor Facioli). É o aplicativo capturado na pesquisa prévia do Frila (`pesquisa/concorrentes/concorrente-bicos.png`), focado em serviços domésticos e pequenos reparos, com pagamento em cartão e custódia no app.
> 2. **Bicos — ache um bico ou peça um** (pacote `com.bicos.app` no Google Play, site `bicosoficial.com.br`), focado em classificados gerais de bicos e tarefas, sem versão iOS e sem intermediação de pagamento.
> Esta análise foca primariamente no **Bicos app (`app.bicos`)**, objeto da captura oficial do projeto, apontando os contrastes com o homônimo quando pertinente.

---

## 1. Ficha

| Campo | Dado | Fonte |
|---|---|---|
| Empresa (razão social, CNPJ se público) | Hybriun Desenvolvimento LTDA (vendedor na App Store e desenvolvedor na Google Play). CNPJ da LTDA: não encontrado (buscado em: App Store, Google Play, site, política de privacidade do app). O CNPJ 33.004.817/0001-97 é outra empresa: um empresário individual de Vitor Facioli com nome fantasia "Hybriun Systems", aberto em 12/03/2019 e baixado em 03/02/2020 | App Store [3], Google Play [4], CNPJ público [1] |
| Fundação e fundadores | Quadro societário da LTDA: não encontrado. O domínio `hybriun.com.br` está em nome de Vitor Facioli desde 02/03/2016 e o e-mail de suporte do app é dele; a página da empresa no LinkedIn declara fundação em 2015. App lançado na App Store em 12/10/2025 | Registro.br [2], Google Play [4], LinkedIn [8], App Store [3] |
| Sede | Americana, São Paulo | Endereço do desenvolvedor na Google Play [4], LinkedIn [8] |
| Plataformas e links | iOS (App Store), Android (Google Play) e web institucional da desenvolvedora | App Store [3], Google Play [4], Hybriun [5] |
| Nota e nº de avaliações (iOS e Android, com data) | iOS: sem avaliações suficientes (0 reviews em 01/10/2026); Android: a Google Play não exibe nota; há 1 avaliação com texto, de 1 estrela (dez/2025), em 01/10/2026 | App Store [3], Google Play [4] |
| Downloads (Google Play) | Mais de 1.000 downloads (1 mil+) em 01/10/2026 | Google Play (`app.bicos`) [4] |
| Cobertura (cidades e estados; **atua no DF?**) | Cobertura não declarada nas lojas nem no site. A captura da loja mostra um endereço de exemplo em Vitória da Conquista (BA) e o telefone fictício "(71) 9999-9999", o que não prova operação lá. **Sem evidência pública de operação no DF** (buscado em: site da desenvolvedora [5], termos de uso e descrição das lojas [3][4]) | Captura oficial `concorrente-bicos.png` [6], descrição da Google Play [4] |
| Público dos dois lados (quem contrata, quem trabalha) | Quem contrata: proprietários residenciais e pequenos comércios; Quem trabalha: pedreiros, pintores, eletricistas, encanadores, montadores de móveis e equipes de limpeza pós-obra e jardinagem | Descrição oficial das lojas [3][4] |
| Funções ou categorias | Serviços para o lar: reparos e manutenção (eletricista, encanador, chaveiro, ar-condicionado), reformas (pedreiro, pintor, marceneiro), montagem e pequenos fretes | Ficha da App Store [3] |
| Investimento recebido (rodadas, investidores, valores) | Não encontrado (buscado em: Crunchbase, Distrito, StartSe). Inferência: parece produto próprio da Hybriun, uma empresa de desenvolvimento, mas não há fonte que diga como foi financiado | Crunchbase [7] |

---

## 2. Como funciona

O Bicos app opera como um marketplace transacional de serviços domésticos e reparos sob demanda:

1. **Cadastro:** O usuário entra com email ou telefone (captura da loja). Clientes e prestadores usam o mesmo app; a troca de perfil dentro da conta não foi verificada.
2. **Publicação / Busca:** O contratante descreve a necessidade (ex.: "Pintura residencial e comercial", "Pequenos reparos"), adiciona fotos, seleciona a categoria e informa a localização (endereço/CEP).
3. **Despacho / Proposta:** O anúncio fica visível para profissionais cadastrados na região. Os profissionais enviam propostas orçamentárias ou o contratante navega pelos perfis locais e inicia contato.
4. **Comunicação:** Abre-se um chat interno onde as partes negociam valores, escopo do trabalho, materiais inclusos e data de execução.
5. **Contratação e Pagamento:** O contratante realiza o pagamento antecipado diretamente no aplicativo via cartão de crédito. O dinheiro fica retido em conta de custódia (*escrow*).
6. **Execução e Liberação:** O profissional realiza o serviço no local combinado. O contratante acessa o app e confirma a conclusão; somente após essa confirmação o valor é liberado para o saldo do prestador.
7. **Avaliação:** O cliente avalia o profissional (a descrição cita "avaliações reais de outros clientes"). Avaliação do cliente pelo profissional: não encontrada na descrição das lojas.

---

## 3. Modelo de negócio hoje

- **Quem paga:** O contratante paga pelo serviço contratado. O cadastro e envio de propostas pelo profissional é anunciado como gratuito ("cadastre-se gratuitamente").
- **Mecanismo de monetização:** Não divulgado (buscado em: descrição das lojas, site `bicos.hybriun.com.br` e política de privacidade). O site promete "sem taxas escondidas", mas não informa taxa nenhuma. A política de privacidade ainda traz o texto-modelo "[Ex: Stripe, Mercado Pago, PagSeguro]" no lugar do parceiro de pagamentos.
- **Intermediação financeira:** **Sim**, o dinheiro passa obrigatoriamente pelo app via cartão de crédito com retenção de segurança (*escrow*). O saldo só é repassado ao prestador após o "aceite de conclusão" do cliente.
- **Seguro / Garantia:** Não há apólice de seguro contra acidentes pessoais ou danos materiais informada. A garantia oferecida é apenas financeira (o dinheiro não é liberado se o serviço não for aprovado).
- **Nota fiscal e vínculo:** Não encontrado (buscado em: descrição das lojas, site e política de privacidade).

---

## 4. Nascimento e evolução do modelo

- **12 de outubro de 2025 (Lançamento):** Primeira versão na App Store, como aplicativo de serviços para o lar (reparos, reformas, montagem). Data de estreia na Google Play: não encontrada; a avaliação mais antiga ali é de dezembro de 2025.
- **Pagamento por cartão com retenção:** Consta na descrição atual das lojas. Quando entrou: não encontrado.
- **9 de julho de 2026 (Versão 1.0.7):** Nota de versão: "Melhorias na experiência do usuário".
- **Situação em 01/10/2026:** 1 mil+ downloads na Google Play e nenhuma avaliação na App Store. Inferência: a base pequena sugere pouca liquidez, mas não há número de usuários, pedidos ou prestadores publicado.

---

## 5. Features

| Feature | Tem? | Desde quando | Observação |
|---|---|---|---|
| Despacho / notificação de vaga | Sim | Out/2025 | Notifica profissionais por proximidade geográfica e categoria selecionada |
| Candidatura / envio de proposta | Sim | Out/2025 | Prestador envia proposta com valor e prazo |
| Seleção pelo contratante | Sim | Out/2025 | Contratante escolhe entre os perfis que enviaram orçamento |
| Check-in/check-out com geolocalização | Não | — | Confirmação depende do clique manual de "concluído" pelo cliente |
| Avaliação mútua | Parcial | Out/2025 | A descrição cita só a avaliação do profissional pelo cliente |
| Reputação visível | Sim | Out/2025 | Perfil do profissional exibe média de estrelas e fotos de trabalhos |
| Pagamento no app | Sim | Out/2025 | Processado via cartão de crédito |
| Adiantamento / saque rápido | Não | — | Liberação após confirmação de entrega do serviço |
| Seguro contra acidentes | Não | — | Sem cobertura de acidentes pessoais ou responsabilidade civil |
| Escala e recorrência | Não | — | Apenas contratações avulsas por serviço fechado |
| Equipe de confiança / favoritos | Não | — | Sem lista de favoritos ou recontratação simplificada |
| Chat integrado | Sim | Out/2025 | Chat em tempo real para envio de mensagens e alinhamento prévio |
| Verificação de identidade e antecedentes | Parcial | Out/2025 | Apenas validação básica de telefone/email; sem checagem de antecedentes |
| Gestão de equipe para empresas | Não | — | Foco estritamente B2C (cliente pessoa física para prestador) |
| Relatórios e nota fiscal | Não | — | Sem emissão automatizada de NF ou RPA |

Nota da auditoria: as linhas "Não" e "Parcial" refletem a ausência do recurso na descrição das lojas e no site; nenhum agente abriu o app. "Out/2025" é a data da primeira versão iOS, não a data comprovada de cada recurso.

---

## 6. Tração e números públicos

| Métrica | Valor | Tipo de dado | Fonte e Data |
|---|---|---|---|
| Downloads (Google Play) | 1.000+ (1 mil+) | Declarado pela loja | Google Play (01/10/2026) [4] |
| Avaliações (App Store) | 0 avaliações | Auditado via API Apple | App Store (01/10/2026) [3] |
| Avaliações (Google Play) | Sem nota exibida; 1 avaliação com texto (1 estrela, dez/2025) | Declarado pela loja | Google Play (01/10/2026) [4] |
| Usuários ativos / GMV / Diárias | Não divulgados | Não encontrado | Buscado em releases e site da empresa [5] |
| Equipe / Funcionários | 11 a 50 funcionários (Hybriun Desenvolvimento, faixa do LinkedIn; não é a equipe do app) | Declarado pela empresa | LinkedIn da desenvolvedora [8] |

---

## 7. Aquisição e crescimento (go-to-market)

- **Canais iniciais:** Não encontrado (buscado em: lojas, site `bicos.hybriun.com.br`, LinkedIn da Hybriun). Inferência: sem campanha ou rede social oficial encontrada, a descoberta deve depender da busca nas lojas, mas não há dado de origem dos usuários.
- **Geografia inicial:** Não encontrada. A única referência geográfica pública é o endereço de exemplo da captura da loja (Vitória da Conquista, BA) e a sede da desenvolvedora (Americana, SP).
- **Redes Sociais (Instagram e TikTok):** 
  - Perfil oficial não encontrado (buscado em: site do app, lojas, Instagram e TikTok). A conta `@bicosapp` no Instagram (129 seguidores e 0 publicações em 01/10/2026) se apresenta como projeto de João Pessoa com "lançamento em breve" e não tem ligação demonstrada com a Hybriun.
  - TikTok: não verificado se há criadores ou usuários falando do app (a busca do TikTok não é acessível por HTTP sem login).

---

## 8. O que os usuários dizem

- **Reclame Aqui:** Sem página. Conferido em 01/10/2026 com `curl --http1.1` e User-Agent de navegador: `reclameaqui.com.br/empresa/bicos/`, `/bicos-app/`, `/hybriun/` e `/hybriun-desenvolvimento/` devolvem 404. A busca de empresas do site não lista o app; lista um homônimo, "Bicos - A serviço da Sua Casa", de `bicosonline.com.br`. Igual ao `painel-reclame-aqui.md` [12].
- **Google Play Reviews:**
  - Queixa crítica sobre perda de acesso: *"nao consigo recuperar minha conta só via o numero do celular, porem nao tenho mais este numero... devia ter uma opcao por email"* (avaliação na Google Play, 1 estrela, dez/2025). É a única avaliação com texto do app.
  - No homônimo `com.bicos.app` há só duas avaliações com texto, ambas positivas ("otimo" e "muio bom e fácil de usar", avaliações na Google Play, set/2026).
- **Padrão geral:** Com uma única avaliação com texto, não há padrão a extrair.

---

## 9. Pontos fortes

1. **Mecanismo de Escrow (Custódia):** A retenção do pagamento no cartão de crédito até o aval do contratante protege o cliente contra abandonos de obra ou serviços incompletos.
2. **Chat Integrado com Troca de Fotos:** Permite ao prestador orçar pequenos reparos sem precisar de visita técnica prévia.
3. **Interface Limpa:** Pelas capturas da loja, fluxo direto de busca e anúncio sem questionários burocráticos (o app não foi testado).

---

## 10. Pontos fracos

1. **Base pequena:** 1 mil+ downloads na Google Play e nenhuma avaliação na App Store (downloads de iOS não são públicos). Inferência: pouca densidade para o efeito de rede local funcionar.
2. **Recuperação de Conta Frágil:** Uma avaliação (dez/2025) relata não conseguir recuperar a conta sem o número de celular antigo, embora a tela de login aceite email ou telefone. Sobre o suporte, não há dado público.
3. **Escopo Genérico Demais:** Mistura pintura, pequenos fretes, montagem de móveis e chaveiro, concorrendo contra gigantes como GetNinjas sem a mesma base instalada.
4. **Sem Verificação de Antecedentes:** Para serviços residenciais onde o profissional entra na casa do cliente, a falta de checagem documental gera barreira de adoção severa.

---

## 11. O que deu certo e o que deu errado

- **O que deu certo:** A escolha de reter o pagamento até a confirmação do serviço é a melhor prática para o mercado de reformas residenciais pontuais, eliminando o atrito de brigas sobre reembolso após a execução.
- **O que deu errado:** Não encontrado com fonte. Inferência: o app está nas lojas sem recorte de cidade e tem base pequena (1 mil+ downloads), o que sugere liquidez baixa; não há dado público de retenção ou de prestadores por cidade.

---

## 12. Ameaça e lições para o Frila

- **Nível de ameaça no DF:** **Nulo / Baixo.** O Bicos atua em serviços domésticos (manutenção predial/residencial), não atende hospitalidade/gastronomia e não há evidência pública de operação ou usuário ativo no Distrito Federal.
- **O que copiar:** A clareza visual de fotos e detalhes do trabalho antes do aceite.
- **O que evitar:** 
  1. Lançar o app nacionalmente sem liquidez local hiper-focada.
  2. Cobrar cartão de crédito com custódia pesada sem ter volume (aumenta o custo de suporte e estornos).
  3. Deixar a recuperação de conta refém apenas do chip do celular.
- **Onde o Frila é diferente:** O Frila foca no turno de trabalho de bares e restaurantes (não reformas domésticas), opera com despacho instantâneo para quem está perto (em vez de classificados lentos de orçamentos) e constrói densidade líquida exclusiva em Brasília antes de qualquer expansão.

---

## Fontes

1. CNPJ 33.004.817/0001-97 (empresário individual, nome fantasia Hybriun Systems, baixado) — [open.cnpja.com](https://open.cnpja.com/office/33004817000197) — acesso em 01/10/2026.
2. Registro do domínio `hybriun.com.br` — [rdap.registro.br](https://rdap.registro.br/domain/hybriun.com.br) — acesso em 01/10/2026.
3. Ficha oficial do Bicos app na Apple App Store (ID: 6753880443) — [apps.apple.com](https://apps.apple.com/br/app/bicos-app/id6753880443) — acesso em 01/10/2026.
4. Ficha oficial do Bicos app na Google Play Store (`app.bicos`) — [play.google.com](https://play.google.com/store/apps/details?id=app.bicos) — acesso em 01/10/2026.
5. Site do app e política de privacidade — [bicos.hybriun.com.br](https://bicos.hybriun.com.br/) e [bicos.hybriun.com.br/politica-de-privacidade](https://bicos.hybriun.com.br/politica-de-privacidade/) — acesso em 01/10/2026.
6. Captura de tela da pesquisa interna do Frila — `frila-docs/pesquisa/concorrentes/concorrente-bicos.png` — acesso em 01/10/2026.
7. Base de investimentos e startups — [crunchbase.com](https://www.crunchbase.com) — acesso em 01/10/2026.
8. Página corporativa Hybriun Desenvolvimento no LinkedIn — [br.linkedin.com/company/hybriun](https://br.linkedin.com/company/hybriun) — acesso em 01/10/2026.
9. Site do homônimo Bicos — [bicosoficial.com.br](https://bicosoficial.com.br) — acesso em 01/10/2026.
10. Ficha do homônimo na Google Play (`com.bicos.app`) — [play.google.com](https://play.google.com/store/apps/details?id=com.bicos.app) — acesso em 01/10/2026.
11. Perfil `@bicosapp` no Instagram (sem ligação demonstrada com o app) — [instagram.com/bicosapp](https://www.instagram.com/bicosapp/) — acesso em 01/10/2026.
12. Reclame Aqui, páginas de empresa testadas (HTTP 404) e busca de empresas — [https://www.reclameaqui.com.br/empresa/bicos/](https://www.reclameaqui.com.br/empresa/bicos/), [https://www.reclameaqui.com.br/empresa/hybriun/](https://www.reclameaqui.com.br/empresa/hybriun/) e [busca por "bicos"](https://iosearch.reclameaqui.com.br/raichu-io-site-search-v1/companies/search/bicos) — acesso em 01/10/2026.

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
