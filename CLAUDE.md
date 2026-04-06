# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Communication

Always respond to the user in Chinese (中文).

## Commands

- `npm run dev` — start dev server (Next.js 16, port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- No test framework is configured yet.

## Architecture

This is an AI-powered requirements clarification tool ("需求澄清助手"). A user chats with an AI consultant that guides them through 5 stages to turn vague ideas into structured requirements with HTML prototypes.

### Data flow

1. **Client** (`ChatPanel`) sends messages + current stage to `POST /api/chat`
2. **API route** builds a system prompt (base prompt + stage hint), converts messages to the provider-agnostic `LLMMessage` format, and calls the LLM
3. **LLM streams** text containing embedded markers: `:::prototype\n...\n:::` for HTML and `:::stage:阶段名:::` for stage transitions
4. **`StreamParser`** (`src/lib/parser.ts`) parses the raw stream into typed chunks (text / html / stage)
5. **API** re-emits parsed chunks as SSE (`data: {...}\n\n`) back to the client
6. **Client** routes chunks: text → chat bubble, html → iframe preview (with `PROTOTYPE_CSS` injected), stage → progress bar update

### Key modules

- **State**: Zustand store (`src/store/session-store.ts`) — messages, current stage, streaming state, prototype HTML
- **LLM abstraction**: `src/lib/llm/` — provider interface + implementations for Claude, OpenAI, Gemini, OpenRouter. Provider selected via `LLM_PROVIDER` env var.
- **Prompts**: `src/lib/prompts/` — system prompt defines AI persona/behavior; stage prompts add per-stage hints
- **Prototype CSS**: `src/lib/prototype-css.ts` — CSS component library injected into the prototype iframe (mockup, cards, options, wireframe elements)
- **Capture API**: `POST /api/capture` — optional Playwright-based page screenshot endpoint

### Stages (Chinese names used as enum values)

`了解背景` → `澄清需求` → `生成方案` → `确认细节` → `输出结果`

These are the literal `Stage` type values used throughout the codebase. The LLM emits `:::stage:阶段名:::` markers to trigger transitions.

### Environment

Copy `.env.example` to `.env.local`. Set `LLM_PROVIDER` and the corresponding API key. Optionally override the model with `LLM_MODEL`.

## UI

- Tailwind CSS v4 with shadcn/ui components (`src/components/ui/`)
- Split-panel layout: chat on the left, prototype preview iframe on the right
- The app locale is Chinese (`lang="zh-CN"`)
