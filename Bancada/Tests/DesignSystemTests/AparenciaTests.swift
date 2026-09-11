import XCTest
import SwiftUI
@testable import DesignSystem

/// A preferência de aparência é o único ponto do sistema onde alguém pode
/// sobrepor o esquema. Vale travar o que ela promete.
final class AparenciaTests: XCTestCase {

    func testSistemaNaoForcaEsquema() {
        XCTAssertNil(
            Aparencia.sistema.esquema,
            "`sistema` tem de deixar o macOS decidir — é a regra padrão da Bancada"
        )
        XCTAssertEqual(Aparencia.claro.esquema, .light)
        XCTAssertEqual(Aparencia.escuro.esquema, .dark)
    }

    /// Toda opção precisa cobrir um esquema do sistema de design, e os dois
    /// esquemas precisam ser alcançáveis. Um caso novo que não force esquema
    /// nenhum seria um botão que não faz nada.
    func testAsDuasOpcoesForcadasCobremOsDoisEsquemas() {
        let forcados = Aparencia.allCases.compactMap(\.esquema)
        XCTAssertEqual(Set(forcados), [.light, .dark])
        XCTAssertEqual(forcados.count, 2, "só um caso pode seguir o sistema")
    }

    /// A ordem importa: `sistema` é o padrão e vem primeiro no seletor.
    func testSistemaEhOPrimeiroCaso() {
        XCTAssertEqual(Aparencia.allCases.first, .sistema)
    }

    /// Uma chave escrita por uma versão futura, ou apagada, não pode deixar a
    /// janela sem aparência.
    func testValorDesconhecidoOuAusenteCaiNoSistema() {
        XCTAssertNil(Aparencia(rawValue: "sepia"))
        XCTAssertEqual(Aparencia(rawValue: "sepia") ?? .sistema, .sistema)
        XCTAssertEqual(Aparencia(rawValue: "") ?? .sistema, .sistema)
    }

    /// O `rawValue` é o que vai para o `UserDefaults`: mudá-lo faz todo mundo
    /// que já escolheu voltar para o padrão sem aviso.
    func testRawValuesSaoEstaveis() {
        XCTAssertEqual(Aparencia.sistema.rawValue, "sistema")
        XCTAssertEqual(Aparencia.claro.rawValue, "claro")
        XCTAssertEqual(Aparencia.escuro.rawValue, "escuro")
    }

    func testTodaOpcaoTemRotuloSimboloENota() {
        for opcao in Aparencia.allCases {
            XCTAssertFalse(opcao.rotulo.isEmpty, "\(opcao) sem rótulo")
            XCTAssertFalse(opcao.simbolo.isEmpty, "\(opcao) sem símbolo")
            XCTAssertFalse(opcao.nota.isEmpty, "\(opcao) sem nota explicativa")
        }
    }
}
