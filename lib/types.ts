export type Lang = "ar" | "en";

export type Localized = Record<Lang, string>;

export function toLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : "ar";
}

// A recipe row as returned by Prisma and shown in the UI.
export interface Recipe {
  id: number;
  img: string;
  title: Localized;
  type: Localized;
  time: Localized;
  cal: Localized;
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
