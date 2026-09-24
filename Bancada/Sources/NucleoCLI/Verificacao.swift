import Foundation
import VaultKit

/// `--verificar [caminho]` — lê o vault e imprime o que encontrou, sem abrir
/// janela.
///
/// Existe por dois motivos práticos: confirmar que a leitura funciona num
/// ambiente sem interface (CI, sessão remota), e dar ao time uma checagem
/// rápida do vault sem precisar do app aberto. É estritamente leitura.
///
/// No CI é o portão antes de publicar: sai com 2 se o vault tem nota fora da
/// convenção, o build falha e o site anterior continua no ar — melhor que
/// publicar um registro que se contradiz.
public enum Verificacao {
    public static func executar(caminho: String?) -> Int32 {
        let raiz = URL(fileURLWithPath: caminho ?? FileManager.default.currentDirectoryPath)
            .standardizedFileURL

        let alvo: URL
        if LeitorDeVault.ehVault(raiz) {
            alvo = raiz
        } else if LeitorDeVault.ehVault(raiz.appendingPathComponent("doc-harness")) {
            alvo = raiz.appendingPathComponent("doc-harness")
        } else {
            FileHandle.standardError.write(Data(
                "✗ \(raiz.path) não é um vault do doc-harness (falta `05 - Registros/` ou `historico/registros/`).\n".utf8
            ))
            return 1
        }

        do {
            let vault = try LeitorDeVault.ler(raiz: alvo)
            imprimir(vault)
            // Desvio da convenção é falha: é o sinal que o modo de verificação
            // existe para dar.
            return vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty ? 0 : 2
        } catch {
            FileHandle.standardError.write(Data("✗ \(error.localizedDescription)\n".utf8))
            return 1
        }
    }

    private static func imprimir(_ vault: Vault) {
        print("Vault: \(vault.raiz.path)\n")

        print("Notas por tipo")
        let porTipo = Dictionary(grouping: vault.notas, by: \.tipo)
        for tipo in TipoNota.allCases {
            let n = porTipo[tipo]?.count ?? 0
            guard n > 0 else { continue }
            let cadeado = tipo.somenteLeitura ? " 🔒" : ""
            print("  \(tipo.rotulo.padded(20)) \(n)\(cadeado)")
        }

        // Andaimes não entram na contagem por tipo, mas também não somem: um
        // template a menos no vault é problema, e só se percebe se ele aparece.
        if !vault.templates.isEmpty {
            print("  \("Templates".padded(20)) \(vault.templates.count) (fora da contagem)")
        }

        print("\nMídia por espécie")
        for especie in Midia.Especie.allCases {
            let n = vault.midias.filter { $0.especie == especie }.count
            guard n > 0 else { continue }
            print("  \(especie.rotulo.padded(20)) \(n)")
        }

        let fatos = vault.fatos
        print("\nFatos: \(fatos.count)")

        for dia in Agrupador.arvore(de: fatos) {
            print("\n  \(dia.rotulo) — \(dia.detalhe)")
            for tipo in dia.filhos ?? [] {
                print("    \(tipo.rotulo) — \(tipo.detalhe)")
                for grupo in tipo.filhos ?? [] {
                    let marca = grupo.ehFolha ? "·" : "▸"
                    print("      \(marca) \(grupo.rotulo.truncado(64))  [\(grupo.detalhe)]")
                }
            }
        }

        if !vault.invalidas.isEmpty {
            print("\n⚠︎ Notas fora da convenção: \(vault.invalidas.count)")
            for i in vault.invalidas { print("  \(i.caminhoRelativo) — \(i.motivo.descricao)") }
        }
        if !vault.fatosNaoReconhecidos.isEmpty {
            print("\n⚠︎ Linhas de registro fora do formato: \(vault.fatosNaoReconhecidos.count)")
            for l in vault.fatosNaoReconhecidos { print("  \(l)") }
        }
        if vault.invalidas.isEmpty && vault.fatosNaoReconhecidos.isEmpty {
            print("\n✓ Vault consistente.")
        }
    }
}

private extension String {
    func padded(_ n: Int) -> String {
        count >= n ? self : self + String(repeating: " ", count: n - count)
    }
    func truncado(_ n: Int) -> String {
        count <= n ? self : String(prefix(n - 1)) + "…"
    }
}
