import SwiftUI
import Observation
import VaultKit
import DesignSystem

extension Notification.Name {
    static let abrirAjustes = Notification.Name("com.blendops.bancada.abrirAjustes")
}

/// As seções da barra lateral.
///
/// São menos que as telas que existiam antes porque três pares contavam a
/// mesma história por ângulos diferentes: tarefa e registro (o log já cita o ID
/// da tarefa), galeria e documento (a mesma grade, com um painel a mais), e a
/// saúde do vault, que é diagnóstico, não conteúdo. Fundir não tirou nenhuma
/// capacidade — cada uma virou um recorte dentro da seção que a contém.
enum Secao: String, CaseIterable, Identifiable {
    case calendario, trabalho, diario, acervo, onboarding

    var id: String { rawValue }

    static var conteudo: [Secao] { allCases }

    var titulo: String {
        switch self {
        case .calendario: return "Calendário"
        case .trabalho:   return "Trabalho"
        case .diario:     return "Diário"
        case .acervo:     return "Acervo"
        case .onboarding: return "Onboarding"
        }
    }

    var simbolo: String {
        switch self {
        case .calendario: return "calendar"
        case .trabalho:   return "hammer"
        case .diario:     return "calendar.day.timeline.left"
        case .acervo:     return "square.grid.2x2"
        case .onboarding: return "signpost.right.and.left"
        }
    }
}

@Observable
final class EstadoDaBancada {
    private(set) var vault: Vault?
    private(set) var erro: String?
    private(set) var carregando = false
    private(set) var ultimaLeitura: Date?

    var secao: Secao = .trabalho
    var notaSelecionada: String?

    /// Escrever em `Aparencia.preferida` já persiste e aplica — não existe
    /// preferência salva que não esteja em vigor.
    var aparencia: Aparencia = .preferida {
        didSet { Aparencia.preferida = aparencia }
    }

    private var observador: ObservadorDeVault?

    /// A chave em `UserDefaults` guarda apenas o caminho: o conteúdo continua
    /// vindo do disco a cada leitura, nunca de um cache.
    private static let chaveRaiz = "com.blendops.bancada.raiz"

    var raiz: URL? {
        didSet {
            observador?.parar()
            observador = nil
            guard let raiz else { return }
            UserDefaults.standard.set(raiz.path, forKey: Self.chaveRaiz)
            recarregar()
            observarMudancas(em: raiz)
        }
    }

    init() {
        // Ao abrir, tenta a última pasta usada; depois, o irmão `doc-harness`,
        // que é o arranjo real em Challenge18/.
        if let salvo = UserDefaults.standard.string(forKey: Self.chaveRaiz) {
            let url = URL(fileURLWithPath: salvo)
            if LeitorDeVault.ehVault(url) { raiz = url; return }
        }
        if let vizinho = Self.vaultVizinho() { raiz = vizinho }
    }

    /// Procura um `doc-harness` ao lado do app, subindo alguns níveis.
    ///
    /// O ponto de partida é onde o app está, não o diretório de trabalho: um
    /// app aberto pelo Finder herda `/` como cwd, então buscar a partir dele
    /// só funcionava quando a Bancada era lançada pelo terminal. O cwd entra
    /// depois, como último candidato, porque continua sendo o certo para o
    /// binário solto rodado de dentro do repositório.
    ///
    /// Baixado da Release para `~/Downloads` ou `/Applications`, nada disso
    /// casa — e é o esperado: cai no seletor de pasta, uma vez só, e o
    /// caminho fica salvo em `UserDefaults`.
    private static func vaultVizinho() -> URL? {
        // Para um `.app`, `bundleURL` é o próprio bundle; para o executável
        // solto do SwiftPM, é a pasta que o contém.
        let local = Bundle.main.bundleURL
        let origem = local.pathExtension == "app" ? local.deletingLastPathComponent() : local

        var bases: [URL] = []
        var subindo = origem
        for _ in 0...2 {
            bases.append(subindo)
            subindo = subindo.deletingLastPathComponent()
        }
        bases.append(URL(fileURLWithPath: FileManager.default.currentDirectoryPath))

        for base in bases {
            if LeitorDeVault.ehVault(base) { return base }
            let candidato = base.appendingPathComponent("doc-harness")
            if LeitorDeVault.ehVault(candidato) { return candidato }
        }
        return nil
    }

    func recarregar() {
        guard let raiz else { return }
        carregando = true
        defer { carregando = false }
        do {
            vault = try LeitorDeVault.ler(raiz: raiz)
            erro = nil
            ultimaLeitura = .now
        } catch {
            vault = nil
            self.erro = error.localizedDescription
        }
    }

    private func observarMudancas(em raiz: URL) {
        // Os hooks do Git escrevem no vault por fora da Bancada; sem observar,
        // a tela mostraria um estado velho sem nunca avisar.
        let novo = ObservadorDeVault(raiz: raiz) { [weak self] in
            self?.recarregar()
        }
        novo.iniciar()
        observador = novo
    }

    // MARK: - Derivados

    var arvoreDeRegistros: [NoRegistro] {
        guard let vault else { return [] }
        return Agrupador.arvore(de: vault.fatos)
    }

    var tarefas: [Nota] {
        (vault?.tarefas ?? []).sorted { a, b in
            let oa = a.status?.ordem ?? 99
            let ob = b.status?.ordem ?? 99
            if oa != ob { return oa < ob }
            return (a.identificador ?? a.titulo) < (b.identificador ?? b.titulo)
        }
    }

    func midias(especie: Midia.Especie?) -> [Midia] {
        let todas = vault?.midias ?? []
        guard let especie else { return todas }
        return todas.filter { $0.especie == especie }
    }

    var documentos: [Midia] { midias(especie: .pages) }

    var diarios: [Nota] {
        (vault?.notas(tipo: .atualizacaoDiaria) ?? [])
            .sorted { ($0.data ?? "") > ($1.data ?? "") }
    }

    /// Os fatos que citam o ID desta tarefa. Ver `Vinculo`.
    func fatosDaTarefa(_ id: String) -> [Fato] {
        Vinculo.fatos(vault?.fatos ?? [], daTarefa: id)
    }

    /// Quantos fatos não citam tarefa nenhuma — o painel de Trabalho mostra
    /// esse número para que o recorte por tarefa nunca passe por log inteiro.
    var fatosSemTarefa: Int {
        Vinculo.fatosSemTarefa(vault?.fatos ?? []).count
    }

    var diasDoCalendario: [DiaDoCalendario] {
        guard let vault else { return [] }
        return Calendario.porDia(de: vault)
    }
}
