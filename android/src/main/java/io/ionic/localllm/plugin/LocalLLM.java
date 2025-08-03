package io.ionic.localllm.plugin;

import com.getcapacitor.Logger;

public class LocalLLM {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
