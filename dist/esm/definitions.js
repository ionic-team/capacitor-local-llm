/**
 * Error thrown by the LocalLLM plugin, carrying a machine-readable `code`.
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * try {
 *   await LocalLLM.prompt({ prompt: 'Hello' });
 * } catch (err) {
 *   if (err instanceof LocalLLMException) {
 *     console.log(err.code); // e.g. 'LOCAL_LLM_NOT_ENABLED'
 *   }
 * }
 * ```
 */
export class LocalLLMException extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'LocalLLMException';
    }
}
//# sourceMappingURL=definitions.js.map