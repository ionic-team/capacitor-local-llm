package io.ionic.localllm.plugin

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.runBlocking

@CapacitorPlugin(name = "LocalLLM")
class LocalLLMPlugin : Plugin() {
  private var implementation: LocalLLM? = null

    override fun load() {
        super.load()
        implementation = LocalLLM(context)
    }

  @PluginMethod fun systemAvailability(call: PluginCall) {
      runBlocking {
          try {
              val impl = this@LocalLLMPlugin.implementation ?: throw Exception("LocalLLM not initialized")
              call.resolve(JSObject().put("status", impl.availability().value))
          } catch (ex: Exception) {
              call.reject(ex.message)
          }
      }
  }

    @PluginMethod fun download(call: PluginCall) {
        runBlocking {
            try {
                val impl = this@LocalLLMPlugin.implementation ?: throw Exception("LocalLLM not initialized")
                impl.download()
                call.resolve()
            } catch (ex: Exception) {
                call.reject(ex.message)
            }
        }
    }

  @PluginMethod
  fun prompt(call: PluginCall) {
      runBlocking {
          try {
              val options = getLLMPromptOptionsFromCall(call)

              val impl = this@LocalLLMPlugin.implementation ?: throw Exception("LocalLLM not initialized")
              val response = impl.prompt(options)
              call.resolve(JSObject().put("text", response))
          } catch (ex: Exception) {
              call.reject(ex.message)
          }
      }
  }

    @PluginMethod
    fun generateImage(call: PluginCall) {
        runBlocking {
            try {
                val prompt = call.getString("prompt")
                if (prompt == null) {
                    call.reject("prompt is required")
                    return@runBlocking
                }

                val count = call.getInt("count", 1) ?: 1

                val impl = this@LocalLLMPlugin.implementation ?: throw Exception("LocalLLM not initialized")
                val base64Image = impl.generateImage(prompt, count)
                call.resolve(JSObject().put("base64Image", base64Image))
            } catch (ex: Exception) {
                call.reject(ex.message)
            }
        }
    }

    @PluginMethod
    fun endSession(call: PluginCall) {
        try {
            val sessionId = call.getString("sessionId")
            if (sessionId == null) {
                call.reject("sessionId is required")
                return
            }

            val impl = this@LocalLLMPlugin.implementation ?: throw Exception("LocalLLM not initialized")
            impl.endSession(sessionId)
            call.resolve()
        } catch (ex: Exception) {
            call.reject(ex.message)
        }
    }

    private fun getLLMPromptOptionsFromCall(call: PluginCall): LLMPromptOptions {
        return LLMPromptOptions(
            sessionId = call.getString("sessionId"),
            instructions = call.getString("instructions"),
            options = getLLMOptionsFromCall(call),
            prompt = call.getString("prompt")!!
        )
    }

    private fun getLLMOptionsFromCall(call: PluginCall): LLMOptions? {
        val optionsObject = call.getObject("options")

        if (optionsObject!= null) {
            return LLMOptions(
                temperature = optionsObject.optDouble("temperature")?.toFloat(),
                maxOutputTokens =  optionsObject.optInt("maximiumOutputTokens")
            )
        }

        return null
    }
}
