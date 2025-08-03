import { registerPlugin } from '@capacitor/core';

import type { LocalLLMPlugin } from './definitions';

const LocalLLM = registerPlugin<LocalLLMPlugin>('LocalLLM', {
  web: () => import('./web').then((m) => new m.LocalLLMWeb()),
});

export * from './definitions';
export { LocalLLM };
