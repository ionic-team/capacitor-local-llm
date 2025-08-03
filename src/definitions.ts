export interface LocalLLMPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
