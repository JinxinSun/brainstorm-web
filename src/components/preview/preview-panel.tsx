"use client";

import { useSessionStore } from "@/store/session-store";
import { PrototypeIframe } from "./prototype-iframe";
import { WelcomeScreen } from "./welcome-screen";

export function PreviewPanel() {
  const prototypeHtml = useSessionStore((s) => s.prototypeHtml);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium">原型预览</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {prototypeHtml ? (
          <PrototypeIframe html={prototypeHtml} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}
