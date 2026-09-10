import XCTest
import CoreGraphics
@testable import DesignSystem

final class GeometriaDaGradeTests: XCTestCase {
    private let faixa = DS.Calendario.proporcaoMinimaDaCelula...DS.Calendario.proporcaoMaximaDaCelula

    /// A promessa da regra: em qualquer janela, a célula fica na faixa.
    func testProporcaoNuncaSaiDaFaixa() {
        for largura in stride(from: 520.0, through: 2400, by: 70) {
            for altura in stride(from: 200.0, through: 1400, by: 60) {
                for linhas in [1, 4, 5, 6] {
                    let g = GeometriaDaGrade.calcular(area: CGSize(width: largura, height: altura), linhas: linhas)
                    XCTAssertTrue(
                        faixa.contains(g.proporcao) || abs(g.proporcao - faixa.lowerBound) < 0.001
                            || abs(g.proporcao - faixa.upperBound) < 0.001,
                        "\(largura)×\(altura), \(linhas) linhas → \(g.celula) (\(g.proporcao))"
                    )
                }
            }
        }
    }

    /// Com altura sobrando, a grade usa a largura toda.
    func testComAlturaSobrandoPreencheALargura() {
        let g = GeometriaDaGrade.calcular(area: CGSize(width: 1000, height: 900), linhas: 5)
        XCTAssertEqual(g.larguraDaGrade, 1000, accuracy: 0.5)
        XCTAssertFalse(g.transborda)
    }

    /// Janela larga e baixa: antes, a célula virava faixa. Agora a grade
    /// estreita e a célula mantém a forma.
    func testJanelaLargaEBaixaEstreitaAGradeEmVezDeAchatarACelula() {
        let g = GeometriaDaGrade.calcular(area: CGSize(width: 1600, height: 500), linhas: 6)
        XCTAssertLessThan(g.larguraDaGrade, 1600)
        XCTAssertEqual(g.proporcao, DS.Calendario.proporcaoMaximaDaCelula, accuracy: 0.001)
        XCTAssertLessThanOrEqual(g.alturaDaGrade, 500.5)
    }

    /// Na tira da semana a altura sobra: a célula para de crescer em vez de
    /// virar coluna.
    func testTiraDaSemanaNaoViraColuna() {
        let g = GeometriaDaGrade.calcular(area: CGSize(width: 900, height: 700), linhas: 1)
        XCTAssertEqual(g.proporcao, DS.Calendario.proporcaoMinimaDaCelula, accuracy: 0.001)
        XCTAssertLessThan(g.alturaDaGrade, 700)
    }

    func testPisosTransbordamEmVezDeEspremer() {
        let g = GeometriaDaGrade.calcular(area: CGSize(width: 300, height: 200), linhas: 6)
        XCTAssertGreaterThanOrEqual(g.celula.width, DS.Calendario.larguraMinimaDaCelula)
        XCTAssertGreaterThanOrEqual(g.celula.height, DS.Calendario.alturaMinimaDaCelula)
        XCTAssertTrue(g.transborda)
    }

    func testCelulaMaisAltaMostraMaisChips() {
        let baixa = GeometriaDaGrade.calcular(area: CGSize(width: 800, height: 420), linhas: 6)
        let alta = GeometriaDaGrade.calcular(area: CGSize(width: 800, height: 700), linhas: 1)
        XCTAssertGreaterThan(alta.chipsPorCelula, baixa.chipsPorCelula)
        XCTAssertGreaterThanOrEqual(baixa.chipsPorCelula, 1)
    }

    // MARK: - Painel do dia

    func testPainelFicaEntreOsLimites() throws {
        let estreita = try XCTUnwrap(GeometriaDaGrade.larguraDoPainel(para: 900))
        let larga = try XCTUnwrap(GeometriaDaGrade.larguraDoPainel(para: 2400))
        XCTAssertEqual(estreita, DS.Calendario.larguraMinimaDoPainel)
        XCTAssertEqual(larga, DS.Calendario.larguraMaximaDoPainel)
    }

    /// Onde o painel não cabe sem espremer a grade abaixo do piso, ele não abre.
    func testPainelNaoAbreSeEspremeAGrade() {
        XCTAssertNil(GeometriaDaGrade.larguraDoPainel(para: 740))
    }

    /// Com o painel aberto, a grade que sobra nunca fica abaixo do piso.
    func testGradeQueSobraRespeitaOPiso() {
        for largura in stride(from: 700.0, through: 2400, by: 10) {
            guard let painel = GeometriaDaGrade.larguraDoPainel(para: largura) else { continue }
            let area = largura - painel - DS.Traco.fio - 2 * DS.Espaco.md
            let celula = (area - 6 * DS.Traco.fio) / 7
            XCTAssertGreaterThanOrEqual(celula, DS.Calendario.larguraMinimaDaCelula - 0.001, "\(largura)")
        }
    }
}
