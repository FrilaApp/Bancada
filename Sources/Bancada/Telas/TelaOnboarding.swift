import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// Guia essencial de Onboarding e Setup da Bancada.
///
/// Desenvolvido para ser visual, intuitivo e direto ao ponto:
/// - 3 abas focadas em vez de texto longo.
/// - O fluxo diário em 3 passos simples.
/// - Catálogo rápido de Slash Commands com cópia em 1 clique.
/// - O ecossistema Harness vs Bancada explicado de relance.
struct TelaOnboarding: View {
    @Environment(\.cores) private var cores
    let estado: EstadoDaBancada
    let aoEscolherPasta: () -> Void

    @State private var aba: AbaOnboarding = .fluxo
    @State private var comandoCopiado: String?

    enum AbaOnboarding: String, CaseIterable, Identifiable {
        case fluxo = "Fluxo Diário"
        case comandos = "Slash Commands"
        case ecossistema = "Harness & Bancada"

        var id: String { rawValue }

        var simbolo: String {
            switch self {
            case .fluxo: return "arrow.triangle.2.circlepath"
            case .comandos: return "terminal"
            case .ecossistema: return "square.2.layers.3d"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            topoCompacto
            Divisor()

            ScrollView {
                VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                    switch aba {
                    case .fluxo:
                        conteudoFluxo
                    case .comandos:
                        conteudoComandos
                    case .ecossistema:
                        conteudoEcossistema
                    }
                }
                .padding(DS.Espaco.lg)
                .frame(maxWidth: 820, alignment: .leading)
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
    }

    // MARK: - Topo Compacto

    private var topoCompacto: some View {
        HStack(spacing: DS.Espaco.md) {
            HStack(spacing: DS.Espaco.sm) {
                Image(systemName: "signpost.right.and.left")
                    .font(DS.Icone.fonte(DS.Icone.medio, peso: .semibold))
                    .foregroundStyle(cores.acento)

                Text("Guia de Setup")
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
            }

            Spacer()

            SeletorSegmentado(
                selecao: $aba,
                opcoes: AbaOnboarding.allCases.map {
                    .init(valor: $0, rotulo: $0.rawValue, simbolo: $0.simbolo)
                }
            )

            Spacer()

            // Indicador de status do vault
            if let raiz = estado.raiz {
                Button {
                    NSWorkspace.shared.activateFileViewerSelecting([raiz])
                } label: {
                    HStack(spacing: DS.Espaco.xs) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(DS.Icone.fonte(DS.Icone.micro))
                            .foregroundStyle(cores.status(.concluida))
                        Text(raiz.lastPathComponent)
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .padding(.horizontal, DS.Espaco.sm)
                    .padding(.vertical, DS.Espaco.xs)
                }
                .buttonStyle(BotaoDoSistema(.peca))
                .help("Mostrar pasta no Finder: \(raiz.path)")
            } else {
                Button("Conectar vault…", action: aoEscolherPasta)
                    .buttonStyle(BotaoDoSistema(.peca))
                    .controlSize(.small)
            }
        }
        .padding(.horizontal, DS.Espaco.lg)
        .padding(.vertical, DS.Espaco.sm)
        .background(cores.cromo)
    }

    // MARK: - 1. Fluxo Diário (O Ciclo em 3 Passos)

    private var conteudoFluxo: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text("O Ciclo de Trabalho")
                    .font(DS.Tipografia.titulo)
                    .foregroundStyle(cores.texto)
                Text("Três momentos no dia garantem sincronia com a equipe sem atrito:")
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
            }

            VStack(spacing: DS.Espaco.sm) {
                passoCard(
                    passo: "1",
                    momento: "Ao iniciar o dia",
                    comando: "/entrar",
                    resumo: "Puxa as notas da equipe via git pull --rebase, resume o que mudou nos últimos 2 dias e atualiza a Bancada.app automaticamente.",
                    cor: cores.acento
                )

                passoCard(
                    passo: "2",
                    momento: "Durante o dia",
                    comando: "/tarefa [Título]",
                    resumo: "Cria tarefas numeradas (T-000X) no quadro. Seus commits no Git alimentam os fatos do projeto de forma transparente.",
                    cor: cores.status(.emAndamento)
                )

                passoCard(
                    passo: "3",
                    momento: "Ao encerrar o dia",
                    comando: "/diario",
                    resumo: "Lê seus commits e registros do dia para compor a nota diária oficial. Regra: sem fato registrado, nenhum bullet entra.",
                    cor: cores.status(.concluida)
                )
            }

            // Dica de ouro
            Cartao {
                HStack(spacing: DS.Espaco.md) {
                    Image(systemName: "lightbulb.fill")
                        .font(DS.Icone.fonte(DS.Icone.medio))
                        .foregroundStyle(cores.aviso)
                    Text("Você pode rodar qualquer comando digitando diretamente no chat do **Antigravity** ou do **Claude Code**.")
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.texto)
                }
                .padding(DS.Espaco.md)
            }
        }
    }

    private func passoCard(passo: String, momento: String, comando: String, resumo: String, cor: Color) -> some View {
        Cartao {
            HStack(alignment: .top, spacing: DS.Espaco.md) {
                Text(passo)
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cor)
                    .frame(width: 28, height: 28)
                    .background(cor.opacity(DS.Veu.sutil), in: Circle())
                    .overlay(Circle().strokeBorder(cor.opacity(DS.Veu.medio), lineWidth: DS.Traco.fio))

                VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                    HStack(spacing: DS.Espaco.sm) {
                        Text(momento)
                            .font(DS.Tipografia.detalhe)
                            .textCase(.uppercase)
                            .foregroundStyle(cores.textoSutil)

                        Spacer()

                        botaoCopiar(comando)
                    }

                    Text(comando)
                        .font(DS.Tipografia.mono)
                        .fontWeight(.semibold)
                        .foregroundStyle(cores.texto)

                    Text(resumo)
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.textoSutil)
                }
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    // MARK: - 2. Slash Commands (Catálogo Rápido)

    private var conteudoComandos: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Atalhos Rápidos")
                    .font(DS.Tipografia.titulo)
                    .foregroundStyle(cores.texto)
                Text("Clique para copiar e execute direto no prompt:")
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
            }

            VStack(spacing: DS.Espaco.sm) {
                linhaComando(
                    comando: "/entrar",
                    descricao: "Começar o expediente: pull seguro, resumo de fatos e auto-atualização da Bancada."
                )

                linhaComando(
                    comando: "/diario",
                    descricao: "Compilar o dia: gera a nota diária em 02 - Atualizações Diárias a partir dos fatos."
                )

                linhaComando(
                    comando: "/tarefa [título]",
                    descricao: "Nova demanda: gera o próximo ID (ex: T-0008), vincula ao autor e ao desafio CBL."
                )

                linhaComando(
                    comando: "/iteracao",
                    descricao: "Promover marcos: sobe apenas decisões de alto impacto para o Roadmap e CBL."
                )

                linhaComando(
                    comando: "/publicar-bancada",
                    descricao: "Lançar release: roda testes e publica via CI com proteção de quarentena."
                )

                linhaComando(
                    comando: "/documento",
                    descricao: "Converter Pages: transforma arquivos .pages alterados em Markdown versionável."
                )
            }
        }
    }

    private func linhaComando(comando: String, descricao: String) -> some View {
        Cartao {
            HStack(spacing: DS.Espaco.md) {
                Text(comando)
                    .font(DS.Tipografia.mono)
                    .fontWeight(.semibold)
                    .foregroundStyle(cores.acento)
                    .frame(width: 170, alignment: .leading)

                Text(descricao)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
                    .lineLimit(2)

                Spacer()

                botaoCopiar(comando)
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    // MARK: - 3. Harness & Bancada (Conceito Visual)

    private var conteudoEcossistema: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text("O Ecossistema")
                    .font(DS.Tipografia.titulo)
                    .foregroundStyle(cores.texto)
                Text("Como as ferramentas conversam sem conflito:")
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
            }

            HStack(alignment: .top, spacing: DS.Espaco.md) {
                // doc-harness
                Cartao {
                    VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                        HStack(spacing: DS.Espaco.xs + 2) {
                            Image(systemName: "folder.badge.gearshape")
                                .font(DS.Icone.fonte(DS.Icone.medio))
                                .foregroundStyle(cores.acento)
                            Text("doc-harness")
                                .font(DS.Tipografia.secao)
                                .foregroundStyle(cores.texto)
                        }

                        Text("O Cofre (Single Source of Truth)")
                            .font(DS.Tipografia.rotulo)
                            .foregroundStyle(cores.textoSutil)

                        Divisor()

                        Text("• Markdown simples versionado no Git.\n• Aberto e editado no Obsidian.\n• Guarda registros imutáveis e notas.")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .padding(DS.Espaco.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                // Bancada
                Cartao {
                    VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                        HStack(spacing: DS.Espaco.xs + 2) {
                            Image(systemName: "hammer")
                                .font(DS.Icone.fonte(DS.Icone.medio))
                                .foregroundStyle(cores.status(.emAndamento))
                            Text("Bancada")
                                .font(DS.Tipografia.secao)
                                .foregroundStyle(cores.texto)
                        }

                        Text("A Janela (Leitor & Auditor)")
                            .font(DS.Tipografia.rotulo)
                            .foregroundStyle(cores.textoSutil)

                        Divisor()

                        Text("• Não altera arquivos nem substitui o Obsidian.\n• Agrupa tarefas, calendário e mídias.\n• Audita integridade e acusa desvios.")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .padding(DS.Espaco.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            // Duas regras inegociáveis
            Bloco("Duas Regras Inegociáveis", simbolo: "checkmark.seal", corDoSimbolo: cores.acento) {
                VStack(alignment: .leading, spacing: DS.Espaco.xs + 2) {
                    HStack(alignment: .top, spacing: DS.Espaco.xs) {
                        Text("1.")
                            .font(DS.Tipografia.corpo)
                            .fontWeight(.semibold)
                            .foregroundStyle(cores.texto)
                        Text("**Fato precede narrativa:** Os logs de commit são a verdade crua. A nota diária interpreta os fatos, nunca os contradiz.")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.textoSutil)
                    }

                    HStack(alignment: .top, spacing: DS.Espaco.xs) {
                        Text("2.")
                            .font(DS.Tipografia.corpo)
                            .fontWeight(.semibold)
                            .foregroundStyle(cores.texto)
                        Text("**Autonomia de notas:** Se houver conflito no rebase, pare e alinhe. A narrativa de cada colega pertence a ele.")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.textoSutil)
                    }
                }
            }
        }
    }

    // MARK: - Botão de Copiar

    private func botaoCopiar(_ texto: String) -> some View {
        let comandoLimpo = texto.components(separatedBy: " ").first ?? texto
        let copiou = comandoCopiado == comandoLimpo

        return Button {
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(comandoLimpo, forType: .string)
            comandoCopiado = comandoLimpo

            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                if comandoCopiado == comandoLimpo {
                    comandoCopiado = nil
                }
            }
        } label: {
            HStack(spacing: DS.Espaco.xs) {
                Image(systemName: copiou ? "checkmark" : "doc.on.doc")
                    .font(DS.Icone.fonte(DS.Icone.micro))
                Text(copiou ? "Copiado!" : "Copiar")
                    .font(DS.Tipografia.detalhe)
            }
            .foregroundStyle(copiou ? cores.status(.concluida) : cores.textoSutil)
            .padding(.horizontal, DS.Espaco.sm)
            .padding(.vertical, 3)
        }
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
    }
}
