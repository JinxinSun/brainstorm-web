import type { LLMProvider, LLMProviderName } from "./types";
import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { OpenRouterProvider } from "./openrouter";

let cachedProvider: LLMProvider | null = null;
let cachedName: string | null = null;

export function getLLMProvider(): LLMProvider {
  const name = (process.env.LLM_PROVIDER || "claude") as LLMProviderName;

  if (cachedProvider && cachedName === name) {
    return cachedProvider;
  }

  switch (name) {
    case "claude":
      cachedProvider = new ClaudeProvider();
      break;
    case "openai":
      cachedProvider = new OpenAIProvider();
      break;
    case "gemini":
      cachedProvider = new GeminiProvider();
      break;
    case "openrouter":
      cachedProvider = new OpenRouterProvider();
      break;
    default:
      throw new Error(`Unknown LLM provider: ${name}`);
  }

  cachedName = name;
  return cachedProvider;
}
