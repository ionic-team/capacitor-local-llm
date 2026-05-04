package io.ionic.localllm.plugin

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

@CapacitorPlugin(name = "LocalLLM")
class LocalLLMPlugin : Plugin() {
  private var implementation: LocalLLM? = null
  private val pollingScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
  private var availabilityPollingJob: Job? = null

    override fun load() {
        super.load()
        implementation = LocalLLM(context)
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    override fun addListener(call: PluginCall) {
        super.addListener(call)
        if (call.getString("eventName") == "systemAvailabilityChange") {
            startAvailabilityPolling()
        }
    }

    @PluginMethod
    override fun removeAllListeners(call: PluginCall) {
        super.removeAllListeners(call)
        stopAvailabilityPolling()
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        availabilityPollingJob?.cancel()
    }

    private fun startAvailabilityPolling() {
        if (availabilityPollingJob?.isActive == true) return
        availabilityPollingJob = pollingScope.launch {
            var lastAvailability: LLMAvailability? = null
            while (isActive) {
                val impl = implementation ?: break
                val current = impl.availability()
                if (current != lastAvailability) {
                    lastAvailability = current
                    notifyListeners("systemAvailabilityChange", JSObject().put("status", current.value))
                }
                delay(2000)
            }
        }
    }

    private fun stopAvailabilityPolling() {
        availabilityPollingJob?.cancel()
        availabilityPollingJob = null
    }

  @PluginMethod fun systemAvailability(call: PluginCall) {
      runBlocking {
          try {
              val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
              call.resolve(JSObject().put("status", impl.availability().value))
          } catch (ex: Exception) {
              call.reject(ex.message)
          }
      }
  }

    @PluginMethod fun download(call: PluginCall) {
        runBlocking {
            try {
                val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
                impl.download()
                call.resolve()
            } catch (ex: Exception) {
                call.reject(ex.message)
            }
        }
    }

    @PluginMethod
    fun warmup(call: PluginCall) {
        runBlocking {
            try {
                var impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
                impl.warmup()
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

              val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
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

                val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
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

            val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
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
                maxOutputTokens =  optionsObject.optInt("maximumOutputTokens").coerceIn(1, 256)
            )
        }

        return null
    }
}
