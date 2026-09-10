import Foundation

/// Markdown → blocos, sem dependências.
///
/// Mesmo espírito — e o mesmo subconjunto — de `scripts/markdown.js`, que
/// alimenta o site. O vault escreve um Markdown pequeno e previsível, fixado
/// pelo `CLAUDE.md` e pelos templates: títulos, listas, tabelas, citações,
/// callouts, ênfase, código e wikilinks. Cobrir esse subconjunto custa menos
/// que arrastar uma dependência para um projeto que hoje não tem nenhuma.
///
/// O que não é coberto (HTML embutido, listas aninhadas fundas, referências)
/// não aparece no vault. Se aparecer, sai como parágrafo — **degrada, não
/// quebra**, que é a mesma promessa do gerador do site.
///
/// Isto mora em `VaultKit` e não na interface porque parsear é leitura do
/// vault, não desenho: assim é testável sem abrir janela, do mesmo jeito que o
/// frontmatter e o log de fatos.
public enum Markdown {

    // MARK: - Trechos

    /// Um pedaço de linha. A distinção entre `texto` e `codigo` não é
    /// decoração: no sistema de design, código é voz de fato e o resto é voz
    /// de narrativa.
    public enum Trecho: Equatable, Sendable {
        case texto(String)
        case forte(String)
        case enfase(String)
        case riscado(String)
        case codigo(String)
        case wikilink(alvo: String, rotulo: String)
        case link(rotulo: String, destino: String)
        case imagem(alvo: String, legenda: String?)
    }

    // MARK: - Blocos

    public enum Marca: Equatable, Sendable {
        case ponto
        case numero(Int)
        case tarefa(feita: Bool)
        /// Marcador sem conteúdo — os templates do vault têm vários (`- `
        /// esperando ser preenchido). Some no site como `.vazio-item`, e aqui
        /// ocupa a linha sem fingir texto que não existe.
        case vazia
    }

    public struct Item: Equatable, Sendable {
        public let recuo: Int
        public let marca: Marca
        public let trechos: [Trecho]
    }

    public enum Bloco: Equatable, Sendable {
        case titulo(nivel: Int, trechos: [Trecho])
        case paragrafo([Trecho])
        case lista([Item])
        case citacao([[Trecho]])
        /// Callout do Obsidian: `> [!info] Título`. Sem tratá-lo, o marcador
        /// vaza como texto cru — que é exatamente a falha V-01 em miniatura.
        case callout(tipo: String, titulo: String?, corpo: [[Trecho]])
        case codigo(linguagem: String?, texto: String)
        case tabela(cabecalho: [[Trecho]], linhas: [[[Trecho]]])
        case regra
    }

    // MARK: - Entrada

    public static func blocos(de markdown: String) -> [Bloco] {
        let linhas = markdown.components(separatedBy: "\n")
        var blocos: [Bloco] = []
        var i = 0

        while i < linhas.count {
            let bruta = linhas[i]
            let linha = bruta.trimmingCharacters(in: .whitespaces)

            if linha.isEmpty { i += 1; continue }

            if ehRegra(linha) {
                blocos.append(.regra); i += 1; continue
            }

            if let (nivel, texto) = titulo(linha) {
                blocos.append(.titulo(nivel: nivel, trechos: trechos(de: texto)))
                i += 1; continue
            }

            if linha.hasPrefix("```") {
                let linguagem = String(linha.dropFirst(3)).trimmingCharacters(in: .whitespaces)
                var corpo: [String] = []
                i += 1
                while i < linhas.count, !linhas[i].trimmingCharacters(in: .whitespaces).hasPrefix("```") {
                    corpo.append(linhas[i]); i += 1
                }
                if i < linhas.count { i += 1 }  // fecha a cerca
                blocos.append(.codigo(
                    linguagem: linguagem.isEmpty ? nil : linguagem,
                    texto: corpo.joined(separator: "\n")
                ))
                continue
            }

            if linha.hasPrefix(">") {
                var cru: [String] = []
                while i < linhas.count, linhas[i].trimmingCharacters(in: .whitespaces).hasPrefix(">") {
                    var l = linhas[i].trimmingCharacters(in: .whitespaces)
                    l.removeFirst()
                    cru.append(l.hasPrefix(" ") ? String(l.dropFirst()) : l)
                    i += 1
                }
                blocos.append(citacaoOuCallout(cru))
                continue
            }

            if linha.hasPrefix("|"), i + 1 < linhas.count, ehSeparadorDeTabela(linhas[i + 1]) {
                let cabecalho = celulas(linha).map(trechos(de:))
                i += 2
                var corpo: [[[Trecho]]] = []
                while i < linhas.count, linhas[i].trimmingCharacters(in: .whitespaces).hasPrefix("|") {
                    corpo.append(celulas(linhas[i]).map(trechos(de:)))
                    i += 1
                }
                blocos.append(.tabela(cabecalho: cabecalho, linhas: corpo))
                continue
            }

            if marcadorDeLista(bruta) != nil {
                var itens: [Item] = []
                while i < linhas.count, let item = marcadorDeLista(linhas[i]) {
                    itens.append(item); i += 1
                }
                blocos.append(.lista(itens))
                continue
            }

            // Parágrafo: junta até a linha em branco ou até algo que comece
            // outro bloco.
            var paragrafo: [String] = []
            while i < linhas.count {
                let l = linhas[i].trimmingCharacters(in: .whitespaces)
                if l.isEmpty || ehRegra(l) || titulo(l) != nil || l.hasPrefix(">")
                    || l.hasPrefix("```") || marcadorDeLista(linhas[i]) != nil { break }
                paragrafo.append(l); i += 1
            }
            if !paragrafo.isEmpty {
                blocos.append(.paragrafo(trechos(de: paragrafo.joined(separator: " "))))
            } else {
                i += 1  // nada consumido: não trava o laço
            }
        }

        return blocos
    }

    // MARK: - Reconhecedores de bloco

    private static func ehRegra(_ l: String) -> Bool {
        guard l.count >= 3 else { return false }
        return Set(l) == ["-"] || Set(l) == ["*"] || Set(l) == ["_"]
    }

    private static func titulo(_ l: String) -> (Int, String)? {
        var nivel = 0
        var resto = Substring(l)
        while resto.first == "#", nivel < 6 { nivel += 1; resto = resto.dropFirst() }
        guard nivel > 0, resto.first == " " else { return nil }
        return (nivel, String(resto.dropFirst()))
    }

    private static func ehSeparadorDeTabela(_ l: String) -> Bool {
        let t = l.trimmingCharacters(in: .whitespaces)
        guard t.hasPrefix("|"), t.hasSuffix("|"), t.count > 2 else { return false }
        return t.allSatisfy { "|-: \t".contains($0) } && t.contains("-")
    }

    private static func celulas(_ l: String) -> [String] {
        var t = l.trimmingCharacters(in: .whitespaces)
        if t.hasPrefix("|") { t.removeFirst() }
        if t.hasSuffix("|") { t.removeLast() }
        return t.components(separatedBy: "|").map { $0.trimmingCharacters(in: .whitespaces) }
    }

    private static func marcadorDeLista(_ bruta: String) -> Item? {
        let recuo = bruta.prefix { $0 == " " || $0 == "\t" }.count
        let l = bruta.trimmingCharacters(in: .whitespaces)

        var resto: Substring
        var marca: Marca

        if let ponto = l.firstIndex(of: "."),
           let numero = Int(l[l.startIndex..<ponto]),
           l.index(after: ponto) < l.endIndex,
           l[l.index(after: ponto)] == " " {
            marca = .numero(numero)
            resto = l[l.index(ponto, offsetBy: 2)...]
        } else if l.hasPrefix("- ") || l.hasPrefix("* ") {
            marca = .ponto
            resto = l.dropFirst(2)
        } else if l == "-" || l == "*" {
            // Marcador sem conteúdo: os templates do vault têm vários.
            return Item(recuo: recuo, marca: .vazia, trechos: [])
        } else {
            return nil
        }

        let conteudo = String(resto)
        if conteudo.hasPrefix("[ ] ") || conteudo == "[ ]" {
            marca = .tarefa(feita: false)
            resto = Substring(String(conteudo.dropFirst(min(4, conteudo.count))))
        } else if conteudo.lowercased().hasPrefix("[x] ") || conteudo.lowercased() == "[x]" {
            marca = .tarefa(feita: true)
            resto = Substring(String(conteudo.dropFirst(min(4, conteudo.count))))
        }

        let texto = String(resto).trimmingCharacters(in: .whitespaces)
        if texto.isEmpty, case .ponto = marca {
            return Item(recuo: recuo, marca: .vazia, trechos: [])
        }
        return Item(recuo: recuo, marca: marca, trechos: trechos(de: texto))
    }

    private static func citacaoOuCallout(_ linhas: [String]) -> Bloco {
        guard let primeira = linhas.first,
              primeira.hasPrefix("[!"),
              let fecha = primeira.firstIndex(of: "]")
        else {
            return .citacao(linhas.filter { !$0.isEmpty }.map(trechos(de:)))
        }

        let tipo = String(primeira[primeira.index(primeira.startIndex, offsetBy: 2)..<fecha])
        let apos = primeira[primeira.index(after: fecha)...].trimmingCharacters(in: .whitespaces)
        let corpo = linhas.dropFirst().filter { !$0.isEmpty }.map(trechos(de:))
        return .callout(
            tipo: tipo.lowercased(),
            titulo: apos.isEmpty ? nil : apos,
            corpo: corpo
        )
    }

    // MARK: - Trechos de linha

    /// Varre a linha uma vez, em vez de aplicar substituições em cadeia.
    ///
    /// O gerador do site precisa extrair as crases antes de tudo e devolvê-las
    /// no fim, senão um `**` dentro de código vira negrito. Um scanner não tem
    /// esse problema: ao entrar num trecho de código ele consome até a crase de
    /// fecho e nada mais é interpretado no caminho.
    static func trechos(de linha: String) -> [Trecho] {
        var saida: [Trecho] = []
        var acumulado = ""
        let s = Array(linha)
        var i = 0

        func despejar() {
            if !acumulado.isEmpty { saida.append(.texto(acumulado)); acumulado = "" }
        }

        /// Consome de `i` até `fim`, devolvendo o miolo. `nil` se não fechar —
        /// aí o delimitador era só um caractere comum.
        func ate(_ fim: String, de inicio: Int) -> (String, Int)? {
            let f = Array(fim)
            var j = inicio
            while j + f.count <= s.count {
                if Array(s[j..<(j + f.count)]) == f {
                    return (String(s[inicio..<j]), j + f.count)
                }
                j += 1
            }
            return nil
        }

        while i < s.count {
            let c = s[i]

            if c == "`", let (miolo, prox) = ate("`", de: i + 1) {
                despejar(); saida.append(.codigo(miolo)); i = prox; continue
            }

            if c == "!", i + 2 < s.count, s[i + 1] == "[", s[i + 2] == "[",
               let (miolo, prox) = ate("]]", de: i + 3) {
                despejar()
                let (alvo, alias) = separar(miolo)
                saida.append(.imagem(alvo: alvo, legenda: alias))
                i = prox; continue
            }

            // Wikilink antes do link normal: `[[a|b]]` casaria parcialmente
            // com a regra de `[x](y)`.
            if c == "[", i + 1 < s.count, s[i + 1] == "[",
               let (miolo, prox) = ate("]]", de: i + 2) {
                despejar()
                let (alvo, alias) = separar(miolo)
                saida.append(.wikilink(alvo: alvo, rotulo: alias ?? alvo))
                i = prox; continue
            }

            if c == "[", let (rotulo, aposRotulo) = ate("]", de: i + 1),
               aposRotulo < s.count, s[aposRotulo] == "(",
               let (destino, prox) = ate(")", de: aposRotulo + 1) {
                despejar()
                saida.append(.link(rotulo: rotulo, destino: destino))
                i = prox; continue
            }

            if c == "*", i + 1 < s.count, s[i + 1] == "*",
               let (miolo, prox) = ate("**", de: i + 2), !miolo.isEmpty {
                despejar(); saida.append(.forte(miolo)); i = prox; continue
            }

            if c == "*", let (miolo, prox) = ate("*", de: i + 1),
               !miolo.isEmpty, !miolo.contains("*") {
                despejar(); saida.append(.enfase(miolo)); i = prox; continue
            }

            if c == "~", i + 1 < s.count, s[i + 1] == "~",
               let (miolo, prox) = ate("~~", de: i + 2), !miolo.isEmpty {
                despejar(); saida.append(.riscado(miolo)); i = prox; continue
            }

            acumulado.append(c)
            i += 1
        }

        despejar()
        return saida
    }

    /// `alvo|alias` → (alvo, alias). Sem barra, alias é `nil`.
    private static func separar(_ miolo: String) -> (String, String?) {
        guard let barra = miolo.firstIndex(of: "|") else {
            return (miolo.trimmingCharacters(in: .whitespaces), nil)
        }
        let alvo = String(miolo[miolo.startIndex..<barra]).trimmingCharacters(in: .whitespaces)
        let alias = String(miolo[miolo.index(after: barra)...]).trimmingCharacters(in: .whitespaces)
        return (alvo, alias.isEmpty ? nil : alias)
    }
}
