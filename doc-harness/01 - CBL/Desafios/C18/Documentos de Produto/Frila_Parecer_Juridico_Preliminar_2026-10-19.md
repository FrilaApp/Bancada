# Frila — Parecer jurídico preliminar sobre a intermediação de trabalho avulso

**Data:** 19/10/2026 · **Cartão:** S0 · Jurídico · Parecer sobre intermediação de trabalho avulso (`cSYhvFDl`)
**Autoria:** Nick Fury (agente de IA), por delegação expressa do líder do projeto, Cauê Carneiro, que em 19/10/2026 concedeu poder de auditoria, revisão e aprovação até o fim do challenge. Método: skills públicas de LGPD e de redação jurídica brasileira (`goul4rt/lgpd-skills`, `giuseppetrevizan/advogado-br`), lidas como material de apoio, com o roteiro de decisão de base legal, RIPD, transferência internacional, incidente e ECA Digital.

> **Aviso obrigatório.** Este documento **não é parecer de advogado**. É uma análise de nível de estudo, feita por IA, para o piloto e o TestFlight do challenge. Nenhum trecho foi conferido por pessoa habilitada na OAB. Antes de cobrança, de lançamento público ou de qualquer contrato com terceiros, um advogado deve revisar tudo o que está marcado como "advogado antes de…". Citações de lei, súmula e resolução devem ser conferidas na fonte oficial antes de uso externo.

## 1. Resumo para quem tem pouco tempo

| # | Tema | Risco hoje | Decisão para o piloto |
|---|---|---|---|
| 1 | Vínculo empregatício entre estabelecimento e profissional | Médio | Manter o desenho sem subordinação: o profissional escolhe, recusa sem penalidade, sem escala obrigatória nem exclusividade. |
| 2 | Vínculo entre Frila e profissional (plataforma) | Médio, em evolução | Frila só aproxima as partes: não fixa preço, não dirige o trabalho, não pune recusa. Acompanhar o Tema 1.291 do STF e o PLP 12/2024. |
| 3 | Responsabilidade do Frila por dano no turno | Médio | Termo diz que Frila é intermediária, não empregadora nem garante do serviço; canal de denúncia e remoção de conta. Advogado antes de cobrança. |
| 4 | Obrigações de quem paga o autônomo (INSS, RPA, eSocial) | Médio, do contratante | Frila informa, não retém nem recolhe nada no piloto. Texto de ajuda orienta o contratante a procurar contador. |
| 5 | Taxa de serviço e gorjetas (Lei 13.419/2017) | Baixo no piloto (sem cobrança) | Sem taxa no piloto; ao cobrar, advogado define rateio e emissão de nota. |
| 6 | LGPD: bases legais, direitos, retenção | Médio | Tabela de bases legais da seção 4; retenção mínima; canal do titular. |
| 7 | Menores de 18 anos | Alto se falhar | Cadastro só para maiores de 18 (já em RF); recusa não guarda dado além do necessário. |
| 8 | Operadores no exterior (Supabase, Firebase, Netlify, Google) | Médio | Registrar operadores e hipótese de transferência internacional; cláusulas-padrão antes de lançamento. |
| 9 | Consumidor, foro e termos | Baixo a médio | Termos em português claro, foro do domicílio do consumidor quando houver relação de consumo, sem cláusula abusiva. |
| 10 | Incidente de segurança | Médio | Procedimento da seção 6: registrar, avaliar, comunicar em 3 dias úteis quando o critério bater. |

## 2. Natureza da relação (vínculo)

**Pergunta.** Quando um bar ou restaurante chama um garçom avulso pelo Frila, existe emprego?

**Análise.** A CLT, art. 3º, exige pessoalidade, onerosidade, não eventualidade e subordinação. O turno avulso é, em regra, **eventual** (sem continuidade esperada) e o profissional escolhe se aceita. Os dois riscos reais são: (a) o mesmo estabelecimento chamar a mesma pessoa todos os dias, o que aproxima da não eventualidade; (b) o estabelecimento mandar e punir como se fosse empregador. A primeira situação é do contratante e não do Frila, mas o produto não deve **estimular** a habitualidade nem criar "escala".

**Decisão.** (1) Manter o desenho já registrado na Visão: sem escala obrigatória, sem penalidade por recusar vaga, sem exclusividade. (2) Termo de uso do estabelecimento diz que a contratação é de trabalho eventual e que a responsabilidade trabalhista de uma eventual habitualidade é do contratante. (3) Mensagem na tela de "favoritos" (RF de repetição) sem linguagem de "equipe fixa".

**Risco residual.** Médio. Reavaliar quando algum estabelecimento passar de 8 turnos por mês com a mesma pessoa.

## 3. Natureza do Frila e o marco de plataformas

**Pergunta.** O Frila é empregador, intermediário de mão de obra ou plataforma de aproximação?

**Análise.** O Frila só apresenta vaga e candidato, não define o valor da diária fora da faixa informada, não dirige o trabalho nem controla o horário. Isso o coloca como **plataforma de aproximação**. O ponto de atenção é o Tema 1.291 do STF (vínculo de motoristas com plataformas) e o PLP 12/2024 (trabalho por plataforma), ainda sem desfecho confirmado por esta análise: o resultado pode mudar o enquadramento de plataformas em geral, inclusive de menor porte. Também é preciso evitar que o texto do app pareça "contratação feita pelo Frila".

**Decisão.** (1) Vocabulário padrão: "vaga", "candidatura", "contratante", "profissional"; evitar "empregado", "contratar pelo Frila", "garantimos o trabalho". (2) Não fixar preço nem comissão por regra do Frila no piloto. (3) Revisar este item a cada decisão do STF ou votação do PLP. Gatilho: antes de qualquer cobrança.

## 4. LGPD — bases legais por atividade

Dados pessoais comuns, sem dado sensível previsto. Foto de perfil e avaliações são dados comuns, mas a avaliação pode causar dano reputacional e por isso tem regra de contestação. Gravação de voz da entrevista (se houver) é dado pessoal, e é tratada no termo de consentimento já aprovado.

| Atividade | Dados | Base legal (LGPD art. 7º) | Retenção sugerida |
|---|---|---|---|
| Cadastro e entrada por e-mail | e-mail, nome, telefone | V — execução de contrato / procedimentos preliminares | Enquanto a conta existir; apagar em até 30 dias do pedido |
| Perfil do profissional | nome, foto, funções, bairro | V | Mesma regra |
| Publicação e despacho de vaga | localização aproximada, horário | V | Histórico por até 12 meses, depois anonimizado |
| Notificação push | token do aparelho | V; token é apagado ao sair | Até sair ou trocar de aparelho |
| Avaliação entre as partes | nota e texto | IX — legítimo interesse (segurança e confiança), com teste de balanceamento | Enquanto a conta existir |
| Segurança e prevenção de fraude | registros técnicos | IX | 6 meses (Marco Civil, art. 15, obriga guarda de registro de acesso por 6 meses para provedor de aplicação — conferir enquadramento) |
| Pesquisa de campo (piloto) | conforme termo aprovado | I — consentimento, específico e destacado | Prazos do termo (gravação até o prazo indicado, contato idem) |
| Suporte | e-mail e conteúdo da mensagem | V ou IX | 12 meses |

**Direitos do titular (art. 18).** O canal é o e-mail de privacidade (`privacidade@`, ver cartão de domínio, hoje `suportefrila@gmail.com`). Prazo interno: 15 dias, ou 24 h a mais quando a lei exigir resposta imediata; no projeto, "prazos maiores que 24 h" já foram aceitos por serem pessoa física/estudantes sem encarregado formal.

**Encarregado e agente de tratamento.** O responsável é o líder do projeto, pessoa física, sem CNPJ. Dispensa de encarregado para agente de pequeno porte deve ser confirmada por advogado; até lá, o e-mail de privacidade identifica o responsável.

**RIPD.** Não é obrigatório para o piloto (sem larga escala, sem dado sensível, sem decisão automatizada com efeito relevante). Fica **obrigatório de avaliar** antes do lançamento público se houver mapa de calor, ranking automático ou geolocalização contínua.

## 5. Menores de idade

Exigência do produto: só maiores de 18 anos (data de nascimento no cadastro; menor é recusado e nada além do necessário para registrar a recusa é guardado). A autodeclaração é fraca. A Lei 15.211/2025 (ECA Digital), em vigor desde março de 2026 segundo a skill consultada, tem regra própria para plataformas de acesso provável por menores e **veda autodeclaração como verificação** para quem esteja no escopo. Como o Frila declara ser só para maiores e trata de trabalho, a tese é que não é "direcionado a menores", mas **a conferência de escopo é tarefa de advogado antes do lançamento público**.

**Decisão para o piloto:** manter o bloqueio por data de nascimento, texto claro de "somente maiores de 18", e canal para denúncia de menor. Advogado antes de lançamento público.

## 6. Transferência internacional e operadores

Operadores identificados: Supabase (banco e autenticação), Firebase (push), Netlify (site), Google (e-mail/SMTP). Cada um deve ter: (a) DPA público aceito, (b) hipótese de transferência internacional do art. 33 da LGPD (na prática, cláusulas-padrão da Resolução CD/ANPD nº 19/2024), (c) linha na política de privacidade.

**Decisão.** No piloto, listar os operadores na política com país e finalidade. Antes do lançamento público, guardar a evidência de aceite do DPA e das cláusulas de cada um. Região do banco: preferir a mais próxima do Brasil, se o plano permitir.

## 7. Incidente de segurança

Critério de comunicação à ANPD (Res. CD/ANPD nº 15/2024): risco ou dano relevante **e** pelo menos uma categoria (sensível, criança/adolescente/idoso, financeiro, autenticação, sigilo legal, larga escala). Prazo: 3 dias úteis do conhecimento. Registro de todos os incidentes por 5 anos.

**Procedimento do Frila (piloto):** quem notar avisa o líder; anotar data e hora do conhecimento; conter (revogar chaves, trocar segredos, pausar função); avaliar categorias e número de titulares; decidir sobre comunicação e registrar em `iOS/Docs/` (arquivo de incidentes) mesmo se não comunicar. Segredos nunca em repositório, comentário ou log.

## 8. Contratante autônomo: INSS, RPA, eSocial e taxa de serviço

**Obrigações de quem paga um autônomo.** Em regra, quem contrata pessoa física autônoma e é **empresa** retém e recolhe INSS e emite recibo (RPA), e deve informar no eSocial; o contratante **pessoa física** tem regras próprias. O Frila **não** retém, não recolhe e não paga: só aproxima as partes. O ponto é de orientação, não de execução.

**Decisão.** (1) A ajuda do app e o termo do estabelecimento dizem, em linguagem simples, que obrigações fiscais e previdenciárias da contratação são do contratante e que ele deve consultar contador. (2) Nenhum cálculo de imposto aparece no app. (3) Cálculo de valor líquido, se um dia existir, entra no escopo pós-piloto com advogado ou contador.

**Taxa de serviço e gorjeta (Lei 13.419/2017).** Trata do rateio da taxa de serviço entre os empregados do estabelecimento. Não se aplica ao valor da diária do avulso, mas um estabelecimento pode confundir as duas coisas. O Frila não cobra taxa no piloto. **Advogado e contador antes de cobrar.**

## 9. Consumidor, foro e termos

Se o Frila vier a cobrar, a relação com o contratante tende a ser de consumo (CDC): cláusulas claras, sem exclusão total de responsabilidade, sem renúncia antecipada de direito, foro no domicílio do consumidor quando aplicável. Para o piloto, sem cobrança, os termos já aprovados (versão 1.0) valem com as ressalvas da revisão de 19/10 (14 achados), cujos ajustes seguem o cronograma já registrado: achados 1, 3 e 9 antes de 23/10 em `5xR1JQkW`; achados 2, 4, 7, 8, 10 e 12 numa única nova versão antes do lançamento público; achados 5, 6 e 14 com advogado antes de cobrar.

## 10. Riscos e mitigação (para o Documento de Visão)

| Risco | Prob. | Impacto | Mitigação | Dono / gatilho |
|---|---|---|---|---|
| Caracterização de vínculo entre contratante e profissional | Média | Alto | Desenho sem subordinação, vocabulário neutro, aviso de habitualidade | Líder · revisar com 8 turnos/mês na mesma dupla |
| Enquadramento do Frila como plataforma com vínculo (Tema 1.291, PLP 12/2024) | Baixa a média | Alto | Aproximação sem direção do trabalho; acompanhar decisão | Líder · antes de cobrar |
| Dano a profissional ou contratante durante o turno | Média | Médio | Termo de intermediação, canal de denúncia, remoção de conta | Líder · advogado antes de cobrar |
| Descumprimento de obrigação fiscal pelo contratante | Média | Baixo para o Frila | Texto de orientação, sem cálculo no app | Líder |
| Vazamento ou acesso indevido a dados | Baixa a média | Alto | Segredos fora do repositório, RLS no banco, procedimento de incidente | Time de backend |
| Cadastro de menor de 18 anos | Baixa | Alto | Bloqueio por data de nascimento, denúncia, advogado antes do lançamento | Líder |
| Operador sem DPA ou cláusula internacional | Média | Médio | Lista de operadores na política, evidência de aceite antes do lançamento | Líder |

## 11. Ajustes de texto para os cartões de termos e de política

Lista curta, para o cartão de termos de uso e o de política de privacidade:

1. Termos do estabelecimento: contratação de trabalho **eventual**; responsabilidade trabalhista e fiscal é do contratante; Frila é intermediário.
2. Termos do profissional: sem escala, sem penalidade por recusa, sem exclusividade; responsabilidade pelo próprio recolhimento.
3. Política: tabela de bases legais da seção 4; operadores e países; prazos de retenção; canal do titular.
4. Política: cadastro só para maiores de 18, regra de recusa, canal para denunciar menor.
5. Ajuda do app: aviso de orientação fiscal e previdenciária ao contratante.
6. Vocabulário: banir "empregado", "contratar pelo Frila" e "garantimos".

## 12. O que este parecer não resolve

Valor e rateio da taxa quando houver cobrança; enquadramento fiscal do Frila; adequação formal de encarregado; escopo do ECA Digital; cláusulas internacionais assinadas; efeito final do Tema 1.291 e do PLP 12/2024. Tudo isso fica com **advogado antes de cobrança ou lançamento público**.
