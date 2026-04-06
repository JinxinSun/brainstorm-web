"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StructuredQuestion } from "@/types";

interface ChoiceCardsProps {
  question: StructuredQuestion;
  onSubmit: (choice: string) => void;
}

export function ChoiceCards({ question, onSubmit }: ChoiceCardsProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");

  const canSubmitCustom = customText.trim().length > 0;
  const isMulti = question.type === "multi_select";
  const isOpen = question.type === "open_input";

  const submitMulti = () => {
    const parts = [...selected];
    if (customText.trim()) {
      parts.push(`补充：${customText.trim()}`);
    }
    if (parts.length === 0) return;
    onSubmit(parts.join("\n"));
  };

  const optionItems = useMemo(
    () =>
      question.options.map((choice, i) => {
        const letter = String.fromCharCode(65 + i);
        const selectedNow = selected.includes(choice);

        return { choice, letter, selectedNow };
      }),
    [question.options, selected]
  );

  const toggleChoice = (choice: string) => {
    if (!isMulti) {
      onSubmit(choice);
      return;
    }

    setSelected((prev) =>
      prev.includes(choice)
        ? prev.filter((item) => item !== choice)
        : [...prev, choice]
    );
  };

  const submitCustomOnly = () => {
    if (!canSubmitCustom) return;
    onSubmit(customText.trim());
  };

  return (
    <div className="flex flex-col gap-2 max-w-[85%] w-full">
      <div className="rounded-2xl border bg-card/80 p-3">
        <p className="text-sm font-medium leading-6 text-foreground">{question.text}</p>
        {question.options.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {optionItems.map(({ choice, letter, selectedNow }) => (
              <button
                key={choice}
                onClick={() => toggleChoice(choice)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm",
                  "transition-all cursor-pointer",
                  selectedNow
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:border-primary/50 hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    selectedNow
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {letter}
                </span>
                <span className="text-foreground">{choice}</span>
              </button>
            ))}
          </div>
        )}

        {(question.allowCustom || isOpen) && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              placeholder={isOpen ? "你可以直接描述你的想法..." : "也可以补充你自己的情况..."}
              className="min-h-[88px] resize-y bg-background"
            />
            <div className="flex items-center justify-end gap-2">
              {isMulti && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={submitMulti}
                  disabled={selected.length === 0 && !canSubmitCustom}
                >
                  确认选择
                </Button>
              )}
              {!isMulti && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={submitCustomOnly}
                  disabled={!canSubmitCustom}
                >
                  发送补充
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
