import Foundation

/// Nó da árvore de registros — o que a Bancada desenha com indentação.
///
/// Três níveis: dia → tipo de fato → grupo de fatos semelhantes. Um grupo com
/// uma única ocorrência é folha; com duas ou mais vira nó colapsável que
/// mostra "5× …" e o intervalo de tempo.
public struct NoRegistro: Identifiable, Equatable {
    public let id: String
    public let rotulo: String
    /// Texto de apoio à direita: contagem, intervalo, autor.
    public let detalhe: String
    public let ocorrencias: Int
    public let fatos: [Fato]
    public let filhos: [NoRegistro]?

    public var ehFolha: Bool { filhos == nil }
}

/// Colapsa repetição no log de fatos.
///
/// O problema é concreto: o primeiro dia de uso do doc-harness já registrou
/// cinco commits idênticos "Registra os fatos da sessão", espalhados por duas
/// horas. Lidos em lista plana, eles afogam os fatos que importam.
///
/// A regra é determinística e auditável — nada de similaridade difusa. Dois
/// fatos entram no mesmo grupo quando coincidem em `(tipo, autor, descrição
/// normalizada)`, onde normalizar significa apenas descartar o que varia
/// mecanicamente entre repetições: o hash do commit e as contagens.
///
/// Isso importa num sistema cuja premissa é que nada no registro é inventado:
/// dá para explicar por que duas linhas foram juntadas, e nenhum fato some —
/// os originais continuam dentro do nó.
public enum Agrupador {
    public static func arvore(de fatos: [Fato]) -> [NoRegistro] {
        let porDia = Dictionary(grouping: fatos, by: \.data)

        return porDia.keys.sorted(by: >).map { dia in            // mais recente no topo
            let doDia = porDia[dia]!.sorted { $0.minutoDoDia < $1.minutoDoDia }
            let tipos = nosDeTipo(doDia, dia: dia)

            return NoRegistro(
                id: "dia:\(dia)",
                rotulo: dia,
                detalhe: contagem(doDia.count, singular: "fato", plural: "fatos"),
                ocorrencias: doDia.count,
                fatos: doDia,
                filhos: tipos
            )
        }
    }

    private static func nosDeTipo(_ fatos: [Fato], dia: String) -> [NoRegistro] {
        let porTipo = Dictionary(grouping: fatos, by: \.tipo)

        return porTipo.keys.sorted().map { tipo in
            let doTipo = porTipo[tipo]!
            return NoRegistro(
                id: "dia:\(dia)/tipo:\(tipo)",
                rotulo: tipo,
                detalhe: contagem(doTipo.count, singular: "fato", plural: "fatos"),
                ocorrencias: doTipo.count,
                fatos: doTipo,
                filhos: nosDeGrupo(doTipo, dia: dia, tipo: tipo)
            )
        }
    }

    private static func nosDeGrupo(_ fatos: [Fato], dia: String, tipo: String) -> [NoRegistro] {
        // Agrupa preservando a ordem de primeira aparição, para a leitura
        // seguir a cronologia em vez de uma ordem de dicionário.
        var chaves: [String] = []
        var grupos: [String: [Fato]] = [:]

        for fato in fatos {
            let chave = "\(fato.autor)|\(normalizar(fato.descricao))"
            if grupos[chave] == nil {
                grupos[chave] = []
                chaves.append(chave)
            }
            grupos[chave]!.append(fato)
        }

        return chaves.map { chave in
            let doGrupo = grupos[chave]!
            let primeiro = doGrupo[0]
            let idBase = "dia:\(dia)/tipo:\(tipo)/grupo:\(chave)"

            guard doGrupo.count > 1 else {
                return NoRegistro(
                    id: idBase,
                    rotulo: primeiro.descricao,
                    detalhe: "\(primeiro.hora) · \(primeiro.autor)",
                    ocorrencias: 1,
                    fatos: doGrupo,
                    filhos: nil
                )
            }

            let intervalo = "\(doGrupo.first!.hora)–\(doGrupo.last!.hora)"
            return NoRegistro(
                id: idBase,
                rotulo: "\(doGrupo.count)× \(normalizar(primeiro.descricao))",
                detalhe: "\(intervalo) · \(primeiro.autor)",
                ocorrencias: doGrupo.count,
                fatos: doGrupo,
                // Os fatos originais seguem acessíveis: colapsar é uma
                // escolha de leitura, não uma perda de informação.
                filhos: doGrupo.map { fato in
                    NoRegistro(
                        id: "\(idBase)/\(fato.hora)/\(fato.descricao)",
                        rotulo: fato.descricao,
                        detalhe: fato.hora,
                        ocorrencias: 1,
                        fatos: [fato],
                        filhos: nil
                    )
                }
            )
        }
    }

    // MARK: - Normalização

    private static let shaDeCommit = try! NSRegularExpression(
        pattern: "^`[0-9a-f]{7,40}`\\s*—\\s*"
    )
    private static let metricaFinal = try! NSRegularExpression(
        pattern: "\\s*·\\s*\\d+\\s+(arquivo\\(s\\)|palavras|palavra)\\s*$"
    )
    private static let contagemDeNotas = try! NSRegularExpression(
        pattern: "\\b\\d+\\s+(nota\\(s\\))"
    )

    /// Descarta só o que varia mecanicamente entre repetições do mesmo evento.
    ///
    /// Deliberadamente conservadora: números em geral **não** são removidos,
    /// senão "C17" e "C18" colapsariam num grupo só — e aí o agrupamento
    /// mentiria sobre o que aconteceu.
    public static func normalizar(_ descricao: String) -> String {
        var texto = descricao
        for regex in [shaDeCommit, metricaFinal] {
            texto = regex.stringByReplacingMatches(
                in: texto,
                range: NSRange(texto.startIndex..., in: texto),
                withTemplate: ""
            )
        }
        texto = contagemDeNotas.stringByReplacingMatches(
            in: texto,
            range: NSRange(texto.startIndex..., in: texto),
            withTemplate: "$1"
        )
        return texto.trimmingCharacters(in: .whitespaces)
    }

    private static func contagem(_ n: Int, singular: String, plural: String) -> String {
        "\(n) \(n == 1 ? singular : plural)"
    }
}
