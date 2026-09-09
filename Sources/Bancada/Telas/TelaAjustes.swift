import SwiftUI
import AppKit
import VaultKit
import DesignSystem

/// Onde o app é configurado e onde o vault é diagnosticado.
///
/// A saúde do vault estava na barra lateral com o mesmo peso do Diário, como se
/// fosse conteúdo — não é: é diagnóstico, e quem olha diagnóstico já está
/// olhando configuração. Aqui as duas coisas ficam juntas: qual pasta está
/// aberta, quando foi lida, e o que dentro dela está fora da convenção.
///
/// Com cinco pessoas escrevendo, desvio acumula. A alternativa — descartar em
/// silêncio o que não parseia — deixaria o vault parecer saudável enquanto
/// apodrece. Aqui o desvio é visível e clicável.
struct TelaAjustes: View {
    @Environment(\.cores) private var cores
    let estado: EstadoDaBancada
    let aoEscolherPasta: () -> Void

    private var vault: Vault? { estado.vault }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                blocoDoVault
                blocoDeAparencia

                if let vault {
                    resumo(vault)

                    if vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty {
                        Bloco(
                            "Vault consistente",
                            simbolo: "checkmark.seal",
                            corDoSimbolo: cores.status(.concluida)
                        ) {
                            Text("Toda nota tem frontmatter com um `tipo` válido, e o log de fatos está no formato dos hooks.")
                                .font(DS.Tipografia.detalhe)
                                .foregroundStyle(cores.textoSutil)
                        }
                    }

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
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    if !vault.fatosNaoReconhecidos.isEmpty {
                        secao("Linhas de registro fora do formato", vault.fatosNaoReconhecidos.count) {
                            Text("O log tem uma porta de escrita só — `scripts/registrar-fato.sh`. Linha fora do formato indica edição manual.")
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
            .padding(DS.Espaco.lg)
        }
    }

    // MARK: - Aparência

    /// O seletor de esquema.
    ///
    /// Três estados, com `Sistema` primeiro e como padrão: a regra da Bancada
    /// continua sendo acompanhar o macOS, e isto é o override. Controle nativo
    /// e não `Pilula` porque aqui a escolha é exclusiva e obrigatória — uma
    /// barra de pílulas comunica filtro, que pode não ter nenhum selecionado —,
    /// e porque é o controle que o macOS usa para esta mesma decisão nas
    /// próprias Ajustes do sistema.
    private var blocoDeAparencia: some View {
        Bloco("Aparência") {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                Picker(
                    "Aparência",
                    selection: Binding(
                        get: { estado.aparencia },
                        set: { estado.aparencia = $0 }
                    )
                ) {
                    ForEach(Aparencia.allCases) { opcao in
                        Label(opcao.rotulo, systemImage: opcao.simbolo).tag(opcao)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()

                // "Sistema" não é autoexplicativo para quem nunca trocou.
                Text(estado.aparencia.nota)
                    .font(DS.Tipografia.detalhe)
                    .foregroundStyle(cores.textoSutil)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    // MARK: - Vault

    private var blocoDoVault: some View {
        Bloco("Vault") {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                if let raiz = estado.raiz {
                    Text(raiz.path)
                        .font(DS.Tipografia.mono)
                        .foregroundStyle(cores.texto)
                        .textSelection(.enabled)
                } else {
                    Text("Nenhuma pasta aberta.")
                        .font(DS.Tipografia.corpo)
                        .foregroundStyle(cores.textoSutil)
                }

                if let erro = estado.erro {
                    // Falha de leitura é erro, não etapa de um fluxo: fala na
                    // voz de perigo, que é a única cor reservada a isso.
                    Text(erro)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.perigo)
                }

                if let ultima = estado.ultimaLeitura {
                    // O conteúdo vem sempre do disco, nunca de cache: o horário
                    // aqui é a prova disso, e o observador o atualiza sozinho.
                    Text("lido às \(ultima.formatted(date: .omitted, time: .standard))")
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.textoSutil)
                        .monospacedDigit()
                }

                HStack(spacing: DS.Espaco.sm) {
                    Button("Escolher vault…", action: aoEscolherPasta)
                    Button("Recarregar") { estado.recarregar() }
                    if let raiz = estado.raiz {
                        Button("Mostrar no Finder") {
                            NSWorkspace.shared.activateFileViewerSelecting([raiz])
                        }
                    }
                }
                .controlSize(.small)
            }
        }
    }

    private func resumo(_ vault: Vault) -> some View {
        let porTipo = Dictionary(grouping: vault.notas, by: \.tipo)
        return Bloco("Conteúdo do vault") {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                ForEach(TipoNota.allCases, id: \.self) { tipo in
                    let n = porTipo[tipo]?.count ?? 0
                    if n > 0 {
                        LinhaDeValor(tipo.rotulo, valor: "\(n)") {
                            if tipo.somenteLeitura {
                                Image(systemName: "lock.fill")
                                    .font(.system(size: 9))
                                    .foregroundStyle(cores.textoSutil)
                            }
                        }
                    }
                }
                Divisor()
                LinhaDeValor("Mídia", valor: "\(vault.midias.count)")
                LinhaDeValor("Fatos registrados", valor: "\(vault.fatos.count)")
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
            corDoSimbolo: cores.status(.revisao)
        ) {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                conteudo()
            }
        }
    }
}
