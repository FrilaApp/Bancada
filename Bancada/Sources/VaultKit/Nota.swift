import Foundation

/// Os `tipo:` válidos, tal como o `CLAUDE.md` do doc-harness os define.
/// É um enum fechado de propósito: um tipo desconhecido é sinal de nota fora
/// da convenção, e o vault inteiro depende da convenção ser respeitada.
public enum TipoNota: String, CaseIterable, Codable, Sendable {
    case home
    case indice
    case cblDesafio = "cbl-desafio"
    case atualizacaoDiaria = "atualizacao-diaria"
    case roadmap
    case tarefa
    case registro
    case documentoDerivado = "documento-derivado"
    /// Especificação do sistema de design. Escrita à mão, como a narrativa,
    /// mas não é narrativa de um dia: é a regra que app e site seguem. Ganhou
    /// tipo próprio para não entrar no vault como nota fora da convenção — um
    /// alerta permanente na tela de Ajustes treina a equipe a ignorá-la.
    case design
    /// O cronograma oficial do desafio, publicado pela Academy. Não é fato do
    /// vault (não veio de commit) nem narrativa do dia (não é reflexão sobre o
    /// que já aconteceu) — é a terceira coisa: compromisso externo com data já
    /// marcada. Ver `LeitorDeAgenda`.
    case agenda

    public var rotulo: String {
        switch self {
        case .home: return "Início"
        case .indice: return "Índice"
        case .cblDesafio: return "Desafio CBL"
        case .atualizacaoDiaria: return "Atualização Diária"
        case .roadmap: return "Roadmap"
        case .tarefa: return "Tarefa"
        case .registro: return "Registro"
        case .documentoDerivado: return "Documento derivado"
        case .design: return "Design"
        case .agenda: return "Agenda"
        }
    }

    /// A regra do vault virada tipo: registros são escritos só pelos hooks e
    /// derivados são regenerados a partir do `.pages`. Editar qualquer um dos
    /// dois perde trabalho — então nenhum caminho de escrita da Bancada os
    /// alcança. Ver `Nota.editavel`.
    public var somenteLeitura: Bool {
        self == .registro || self == .documentoDerivado
    }
}

public enum StatusTarefa: String, CaseIterable, Codable, Sendable {
    case aFazer = "a-fazer"
    case emAndamento = "em-andamento"
    case revisao
    case concluida

    public var rotulo: String {
        switch self {
        case .aFazer: return "A fazer"
        case .emAndamento: return "Em andamento"
        case .revisao: return "Revisão"
        case .concluida: return "Concluída"
        }
    }

    /// Ordem do quadro, da esquerda para a direita.
    public var ordem: Int {
        switch self {
        case .aFazer: return 0
        case .emAndamento: return 1
        case .revisao: return 2
        case .concluida: return 3
        }
    }
}

public enum StatusDesafio: String, CaseIterable, Codable, Sendable {
    case ativo, concluido, pausado
}

/// Uma nota do vault, já parseada.
public struct Nota: Identifiable, Equatable {
    /// Caminho relativo à raiz do vault, com extensão — a mesma forma usada
    /// nos wikilinks do vault (`04 - Tarefas/T-0001.md`).
    public let caminhoRelativo: String
    public let url: URL
    public let tipo: TipoNota
    public let frontmatter: Frontmatter
    public let corpo: String
    public let modificadoEm: Date

    public var id: String { caminhoRelativo }

    public var titulo: String {
        // O H1 manda, porque é o que a pessoa vê no Obsidian; o nome do
        // arquivo é o fallback.
        for linha in corpo.components(separatedBy: "\n") {
            let limpa = linha.trimmingCharacters(in: .whitespaces)
            if limpa.hasPrefix("# ") {
                return String(limpa.dropFirst(2)).trimmingCharacters(in: .whitespaces)
            }
        }
        return url.deletingPathExtension().lastPathComponent
    }

    public var editavel: Bool { !tipo.somenteLeitura }

    // Campos de tarefa
    public var identificador: String? { frontmatter["id"] }
    public var status: StatusTarefa? { frontmatter["status"].flatMap(StatusTarefa.init) }
    public var responsavel: String? { frontmatter["responsavel"] }
    public var desafio: String? { frontmatter["desafio"] }
    public var dataCriacao: String? { frontmatter["data_criacao"] }
    /// Data do registro ou da atualização diária, no formato ISO do vault.
    public var data: String? { frontmatter["data"] }

    public init(
        caminhoRelativo: String,
        url: URL,
        tipo: TipoNota,
        frontmatter: Frontmatter,
        corpo: String,
        modificadoEm: Date
    ) {
        self.caminhoRelativo = caminhoRelativo
        self.url = url
        self.tipo = tipo
        self.frontmatter = frontmatter
        self.corpo = corpo
        self.modificadoEm = modificadoEm
    }
}

/// Nota que existe no disco mas não cumpre a convenção.
///
/// Não é descartada em silêncio: aparece numa lista na Bancada. Um vault com
/// cinco autores acumula desvio, e desvio invisível é o que corrói a
/// confiança no registro.
public struct NotaInvalida: Identifiable, Equatable {
    public enum Motivo: Equatable {
        case semFrontmatter
        case semTipo
        case tipoDesconhecido(String)

        public var descricao: String {
            switch self {
            case .semFrontmatter: return "sem bloco de frontmatter"
            case .semTipo: return "frontmatter sem a chave `tipo`"
            case .tipoDesconhecido(let t): return "tipo desconhecido: `\(t)`"
            }
        }
    }

    public let caminhoRelativo: String
    public let url: URL
    public let motivo: Motivo

    public var id: String { caminhoRelativo }
}
