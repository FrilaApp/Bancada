---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/freelas-eventos.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Freelas Eventos

![[04 - Tarefas/Anexos/concorrente-freelas-eventos.png|Captura da loja: Freelas Eventos]]

## 1. Ficha
| Campo | Dado | Fonte |
|---|---|---|
| Empresa (razão social, CNPJ se público) | Desenvolvido por Leandro Porta / Portapps. CNPJ não encontrado (buscado em: site institucional freelas.app.br, App Store e Google Play em 01/10/2026; CNPJ não divulgado publicamente) | Apple App Store (`seller: Leandro Porta`, bundle `com.portapps.freelas`) e site https://www.freelas.app.br/ |
| Fundação e fundadores | Leandro Porta (Fundador e Desenvolvedor). Lançamento na App Store em 01/03/2026. | Apple App Store e registros de versão do aplicativo |
| Sede | Sede física e endereço comercial não encontrados (buscado em: registros empresariais e site oficial; região operacional declarada com foco no interior do Estado de São Paulo para festas, casamentos e formaturas) | Descrição oficial da loja Apple e portal web |
| Plataformas e links (App Store, Google Play, web) | Web: https://www.freelas.app.br/ <br>App Store: https://apps.apple.com/br/app/freelas/id6757984898 <br>Google Play: https://play.google.com/store/apps/details?id=br.com.portapps.freelas | Lojas oficiais e portal institucional (01/10/2026) |
| Nota e nº de avaliações (iOS e Android, com data) | iOS: 3,7 / 5 (3 avaliações em 01/10/2026, versão 1.0.6) <br>Android: Sem nota pública consolidada (<5 avaliações em 01/10/2026; atualizado em 14/09/2026) | Apple App Store e Google Play Store (01/10/2026) |
| Downloads (Google Play) | 1.000+ downloads (verificado em 01/10/2026) | Google Play Store (01/10/2026) |
| Cobertura (cidades e estados; **atua no DF?**) | Foco no interior de São Paulo (cidades com forte mercado de casamentos, formaturas e eventos sociais). **Sem evidência pública de atuação no DF** (buscado em https://www.freelas.app.br e descrição da App Store em 01/10/2026) | Descrição oficial do app e portal web |
| Público dos dois lados (quem contrata, quem trabalha) | Quem contrata: Buffets de festas, cerimonialistas, produtoras de formaturas e congressos, gestores de espaços de eventos. <br>Quem trabalha: Garçons de eventos, copeiros, cozinheiros, recepcionistas, seguranças e coordenadores de pista | Portal web institucional e descrição da App Store |
| Funções ou categorias | Eventos sociais e corporativos: Garçom, Cozinheiro, Recepcionista, Barman/Bartender, Apoio de Limpeza, Segurança e Coordenador de Salão | Descrição do app e categorias no portal web |
| Investimento recebido (rodadas, investidores, valores) | Sem evidência pública de captação institucional (buscado em Crunchbase e bases de dados em 01/10/2026); bootstrap independente / autofinanciado | Plataformas de rastreamento de startups e imprensa |

## 2. Como funciona
O Freelas Eventos é estruturado especificamente para a dinâmica de eventos com múltiplos dias e equipes sob medida para casamentos e convenções:

1. **Criação do Evento:** O contratante cadastra os dados do evento (nome da ocasião, local, data de início/término, horários e requisitos específicos de vestimenta social).
2. **Definição de Vagas e Escalas:** Permite configurar demandas detalhadas por função e por dia (suporte nativo a eventos multi-dias, como congressos de 3 dias ou festas com montagem prévia).
3. **Candidatura e Convites Prioritários:** O app envia notificações para freelancers da região. O contratante pode indicar seus "favoritos" com confirmação prioritária automática.
4. **Ranking de Confiança:** Contratantes analisam a pontuação de confiança de cada candidato antes de aprovar, avaliando taxa histórica de comparecimento e cancelamentos prévios.
5. **Comunicação por Evento:** Abertura de um canal de chat privativo agrupando todos os freelancers confirmados para aquele evento específico, facilitando recados gerais.
6. **Controle de Presença:** O contratante confirma a presença e a pontualidade no dia do evento diretamente no painel de gestão.
7. **Pagamento:** O aplicativo oferece painel de controle e acompanhamento financeiro de status de pagamento, mas a liquidação monetária é efetuada pelo contratante (via Pix/transferência bancária direta aos prestadores).
8. **Avaliação Recíproca:** Conclusão do turno com avaliação mútua e atualização do índice de reputação no ranking de confiança.

## 3. Modelo de negócio hoje
* **Quem paga:** Acesso comunitário/freemium com funcionalidades de gestão de equipe para contratantes.
* **Cobrança / Preços:** O aplicativo não exibe tabelas públicas de mensalidade obrigatória ou trava tarifária no onboarding inicial de 2026 (o site institucional em freelas.app.br ainda possui links de rodapé em formatação âncora `#`, demonstrando que o produto está operando em fase de aquisição comunitária gratuita e validação de tração).
* **Transação financeira:** **Fora do app.** O sistema atua como painel de gestão e apontamento de pagamentos ("acompanhe pagamentos e exporte seus dados financeiros"), sem reter a custódia do dinheiro nem cobrar taxa percentual de intermediação sobre a diária.
* **Seguro:** Não oferece apólice de seguro contra acidentes pessoais aos prestadores.
* **Nota fiscal:** Não emite notas fiscais de diárias (cada prestador de serviço e contratante responde por suas obrigações tributárias individuais).
* **Vínculo jurídico:** Prestação de serviços autônoma pontual para eventos sociais e corporativos.

## 4. Nascimento e evolução do modelo
* **Março/2026 (Lançamento v1.0.0):** Publicado na Apple App Store por Leandro Porta com a proposta de organizar o mercado desordenado de freelancers para casamentos e buffets no interior paulista.
* **Abril a Setembro/2026 (Versões 1.0.1 a 1.0.6):** Adição de recursos de conformidade com a LGPD (exportação e exclusão de dados pessoais), suporte a múltiplos gestores para a mesma conta empresarial de buffet e módulo de chamados/tickets de suporte.
* **Estado em 01/10/2026:** Produto em versão 1.0.6, mantendo foco estrito no ambiente iOS e Web PWA, ainda em estágio inicial de densidade de usuários.

## 5. Features
| Feature | Tem? | Desde quando | Observação |
|---|---|---|---|
| Despacho / Notificação de vaga | Sim | 2026 | Notificações push em tempo real a cada etapa do processo |
| Candidatura em 1 toque | Sim | 2026 | Candidatura simplificada pelo app |
| Seleção pelo contratante | Sim | 2026 | Gestão de candidaturas com aprovação individual ou em lote |
| Check-in / Check-out com localização | Parcial | 2026 | Acompanhamento de presença realizado pelo contratante no painel |
| Avaliação mútua | Sim | 2026 | Avaliações bilaterais após a realização do evento |
| Reputação visível / Sistema de confiança | Sim | 2026 | **Destaque:** Score de pontuação baseado em histórico de presenças e cancelamentos |
| Pagamento no app | Não | - | Painel de controle de pagamentos, mas sem custódia ou gateway interno |
| Adiantamento / Saque rápido | Não | - | Pagamento direto realizado pelo buffet/contratante |
| Seguro de acidentes | Não | - | Sem cobertura securitária |
| Escala e recorrência | Sim | 2026 | **Destaque:** Suporte para "Eventos Multi-dias" e escalas consecutivas |
| Equipe de confiança / Favoritos | Sim | 2026 | Contratantes salvam melhores profissionais com confirmação automática |
| Chat | Sim | 2026 | Chat integrado entre contratante e equipe escalada no evento |
| Verificação de identidade e antecedentes | Básica | 2026 | Cadastro autodeclaratório com controle de privacidade |
| Gestão de equipe para empresas | Sim | 2026 | Suporte para múltiplos gestores na mesma empresa |
| Relatórios e LGPD | Sim | 2026 | Exportação de relatórios financeiros e exclusão facilitada de dados (LGPD) |

## 6. Tração e números públicos
* **Downloads / Base instalada:** 1.000+ downloads no Google Play Store (pacote `br.com.portapps.freelas`, versão atualizada em 14/09/2026); dados brutos de download no iOS não divulgados publicamente pela Apple.
* **Avaliações nas lojas:** 3 avaliações na App Store (nota 3,7/5); menos de 5 avaliações consolidadas no Google Play em 01/10/2026.
* **Receita / GMV / Métricas declaradas:** não encontrado (buscado em: site oficial e bases públicas em 01/10/2026; faturamento e volume de diárias não divulgados publicamente).
* **Classificação de maturidade:** Operação regional em crescimento inicial focada no interior paulista.

## 7. Aquisição e crescimento (go-to-market)
* **Aquisição comunitária e nichada:** Foco em grupos locais de garçons e buffets de festas infantis, casamentos e formaturas em cidades do interior paulista.
* **Redes Sociais:**
  - **Instagram:** Menção ao perfil institucional `@freelas.app` no rodapé da página web.
  - **TikTok:** Sem presença ou menções relevantes (não faz parte dos apps viralizados do setor).
* **Posicionamento de marca:** Constrói apelo em torno do conceito de "Comunidade de Eventos", posicionando-se mais como um facilitador de relações humanas e menos como um intermediário mercantil burocrático.

## 8. O que os usuários dizem
* **Lojas de aplicativos (App Store):**
  - Volume modesto de 3 avaliações com nota média de 3,7/5 (avaliações registradas entre 03/2026 e 09/2026).
  - Feedback ressalta a boa proposta de visualização das escalas de eventos de vários dias, contrastando com a falta de volume de vagas frequentes em algumas cidades.
* **Reclame Aqui:** Sem evidência pública de perfil institucional ativo ou reclamações registradas (buscado por "Freelas Eventos" e "Portapps" em https://www.reclameaqui.com.br/ em 01/10/2026).

## 9. Pontos fortes
1. **Modelagem sob medida para eventos sociais:** O suporte a "Eventos Multi-dias" e gestão de escalas consecutivas reflete o entendimento do dia a dia de buffets e cerimonialistas.
2. **Favoritos com confirmação automática:** Permite ao contratante escalar sua "panelinha" de confiança com apenas 1 clique antes de abrir vagas para o público geral.
3. **Múltiplos gestores por conta empresarial:** Buffets com diferentes coordenadores de salão conseguem usar a mesma conta para gerenciar equipes independentes.
4. **Chat por evento integrado:** Evita a criação caótica de novos grupos de WhatsApp temporários a cada casamento.

## 10. Pontos fracos
1. **Sem liquidação financeira integrada:** Deixar o pagamento fora do app expõe o freelancer a atrasos dos contratantes e elimina a principal fonte potencial de monetização e retenção da plataforma.
2. **Maturidade jurídica e técnica inicial:** Páginas de termos de uso e política de privacidade com links âncora vazios (`#`) no site institucional indicam uma operação ainda incompleta do ponto de vista de compliance.
3. **Concentração geográfica e liquidez restrita:** Foco restrito a polos de eventos do interior de SP, sem densidade de vagas em capitais ou grandes centros urbanos.
4. **Desintermediação facilitada:** A presença de chat e apontamento de escalas sem custódia do pagamento estimula a migração das equipes recorrentes para o WhatsApp.

## 11. O que deu certo e o que deu errado
* **O que deu certo:** A funcionalidade de "ranking de confiança" com transparência sobre histórico de comparecimento e cancelamentos, além da modelagem multi-dias e favoritos que refletem a rotina de buffets.
* **O que deu errado:** Não monetizar nem intermediar o fluxo financeiro. Ao não custodiar o pagamento das diárias e depender de transferências manuais externas entre as partes, a plataforma sofre com desintermediação após a formação das primeiras equipes.

## 12. Ameaça e lições para o Frila
* **Nível de ameaça no DF:** **Nulo / Baixo**. O Freelas Eventos é um projeto regional do interior de SP, restrito a iOS e sem qualquer equipe ou alcance em Brasília.
* **O que copiar:**
  - **Apoio a múltiplos dias e turnos encadeados:** No Frila, buffets de eventos e festivais frequentemente precisam da mesma equipe para sexta, sábado e domingo. Ter suporte nativo a escalas contínuas de fim de semana é um excelente diferencial.
  - **Lista de favoritos com prioridade de despacho:** Contratantes de hospitalidade amam manter seus "garçons fixos de confiança" e só recorrer a novos nomes se os favoritos não puderem.
  - **Acesso multi-usuário para empresas:** Permitir que o dono do bar e o chefe de salão tenham logins vinculados à mesma empresa.
* **O que evitar:**
  - **Deixar o pagamento sem controle ou garantia:** A intermediação financeira é o oxigênio de retenção e governança de um marketplace de diárias.
  - **Não oferecer garantia contra calote:** Quando o buffet atrasa o pagamento do garçom por fora do app, a imagem da plataforma é prejudicada mesmo sem responsabilidade direta.
* **Onde o Frila pode ser diferente:**
  - Presença móvel completa e nativa para atender ambos os públicos.
  - Integração financeira via Pix automático ao término do turno.
  - Foco geográfico agressivo nos estabelecimentos do DF.

## Fontes
1. Site oficial Freelas Eventos: https://www.freelas.app.br/ (Acessado em 01/10/2026)
2. Apple App Store - Freelas: https://apps.apple.com/br/app/freelas/id6757984898 (Acessado em 01/10/2026)
3. Google Play Store - Freelas: https://play.google.com/store/apps/details?id=br.com.portapps.freelas (Acessado em 01/10/2026)
4. Reclame Aqui: busca institucional por "Freelas Eventos" e "Portapps" em https://www.reclameaqui.com.br/ (Acessado em 01/10/2026)

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
