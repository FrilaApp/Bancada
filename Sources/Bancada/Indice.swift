import Foundation
import VaultKit

/// `./Bancada --indice [caminho]` — emite o vault inteiro como JSON na saída
/// padrão.
///
/// É a peça que sustenta "um parser, duas superfícies": o gerador do site
/// consome este JSON em vez de reimplementar em JavaScript o parser de
/// frontmatter, o leitor de fatos e a regra de agrupamento. Duas
/// implementações da mesma regra divergem — e um site que agrupa os fatos
/// diferente do app faria o registro parecer inconsistente conforme quem
/// olhasse.
///
/// Os tipos daqui são DTOs próprios em vez de `Codable` nos modelos do
/// VaultKit: o formato do JSON é um contrato com o gerador, e merece ser
/// explícito e mudar por decisão, não como efeito colateral de um campo novo
/// no modelo.
enum Indice {
    static let versaoDoFormato = 1

    static func executar(caminho: String?) -> Int32 {
        let base = URL(fileURLWithPath: caminho ?? FileManager.default.currentDirectoryPath)
            .standardizedFileURL

        let raiz: URL
        if LeitorDeVault.ehVault(base) {
            raiz = base
        } else if LeitorDeVault.ehVault(base.appendingPathComponent("doc-harness")) {
            raiz = base.appendingPathComponent("doc-harness")
        } else {
            FileHandle.standardError.write(Data(
                "✗ \(base.path) não é um vault do doc-harness.\n".utf8
            ))
            return 1
        }

        do {
            let vault = try LeitorDeVault.ler(raiz: raiz)
            let codificador = JSONEncoder()
            codificador.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
            codificador.dateEncodingStrategy = .iso8601

            let dados = try codificador.encode(IndiceDoVault(vault))
            FileHandle.standardOutput.write(dados)
            FileHandle.standardOutput.write(Data("\n".utf8))
            return 0
        } catch {
            FileHandle.standardError.write(Data("✗ \(error.localizedDescription)\n".utf8))
            return 1
        }
    }
}

// MARK: - Contrato do JSON

struct IndiceDoVault: Encodable {
    let versaoDoFormato: Int
    let raiz: String
    let geradoEm: Date
    let notas: [NotaJSON]
    let fatos: [FatoJSON]
    let arvoreDeRegistros: [NoJSON]
    let midias: [MidiaJSON]
    let invalidas: [InvalidaJSON]
    let fatosNaoReconhecidos: [String]

    init(_ vault: Vault) {
        versaoDoFormato = Indice.versaoDoFormato
        raiz = vault.raiz.path
        geradoEm = .now
        notas = vault.notas.map(NotaJSON.init)
        fatos = vault.fatos.map(FatoJSON.init)
        arvoreDeRegistros = Agrupador.arvore(de: vault.fatos).map(NoJSON.init)
        midias = vault.midias.map(MidiaJSON.init)
        invalidas = vault.invalidas.map(InvalidaJSON.init)
        fatosNaoReconhecidos = vault.fatosNaoReconhecidos
    }
}

struct NotaJSON: Encodable {
    let caminho: String
    let tipo: String
    let rotuloDoTipo: String
    let titulo: String
    let corpo: String
    let somenteLeitura: Bool
    let tags: [String]
    let campos: [String: String]

    init(_ nota: Nota) {
        caminho = nota.caminhoRelativo
        tipo = nota.tipo.rawValue
        rotuloDoTipo = nota.tipo.rotulo
        titulo = nota.titulo
        corpo = nota.corpo
        somenteLeitura = nota.tipo.somenteLeitura
        tags = nota.frontmatter.tags
        campos = nota.frontmatter.valores
    }
}

struct FatoJSON: Encodable {
    let data: String
    let hora: String
    let autor: String
    let tipo: String
    let descricao: String

    init(_ fato: Fato) {
        data = fato.data
        hora = fato.hora
        autor = fato.autor
        tipo = fato.tipo
        descricao = fato.descricao
    }
}

struct NoJSON: Encodable {
    let id: String
    let rotulo: String
    let detalhe: String
    let ocorrencias: Int
    let filhos: [NoJSON]?

    init(_ no: NoRegistro) {
        id = no.id
        rotulo = no.rotulo
        detalhe = no.detalhe
        ocorrencias = no.ocorrencias
        filhos = no.filhos?.map(NoJSON.init)
    }
}

struct MidiaJSON: Encodable {
    let caminho: String
    let nome: String
    let especie: String
    let rotuloDaEspecie: String
    let bytes: Int
    let caminhoDerivado: String?

    init(_ midia: Midia) {
        caminho = midia.caminhoRelativo
        nome = midia.nome
        especie = midia.especie.rawValue
        rotuloDaEspecie = midia.especie.rotulo
        bytes = midia.bytes
        caminhoDerivado = midia.caminhoDerivado
    }
}

struct InvalidaJSON: Encodable {
    let caminho: String
    let motivo: String

    init(_ invalida: NotaInvalida) {
        caminho = invalida.caminhoRelativo
        motivo = invalida.motivo.descricao
    }
}
