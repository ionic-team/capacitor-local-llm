import Foundation

@objc public class LocalLLM: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
