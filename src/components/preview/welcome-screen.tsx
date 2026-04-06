"use client";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">原型预览区</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        在左侧对话中描述你的需求，AI 会在这里生成页面原型帮助你理解和确认。
      </p>
    </div>
  );
}
