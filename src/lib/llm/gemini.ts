import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProvider, LLMMessage, LLMContentPart } from "./types";

export class GeminiProvider implements LLMProvider {
  private model: string;

  constructor() {
    this.model = process.env.LLM_MODEL || "gemini-2.0-flash";
  }

  async *createStream(
    messages: LLMMessage[],
    systemPrompt: string
  ): AsyncIterable<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: this.formatParts(m.content),
    }));

    const chat = model.startChat({ history });
    const lastMsg = messages[messages.length - 1];
    const result = await chat.sendMessageStream(
      this.formatParts(lastMsg.content)
    );

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  private formatParts(content: string | LLMContentPart[]) {
    if (typeof content === "string") {
      return [{ text: content }];
    }

    return content.map((part) => {
      if (part.type === "text") {
        return { text: part.text! };
      }
      const match = part.imageUrl!.match(
        /^data:(image\/\w+);base64,(.+)$/
      );
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
      return { text: "[无法解析的图片]" };
    });
  }
}
