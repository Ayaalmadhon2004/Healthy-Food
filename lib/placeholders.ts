// Illustrated fallbacks for places that show a photo. The files live in
// public/assets/placeholders and are picked deterministically, so the same
// recipe, doctor or kitchen always gets the same picture.

export type PlaceholderKind = "dish" | "doctor" | "kitchen" | "tip";

const BASE = "/assets/placeholders";

const VARIANTS: Record<PlaceholderKind, readonly string[]> = {
  dish: ["dish-bowl.svg", "dish-plate.svg"],
  doctor: ["doctor-1.svg", "doctor-2.svg", "doctor-3.svg", "doctor-4.svg", "doctor-5.svg"],
  kitchen: ["kitchen-pot.svg", "kitchen-table.svg"],
  tip: ["tip-water.svg", "tip-leaf.svg", "tip-rest.svg", "tip-move.svg"],
};

// Tips carry an icon name in the database; use it to choose a matching picture.
const TIP_BY_ICON: Record<string, string> = {
  Droplet: "tip-water.svg",
  Leaf: "tip-leaf.svg",
  Bed: "tip-rest.svg",
  Activity: "tip-move.svg",
};

// Small stable string hash (FNV-1a). Same input always gives the same number.
function hash(seed: string | number): number {
  const text = String(seed);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function placeholderFor(kind: PlaceholderKind, seed: string | number = 0, hint?: string | null): string {
  if (kind === "tip" && hint && TIP_BY_ICON[hint]) return `${BASE}/${TIP_BY_ICON[hint]}`;
  const list = VARIANTS[kind];
  return `${BASE}/${list[hash(seed) % list.length]}`;
}

export function isPlaceholder(src: string): boolean {
  return src.startsWith(`${BASE}/`);
}

// The seed data used to give every doctor the same stock photo. Treat that file
// as "no photo yet" so each doctor gets their own illustrated avatar instead.
const SHARED_DOCTOR_PHOTO = "/assets/doctor1.jpg";

export function doctorPhoto(image: string | null | undefined): string | null {
  if (!image || image === SHARED_DOCTOR_PHOTO) return null;
  return image;
}
