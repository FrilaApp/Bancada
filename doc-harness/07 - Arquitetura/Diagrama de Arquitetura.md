---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, sistema]
---

# Diagrama de Arquitetura — Frila

Preenche a Seção 6.4 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve quatro camadas e uma lista de pacotes, mas não desenha o sistema, não enfrenta o que está em aberto e não define o contrato entre cliente e servidor — sem o qual três clientes não conseguem ser construídos em paralelo. As classes destas camadas estão em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o esquema que elas persistem, em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].

> [!warning] O que está decidido e o que não está
> **Decidido:** existem **três clientes** — app iOS nativo, app Android e versão web —, todos no escopo comprometido do produto. O Documento de Visão os lista na declaração de posição e é explícito: *"Android não pode ficar para depois, por ser a plataforma da maioria esmagadora do trabalhador de base no Brasil"*. Todos os perfis têm acesso ao aplicativo **e** à web.
> **Em aberto:** a stack do backend, e a estratégia de implementação dos clientes — nativo em cada plataforma ou núcleo compartilhado. Propostas levam `[H]`.

---

## Nível 1 — Contexto

![[07 - Arquitetura/Anexos/arquitetura/contexto.png|Atores, o sistema e as dependências externas]]

A seta tracejada é decisão de produto, não detalhe de integração: RN10 proíbe liberar contato antes da confirmação, porque *"antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones"*. O sistema conhece o contato o tempo todo e o entrega num único momento.

Não há caixa de gateway de pagamento, e isso é RN09: o valor é registrado, nunca custodiado. O efeito arquitetural vale ser nomeado — sem fluxo financeiro, o sistema sai inteiro do escopo de PCI-DSS e de boa parte do risco regulatório, o que é um ganho de simplicidade grande para cinco pessoas em TRL 2.

---

## Nível 2 — Contêineres

![[07 - Arquitetura/Anexos/arquitetura/conteineres.png|Quatro clientes, uma API, e o motor de despacho puxado por fila]]

Os três produtos do Documento de Requisitos — app do Profissional, app do Estabelecimento e Painel de Operação — compartilham uma API só. O Painel não é sistema à parte: é a mesma base vista pela pergunta *"o que está prestes a falhar?"*.

### Por que o despacho é um contêiner separado

Poderia ser uma função dentro da API. Não deve ser, por três motivos que vêm dos requisitos:

**É assíncrono por natureza.** RF06 manda disparar a leva seguinte "esgotado o intervalo da leva com a posição ainda aberta" — trabalho agendado que acontece minutos depois da requisição que o originou. Amarrá-lo ao ciclo de vida de uma requisição HTTP significa perdê-lo quando ela termina.

**Tem orçamento de tempo próprio.** RNF03 exige a primeira leva em até 30 segundos; RF04 exige que a publicação responda em menos de 60. São dois relógios: a publicação precisa devolver a tela rápido, o despacho precisa acontecer logo, mas não *dentro* dela.

**É o que mais vai mudar.** O produto está em TRL 2 e a ordenação por taxa de comparecimento é hipótese declarada. Isolar o motor permite trocar a regra sem *redeploy* de tudo o que serve tela.

---

## As três plataformas

![[07 - Arquitetura/Anexos/arquitetura/multiplataforma.png|Nativo em cada plataforma contra núcleo compartilhado]]

Esta é a decisão de maior alcance do projeto, e a que mais se beneficia de ser tomada cedo — trocar depois custa reescrever o que já funciona.

O critério não é preferência de stack: é **quantas vezes a regra vai mudar**. A elegibilidade (RN04, RN05) e a ordenação (RN06) são hipóteses que a validação de campo existe para corrigir. Cada correção custa uma implementação na opção B e três na opção A — com o risco de as três divergirem em silêncio, que é o modo de falha caro: o Android passa a despachar para alguém que o iOS considera inelegível, e ninguém percebe até um profissional reclamar.

Contra o núcleo compartilhado pesa o requisito fechado de **app iOS nativo**, que precisa ser lido com cuidado. "Nativo" se refere à interface e à distribuição — SwiftUI de verdade, na App Store, com push da Apple. Um núcleo de regras compartilhado não impede nada disso. Vale confirmar essa leitura com a Academy antes de decidir, porque a interpretação oposta elimina a opção B inteira.

| Camada | Compartilhável | Por quê |
|---|---|---|
| Regras de domínio | **Sim** | Elegibilidade, reputação e máquina de estados são idênticas nas três plataformas |
| Contrato de API e modelos | **Sim** | Um só esquema, gerado a partir da especificação |
| Cache e fila offline | Parcial | A política é a mesma; o armazenamento é de cada plataforma |
| Interface | **Não** | SwiftUI, Compose e web têm idioma próprio — e o público usa Android de entrada, onde camada de abstração custa caro |
| Push, geolocalização, keychain | **Não** | API de sistema, diferente em cada plataforma |

---

## Nível 3 — Dentro do aplicativo

![[07 - Arquitetura/Anexos/arquitetura/camadas-do-app.png|Apresentação, domínio, dados e infraestrutura]]

Nenhuma seta sai do domínio. É isso que permite trocar a regra de elegibilidade sem tocar em tela, rede ou banco — e testá-la em milissegundos, sem simulador.

A camada de apresentação usa `@Observable`, alinhada ao que a equipe já pratica na Bancada, onde `EstadoDaBancada` é um store único e não há `ObservableObject` em lugar nenhum. Reaproveitar o padrão que o time domina vale mais que o MVVM canônico de livro.

---

## O contrato entre cliente e servidor

Três clientes construídos em paralelo por cinco pessoas só funcionam se o contrato for definido antes do código. Esta seção é o que permite alguém começar o app Android sem esperar o iOS ficar pronto.

**A especificação é o artefato, não a documentação dele.** Um arquivo OpenAPI versionado no repositório, de onde saem os modelos de cada cliente por geração de código. Modelo escrito à mão em três linguagens diverge — e diverge em silêncio, que é o que RN19 não pode tolerar.

### Princípios

| Princípio | Regra | Motivo |
|---|---|---|
| Versão no caminho | `/v1/vagas` | O app na loja demora dias para atualizar; a web atualiza no *refresh*. As duas versões convivem |
| Dinheiro em centavos | `"valor_centavos": 12000` | RN18. Nunca `120.00` em JSON — ponto flutuante é como o centavo se perde |
| Tempo em UTC ISO-8601 | `"inicio_em": "2026-09-19T21:00:00Z"` | RN18. O fuso é problema da tela, não do contrato |
| Idempotência na escrita | Cabeçalho `Idempotency-Key` | Rede ruim é o ambiente do usuário. Reenviar candidatura não pode criar duas |
| Erro é tipado | `{"erro": "posicao_ja_preenchida"}` | O cliente precisa distinguir "alguém chegou antes" de "servidor caiu" |

### Autenticação

Token de acesso curto (15 min) e token de renovação longo (30 dias), guardados no Keychain no iOS, Keystore no Android e cookie `HttpOnly` na web. RNF07 exige credencial protegida; `UserDefaults` e `localStorage` não atendem.

O cadastro do profissional é **progressivo** por RN14: nome, telefone, e-mail e data de nascimento bastam para receber o primeiro despacho. Verificação de identidade é passo posterior, e a ausência dela nunca bloqueia o cadastro — a barreira antes do primeiro trabalho é documentada como falha dos concorrentes.

### Os recursos do MVP

```http
POST   /v1/sessoes                      # login → par de tokens
POST   /v1/sessoes/renovar              # troca refresh por access
POST   /v1/usuarios                     # cadastro (RF01, RN20 no servidor)

GET    /v1/profissionais/me             # perfil, reputação, taxa
PATCH  /v1/profissionais/me             # funções, raio, disponibilidade (RF03)

POST   /v1/vagas                        # publicar (RF04, valida RN02)
POST   /v1/vagas/{id}/republicar        # RF05, só data e horário mudam
GET    /v1/vagas?lat=&lng=&funcao=&data=  # busca na região (RF07)
GET    /v1/vagas/{id}

POST   /v1/posicoes/{id}/candidaturas   # candidatar-se (RF08, idempotente)
POST   /v1/posicoes/{id}/confirmar      # confirmar (RF10, resolve RN19)
POST   /v1/posicoes/{id}/cancelar       # cancelar (RF14, motivo obrigatório)

POST   /v1/turnos/{id}/inicio           # registrar início (RF13)
POST   /v1/turnos/{id}/fim              # registrar fim
POST   /v1/turnos/{id}/avaliacao        # avaliação binária (RF15)

GET    /v1/operacao/em-risco            # painel, janela crítica (RF20)
POST   /v1/operacao/ocorrencias         # registrar intervenção

POST   /v1/dispositivos                 # registrar token de push
GET    /v1/exportacoes/turnos?formato=csv   # RF22, RN17
DELETE /v1/usuarios/me                  # exclusão → anonimização (RF25)
```

### A resposta que define o produto

`POST /v1/posicoes/{id}/confirmar` é o ponto onde RN19 vive. As três respostas possíveis são todas normais:

```jsonc
// 200 — ganhou a corrida
{ "estado": "confirmada", "turno_id": "…",
  "contato": { "telefone": "+5561…" } }   // RN10: liberado só agora

// 409 — alguém chegou antes. Não é erro de sistema.
{ "erro": "posicao_ja_preenchida" }

// 422 — deixou de ser elegível entre o despacho e o toque
{ "erro": "inelegivel", "motivo": "fora_do_raio" }
```

O `409` merece ênfase: no modo urgência, **todo mundo menos um recebe essa resposta, toda vez**. É o funcionamento normal, não uma exceção — e a tela precisa dizer "que pena, foi rápido", não "algo deu errado". Tratar isso como falha genérica é como o produto ganha fama de quebrado fazendo exatamente o que deveria.

### Erros

Um envelope só, com código estável em `snake_case` que o cliente pode comparar sem traduzir. A mensagem legível vem junto para *log*, nunca para a tela — texto de interface é do cliente, que conhece o contexto e o idioma.

| HTTP | Quando |
|---|---|
| `401` | Token ausente, expirado ou inválido |
| `403` | Autenticado, mas sem papel para a ação (RF21) |
| `409` | Conflito legítimo de estado: posição já preenchida, candidatura repetida |
| `422` | Regra de negócio recusou: campo faltando (RN02), menor de idade (RN20) |
| `429` | Limite de requisições |

---

## O caminho crítico

![[07 - Arquitetura/Anexos/arquitetura/caminho-critico.png|Sequência da publicação até a confirmação]]

---

## Entrega de notificação

RNF02 pede 99% das notificações entregues em até 60 segundos, com reenvio automático. É o requisito não funcional mais exigente do documento, e com razão: se a notificação não chega, não existe produto — só um mural passivo com passos extras. A segunda queixa mais repetida nas avaliações dos concorrentes é exatamente o aviso que não chega.

O que a arquitetura precisa ter:

- **Estado de entrega por despacho.** `despacho` guarda `estado_entrega`, `entregue_em` e `motivo_falha`. Sem isso não há como medir os 99%, e requisito que não se mede não vale.
- **Reenvio com recuo exponencial**, limitado pelo início do turno. Insistir numa notificação de turno que já começou é ruído.
- **Confirmação de leitura pelo cliente.** APNs e FCM confirmam entrega ao aparelho, não ao usuário. A distinção importa para o Painel decidir se liga para alguém.
- **Degradação declarada.** Push negado nas permissões é caso comum, não exceção. Quem recusou notificação precisa aparecer para o motor como inelegível de fato — despachar para quem não vai ver gasta uma posição na leva e atrasa o preenchimento.

---

## Segurança, privacidade e auditoria

| Exigência | Onde a arquitetura responde |
|---|---|
| RNF07 · HTTPS e credencial protegida | TLS obrigatório; token no Keychain/Keystore/cookie `HttpOnly` |
| RN15 · dado pessoal fora de log | Telemetria registra identificadores e eventos, nunca nome, telefone ou documento |
| RNF08 · exclusão em 15 dias | Anonimização preservando turno e avaliação da contraparte |
| RNF13 · auditabilidade | `ocorrencia` e `despacho` são append-only na prática |
| RN13 · suspensão com contestação | Suspensão é `ocorrencia` com motivo obrigatório; contestação é outra, vinculada |
| RN17 · prestação de contas de campanha | Exportação por período, com data, função, horário e valor |

---

## Escala e disponibilidade

RNF11 dimensiona o alvo em cerca de **30 mil estabelecimentos do DF** `[H]`; RNF12 pede 99,5% de disponibilidade **sem manutenção de quinta a domingo, entre 16h e 02h**.

Essa janela é a informação arquitetural mais útil do documento inteiro, e é fácil passar batido por ela. Ela diz que o pico de uso é exatamente o pico do setor — o turno de bar e evento de fim de semana. Consequências diretas:

- Migração e *deploy* acontecem de segunda a quarta, ou pela manhã. A arquitetura precisa suportar **migração sem downtime** desde cedo, porque a janela de parada é estreita — ver o padrão de duas fases em [[07 - Arquitetura/Modelagem de Banco de Dados#Migração e versionamento|Migração e versionamento]].
- O dimensionamento não pode ser pela média. Um sistema que aguenta a carga média do DF e cai às 17h de sexta falhou no único momento que importa.
- Latência e entrega precisam ser medidas **segmentadas por essa janela**. Um p99 mensal saudável esconde um p99 de sexta à noite terrível.

Na escala de uma praça só, isso é modesto em termos absolutos — uma instância de banco bem indexada e uma fila dão conta `[H]`. O risco não é volume, é concentração.

---

## As decisões em aberto

### Backend próprio ou gerenciado

| Caminho | A favor | Contra |
|---|---|---|
| **Próprio** (PostgreSQL + PostGIS) | Restrições declarativas de RN19 e RN02; consulta geográfica real; controle do motor | Mais infraestrutura para cinco pessoas operarem |
| **Gerenciado** (Supabase, Firebase) | Autenticação e push prontos; menos operação | Parte das garantias vira código de aplicação; sem transação multi-chave, RN19 deixa de ser garantia |

O critério não deveria ser preço nem familiaridade, e sim: **onde RN19 continua sendo uma garantia?** Confirmação dupla é o erro que "destrói confiança de uma vez só", e é a única regra cuja violação é irreversível.

### Cache local no cliente

O Documento de Requisitos deixa "SwiftData ou Core Data" em aberto. Para o uso previsto — cache de turnos confirmados por 24h (RNF06) e fila de ações — os dois servem. SwiftData é mais direto e combina com `@Observable`; Core Data tem migração mais madura. Como o protocolo `CacheLocal` isola a escolha, ela pode ser adiada até o primeiro cache real, mas não além.

---

## O que precisa existir para a v1

Em ordem de dependência, não de esforço:

1. **Banco com as nove tabelas do MVP** e as restrições de RN19, RN02, RN18 e RN20.
2. **Especificação OpenAPI dos recursos acima**, antes do primeiro cliente — é o que permite iOS, Android e web avançarem em paralelo.
3. **API de autenticação, vaga, candidatura e confirmação**, suficiente para o ciclo fechar.
4. **Motor de despacho com uma leva só.** Levas sucessivas são refinamento; despachar para os elegíveis certos é a tese.
5. **Push no iOS e no Android.** Sem notificação o produto não existe.
6. **App iOS com os quatro fluxos**: publicar, receber e candidatar, registrar turno, avaliar.
7. **Painel de Operação, ainda que uma lista.** É "o que impede o negócio de quebrar no primeiro mês".

Fica para depois sem prejuízo do ciclo: escala em lote (RF19), aval externo (RF17), exportação (RF22), suporte durante o turno (RF23).

---

## Decisões que este documento abre

| # | Decisão | Quando precisa estar respondida |
|---|---|---|
| D6 | O despacho roda como serviço próprio ou dentro da API | Antes da primeira leva real; afeta o orçamento de 30s de RNF03 |
| D7 | Cache local: SwiftData ou Core Data | Antes do primeiro cache; o protocolo isola até lá |
| D9 | Backend próprio ou gerenciado | Antes da primeira linha de backend — muda o significado de metade das restrições |
| D10 | Nativo nas três plataformas ou núcleo compartilhado | Antes de começar o Android. Confirmar antes com a Academy o que "iOS nativo" exige |
| D11 | A especificação OpenAPI é escrita antes ou junto do backend | Antes, se os três clientes forem construídos em paralelo |
| D13 | Provedor de push no Android (FCM ou alternativa) | Quando o Android entrar |

Nenhuma bloqueia o protótipo de baixa fidelidade de 28/09. Todas bloqueiam a primeira versão que alguém use de verdade.

---
← [[🏠 Início|Início]]
