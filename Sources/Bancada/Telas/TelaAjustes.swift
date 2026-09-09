import SwiftUI
import AppKit
import VaultKit

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

                if let vault {
                    resumo(vault)

                    if vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty {
                        Cartao {
                            HStack(spacing: DS.Espaco.sm) {
                                Image(systemName: "checkmark.seal")
                                    .foregroundStyle(cores.status(.concluida))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Vault consistente").font(DS.Tipografia.secao)
                                    Text("Toda nota tem frontmatter com um `tipo` válido, e o log de fatos está no formato dos hooks.")
                                        .font(DS.Tipografia.detalhe)
                                        .foregroundStyle(cores.textoSutil)
                                }
                                Spacer()
                            }
                            .padding(DS.Espaco.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
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

    // MARK: - Vault

    private var blocoDoVault: some View {
        Cartao {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                Text("Vault").font(DS.Tipografia.secao)

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
                    Text(erro)
                        .font(DS.Tipografia.detalhe)
                        .foregroundStyle(cores.status(.emAndamento))
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
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private func resumo(_ vault: Vault) -> some View {
        let porTipo = Dictionary(grouping: vault.notas, by: \.tipo)
        return Cartao {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                Text("Conteúdo do vault").font(DS.Tipografia.secao)
                ForEach(TipoNota.allCases, id: \.self) { tipo in
                    let n = porTipo[tipo]?.count ?? 0
                    if n > 0 {
                        HStack {
                            Text(tipo.rotulo).font(DS.Tipografia.corpo)
                            if tipo.somenteLeitura {
                                Image(systemName: "lock.fill")
                                    .font(.system(size: 9))
                                    .foregroundStyle(cores.textoSutil)
                            }
                            Spacer()
                            Text("\(n)").font(DS.Tipografia.mono).foregroundStyle(cores.textoSutil)
                        }
                    }
                }
                Divider()
                HStack {
                    Text("Mídia").font(DS.Tipografia.corpo)
                    Spacer()
                    Text("\(vault.midias.count)")
                        .font(DS.Tipografia.mono)
                        .foregroundStyle(cores.textoSutil)
                }
                HStack {
                    Text("Fatos registrados").font(DS.Tipografia.corpo)
                    Spacer()
                    Text("\(vault.fatos.count)")
                        .font(DS.Tipografia.mono)
                        .foregroundStyle(cores.textoSutil)
                }
            }
            .padding(DS.Espaco.md)
        }
    }

    private func secao<C: View>(
        _ titulo: String,
        _ contagem: Int,
        @ViewBuilder conteudo: () -> C
    ) -> some View {
        Cartao {
            VStack(alignment: .leading, spacing: DS.Espaco.sm) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(cores.status(.revisao))
                    Text("\(titulo) — \(contagem)").font(DS.Tipografia.secao)
                }
                conteudo()
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
