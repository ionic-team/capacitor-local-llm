import Foundation
import FoundationModels

public enum LLMAvailability: String {
    case available = "available"
    case unsupported = "unsupported"
    case notEnabled = "notEnabled"
    case notReady = "notReady"
    case unavailable = "unavailable"
}

public struct LLMOptions {
    let temperature: Double?
    let maximiumOutputTokens: Int?
}

public struct LLMPromptOptions {
    let sessionId: String?
    let instructions: String?
    let options: LLMOptions?
    let prompt: String
}

public enum LocalLLMError: Error {
    case responseInProgress
    case sessionNotFound
}

public class LocalLLM {
    private var sessions: [String: LanguageModelSession] = [:]
    
    static func availability() -> LLMAvailability {
        let status = SystemLanguageModel.default.availability
        
        switch status {
        case .available:
            return .available
        case .unavailable(.deviceNotEligible):
            return .unsupported
        case .unavailable(.appleIntelligenceNotEnabled):
            return .notEnabled
        case .unavailable(.modelNotReady):
            return .notReady
        case .unavailable(_):
            return .unavailable
        }
    }
    
    func prompt(options: LLMPromptOptions) async throws -> String {
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
    
    func endSession(_ sessionId: String) {
        sessions[sessionId] = nil
    }
}

