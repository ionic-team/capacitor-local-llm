// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorLocalLlm",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorLocalLlm",
            targets: ["LocalLLMPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
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
