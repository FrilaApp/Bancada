---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, banco-de-dados]
---

# Modelagem de Banco de Dados — Frila

Preenche a Seção 6.2 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve as dezesseis entidades em tabela mas não traz o desenho nem o esquema físico. Aqui estão o diagrama, o DDL com as restrições que transformam regra de negócio em constraint, a máquina de estados que o código vai seguir, e o plano de migração para quando o esquema mudar.

> [!info] Estado do projeto
> TRL 2: sem código e sem validação de campo. A stack do backend **não está decidida** — o único requisito técnico fechado é o app iOS nativo. Este documento assume PostgreSQL para poder ser específico; [[#Se não for PostgreSQL]] diz o que muda se não for. Toda premissa de comportamento de usuário carrega `[H]`.

---

## O que o esquema precisa garantir

Um modelo de dados é bom quando as regras que não podem ser violadas moram nele, e não na aplicação que o chama. Aplicação tem bug, tem corrida entre requisições, tem deploy pela metade. O banco é o último lugar onde uma regra ainda vale — e com três clientes diferentes (iOS, Android e web) chamando a mesma API, é também o único lugar onde a regra vale **uma vez só**.

Cinco das vinte regras de negócio são dessa natureza. Se falharem uma vez, destroem a confiança que o produto existe para construir:

| Regra | O que exige | Onde vive no esquema |
|---|---|---|
| RN19 | Uma posição nunca confirmada para dois profissionais | `UPDATE` condicional + `CHECK` de coerência em `posicao` |
| RN18 | Dinheiro em centavos inteiros, tempo em UTC | `BIGINT` e `timestamptz` em toda coluna monetária e temporal |
| RN20 | Cadastro só para maiores de 18 | `CHECK` sobre `nascimento` em `usuario` |
| RN02 | Vaga sem função, data, horário, local ou valor não existe | `NOT NULL` nas seis colunas de `vaga` |
| RN07 | Avaliação binária, bidirecional, só depois do fim previsto | `UNIQUE (turno_id, autor_id)` + `CHECK` temporal |

O resto do documento é, em boa medida, a defesa dessas cinco linhas.

---

## O modelo em três vistas

Dezesseis entidades num desenho só viram emaranhado. São três recortes do mesmo esquema, cada um respondendo a uma pergunta.

### O ciclo de uma vaga

![[07 - Arquitetura/Anexos/banco-de-dados/ciclo-da-vaga.png|O ciclo de uma vaga, da publicação à avaliação]]

O eixo é uma cadeia só — **`vaga` → `posicao` → `turno` → `avaliacao`** —, o ciclo de vida de uma unidade de trabalho da publicação à reputação. `despacho` e `candidatura` penduram-se nela como o registro de quem foi chamado e quem respondeu.

### Uma conta, dois papéis

![[07 - Arquitetura/Anexos/banco-de-dados/identidade-e-papeis.png|Usuário, profissional, estabelecimento e a tabela de vínculo]]

### O que decide quem recebe o despacho

![[07 - Arquitetura/Anexos/banco-de-dados/elegibilidade.png|Função, disponibilidade e equipe de confiança em torno do profissional]]

---

## As tabelas

### Identidade e perfis

`usuario` é a conta de acesso; `profissional` e `membro_estabelecimento` são papéis sobre ela. A separação existe porque uma mesma pessoa pode ser garçom num fim de semana e operar o cadastro do buffet do cunhado no outro — e porque o histórico do estabelecimento precisa sobreviver à troca de responsável (RF21).

```sql
CREATE TYPE estado_conta AS ENUM ('ativa', 'suspensa', 'anonimizada');

CREATE TABLE usuario (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text        NOT NULL,
  telefone        text        NOT NULL,
  email           citext      NOT NULL,
  senha_hash      text        NOT NULL,
  nascimento      date        NOT NULL,
  estado          estado_conta NOT NULL DEFAULT 'ativa',
  criado_em       timestamptz NOT NULL DEFAULT now(),
  anonimizado_em  timestamptz,

  -- RN20: maioridade verificada na escrita, não na tela.
  CONSTRAINT maior_de_idade
    CHECK (nascimento <= (CURRENT_DATE - INTERVAL '18 years')),
  CONSTRAINT anonimizacao_coerente
    CHECK ((estado = 'anonimizada') = (anonimizado_em IS NOT NULL))
);

CREATE UNIQUE INDEX usuario_email_ativo
  ON usuario (email) WHERE estado <> 'anonimizada';
CREATE UNIQUE INDEX usuario_telefone_ativo
  ON usuario (telefone) WHERE estado <> 'anonimizada';
```

O índice único é **parcial** de propósito. RF25 manda anonimizar em vez de apagar, para preservar o histórico da contraparte; se a unicidade fosse total, o e-mail de uma conta encerrada bloquearia para sempre quem quisesse voltar com o mesmo endereço.

`nascimento` substitui o `maioridade_confirmada: boolean` da tabela original do Documento de Requisitos. Um booleano que o cliente envia não é verificação de nada — é a tela dizendo ao banco aquilo que a tela quis. Com a data, a restrição é verificável e o `CHECK` faz o trabalho.

```sql
CREATE TABLE profissional (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id          uuid NOT NULL UNIQUE REFERENCES usuario(id),
  raio_km             numeric(5,1) NOT NULL DEFAULT 10
                        CHECK (raio_km > 0 AND raio_km <= 100),
  ponto_base          geography(Point, 4326) NOT NULL,
  -- Desnormalizações de leitura. Verdade em turno/avaliacao; ver §Reputação.
  taxa_comparecimento numeric(4,3) CHECK (taxa_comparecimento BETWEEN 0 AND 1),
  turnos_realizados   integer NOT NULL DEFAULT 0,
  aval_positivas      integer NOT NULL DEFAULT 0,
  aval_total          integer NOT NULL DEFAULT 0,
  CONSTRAINT aval_coerente CHECK (aval_positivas <= aval_total)
);
```

`taxa_comparecimento` é **nula até existir histórico**, e isso é deliberado. RF16 exige que perfil sem histórico apareça como sem histórico, e não como nota zero — `0.0` e `NULL` contam histórias opostas sobre alguém que acabou de chegar. O `NULL` obriga quem lê a decidir o que exibir.

`aval_positivas` e `aval_total` existem para atender RN08, que manda sempre mostrar o denominador. Guardar só o percentual tornaria "7 de 7" irrecuperável, e é exatamente o denominador que separa confiança real de amostra pequena.

### Estabelecimento e equipe

```sql
CREATE TYPE tipo_estabelecimento AS ENUM ('food_service', 'evento', 'campanha');
CREATE TYPE papel_membro        AS ENUM ('administrador', 'operador');

CREATE TABLE estabelecimento (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  documento  text NOT NULL UNIQUE,          -- CNPJ ou CPF, só dígitos
  tipo       tipo_estabelecimento NOT NULL,
  endereco   text NOT NULL,
  ponto      geography(Point, 4326) NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  aval_positivas integer NOT NULL DEFAULT 0,
  aval_total     integer NOT NULL DEFAULT 0
);

CREATE TABLE membro_estabelecimento (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id         uuid NOT NULL REFERENCES usuario(id),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento(id),
  papel              papel_membro NOT NULL,
  criado_em          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, estabelecimento_id)
);
```

O estabelecimento tem reputação própria porque RN07 manda avaliar nos dois sentidos. Essa é a correção de assimetria que o produto usa contra o setor inteiro: em todo concorrente pesquisado só o contratante avalia, e as piores notas vêm de quem trabalha.

### Catálogo de funções

```sql
CREATE TABLE funcao (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      text NOT NULL UNIQUE,
  categoria text NOT NULL,
  ativo     boolean NOT NULL DEFAULT true
);

CREATE TABLE profissional_funcao (
  profissional_id uuid NOT NULL REFERENCES profissional(id) ON DELETE CASCADE,
  funcao_id       uuid NOT NULL REFERENCES funcao(id),
  PRIMARY KEY (profissional_id, funcao_id)
);
```

Função é catálogo fechado, não texto livre. Se o profissional digita "garçom", "garcom" e "Garçonete", a elegibilidade de RN05 vira busca por aproximação — e notificar quem não é elegível é o erro que mata o canal de notificação, que é o produto.

O catálogo inicial sai dos setores mapeados no Documento de Visão. É dado de partida, não esquema, e precisa ser conferido em campo `[H]`:

| Categoria | Funções |
|---|---|
| Salão | garçom · garçonete · maître · hostess · runner · cumim |
| Bar | bartender · barista · auxiliar de bar |
| Cozinha | chapeiro · pizzaiolo · auxiliar de cozinha · copeiro · confeiteiro |
| Evento | montador · desmontador · recepcionista · credenciamento · segurança de sala |
| Apoio | limpeza pós-evento · carregador · manobrista · estoquista |
| Campanha | panfletagem · cabo eleitoral · apoio de comício |

### Disponibilidade

```sql
CREATE TABLE disponibilidade (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id uuid NOT NULL REFERENCES profissional(id) ON DELETE CASCADE,
  dia_semana      smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio     time NOT NULL,
  hora_fim        time NOT NULL,
  CONSTRAINT janela_nao_vazia CHECK (hora_inicio <> hora_fim)
);
```

A restrição **não** exige `hora_fim > hora_inicio`. Um bar fecha às 2h; a janela 18:00–02:00 é a mais comum do setor, não uma exceção. Quem escreve `CHECK (hora_fim > hora_inicio)` por reflexo exclui do produto justamente o turno que ele existe para preencher.

### Vaga, posição e evento

```sql
CREATE TYPE modo_preenchimento AS ENUM ('urgencia', 'selecao');
CREATE TYPE estado_vaga        AS ENUM ('publicada', 'preenchida', 'encerrada', 'cancelada');
CREATE TYPE estado_posicao     AS ENUM ('aberta', 'confirmada', 'cumprida', 'cancelada');

CREATE TABLE evento (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento(id),
  nome               text NOT NULL,
  data               date NOT NULL,
  local              text NOT NULL
);

CREATE TABLE vaga (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento(id),
  evento_id          uuid REFERENCES evento(id),
  funcao_id          uuid NOT NULL REFERENCES funcao(id),
  inicio_em          timestamptz NOT NULL,
  fim_em             timestamptz NOT NULL,
  local              text NOT NULL,
  ponto              geography(Point, 4326) NOT NULL,
  valor_centavos     bigint NOT NULL CHECK (valor_centavos > 0),
  modo               modo_preenchimento NOT NULL,
  estado             estado_vaga NOT NULL DEFAULT 'publicada',
  publicado_em       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT turno_tem_duracao CHECK (fim_em > inicio_em)
);

CREATE TABLE posicao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id         uuid NOT NULL REFERENCES vaga(id) ON DELETE CASCADE,
  estado          estado_posicao NOT NULL DEFAULT 'aberta',
  profissional_id uuid REFERENCES profissional(id),
  confirmado_em   timestamptz,
  -- Desnormalizado de vaga para a constraint de sobreposição abaixo.
  inicio_em       timestamptz NOT NULL,
  fim_em          timestamptz NOT NULL,

  CONSTRAINT confirmacao_coerente CHECK (
    (estado IN ('confirmada','cumprida'))
      = (profissional_id IS NOT NULL AND confirmado_em IS NOT NULL)
  )
);
```

As seis colunas `NOT NULL` de `vaga` — função, início, fim, local, valor, e o estabelecimento que publica — são RN02 escrita em SQL. O Documento de Requisitos justifica a regra com avaliações de concorrentes em que o profissional chega ao local "sem muita informação"; aqui, uma vaga incompleta simplesmente não entra.

`valor_centavos bigint` é RN18. Centavo inteiro não acumula erro de arredondamento, e `bigint` não estoura em escala de evento — quarenta posições de uma formatura somadas ainda cabem com folga.

`evento_id` é nulo porque a maioria das vagas é avulsa. Só a escala em lote de RF19 agrupa, e forçar todo turno urgente de sexta-feira a inventar um evento seria burocracia inventada pelo esquema.

---

## A confirmação, que é onde o produto quebra se errar

RN19 diz que uma posição não pode ser confirmada para mais de um profissional, "mesmo sob candidaturas simultâneas". O `CHECK` acima garante coerência de estado, mas não resolve a corrida: duas requisições podem ler `estado = 'aberta'` no mesmo instante e escrever uma por cima da outra.

A defesa é fazer a própria escrita ser a verificação:

```sql
UPDATE posicao
   SET estado = 'confirmada',
       profissional_id = $1,
       confirmado_em = now()
 WHERE id = $2
   AND estado = 'aberta';      -- quem chega depois afeta 0 linhas
```

Se `rowcount = 0`, outro profissional chegou antes — e o segundo recebe "posição já preenchida", não uma confirmação falsa. É uma linha de SQL, e é ela que impede o modo de falha descrito na justificativa da regra: alguém que se desloca até o local sem ter trabalho.

### A regra que faltava nos requisitos

Nada impede hoje que o mesmo profissional seja confirmado para dois turnos sobrepostos. Ele aceitaria os dois de boa-fé e faltaria a um — desabando a própria taxa de comparecimento por um buraco do sistema, não por comportamento. Com `inicio_em` e `fim_em` desnormalizados em `posicao`, a proibição é declarativa:

```sql
ALTER TABLE posicao ADD CONSTRAINT sem_turno_sobreposto
  EXCLUDE USING gist (
    profissional_id WITH =,
    tstzrange(inicio_em, fim_em) WITH &&
  ) WHERE (estado IN ('confirmada','cumprida'));
```

A desnormalização tem um custo: quando o horário da vaga muda, as posições precisam acompanhar. Isso só acontece antes de haver confirmação, e um *trigger* de duas linhas resolve. **É decisão D1, e precisa do aval do grupo** — ver [[#Decisões que este documento abre]].

---

## Os estados de uma posição

![[07 - Arquitetura/Anexos/banco-de-dados/estados-da-posicao.png|Máquina de estados: aberta, confirmada, cumprida e cancelada]]

Quatro estados, e nenhum a mais. A tentação de criar um estado `reservada` — entre a candidatura e a confirmação — aparece em quase todo marketplace, e aqui seria um erro: no modo urgência o primeiro aprovado leva, e no modo seleção a posição fica aberta até a escolha do contratante. Nenhum dos dois comportamentos precisa de estado intermediário, e cada estado a mais é um caminho a mais pelo qual RN19 pode falhar.

Transições válidas, e só elas:

| De | Para | Quando | Efeito |
|---|---|---|---|
| `aberta` | `confirmada` | `UPDATE` condicional bem-sucedido | Libera contato (RN10), cria `turno` |
| `confirmada` | `cumprida` | Fim registrado pelos dois lados | Libera avaliação (RN07) |
| `confirmada` | `cancelada` | Cancelamento com motivo (RN12) | Reabre nova posição e redespacha |
| `aberta` | `cancelada` | Vaga cancelada inteira | Encerra o despacho |

O cancelamento **não volta** a posição para `aberta`: cria uma nova. Preservar a linha cancelada é o que mantém a auditoria de RN12 — autor, momento e motivo — e o que permite distinguir a posição que ninguém quis da que alguém aceitou e largou.

---

## O caminho quente: a consulta de despacho

RF06 exige a primeira leva notificada em **até 30 segundos** após a publicação, e RN05 proíbe notificar inelegível. Toda a tese do produto passa por esta consulta:

```sql
SELECT p.id
  FROM profissional p
  JOIN usuario u ON u.id = p.usuario_id AND u.estado = 'ativa'
  JOIN profissional_funcao pf
    ON pf.profissional_id = p.id AND pf.funcao_id = $funcao
 WHERE ST_DWithin(p.ponto_base, $ponto_vaga, 100000)   -- pré-filtro indexável
   AND ST_DWithin(p.ponto_base, $ponto_vaga, p.raio_km * 1000)
   AND EXISTS (
     SELECT 1 FROM disponibilidade d
      WHERE d.profissional_id = p.id
        AND d.dia_semana = $dia
        AND $hora BETWEEN d.hora_inicio AND d.hora_fim
   )
   AND NOT EXISTS (
     SELECT 1 FROM despacho x
      WHERE x.vaga_id = $vaga AND x.profissional_id = p.id
   )
 ORDER BY
   EXISTS (SELECT 1 FROM equipe_confianca e
            WHERE e.estabelecimento_id = $estab AND e.profissional_id = p.id) DESC,
   p.taxa_comparecimento DESC NULLS LAST,
   p.turnos_realizados DESC
 LIMIT $tamanho_leva;
```

Três observações decidem se isso responde em 30 segundos:

**O raio é do profissional, não da vaga.** `ST_DWithin(p.ponto_base, $ponto, p.raio_km * 1000)` tem a distância variando por linha, e um índice GIST comum não a resolve sozinho — o planejador tende à varredura completa. Daí o pré-filtro pelo teto de 100 km do `CHECK`, que é indexável e derruba o conjunto antes da parte cara.

**`ORDER BY` é RN06 inteira.** Equipe de confiança primeiro (RF18), depois taxa de comparecimento, depois volume. Não há coluna de patrocínio, impulsionamento ou prioridade paga em lugar nenhum do esquema — a regra diz que a ordem não pode ser comprada, e o jeito de garantir isso é não existir onde guardar o que foi comprado.

**`NULLS LAST` decide o destino de quem chega.** Profissional sem histórico tem `taxa_comparecimento IS NULL`; sem essa cláusula ele iria para o topo ou para o fundo por acidente de implementação. Fica atrás de quem tem histórico e à frente de quem tem histórico ruim — e o Painel de Operação é o mecanismo que garante que ele ainda assim receba trabalho.

```sql
CREATE INDEX profissional_ponto     ON profissional USING gist (ponto_base);
CREATE INDEX profissional_ordenacao ON profissional (taxa_comparecimento DESC NULLS LAST, turnos_realizados DESC);
CREATE INDEX disponibilidade_busca  ON disponibilidade (profissional_id, dia_semana);
CREATE INDEX despacho_vaga          ON despacho (vaga_id);
CREATE INDEX posicao_abertas        ON posicao (vaga_id) WHERE estado = 'aberta';
CREATE INDEX vaga_janela_critica    ON vaga (inicio_em) WHERE estado = 'publicada';
```

`vaga_janela_critica` é o índice do Painel de Operação (RF20): "toda posição que entra na janela crítica aparece no painel" é uma varredura por horário de início entre as vagas ainda publicadas, e o índice parcial mantém pequeno o conjunto que interessa.

---

## Despacho, candidatura, turno e ocorrência

```sql
CREATE TYPE estado_entrega     AS ENUM ('pendente','enviada','entregue','falhou');
CREATE TYPE estado_candidatura AS ENUM ('pendente','aceita','recusada','retirada','expirada');
CREATE TYPE tipo_ocorrencia    AS ENUM
  ('cancelamento','intervencao','suspensao','contestacao','suporte','divergencia');

CREATE TABLE despacho (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id         uuid NOT NULL REFERENCES vaga(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES profissional(id),
  leva            smallint NOT NULL CHECK (leva > 0),
  enviado_em      timestamptz NOT NULL DEFAULT now(),
  estado_entrega  estado_entrega NOT NULL DEFAULT 'pendente',
  entregue_em     timestamptz,
  motivo_falha    text,
  UNIQUE (vaga_id, profissional_id)     -- RN05: ninguém recebe a mesma vaga duas vezes
);

CREATE TABLE candidatura (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao_id      uuid NOT NULL REFERENCES posicao(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES profissional(id),
  criada_em       timestamptz NOT NULL DEFAULT now(),
  estado          estado_candidatura NOT NULL DEFAULT 'pendente',
  UNIQUE (posicao_id, profissional_id)
);

CREATE TABLE turno (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao_id              uuid NOT NULL UNIQUE REFERENCES posicao(id),
  inicio_registrado_em    timestamptz,
  inicio_registrado_por   uuid REFERENCES usuario(id),
  fim_registrado_em       timestamptz,
  fim_registrado_por      uuid REFERENCES usuario(id),
  valor_acordado_centavos bigint NOT NULL CHECK (valor_acordado_centavos > 0),
  divergencia             boolean NOT NULL DEFAULT false
);

CREATE TABLE avaliacao (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id   uuid NOT NULL REFERENCES turno(id) ON DELETE CASCADE,
  autor_id   uuid NOT NULL REFERENCES usuario(id),
  alvo_tipo  text NOT NULL CHECK (alvo_tipo IN ('profissional','estabelecimento')),
  alvo_id    uuid NOT NULL,
  resposta   boolean NOT NULL,          -- RN07: binária. Nunca 1 a 5.
  criada_em  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (turno_id, autor_id)
);

CREATE TABLE ocorrencia (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo         tipo_ocorrencia NOT NULL,
  posicao_id   uuid REFERENCES posicao(id),
  turno_id     uuid REFERENCES turno(id),
  usuario_id   uuid REFERENCES usuario(id),        -- alvo, quando houver
  autor_id     uuid NOT NULL REFERENCES usuario(id),
  motivo       text NOT NULL,                      -- RN12 e RN13: nunca vazio
  criada_em    timestamptz NOT NULL DEFAULT now(),
  resultado    text,
  resolvido_em timestamptz
);
```

`despacho` é auditoria e insumo operacional ao mesmo tempo. Responde à pergunta que o Painel de Operação precisa fazer às 17h30 de sexta: *já tentamos quem?* Sem esse registro, o operador liga para as mesmas três pessoas que o sistema já notificou e ignora as outras doze. O `UNIQUE (vaga_id, profissional_id)` garante RN05 contra o modo de falha mais banal: a leva seguinte reenviando para quem já recebeu.

`resposta boolean` é a aposta central do produto codificada no tipo. Não existe caminho no esquema que aceite uma nota de 1 a 5 — RN07 proíbe, e um `smallint` "para o caso de mudarmos de ideia" é exatamente como a regra se perde.

`valor_acordado_centavos` é copiado da vaga no momento da confirmação, não lido por junção. Se o estabelecimento republicar a vaga com outro valor, o turno já executado precisa continuar dizendo quanto foi combinado — RN11 exige que o registro sirva para resolver divergência, e registro que muda sozinho não resolve nada.

Uma tabela só (`ocorrencia`) para seis coisas diferentes é escolha: todas são **o mesmo ato** do ponto de vista do registro — alguém interveio no curso normal, num momento, por um motivo declarado. RN12 e RN13 pedem a mesma tripla para cancelamento e para suspensão, e `motivo text NOT NULL` é o que impede a suspensão silenciosa apontada como queixa recorrente nos concorrentes.

---

## Reputação: o que é derivado e o que é guardado

Taxa de comparecimento e contagem de avaliações são **deriváveis** de `turno` e `avaliacao`. Guardá-las em `profissional` é desnormalização consciente: elas estão no `ORDER BY` do caminho quente, e recalcular agregado por profissional a cada despacho estouraria o orçamento de 30 segundos.

O preço é sincronização. Recalcular por *trigger* na escrita de `avaliacao` e no fechamento de `turno`, com um job de reconciliação periódico — e tratar a coluna como cache, nunca como fonte. Quando a coluna e o histórico divergirem, o histórico ganha.

```sql
-- Definição canônica, para o job de reconciliação e para os testes.
-- Comparecer = turno confirmado que teve início registrado.
SELECT
  count(*) FILTER (WHERE t.inicio_registrado_em IS NOT NULL)::numeric
    / NULLIF(count(*), 0) AS taxa_comparecimento
FROM posicao p
LEFT JOIN turno t ON t.posicao_id = p.id
WHERE p.profissional_id = $1
  AND p.estado IN ('confirmada','cumprida');
```

A definição precisa estar escrita porque RN16 a torna consequente: recusar vaga não pode gerar penalidade, então recusa **não entra no denominador**. Só conta o que a pessoa aceitou. Confundir os dois transformaria o produto naquilo que RN16 existe para evitar — um sistema que pune quem escolhe.

---

## LGPD no esquema

RNF08 e RN15 têm consequência estrutural, não apenas de política.

**Exclusão é anonimização** (RF25). Turno e avaliação sobrevivem porque pertencem também à contraparte — apagar o histórico de um lado corromperia a reputação do outro, que não pediu nada:

```sql
UPDATE usuario
   SET nome = 'Conta encerrada', telefone = '', email = NULL,
       senha_hash = '', estado = 'anonimizada', anonimizado_em = now()
 WHERE id = $1;
```

**Dado pessoal não entra em log** (RN15). Isso proíbe o *trigger* de auditoria que copia a linha inteira de `usuario` para uma tabela de histórico — padrão automático de quem implementa auditoria sem pensar. `ocorrencia` guarda `usuario_id` e motivo: referência e razão, não cópia do titular.

**Finalidade por campo.** `ponto_base` existe para calcular elegibilidade (RN04) e nada mais. O esquema não tem — e não deve ganhar — tabela de posições sucessivas do profissional: rastreamento contínuo está no escopo não contemplado com a marca mais dura do documento, *"nunca na forma contínua"*, e tensiona RN16.

---

## Migração e versionamento

O esquema vai mudar antes da primeira linha de produção, e vai mudar mais depois. Três decisões evitam que isso vire trabalho manual:

**Migração é arquivo versionado, nunca alteração pelo console.** Uma pasta `migracoes/` com arquivos numerados e imutáveis (`0001_esquema_inicial.sql`, `0002_sem_turno_sobreposto.sql`), aplicados em ordem, com a versão corrente registrada numa tabela. O que já foi aplicado nunca é editado: corrige-se com uma migração nova.

**Migração compatível para frente.** RNF12 proíbe manutenção de quinta a domingo entre 16h e 02h — a janela do pico do setor. Isso obriga o padrão de duas fases para toda mudança destrutiva: primeiro adiciona a coluna nova e passa a escrever nas duas, depois (noutro *deploy*) para de ler a antiga e só então a remove. Renomear coluna num único passo derruba o cliente antigo que ainda está no aparelho de alguém — e com Android e web no ar, sempre há cliente antigo.

**O cliente nunca é atualizado junto com o servidor.** Um app na App Store demora dias para chegar a todo mundo; a web atualiza no *refresh*. A API precisa aceitar a versão anterior do contrato durante essa janela, o que empurra a compatibilidade para o [[07 - Arquitetura/Diagrama de Arquitetura#O contrato entre cliente e servidor|contrato de API]].

Semente inicial (`seed`): o catálogo de funções acima e nada mais. Dado de teste não entra em migração — vive em *fixtures* de teste, para que um `seed` acidental em produção não crie estabelecimento fantasma.

---

## O que não existe neste esquema, e por quê

Tão importante quanto as dezesseis tabelas é a ausência das quatro que um marketplace normalmente teria. Aqui a ausência é decisão, não lacuna:

| Ausente | Por quê | Quando volta |
|---|---|---|
| `pagamento`, `carteira`, `repasse` | RN09: o sistema registra o valor, não custodia dinheiro. Pagamento retido é a queixa recorrente em Switch, Closeer e eFreela | v2.0, condicionado à validação |
| `mensagem`, `conversa` | RN10 libera WhatsApp ou e-mail após a confirmação. Chat paralelo é superfície sem problema resolvido | v2.0, se a validação indicar |
| `nota`, `comentario` | RN07 proíbe média de 1 a 5 e comentário aberto | Nunca |
| `plano`, `assinatura`, `moeda`, `credito` | RN01: nada é cobrado do profissional, em nenhuma modalidade | Nunca para o profissional |

A última linha merece ênfase. RN01 é a regra mais forte do documento inteiro, e a forma de honrá-la no banco é não haver lugar onde cobrar um profissional seja representável.

---

## v1 e v2

| Tabela | v1 (MVP) | Observação |
|---|---|---|
| `usuario`, `profissional`, `estabelecimento`, `membro_estabelecimento` | Sim | RF01, RF02, RF21 |
| `funcao`, `profissional_funcao`, `disponibilidade` | Sim | RF03, base da elegibilidade |
| `vaga`, `posicao` | Sim | RF04, RF09, RF10 |
| `despacho` | Sim | RF06, o coração do produto |
| `candidatura` | Sim | RF08 |
| `turno` | Sim | RF13, RN11 |
| `avaliacao` | Sim | RF15, RF16 |
| `ocorrencia` | Sim | RF14, RF20, RF23, RF24 |
| `equipe_confianca` | Sim | RF18, entra no `ORDER BY` do despacho |
| `evento` | Depois | RF19 é "evite por ora" na matriz de impacto × esforço |
| `aval_externo` | Depois | RF17 tem prioridade média e não bloqueia o ciclo |

O corte não é por gosto: é o conjunto mínimo que fecha o ciclo **publicar → despachar → candidatar → confirmar → executar → avaliar**. Tirar qualquer uma dessas nove quebra o ciclo.

---

## Se não for PostgreSQL

**Essencial em qualquer banco:** as dezesseis entidades e suas cardinalidades; dinheiro em inteiro; tempo em UTC; a confirmação por escrita condicional; o registro de despacho como tabela; a separação entre aval interno e externo; a anonimização preservando histórico; migração versionada em arquivo.

**Específico do PostgreSQL:** `ENUM` nativo (vira tabela de domínio ou `CHECK`); `citext`; `EXCLUDE USING gist` para turnos sobrepostos (em MySQL, verificação em transação serializável); PostGIS e `ST_DWithin` (sem ele, *bounding box* mais Haversine).

**Se a decisão for backend gerenciado** — Supabase, Firebase ou equivalente — a diferença maior não é de sintaxe: parte destas restrições migra para regras de segurança e funções de servidor, e algumas não têm equivalente declarativo. Num banco de documentos sem transação multi-chave, RN19 deixa de ser garantia e volta a ser torcida. Isso deveria pesar na escolha mais do que preço ou familiaridade — e é a decisão D9 do [[07 - Arquitetura/Diagrama de Arquitetura|documento de arquitetura]].

---

## Decisões que este documento abre

| # | Decisão | Por que precisa de resposta |
|---|---|---|
| D1 | Adotar a regra de turnos não sobrepostos? | Não está nas RNs. Sem ela, o sistema deixa alguém aceitar dois turnos no mesmo horário e derruba a reputação da pessoa por falha própria `[H]` |
| D2 | Tamanho da leva e intervalo entre levas | Define se a vaga preenche em minutos ou queima os elegíveis de uma vez |
| D3 | Prazo até a candidatura expirar | Sem prazo, o modo seleção de RF09 trava a posição indefinidamente |
| D4 | Janela crítica fixa ou por tipo de vaga | Buffet de formatura e bar de sexta têm urgências diferentes |
| D5 | PostgreSQL com PostGIS, ou backend gerenciado | Determina se metade das restrições acima é declarativa ou vira código |

---
← [[🏠 Início|Início]]
