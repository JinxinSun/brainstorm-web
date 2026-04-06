"use client";

import { useEffect, useRef, useMemo } from "react";
import { useSessionStore } from "@/store/session-store";
import { MessageBubble } from "./message-bubble";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { extractStructuredQuestion } from "@/lib/chat-questions";

interface MessageListProps {
  onChoiceSelect: (choice: string) => void;
}

export function MessageList({ onChoiceSelect }: MessageListProps) {
  const messages = useSessionStore((s) => s.messages);
  const isStreaming = useSessionStore((s) => s.isStreaming);
  const streamingText = useSessionStore((s) => s.streamingText);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const streamingHtml = useMemo(() => {
    if (!streamingText) return "";
    const { text } = extractStructuredQuestion(streamingText);
    return DOMPurify.sanitize(marked.parse(text, { async: false }) as string);
  }, [streamingText]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onChoiceSelect={onChoiceSelect} />
      ))}
      {isStreaming && streamingText && (
        <div className="flex flex-col gap-2 items-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm leading-relaxed">
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: streamingHtml }}
            />
          </div>
        </div>
      )}
      {isStreaming && !streamingText && (
        <div className="flex items-start">
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
