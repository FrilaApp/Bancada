# Frila — Leia primeiro

**Versão 1.0 · setembro/2026**

Ponto de entrada do projeto. Se for ler um arquivo só, leia este.

---

## A tese, em uma linha

**Frila é uma plataforma onde o contratante publica a vaga (o bico, o frila), a pessoa se candidata, e despacho ativo por geolocalização, registro de horas e reputação binária tornam esse processo rápido e confiável.**

A estratégia de mercado é territorial e sequencial: nascer no Distrito Federal e dominar aqui — restaurantes, bares, buffets, casas de evento, festas, cafeterias, eventos itinerantes, eventos sociais, eventos políticos, serviços domésticos, etc — antes de expandir para o resto do Brasil, e só depois para fora do país. Não é uma tese sobre estar em todo lugar ao mesmo tempo; é sobre ganhar um mercado por vez, começando pelo que se conhece.

**O que isso NÃO é:** um mural passivo de vagas onde o contratante posta e espera. A candidatura existe, mas quem faz o trabalho pesado é o despacho — a vaga é notificada ativamente aos profissionais elegíveis por raio geográfico, função e disponibilidade, em vez de esperar alguém encontrar o anúncio.

**Em aberto, deliberadamente:** o modelo de monetização e a stack técnica ainda não estão decididos. O único requisito técnico já fechado é a existência de um app iOS nativo, com o backend podendo ser externo.

---

## O conjunto de documentos

O conjunto tem duas camadas. Os cinco arquivos numerados são a fonte detalhada, cada um com seu recorte e sua profundidade. Os dois consolidados reúnem esse mesmo conteúdo em texto corrido, para quem precisa do todo sem abrir cinco arquivos.

**Consolidados**

| Arquivo | O que responde |
|---|---|
| `README.md` | Visão geral do projeto inteiro: problema, para quem, como funciona, mercado, concorrência, o que está decidido e o que está em aberto |
| `EVIDENCIAS.md` | Todo o lastro reunido: dados com fonte e data, avaliações dos apps concorrentes, dossiê dos 14 concorrentes e as perguntas que só campo responde |

**Detalhados**

| Arquivo | O que responde |
|---|---|
| `00-LEIA-PRIMEIRO.md` | A tese e o estado do projeto |
| `01-O-PROBLEMA.md` | O problema do contratante e do profissional, separando dado de hipótese |
| `02-O-NEGOCIO.md` | O que é o Frila, para quem, e como funciona ponta a ponta |
| `03-ESPECIFICACAO-DO-PRODUTO.md` | Os três produtos, os fluxos principais e os pilares da experiência |
| `04-MERCADO-E-CONCORRENCIA.md` | Tamanho de mercado, concorrentes e por que o WhatsApp ainda domina |

As duas camadas dizem a mesma coisa. Quando divergirem, a camada detalhada é a fonte da verdade, porque é onde cada número carrega sua marca de origem.

---

## Estado do projeto

| Item | Situação |
|---|---|
| Documentação de negócio, problema, produto e mercado | Revisada e consolidada em setembro/2026 |
| Equipe | 5 sócios: Cauê Carneiro, Fabrício Tosta, João Paulo, Júlia Clovandi, Matheus Silva |
| Código | **Nenhum** |
| Validação de campo | **Nenhuma** |
| Receita | Zero |
| Estágio de maturidade tecnológica | **TRL 2** — conceito formulado, nada implementado |

---

## Prioridades atuais

1. **Validação de campo.** 50 conversas. Sem isso, todo número deste conjunto de documentos é hipótese. As perguntas já estão formuladas e em ordem de importância em `01-O-PROBLEMA.md`, seção 6, e repetidas em `EVIDENCIAS.md`.
2. **Decidir monetização e stack técnica**, hoje ambos em aberto. O modelo de cobrança de cada concorrente está levantado em `04-MERCADO-E-CONCORRENCIA.md` e serve de referência, não de resposta.

**Já decidido:** Brasília é o primeiro mercado, não um laboratório. O objetivo aqui não é só validar — é dominar o DF antes de sair dele. Validado e consolidado no DF, o próximo passo é o resto do Brasil, depois outros países.

---

## Como usar estes documentos

Para entender o projeto inteiro de uma vez, leia o `README.md`. Para conferir de onde vem cada número, `EVIDENCIAS.md`. Para trabalhar em uma frente específica, vá direto ao documento numerado correspondente, que é onde está a profundidade.

Tudo aqui é **hipótese com teste anexado**, não decisão tomada. Valores marcados `[H]` são estimativas de fonte pública ou de aritmética — nenhum foi confirmado em campo. As marcas usadas nos documentos de evidência (Dado, Relato, Fonte interessada, Lacuna) estão explicadas em `01-O-PROBLEMA.md` e em `EVIDENCIAS.md`.

Um documento de estratégia que continua igual depois de cinquenta conversas com clientes é um documento que ninguém usou. A expectativa é que parte destes números esteja errada e seja corrigida com dado real.
