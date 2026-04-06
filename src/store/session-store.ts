import { create } from "zustand";
import type { ChatMessage, Stage } from "@/types";

interface SessionState {
  messages: ChatMessage[];
  currentStage: Stage;
  prototypeHtml: string | null;
  isStreaming: boolean;
  streamingText: string;
  streamingHtml: string;

  addUserMessage: (content: string, images?: string[]) => void;
  startStreaming: () => void;
  appendStreamText: (chunk: string) => void;
  updatePrototypeHtml: (html: string) => void;
  finishStreaming: () => void;
  setStage: (stage: Stage) => void;
  reset: () => void;
}

let messageCounter = 0;

export const useSessionStore = create<SessionState>((set, get) => ({
  messages: [],
  currentStage: "了解背景",
  prototypeHtml: null,
  isStreaming: false,
  streamingText: "",
  streamingHtml: "",

  addUserMessage: (content, images) => {
    const msg: ChatMessage = {
      id: `msg-${++messageCounter}`,
      role: "user",
      content,
      images,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  startStreaming: () => {
    set({ isStreaming: true, streamingText: "", streamingHtml: "" });
  },

  appendStreamText: (chunk) => {
    set((s) => ({ streamingText: s.streamingText + chunk }));
  },

  updatePrototypeHtml: (html) => {
    set({ streamingHtml: html, prototypeHtml: html });
  },

  finishStreaming: () => {
    const { streamingText } = get();
    if (streamingText.trim()) {
      const msg: ChatMessage = {
        id: `msg-${++messageCounter}`,
        role: "assistant",
        content: streamingText,
        timestamp: Date.now(),
      };
      set((s) => ({
        messages: [...s.messages, msg],
        isStreaming: false,
        streamingText: "",
        streamingHtml: "",
      }));
    } else {
      set({ isStreaming: false, streamingText: "", streamingHtml: "" });
    }
  },

  setStage: (stage) => {
    set({ currentStage: stage });
  },

  reset: () => {
    messageCounter = 0;
    set({
      messages: [],
      currentStage: "了解背景",
      prototypeHtml: null,
      isStreaming: false,
      streamingText: "",
      streamingHtml: "",
    });
  },
}));
