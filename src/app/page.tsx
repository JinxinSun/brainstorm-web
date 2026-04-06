"use client";

import { ProgressBar } from "@/components/layout/progress-bar";
import { SplitPanel } from "@/components/layout/split-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { PreviewPanel } from "@/components/preview/preview-panel";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <ProgressBar />
      <SplitPanel
        left={<ChatPanel />}
        right={<PreviewPanel />}
      />
    </div>
  );
}
