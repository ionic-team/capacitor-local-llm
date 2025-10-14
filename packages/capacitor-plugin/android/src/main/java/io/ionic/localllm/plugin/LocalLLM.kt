package io.ionic.localllm.plugin

import android.os.Build
import com.google.ai.edge.aicore.GenerativeModel
import com.google.ai.edge.aicore.generationConfig

class LocalLLM(private val context: android.content.Context) {
    fun availability(): LLMAvailability {
        // this can only run on Google Pixel 8 Pro and greater
        // with the experimental AI Core for now
        val make = Build.MANUFACTURER
        val model = Build.MODEL

        val supportedModels = listOf(
            "Pixel 10 Pro",
            "Pixel 9 Pro",
            "Pixel 8 Pro",
        )

        if (make == "Google" && supportedModels.contains(model)) {
            return LLMAvailability.Available
        }

        return LLMAvailability.Unavailable
    }

    suspend fun prompt(options: LLMPromptOptions): String {
        val config = generationConfig {
            context = this@LocalLLM.context
            temperature = options.options?.temperature
            topK = 16
            maxOutputTokens = options.options?.maxOutputTokens
        }

        val model = GenerativeModel(config)

        val response = model.generateContent(options.prompt)

        return response.text ?: throw Exception("response was empty")
    }
}