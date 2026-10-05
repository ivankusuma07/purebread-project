// OpenAI-compatible chat client. Credentials come from the environment only.
// Any failure resolves to null and the run carries the previous scores.

export interface LlmConfig {
  url: string;
  key: string;
  model: string;
}

export function llmConfig(env: NodeJS.ProcessEnv = process.env): LlmConfig | null {
  const { LLM_API_URL: url, LLM_API_KEY: key, LLM_MODEL: model } = env;
  return url && key && model ? { url, key, model } : null;
}

export type Complete = (system: string, user: string, maxTokens?: number) => Promise<string | null>;

export function chatClient(cfg: LlmConfig): Complete {
  return async (system, user, maxTokens = 12_000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const res = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
      const content = data.choices?.[0]?.message?.content;
      return typeof content === 'string' && content.length > 0 ? content : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
}
