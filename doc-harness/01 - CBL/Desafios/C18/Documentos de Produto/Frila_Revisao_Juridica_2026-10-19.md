# Frila — Revisão jurídica dos textos públicos (19/10/2026)

**Textos revisados:** Política de Privacidade (atualizada em 17/10/2026), Termos de Uso e Página de Suporte, na versão de `iOS/Docs/PaginaPublica/` do `frila-frontend` (`main`, 19/10/2026), e a `VALIDACAO.md` que os acompanha.
**Cartão:** `6HMU7AAS` (revisão jurídica dos textos legais). **Tarefa de origem:** Sprint 0, fundação.

## 1. Quem revisou e com que alcance

- **Revisor responsável:** Cauê Carneiro Kilanovic, líder do projeto e responsável pelo Frila (pessoa física), **por delegação** registrada em 19/10/2026.
- **Quem executou o estudo:** Nick Fury, o Maestro do projeto (agente de IA), a pedido e em nome do Cauê, que autorizou por escrito aprovar com base em estudo e dados.
- **O que isto NÃO é:** não é parecer de advogado inscrito na OAB nem substitui um. É revisão técnica e jurídica de nível de estudo, feita sobre o texto das leis, as resoluções da ANPD e as diretrizes da Apple. Fica a recomendação de uma revisão por advogado (ou pelos mentores) **antes de qualquer lançamento público na loja com cobrança**, e antes de o Frila ter escala que tire o enquadramento de pequeno porte.
- **Escopo:** coerência entre os textos, o que o app faz de fato (conferido no código do `main`) e as normas abaixo. Não é auditoria de segurança, nem do contrato com cada fornecedor.

## 2. Método

1. Releitura integral dos três textos e da `VALIDACAO.md` (matriz de 17 fatos, matriz LGPD, mapeamento Apple 1.2 e 5.1).
2. Conferência dos fatos que os textos prometem contra o código do `frila-frontend` (`main`): exportar dados, excluir conta, atalhos 190/180, tela de conta suspensa, versão dos termos aceita no cadastro. Os quatro existem.
3. Cotejo com a base legal: LGPD (Lei 13.709/2018, arts. 6º, 7º, 8º, 9º, 10, 14, 15, 18, 19, 20, 33, 41, 46 e 48); Res. CD/ANPD nº 15/2024 (incidentes: 3 dias úteis); Res. CD/ANPD nº 19/2024 (transferência internacional e cláusulas-padrão, prazo de adaptação encerrado em 23/08/2025); Res. CD/ANPD nº 2/2022 (agentes de pequeno porte); Lei 15.211/2025 (ECA Digital); CF art. 7º, XXXIII; CLT; ECA; Decreto 6.481/2008; CDC; Marco Civil; Diretrizes 1.2 e 5.1 da App Store.
4. Conferência complementar em fonte aberta em 19/10/2026: o pequeno porte da Res. 2/2022 inclui pessoa natural que trata dados, e o art. 11 trata do encarregado, com a alternativa de manter um canal de comunicação com o titular; o prazo das cláusulas-padrão da Res. 19/2024 venceu em 23/08/2025. Foram fontes secundárias (escritórios e comentários). **Conferência pendente:** ler o texto oficial no site da ANPD antes da revisão por advogado.

## 3. Conclusão

**APROVADO COM RESSALVAS para o piloto e o TestFlight (usuários convidados, até o fim do desafio, 13/11/2026).** Nenhum achado bloqueia o TestFlight externo. Três ressalvas médias precisam de resposta antes do lançamento público (seção 4). Os textos não precisam ser republicados agora: republicar muda a `versaoTermos` (`2026-10-15`) e obriga a novo aceite e a novo deploy. As ressalvas viram registro e cartão de acompanhamento e entram juntas na próxima versão dos textos.

## 4. Achados, por gravidade

| # | Gravidade | Texto | Achado | Providência |
|---|---|---|---|---|
| 1 | Médio | Privacidade, seção 10 | Diz "mantemos um Plano de Resposta a Incidentes documentado", mas o registro das operações, o canal do titular e o plano de incidentes ainda estão abertos no cartão `5xR1JQkW` (0 de 4). A promessa pública precisa de lastro. | Concluir o plano (um documento curto: quem decide, prazo de 3 dias úteis, modelo de aviso à ANPD e aos titulares) **antes do TestFlight externo (23/10)**; senão, trocar a frase por texto mais modesto. |
| 2 | Médio | Privacidade, seção 8 | Direitos do art. 18 listados sem a **oposição** (§ 2º) e sem a **revisão de decisões automatizadas** (art. 20). O motor de despacho e a suspensão por faltas (Termos, seção 7) são decisões tomadas por regra automática. | Incluir as duas linhas na próxima versão e estender a tela de contestação (hoje de moderação) às suspensões por faltas. |
| 3 | Médio (prova pendente) | Privacidade, seção 5 | A transferência internacional se apoia em contrato com cláusulas-padrão (art. 33, II; Res. 19/2024). A frase só é verdadeira com o DPA de cada operador (Supabase, Google) aceito e arquivado. | Guardar a prova (data e versão do DPA aceito) no registro das operações do cartão `5xR1JQkW`. |
| 4 | Médio | Termos, seção 14 | Foro único em Brasília com "renúncia a qualquer outro". Em relação de consumo, a cláusula de foro em contrato de adesão pode ser tida por abusiva (CDC arts. 51 e 101, I). | Acrescentar "sem prejuízo do foro do domicílio do consumidor, quando a lei assim determinar", na próxima versão. |
| 5 | Médio | Termos, seção 2 | A cláusula "sem vínculo empregatício" é correta e necessária, mas a realidade prevalece sobre o texto. Risco cresce com habitualidade, escolha automática e sanção por falta. | Manter o desenho do produto (sem subordinação, valor definido pela vaga, escolha do contratante). Reavaliar com advogado trabalhista antes de qualquer cobrança de taxa (v1.1). |
| 6 | Médio (escala) | Termos, seção 1 | O responsável é pessoa física, com responsabilidade pessoal e ilimitada. Aceitável no piloto de estudantes; não deve seguir assim em operação aberta e com cobrança. | Decidir a forma jurídica (MEI/PJ) antes de lançar para o público. Já anotado como dívida de escala. |
| 7 | Baixo | Privacidade, seção 2 | Base do dado de nascimento (art. 7º, II) é defensável, mas pode somar o art. 7º, IX (verificação de maioridade e proteção). | Citar as duas bases na próxima versão. |
| 8 | Baixo | Privacidade, seção 2 | "Consentimento específico" para a localização é a permissão do iOS, que é controle de acesso, e não o consentimento do art. 8º. Hoje a base citada (art. 7º, V) é suficiente. | Reescrever sem usar a palavra "consentimento" para a permissão do aparelho. |
| 9 | Baixo | Privacidade, eventos de uso | O legítimo interesse (art. 7º, IX) exige teste de proporcionalidade registrado (art. 10). | Registrar o teste (uma página) no cartão `5xR1JQkW`. |
| 10 | Baixo | Termos, seção 5 vs Privacidade | Termos dizem que o aparelho "verifica localmente a proximidade"; a política diz que a distância em metros vai ao servidor. | Alinhar o texto dos Termos ("o aparelho calcula a distância e envia só o valor"). |
| 11 | Baixo | Termos, seção 11 | A limitação de responsabilidade total pode ser tida por abusiva se houver relação de consumo (CDC art. 51, I). A frase "na máxima extensão permitida" já reduz o risco. | Manter; revisar junto com o foro (achado 4). |
| 12 | Baixo | Termos, seção 13 | "Continuar usando é concordar" não basta para mudança relevante de finalidade ou de tratamento (LGPD art. 8º, § 6º). O app já guarda a versão aceita. | Em mudança relevante, exigir novo aceite pela `versaoTermos`. |
| 13 | Baixo | Privacidade, retenção | Guarda de registros de acesso: o art. 15 do Marco Civil vale para provedor pessoa jurídica; para pessoa física o prazo legal não se aplica. | Manter os prazos escolhidos e dizer que são decisão do projeto. |
| 14 | Informativo | Encarregado | Na escala do piloto, o Frila se enquadra como agente de pequeno porte (Res. 2/2022). O art. 11 permite não indicar encarregado se houver canal de comunicação com o titular; o canal existe (`suportefrila@gmail.com`, triagem em 5 dias úteis, resposta em 15 dias). | Manter o canal. Indicar encarregado quando a escala sair do pequeno porte ou se a ANPD exigir. |

**Conferido e sem achado:** idade mínima de 18 anos e a fundamentação (CF art. 7º, XXXIII; CLT; ECA; Decreto 6.481/2008; ECA Digital); autenticação por código (sem senha); dados de contato só após a confirmação do turno e guarda de 7 dias; exclusão de conta pelo app, com anonimização de turnos e avaliações; exportação de dados (existe no app); atalhos 190 e 180 na folha de suporte do turno; denúncia, bloqueio mútuo e contestação (Diretriz 1.2); sem rastreadores na página de suporte; contato oficial único.

## 5. Acompanhamento

- Achados 1, 3 e 9: cartão `5xR1JQkW` (Júlia e Cauê). Gatilho: antes do TestFlight externo (23/10).
- Achados 2, 4, 7, 8, 10 e 12: **uma única** nova versão dos textos (nova `versaoTermos`, novo aceite, novo deploy no Netlify). Gatilho: antes do lançamento público, ou junto com a próxima mudança que já exija novo aceite.
- Achados 5, 6 e 14: decisão de escala e de forma jurídica, com advogado. Gatilho: antes de qualquer cobrança.
- Conferência no texto oficial das Res. 2/2022 e 19/2024: antes da revisão por advogado.

## 6. Registro

| Data | Quem | O que |
|---|---|---|
| 19/10/2026 | Cauê Carneiro Kilanovic (por delegação) · estudo e redação: Nick Fury | Revisão jurídica dos três textos públicos, aprovada com ressalvas para o piloto e o TestFlight. |

← [[01 - CBL/00 - Índice CBL|Índice CBL]]
