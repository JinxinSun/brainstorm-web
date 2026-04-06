import OpenAI from "openai";
import type { LLMProvider, LLMMessage, LLMContentPart } from "./types";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(baseURL?: string, apiKey?: string) {
    const resolvedBaseURL = baseURL || process.env.OPENAI_BASE_URL;
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      ...(resolvedBaseURL ? { baseURL: resolvedBaseURL } : {}),
    });
    this.model = process.env.LLM_MODEL || "gpt-4o";
  }

  async *createStream(
    messages: LLMMessage[],
    systemPrompt: string
  ): AsyncIterable<string> {
    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m): OpenAI.ChatCompletionMessageParam => {
        if (m.role === "assistant") {
          return {
            role: "assistant" as const,
            content: typeof m.content === "string" ? m.content : this.formatContent(m.content) as string,
          };
        }
        return {
          role: "user" as const,
          content: this.formatContent(m.content),
        };
      }),
    ];

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      stream: true,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  private formatContent(
    content: string | LLMContentPart[]
  ): string | OpenAI.ChatCompletionContentPart[] {
    if (typeof content === "string") return content;

    return content.map((part) => {
      if (part.type === "text") {
        return { type: "text" as const, text: part.text! };
      }
      return {
        type: "image_url" as const,
        image_url: { url: part.imageUrl! },
      };
    });
  }
}
