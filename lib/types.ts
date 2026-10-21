export type Lang = "ar" | "en";

export type Localized = Record<Lang, string>;

export function toLang(value: string | null | undefined): Lang {
  return value === "ar" ? "ar" : "en";
}

// A recipe row as returned by Prisma and shown in the UI.
export interface Recipe {
  id: number;
  img: string;
  title: Localized;
  type: Localized;
  time: Localized;
  cal: Localized;
  nutrition?: Record<string, Localized>;
  ingredients?: Record<Lang, string[]>;
  instructions?: Record<Lang, string[]>;
  [key: string]: unknown;
}

// A meal logged in the tracker (server rows and optimistic entries).
export interface TrackedMeal {
  id: string | number;
  mealType?: string;
  option?: string;
  foodName: string;
  calories: number;
  isOptimistic?: boolean;
}

// A text that may be stored localized ({ ar, en }) or, in older rows, as a plain string.
export type LocalizedField = Localized | string | null | undefined;

// A kitchen row plus the values the kitchen list adds (see getKitchensAction).
export interface KitchenView {
  id: number;
  name: LocalizedField;
  region: LocalizedField;
  location?: LocalizedField;
  distributionTime: LocalizedField;
  todaysMeal: LocalizedField;
  contact: string;
  capacity: unknown;
  capacityLimit?: number;
  reservedTomorrow?: number;
}

export function pickText(field: LocalizedField, lang: Lang): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.ar || "";
}

// Narrow a JSON column ({ ar, en } object, plain string, or anything else) to a LocalizedField.
export function asLocalizedField(value: unknown): LocalizedField {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const { ar, en } = value as Record<string, unknown>;
    return {
      ar: typeof ar === "string" ? ar : "",
      en: typeof en === "string" ? en : "",
    };
  }
  return null;
}

// Narrow a JSON column holding { ar: string[], en: string[] } to a list for one language.
export function pickList(value: unknown, lang: Lang): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const list = (value as Record<string, unknown>)[lang] ?? (value as Record<string, unknown>).ar;
  return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
}

// Narrow a JSON column to { ar, en } strings, filling anything missing with "".
export function asLocalized(value: unknown): Localized {
  const field = asLocalizedField(value);
  if (typeof field === "string") return { ar: field, en: field };
  return field ?? { ar: "", en: "" };
}

function asLocalizedLists(value: unknown): Record<Lang, string[]> {
  return { ar: pickList(value, "ar"), en: pickList(value, "en") };
}

// Convert a FoodRecipe row (JSON columns) into the typed shape the UI uses.
export function toRecipe(row: {
  id: number;
  img: string;
  title: unknown;
  type: unknown;
  time: unknown;
  cal: unknown;
  nutrition?: unknown;
  ingredients?: unknown;
  instructions?: unknown;
}): Recipe {
  const nutrition: Record<string, Localized> = {};
  if (row.nutrition && typeof row.nutrition === "object" && !Array.isArray(row.nutrition)) {
    for (const [key, value] of Object.entries(row.nutrition)) nutrition[key] = asLocalized(value);
  }
  return {
    id: row.id,
    img: row.img,
    title: asLocalized(row.title),
    type: asLocalized(row.type),
    time: asLocalized(row.time),
    cal: asLocalized(row.cal),
    nutrition,
    ingredients: asLocalizedLists(row.ingredients),
    instructions: asLocalizedLists(row.instructions),
  };
}
