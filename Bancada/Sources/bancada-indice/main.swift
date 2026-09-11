import Foundation
import NucleoCLI

/// O produtor do índice, sem janela — o mesmo código que o `Bancada.app` roda
/// em `--indice` e `--verificar`, num executável que compila em Linux.
///
/// Existe por causa do CI: o alvo `Bancada` importa `SwiftUI` e `AppKit` no
/// topo do `main.swift`, então o binário do app é macOS-only, e os runners que
/// geram o site são Linux. Em vez de reimplementar o parser em JavaScript — o
/// que faria o site e o app contarem histórias diferentes com o tempo —, o
/// núcleo virou biblioteca e ganhou esta segunda porta de entrada.
///
/// Os dois modos precisam sair pelo mesmo binário porque o CI usa os dois: o
/// `--verificar` como portão, o `--indice` como fonte do site.
let argumentos = CommandLine.arguments.dropFirst()
let caminho = argumentos.first { !$0.hasPrefix("--") }

if argumentos.contains("--ajuda") || argumentos.contains("-h") {
    print("""
    bancada-indice — lê o vault do doc-harness sem abrir janela.

      bancada-indice <vault>              emite o índice como JSON (padrão)
      bancada-indice --verificar <vault>  imprime o resumo; sai 2 se inconsistente

    Sem <vault>, usa o diretório atual — ou uma pasta `doc-harness` dentro dele.
    """)
    exit(0)
}

exit(argumentos.contains("--verificar")
     ? Verificacao.executar(caminho: caminho)
     : Indice.executar(caminho: caminho))
