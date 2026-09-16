---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, classes]
---

# Diagrama de Classe — Frila

Preenche a Seção 6.3 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]]. A tabela de lá lista dezesseis classes com atributos e métodos, mas em lista plana: entidade de domínio, serviço, repositório e view model lado a lado, sem dizer o que depende de quê. Este documento separa por camada, nomeia os tipos que estavam implícitos e transforma em tipo aquilo que hoje é comentário.

O modelo de dados que sustenta estas classes está em [[07 - Arquitetura/Modelagem de Banco de Dados|Modelagem de Banco de Dados]].

---

## O princípio

**O domínio não sabe que existem rede, banco e tela.** É a única exigência arquitetural que o Documento de Requisitos justifica explicitamente: despacho, elegibilidade e reputação "são as regras que sustentam a tese inteira, e precisam ser testáveis sem interface, sem rede e sem simulador, inclusive porque vão mudar conforme a validação de campo corrigir as hipóteses".

Isso tem consequência prática imediata. Um produto em TRL 2, sem validação, vai reescrever sua regra de elegibilidade várias vezes. Se essa regra estiver dentro de uma view, cada reescrita custa um simulador aberto e um teste manual. Se estiver num tipo puro, custa um teste unitário de milissegundos.

Daí a regra de dependência, que vale em toda seta deste documento:

![[07 - Arquitetura/Anexos/diagrama-de-classe-o-principio.png|O princípio]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> flowchart LR
>     A["Apresentação<br/>views · view models"] --> D["Domínio<br/>entidades · serviços · specs"]
>     Dados["Dados<br/>repositórios · cliente HTTP · cache"] --> D
>     Infra["Infraestrutura<br/>push · geo · keychain"] --> D
>     A -.->|"só por protocolo"| Dados
>     Dados -.->|"só por protocolo"| Infra
> ```

O domínio é o alvo de todas as setas e origem de nenhuma. Quando precisa falar com o mundo, declara um protocolo e espera que alguém o implemente — nunca importa o implementador.

---

## Camada de domínio

### Objetos de valor

Quatro tipos que o Documento de Requisitos usa sem nomear, e que existem para tornar erros inteiros impossíveis em vez de improváveis:

```swift
/// RN18: dinheiro é centavo inteiro. Não existe inicializador a partir de
/// Double — é o ponto onde o erro de arredondamento entraria.
struct Dinheiro: Equatable, Comparable, Codable, Sendable {
    let centavos: Int
    init(centavos: Int) { self.centavos = centavos }
    var descricao: String { … }          // "R$ 120,00", locale pt-BR
}

struct Coordenada: Equatable, Codable, Sendable {
    let latitude: Double
    let longitude: Double
    func distancia(ate outra: Coordenada) -> Double   // metros, Haversine
}

struct Local: Equatable, Codable, Sendable {
    let endereco: String
    let ponto: Coordenada
}

/// RN18: intervalo em UTC. Exibição em America/Sao_Paulo é da apresentação.
struct Periodo: Equatable, Codable, Sendable {
    let inicio: Date
    let fim: Date
    var duracao: TimeInterval { fim.timeIntervalSince(inicio) }
    func sobrepoe(_ outro: Periodo) -> Bool
}
```

`Dinheiro` sem inicializador de `Double` é a diferença entre uma regra escrita e uma regra vigente. RN18 existe para evitar erro de arredondamento em dinheiro; um `init(reais: Double)` de conveniência reintroduz exatamente o que a regra proíbe, e alguém o adicionaria em seis meses sem malícia nenhuma.

`Periodo.sobrepoe` é o método que sustenta a regra de turnos não sobrepostos discutida na modelagem de banco — ver decisão D1 lá.

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

Enum fechado e não `String` solta é a mesma escolha que a Bancada já faz em `TipoNota` e `StatusTarefa`: um estado que o compilador não conhece é um `switch` que esquece um caso em produção.

### Entidades e serviços

![[07 - Arquitetura/Anexos/diagrama-de-classe-entidades-e-servicos.png|Entidades e serviços]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> classDiagram
>     class Vaga {
>         +UUID id
>         +Funcao funcao
>         +Periodo periodo
>         +Local local
>         +Dinheiro valor
>         +ModoPreenchimento modo
>         +EstadoVaga estado
>         +[Posicao] posicoes
>         +posicoesAbertas() [Posicao]
>         +estaNaJanelaCritica(agora, janela) Bool
>         +encerrar()
>     }
>     class Posicao {
>         +UUID id
>         +EstadoPosicao estado
>         +Profissional? profissional
>         +[Candidatura] candidaturas
>         +confirmar(profissional, agora) ResultadoConfirmacao
>         +reabrir(motivo) Ocorrencia
>     }
>     class Profissional {
>         +UUID id
>         +[Funcao] funcoes
>         +Double raioKm
>         +Coordenada pontoBase
>         +[Disponibilidade] disponibilidades
>         +Reputacao reputacao
>         +estaElegivel(para vaga, spec) Bool
>     }
>     class Estabelecimento {
>         +UUID id
>         +String nome
>         +Local endereco
>         +[Membro] membros
>         +[Profissional] equipeConfianca
>         +publicar(vaga) Vaga
>         +priorizar(profissional)
>     }
>     class Turno {
>         +UUID id
>         +Dinheiro valorAcordado
>         +Date? inicioRegistrado
>         +Date? fimRegistrado
>         +registrarInicio(por ator, em data)
>         +registrarFim(por ator, em data)
>         +temDivergencia() Bool
>     }
>     class Avaliacao {
>         +UUID id
>         +Ator autor
>         +Ator alvo
>         +Bool resposta
>     }
>     class Reputacao {
>         +Int positivas
>         +Int total
>         +Double? taxaComparecimento
>         +Int turnosConsiderados
>         +temHistorico() Bool
>         +descricao() String
>     }
>     class DespachoService {
>         +Int tamanhoLeva
>         +TimeInterval intervaloLeva
>         +elegiveis(vaga) [Profissional]
>         +ordenar(candidatos, vaga) [Profissional]
>         +despacharProximaLeva(vaga) LevaDespachada
>     }
>     class ElegibilidadeSpec {
>         +Double raioMaximo
>         +Bool exigeFuncao
>         +Bool exigeDisponibilidade
>         +satisfaz(profissional, vaga) Bool
>     }
>
>     Vaga "1" *-- "N" Posicao
>     Posicao "1" o-- "0..1" Profissional
>     Posicao "1" -- "0..1" Turno
>     Turno "1" -- "0..2" Avaliacao
>     Profissional "1" *-- "1" Reputacao
>     Estabelecimento "1" -- "N" Vaga
>     DespachoService ..> ElegibilidadeSpec
>     DespachoService ..> Vaga
>     DespachoService ..> Profissional
> ```

### A confirmação, modelada como corrida

O Documento de Requisitos assina `confirmar(_: Profissional) throws`. Trocar `throws` por um tipo de resultado é uma mudança pequena com efeito grande:

```swift
enum ResultadoConfirmacao: Equatable {
    case confirmada(Turno)
    case jaPreenchida(por: UUID)      // RN19: alguém chegou antes
    case inelegivel(motivo: String)
}
```

RN19 não é condição de erro — é o funcionamento normal do modo urgência, onde "o primeiro candidato aprovado leva". Todos os outros perdem, toda vez, por desenho. Com `throws`, perder a corrida entra no mesmo canal de um timeout de rede, e a tela precisa inspecionar o erro para decidir se mostra "que pena, foi rápido" ou "algo deu errado, tente de novo". Com o enum, o compilador exige que a tela trate os três casos, e a mensagem certa sai de graça.

### Reputação como valor calculado, não entidade

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

O `Double?` repete no domínio a escolha do banco: sem histórico é `nil`, nunca zero. RF16 exige que perfil novo apareça como sem histórico e não como nota mínima, e o opcional força cada chamador a decidir.

### O relógio é uma dependência

```swift
protocol Relogio: Sendable { var agora: Date { get } }

struct RelogioDoSistema: Relogio { var agora: Date { Date() } }
struct RelogioFixo: Relogio { let agora: Date }        // testes
```

Quatro regras dependem de "que horas são": a janela crítica de RF20, o intervalo entre levas de RF06, a liberação da avaliação após o fim previsto (RN07) e a antecedência registrada no cancelamento (RN12). Com `Date()` chamado dentro dos métodos, testar qualquer uma delas exige esperar o relógio real ou aceitar teste não determinístico. Com o protocolo, o teste da janela crítica roda em microssegundos e sempre dá o mesmo resultado.

---

## Camada de dados: portas e implementações

O domínio declara o que precisa; a camada de dados resolve como.

![[07 - Arquitetura/Anexos/diagrama-de-classe-camada-de-dados-portas-e-implementacoes.png|Camada de dados: portas e implementações]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> classDiagram
>     class VagaRepositorio {
>         <<protocol>>
>         +salvar(vaga)
>         +abertasProximas(de, raio) [Vaga]
>         +confirmar(posicao, profissional) ResultadoConfirmacao
>     }
>     class ProfissionalRepositorio {
>         <<protocol>>
>         +elegiveis(para vaga, spec, limite) [Profissional]
>         +atualizarReputacao(id)
>     }
>     class NotificacaoPort {
>         <<protocol>>
>         +enviar(despacho)
>         +confirmarEntrega(id)
>         +reenviarFalhas()
>     }
>     class LocalizacaoPort {
>         <<protocol>>
>         +posicaoAtual() Coordenada
>     }
>     class VagaRepositorioHTTP {
>         -ClienteHTTP cliente
>         -CacheLocal cache
>         -FilaDeAcoes fila
>     }
>     class VagaRepositorioEmMemoria {
>         -[UUID: Vaga] armazenamento
>     }
>     class NotificacaoServiceAPNs
>     class NotificacaoServiceFake
>
>     VagaRepositorio <|.. VagaRepositorioHTTP
>     VagaRepositorio <|.. VagaRepositorioEmMemoria
>     NotificacaoPort <|.. NotificacaoServiceAPNs
>     NotificacaoPort <|.. NotificacaoServiceFake
>     VagaRepositorioHTTP ..> CacheLocal
>     VagaRepositorioHTTP ..> FilaDeAcoes
> ```

As duplas — `HTTP` e `EmMemoria`, `APNs` e `Fake` — não são simetria decorativa. São o que permite a suíte de testes do domínio rodar inteira sem rede, que é a exigência que abre este documento.

### Cache e fila offline

RNF06 pede que turnos confirmados fiquem legíveis por 24 horas sem rede, e que ações feitas offline sejam enfileiradas. Isso são dois tipos, não um:

```swift
protocol CacheLocal: Sendable {
    func turnosConfirmados() async -> [Turno]
    func guardar(_ turnos: [Turno]) async
    func expirar(antes de: Date) async
}

/// Ações que o profissional fez sem rede e que precisam sair na ordem.
actor FilaDeAcoes {
    enum Acao: Codable { case candidatar(posicao: UUID)
                         case registrarInicio(turno: UUID, em: Date)
                         case registrarFim(turno: UUID, em: Date) }
    func enfileirar(_ acao: Acao)
    func drenar(com repositorio: VagaRepositorio) async
}
```

`FilaDeAcoes` é `actor` porque é o ponto onde a conexão voltando e o usuário tocando na tela competem pela mesma fila. É o tipo de corrida que produz candidatura duplicada — e o isolamento do ator resolve no compilador o que um `DispatchQueue` resolveria por disciplina.

Uma nota sobre `registrarInicio(em:)` carregar a data: a hora que vale é a do **momento do toque**, não a do momento em que a fila drenou. Um profissional que registra chegada às 18h02 num subsolo sem sinal e sincroniza às 21h precisa ter 18h02 no registro — RN11 diz que esse registro serve para resolver divergência, e um registro que mente sobre o horário resolve o contrário.

---

## Camada de apresentação

![[07 - Arquitetura/Anexos/diagrama-de-classe-camada-de-apresentacao.png|Camada de apresentação]]

> [!note]- Fonte do diagrama (Mermaid)
> ```mermaid
> classDiagram
>     class PublicarVagaViewModel {
>         +RascunhoVaga rascunho
>         +[CampoInvalido] erros
>         +EstadoTela estado
>         +validar() Bool
>         +publicar()
>         +carregarDeVagaAnterior(id)
>     }
>     class FeedVagasViewModel {
>         +[Vaga] vagas
>         +FiltroVagas filtro
>         +EstadoTela estado
>         +carregar()
>         +candidatar(posicao)
>     }
>     class PainelOperacaoViewModel {
>         +[PosicaoEmRisco] emRisco
>         +TimeInterval filtroJanela
>         +carregar()
>         +registrarIntervencao(ocorrencia)
>     }
>     class SessaoUsuario {
>         +Usuario usuario
>         +Perfil perfilAtivo
>         +trocarPerfil(perfil)
>         +encerrar()
>     }
>     class EstadoTela {
>         <<enum>>
>         ociosa
>         carregando
>         carregada
>         falha(Erro)
>     }
> ```

`EstadoTela` como enum com casos exclusivos, e não três booleanos (`isLoading`, `hasError`, `isEmpty`), elimina por construção os estados impossíveis — carregando e com erro ao mesmo tempo, que é a origem clássica do *spinner* eterno sobre uma mensagem de falha.

`validar()` em `PublicarVagaViewModel` é RN02 no ponto mais barato: a tela recusa antes da rede. Mas a mesma regra é reafirmada no domínio e no `NOT NULL` do banco — três camadas, de propósito. A da tela existe para dar mensagem boa; a do banco existe para estar certa.

`SessaoUsuario` guarda o token **fora de si**: a referência vai para o Keychain (RNF07), e o objeto carrega só o identificador da credencial. Assinar `token: Token` como propriedade convida o token a aparecer em log de depuração e em dump de estado — e RN15 proíbe dado sensível em log.

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

**No MVP:** `Vaga`, `Posicao`, `Profissional`, `Estabelecimento`, `Turno`, `Avaliacao`, `Reputacao`, `DespachoService`, `ElegibilidadeSpec`, os quatro objetos de valor, os repositórios de vaga e profissional, `NotificacaoPort`, `CacheLocal`, `FilaDeAcoes`, e as quatro classes de apresentação.

**Fora do MVP:** `Evento` e `EscalaEmLote` (RF19 é "evite por ora" na matriz de impacto × esforço), `AvalExterno` (RF17, prioridade média), `SuporteService` (RF23). Nenhuma delas participa do ciclo publicar → despachar → confirmar → executar → avaliar.

**Que nunca devem existir:** `Pagamento`, `Carteira`, `Mensagem`, `Nota`, `Assinatura`. Pelos mesmos motivos listados na modelagem de banco — RN01, RN07, RN09 e RN10 —, e pela mesma razão estrutural: a regra mais fácil de honrar é aquela que não tem onde ser violada.

---

## Decisões que este documento abre

| # | Decisão | Impacto |
|---|---|---|
| D6 | `DespachoService` roda no cliente ou no servidor? | Se o despacho é do servidor — e provavelmente é, por RNF02 e por push —, esta classe é a **especificação** do comportamento do backend, não código iOS. Muda o que o app precisa implementar |
| D7 | SwiftData ou Core Data para `CacheLocal`? | Em aberto no Documento de Requisitos. O protocolo isola a escolha, mas ela precisa ser tomada antes do primeiro cache real |
| D8 | O domínio vira pacote Swift compartilhável? | Só vale se a decisão de plataforma apontar para base comum com Android ou web. Enquanto for iOS nativo puro, é módulo interno |

---

← [[🏠 Início|Início]]
