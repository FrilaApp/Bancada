import XCTest
@testable import VaultKit

final class AgrupadorTests: XCTestCase {
    private func fatosDoLogReal() throws -> [Fato] {
        let url = try XCTUnwrap(Bundle.module.url(
            forResource: "registro-2026-09-08",
            withExtension: "md",
            subdirectory: "Fixtures"
        ))
        let texto = try String(contentsOf: url, encoding: .utf8)
        let (_, corpo) = Frontmatter.separar(de: texto)
        return LeitorDeFatos.ler(texto: corpo, data: "2026-09-08").fatos
    }

    /// O caso que motivou o agrupador: cinco commits idênticos "Registra os
    /// fatos da sessão", espalhados de 20:21 a 22:05.
    func testCommitsRepetidosColapsamNumNoSo() throws {
        let arvore = Agrupador.arvore(de: try fatosDoLogReal())
        let dia = try XCTUnwrap(arvore.first)
        let commits = try XCTUnwrap(dia.filhos?.first { $0.rotulo == "commit" })

        let grupo = try XCTUnwrap(
            commits.filhos?.first { $0.rotulo.hasSuffix("Registra os fatos da sessão") },
            "o grupo de commits repetidos não foi formado"
        )

        XCTAssertEqual(grupo.ocorrencias, 5)
        XCTAssertEqual(grupo.rotulo, "5× Registra os fatos da sessão")
        XCTAssertEqual(grupo.detalhe, "20:21–22:05 · fbtostadev")
        // Colapsar é escolha de leitura: os cinco fatos originais continuam lá.
        XCTAssertEqual(grupo.filhos?.count, 5)
    }

    func testNenhumFatoSePerdeNoAgrupamento() throws {
        let fatos = try fatosDoLogReal()
        let arvore = Agrupador.arvore(de: fatos)

        let folhas = arvore
            .flatMap { $0.filhos ?? [] }
            .flatMap { $0.filhos ?? [] }
            .flatMap { $0.fatos }

        XCTAssertEqual(folhas.count, fatos.count)
        XCTAssertEqual(Set(folhas.map(\.id)), Set(fatos.map(\.id)))
    }

    func testSessoesDeAutoresDiferentesNaoSeMisturam() throws {
        let arvore = Agrupador.arvore(de: try fatosDoLogReal())
        let dia = try XCTUnwrap(arvore.first)
        let sessoes = try XCTUnwrap(dia.filhos?.first { $0.rotulo == "sessao" })

        let autores = Set(sessoes.filhos?.compactMap { $0.fatos.first?.autor } ?? [])
        XCTAssertEqual(autores, ["fbtostadev", "Cauê Carneiro"])
    }

    func testNormalizacaoDescartaShaEContagens() {
        XCTAssertEqual(
            Agrupador.normalizar("`d622a3a` — Transforma o repositório · 25 arquivo(s)"),
            "Transforma o repositório"
        )
        XCTAssertEqual(
            Agrupador.normalizar("Claude · 1 nota(s) com alteração pendente"),
            "Claude · nota(s) com alteração pendente"
        )
        XCTAssertEqual(
            Agrupador.normalizar("CBL_C18.pages → CBL_C18.md · 4365 palavras"),
            "CBL_C18.pages → CBL_C18.md"
        )
    }

    /// A normalização é conservadora de propósito: juntar ciclos diferentes
    /// faria o registro mentir sobre o que aconteceu.
    func testNormalizacaoNaoJuntaCiclosDiferentes() {
        XCTAssertNotEqual(
            Agrupador.normalizar("`aaaaaaa` — Abre o desafio C17 · 1 arquivo(s)"),
            Agrupador.normalizar("`bbbbbbb` — Abre o desafio C18 · 1 arquivo(s)")
        )
    }

    func testFatoUnicoViraFolhaSemContador() throws {
        let arvore = Agrupador.arvore(de: try fatosDoLogReal())
        let dia = try XCTUnwrap(arvore.first)
        let teste = try XCTUnwrap(dia.filhos?.first { $0.rotulo == "teste" })
        let folha = try XCTUnwrap(teste.filhos?.first)

        XCTAssertEqual(folha.ocorrencias, 1)
        XCTAssertTrue(folha.ehFolha)
        XCTAssertEqual(folha.rotulo, "verificação de estabilidade do hook")
    }
}
