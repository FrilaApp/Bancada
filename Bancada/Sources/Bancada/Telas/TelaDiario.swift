import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// A narrativa diária com foco total na leitura e seleção compacta de datas.
///
/// A folha ocupa o espaço principal da tela, com tipografia de leitura e
/// entrelinha generosa sobre a superfície de leitura. A coluna lateral de datas
/// é compacta e minimalista, complementada por um seletor visual em popover
/// para navegação rápida por qualquer data do calendário.
struct TelaDiario: View {
    @Environment(\.cores) private var cores
    let diarios: [Nota]
    let fatos: [Fato]

    @State private var selecionado: Nota.ID?
    @State private var mostrandoCalendario = false
    @State private var dataDoCalendario: Date = .now

    init(diarios: [Nota], fatos: [Fato] = []) {
        self.diarios = diarios
        self.fatos = fatos
    }

    private var atual: Nota? {
        diarios.first { $0.id == selecionado } ?? diarios.first
    }

    private var indiceAtual: Int? {
        guard let id = (selecionado ?? diarios.first?.id) else { return nil }
        return diarios.firstIndex(where: { $0.id == id })
    }

    private var temAnterior: Bool {
        guard let i = indiceAtual else { return false }
        return i + 1 < diarios.count
    }

    private var temProximo: Bool {
        guard let i = indiceAtual else { return false }
        return i > 0
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
                painelDeDatas
                    .frame(
                        minWidth: DS.Diario.larguraMinimaDaLista,
                        idealWidth: DS.Diario.larguraIdealDaLista,
                        maxWidth: 220
                    )

                painelDeLeitura
                    .frame(minWidth: DS.Diario.larguraMinimaDaFolha)
            }
            .onAppear {
                if selecionado == nil, let primeira = diarios.first {
                    selecionado = primeira.id
                }
                sincronizarDataDoCalendario()
            }
            .onChange(of: selecionado) {
                sincronizarDataDoCalendario()
            }
        }
    }

    // MARK: - Painel compacto de datas

    private var painelDeDatas: some View {
        VStack(spacing: 0) {
            BarraDePainel {
                Text("Diário")
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)

                Spacer()

                Button {
                    mostrandoCalendario.toggle()
                } label: {
                    Image(systemName: "calendar")
                        .font(DS.Icone.fonte(DS.Icone.medio))
                        .foregroundStyle(mostrandoCalendario ? cores.acento : cores.textoSutil)
                }
                .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
                .help("Selecionar data no calendário")
                .popover(isPresented: $mostrandoCalendario, arrowEdge: .bottom) {
                    popoverCalendario
                }
            }

            List(diarios, selection: $selecionado) { nota in
                LinhaDataDiario(
                    nota: nota,
                    ehSelecionado: nota.id == (selecionado ?? diarios.first?.id)
                )
                .tag(nota.id)
            }
            .listStyle(.inset)
        }
        .background(cores.cromo)
    }

    private var popoverCalendario: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
            DatePicker(
                "Data",
                selection: $dataDoCalendario,
                displayedComponents: [.date]
            )
            .datePickerStyle(.graphical)
            .labelsHidden()
            .onChange(of: dataDoCalendario) { _, novaData in
                let iso = DataISO.texto(novaData)
                if let encontrada = diarios.first(where: { $0.data == iso }) {
                    selecionado = encontrada.id
                    mostrandoCalendario = false
                }
            }

            let iso = DataISO.texto(dataDoCalendario)
            if let nota = diarios.first(where: { $0.data == iso }) {
                Button {
                    selecionado = nota.id
                    mostrandoCalendario = false
                } label: {
                    HStack {
                        Text("Abrir nota de \(Calendario.rotuloDoDia(iso, longo: false))")
                        Spacer()
                        Image(systemName: "arrow.right")
                    }
                    .font(DS.Tipografia.detalhe)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
            } else {
                Text("Nenhuma nota registrada em \(iso)")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .padding(DS.Espaco.md)
        .frame(width: 260)
    }

    // MARK: - Painel principal de leitura

    private var painelDeLeitura: some View {
        VStack(spacing: 0) {
            cabecalhoLeitura

            if let atual {
                Folha {
                    TextoDeNota(atual.corpo)
                }
            } else {
                Vazio(
                    simbolo: "doc.text",
                    titulo: "Nenhuma nota selecionada",
                    detalhe: "Escolha uma data na lista ao lado."
                )
            }
        }
        .background(cores.cromo)
    }

    private var cabecalhoLeitura: some View {
        BarraDePainel {
            if let atual, let data = atual.data {
                Text(Calendario.rotuloDoDia(data, longo: true))
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
            } else if let atual {
                Text(atual.titulo)
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
            }

            Spacer()

            if let atual {
                HStack(spacing: 2) {
                    Button {
                        navegar(delta: 1)
                    } label: {
                        Image(systemName: "chevron.left")
                    }
                    .disabled(!temAnterior)
                    .help("Dia anterior no acervo")

                    Button {
                        navegar(delta: -1)
                    } label: {
                        Image(systemName: "chevron.right")
                    }
                    .disabled(!temProximo)
                    .help("Dia seguinte no acervo")
                }
                .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))

                Button {
                    NSWorkspace.shared.activateFileViewerSelecting([atual.url])
                } label: {
                    Image(systemName: "folder")
                }
                .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
                .help("Revelar nota no Finder")
            }
        }
    }

    private func navegar(delta: Int) {
        guard let i = indiceAtual else { return }
        let novoIndice = i + delta
        if diarios.indices.contains(novoIndice) {
            selecionado = diarios[novoIndice].id
        }
    }

    private func sincronizarDataDoCalendario() {
        if let dataStr = atual?.data, let d = DataISO.data(dataStr) {
            dataDoCalendario = d
        }
    }
}

// MARK: - Linha minimalista de data

private struct LinhaDataDiario: View {
    @Environment(\.cores) private var cores
    let nota: Nota
    let ehSelecionado: Bool

    var body: some View {
        HStack(spacing: DS.Espaco.sm) {
            let info = formatar(nota.data)

            VStack(alignment: .center, spacing: 0) {
                Text(info.mes.uppercased())
                    .font(DS.Tipografia.rotulo)
                    .foregroundStyle(ehSelecionado ? cores.acento : cores.textoSutil)
                Text(info.dia)
                    .font(DS.Tipografia.secao)
                    .monospacedDigit()
                    .foregroundStyle(cores.texto)
            }
            .frame(width: 32)
            .padding(.vertical, 2)
            .background(
                cores.dado.opacity(ehSelecionado ? DS.Veu.forte : DS.Veu.sutil),
                in: RoundedRectangle(cornerRadius: DS.Raio.xs)
            )

            VStack(alignment: .leading, spacing: 1) {
                Text(info.semana)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.texto)
                    .lineLimit(1)
                if let ano = info.ano {
                    Text(String(ano))
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.vertical, 2)
        .contentShape(Rectangle())
    }

    private func formatar(_ iso: String?) -> (dia: String, mes: String, semana: String, ano: Int?) {
        guard let iso, let data = DataISO.data(iso) else {
            return (iso ?? "--", "", "", nil)
        }
        let cal = DataISO.calendario
        let comp = cal.dateComponents([.year, .month, .day, .weekday], from: data)
        let fmt = DateFormatter()
        fmt.calendar = cal
        fmt.locale = DataISO.locale(de: cal)

        fmt.dateFormat = "MMM"
        let mes = fmt.string(from: data).replacingOccurrences(of: ".", with: "").trimmingCharacters(in: .whitespaces)

        fmt.dateFormat = "EEEE"
        let semana = fmt.string(from: data).capitalized

        let dia = String(format: "%02d", comp.day ?? 0)
        let anoRef = cal.dateComponents([.year], from: .now).year
        let ano = comp.year != anoRef ? comp.year : nil
        return (dia, mes, semana, ano)
    }
}
