import SwiftUI
import VaultKit

/// Tabela de tarefas com `Table` nativa — o que o `Quadro.base` do Obsidian
/// faz genericamente, aqui com colunas ordenáveis e filtro por status.
///
/// A seleção é do chamador (`TelaTrabalho`), não desta view: selecionar uma
/// tarefa passou a alimentar o painel de fatos logo abaixo. Por isso abrir no
/// Finder saiu do clique simples — antes, cada seleção abria uma janela do
/// Finder, o que com o painel embaixo seria insuportável — e virou duplo
/// clique e menu de contexto, como na grade do Acervo.
struct TelaTarefas: View {
    @Environment(\.cores) private var cores
    let tarefas: [Nota]
    @Binding var selecao: Nota.ID?
    let aoAbrir: (Nota) -> Void

    @State private var ordem = [KeyPathComparator(\Nota.caminhoRelativo)]
    @State private var filtro: StatusTarefa?

    private var visiveis: [Nota] {
        let base = filtro.map { f in tarefas.filter { $0.status == f } } ?? tarefas
        return base.sorted(using: ordem)
    }

    var body: some View {
        VStack(spacing: 0) {
            barraDeFiltro

            if tarefas.isEmpty {
                Vazio(
                    simbolo: "checklist",
                    titulo: "Nenhuma tarefa ainda",
                    detalhe: "Tarefas são notas com `tipo: tarefa` em 04 - Tarefas/. Crie uma com /tarefa no Claude Code."
                )
            } else {
                Table(visiveis, selection: $selecao, sortOrder: $ordem) {
                    TableColumn("ID", value: \.caminhoRelativo) { nota in
                        Text(nota.identificador ?? "—")
                            .font(DS.Tipografia.mono)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .width(min: 60, ideal: 70, max: 90)

                    TableColumn("Tarefa") { nota in
                        Text(nota.titulo).font(DS.Tipografia.corpo)
                    }
                    .width(min: 180, ideal: 320)

                    TableColumn("Status") { nota in
                        if let status = nota.status {
                            Etiqueta(texto: status.rotulo, cor: cores.status(status))
                        } else {
                            Text("—").foregroundStyle(cores.textoSutil)
                        }
                    }
                    .width(min: 100, ideal: 130, max: 160)

                    TableColumn("Responsável") { nota in
                        Text(nota.responsavel ?? "—")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(nota.responsavel == nil ? cores.textoSutil : cores.texto)
                    }
                    .width(min: 100, ideal: 140)

                    TableColumn("Desafio") { nota in
                        Text(nota.desafio ?? "—")
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .width(min: 70, ideal: 90, max: 120)

                    TableColumn("Criada em") { nota in
                        Text(nota.dataCriacao ?? "—")
                            .font(DS.Tipografia.mono)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .width(min: 90, ideal: 100, max: 120)
                }
                .contextMenu(forSelectionType: Nota.ID.self) { ids in
                    Button("Mostrar no Finder") {
                        for nota in tarefas.filter({ ids.contains($0.id) }) { aoAbrir(nota) }
                    }
                } primaryAction: { ids in
                    // Duplo clique: o gesto que já abre arquivo no Acervo.
                    for nota in tarefas.filter({ ids.contains($0.id) }) { aoAbrir(nota) }
                }
            }
        }
    }

    private var barraDeFiltro: some View {
        HStack(spacing: DS.Espaco.sm) {
            botao(rotulo: "Todas", cor: cores.textoSutil, ativo: filtro == nil) { filtro = nil }
            ForEach(StatusTarefa.allCases.sorted { $0.ordem < $1.ordem }, id: \.self) { status in
                let n = tarefas.filter { $0.status == status }.count
                botao(
                    rotulo: "\(status.rotulo) (\(n))",
                    cor: cores.status(status),
                    ativo: filtro == status
                ) {
                    filtro = (filtro == status) ? nil : status
                }
            }
            Spacer()
        }
        .padding(DS.Espaco.md)
        .background(cores.superficieSutil)
        .overlay(alignment: .bottom) {
            Rectangle().fill(cores.borda).frame(height: 1)
        }
        // Uma tarefa filtrada para fora da tabela não pode continuar mandando
        // no painel de fatos: o painel diria respeito a uma linha invisível.
        .onChange(of: filtro) { _, _ in
            if let selecao, !visiveis.contains(where: { $0.id == selecao }) {
                self.selecao = nil
            }
        }
    }

    private func botao(rotulo: String, cor: Color, ativo: Bool, acao: @escaping () -> Void) -> some View {
        Button(action: acao) {
            Text(rotulo)
                .font(DS.Tipografia.detalhe)
                .padding(.horizontal, DS.Espaco.md)
                .padding(.vertical, DS.Espaco.xs + 1)
                .background(cor.opacity(ativo ? 0.22 : 0.08), in: Capsule())
                .foregroundStyle(cor)
        }
        .buttonStyle(.plain)
    }
}
