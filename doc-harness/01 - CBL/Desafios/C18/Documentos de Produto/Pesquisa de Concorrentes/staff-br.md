---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/staff-br.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Staff BR

![[04 - Tarefas/Anexos/concorrente-staff-br.png|Captura da loja: Staff BR]]

## 1. Ficha
| Campo | Dado | Fonte |
|---|---|---|
| Empresa (razão social, CNPJ se público) | FUTEBOLCARD SISTEMAS LTDA / Nome fantasia: Outplan Marketing Interativo (CNPJ 01.329.666/0001-50) | Receita Federal, App Store (`seller: Futebolcard Sistemas Ltda`) e Google Play |
| Fundação e fundadores | Fundação da empresa mantenedora em 1996 (empresa tradicional de ticketing esportivo). Lançamento da iniciativa e do app Staff BR em fevereiro de 2025. | Cartão CNPJ e histórico da App Store (lançamento v1.0 em 25/02/2025) |
| Sede | Rua Bandeira Paulista, 477 - 9º andar, Itaim Bibi, São Paulo - SP, CEP 04532-011 (com filiais operacionais no RJ e Florianópolis) | Contrato social, Receita Federal e termos institucionais |
| Plataformas e links (App Store, Google Play, web) | Web: https://staffbr.com/ <br>App Store: https://apps.apple.com/br/app/staff-br/id6742115291 <br>Google Play: https://play.google.com/store/apps/details?id=br.com.futebolcard.staffbr.app | Lojas oficiais e site oficial (01/10/2026) |
| Nota e nº de avaliações (iOS e Android, com data) | iOS: 4,4 / 5 (7 avaliações em 01/10/2026, versão 3.22.0) <br>Android: 4,2 / 5 (13 avaliações em 01/10/2026, versão atualizada em 18/09/2026) | Apple App Store e Google Play Store (01/10/2026) |
| Downloads (Google Play) | 1.000+ downloads (verificado em 01/10/2026) | Google Play Store (01/10/2026) |
| Cobertura (cidades e estados; **atua no DF?**) | Atuação prioritária nos polos de Florianópolis (SC), São Paulo (SP) e Recife (PE). **Sem evidência pública de atuação no DF** (buscado em https://staffbr.com, categorias e cidades ativas declaradas em 01/10/2026) | Site institucional oficial (staffbr.com) e cidades ativas declaradas |
| Público dos dois lados (quem contrata, quem trabalha) | Quem contrata: Bares, restaurantes, hotéis, produtoras de eventos e arenas/clubes de futebol parceiros da Futebolcard. <br>Quem trabalha: Profissionais autônomos e diaristas (garçons, bartenders, cozinheiros, gandulas, bilheteiros, recepcionistas e seguranças) | Site institucional e descrições das lojas |
| Funções ou categorias | Hospitalidade, eventos e esportes: Bartender, Cozinha (Auxiliar, Chef, Cumim), Segurança de Eventos, Atendimento/Recepção, Fisioterapeutas e Operação de Estádio (Gandulas, Bilheteiros, Staff de Campo e Acesso) | Categorias ativas listadas em staffbr.com/site_v2/categories.js |
| Investimento recebido (rodadas, investidores, valores) | Financiamento corporativo interno (Corporate Venture / spin-off da Futebolcard Sistemas Ltda; sem evidência pública de captação externa independente em 01/10/2026) | Base de dados corporativa e registro CNPJ |

## 2. Como funciona
O Staff BR opera como uma plataforma inteligente sob demanda de alta velocidade com tecnologia de biometria facial:

1. **Publicação com IA:** O contratante descreve a demanda em linguagem natural no painel ou app (ex: *"Preciso de 2 garçons para sexta-feira às 18h em evento para 80 pessoas"*). O motor de IA estrutura o turno, horários, vestimenta e valor oferecido.
2. **Matching e Notificação:** O sistema cruza geolocalização, histórico de presença e avaliações do trabalhador, disparando notificações de oportunidade apenas para profissionais com alto índice de aderência.
3. **Candidatura e Verificação Facial:** O profissional visualiza valor da diária, endereço e horários. Para aceitar ou se candidatar, passa por validação biométrica facial rápida na câmera do celular (evitando fraudes de contas falsas ou terceirização não autorizada).
4. **Seleção e Confirmação:** O contratante visualiza os candidatos ranqueados por score de confiabilidade e aprova com 1 toque.
5. **Check-in Geolocalizado:** No dia do turno, o profissional realiza o check-in no aplicativo ao entrar no raio do estabelecimento. Em caso de atraso superior à tolerância, o sistema aciona automaticamente o próximo profissional da fila de espera (substituição dinâmica).
6. **Checkout e Pagamento Instantâneo:** Ao término da jornada, o contratante valida o encerramento do serviço no app. A aprovação dispara automaticamente um Pix para a conta cadastrada do trabalhador (tempo de liquidação em até 30 segundos declarado pela empresa no site institucional; não auditado por terceiros).
7. **Avaliação Bilateral:** Ambas as partes avaliam a experiência, retroalimentando o score de reputação do marketplace.

## 3. Modelo de negócio hoje
* **Quem paga:** Exclusivamente o contratante.
* **Quanto custa (conforme FAQ oficial em staffbr.com verificado em 01/10/2026):**
  - **Para o profissional:** 100% gratuito. Não há cobrança de mensalidade, taxa de inscrição, nem taxa de saque sobre o Pix recebido.
  - **Para o contratante:** Sem custo de mensalidade fixa ou taxa de adesão no modelo padrão. A plataforma cobra uma **taxa percentual (take rate) sobre cada vaga preenchida e concluída com sucesso**. Não havendo comparecimento (no-show), nenhum valor é faturado do contratante.
  - **Integração corporativa (Enterprise):** Disponibilidade de API B2B para operações com mais de 20 vagas/mês, com integração via webhook para ERPs como TOTVS e Sankhya.
* **Transação financeira:** **100% dentro da plataforma.** O fluxo de liquidação é intermediado pela solução de pagamento do ecossistema, permitindo o Pix automatizado no checkout.
* **Seguro:** A empresa enfatiza a verificação biométrica e compliance, com emissão de comprovantes formais de prestação autônoma.
* **Nota fiscal:** Emissão automática de recibo, relatório de custos operacionais e nota fiscal de prestação de serviços para a empresa contratante.
* **Vínculo jurídico:** Prestação de serviços autônoma (aceita CPF sem obrigar MEI prévio, fornecendo histórico financeiro exportável).

## 4. Nascimento e evolução do modelo
* **Fevereiro/2025 (Lançamento v1.0):** A Futebolcard Sistemas Ltda aproveitou sua infraestrutura tecnológica de controle biométrico e gestão de acessos em estádios esportivos para criar um aplicativo de contratação rápida de staff diarista para eventos esportivos e jogos de futebol.
* **Meados de 2025 a Início de 2026:** Expansão temática para o setor de hospitalidade em geral (bares, restaurantes, hotéis e casas noturnas), aproveitando a demanda reprimida por garçons e bartenders em capitais turísticas.
* **2026 (Versões 3.x e redesign site_v2):** Introdução de algoritmos de matching por inteligência artificial, promessa de "Pix em 30 segundos no fim do turno" (declarada pela empresa no site institucional) e abertura de operações nos eixos de Florianópolis, São Paulo e Recife.

## 5. Features
| Feature | Tem? | Desde quando | Observação |
|---|---|---|---|
| Despacho / Notificação de vaga | Sim | 2025 | Notificação segmentada por IA com base em afinidade de perfil e proximidade |
| Candidatura em 1 toque | Sim | 2025 | Aceite ágil direto no smartphone |
| Seleção pelo contratante | Sim | 2025 | Ranqueamento de candidatos por score de presença e aderência |
| Check-in / Check-out com localização | Sim | 2025 | Geolocalização obrigatória integrada à checagem de horário |
| Avaliação mútua (bilateral) | Sim | 2025 | Avaliação bilateral transparente ao término do turno |
| Reputação visível | Sim | 2025 | Score de confiabilidade exibido publicamente no perfil |
| Pagamento no app | Sim | 2025 | Pagamento totalmente integrado com disparo de Pix instantâneo no checkout |
| Adiantamento / Saque rápido | Sim | 2025 | Recebimento automático pós-turno (liquidação em até 30 segundos declarada pela empresa no site; não auditada por terceiros) |
| Seguro de acidentes | Não declarado | - | Não destacado na comunicação pública do app |
| Escala e recorrência | Sim | 2026 | Gestão de múltiplos turnos e integração ERP para grandes contratantes |
| Equipe de confiança / Favoritos | Sim | 2025 | Contratantes podem priorizar profissionais com bom histórico prévio |
| Chat | Sim | 2025 | Canal direto entre contratante e equipe confirmada |
| Verificação de identidade / Biometria | Sim | 2025 | **Reconhecimento facial obrigatório** (diferencial herdado da Futebolcard) |
| Gestão de equipe para empresas | Sim | 2025 | Dashboard corporativo com métricas de equipe, presença e substituição |
| Relatórios e nota fiscal | Sim | 2025 | Painel com demonstrativos financeiros consolidados e NFs |

## 6. Tração e números públicos
* **Downloads no Google Play:** 1.000+ instalações (verificado em 01/10/2026).
* **Avaliações nas lojas:** 7 avaliações no iOS (nota 4,4/5) e 13 avaliações no Android (nota 4,2/5) em 01/10/2026.
* **Métricas operacionais declaradas pela empresa (site oficial staffbr.com em 01/10/2026; métricas de velocidade e presença declaradas pela empresa e não auditadas por terceiros):**
  - **98%** de taxa de comparecimento (declarado pela empresa no site institucional).
  - **11 minutos** de tempo médio da publicação ao primeiro aceite (declarado pela empresa no site institucional).
  - **Pix em até 30 segundos** no encerramento do turno (declarado pela empresa no site institucional).
  - **Nota média declarada no site:** 4,7/5 (nas lojas reais consolidou-se em 4,4 no iOS e 4,2 no Android).
* **Receita / GMV:** não encontrado (buscado em: demonstrações contábeis e portal institucional em 01/10/2026; números financeiros do aplicativo não divulgados isoladamente pela controladora Futebolcard Sistemas Ltda).

## 7. Aquisição e crescimento (go-to-market)
* **Alavancagem de clientes institucionais:** A principal alavanca do Staff BR foi entrar em clientes corporativos onde a Futebolcard já opera bilheteria ou controle de acesso (estádios, arenas multiuso e produtoras de eventos esportivos), fornecendo gandulas, bilheteiros e atendentes.
* **Expansão para gastronomia:** Entrada em polos turísticos e gastronômicos (Florianópolis, Recife e São Paulo) atacando a dor de no-show em finais de semana.
* **Redes Sociais:**
  - **Instagram:** `@staffbroficial` (divulgação institucional, destaques de categorias profissionais e vídeos didáticos sobre agilidade no Pix).
  - **TikTok:** Conteúdo orgânico pontual de freelancers mostrando a tela do Pix recebido logo após o término do turno ("recebi no checkout").

## 8. O que os usuários dizem
* **Elogios mais frequentes:**
  - O pagamento via Pix imediato no término do turno é o ponto mais elogiado em todas as plataformas.
  - *Citação 1 (avaliação na Google Play, 08/2026):* *"gente o app e maravilhoso confirmou o horário fez checkout recebe na hora e sem contar que e fácil de mexer super recomendo"*.
  - *Citação 2 (avaliação na App Store, 03/2025):* *"Excelente aplicativo. Super indico o aplicativo, realiza o pagamento no checkout"*.
* **Queixas mais frequentes:**
  - Falta de opções claras para gerenciar ou excluir conta (LGPD):
  - *Citação 3 (avaliação na Google Play, 08/2026):* *"Horrível quero excluir a minha conta e simplesmente não tem a opção"*.
  - *Citação 4 (avaliação na Google Play, 08/2026):* *"Gostaria de excluir minha conta e não consigo não achar essa opção no app"*.
  - Problemas pontuais de autenticação:
  - *Citação 5 (avaliação na App Store, 03/2025):* *"Fiz o cadastro ao fazer o Login informa usuário inválido ao pedir pra trocar a senha, o link não chega no e-mail"*.
* **Reclame Aqui:** Sem evidência pública de índice consolidado ou histórico de reclamações relevantes (buscado por "Staff BR" e "Futebolcard Sistemas" em https://www.reclameaqui.com.br/ em 01/10/2026; suporte concentrado nos canais próprios da Futebolcard/Staff BR).

## 9. Pontos fortes
1. **Pagamento instantâneo via Pix no checkout:** Resolve a maior dor existencial do trabalhador avulso (esperar semanas para receber ou tomar calote de contratante informal).
2. **Reconhecimento facial nativo:** Reduz a zero a troca indevida de profissional ("mandou o irmão no lugar") e garante autenticidade que contratantes corporativos valorizam.
3. **Mecanismo de substituição automática:** Caso o profissional atrase no check-in georreferenciado, a fila de contingência é ativada em minutos.
4. **Respaldado por empresa estruturada:** A Futebolcard possui capital, departamento jurídico e know-how de grandes eventos esportivos.

## 10. Pontos fracos
1. **Tração ainda baixa fora do circuito de estádios:** Apenas 1.000+ downloads no Android revelam que, apesar do produto ser maduro, a base instalada ainda é pequena no mercado de bares de rua.
2. **Dependência geográfica de 3 polos (Floripa, SP, Recife):** Não possui capilaridade nacional nem presença no Centro-Oeste / DF.
3. **Falhas em fluxos de conta (exclusão e recuperação de senha):** Conforme relatado pelos usuários, há deficiências no cumprimento de requisitos de exclusão de dados e recuperação de credenciais.

## 11. O que deu certo e o que deu errado
* **O que deu certo:** Atrelar o checkout do contratante ao disparo automático do Pix. Isso gerou um índice de satisfação muito superior aos concorrentes tradicionais (nota 4,4 no iOS contra 3,1 do StaffPRO).
* **O que deu errado:** O app tentou abraçar categorias muito dispersas (de fisioterapeutas a gandulas e cozinheiros), o que pode diluir o foco da marca e dispersar o esforço de liquidez nos primeiros meses.

## 12. Ameaça e lições para o Frila
* **Nível de ameaça no DF:** **Médio-Baixo**. Embora atualmente não opere em Brasília, o Staff BR é o concorrente tecnológico mais refinado do Grupo 3 e possui capacidade financeira para entrar no DF caso decida expandir sua rede de estádios (ex: Mané Garrincha) para bares e restaurantes locais.
* **O que copiar:**
  - **A regra de ouro do checkout:** Assim que o turno é concluído e aprovado pelo gerente, o Pix cai em segundos na conta do profissional. Essa é a funcionalidade mais amada pelos trabalhadores.
  - **Comunicação focada em pontualidade e comparecimento:** A promessa de 98% de presença com substituição automática ataca exatamente a dor de cabeça do dono de bar.
  - **Não exigir MEI logo no primeiro contato:** Aceitar CPF para reduzir o atrito do freelancer comum, gerando recibos autônomos válidos.
* **O que evitar:**
  - Abrir muitas categorias profissionais não correlatas (como saúde/fisioterapia) antes de atingir liquidez perfeita em gastronomia e eventos.
  - Deixar telas e fluxos essenciais sem conformidade (como exclusão de conta e reset de senha sem delay).
* **Onde o Frila pode ser diferente:**
  - Foco regional exclusivo e absoluto no Distrito Federal desde o primeiro dia, estabelecendo parceria íntima com os sindicatos e associações de bares (Abrasel-DF) e produtores locais.
  - Interface nativa hiper-rápida em SwiftUI, sem excessos de peso ou telas desnecessárias.

## Fontes
1. Site oficial Staff BR: https://staffbr.com/ (Acessado em 01/10/2026)
2. Arquivos de dados do site oficial: https://staffbr.com/site_v2/sections.js e https://staffbr.com/site_v2/categories.js (Acessados em 01/10/2026)
3. Apple App Store - Staff BR: https://apps.apple.com/br/app/staff-br/id6742115291 (Acessado em 01/10/2026)
4. Google Play Store - Staff BR: https://play.google.com/store/apps/details?id=br.com.futebolcard.staffbr.app (Acessado em 01/10/2026)
5. Cartão CNPJ Receita Federal do Brasil: CNPJ 01.329.666/0001-50 (FUTEBOLCARD SISTEMAS LTDA)
6. Reclame Aqui: busca institucional por "Staff BR" e "Futebolcard Sistemas" em https://www.reclameaqui.com.br/ (Acessado em 01/10/2026)

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
