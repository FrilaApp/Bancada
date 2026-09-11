import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// Painel de Ajustes e Configurações do Sistema da Bancada.
///
/// Reúne as configurações operacionais da Bancada, preferências visuais,
/// motor de sincronização em tempo real, integração com automações do ecossistema,
/// geração da superfície estática para mentores/avaliadores e conformidade de integridade.
struct TelaAjustes: View {
    @Environment(\.cores) private var cores
    let estado: EstadoDaBancada
    let aoEscolherPasta: () -> Void

    @State private var gerandoSite = false
    @State private var statusSite: String?

    private var vault: Vault? { estado.vault }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                blocoDeAparencia
                blocoDeSincronizacao
                blocoDoAmbiente
                blocoDeMentores
                blocoDeIntegridade
                blocoSobre
            }
            .padding(DS.Espaco.lg)
        }
    }

    // MARK: - 1. Aparência

    private var blocoDeAparencia: some View {
        Bloco("Aparência", simbolo: "circle.lefthalf.filled", corDoSimbolo: cores.acento) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                SeletorSegmentado(
                    selecao: Binding(
                        get: { estado.aparencia },
                        set: { estado.aparencia = $0 }
                    ),
                    opcoes: Aparencia.allCases.map {
                        .init(valor: $0, rotulo: $0.rotulo, simbolo: $0.simbolo)
                    }
                )

                Text(estado.aparencia.nota)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    // MARK: - 2. Sincronização & Tempo Real

    private var blocoDeSincronizacao: some View {
        Bloco("Sincronização & Tempo Real", simbolo: "bolt.horizontal.circle", corDoSimbolo: cores.status(.concluida)) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                HStack(spacing: DS.Espaco.xs + 2) {
                    Circle()
                        .fill(cores.status(.concluida))
                        .frame(width: 7, height: 7)
                    Text("File Watcher ativo (FSEvents)")
                        .font(DS.Tipografia.corpo)
                        .fontWeight(.medium)
                        .foregroundStyle(cores.texto)
                    Spacer()
                    if let ultima = estado.ultimaLeitura {
                        Text("lido às \(ultima.formatted(date: .omitted, time: .standard))")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                            .monospacedDigit()
                    }
                }

                Text("A Bancada lê o disco diretamente sem cache intermediário. Alterações em notas no Obsidian ou novos fatos registrados via terminal sincronizam instantaneamente.")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)

                HStack(spacing: DS.Espaco.sm) {
                    Button {
                        estado.recarregar()
                    } label: {
                        Label("Reler vault agora", systemImage: "arrow.clockwise")
                    }
                    .controlSize(.small)
                }
            }
        }
    }

    // MARK: - 3. Ambiente & doc-harness

    private var blocoDoAmbiente: some View {
        Bloco("Ambiente & doc-harness", simbolo: "folder.badge.gearshape", corDoSimbolo: cores.acento) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                if let raiz = estado.raiz {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("PASTA DO VAULT ATIVO")
                            .font(DS.Tipografia.rotulo)
                            .foregroundStyle(cores.textoSutil)
                        Text(raiz.path)
                            .font(DS.Tipografia.mono)
                            .foregroundStyle(cores.texto)
                            .textSelection(.enabled)
                            .lineLimit(2)
                            .truncationMode(.middle)
                    }
                } else {
                    Text("Nenhuma pasta aberta.")
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.textoSutil)
                }

                if let erro = estado.erro {
                    Text(erro)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.perigo)
                }

                HStack(spacing: DS.Espaco.sm) {
                    Button("Alterar pasta…", action: aoEscolherPasta)
                    if let raiz = estado.raiz {
                        Button("Revelar no Finder") {
                            NSWorkspace.shared.activateFileViewerSelecting([raiz])
                        }
                    }
                }
                .controlSize(.small)

                Divisor()

                VStack(alignment: .leading, spacing: DS.Espaco.xs) {
                    Text("AUTOMAÇÕES DO ECOSSISTEMA")
                        .font(DS.Tipografia.rotulo)
                        .foregroundStyle(cores.textoSutil)

                    HStack(spacing: DS.Espaco.sm) {
                        Image(systemName: temScriptRegistrar ? "checkmark.circle.fill" : "exclamationmark.circle")
                            .font(DS.Icone.fonte(DS.Icone.micro))
                            .foregroundStyle(temScriptRegistrar ? cores.status(.concluida) : cores.aviso)
                        Text("Git Hook de Fatos (registrar-fato.sh)")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(temScriptRegistrar ? cores.texto : cores.textoSutil)
                    }

                    HStack(spacing: DS.Espaco.sm) {
                        Image(systemName: temScriptExport ? "checkmark.circle.fill" : "exclamationmark.circle")
                            .font(DS.Icone.fonte(DS.Icone.micro))
                            .foregroundStyle(temScriptExport ? cores.status(.concluida) : cores.aviso)
                        Text("Exportador de Documentos Pages (pages-export.sh)")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(temScriptExport ? cores.texto : cores.textoSutil)
                    }
                }
            }
        }
    }

    private var temScriptRegistrar: Bool {
        guard let raiz = estado.raiz else { return false }
        return FileManager.default.fileExists(atPath: raiz.appendingPathComponent("scripts/registrar-fato.sh").path)
    }

    private var temScriptExport: Bool {
        guard let raiz = estado.raiz else { return false }
        return FileManager.default.fileExists(atPath: raiz.appendingPathComponent("scripts/pages-export.sh").path)
    }

    // MARK: - 4. Superfície para Mentores & Avaliadores

    private var blocoDeMentores: some View {
        Bloco("Superfície para Mentores & Banca", simbolo: "person.2.crop.square.stack", corDoSimbolo: cores.tipoDeFato("commit")) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                Text("Gera a versão web estática em HTML puro (sem JavaScript externo) para leitura do histórico e entregáveis por quem não possui a Bancada instalada no macOS.")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)

                HStack(spacing: DS.Espaco.sm) {
                    Button {
                        abrirSite()
                    } label: {
                        Label("Abrir Site Web", systemImage: "safari")
                    }

                    Button {
                        abrirBordo()
                    } label: {
                        Label("Diário de Bordo", systemImage: "doc.richtext")
                    }

                    Button {
                        regenerarSite()
                    } label: {
                        Label(gerandoSite ? "Gerando…" : "Regenerar", systemImage: "arrow.triangle.2.circlepath")
                    }
                    .disabled(gerandoSite)
                }
                .controlSize(.small)

                if let statusSite {
                    Text(statusSite)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(statusSite.contains("Erro") ? cores.perigo : cores.status(.concluida))
                }
            }
        }
    }

    // MARK: - 5. Integridade do Vault

    @ViewBuilder
    private var blocoDeIntegridade: some View {
        if let vault = estado.vault {
            if vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty {
                Bloco("Conformidade do Vault", simbolo: "checkmark.shield.fill", corDoSimbolo: cores.status(.concluida)) {
                    Text("Toda nota possui frontmatter com tipo válido e o log de fatos respeita a convenção estrita dos hooks.")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            } else {
                if !vault.invalidas.isEmpty {
                    secao("Notas fora da convenção", vault.invalidas.count) {
                        ForEach(vault.invalidas) { invalida in
                            Button {
                                NSWorkspace.shared.activateFileViewerSelecting([invalida.url])
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(invalida.caminhoRelativo)
                                        .font(DS.Tipografia.mono)
                                        .foregroundStyle(cores.texto)
                                    Text(invalida.motivo.descricao)
                                        .font(DS.Tipografia.detalhe)
                                        .foregroundStyle(cores.textoSutil)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .buttonStyle(BotaoDoSistema(.peca))
                        }
                    }
                }

                if !vault.fatosNaoReconhecidos.isEmpty {
                    secao("Linhas de registro fora do formato", vault.fatosNaoReconhecidos.count) {
                        Text("O log tem uma porta de escrita só (`registrar-fato.sh`). Linha fora do formato indica edição manual.")
                            .font(DS.Tipografia.detalhe)
                            .foregroundStyle(cores.textoSutil)
                        ForEach(vault.fatosNaoReconhecidos, id: \.self) { linha in
                            Text(linha)
                                .font(DS.Tipografia.mono)
                                .foregroundStyle(cores.texto)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                }
            }
        }
    }

    private func secao<C: View>(
        _ titulo: String,
        _ contagem: Int,
        @ViewBuilder conteudo: () -> C
    ) -> some View {
        Bloco(
            "\(titulo) — \(contagem)",
            simbolo: "exclamationmark.triangle.fill",
            corDoSimbolo: cores.aviso
        ) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                conteudo()
            }
        }
    }

    // MARK: - 6. Sobre o Sistema

    private var blocoSobre: some View {
        Bloco("Sobre o Sistema", simbolo: "info.circle", corDoSimbolo: cores.textoSutil) {
            VStack(alignment: .leading, spacing: DS.Espaco.xs + 2) {
                HStack {
                    Text("Bancada")
                        .font(DS.Tipografia.corpo)
                        .fontWeight(.semibold)
                        .foregroundStyle(cores.texto)
                    Text("v1.0 (Build 1)")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                    Spacer()
                    Text("Challenge 18")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.acento)
                }

                Text("Apple Developer Academy · BlendOps Team")
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)

                Divisor()
                    .padding(.vertical, 2)

                VStack(alignment: .leading, spacing: 2) {
                    Text("ATALHOS")
                        .font(DS.Tipografia.rotulo)
                        .foregroundStyle(cores.textoSutil)
                    Text("⌘, Ajustes · ⌘R Recarregar · ⌘W Fechar janela · ⌘Q Encerrar")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                }
            }
        }
    }

    // MARK: - Ações do Site Estático

    private func raizBancada() -> URL {
        let local = Bundle.main.bundleURL
        return local.pathExtension == "app" ? local.deletingLastPathComponent() : local
    }

    private func abrirSite() {
        let base = raizBancada()
        let candidatos = [
            base.appendingPathComponent("site/index.html"),
            base.appendingPathComponent("Bancada/site/index.html"),
            URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("site/index.html")
        ]
        if let existente = candidatos.first(where: { FileManager.default.fileExists(atPath: $0.path) }) {
            NSWorkspace.shared.open(existente)
        } else {
            regenerarSite()
        }
    }

    private func abrirBordo() {
        let base = raizBancada()
        let candidatos = [
            base.appendingPathComponent("site/bordo.html"),
            base.appendingPathComponent("Bancada/site/bordo.html"),
            URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("site/bordo.html")
        ]
        if let existente = candidatos.first(where: { FileManager.default.fileExists(atPath: $0.path) }) {
            NSWorkspace.shared.open(existente)
        } else {
            regenerarSite()
        }
    }

    private func regenerarSite() {
        guard !gerandoSite else { return }
        gerandoSite = true
        statusSite = "Gerando site estático…"

        DispatchQueue.global(qos: .userInitiated).async {
            let base = raizBancada()
            let script = base.appendingPathComponent("scripts/gerar-site.js").path
            guard FileManager.default.fileExists(atPath: script), let raizVault = estado.raiz?.path else {
                DispatchQueue.main.async {
                    gerandoSite = false
                    statusSite = "Erro: script gerar-site.js ou vault não encontrados."
                }
                return
            }

            let processo = Process()
            processo.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            processo.arguments = ["node", script, raizVault]
            processo.currentDirectoryURL = base
            try? processo.run()
            processo.waitUntilExit()

            let processoUnico = Process()
            processoUnico.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            let bordoPath = base.appendingPathComponent("site/bordo.html").path
            processoUnico.arguments = ["node", script, "--pagina-unica", raizVault, bordoPath]
            processoUnico.currentDirectoryURL = base
            try? processoUnico.run()
            processoUnico.waitUntilExit()

            DispatchQueue.main.async {
                gerandoSite = false
                statusSite = "✓ Site estático e Diário de Bordo atualizados com sucesso!"
            }
        }
    }
}
