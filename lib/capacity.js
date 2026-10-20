export const DEFAULT_CAPACITY = 500;
export const MAX_CAPACITY = 100000;

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(text) {
  return text.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

// Reads a capacity from every format found in the database:
// a number, "500", "350-500 families", or { en, ar } of those. Returns a positive integer or null.
export function parseCapacity(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 1 ? Math.min(Math.floor(value), MAX_CAPACITY) : null;
  }

  if (typeof value === "string") {
    const numbers = normalizeDigits(value).match(/\d+/g);
    if (!numbers) return null;
    return parseCapacity(Math.max(...numbers.map(Number)));
  }

  if (typeof value === "object") {
    return parseCapacity(value.en) ?? parseCapacity(value.ar);
  }

  return null;
}

export function getCapacityLimit(value) {
  return parseCapacity(value) ?? DEFAULT_CAPACITY;
}

// Strict check for form input: a whole number from 1 to MAX_CAPACITY, else null.
export function validateCapacityInput(raw) {
  const text = normalizeDigits(String(raw ?? "").trim());
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX_CAPACITY ? n : null;
}

// Text for display; keeps the localized label of legacy { en, ar } values.
export function formatCapacity(value, lang = "ar") {
  if (value && typeof value === "object" && typeof value[lang] === "string" && value[lang]) {
    return value[lang];
  }
  const n = parseCapacity(value);
  return n == null ? "" : String(n);
}
