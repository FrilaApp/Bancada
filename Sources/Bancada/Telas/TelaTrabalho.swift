import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// Tarefas e registros na mesma tela, ligados pelo ID.
///
/// Antes eram duas seções que contavam a mesma história por ângulos
/// diferentes: para saber o que aconteceu numa tarefa era preciso abrir
/// Registros e varrer a árvore procurando `T-0004` a olho. O log já cita o ID
/// da tarefa — essa ligação existia no dado e não existia na interface.
///
/// Em cima, a tabela de tarefas como sempre foi. Embaixo, os fatos: os da
/// tarefa selecionada, ou a árvore inteira quando não há seleção. **A árvore
/// completa continua a um clique** (basta limpar a seleção), e o painel diz
/// quantos fatos não citam tarefa nenhuma — um recorte que se passasse por log
/// inteiro seria pior que não ter recorte.
struct TelaTrabalho: View {
    @Environment(\.cores) private var cores
    let estado: EstadoDaBancada

    @State private var tarefaSelecionada: Nota.ID?

    private var tarefa: Nota? {
        guard let tarefaSelecionada else { return nil }
        return estado.tarefas.first { $0.id == tarefaSelecionada }
    }

    var body: some View {
        VSplitView {
            TelaTarefas(tarefas: estado.tarefas, selecao: $tarefaSelecionada) { nota in
                NSWorkspace.shared.activateFileViewerSelecting([nota.url])
            }
            .frame(minHeight: DS.Trabalho.alturaMinimaDaTabela)

            painelDeFatos
                .frame(minHeight: DS.Trabalho.alturaMinimaDoPainel)
        }
    }

    @ViewBuilder
    private var painelDeFatos: some View {
        VStack(spacing: 0) {
            cabecalho

            if let tarefa, let id = tarefa.identificador {
                fatosDa(tarefa: tarefa, id: id)
            } else {
                TelaRegistros(
                    arvore: estado.arvoreDeRegistros,
                    naoReconhecidas: estado.vault?.fatosNaoReconhecidos ?? [],
                    midias: estado.vault?.midias ?? []
                )
            }
        }
    }

    private var cabecalho: some View {
        BarraDePainel {
            if let tarefa, let id = tarefa.identificador {
                Text(id).font(DS.Tipografia.mono).foregroundStyle(cores.acento)
                Text(tarefa.titulo)
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
                    .lineLimit(1)
                if let status = tarefa.status {
                    Etiqueta(texto: status.rotulo, cor: cores.status(status))
                }
                Spacer()
                Button("Ver todos os fatos") { tarefaSelecionada = nil }
                    .buttonStyle(.link)
                    .font(DS.Tipografia.detalhe)
            } else {
                Text("Todos os fatos").font(DS.Tipografia.secao).foregroundStyle(cores.texto)
                Spacer()
                Text("selecione uma tarefa para ver só os fatos dela")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            }
        }
    }

    @ViewBuilder
    private func fatosDa(tarefa: Nota, id: String) -> some View {
        let fatos = estado.fatosDaTarefa(id)

        if fatos.isEmpty {
            Vazio(
                simbolo: "link.badge.plus",
                titulo: "Nenhum fato cita \(id)",
                detalhe: "O vínculo é literal: cite o ID na mensagem de commit — `… conclui a \(id)` — e o fato aparece aqui. \(estado.fatosSemTarefa) fato(s) do log não citam tarefa nenhuma."
            )
        } else {
            List {
                Section {
                    ForEach(fatos) { fato in
                        LinhaDeFato(
                            carimbo: "\(fato.data) \(fato.hora)",
                            tipo: fato.tipo,
                            descricao: fato.descricao,
                            autor: fato.autor
                        )
                    }
                } footer: {
                    // O total do log fica visível para que a lista filtrada
                    // nunca seja confundida com o registro inteiro.
                    Text("\(fatos.count) de \(estado.vault?.fatos.count ?? 0) fatos do log · \(estado.fatosSemTarefa) sem tarefa citada")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }
            .listStyle(.inset)
        }
    }
}
