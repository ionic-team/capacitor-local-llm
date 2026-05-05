import { WebPlugin } from '@capacitor/core';

import type { GenerateImageResponse, PromptResponse, LocalLLMPlugin, SystemAvailabilityResponse } from './definitions';
import { LocalLLMException } from './definitions';

export class LocalLLMWeb extends WebPlugin implements LocalLLMPlugin {
  private webUnsupported(): never {
    throw new LocalLLMException('LOCAL_LLM_WEB_NOT_SUPPORTED', 'Not available on the web');
  }

  systemAvailability(): Promise<SystemAvailabilityResponse> {
    return this.webUnsupported();
  }
  download(): Promise<void> {
    return this.webUnsupported();
  }
  prompt(): Promise<PromptResponse> {
    return this.webUnsupported();
  }
  endSession(): Promise<void> {
    return this.webUnsupported();
  }
  generateImage(): Promise<GenerateImageResponse> {
    return this.webUnsupported();
  }
  warmup(): Promise<void> {
    return this.webUnsupported();
  }
}
