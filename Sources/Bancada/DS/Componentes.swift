import SwiftUI
import VaultKit

/// Etiqueta de status de tarefa.
struct Etiqueta: View {
    @Environment(\.cores) private var cores
    let texto: String
    let cor: Color

    var body: some View {
        Text(texto)
            .font(DS.Tipografia.detalhe)
            .padding(.horizontal, DS.Espaco.sm)
            .padding(.vertical, 3)
            .background(cor.opacity(0.14), in: Capsule())
            .foregroundStyle(cor)
    }
}

/// Marcador colorido do tipo de fato, com largura fixa para os rótulos
/// alinharem verticalmente na árvore de registros.
struct MarcadorDeTipo: View {
    let tipo: String

    var body: some View {
        Text(tipo)
            .font(DS.Tipografia.mono)
            .foregroundStyle(DS.Cor.tipoDeFato(tipo))
            .frame(width: 58, alignment: .leading)
    }
}

/// Cartão padrão — usado pela galeria e pelos painéis de detalhe.
struct Cartao<Conteudo: View>: View {
    @Environment(\.cores) private var cores
    @ViewBuilder var conteudo: Conteudo

    var body: some View {
        conteudo
            .background(cores.superficie, in: RoundedRectangle(cornerRadius: DS.Raio.md))
            .overlay(
                RoundedRectangle(cornerRadius: DS.Raio.md)
                    .strokeBorder(cores.borda, lineWidth: 1)
            )
    }
}

/// Estado vazio com voz própria.
///
/// O `CLAUDE.md` do doc-harness é explícito: "um dia sem registro é um dado,
/// não um problema a esconder". A interface segue a mesma regra — diz que
/// está vazio, sem se desculpar nem inventar conteúdo de exemplo.
struct Vazio: View {
    @Environment(\.cores) private var cores
    let simbolo: String
    let titulo: String
    var detalhe: String? = nil

    var body: some View {
        VStack(spacing: DS.Espaco.sm) {
            Image(systemName: simbolo)
                .font(.system(size: 28, weight: .light))
                .foregroundStyle(cores.textoSutil)
            Text(titulo)
                .font(DS.Tipografia.secao)
                .foregroundStyle(cores.texto)
            if let detalhe {
                Text(detalhe)
                    .font(DS.Tipografia.corpo)
                    .foregroundStyle(cores.textoSutil)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: 320)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// Aviso de que a nota não pode ser editada aqui.
///
/// Não é decoração: registros são escritos só pelos hooks e derivados são
/// regenerados a partir do `.pages`. A Bancada não tem caminho de escrita para
/// nenhum dos dois (ver `TipoNota.somenteLeitura`) — este selo explica por quê.
struct SeloSomenteLeitura: View {
    @Environment(\.cores) private var cores
    let tipo: TipoNota

    private var motivo: String {
        switch tipo {
        case .registro:
            return "Log de fatos — escrito pelos hooks do Git, via scripts/registrar-fato.sh."
        case .documentoDerivado:
            return "Derivado de um .pages — regenerado a cada conversão. Edite o .pages original."
        default:
            return ""
        }
    }

    var body: some View {
        HStack(spacing: DS.Espaco.sm) {
            Image(systemName: "lock.fill")
            Text(motivo)
        }
        .font(DS.Tipografia.detalhe)
        .foregroundStyle(cores.textoSutil)
        .padding(DS.Espaco.sm)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cores.superficieSutil, in: RoundedRectangle(cornerRadius: DS.Raio.sm))
    }
}
