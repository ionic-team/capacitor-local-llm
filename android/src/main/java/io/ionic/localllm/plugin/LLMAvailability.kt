package io.ionic.localllm.plugin

enum class LLMAvailability(val value: String) {
    Available("available"),
    Unavailable("unavailable"),
    NotReady("notready"),
    Downloadable("downloadable")
}