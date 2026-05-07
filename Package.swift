// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "CapacitorLocalLlm",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorLocalLlm",
            targets: ["LocalLLMPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "LocalLLMPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/LocalLLMPlugin"),
        .testTarget(
            name: "LocalLLMPluginTests",
            dependencies: ["LocalLLMPlugin"],
            path: "ios/Tests/LocalLLMPluginTests")
    ]
)
