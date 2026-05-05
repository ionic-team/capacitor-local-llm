'use strict';

var core = require('@capacitor/core');

const LocalLLM = core.registerPlugin('LocalLLM', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.LocalLLMWeb()),
});

class LocalLLMWeb extends core.WebPlugin {
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    LocalLLMWeb: LocalLLMWeb
});

exports.LocalLLM = LocalLLM;
//# sourceMappingURL=plugin.cjs.js.map
