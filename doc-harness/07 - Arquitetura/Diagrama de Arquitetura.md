---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, sistema]
---

# Diagrama de Arquitetura — Frila

Preenche a Seção 6.4 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve quatro camadas e uma lista de pacotes, mas não desenha o sistema nem define o contrato entre cliente e servidor — sem o qual três clientes não conseguem ser construídos em paralelo. As classes destas camadas estão em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o esquema que elas persistem, em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].

> [!info] O que está decidido
> **Decidido em 21/09/2026**, nas respostas do quadro 03 de pendências: **três clientes nativos** — app iOS em Swift e SwiftUI, app Android em Kotlin e versão web —, cada um com os dois apps, do Profissional e do Estabelecimento. Para a entrega na loja em 13/11, o iOS é o mínimo; Android e web são a meta, e o Android continua sendo prioridade de alcance, por ser a plataforma de cerca de 75% do uso de celular no Brasil (75,45%, StatCounter, ago/2026). O backend é o **Supabase** (Postgres com PostGIS), e as regras que precisam valer igual nos três clientes moram nele, escritas uma vez.
> **Ainda em aberto:** a stack da versão web. Premissas de volume e de comportamento levam `[H]`.

---

## Nível 1 — Contexto

![[07 - Arquitetura/Anexos/arquitetura/contexto.png|Atores, o sistema e as dependências externas]]

A seta tracejada é decisão de produto, não detalhe de integração: RN10 proíbe liberar contato antes da confirmação, porque *"antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones"*. O sistema conhece o contato o tempo todo, entrega-o num único momento e deixa de mostrá-lo 7 dias depois do fim do turno.

Não há caixa de gateway de pagamento, e isso é RN09: o valor é registrado, nunca custodiado. O efeito arquitetural vale ser nomeado — sem fluxo financeiro, o sistema sai inteiro do escopo de PCI-DSS e de boa parte do risco regulatório, o que é um ganho de simplicidade grande para cinco pessoas em TRL 2.

Também não há operador do Frila acompanhando turno. O sistema é automático (D01): quem acompanha as vagas e os turnos é o gestor do estabelecimento, e a Equipe Frila só responde e-mail — suporte, denúncia, contestação e pedido de revisão do despacho, em até 5 dias úteis.

---

## Nível 2 — Contêineres

![[07 - Arquitetura/Anexos/arquitetura/conteineres.png|Três clientes, o Supabase e o despacho puxado por fila]]

Os dois apps — do Profissional e do Estabelecimento — existem em iOS, Android e web, e falam com um backend só, no Supabase: Postgres com PostGIS, autenticação, Edge Functions, `pg_cron` e a fila `pgmq`. O Painel não é sistema à parte nem ferramenta interna: é uma tela da versão web do app do Estabelecimento, em que o gestor acompanha vagas, candidatos, contratados, check-ins e turnos (B09). O alerta de vaga vazia e a confirmação de check-in manual também existem no app do Estabelecimento no celular.

### Por que o despacho roda fora da requisição

Poderia ser uma função chamada dentro da publicação. Não é (B15): publicar a vaga só grava no banco e responde, e um job separado — Edge Function puxada pela fila `pgmq` e pelo `pg_cron` — faz o resto, por três motivos que vêm dos requisitos:

**É trabalho agendado.** Quase tudo o que o despacho faz acontece minutos ou horas depois da requisição que o originou: agrupar vagas próximas no tempo e respeitar o teto de uma notificação a cada 30 minutos por profissional (RN23); lembrar o turno 24 horas e 3 horas antes; alertar o contratante aos 15 minutos sem check-in e quando a vaga segue vazia na janela crítica; fechar o modo seleção 24 horas antes do início (RN24); avisar os dois lados quando o horário de fim passa. Amarrar isso ao ciclo de vida de uma requisição HTTP é perdê-lo quando ela termina.

**Tem orçamento de tempo próprio.** RNF03 exige a notificação enviada ao provedor em até 30 segundos após a publicação; RF04 exige que a publicação termine em menos de 60. São dois relógios: a publicação devolve a tela rápido, a notificação acontece logo, mas não *dentro* dela.

**É o que mais vai mudar.** O produto está em TRL 2: os 15 km, os 30 minutos do teto e as 3 horas do alerta são valores iniciais, para ajustar com o dado do piloto `[H]`. Isolar o motor permite trocar esses números sem mexer no que serve tela.

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

A camada de apresentação usa `@Observable`, alinhada ao que a equipe já pratica na Bancada, onde `EstadoDaBancada` é um store único e não há `ObservableObject` em lugar nenhum. Reaproveitar o padrão que o time domina vale mais que o MVVM canônico de livro.

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

O Supabase Auth emite um token de acesso curto e um token de renovação longo, guardados no Keychain no iOS, no Keystore no Android e em cookie `HttpOnly` na web. RNF07 exige credencial protegida; `UserDefaults` e `localStorage` não atendem.

O cadastro do profissional é **progressivo** por RN14: nome, telefone, e-mail e data de nascimento bastam para receber a primeira notificação. Verificação de identidade é passo posterior, e a ausência dela nunca bloqueia o cadastro — a barreira antes do primeiro trabalho é documentada como falha dos concorrentes.

### Os recursos do MVP

A especificação está em `Frila/Documentos/API/openapi.yaml` (OpenAPI 3.1, versão 0.1.0, de 22/09), validada com o Redocly. Ela substitui a lista de rotas `/v1` da época em que o backend seria próprio. São três portas do Supabase:

| Porta | O que passa por ela |
|---|---|
| `auth/v1` | Código por SMS, sessão e renovação — pelo SDK de cada plataforma |
| `rest/v1/rpc/…` | Toda operação com regra de negócio, como função no Postgres: `criar_conta`, `criar_perfil_profissional`, `marcar_disponivel_agora`, `criterios_de_notificacao`, `cadastrar_estabelecimento`, `publicar_vaga`, `vagas_abertas`, `candidatar`, `retirar_candidatura`, `escolher_candidato`, `contato_do_turno`, `fazer_checkin`, `confirmar_checkin_manual`, `fazer_checkout`, `cancelar_posicao`, `reabrir_por_atraso`, `avaliar`, `perfil_publico`, `painel_estabelecimento`, `denunciar`, `bloquear`, `contestar_suspensao`, `registrar_dispositivo` e as demais |
| `functions/v1` | Só onde o Postgres não basta: `exportar-turnos` (CSV ou PDF), `exportar-meus-dados` e `excluir-conta`, que apaga a credencial no Supabase Auth |

Os apps não escrevem direto nas tabelas; a única leitura direta é o catálogo de funções. O despacho não aparece no contrato: notificar, agrupar, respeitar o teto, lembrar, alertar e fechar o modo seleção é trabalho do agendador, e os apps só registram o dispositivo e recebem o push.

### A resposta que define o produto

Confirmar a posição é o ponto onde RN19 vive. As três respostas possíveis são todas normais:

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
| `422` | Regra de negócio recusou: campo faltando (RN02), menor de idade (RN20), modo seleção com menos de 24 horas (RN24), check-in a mais de 200 m (RN22), turno sobreposto (RN21) |
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

Tomadas em 21/09/2026, nas respostas do quadro 03.

### Backend: Supabase

Supabase, com Postgres e PostGIS, autenticação, Edge Functions, `pg_cron` e `pgmq` (B02, B06). Começa no plano gratuito; a migração para backend próprio é reavaliada a partir de certa rentabilidade.

O critério que este documento propunha era *onde RN19 continua sendo uma garantia?* — e a resposta favorece o Supabase: é Postgres de verdade, então o `UPDATE` condicional da confirmação e o `EXCLUDE` de turnos sobrepostos continuam declarativos, dentro de funções que os três clientes chamam. O que muda de lugar está em [[07 - Arquitetura/Modelagem de Banco de Dados#No Supabase|No Supabase]].

### Cache local: SwiftData

SwiftData (B19). Para o uso previsto — cache de turnos confirmados por 24 horas (RNF06) e fila de ações —, basta, e combina com `@Observable`. Exige iOS 17 ou superior, e por isso RNF04 sobe de iOS 16 para iOS 17. O protocolo `CacheLocal` continua isolando a escolha.

### Push: FCM

FCM nos dois sistemas (B17); no iOS, o FCM entrega pela APNs. Um provedor só, disparado pela mesma Edge Function do despacho.

### Testes

Swift Testing para a lógica e XCTest só para os testes de interface, com XCUITest (B21). Os dois convivem no mesmo projeto — ver [[07 - Arquitetura/Diagrama de Classe#Como isso é testado|Como isso é testado]].

---

## O que precisa existir para a v1

Em ordem de dependência, não de esforço:

1. **Projeto Supabase com as tabelas do MVP** e as restrições de RN19, RN02, RN18, RN20, RN21, RN22 e RN24.
2. **Especificação das tabelas e funções RPC das rotas centrais**, antes do primeiro cliente — é o que permite iOS, Android e web avançarem em paralelo.
3. **Funções de autenticação, vaga, candidatura, confirmação e check-in**, suficientes para o ciclo fechar.
4. **Motor de despacho** com elegibilidade, teto e agrupamento (RN05, RN23), e os jobs de lembrete, alerta e fechamento. Não há levas: notificar os elegíveis certos, sem inundar ninguém, é a tese.
5. **Push pelo FCM no iOS e no Android.** Sem notificação o produto não existe.
6. **App iOS com os quatro fluxos** — publicar, receber e candidatar, registrar turno, avaliar —, mais excluir a conta (RF25) e denunciar e bloquear (RF26), que a App Store exige.
7. **Alerta de vaga vazia e confirmação de check-in manual no app do Estabelecimento**, e o Painel na web quando a web entrar. É o que impede o turno de falhar em silêncio.

Fica para depois sem prejuízo do ciclo: escala em lote (RF19), exportação (RF22) e o atalho de suporte por e-mail (RF23). Para 13/11, o iOS é o mínimo; Android e web entram assim que couberem (B03).

---

## Decisões respondidas em 21/09/2026

| # | Decisão | Resposta |
|---|---|---|
| D6 | O despacho roda como serviço próprio ou dentro da API | Fora da requisição: publicar só grava e responde; um job separado (Edge Function, `pg_cron` e `pgmq`) faz notificações, agrupamento, teto, lembretes, alertas e fechamentos (B15) |
| D7 | Cache local: SwiftData ou Core Data | SwiftData, com iOS 17 como mínimo (B19) |
| D9 | Backend próprio ou gerenciado | Supabase (Postgres com PostGIS); a migração é reavaliada a partir de certa rentabilidade. É a mesma decisão da D5 (B02, B06) |
| D10 | Nativo nas três plataformas ou núcleo compartilhado | Nativo: Swift e SwiftUI no iOS, Kotlin no Android. As regras críticas moram no backend, escritas uma vez (B01, B20) |
| D11 | A especificação é escrita antes ou junto do backend | Antes, pelo menos das rotas centrais; com o Supabase, funções RPC documentadas (B16). Escrita em 22/09: `Frila/Documentos/API/openapi.yaml` |
| D13 | Provedor de push no Android | FCM, que também entrega no iOS pela APNs (B17) |

Com as seis respondidas, nada de arquitetura trava a primeira versão que alguém use de verdade. A especificação (D11) foi escrita em 22/09; o que falta é escolher a stack da web.

---
← [[🏠 Início|Início]]
