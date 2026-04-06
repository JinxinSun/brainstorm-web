import { OpenAIProvider } from "./openai";

export class OpenRouterProvider extends OpenAIProvider {
  constructor() {
    super(
      "https://openrouter.ai/api/v1",
      process.env.OPENROUTER_API_KEY
    );
  }
}
