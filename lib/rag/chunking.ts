// Pure, deterministic helpers that turn the app's rows and curated documents into ChunkInput[].
// No I/O here: lib/rag/sources.ts reads the database and the JSON files and calls these.
import { asLocalized, asLocalizedField, pickList, pickText } from "@/lib/types";
import type { Lang } from "@/lib/types";
import type { ChunkInput, KnowledgeKind } from "@/lib/rag/types";

export const MAX_CHUNK_CHARS = 900;
export const CHUNK_OVERLAP_CHARS = 120;

const LANGS: readonly Lang[] = ["ar", "en"];

/** Longest ingredient line; longer lists continue on the next line (extractive answers cut sentences at 240 chars). */
const MAX_LIST_LINE_CHARS = 220;
const LIST_SEPARATOR: Record<Lang, string> = { en: ", ", ar: "، " };

const LABELS: Record<Lang, Record<string, string>> = {
  en: {
    type: "Meal type",
    time: "Preparation time",
    calories: "Calories",
    nutrition: "Nutrition",
    ingredients: "Ingredients",
    steps: "Steps",
    advice: "Advice",
    location: "Location",
    region: "Region",
    distribution: "Distribution time",
    access: "Access",
    contact: "To reach the kitchen, call",
    step: "Step",
    liveInfo: "Today's menu and remaining places are on the Kitchens page of the app (Gaza Kitchen in the menu).",
  },
  ar: {
    type: "نوع الوجبة",
    time: "وقت التحضير",
    calories: "السعرات الحرارية",
    nutrition: "القيم الغذائية",
    ingredients: "المكونات",
    steps: "الخطوات",
    advice: "النصيحة",
    location: "الموقع",
    region: "المنطقة",
    distribution: "وقت التوزيع",
    access: "طريقة الاستفادة",
    contact: "للتواصل مع المطبخ اتصلوا على",
    step: "الخطوة",
    liveInfo: "قائمة وجبة اليوم والأماكن المتبقية موجودة في صفحة المطابخ في التطبيق (مطبخ غزة في القائمة).",
  },
};

export interface SourceInfo {
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
}

function clean(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Splits a long paragraph on sentence ends, then on spaces, so no piece exceeds max. */
function splitParagraph(paragraph: string, max: number): string[] {
  if (paragraph.length <= max) return [paragraph];
  const sentences = paragraph.split(/(?<=[.!?؟۔…])\s+/);
  const pieces: string[] = [];
  let current = "";
  const flush = (): void => {
    if (current) pieces.push(current);
    current = "";
  };
  for (const sentence of sentences) {
    if (sentence.length > max) {
      flush();
      let rest = sentence;
      while (rest.length > max) {
        let cut = rest.lastIndexOf(" ", max);
        if (cut <= 0) cut = max;
        pieces.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      current = rest;
    } else if (current && current.length + 1 + sentence.length > max) {
      flush();
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  flush();
  return pieces;
}

/** The last part of `text` (at most `size` chars, starting at a word boundary) used as overlap. */
function tail(text: string, size: number): string {
  if (size <= 0 || text.length <= size) return size > 0 ? text : "";
  const slice = text.slice(text.length - size);
  const space = slice.indexOf(" ");
  return space === -1 ? slice : slice.slice(space + 1);
}

/**
 * Splits text on paragraph boundaries into pieces of at most `max` chars. Consecutive pieces
 * share a short overlap (the end of the previous piece) so no thought is cut in half.
 * `max` is the budget for the piece including its overlap.
 */
export function splitText(text: string, max: number = MAX_CHUNK_CHARS, overlap: number = CHUNK_OVERLAP_CHARS): string[] {
  const body = clean(text);
  if (!body) return [];
  if (body.length <= max) return [body];

  const budget = Math.max(1, max - overlap - 1);
  const paragraphs = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => splitParagraph(p, budget));

  const groups: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + 1 + paragraph.length > budget) {
      groups.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n${paragraph}` : paragraph;
    }
  }
  if (current) groups.push(current);

  return groups.map((group, i) => (i === 0 ? group : `${tail(groups[i - 1], overlap)}\n${group}`));
}

/**
 * One document in one language -> one or more self-contained chunks (each repeats the title).
 * A single chunk keeps the bare key ("recipe:12:ar"); a split document gets "recipe:12:ar:1", ":2", ...
 */
export function chunkDocument(params: {
  baseKey: string;
  kind: KnowledgeKind;
  lang: Lang;
  title: string;
  body: string;
} & SourceInfo): ChunkInput[] {
  const title = clean(params.title);
  // Leave room for the repeated title line.
  const max = Math.max(200, MAX_CHUNK_CHARS - title.length - 1);
  const parts = splitText(params.body, max);
  if (parts.length === 0) return [];
  const source: SourceInfo = {};
  if (params.sourceName) source.sourceName = params.sourceName;
  if (params.sourceUrl) source.sourceUrl = params.sourceUrl;
  if (params.sourceDate) source.sourceDate = params.sourceDate;
  return parts.map((part, i) => ({
    sourceKey: parts.length === 1 ? `${params.baseKey}:${params.lang}` : `${params.baseKey}:${params.lang}:${i + 1}`,
    kind: params.kind,
    lang: params.lang,
    title,
    content: `${title}\n${part}`,
    ...source,
  }));
}

/** Ends a line with a full stop unless it already ends with sentence punctuation. */
function sentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return /[.!?؟۔…]$/.test(t) ? t : `${t}.`;
}

function line(label: string, value: string): string | null {
  const v = value.trim();
  return v ? sentence(`${label}: ${v}`) : null;
}

/** "Ingredients: a, b, c." on one line; a very long list continues on further lines, each a sentence of its own. */
function ingredientLines(label: string, items: string[], lang: Lang): string[] {
  const sep = LIST_SEPARATOR[lang];
  const lines: string[] = [];
  let current = `${label}: `;
  let empty = true;
  for (const raw of items) {
    const item = raw.trim();
    if (!item) continue;
    if (!empty && current.length + sep.length + item.length > MAX_LIST_LINE_CHARS) {
      lines.push(sentence(current.replace(/[,،]\s*$/, "")));
      current = "";
      empty = true;
    }
    current += empty ? item : `${sep}${item}`;
    empty = false;
  }
  if (!empty) lines.push(sentence(current));
  return lines;
}

/** One step per line: "Step 1: Warm the beans." */
function stepLines(label: string, steps: string[]): string[] {
  return steps
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i) => sentence(`${label} ${i + 1}: ${s}`));
}

export interface RecipeRow {
  id: number;
  title: unknown;
  type?: unknown;
  time?: unknown;
  cal?: unknown;
  nutrition?: unknown;
  ingredients?: unknown;
  instructions?: unknown;
}

export function recipeToChunks(row: RecipeRow): ChunkInput[] {
  const title = asLocalized(row.title);
  const type = asLocalized(row.type);
  const time = asLocalized(row.time);
  const cal = asLocalized(row.cal);
  const nutritionEntries: [string, ReturnType<typeof asLocalized>][] = [];
  if (row.nutrition && typeof row.nutrition === "object" && !Array.isArray(row.nutrition)) {
    for (const [key, value] of Object.entries(row.nutrition)) nutritionEntries.push([key, asLocalized(value)]);
  }

  const out: ChunkInput[] = [];
  for (const lang of LANGS) {
    if (!title[lang]) continue;
    const L = LABELS[lang];
    const nutrition = nutritionEntries
      .map(([key, value]) => `${key} ${value[lang]}`.trim())
      .filter(Boolean)
      .join(lang === "ar" ? "، " : ", ");
    const ingredients = ingredientLines(L.ingredients, pickList(row.ingredients, lang), lang);
    const steps = stepLines(L.step, pickList(row.instructions, lang));
    // One fact per line; the basics share one sentence so it is long enough to be quoted on its own.
    const basics = [
      [L.type, type[lang]],
      [L.time, time[lang]],
      [L.calories, cal[lang]],
    ]
      .filter(([, value]) => value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`)
      .join(LIST_SEPARATOR[lang]);
    const body = [basics ? sentence(basics) : null, line(L.nutrition, nutrition), ...ingredients, ...steps]
      .filter((x): x is string => Boolean(x))
      .join("\n");
    out.push(...chunkDocument({ baseKey: `recipe:${row.id}`, kind: "RECIPE", lang, title: title[lang], body }));
  }
  return out;
}

export interface TipRow {
  id: number;
  header: unknown;
  advice?: unknown;
  details?: unknown;
  moreDetails?: unknown;
}

export function tipToChunks(row: TipRow): ChunkInput[] {
  const header = asLocalized(row.header);
  const advice = asLocalized(row.advice);
  const details = asLocalized(row.details);
  const more = asLocalized(row.moreDetails);
  const out: ChunkInput[] = [];
  for (const lang of LANGS) {
    if (!header[lang]) continue;
    const body = [line(LABELS[lang].advice, advice[lang]), details[lang].trim(), more[lang].trim()]
      .filter((x): x is string => Boolean(x))
      .join("\n\n");
    out.push(...chunkDocument({ baseKey: `tip:${row.id}`, kind: "TIP", lang, title: header[lang], body }));
  }
  return out;
}

export interface KitchenRow {
  id: number;
  name: unknown;
  location?: unknown;
  region?: unknown;
  distributionTime?: unknown;
  /** Accepted for row compatibility but never embedded: it changes daily (see docs/knowledge-base.md). */
  capacity?: unknown;
  /** Accepted for row compatibility but never embedded: it changes daily (see docs/knowledge-base.md). */
  todaysMeal?: unknown;
  accessInfo?: unknown;
  contact?: string | null;
}

export function kitchenToChunks(row: KitchenRow): ChunkInput[] {
  const out: ChunkInput[] = [];
  for (const lang of LANGS) {
    const name = pickText(asLocalizedField(row.name), lang);
    if (!name) continue;
    const L = LABELS[lang];
    const field = (value: unknown): string => pickText(asLocalizedField(value), lang).trim();
    const region = field(row.region);
    const location = field(row.location);
    const place = location && region ? `${location} (${L.region}: ${region})` : location || (region ? `${L.region}: ${region}` : "");
    const contact = (row.contact ?? "").trim();
    // Today's meal and remaining capacity change daily, so they are NOT embedded; the last line points to the live page.
    const body = [
      place ? sentence(location ? `${L.location}: ${place}` : place) : null,
      line(L.distribution, field(row.distributionTime)),
      line(L.access, field(row.accessInfo)),
      contact ? sentence(`${L.contact} ${contact}`) : null,
      L.liveInfo,
    ]
      .filter((x): x is string => Boolean(x))
      .join("\n");
    out.push(...chunkDocument({ baseKey: `kitchen:${row.id}`, kind: "KITCHEN", lang, title: name, body }));
  }
  return out;
}

/** A curated document as stored in data/knowledge/*.json. */
export interface CuratedDocument {
  id: string;
  title: Record<Lang, string>;
  content: Record<Lang, string>;
  sourceName: string;
  sourceUrl: string;
  sourceDate: string;
}

/** Returns a list of problems (empty = valid). Used by sources.ts and `--dry-run`. */
export function validateCuratedDocument(doc: unknown, where = "document"): string[] {
  const problems: string[] = [];
  if (!doc || typeof doc !== "object") return [`${where}: not an object`];
  const d = doc as Record<string, unknown>;
  const str = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
  if (!str(d.id) || !/^[a-z0-9][a-z0-9-]*$/.test(d.id)) problems.push(`${where}: id must be a lowercase slug`);
  for (const field of ["title", "content"] as const) {
    const value = d[field] as Record<string, unknown> | undefined;
    for (const lang of LANGS) {
      if (!value || !str(value[lang])) problems.push(`${where}: ${field}.${lang} is missing`);
    }
  }
  for (const field of ["sourceName", "sourceUrl", "sourceDate"] as const) {
    if (!str(d[field])) problems.push(`${where}: ${field} is missing`);
  }
  if (str(d.sourceUrl) && !/^https:\/\//.test(d.sourceUrl)) problems.push(`${where}: sourceUrl must be https`);
  return problems;
}

export function curatedToChunks(doc: CuratedDocument): ChunkInput[] {
  const out: ChunkInput[] = [];
  for (const lang of LANGS) {
    out.push(
      ...chunkDocument({
        baseKey: `doc:${doc.id}`,
        kind: "DOCUMENT",
        lang,
        title: doc.title[lang],
        body: doc.content[lang],
        sourceName: doc.sourceName,
        sourceUrl: doc.sourceUrl,
        sourceDate: doc.sourceDate,
      }),
    );
  }
  return out;
}
