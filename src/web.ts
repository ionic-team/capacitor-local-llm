import { WebPlugin } from '@capacitor/core';

import type { LocalLLMPlugin } from './definitions';

export class LocalLLMWeb extends WebPlugin implements LocalLLMPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
