---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, sistema]
---

# Diagrama de Arquitetura — Frila

Preenche a Seção 6.4 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve quatro camadas e uma lista de pacotes, mas não desenha o sistema nem define o contrato entre cliente e servidor — sem o qual três clientes não conseguem ser construídos em paralelo. As classes destas camadas estão em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o esquema que elas persistem, em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].

> [!info] O que está decidido
> **Decidido em 21/09/2026**, nas respostas do quadro 03 de pendências: **três clientes nativos** — app iOS em Swift e SwiftUI, app Android em Kotlin e versão web — de um app só, com dois perfis, o do profissional e o do contratante; cada conta tem um perfil só (RN25, decidido em 22/09). A v1.0, na App Store em 13/11/2026, é **só iOS**; Android e web entram na v1.2, no 1º trimestre de 2027 (Escopo do MVP). O Android continua sendo prioridade de alcance, por ser a plataforma de cerca de 75% do uso de celular no Brasil (75,45%, StatCounter, ago/2026). O backend é o **Supabase** (Postgres com PostGIS), e as regras que precisam valer igual nos três clientes moram nele, escritas uma vez.
> **Estado em 30/09/2026:** o backend está na branch `develop` de `frila-backend` (75 migrações, com testes pgTAP), e o app iOS, em `frila-frontend/iOS`, com o bundle ID `com.frila.org.app` e builds internos no TestFlight. Android e web ainda não começaram.
> **Ainda em aberto:** a stack da versão web, escolhida depois do iOS. Premissas de volume e de comportamento levam `[H]`.

---

## Nível 1 — Contexto

![[07 - Arquitetura/Anexos/arquitetura/contexto.png|Atores, o sistema e as dependências externas]]

A seta tracejada é decisão de produto, não detalhe de integração: RN10 proíbe liberar contato antes da confirmação, porque *"antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones"*. O sistema conhece o contato o tempo todo, entrega-o num único momento e deixa de mostrá-lo 7 dias depois do fim do turno.

Não há caixa de gateway de pagamento, e isso é RN09: o valor é registrado, nunca custodiado. O efeito arquitetural vale ser nomeado — sem fluxo financeiro, o sistema sai inteiro do escopo de PCI-DSS e de boa parte do risco regulatório, o que é um ganho de simplicidade grande para um time de cinco pessoas.

Também não há operador do Frila acompanhando turno. O sistema é automático (D01): quem acompanha as vagas e os turnos é o gestor do estabelecimento, e a Equipe Frila só responde e-mail — suporte, denúncia, contestação e pedido de revisão do despacho, em até 5 dias úteis.

---

## Nível 2 — Contêineres

![[07 - Arquitetura/Anexos/arquitetura/conteineres.png|Três clientes, o Supabase e o despacho puxado por fila]]

O app, com os perfis de profissional e de contratante, é desenhado para iOS, Android e web — na v1.0, só o iOS — e fala com um backend só, no Supabase: Postgres com PostGIS, autenticação, Edge Functions, `pg_cron`, `pg_net` e a fila `pgmq`. O Painel não é sistema à parte nem ferramenta interna: é uma tela da versão web, no perfil de contratante, em que o gestor acompanha vagas, candidatos, contratados, check-ins e turnos (B09); entra com a web, na v1.2. O alerta de vaga vazia e a confirmação de check-in manual também existem no celular, na conta de contratante.

### Por que o despacho roda fora da requisição

Poderia ser uma função chamada dentro da publicação. Não é (B15): publicar a vaga grava no banco, enfileira o despacho na fila `pgmq` e responde. Depois do *commit*, um gatilho chama pelo `pg_net` a Edge Function `despachar`, que roda `privado.despachar_vaga` no Postgres; o `pg_cron` refaz a fila a cada minuto e roda os jobs de lembrete, atraso, vaga vazia, teto, fechamento do modo seleção e fechamento dos turnos; e o push sai por outra Edge Function, `enviar-push`, pelo FCM. São três motivos, que vêm dos requisitos:

**É trabalho agendado.** Quase tudo o que o despacho faz acontece minutos ou horas depois da requisição que o originou: agrupar vagas próximas no tempo e respeitar o teto de uma notificação a cada 30 minutos por profissional (RN23); lembrar o turno 24 horas e 3 horas antes; alertar o contratante aos 15 minutos sem check-in e quando a vaga segue vazia na janela crítica; fechar o modo seleção 24 horas antes do início (RN24); avisar os dois lados quando o horário de fim passa. Amarrar isso ao ciclo de vida de uma requisição HTTP é perdê-lo quando ela termina.

**Tem orçamento de tempo próprio.** RNF03 exige a notificação enviada ao provedor em até 30 segundos após a publicação; e a publicação precisa devolver a tela na hora, sem esperar o despacho. São dois relógios: a publicação devolve a tela rápido, a notificação acontece logo, mas não *dentro* dela.

**É o que mais vai mudar.** Ainda não houve validação de campo: os 15 km, os 30 minutos do teto e as 3 horas do alerta são valores iniciais, para ajustar com o dado do piloto `[H]`. Isolar o motor permite trocar esses números sem mexer no que serve tela.

---

## As três plataformas

![[07 - Arquitetura/Anexos/arquitetura/multiplataforma.png|Nativo em cada plataforma, com as regras críticas no backend]]

Decidido em 21/09/2026 (B01): **nativo em cada plataforma** — Swift e SwiftUI no iOS, Kotlin no Android. O risco que pesava contra essa opção era a regra escrita três vezes, divergindo em silêncio: o Android passando a notificar alguém que o iOS considera inelegível, e ninguém percebendo até um profissional reclamar.

A resposta a esse risco (B20, ajustada em 22/09) é tirar a regra dos clientes. Não existe pacote de código comum entre Swift e Kotlin; o que precisa valer igual para todos mora no backend, em funções e restrições do Supabase, escrito uma vez só. Cada app mantém o próprio domínio para a tela e para os testes.

| Camada | Onde mora | Por quê |
|---|---|---|
| Regras críticas: elegibilidade e teto (RN05, RN23), confirmação (RN19), turno sobreposto (RN21), check-in de 200 m (RN22), fechamento do modo seleção (RN24) | **Backend**, uma vez | Os três clientes chamam as mesmas funções; não há três versões para divergir |
| Contrato: tabelas e funções RPC | **Backend**, documentado antes do código | Um só esquema para iOS, Android e web (B16) |
| Domínio local | Cada app | Validação que dá mensagem boa antes da rede; quem está certo continua sendo o backend |
| Cache e fila offline | Cada app | A política é a mesma; o armazenamento é de cada plataforma — SwiftData no iOS |
| Interface | Cada app | SwiftUI, Compose e web têm idioma próprio — e o público usa Android de entrada, onde camada de abstração custa caro |
| Push, geolocalização, keychain | Cada app | API de sistema, diferente em cada plataforma; o push sai pelo FCM nos dois |

---

## Nível 3 — Dentro do aplicativo

![[07 - Arquitetura/Anexos/arquitetura/camadas-do-app.png|Apresentação, domínio, dados e infraestrutura]]

Nenhuma seta sai do domínio. É isso que permite testar em milissegundos, sem simulador, o que o app decide sozinho — a validação da publicação, os estados da tela, a reputação exibida —, enquanto a regra que vale para todos está no backend.

A camada de apresentação usa view models `@Observable` no `MainActor`, um por fluxo, sem `ObservableObject`. Reaproveitar o padrão que o time já domina vale mais que o MVVM canônico de livro.

---

## O contrato entre cliente e servidor

Três clientes construídos em paralelo por cinco pessoas só funcionam se o contrato for definido antes do código. Decidido em 21/09 (B16): a especificação é escrita **antes** do backend, pelo menos das rotas centrais — publicar vaga, candidatar-se, confirmar, check-in e avaliar. É o que permite alguém começar o app Android sem esperar o iOS ficar pronto.

**A especificação é o artefato, não a documentação dele.** Com o Supabase, o contrato são as tabelas expostas e as funções RPC, documentadas num arquivo versionado no repositório, de onde saem os modelos de cada cliente. Modelo escrito à mão em três linguagens diverge — e diverge em silêncio, que é o que RN19 não pode tolerar.

### Princípios

| Princípio | Regra | Motivo |
|---|---|---|
| Versão explícita | Função nova (`publicar_vaga_v2`) em vez de mudar a assinatura da antiga, em RPC e em Edge Function | O app na loja demora dias para atualizar; a web atualiza no *refresh*. As duas versões convivem |
| Dinheiro em centavos | `"valor_centavos": 12000` | RN18. Nunca `120.00` em JSON — ponto flutuante é como o centavo se perde |
| Tempo em UTC ISO-8601 | `"inicio_em": "2026-09-19T21:00:00Z"` | RN18. O fuso é problema da tela, não do contrato |
| Idempotência na escrita | Reenviar devolve o mesmo resultado: pela chave natural (candidatura, check-in, avaliação, bloqueio) ou pela `chave` que o app gera (publicar vaga, denunciar) | Rede ruim é o ambiente do usuário. Reenviar candidatura não pode criar duas |
| Erro é tipado | `{"code": "posicao_ja_preenchida", …}` no envelope do PostgREST | O cliente precisa distinguir "alguém chegou antes" de "servidor caiu" |

### Autenticação

A entrada é por **código de uso único enviado ao e-mail**, sem senha e sem SMS (22/09). O app chama `signInWithOtp` com o e-mail e troca o código por sessão com `verifyOtp` (`type: email`). O modelo de e-mail do Supabase precisa levar o código (`{{ .Token }}`), e não o link, e o código vale 15 minutos. O envio de e-mail embutido do Supabase serve só para teste: desde 29/09 o ambiente de desenvolvimento envia por SMTP próprio, e o de produção passa a enviar antes do piloto; o custo, se houver, entra no C09.

O Supabase Auth emite um token de acesso curto e um token de renovação longo, guardados no Keychain no iOS, no Keystore no Android e em cookie `HttpOnly` na web. RNF07 exige credencial protegida; `UserDefaults` e `localStorage` não atendem.

O cadastro do profissional é **progressivo** por RN14: nome, telefone, e-mail, data de nascimento e o aceite da versão vigente dos termos bastam para receber a primeira notificação. Verificação de identidade é passo posterior, e a ausência dela nunca bloqueia o cadastro — a barreira antes do primeiro trabalho é documentada como falha dos concorrentes.

O telefone é obrigatório, porque é o contato do turno (RN10) e o app não tem chat, mas só tem o formato conferido: não há verificação por SMS, e o mesmo número pode estar em outra conta. A conta nasce com um perfil só, profissional ou contratante, gravado por `criar_conta` e fixo (RN25). Por isso não há troca de perfil na sessão: quem quiser o outro lado entra com outra conta, de outro e-mail.

### Os recursos do MVP

A especificação está em `api/openapi.yaml`, no repositório `frila-docs` (OpenAPI 3.1; a primeira versão é de 22/09, e a atual, 0.2.26, de 30/09). Toda mudança passa primeiro por ela, depois pelo backend (que guarda um espelho em `frila-backend/contrato/`) e só então chega ao app. Ela substitui a lista de rotas `/v1` da época em que o backend seria próprio. São três portas do Supabase:

| Porta | O que passa por ela |
|---|---|
| `auth/v1` | Código no e-mail, sessão e renovação — pelo SDK de cada plataforma |
| `rest/v1/rpc/…` | Toda operação com regra de negócio, como função no Postgres: `criar_conta`, `criar_perfil_profissional`, `criterios_de_notificacao`, `cadastrar_estabelecimento`, `meus_estabelecimentos`, `publicar_vaga`, `republicar_vaga`, `cancelar_vaga`, `vagas_abertas`, `candidatar`, `retirar_candidatura`, `escolher_candidato`, `contato_do_turno`, `avisar_a_caminho`, `fazer_checkin`, `confirmar_checkin_manual`, `fazer_checkout`, `cancelar_posicao`, `reabrir_por_atraso`, `avaliar`, `perfil_publico`, `painel_estabelecimento`, `denunciar`, `bloquear`, `contestar_suspensao`, `registrar_dispositivo`, `registrar_evento` e as demais. `configuracao_do_app` é a única que responde sem login, para o app descobrir a versão mínima |
| `functions/v1` | Só onde o Postgres não basta: `exportar-turnos` (CSV ou PDF, na v1.1), `exportar-meus-dados`, `excluir-conta`, que apaga a credencial no Supabase Auth, e `entrar-demonstracao`, a conta da revisão da App Store. As Edge Functions internas `despachar` e `enviar-push` não fazem parte do contrato |

Os apps não escrevem direto nas tabelas; a única leitura direta é o catálogo de funções. O despacho não aparece no contrato: notificar, agrupar, respeitar o teto, lembrar, alertar e fechar o modo seleção é trabalho do agendador, e os apps só registram o dispositivo e recebem o push.

### A resposta que define o produto

Confirmar a posição é o ponto onde RN19 vive: a corrida acontece em `candidatar`, no modo urgência, e em `escolher_candidato`, no modo seleção. As três respostas possíveis são todas normais:

```jsonc
// 200 — ganhou a corrida
{ "estado": "confirmada", "turno_id": "…",
  "contato": { "telefone": "+5561…" } }   // RN10: liberado só agora, até 7 dias após o fim

// 409 — alguém chegou antes. Não é erro de sistema.
{ "code": "posicao_ja_preenchida", "message": "posicao_ja_preenchida",
  "details": null, "hint": null }

// 422 — deixou de ser elegível entre a notificação e o toque
{ "code": "inelegivel", "message": "inelegivel",
  "details": "turno_sobreposto", "hint": null }
```

O `409` merece ênfase: no modo urgência, **todo mundo menos um recebe essa resposta, toda vez**. É o funcionamento normal, não uma exceção — e a tela precisa dizer "que pena, foi rápido", não "algo deu errado". Tratar isso como falha genérica é como o produto ganha fama de quebrado fazendo exatamente o que deveria.

### Erros

Um envelope só, com código estável em `snake_case` que o cliente pode comparar sem traduzir. A mensagem legível vem junto para *log*, nunca para a tela — texto de interface é do cliente, que conhece o contexto e o idioma. O envelope é o do PostgREST (`code`, `message`, `details`, `hint`): nas recusas de regra, `code` é o código estável e `details` o motivo complementar, levantados por um auxiliar único com `raise sqlstate 'PGRST'`. O catálogo completo dos códigos está na descrição do `openapi.yaml`.

| HTTP | Quando |
|---|---|
| `401` | Token ausente, expirado ou inválido |
| `403` | Autenticado, mas sem papel para a ação (RF21), ou contato pedido depois dos 7 dias (RN10) |
| `404` | Não existe, ou não é visível para quem pede — inclui o que o bloqueio esconde (RF26) |
| `409` | Conflito legítimo de estado: posição já preenchida, vaga encerrada, candidatura indisponível, avaliação já registrada com outra resposta. Reenviar a mesma escrita não é conflito: devolve o mesmo resultado |
| `422` | Regra de negócio recusou: campo faltando (RN02), menor de idade (RN20), modo seleção com menos de 24 horas (RN24), check-in fora da janela, que vai de 60 minutos antes do início ao fim previsto (RN22), turno sobreposto (RN21), ação do outro perfil (RN25). Check-in a mais de 200 m não é recusado: vira manual, à espera da confirmação do contratante |
| `429` | Limite de requisições |

---

## O caminho crítico

![[07 - Arquitetura/Anexos/arquitetura/caminho-critico.png|Sequência da publicação até a confirmação]]

---

## Entrega de notificação

RNF02 pede 99% das notificações aceitas pelo provedor — APNs ou FCM — em até 60 segundos após o despacho, com reenvio automático. A meta é medida no servidor de propósito: o app não usa notificação *Time Sensitive* nem pede isenção de economia de bateria (B08), então a entrega dentro do aparelho não está sob controle do Frila. Isso não diminui o requisito: se a notificação não chega, não existe produto — só um mural passivo com passos extras. A segunda queixa mais repetida nas avaliações dos concorrentes é exatamente o aviso que não chega.

O que a arquitetura precisa ter:

- **Estado de entrega por notificação.** `notificacao` guarda `estado_entrega`, `entregue_em` e `motivo_falha`. Sem isso não há como medir os 99%, e requisito que não se mede não vale.
- **Reenvio com recuo exponencial**, limitado pelo início do turno. Insistir numa notificação de turno que já começou é ruído.
- **Teto e agrupamento no servidor.** No máximo uma notificação de vaga a cada 30 minutos por profissional, com as vagas próximas no tempo juntas numa só; a vaga do modo urgência que começa em menos de 2 horas fura o agrupamento e conta no teto (RN23). É o que impede o canal de virar ruído quando vários estabelecimentos publicam ao mesmo tempo.
- **Degradação declarada.** Push negado nas permissões é caso comum, não exceção. Quem recusou notificação continua vendo todas as vagas na lista, mas não conta como avisado — despachar para quem não vai ver só infla o número de alcançados.

---

## Segurança, privacidade e auditoria

| Exigência | Onde a arquitetura responde |
|---|---|
| RNF07 · HTTPS e credencial protegida | TLS obrigatório; token no Keychain/Keystore/cookie `HttpOnly` |
| RN15 · dado pessoal fora de log | Telemetria registra identificadores e eventos, nunca nome, telefone ou documento |
| RN10 · contato só depois da confirmação, até 7 dias após o fim | Política de acesso no banco: o telefone só é legível pelas partes do turno, dentro do prazo |
| RN22 · localização só no toque | O app lê a localização no check-in e no check-out, nunca em segundo plano; só a distância vai para o servidor |
| RNF08 · exclusão em 15 dias | Anonimização preservando turno e avaliação da contraparte |
| RNF13 · auditabilidade | `ocorrencia`, `despacho` e `notificacao` são append-only na prática |
| RN13 · suspensão com contestação | Suspensão só por denúncia grave confirmada, sempre como `ocorrencia` com motivo; a contestação é outra, vinculada, respondida em até 5 dias úteis |
| RF26 · denúncia e bloqueio | Denúncia é `ocorrencia`; bloqueio é tabela própria, lida pela elegibilidade, pela lista e pela candidatura |
| RN17 · auditoria e prestação de contas | Exportação por período, com data, função, horário e valor |

---

## Escala e disponibilidade

RNF11 dimensiona o alvo em cerca de **30 mil estabelecimentos do DF** `[H]`; RNF12 pede 99,5% de disponibilidade **sem manutenção no horário de pico — quinta a domingo, das 16h às 2h**.

Esse horário é a informação arquitetural mais útil do documento inteiro, e é fácil passar batido por ela. Ele diz que o pico de uso é exatamente o pico do setor — o turno de bar e evento de fim de semana. Consequências diretas:

- Migração e *deploy* acontecem de segunda a quarta, ou pela manhã. A arquitetura precisa suportar **migração sem downtime** desde cedo, porque a janela de parada é estreita — ver o padrão de duas fases em [[07 - Arquitetura/Modelagem de Banco de Dados#Migração e versionamento|Migração e versionamento]].
- O dimensionamento não pode ser pela média. Um sistema que aguenta a carga média do DF e cai às 17h de sexta falhou no único momento que importa.
- Latência e entrega precisam ser medidas **segmentadas pelo horário de pico**. Um p99 mensal saudável esconde um p99 de sexta à noite terrível.

Na escala de uma praça só, isso é modesto em termos absolutos: o plano gratuito do Supabase atende até 50 mil usuários ativos por mês, e a migração para backend próprio só volta à mesa a partir de certa rentabilidade (B02). O risco não é volume, é concentração — e, no plano gratuito, o projeto que fica 7 dias sem uso é pausado, o que pesa no piloto enquanto quem paga a infraestrutura não estiver decidido (C09).

---

## Decisões de stack

Tomadas em 21/09/2026, nas respostas do quadro 03, e completadas em 22/09.

### Backend: Supabase

Supabase, com Postgres e PostGIS, autenticação, Edge Functions, `pg_cron` e `pgmq` (B02, B06). Começa no plano gratuito; a migração para backend próprio é reavaliada a partir de certa rentabilidade.

O critério que este documento propunha era *onde RN19 continua sendo uma garantia?* — e a resposta favorece o Supabase: é Postgres de verdade, então o `UPDATE` condicional da confirmação e o `EXCLUDE` de turnos sobrepostos continuam declarativos, dentro de funções que os três clientes chamam. O que muda de lugar está em [[07 - Arquitetura/Modelagem de Banco de Dados#No Supabase|No Supabase]].

### Cache local: SwiftData

SwiftData (B19). Para o uso previsto — cache de turnos confirmados por 24 horas (RNF06) e fila de ações —, basta, e combina com `@Observable`. Exige iOS 17 ou superior, e por isso RNF04 sobe de iOS 16 para iOS 17. O protocolo `CacheLocal` continua isolando a escolha.

### Push: FCM

FCM nos dois sistemas (B17); no iOS, o FCM entrega pela APNs. Um provedor só, chamado pela Edge Function `enviar-push`, com reenvio por recuo exponencial. No app iOS, o SDK do FCM entra na Sprint 2, junto com o registro do aparelho.

### Testes

Swift Testing para a lógica e XCTest só para os testes de interface, com XCUITest (B21). Os dois convivem no mesmo projeto — ver [[07 - Arquitetura/Diagrama de Classe#Como isso é testado|Como isso é testado]].

### Onde fica o código

Na organização `FrilaApp` do GitHub, em repositórios separados: `frila-docs` (documentação e contrato, em `api/openapi.yaml`), `frila-backend` (Supabase: migrações, funções, Edge Functions e testes; branch principal `develop`) e `frila-frontend` (`iOS/` hoje; `Android/` e `Web/` na v1.2). O contrato muda primeiro no `frila-docs`, é espelhado no backend e só então chega ao app, um pull request por repositório.

### Web

A tecnologia da versão web é escolhida depois do iOS (22/09). A web entra na v1.2, no 1º trimestre de 2027, junto com o Painel do gestor.

---

## O que precisa existir para a v1

Em ordem de dependência, não de esforço. Em 30/09, os itens 1 a 4 estão na `develop` do backend; o 5 existe no servidor (`enviar-push`) e falta o registro do aparelho no app; o 6 está em construção, com o fluxo do profissional pronto; o 7 vem depois do 6.

1. **Projeto Supabase com as tabelas do MVP**, as restrições de RN19, RN02, RN18, RN20, RN21, RN22, RN24 e RN25 e as políticas de acesso descritas em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].
2. **Especificação das tabelas e funções RPC das rotas centrais**, antes do primeiro cliente — é o que permite iOS, Android e web avançarem em paralelo.
3. **Funções de autenticação, vaga, candidatura, confirmação e check-in**, suficientes para o ciclo fechar.
4. **Motor de despacho** com elegibilidade, teto e agrupamento (RN05, RN23), e os jobs de lembrete, alerta e fechamento. Não há levas: notificar os elegíveis certos, sem inundar ninguém, é a tese.
5. **Push pelo FCM no iOS e no Android.** Sem notificação o produto não existe.
6. **App iOS com os quatro fluxos** — publicar, receber e candidatar, registrar turno, avaliar —, mais excluir a conta (RF25) e denunciar e bloquear (RF26), que a App Store exige.
7. **Alerta de vaga vazia e confirmação de check-in manual no perfil de contratante**, e o Painel na web quando a web entrar. É o que impede o turno de falhar em silêncio.

Fica para depois sem prejuízo do ciclo: escala em lote (RF19), exportação (RF22) e o atalho de suporte por e-mail (RF23). A v1.0 de 13/11 é só iOS; Android e web entram na v1.2 (B03 e Escopo do MVP).

---

## Decisões respondidas em 21/09/2026

| # | Decisão | Resposta |
|---|---|---|
| D6 | O despacho roda como serviço próprio ou dentro da API | Fora da requisição: publicar só grava e responde; um job separado (Edge Function, `pg_cron` e `pgmq`) faz notificações, agrupamento, teto, lembretes, alertas e fechamentos (B15) |
| D7 | Cache local: SwiftData ou Core Data | SwiftData, com iOS 17 como mínimo (B19) |
| D9 | Backend próprio ou gerenciado | Supabase (Postgres com PostGIS); a migração é reavaliada a partir de certa rentabilidade. É a mesma decisão da D5 (B02, B06) |
| D10 | Nativo nas três plataformas ou núcleo compartilhado | Nativo: Swift e SwiftUI no iOS, Kotlin no Android. As regras críticas moram no backend, escritas uma vez (B01, B20) |
| D11 | A especificação é escrita antes ou junto do backend | Antes, pelo menos das rotas centrais; com o Supabase, funções RPC documentadas (B16). Escrita em 22/09; hoje em `frila-docs/api/openapi.yaml`, versão 0.2.26 |
| D13 | Provedor de push no Android | FCM, que também entrega no iOS pela APNs (B17) |

Com as seis respondidas, nada de arquitetura trava a primeira versão que alguém use de verdade. A especificação (D11) foi escrita em 22/09 e está na versão 0.2.26. A stack da web fica para depois do iOS; o bundle ID é `com.frila.org.app`.

---
← [[🏠 Início|Início]]
