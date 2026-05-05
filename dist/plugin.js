var capacitorLocalLLM = (function (exports, core) {
    'use strict';

    /**
     * Error thrown by the LocalLLM plugin, carrying a machine-readable `code`.
     *
     * @since 1.0.0
     * @example
     * ```typescript
     * try {
     *   await LocalLLM.prompt({ prompt: 'Hello' });
     * } catch (err) {
     *   if (err instanceof LocalLLMException) {
     *     console.log(err.code); // e.g. 'LOCAL_LLM_NOT_ENABLED'
     *   }
     * }
     * ```
     */
    class LocalLLMException extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
            this.name = 'LocalLLMException';
        }
    }

    const LocalLLM = core.registerPlugin('LocalLLM', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.LocalLLMWeb()),
    });

    class LocalLLMWeb extends core.WebPlugin {
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

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        LocalLLMWeb: LocalLLMWeb
    });

    exports.LocalLLM = LocalLLM;
    exports.LocalLLMException = LocalLLMException;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
