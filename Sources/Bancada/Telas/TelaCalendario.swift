import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// O calendário do vault: grade que sanfona entre a tira de sete dias e o mês
/// inteiro, mais uma visão de lista, com busca e filtro por espécie e autor.
///
/// A grade não é um seletor de data — ninguém digita uma data aqui. É um mapa
/// de atividade: cada dia mostra o que aconteceu nele, e o dia sem nada fica
/// visivelmente sem nada. Um vault com buraco de três dias precisa parecer um
/// vault com buraco de três dias.
///
/// **Somente leitura, por construção.** Não há criar, arrastar nem apagar
/// evento: um "evento" aqui é um fato do log, escrito só por
/// `scripts/registrar-fato.sh`, ou uma nota que o Obsidian edita. Arrastar um
/// commit para outro dia seria reescrever o registro — que é exatamente o que
/// o vault existe para impedir. Ver `TipoNota.somenteLeitura`.
///
/// Três decisões que o resto da tela sustenta:
///
/// - **A semana selecionada nunca sai de vista ao comprimir** (`Calendario.janelaDeSemanas`).
/// - **O resumo aparece ao lado da célula, nunca sobre ela.**
/// - **Filtro vazio é ausência de filtro**, nunca resultado vazio.
struct TelaCalendario: View {
    @Environment(\.cores) private var cores
    let dias: [DiaDoCalendario]

    enum Modo: Hashable { case mes, semana, lista }

    @State private var modo: Modo = .mes
    @State private var ancora: String = DataISO.texto(.now)
    @State private var semanasVisiveis: Int = DS.Calendario.semanasMaximas
    @State private var filtro = FiltroDeEventos()
    @State private var previewDoDia: String?
    @State private var esperaDoPreview: Task<Void, Never>?
    @State private var arrastoAcumulado: CGFloat = 0

    // MARK: - Dado derivado

    private var todosOsEventos: [EventoDeCalendario] { dias.flatMap(\.eventos) }

    private var diasFiltrados: [DiaDoCalendario] { filtro.aplicar(a: dias) }

    private var porData: [String: DiaDoCalendario] {
        Dictionary(uniqueKeysWithValues: diasFiltrados.map { ($0.data, $0) })
    }

    private var semanas: [[String]] {
        Calendario.janelaDeSemanas(de: ancora, semanas: modo == .semana ? 1 : semanasVisiveis)
    }

    private var totalDeSemanasDoMes: Int {
        max(Calendario.semanasDoMes(de: ancora).count, DS.Calendario.semanasMinimas)
    }

    private var diaEmFoco: DiaDoCalendario? { porData[ancora] }
    private var hoje: String { DataISO.texto(.now) }

    private var opcoesDeEspecie: [OpcaoDeFiltro] {
        EventoDeCalendario.Especie.allCases.map { especie in
            OpcaoDeFiltro(
                id: especie.rawValue,
                rotulo: especie.rotulo,
                contagem: todosOsEventos.filter { $0.especie == especie }.count
            )
        }
    }

    private var opcoesDeAutor: [OpcaoDeFiltro] {
        Calendario.autores(de: todosOsEventos).map { autor in
            OpcaoDeFiltro(
                id: autor,
                rotulo: autor,
                contagem: todosOsEventos.filter { $0.autor == autor }.count
            )
        }
    }

    // MARK: - Corpo

    var body: some View {
        VStack(spacing: 0) {
            barraDeNavegacao
            barraDeFiltro
            if filtro.ativo { chipsDeFiltroAtivo }

            switch modo {
            case .mes, .semana:
                cabecalhoDasColunas
                grade
                if modo == .mes { puxador }
                Divisor()
                painelDoDia
            case .lista:
                Divisor()
                visaoDeLista
            }
        }
        .focusable()
        .onKeyPress(.leftArrow) { andar(-1) }
        .onKeyPress(.rightArrow) { andar(1) }
        .onKeyPress(.upArrow) { andar(-7) }
        .onKeyPress(.downArrow) { andar(7) }
        .onKeyPress(.escape) {
            if previewDoDia != nil { fecharPreview(); return .handled }
            if filtro.ativo { withAnimation(DS.Movimento.rapido) { filtro.limpar() }; return .handled }
            return .ignored
        }
        .onDisappear { esperaDoPreview?.cancel() }
    }

    // MARK: - Navegação

    private var barraDeNavegacao: some View {
        BarraDePainel {
            if modo != .lista {
                Button { irParaMes(-1) } label: { Image(systemName: "chevron.left") }
                    .buttonStyle(.plain)
                    .help("Mês anterior")
                    .accessibilityLabel("Mês anterior")

                Text(Calendario.rotuloDoMes(de: ancora))
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)

                Button { irParaMes(1) } label: { Image(systemName: "chevron.right") }
                    .buttonStyle(.plain)
                    .help("Próximo mês")
                    .accessibilityLabel("Próximo mês")

                Button("Hoje") { irPara(hoje) }
                    .buttonStyle(.plain)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.acento)
                    .help("Voltar para \(hoje)")
            } else {
                Text("Todos os dias")
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
                Text("\(diasFiltrados.count) dia(s) com registro")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            }

            Spacer()

            SeletorSegmentado(selecao: Binding(
                get: { modo },
                set: { trocarModo(para: $0) }
            ), opcoes: [
                .init(valor: Modo.mes, rotulo: "Mês", simbolo: "calendar"),
                .init(valor: Modo.semana, rotulo: "Semana", simbolo: "calendar.day.timeline.left"),
                .init(valor: Modo.lista, rotulo: "Lista", simbolo: "list.bullet")
            ])
        }
    }

    private var barraDeFiltro: some View {
        HStack(spacing: DS.Espaco.sm) {
            CampoDeBusca(texto: $filtro.busca, dica: "Buscar por descrição ou autor…")
                .frame(maxWidth: DS.Acervo.larguraIdealDoPainel)

            MenuDeFiltro(
                titulo: "Espécie",
                opcoes: opcoesDeEspecie,
                marcadas: Binding(
                    get: { Set(filtro.especies.map(\.rawValue)) },
                    set: { filtro.especies = Set($0.compactMap(EventoDeCalendario.Especie.init)) }
                )
            )

            MenuDeFiltro(
                titulo: "Autor",
                simbolo: "person",
                opcoes: opcoesDeAutor,
                marcadas: $filtro.autores
            )

            Spacer()

            // O tamanho do recorte fica dito em número: sem isso, um filtro
            // que zera tudo parece um vault vazio.
            Text(contagemDoRecorte)
                .font(DS.Tipografia.detalhe)
                .foregroundStyle(cores.textoSutil)
                .monospacedDigit()
        }
        .padding(.horizontal, DS.Espaco.md)
        .padding(.vertical, DS.Espaco.sm)
        .background(cores.cromo)
        .overlay(alignment: .bottom) { Divisor() }
    }

    private var contagemDoRecorte: String {
        let total = todosOsEventos.count
        let visiveis = diasFiltrados.reduce(0) { $0 + $1.eventos.count }
        return filtro.ativo ? "\(visiveis) de \(total) eventos" : "\(total) eventos"
    }

    private var chipsDeFiltroAtivo: some View {
        HStack(spacing: DS.Espaco.sm) {
            Text("Filtrando por")
                .font(DS.Tipografia.rotulo)
                .foregroundStyle(cores.textoSutil)

            if !filtro.busca.trimmingCharacters(in: .whitespaces).isEmpty {
                ChipRemovivel(texto: "“\(filtro.busca)”", cor: cores.acento) {
                    withAnimation(DS.Movimento.rapido) { filtro.busca = "" }
                }
            }
            ForEach(Array(filtro.especies), id: \.self) { especie in
                ChipRemovivel(texto: especie.rotulo, cor: cores.acento) {
                    withAnimation(DS.Movimento.rapido) { _ = filtro.especies.remove(especie) }
                }
            }
            ForEach(Array(filtro.autores).sorted(), id: \.self) { autor in
                ChipRemovivel(texto: autor, cor: cores.acento) {
                    withAnimation(DS.Movimento.rapido) { _ = filtro.autores.remove(autor) }
                }
            }

            Button("Limpar") {
                withAnimation(DS.Movimento.rapido) { filtro.limpar() }
            }
            .buttonStyle(.plain)
            .font(DS.Tipografia.detalhe)
            .foregroundStyle(cores.textoSutil)

            Spacer()
        }
        .padding(.horizontal, DS.Espaco.md)
        .padding(.vertical, DS.Espaco.sm)
        .background(cores.cromo)
        .overlay(alignment: .bottom) { Divisor() }
    }

    private var cabecalhoDasColunas: some View {
        HStack(spacing: DS.Traco.fio) {
            ForEach(Array(Calendario.rotulosDasColunas().enumerated()), id: \.offset) { _, rotulo in
                Text(rotulo)
                    .font(DS.Tipografia.rotulo)
                    .foregroundStyle(cores.textoSutil)
                    .frame(maxWidth: .infinity)
            }
        }
        .frame(height: DS.Calendario.alturaDoCabecalho)
        .padding(.horizontal, DS.Espaco.md)
        .background(cores.cromo)
    }

    // MARK: - Grade

    /// A grade ocupa exatamente as linhas que tem: sem altura declarada, a tira
    /// de uma semana esticaria para preencher a janela e viraria sete caixotes
    /// vazios — o oposto de comprimir. O espaço que sobra é do detalhe do dia.
    private var alturaDaGrade: CGFloat {
        let linhas = CGFloat(max(semanas.count, 1))
        let altura = modo == .semana
            ? DS.Calendario.alturaMinimaDaCelula * 1.5
            : DS.Calendario.alturaMinimaDaCelula
        return linhas * altura + (linhas - 1) * DS.Traco.fio
    }

    private var grade: some View {
        VStack(spacing: DS.Traco.fio) {
            ForEach(Array(semanas.enumerated()), id: \.offset) { _, semana in
                HStack(spacing: DS.Traco.fio) {
                    ForEach(semana, id: \.self) { data in
                        celula(data)
                    }
                }
            }
        }
        .frame(height: alturaDaGrade)
        .padding(.horizontal, DS.Espaco.md)
        .padding(.vertical, DS.Espaco.sm)
        .background(cores.fundo)
        .animation(DS.Movimento.padrao, value: semanasVisiveis)
        .animation(DS.Movimento.padrao, value: semanas.count)
        .animation(DS.Movimento.padrao, value: modo)
    }

    /// Quantos chips cabem na célula antes do "+N".
    private var chipsPorCelula: Int { modo == .semana ? 4 : 2 }

    private func celula(_ data: String) -> some View {
        let dia = porData[data]
        let eventos = dia?.eventos ?? []
        let doMes = Calendario.mesmoMes(data, ancora)
        let selecionado = data == ancora
        let ehHoje = data == hoje

        return Button {
            irPara(data)
        } label: {
            VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                HStack(spacing: DS.Espaco.xs) {
                    Text(numeroDoDia(data))
                        .font(DS.Tipografia.corpo)
                        .monospacedDigit()
                        .foregroundStyle(ehHoje ? cores.acento : (doMes ? cores.texto : cores.textoSutil))
                        .fontWeight(ehHoje ? .bold : .regular)

                    if ehHoje {
                        Circle().fill(cores.acento)
                            .frame(width: DS.Espaco.xs, height: DS.Espaco.xs)
                    }
                    Spacer(minLength: 0)

                    if !eventos.isEmpty {
                        Text("\(eventos.count)")
                            .font(DS.Tipografia.monoDetalhe)
                            .monospacedDigit()
                            .foregroundStyle(cores.textoSutil)
                    }
                }

                // Os eventos do dia, não só a contagem deles: é o que separa um
                // mapa de calor de um calendário.
                ForEach(eventos.prefix(chipsPorCelula)) { evento in
                    ChipDeEvento(evento: evento, apagado: !doMes)
                }
                if eventos.count > chipsPorCelula {
                    Text("+\(eventos.count - chipsPorCelula)")
                        .font(DS.Tipografia.monoDetalhe)
                        .foregroundStyle(cores.textoSutil)
                }

                Spacer(minLength: 0)
            }
            .padding(DS.Espaco.xs + 1)
            .frame(
                minWidth: DS.Calendario.larguraMinimaDaCelula / 2,
                maxWidth: .infinity,
                maxHeight: .infinity,
                alignment: .topLeading
            )
            .background(fundoDaCelula(quantidade: eventos.count, doMes: doMes))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Raio.sm)
                    .strokeBorder(
                        selecionado ? cores.acento : cores.borda,
                        lineWidth: selecionado ? DS.Traco.selecao : DS.Traco.fio
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: DS.Raio.sm))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .onHover { $0 ? agendarPreview(para: data) : cancelarPreview(de: data) }
        .popover(
            isPresented: Binding(
                get: { previewDoDia == data },
                set: { if !$0 { previewDoDia = nil } }
            ),
            attachmentAnchor: .rect(.bounds),
            arrowEdge: .trailing
        ) {
            PreviaDoDia(data: data, dia: dia, ehHoje: ehHoje, filtrado: filtro.ativo)
        }
        .accessibilityLabel(rotuloAcessivel(data: data, quantidade: eventos.count, ehHoje: ehHoje))
        .accessibilityAddTraits(selecionado ? [.isButton, .isSelected] : .isButton)
    }

    /// Véu por densidade, atrás dos chips: a intensidade diz quanto aconteceu
    /// sem obrigar a contar.
    private func fundoDaCelula(quantidade: Int, doMes: Bool) -> Color {
        guard quantidade > 0 else { return doMes ? cores.superficie : cores.fundo }
        let veu: Double
        switch quantidade {
        case 1...3:  veu = DS.Veu.sutil
        case 4...12: veu = DS.Veu.medio
        default:     veu = DS.Veu.forte
        }
        return cores.acento.opacity(doMes ? veu : veu / 2)
    }

    private func numeroDoDia(_ iso: String) -> String {
        let partes = iso.split(separator: "-")
        guard partes.count == 3 else { return iso }
        return String(Int(partes[2]) ?? 0)
    }

    private func rotuloAcessivel(data: String, quantidade: Int, ehHoje: Bool) -> String {
        var partes = [data]
        if ehHoje { partes.append("hoje") }
        partes.append(quantidade == 0 ? "sem registro" : "\(quantidade) evento(s)")
        return partes.joined(separator: ", ")
    }

    // MARK: - Puxador

    private var puxador: some View {
        let comprimido = semanasVisiveis <= DS.Calendario.semanasMinimas

        return ZStack {
            Capsule().fill(cores.borda)
                .frame(width: DS.Espaco.xl, height: DS.Traco.selecao)
            Image(systemName: comprimido ? "chevron.down" : "chevron.up")
                .font(.system(size: 7, weight: .semibold))
                .foregroundStyle(cores.textoSutil)
                .offset(x: DS.Espaco.xl)
        }
        .frame(maxWidth: .infinity)
        .frame(height: DS.Calendario.alturaDoPuxador)
        .background(cores.cromo)
        .contentShape(Rectangle())
        .onHover { $0 ? NSCursor.resizeUpDown.push() : NSCursor.pop() }
        .gesture(
            DragGesture()
                .onChanged { gesto in
                    arrastoAcumulado = gesto.translation.height
                    let passos = Int((arrastoAcumulado / DS.Calendario.alturaMinimaDaCelula).rounded())
                    comprimir(para: semanasVisiveis + passos, mantendoArrasto: true)
                }
                .onEnded { _ in arrastoAcumulado = 0 }
        )
        .onTapGesture {
            comprimir(para: comprimido ? totalDeSemanasDoMes : DS.Calendario.semanasMinimas)
        }
        .help(comprimido ? "Arraste para estender até o mês" : "Arraste para comprimir até a semana")
        .accessibilityLabel(comprimido ? "Estender para o mês" : "Comprimir para a semana")
    }

    // MARK: - Detalhe do dia

    private var painelDoDia: some View {
        VStack(spacing: 0) {
            BarraDePainel {
                Text(ancora)
                    .font(DS.Tipografia.secao)
                    .monospacedDigit()
                    .foregroundStyle(cores.texto)

                if ancora == hoje { Etiqueta(texto: "hoje", cor: cores.acento) }

                ForEach(EventoDeCalendario.Especie.allCases, id: \.self) { especie in
                    let n = diaEmFoco?.quantidade(de: especie) ?? 0
                    if n > 0 {
                        Label("\(n)", systemImage: especie.simbolo)
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                            .help(especie.rotulo)
                    }
                }

                Spacer()

                if let n = diaEmFoco?.eventos.count {
                    Text("\(n) evento(s)")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                        .monospacedDigit()
                }
            }

            if let dia = diaEmFoco, !dia.eventos.isEmpty {
                List(dia.eventos) { evento in
                    LinhaDeEvento(evento: evento)
                }
                .listStyle(.inset)
            } else {
                Vazio(
                    simbolo: filtro.ativo ? "line.3.horizontal.decrease.circle" : "tray",
                    titulo: filtro.ativo
                        ? "Nada em \(ancora) casa com o filtro"
                        : "Nada registrado em \(ancora)",
                    detalhe: filtro.ativo
                        ? "O dia pode ter eventos fora do recorte atual."
                        : "Nem fato, nem narrativa diária, nem tarefa criada."
                )
            }
        }
    }

    // MARK: - Lista

    private var visaoDeLista: some View {
        Group {
            if diasFiltrados.isEmpty {
                Vazio(
                    simbolo: filtro.ativo ? "line.3.horizontal.decrease.circle" : "calendar",
                    titulo: filtro.ativo ? "Nenhum evento casa com o filtro" : "Nenhum dia com evento",
                    detalhe: filtro.ativo
                        ? "Limpe o filtro para ver o vault inteiro."
                        : "O calendário reúne os fatos do log, as notas diárias e a criação de tarefas."
                )
            } else {
                List {
                    ForEach(diasFiltrados) { dia in
                        Section {
                            ForEach(dia.eventos) { evento in
                                LinhaDeEvento(evento: evento)
                            }
                        } header: {
                            HStack(spacing: DS.Espaco.sm) {
                                Text(dia.data)
                                    .font(DS.Tipografia.secao)
                                    .monospacedDigit()
                                if dia.data == hoje { Etiqueta(texto: "hoje", cor: cores.acento) }
                                Spacer()
                                Text("\(dia.eventos.count)")
                                    .font(DS.Tipografia.monoDetalhe)
                                    .monospacedDigit()
                                    .foregroundStyle(cores.textoSutil)
                            }
                        }
                    }
                }
                .listStyle(.inset)
            }
        }
    }

    // MARK: - Ações

    private func irPara(_ data: String) {
        fecharPreview()
        withAnimation(DS.Movimento.rapido) { ancora = data }
    }

    private func irParaMes(_ passo: Int) {
        // Em modo semana, as setas andam semana a semana: pular um mês inteiro
        // numa tira de sete dias perderia o lugar de quem está lendo.
        irPara(modo == .semana
            ? Calendario.dia(deslocando: ancora, em: passo * 7)
            : Calendario.mes(deslocando: ancora, em: passo))
    }

    private func andar(_ passo: Int) -> KeyPress.Result {
        irPara(Calendario.dia(deslocando: ancora, em: passo))
        return .handled
    }

    private func trocarModo(para novo: Modo) {
        fecharPreview()
        withAnimation(DS.Movimento.padrao) {
            modo = novo
            if novo == .mes { semanasVisiveis = totalDeSemanasDoMes }
        }
    }

    private func comprimir(para alvo: Int, mantendoArrasto: Bool = false) {
        let limitado = max(DS.Calendario.semanasMinimas, min(alvo, totalDeSemanasDoMes))
        guard limitado != semanasVisiveis else { return }
        if !mantendoArrasto { arrastoAcumulado = 0 }
        fecharPreview()
        withAnimation(DS.Movimento.padrao) { semanasVisiveis = limitado }
    }

    // MARK: - Prévia com espera

    private func agendarPreview(para data: String) {
        esperaDoPreview?.cancel()
        esperaDoPreview = Task { @MainActor in
            try? await Task.sleep(for: .seconds(DS.Calendario.esperaDoPreview))
            guard !Task.isCancelled else { return }
            previewDoDia = data
        }
    }

    private func cancelarPreview(de data: String) {
        esperaDoPreview?.cancel()
        if previewDoDia == data { previewDoDia = nil }
    }

    private func fecharPreview() {
        esperaDoPreview?.cancel()
        previewDoDia = nil
    }
}

// MARK: - Componentes da tela

/// Um evento dentro da célula da grade.
///
/// A cor vem do tipo do fato — a mesma escala que a árvore de registros usa —,
/// então `commit` é a mesma cor nas duas telas. Diário e tarefa não são fato e
/// falam na voz neutra.
private struct ChipDeEvento: View {
    @Environment(\.cores) private var cores
    let evento: EventoDeCalendario
    var apagado = false

    private var cor: Color {
        switch evento.especie {
        case .fato: return cores.tipoDeFato(evento.detalhe)
        case .diario: return cores.textoSutil
        case .tarefaCriada: return cores.textoSutil
        }
    }

    var body: some View {
        HStack(spacing: DS.Espaco.xs) {
            Circle()
                .fill(cor)
                .frame(width: 5, height: 5)
            Text(evento.rotulo)
                .font(DS.Tipografia.monoDetalhe)
                .foregroundStyle(cores.texto)
                .lineLimit(1)
                .truncationMode(.tail)
        }
        .padding(.horizontal, DS.Espaco.xs)
        .padding(.vertical, 1)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cor.opacity(DS.Veu.sutil), in: RoundedRectangle(cornerRadius: 3))
        .opacity(apagado ? 0.55 : 1)
        .help(evento.rotulo)
    }
}

/// Uma linha de evento no painel do dia e na lista: quando, o quê, por quem.
private struct LinhaDeEvento: View {
    let evento: EventoDeCalendario

    var body: some View {
        LinhaDeFato(
            carimbo: evento.hora ?? "—",
            tipo: evento.especie == .fato ? evento.detalhe : evento.especie.rawValue,
            descricao: evento.rotulo,
            autor: evento.autor
        )
        .contentShape(Rectangle())
        .onTapGesture(count: 2) {
            if let origem = evento.origem { NSWorkspace.shared.open(origem) }
        }
        .help(evento.origem == nil
              ? "Fato do log — escrito pelos hooks, sem arquivo próprio para abrir"
              : "Clique duas vezes para abrir o arquivo")
    }
}

/// O resumo que aparece depois da espera de 600 ms.
///
/// Elabora o que a célula já mostra em vez de repetir: a célula lista os
/// primeiros eventos, e aqui se lê a composição do dia e quem trabalhou nele.
private struct PreviaDoDia: View {
    @Environment(\.cores) private var cores
    let data: String
    let dia: DiaDoCalendario?
    let ehHoje: Bool
    var filtrado = false

    private var porAutor: [(String, Int)] {
        let autores = (dia?.eventos ?? []).compactMap(\.autor)
        return Dictionary(grouping: autores, by: { $0 })
            .map { ($0.key, $0.value.count) }
            .sorted { $0.1 > $1.1 }
    }

    private var intervalo: String? {
        let horas = (dia?.eventos ?? []).compactMap(\.hora).sorted()
        guard let primeira = horas.first, let ultima = horas.last else { return nil }
        return primeira == ultima ? primeira : "\(primeira)–\(ultima)"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
            HStack(spacing: DS.Espaco.sm) {
                Text(data).font(DS.Tipografia.secao).monospacedDigit()
                if ehHoje { Etiqueta(texto: "hoje", cor: cores.acento) }
                Spacer()
            }

            if let dia, !dia.eventos.isEmpty {
                if let intervalo {
                    Label(intervalo, systemImage: "clock")
                        .font(DS.Tipografia.monoDetalhe)
                        .foregroundStyle(cores.textoSutil)
                }

                Divisor()

                ForEach(EventoDeCalendario.Especie.allCases, id: \.self) { especie in
                    let n = dia.quantidade(de: especie)
                    if n > 0 {
                        LinhaDeValor(especie.rotulo, valor: "\(n)") {
                            Image(systemName: especie.simbolo)
                                .font(.system(size: 9))
                                .foregroundStyle(cores.textoSutil)
                        }
                    }
                }

                if !porAutor.isEmpty {
                    Divisor()
                    ForEach(porAutor.prefix(3), id: \.0) { autor, n in
                        LinhaDeValor(autor, valor: "\(n)")
                    }
                    if porAutor.count > 3 {
                        Text("e mais \(porAutor.count - 3)")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                    }
                }

                Divisor()
                Text(filtrado ? "Recorte do filtro · clique para abrir o dia" : "Clique para abrir o dia")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            } else {
                Text(filtrado ? "Nada aqui casa com o filtro." : "Nada registrado.")
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
            }
        }
        .padding(DS.Espaco.md)
        .frame(width: DS.Calendario.larguraDoPreview)
    }
}
