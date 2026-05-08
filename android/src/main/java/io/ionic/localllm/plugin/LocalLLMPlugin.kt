package io.ionic.localllm.plugin

import com.getcapacitor.JSObject
import com.getcapacitor.Logger
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
    private var forceAvailabilityListenerUpdate = false
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun load() {
        super.load()
        implementation = LocalLLM()
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
        if (availabilityPollingJob?.isActive == true) {
            // set this to true to allow notifying newly added listener in web at least once
            //  otherwise, if lastAvailability doesn't change, the new listener would never receive data.
            forceAvailabilityListenerUpdate = true
            return
        }
        availabilityPollingJob = pollingScope.launch {
            var lastAvailability: LLMAvailability? = null
            while (isActive) {
                val impl = implementation
                if (impl == null) {
                    delay(1000)
                    continue
                }
                var current = LLMAvailability.Unavailable
                try {
                    current = impl.availability()
                } catch (ex: Exception) {
                    Logger.warn("LocalLLMPlugin", "Failed to retrieve LLM availability ${ex.localizedMessage}")
                }
                if (current != lastAvailability || forceAvailabilityListenerUpdate) {
                    lastAvailability = current
                    forceAvailabilityListenerUpdate = false
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

  private fun PluginCall.rejectWithError(ex: Exception) {
      reject(ex.message, (ex as? LocalLLMError)?.code ?: "LOCAL_LLM_UNKNOWN_ERROR")
  }

  @PluginMethod fun systemAvailability(call: PluginCall) {
      coroutineScope.launch {
          try {
              val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
              call.resolve(JSObject().put("status", impl.availability().value))
          } catch (ex: Exception) {
              call.rejectWithError(ex)
          }
      }
  }

    @PluginMethod fun download(call: PluginCall) {
        coroutineScope.launch {
            try {
                val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
                impl.download()
                call.resolve()
            } catch (ex: Exception) {
                call.rejectWithError(ex)
            }
        }
    }

    @PluginMethod
    fun warmup(call: PluginCall) {
        coroutineScope.launch {
            try {
                val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
                impl.warmup()
                call.resolve()
            } catch (ex: Exception) {
                call.rejectWithError(ex)
            }
        }
    }

  @PluginMethod
  fun prompt(call: PluginCall) {
      coroutineScope.launch {
          try {
              val options = getLLMPromptOptionsFromCall(call)

              val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
              val response = impl.prompt(options)
              call.resolve(JSObject().put("text", response))
          } catch (ex: Exception) {
              call.rejectWithError(ex)
          }
      }
  }

    @PluginMethod
    fun generateImage(call: PluginCall) {
        coroutineScope.launch {
            try {
                val prompt = call.getString("prompt")
                if (prompt.isNullOrBlank()) {
                    throw LocalLLMError.MissingParameter("prompt")
                }
                val count = call.getInt("count", 1) ?: 1

                val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
                val base64Image = impl.generateImage(prompt, count)
                call.resolve(JSObject().put("base64Image", base64Image))
            } catch (ex: Exception) {
                call.rejectWithError(ex)
            }
        }
    }

    @PluginMethod
    fun endSession(call: PluginCall) {
        try {
            val sessionId = call.getString("sessionId")
            if (sessionId.isNullOrBlank()) {
                throw LocalLLMError.MissingParameter("sessionId")
            }
            val impl = this@LocalLLMPlugin.implementation ?: throw LocalLLMError.Uninitialized()
            impl.endSession(sessionId)
            call.resolve()
        } catch (ex: Exception) {
            call.rejectWithError(ex)
        }
    }

    private fun getLLMPromptOptionsFromCall(call: PluginCall): LLMPromptOptions {
        return LLMPromptOptions(
            sessionId = call.getString("sessionId"),
            instructions = call.getString("instructions"),
            options = getLLMOptionsFromCall(call),
            prompt = call.getString("prompt")
                ?.takeIf { it.isNotBlank() }
                ?: throw LocalLLMError.MissingParameter("prompt")
        )
    }

    private fun getLLMOptionsFromCall(call: PluginCall): LLMOptions? {
        val optionsObject = call.getObject("options")

        if (optionsObject!= null) {
            return LLMOptions(
                temperature = optionsObject.optDouble("temperature").takeIf { !it.isNaN() }?.toFloat()?.coerceIn(0f, 1f),
                maxOutputTokens =  optionsObject.optInt("maximumOutputTokens").takeIf { it > 0 }?.coerceIn(1, 256)
            )
        }

        return null
    }
}
