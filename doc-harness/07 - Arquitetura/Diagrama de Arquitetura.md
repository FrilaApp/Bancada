---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, sistema]
---

# Diagrama de Arquitetura — Frila

Preenche a Seção 6.4 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve quatro camadas e uma lista de pacotes, mas não desenha o sistema nem enfrenta o que ainda está em aberto. As classes destas camadas estão em [[07 - Arquitetura/Diagrama de Classe|Diagrama de Classe]]; o esquema que elas persistem, em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].

> [!warning] O que está decidido e o que não está
> **Decidido:** existe um app iOS nativo. É o único requisito técnico fechado do projeto.
> **Em aberto:** a stack do backend, a escolha entre nativo nas duas plataformas ou base compartilhada, e o provedor de push do lado Android. Este documento marca `[H]` toda proposta e apresenta as alternativas com seus custos, em vez de simular uma decisão que o grupo ainda não tomou.

---

## Nível 1 — Contexto

Quem usa, e de que o sistema depende para existir.

![[07 - Arquitetura/Anexos/diagrama-de-arquitetura-nivel-1-contexto.png|Nível 1 — Contexto]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> flowchart TB
>     Prof(["Profissional<br/><i>garçom, bartender, montador</i>"])
>     Estab(["Contratante<br/><i>maître, gerente, produtor</i>"])
>     Oper(["Operador do Frila<br/><i>interno</i>"])
>
>     Frila["<b>Frila</b><br/>Publica turnos, despacha aos elegíveis,<br/>registra execução e reputação"]
>
>     Push["Push<br/><i>APNs · FCM</i>"]
>     Mapa["Geocodificação e mapa<br/><i>MapKit</i>"]
>     Contato["WhatsApp · e-mail<br/><i>liberado após confirmação</i>"]
>
>     Prof -->|"recebe vaga, candidata-se,<br/>registra turno"| Frila
>     Estab -->|"publica vaga,<br/>confirma, avalia"| Frila
>     Oper -->|"intervém na janela crítica"| Frila
>     Frila --> Push
>     Frila --> Mapa
>     Frila -.->|"apenas após RN10"| Contato
> ```

A seta pontilhada é uma decisão de produto, não um detalhe de integração: RN10 proíbe liberar contato antes da confirmação, porque "antes da confirmação não há compromisso, e liberar contato transforma a plataforma em lista de telefones". O sistema conhece o contato o tempo todo e o entrega num único momento.

Não há caixa de gateway de pagamento, e isso é RN09: o valor é registrado, nunca custodiado.

---

## Nível 2 — Contêineres

![[07 - Arquitetura/Anexos/diagrama-de-arquitetura-nivel-2-conteineres.png|Nível 2 — Contêineres]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> flowchart LR
>     subgraph Clientes["Clientes"]
>         direction TB
>         iOS["<b>App iOS</b><br/>Swift · SwiftUI · iOS 16+"]
>         Android["<b>App Android</b> [H]<br/>Android 9+ · 2 GB RAM"]
>         Web["<b>Web</b> [H]<br/>estabelecimento"]
>         Painel["<b>Painel de Operação</b><br/>web interno"]
>     end
>
>     subgraph Backend["Backend [H]"]
>         direction TB
>         API["<b>API</b><br/>autenticação · vagas<br/>candidaturas · turnos"]
>         Fila[["Fila de trabalho"]]
>         Motor["<b>Motor de Despacho</b><br/>elegibilidade · levas · reenvio"]
>         Agenda["<b>Agendador</b><br/>levas · lembretes<br/>janela crítica"]
>         BD[("<b>Banco</b><br/>PostgreSQL + PostGIS")]
>     end
>
>     subgraph Externos["Serviços externos"]
>         direction TB
>         APNs["APNs"]
>         FCM["FCM"]
>     end
>
>     iOS --> API
>     Android --> API
>     Web --> API
>     Painel --> API
>     API --> BD
>     API --> Fila
>     Agenda --> Fila
>     Fila --> Motor
>     Motor --> BD
>     Motor --> APNs
>     Motor --> FCM
>     APNs -.->|"push"| iOS
>     FCM -.->|"push"| Android
> ```

Os três produtos do Documento de Requisitos — app do Profissional, app do Estabelecimento e Painel de Operação — compartilham uma API só. O Painel não é um sistema à parte: é a mesma base de dados vista pela pergunta "o que está prestes a falhar?".

### Por que o despacho é um contêiner separado

Poderia ser uma função dentro da API. Não deve ser, por três motivos que vêm dos requisitos:

**Ele é assíncrono por natureza.** RF06 manda disparar a leva seguinte "esgotado o intervalo da leva com a posição ainda aberta". Isso é trabalho agendado que acontece minutos depois da requisição que o originou. Amarrá-lo ao ciclo de vida de uma requisição HTTP significa perdê-lo quando a requisição termina.

**Ele tem orçamento de tempo próprio.** RNF03 exige a primeira leva em até 30 segundos e RF04 exige que a publicação responda em menos de 60. São dois relógios diferentes: a publicação precisa devolver a tela rápido; o despacho precisa acontecer logo, mas não *dentro* dela.

**Ele vai mudar mais que o resto.** O produto está em TRL 2 e a ordenação por taxa de comparecimento é hipótese. Isolar o motor permite trocar a regra de elegibilidade sem redeploy de tudo o que serve tela.

---

## Nível 3 — Dentro do app iOS

As quatro camadas do Documento de Requisitos, com a regra de dependência explícita.

![[07 - Arquitetura/Anexos/diagrama-de-arquitetura-nivel-3-dentro-do-app-ios.png|Nível 3 — Dentro do app iOS]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> flowchart TB
>     subgraph Apresentacao["Apresentação"]
>         Views["Views SwiftUI<br/><i>Publicação · Feed · Turno · Perfil</i>"]
>         VMs["View models<br/><i>@Observable</i>"]
>     end
>     subgraph Dominio["Domínio — sem rede, sem UI"]
>         Ent["Entidades<br/><i>Vaga · Posicao · Turno</i>"]
>         Serv["Serviços<br/><i>Despacho · Reputação</i>"]
>         Spec["ElegibilidadeSpec"]
>         Portas["Protocolos<br/><i>Repositório · Notificação · Relógio</i>"]
>     end
>     subgraph Dados["Dados"]
>         Repo["Repositórios"]
>         HTTP["Cliente HTTP<br/><i>URLSession</i>"]
>         Cache["Cache local<br/><i>SwiftData ou Core Data</i> [H]"]
>         FilaOff["Fila de ações offline<br/><i>actor</i>"]
>     end
>     subgraph Infra["Infraestrutura"]
>         Notif["UserNotifications"]
>         Geo["CoreLocation · MapKit"]
>         Key["Keychain"]
>         Tele["Telemetria"]
>     end
>
>     Views --> VMs
>     VMs --> Ent
>     VMs --> Serv
>     Serv --> Spec
>     Serv --> Portas
>     Repo -.->|implementa| Portas
>     Repo --> HTTP
>     Repo --> Cache
>     Repo --> FilaOff
>     Notif -.->|implementa| Portas
>     Geo -.->|implementa| Portas
>     Key --> HTTP
> ```

As setas pontilhadas são inversão de dependência. O domínio define `NotificacaoPort` e `LocalizacaoPort`; `UserNotifications` e `CoreLocation` os satisfazem. É o que mantém a promessa de testar despacho e elegibilidade sem simulador.

A camada de apresentação usa `@Observable`, alinhada ao que a equipe já pratica na Bancada — onde `EstadoDaBancada` é um store único com `@Observable` e não há `ObservableObject` em lugar nenhum. Reaproveitar o padrão que o time já domina vale mais que o MVVM canônico de livro.

---

## O caminho crítico: da publicação ao bolso do profissional

O produto inteiro se resume a esta sequência acontecer em menos de trinta segundos.

![[07 - Arquitetura/Anexos/diagrama-de-arquitetura-o-caminho-critico-da-publicacao-ao-bolso-do-profissional.png|O caminho crítico: da publicação ao bolso do profissional]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> sequenceDiagram
>     participant E as Estabelecimento
>     participant A as API
>     participant B as Banco
>     participant M as Motor
>     participant P as Push
>     participant Pr as Profissional
>
>     E->>A: publicar vaga (RF04, <60s)
>     A->>B: grava vaga + N posições
>     A->>M: enfileira despacho
>     A-->>E: confirmação da publicação
>     Note over M: até 30s (RNF03)
>     M->>B: consulta elegíveis (RN05)
>     M->>B: ordena por confiança e comparecimento (RN06)
>     M->>B: grava despacho da leva 1
>     M->>P: envia notificações
>     P-->>Pr: "Garçom · sexta 18h · R$ 120"
>     Pr->>A: candidatar (1 toque, RF08)
>     A->>B: UPDATE condicional (RN19)
>     alt ganhou a corrida
>         A-->>Pr: confirmada
>         A->>P: notifica os dois lados (RF10)
>         A->>B: libera contato (RN10)
>     else alguém chegou antes
>         A-->>Pr: posição já preenchida
>     end
>     Note over M: posição ainda aberta ao fim do intervalo
>     M->>M: dispara leva 2
> ```

O `alt` no meio é RN19 desenhada. Não é tratamento de exceção — é o funcionamento normal do modo urgência, onde todo mundo menos um perde a corrida. A arquitetura precisa tornar essa perda barata e clara, porque ela acontece o tempo todo.

---

## Entrega de notificação

RNF02 pede 99% das notificações entregues em até 60 segundos, com reenvio automático. É o requisito não funcional mais exigente do documento, e com razão: se a notificação não chega, não existe produto — só um mural passivo com passos extras.

O que a arquitetura precisa ter para sustentar isso:

- **Estado de entrega por despacho.** A tabela `despacho` guarda `estado_entrega`, `entregue_em` e `motivo_falha`. Sem isso não há como medir os 99%, e um requisito que não se mede não vale.
- **Reenvio com recuo exponencial**, limitado pelo início do turno. Insistir numa notificação de turno que já começou é ruído.
- **Confirmação de leitura pelo cliente.** APNs confirma entrega ao dispositivo, não ao usuário. A distinção importa para o Painel de Operação decidir se liga para alguém.
- **Degradação declarada.** Push negado nas permissões do sistema é caso comum, não exceção. O profissional que recusou notificação precisa aparecer para o motor como inelegível de fato — despachar para quem não vai ver é gastar uma posição na leva e atrasar o preenchimento.

---

## Segurança, privacidade e auditoria

| Exigência | Onde a arquitetura responde |
|---|---|
| RNF07 · HTTPS e credencial protegida | TLS obrigatório; token no Keychain, nunca em `UserDefaults` nem em estado observável |
| RN15 · dado pessoal fora de log | Telemetria registra identificadores e eventos, jamais nome, telefone ou documento |
| RNF08 · exclusão em 15 dias | Anonimização preservando turno e avaliação da contraparte |
| RNF13 · auditabilidade | `ocorrencia` e `despacho` são append-only na prática: registram o que foi tentado e por quem |
| RN13 · suspensão com contestação | Suspensão é `ocorrencia` com motivo obrigatório; contestação é outra, vinculada |

A decisão de **não custodiar pagamento** (RN09) tem um efeito arquitetural que vale nomear: sem fluxo financeiro, o sistema sai inteiro do escopo de PCI-DSS e de boa parte do risco regulatório. Isso é um ganho de simplicidade grande para uma equipe de cinco pessoas em TRL 2 — e um dos motivos pelos quais adiar pagamento para a v2 é decisão de engenharia, não só de produto.

---

## Escala e disponibilidade

RNF11 dimensiona o alvo em cerca de **30 mil estabelecimentos do DF** `[H]`, e RNF12 pede 99,5% de disponibilidade **sem manutenção de quinta a domingo, entre 16h e 02h**.

Essa janela é a informação arquitetural mais útil do documento inteiro, e é fácil passar batido por ela. Ela diz que o pico de uso do sistema é exatamente o pico do setor — o turno de bar e evento de fim de semana. Consequências diretas:

- Migração de esquema e deploy acontecem de segunda a quarta, ou pela manhã. A arquitetura precisa suportar **migração sem downtime** desde cedo, porque a janela de parada é estreita.
- O dimensionamento não pode ser pela média. Um sistema que aguenta a carga média do DF e cai às 17h de sexta falhou no único momento que importa.
- Vale medir latência e entrega **segmentadas por essa janela**. Um p99 mensal saudável pode esconder um p99 de sexta à noite terrível.

Na escala de uma praça só, isso é modesto em termos absolutos — uma instância de banco bem indexada e uma fila dão conta `[H]`. O risco não é volume, é concentração.

---

## As decisões em aberto

### Nativo nas duas plataformas, ou base compartilhada

| Caminho | A favor | Contra |
|---|---|---|
| **Nativo iOS + nativo Android** | Melhor desempenho em aparelho de entrada, que é o do público-alvo; push e geo idiomáticos; iOS nativo já é requisito fechado | Duas implementações da mesma regra; cinco pessoas mantendo dois apps |
| **iOS nativo + base compartilhada** (KMP, Flutter) | Regra de domínio escrita uma vez | Contradiz parcialmente o requisito de iOS nativo; ferramenta nova para o time |

Observação: RNF04 exige **Android 9 com 2 GB de RAM**, e o Documento de Requisitos é explícito de que Android é a plataforma da maioria do trabalhador de base no Brasil. Qualquer escolha que degrade o Android para favorecer o iOS trabalha contra o alcance do produto — mesmo que o iOS seja o requisito da Academy.

### Backend próprio ou gerenciado

| Caminho | A favor | Contra |
|---|---|---|
| **Backend próprio** (PostgreSQL + PostGIS) | Restrições declarativas de RN19 e RN02; consulta geográfica real; controle do motor de despacho | Mais infraestrutura para cinco pessoas operarem |
| **Gerenciado** (Supabase, Firebase) | Autenticação e push prontos; menos operação | Parte das garantias vira código de aplicação; em base de documentos sem transação multi-chave, RN19 deixa de ser garantia |

O critério de decisão não deveria ser preço nem familiaridade, e sim: **onde RN19 continua sendo uma garantia?** Confirmação dupla é o erro que "destrói confiança de uma vez só", e é a única regra cuja violação é irreversível.

### SwiftData ou Core Data

O Documento de Requisitos deixa em aberto. Para o uso previsto — cache de turnos confirmados por 24h e fila de ações — os dois servem. SwiftData é mais direto e combina com `@Observable`; Core Data tem migração mais madura. Como o protocolo `CacheLocal` isola a escolha, ela pode ser adiada até o primeiro cache real, mas não além disso.

---

## O que precisa existir para a v1

Em ordem de dependência, não de esforço:

1. **Banco com as nove tabelas do MVP** e as restrições de RN19, RN02, RN18 e RN20.
2. **API de autenticação, vaga, candidatura e confirmação** — o suficiente para o ciclo fechar.
3. **Motor de despacho com uma leva só.** Levas sucessivas são refinamento; despachar para os elegíveis certos é a tese.
4. **Push no iOS.** Sem notificação o produto não existe.
5. **App iOS com os quatro fluxos**: publicar, receber e candidatar, registrar turno, avaliar.
6. **Painel de Operação, ainda que uma lista.** O Documento de Requisitos é enfático: é "o que impede o negócio de quebrar no primeiro mês".

O que fica para depois sem prejuízo do ciclo: escala em lote (RF19), aval externo (RF17), exportação CSV/PDF (RF22), suporte durante o turno (RF23), app Android e web.

---

## Decisões que este documento abre

| # | Decisão | Quando precisa estar respondida |
|---|---|---|
| D9 | Backend próprio ou gerenciado | Antes da primeira linha de backend — muda o significado de metade das restrições |
| D10 | Nativo nas duas plataformas ou base compartilhada | Antes de começar o Android; não bloqueia o iOS |
| D11 | O motor de despacho roda como serviço próprio ou dentro da API | Antes da primeira leva real; afeta o orçamento de 30s de RNF03 |
| D12 | Tamanho da leva e intervalo entre levas | Mesma decisão D2 da modelagem de banco |
| D13 | Provedor de push no Android | Só quando o Android entrar |

Nenhuma delas bloqueia o protótipo de baixa fidelidade de 28/09. Todas bloqueiam a primeira versão que alguém use de verdade.

---

← [[🏠 Início|Início]]
