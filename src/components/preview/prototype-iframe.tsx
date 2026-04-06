"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { PROTOTYPE_CSS } from "@/lib/prototype-css";

interface PrototypeIframeProps {
  html: string;
}

export function PrototypeIframe({ html }: PrototypeIframeProps) {
  const srcdoc = useMemo(() => {
    const clean = DOMPurify.sanitize(html, {
      ADD_TAGS: ["style"],
      ADD_ATTR: ["class", "style", "data-choice"],
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
      FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover"],
    });

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${PROTOTYPE_CSS}</style>
</head>
<body>
<div id="content">${clean}</div>
</body>
</html>`;
  }, [html]);

  return (
    <iframe
      srcDoc={srcdoc}
      sandbox="allow-same-origin"
      className="w-full h-full border-0"
      title="原型预览"
    />
  );
}
