const STAGE_NAMES = ["了解背景", "澄清需求", "生成方案", "确认细节", "输出结果"];

export interface ParsedChunk {
  type: "text" | "html" | "stage";
  content: string;
}

/**
 * Streaming parser that separates AI output into text, HTML prototype, and stage markers.
 *
 * AI uses these markers:
 * - :::prototype ... ::: for HTML prototype blocks
 * - :::stage:阶段名::: for stage transitions
 */
export class StreamParser {
  private buffer = "";
  private inHtml = false;
  private htmlBuffer = "";

  /**
   * Feed a new text chunk and get parsed results.
   */
  feed(chunk: string): ParsedChunk[] {
    this.buffer += chunk;
    const results: ParsedChunk[] = [];

    while (this.buffer.length > 0) {
      if (this.inHtml) {
        // Look for closing :::
        const closeIdx = this.buffer.indexOf("\n:::\n");

        if (closeIdx !== -1) {
          this.htmlBuffer += this.buffer.slice(0, closeIdx);
          this.buffer = this.buffer.slice(closeIdx + 5); // skip \n:::\n
          results.push({ type: "html", content: this.htmlBuffer.trim() });
          this.htmlBuffer = "";
          this.inHtml = false;
          continue;
        }

        // Check if buffer ends with potential partial close marker
        if (this.buffer.endsWith("\n:::")) {
          this.htmlBuffer += this.buffer.slice(0, -4);
          results.push({ type: "html", content: this.htmlBuffer.trim() });
          this.htmlBuffer = "";
          this.inHtml = false;
          this.buffer = "";
          continue;
        }

        // No close marker found, keep buffering HTML
        // But emit partial HTML for live preview
        this.htmlBuffer += this.buffer;
        this.buffer = "";
        if (this.htmlBuffer.trim()) {
          results.push({ type: "html", content: this.htmlBuffer.trim() });
        }
        break;
      }

      // Check for stage marker: :::stage:阶段名:::
      const stageMatch = this.buffer.match(/:::stage:([^:]+):::/);
      if (stageMatch && STAGE_NAMES.includes(stageMatch[1])) {
        const beforeStage = this.buffer.slice(0, stageMatch.index);
        if (beforeStage.trim()) {
          results.push({ type: "text", content: beforeStage });
        }
        results.push({ type: "stage", content: stageMatch[1] });
        this.buffer = this.buffer.slice(
          stageMatch.index! + stageMatch[0].length
        );
        continue;
      }

      // Check for prototype open marker: :::prototype
      const protoIdx = this.buffer.indexOf(":::prototype\n");
      if (protoIdx !== -1) {
        const beforeProto = this.buffer.slice(0, protoIdx);
        if (beforeProto.trim()) {
          results.push({ type: "text", content: beforeProto });
        }
        this.buffer = this.buffer.slice(protoIdx + 13); // skip :::prototype\n
        this.inHtml = true;
        this.htmlBuffer = "";
        continue;
      }

      // Check if buffer might contain a partial marker at the end
      if (this.hasPartialMarker()) {
        // Could be a partial marker, hold back the potential marker part
        const colonIdx = this.buffer.lastIndexOf(":::");
        if (colonIdx > 0) {
          const text = this.buffer.slice(0, colonIdx);
          if (text.trim()) {
            results.push({ type: "text", content: text });
          }
          this.buffer = this.buffer.slice(colonIdx);
        }
        break;
      }

      // No markers found, emit all text
      if (this.buffer.trim()) {
        results.push({ type: "text", content: this.buffer });
      }
      this.buffer = "";
      break;
    }

    return results;
  }

  private hasPartialMarker(): boolean {
    const partialMarkers = [
      ":",
      "::",
      ":::",
      ":::p",
      ":::pr",
      ":::pro",
      ":::prot",
      ":::proto",
      ":::protot",
      ":::prototy",
      ":::prototyp",
      ":::prototype",
      ":::prototype\n",
      ":::s",
      ":::st",
      ":::sta",
      ":::stag",
      ":::stage",
      ":::stage:",
    ];

    if (partialMarkers.some((marker) => this.buffer.endsWith(marker))) {
      return true;
    }

    return STAGE_NAMES.some((stage) =>
      Array.from({ length: stage.length }, (_, i) => `:::stage:${stage.slice(0, i + 1)}`).some(
        (marker) => this.buffer.endsWith(marker)
      )
    );
  }

  /**
   * Flush remaining buffer at end of stream.
   */
  flush(): ParsedChunk[] {
    const results: ParsedChunk[] = [];
    if (this.inHtml && this.htmlBuffer.trim()) {
      results.push({ type: "html", content: this.htmlBuffer.trim() });
    }
    if (this.buffer.trim()) {
      results.push({ type: "text", content: this.buffer });
    }
    this.buffer = "";
    this.htmlBuffer = "";
    this.inHtml = false;
    return results;
  }
}
