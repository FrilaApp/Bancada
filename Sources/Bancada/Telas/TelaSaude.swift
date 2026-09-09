import SwiftUI
import AppKit
import VaultKit

/// O que está fora da convenção do vault.
///
/// Com cinco pessoas escrevendo, desvio acumula. A alternativa — descartar em
/// silêncio o que não parseia — deixaria o vault parecer saudável enquanto
/// apodrece. Aqui o desvio é visível e clicável.
struct TelaSaude: View {
    @Environment(\.cores) private var cores
    let vault: Vault?

    var body: some View {
        guard let vault else {
            return AnyView(Vazio(simbolo: "questionmark.folder", titulo: "Nenhum vault aberto"))
        }

        let tudoCerto = vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty

        return AnyView(
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Espaco.lg) {
                    resumo(vault)

                    if tudoCerto {
                        Vazio(
                            simbolo: "checkmark.seal",
                            titulo: "Vault consistente",
                            detalhe: "Toda nota tem frontmatter com um `tipo` válido, e o log de fatos está no formato dos hooks."
                        )
                        .frame(height: 180)
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
                .padding(DS.Espaco.lg)
            }
        )
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
                        .foregroundStyle(DS.Cor.status(.revisao).resolver(.light))
                    Text("\(titulo) — \(contagem)").font(DS.Tipografia.secao)
                }
                conteudo()
            }
            .padding(DS.Espaco.md)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
