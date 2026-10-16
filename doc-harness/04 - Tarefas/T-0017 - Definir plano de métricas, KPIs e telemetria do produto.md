---
tipo: tarefa
id: T-0017
status: concluida
responsavel: Nick Fury
desafio: C18
data_criacao: 2026-09-15
data_atualizacao: 2026-10-15
tags: [tarefa, cbl, c18, metricas, analytics, kpis, frila]
---

# Definir plano de métricas, KPIs e telemetria do produto

## Contexto
Para avaliar o sucesso do Frila e atender às exigências acadêmicas e de produto da Apple Developer Academy, é indispensável estabelecer quais métricas orientam as decisões e quais indicadores refletem a saúde do produto.

Esta tarefa estrutura a árvore de métricas do produto e o plano de instrumentação analítica (telemetria), alinhando quais eventos precisam ser rastreados no aplicativo para a posterior avaliação de métricas.

Documento de referência canônica no cliente iOS: `iOS/Docs/PlanoDeMetricas.md` (commit `origin/main` no repositório `frila-frontend`), espelhado no contrato OpenAPI (`iOS/Contrato/openapi.yaml:3184` e `:3808`) e nas views do Supabase (`metrica.funil_*`, `public.evento_app`).

---

## Feito quando
- [x] North Star Metric (NSM) do produto definida: **Turnos concluídos com presença verificada por semana no Distrito Federal** (sem métricas D30; janela de até 18 dias do piloto).
- [x] KPIs operacionais e de negócio definidos com fórmulas matemáticas, fontes do dado e janelas de até 18 dias (D30 vedada):
  - *Liquidez & Agilidade:* Taxa de Preenchimento (Fill Rate), Tempo Mediano entre Publicação e Confirmação.
  - *Confiança:* Taxa de Comparecimento (Show-up Rate), Avaliações Positivas Mútuas.
  - *Engajamento & Retenção:* Vagas por Estabelecimento por Semana, Retenção D7/D14 e Recontratação B2B.
  - *Engenharia & SLA:* SLA de Despacho de Push ($\le 30$ s, RNF03), Entrega do Provedor de Push ($99\% \le 60$ s, RNF02), Integridade da Trilha de Ciclo (RNF13).
- [x] Dicionário de eventos analíticos (taxonomia de tracking) especificado com os 14 eventos fechados mapeados por etapa do funil e gatilhos no código Swift.
- [x] Dicionário de eventos aprovado tecnicamente pelo iOS e conferido no backend em 15/10/2026 (Nick Fury, dev iOS do Cauê, por delegação dele). Única objeção, do iOS: a fila offline da telemetria, corrigida em PR próprio do frontend.
- [x] Conformidade com a LGPD e RN15 revisada e aprovada em 15/10/2026 (sem campos de texto livre, sem dados de contato, sem GPS na telemetria, eventos pseudônimos ligados à conta, retenção de 90 dias via `pg_cron`).
- [x] Documento do Plano de Métricas finalizado e sincronizado no vault da Bancada.

---

## 1. Premissas Duras de Medição do Piloto

1. **Duração do piloto:** O piloto opera com duração máxima de **18 dias** no DF. Nenhuma métrica de produto pode depender de janelas superiores a 18 dias (métricas D30 ou retenção mensal estão expressamente vedadas deste plano).
2. **Sem metas de tempo inventadas:** As metas de tempo pré-fixadas foram retiradas das especificações porque não havia base empírica de aferição. O piloto é a ferramenta de calibração; os números obtidos serão contrastados contra as linhas de base extraídas das entrevistas qualitativas com o setor.
3. **Isolamento de dados de teste (RN15 e RNF13):** Todas as consultas e consolidações excluem formalmente contas de teste/demonstração (`usuario.demonstracao = true`) e contas pertencentes ao time interno do Frila (`privado.conta_equipe`), conforme implementado nas views do schema `metrica` no Supabase (`20260930150000_views_funil_piloto.sql`).
4. **Privacidade por padrão (LGPD):** A telemetria de produto não recebe, trafega nem armazena campos livres de texto, nomes, números de telefone, e-mails, documentos ou coordenadas geográficas brutas de GPS (Art. 7º, 11 e 37 da LGPD; `iOS/Docs/LGPD.md:31-45`).

---

## 2. North Star Metric

> **North Star:** Turnos concluídos com presença verificada por semana no Distrito Federal.

Essa métrica sintetiza o valor central da plataforma: conectar um estabelecimento que precisa de mão de obra temporária a um profissional qualificado, culminando na prestação real do serviço no local de trabalho.

### 2.1 Critérios Cumulativos de Conclusão e Presença
A tabela `turno` não tem coluna de status nem de profissional. O estado mora na posição (`posicao.estado`), e a presença mora no turno (`turno.verificacao`). Um turno conta para a North Star quando satisfaz cumulativamente:
1. **Concluído:** a posição terminou confirmada (`posicao.estado = 'cumprida'`). A rotina `privado.fechar_turnos_e_vagas()` (pg_cron, a cada 5 min) passa a posição de `confirmada` para `cumprida` quando `posicao.fim_em` já passou; posição cancelada nunca vira `cumprida`.
2. **Presença verificada:** `turno.verificacao = 'verificado'`. O servidor só grava esse valor em dois casos:
   - check-in **geolocalizado**, aceito só com distância de até **200 m** do local da vaga (RN22; constraint `checkin_no_raio`; no app, `Localizacao.swift:46`). Os 100 m que aparecem no app são a precisão horizontal máxima da leitura de GPS (`Localizacao.swift:48`), e não o raio;
   - check-in **manual** confirmado pelo contratante (`checkin_tipo = 'manual'` e `checkin_confirmado_em IS NOT NULL`).

O check-out (`turno.checkout_em`) **não** entra na North Star: o servidor encerra o turno e libera a avaliação sem ele. A taxa de check-out fica como indicador auxiliar (KPI 3).

### 2.2 Fórmula Matemática
$$ \text{North Star (semana } w\text{)} = \sum_{p \in \text{Posições}} [p.\text{estado} = \text{'cumprida'} \land \text{turno}(p).\text{verificacao} = \text{'verificado'} \land \text{semana}(p.\text{fim\_em}) = w] $$

A semana é a do **fim do turno** (`posicao.fim_em`), no fuso de Brasília. A consulta SQL completa, com a exclusão de demonstração e equipe, está na seção 2.3 de `iOS/Docs/PlanoDeMetricas.md`.

- **Fonte do dado:** `public.turno`, `public.posicao`, `public.vaga`, `public.profissional`, `public.usuario` e `privado.conta_equipe` (nomes conferidos no `develop` do `frila-backend` em 15/10/2026).
- **Janela de medição:** Semanal (7 dias) e total acumulado do piloto (18 dias).

---

## 3. KPIs Operacionais e de Negócio (Janelas $\le 18$ Dias)

| KPI | Conceito e Importância | Linha de Base (Entrevistas) | Fórmula | Fonte do Dado | Janela |
|---|---|---|---|---|---|
| **1. Taxa de Preenchimento (Fill Rate)** | Proporção de posições ofertadas pelos contratantes que foram preenchidas e confirmadas. Mede a liquidez da oferta. | No WhatsApp, estimava-se ~70% de cobertura, com 30% de vagas sem fechamento. | $\frac{\sum \text{Posições Confirmadas}}{\sum \text{Posições Ofertadas}} \times 100$ | `metrica.funil_por_vaga` (`confirmacoes` e `posicoes_ofertadas`). `confirmacoes` inclui posições canceladas depois de confirmadas; para o preenchimento efetivo, conte `posicao.estado in ('confirmada', 'cumprida')` | Diária e 18 dias |
| **2. Tempo entre Publicação e Confirmação** | Tempo decorrido desde a publicação da vaga até o aceite definitivo da vaga pelo contratante. Medido pela mediana para neutralizar distorções. | No WhatsApp variava de 2 h a mais de 24 h. Sem meta pré-fixada: calibração empírica. | $\text{Mediana}(p.\text{confirmado\_em} - v.\text{publicado\_em})$ | `metrica.funil_confirmacoes` (`duracao_confirmacao_segundos`) | Diária, por estabelecimento e 18 dias |
| **3. Taxa de Comparecimento (Show-up Rate)** | Percentual de profissionais contratados que efetivamente compareceram ao local e efetuaram check-in verificado. Auxiliar: taxa de check-out. | Taxa de falta sem aviso prévio ("no-show") no WhatsApp relatada entre 20% e 35% (comparecimento de 65% a 80%). | $\frac{\sum \text{Posições cumpridas com turno verificado}}{\sum \text{Posições cumpridas}} \times 100$ | Consulta direta em `public.posicao` e `public.turno`. A coluna `checkins` de `metrica.funil_por_vaga` conta qualquer `checkin_em`, inclusive manual sem confirmação; a razão das views é só um teto aproximado | Diária e 18 dias |
| **4. Avaliações Positivas Mútuas** | Proporção de turnos concluídos onde ambas as partes registraram avaliação positiva mútua. Mede satisfação e qualidade de par. | Inexistente no mercado informal (feedback ocorre apenas por atrito). | $\frac{\sum \text{Turnos com 2 Avaliações Positivas}}{\sum \text{Turnos com Ambas Avaliações}} \times 100$ | `public.avaliacao` (`turno_id`, `autor_id`, `resposta`) | Acumulada em 18 dias |
| **5. Vagas por Estabelecimento por Semana** | Intensidade de uso da plataforma pelos contratantes ativos. Mede engajamento B2B. | Donos de bares no DF relataram demanda de 2 a 5 extras/frilas por final de semana (sex/sáb/dom). | $\frac{\sum \text{Vagas Publicadas}}{\text{Estabelecimentos com Vagas}} \text{ por semana}$ | `metrica.funil_por_estabelecimento` (`vagas_publicadas`) | Semanal (7 dias) |
| **6. Retenção D7/D14 e Recontratação** | Retenção D7 e D14 de usuários ativos e taxa de estabelecimentos que realizam nova contratação dentro do piloto de 18 dias. | Retenção informal baseada em listas estáticas de WhatsApp dos gerentes. | Coorte D7: Ativos em $T$ com nova ação em $[T+6, T+8]$; Coorte D14: nova ação em $[T+13, T+15]$. | `public.vaga.publicado_em`, `public.candidatura.criada_em`, `public.turno.checkin_em` | 7 e 14 dias (D30 vedada) |
| **7. SLA de Despacho de Push (RNF03)** | Envio da notificação aos elegíveis pelo agendador em até 30 segundos da publicação. | Requisito técnico de arquitetura assíncrona (`pg_cron` + `pgmq`). | $\frac{\sum \text{Vagas com Despacho} \le 30\,\text{s}}{\sum \text{Total de Vagas}} \times 100$ | `public.despacho.criado_em` vs `public.vaga.publicado_em` | Tempo real e diária |
| **8. Entrega do Provedor de Push (RNF02)** | 99% das notificações aceitas pelo provedor (FCM / APNs) em até 60 segundos do despacho. | Requisito não-funcional de entrega de notificação de alerta. | $\frac{\sum \text{Notificações Aceitas em } \le 60\,\text{s}}{\sum \text{Notificações Despachadas}} \times 100 \ge 99\%$ | Logs de despacho da Edge Function e provedor FCM/APNs | Diária |
| **9. Integridade da Trilha de Ciclo (RNF13)** | Registros imutáveis de transição de estado sem dados pessoais para auditoria de ciclo. | Requisito de auditoria e conformidade. | $100\%$ das transições de vaga, turno e avaliação auditadas sem falha de integridade. | `privado.auditoria_ciclo` | Contínua |

---

## 4. O Funil Completo do Piloto

O funil de ponta a ponta do Frila compreende 6 etapas obrigatórias:

```
[1. Vaga Publicada] 
       │  Δt1: Despacho (alvo RNF03 ≤ 30 s)
       ▼
[2. Notificações Enviadas] (agrupadas, máx 3 por lote, RN23)
       │  Δt2: Visualização e Decisão de Candidatura
       ▼
[3. Candidaturas Recebidas]
       │  Δt3: Escolha e Confirmação da Posição (RN07/RN10)
       ▼
[4. Confirmação do Turno]
       │  Δt4: Comparecimento e Chegada (tolerância de check-in)
       ▼
[5. Check-in e Execução] (raio ≤ 200 m, RN22, ou manual confirmado)
       │  Δt5: Conclusão do Expediente e Envio de Feedback
       ▼
[6. Avaliação Mútua] (contratante e profissional)
```

### Tempos entre Etapas a Medir (Sem Metas Pré-Fixadas)
- $\Delta t_1$ (Publicação $\to$ Notificação): Tempo de processamento do agendador (`despacho.criado_em - vaga.publicado_em`). Meta técnica de RNF03: $\le 30$ s.
- $\Delta t_2$ (Notificação $\to$ Primeira Candidatura): Tempo de reação dos profissionais ao push.
- $\Delta t_3$ (Candidatura $\to$ Confirmação): Velocidade de decisão do contratante ao selecionar o candidato (`posicao.confirmado_em - candidatura.criada_em`, da candidatura do profissional confirmado; publicação → confirmação é o KPI 2).
- $\Delta t_4$ (Início Previsto $\to$ Check-in Real): Pontualidade e atrasos no comparecimento (`turno.checkin_em - posicao.inicio_em`; o turno não tem horário próprio).
- $\Delta t_5$ (Fim do Turno $\to$ Avaliação): Tempo até o fechamento formal e envio da avaliação (`avaliacao.criada_em - posicao.fim_em`).

---

## 5. Dicionário de Eventos de Telemetria (14 Eventos)

O dicionário é fechado e estrito, correspondente ao enum `EventoDeTelemetria` em `iOS/Contrato/openapi.yaml:3808` e `public.evento_de_telemetria` em `20260930180000_telemetria_evento_app.sql:29`.

### 5.1 Estrutura do Payload (RPC `registrar_evento`)
Conforme o contrato em `iOS/Contrato/openapi.yaml:3184-3226`:
- `evento`: Identificador único do enum (obrigatório).
- `vaga_id`: UUID da vaga associada (opcional / nulo).
- `turno_id`: UUID do turno associado (opcional / nulo).
- `ocorrido_em`: Instante ISO-8601 em que o evento ocorreu no aparelho (rejeita datas futuras: `422 registro_no_futuro`).
- `usuario_id`: Injetado automaticamente pelo servidor via `auth.uid()`.

### 5.2 Mapeamento Completo dos 14 Eventos

| # | Evento (`evento`) | Etapa do Funil | Quando Dispara (Gatilho no App) | Propriedades Permitidas | Revisão LGPD (`LGPD.md`) | Arquivo:Linha Alvo no App |
|---|---|---|---|---|---|---|
| 1 | `app_aberto` | Abertura | Quando o ciclo de vida do app passa para ativo/primeiro plano. | `ocorrido_em` | Conforme: sem identificadores pessoais além do JWT de sessão. | `App/FrilaApp.swift:34` ou `MedicaoDeAbertura.swift:20` |
| 2 | `cadastro_concluido` | Onboarding | Após a confirmação de criação de perfil profissional ou estabelecimento. | `ocorrido_em` | Conforme: nenhum dado de cadastro (nome, e-mail, telefone) é anexado. | `Apresentacao/Fluxos/Autenticacao/CadastroViewModel.swift:150` |
| 3 | `permissao_push_negada` | Permissão | Quando a pessoa recusa formalmente a solicitação de notificações do iOS. | `ocorrido_em` | Conforme: telemetria de diagnóstico do sistema (Art. 7º, IX). | `Apresentacao/Fluxos/Push/PermissaoDePushModelo.swift:68` |
| 4 | `vaga_vista` | Descoberta | Quando um cartão de vaga entra na viewport visível do feed do profissional. | `vaga_id`, `ocorrido_em` | Conforme: apenas o ID da vaga e timestamp. | `Apresentacao/Fluxos/Profissional/FeedVagasViewModel.swift:80` |
| 5 | `vaga_detalhe_aberto` | Interesse | Quando a tela de detalhes de uma vaga específica é aberta pelo profissional. | `vaga_id`, `ocorrido_em` | Conforme: apenas ID da vaga. | `Apresentacao/Fluxos/Profissional/DetalheVagaViewModel.swift:33` |
| 6 | `candidatura_enviada` | Candidatura | Quando o profissional submete a candidatura com sucesso. | `vaga_id`, `ocorrido_em` | Conforme: nenhum dado de contato é enviado. | `Apresentacao/Fluxos/Profissional/CandidaturaViewModel.swift:123` |
| 7 | `candidatura_retirada` | Candidatura | Quando o profissional cancela voluntariamente sua candidatura pendente. | `vaga_id`, `ocorrido_em` | Conforme: apenas ID da vaga. | `Apresentacao/Fluxos/Profissional/CandidaturaEmSelecao.swift:129` |
| 8 | `checkin_tentado` | Presença | Quando o profissional aciona o botão de check-in, antes da validação do raio. | `turno_id`, `ocorrido_em` | Conforme: coordenada GPS de tentativa **nunca** é enviada. | `Apresentacao/Fluxos/Profissional/PresencaDoTurnoViewModel.swift:230` |
| 9 | `checkin_concluido` | Presença | Quando a resposta de `fazer_checkin` retorna com sucesso (distância $\le 200$ m, RN22). | `turno_id`, `ocorrido_em` | Conforme: distância em metros mantida no registro do turno, não na telemetria. | `Apresentacao/Fluxos/Profissional/PresencaDoTurnoViewModel.swift:269` |
| 10 | `checkout_concluido` | Conclusão | Quando a confirmação de encerramento do turno (`fazer_checkout`) é confirmada. | `turno_id`, `ocorrido_em` | Conforme: sem dados pessoais. | `Apresentacao/Fluxos/Profissional/PresencaDoTurnoViewModel.swift:270` |
| 11 | `avaliacao_enviada` | Avaliação | Quando a avaliação da contraparte é submetida com sucesso. | `turno_id`, `ocorrido_em` | Conforme: nota/resposta fica na tabela de avaliação; evento só atesta envio. | `Apresentacao/Fluxos/Profissional/AvaliacaoTurnoViewModel.swift:309` |
| 12 | `contato_aberto` | Comunicação | Quando a pessoa clica no botão "Abrir WhatsApp" para falar com a contraparte. | `turno_id`, `ocorrido_em` | Conforme: telefone e link do WhatsApp **nunca** são transmitidos na telemetria. | `MeuTurnoViewModel.swift:208` (`registrarContatoAberto()`, chamado por `TelaMeuTurno.swift:236`) e `Contratante/MinhasVagas.swift:710` |
| 13 | `acao_enfileirada_offline` | Resiliência | Quando tentativa de check-in, check-out ou cancelamento é enfileirada no cache offline. | `turno_id`, `ocorrido_em` | Conforme: diagnóstico de operação offline (Art. 7º, IX). | `PresencaDoTurnoViewModel.swift:329`, `Cancelamento/CancelamentoViewModel.swift:239` e `Dados/SincronizadorAcoes.swift:74` |
| 14 | `atualizacao_obrigatoria_exibida` | Integridade | Quando o portão de versão mínima exibe o bloqueio de versão desatualizada da API. | `ocorrido_em` | Conforme: sem dados pessoais. | `Apresentacao/AtualizacaoObrigatoria.swift:42` |

---

## 6. Conformidade com a LGPD e Proteção de Dados (RN15)

1. **Sem texto livre:** Nenhum dos eventos aceita campos abertos (`mensagem`, `observacao`, `erro`), eliminando desvios com inclusão de dados pessoais em tempo de execução.
2. **Sem dados de contato:** Números de telefone, e-mails e nomes são terminantemente proibidos na carga dos eventos.
3. **Sem coordenadas de GPS na telemetria:** nenhum evento leva latitude ou longitude. No check-in, a leitura de GPS fica no aparelho: o app calcula a distância e envia ao servidor só a distância em metros (`fazer_checkin`), gravada no turno, fora da telemetria. Coordenada existe no servidor em outro tratamento, fora deste plano: o ponto de referência do cadastro e o ponto da vaga (`vaga.ponto`), descritos em `LGPD.md`.
4. **Pseudônimos, não anônimos:** o evento não leva nome, telefone nem e-mail, mas o servidor grava o `usuario_id` (de `auth.uid()`). O evento é ligado à conta: é dado pessoal pseudonimizado.
5. **Ciclo de vida e retenção:** os eventos de `public.evento_app` com mais de 90 dias são apagados pela rotina diária `privado.executar_retencao_diaria()` (pg_cron), que chama `privado.limpar_eventos_app(90)`. A tabela tem RLS: o app só grava pela RPC `registrar_evento` e não lê; a leitura é só do `service_role` e das views do schema `metrica`.

---

## 7. Status de Aprovação e Governança

Conforme critérios do cartão `qorNKAlB`, todos fechados em 15/10/2026 por Nick Fury (dev iOS do Cauê, por delegação dele):
- **Fórmulas da North Star e dos KPIs:** aprovadas, com as correções acima (raio de 200 m, North Star por posição cumprida e turno verificado, nomes de coluna conferidos no backend).
- **Dicionário de eventos:** aprovado. Os 14 nomes batem em três lugares (plano, `openapi.yaml` e enum SQL).
- **Revisão de dado pessoal:** aprovada por Nick Fury no lugar da Júlia, por decisão do Cauê. O responsável pelo tratamento é pessoa física (Cauê Carneiro Kilanovic), sem DPO nomeado.
- **Consultas SQL do funil:** as views `metrica.funil_*` têm teste pgTAP com o seed (`490_funil_piloto.sql`, 43 verificações). A consulta da North Star foi conferida contra o esquema, mas ainda não tem teste automatizado; a view `metrica.north_star_semanal` com teste foi pedida ao backend por cartão.
- **Pendente fora do app:** a fila offline da telemetria (PR `fix/ios-telemetria-fila-offline` do frontend), os links de campanha no App Store Connect (Cauê) e a aprovação executiva (Fabrício / Sócios).

---

## Notas
- 2026-09-15 — Tarefa aberta visando a governança analítica do produto e o preparo para a review de métricas da Academy.
- 2026-10-13 — Documento atualizado (Missão S78 · Steve Rogers) com paridade integral a `iOS/Docs/PlanoDeMetricas.md` do `frila-frontend`: North Star por semana no DF, KPIs com janelas $\le 18$ dias (D30 vedada), funil de 6 etapas, dicionário de 14 eventos mapeados por arquivo e linha no app, conformidade LGPD/RN15 e pendência de aprovação técnica marcada com `[A APROVAR: desenvolvedores do app]`.
- 2026-10-15 — Nick Fury: fórmulas conferidas contra o esquema real do backend (raio de 200 m; North Star sem `turno.status`, que não existe; Δt e KPIs com os nomes de coluna reais), GPS e pseudônimos reescritos, critérios do cartão `qorNKAlB` aprovados e tarefa concluída. Fonte: `iOS/Docs/PlanoDeMetricas.md`, PR #321 do `frila-frontend`.

---
← [[04 - Tarefas/00 - Índice Tarefas|Índice de Tarefas]]
