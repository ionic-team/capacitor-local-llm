@preconcurrency import Capacitor
import Foundation

@objc(LocalLLMPlugin)
@preconcurrency
public class LocalLLMPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LocalLLMPlugin"
    public let jsName = "LocalLLM"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(
            name: "systemAvailability",
            returnType: CAPPluginReturnPromise
        ),
        CAPPluginMethod(name: "prompt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "generateImage", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = LocalLLM()

    @objc func systemAvailability(_ call: CAPPluginCall) {
        call.resolve([
            "status": LocalLLM.availability().rawValue
        ])
    }

    @objc func prompt(_ call: CAPPluginCall) {
        let options = getLLMPromptOptionsFromCall(call)

        promptAsyncCallback(options: options) { result in
            switch result {
            case .success(let responseText):
                call.resolve([
                    "text": responseText
                ])
            case .failure(let error):
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func endSession(_ call: CAPPluginCall) {
        guard let sessionId = call.getString("sessionId") else {
            call.reject("sessionId is required")
            return
        }

        implementation.endSession(sessionId)
        call.resolve()
    }

    @objc func generateImage(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            call.reject("prompt is required")
            return
        }
        let count = call.getInt("count", 1)

        generateImageAsyncCallback(
            prompt: prompt,
            count: count,
        ) { result in
            switch result {
            case .success(let base64Images):
                call.resolve([
                    "pngBase64Images": base64Images
                ])
            case .failure(let error):
                call.reject(error.localizedDescription)
            }
        }
    }

    private func promptAsyncCallback(
        options: LLMPromptOptions,
        completion: @escaping @Sendable (Result<String, Error>) -> Void
    ) {
        Task {
            do {
                let responseText = try await implementation.prompt(options: options)
                completion(.success(responseText))
            } catch {
                completion(.failure(error))
            }
        }
    }

    private func generateImageAsyncCallback(
        prompt: String,
        count: Int,
        completion: @escaping @Sendable (Result<[String], Error>) -> Void
    ) {
        Task {
            do {
                let images = try await implementation.generateImage(
                    prompt: prompt,
                    variations: count
                )
                completion(.success(images))
            } catch {
                completion(.failure(error))
            }
        }
    }

    private func getLLMPromptOptionsFromCall(_ call: CAPPluginCall)
    -> LLMPromptOptions {
        return LLMPromptOptions(
            sessionId: call.getString("sessionId"),
            instructions: call.getString("instructions"),
            options: getLLMOptionsFromCall(call),
            prompt: call.getString("prompt", "")
        )
    }

    private func getLLMOptionsFromCall(_ call: CAPPluginCall) -> LLMOptions? {
        guard let optionsObject = call.getObject("options") else {
            return nil
        }

        return LLMOptions(
            temperature: optionsObject["temperature"] as? Double,
            maximiumOutputTokens: optionsObject["maximiumOutputTokens"] as? Int,
            )
    }
}
