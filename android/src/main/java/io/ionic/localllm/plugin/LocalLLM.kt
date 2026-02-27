package io.ionic.localllm.plugin

import android.os.Build
import com.getcapacitor.Logger
import com.google.mlkit.genai.common.DownloadStatus
import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.prompt.Generation

import com.google.mlkit.genai.prompt.GenerativeModel
import com.google.mlkit.genai.prompt.TextPart
import com.google.mlkit.genai.prompt.generateContentRequest

data class ChatSession(
    val instructions: String?,
    val history: MutableList<Pair<String, String>> = mutableListOf()
)

class LocalLLM(private val context: android.content.Context) {
    val model: GenerativeModel = Generation.getClient()
    private val sessions: MutableMap<String, ChatSession> = mutableMapOf()

    suspend fun availability(): LLMAvailability {
        val status = model.checkStatus()
        when (status) {
            FeatureStatus.UNAVAILABLE -> {
                return LLMAvailability.Unavailable
            }
            FeatureStatus.DOWNLOADABLE ->{
                return LLMAvailability.Downloadable
            }
            FeatureStatus.DOWNLOADING -> {
                return LLMAvailability.NotReady
            }
            FeatureStatus.AVAILABLE -> {
                return LLMAvailability.Available
            }
        }

        return LLMAvailability.Unavailable
    }

    suspend fun download() {
        model.download().collect { status ->
            when(status) {
                is DownloadStatus.DownloadStarted ->
                    Logger.debug("LocalLLM", "Gemini Nano download started")
                is DownloadStatus.DownloadProgress ->
                    Logger.debug("LocalLLM", "Gemini Nano ${status.totalBytesDownloaded} bytes downloaded")
                is DownloadStatus.DownloadCompleted ->
                    Logger.debug("LocalLLM", "Gemini Nano download completed")
                is DownloadStatus.DownloadFailed ->
                    Logger.debug("LocalLLM", "Gemini Nano download failed: ${status.e.message}")
            }
        }
    }

    suspend fun prompt(options: LLMPromptOptions): String {
        val sessionId = options.sessionId

        val fullPrompt = if (sessionId != null) {
            val session = sessions.getOrPut(sessionId) {
                ChatSession(instructions = options.instructions)
            }

            buildString {
                if (session.instructions != null) {
                    appendLine(session.instructions)
                    appendLine()
                }

                for ((userMsg, assistantMsg) in session.history) {
                    appendLine("User: $userMsg")
                    appendLine("Assistant: $assistantMsg")
                    appendLine()
                }

                append("User: ${options.prompt}")
            }
        } else {
            if (options.instructions != null) {
                "${options.instructions}\n\n${options.prompt}"
            } else {
                options.prompt
            }
        }

        val response = model.generateContent(
            generateContentRequest(
                TextPart(fullPrompt)
            ) {
                temperature = options.options?.temperature
                topK = 16
                maxOutputTokens = options.options?.maxOutputTokens
            }
        )

        val responseText = response.candidates.first().text

        if (sessionId != null) {
            sessions[sessionId]?.history?.add(Pair(options.prompt, responseText))
        }

        return responseText
    }

    fun endSession(sessionId: String) {
        sessions.remove(sessionId)
    }
}
