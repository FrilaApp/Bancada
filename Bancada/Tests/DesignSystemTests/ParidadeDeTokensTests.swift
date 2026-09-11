import XCTest
import SwiftUI
@testable import DesignSystem
@testable import VaultKit

/// `tokens.json` é a fonte única, e `Tokens.swift` é um espelho manual dele.
///
/// O espelho existe por escolha — constantes dão verificação em tempo de
/// compilação e evitam carregar um recurso a mais no executável —, mas até
/// aqui o custo dessa escolha era um comentário pedindo "ao mexer num valor,
/// mexa nos dois". Comentário não segura divergência: um valor trocado só no
/// JSON sai no site e no ícone e não sai no app, e ninguém percebe até alguém
/// pôr as duas telas lado a lado.
///
/// Este teste é a trava. Ele resolve as referências do JSON — `papel` aponta
/// para `primitivo`, nunca para hex — e compara com o que o Swift declara.
final class ParidadeDeTokensTests: XCTestCase {

    // MARK: - Leitura do JSON

    /// `tokens.json` fica na raiz do pacote, três níveis acima deste arquivo.
    /// Localizar por `#filePath` em vez de empacotar como recurso mantém o
    /// arquivo sendo lido de onde ele de fato mora.
    private static let raiz = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()  // DesignSystemTests
        .deletingLastPathComponent()  // Tests
        .deletingLastPathComponent()  // raiz do pacote

    private var json: [String: Any]!

    override func setUpWithError() throws {
        let url = Self.raiz.appendingPathComponent("tokens.json")
        let dados = try Data(contentsOf: url)
        json = try XCTUnwrap(
            JSONSerialization.jsonObject(with: dados) as? [String: Any],
            "tokens.json não é um objeto JSON"
        )
    }

    /// Resolve `"neutro.3"` ou `"azul.profundo"` para o hex correspondente.
    private func resolver(_ referencia: String) throws -> String {
        let partes = referencia.split(separator: ".")
        guard partes.count == 2 else {
            throw XCTSkip("referência malformada: \(referencia)")
        }
        let primitivo = try XCTUnwrap(json["primitivo"] as? [String: Any])
        let grupo = try XCTUnwrap(
            primitivo[String(partes[0])],
            "primitivo.\(partes[0]) não existe — papel aponta para um primitivo que sumiu"
        )
        let chave = String(partes[1])

        if let rampa = grupo as? [String] {
            let i = try XCTUnwrap(Int(chave), "índice de rampa não numérico: \(referencia)")
            guard rampa.indices.contains(i) else {
                XCTFail("primitivo.\(partes[0]) não tem o passo \(i)")
                return ""
            }
            return rampa[i]
        }
        let matiz = try XCTUnwrap(grupo as? [String: String])
        return try XCTUnwrap(matiz[chave], "primitivo.\(referencia) não existe")
    }

    /// Um papel do JSON já resolvido nos dois esquemas.
    private func papel(_ nome: String, em grupo: String = "papel") throws -> (claro: String, escuro: String) {
        let bloco = try XCTUnwrap(json[grupo] as? [String: Any])
        let entrada = try XCTUnwrap(
            bloco[nome] as? [String: String],
            "\(grupo).\(nome) não existe em tokens.json"
        )
        return (
            claro: try resolver(try XCTUnwrap(entrada["claro"])),
            escuro: try resolver(try XCTUnwrap(entrada["escuro"]))
        )
    }

    private func conferir(
        _ swift: DS.ParDeCor,
        contra nome: String,
        em grupo: String = "papel",
        arquivo: StaticString = #filePath,
        linha: UInt = #line
    ) throws {
        let esperado = try papel(nome, em: grupo)
        XCTAssertEqual(
            swift.claroHex.uppercased(), esperado.claro.uppercased().replacingOccurrences(of: "#", with: ""),
            "\(grupo).\(nome) (claro) divergiu entre Tokens.swift e tokens.json",
            file: arquivo, line: linha
        )
        XCTAssertEqual(
            swift.escuroHex.uppercased(), esperado.escuro.uppercased().replacingOccurrences(of: "#", with: ""),
            "\(grupo).\(nome) (escuro) divergiu entre Tokens.swift e tokens.json",
            file: arquivo, line: linha
        )
    }

    // MARK: - Camada 1: primitivo

    func testRampaNeutraEspelhaOJSON() throws {
        let primitivo = try XCTUnwrap(json["primitivo"] as? [String: Any])
        let rampa = try XCTUnwrap(primitivo["neutro"] as? [String])
        XCTAssertEqual(
            rampa.map { $0.uppercased().replacingOccurrences(of: "#", with: "") },
            DS.Primitivo.neutro.map { $0.uppercased() },
            "a rampa neutra divergiu"
        )
    }

    func testMatizesEspelhamOJSON() throws {
        let primitivo = try XCTUnwrap(json["primitivo"] as? [String: Any])
        let esperados: [String: DS.Primitivo.Matiz] = [
            "azul": DS.Primitivo.azul,
            "verde": DS.Primitivo.verde,
            "ambar": DS.Primitivo.ambar,
            "violeta": DS.Primitivo.violeta,
            "turquesa": DS.Primitivo.turquesa,
            "vermelho": DS.Primitivo.vermelho
        ]
        for (nome, swift) in esperados {
            let json = try XCTUnwrap(primitivo[nome] as? [String: String], "primitivo.\(nome) sumiu")
            XCTAssertEqual(
                json["profundo"]?.uppercased().replacingOccurrences(of: "#", with: ""),
                swift.profundo.uppercased(), "\(nome).profundo divergiu"
            )
            XCTAssertEqual(
                json["luz"]?.uppercased().replacingOccurrences(of: "#", with: ""),
                swift.luz.uppercased(), "\(nome).luz divergiu"
            )
        }
    }

    // MARK: - Camada 2: papel

    func testPapeisEspelhamOJSON() throws {
        try conferir(DS.Cor.fundo, contra: "fundo")
        try conferir(DS.Cor.superficie, contra: "superficie")
        try conferir(DS.Cor.superficieSutil, contra: "superficieSutil")
        try conferir(DS.Cor.borda, contra: "borda")
        try conferir(DS.Cor.texto, contra: "texto")
        try conferir(DS.Cor.textoSutil, contra: "textoSutil")
        try conferir(DS.Cor.cromo, contra: "cromo")
        try conferir(DS.Cor.folha, contra: "folha")
        try conferir(DS.Cor.dado, contra: "dado")
        try conferir(DS.Cor.divisor, contra: "divisor")
        try conferir(DS.Cor.acento, contra: "acento")
        try conferir(DS.Cor.foco, contra: "foco")
        try conferir(DS.Cor.perigo, contra: "perigo")
        try conferir(DS.Cor.aviso, contra: "aviso")
    }

    /// Se um papel entrar no JSON e ninguém espelhar no Swift, o teste acima
    /// continua passando — ele só verifica o que já conhece. Esta é a metade
    /// que falta: o conjunto de papéis tem de ser exatamente o mesmo dos dois
    /// lados.
    func testNenhumPapelFicouSemEspelho() throws {
        let bloco = try XCTUnwrap(json["papel"] as? [String: Any])
        let noJSON = Set(bloco.keys.filter { !$0.hasPrefix("_") })
        let noSwift: Set<String> = [
            "fundo", "superficie", "superficieSutil", "borda", "texto", "textoSutil",
            "cromo", "folha", "dado", "divisor", "acento", "foco", "perigo", "aviso"
        ]
        XCTAssertEqual(
            noJSON, noSwift,
            "papéis só no JSON: \(noJSON.subtracting(noSwift).sorted()) · só no Swift: \(noSwift.subtracting(noJSON).sorted())"
        )
    }

    // MARK: - Escalas semânticas

    func testStatusDeTarefaEspelhaOJSON() throws {
        let mapa: [StatusTarefa: String] = [
            .aFazer: "a-fazer",
            .emAndamento: "em-andamento",
            .revisao: "revisao",
            .concluida: "concluida"
        ]
        for (status, chave) in mapa {
            try conferir(DS.Cor.status(status), contra: chave, em: "statusTarefa")
        }
        let bloco = try XCTUnwrap(json["statusTarefa"] as? [String: Any])
        XCTAssertEqual(
            Set(bloco.keys), Set(mapa.values),
            "statusTarefa tem chave no JSON que StatusTarefa não conhece, ou o contrário"
        )
    }

    func testTiposDeFatoEspelhamOJSON() throws {
        let bloco = try XCTUnwrap(json["tipoFato"] as? [String: Any])
        for chave in bloco.keys where !chave.hasPrefix("_") {
            try conferir(DS.Cor.tipoDeFato(chave), contra: chave, em: "tipoFato")
        }
    }

    /// Um tipo que o log inventar amanhã não pode nem quebrar nem ganhar cor
    /// de categoria emprestada — `registrar-fato.sh` aceita tipo arbitrário.
    func testTipoDeFatoDesconhecidoCaiNoNeutro() {
        let desconhecido = DS.Cor.tipoDeFato("deploy")
        XCTAssertEqual(desconhecido.claroHex, DS.Primitivo.neutro[7])
        XCTAssertEqual(desconhecido.escuroHex, DS.Primitivo.neutro[6])
    }

    func testCategoriasDeAgendaEspelhamOJSON() throws {
        let bloco = try XCTUnwrap(json["categoriaAgenda"] as? [String: Any])
        for chave in bloco.keys where !chave.hasPrefix("_") {
            try conferir(DS.Cor.categoriaDeAgenda(chave), contra: chave, em: "categoriaAgenda")
        }
        XCTAssertEqual(
            Set(bloco.keys), Set(CategoriaDeAgenda.allCases.map(\.rawValue)),
            "categoriaAgenda tem chave que CategoriaDeAgenda não conhece, ou o contrário"
        )
    }

    /// Uma categoria que a Academy inventar amanhã não pode nem quebrar nem
    /// ganhar cor emprestada — a linha já aparece como não reconhecida no
    /// `LeitorDeAgenda` antes de chegar aqui.
    func testCategoriaDeAgendaDesconhecidaCaiNoNeutro() {
        let desconhecida = DS.Cor.categoriaDeAgenda("sprint")
        XCTAssertEqual(desconhecida.claroHex, DS.Primitivo.neutro[7])
        XCTAssertEqual(desconhecida.escuroHex, DS.Primitivo.neutro[6])
    }

    // MARK: - Escalas não-cromáticas

    func testEscalasNumericasEspelhamOJSON() throws {
        func numero(_ grupo: String, _ chave: String) throws -> Double {
            let bloco = try XCTUnwrap(json[grupo] as? [String: Any])
            return try XCTUnwrap(bloco[chave] as? Double, "\(grupo).\(chave) sumiu")
        }

        XCTAssertEqual(try numero("espaco", "xs"), Double(DS.Espaco.xs))
        XCTAssertEqual(try numero("espaco", "sm"), Double(DS.Espaco.sm))
        XCTAssertEqual(try numero("espaco", "md"), Double(DS.Espaco.md))
        XCTAssertEqual(try numero("espaco", "lg"), Double(DS.Espaco.lg))
        XCTAssertEqual(try numero("espaco", "xl"), Double(DS.Espaco.xl))

        XCTAssertEqual(try numero("raio", "xs"), Double(DS.Raio.xs))
        XCTAssertEqual(try numero("raio", "sm"), Double(DS.Raio.sm))
        XCTAssertEqual(try numero("raio", "md"), Double(DS.Raio.md))
        XCTAssertEqual(try numero("raio", "lg"), Double(DS.Raio.lg))
        XCTAssertEqual(try numero("raio", "pilula"), Double(DS.Raio.pilula))

        XCTAssertEqual(try numero("traco", "fio"), Double(DS.Traco.fio))
        XCTAssertEqual(try numero("traco", "foco"), Double(DS.Traco.foco))
        XCTAssertEqual(try numero("traco", "selecao"), Double(DS.Traco.selecao))

        XCTAssertEqual(try numero("veu", "sutil"), DS.Veu.sutil)
        XCTAssertEqual(try numero("veu", "medio"), DS.Veu.medio)
        XCTAssertEqual(try numero("veu", "forte"), DS.Veu.forte)
    }

    func testEscalaDeIconeEspelhaOJSON() throws {
        let icone = try XCTUnwrap(json["icone"] as? [String: Double])
        XCTAssertEqual(icone["micro"], Double(DS.Icone.micro))
        XCTAssertEqual(icone["pequeno"], Double(DS.Icone.pequeno))
        XCTAssertEqual(icone["medio"], Double(DS.Icone.medio))
        XCTAssertEqual(icone["grande"], Double(DS.Icone.grande))
        XCTAssertEqual(icone["vazio"], Double(DS.Icone.vazio))
    }

    func testMetricaDeTelaEspelhaOJSON() throws {
        let metrica = try XCTUnwrap(json["metrica"] as? [String: [String: Double]])
        XCTAssertEqual(metrica["galeria"]?["larguraMinimaCard"], Double(DS.Galeria.larguraMinimaCard))
        XCTAssertEqual(metrica["galeria"]?["alturaThumbnail"], Double(DS.Galeria.alturaThumbnail))
        XCTAssertEqual(metrica["trabalho"]?["alturaMinimaDaTabela"], Double(DS.Trabalho.alturaMinimaDaTabela))
        XCTAssertEqual(metrica["trabalho"]?["alturaMinimaDoPainel"], Double(DS.Trabalho.alturaMinimaDoPainel))
        XCTAssertEqual(metrica["acervo"]?["larguraMinimaDoPainel"], Double(DS.Acervo.larguraMinimaDoPainel))
        XCTAssertEqual(metrica["acervo"]?["larguraIdealDoPainel"], Double(DS.Acervo.larguraIdealDoPainel))
        XCTAssertEqual(metrica["acervo"]?["larguraMaximaDoPainel"], Double(DS.Acervo.larguraMaximaDoPainel))
        XCTAssertEqual(metrica["acervo"]?["alturaDaPreviaGrande"], Double(DS.Acervo.alturaDaPreviaGrande))
        XCTAssertEqual(metrica["calendario"]?["larguraMinimaDaCelula"], Double(DS.Calendario.larguraMinimaDaCelula))
        XCTAssertEqual(metrica["calendario"]?["alturaMinimaDaCelula"], Double(DS.Calendario.alturaMinimaDaCelula))
        XCTAssertEqual(metrica["calendario"]?["alturaDoCabecalho"], Double(DS.Calendario.alturaDoCabecalho))
        XCTAssertEqual(metrica["calendario"]?["proporcaoMinimaDaCelula"], Double(DS.Calendario.proporcaoMinimaDaCelula))
        XCTAssertEqual(metrica["calendario"]?["proporcaoMaximaDaCelula"], Double(DS.Calendario.proporcaoMaximaDaCelula))
        XCTAssertEqual(metrica["calendario"]?["fracaoDoPainel"], Double(DS.Calendario.fracaoDoPainel))
        XCTAssertEqual(metrica["calendario"]?["larguraMinimaDoPainel"], Double(DS.Calendario.larguraMinimaDoPainel))
        XCTAssertEqual(metrica["calendario"]?["larguraMaximaDoPainel"], Double(DS.Calendario.larguraMaximaDoPainel))
        XCTAssertEqual(metrica["calendario"]?["esperaDoPreview"], DS.Calendario.esperaDoPreview)
        XCTAssertEqual(metrica["calendario"]?["larguraDoPreview"], Double(DS.Calendario.larguraDoPreview))
        XCTAssertEqual(metrica["calendario"]?["alturaMaximaDoPreview"], Double(DS.Calendario.alturaMaximaDoPreview))
        XCTAssertEqual(metrica["calendario"]?["diasMinimosParaGrade"], Double(DS.Calendario.diasMinimosParaGrade))
        XCTAssertEqual(metrica["marcador"]?["larguraDoTipo"], Double(DS.Marcador.larguraDoTipo))
        XCTAssertEqual(metrica["marcador"]?["larguraDaHora"], Double(DS.Marcador.larguraDaHora))
        XCTAssertEqual(metrica["barraLateral"]?["alturaDoRodape"], Double(DS.BarraLateral.alturaDoRodape))
        XCTAssertEqual(metrica["barraLateral"]?["larguraMinima"], Double(DS.BarraLateral.larguraMinima))
        XCTAssertEqual(metrica["barraLateral"]?["larguraIdeal"], Double(DS.BarraLateral.larguraIdeal))
        XCTAssertEqual(metrica["barraLateral"]?["larguraMaxima"], Double(DS.BarraLateral.larguraMaxima))
        XCTAssertEqual(metrica["janela"]?["larguraPadrao"], Double(DS.Janela.larguraPadrao))
        XCTAssertEqual(metrica["janela"]?["alturaPadrao"], Double(DS.Janela.alturaPadrao))
        XCTAssertEqual(metrica["janela"]?["larguraMinimaDoDetalhe"], Double(DS.Janela.larguraMinimaDoDetalhe))
        XCTAssertEqual(metrica["janela"]?["larguraMinimaDoConteudo"], Double(DS.Janela.larguraMinimaDoConteudo))
        XCTAssertEqual(metrica["janela"]?["alturaMinimaDoConteudo"], Double(DS.Janela.alturaMinimaDoConteudo))
        XCTAssertEqual(metrica["diario"]?["larguraMinimaDaLista"], Double(DS.Diario.larguraMinimaDaLista))
        XCTAssertEqual(metrica["diario"]?["larguraIdealDaLista"], Double(DS.Diario.larguraIdealDaLista))
        XCTAssertEqual(metrica["diario"]?["larguraMinimaDaFolha"], Double(DS.Diario.larguraMinimaDaFolha))
        XCTAssertEqual(metrica["diario"]?["larguraMinimaDosFatos"], Double(DS.Diario.larguraMinimaDosFatos))
        XCTAssertEqual(metrica["diario"]?["larguraIdealDosFatos"], Double(DS.Diario.larguraIdealDosFatos))
        XCTAssertEqual(metrica["leitura"]?["larguraMaximaDaFolha"], Double(DS.Leitura.larguraMaximaDaFolha))
    }

    func testTipografiaEspelhaOJSON() throws {
        let tipo = try XCTUnwrap(json["tipografia"] as? [String: [String: Any]])
        func tamanho(_ voz: String, _ estilo: String) throws -> Double {
            let e = try XCTUnwrap(tipo[voz]?[estilo] as? [String: Any], "tipografia.\(voz).\(estilo) sumiu")
            return try XCTUnwrap(e["tamanho"] as? Double)
        }
        func tracking(_ voz: String, _ estilo: String) throws -> Double {
            let e = try XCTUnwrap(tipo[voz]?[estilo] as? [String: Any])
            return try XCTUnwrap(e["tracking"] as? Double)
        }

        // O JSON guarda tamanho e tracking; o Swift monta a `Font` a partir
        // deles. Só o tracking dá para comparar direto — `Font` não devolve o
        // tamanho que recebeu —, então o tamanho é conferido pelo JSON estar
        // completo e o tracking, valor a valor.
        for (voz, estilos) in [
            ("interface", ["titulo", "secao", "corpo", "detalhe", "rotulo"]),
            ("narrativa", ["leituraTitulo", "leitura"]),
            ("fato", ["mono", "monoDetalhe"])
        ] {
            for estilo in estilos {
                XCTAssertGreaterThan(try tamanho(voz, estilo), 0, "tipografia.\(voz).\(estilo)")
            }
        }

        XCTAssertEqual(try tracking("interface", "titulo"), Double(DS.Tipografia.titulo.tracking))
        XCTAssertEqual(try tracking("interface", "secao"), Double(DS.Tipografia.secao.tracking))
        XCTAssertEqual(try tracking("interface", "corpo"), Double(DS.Tipografia.corpo.tracking))
        XCTAssertEqual(try tracking("interface", "detalhe"), Double(DS.Tipografia.detalhe.tracking))
        XCTAssertEqual(try tracking("interface", "rotulo"), Double(DS.Tipografia.rotulo.tracking))
        XCTAssertEqual(try tracking("narrativa", "leituraTitulo"), Double(DS.Tipografia.leituraTitulo.tracking))
        XCTAssertEqual(try tracking("narrativa", "leitura"), Double(DS.Tipografia.leitura.tracking))
        XCTAssertEqual(try tracking("fato", "mono"), Double(DS.Tipografia.mono.tracking))
        XCTAssertEqual(try tracking("fato", "monoDetalhe"), Double(DS.Tipografia.monoDetalhe.tracking))
    }

    // MARK: - Regras do sistema

    /// A regra que sustenta a camada 2: papel referencia primitivo, nunca hex.
    /// Um hex solto em `papel` significa que alguém pulou a camada 1 — e a
    /// partir daí trocar um passo da rampa deixa de propagar.
    func testNenhumPapelCarregaHexLiteral() throws {
        for grupo in ["papel", "statusTarefa", "tipoFato"] {
            let bloco = try XCTUnwrap(json[grupo] as? [String: Any])
            for (nome, valor) in bloco where !nome.hasPrefix("_") {
                let entrada = try XCTUnwrap(valor as? [String: String], "\(grupo).\(nome)")
                for (esquema, referencia) in entrada {
                    XCTAssertFalse(
                        referencia.hasPrefix("#"),
                        "\(grupo).\(nome).\(esquema) = \"\(referencia)\" é hex literal; deveria referenciar um primitivo"
                    )
                    XCTAssertNoThrow(
                        try resolver(referencia),
                        "\(grupo).\(nome).\(esquema) aponta para um primitivo inexistente"
                    )
                }
            }
        }
    }

    /// A rampa é monotônica: cada passo é mais escuro que o anterior.
    ///
    /// É o que torna "um passo acima" e "um passo abaixo" frases com sentido.
    /// Um passo fora de ordem quebra toda escolha de papel feita por vizinhança
    /// sem quebrar nenhum teste de valor.
    func testRampaNeutraEhMonotonica() {
        let luz = DS.Primitivo.neutro.map(Self.luminancia)
        for i in 1..<luz.count {
            XCTAssertLessThan(
                luz[i], luz[i - 1],
                "o passo \(i) (\(DS.Primitivo.neutro[i])) não é mais escuro que o \(i - 1)"
            )
        }
    }

    /// Elevação é sempre mais clara — nos dois esquemas.
    ///
    /// Esta é a regra que a rampa espelhada **não** obedece, de propósito. Se
    /// os papéis fossem simetria pura, no escuro a superfície ficaria mais
    /// escura que o fundo e um cartão pareceria um buraco. Aqui a superfície
    /// sobe em relação ao fundo dos dois lados: `fundo` é o passo 1 no claro e
    /// o 13 no escuro, `superficie` é o 0 e o 12. A assimetria é o conserto,
    /// não o defeito.
    func testElevacaoSobeNosDoisEsquemas() {
        for (esquema, lado) in [(ColorScheme.light, "claro"), (.dark, "escuro")] {
            let fundo = Self.luminancia(DS.Cor.fundo.hex(esquema))
            let superficie = Self.luminancia(DS.Cor.superficie.hex(esquema))
            XCTAssertGreaterThan(
                superficie, fundo,
                "no esquema \(lado) a superfície não está acima do fundo"
            )
        }
    }

    /// O mínimo da janela é a soma dos mínimos declarados, não um número
    /// escolhido.
    ///
    /// Enquanto foi escolhido, ficou 220pt menor do que o Diário precisa e
    /// ninguém percebeu — a janela abre em 1080 e o defeito só aparece quando
    /// alguém arrasta. Se uma coluna crescer, é aqui que o erro estoura.
    func testMinimoDaJanelaEhASomaDosMinimos() {
        let diario = DS.Diario.larguraMinimaDaLista
            + DS.Diario.larguraMinimaDaFolha
            + DS.Diario.larguraMinimaDosFatos
        let acervo = DS.Galeria.larguraMinimaCard * 2 + DS.Acervo.larguraMinimaDoPainel
        let maisLarga = max(diario, acervo)

        XCTAssertEqual(
            DS.Janela.larguraMinimaDoDetalhe, maisLarga,
            "o mínimo do detalhe (\(DS.Janela.larguraMinimaDoDetalhe)) não é o da tela mais larga (\(maisLarga))"
        )
        XCTAssertEqual(
            DS.Janela.larguraMinimaDoConteudo,
            DS.BarraLateral.larguraMinima + DS.Janela.larguraMinimaDoDetalhe,
            "o mínimo do conteúdo não é barra lateral + detalhe"
        )
        XCTAssertGreaterThanOrEqual(
            DS.Janela.larguraPadrao, DS.Janela.larguraMinimaDoConteudo,
            "a janela abre menor do que o próprio mínimo"
        )
    }

    /// O fio estrutural tem de ter mais presença que o fio de contorno.
    ///
    /// Eram o mesmo passo, e o efeito é que nada separava painel de painel numa
    /// linguagem que recusa sombra. Não perseguimos os 3:1 da WCAG aqui — contra
    /// branco isso exigiria `neutro.6`, que a 1px é régua e não fio —, mas a
    /// ordem entre os dois é invariante.
    func testDivisorSeparaMaisQueBorda() {
        for (esquema, lado) in [(ColorScheme.light, "claro"), (.dark, "escuro")] {
            let fundoDaVez = DS.Cor.superficie.hex(esquema)
            let borda = Self.contraste(DS.Cor.borda.hex(esquema), fundoDaVez)
            let divisor = Self.contraste(DS.Cor.divisor.hex(esquema), fundoDaVez)
            XCTAssertGreaterThan(
                divisor, borda,
                "no \(lado) o divisor (\(divisor):1) não separa mais que a borda (\(borda):1)"
            )
        }
    }

    /// A folha tem de se destacar do fundo por margem parecida nos dois
    /// esquemas.
    ///
    /// No claro a folha separava por ΔL 0,87 contra 3,71 do escuro: a elevação
    /// valia um quarto de um lado. O fio não cobria a diferença, e o resultado
    /// era a superfície de leitura não se lendo como superfície.
    ///
    /// Mede em **razão de contraste**, não em diferença de luminância. A
    /// primeira versão deste teste comparava luminância relativa crua e
    /// acusava 25× de desequilíbrio num par correto: a luminância relativa é
    /// quase zero perto do preto, então uma diferença no escuro nunca tem a
    /// mesma ordem de grandeza que a mesma diferença no claro. A razão
    /// normaliza, que é justamente para isso que ela existe.
    func testFolhaSeSeparaDoFundoNosDoisEsquemas() {
        let claro = Self.contraste(DS.Cor.folha.hex(.light), DS.Cor.fundo.hex(.light))
        let escuro = Self.contraste(DS.Cor.folha.hex(.dark), DS.Cor.fundo.hex(.dark))
        let desequilibrio = max(claro, escuro) / min(claro, escuro)
        XCTAssertLessThan(
            desequilibrio, 1.15,
            "a folha separa \(claro):1 no claro e \(escuro):1 no escuro — desequilíbrio de \(desequilibrio)×"
        )
    }

    /// A separação do fio contra a superfície tem de ser a mesma nos dois
    /// esquemas.
    ///
    /// É isto que faz um único conjunto de componentes servir aos dois lados:
    /// se o fio fosse discreto no claro e gritante no escuro, cada componente
    /// precisaria de dois ajustes em vez de um token. Um desvio de mais de 10%
    /// já é visível ao alternar a aparência do sistema com a janela aberta.
    func testFioSeparaIgualNosDoisEsquemas() {
        let claro = Self.contraste(
            DS.Cor.borda.hex(.light), DS.Cor.superficie.hex(.light)
        )
        let escuro = Self.contraste(
            DS.Cor.borda.hex(.dark), DS.Cor.superficie.hex(.dark)
        )
        XCTAssertEqual(
            claro, escuro, accuracy: max(claro, escuro) * 0.1,
            "o fio separa \(claro):1 no claro e \(escuro):1 no escuro"
        )
    }

    /// Todo papel que vira texto tem de passar em AA (4.5:1) contra as três
    /// superfícies onde ele pode cair, nos dois esquemas.
    ///
    /// Contraste conferido uma vez no dia do desenho e nunca mais é contraste
    /// que se perde no primeiro ajuste de matiz.
    func testTodoPapelDeTextoPassaEmAA() throws {
        var papeis: [(String, DS.ParDeCor)] = [
            ("texto", DS.Cor.texto),
            ("textoSutil", DS.Cor.textoSutil),
            ("acento", DS.Cor.acento),
            ("perigo", DS.Cor.perigo)
        ]
        for status in [StatusTarefa.aFazer, .emAndamento, .revisao, .concluida] {
            papeis.append(("status.\(status)", DS.Cor.status(status)))
        }
        for tipo in ["commit", "pages", "sessao", "teste", "ui"] {
            papeis.append(("tipoFato.\(tipo)", DS.Cor.tipoDeFato(tipo)))
        }

        for (esquema, lado) in [(ColorScheme.light, "claro"), (.dark, "escuro")] {
            let superficies: [(String, String)] = [
                ("fundo", DS.Cor.fundo.hex(esquema)),
                ("superficie", DS.Cor.superficie.hex(esquema)),
                ("cromo", DS.Cor.cromo.hex(esquema))
            ]
            for (nome, par) in papeis {
                for (superficie, atras) in superficies {
                    let razao = Self.contraste(par.hex(esquema), atras)
                    XCTAssertGreaterThanOrEqual(
                        razao, 4.5,
                        "\(nome) sobre \(superficie) no \(lado): \(razao):1"
                    )
                }
            }
        }
    }

    // MARK: - Contraste (WCAG 2.1)

    private static func luminancia(_ hex: String) -> Double {
        let s = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        let n = UInt32(s, radix: 16) ?? 0
        let canais = [(n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF].map { canal -> Double in
            let c = Double(canal) / 255
            return c <= 0.03928 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2]
    }

    private static func contraste(_ a: String, _ b: String) -> Double {
        let x = luminancia(a), y = luminancia(b)
        return (max(x, y) + 0.05) / (min(x, y) + 0.05)
    }
}

private extension DS.ParDeCor {
    func hex(_ esquema: ColorScheme) -> String {
        esquema == .dark ? escuroHex : claroHex
    }
}
