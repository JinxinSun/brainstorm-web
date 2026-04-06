# Brainstorm Web — 设计方案

> 文档创建时间：2026-04-06
> 用途：记录项目的设计决策、架构方案和实现细节，供后续分析和迭代参考。

---

## 1. 项目概述

### 1.1 要解决的问题

业务人员向需求顾问提需求时，存在三大痛点：
- **说不清楚** — 脑子里有想法但表达模糊、零散
- **沟通混乱** — 口头、微信、邮件、开会混着来，信息散落各处
- **前期效率低** — 需求顾问要花大量时间反复追问、梳理、画原型

### 1.2 解决方案

构建一个 Web 端的 AI 需求澄清工具，让业务人员在和需求顾问沟通之前，先通过 AI 引导的对话理清想法。AI 扮演需求顾问角色，一步步提问引导，同步生成原型图辅助理解。

### 1.3 灵感来源

基于开源项目 [superpowers](https://github.com/obra/superpowers) 的 brainstorming skill，将其核心价值（结构化提问、逐步澄清、可视化辅助）从命令行移植到 Web 端。

---

## 2. 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 16 (App Router) | 支持 SSE 流式响应、API Route |
| 语言 | TypeScript | 全栈类型安全 |
| 样式 | Tailwind CSS v4 + shadcn/ui | 快速搭建 UI |
| 状态管理 | Zustand | 轻量、无 Provider 包裹 |
| Markdown 渲染 | marked | AI 消息的 Markdown 格式化 |
| HTML 安全 | DOMPurify | 清洗 AI 生成的 HTML |
| LLM SDK | @anthropic-ai/sdk, openai, @google/generative-ai | 多 provider 支持 |
| 页面抓取 | Playwright（可选） | 现有系统截图/分析 |
| 部署 | Vercel | Serverless 部署 |

---

## 3. 架构设计

### 3.1 整体数据流

```
用户输入
  ↓
ChatPanel (客户端)
  ↓ POST /api/chat { messages, stage }
API Route (服务端)
  ↓ 构建 system prompt + stage hint
  ↓ 调用 LLM Provider
  ↓ StreamParser 解析 AI 输出
  ↓ 分类为 text / html / stage 事件
SSE 流式响应
  ↓ data: {"type":"text","content":"..."}
  ↓ data: {"type":"html","content":"..."}
  ↓ data: {"type":"stage","stage":"澄清需求"}
客户端路由
  ├── text  → 聊天气泡（Markdown 渲染）
  ├── html  → iframe 预览（注入 PROTOTYPE_CSS）
  └── stage → 进度条更新
```

### 3.2 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局（lang="zh-CN"）
│   ├── page.tsx                # 唯一页面：进度条 + 左右分栏
│   ├── globals.css
│   └── api/
│       ├── chat/route.ts       # POST: 流式对话（SSE）
│       └── capture/route.ts    # POST: Playwright 页面抓取
├── components/
│   ├── layout/
│   │   ├── split-panel.tsx     # 左右可调分栏（拖拽调整宽度）
│   │   └── progress-bar.tsx    # 顶部 5 阶段进度条
│   ├── chat/
│   │   ├── chat-panel.tsx      # 左侧对话容器（含自动触发初始消息）
│   │   ├── message-list.tsx    # 消息列表（自动滚动到底部）
│   │   ├── message-bubble.tsx  # 单条消息（AI: Markdown + 选项提取；用户: 纯文本 + 图片）
│   │   ├── choice-cards.tsx    # 可点击的 A/B/C/D 选项卡片
│   │   ├── chat-input.tsx      # 输入区（文本 + 图片 + Enter 发送）
│   │   └── image-upload.tsx    # 图片上传（base64 编码）
│   └── preview/
│       ├── preview-panel.tsx   # 右侧预览容器
│       ├── prototype-iframe.tsx # 沙箱 iframe 渲染器（DOMPurify + sandbox）
│       └── welcome-screen.tsx  # 无原型时的欢迎引导页
├── lib/
│   ├── llm/
│   │   ├── types.ts            # LLMProvider 接口、LLMMessage、LLMContentPart
│   │   ├── provider.ts         # 工厂函数，按 LLM_PROVIDER env 选择
│   │   ├── claude.ts           # Anthropic Claude 适配器（支持 vision）
│   │   ├── openai.ts           # OpenAI 适配器（支持自定义 base URL）
│   │   ├── gemini.ts           # Google Gemini 适配器
│   │   └── openrouter.ts       # OpenRouter 适配器（继承 OpenAI）
│   ├── prompts/
│   │   ├── system-prompt.ts    # 中文系统提示词
│   │   └── stage-prompts.ts    # 各阶段行为引导
│   ├── parser.ts               # 流式双输出解析器（状态机）
│   └── prototype-css.ts        # iframe 内 CSS 组件库
├── store/
│   └── session-store.ts        # Zustand store
└── types/
    └── index.ts                # Stage、ChatMessage、SSEEvent
```

### 3.3 组件层级

```
RootLayout (lang="zh-CN")
└── Page
    ├── ProgressBar
    │   └── 5 个阶段节点（了解背景 → 澄清需求 → 生成方案 → 确认细节 → 输出结果）
    └── SplitPanel (左 28%，可拖拽调整 25%-50%)
        ├── ChatPanel (左)
        │   ├── Header + 重新开始按钮
        │   ├── MessageList
        │   │   ├── MessageBubble (AI, Markdown + 图片)
        │   │   │   └── ChoiceCards (从 "A. xxx" 格式提取)
        │   │   ├── MessageBubble (User, 纯文本 + 图片)
        │   │   └── StreamingBubble / TypingIndicator
        │   └── ChatInput
        │       ├── ImageUpload
        │       ├── Textarea (Shift+Enter 换行)
        │       └── SendButton
        └── PreviewPanel (右)
            ├── Header
            └── WelcomeScreen | PrototypeIframe
```

---

## 4. 核心设计决策

### 4.1 双输出解析策略

**问题**：AI 的回复中同时包含对话文本和 HTML 原型代码，需要在流式传输中实时分离。

**方案**：使用自定义标记分隔符：
- `:::prototype\n...\n:::` — 包裹 HTML 原型
- `:::stage:阶段名:::` — 标记阶段切换

**示例**：
```
这是一个订单管理系统的页面布局建议。

:::prototype
<div class="mockup">
  <div class="mockup-header">订单管理系统</div>
  <div class="mockup-body">
    <div style="display:flex">
      <div class="mock-sidebar">
        <p>📋 订单列表</p>
        <p>👤 客户管理</p>
      </div>
      <div class="mock-content">
        <div class="placeholder">数据概览区域</div>
      </div>
    </div>
  </div>
</div>
:::

您觉得这个布局方向如何？

:::stage:澄清需求:::
```

**解析器实现**（`parser.ts`）：
- 状态机模式：NORMAL → HTML → NORMAL
- 处理流式 chunk 边界切割（标记可能被拆分到两个 chunk）
- 支持 HTML 部分实时预览（每次 chunk 都更新 iframe）
- `flush()` 方法处理流结束时的残留内容

**为什么不用 JSON 结构化输出**：会破坏流式传输体验，且增加 LLM 的输出负担。标记分隔符更轻量，且不与标准 Markdown 冲突。

### 4.2 原型渲染隔离

**安全策略**：
- `<iframe sandbox="allow-same-origin" srcdoc="...">` — 禁止脚本执行
- DOMPurify 清洗 — 移除 `<script>`、`onclick` 等危险内容
- CSS 组件库通过 `srcdoc` 内联注入，与主页面完全隔离

**CSS 组件库**（移植自 superpowers `frame-template.html`）：

| 组件 | CSS 类 | 用途 |
|------|--------|------|
| 选项 | `.options > .option > .letter + .content` | A/B/C 方案展示 |
| 卡片 | `.cards > .card > .card-image + .card-body` | 功能模块网格 |
| 线框图 | `.mockup > .mockup-header + .mockup-body` | UI 页面预览 |
| 对比 | `.split` | 左右两栏对比 |
| 优劣 | `.pros-cons > .pros + .cons` | 方案优劣分析 |
| 导航 | `.mock-nav` | 模拟导航栏 |
| 侧边栏 | `.mock-sidebar` | 模拟侧边栏 |
| 内容 | `.mock-content` | 模拟主内容区 |
| 按钮 | `.mock-button` / `.mock-button.secondary` | 模拟按钮 |
| 输入 | `.mock-input` | 模拟输入框 |
| 占位 | `.placeholder` | 虚线占位区域 |

- 支持 dark mode（`prefers-color-scheme`）
- 中文字体栈：`PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui`
- 提供基础工具类（flex、gap、padding 等）

### 4.3 LLM 多 Provider 抽象

**统一接口**：
```typescript
interface LLMProvider {
  createStream(messages: LLMMessage[], systemPrompt: string): AsyncIterable<string>;
}
```

**支持的 Provider**：

| Provider | 适配器 | 默认模型 | 图片支持 |
|----------|--------|---------|---------|
| Claude | `claude.ts` | claude-sonnet-4 | vision API |
| OpenAI | `openai.ts` | gpt-4o | image_url |
| Gemini | `gemini.ts` | gemini-2.0-flash | inlineData |
| OpenRouter | `openrouter.ts` | (继承 OpenAI) | 同 OpenAI |

**OpenAI 适配器支持自定义 base URL**（`OPENAI_BASE_URL` 环境变量），可对接兼容 API 的代理服务。

**环境变量**：
```
LLM_PROVIDER=openai          # claude | openai | gemini | openrouter
OPENAI_API_KEY=xxx
OPENAI_BASE_URL=http://...   # 可选，自定义 API 地址
LLM_MODEL=gpt-5              # 可选，覆盖默认模型
```

### 4.4 对话阶段管理

5 个阶段作为 TypeScript 字面量类型：
```typescript
type Stage = "了解背景" | "澄清需求" | "生成方案" | "确认细节" | "输出结果";
```

- AI 通过 `:::stage:阶段名:::` 标记自主决定阶段推进
- 每个阶段有对应的 hint 注入到 system prompt
- 进度条实时反映当前阶段

### 4.5 状态管理

Zustand store，无持久化（刷新即丢失，符合需求）：

```typescript
interface SessionState {
  messages: ChatMessage[];           // 完整对话历史
  currentStage: Stage;               // 当前阶段
  prototypeHtml: string | null;      // 最新原型 HTML
  isStreaming: boolean;              // AI 是否正在回复
  streamingText: string;             // 流式输出的部分文本
  streamingHtml: string;             // 流式输出的部分 HTML
}
```

### 4.6 选项卡片渲染

AI 回复中的选择题（格式 `A. xxx` / `A、xxx`）会被自动提取并渲染为可点击卡片。用户点击后等同于发送该选项文本。同时保留文本输入，用户可自由回答。

---

## 5. 系统提示词设计

### 5.1 角色设定
- 经验丰富的需求顾问
- 中文对话，语气友好自然
- 不使用技术术语

### 5.2 核心行为规则
- 一次只问一个问题
- 优先用 2-4 个选择题（`A. xxx\nB. xxx` 格式）
- 识别并拆分混合需求
- 根据内容适时生成原型

### 5.3 原型生成指令
- 提供完整的 CSS 类参考
- 讨论布局用线框级别，讨论视觉可更精细
- 每次生成完整替换，非增量

### 5.4 图片理解
- 识别截图中的页面布局和功能区域
- 确认理解后再提改造方案

### 5.5 对话结束
- 主动做完整总结
- 展示最终原型
- 输出结构化需求摘要（概述、功能要点、决策约束、原型）

---

## 6. Superpowers 参考研究

### 6.1 Brainstorming Skill 核心流程

superpowers 的 brainstorming skill 采用 9 步工作流：
1. 探索上下文 — 查看已有文件和 git 历史
2. 提供可视化伴侣 — 开启浏览器预览
3. 澄清提问 — 每次一个问题，探索目的和约束
4. 提出替代方案 — 2-3 个不同方案及权衡
5. 分段展示设计 — 增量验证
6. 撰写设计文档 — 保存规格说明
7. 自审规格 — 检查占位符、矛盾、范围蔓延
8. 用户审核 — 正式批准
9. 进入实现 — 调用 writing-plans skill

**关键原则**：一次一个问题、优先选择题、严格 YAGNI、增量验证。

### 6.2 Visual Companion CSS 体系

superpowers 使用自定义 CSS 框架（非 Bootstrap/Tailwind），AI 生成 HTML 片段（非完整文档），服务端包裹在 frame-template 中渲染。

交互通过 WebSocket 在浏览器和 CLI 之间传递选择事件。本项目简化了这一机制：iframe 纯展示，选择操作统一在聊天面板完成。

---

## 7. 实现阶段总结

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 脚手架与核心布局（Next.js + shadcn/ui + Zustand） | ✅ 完成 |
| Phase 2 | 聊天 UI（消息列表、气泡、选项卡片、输入区、图片上传） | ✅ 完成 |
| Phase 3 | 预览面板（CSS 组件库、iframe 沙箱、欢迎页） | ✅ 完成 |
| Phase 4 | LLM 抽象层 + 流式 API（4 个 provider + SSE + parser） | ✅ 完成 |
| Phase 5 | 系统提示词（中文角色、原型指令、阶段引导） | ✅ 完成 |
| Phase 6 | 图片上传（base64 + vision API 传递） | ✅ 完成 |
| Phase 7 | URL 页面抓取（Playwright，可选安装） | ✅ 完成 |
| Phase 8 | 结果输出（重新开始按钮、自动触发初始消息） | ✅ 完成 |

---

## 8. 验证清单

- [ ] 页面布局：进度条 + 左右分栏正常显示
- [ ] 流式输出：AI 回复逐字显示
- [ ] 选项卡片：A/B/C 选项渲染为可点击卡片
- [ ] 原型预览：HTML 在 iframe 中正确渲染，样式隔离
- [ ] 图片上传：上传后 AI 能识别并引用
- [ ] 阶段推进：进度条随对话自动更新
- [ ] 最终输出：结构化需求摘要 + 最终原型
- [ ] 重置：刷新页面状态丢失，"重新开始"按钮可用
- [ ] 安全：iframe sandbox 阻止脚本、DOMPurify 过滤危险 HTML、API Key 不暴露

---

## 9. MVP 范围外（后续迭代方向）

- 移动端适配
- 用户登录和历史记录
- 结果导出（Markdown / PDF / Word）
- 分享功能（生成链接）
- 多语言支持
- 原型拖拽编辑
- 与设计工具集成（Figma）
- 多用户协作
- Vercel 环境下的 Playwright 替代方案（Browserless.io 等）
