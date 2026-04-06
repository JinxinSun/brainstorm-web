"use client";

import { STAGES } from "@/types";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils";

export function ProgressBar() {
  const currentStage = useSessionStore((s) => s.currentStage);
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="flex items-center justify-center gap-1 px-6 py-3 border-b bg-background">
      {STAGES.map((stage, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        return (
          <div key={stage} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  "w-8 h-px mx-2",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isActive && "bg-primary ring-2 ring-primary/30",
                  isDone && "bg-primary",
                  !isActive && !isDone && "bg-muted-foreground/30"
                )}
              />
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isActive && "text-foreground font-medium",
                  isDone && "text-muted-foreground",
                  !isActive && !isDone && "text-muted-foreground/50"
                )}
              >
                {stage}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
