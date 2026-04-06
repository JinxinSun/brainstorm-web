"use client";

import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { ChoiceCards } from "./choice-cards";
import { extractStructuredQuestion } from "@/lib/chat-questions";

interface MessageBubbleProps {
  message: ChatMessage;
  onChoiceSelect?: (response: string) => void;
}

// Extract choice options from AI message: lines like "A. xxx" or "A、xxx"
function extractChoices(content: string): { text: string; choices: string[] } {
  const lines = content.split("\n");
  const choices: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([A-D])[.、．]\s*(.+)/);
    if (match) {
      choices.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (choices.length >= 2) {
    return { text: textLines.join("\n"), choices };
  }
  return { text: content, choices: [] };
}

export function MessageBubble({ message, onChoiceSelect }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const { text, choices, question } = useMemo(() => {
    if (isUser) return { text: message.content, choices: [] };
    const structured = extractStructuredQuestion(message.content);
    const fallback = extractChoices(structured.text);
    return {
      text: fallback.text,
      choices: fallback.choices,
      question: structured.question,
    };
  }, [message.content, isUser]);

  const html = useMemo(() => {
    if (isUser) return null;
    const parsed = marked.parse(text, { async: false }) as string;
    return DOMPurify.sanitize(parsed);
  }, [text, isUser]);

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0"
            dangerouslySetInnerHTML={{ __html: html! }}
          />
        )}
      </div>
      {message.images && message.images.length > 0 && (
        <div className="flex gap-2 max-w-[85%]">
          {message.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="uploaded"
              className="max-h-40 rounded-lg border object-cover"
            />
          ))}
        </div>
      )}
      {question && onChoiceSelect && (
        <ChoiceCards question={question} onSubmit={onChoiceSelect} />
      )}
      {!question && choices.length > 0 && onChoiceSelect && (
        <ChoiceCards
          question={{
            type: "single_select",
            text: "请选择一个更接近你的方向：",
            options: choices.map((choice) => choice.replace(/^([A-D])[.、．]\s*/, "")),
            allowCustom: true,
          }}
          onSubmit={onChoiceSelect}
        />
      )}
    </div>
  );
}
