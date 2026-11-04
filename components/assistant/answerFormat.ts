// Pure, safe renderer model for the fixed answer shape (a line, "- " bullets, a caution, [n] markers).
// It returns plain data; React renders it as text nodes, so nothing the model (or an attacker who talks the
// model into it) writes can become markup.

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "cite"; n: number };

export type Block =
  | { kind: "p"; inlines: Inline[] }
  | { kind: "ul"; items: Inline[][] };

const MAX_CITE = 99;

/** **bold** and [n] markers. An unclosed ** (text still streaming) stays literal. */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const push = (kind: "text" | "bold", value: string): void => {
    if (!value) return;
    const last = out[out.length - 1];
    if (kind === "text" && last?.kind === "text") last.text += value;
    else out.push({ kind, text: value });
  };

  const pattern = /\*\*([^*\n]+?)\*\*|\[(\d{1,2})\]/g;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    push("text", text.slice(index, start));
    if (match[1] !== undefined) {
      push("bold", match[1]);
    } else {
      const n = Number(match[2]);
      if (n >= 1 && n <= MAX_CITE) out.push({ kind: "cite", n });
      else push("text", match[0]);
    }
    index = start + match[0].length;
  }
  push("text", text.slice(index));
  return out;
}

/** Splits the answer into paragraphs and bullet lists. Blank lines separate paragraphs. */
export function parseAnswer(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: Inline[][] | null = null;

  const flushParagraph = (): void => {
    if (paragraph.length) blocks.push({ kind: "p", inlines: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = (): void => {
    if (list) blocks.push({ kind: "ul", items: list });
    list = null;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const bullet = /^[-•*]\s+(.+)$/.exec(line);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet && !line.startsWith("**")) {
      flushParagraph();
      (list ??= []).push(parseInline(bullet[1]));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Only absolute http(s) URLs may become links. Anything else (javascript:, data:, relative) is dropped. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
