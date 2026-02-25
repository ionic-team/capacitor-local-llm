package io.ionic.localllm.plugin

enum class LLMAvailability(val value: String) {
    Available("available"),
    Unsupported("unsupported"),
    NotEnabled("notEnabled"),
    NotReady("notReady"),
    Unavailable("unavailable")
}