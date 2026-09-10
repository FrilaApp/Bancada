import SwiftUI
import VaultKit
import DesignSystem

/// A narrativa diária ao lado dos fatos que a sustentam.
///
/// Esta é a tela que só faz sentido neste vault: a regra de ouro do
/// doc-harness é que nenhuma frase do diário existe sem um fato por trás.
/// Pôr as duas colunas lado a lado torna essa regra verificável de relance —
/// no Obsidian, é preciso abrir dois arquivos e comparar de memória.
struct TelaDiario: View {
    @Environment(\.cores) private var cores
    let diarios: [Nota]
    let fatos: [Fato]

    @State private var selecionado: Nota.ID?

    private var atual: Nota? {
        diarios.first { $0.id == selecionado } ?? diarios.first
    }

    private var fatosDoDia: [Fato] {
        guard let data = atual?.data else { return [] }
        return fatos.filter { $0.data == data }.sorted { $0.minutoDoDia < $1.minutoDoDia }
    }

    var body: some View {
        if diarios.isEmpty {
            Vazio(
                simbolo: "calendar",
                titulo: "Nenhuma nota diária",
                detalhe: "Rode /diario no Claude Code ao fim do dia — a narrativa é escrita a partir dos fatos."
            )
        } else {
            HSplitView {
                List(diarios, selection: $selecionado) { nota in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(nota.data ?? nota.titulo).font(DS.Tipografia.corpo)
                        Text("\(fatos.filter { $0.data == nota.data }.count) fatos")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                    }
                    .tag(nota.id)
                }
                .frame(minWidth: DS.Diario.larguraMinimaDaLista, idealWidth: DS.Diario.larguraIdealDaLista)

                if let atual {
                    // O diário é a única coisa nesta janela escrita por gente
                    // para ser lida por gente. Voz serifada, entrelinha larga e
                    // folha própria: a densidade compacta é do chrome, não do
                    // texto. É a mesma distinção que o site faz entre serif e
                    // mono, aqui virada superfície.
                    Folha {
                        TextoDeNota(atual.corpo)
                    }
                    .frame(minWidth: DS.Diario.larguraMinimaDaFolha)
                }

                VStack(alignment: .leading, spacing: 0) {
                    BarraDePainel {
                        Text("Fatos do dia").font(DS.Tipografia.secao)
                        Spacer()
                        Text("\(fatosDoDia.count)")
                            .font(DS.Tipografia.mono)
                            .monospacedDigit()
                            .foregroundStyle(cores.textoSutil)
                    }

                    if fatosDoDia.isEmpty {
                        Vazio(
                            simbolo: "tray",
                            titulo: "Nada registrado em \(atual?.data ?? "")",
                            detalhe: "Os hooks do Git escrevem aqui a cada commit."
                        )
                    } else {
                        // O mesmo fato tinha três desenhos no app: este, o
                        // do Calendário e o de Registros. `LinhaDeFato` existia
                        // e era consumida por duas telas das quatro — peça de
                        // sistema com consumidor parcial é mais difícil de ver
                        // que peça morta, porque não parece nem morta nem
                        // ignorada.
                        List(fatosDoDia) { fato in
                            LinhaDeFato(
                                carimbo: fato.hora,
                                tipo: fato.tipo,
                                descricao: fato.descricao,
                                autor: fato.autor
                            )
                        }
                        .listStyle(.inset)
                    }
                }
                .frame(minWidth: DS.Diario.larguraMinimaDosFatos, idealWidth: DS.Diario.larguraIdealDosFatos)
                .background(cores.cromo)
            }
        }
    }
}
