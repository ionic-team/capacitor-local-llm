import { WebPlugin } from '@capacitor/core';

import type {
  EndSessionOptions,
  PromptOptions,
  PromptResponse,
  LocalLLMPlugin,
  SystemAvailabilityResponse,
} from './definitions';

export class LocalLLMWeb extends WebPlugin implements LocalLLMPlugin {
  systemAvailability(): Promise<SystemAvailabilityResponse> {
    throw new Error('not available on the web.');
  }
  download(): Promise<void> {
    throw new Error('not available on the web.');
  }
  prompt(_options: PromptOptions): Promise<PromptResponse> {
    throw new Error('not available on the web.');
  }
  endSession(_options: EndSessionOptions): Promise<void> {
    throw new Error('not available on the web.');
  }
}
