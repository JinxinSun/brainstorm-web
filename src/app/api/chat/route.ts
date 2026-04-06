import { NextRequest } from "next/server";
import { getLLMProvider } from "@/lib/llm/provider";
import { getSystemPrompt } from "@/lib/prompts/system-prompt";
import { getStageHint } from "@/lib/prompts/stage-prompts";
import { StreamParser } from "@/lib/parser";
import type { LLMMessage, LLMContentPart } from "@/lib/llm/types";
import type { ChatMessage, Stage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stage } = body as {
      messages: ChatMessage[];
      stage: Stage;
    };

    const provider = getLLMProvider();
    const systemPrompt = getSystemPrompt() + "\n\n" + getStageHint(stage);

    // Convert ChatMessages to LLMMessages
    const llmMessages: LLMMessage[] = messages.map((m) => {
      if (m.images && m.images.length > 0) {
        const parts: LLMContentPart[] = [];
        if (m.content) {
          parts.push({ type: "text", text: m.content });
        }
        for (const img of m.images) {
          parts.push({ type: "image", imageUrl: img });
        }
        return { role: m.role, content: parts };
      }
      return { role: m.role, content: m.content };
    });

    // If no messages yet, add a trigger message
    if (llmMessages.length === 0) {
      llmMessages.push({ role: "user", content: "你好" });
    }

    const stream = provider.createStream(llmMessages, systemPrompt);
    const parser = new StreamParser();

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let latestHtml = "";

          for await (const chunk of stream) {
            const parsed = parser.feed(chunk);
            for (const p of parsed) {
              if (p.type === "html") {
                latestHtml = p.content;
              }
              const event = JSON.stringify(
                p.type === "stage"
                  ? { type: "stage", stage: p.content }
                  : { type: p.type, content: p.content }
              );
              controller.enqueue(
                encoder.encode(`data: ${event}\n\n`)
              );
            }
          }

          // Flush remaining content
          const remaining = parser.flush();
          for (const p of remaining) {
            const event = JSON.stringify(
              p.type === "stage"
                ? { type: "stage", stage: p.content }
                : { type: p.type, content: p.content }
            );
            controller.enqueue(
              encoder.encode(`data: ${event}\n\n`)
            );
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", content: errorMsg })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
