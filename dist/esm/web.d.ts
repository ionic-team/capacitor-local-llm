import { WebPlugin } from '@capacitor/core';
import type { GenerateImageResponse, PromptResponse, LocalLLMPlugin, SystemAvailabilityResponse } from './definitions';
export declare class LocalLLMWeb extends WebPlugin implements LocalLLMPlugin {
    systemAvailability(): Promise<SystemAvailabilityResponse>;
    download(): Promise<void>;
    prompt(): Promise<PromptResponse>;
    endSession(): Promise<void>;
    generateImage(): Promise<GenerateImageResponse>;
    warmup(): Promise<void>;
}
