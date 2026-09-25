import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// O calendário do vault: grade que sanfona entre a tira de sete dias e o mês
/// inteiro, mais uma visão de lista, com busca e filtro por tipo e pessoa.
///
/// O que a tela desenha já vem traduzido (`LeituraDeFato`, `ResumoDoDia`): o
/// nome da tarefa em vez do commit, "Fabrício" em vez de `fbtostadev`,
/// "quarta-feira, 9 de setembro" em vez de `2026-09-09`. A linha crua do log
/// continua existindo — no fim do painel do dia, recolhida, para quem audita.
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
/// - **A célula acompanha a janela sem deformar** (`GeometriaDaGrade`).
/// - **O resumo aparece ao lado da célula, nunca sobre ela.**
/// - **Filtro vazio é ausência de filtro**, nunca resultado vazio.
///
/// O painel do dia fica à direita da grade, e não embaixo. Embaixo, ele e a
/// grade disputavam a altura — era por isso que existia um puxador para
/// comprimir o mês até uma semana. Ao lado, cada um tem a sua dimensão: a
/// grade fica com a altura inteira, e comprimir virou o modo Semana.
struct TelaCalendario: View {
    @Environment(\.cores) private var cores
    let dias: [DiaDoCalendario]

    enum Modo: Hashable { case mes, semana, lista }

    /// Com que modo a tela abre.
    ///
    /// Era sempre Mês, e para este vault isso dava 33 de 35 células vazias
    /// ocupando a altura inteira da janela — no claro, com borda em cada
    /// célula, o efeito era o de uma planilha em branco. A grade não tinha
    /// defeito; o padrão de abertura é que não olhava para o dado.
    ///
    /// Um padrão fixo em Lista erraria igual na direção oposta assim que a
    /// equipe acumulasse três meses de commits. Então quem decide é a
    /// densidade: abaixo de uma semana de dias marcados, Lista mostra tudo sem
    /// sobra; daí para cima a grade passa a valer a altura que ocupa. Só o
    /// primeiro desenho usa isto — trocar de modo continua sendo da pessoa.
    static func modoInicial(para dias: [DiaDoCalendario]) -> Modo {
        Calendario.diasComEvento(dias) >= DS.Calendario.diasMinimosParaGrade
            ? .mes
            : .lista
    }

    init(dias: [DiaDoCalendario]) {
        self.dias = dias
        _modo = State(initialValue: Self.modoInicial(para: dias))
    }

    @State private var modo: Modo
    @State private var ancora: String = DataISO.texto(.now)
    @State private var filtro = FiltroDeEventos()
    @State private var previewDoDia: String?
    @State private var esperaDoPreview: Task<Void, Never>?

    /// O que a pessoa pediu para o painel do dia. Fica salvo: quem prefere a
    /// grade inteira não precisa fechar o painel a cada abertura do app.
    @AppStorage("calendario.painelDoDia") private var painelPedido = true
    /// Se o painel cabe na largura atual. Ver `GeometriaDaGrade.larguraDoPainel`.
    @State private var painelCabe = true

    private var painelAberto: Bool { painelPedido && painelCabe }

    // MARK: - Dado derivado

    private var todosOsEventos: [EventoDeCalendario] { dias.flatMap(\.eventos) }

    private var diasFiltrados: [DiaDoCalendario] { filtro.aplicar(a: dias) }

    private var porData: [String: DiaDoCalendario] {
        Dictionary(uniqueKeysWithValues: diasFiltrados.map { ($0.data, $0) })
    }

    private var semanas: [[String]] {
        modo == .semana
            ? Calendario.janelaDeSemanas(de: ancora, semanas: 1)
            : Calendario.semanasDoMes(de: ancora)
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
                GeometryReader { area in
                    let painel = GeometriaDaGrade.larguraDoPainel(para: area.size.width)
                    HStack(spacing: 0) {
                        // Acima do painel: a prévia de uma célula da última
                        // coluna sai da grade para a direita, sobre ele.
                        colunaDaGrade(sobraADireita: painelAberto ? (painel ?? 0) : 0)
                            .zIndex(1)
                        if painelAberto, let painel {
                            Divisor(.vertical)
                            painelDoDia
                                .frame(width: painel)
                                .transition(.move(edge: .trailing).combined(with: .opacity))
                        }
                    }
                    .onAppear { painelCabe = painel != nil }
                    .onChange(of: painel != nil) { _, cabe in
                        withAnimation(DS.Movimento.padrao) { painelCabe = cabe }
                    }
                }
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
                    .buttonStyle(BotaoDoSistema(.glifo))
                    .help("Mês anterior")
                    .accessibilityLabel("Mês anterior")

                Text(Calendario.rotuloDoMes(de: ancora))
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)

                Button { irParaMes(1) } label: { Image(systemName: "chevron.right") }
                    .buttonStyle(BotaoDoSistema(.glifo))
                    .help("Próximo mês")
                    .accessibilityLabel("Próximo mês")

                Button("Hoje") { irPara(hoje) }
                    .buttonStyle(BotaoDoSistema(.peca))
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.acento)
                    .help("Voltar para \(Calendario.rotuloDoDia(hoje))")
            } else {
                Text("Todos os dias")
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
                Text("\(Plural.contar(diasFiltrados.count, "dia", "dias")) com registro")
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

            // Na Lista não há painel: o dia já está por extenso na própria linha.
            if modo != .lista { botaoDoPainel }
        }
    }

    /// Mostra e esconde o painel do dia — o mesmo glifo e o mesmo atalho do
    /// inspetor no Finder e no Xcode (⌥⌘I, ⌥⌘0), para ninguém ter de aprender.
    private var botaoDoPainel: some View {
        Button {
            withAnimation(DS.Movimento.padrao) { painelPedido.toggle() }
        } label: {
            Image(systemName: "sidebar.right")
        }
        .buttonStyle(BotaoDoSistema(.glifo))
        .foregroundStyle(painelAberto ? cores.acento : cores.textoSutil)
        .disabled(!painelCabe)
        .keyboardShortcut("i", modifiers: [.command, .option])
        .help(painelCabe
              ? (painelPedido ? "Ocultar o painel do dia (⌥⌘I)" : "Mostrar o painel do dia (⌥⌘I)")
              : "Alargue a janela para ver o painel do dia ao lado da grade")
        .accessibilityLabel(painelPedido ? "Ocultar o painel do dia" : "Mostrar o painel do dia")
    }

    private var barraDeFiltro: some View {
        HStack(spacing: DS.Espaco.sm) {
            CampoDeBusca(texto: $filtro.busca, dica: "Buscar por tarefa, descrição ou pessoa…")
                .frame(maxWidth: DS.Acervo.larguraIdealDoPainel)

            MenuDeFiltro(
                titulo: "Tipo",
                opcoes: opcoesDeEspecie,
                marcadas: Binding(
                    get: { Set(filtro.especies.map(\.rawValue)) },
                    set: { filtro.especies = Set($0.compactMap(EventoDeCalendario.Especie.init)) }
                )
            )

            MenuDeFiltro(
                titulo: "Pessoa",
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
        return filtro.ativo
            ? "\(visiveis) de \(Plural.contar(total, "evento", "eventos"))"
            : Plural.contar(total, "evento", "eventos")
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
            .buttonStyle(BotaoDoSistema(.peca))
            .font(DS.Tipografia.detalhe)
            .foregroundStyle(cores.textoSutil)

            Spacer()
        }
        .padding(.horizontal, DS.Espaco.md)
        .padding(.vertical, DS.Espaco.sm)
        .background(cores.cromo)
        .overlay(alignment: .bottom) { Divisor() }
    }

    /// Os dias da semana, alinhados à grade — que pode ser mais estreita que a
    /// coluna quando a proporção da célula a segura. A faixa de cromo continua
    /// de ponta a ponta; só os rótulos acompanham a grade.
    private func cabecalhoDasColunas(largura: CGFloat) -> some View {
        HStack(spacing: DS.Traco.fio) {
            ForEach(Array(Calendario.rotulosDasColunas().enumerated()), id: \.offset) { _, rotulo in
                Text(rotulo)
                    .font(DS.Tipografia.rotulo)
                    .foregroundStyle(cores.textoSutil)
                    .frame(maxWidth: .infinity)
            }
        }
        .frame(width: largura, height: DS.Calendario.alturaDoCabecalho)
        .frame(maxWidth: .infinity)
        .background(cores.cromo)
    }

    // MARK: - Grade

    /// A coluna da esquerda: cabeçalho e grade, medidos pela área que sobrou.
    ///
    /// A grade fica no alto e centralizada; quando a proporção da célula a
    /// impede de ocupar a largura inteira, a sobra vai para as margens, não
    /// para dentro da célula. Só rola quando nem os pisos cabem.
    private func colunaDaGrade(sobraADireita: CGFloat) -> some View {
        GeometryReader { area in
            let margens = CGSize(
                width: 2 * DS.Espaco.md,
                height: DS.Calendario.alturaDoCabecalho + 2 * DS.Espaco.sm
            )
            let medidas = GeometriaDaGrade.calcular(
                area: CGSize(width: area.size.width - margens.width, height: area.size.height - margens.height),
                linhas: semanas.count
            )
            let sobra = sobraADireita + (area.size.width - medidas.larguraDaGrade) / 2
            let conteudo = VStack(spacing: 0) {
                cabecalhoDasColunas(largura: medidas.larguraDaGrade)
                grade(medidas, sobraADireita: sobra)
                    .frame(maxWidth: .infinity)
            }

            if medidas.transborda {
                ScrollView([.vertical, .horizontal]) { conteudo }
            } else {
                conteudo.frame(maxHeight: .infinity, alignment: .top)
            }
        }
        .background(cores.fundo)
    }

    private func grade(_ medidas: GeometriaDaGrade, sobraADireita: CGFloat) -> some View {
        VStack(spacing: DS.Traco.fio) {
            ForEach(Array(semanas.enumerated()), id: \.offset) { _, semana in
                HStack(spacing: DS.Traco.fio) {
                    ForEach(semana, id: \.self) { data in
                        celula(data, medidas: medidas)
                    }
                }
            }
        }
        .frame(width: medidas.larguraDaGrade, height: medidas.alturaDaGrade)
        .padding(.vertical, DS.Espaco.sm)
        .overlayPreferenceValue(AncoraDaPrevia.self) { ancora in
            GeometryReader { area in
                if let ancora, let data = previewDoDia, let dia = porData[data] {
                    let alvo = area[ancora]
                    Sobreposicao {
                        PreviaDoDia(
                            resumo: ResumoDoDia(dia),
                            ehHoje: data == hoje,
                            filtrado: filtro.ativo
                        )
                    }
                    .offset(
                        x: posicaoX(doAlvo: alvo, em: area.size, sobraADireita: sobraADireita),
                        y: posicaoY(doAlvo: alvo, em: area.size)
                    )
                    .transition(.opacity)
                }
            }
            .allowsHitTesting(false)
        }
        .animation(DS.Movimento.padrao, value: semanas.count)
        .animation(DS.Movimento.padrao, value: modo)
    }

    private func celula(_ data: String, medidas: GeometriaDaGrade) -> some View {
        let chipsPorCelula = medidas.chipsPorCelula
        let dia = porData[data]
        let resumo = dia.map(ResumoDoDia.init)
        let temAlgo = !(dia?.eventos.isEmpty ?? true)
        // Agenda primeiro — é o cronograma da Academy e tem prioridade de
        // leitura —, depois o nome das tarefas do dia. Commit cru não entra:
        // era ele que fazia a célula dizer `` `df873d0` — Regi… ``.
        let itens = (resumo?.agenda.map(ItemDaCelula.agenda) ?? [])
            + (resumo?.trello.map(ItemDaCelula.trello) ?? [])
            + (resumo?.destaques.map(ItemDaCelula.assunto) ?? [])
        let trabalho = resumo?.quantidadeDeTrabalho ?? 0
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
                    // A contagem de eventos que morava aqui saiu: "30" media
                    // volume de commit, não o que aconteceu. O véu de fundo
                    // já diz quanto, e os chips dizem o quê.
                }

                ForEach(Array(itens.prefix(chipsPorCelula).enumerated()), id: \.offset) { _, item in
                    ChipDaCelula(item: item, apagado: !doMes)
                }
                if itens.count > chipsPorCelula {
                    Text("+\(itens.count - chipsPorCelula)")
                        .font(DS.Tipografia.monoDetalhe)
                        .foregroundStyle(cores.textoSutil)
                }

                Spacer(minLength: 0)
            }
            .padding(DS.Espaco.xs + 1)
            .frame(width: medidas.celula.width, height: medidas.celula.height, alignment: .topLeading)
            .background(fundoDaCelula(quantidade: trabalho, doMes: doMes))
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
        .buttonStyle(BotaoDoSistema(.peca, raio: DS.Raio.sm))
        .onHover { dentro in
            // Só agenda para dia com evento: num mês típico, 33 das 35 células
            // estão vazias, e a prévia disparava neles para dizer "Nada
            // registrado" — a espera de 600 ms existia para não piscar ao
            // atravessar a grade, não para anunciar ausência.
            if dentro, temAlgo { agendarPreview(para: data) }
            else { cancelarPreview(de: data) }
        }
        .anchorPreference(key: AncoraDaPrevia.self, value: .bounds) { ancora in
            previewDoDia == data ? ancora : nil
        }
        .accessibilityLabel(rotuloAcessivel(data: data, resumo: resumo, ehHoje: ehHoje))
        .accessibilityAddTraits(selecionado ? [.isButton, .isSelected] : .isButton)
    }

    /// Véu por densidade de trabalho, atrás dos chips: a intensidade diz
    /// quanto aconteceu sem obrigar a contar. Bastidor não pinta — um dia só
    /// de "Registra os fatos da sessão" não é um dia de muito trabalho.
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

    private func rotuloAcessivel(data: String, resumo: ResumoDoDia?, ehHoje: Bool) -> String {
        var partes = [Calendario.rotuloDoDia(data)]
        if ehHoje { partes.append("hoje") }
        partes += resumo?.agenda.map(\.titulo) ?? []
        partes += resumo?.trello.map(\.titulo) ?? []
        partes.append(resumo?.frase ?? (resumo == nil ? "sem registro" : ""))
        return partes.filter { !$0.isEmpty }.joined(separator: ", ")
    }

    // MARK: - Detalhe do dia

    /// O dia em camadas, da leitura mais leve para a mais crua. Ver
    /// `ResumoDoDia`. Na coluna lateral a barra leva só a data: quem trabalhou
    /// já está na frase logo abaixo, e os dois juntos não cabiam em 280 pt.
    private var painelDoDia: some View {
        VStack(spacing: 0) {
            BarraDePainel {
                Text(Calendario.rotuloDoDia(ancora))
                    .font(DS.Tipografia.secao)
                    .foregroundStyle(cores.texto)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)

                if ancora == hoje { Etiqueta(texto: "hoje", cor: cores.acento) }

                Spacer(minLength: 0)
            }

            if let dia = diaEmFoco, !dia.eventos.isEmpty {
                PainelDoDia(resumo: ResumoDoDia(dia))
                    .id(dia.data)
            } else {
                Vazio(
                    simbolo: filtro.ativo ? "line.3.horizontal.decrease.circle" : "tray",
                    titulo: filtro.ativo
                        ? "Nada neste dia casa com o filtro"
                        : "Nada registrado neste dia",
                    detalhe: filtro.ativo
                        ? "O dia pode ter eventos fora do recorte atual."
                        : "Sem agenda, sem trabalho registrado e sem narrativa escrita."
                )
            }
        }
    }

    // MARK: - Lista

    /// Um índice dos dias: o que cada um foi, em uma frase e nas tarefas que
    /// andaram. Listar os commits de todos os dias em sequência dava uma
    /// parede de hash; o detalhe mora no painel do dia, a um clique.
    private var visaoDeLista: some View {
        Group {
            if diasFiltrados.isEmpty {
                Vazio(
                    simbolo: filtro.ativo ? "line.3.horizontal.decrease.circle" : "calendar",
                    titulo: filtro.ativo ? "Nenhum evento casa com o filtro" : "Nenhum dia com evento",
                    detalhe: filtro.ativo
                        ? "Limpe o filtro para ver o vault inteiro."
                        : "O calendário reúne a agenda da Academy, o log do vault, as narrativas diárias e a criação de tarefas."
                )
            } else {
                List {
                    ForEach(diasFiltrados) { dia in
                        let resumo = ResumoDoDia(dia)
                        Section {
                            if let frase = resumo.frase {
                                Text(frase)
                                    .font(DS.Tipografia.corpo)
                                    .foregroundStyle(cores.textoSutil)
                            }
                            ForEach(LinhaUnica.de(resumo.agenda, em: dia.data)) { linha in
                                LinhaDeAgenda(evento: linha.valor)
                            }
                            ForEach(LinhaUnica.de(resumo.trello, em: dia.data)) { linha in
                                LinhaDeTrello(evento: linha.valor)
                            }
                            ForEach(LinhaUnica.de(resumo.assuntos, em: dia.data, chave: \.id)) { linha in
                                LinhaDeValor(linha.valor.titulo, valor: "\(linha.valor.eventos.count)")
                                    .help(ResumoDoDia.listar(linha.valor.autores))
                            }
                        } header: {
                            Button { abrirDia(dia.data) } label: {
                                HStack(spacing: DS.Espaco.sm) {
                                    Text(Calendario.rotuloDoDia(dia.data))
                                        .font(DS.Tipografia.secao)
                                    if dia.data == hoje { Etiqueta(texto: "hoje", cor: cores.acento) }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(DS.Icone.fonte(DS.Icone.micro, peso: .semibold))
                                        .foregroundStyle(cores.textoSutil)
                                }
                                .padding(.vertical, DS.Espaco.xs)
                                .padding(.horizontal, DS.Espaco.xs)
                            }
                            .buttonStyle(BotaoDoSistema(.peca))
                            .help("Abrir o dia na semana")
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

    /// Da lista para o dia: a semana mostra a célula e, ao lado, o painel —
    /// que abre mesmo se estava fechado, porque abrir o dia é pedir o detalhe.
    private func abrirDia(_ data: String) {
        irPara(data)
        trocarModo(para: .semana)
        painelPedido = true
    }

    private func andar(_ passo: Int) -> KeyPress.Result {
        irPara(Calendario.dia(deslocando: ancora, em: passo))
        return .handled
    }

    private func trocarModo(para novo: Modo) {
        fecharPreview()
        withAnimation(DS.Movimento.padrao) { modo = novo }
    }

    // MARK: - Prévia com espera

    private func agendarPreview(para data: String) {
        esperaDoPreview?.cancel()
        esperaDoPreview = Task { @MainActor in
            try? await Task.sleep(for: .seconds(DS.Calendario.esperaDoPreview))
            guard !Task.isCancelled else { return }
            // A `Sobreposicao` herdou do popover nativo a forma que a doutrina
            // exigia — sem sombra — e perdeu o que o nativo dava de graça: a
            // entrada animada. Trocar a peça não transfere o comportamento.
            withAnimation(DS.Movimento.rapido) { previewDoDia = data }
        }
    }

    private func cancelarPreview(de data: String) {
        esperaDoPreview?.cancel()
        if previewDoDia == data {
            withAnimation(DS.Movimento.rapido) { previewDoDia = nil }
        }
    }

    private func fecharPreview() {
        esperaDoPreview?.cancel()
        guard previewDoDia != nil else { return }
        withAnimation(DS.Movimento.rapido) { previewDoDia = nil }
    }

    /// Ao lado da célula, nunca sobre ela.
    ///
    /// Prefere a direita, e pode passar da grade até a borda da janela —
    /// `sobraADireita` é a margem da coluna mais o painel do dia, se aberto.
    /// Se não couber, vai para a esquerda. Sem isso a prévia sairia pela borda
    /// da janela, que é metade do motivo de um `popover` nativo existir.
    private func posicaoX(doAlvo alvo: CGRect, em area: CGSize, sobraADireita: CGFloat) -> CGFloat {
        let largura = DS.Calendario.larguraDoPreview
        let folga = DS.Espaco.sm
        let aDireita = alvo.maxX + folga
        if aDireita + largura <= area.width + sobraADireita - folga { return aDireita }
        return max(0, alvo.minX - folga - largura)
    }

    private func posicaoY(doAlvo alvo: CGRect, em area: CGSize) -> CGFloat {
        let teto = DS.Calendario.alturaMaximaDoPreview
        return min(max(0, alvo.minY), max(0, area.height - teto))
    }
}

/// Onde a prévia deve aparecer: os limites da célula sob o cursor.
///
/// Publicar a âncora e desenhar na grade — em vez de um `popover` por célula —
/// é o que permite a prévia usar a `Sobreposicao` do sistema, sem a sombra
/// difusa que a moldura nativa traz junto.
private struct AncoraDaPrevia: PreferenceKey {
    static let defaultValue: Anchor<CGRect>? = nil

    static func reduce(value: inout Anchor<CGRect>?, nextValue: () -> Anchor<CGRect>?) {
        value = nextValue() ?? value
    }
}

// MARK: - Componentes da tela

/// Uma linha de `List` com identidade própria.
///
/// A `List` usa o `id` de cada linha para reciclá-la, e o id tem de ser único
/// na lista inteira, não só na seção. Com `\.offset` (ou com o id da tarefa,
/// que se repete de um dia para o outro), a linha 0 de toda seção era "a
/// mesma linha": a Lista mostrou "Apresentação" em dez dias que não tinham
/// apresentação nenhuma.
private struct LinhaUnica<Valor>: Identifiable {
    let id: String
    let valor: Valor

    static func de(_ valores: [Valor], em escopo: String, chave: (Valor) -> String) -> [LinhaUnica] {
        valores.enumerated().map { i, v in LinhaUnica(id: "\(escopo)|\(chave(v))|\(i)", valor: v) }
    }
}

extension LinhaUnica where Valor == EventoDeCalendario {
    static func de(_ eventos: [EventoDeCalendario], em escopo: String) -> [LinhaUnica] {
        de(eventos, em: escopo, chave: \.id)
    }
}

/// O que uma célula da grade pode mostrar.
private enum ItemDaCelula {
    case agenda(EventoDeCalendario)
    case trello(EventoDeCalendario)
    /// O nome de uma tarefa do dia, ou o título de um trabalho fora delas.
    case assunto(String)
}

/// Um item dentro da célula da grade.
///
/// Agenda é o cronograma que a Academy marcou — a regra é que ela tem
/// prioridade de leitura sobre o resto (`Especie.prioridade`), e o chip segue
/// a mesma regra em tinta: véu forte e texto na cor da categoria. O assunto
/// fala na voz neutra, e em sans: é o nome de uma tarefa ou uma mensagem
/// escrita por gente — a voz mono fica para o que um hook escreveu.
private struct ChipDaCelula: View {
    @Environment(\.cores) private var cores
    let item: ItemDaCelula
    var apagado = false

    private var texto: String {
        switch item {
        case let .agenda(evento): return evento.titulo
        case let .trello(evento): return evento.titulo
        case let .assunto(titulo): return titulo
        }
    }

    private var cor: Color {
        switch item {
        case let .agenda(evento): return cores.categoriaDeAgenda(evento.detalhe)
        case .trello: return cores.acento
        case .assunto: return cores.textoSutil
        }
    }

    private var destaque: Bool {
        if case .agenda = item { return true }
        if case .trello = item { return true }
        return false
    }

    var body: some View {
        HStack(spacing: DS.Espaco.xs) {
            Circle()
                .fill(cor)
                .frame(width: 5, height: 5)
            Text(texto)
                .font(DS.Tipografia.detalhe)
                .fontWeight(destaque ? .semibold : .regular)
                .foregroundStyle(destaque ? cor : cores.texto)
                .lineLimit(1)
                .truncationMode(.tail)
        }
        .padding(.horizontal, DS.Espaco.xs)
        .padding(.vertical, 1)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            cor.opacity(destaque ? DS.Veu.forte : DS.Veu.sutil),
            in: RoundedRectangle(cornerRadius: DS.Raio.xs)
        )
        .opacity(apagado ? 0.55 : 1)
        .help(texto)
    }
}

/// O dia inteiro, em camadas: frase, agenda, narrativa, trabalho por tarefa
/// e, recolhidos no fim, o bastidor e o log cru.
///
/// A ordem é a da pergunta de quem abre o dia. Quem chegou agora quer saber
/// o que aconteceu; quem é da equipe quer saber em que tarefa; quem vai
/// auditar quer o hash. As três respostas estão aqui — só que a do auditor
/// deixou de ser a primeira coisa na tela.
private struct PainelDoDia: View {
    @Environment(\.cores) private var cores
    let resumo: ResumoDoDia

    /// O que está aberto mora aqui, e não dentro de cada `DisclosureGroup`:
    /// a `List` recicla a linha que sai da tela, e o estado interno ia junto —
    /// abrir uma tarefa, rolar e voltar a encontrava fechada. O `.id(data)`
    /// de quem cria o painel zera isto ao trocar de dia.
    @State private var abertos: Set<String> = []

    private func aberto(_ chave: String) -> Binding<Bool> {
        Binding(
            get: { abertos.contains(chave) },
            set: { if $0 { abertos.insert(chave) } else { abertos.remove(chave) } }
        )
    }

    var body: some View {
        let narrativa = resumo.narrativa

        List {
            if let frase = resumo.frase {
                Text(frase)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
            }

            if !resumo.agenda.isEmpty {
                Section {
                    ForEach(LinhaUnica.de(resumo.agenda, em: "agenda")) { linha in
                        LinhaDeAgenda(evento: linha.valor)
                    }

                    if !resumo.trello.isEmpty {
                        Section {
                            ForEach(LinhaUnica.de(resumo.trello, em: "trello")) { linha in
                                LinhaDeTrello(evento: linha.valor)
                            }
                        } header: { RotuloDeSecao("Prazos do Trello") }
                    }
                } header: { RotuloDeSecao("Agenda da Academy") }
            }

            if !narrativa.isEmpty {
                Section {
                    NarrativaDoDia(itens: narrativa, origem: resumo.origemDaNarrativa)
                } header: { RotuloDeSecao("O que foi feito") }
            }

            if !resumo.assuntos.isEmpty {
                Section {
                    ForEach(resumo.assuntos) { assunto in
                        GrupoDeAssunto(assunto: assunto, aberto: aberto(assunto.id))
                    }
                } header: { RotuloDeSecao("Por tarefa") }
            }

            if !resumo.registro.isEmpty {
                Section {
                    if !resumo.bastidor.isEmpty {
                        DisclosureGroup(isExpanded: aberto("bastidor")) {
                            ForEach(LinhaUnica.de(resumo.bastidor, em: "bastidor")) { linha in
                                LinhaDeTrabalho(evento: linha.valor)
                            }
                        } label: {
                            rotuloRecolhido(
                                "Manutenção do registro",
                                contagem: resumo.bastidor.count,
                                ajuda: "Commits que o próprio vault faz para manter o log e a narrativa em dia. São reais, mas não são trabalho novo."
                            )
                        }
                    }
                    DisclosureGroup(isExpanded: aberto("registro")) {
                        ForEach(LinhaUnica.de(resumo.registro, em: "registro")) { linha in
                            LinhaDeRegistro(evento: linha.valor)
                        }
                    } label: {
                        rotuloRecolhido(
                            "Registro completo",
                            contagem: resumo.registro.count,
                            ajuda: "O log do dia como os hooks escreveram, com hash e contagem de arquivos."
                        )
                    }
                } header: { RotuloDeSecao("Para conferir") }
            }
        }
        .listStyle(.inset)
    }

    private func rotuloRecolhido(_ titulo: String, contagem: Int, ajuda: String) -> some View {
        LinhaDeValor(titulo, valor: "\(contagem)")
            .help(ajuda)
    }
}

/// Um evento da agenda: a cor da categoria, o que é, e de que tipo.
private struct LinhaDeAgenda: View {
    @Environment(\.cores) private var cores
    let evento: EventoDeCalendario

    var body: some View {
        let cor = cores.categoriaDeAgenda(evento.detalhe)
        HStack(spacing: DS.Espaco.sm) {
            Circle().fill(cor).frame(width: 6, height: 6)
            Text(evento.titulo)
                .font(DS.Tipografia.corpo)
                .foregroundStyle(cores.texto)
            Spacer(minLength: DS.Espaco.md)
            if let categoria = CategoriaDeAgenda(rawValue: evento.detalhe) {
                Etiqueta(texto: categoria.rotulo, cor: cor)
            }
        }
    }
}

private struct LinhaDeTrello: View {
    @Environment(\.cores) private var cores
    let evento: EventoDeCalendario

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.sm) {
            Image(systemName: "checklist")
                .font(DS.Icone.fonte(DS.Icone.micro))
                .foregroundStyle(cores.acento)
            VStack(alignment: .leading, spacing: 2) {
                Text(evento.titulo)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.texto)
                    .lineLimit(2)
                Text(evento.detalhe)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
            }
            Spacer()
            if let prazo = evento.prazo {
                Text(prazo.formatted(date: .abbreviated, time: .omitted))
                    .font(DS.Tipografia.mono)
                    .foregroundStyle(cores.acento)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture(count: 2) {
            if let origem = evento.origem { NSWorkspace.shared.open(origem) }
        }
        .help("Cartão do Trello — \(evento.detalhe)")
    }
}

/// Os itens de "O que foi feito" da narrativa, na voz serifada.
///
/// Os primeiros quatro abrem, em duas linhas cada; o resto espera um clique.
/// Uma narrativa de dezoito itens de três linhas empurraria o trabalho por
/// tarefa para fora da tela — e a narrativa inteira continua a um botão, no
/// arquivo.
private struct NarrativaDoDia: View {
    @Environment(\.cores) private var cores
    let itens: [Markdown.Item]
    let origem: URL?
    @State private var tudo = false

    private let visiveisDeInicio = 4

    private var rotuloDoBotao: String {
        if tudo { return "Mostrar menos" }
        let escondidos = itens.count - visiveisDeInicio
        return escondidos > 0 ? "Ler tudo (mais \(escondidos))" : "Ler tudo"
    }

    var body: some View {
        let visiveis = tudo ? itens : Array(itens.prefix(visiveisDeInicio))
        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
            TextoDeNota(blocos: [.lista(visiveis)], linhasPorItem: tudo ? nil : 2)

            HStack(spacing: DS.Espaco.md) {
                Button(rotuloDoBotao) {
                    withAnimation(DS.Movimento.rapido) { tudo.toggle() }
                }
                .buttonStyle(BotaoDoSistema(.peca))
                .font(DS.Tipografia.detalhe)
                .foregroundStyle(cores.acento)

                if let origem {
                    Button("Abrir a narrativa") { NSWorkspace.shared.open(origem) }
                        .buttonStyle(BotaoDoSistema(.peca))
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }
        }
        .padding(.vertical, DS.Espaco.xs)
    }
}

/// Uma tarefa do dia: o nome dela, quanto andou e quem andou com ela. O que
/// foi feito, linha a linha, fica dentro.
private struct GrupoDeAssunto: View {
    @Environment(\.cores) private var cores
    let assunto: AssuntoDoDia
    @Binding var aberto: Bool

    private var detalhe: String {
        let registros = Plural.contar(assunto.eventos.count, "registro", "registros")
        let autores = assunto.autores
        return autores.isEmpty ? registros : "\(registros) · \(ResumoDoDia.listar(autores))"
    }

    var body: some View {
        DisclosureGroup(isExpanded: $aberto) {
            ForEach(LinhaUnica.de(assunto.eventos, em: assunto.id)) { linha in
                LinhaDeTrabalho(evento: linha.valor)
            }
        } label: {
            // Empilhado: na coluna lateral, nome e detalhe lado a lado
            // cortavam os dois ao meio.
            VStack(alignment: .leading, spacing: 2) {
                Text(assunto.titulo)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(assunto.tarefa == nil ? cores.textoSutil : cores.texto)
                    .lineLimit(2)
                Text(detalhe)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .lineLimit(1)
            }
            .padding(.vertical, 2)
        }
    }
}

/// Um registro já traduzido: quando, o que foi feito, por quem.
///
/// O hash e a contagem de arquivos saíram da linha e foram para a dica: estão
/// a um repouso do ponteiro para quem precisa, e fora do caminho de quem lê.
private struct LinhaDeTrabalho: View {
    @Environment(\.cores) private var cores
    let evento: EventoDeCalendario

    private var dica: String {
        var partes: [String] = []
        if let ref = evento.referencia { partes.append("Commit \(ref)") }
        if let n = evento.arquivos { partes.append(Plural.contar(n, "arquivo", "arquivos")) }
        if evento.origem != nil { partes.append("clique duas vezes para abrir") }
        return partes.isEmpty ? evento.titulo : partes.joined(separator: " · ")
    }

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: DS.Espaco.sm) {
            Text(evento.hora ?? "—")
                .font(DS.Tipografia.mono)
                .foregroundStyle(cores.textoSutil)
                .monospacedDigit()
            VStack(alignment: .leading, spacing: 1) {
                Text(evento.titulo)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.texto)
                    .lineLimit(3)
                if let autor = evento.autor {
                    Text(autor)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 1)
        .contentShape(Rectangle())
        .onTapGesture(count: 2) {
            if let origem = evento.origem { NSWorkspace.shared.open(origem) }
        }
        .help(dica)
    }
}

/// Uma linha do log exatamente como os hooks a escreveram — a camada de
/// auditoria, no fim do painel e recolhida.
private struct LinhaDeRegistro: View {
    let evento: EventoDeCalendario

    var body: some View {
        LinhaDeFato(
            carimbo: evento.hora ?? "—",
            tipo: evento.detalhe,
            descricao: evento.rotulo,
            autor: evento.autor
        )
        .help("Fato do log — escrito pelos hooks, sem arquivo próprio para abrir")
    }
}

/// O resumo que aparece depois da espera de 600 ms.
///
/// Responde "o que foi este dia" sem abrir o painel: a frase, a agenda e as
/// tarefas que mais andaram. Contagem por espécie e intervalo de horas saíram
/// — eram a composição do log, não o que aconteceu.
private struct PreviaDoDia: View {
    @Environment(\.cores) private var cores
    let resumo: ResumoDoDia
    let ehHoje: Bool
    var filtrado = false

    private let tarefasVisiveis = 3

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Espaco.sm) {
            HStack(spacing: DS.Espaco.sm) {
                Text(Calendario.rotuloDoDia(resumo.data)).font(DS.Tipografia.secao)
                if ehHoje { Etiqueta(texto: "hoje", cor: cores.acento) }
                Spacer()
            }

            if let frase = resumo.frase {
                Text(frase)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if !resumo.agenda.isEmpty {
                Divisor()
                ForEach(Array(resumo.agenda.enumerated()), id: \.offset) { _, evento in
                    HStack(spacing: DS.Espaco.sm) {
                        Circle().fill(cores.categoriaDeAgenda(evento.detalhe)).frame(width: 5, height: 5)
                        Text(evento.titulo)
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.texto)
                            .lineLimit(2)
                    }
                }
            }

            if !resumo.tarefas.isEmpty {
                Divisor()
                ForEach(resumo.tarefas.prefix(tarefasVisiveis)) { assunto in
                    LinhaDeValor(assunto.titulo, valor: "\(assunto.eventos.count)")
                }

                if !resumo.trello.isEmpty {
                    Divisor()
                    ForEach(resumo.trello.prefix(tarefasVisiveis)) { evento in
                        LinhaDeValor(evento.titulo, valor: evento.prazo.map {
                            $0.formatted(date: .abbreviated, time: .omitted)
                        } ?? "Trello")
                    }
                }
                if resumo.tarefas.count > tarefasVisiveis {
                    Text("e mais \(Plural.contar(resumo.tarefas.count - tarefasVisiveis, "tarefa", "tarefas"))")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }

            Divisor()
            Text(filtrado ? "Recorte do filtro · clique para abrir o dia" : "Clique para abrir o dia")
                .font(DS.Tipografia.detalhe)
                .foregroundStyle(cores.textoSutil)
        }
        .padding(DS.Espaco.md)
        .frame(width: DS.Calendario.larguraDoPreview)
    }
}
