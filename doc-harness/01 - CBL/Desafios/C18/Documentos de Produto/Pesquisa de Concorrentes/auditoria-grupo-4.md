---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/auditoria-grupo-4.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Auditoria de fontes do Grupo 4

**Data:** 01/10/2026
**Arquivos auditados:** `bicos.md`, `biko.md`, `trampei.md`, `jobhunter.md`, `meu-freelance.md` e `grupo-4-sintese.md`.
**Método:** cada número, data, preço, nome de empresa, CNPJ e afirmação factual relevante foi conferido por HTTP na fonte primária, sem navegador e sem abrir os apps:

- App Store: API `itunes.apple.com/lookup` e página `apps.apple.com` (versão, data de lançamento, compras no app, copyright);
- Google Play: página pública e as avaliações públicas, lidas pelo mesmo endpoint que a página usa (data, nota e texto de cada avaliação; nomes de quem avaliou não foram transcritos);
- CNPJ: `open.cnpja.com` e `brasilapi.com.br`;
- domínios: RDAP do Registro.br, `whois.registro.br` e RDAP da Verisign;
- sites oficiais, inclusive o FAQ e o rodapé servidos pelo site `biko.net.br`, `app-ads.txt`, LinkedIn público, perfis públicos do Instagram (meta-descrição) e do TikTok;
- documentos do próprio repositório (`painel-df-e-lojas.md`, `Frila_Varredura_2026-09-20.md`, `produto/`) e as capturas em `pesquisa/concorrentes/`.

**Situações:** **Confirmada** (a fonte diz aquilo), **Corrigida** (o dado certo, com a fonte) e **Removida** (sem sustentação: trocada por "não encontrado (buscado em: …)", "não verificado" ou retirada).

## Tabela

| arquivo | afirmação | situação | fonte ou motivo |
|---|---|---|---|
| bicos.md | Pacote `app.bicos`, ID Apple 6753880443, desenvolvedor Hybriun Desenvolvimento LTDA | Confirmada | iTunes lookup e Google Play |
| bicos.md | Homônimo `com.bicos.app` (site `bicosoficial.com.br`), sem intermediar pagamento | Confirmada | Google Play e site: "O Bicos não segura nem transfere dinheiro" |
| bicos.md | Homônimo sem versão iOS | Confirmada | Busca na App Store BR por "bicos" e pelo desenvolvedor "Fluture Dev": nada encontrado |
| bicos.md | CNPJ 33.004.817/0001-97, "baixado", da Hybriun Desenvolvimento LTDA | Corrigida | É outra empresa: empresário individual de Vitor Facioli, nome fantasia "Hybriun Systems", aberto em 12/03/2019 e baixado em 03/02/2020 (open.cnpja.com). CNPJ da LTDA: não encontrado |
| bicos.md | Vitor Facioli "sócio-administrador desde abril/2020" (Jucesp) | Corrigida | Sem fonte. O domínio `hybriun.com.br` está em nome dele desde 02/03/2016 (Registro.br); o e-mail de suporte do app é dele (Google Play) |
| bicos.md | Sede em Americana-SP | Confirmada | Endereço do desenvolvedor na Google Play; LinkedIn da Hybriun |
| bicos.md | App lançado em outubro de 2025 | Confirmada | iTunes lookup: `releaseDate` 12/10/2025 |
| bicos.md | iOS com 0 avaliações | Confirmada | iTunes lookup |
| bicos.md | Android com nota 4,2 (1 avaliação) | Corrigida | A Google Play não exibe nota (o painel também marca S/N); a única avaliação com texto é de 1 estrela (dez/2025) |
| bicos.md | 1 mil+ downloads | Confirmada | Google Play |
| bicos.md | Cobertura no interior paulista e na Bahia, "DDD 71/77" | Corrigida | Não declarada. A captura mostra endereço de exemplo em Vitória da Conquista e telefone fictício "(71) 9999-9999"; DDD 77 não aparece |
| bicos.md | Prestadores incluem "diaristas" | Corrigida | A descrição lista limpeza pós-obra e jardinagem, não diaristas |
| bicos.md | Categorias (eletricista, encanador, chaveiro, ar-condicionado, pedreiro, pintor, marceneiro, montagem, fretes) | Confirmada | Descrição na App Store |
| bicos.md | Investimento: projeto *bootstrapped* ("pesquisa de mercado") | Corrigida | Sem fonte; reescrito como inferência rotulada |
| bicos.md | Usuário pode alternar entre cliente e prestador | Corrigida | Recurso descrito no homônimo `com.bicos.app`, não no `app.bicos`; marcado como não verificado |
| bicos.md | Pagamento no app por cartão, liberado só após confirmação do cliente | Confirmada | Descrição nas duas lojas |
| bicos.md | Cadastro gratuito para o profissional | Confirmada | Descrição: "Cadastre-se gratuitamente" |
| bicos.md | Avaliação mútua (bidirecional) | Corrigida | A descrição só cita a avaliação do profissional pelo cliente |
| bicos.md | Take rate "estimado no padrão de gateways de 5% a 15%" | Removida | Estimativa sem fonte. Não divulgado (buscado em: lojas, site, política de privacidade) |
| bicos.md | "Intermediadora pura; autônomos ou MEI; sem recolhimento previdenciário" | Removida | Não encontrado (buscado em: lojas, site, política de privacidade) |
| bicos.md | Lançamento "tentando digitalizar orçamentos em cidades médias (Vitória da Conquista e interior paulista)" | Removida | Sem fonte |
| bicos.md | "Início de 2026: adição do pagamento com escrow" | Removida | Sem fonte; o pagamento consta na descrição atual, data não encontrada |
| bicos.md | Versão 1.0.7 em julho de 2026, melhorias de UX | Confirmada | iTunes lookup: 09/07/2026, "Melhorias na experiência do usuário" |
| bicos.md | "Sem expansão de marketing ou presença em capitais" | Removida | Sem fonte |
| bicos.md | "Problema de ovo e galinha… sem investimento de aquisição" | Corrigida | Reescrito como inferência a partir da base de 1 mil+ downloads |
| bicos.md | Equipe de "2 a 10 funcionários", "estimativa setorial" | Corrigida | LinkedIn da Hybriun declara 11 a 50 funcionários (dado da empresa, não do app) |
| bicos.md | Tráfego "quase exclusivamente" de ASO | Removida | Sem fonte; trocado por "não encontrado" com inferência rotulada |
| bicos.md | `@bicosapp` no Instagram com 129 seguidores e 0 posts, como conta do app | Corrigida | Números conferem, mas a bio fala em João Pessoa e "lançamento em breve"; sem ligação demonstrada com a Hybriun |
| bicos.md | TikTok sem influenciadores nem UGC | Removida | Não verificável por HTTP sem login; marcado como não verificado |
| bicos.md | Sem página no Reclame Aqui, "típico de apps com menos de 10 mil downloads" | Removida | Reclame Aqui bloqueou o acesso (403/Cloudflare); generalização sem fonte |
| bicos.md | Citação sobre recuperar a conta sem o número antigo | Confirmada | Google Play, 1 estrela, dez/2025 (data acrescentada) |
| bicos.md | Citações do homônimo: "não tem serviço pra minha área", "o app é uma casca vazia" | Removida | Não existem. As duas avaliações com texto do `com.bicos.app` são positivas ("otimo", "muio bom e fácil de usar") |
| bicos.md | "Padrão geral: fricção no login por SMS, ausência de suporte, abandono" | Removida | Há uma única avaliação com texto; não há padrão |
| bicos.md | "Componentes nativos rápidos" | Removida | Afirmação técnica sem fonte; ninguém abriu o app |
| bicos.md | "Menos de 2 mil downloads combinados" | Corrigida | Downloads de iOS não são públicos; só há o 1 mil+ da Google Play |
| bicos.md | "Suporte inexistente; autenticação exclusiva por telefone, sem e-mail" | Corrigida | A tela de login aceita e-mail ou telefone (captura); sobre suporte não há dado |
| bicos.md | "99% dos usuários encontram lista vazia e desinstalam no mesmo dia"; "expandiu para todo o Brasil" | Removida | Número inventado; sem fonte para a expansão |
| bicos.md | Linhas "Não/Parcial" e datas "Out/2025" da tabela de features | Corrigida | Nota acrescentada: baseadas na descrição das lojas; a data é da 1ª versão iOS |
| bicos.md | Fontes [1], [2] e [8] genéricas (Serasa, advdinamico, linkedin.com) | Corrigida | Trocadas pelas URLs consultadas (open.cnpja.com, RDAP do Registro.br, página do LinkedIn) |
| biko.md | Pacote `br.net.biko.app`, ID 6764218550, publicado por "Andrea Camargo" (iOS) e "BIKOAPP" (Android) | Confirmada | iTunes lookup e Google Play |
| biko.md | Domínio `biko.net.br` da BRK Negócios LTDA, CNPJ 07.025.126/0001-60, São Paulo | Confirmada | RDAP do Registro.br; open.cnpja.com |
| biko.md | Empresa do app = BRK Negócios LTDA | Corrigida | Operadora: BIKO Tecnologia e Serviços LTDA, CNPJ 65.637.139/0001-96, aberta em 11/03/2026 (rodapé do site, copyright da App Store, open.cnpja.com) |
| biko.md | Fundadores: Renato Portolese Baruki e Andrea Camargo | Corrigida | Sócios: Renato Portolese Baruki (administrador), Cleber Camargo da Silva Ferreira (sócio-administrador, desenvolvedor na Google Play) e BRK Participações LTDA. "Andrea Camargo" é só a conta da App Store |
| biko.md | Lançado em junho de 2026 | Corrigida | Android com avaliações desde 22/11/2025; iOS em 03/06/2026. O FAQ ainda diz "App Android (em breve iOS)" |
| biko.md | Sede em São Paulo | Corrigida | Barueri-SP, Alameda Rio Negro, Alphaville (CNPJ e rodapé do site) |
| biko.md | iOS 4,3 (4 avaliações); Android 3,5 (50) | Confirmada | iTunes lookup (4,25); Google Play (3,46) |
| biko.md | 1 mil+ downloads | Confirmada | Google Play |
| biko.md | "Foco declarado em São Paulo e região metropolitana" | Corrigida | Nada declarado. Indícios: vaga de exemplo na captura, telefone DDD 11, sede em Barueri |
| biko.md | Quem contrata: congressos, feiras, buffets, restaurantes, estacionamentos | Corrigida | FAQ: restaurantes, supermercados, eventos, logística, serviços gerais, estacionamentos, hotéis, *facilities*, atendimento |
| biko.md | Funções (garçom, manobrista, atendente, motoboy etc.) | Confirmada | Descrição nas lojas |
| biko.md | BRK com "atuação histórica em estacionamentos e facilities"; app "financiado com capital próprio" | Removida | A BRK é uma holding (CNAE 6462-0/00); financiamento não encontrado |
| biko.md | Biko Brasil (pacote, ID, Rodrigo Grodzicki, ago/2026) | Confirmada | iTunes lookup (20/08/2026); Google Play |
| biko.md | Biko Brasil voltado a "repositores de supermercados e promotores de vendas" | Corrigida | A descrição fala só de tarefas de repositor |
| biko.md | Captura: "Recepção VIP – Congresso…", São Paulo, contagem `04-14-34-52`, média 4.8, "BIKOs Concluídos" | Confirmada | `concorrente-biko.png` (a contagem é D-H-M-S) |
| biko.md | Perfil exibe "histórico de pontualidade" | Removida | Não aparece na captura nem no FAQ |
| biko.md | Taxa "embutida na fatura B2B", "varia conforme o pacote corporativo" | Corrigida | FAQ: diária "acrescida por % de taxa de serviço negociada"; pagamento por créditos pré-pagos via PIX (código do site); percentual não publicado |
| biko.md | Taxa da empresa não é descontada do valor do trabalhador | Confirmada | FAQ: a taxa é acrescida à diária |
| biko.md | "Cadastro gratuito para o trabalhador" | Corrigida | O FAQ não fala disso; o painel do site tem um campo "Taxa de Serviço (Candidato)" |
| biko.md | PIX "muitas vezes em minutos após o check-out" | Corrigida | FAQ: a empresa tem até 1 dia útil para liberar; depois, o PIX cai "em poucos minutos" |
| biko.md | Sem seguro de acidentes | Confirmada | FAQ: "não fornece seguro ou cobertura para acidentes" |
| biko.md | Vínculo "autônomo / MEI eventual" | Corrigida | FAQ: só pessoa física, sem CNPJ; alerta sobre vínculo por habitualidade |
| biko.md | Domínio registrado em agosto de 2024 | Confirmada | RDAP: 29/08/2024 |
| biko.md | Domínio criado "para suprir demanda de eventos e estacionamentos em São Paulo" | Removida | Motivo sem fonte |
| biko.md | Instabilidade e "vácuo" em julho a setembro de 2026 | Corrigida | Tela branca em abril de 2026; "vácuo" em junho e agosto; notificações de junho a setembro (Google Play) |
| biko.md | "Operação restrita ao mercado de eventos de São Paulo capital" | Removida | Sem fonte |
| biko.md | Coluna "Desde quando" = Jun/2026 em todos os recursos | Corrigida | O Android existe desde nov/2025; datas por recurso não encontradas |
| biko.md | Adiantamento / saque rápido: "Sim" | Corrigida | Parcial: não há adiantamento; avaliações divergem ("menos de 20 minutos", "24 horas", "demora a pagar") |
| biko.md | Equipe de confiança / favoritos: "Não" | Corrigida | FAQ: a empresa favorita, marca com *tags* e publica "Biko Privado" para candidatos escolhidos |
| biko.md | Verificação: "exige envio de documentos" | Corrigida | Loja: "Verificação de identidade"; FAQ: facial opcional, contratada pela empresa; documentos e antecedentes não encontrados |
| biko.md | Relatórios: "extrato de pagamentos" | Corrigida | FAQ: relatório em Excel |
| biko.md | Escala e recorrência pela contagem regressiva e filiais | Corrigida | FAQ admite recontratação e "Biko Privado", com alerta de habitualidade |
| biko.md | Vendas B2B diretas da BRK; aquisição por grupos de WhatsApp e boca a boca | Removida | Sem fonte; marcado como não encontrado |
| biko.md | "Sem canal com tração no TikTok"; "presença em redes muito tímida" | Corrigida | Instagram `@biko.net.br`: 5.588 seguidores e 131 posts; TikTok `@bikoapp`: 35 vídeos e 3 seguidores (01/10/2026) |
| biko.md | "A fundadora Andrea Camargo avaliou o próprio app com 5 estrelas" | Corrigida | Há uma avaliação de 5 estrelas (22/11/2025) de uma conta com o mesmo nome da conta da App Store; não dá para confirmar a identidade, e "fundadora" não tem fonte |
| biko.md | "Sem reclamações no Reclame Aqui" | Removida | Não verificável: 403/Cloudflare |
| biko.md | 6 citações de avaliações | Confirmada | Textos conferidos na Google Play; acrescentado mês/ano |
| biko.md | Citação do "vácuo" com o trecho sobre o mapa parafraseado entre aspas | Corrigida | Trocada pelo texto literal, com supressões marcadas |
| biko.md | PIX "em menos de 20 a 30 minutos" | Corrigida | Uma avaliação fala em "menos de 20 minutos"; "30" não tem fonte |
| biko.md | Contagem regressiva "reduz o esquecimento e o no-show" | Corrigida | Rotulado como inferência; sem dado |
| biko.md | "Dezenas de candidatos" sem resposta | Corrigida | Sem número; relatos de jun e ago/2026 |
| biko.md | Tela branca "resultou na queda da nota para 3,5" | Corrigida | Causa não medida; não há histórico da nota |
| biko.md | Retenção de 5 anos "sem explicar a base legal" | Corrigida | O site justifica ("obrigações legais e proteção em processos judiciais", LGPD); queixas de "golpe" em abr e mai/2026 |
| biko.md | "Não automatizar o encerramento: candidatos continuam se candidatando" | Corrigida | FAQ: a vaga preenchida passa a aparecer só para os aprovados; a falha é a falta de aviso |
| biko.md | PIX como recurso mais elogiado nas avaliações 5 estrelas | Confirmada | A maioria das avaliações 5 estrelas cita pagamento rápido |
| biko.md | "Trabalha hoje e recebe hoje" | Corrigida | Até 1 dia útil (FAQ) |
| biko.md | Fonte [5] misturava `biko.net.br` com `bikobrasil.com.br` (homônimo); fonte [2] genérica | Corrigida | Separadas; URLs do open.cnpja.com |
| trampei.md | Gustavo Aparecido Barreto Lima, domínio em CPF registrado em março de 2025 | Confirmada | RDAP do Registro.br: 12/03/2025 |
| trampei.md | CNPJ 41.850.861/0001-46, ME, baixado | Confirmada | open.cnpja.com: empresário individual, Presidente Prudente-SP, aberto em 06/05/2021, baixado em 15/07/2021 (detalhes acrescentados) |
| trampei.md | Lançado nas lojas em dezembro de 2025 | Corrigida | iOS em 02/12/2025 confirmado; estreia na Google Play não encontrada (avaliações desde mar/2026) |
| trampei.md | Sede em São Paulo, SP | Corrigida | Santo Anastácio-SP (endereço do desenvolvedor na Google Play; o painel também diz isso) |
| trampei.md | Site `trampeiservicos.com.br` inacessível | Confirmada | HTTP 302 para `/cgi-sys/suspendedpage.cgi`, servidores de nome HostGator |
| trampei.md | iOS 4,0 (2); Android 3,2 (16); 5 mil+ downloads | Confirmada | iTunes lookup; Google Play |
| trampei.md | Três tipos de conta no onboarding | Confirmada | `concorrente-trampei.png` |
| trampei.md | Categorias "da descrição da Google Play" (reparos, pintura, marcenaria, diaristas etc.) | Corrigida | A descrição não lista categorias; a App Store diz "desde pequenos reparos até grandes projetos" |
| trampei.md | Investimento: projeto *bootstrapped* | Corrigida | Rotulado como inferência |
| trampei.md | Profissional compra "moedas/créditos" para responder pedidos | Corrigida | A App Store lista só duas assinaturas: Plano Profissional R$ 29,90 e Plano Empresarial R$ 99,90; o que liberam não é publicado |
| trampei.md | Quem paga: só o profissional; "monetiza exclusivamente leads e assinaturas do profissional" | Corrigida | Profissional e empresa (Plano Empresarial) |
| trampei.md | Modelo "inspirado no GetNinjas"; posicionamento "alternativa mais acessível ao GetNinjas" | Corrigida | Rotulado como inferência; o posicionamento declarado não foi encontrado |
| trampei.md | Negociação por chat ou WhatsApp; pagamento fora do app | Corrigida | As lojas não descrevem; marcado como não verificado/inferência |
| trampei.md | "Fevereiro a maio de 2026: expansão para empresas" | Removida | Sem fonte; data de criação do perfil empresa não encontrada |
| trampei.md | Versão "versao autenticacao" de 19/09/2026, correção do token | Confirmada | iTunes lookup |
| trampei.md | "Página não encontrada / erro de hospedagem" | Corrigida | É a página de conta suspensa da hospedagem; o domínio segue ativo até 12/03/2027 |
| trampei.md | "Nota caiu para 3,2 com reclamações frequentes" | Corrigida | Nota 3,2; sem histórico. Entre 11 avaliações com texto: 2 sobre login/senha e 1 sobre exclusão |
| trampei.md | ASO para "trampo", "bicos" | Removida | Sem fonte |
| trampei.md | "Conta institucional no Instagram e TikTok sem postagens" | Corrigida | Perfil oficial não encontrado: `@trampei` no Instagram é de outro projeto; `@trampeiservicos` não retornou perfil; não há TikTok |
| trampei.md | E-mail de suporte pessoal | Confirmada | Google Play |
| trampei.md | "Sem registros no Reclame Aqui" | Removida | Não verificável: 403/Cloudflare |
| trampei.md | 7 citações de avaliações | Confirmada | Google Play; uma corrigida para o texto literal ("no aff", não "no app"); mês/ano acrescentado |
| trampei.md | "5.000+ downloads orgânicos" e "forte apelo do nome" | Corrigida | Origem dos downloads não medida |
| trampei.md | "Aquisição orgânica de mais de 5 mil prestadores sem mídia paga" | Corrigida | Downloads não são prestadores; mídia paga não verificada |
| trampei.md | Serralheiros e marceneiros sem pedidos | Corrigida | Só há relato de serralheria |
| trampei.md | "Versão mal nomeada indica ausência de pipeline" | Corrigida | Rotulado como inferência |
| trampei.md | "RN14 do Frila (custo zero ao profissional)" | Corrigida | A RN14 trata de verificação progressiva de identidade (`api/openapi.yaml`, varredura); o custo zero está em `produto/04-MERCADO-E-CONCORRENCIA.md` |
| trampei.md | Login/senha é "o motivo número um" das avaliações de 1 estrela | Corrigida | 3 das 6 avaliações de 1 estrela com texto |
| trampei.md | Datas "Fev/2026" e "Dez/2025" na tabela de features; candidatura "exige créditos" | Corrigida | Data sem fonte retirada; nota de auditoria acrescentada |
| trampei.md | Fonte [2] genérica (gov.br) | Corrigida | URL do open.cnpja.com |
| jobhunter.md | Razão social e CNPJ 62.294.994/0001-53 (MEI), Uberlândia-MG | Confirmada | open.cnpja.com |
| jobhunter.md | Domínio registrado em 18/05/2024 via Hostinger | Confirmada | RDAP da Verisign |
| jobhunter.md | CNPJ aberto em 19/08/2025 | Confirmada | open.cnpja.com |
| jobhunter.md | Apps lançados em abril de 2026 (versão 1.0 em 14/04/2026) | Corrigida | Só o iOS é de 14/04/2026. O Android tem avaliações desde 06/09/2024; em set/2024 o desenvolvedor declarava "mais de 1500 usuários" |
| jobhunter.md | Plataformas: iOS, Android, web e portal | Confirmada | Lojas; `jobhunterbr.com`; `home.jobhunterbr.com` |
| jobhunter.md | iOS 0 avaliações; Android 4,3 (164); 10 mil+ downloads | Confirmada | iTunes lookup; Google Play |
| jobhunter.md | Polos em Uberlândia e Goiânia; 240+ cidades; 27 estados; 52 mil cadastrados (declarado) | Confirmada | `home.jobhunterbr.com` |
| jobhunter.md | Top 3: Uberlândia, São Paulo, Goiânia | Confirmada | `home.jobhunterbr.com` |
| jobhunter.md | Quem contrata: bares, buffets, salões de festas; quem trabalha inclui "chapistas" | Corrigida | Site: restaurantes, produtoras de eventos, comércios, condomínios; funções sem chapista |
| jobhunter.md | Captura: garçom para evento, R$ 150, Salão Jardim das Flores, marmitex, "Me candidatar!" | Confirmada | `concorrente-jobhunter.png` |
| jobhunter.md | Publicação em cerca de 2 minutos | Confirmada | Site: "Publique sua vaga em 2 minutos" |
| jobhunter.md | Vagas enviadas a grupos de WhatsApp "geridos pela equipe" | Corrigida | O site cita grupos ativos em BH, SP, Fortaleza, Curitiba e RJ; quem administra não é publicado |
| jobhunter.md | Contato liberado "ao aceitar o candidato" | Corrigida | Google Play: contato pelo WhatsApp "liberado assim que você se candidata" (o contratante pode ocultar o número) |
| jobhunter.md | "Contratou. Combinou no WhatsApp."; não toca no dinheiro | Confirmada | Site |
| jobhunter.md | Pagamento "geralmente via PIX ao final do turno" | Removida | Sem fonte |
| jobhunter.md | "100% grátis… sem plano premium"; "Nossa receita vem de anúncios" | Confirmada | FAQ do site |
| jobhunter.md | Anúncios "AdMob/Google AdSense" | Corrigida | O `app-ads.txt` lista Google, Meta e Tappx; a Google Play marca "Contém anúncios" |
| jobhunter.md | Stack Flutter / FlutterFlow | Corrigida | Flutter confirmado no app web; FlutterFlow rotulado como inferência pelo nome do pacote |
| jobhunter.md | Grupos de WhatsApp criados em julho e agosto de 2026 | Corrigida | Avaliações de jan e fev/2025 já citam vagas pelo WhatsApp; data de criação não encontrada |
| jobhunter.md | "33 mil cadastrados em 20/09/2026, conforme varredura prévia" | Corrigida | A varredura não cita o JobHunter; o número está em `produto/04-MERCADO-E-CONCORRENCIA.md`, com acesso em 14/09/2026 |
| jobhunter.md | Versão 1.4.2 em 28/09/2026, mais rápida | Confirmada | iTunes lookup |
| jobhunter.md | Coluna "Desde quando" = Abr/2026; avaliação mútua "Sim" | Corrigida | Datas retiradas (Android desde 2024); só o contratante avalia o freelancer (Google Play) |
| jobhunter.md | Verificação básica por telefone e moderação de denúncias | Confirmada | Site (SMS do contratante) e Google Play (telefone e e-mail validados) |
| jobhunter.md | Instagram com 3.515 seguidores e 76 posts | Confirmada | Meta-descrição pública do perfil `@jobhunterapp` |
| jobhunter.md | Instagram publica "carrosséis com vagas do dia, dicas e memes" | Removida | Não verificável sem login |
| jobhunter.md | WhatsApp como "canal mais eficiente do setor no interior", "dezenas de candidatos" | Removida | Sem fonte |
| jobhunter.md | "Sem reclamações no Reclame Aqui" | Removida | Não verificável: 403/Cloudflare |
| jobhunter.md | 7 citações de avaliações | Confirmada | Google Play; mês/ano acrescentado; uma recebeu "na vaga", que faltava no texto |
| jobhunter.md | Resposta do desenvolvedor: "quando é preenchida o anúncio desaparece" | Corrigida | A frase é de outro usuário; o desenvolvedor disse que a vaga "havia sido fechada pelo contratante" |
| jobhunter.md | "Maior tração orgânica, impulsionada pela taxa zero" | Corrigida | Causa não medida; 32 avaliações 5 estrelas em 14/01/2025 e 20 em 27/02/2025 pesam na nota 4,3 |
| jobhunter.md | Uberlândia e Goiânia "fora das capitais" | Corrigida | Goiânia é capital de Goiás |
| jobhunter.md | Anúncios "geram centavos por usuário ativo" | Corrigida | Estimativa sem fonte; rotulada como inferência |
| jobhunter.md | "Fórmula de crescimento mais rápida"; campo de alimentação "gerou identificação imediata"; contratante "nunca mais volta" | Corrigida | Sem dado; o JobHunter está no ar desde 2024, antes dos outros; rotulado como inferência |
| jobhunter.md | "Segunda maior praça é Goiânia" | Corrigida | 3ª na lista do site, que diz que o app está "mais forte" em Uberlândia e Goiânia |
| jobhunter.md | Goiânia a cerca de 200 km de Brasília | Confirmada | Distância rodoviária pela BR-060, de cerca de 210 km (dado geográfico, não de fonte do concorrente) |
| jobhunter.md | Investimento: "*bootstrapped* / microempresa" | Corrigida | MEI com capital de R$ 100 (open.cnpja.com); "sem investimento externo" rotulado como inferência |
| jobhunter.md | Fonte [1] genérica (gov.br) | Corrigida | URL do open.cnpja.com; acrescentadas `app-ads.txt` e `produto/04` |
| meu-freelance.md | MEU FREELANCE TECNOLOGIA LTDA, CNPJ 63.358.264/0001-31, Thiago Gregorio Oliveira, Niterói-RJ | Confirmada | BrasilAPI; Google Play |
| meu-freelance.md | Domínio registrado em setembro de 2025 por Thiago Gregorio Oliveira | Confirmada | RDAP: 10/09/2025 |
| meu-freelance.md | Empresa formalizada e apps lançados em abril de 2026 | Corrigida | CNPJ aberto em 24/10/2025; Android publicado até 29/03/2026; iOS em 15/04/2026 |
| meu-freelance.md | Domínio `on-hold`, expirado em 10/09/2026; site fora do ar | Confirmada | `whois.registro.br` (status on-hold, expires 20260910); HTTP sem resposta |
| meu-freelance.md | iOS 0 avaliações; Android 1,5 (6); 1 mil+ downloads | Confirmada | iTunes lookup; Google Play |
| meu-freelance.md | Público: empresas de eventos; animadores e recreadores | Corrigida | A loja é genérica: clientes e freelancers, autônomos, renda extra |
| meu-freelance.md | Categorias: recreação, buffet, apoio operacional, atendimento | Corrigida | Só "Recreação" aparece na captura |
| meu-freelance.md | Módulos Locais, Candidaturas, Agenda, Suporte; "Complete seu perfil 83%"; vaga em Goiânia | Confirmada | `concorrente-meu-freelance.png` |
| meu-freelance.md | "Modelo teórico previa comissão ou mensalidade" | Removida | Sem fonte |
| meu-freelance.md | "Nenhum valor é cobrado; 100% gratuito" | Corrigida | A Google Play indica "Compras no aplicativo" |
| meu-freelance.md | Android "construído por desenvolvedor terceirizado" | Corrigida | Rotulado como inferência pelo nome do pacote, que é o mesmo no iOS |
| meu-freelance.md | "Maio a julho de 2026: anúncios-teste em Goiânia" | Removida | Sem fonte; a captura é anterior (ficha iOS de abril) |
| meu-freelance.md | "Congelamento por inadimplência… quebrando endpoints dependentes da web" | Corrigida | Expirou sem renovação; quebra de endpoints não verificada (retirada) |
| meu-freelance.md | Nota "desabou" para 1,5, "a mais baixa de todo o levantamento" | Corrigida | Sem histórico; é a mais baixa entre as notas da Google Play no painel (na App Store, o 99Freelas tem 1,12) |
| meu-freelance.md | "Dezenas de queixas"; "unanimidade negativa"; "relato unânime de zero vagas" | Corrigida | São 6 avaliações: 5 de 1 estrela e 1 de 4; 3 relatam falta de vagas |
| meu-freelance.md | Coluna "Desde quando" = Abr/2026; avaliação "inoperante por falta de uso" | Corrigida | Android já estava no ar em março; o uso da avaliação não foi verificado |
| meu-freelance.md | Instagram `@meufreelance` com 8 seguidores e 1 publicação | Confirmada | Meta-descrição pública; o perfil linka `meufreelance.com.br` |
| meu-freelance.md | Perfil "paralisado"; "não houve estratégia de parcerias; fundador tentou atrair trabalhadores sem contratantes" | Removida | Sem fonte |
| meu-freelance.md | "Sem registros no Reclame Aqui" | Removida | Não verificável: 403/Cloudflare |
| meu-freelance.md | 4 citações com o nome de quem avaliou | Corrigida | Nomes retirados; textos conferidos e trocados pelo literal, com nota e mês/ano |
| meu-freelance.md | Citação apresentada como "ironia" | Corrigida | É uma avaliação de 4 estrelas, sincera; texto literal restaurado |
| meu-freelance.md | "Acerto conceitual raro" (Agenda); barra de progresso "aumenta o enriquecimento" | Corrigida | Raridade e efeito não medidos; rotulados |
| meu-freelance.md | "Abandono total, sem suporte, zero vagas" | Corrigida | Sinais: domínio expirado, uma queixa de atendimento, relatos de falta de vagas |
| meu-freelance.md | Bug de e-mail "já cadastrado" | Confirmada | Duas avaliações (mai e set/2026) |
| meu-freelance.md | Falta de exclusão de conta = "violação direta das diretrizes da Apple e da LGPD" | Corrigida | Baseado em uma avaliação; não verificado no app |
| meu-freelance.md | "Abrir para o Brasil inteiro sem um único cliente" | Corrigida | Rotulado como inferência |
| meu-freelance.md | "Aplicativo inoperante" | Corrigida | Continua nas lojas; trocado por "sinais de abandono" |
| meu-freelance.md | "Liquidez garantida pelo modelo de pilotos" do Frila | Corrigida | O plano prevê piloto (`produto/05-ESCOPO-DO-MVP.md`); a liquidez não está garantida |
| meu-freelance.md | Investimento: "microempresa individual" | Corrigida | LTDA de porte micro, 1 sócio, capital de R$ 50 mil (BrasilAPI) |
| grupo-4-sintese.md | Links `file:///` para a pasta de outro worker | Corrigida | Trocados por links relativos (`jobhunter.md` etc.) |
| grupo-4-sintese.md | Sedes em "Americana, São Paulo, Uberlândia e Niterói"; operações *bootstrapped* | Corrigida | Americana, Barueri, Santo Anastácio, Uberlândia e Niterói; investimento não encontrado |
| grupo-4-sintese.md | "Lançamentos concentrados entre o fim de 2025 e o primeiro semestre de 2026" | Corrigida | O JobHunter está no Android desde 2024 |
| grupo-4-sintese.md | "Três apps sucumbiram" (Bicos, Trampei, Meu Freelance) | Corrigida | Bicos e Trampei tiveram atualizações em 2026; só o Meu Freelance mostra sinais claros de abandono |
| grupo-4-sintese.md | Termos "bicos", "trampo", "freela descomplicado", "sem pegadinha" | Confirmada | Lojas; meta-descrição do app web do JobHunter ("Seu Freela Descomplicado") |
| grupo-4-sintese.md | Tabela: Bicos com take rate no cartão, cobertura SP/BA e nota 4,2 | Corrigida | Taxa não divulgada; cobertura não declarada; sem nota no Android |
| grupo-4-sintese.md | Tabela: BIKO de BRK/Andrea Camargo, "fatura B2B", "repasse instantâneo", foco em SP | Corrigida | BIKO Tecnologia; créditos pré-pagos e % negociado; até 1 dia útil; cobertura não declarada |
| grupo-4-sintese.md | Tabela: Trampei cobra do profissional "créditos/moedas para ver vagas" | Corrigida | Planos Profissional (R$ 29,90) e Empresarial (R$ 99,90) |
| grupo-4-sintese.md | Tabela: JobHunter monetiza "exclusivamente via Google AdMob" | Corrigida | Anúncios de Google, Meta e Tappx (`app-ads.txt`) |
| grupo-4-sintese.md | Tabela: Meu Freelance cobre "Goiânia e Rio de Janeiro"; "sem cobrança ativa" | Corrigida | Cobertura não declarada; compras no app na Google Play |
| grupo-4-sintese.md | Tabela: downloads, notas e pacotes dos outros apps | Confirmada | Lojas (iguais ao painel) |
| grupo-4-sintese.md | JobHunter "comprova" que gratuidade gera "tração explosiva… em poucos meses" | Corrigida | São cerca de dois anos no Android; causa não medida; concentração de avaliações |
| grupo-4-sintese.md | BIKO paga "em menos de 20 a 30 minutos"; "gera retenção espontânea" | Corrigida | Uma avaliação fala em 20 minutos, outra em 24 h; retenção não medida |
| grupo-4-sintese.md | Contagem regressiva "ancora psicologicamente" contra no-show | Corrigida | Rotulado como inferência |
| grupo-4-sintese.md | Diária de "R$ 140 a R$ 180" | Removida | Faixa sem fonte; trocada pela referência à CCT do DF |
| grupo-4-sintese.md | CCT do DF obriga refeição gratuita no buffet | Confirmada | `Frila_Varredura_2026-09-20.md`, §2.1 |
| grupo-4-sintese.md | "Milhares de downloads… Meu Freelance e Bicos sofreram o cemitério" | Corrigida | Meu Freelance documentado (1 mil+, 3 de 6 relatos de falta de vagas); Bicos sem dado |
| grupo-4-sintese.md | Citação "tem que colocar dinheiro pra não achar nada" | Corrigida | A avaliação diz só "tem que colocar dinheiro ,"; trecho acrescentado pelo autor |
| grupo-4-sintese.md | Cobrança "derrubando a nota para 3,2 e matando a retenção" | Corrigida | Causa não medida |
| grupo-4-sintese.md | "Dezenas de candidatos por vaga"; "10 a 20 pessoas… por horas" | Corrigida | Sem fonte; a captura do JobHunter mostra 7 candidatos |
| grupo-4-sintese.md | Trampei com "erro 404" na HostGator | Corrigida | Página de conta suspensa |
| grupo-4-sintese.md | BIKO retém dados "sem explicação da base legal" | Corrigida | O site explica; as queixas são sobre excluir a conta |
| grupo-4-sintese.md | "JobHunter conquistou engajamento porque…"; "BIKO combate a abstenção" | Corrigida | Efeito não medido |
| grupo-4-sintese.md | "RN14 do Frila = custo zero para o profissional" (título e texto da Lição 3) | Corrigida | A RN14 é verificação progressiva de identidade; o custo zero está em `produto/04` |
| grupo-4-sintese.md | Trampei "coleciona avaliações 1 estrela"; JobHunter "atingiu 52 mil usuários" | Corrigida | 6 de 11 avaliações com texto são de 1 estrela; 52 mil é número declarado |
| grupo-4-sintese.md | Meu Freelance "tentou abranger todo o Brasil e faliu" | Corrigida | A empresa está ativa na Receita; abrangência nacional não declarada |
| grupo-4-sintese.md | Agenda "único recurso elogiado" do Meu Freelance | Corrigida | Nenhuma avaliação elogia a Agenda |
| grupo-4-sintese.md | Ameaça: JobHunter com "52k usuários", Goiânia "segundo maior polo"; BIKO "confinado a São Paulo"; Trampei "créditos" | Corrigida | Declarado; 3ª cidade; cobertura não declarada; assinatura |
| grupo-4-sintese.md | Desintermediação: "trocam telefones e fecham por fora" | Corrigida | Rotulado como inferência |
| grupo-4-sintese.md | Conclusão: "cemitério de plataformas abandonadas"; BIKO "PIX instantâneo" e "abrangência comercial" | Corrigida | Quatro dos cinco apps tiveram atualização em 2026; PIX rápido; base pequena |

## Resumo

| Situação | bicos | biko | trampei | jobhunter | meu-freelance | síntese | Total |
|---|---|---|---|---|---|---|---|
| Confirmadas | 12 | 12 | 8 | 16 | 7 | 3 | **58** |
| Corrigidas | 15 | 29 | 19 | 17 | 18 | 26 | **124** |
| Removidas | 12 | 6 | 3 | 4 | 4 | 1 | **30** |
| **Total** | 39 | 47 | 30 | 37 | 29 | 30 | **212** |

Cada linha da tabela conta uma vez, mesmo quando agrupa afirmações do mesmo tipo (por exemplo, "6 citações de avaliações"). Quase dois terços das afirmações precisaram de correção. Os erros mais graves foram: empresa, sócios, sede e data de lançamento do BIKO; data de lançamento do JobHunter (o Android existe desde 2024, não desde abril de 2026); citações inventadas (homônimo do Bicos e "pra não achar nada" na síntese); nomes de quem avaliou no Meu Freelance; a RN14 descrita como regra de preço; e a comissão "estimada de 5% a 15%" do Bicos, sem fonte.

## O que não deu para verificar

- **Reclame Aqui** dos cinco apps: o site e a API de busca devolveram 403 com desafio do Cloudflare. Todas as frases "sem registros no Reclame Aqui" viraram "não verificado". **Atualização de 01/10/2026, depois desta auditoria:** com `curl --http1.1` e User-Agent de navegador o Reclame Aqui responde. As páginas de empresa testadas para os cinco apps devolvem 404 e a busca de empresas não os lista. As fichas passaram a dizer "sem página", com os endereços testados, igual ao `painel-reclame-aqui.md`. As linhas da tabela acima ficam como registro do que a auditoria encontrou.
- **CNPJ e quadro societário da Hybriun Desenvolvimento LTDA** (Bicos): não aparecem nas lojas, no site nem na política de privacidade. As APIs de CNPJ não buscam por nome.
- **Conteúdo das publicações no Instagram** (JobHunter) e **criadores ou usuários falando dos apps no TikTok**: o Instagram não mostra publicações sem login e a busca do TikTok não responde por HTTP. Só os contadores públicos dos perfis foram conferidos.
- **Recursos que dependem de abrir o app** (troca de perfil no Bicos, chat do Trampei, avaliação mútua no Meu Freelance, exclusão de conta): ficaram marcados como "não verificado" ou "não encontrado na descrição das lojas".
- **O que os planos do Trampei liberam** e a periodicidade das assinaturas: a App Store mostra só nome e preço.
- **Percentual da taxa do BIKO**: o FAQ diz "% negociada". O valor padrão de 15% aparece apenas no código público do site, e foi registrado como inferência, não como preço.
- **Identidade da conta que avaliou o BIKO com o mesmo nome da conta da App Store**: não há como confirmar que é a mesma pessoa.

## Observações fora dos seis arquivos

- O painel (`painel-df-e-lojas.md`, item 17) diz que o homônimo Biko Brasil é "voltado a entregas/mobilidade". Pela App Store e pela Google Play, é um app de tarefas de **repositor**. O painel não foi editado nesta auditoria.
- No JobHunter, 52 das 96 avaliações com texto da Google Play são de 5 estrelas publicadas em só dois dias (14/01/2025 e 27/02/2025). Vale lembrar disso antes de usar a nota 4,3 como sinal de satisfação.

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
