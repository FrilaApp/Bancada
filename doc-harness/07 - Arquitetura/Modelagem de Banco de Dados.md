---
tipo: arquitetura
desafio: C18
data_criacao: 2026-09-15
tags: [arquitetura, frila, banco-de-dados]
---

# Modelagem de Banco de Dados — Frila

Preenche a Seção 6.2 do [[01 - CBL/Desafios/C18/Documentos de Produto/Frila_Documento_de_Requisitos|Documento de Requisitos]], que descreve as dezoito entidades em tabela mas não traz o desenho nem o esquema físico. Aqui estão o diagrama, o DDL com as restrições que transformam regra de negócio em constraint, a máquina de estados que o código vai seguir, e o plano de migração para quando o esquema mudar.

> [!info] Estado do projeto
> TRL 2: sem código e sem validação de campo. O backend está decidido desde 21/09/2026: **Supabase**, com Postgres e PostGIS (B02, B06). Por isso o DDL daqui roda como está; [[#No Supabase]] diz o que muda de lugar. Toda premissa de comportamento de usuário carrega `[H]`.

> [!info] Atualizado em 22/09/2026 (rodada 2 das pendências para codar)
> Cada conta tem um perfil só, profissional ou contratante, fixado em `usuario.perfil` (RN25). A entrada é por código enviado ao e-mail, sem senha e sem SMS. O telefone continua obrigatório, mas sem verificação e sem unicidade. O "disponível agora" saiu: a disponibilidade é só a grade semanal. E as políticas de acesso de cada tabela estão escritas em [[#Políticas de acesso (RLS)]].

---

## O que o esquema precisa garantir

Um modelo de dados é bom quando as regras que não podem ser violadas moram nele, e não na aplicação que o chama. Aplicação tem bug, tem corrida entre requisições, tem deploy pela metade. O banco é o último lugar onde uma regra ainda vale — e com três clientes nativos diferentes (iOS em Swift, Android em Kotlin e web) chamando o mesmo backend, é também o único lugar onde a regra vale **uma vez só**.

Nove das vinte e cinco regras de negócio são dessa natureza. Se falharem uma vez, destroem a confiança que o produto existe para construir:

| Regra | O que exige | Onde vive no esquema |
|---|---|---|
| RN19 | Uma posição nunca confirmada para dois profissionais | `UPDATE` condicional + `CHECK` de coerência em `posicao` |
| RN21 | Um profissional nunca com dois turnos confirmados que se sobrepõem | `EXCLUDE USING gist` em `posicao` |
| RN18 | Dinheiro em centavos inteiros, tempo em UTC | `BIGINT` e `timestamptz` em toda coluna monetária e temporal |
| RN20 | Cadastro só para maiores de 18 | `CHECK` sobre `nascimento` em `usuario` |
| RN25 | Cada conta com um perfil só, escolhido no cadastro e sem troca | `usuario.perfil` travado por *trigger* + chave estrangeira composta em `profissional` e `membro_estabelecimento` |
| RN02 | Vaga sem função, horário, endereço, valor, o que está incluso ou quem recebe no local não existe | `NOT NULL` nas colunas obrigatórias de `vaga` |
| RN24 | Modo seleção só para vaga que começa em mais de 24 horas | `CHECK` em `vaga` |
| RN22 | Check-in geolocalizado vale até 200 m; manual só conta confirmado | `CHECK` de coerência entre o registro e a `verificacao` em `turno` |
| RN07 | Avaliação binária, bidirecional, só depois do fim previsto e com presença verificada | `UNIQUE (turno_id, autor_id)` + *trigger* que confere horário e presença |

O teto de notificações (RN23) não é constraint: mora na função de despacho, que consulta `notificacao` antes de enviar. O resto do documento é, em boa medida, a defesa dessas nove linhas.

---

## O modelo em três vistas

Dezoito entidades num desenho só viram emaranhado. São três recortes do mesmo esquema, cada um respondendo a uma pergunta.

### O ciclo de uma vaga

![[07 - Arquitetura/Anexos/banco-de-dados/ciclo-da-vaga.png|O ciclo de uma vaga, da publicação à avaliação]]

O eixo é uma cadeia só — **`vaga` → `posicao` → `turno` → `avaliacao`** —, o ciclo de vida de uma unidade de trabalho da publicação à reputação. `despacho`, `notificacao` e `candidatura` penduram-se nela como o registro de quem foi avisado e quem respondeu.

### Uma conta, um perfil

![[07 - Arquitetura/Anexos/banco-de-dados/identidade-e-papeis.png|Cada conta com um perfil: a de profissional tem o registro de profissional, a de contratante participa do estabelecimento]]

### O que decide quem recebe a notificação

![[07 - Arquitetura/Anexos/banco-de-dados/elegibilidade.png|Função, disponibilidade, distância e equipe de confiança em torno do profissional]]

---

## As tabelas

### Identidade e perfis

`usuario` é a conta de acesso, e cada conta tem **um perfil só** (RN25, 22/09): profissional ou contratante, escolhido no cadastro e sem troca depois. A conta de profissional ganha uma linha em `profissional`; a de contratante opera um ou mais estabelecimentos por `membro_estabelecimento`. Quem é garçom num fim de semana e opera o cadastro do buffet do cunhado no outro tem duas contas, com dois e-mails — o telefone pode ser o mesmo. A conta continua separada do papel porque o histórico do estabelecimento precisa sobreviver à troca de responsável (RF21).

```sql
CREATE TYPE estado_conta AS ENUM ('ativa', 'suspensa', 'anonimizada');
CREATE TYPE perfil_conta AS ENUM ('profissional', 'contratante');

CREATE TABLE usuario (
  -- usuario.id é o id da conta no Supabase Auth, gravado por criar_conta.
  -- Sem chave estrangeira para auth.users: ver a exclusão, abaixo.
  id              uuid PRIMARY KEY,
  perfil          perfil_conta NOT NULL,  -- RN25: escolhido no cadastro, nunca muda
  nome            text        NOT NULL,
  telefone        text,                   -- contato do turno (RN10); nulo só depois de anonimizado
  email           citext,                 -- copiado de auth.users; nulo só depois de anonimizado
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
    CHECK (estado = 'anonimizada' OR email IS NOT NULL),
  -- Telefone obrigatório enquanto a conta existe; só o formato é conferido (E.164).
  CONSTRAINT telefone_ate_anonimizar
    CHECK (estado = 'anonimizada' OR telefone IS NOT NULL),
  CONSTRAINT telefone_e164
    CHECK (telefone ~ '^\+[1-9][0-9]{7,14}$'),
  -- Alvo das chaves estrangeiras de profissional e membro_estabelecimento (RN25).
  CONSTRAINT usuario_id_perfil UNIQUE (id, perfil)
);

CREATE UNIQUE INDEX usuario_email_ativo
  ON usuario (email) WHERE estado <> 'anonimizada';

-- RN25: o perfil da conta não muda depois do cadastro, nem por dentro de uma função.
CREATE FUNCTION perfil_imutavel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'o perfil da conta não muda (RN25)' USING ERRCODE = 'check_violation';
END $$;

CREATE TRIGGER usuario_perfil_imutavel
  BEFORE UPDATE OF perfil ON usuario
  FOR EACH ROW WHEN (NEW.perfil IS DISTINCT FROM OLD.perfil)
  EXECUTE FUNCTION perfil_imutavel();
```

O índice único é **parcial** de propósito. RF25 manda anonimizar em vez de apagar, para preservar o histórico da contraparte; se a unicidade fosse total, o e-mail de uma conta encerrada bloquearia para sempre quem quisesse voltar com o mesmo endereço.

`nascimento` substitui o `maioridade_confirmada: boolean` da tabela original do Documento de Requisitos. Um booleano que o cliente envia não é verificação de nada — é a tela dizendo ao banco aquilo que a tela quis. Com a data, a restrição é verificável e o `CHECK` faz o trabalho.

`perfil` é RN25 escrita em SQL, em três peças. `criar_conta` grava o perfil escolhido no cadastro, e o *trigger* `usuario_perfil_imutavel` recusa qualquer mudança depois. `UNIQUE (id, perfil)` existe para servir de alvo: `profissional` e `membro_estabelecimento` repetem o perfil numa coluna constante e apontam para o par `(id, perfil)`. Com isso, uma conta de contratante não consegue ter linha em `profissional`, nem uma conta de profissional entrar num estabelecimento — nem por bug de função. As funções conferem antes e respondem `422 perfil_incompativel`: `criar_perfil_profissional` com conta de contratante, `cadastrar_estabelecimento` e o aceite de convite de membro com conta de profissional. A chave estrangeira é a última linha de defesa.

O telefone é obrigatório porque é o contato que as partes veem depois da confirmação (RN10), e o app não tem chat. Mas não é verificado, porque não há SMS no Frila, e não é único: a mesma pessoa pode ter as duas contas com o mesmo número (RN25). O `CHECK telefone_e164` confere só o formato. O e-mail continua único entre as contas ativas, porque é ele que identifica a conta na entrada.

Não há `senha_hash` porque não há senha. A entrada é pelo Supabase Auth, com um código de uso único enviado ao e-mail (22/09), e nenhuma credencial passa por tabela do produto. `usuario.id` é o id da conta de autenticação, gravado por `criar_conta` a partir de `auth.uid()`, mas sem chave estrangeira para `auth.users`, e isso é de propósito: a exclusão de conta apaga o registro de autenticação e mantém a linha de `usuario` anonimizada (ver [[#LGPD no esquema]]). Com a chave, o Supabase recusaria apagar o registro de uma conta que ainda tem histórico.

```sql
CREATE TABLE profissional (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id          uuid NOT NULL UNIQUE,
  perfil              perfil_conta NOT NULL DEFAULT 'profissional'
                        CHECK (perfil = 'profissional'),       -- RN25, com a chave abaixo
  ponto_base          geography(Point, 4326) NOT NULL,
  -- Desnormalizações de leitura. Verdade em turno/avaliacao; ver §Reputação.
  taxa_comparecimento numeric(4,3) CHECK (taxa_comparecimento BETWEEN 0 AND 1),
  turnos_realizados   integer NOT NULL DEFAULT 0,
  aval_positivas      integer NOT NULL DEFAULT 0,
  aval_total          integer NOT NULL DEFAULT 0,
  CONSTRAINT aval_coerente CHECK (aval_positivas <= aval_total),
  CONSTRAINT so_conta_de_profissional
    FOREIGN KEY (usuario_id, perfil) REFERENCES usuario (id, perfil)
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
  usuario_id         uuid NOT NULL,
  perfil             perfil_conta NOT NULL DEFAULT 'contratante'
                       CHECK (perfil = 'contratante'),        -- RN25, com a chave abaixo
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento(id),
  papel              papel_membro NOT NULL,
  criado_em          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, estabelecimento_id),
  CONSTRAINT so_conta_de_contratante
    FOREIGN KEY (usuario_id, perfil) REFERENCES usuario (id, perfil)
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

A grade semanal é a única fonte de disponibilidade: o profissional recebe notificação da vaga que começa numa das janelas dele. O botão "disponível agora", que abria uma exceção por algumas horas, saiu do produto em 22/09, e com ele a coluna `disponivel_agora_ate`.

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
-- $dia e $hora são o dia da semana e a hora de início da vaga no fuso
-- America/Sao_Paulo, porque a grade é hora de parede do profissional.
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
   AND EXISTS (SELECT 1 FROM disponibilidade d                 -- a grade semanal
                WHERE d.profissional_id = p.id
                  AND (   (d.hora_inicio < d.hora_fim          -- janela no mesmo dia
                           AND d.dia_semana = $dia
                           AND $hora >= d.hora_inicio AND $hora < d.hora_fim)
                       OR (d.hora_inicio > d.hora_fim          -- janela que vira a noite
                           AND (   (d.dia_semana = $dia AND $hora >= d.hora_inicio)
                                OR (d.dia_semana = ($dia + 6) % 7 AND $hora < d.hora_fim)))))
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

A janela que vira a noite entra pelos dois lados. Com a janela de sexta das 18:00 às 02:00, a vaga que começa às 23h de sexta cai nela, e a que começa à 1h de sábado também, pela janela que começou na sexta. Um `BETWEEN` simples perderia exatamente esse caso, que é o mais comum do setor.

Três observações decidem se isso responde em 30 segundos:

**A distância é do sistema, não do profissional.** Com 15 km fixos, `ST_DWithin(p.ponto_base, $ponto, 15000)` usa o índice GIST direto — o pré-filtro de 100 km, que existia porque o raio variava por linha, deixou de ser necessário. Os 15 km são parâmetro do sistema, valor inicial para ajustar com o dado do piloto `[H]`.

**Não há `ORDER BY`, e isso é RN06 inteira.** A notificação sai de uma vez para todos os elegíveis; a taxa de comparecimento aparece no perfil e não altera quem recebe. Não há coluna de patrocínio, impulsionamento ou prioridade paga em lugar nenhum do esquema — a regra diz que notificação e posição na lista não podem ser compradas, e o jeito de garantir isso é não existir onde guardar o que foi comprado.

**Quem acaba de chegar recebe junto com quem tem cem turnos.** Sem ordem, profissional sem histórico (`taxa_comparecimento IS NULL`) não fica para trás por acidente de implementação: se tem a função, está disponível e está perto, é notificado ao mesmo tempo que os outros.

Depois da consulta vem o teto (RN23). Para cada elegível, a função de despacho olha a última `notificacao` dele: se saiu há menos de 30 minutos, a vaga espera e entra na próxima, agrupada com as outras ("4 vagas novas perto de você"); a vaga do modo urgência que começa em menos de 2 horas fura o agrupamento — sai na hora, sozinha — e conta no teto.

```sql
CREATE INDEX profissional_ponto     ON profissional USING gist (ponto_base);
CREATE INDEX disponibilidade_busca  ON disponibilidade (profissional_id, dia_semana);
CREATE INDEX despacho_vaga          ON despacho (vaga_id);
CREATE INDEX notificacao_teto       ON notificacao (profissional_id, enviada_em DESC)
  WHERE tipo IN ('vaga', 'vagas_agrupadas');
CREATE INDEX posicao_abertas        ON posicao (vaga_id) WHERE estado = 'aberta';
CREATE INDEX vaga_janela_critica    ON vaga (inicio_em) WHERE estado = 'publicada';
```

`notificacao_teto` responde à pergunta que o teto faz a cada envio: *quando foi a última notificação **de vaga** desta pessoa?* Desde o cartão #146 a tabela guarda todo aviso do produto, para qualquer conta; `profissional_id` só existe nas de vaga (`CHECK notificacao_profissional_so_de_vaga`), e é por isso que um lembrete ou uma confirmação nunca entram na conta do teto. Os tipos agendados (lembretes, atraso, fim sem check-out, vaga vazia, avaliação disponível) têm um índice único parcial em `(tipo, referencia_id, usuario_id)`, que é a marca de envio: o agendador pode rodar de novo sem avisar duas vezes. `vaga_janela_critica` é o índice do alerta de vaga vazia (RF20): o agendador varre as vagas ainda publicadas cujo início, menos a `alerta_antecedencia`, já chegou, e avisa o contratante. O índice parcial mantém pequeno o conjunto que interessa.

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
  usuario_id      uuid NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,  -- o destinatário
  tipo            tipo_notificacao NOT NULL,   -- os 16 avisos do produto
  referencia_id   uuid NOT NULL,               -- a vaga, a posição ou o turno do aviso
  payload         jsonb NOT NULL DEFAULT '{}', -- o destino do toque: tipo e ids (RN15)
  profissional_id uuid REFERENCES profissional(id),  -- só nas de vaga, para o teto
  tentativas      int NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
  aceita_em       timestamptz,
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
   SET nome = 'Conta encerrada', telefone = NULL, email = NULL,
       estado = 'anonimizada', anonimizado_em = now()
 WHERE id = $1;
-- e o registro em auth.users é apagado no Supabase Auth.
```

**Dado pessoal não entra em log** (RN15). Isso proíbe o *trigger* de auditoria que copia a linha inteira de `usuario` para uma tabela de histórico — padrão automático de quem implementa auditoria sem pensar. `ocorrencia` guarda `usuario_id` e motivo: referência e razão, não cópia do titular.

**Finalidade por campo.** `ponto_base` existe para calcular a distância de elegibilidade (RN05) e nada mais, e nenhuma leitura o mostra a outra pessoa. O check-in guarda a distância medida no toque, não a coordenada. O esquema não tem — e não deve ganhar — tabela de posições sucessivas do profissional: rastreamento contínuo está no escopo não contemplado com a marca mais dura do documento, *"nunca na forma contínua"*, e tensiona RN16.

**O contato tem prazo.** RN10 libera telefone e WhatsApp das partes só depois da confirmação e só até 7 dias depois do fim do turno. A base legal é a execução do contrato (LGPD, art. 7º, V). No banco, isso é regra de acesso, e não de tela: nenhuma política deixa ler a linha de `usuario` de outra pessoa, e o telefone da contraparte só sai pela função `contato_do_turno`, que confere a confirmação, o prazo e o bloqueio ([[#Políticas de acesso (RLS)]]).

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

- **Acesso por política.** Os clientes falam com o banco pela API do Supabase, sob *Row Level Security*. Escrita só por função; leitura, cada um do que é seu; e o que é da outra parte, como o telefone de RN10, sai por função que confere a regra. As políticas de cada tabela estão em [[#Políticas de acesso (RLS)]].
- **Regra crítica em função RPC.** Tudo o que precisa valer igual para iOS, Android e web vira função no banco, chamada pelos três: criar a conta e o perfil certo (RN25), confirmar (RN19), candidatar e retirar candidatura (RN24), check-in e check-out (RN22), cancelar e marcar falta, avaliar (RN07), denunciar e bloquear (RF26). A regra é escrita uma vez, e não três.
- **Despacho e agendamento fora da requisição.** Publicar só grava e responde. Uma Edge Function, puxada pela fila `pgmq` e pelo `pg_cron`, faz o resto: elegíveis e teto de notificações (RN05, RN23), push pelo FCM, lembretes 24 h e 3 h antes, alerta de atraso aos 15 minutos, alerta de vaga vazia na janela crítica, fechamento do modo seleção 24 h antes (RN24) e aviso de fim de turno.
- **Entrada pelo Supabase Auth.** Código de uso único no e-mail, sem senha e sem SMS; nenhuma credencial passa por tabela do produto. `usuario.id` é o id de `auth.users`, gravado por `criar_conta`.

---

## Políticas de acesso (RLS)

Os clientes falam com o banco pela API do Supabase, com o token de quem está logado. Toda tabela do produto tem *Row Level Security* ligado, e a regra cabe em três frases:

1. **Escrita só por função.** Nenhuma tabela tem política de `insert`, `update` ou `delete` para `authenticated`. Toda escrita passa por uma função RPC `security definer`, que confere quem chama, o perfil e a regra de negócio antes de gravar. Sem política de escrita, o RLS recusa a escrita direta pela API; o `revoke` abaixo deixa isso explícito.
2. **Cada um lê o que é seu.** As políticas de `select` abrem a linha para quem tem direito a ela: a própria conta, o próprio perfil, as próprias candidaturas, turnos, aparelhos, notificações e ocorrências. O membro de um estabelecimento lê o que é do estabelecimento.
3. **O que é da outra parte sai por função.** RLS filtra linha, não coluna. `usuario` mistura o que a outra parte pode ver (o nome), o que só o dono vê (e-mail e nascimento) e o que tem prazo (o telefone, RN10); `profissional` guarda o `ponto_base`, que é quase o endereço de alguém. Por isso nenhuma política abre a linha de `usuario` ou de `profissional` para outra pessoa: o que a contraparte vê sai por funções `security definer` que devolvem só as colunas permitidas ([[#O que a outra parte vê]]).

`anon` não lê nem escreve nada: toda rota exige login, **com uma exceção**. `public.configuracao_do_app` é a única função que `anon` executa, porque o app abaixo da versão mínima precisa descobrir isso antes de conseguir entrar (contrato 0.2.16, cartão #201). Ela lê `privado.configuracao_app`, que tem RLS ligada, nenhuma política, não é exposta pelo PostgREST e só muda por migração. O agendador (Edge Function) e a Equipe Frila usam a chave de serviço, que fica fora do RLS e nunca vai para um app.

### As funções auxiliares

As políticas fazem sempre as mesmas perguntas: qual é o perfil da conta, qual é o meu `profissional`, sou membro deste estabelecimento, há bloqueio entre nós. Cada pergunta vira uma função, num schema que a API não expõe:

```sql
-- Fora da API: o PostgREST só expõe public, então ninguém chama estas
-- funções por /rpc. São security definer para ler as tabelas sem cair em
-- recursão de política, e stable para o planejador reaproveitar o resultado.
CREATE SCHEMA privado;

CREATE FUNCTION privado.perfil_da_conta() RETURNS perfil_conta
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT u.perfil FROM public.usuario u WHERE u.id = (SELECT auth.uid())
$$;

CREATE FUNCTION privado.meu_profissional_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.id FROM public.profissional p WHERE p.usuario_id = (SELECT auth.uid())
$$;

CREATE FUNCTION privado.eh_membro(estab uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.membro_estabelecimento m
                  WHERE m.estabelecimento_id = estab
                    AND m.usuario_id = (SELECT auth.uid()))
$$;

CREATE FUNCTION privado.eh_administrador(estab uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.membro_estabelecimento m
                  WHERE m.estabelecimento_id = estab
                    AND m.usuario_id = (SELECT auth.uid())
                    AND m.papel = 'administrador')
$$;

-- RF26: bloqueio nos dois sentidos, entre uma conta e qualquer membro do estabelecimento.
CREATE FUNCTION privado.bloqueado_com_estabelecimento(conta uuid, estab uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.bloqueio b
                   JOIN public.membro_estabelecimento m
                     ON m.usuario_id IN (b.autor_id, b.bloqueado_id)
                  WHERE m.estabelecimento_id = estab
                    AND conta IN (b.autor_id, b.bloqueado_id))
$$;

CREATE FUNCTION privado.estabelecimento_da_vaga(v uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT estabelecimento_id FROM public.vaga WHERE id = v
$$;

CREATE FUNCTION privado.estabelecimento_da_posicao(pos uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT v.estabelecimento_id
    FROM public.posicao p JOIN public.vaga v ON v.id = p.vaga_id
   WHERE p.id = pos
$$;

CREATE FUNCTION privado.usuario_do_profissional(prof uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT usuario_id FROM public.profissional WHERE id = prof
$$;

-- O profissional ocupa ou ocupou uma posição desta vaga: é o turno dele.
CREATE FUNCTION privado.ocupa_posicao_na_vaga(v uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.posicao p
                  WHERE p.vaga_id = v
                    AND p.profissional_id = privado.meu_profissional_id())
$$;

-- O profissional se candidatou a uma posição desta vaga.
CREATE FUNCTION privado.candidatou_na_vaga(v uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.candidatura c
                   JOIN public.posicao p ON p.id = c.posicao_id
                  WHERE p.vaga_id = v
                    AND c.profissional_id = privado.meu_profissional_id())
$$;

-- Um dos dois lados da posição: quem a ocupa, ou um membro do estabelecimento.
CREATE FUNCTION privado.lado_da_posicao(pos uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.posicao p
                  WHERE p.id = pos
                    AND p.profissional_id = privado.meu_profissional_id())
      OR privado.eh_membro(privado.estabelecimento_da_posicao(pos))
$$;

-- Primeira linha de toda função RPC que é de um perfil só (RN25).
CREATE FUNCTION privado.exigir_perfil(esperado perfil_conta) RETURNS void
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF privado.perfil_da_conta() IS DISTINCT FROM esperado THEN
    PERFORM public.erro(422, 'perfil_incompativel');
  END IF;
END $$;

REVOKE ALL ON SCHEMA privado FROM PUBLIC;
GRANT USAGE ON SCHEMA privado TO authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA privado FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA privado TO authenticated;
```

Nas políticas, `auth.uid()` e as auxiliares sem argumento vão dentro de `(SELECT …)`: assim o Postgres calcula o valor uma vez por consulta, e não uma vez por linha. `eh_administrador` não aparece nas políticas de leitura; serve às funções que só o administrador chama, como convidar membro e remover o estabelecimento. `exigir_perfil` usa o auxiliar `erro()` do contrato (`Frila/Documentos/API/openapi.yaml`).

### Ligar o RLS e fechar a escrita

```sql
ALTER TABLE usuario                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional           ENABLE ROW LEVEL SECURITY;
ALTER TABLE estabelecimento        ENABLE ROW LEVEL SECURITY;
ALTER TABLE membro_estabelecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_confianca       ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcao                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional_funcao    ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidade        ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaga                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE posicao                ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivo            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacao            ENABLE ROW LEVEL SECURITY;
ALTER TABLE despacho               ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatura            ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueio               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencia             ENABLE ROW LEVEL SECURITY;

-- Escrita só por função (frase 1). Sem política de escrita o RLS já recusa;
-- o revoke deixa isso explícito, e o default privileges cobre a tabela nova.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM authenticated;

-- Função nova nasce sem execute para anon; authenticated continua chamando as RPCs.
-- Exceção única, concedida por nome na própria migração: public.configuracao_do_app.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;
```

### As políticas de leitura

Uma política por tabela, todas de `select` e todas para `authenticated`. São dezenove tabelas e dezenove políticas:

```sql
-- Identidade: cada um lê a própria linha, e só ela.
CREATE POLICY usuario_leitura ON usuario FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY profissional_leitura ON profissional FOR SELECT TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

-- Estabelecimento: o membro lê o seu. A equipe de confiança, os dois lados.
CREATE POLICY estabelecimento_leitura ON estabelecimento FOR SELECT TO authenticated
  USING (privado.eh_membro(id));

CREATE POLICY membro_estabelecimento_leitura ON membro_estabelecimento
  FOR SELECT TO authenticated
  USING (privado.eh_membro(estabelecimento_id));

CREATE POLICY equipe_confianca_leitura ON equipe_confianca FOR SELECT TO authenticated
  USING (privado.eh_membro(estabelecimento_id)
         OR profissional_id = (SELECT privado.meu_profissional_id()));

-- Catálogo aberto a quem está logado. Funções declaradas e grade, só o dono.
CREATE POLICY funcao_leitura ON funcao FOR SELECT TO authenticated
  USING (true);

CREATE POLICY profissional_funcao_leitura ON profissional_funcao
  FOR SELECT TO authenticated
  USING (profissional_id = (SELECT privado.meu_profissional_id()));

CREATE POLICY disponibilidade_leitura ON disponibilidade FOR SELECT TO authenticated
  USING (profissional_id = (SELECT privado.meu_profissional_id()));

-- Vaga: o membro vê todas as do estabelecimento. O profissional vê as publicadas
-- e as que tem candidatura, menos as de quem tem bloqueio com ele (RF26), e vê
-- sempre as que ocupou, porque o turno é histórico dele.
CREATE POLICY evento_leitura ON evento FOR SELECT TO authenticated
  USING (privado.eh_membro(estabelecimento_id));

CREATE POLICY vaga_leitura ON vaga FOR SELECT TO authenticated
  USING (
        privado.eh_membro(estabelecimento_id)
     OR ((SELECT privado.perfil_da_conta()) = 'profissional'
         AND (   privado.ocupa_posicao_na_vaga(id)
              OR (NOT privado.bloqueado_com_estabelecimento(
                        (SELECT auth.uid()), estabelecimento_id)
                  AND (estado = 'publicada' OR privado.candidatou_na_vaga(id))))));

CREATE POLICY posicao_leitura ON posicao FOR SELECT TO authenticated
  USING (profissional_id = (SELECT privado.meu_profissional_id())
         OR privado.eh_membro(privado.estabelecimento_da_vaga(vaga_id)));

-- Candidatura: a própria, ou as das vagas do estabelecimento, menos as de quem
-- tem bloqueio com ele, mesmo que o bloqueio tenha vindo depois.
CREATE POLICY candidatura_leitura ON candidatura FOR SELECT TO authenticated
  USING (
        profissional_id = (SELECT privado.meu_profissional_id())
     OR (privado.eh_membro(privado.estabelecimento_da_posicao(posicao_id))
         AND NOT privado.bloqueado_com_estabelecimento(
                   privado.usuario_do_profissional(profissional_id),
                   privado.estabelecimento_da_posicao(posicao_id))));

-- Turno: os dois lados da posição.
CREATE POLICY turno_leitura ON turno FOR SELECT TO authenticated
  USING (privado.lado_da_posicao(posicao_id));

-- Avaliação e bloqueio: só quem escreveu.
CREATE POLICY avaliacao_leitura ON avaliacao FOR SELECT TO authenticated
  USING (autor_id = (SELECT auth.uid()));

CREATE POLICY bloqueio_leitura ON bloqueio FOR SELECT TO authenticated
  USING (autor_id = (SELECT auth.uid()));

-- Só do dono: o que foi despachado para ele, os pushes e os aparelhos.
CREATE POLICY despacho_leitura ON despacho FOR SELECT TO authenticated
  USING (profissional_id = (SELECT privado.meu_profissional_id()));

CREATE POLICY notificacao_leitura ON notificacao FOR SELECT TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

CREATE POLICY dispositivo_leitura ON dispositivo FOR SELECT TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

-- Ocorrência: o que a pessoa abriu, e o que foi decidido sobre ela.
CREATE POLICY ocorrencia_leitura ON ocorrencia FOR SELECT TO authenticated
  USING (autor_id = (SELECT auth.uid())
         OR (usuario_id = (SELECT auth.uid())
             AND tipo IN ('suspensao', 'cancelamento')));
```

Algumas escolhas pedem explicação:

- **A avaliação só o autor lê.** Quem foi avaliado vê o agregado — "7 de 7 chamariam de novo" — pela função de perfil, com o denominador (RN08), e não quem respondeu o quê. A resposta individual à vista convidaria à retaliação, e a pergunta binária só funciona se a pessoa responde sem medo.
- **O bloqueio só quem bloqueou vê.** Quem foi bloqueado apenas deixa de cruzar com a outra parte (RF26). Saber quem o bloqueou é informação que pode pôr alguém em risco.
- **A denúncia não aparece para o denunciado.** A ocorrência de denúncia é lida só por quem denunciou. O denunciado vê a suspensão, se houver, com o motivo e o caminho para contestar (RN13).
- **O estabelecimento não vê o despacho.** Saber quem foi notificado de uma vaga revelaria quem está perto e disponível naquele horário. O contratante vê quem se candidatou, e só.
- **O turno fica para os dois lados, mesmo depois de um bloqueio.** É histórico de cada um e entra na exportação (RF22). O bloqueio corta o contato e tudo o que vem depois.
- **A exclusão tira a pessoa das leituras sozinha** (RF25). A conta anonimizada não tem mais registro em `auth.users`, então nenhum token casa com ela; o despacho já filtra `estado = 'ativa'`; e, no histórico da contraparte, as funções de perfil mostram "Conta encerrada".

### O que a outra parte vê

As leituras que só tocam no que é do próprio usuário podem rodar com a identidade de quem chama, sob as políticas acima. As que juntam dado da outra parte — o nome do estabelecimento no turno, o perfil do candidato, o contato — são `security definer` e devolvem só isto:

| Função | O que devolve | Regra |
|---|---|---|
| `perfil_publico` | Nome, funções, turnos realizados, taxa de comparecimento e o par `aval_positivas` / `aval_total` | RN08: sempre com o denominador, nunca só o percentual. `ponto_base`, telefone, e-mail e nascimento não saem |
| `vagas_abertas`, `detalhe_vaga` | A vaga e, do estabelecimento, nome, tipo e reputação | RF26: some a vaga de quem tem bloqueio com o profissional. O documento (CNPJ ou CPF) não sai |
| `candidatos_da_vaga` | Para o membro do estabelecimento, quem se candidatou, com o perfil público de cada um | RF26: quem tem bloqueio some da lista |
| `contato_do_turno` | Nome, telefone e link do WhatsApp da outra parte | RN10: só com a posição confirmada ou cumprida, até 7 dias depois do fim, e sem bloqueio |
| `painel_estabelecimento` | Vagas, posições, candidatos e turnos do estabelecimento | Só para membro |

Toda função de escrita segue o mesmo molde: `security definer`, `set search_path = ''` com nomes qualificados, `auth.uid()` conferido antes de tudo e, quando a função é de um perfil só, `privado.exigir_perfil(…)` na primeira linha. `criar_perfil_profissional` exige `'profissional'`; `cadastrar_estabelecimento` e o aceite de convite de membro exigem `'contratante'` (RN25).

Cada política ganha teste antes de ir para produção: entrar como profissional, como contratante de outro estabelecimento e como conta bloqueada, e conferir o que cada um lê (`supabase test db`, com pgTAP).

### Resumo

| Tabela | Quem lê | Quem escreve, sempre por função |
|---|---|---|
| `usuario` | A própria conta | `criar_conta`; `excluir-conta` anonimiza |
| `profissional` | O próprio profissional | `criar_perfil_profissional`, `atualizar_perfil_profissional` |
| `estabelecimento` | Os membros | `cadastrar_estabelecimento` |
| `membro_estabelecimento` | Os membros do mesmo estabelecimento | `cadastrar_estabelecimento` (primeiro administrador) e o convite de membro (RF21) |
| `equipe_confianca` | Os membros e o profissional incluído | `incluir_na_equipe`, `remover_da_equipe` |
| `funcao` | Qualquer conta logada | Só migração: é catálogo |
| `profissional_funcao` | O próprio profissional | `criar_perfil_profissional`, `atualizar_perfil_profissional` |
| `disponibilidade` | O próprio profissional | `criar_perfil_profissional`, `atualizar_perfil_profissional` |
| `evento` | Os membros | A escala em lote (RF19), depois do MVP |
| `vaga` | Os membros; o profissional, as publicadas e as que tem candidatura, sem bloqueio, e as que ocupou | `publicar_vaga`, `republicar_vaga`, `cancelar_vaga`; o agendador fecha o modo seleção |
| `posicao` | Os membros e quem ocupa | `publicar_vaga`, `candidatar` (no modo urgência), `escolher_candidato`, `cancelar_posicao`, `reabrir_por_atraso` |
| `candidatura` | O próprio profissional; os membros, menos quem tem bloqueio | `candidatar`, `retirar_candidatura`, `escolher_candidato`; o agendador expira |
| `turno` | Os dois lados da posição | A confirmação cria; `fazer_checkin`, `confirmar_checkin_manual`, `fazer_checkout`; o agendador marca "não verificado" |
| `avaliacao` | Só o autor | `avaliar` |
| `bloqueio` | Só o autor | `bloquear` |
| `despacho` | O próprio profissional | O agendador |
| `notificacao` | A conta destinatária | `privado.notificar`, pelas RPCs e pelo agendador |
| `dispositivo` | O dono | `registrar_dispositivo`; `excluir-conta` apaga |
| `ocorrencia` | O autor; o alvo, na suspensão e no cancelamento | `denunciar`, `contestar_suspensao`, `pedir_revisao_despacho` e os cancelamentos; a Equipe Frila, com a chave de serviço |

`anon` não aparece na tabela porque não tem nada: nenhuma leitura de tabela e nenhuma escrita. A única coisa que ele alcança é a função `configuracao_do_app`, que lê `privado.configuracao_app` por dentro; a tabela em si continua fora do alcance dele.

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
