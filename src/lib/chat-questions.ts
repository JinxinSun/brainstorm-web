import type { StructuredQuestion, QuestionType } from "@/types";

const QUESTION_BLOCK_RE = /:::question\s*([\s\S]*?)\s*:::/g;
const TAG_RE = (tag: string) => new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
const OPTION_RE = /<option>([\s\S]*?)<\/option>/g;

function decodeEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, "")).trim();
}

function parseQuestionType(block: string): QuestionType | null {
  const typeMatch = block.match(/<question[^>]*type="([^"]+)"/i);
  const type = typeMatch?.[1]?.trim();

  if (
    type === "single_select" ||
    type === "multi_select" ||
    type === "open_input"
  ) {
    return type;
  }

  return null;
}

function parseAllowCustom(block: string, type: QuestionType) {
  const attrMatch = block.match(/<question[^>]*allow_custom="([^"]+)"/i);
  const tagMatch = block.match(TAG_RE("allow_custom"));
  const raw = (attrMatch?.[1] ?? tagMatch?.[1] ?? "").trim().toLowerCase();

  if (!raw) {
    return type !== "open_input";
  }

  return raw === "true" || raw === "1" || raw === "yes";
}

function parseQuestionBlock(block: string): StructuredQuestion | null {
  const type = parseQuestionType(block);
  if (!type) return null;

  const text = stripTags(block.match(TAG_RE("text"))?.[1] ?? "");
  if (!text) return null;

  const options = Array.from(block.matchAll(OPTION_RE))
    .map((match) => stripTags(match[1]))
    .filter(Boolean);

  return {
    type,
    text,
    options,
    allowCustom: parseAllowCustom(block, type),
  };
}

export function extractStructuredQuestion(content: string): {
  text: string;
  question: StructuredQuestion | null;
} {
  let question: StructuredQuestion | null = null;
  const text = content
    .replace(QUESTION_BLOCK_RE, (_, block: string) => {
      question = parseQuestionBlock(block) ?? question;
      return "";
    })
    .replace(/:::stage:[^:]+:::/g, "")
    .trim();

  return { text, question };
}
