import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { url, username, password } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Dynamically import playwright to avoid issues when not installed
    let chromium;
    try {
      // @ts-expect-error - playwright is an optional dependency
      const pw = await import("playwright");
      chromium = pw.chromium;
    } catch {
      return NextResponse.json(
        {
          error:
            "页面抓取功能需要 Playwright。请运行 npx playwright install chromium 安装浏览器。",
        },
        { status: 501 }
      );
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });

      // If credentials provided, try to fill login form
      if (username && password) {
        // Common login form patterns
        const usernameSelectors = [
          'input[type="text"]',
          'input[type="email"]',
          'input[name="username"]',
          'input[name="email"]',
          'input[name="account"]',
          'input[id="username"]',
        ];
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
        ];

        for (const sel of usernameSelectors) {
          const el = await page.$(sel);
          if (el) {
            await el.fill(username);
            break;
          }
        }

        for (const sel of passwordSelectors) {
          const el = await page.$(sel);
          if (el) {
            await el.fill(password);
            break;
          }
        }

        // Try to submit
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          "button:has-text('登录')",
          "button:has-text('Login')",
          "button:has-text('Sign in')",
        ];

        for (const sel of submitSelectors) {
          const el = await page.$(sel);
          if (el) {
            await el.click();
            await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
            break;
          }
        }
      }

      // Take screenshot
      const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
      });
      const screenshotBase64 = `data:image/png;base64,${screenshot.toString("base64")}`;

      // Extract simplified HTML structure
      const htmlSummary = await page.evaluate(() => {
        function summarize(el: Element, depth: number): string {
          if (depth > 4) return "";
          const tag = el.tagName.toLowerCase();
          const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
            ? el.textContent?.trim().slice(0, 50) || ""
            : "";
          const children = Array.from(el.children)
            .map((c) => summarize(c, depth + 1))
            .filter(Boolean)
            .join("");
          if (!text && !children) return "";
          const indent = "  ".repeat(depth);
          return `${indent}<${tag}>${text}${children ? "\n" + children + indent : ""}</${tag}>\n`;
        }
        return summarize(document.body, 0).slice(0, 3000);
      });

      return NextResponse.json({
        screenshot: screenshotBase64,
        htmlSummary,
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
