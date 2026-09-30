---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, classes]
---

# Diagrama de Classe — Frila

Preenche a Seção 6.3 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]]. A tabela de lá lista as classes com atributos e métodos, mas em lista plana: entidade de domínio, serviço, repositório e view model lado a lado, sem dizer o que depende de quê. Este documento separa por camada, nomeia os tipos que estavam implícitos, transforma em tipo aquilo que hoje é comentário, e define como tudo isso é testado.

O modelo de dados que sustenta estas classes está em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]]; o sistema em volta, em [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]].

> [!info] Desenho e código (30/09/2026)
> Este é o modelo de design, fechado em 22/09. O app iOS, em `frila-frontend/iOS`, segue as mesmas camadas e a mesma regra de dependência, e já tem o fluxo do profissional; o do contratante vem em seguida. Onde o código usa outro nome, a tabela [[#Do desenho ao código (30/09)]] faz a correspondência. Despacho, elegibilidade, teto e agrupamento não têm classe no app: são funções do backend, e as classes que os descrevem aqui são a especificação delas.

> [!info] Swift no iOS, Kotlin no Android
> As assinaturas estão em Swift porque o app iOS é nativo em Swift e SwiftUI. O Android, previsto para a v1.2, será nativo em Kotlin (B01, 21/09/2026) e vai repetir este desenho no idioma dele — nenhuma classe de domínio usa algo específico da Apple. As regras que precisam valer igual nos três clientes não dependem dessa tradução: moram no backend, em funções do Supabase, escritas uma vez (ver [[07 - Arquitetura/Diagrama de Arquitetura#As três plataformas|As três plataformas]]). O domínio de cada app existe para a tela e para os testes.

---

## O princípio

![[07 - Arquitetura/Anexos/classes/regra-de-dependencia.png|O domínio é alvo de todas as setas e origem de nenhuma]]

**O domínio não sabe que existem rede, banco e tela.** É a única exigência arquitetural que o Documento de Requisitos justifica explicitamente: despacho, elegibilidade e reputação *"são as regras que sustentam a tese inteira, e precisam ser testáveis sem interface, sem rede e sem simulador, inclusive porque vão mudar conforme a validação de campo corrigir as hipóteses"*.

A consequência prática é imediata. Um produto sem validação de campo vai reescrever suas regras várias vezes — os 15 km, os 30 minutos do teto e as 3 horas do alerta são valores iniciais. Se essa regra estiver dentro de uma view, cada reescrita custa um simulador aberto e um teste manual. Se estiver num tipo puro, custa um teste de milissegundos. E, com três clientes nativos, é por isso que a versão que vale fica no backend: escrita uma vez, não três. `DespachoService` e `ElegibilidadeSpec` são a **especificação** desse comportamento: não entram no app, e a regra que vale está nas funções `privado.elegiveis`, `privado.despachar_vaga` e `privado.liberar_teto`, testadas em pgTAP no backend.

---

## Camada de domínio

![[07 - Arquitetura/Anexos/classes/dominio.png|Entidades, serviços e a especificação de elegibilidade]]

### Objetos de valor

Cinco tipos que o Documento de Requisitos usa sem nomear, e que existem para tornar erros inteiros impossíveis em vez de improváveis:

```swift
/// RN18: dinheiro é centavo inteiro. Não existe inicializador a partir de
/// Double — é o ponto exato onde o erro de arredondamento entraria.
struct Dinheiro: Equatable, Comparable, Codable, Sendable {
    let centavos: Int
    var descricao: String { … }          // "R$ 120,00", locale pt-BR
}

struct Coordenada: Equatable, Codable, Sendable {
    let latitude: Double
    let longitude: Double
    func distancia(ate outra: Coordenada) -> Double   // metros
}

struct Local: Equatable, Codable, Sendable {
    let endereco: String
    let ponto: Coordenada
}

/// RN18: intervalo em UTC. Exibir em America/Sao_Paulo é da apresentação.
struct Periodo: Equatable, Codable, Sendable {
    let inicio: Date
    let fim: Date
    func sobrepoe(_ outro: Periodo) -> Bool
}

/// RN02: o que está incluso é sim ou não, sem "não informado".
struct Inclusos: Equatable, Codable, Sendable {
    let refeicao: Bool
    let transporte: Bool
    let exigeMaterialProprio: Bool     // sim = o profissional leva o material
}
```

`Dinheiro` sem inicializador de `Double` é a diferença entre uma regra escrita e uma regra vigente. Um `init(reais: Double)` de conveniência reintroduz exatamente o que RN18 proíbe, e alguém o adicionaria em seis meses sem malícia nenhuma.

`Periodo.sobrepoe` é o método que sustenta a regra de turnos não sobrepostos — RN21, aprovada em 21/09 (D1). `Coordenada.distancia` é o que mede, no toque, a distância do check-in até o endereço da vaga (RN22). `Inclusos` com três `Bool` não opcionais é o que deixa duas vagas do mesmo valor comparáveis: com e sem refeição não são a mesma diária.

### Enumerações

O Documento de Requisitos cita `EstadoPosicao` e `ModoPreenchimento` como tipos, mas não define os casos. Ficam fechados aqui, iguais aos do banco:

```swift
enum ModoPreenchimento: String, Codable, Sendable { case urgencia, selecao }
enum EstadoVaga: String, Codable, Sendable { case publicada, preenchida, encerrada, cancelada }
enum EstadoPosicao: String, Codable, Sendable { case aberta, confirmada, cumprida, cancelada }
enum EstadoCandidatura: String, Codable, Sendable { case pendente, aceita, recusada, retirada, expirada }
enum EstadoEntrega: String, Codable, Sendable { case pendente, enviada, entregue, falhou }
enum PerfilConta: String, Codable, Sendable { case profissional, contratante }
enum PapelMembro: String, Codable, Sendable { case administrador, operador }
enum TipoRegistro: String, Codable, Sendable { case geolocalizado, manual }
enum Verificacao: String, Codable, Sendable { case pendente, verificado, naoVerificado = "nao_verificado" }
enum TipoOcorrencia: String, Codable, Sendable {
    case cancelamento, suspensao, contestacao, suporte, denuncia, revisaoDespacho = "revisao_despacho"
}
enum MotivoDenuncia: String, Codable, Sendable {
    case assedio, discriminacao, riscoSeguranca = "risco_seguranca", outro
}
```

Enum fechado, e não `String` solta: um estado que o compilador não conhece é um `switch` que esquece um caso em produção. `TipoOcorrencia` perdeu `intervencao` e `divergencia` em 21/09: o Frila não opera turnos (D01) e não arbitra divergência — vale o registro geolocalizado (A08).

### A confirmação, modelada como corrida

A primeira versão do Documento de Requisitos assinava `confirmar(_: Profissional) throws`; desde a v1.4.0 ele usa o tipo de resultado abaixo. Trocar `throws` por um tipo de resultado é mudança pequena com efeito grande:

```swift
enum ResultadoConfirmacao: Equatable {
    case confirmada(Turno)
    case jaPreenchida(por: UUID)      // RN19: alguém chegou antes
    case inelegivel(motivo: String)   // ex.: turno sobreposto (RN21)
}
```

RN19 não é condição de erro — é o funcionamento normal do modo urgência, onde *"o primeiro candidato aprovado leva"*. Todos os outros perdem, toda vez, por desenho. Com `throws`, perder a corrida entra no mesmo canal de um timeout de rede, e a tela precisa inspecionar o erro para decidir se mostra "que pena, foi rápido" ou "algo deu errado, tente de novo". Com o enum, o compilador exige que a tela trate os três casos, e a mensagem certa sai de graça. É o espelho exato do `409` do contrato de API. No código, a porta `ApiCliente` lança um erro tipado com o código do contrato, e o `CandidaturaViewModel` o converte em `ResultadoDaCandidatura` — confirmada, vaga preenchida, vaga encerrada, inelegível, conta suspensa —, que a tela trata caso a caso: a mesma ideia, um andar acima.

### Presença, modelada no turno

```swift
/// Um toque de check-in ou de check-out. A coordenada não entra: só a
/// distância até o endereço da vaga, medida no momento do toque (RN22).
struct RegistroDePresenca: Equatable, Codable, Sendable {
    let em: Date
    let tipo: TipoRegistro
    let distanciaMetros: Double?       // nulo quando a localização falhou
    var confirmadoEm: Date?            // contratante, só no manual
}

struct Turno: Identifiable, Sendable {
    let id: UUID
    let posicao: Posicao
    private(set) var checkin: RegistroDePresenca?
    private(set) var checkout: RegistroDePresenca?
    private(set) var verificacao: Verificacao      // começa .pendente
    let valorAcordadoCentavos: Int

    mutating func registrarCheckin(distanciaMetros: Double?, em: Date) throws
    mutating func confirmarCheckinManual(por contratante: Ator) throws
    mutating func registrarCheckout(distanciaMetros: Double?, em: Date) throws

    /// RN22: geolocalizado a até 200 m, ou manual confirmado pelo contratante.
    func temPresencaVerificada() -> Bool { verificacao == .verificado }
}
```

Não existe `temDivergencia()`. O registro geolocalizado é o que vale, e o contratante que discorda registra isso na avaliação (A08). No app, o `Turno` é modelo de leitura: check-in, check-out e confirmação são as RPCs `fazer_checkin`, `fazer_checkout` e `confirmar_checkin_manual`, e quem decide a verificação é o servidor. Os métodos acima descrevem a regra que essas funções aplicam. O check-in a mais de 200 m não é recusado: vira manual, à espera da confirmação do contratante. `verificacao` só chega a `.verificado` com prova — check-in geolocalizado a até 200 m ou manual confirmado —, espelhando o `CHECK verificacao_coerente` do banco; o turno que termina sem essa prova fica `.naoVerificado`. `temPresencaVerificada()` é o que libera a avaliação (RN07) e o que entra na taxa de comparecimento.

### Reputação como valor calculado

```swift
struct Reputacao: Equatable, Sendable {
    let positivas: Int
    let total: Int
    let taxaComparecimento: Double?    // nulo = sem histórico, nunca 0.0
    let turnosConsiderados: Int

    func temHistorico() -> Bool { total > 0 }

    /// RN08: sempre com denominador. "7 de 7 chamariam de novo".
    func descricao() -> String {
        guard temHistorico() else { return "Sem histórico" }
        return "\(positivas) de \(total) chamariam de novo"
    }
}
```

Não existe `Reputacao.media`, e não deve existir. RN07 proíbe média de 1 a 5 e RN08 exige o denominador — um `var media: Double` seria a porta pela qual a tela acabaria exibindo "0,86" em vez de "6 de 7", perdendo a informação que o produto inteiro aposta em mostrar.

O `Double?` repete no domínio a escolha do banco: sem histórico é `nil`, nunca zero. A taxa segue a definição de 21/09 (A11): turnos com presença verificada sobre turnos confirmados, com falta sendo não aparecer ou cancelar com menos de 24 horas. Ela aparece no perfil e não muda quem recebe notificação (RN06).

### O relógio é uma dependência

```swift
protocol Relogio: Sendable { var agora: Date { get } }

struct RelogioDoSistema: Relogio { var agora: Date { Date() } }
struct RelogioFixo: Relogio { let agora: Date }        // testes
```

Seis regras dependem de "que horas são": o alerta de vaga vazia na antecedência escolhida pelo contratante, com padrão de 3 horas (RF20); o teto de uma notificação a cada 30 minutos (RN23); a tolerância de 15 minutos antes do alerta de atraso; o fechamento do modo seleção 24 horas antes do início (RN24); a liberação da avaliação após o fim previsto (RN07); e a antecedência do cancelamento, que decide se ele conta como falta (RN12). Com `Date()` chamado dentro dos métodos, testar qualquer uma exige esperar o relógio real ou aceitar teste não determinístico.

---

## Camada de dados

![[07 - Arquitetura/Anexos/classes/portas-e-implementacoes.png|Cada porta com uma implementação real e uma de teste]]

O domínio declara o que precisa; a camada de dados resolve como. As duplas — `HTTP` e `EmMemoria`, push real e `Fake` — não são simetria decorativa: são o que permite a suíte do domínio rodar inteira sem rede. No iOS, o push real é o FCM, que entrega pela APNs.

### Cache e fila offline

RNF06 pede que turnos confirmados fiquem legíveis por 24 horas sem rede, e que ações feitas offline sejam enfileiradas. São dois tipos, não um:

```swift
protocol CacheLocal: Sendable {                 // SwiftData por trás (D7)
    func turnosConfirmados() async -> [Turno]
    func guardar(_ turnos: [Turno]) async
    func expirar(antes de: Date) async
}

/// Ações feitas sem rede, que precisam sair na ordem e uma vez só.
actor FilaDeAcoes {
    enum Acao: Codable {
        case registrarCheckin(turno: UUID, distanciaMetros: Double?, em: Date)
        case registrarCheckout(turno: UUID, distanciaMetros: Double?, em: Date)
        case avaliar(turno: UUID, resposta: Bool)
    }
    func enfileirar(_ acao: Acao)
    func drenar(com repositorio: VagaRepositorio) async
}
```

`FilaDeAcoes` é `actor` porque é onde a conexão voltando e o usuário tocando na tela competem pela mesma fila — a corrida que produz registro duplicado. O isolamento do ator resolve no compilador o que um `DispatchQueue` resolveria por disciplina; a idempotência pela chave natural (check-in por turno, avaliação por turno e lado) resolve o resto no servidor. **Candidatura nunca entra na fila:** no modo urgência, candidatar horas depois engana o profissional, que acharia que ainda disputa uma vaga já preenchida; sem rede, a tela diz que não há conexão.

Uma nota sobre o check-in carregar a data e a distância: o que vale é o **momento do toque**, não o momento em que a fila drenou. A localização é lida só naquele instante, nunca em segundo plano, a distância até o endereço da vaga é medida ali mesmo — o endereço já está no cache do turno confirmado — e só a distância vai para o servidor; a coordenada não sai do aparelho (RN22). Um profissional que faz check-in às 18h02 num subsolo sem internet, onde o GPS ainda funciona, e sincroniza às 21h precisa ter 18h02 no registro: o registro geolocalizado é o que vale (RN11), e registro que mente sobre o horário não vale nada. Quando a localização falha, `distanciaMetros` vai nulo e o check-in é manual, à espera da confirmação do contratante.

---

## Camada de apresentação

![[07 - Arquitetura/Anexos/classes/apresentacao.png|Os view models e o estado de tela como enum]]

`EstadoTela` como enum de casos exclusivos, e não três booleanos (`isLoading`, `hasError`, `isEmpty`), elimina por construção os estados impossíveis — carregando e com erro ao mesmo tempo, origem clássica do *spinner* eterno sobre uma mensagem de falha.

`validar()` em `PublicarVagaViewModel` é RN02 no ponto mais barato: a tela recusa antes da rede, inclusive o modo seleção para vaga que começa em menos de 24 horas — `Vaga.aceitaModoSelecao()` (RN24). Mas a mesma regra é reafirmada no domínio e no `NOT NULL` do banco — três camadas, de propósito. A da tela existe para dar mensagem boa; a do banco existe para estar certa.

`AcompanhamentoViewModel` substitui o antigo `PainelOperacaoViewModel`: orquestra, no perfil de contratante, as vagas em alerta (`emAlerta: [Posicao]`) e a confirmação de check-in manual (`checkinsPendentes: [Turno]`), com `carregar() async` e `confirmarCheckin(_: Turno) async`. O Painel do gestor, com vagas, contratados e turnos, é da versão web (B09); não existe painel de operação do Frila.

`SessaoUsuario` guarda o token **fora de si**: a referência vai para o Keychain (RNF07) e o objeto carrega só o identificador da credencial. Declarar `token: Token` como propriedade convida o token a aparecer em log de depuração e em dump de estado — e RN15 proíbe dado sensível em log.

O perfil da sessão também é fixo: `perfil: PerfilConta`, com `profissional` ou `contratante`, gravado no cadastro (RN25, 22/09). Não existe `trocarPerfil`: quem quiser o outro lado entra com outra conta, de outro e-mail, e cada conta vê só as telas do próprio perfil.

---

## Como isso é testado

A camada de domínio isolada só se paga se existir teste que a exercite. Decidido em 21/09 (B21): **Swift Testing** para a lógica e **XCTest** só para a interface, com XCUITest. Os dois convivem no mesmo projeto.

| Nível | O que cobre | Ferramenta | Roda em |
|---|---|---|---|
| **Regras críticas** | Elegibilidade, teto e agrupamento, corrida da RN19, turno sobreposto, presença, prazos, máquina de estados | pgTAP, scripts de corrida e o ciclo completo por HTTP | Na CI do `frila-backend` |
| **Domínio do app** | `Dinheiro`, `Periodo`, validação da vaga, distância, reputação exibida | Swift Testing | Milissegundos, sem rede nem simulador |
| **Dados e apresentação** | Repositórios contra o dublê em memória; fila offline drenando na ordem; view models | Swift Testing, implementações `EmMemoria` | Segundos |
| **Contrato** | Respostas reais de cada RPC contra a especificação; no app, fixtures e DTOs contra o mesmo `openapi.yaml` | `contrato-responde.sh` no backend; validação das fixtures e `ContratoTests` no iOS | Na CI dos dois repositórios |
| **Interface** | Os fluxos já prontos, ponta a ponta | XCUITest (XCTest), com o dublê em memória | Na CI do iOS |

Os casos que precisam existir desde o começo, porque cobrem regra cuja violação é irreversível — a maior parte deles no backend, onde a regra mora:

- Duas confirmações simultâneas na mesma posição: **exatamente uma** vence, a outra recebe `.jaPreenchida` (RN19).
- Profissional a mais de 15 km (fora da equipe de confiança), sem a função, indisponível, suspenso, bloqueado ou com turno sobreposto **não** aparece em `elegiveis()` (RN05, RN21).
- A equipe de confiança recebe mesmo além de 15 km, e nada mais muda quem recebe — nem taxa de comparecimento, nem pagamento (RN05, RN06).
- A segunda vaga para o mesmo profissional em menos de 30 minutos entra no agrupamento; a vaga urgente que começa em menos de 2 horas sai na hora e conta no teto (RN23).
- Check-in a 201 m vira manual, e o manual só vira presença com a confirmação do contratante (RN22).
- Avaliação pedida antes do fim previsto, ou para turno sem presença verificada, é recusada (RN07) — com `RelogioFixo`, não com `sleep`.
- Vaga em modo seleção que começa em menos de 24 horas é recusada; a que chega a 24 horas do início sem escolha é fechada e libera os candidatos (RN24).
- Depois de um bloqueio, as vagas do estabelecimento somem das notificações e da lista do profissional, e vice-versa (RF26).
- Perfil sem histórico devolve "Sem histórico", nunca "0 de 0" nem nota zero (RF16).
- Cancelamento reabre posição, registra autor, momento e motivo, e só conta como falta com menos de 24 horas (RN12).

---

## De requisito a classe

| Requisito | Classe responsável |
|---|---|
| RF03 funções, ponto base e disponibilidade | `Profissional`, `Disponibilidade` (grade semanal) |
| RF04 publicar vaga com poucos campos | `PublicarVagaViewModel`, `Estabelecimento.publicar`, `Inclusos` |
| RF06 notificação com teto e agrupamento | Backend: `privado.elegiveis`, `privado.despachar_vaga`, `privado.liberar_teto` e a Edge Function `enviar-push`; `DespachoService`, `NotificacaoService` e `ElegibilidadeSpec` são a especificação |
| RF07 lista de vagas do DF | `FeedVagasViewModel`, `VagaRepositorio.abertas(ordenadasPorDistanciaDe:filtro:)` |
| RF08 candidatura sem formulário | `FeedVagasViewModel.candidatar` |
| RF09 urgência e seleção | `ModoPreenchimento`, `Vaga.aceitaModoSelecao`, `Posicao.confirmar` |
| RF10 confirmação sem duplicidade | `ResultadoConfirmacao`, `VagaRepositorio.confirmar` |
| RF13 check-in e check-out | `Turno.registrarCheckin`, `Turno.registrarCheckout`, `Turno.confirmarCheckinManual`, `RegistroDePresenca` |
| RF14 cancelar e reabrir | `Posicao.reabrir`, `Ocorrencia` |
| RF15/RF16 avaliação e exibição | `Avaliacao`, `Reputacao` |
| RF18 equipe de confiança | `Estabelecimento.incluirNaEquipe`; no backend, a RPC `incluir_na_equipe` e `privado.elegiveis` |
| RF20 alerta de vaga vazia | `AcompanhamentoViewModel`, `Vaga.estaNaJanelaCritica` — o Painel do gestor é web |
| RF26 denunciar e bloquear | `Ocorrencia`; no backend, as RPCs `denunciar` e `bloquear` e o filtro de bloqueio em `privado.elegiveis` |
| RF27 por que recebo vagas | A RPC `criterios_de_notificacao` — os critérios exibidos são os mesmos que `privado.elegiveis` aplica |
| RNF06 leitura offline | `CacheLocal`, `FilaDeAcoes` |

Toda regra estruturante tem dono único. Quando duas classes poderiam responder, a de domínio responde e a outra chama — e, quando a regra precisa valer igual nos três clientes, quem responde de verdade é a função no backend.

---

## v1 e v2

**No MVP, no app:** `Vaga`, `Posicao`, `Profissional`, `Estabelecimento`, `Turno`, `RegistroDePresenca`, `Avaliacao`, `Reputacao`, os cinco objetos de valor, `Relogio`, os repositórios de vaga e profissional, `NotificacaoPort`, `CacheLocal`, `FilaDeAcoes` e as quatro classes de apresentação — `PublicarVagaViewModel`, `FeedVagasViewModel`, `AcompanhamentoViewModel` e `SessaoUsuario`. **No MVP, no backend:** o que `DespachoService`, `NotificacaoService` e `ElegibilidadeSpec` especificam.

**Fora do MVP:** `Evento` e `EscalaEmLote` (RF19 é "evite por ora" na matriz de impacto × esforço). O suporte é por e-mail (RF23) e não precisa de classe própria. `AvalExterno` saiu do produto em 21/09 (A12): só avalia quem trabalhou junto pelo Frila.

**Que nunca devem existir:** `Pagamento`, `Carteira`, `Mensagem`, `Nota` e `Comissao` — por RN09, RN10, RN07 e RN01, e pela mesma razão estrutural: a regra mais fácil de honrar é aquela que não tem onde ser violada. RN01 proíbe descontar comissão ou taxa do valor do turno; serviços opcionais pagos ao profissional podem existir no futuro, fora do valor do turno, e não entram na v1.

---

## Do desenho ao código (30/09)

O app iOS em `frila-frontend/iOS` (branch `main` de 30/09) tem quatro módulos — `FrilaDominio`, `FrilaDados`, `FrilaInfraestrutura` e a apresentação — e o alvo do app, que os compõe. O domínio não importa SwiftUI, Supabase, SwiftData nem CoreLocation, e a CI falha se algum arquivo fora de `Dados` importar o Supabase. Onde o nome mudou:

| No desenho | No código |
|---|---|
| `Profissional` / `Usuario` | `PerfilProfissional` / `Conta` |
| `Disponibilidade` | `JanelaDeDisponibilidade`, com `HoraDoDia` e `DataCivil` |
| `Local` | `local: String` e `ponto: Coordenada` na própria vaga |
| `Dinheiro.descricao` | `FormatadorFrila.dinheiro(_:)` |
| `Coordenada.distancia(ate:)` | `distancia(emMetrosDe:)` |
| `RegistroDePresenca` | `Presenca`, com a distância em metros inteiros, como no contrato |
| `VagaRepositorioHTTP` / `VagaRepositorioEmMemoria` | `SupabaseApiCliente` / `ApiClienteEmMemoria`, atrás da porta `ApiCliente` |
| `VagaRepositorio.abertas(ordenadasPorDistanciaDe:filtro:)` | `abertas(_: FiltroVagas)`, com a ordem vinda do servidor |
| `actor FilaDeAcoes` | protocolo `FilaDeAcoes`, implementado pelo actor `ArmazenamentoSwiftData`, com `SincronizadorAcoes` |
| `Vaga.aceitaModoSelecao()` | `Vaga.validar(agora:)`, que devolve `.selecaoSemAntecedencia` |
| `FeedVagasViewModel.candidatar` | `CandidaturaViewModel`, com `DetalheVagaViewModel` |
| `EstadoTela` | `EstadoDaLista`, `EstadoDoDetalhe` e `EstadoDaCandidatura`, um por tela |
| `SessaoUsuario {usuario, perfil, idCredencial}` | `SessaoUsuario {usuarioID, perfil}`; a sessão fica no Keychain, pelo supabase-swift |

Ainda não existem no código, porque são do fluxo do contratante ou da Sprint 2: `PublicarVagaViewModel`, `AcompanhamentoViewModel`, `Estabelecimento.publicar` e `incluirNaEquipe`, `Posicao.reabrir`, `Ocorrencia`, o push (FCM) e a localização no toque (CoreLocation). Os tipos que o código tem e o desenho não mostra são de infraestrutura e de tela: `ObservadorDeSessao`, `MonitorDeConexao`, `TurnoRepositorio`, `ContaRepositorio`, `ErroDaApi`, `PerfilPublico` e `AtualizacaoObrigatoriaViewModel`, entre outros.

---

## Decisões respondidas em 21/09/2026

| # | Decisão | Resposta |
|---|---|---|
| D6 | `DespachoService` roda no cliente ou no servidor? | No servidor, fora da requisição: Edge Function com `pg_cron` e `pgmq` (B15). Esta classe é a **especificação** do comportamento do backend, não código de cliente |
| D8 | O domínio vira pacote compartilhável? | Não há pacote de código comum entre Swift e Kotlin. As regras críticas moram no backend, escritas uma vez, e o domínio de cada app é módulo interno dele (B20, ajustada em 22/09) |
| D12 | Swift Testing ou XCTest | Swift Testing para a lógica e XCTest só para a interface, com XCUITest (B21) |

---
← [[🏠 Início|Início]]
