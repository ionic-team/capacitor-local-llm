package io.ionic.localllm.plugin

import com.google.ai.edge.aicore.GenerativeModel
import com.google.ai.edge.aicore.generationConfig

class LocalLLM(context: android.content.Context) {
    fun availability() {

    }

    suspend fun prompt(): String {
        val config = generationConfig {
            context
            temperature = 0.5f
            topK = 16
            maxOutputTokens = 256
        }

        val model = GenerativeModel(config)

        val response = model.generateContent("What is an LLM?")

        return response.text ?: throw Exception("response was empty")
    }
}