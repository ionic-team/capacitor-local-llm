import Foundation
import FoundationModels

public enum LLMAvailability: String, Sendable {
  case available = "available"
  case unavailable = "unavailable"
  case notReady = "notready"
  case responding = "responding"
}

public struct LLMOptions: Sendable {
  let temperature: Double?
  let maximiumOutputTokens: Int?
}

public struct LLMPromptOptions: Sendable {
  let sessionId: String?
  let instructions: String?
  let options: LLMOptions?
  let prompt: String
}

public enum LocalLLMError: Error {
  case responseInProgress
  case sessionNotFound
  case unsupported
}

public class LocalLLM {
  private var _sessions: Any?
  
  @available(iOS 26.0, *)
  private var sessions: [String: LanguageModelSession] {
    get { _sessions as? [String: LanguageModelSession] ?? [:] }
    set { _sessions = newValue }
  }
  

  static func availability() -> LLMAvailability {
    if #available(iOS 26.0, *) {
      let status = SystemLanguageModel.default.availability
      
      switch status {
      case .available:
        return .available
      case .unavailable(.deviceNotEligible):
        return .unavailable
      case .unavailable(.appleIntelligenceNotEnabled):
        return .unavailable
      case .unavailable(.modelNotReady):
        return .notReady
      case .unavailable(_):
        return .unavailable
      }
    }
    
    return .unavailable
  }

  func prompt(options: LLMPromptOptions) async throws -> String {
    if #available(iOS 26.0, *) {
      var session: LanguageModelSession?
      
      if let sessionId = options.sessionId {
        session = sessions[sessionId]
      } else {
        session = LanguageModelSession(instructions: options.instructions)
      }
      
      guard let session = session else {
        throw LocalLLMError.sessionNotFound
      }
      
      if session.isResponding {
        throw LocalLLMError.responseInProgress
      }
      
      let response = try await session.respond(to: options.prompt)
      
      return response.content
    }
    
    throw LocalLLMError.unsupported
  }

  func endSession(_ sessionId: String) {
    if #available(iOS 26.0, *) {
      sessions[sessionId] = nil
    }
  }
}
