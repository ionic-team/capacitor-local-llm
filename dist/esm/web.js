import { WebPlugin } from '@capacitor/core';
import { LocalLLMException } from './definitions';
export class LocalLLMWeb extends WebPlugin {
    webUnsupported() {
        throw new LocalLLMException('LOCAL_LLM_WEB_NOT_SUPPORTED', 'Not available on the web');
    }
    systemAvailability() {
        return this.webUnsupported();
    }
    download() {
        return this.webUnsupported();
    }
    prompt() {
        return this.webUnsupported();
    }
    endSession() {
        return this.webUnsupported();
    }
    generateImage() {
        return this.webUnsupported();
    }
    warmup() {
        return this.webUnsupported();
    }
}
//# sourceMappingURL=web.js.map