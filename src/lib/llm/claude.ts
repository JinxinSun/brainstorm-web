import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMMessage, LLMContentPart } from "./types";

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.LLM_MODEL || "claude-sonnet-4-20250514";
  }

  async *createStream(
    messages: LLMMessage[],
    systemPrompt: string
  ): AsyncIterable<string> {
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: this.formatContent(m.content),
    }));

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }

  private formatContent(
    content: string | LLMContentPart[]
  ): string | Anthropic.MessageCreateParams["messages"][0]["content"] {
    if (typeof content === "string") return content;

    return content.map((part) => {
      if (part.type === "text") {
        return { type: "text" as const, text: part.text! };
      }
      // Image: extract base64 data from data URL
      const match = part.imageUrl!.match(
        /^data:(image\/\w+);base64,(.+)$/
      );
      if (match) {
        return {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: match[2],
          },
        };
      }
      return { type: "text" as const, text: "[无法解析的图片]" };
    });
  }
}
