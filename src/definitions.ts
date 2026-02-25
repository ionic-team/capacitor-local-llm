export interface LocalLLMPlugin {
  systemAvailability(): Promise<SystemAvailabilityResponse>;
  download(): Promise<void>;
  prompt(options: PromptOptions): Promise<PromptResponse>;
  endSession(options: EndSessionOptions): Promise<void>;
}

export interface LLMOptions {
  temperature?: number;
  maximiumOutputTokens?: number;
}

export interface PromptOptions {
  sessionId?: string;
  instructions?: string;
  options?: LLMOptions;
  prompt: string;
}

export interface PromptResponse {
  text: string;
}

export interface SystemAvailabilityResponse {
  status: LLMAvailability;
}

export interface EndSessionOptions {
  sessionId: string;
}

// export enum LLMAvailability {
//   Available = 'available',
//   Unavailable = 'unavailable',
//   Unsupported = 'unsupported',
//   NotEnabled = 'notEnabled',
//   NotReady = 'notReady',
// }

export type LLMAvailability = 'available' | 'unavailable' | 'notready' | 'downloadable' | 'responding';
