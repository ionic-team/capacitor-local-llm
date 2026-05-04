import { WebPlugin } from '@capacitor/core';

import type { GenerateImageResponse, PromptResponse, LocalLLMPlugin, SystemAvailabilityResponse } from './definitions';

export class LocalLLMWeb extends WebPlugin implements LocalLLMPlugin {
  systemAvailability(): Promise<SystemAvailabilityResponse> {
    throw new Error('not available on the web.');
  }
  download(): Promise<void> {
    throw new Error('not available on the web.');
  }
  prompt(): Promise<PromptResponse> {
    throw new Error('not available on the web.');
  }
  endSession(): Promise<void> {
    throw new Error('not available on the web.');
  }
  generateImage(): Promise<GenerateImageResponse> {
    throw new Error('not available on the web.');
  }
  warmup(): Promise<void> {
    throw new Error('not available on the web.');
  }
}
