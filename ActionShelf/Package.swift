// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ActionShelf",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "ActionShelf", targets: ["ActionShelf"])
    ],
    targets: [
        .executableTarget(
            name: "ActionShelf",
            path: "Sources/ActionShelf"
        )
    ]
)
