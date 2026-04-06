"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSessionStore } from "@/store/session-store";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";

export function ChatPanel() {
  const isStreaming = useSessionStore((s) => s.isStreaming);
  const messages = useSessionStore((s) => s.messages);
  const addUserMessage = useSessionStore((s) => s.addUserMessage);
  const reset = useSessionStore((s) => s.reset);
  const hasInit = useRef(false);

  const streamResponse = useCallback(async () => {
    const {
      startStreaming,
      appendStreamText,
      updatePrototypeHtml,
      finishStreaming,
      setStage,
    } = useSessionStore.getState();

    startStreaming();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: useSessionStore.getState().messages,
          stage: useSessionStore.getState().currentStage,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to get response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            switch (event.type) {
              case "text":
                appendStreamText(event.content);
                break;
              case "html":
                updatePrototypeHtml(event.content);
                break;
              case "stage":
                setStage(event.stage);
                break;
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      appendStreamText("\n\n[网络错误，请重试]");
    } finally {
      finishStreaming();
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      addUserMessage(content, images);
      // Small delay to ensure state is updated
      await new Promise((r) => setTimeout(r, 10));
      await streamResponse();
    },
    [addUserMessage, streamResponse]
  );

  // Auto-trigger initial AI greeting
  useEffect(() => {
    if (!hasInit.current && messages.length === 0) {
      hasInit.current = true;
      streamResponse();
    }
  }, [messages.length, streamResponse]);

  const handleChoiceSelect = useCallback(
    (choice: string) => {
      if (isStreaming) return;
      sendMessage(choice);
    },
    [sendMessage, isStreaming]
  );

  const handleReset = useCallback(() => {
    reset();
    hasInit.current = false;
  }, [reset]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-medium">需求对话</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={handleReset}
            disabled={isStreaming}
          >
            重新开始
          </Button>
        )}
      </div>
      <MessageList onChoiceSelect={handleChoiceSelect} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
