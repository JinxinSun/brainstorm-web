export interface LLMMessage {
  role: "user" | "assistant";
  content: string | LLMContentPart[];
}

export interface LLMContentPart {
  type: "text" | "image";
  text?: string;
  imageUrl?: string; // base64 data URL
}

export interface LLMProvider {
  createStream(
    messages: LLMMessage[],
    systemPrompt: string
  ): AsyncIterable<string>;
}

export type LLMProviderName = "claude" | "openai" | "gemini" | "openrouter";
