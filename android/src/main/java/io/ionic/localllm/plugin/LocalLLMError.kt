package io.ionic.localllm.plugin

sealed class LocalLLMError(message: String) : Exception(message) {
    class Uninitialized : LocalLLMError("LocalLLM not initialized")
    class ResponseInProgress : LocalLLMError("Response is already in progress")
    class SessionNotFound : LocalLLMError("Session not found")
    class Unsupported : LocalLLMError("Gemini Nano is not supported on this device")
    data class Unavailable(val reason: String) : LocalLLMError("Gemini Nano is currently unavailable: $reason")
}