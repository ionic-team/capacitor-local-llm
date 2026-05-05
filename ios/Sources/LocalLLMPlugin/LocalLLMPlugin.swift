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
        CAPPluginMethod(name: "warmup", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "prompt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endSession", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "generateImage", returnType: CAPPluginReturnPromise)
    ]

    private let implementation = LocalLLM()
    private var availabilityPollingTask: Task<Void, Never>?

    @objc override public func addListener(_ call: CAPPluginCall) {
        super.addListener(call)
        if call.getString("eventName") == "systemAvailabilityChange" {
            startAvailabilityPolling()
        }
    }

    @objc override public func removeAllListeners(_ call: CAPPluginCall) {
        super.removeAllListeners(call)
        stopAvailabilityPolling()
    }

    private func startAvailabilityPolling() {
        guard availabilityPollingTask == nil else { return }
        availabilityPollingTask = Task {
            var lastAvailability: LLMAvailability?
            while !Task.isCancelled {
                let current = LocalLLM.availability()
                if current != lastAvailability {
                    lastAvailability = current
                    notifyListeners("systemAvailabilityChange", data: ["status": current.rawValue])
                }
                try? await Task.sleep(nanoseconds: 2_000_000_000)
            }
        }
    }

    private func stopAvailabilityPolling() {
        availabilityPollingTask?.cancel()
        availabilityPollingTask = nil
    }

    @objc func systemAvailability(_ call: CAPPluginCall) {
        call.resolve([
            "status": LocalLLM.availability().rawValue
        ])
    }

    private func rejectCall(_ call: CAPPluginCall, _ error: Error) {
        if let llmError = error as? LocalLLMError {
            call.reject(llmError.errorDescription ?? "Unknown error", llmError.errorCode)
        } else {
            call.reject(error.localizedDescription, "LOCAL_LLM_UNKNOWN_ERROR")
        }
    }

    @objc func warmup(_ call: CAPPluginCall) {
        do {
            guard let sessionId = call.getString("sessionId") else {
                throw LocalLLMError.missingParameter("sessionId")
            }

            let promptPrefix = call.getString("promptPrefix")

            try implementation.warmup(
                sessionId: sessionId,
                promptPrefix: promptPrefix
            )

            call.resolve()
        } catch {
            rejectCall(call, error)
        }
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
                self.rejectCall(call, error)
            }
        }
    }

    @objc func endSession(_ call: CAPPluginCall) {
        do {
            guard let sessionId = call.getString("sessionId") else {
                throw LocalLLMError.missingParameter("sessionId")
            }

            implementation.endSession(sessionId)
            call.resolve()
        } catch {
            rejectCall(call, error)
        }
    }

    @objc func generateImage(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            rejectCall(call, LocalLLMError.missingParameter("prompt"))
            return
        }
        let count = call.getInt("count", 1)
        let promptImages: [String] =
            call.getArray("promptImages")?.compactMap({ val in
                return val as? String
            }) ?? []

        generateImageAsyncCallback(
            prompt: prompt,
            promptImages: promptImages,
            count: count,
            ) { result in
            switch result {
            case .success(let base64Images):
                call.resolve([
                    "pngBase64Images": base64Images
                ])
            case .failure(let error):
                self.rejectCall(call, error)
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
        promptImages: [String],
        count: Int,
        completion: @escaping @Sendable (Result<[String], Error>) -> Void
    ) {
        Task {
            do {
                let images = try await implementation.generateImage(
                    prompt: prompt,
                    promptImages: promptImages,
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
            maximumOutputTokens: optionsObject["maximumOutputTokens"] as? Int,
            )
    }
}
