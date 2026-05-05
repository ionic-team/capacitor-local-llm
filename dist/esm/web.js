import { WebPlugin } from '@capacitor/core';
export class LocalLLMWeb extends WebPlugin {
    systemAvailability() {
        throw new Error('not available on the web.');
    }
    download() {
        throw new Error('not available on the web.');
    }
    prompt() {
        throw new Error('not available on the web.');
    }
    endSession() {
        throw new Error('not available on the web.');
    }
    generateImage() {
        throw new Error('not available on the web.');
    }
    warmup() {
        throw new Error('not available on the web.');
    }
}
//# sourceMappingURL=web.js.map