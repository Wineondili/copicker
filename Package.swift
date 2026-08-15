// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Copicker",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .library(
            name: "CopickerCore",
            targets: ["CopickerCore"]
        ),
        .executable(
            name: "copicker",
            targets: ["CopickerCLI"]
        ),
    ],
    targets: [
        .target(name: "CopickerCore"),
        .executableTarget(
            name: "CopickerCLI",
            dependencies: ["CopickerCore"],
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "CopickerCoreTests",
            dependencies: ["CopickerCore"]
        ),
    ]
)
