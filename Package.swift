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
        .executableTarget(
            name: "Bancada",
            dependencies: ["VaultKit"],
            path: "Sources/Bancada"
        ),
        .testTarget(
            name: "VaultKitTests",
            dependencies: ["VaultKit"],
            path: "Tests/VaultKitTests",
            resources: [.copy("Fixtures")]
        )
    ]
)
