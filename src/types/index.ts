export type Stage =
  | "了解背景"
  | "澄清需求"
  | "生成方案"
  | "确认细节"
  | "输出结果";

export const STAGES: Stage[] = [
  "了解背景",
  "澄清需求",
  "生成方案",
  "确认细节",
  "输出结果",
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 encoded images
  timestamp: number;
}

export type QuestionType = "single_select" | "multi_select" | "open_input";

export interface StructuredQuestion {
  type: QuestionType;
  text: string;
  options: string[];
  allowCustom: boolean;
}

export interface SSEEvent {
  type: "text" | "html" | "stage" | "done" | "error";
  content?: string;
  stage?: Stage;
}
