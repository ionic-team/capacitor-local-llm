package io.ionic.localllm.plugin

import android.os.Build
import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.prompt.Generation

import com.google.mlkit.genai.prompt.GenerativeModel
import com.google.mlkit.genai.prompt.TextPart
import com.google.mlkit.genai.prompt.generateContentRequest

class LocalLLM(private val context: android.content.Context) {
    val model: GenerativeModel = Generation.getClient()

    suspend fun availability(): LLMAvailability {
        val status = model.checkStatus()
        when (status) {
            FeatureStatus.UNAVAILABLE -> {
                return LLMAvailability.Unavailable
            }

            FeatureStatus.DOWNLOADABLE ->{
                LLMAvailability.NotReady
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

    suspend fun prompt(options: LLMPromptOptions): String {
        val response = model.generateContent(
            generateContentRequest(
                TextPart(options.prompt)
            ) {
                temperature = options.options?.temperature
                topK = 16
                maxOutputTokens = options.options?.maxOutputTokens
            }
        )

        return response.candidates.first().text
    }
}