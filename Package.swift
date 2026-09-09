// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Bancada",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "Bancada", targets: ["Bancada"]),
        .library(name: "VaultKit", targets: ["VaultKit"])
    ],
    targets: [
        // A leitura do vault vive separada da interface: assim o parser é
        // testável sem abrir janela, e o gerador do site pode consumir a
        // mesma lógica no futuro.
        .target(
            name: "VaultKit",
            path: "Sources/VaultKit"
        ),
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
            dependencies: ["VaultKit", "DesignSystem"],
            path: "Sources/Bancada"
        ),
        .testTarget(
            name: "VaultKitTests",
            dependencies: ["VaultKit"],
            path: "Tests/VaultKitTests",
            resources: [.copy("Fixtures")]
        ),
        .testTarget(
            name: "DesignSystemTests",
            dependencies: ["DesignSystem"],
            path: "Tests/DesignSystemTests"
        )
    ]
)
