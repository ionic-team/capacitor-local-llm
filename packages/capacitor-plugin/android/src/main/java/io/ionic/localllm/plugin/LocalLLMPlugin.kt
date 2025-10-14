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
      try {
          val impl = this.implementation ?: throw Exception("LocalLLM not initialized")
          call.resolve(JSObject().put("status", impl.availability().value))
      } catch (ex: Exception) {
          call.reject(ex.message)
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
