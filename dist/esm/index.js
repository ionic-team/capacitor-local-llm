import { registerPlugin } from '@capacitor/core';
const LocalLLM = registerPlugin('LocalLLM', {
    web: () => import('./web').then((m) => new m.LocalLLMWeb()),
});
export * from './definitions';
export { LocalLLM };
//# sourceMappingURL=index.js.map