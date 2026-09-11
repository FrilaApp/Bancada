import CoreGraphics

/// Quanto mede a grade do calendário, dada a área que sobrou para ela.
///
/// A célula acompanha a janela — é isso que faz a grade ocupar a tela em vez
/// de flutuar num canto —, mas dentro de uma faixa de proporção
/// (`DS.Calendario.proporcaoMinimaDaCelula...proporcaoMaximaDaCelula`).
/// Antes a altura era fixa e a largura livre: numa janela larga a célula
/// virava uma faixa de 2,4:1. Fora da faixa a regra é sempre a mesma: **a
/// grade cede, a célula não deforma**. Célula larga demais para a altura
/// disponível estreita a grade (quem desenha centraliza); célula alta demais
/// para a largura para de crescer e deixa sobra embaixo.
///
/// É cálculo puro, sem `View`, pelo motivo de sempre: regra de desenho dentro
/// de `body` não tem teste, e esta é fácil de quebrar sem ninguém ver.
public struct GeometriaDaGrade: Equatable {
    public let celula: CGSize
    public let larguraDaGrade: CGFloat
    public let alturaDaGrade: CGFloat
    /// Os pisos da célula não couberam na área: quem desenha deve rolar.
    public let transborda: Bool

    public var proporcao: CGFloat { celula.height > 0 ? celula.width / celula.height : 0 }

    public static func calcular(
        area: CGSize,
        linhas: Int,
        colunas: Int = 7,
        fio: CGFloat = DS.Traco.fio,
        proporcao faixa: ClosedRange<CGFloat> = DS.Calendario.proporcaoMinimaDaCelula...DS.Calendario.proporcaoMaximaDaCelula,
        larguraMinima: CGFloat = DS.Calendario.larguraMinimaDaCelula,
        alturaMinima: CGFloat = DS.Calendario.alturaMinimaDaCelula
    ) -> GeometriaDaGrade {
        let l = CGFloat(max(linhas, 1))
        let c = CGFloat(max(colunas, 1))
        let larguraLivre = max(0, (area.width - (c - 1) * fio) / c)
        let alturaLivre = max(0, (area.height - (l - 1) * fio) / l)

        /// A altura que preenche a área, presa à faixa de proporção.
        func altura(para largura: CGFloat) -> CGFloat {
            min(max(alturaLivre, largura / faixa.upperBound), largura / faixa.lowerBound)
        }

        var largura = max(larguraLivre, larguraMinima)
        var alto = altura(para: largura)

        // A proporção máxima exigiu mais altura do que existe: a célula está
        // larga demais para esta janela. Estreitar é o que mantém a forma.
        if alto > alturaLivre {
            largura = max(larguraMinima, alturaLivre * faixa.upperBound)
            alto = altura(para: largura)
        }
        // O piso de altura só aumenta a altura, e 64 × 0,75 < 72: nunca
        // empurra a célula para baixo da proporção mínima.
        alto = max(alto, alturaMinima)

        let larguraDaGrade = c * largura + (c - 1) * fio
        let alturaDaGrade = l * alto + (l - 1) * fio
        return GeometriaDaGrade(
            celula: CGSize(width: largura, height: alto),
            larguraDaGrade: larguraDaGrade,
            alturaDaGrade: alturaDaGrade,
            transborda: larguraDaGrade > area.width + 0.5 || alturaDaGrade > area.height + 0.5
        )
    }

    /// Quantos chips cabem na célula antes do "+N".
    ///
    /// Sai da altura real em vez de ser fixo por modo: a célula alta da tira
    /// da semana mostra mais, a baixa de um mês de seis linhas mostra menos.
    /// As medidas são a pilha que a célula desenha — número do dia, chips de
    /// texto `detalhe` com 1 pt de respiro, a linha do "+N" e o recuo.
    public var chipsPorCelula: Int {
        let recuo: CGFloat = 10, numeroDoDia: CGFloat = 20, linhaDoMais: CGFloat = 14, chip: CGFloat = 19
        return max(1, Int((celula.height - recuo - numeroDoDia - linhaDoMais) / chip))
    }

    /// A largura do painel do dia numa área desta largura, ou `nil` quando
    /// ele não cabe sem espremer a grade abaixo do piso da célula.
    ///
    /// Quem decide não é a preferência de quem lê: numa janela estreita,
    /// abrir o painel à força deixaria a grade com células de 50 pt e o nome
    /// das tarefas reduzido a reticências. O painel volta sozinho quando a
    /// janela alarga.
    public static func larguraDoPainel(
        para largura: CGFloat,
        margem: CGFloat = DS.Espaco.md,
        fio: CGFloat = DS.Traco.fio
    ) -> CGFloat? {
        let gradeMinima = 7 * DS.Calendario.larguraMinimaDaCelula + 6 * fio + 2 * margem
        let desejada = min(
            max(largura * DS.Calendario.fracaoDoPainel, DS.Calendario.larguraMinimaDoPainel),
            DS.Calendario.larguraMaximaDoPainel
        )
        // Primeiro a largura desejada; se ela não deixa grade, o mínimo.
        for painel in [desejada, DS.Calendario.larguraMinimaDoPainel] where largura - painel - fio >= gradeMinima {
            return painel
        }
        return nil
    }
}
