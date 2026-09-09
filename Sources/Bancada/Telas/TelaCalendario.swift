import SwiftUI
import AppKit
import VaultKit

/// O calendário do vault — **andaime**.
///
/// A grade de mês ainda não existe: esta tela lista os dias que têm evento, com
/// a contagem por espécie, para provar que o modelo (`VaultKit/Calendario`) já
/// entrega o dado que a grade vai desenhar. É deliberadamente uma lista e não
/// uma grade meia-boca — uma grade pela metade pareceria pronta e esconderia o
/// que falta.
///
/// O que já está de pé para a grade:
///
/// - `Calendario.porDia(de:)` agrega fato, diário e tarefa criada num
///   `DiaDoCalendario` por data, do mais recente para o mais antigo.
/// - `DataISO` converte `2026-09-09` ⇄ `Date` ancorando ao meio-dia, para que
///   fuso e horário de verão nunca joguem um evento para a véspera.
/// - `DS.Calendario` guarda as medidas da célula — nada de medida fixa dentro
///   da view.
///
/// O que falta: a grade mensal em si, a navegação entre meses e a seleção de
/// dia. `EventoDeCalendario.origem` já carrega a URL do arquivo, então abrir a
/// nota a partir da célula é ligar o gesto.
struct TelaCalendario: View {
    @Environment(\.cores) private var cores
    let dias: [DiaDoCalendario]

    @State private var diaSelecionado: DiaDoCalendario.ID?

    private var atual: DiaDoCalendario? {
        dias.first { $0.id == diaSelecionado } ?? dias.first
    }

    var body: some View {
        if dias.isEmpty {
            Vazio(
                simbolo: "calendar",
                titulo: "Nenhum dia com evento",
                detalhe: "O calendário reúne os fatos do log, as notas diárias e a criação de tarefas. Um vault novo não tem nenhum dos três."
            )
        } else {
            HSplitView {
                List(dias, selection: $diaSelecionado) { dia in
                    VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                        Text(dia.data)
                            .font(DS.Tipografia.corpo)
                            .monospacedDigit()
                        HStack(spacing: DS.Espaco.sm) {
                            ForEach(EventoDeCalendario.Especie.allCases, id: \.self) { especie in
                                let n = dia.quantidade(de: especie)
                                if n > 0 {
                                    Label("\(n)", systemImage: especie.simbolo)
                                        .font(DS.Tipografia.detalhe)
                                        .foregroundStyle(cores.textoSutil)
                                        .help(especie.rotulo)
                                }
                            }
                        }
                    }
                    .tag(dia.id)
                }
                .frame(minWidth: 180, idealWidth: 220)

                if let atual {
                    listaDoDia(atual)
                        .frame(minWidth: DS.Acervo.larguraMinimaDoPainel)
                }
            }
        }
    }

    private func listaDoDia(_ dia: DiaDoCalendario) -> some View {
        VStack(spacing: 0) {
            HStack {
                Text(dia.data).font(DS.Tipografia.secao).monospacedDigit()
                Spacer()
                Text("\(dia.eventos.count) evento(s)")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            }
            .padding(DS.Espaco.md)
            .background(cores.superficieSutil)
            .overlay(alignment: .bottom) {
                Rectangle().fill(cores.borda).frame(height: 1)
            }

            List(dia.eventos) { evento in
                HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.md) {
                    Text(evento.hora ?? "—")
                        .font(DS.Tipografia.mono)
                        .foregroundStyle(cores.textoSutil)
                        .monospacedDigit()
                        .frame(width: 44, alignment: .leading)

                    Image(systemName: evento.especie.simbolo)
                        .font(.system(size: 9))
                        .foregroundStyle(cores.acento)
                        .help(evento.especie.rotulo)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(evento.rotulo)
                            .font(DS.Tipografia.corpo)
                            .foregroundStyle(cores.texto)
                            .lineLimit(2)
                        if !evento.detalhe.isEmpty {
                            Text(evento.detalhe)
                                .font(DS.Tipografia.detalhe)
                                .foregroundStyle(cores.textoSutil)
                                .lineLimit(1)
                        }
                    }
                    Spacer(minLength: DS.Espaco.md)
                }
                .contentShape(Rectangle())
                .onTapGesture(count: 2) {
                    if let origem = evento.origem { NSWorkspace.shared.open(origem) }
                }
            }
            .listStyle(.inset)
        }
    }
}
