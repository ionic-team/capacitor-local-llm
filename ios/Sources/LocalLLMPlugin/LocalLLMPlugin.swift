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

  private func getLLMPromptOptionsFromCall(_ call: CAPPluginCall)
    -> LLMPromptOptions
  {
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
