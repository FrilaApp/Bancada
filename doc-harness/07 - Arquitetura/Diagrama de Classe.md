---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, classes]
---

# Diagrama de Classe — Frila

Preenche a Seção 6.3 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]]. A tabela de lá lista dezesseis classes com atributos e métodos, mas em lista plana: entidade de domínio, serviço, repositório e view model lado a lado, sem dizer o que depende de quê. Este documento separa por camada, nomeia os tipos que estavam implícitos, transforma em tipo aquilo que hoje é comentário, e define como tudo isso é testado.

O modelo de dados que sustenta estas classes está em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]]; o sistema em volta, em [[07 - Arquitetura/Diagrama de Arquitetura|Diagrama de Arquitetura]].

> [!info] Swift como notação, não como decisão
> As assinaturas estão em Swift porque o app iOS é o requisito fechado. Se a decisão de plataforma apontar para núcleo compartilhado, o mesmo desenho se traduz para Kotlin ou TypeScript sem mudar nada de estrutura — nenhuma classe de domínio usa algo específico da Apple.

---

## O princípio

![[07 - Arquitetura/Anexos/classes/regra-de-dependencia.png|O domínio é alvo de todas as setas e origem de nenhuma]]

**O domínio não sabe que existem rede, banco e tela.** É a única exigência arquitetural que o Documento de Requisitos justifica explicitamente: despacho, elegibilidade e reputação *"são as regras que sustentam a tese inteira, e precisam ser testáveis sem interface, sem rede e sem simulador, inclusive porque vão mudar conforme a validação de campo corrigir as hipóteses"*.

A consequência prática é imediata. Um produto em TRL 2, sem validação, vai reescrever sua regra de elegibilidade várias vezes. Se essa regra estiver dentro de uma view, cada reescrita custa um simulador aberto e um teste manual. Se estiver num tipo puro, custa um teste de milissegundos. Com três clientes, custa **três** reescritas manuais contra uma.

---

## Camada de domínio

![[07 - Arquitetura/Anexos/classes/dominio.png|Entidades, serviços e a especificação de elegibilidade]]

### Objetos de valor

Quatro tipos que o Documento de Requisitos usa sem nomear, e que existem para tornar erros inteiros impossíveis em vez de improváveis:

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
```

`Dinheiro` sem inicializador de `Double` é a diferença entre uma regra escrita e uma regra vigente. Um `init(reais: Double)` de conveniência reintroduz exatamente o que RN18 proíbe, e alguém o adicionaria em seis meses sem malícia nenhuma.

`Periodo.sobrepoe` é o método que sustenta a regra de turnos não sobrepostos — decisão D1 na modelagem de banco.

### Enumerações

O Documento de Requisitos cita `EstadoPosicao` e `ModoPreenchimento` como tipos, mas não define os casos. Ficam fechados aqui, iguais aos do banco:

```swift
enum ModoPreenchimento: String, Codable, Sendable { case urgencia, selecao }
enum EstadoVaga: String, Codable, Sendable { case publicada, preenchida, encerrada, cancelada }
enum EstadoPosicao: String, Codable, Sendable { case aberta, confirmada, cumprida, cancelada }
enum EstadoCandidatura: String, Codable, Sendable { case pendente, aceita, recusada, retirada, expirada }
enum EstadoEntrega: String, Codable, Sendable { case pendente, enviada, entregue, falhou }
enum PapelMembro: String, Codable, Sendable { case administrador, operador }
enum TipoOcorrencia: String, Codable, Sendable {
    case cancelamento, intervencao, suspensao, contestacao, suporte, divergencia
}
```

Enum fechado, e não `String` solta, é a mesma escolha que a Bancada já faz em `TipoNota` e `StatusTarefa`: um estado que o compilador não conhece é um `switch` que esquece um caso em produção.

### A confirmação, modelada como corrida

O Documento de Requisitos assina `confirmar(_: Profissional) throws`. Trocar `throws` por um tipo de resultado é mudança pequena com efeito grande:

```swift
enum ResultadoConfirmacao: Equatable {
    case confirmada(Turno)
    case jaPreenchida(por: UUID)      // RN19: alguém chegou antes
    case inelegivel(motivo: String)
}
```

RN19 não é condição de erro — é o funcionamento normal do modo urgência, onde *"o primeiro candidato aprovado leva"*. Todos os outros perdem, toda vez, por desenho. Com `throws`, perder a corrida entra no mesmo canal de um timeout de rede, e a tela precisa inspecionar o erro para decidir se mostra "que pena, foi rápido" ou "algo deu errado, tente de novo". Com o enum, o compilador exige que a tela trate os três casos, e a mensagem certa sai de graça. É o espelho exato do `409` do contrato de API.

### Reputação como valor calculado

```swift
struct Reputacao: Equatable, Sendable {
    let positivas: Int
    let total: Int
    let taxaComparecimento: Double?    // nulo = sem histórico, nunca 0.0
    let turnosConsiderados: Int

    func temHistorico() -> Bool { total > 0 || turnosConsiderados > 0 }

    /// RN08: sempre com denominador. "7 de 7 chamariam de novo".
    func descricao() -> String {
        guard temHistorico() else { return "Sem histórico" }
        return "\(positivas) de \(total) chamariam de novo"
    }
}
```

Não existe `Reputacao.media`, e não deve existir. RN07 proíbe média de 1 a 5 e RN08 exige o denominador — um `var media: Double` seria a porta pela qual a tela acabaria exibindo "0,86" em vez de "6 de 7", perdendo a informação que o produto inteiro aposta em mostrar.

O `Double?` repete no domínio a escolha do banco: sem histórico é `nil`, nunca zero.

### O relógio é uma dependência

```swift
protocol Relogio: Sendable { var agora: Date { get } }

struct RelogioDoSistema: Relogio { var agora: Date { Date() } }
struct RelogioFixo: Relogio { let agora: Date }        // testes
```

Quatro regras dependem de "que horas são": a janela crítica de RF20, o intervalo entre levas de RF06, a liberação da avaliação após o fim previsto (RN07) e a antecedência registrada no cancelamento (RN12). Com `Date()` chamado dentro dos métodos, testar qualquer uma exige esperar o relógio real ou aceitar teste não determinístico.

---

## Camada de dados

![[07 - Arquitetura/Anexos/classes/portas-e-implementacoes.png|Cada porta com uma implementação real e uma de teste]]

O domínio declara o que precisa; a camada de dados resolve como. As duplas — `HTTP` e `EmMemoria`, `APNs` e `Fake` — não são simetria decorativa: são o que permite a suíte do domínio rodar inteira sem rede.

### Cache e fila offline

RNF06 pede que turnos confirmados fiquem legíveis por 24 horas sem rede, e que ações feitas offline sejam enfileiradas. São dois tipos, não um:

```swift
protocol CacheLocal: Sendable {
    func turnosConfirmados() async -> [Turno]
    func guardar(_ turnos: [Turno]) async
    func expirar(antes de: Date) async
}

/// Ações feitas sem rede, que precisam sair na ordem e uma vez só.
actor FilaDeAcoes {
    enum Acao: Codable {
        case candidatar(posicao: UUID, chave: UUID)   // chave = Idempotency-Key
        case registrarInicio(turno: UUID, em: Date)
        case registrarFim(turno: UUID, em: Date)
    }
    func enfileirar(_ acao: Acao)
    func drenar(com repositorio: VagaRepositorio) async
}
```

`FilaDeAcoes` é `actor` porque é onde a conexão voltando e o usuário tocando na tela competem pela mesma fila — a corrida que produz candidatura duplicada. O isolamento do ator resolve no compilador o que um `DispatchQueue` resolveria por disciplina; a `chave` de idempotência resolve o resto no servidor.

Uma nota sobre `registrarInicio(em:)` carregar a data: a hora que vale é a do **momento do toque**, não a do momento em que a fila drenou. Um profissional que registra chegada às 18h02 num subsolo sem sinal e sincroniza às 21h precisa ter 18h02 no registro — RN11 diz que esse registro serve para resolver divergência, e registro que mente sobre o horário resolve o contrário.

---

## Camada de apresentação

![[07 - Arquitetura/Anexos/classes/apresentacao.png|Os view models e o estado de tela como enum]]

`EstadoTela` como enum de casos exclusivos, e não três booleanos (`isLoading`, `hasError`, `isEmpty`), elimina por construção os estados impossíveis — carregando e com erro ao mesmo tempo, origem clássica do *spinner* eterno sobre uma mensagem de falha.

`validar()` em `PublicarVagaViewModel` é RN02 no ponto mais barato: a tela recusa antes da rede. Mas a mesma regra é reafirmada no domínio e no `NOT NULL` do banco — três camadas, de propósito. A da tela existe para dar mensagem boa; a do banco existe para estar certa.

`SessaoUsuario` guarda o token **fora de si**: a referência vai para o Keychain (RNF07) e o objeto carrega só o identificador da credencial. Declarar `token: Token` como propriedade convida o token a aparecer em log de depuração e em dump de estado — e RN15 proíbe dado sensível em log.

---

## Como isso é testado

A camada de domínio isolada só se paga se existir teste que a exercite. A divisão:

| Nível | O que cobre | Ferramenta | Roda em |
|---|---|---|---|
| **Domínio** | Elegibilidade, ordenação, máquina de estados, reputação, `Dinheiro`, `Periodo` | Swift Testing ou XCTest | Milissegundos, sem rede nem simulador |
| **Dados** | Repositórios contra servidor falso; fila offline drenando na ordem | Mesma suíte, implementações `EmMemoria` | Segundos |
| **Contrato** | Respostas reais da API contra o esquema OpenAPI | Teste de integração | No CI, contra ambiente de teste |
| **Interface** | Os quatro fluxos ponta a ponta | XCUITest | Antes de cada release |

Os casos que precisam existir desde o começo, porque cobrem regra cuja violação é irreversível:

- Duas confirmações simultâneas na mesma posição: **exatamente uma** vence, a outra recebe `.jaPreenchida` (RN19).
- Profissional fora do raio, sem a função, ou indisponível na janela **não** aparece em `elegiveis()` (RN05).
- A ordenação respeita equipe de confiança antes de taxa de comparecimento, e nada além disso a altera (RN06).
- Perfil sem histórico devolve "Sem histórico", nunca "0 de 0" nem nota zero (RF16).
- Avaliação pedida antes do fim previsto do turno é recusada (RN07) — com `RelogioFixo`, não com `sleep`.
- Cancelamento reabre posição e registra autor, momento e motivo (RN12).

---

## De requisito a classe

| Requisito | Classe responsável |
|---|---|
| RF03 funções, raio e disponibilidade | `Profissional`, `Disponibilidade` |
| RF04 publicar vaga em 60s | `PublicarVagaViewModel`, `Estabelecimento.publicar` |
| RF06 despacho em levas | `DespachoService`, `ElegibilidadeSpec` |
| RF08 candidatura em um toque | `FeedVagasViewModel.candidatar` |
| RF09 urgência e seleção | `ModoPreenchimento`, `Posicao.confirmar` |
| RF10 confirmação sem duplicidade | `ResultadoConfirmacao`, `VagaRepositorio.confirmar` |
| RF13 início e fim efetivos | `Turno.registrarInicio/registrarFim` |
| RF14 cancelar e reabrir | `Posicao.reabrir`, `Ocorrencia` |
| RF15/RF16 avaliação e exibição | `Avaliacao`, `Reputacao` |
| RF18 equipe de confiança | `Estabelecimento.priorizar`, `DespachoService.ordenar` |
| RF20 painel e janela crítica | `PainelOperacaoViewModel`, `Vaga.estaNaJanelaCritica` |
| RNF06 leitura offline | `CacheLocal`, `FilaDeAcoes` |

Toda regra estruturante tem dono único. Quando duas classes poderiam responder, a de domínio responde e a outra chama.

---

## v1 e v2

**No MVP:** `Vaga`, `Posicao`, `Profissional`, `Estabelecimento`, `Turno`, `Avaliacao`, `Reputacao`, `DespachoService`, `ElegibilidadeSpec`, os quatro objetos de valor, `Relogio`, os repositórios de vaga e profissional, `NotificacaoPort`, `CacheLocal`, `FilaDeAcoes` e as quatro classes de apresentação.

**Fora do MVP:** `Evento` e `EscalaEmLote` (RF19 é "evite por ora" na matriz de impacto × esforço), `AvalExterno` (RF17), `SuporteService` (RF23). Nenhuma participa do ciclo publicar → despachar → confirmar → executar → avaliar.

**Que nunca devem existir:** `Pagamento`, `Carteira`, `Mensagem`, `Nota`, `Assinatura` — por RN01, RN07, RN09 e RN10, e pela mesma razão estrutural: a regra mais fácil de honrar é aquela que não tem onde ser violada.

---

## Decisões que este documento abre

| # | Decisão | Impacto |
|---|---|---|
| D6 | `DespachoService` roda no cliente ou no servidor? | Provavelmente no servidor, por RNF02 e por push. Nesse caso esta classe é a **especificação** do comportamento do backend, não código de cliente |
| D8 | O domínio vira pacote compartilhável? | Depende de D10 na arquitetura. Enquanto for nativo em cada plataforma, é módulo interno de cada uma |
| D12 | Swift Testing ou XCTest | A Bancada usa XCTest hoje, com 195 testes. Manter reduz atrito; Swift Testing é mais direto para casos parametrizados |

---
← [[🏠 Início|Início]]
