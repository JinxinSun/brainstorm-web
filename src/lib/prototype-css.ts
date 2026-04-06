export const PROTOTYPE_CSS = `
/* Brainstorm Web — Prototype CSS Component Library */
/* Adapted from superpowers visual companion */

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;
  --border-color: #dee2e6;
  --accent: #4f46e5;
  --accent-light: #eef2ff;
  --success: #16a34a;
  --warning: #d97706;
  --error: #dc2626;
  --radius: 8px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border-color: #334155;
    --accent: #818cf8;
    --accent-light: #1e1b4b;
    --success: #4ade80;
    --warning: #fbbf24;
    --error: #f87171;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, -apple-system, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  padding: 24px;
}

h1, h2, h3, h4 {
  line-height: 1.3;
  margin-bottom: 0.5em;
}

h1 { font-size: 1.5rem; font-weight: 700; }
h2 { font-size: 1.25rem; font-weight: 600; }
h3 { font-size: 1.1rem; font-weight: 600; }
h4 { font-size: 1rem; font-weight: 500; }

p {
  margin-bottom: 0.75em;
  color: var(--text-primary);
}

/* ── Section ── */
.section {
  margin-bottom: 24px;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

/* ── Options / Choices ── */
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  transition: border-color 0.2s;
}

.option:hover {
  border-color: var(--accent);
}

.option .letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.option .content h3 {
  margin-bottom: 4px;
}

.option .content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0;
}

/* ── Cards Grid ── */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-secondary);
}

.card-image {
  height: 120px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.card-body {
  padding: 12px;
}

.card-body h3 {
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.card-body p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

/* ── Mockup / UI Preview ── */
.mockup {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 16px 0;
  background: var(--bg-primary);
}

.mockup-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-weight: 600;
  gap: 8px;
}

.mockup-header::before {
  content: "";
  display: inline-flex;
  gap: 6px;
  width: 52px;
}

.mockup-body {
  padding: 16px;
  min-height: 200px;
}

/* ── Split Layout ── */
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 16px 0;
}

/* ── Pros & Cons ── */
.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}

.pros, .cons {
  padding: 16px;
  border-radius: var(--radius);
}

.pros {
  background: color-mix(in srgb, var(--success) 10%, var(--bg-primary));
  border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
}

.cons {
  background: color-mix(in srgb, var(--error) 10%, var(--bg-primary));
  border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
}

.pros h3 { color: var(--success); }
.cons h3 { color: var(--error); }

.pros ul, .cons ul {
  list-style: none;
  padding: 0;
}

.pros li::before { content: "\\2713 "; color: var(--success); font-weight: 700; }
.cons li::before { content: "\\2717 "; color: var(--error); font-weight: 700; }

.pros li, .cons li {
  padding: 4px 0;
  font-size: 0.9rem;
}

/* ── Mock Elements (Wireframing) ── */
.mock-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.mock-sidebar {
  width: 180px;
  min-height: 200px;
  padding: 12px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.mock-sidebar p, .mock-sidebar a {
  display: block;
  padding: 8px 12px;
  color: var(--text-secondary);
  border-radius: 4px;
  text-decoration: none;
  margin-bottom: 2px;
}

.mock-sidebar p:hover, .mock-sidebar a:hover {
  background: var(--bg-tertiary);
}

.mock-content {
  flex: 1;
  padding: 16px;
  min-height: 200px;
}

.mock-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: var(--accent);
  color: #fff;
  cursor: default;
}

.mock-button.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.mock-input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-primary);
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.placeholder {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 8px 0;
}

/* ── Table ── */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.85rem;
}

th, td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--bg-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* ── Utility ── */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.text-center { text-align: center; }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.p-4 { padding: 16px; }
.w-full { width: 100%; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.85rem; }
.text-muted { color: var(--text-secondary); }
.rounded { border-radius: var(--radius); }
.border { border: 1px solid var(--border-color); }
.bg-secondary { background: var(--bg-secondary); }
`;
