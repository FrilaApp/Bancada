// swift-tools-version: 5.9
import PackageDescription

// O pacote tem duas metades. A que lê o vault — VaultKit e NucleoCLI — é
// Foundation puro e compila em qualquer lugar. A que desenha — DesignSystem e
// o app — depende de SwiftUI e AppKit, e só existe em Apple.
//
// A separação precisa aparecer aqui, e não só nos imports, porque `swift test`
// constrói **todos** os alvos de teste do pacote: no runner Linux do CI, um
// `DesignSystemTests` declarado seria compilado mesmo ninguém tendo pedido, e
// derrubaria o build inteiro com "no such module 'SwiftUI'".
//
// `Package.swift` é código Swift avaliado na máquina que constrói, então o
// `#if` é resolvido antes de qualquer alvo existir.
#if os(macOS)
let produtosDeInterface: [Product] = [
    .executable(name: "Bancada", targets: ["Bancada"])
]
let alvosDeInterface: [Target] = [
    // O sistema de design é alvo próprio, e não uma pasta dentro do app,
    // por dois motivos: um teste consegue importá-lo e verificar que
    // `Tokens.swift` não divergiu de `tokens.json`, e a fronteira `public`
    // obriga cada componente a declarar a própria API em vez de vazar
    // detalhe interno. Depende de VaultKit porque alguns componentes
    // codificam regra de domínio — `SeloSomenteLeitura` existe por causa
    // de `TipoNota.somenteLeitura`, não por gosto visual.
    .target(
        name: "DesignSystem",
        dependencies: ["VaultKit"],
        path: "Sources/DesignSystem"
    ),
    .executableTarget(
        name: "Bancada",
        dependencies: ["VaultKit", "DesignSystem", "NucleoCLI"],
        path: "Sources/Bancada"
    ),
    .testTarget(
        name: "DesignSystemTests",
        dependencies: ["DesignSystem"],
        path: "Tests/DesignSystemTests"
    )
]
#else
let produtosDeInterface: [Product] = []
let alvosDeInterface: [Target] = []
#endif

let package = Package(
    name: "Bancada",
    platforms: [
        .macOS(.v14)
    ],
    products: produtosDeInterface + [
        // O mesmo `--indice` e `--verificar` do app, num binário sem janela.
        // É o que o CI compila: o alvo `Bancada` importa SwiftUI e AppKit, e os
        // runners que geram o site são Linux.
        .executable(name: "bancada-indice", targets: ["bancada-indice"]),
        .library(name: "VaultKit", targets: ["VaultKit"])
    ],
    targets: alvosDeInterface + [
        // A leitura do vault vive separada da interface: assim o parser é
        // testável sem abrir janela, e o gerador do site pode consumir a
        // mesma lógica no futuro.
        .target(
            name: "VaultKit",
            path: "Sources/VaultKit"
        ),
        // Os modos de linha de comando são biblioteca, e não parte do alvo do
        // app, porque duas superfícies os consomem: o `Bancada.app` e o
        // executável `bancada-indice` do CI. Biblioteca e não executável
        // porque um alvo executável não pode ser dependência de outro.
        // Depende só de VaultKit — é o que mantém o código compilável em Linux.
        .target(
            name: "NucleoCLI",
            dependencies: ["VaultKit"],
            path: "Sources/NucleoCLI"
        ),
        .executableTarget(
            name: "bancada-indice",
            dependencies: ["NucleoCLI"],
            path: "Sources/bancada-indice"
        ),
        .testTarget(
            name: "VaultKitTests",
            dependencies: ["VaultKit"],
            path: "Tests/VaultKitTests",
            resources: [.copy("Fixtures")]
        ),
        .testTarget(
            name: "NucleoCLITests",
            dependencies: ["NucleoCLI", "VaultKit"],
            path: "Tests/NucleoCLITests"
        )
    ]
)
