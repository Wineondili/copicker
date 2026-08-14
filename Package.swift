// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "CodexModelRail",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .library(
            name: "CodexModelRailCore",
            targets: ["CodexModelRailCore"]
        ),
        .executable(
            name: "CodexModelRailInjector",
            targets: ["CodexModelRailInjector"]
        ),
    ],
    targets: [
        .target(name: "CodexModelRailCore"),
        .executableTarget(
            name: "CodexModelRailInjector",
            dependencies: ["CodexModelRailCore"],
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "CodexModelRailCoreTests",
            dependencies: ["CodexModelRailCore"]
        ),
    ]
)

