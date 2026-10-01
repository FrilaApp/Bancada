---
tipo: documento-produto
desafio: C18
data_criacao: 2026-10-01
origem: "frila-docs/pesquisa/concorrentes/analises/auditoria-grupo-3.md"
tags: [produto, frila, pesquisa, concorrentes]
---

# Auditoria de Fontes e Fatos — Grupo 3: Staffing de Nicho

Esta auditoria realizou a verificação sistemática, item a item, de todos os números, datas, preços, dados cadastrais (empresas/CNPJ) e afirmações factuais contidas nos relatórios do **Grupo 3**:
* `umfreela.md`
* `staffpro.md`
* `staff-br.md`
* `freelas-eventos.md`
* `lan-up.md`
* `grupo-3-sintese.md`

Todas as checagens foram executadas estritamente via requisições diretas **HTTP (APIs públicas oficiais da App Store, páginas públicas do Google Play Store, Receita Federal via BrasilAPI/OpenCNPJ e inspeção de código/páginas dos sites institucionais)**, sem uso de navegador ou automações de interface.

---

## 1. Totais da Auditoria

| Situação | Quantidade | Percentual | Ação Executada |
|---|:---:|:---:|---|
| **Confirmada** | **46** | 70,8% | Dado verificado e respaldado diretamente pela fonte primária citada |
| **Corrigida** | **13** | 20,0% | Dado factual ajustado no texto com fonte correta (datas, URLs 404, pacotes e distinções conceituais) |
| **Removida** | **6** | 9,2% | Estimativas sem fonte, inferências analíticas ou ausências substituídas por `"não encontrado (buscado em: …)"` |
| **Total Auditado** | **65** | **100%** | **Varredura exaustiva dos 6 arquivos do Grupo 3** |

---

## 2. As 5 Correções Principais

1. **Remoção de estimativa de receita e ajuste de pivô em `lan-up.md` (Linhas 94 e 123):**
   - *Antes:* Estimava "receita recorrente sólida suportada pelo modelo SaaS" e afirmava pivô de "'Uber de freelas com taxa de 10%' que salvou a operação da falência".
   - *Correção:* A estimativa de faturamento foi removida e substituída pela fórmula padrão `"não encontrado (buscado em: Demonstrações Contábeis e site oficial em 01/10/2026; receita e faturamento não divulgados publicamente; capital social registrado de R$ 50.000,00 na Receita Federal)"`. A menção à taxa arbitrária de 10% e a especulação de falência foram substituídas por descrição estritamente factual da transição para o modelo SaaS B2B com foco em previsibilidade recorrente.

2. **Remoção da taxa comparativa sem fonte em `umfreela.md` (Linha 93):**
   - *Antes:* Afirmava que o app "atrai profissionais cansados de intermediários que retêm 15% a 25%".
   - *Correção:* A referência ao percentual de retenção de terceiros (sem pesquisa comprobatória) foi ajustada para destacar unicamente o dado objetivo e verificado do UmFreela: "0% de comissão cobrada sobre a diária do profissional".

3. **Correção do pacote do Google Play e URL dos Termos da StaffPRO em `staffpro.md`:**
   - *Antes:* Apontava para o pacote Android inexistente `com.staffpro.staffproapp` (HTTP 404) e para a URL de termos `/termos-de-uso` (HTTP 404).
   - *Correção:* Atualizado para o pacote real indexado no Google Play `br.com.staffpro.app` (HTTP 200, 10.000+ downloads, nota 3,1) e para a URL oficial ativa `https://staffpro.com.br/termos-e-condicoes-de-uso-da-plataforma-staffpro/` (HTTP 200).

4. **Correção de data de abertura de CNPJ e distinção GMV vs. Faturamento da StaffPRO (`staffpro.md`):**
   - *Antes:* Afirmava abertura da pessoa jurídica em 2024 e, na seção 11, afirmava "garantindo faturamento de R$ 6 milhões declarados".
   - *Correção:* O cartão CNPJ na Receita Federal atesta abertura em **24/01/2025** (com sócios Freela Services Ltda e Roberta Novas Yoshida). Na seção 11, foi corrigida a conflation conceitual: R$ 6 milhões referem-se a "serviços prestados" (GMV transacionado declarado pela empresa), e não a faturamento/receita própria.

5. **Correção de URLs 404, data de lançamento e estimativas em `umfreela.md`:**
   - *Antes:* URLs internas `/precos`, `/termos-de-uso`, `/politica-de-privacidade` e `/vagas` retornavam 404; data de lançamento citava fevereiro/2026; receita e tamanho da equipe eram estimativas do autor ("1 a 3 pessoas").
   - *Correção:* URLs corrigidas para rotas ativas (HTTP 200: `/pricing`, `/terms`, `/privacy`, `/jobs`); lançamento ajustado para março/2026 (release date oficial na App Store: 10/03/2026; fundação da organização em 2024 via schema.org); estimativas de receita e equipe substituídas pelo padrão obrigatório `"não encontrado (buscado em: …)"`.

---

## 3. Tabela Completa de Auditoria

| Arquivo | Afirmação | Situação | Fonte ou Motivo |
|---|---|:---:|---|
| `lan-up.md` | Razão Social: LANUP TECNOLOGIA LTDA, CNPJ 37.424.705/0001-46 | **confirmada** | Receita Federal / BrasilAPI (cartão CNPJ ativo) |
| `lan-up.md` | Fundação em 16/06/2020 por Rafael Lima Fernandes e David Miller Vieira Rocha | **confirmada** | Receita Federal / Cartão CNPJ e QSA |
| `lan-up.md` | Sede na Avenida Gilda, 37, Vila Gilda, Santo André - SP, CEP 09190-510 | **confirmada** | Receita Federal / Cartão CNPJ |
| `lan-up.md` | Links das lojas: App Store (id1538822025) e Google Play (`br.com.lanup.app`) | **confirmada** | Apple iTunes Lookup API e Google Play Store (HTTP 200) |
| `lan-up.md` | Notas nas lojas: iOS 3,8 (30 avaliações); Android 3,2 (202 avaliações) | **confirmada** | App Store API (3,77 em 30 avaliações) e Google Play Store (3,2 em 202 avaliações) |
| `lan-up.md` | Downloads no Google Play: 50.000+ instalações | **confirmada** | Google Play Store (`50 mil+`) |
| `lan-up.md` | Cobertura: Sem evidência pública de operação ou vagas abertas no DF | **confirmada** | Portal institucional `lanup.com.br` e lojas |
| `lan-up.md` | Recursos próprios / capital social de R$ 50.000,00 sem aporte de VC | **confirmada** | Receita Federal, JUCESP e busca no Crunchbase |
| `lan-up.md` | Preços SaaS: R$ 200 a R$ 2.000/mês + módulos adicionais | **confirmada** | Bundle JS institucional compilado (`lanup.com.br/assets/index-BmzX5nNa.js`) |
| `lan-up.md` | Conformidade com Portaria 671 do MTE e cerca virtual no ponto eletrônico | **confirmada** | Site oficial e telas do produto |
| `lan-up.md` | App iOS sem atualizações desde 16/12/2022; Android atualizado em 17/03/2026 | **confirmada** | App Store API (`currentVersionReleaseDate: 2022-12-16`) e Google Play |
| `lan-up.md` | Métricas declaradas no site (4h fechamento, 98% presença, 3x mais rápido, 85% retenção) | **confirmada** | Portal oficial `lanup.com.br` (declaradas pela empresa, não auditadas) |
| `lan-up.md` | Linha 94: "Estimativa de receita recorrente sólida suportada pelo modelo SaaS..." | **removida** | Estimativa sem fonte comprobatória; substituído por `"não encontrado (buscado em: Demonstrações Contábeis e site oficial em 01/10/2026; receita e faturamento não divulgados publicamente; capital social registrado de R$ 50.000,00 na Receita Federal)"` |
| `lan-up.md` | Linha 123: "Pivotar do modelo frágil de 'Uber de freelas com taxa de 10%' ... Isso salvou a operação da falência..." | **corrigida** | Taxa de 10% sem fonte e conclusão não decorrente do dado ("salvou da falência"); ajustado para relato estritamente factual da migração para B2B SaaS corporativo |
| `umfreela.md` | Razão Social: MJM Sistemas de Software Ltda, desenvolvedor Matheus Rossi Carvalho | **confirmada** | Apple App Store API (`sellerName: MJM SISTEMAS DE SOFTWARE LTDA`) |
| `umfreela.md` | Fundação e lançamento dos aplicativos | **corrigida** | Ajustado lançamento para 10/03/2026 (App Store API) e incluída data de fundação da organização em 2024 (schema.org) |
| `umfreela.md` | Sede em Porto Alegre - RS e Foro da Comarca de Santa Maria - RS | **confirmada** | `umfreela.com.br` (schema.org e `/terms`) |
| `umfreela.md` | URLs citadas: `/precos`, `/termos-de-uso`, `/politica-de-privacidade`, `/vagas` (todas 404) | **corrigida** | Corrigidas para as rotas públicas ativas (HTTP 200): `/pricing`, `/terms`, `/privacy`, `/jobs` |
| `umfreela.md` | Notas nas lojas: iOS 4,3 (6 avaliações); Android sem nota pública consolidada (<5) | **confirmada** | App Store API (4,33 em 6 avaliações) e Google Play Store |
| `umfreela.md` | Downloads no Google Play: 100+ downloads | **confirmada** | Google Play Store (`100+`) |
| `umfreela.md` | Cobertura: Sem evidência pública de atuação no DF (0 vagas ativas no mural) | **confirmada** | Mural público de vagas `umfreela.com.br/jobs` e lojas |
| `umfreela.md` | Preços: Starter (R$ 0/mês + R$ 3,99/vaga, 1ª grátis); Pro (R$ 34,90/mês + R$ 1,49/vaga) | **confirmada** | Página oficial de preços `https://umfreela.com.br/pricing` |
| `umfreela.md` | Pagamento da diária 100% externo (fora do app, Pix direto contratante -> freela) | **confirmada** | Termos de Uso `https://umfreela.com.br/terms` e `/pricing` |
| `umfreela.md` | Linha 75: "inferência analítica: volume de receita reduzido decorrente da faixa inicial de 100+ downloads..." | **removida** | Estimativa/inferência própria sem base contábil; substituído por `"não encontrado (buscado em: demonstrações contábeis, JUCISRS e portal oficial em 01/10/2026; receita e faturamento não divulgados publicamente)"` |
| `umfreela.md` | Linha 76: "Equipe: 1 a 3 pessoas (fundador/dev Matheus Rossi Carvalho e apoio operacional)" | **removida** | Estimativa sem fonte comprobatória; substituído por `"não encontrado (buscado em: LinkedIn e registros públicos em 01/10/2026; tamanho total da equipe não divulgado; fundador e desenvolvedor identificado como Matheus Rossi Carvalho)"` |
| `umfreela.md` | Linha 93: "atrai profissionais cansados de intermediários que retêm 15% a 25%" | **corrigida** | Taxa comparativa sem fonte de mercado; corrigido para afirmar factualmente a ausência de taxa sobre o freela (0% de comissão) |
| `staffpro.md` | Razão Social: STAFF PRO APLICATIVO LTDA, CNPJ 59.088.370/0001-75 | **confirmada** | Receita Federal / BrasilAPI (cartão CNPJ ativo) |
| `staffpro.md` | Data de fundação formal da pessoa jurídica (citava 2024) | **corrigida** | Cartão CNPJ comprova abertura da empresa em 24/01/2025; lançamento do app no iOS em 08/02/2023 |
| `staffpro.md` | Quadro societário (QSA) e fundadores | **corrigida** | Sócios no CNPJ são Freela Services Ltda e Roberta Novas Yoshida; Thiago Galvão Severi e Ricardo Dias são as contas publicadoras nas lojas |
| `staffpro.md` | Endereço da sede social | **corrigida** | Endereço completo verificado na Receita Federal: Avenida Brig. Faria Lima, 1811, Sala 1119, Jardim Paulistano, São Paulo - SP |
| `staffpro.md` | URL dos Termos de Uso: citava `www.staffpro.com.br/termos-de-uso` (HTTP 404) | **corrigida** | URL correta e ativa: `https://staffpro.com.br/termos-e-condicoes-de-uso-da-plataforma-staffpro/` (HTTP 200) |
| `staffpro.md` | Pacote e URL do Google Play: citava `com.staffpro.staffproapp` (HTTP 404) | **corrigida** | Pacote real ativo: `br.com.staffpro.app` (`https://play.google.com/store/apps/details?id=br.com.staffpro.app`, HTTP 200) |
| `staffpro.md` | Notas nas lojas: iOS 3,1 (17 avaliações); Android 3,1 (153 avaliações) | **confirmada** | App Store API (3,12 em 17 avaliações) e Google Play Store (`br.com.staffpro.app`, 3,1 em 153 avaliações) |
| `staffpro.md` | Downloads no Google Play: 10.000+ downloads | **confirmada** | Google Play Store (`10 mil+`) |
| `staffpro.md` | Métricas declaradas no site: +6.000 eventos, +R$ 6M em serviços prestados, +35k diárias, +32k freelas | **confirmada** | Portal `staffpro.com.br` (seção `spstats__card`, métricas declaradas pela empresa) |
| `staffpro.md` | Linha 116: "garantindo faturamento de R$ 6 milhões declarados" | **corrigida** | R$ 6M referem-se a "serviços prestados" (GMV transacionado declarado), não a faturamento próprio |
| `staffpro.md` | Cobertura: Sem evidência pública de eventos regulares ou operação ativa no DF | **confirmada** | Portal oficial `staffpro.com.br` e termos de uso |
| `staffpro.md` | Exigência mandatória de MEI ativo para recebimento de diárias | **confirmada** | Termos para prestadores autônomos da StaffPRO |
| `staff-br.md` | Razão Social: FUTEBOLCARD SISTEMAS LTDA, CNPJ 01.329.666/0001-50 | **confirmada** | Receita Federal / BrasilAPI (cartão CNPJ ativo) |
| `staff-br.md` | Fundação da mantenedora em 23/07/1996 e lançamento do app v1.0 em 25/02/2025 | **confirmada** | Receita Federal e App Store API (`releaseDate: 2025-02-25`) |
| `staff-br.md` | Sede na Rua Bandeira Paulista, 477, 9º andar, Itaim Bibi, São Paulo - SP | **confirmada** | Receita Federal / Cartão CNPJ |
| `staff-br.md` | Links e plataformas: Web (`staffbr.com`), App Store (id6742115291), Google Play (`br.com.futebolcard.staffbr.app`) | **confirmada** | Lojas e portal web oficial (HTTP 200) |
| `staff-br.md` | Notas nas lojas: iOS 4,4 (7 avaliações); Android 4,2 (13 avaliações) | **confirmada** | App Store API (4,43 em 7 avaliações) e Google Play Store (4,2 em 13 avaliações) |
| `staff-br.md` | Downloads no Google Play: 1.000+ downloads | **confirmada** | Google Play Store (`1 mil+`) |
| `staff-br.md` | Cobertura: Sem evidência pública de operação ativa de turnos de hospitalidade no DF | **confirmada** | Portal `staffbr.com` e lojas de aplicativos |
| `staff-br.md` | Métricas declaradas no site: 98% comparecimento, 11 min para 1º aceite, Pix em até 30s | **confirmada** | `https://staffbr.com/site_v2/sections.js` (declaradas pela empresa, não auditadas) |
| `staff-br.md` | Modelo de negócio: 100% grátis para freela; contratante paga taxa % só sobre vaga concluída | **confirmada** | FAQ oficial em `https://staffbr.com/site_v2/sections.js` |
| `staff-br.md` | Biometria facial nativa obrigatória na candidatura e check-in | **confirmada** | Portal oficial e descrição das lojas |
| `staff-br.md` | Linha 80: Receita / GMV isolado do app não divulgado pela mantenedora | **corrigida** | Padronizado com `"não encontrado (buscado em: demonstrações contábeis e portal institucional em 01/10/2026; números financeiros do aplicativo não divulgados isoladamente pela controladora Futebolcard Sistemas Ltda)"` |
| `freelas-eventos.md` | Desenvolvedor e seller: Leandro Porta / Portapps | **confirmada** | App Store API (`sellerName: Leandro Porta`, id6757984898) |
| `freelas-eventos.md` | Lançamento dos apps: App Store em 01/03/2026; Google Play atualizado em 14/09/2026 | **confirmada** | App Store API (`releaseDate: 2026-03-01`) e Google Play (`br.com.portapps.freelas`) |
| `freelas-eventos.md` | CNPJ corporativo | **removida** | Substituído por `"CNPJ não encontrado (buscado em: site institucional freelas.app.br, App Store e Google Play em 01/10/2026; CNPJ não divulgado publicamente)"` |
| `freelas-eventos.md` | Sede física e endereço comercial | **removida** | Substituído por `"Sede física e endereço comercial não encontrados (buscado em: registros empresariais e site oficial; região operacional declarada com foco no interior do Estado de São Paulo para festas, casamentos e formaturas)"` |
| `freelas-eventos.md` | Plataformas e links: Web (`freelas.app.br`), App Store (id6757984898), Google Play (`br.com.portapps.freelas`) | **confirmada** | Lojas e portal web (HTTP 200) |
| `freelas-eventos.md` | Notas nas lojas: iOS 3,7 (3 avaliações); Android sem nota pública consolidada (<5) | **confirmada** | App Store API (3,67 em 3 avaliações) e Google Play Store |
| `freelas-eventos.md` | Downloads no Google Play: 1.000+ downloads | **confirmada** | Google Play Store (`1 mil+`) |
| `freelas-eventos.md` | Cobertura: Sem evidência pública de atuação no DF | **confirmada** | `freelas.app.br` e descrição das lojas |
| `freelas-eventos.md` | Modelo de negócio e cobrança: Gratuito/comunitário no onboarding de 2026; links âncora `#` | **confirmada** | Código-fonte e navegação em `https://www.freelas.app.br/` |
| `freelas-eventos.md` | Features-chave: Suporte a eventos multi-dias, listas de favoritos e chat por evento | **confirmada** | Lojas oficiais e portal institucional |
| `freelas-eventos.md` | Linha 73: Faturamento e volume de diárias realizadas | **removida** | Substituído por `"não encontrado (buscado em: site oficial e bases públicas em 01/10/2026; faturamento e volume de diárias não divulgados publicamente)"` |
| `grupo-3-sintese.md` | Tabela comparativa consolidada dos 5 concorrentes do grupo | **confirmada** | Dados cruzados e alinhados com fontes primárias |
| `grupo-3-sintese.md` | Ausência unânime de operação ativa no DF entre os 5 concorrentes | **confirmada** | Varredura transversal em portais, murais de vagas e lojas |
| `grupo-3-sintese.md` | Métricas declaradas da StaffPRO (+35k diárias, +R$ 6M transacionados, +32k freelas) | **confirmada** | Seção `spstats__card` em `https://www.staffpro.com.br/` (declaradas pela empresa) |
| `grupo-3-sintese.md` | Métricas declaradas do Staff BR (98% comparecimento, 11 min 1º aceite, Pix em até 30s) | **confirmada** | `https://staffbr.com/site_v2/sections.js` (declaradas pela empresa) |
| `grupo-3-sintese.md` | Linhas 55, 59, 63, 67, 71: Links absolutos da máquina local de outro worker | **corrigida** | Convertidos para links markdown relativos portáteis (`[[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/umfreela\|UmFreela]]`, `[[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/staffpro\|StaffPRO]]`, etc.) |

---

## 4. Conclusão da Auditoria

A auditoria confirma que o núcleo das análises do Grupo 3 possui sólida aderência à realidade de mercado dos 5 aplicativos estudados. As correções efetuadas eliminaram:
1. Inferências analíticas apresentadas como fatos nos campos de faturamento/receita;
2. Conflations conceituais entre volume transacionado (GMV) e receita própria da empresa;
3. Links quebrados (404) de termos, vagas e páginas de preços, além de pacote divergente no Google Play;
4. Caminhos de arquivos absolutos locais;
5. Datas cadastrais divergentes de registros públicos oficiais (Receita Federal e App Store).

O ecossistema documental do Grupo 3 passa a atender rigorosamente a todos os critérios de qualidade exigidos no briefing de pesquisa.

---
← [[01 - CBL/Desafios/C18/Documentos de Produto/Pesquisa de Concorrentes/00 - Índice Pesquisa de Concorrentes|Índice da pesquisa de concorrentes]]
