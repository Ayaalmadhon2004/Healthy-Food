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
