"use client";

import { cn } from "@/lib/utils";

interface ChoiceCardsProps {
  choices: string[];
  onSelect: (choice: string) => void;
}

export function ChoiceCards({ choices, onSelect }: ChoiceCardsProps) {
  return (
    <div className="flex flex-col gap-2 max-w-[85%] w-full">
      {choices.map((choice, i) => {
        const match = choice.match(/^([A-D])[.、．]\s*(.+)/);
        const letter = match?.[1] ?? String.fromCharCode(65 + i);
        const text = match?.[2] ?? choice;

        return (
          <button
            key={i}
            onClick={() => onSelect(choice)}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm",
              "transition-all hover:border-primary/50 hover:bg-accent",
              "cursor-pointer"
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {letter}
            </span>
            <span className="text-foreground">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
