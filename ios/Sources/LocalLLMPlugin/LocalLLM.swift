import Foundation
import FoundationModels
import ImageIO
import ImagePlayground
import MobileCoreServices

public enum LLMAvailability: String, Sendable {
  case available = "available"
  case unavailable = "unavailable"
  case notReady = "notready"
  case responding = "responding"
}

public struct LLMOptions: Sendable {
  let temperature: Double?
  let maximumOutputTokens: Int?
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
      case .unavailable:
        return .unavailable
      }
    }

    return .unavailable
  }

  func warmup(sessionId: String, promptPrefix: String?) throws {
    if #available(iOS 26.0, *) {
      let session = getOrCreateSession(sessionId: sessionId, instructions: promptPrefix)

      session.prewarm(promptPrefix: .init(promptPrefix))
    } else {
      throw LocalLLMError.unsupported
    }
  }

  func prompt(options: LLMPromptOptions) async throws -> String {
    if #available(iOS 26.0, *) {
      let session: LanguageModelSession

      if let sessionId = options.sessionId {
        session = getOrCreateSession(sessionId: sessionId, instructions: options.instructions)
      } else {
        // No session ID - create temporary session
        session = LanguageModelSession(instructions: options.instructions)
      }

      if session.isResponding {
        throw LocalLLMError.responseInProgress
      }

      let response = try await session.respond(
        to: options.prompt,
        options: GenerationOptions(
          sampling: nil,
          temperature: options.options?.temperature,
          maximumResponseTokens: options.options?.maximumOutputTokens
        )
      )

      return response.content
    }

    throw LocalLLMError.unsupported
  }

  func endSession(_ sessionId: String) {
    if #available(iOS 26.0, *) {
      sessions[sessionId] = nil
      sessions.removeValue(forKey: sessionId)
    }
  }

  func generateImage(prompt: String, promptImages: [String], variations: Int)
    async throws -> [String]
  {
    if #available(iOS 18.4, *) {
      let creator = try await ImageCreator()
      guard let style = creator.availableStyles.first else {
        throw LocalLLMError.unsupported
      }

      var concept: [ImagePlaygroundConcept] = [
        .text(prompt)
      ]

      promptImages.compactMap { b64 in
        return base64StringToCGImage(base64String: b64)
      }.forEach { image in
        concept.append(.image(image))
      }

      let images = creator.images(for: concept, style: style, limit: variations)

      var imageData: [String] = []

      for try await image in images {
        if let imagePNGData = image.cgImage.toPNGData() {
          imageData.append(imagePNGData.base64EncodedString())
        }
      }

      return imageData
    } else {
      throw LocalLLMError.unsupported
    }
  }
  
  @available(iOS 26.0, *)
  private func getOrCreateSession(sessionId: String, instructions: String? = nil) -> LanguageModelSession {
    if let existingSession = sessions[sessionId] {
      return existingSession
    } else {
      let newSession = LanguageModelSession(instructions: instructions)
      sessions[sessionId] = newSession
      return newSession
    }
  }

  private func base64StringToCGImage(base64String: String) -> CGImage? {
    let cleanedString =
      base64String.components(separatedBy: ",").last ?? base64String

    guard
      let data = Data(
        base64Encoded: cleanedString.trimmingCharacters(
          in: .whitespacesAndNewlines
        )
      )
    else { return nil }

    guard let source = CGImageSourceCreateWithData(data as CFData, nil) else {
      return nil
    }

    return CGImageSourceCreateImageAtIndex(source, 0, nil)
  }
}

extension CGImage {
  func toPNGData() -> Data? {
    let pngData = NSMutableData()

    guard
      let dest = CGImageDestinationCreateWithData(pngData, kUTTypePNG, 1, nil)
    else {
      return nil
    }

    CGImageDestinationAddImage(dest, self, nil)

    if CGImageDestinationFinalize(dest) {
      return pngData as Data
    }

    return nil
  }
}
