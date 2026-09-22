---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, banco-de-dados]
---

# Modelagem de Banco de Dados — Frila

Preenche a Seção 6.2 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve as dezessete entidades em tabela mas não traz o desenho nem o esquema físico. Aqui estão o diagrama, o DDL com as restrições que transformam regra de negócio em constraint, a máquina de estados que o código vai seguir, e o plano de migração para quando o esquema mudar.

> [!info] Estado do projeto
> TRL 2: sem código e sem validação de campo. O backend está decidido desde 21/09/2026: **Supabase**, com Postgres e PostGIS (B02, B06). Por isso o DDL daqui roda como está; [[#No Supabase]] diz o que muda de lugar. Toda premissa de comportamento de usuário carrega `[H]`.

---

## O que o esquema precisa garantir

Um modelo de dados é bom quando as regras que não podem ser violadas moram nele, e não na aplicação que o chama. Aplicação tem bug, tem corrida entre requisições, tem deploy pela metade. O banco é o último lugar onde uma regra ainda vale — e com três clientes nativos diferentes (iOS em Swift, Android em Kotlin e web) chamando o mesmo backend, é também o único lugar onde a regra vale **uma vez só**.

Oito das vinte e quatro regras de negócio são dessa natureza. Se falharem uma vez, destroem a confiança que o produto existe para construir:

| Regra | O que exige | Onde vive no esquema |
|---|---|---|
| RN19 | Uma posição nunca confirmada para dois profissionais | `UPDATE` condicional + `CHECK` de coerência em `posicao` |
| RN21 | Um profissional nunca com dois turnos confirmados que se sobrepõem | `EXCLUDE USING gist` em `posicao` |
| RN18 | Dinheiro em centavos inteiros, tempo em UTC | `BIGINT` e `timestamptz` em toda coluna monetária e temporal |
| RN20 | Cadastro só para maiores de 18 | `CHECK` sobre `nascimento` em `usuario` |
| RN02 | Vaga sem função, horário, endereço, valor, o que está incluso ou quem recebe no local não existe | `NOT NULL` nas colunas obrigatórias de `vaga` |
| RN24 | Modo seleção só para vaga que começa em mais de 24 horas | `CHECK` em `vaga` |
| RN22 | Check-in geolocalizado vale até 200 m; manual só conta confirmado | `CHECK` de coerência entre o registro e a `verificacao` em `turno` |
| RN07 | Avaliação binária, bidirecional, só depois do fim previsto e com presença verificada | `UNIQUE (turno_id, autor_id)` + *trigger* que confere horário e presença |

O teto de notificações (RN23) não é constraint: mora na função de despacho, que consulta `notificacao` antes de enviar. O resto do documento é, em boa medida, a defesa dessas oito linhas.

---

## O modelo em três vistas

Dezoito entidades num desenho só viram emaranhado. São três recortes do mesmo esquema, cada um respondendo a uma pergunta.

### O ciclo de uma vaga

![[07 - Arquitetura/Anexos/banco-de-dados/ciclo-da-vaga.png|O ciclo de uma vaga, da publicação à avaliação]]

O eixo é uma cadeia só — **`vaga` → `posicao` → `turno` → `avaliacao`** —, o ciclo de vida de uma unidade de trabalho da publicação à reputação. `despacho`, `notificacao` e `candidatura` penduram-se nela como o registro de quem foi avisado e quem respondeu.

### Uma conta, dois papéis

![[07 - Arquitetura/Anexos/banco-de-dados/identidade-e-papeis.png|Usuário, profissional, estabelecimento e a tabela de vínculo]]

### O que decide quem recebe a notificação

![[07 - Arquitetura/Anexos/banco-de-dados/elegibilidade.png|Função, disponibilidade, distância e equipe de confiança em torno do profissional]]

---

## As tabelas

### Identidade e perfis

`usuario` é a conta de acesso; `profissional` e `membro_estabelecimento` são papéis sobre ela. A separação existe porque uma mesma pessoa pode ser garçom num fim de semana e operar o cadastro do buffet do cunhado no outro — e porque o histórico do estabelecimento precisa sobreviver à troca de responsável (RF21).

```sql
CREATE TYPE estado_conta AS ENUM ('ativa', 'suspensa', 'anonimizada');

CREATE TABLE usuario (
  -- A credencial fica no Supabase Auth; usuario.id é o mesmo id de auth.users.
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  nome            text        NOT NULL,
  telefone        text        NOT NULL,
  email           citext,                 -- nulo só depois de anonimizado
  nascimento      date        NOT NULL,
  estado          estado_conta NOT NULL DEFAULT 'ativa',
  criado_em       timestamptz NOT NULL DEFAULT now(),
  anonimizado_em  timestamptz,

  -- RN20: maioridade verificada na escrita, não na tela.
  CONSTRAINT maior_de_idade
    CHECK (nascimento <= (CURRENT_DATE - INTERVAL '18 years')),
  CONSTRAINT anonimizacao_coerente
    CHECK ((estado = 'anonimizada') = (anonimizado_em IS NOT NULL)),
  CONSTRAINT email_ate_anonimizar
    CHECK (estado = 'anonimizada' OR email IS NOT NULL)
);

CREATE UNIQUE INDEX usuario_email_ativo
  ON usuario (email) WHERE estado <> 'anonimizada';
CREATE UNIQUE INDEX usuario_telefone_ativo
  ON usuario (telefone) WHERE estado <> 'anonimizada';
```

O índice único é **parcial** de propósito. RF25 manda anonimizar em vez de apagar, para preservar o histórico da contraparte; se a unicidade fosse total, o e-mail de uma conta encerrada bloquearia para sempre quem quisesse voltar com o mesmo endereço.

`nascimento` substitui o `maioridade_confirmada: boolean` da tabela original do Documento de Requisitos. Um booleano que o cliente envia não é verificação de nada — é a tela dizendo ao banco aquilo que a tela quis. Com a data, a restrição é verificável e o `CHECK` faz o trabalho.

Não há `senha_hash`: com o Supabase Auth, senha e token não passam por tabela do produto, e a exclusão de conta apaga a credencial em `auth.users` enquanto `usuario` é anonimizado (ver [[#LGPD no esquema]]).

```sql
CREATE TABLE profissional (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id          uuid NOT NULL UNIQUE REFERENCES usuario(id),
  ponto_base          geography(Point, 4326) NOT NULL,
  disponivel_agora_ate timestamptz,                     -- botão "disponível agora"; nulo = só a grade semanal
  -- Desnormalizações de leitura. Verdade em turno/avaliacao; ver §Reputação.
  taxa_comparecimento numeric(4,3) CHECK (taxa_comparecimento BETWEEN 0 AND 1),
  turnos_realizados   integer NOT NULL DEFAULT 0,
  aval_positivas      integer NOT NULL DEFAULT 0,
  aval_total          integer NOT NULL DEFAULT 0,
  CONSTRAINT aval_coerente CHECK (aval_positivas <= aval_total)
);
```

Não existe `raio_km`. Desde 21/09 o profissional não declara raio (B07): a distância que decide a notificação é do sistema — 15 km do `ponto_base` até o local da vaga —, e a lista mostra todas as vagas do DF, das mais próximas para as mais distantes.

`taxa_comparecimento` é **nula até existir histórico**, e isso é deliberado. RF16 exige que perfil sem histórico apareça como sem histórico, e não como nota zero — `0.0` e `NULL` contam histórias opostas sobre alguém que acabou de chegar. O `NULL` obriga quem lê a decidir o que exibir.

`aval_positivas` e `aval_total` contam as avaliações binárias recebidas no Frila ("chamaria de novo?") e existem para atender RN08, que manda sempre mostrar o denominador. Guardar só o percentual tornaria "7 de 7" irrecuperável, e é exatamente o denominador que separa confiança real de amostra pequena. Não há aval de fora da plataforma: ele saiu do produto em 21/09 (A12).

### Estabelecimento e equipe

```sql
CREATE TYPE tipo_estabelecimento AS ENUM
  ('food_service', 'evento', 'varejo', 'logistica', 'servico_domestico', 'outro');
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

CREATE TABLE equipe_confianca (
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento(id),
  profissional_id    uuid NOT NULL REFERENCES profissional(id),
  adicionado_em      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (estabelecimento_id, profissional_id)
);
```

A plataforma é horizontal (A01, A15): qualquer setor publica turno avulso, e `tipo` serve para leitura e filtro, não para barrar ninguém — `'outro'` existe para que nenhum negócio fique de fora por falta de categoria. `documento` aceita CPF porque serviço doméstico também contrata pelo Frila.

O estabelecimento tem reputação própria porque RN07 manda avaliar nos dois sentidos. Essa é a correção de assimetria que o produto usa contra o setor inteiro: em todo concorrente pesquisado só o contratante avalia, e as piores notas vêm de quem trabalha.

`equipe_confianca` não muda a ordem de ninguém — não existe ordem. Ela muda **quem** recebe: o profissional da equipe é notificado das vagas daquele estabelecimento mesmo além dos 15 km, desde que tenha a função e esteja disponível (RF18).

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

O catálogo inicial sai dos setores mapeados no Documento de Visão e no `02-O-NEGOCIO`. É dado de partida, não esquema, e precisa ser conferido em campo `[H]`:

| Categoria | Funções |
|---|---|
| Salão | garçom · garçonete · maître · hostess · runner · cumim |
| Bar | bartender · barista · auxiliar de bar |
| Cozinha | chapeiro · pizzaiolo · auxiliar de cozinha · copeiro · confeiteiro |
| Evento | montador · desmontador · recepcionista · credenciamento · segurança de sala |
| Apoio | limpeza pós-evento · carregador · manobrista · estoquista |
| Varejo | vendedor extra · promotor de degustação · empacotador · repositor de gôndola · inventariante |
| Logística | chapa (carga e descarga) · separador de pedidos · etiquetador · conferente auxiliar |

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

A grade semanal e o `disponivel_agora_ate` de `profissional` somam: o profissional recebe notificação nos horários da grade e, enquanto o "disponível agora" estiver valendo, em qualquer horário até o limite gravado.

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
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id     uuid NOT NULL REFERENCES estabelecimento(id),
  evento_id              uuid REFERENCES evento(id),
  funcao_id              uuid NOT NULL REFERENCES funcao(id),
  inicio_em              timestamptz NOT NULL,
  fim_em                 timestamptz NOT NULL,
  local                  text NOT NULL,                    -- endereço
  ponto                  geography(Point, 4326) NOT NULL,
  valor_centavos         bigint NOT NULL CHECK (valor_centavos > 0),
  posicoes               smallint NOT NULL CHECK (posicoes > 0),
  -- O que está incluso (RN02): sim ou não, sem "não informado".
  inclui_refeicao        boolean NOT NULL,
  inclui_transporte      boolean NOT NULL,
  exige_material_proprio boolean NOT NULL,                 -- sim = o profissional leva o material
  responsavel_local      text NOT NULL,                    -- quem recebe o profissional no local
  -- Opcionais.
  traje                  text,
  participa_rateio       boolean,                          -- 10% da taxa de serviço (Lei 13.419/2017)
  observacoes            text,
  modo                   modo_preenchimento NOT NULL,
  alerta_antecedencia    interval NOT NULL DEFAULT '3 hours',  -- janela crítica (RF20)
  estado                 estado_vaga NOT NULL DEFAULT 'publicada',
  publicado_em           timestamptz NOT NULL DEFAULT now(),
  chave_cliente          uuid NOT NULL,                    -- idempotência da publicação

  CONSTRAINT publicacao_unica UNIQUE (estabelecimento_id, chave_cliente),

  CONSTRAINT turno_tem_duracao CHECK (fim_em > inicio_em),
  CONSTRAINT alerta_positivo   CHECK (alerta_antecedencia > INTERVAL '0'),
  -- RN24: modo seleção só para vaga que começa em mais de 24 horas.
  CONSTRAINT selecao_com_antecedencia CHECK (
    modo <> 'selecao' OR inicio_em > publicado_em + INTERVAL '24 hours')
);

CREATE TABLE posicao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id         uuid NOT NULL REFERENCES vaga(id) ON DELETE CASCADE,
  estado          estado_posicao NOT NULL DEFAULT 'aberta',
  profissional_id uuid REFERENCES profissional(id),
  confirmado_em   timestamptz,
  falta           boolean NOT NULL DEFAULT false,   -- ver §Reputação
  -- Desnormalizado de vaga para a constraint de sobreposição abaixo.
  inicio_em       timestamptz NOT NULL,
  fim_em          timestamptz NOT NULL,

  CONSTRAINT confirmacao_coerente CHECK (
    estado NOT IN ('confirmada','cumprida')
      OR (profissional_id IS NOT NULL AND confirmado_em IS NOT NULL)
  ),
  CONSTRAINT aberta_sem_profissional CHECK (
    estado <> 'aberta' OR profissional_id IS NULL
  ),
  CONSTRAINT falta_so_em_cancelada CHECK (NOT falta OR estado = 'cancelada')
);
```

As colunas `NOT NULL` de `vaga` — função, início, fim, endereço, valor, número de posições, o que está incluso, quem recebe no local, e o estabelecimento que publica — são RN02 escrita em SQL. `posicoes` é o número pedido na publicação; a função que publica cria uma linha de `posicao` por unidade. O Documento de Requisitos justifica a regra com avaliações de concorrentes em que o profissional chega ao local "sem muita informação"; aqui, uma vaga incompleta simplesmente não entra. Traje, rateio e observações são opcionais, e a lista pode ser ajustada depois.

Os três campos do que está incluso são `boolean NOT NULL`, e não texto: marcar sim ou não é um toque cada, mantém a publicação curta e deixa duas vagas do mesmo valor comparáveis — com e sem refeição não são a mesma diária.

`alerta_antecedencia` é a janela crítica de cada vaga: quanto tempo antes do início, com a posição ainda vaga, o contratante recebe o alerta por notificação. O padrão é 3 horas, e o contratante muda na publicação (B18).

`selecao_com_antecedencia` é RN24. Como o modo seleção fecha sozinho 24 horas antes do início, uma vaga de seleção que começa em menos de 24 horas nasceria fechada — então ela nem entra. O fechamento em si é trabalho do agendador, não de constraint: a 24 horas do início, a vaga de seleção sem escolha passa a `encerrada` e os candidatos são avisados e liberados.

`valor_centavos bigint` é RN18. Centavo inteiro não acumula erro de arredondamento, e `bigint` não estoura em escala de evento — quarenta posições de uma formatura somadas ainda cabem com folga.

`evento_id` é nulo porque a maioria das vagas é avulsa. Só a escala em lote de RF19 agrupa, e forçar todo turno urgente de sexta-feira a inventar um evento seria burocracia inventada pelo esquema.

`posicao` mantém o `profissional_id` depois do cancelamento: é ele que diz de quem foi a falta e quem cancelou, o que RN12 exige registrar e a taxa de comparecimento precisa ler.

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

Se `rowcount = 0`, outro profissional chegou antes — e o segundo recebe "posição já preenchida", não uma confirmação falsa. É uma linha de SQL, e é ela que impede o modo de falha descrito na justificativa da regra: alguém que se desloca até o local sem ter trabalho. No Supabase, essa linha vive numa função RPC que os três clientes chamam: a regra é escrita uma vez, não três.

### Turnos sobrepostos

A regra entrou nos requisitos como RN21 em 21/09 (D1, aprovada na B04). Sem ela, o mesmo profissional seria confirmado para dois turnos que se cruzam: aceitaria os dois de boa-fé e faltaria a um — desabando a própria taxa de comparecimento por um buraco do sistema, não por comportamento. Com `inicio_em` e `fim_em` desnormalizados em `posicao`, a proibição é declarativa:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- igualdade de uuid dentro do índice GIST

ALTER TABLE posicao ADD CONSTRAINT sem_turno_sobreposto
  EXCLUDE USING gist (
    profissional_id WITH =,
    tstzrange(inicio_em, fim_em) WITH &&
  ) WHERE (estado IN ('confirmada','cumprida'));
```

A desnormalização tem um custo: quando o horário da vaga muda, as posições precisam acompanhar. Isso só acontece antes de haver confirmação, e um *trigger* de duas linhas resolve.

---

## Os estados de uma posição

![[07 - Arquitetura/Anexos/banco-de-dados/estados-da-posicao.png|Máquina de estados: aberta, confirmada, cumprida e cancelada]]

Quatro estados, e nenhum a mais. A tentação de criar um estado `reservada` — entre a candidatura e a confirmação — aparece em quase todo marketplace, e aqui seria um erro: no modo urgência o primeiro aprovado leva, e no modo seleção a posição fica aberta até a escolha do contratante. Nenhum dos dois comportamentos precisa de estado intermediário, e cada estado a mais é um caminho a mais pelo qual RN19 pode falhar.

A presença não é estado da posição: é atributo do turno (`verificacao`, abaixo). Um turno "não verificado" é uma posição `cumprida` cujo turno terminou com `verificacao = 'nao_verificado'` — ele existe, mas não conta a favor nem contra ninguém.

Transições válidas, e só elas:

| De | Para | Quando | Efeito |
|---|---|---|---|
| `aberta` | `confirmada` | `UPDATE` condicional bem-sucedido | Libera contato (RN10), cria `turno` |
| `confirmada` | `cumprida` | O turno termina com check-in registrado | Libera avaliação se a presença foi verificada (RN07, RN22) |
| `confirmada` | `cancelada` | Cancelamento com motivo (RN12), inclusive a reabertura por não comparecimento | Cria nova posição e notifica de novo; com menos de 24 horas ou por não comparecimento, marca `falta` |
| `aberta` | `cancelada` | Vaga cancelada inteira, ou modo seleção fechado 24 horas antes sem escolha (RN24) | Encerra o despacho e libera os candidatos |

O cancelamento **não volta** a posição para `aberta`: cria uma nova. Preservar a linha cancelada é o que mantém a auditoria de RN12 — autor, momento e motivo — e o que permite distinguir a posição que ninguém quis da que alguém aceitou e largou.

---

## O caminho quente: quem recebe a notificação

RNF03 exige a notificação enviada ao provedor em **até 30 segundos** após a publicação, e RN05 proíbe notificar inelegível. Toda a tese do produto passa por esta consulta:

```sql
-- Elegíveis para uma vaga (RN05). O teto e o agrupamento (RN23) vêm
-- depois, na função que decide quando cada notificação sai.
SELECT p.id
  FROM profissional p
  JOIN usuario u ON u.id = p.usuario_id AND u.estado = 'ativa'
  JOIN profissional_funcao pf
    ON pf.profissional_id = p.id AND pf.funcao_id = $funcao
 WHERE (
         ST_DWithin(p.ponto_base, $ponto_vaga, 15000)          -- até 15 km
      OR EXISTS (SELECT 1 FROM equipe_confianca e              -- a equipe recebe mesmo além
                  WHERE e.estabelecimento_id = $estab AND e.profissional_id = p.id)
       )
   AND (
         p.disponivel_agora_ate > $inicio                      -- "disponível agora"
      OR EXISTS (SELECT 1 FROM disponibilidade d
                  WHERE d.profissional_id = p.id
                    AND d.dia_semana = $dia
                    AND $hora BETWEEN d.hora_inicio AND d.hora_fim)
       )
   AND NOT EXISTS (SELECT 1 FROM bloqueio b                    -- RF26, nos dois sentidos
                     JOIN membro_estabelecimento m
                       ON m.usuario_id IN (b.autor_id, b.bloqueado_id)
                    WHERE m.estabelecimento_id = $estab
                      AND p.usuario_id IN (b.autor_id, b.bloqueado_id))
   AND NOT EXISTS (SELECT 1 FROM posicao x                     -- RN21
                    WHERE x.profissional_id = p.id
                      AND x.estado = 'confirmada'
                      AND tstzrange(x.inicio_em, x.fim_em) && tstzrange($inicio, $fim))
   AND NOT EXISTS (SELECT 1 FROM despacho x
                    WHERE x.vaga_id = $vaga AND x.profissional_id = p.id);
```

Três observações decidem se isso responde em 30 segundos:

**A distância é do sistema, não do profissional.** Com 15 km fixos, `ST_DWithin(p.ponto_base, $ponto, 15000)` usa o índice GIST direto — o pré-filtro de 100 km, que existia porque o raio variava por linha, deixou de ser necessário. Os 15 km são parâmetro do sistema, valor inicial para ajustar com o dado do piloto `[H]`.

**Não há `ORDER BY`, e isso é RN06 inteira.** A notificação sai de uma vez para todos os elegíveis; a taxa de comparecimento aparece no perfil e não altera quem recebe. Não há coluna de patrocínio, impulsionamento ou prioridade paga em lugar nenhum do esquema — a regra diz que notificação e posição na lista não podem ser compradas, e o jeito de garantir isso é não existir onde guardar o que foi comprado.

**Quem acaba de chegar recebe junto com quem tem cem turnos.** Sem ordem, profissional sem histórico (`taxa_comparecimento IS NULL`) não fica para trás por acidente de implementação: se tem a função, está disponível e está perto, é notificado ao mesmo tempo que os outros.

Depois da consulta vem o teto (RN23). Para cada elegível, a função de despacho olha a última `notificacao` dele: se saiu há menos de 30 minutos, a vaga espera e entra na próxima, agrupada com as outras ("4 vagas novas perto de você"); a vaga do modo urgência que começa em menos de 2 horas fura o agrupamento — sai na hora, sozinha — e conta no teto.

```sql
CREATE INDEX profissional_ponto     ON profissional USING gist (ponto_base);
CREATE INDEX disponibilidade_busca  ON disponibilidade (profissional_id, dia_semana);
CREATE INDEX despacho_vaga          ON despacho (vaga_id);
CREATE INDEX notificacao_teto       ON notificacao (profissional_id, enviada_em DESC);
CREATE INDEX posicao_abertas        ON posicao (vaga_id) WHERE estado = 'aberta';
CREATE INDEX vaga_janela_critica    ON vaga (inicio_em) WHERE estado = 'publicada';
```

`notificacao_teto` responde à pergunta que o teto faz a cada envio: *quando foi a última notificação desta pessoa?* `vaga_janela_critica` é o índice do alerta de vaga vazia (RF20): o agendador varre as vagas ainda publicadas cujo início, menos a `alerta_antecedencia`, já chegou, e avisa o contratante. O índice parcial mantém pequeno o conjunto que interessa.

---

## Despacho, notificação, candidatura, turno e ocorrência

```sql
CREATE TYPE estado_entrega     AS ENUM ('pendente','enviada','entregue','falhou');
CREATE TYPE estado_candidatura AS ENUM ('pendente','aceita','recusada','retirada','expirada');
CREATE TYPE tipo_registro      AS ENUM ('geolocalizado','manual');
CREATE TYPE verificacao_turno  AS ENUM ('pendente','verificado','nao_verificado');
CREATE TYPE tipo_ocorrencia    AS ENUM
  ('cancelamento','suspensao','contestacao','suporte','denuncia','revisao_despacho');
CREATE TYPE plataforma         AS ENUM ('ios','android','web');

CREATE TABLE dispositivo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_fcm       text NOT NULL UNIQUE,             -- um aparelho, um token
  plataforma      plataforma NOT NULL,
  atualizado_em   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notificacao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id uuid NOT NULL REFERENCES profissional(id),
  enviada_em      timestamptz NOT NULL DEFAULT now(),
  urgente         boolean NOT NULL DEFAULT false,   -- furou o agrupamento (RN23)
  estado_entrega  estado_entrega NOT NULL DEFAULT 'pendente',
  entregue_em     timestamptz,
  motivo_falha    text
);

CREATE TABLE despacho (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id         uuid NOT NULL REFERENCES vaga(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES profissional(id),
  notificacao_id  uuid REFERENCES notificacao(id),  -- nulo enquanto espera o teto
  criado_em       timestamptz NOT NULL DEFAULT now(),
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
  checkin_em              timestamptz,
  checkin_tipo            tipo_registro,
  checkin_distancia_m     integer CHECK (checkin_distancia_m >= 0),        -- medida no toque
  checkin_confirmado_em   timestamptz,                                     -- contratante, só no manual
  checkout_em             timestamptz,
  checkout_distancia_m    integer CHECK (checkout_distancia_m BETWEEN 0 AND 200),  -- nulo sem localização
  verificacao             verificacao_turno NOT NULL DEFAULT 'pendente',
  valor_acordado_centavos bigint NOT NULL CHECK (valor_acordado_centavos > 0),

  -- RN22: o geolocalizado só vale a até 200 m do endereço da vaga.
  CONSTRAINT checkin_no_raio CHECK (
    checkin_tipo IS DISTINCT FROM 'geolocalizado'
      OR (checkin_distancia_m IS NOT NULL AND checkin_distancia_m <= 200)),
  CONSTRAINT confirmacao_so_no_manual CHECK (
    checkin_confirmado_em IS NULL OR checkin_tipo = 'manual'),
  -- 'verificado' só com prova: geolocalizado, ou manual confirmado pelo contratante.
  CONSTRAINT verificacao_coerente CHECK (
    (verificacao = 'verificado') = COALESCE(
      checkin_tipo = 'geolocalizado'
      OR (checkin_tipo = 'manual' AND checkin_confirmado_em IS NOT NULL), false))
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

CREATE TABLE bloqueio (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id     uuid NOT NULL REFERENCES usuario(id),     -- quem bloqueou, de qualquer lado
  bloqueado_id uuid NOT NULL REFERENCES usuario(id),
  criado_em    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (autor_id, bloqueado_id),
  CONSTRAINT nao_bloqueia_a_si CHECK (autor_id <> bloqueado_id)
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
  resolvido_em timestamptz,
  chave_cliente uuid,                              -- idempotência da denúncia
  UNIQUE (autor_id, chave_cliente)
);
```

`dispositivo` guarda o token de push de cada aparelho, que o app registra ao abrir e sempre que o token muda. Uma pessoa pode ter mais de um aparelho; o token é único. Quem negou a permissão de notificação não tem linha aqui e, para o despacho, não é alcançável. Na exclusão de conta, os dispositivos vão junto (RN15).

`chave_cliente` torna seguras as duas escritas que não têm chave natural: publicar uma vaga e denunciar. O app gera a chave uma vez por ação; se a rede cair e ele reenviar, o `UNIQUE` devolve a vaga ou a denúncia já gravada em vez de criar outra. As demais escritas já são idempotentes pela chave natural — candidatura por vaga e profissional, check-in por turno, avaliação por turno e autor, bloqueio por par. O contrato está em `Frila/Documentos/API/openapi.yaml`.

`despacho` e `notificacao` são duas coisas, e separar as duas é o que torna o teto possível. `despacho` diz *quem foi considerado para qual vaga*; `notificacao` diz *qual push saiu, quando, e se chegou*. Um push agrupado ("4 vagas novas perto de você") é uma `notificacao` com quatro `despacho` apontando para ela. O `UNIQUE (vaga_id, profissional_id)` garante RN05 contra o modo de falha mais banal: a mesma vaga reenviada para quem já recebeu. E o estado de entrega mora em `notificacao`, que é a unidade que RNF02 mede.

O `turno` guarda a **distância** medida no toque, não a coordenada do profissional (RN22). O app lê a localização só no momento do check-in ou do check-out, nunca em segundo plano, calcula a distância até o endereço da vaga e envia só ela. É o que basta para saber se o check-in vale — até 200 m — e é o mínimo de dado pessoal que resolve o problema.

`verificacao` começa `pendente` e só vira `verificado` com prova: o `CHECK verificacao_coerente` recusa `verificado` sem check-in geolocalizado a até 200 m ou manual confirmado pelo contratante, e recusa deixar de marcar quando a prova existe. Se o turno termina com o check-in manual sem confirmação — ou sem check-in nenhum, sem que o contratante tenha reaberto a vaga —, o agendador marca `nao_verificado`. É essa coluna que libera a avaliação e que entra na taxa de comparecimento, e nenhuma tela consegue marcá-la sem a prova.

Não existe coluna de divergência. O registro geolocalizado é o que vale (RN11): o Frila não arbitra, e o contratante que discordar do horário registra isso na avaliação (A08).

A avaliação só é aceita depois do fim previsto de um turno com `verificacao = 'verificado'` (RN07). Isso atravessa tabelas — o fim previsto está em `posicao` e a presença em `turno` —, então não cabe num `CHECK`: vive num *trigger* de `BEFORE INSERT` em `avaliacao` e na função RPC que o app chama para avaliar. Quem faltou não é avaliado: a falta já pesa na taxa, e não deve pesar duas vezes.

`resposta boolean` é a aposta central do produto codificada no tipo. Não existe caminho no esquema que aceite uma nota de 1 a 5 — RN07 proíbe, e um `smallint` "para o caso de mudarmos de ideia" é exatamente como a regra se perde.

`valor_acordado_centavos` é copiado da vaga no momento da confirmação, não lido por junção. Se o estabelecimento republicar a vaga com outro valor, o turno já executado precisa continuar dizendo quanto foi combinado — RN11 exige que o registro valha como registro, e registro que muda sozinho não vale nada.

`bloqueio` liga duas contas, `autor_id` e `bloqueado_id`, e vale nos dois sentidos: quem bloqueou não recebe mais nada de quem foi bloqueado, e vice-versa. Quando uma das contas é membro de estabelecimento, a consulta junta o bloqueio com `membro_estabelecimento`, e o bloqueio passa a valer para as vagas daquele estabelecimento inteiro. A elegibilidade, a lista de vagas e a candidatura leem a mesma tabela (RF26). O bloqueio é imediato e não depende de ninguém da Equipe Frila.

Uma tabela só (`ocorrencia`) para seis coisas diferentes é escolha: todas são **o mesmo ato** do ponto de vista do registro — alguém saiu do curso normal, num momento, por um motivo declarado. RN12 e RN13 pedem a mesma tripla para cancelamento e para suspensão, e `motivo text NOT NULL` é o que impede a suspensão silenciosa apontada como queixa recorrente nos concorrentes. Suporte, denúncia, contestação e pedido de revisão do despacho chegam à Equipe Frila por e-mail; a `ocorrencia` guarda o registro e o prazo de resposta, de até 5 dias úteis. Suspensão só nasce de denúncia grave confirmada — assédio, fraude ou documento falso —, nunca de cancelamento (RN13).

---

## Reputação: o que é derivado e o que é guardado

Taxa de comparecimento e contagem de avaliações são **deriváveis** de `posicao`, `turno` e `avaliacao`. Guardá-las em `profissional` é desnormalização consciente: elas aparecem em todo card de perfil e na lista de candidatos do modo seleção, e recalcular o agregado a cada leitura custaria caro.

O preço é sincronização. Recalcular por *trigger* na escrita de `avaliacao`, no fechamento de `turno` e no cancelamento de `posicao`, com um job de reconciliação periódico — e tratar a coluna como cache, nunca como fonte. Quando a coluna e o histórico divergirem, o histórico ganha.

```sql
-- Definição canônica (A11), para o job de reconciliação e para os testes.
-- Presença = check-in geolocalizado ou manual confirmado (RN22).
-- Falta    = não aparecer, ou cancelar com menos de 24 h do início.
-- Fora da conta: candidatura não escolhida, cancelamento com mais de
-- 24 h e turno não verificado.
SELECT
  count(*) FILTER (WHERE t.verificacao = 'verificado')::numeric
    / NULLIF(count(*) FILTER (WHERE t.verificacao = 'verificado' OR p.falta), 0)
    AS taxa_comparecimento
FROM posicao p
LEFT JOIN turno t ON t.posicao_id = p.id
WHERE p.profissional_id = $1;
```

`falta` é gravada em `posicao` pela função que cancela: quando o próprio profissional cancela com menos de 24 horas do início, ou quando o contratante reabre a vaga depois do alerta de atraso, aos 15 minutos sem check-in. Cancelamento com mais de 24 horas não marca nada e sai da conta.

A definição precisa estar escrita porque RN16 a torna consequente: recusar vaga não pode gerar penalidade, então recusa e candidatura não escolhida **não entram no denominador**. Só conta o que a pessoa aceitou e foi confirmado. Confundir os dois transformaria o produto naquilo que RN16 existe para evitar — um sistema que pune quem escolhe. E a taxa só aparece no perfil: não muda quem recebe notificação (RN06), e cancelamento nenhum suspende ninguém (RN13).

---

## LGPD no esquema

RNF08 e RN15 têm consequência estrutural, não apenas de política.

**Exclusão é anonimização** (RF25). O perfil sai do despacho e da busca na hora; os dados pessoais são apagados em até 15 dias. Turno e avaliação sobrevivem porque pertencem também à contraparte — apagar o histórico de um lado corromperia a reputação do outro, que não pediu nada:

```sql
UPDATE usuario
   SET nome = 'Conta encerrada', telefone = '', email = NULL,
       estado = 'anonimizada', anonimizado_em = now()
 WHERE id = $1;
-- e a credencial em auth.users é apagada pelo Supabase Auth.
```

**Dado pessoal não entra em log** (RN15). Isso proíbe o *trigger* de auditoria que copia a linha inteira de `usuario` para uma tabela de histórico — padrão automático de quem implementa auditoria sem pensar. `ocorrencia` guarda `usuario_id` e motivo: referência e razão, não cópia do titular.

**Finalidade por campo.** `ponto_base` existe para calcular a distância de elegibilidade (RN05) e nada mais. O check-in guarda a distância medida no toque, não a coordenada. O esquema não tem — e não deve ganhar — tabela de posições sucessivas do profissional: rastreamento contínuo está no escopo não contemplado com a marca mais dura do documento, *"nunca na forma contínua"*, e tensiona RN16.

**O contato tem prazo.** RN10 libera telefone e WhatsApp das partes só depois da confirmação e só até 7 dias depois do fim do turno. A base legal é a execução do contrato (LGPD, art. 7º, V). No banco, isso é política de acesso, e não tela: a leitura do telefone da contraparte passa por uma regra que confere a confirmação e o prazo ([[#No Supabase]]).

---

## Migração e versionamento

O esquema vai mudar antes da primeira linha de produção, e vai mudar mais depois. Três decisões evitam que isso vire trabalho manual:

**Migração é arquivo versionado, nunca alteração pelo console.** No Supabase, a pasta é `supabase/migrations/`, com arquivos datados e imutáveis gerados pela CLI (`…_esquema_inicial.sql`, `…_sem_turno_sobreposto.sql`), aplicados em ordem. O que já foi aplicado nunca é editado: corrige-se com uma migração nova. Mudança feita pelo painel do Supabase e não trazida para um arquivo é mudança que o próximo ambiente não tem.

**Migração compatível para frente.** RNF12 proíbe manutenção no horário de pico — quinta a domingo, das 16h às 2h. Isso obriga o padrão de duas fases para toda mudança destrutiva: primeiro adiciona a coluna nova e passa a escrever nas duas, depois (noutro *deploy*) para de ler a antiga e só então a remove. Renomear coluna num único passo derruba o cliente antigo que ainda está no aparelho de alguém — e com Android e web no ar, sempre há cliente antigo.

**O cliente nunca é atualizado junto com o servidor.** Um app na App Store demora dias para chegar a todo mundo; a web atualiza no *refresh*. O backend precisa aceitar a versão anterior do contrato durante essa janela, o que empurra a compatibilidade para o [[07 - Arquitetura/Diagrama de Arquitetura#O contrato entre cliente e servidor|contrato entre cliente e servidor]].

Semente inicial (`seed`): o catálogo de funções acima e nada mais. Dado de teste não entra em migração — vive em *fixtures* de teste, para que um `seed` acidental em produção não crie estabelecimento fantasma.

---

## O que não existe neste esquema, e por quê

Tão importante quanto as dezoito entidades é a ausência das quatro que um marketplace normalmente teria. Aqui a ausência é decisão, não lacuna:

| Ausente | Por quê | Quando volta |
|---|---|---|
| `pagamento`, `carteira`, `repasse` | RN09: o sistema registra o valor, não custodia dinheiro. Pagamento retido é a queixa recorrente em Switch, Closeer e eFreela | v2.0, condicionado à validação |
| `mensagem`, `conversa` | RN10 libera WhatsApp ou e-mail após a confirmação. Chat paralelo é superfície sem problema resolvido | v2.0, se a validação indicar |
| `nota`, `comentario` | RN07 proíbe média de 1 a 5 e comentário aberto | Nunca |
| `comissao`, `desconto` | RN01: o Frila nunca desconta comissão ou taxa do valor do turno; o valor anunciado é o valor integral que o profissional recebe | Nunca |

A última linha merece ênfase. A forma de honrar RN01 no banco é não haver lugar onde descontar do turno seja representável: o que o profissional recebe é o `valor_acordado_centavos`, inteiro. Serviços opcionais pagos ao profissional podem existir no futuro, mas como produto à parte, que não toca no valor do turno — e não entram na v1.

Também não existe `aval_externo`. O atestado de quem trabalhou com o profissional fora da plataforma saiu do produto em 21/09 (A12): só avalia quem trabalhou junto pelo Frila, e um aval de fora é fácil de forjar — bastaria alguém cadastrar um estabelecimento e avalizar a si mesmo.

---

## v1 e v2

| Tabela | v1 (MVP) | Observação |
|---|---|---|
| `usuario`, `profissional`, `estabelecimento`, `membro_estabelecimento` | Sim | RF01, RF02, RF21 |
| `funcao`, `profissional_funcao`, `disponibilidade` | Sim | RF03, base da elegibilidade |
| `vaga`, `posicao` | Sim | RF04, RF09, RF10, RN24 |
| `despacho`, `notificacao` | Sim | RF06 e RN23, o coração do produto |
| `dispositivo` | Sim | Sem o token do aparelho, o push não tem destino (RF06, RNF02) |
| `candidatura` | Sim | RF08 |
| `turno` | Sim | RF13, RN11, RN22 |
| `avaliacao` | Sim | RF15, RF16 |
| `ocorrencia` | Sim | RF14, RF23, RF24, RF26, RF27 |
| `bloqueio` | Sim | RF26 — a App Store exige denunciar e bloquear (diretriz 1.2) |
| `equipe_confianca` | Sim | RF18: recebe a notificação mesmo além de 15 km |
| `evento` | Depois | RF19 é "evite por ora" na matriz de impacto × esforço |

O corte não é por gosto: é o conjunto mínimo que fecha o ciclo **publicar → notificar → candidatar → confirmar → executar → avaliar**, mais o `bloqueio`, sem o qual o app não passa pela revisão da App Store.

---

## No Supabase

O backend foi decidido em 21/09 (B02): Supabase, que é Postgres de verdade. Por isso quase tudo daqui vale como está, e o que muda é **de lugar**, não de sintaxe.

**Continua igual:** `ENUM`, `citext`, `CHECK`, coluna gerada, *trigger*, `EXCLUDE USING gist` para turnos sobrepostos, PostGIS e `ST_DWithin`. A confirmação por escrita condicional continua sendo uma linha de SQL, e RN19 continua sendo garantia do banco — o risco que pesava contra backend gerenciado era banco de documentos sem transação, e o Supabase não é isso.

**Muda de lugar:**

- **Acesso por política.** Os clientes falam com o banco pela API do Supabase, sob *Row Level Security*: cada tabela tem política dizendo quem lê e quem escreve o quê. RN10 — telefone da contraparte só depois da confirmação e até 7 dias depois do fim — é política de leitura, não regra de tela.
- **Regra crítica em função RPC.** Tudo o que precisa valer igual para iOS, Android e web vira função no banco, chamada pelos três: confirmar (RN19), candidatar e retirar candidatura (RN24), check-in e check-out (RN22), cancelar e marcar falta, avaliar (RN07), denunciar e bloquear (RF26). A regra é escrita uma vez, e não três.
- **Despacho e agendamento fora da requisição.** Publicar só grava e responde. Uma Edge Function, puxada pela fila `pgmq` e pelo `pg_cron`, faz o resto: elegíveis e teto de notificações (RN05, RN23), push pelo FCM, lembretes 24 h e 3 h antes, alerta de atraso aos 15 minutos, alerta de vaga vazia na janela crítica, fechamento do modo seleção 24 h antes (RN24) e aviso de fim de turno.
- **Credencial no Supabase Auth.** Senha e token não passam por tabela do produto; `usuario` referencia `auth.users`.

---

## Decisões respondidas em 21/09/2026

| # | Decisão | Resposta |
|---|---|---|
| D1 | Adotar a regra de turnos não sobrepostos? | Sim (B04): virou RN21, garantida pelo `EXCLUDE USING gist` em `posicao` |
| D2 | Tamanho da leva e intervalo entre levas | Não há levas (D07): a notificação sai de uma vez para quem tem a função, está disponível e a até 15 km, e a equipe de confiança recebe mesmo além; teto de uma notificação a cada 30 minutos, com agrupamento (RN23) |
| D3 | Prazo até a candidatura expirar | Vale até a vaga fechar (D05). Modo seleção só para vaga com mais de 24 horas; sem escolha até 24 horas antes, a vaga fecha e os candidatos são liberados (RN24) |
| D4 | Janela crítica fixa ou por tipo de vaga | Um padrão igual para todas — 3 horas antes do início —, que o contratante ajusta ao publicar; o alerta chega por notificação (B18) |
| D5 | PostgreSQL com PostGIS, ou backend gerenciado | Supabase, que é Postgres com PostGIS; é a mesma decisão da D9 (B02, B06) |

---
← [[🏠 Início|Início]]
