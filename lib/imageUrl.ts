// Validation for an optional photo link typed by an admin. Only two shapes are
// accepted: an absolute https URL, or a path under /assets/ (files in public/).
// Everything else (javascript:, data:, http:, "//host", spaces, ...) is rejected.

export const MAX_IMAGE_URL_LENGTH = 500;

/** True when the value is a safe https URL or an /assets/ path (no trimming). */
export function isValidImageUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAX_IMAGE_URL_LENGTH) return false;
  if (/[\s\\<>"'`]/.test(value) || /[\u0000-\u001f\u007f]/.test(value)) return false;

  if (value.startsWith("/assets/")) {
    return !value.split("/").some((part) => part === ".." || part === ".");
  }

  if (!value.startsWith("https://")) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0 && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

/**
 * Reads an optional photo link from a form value.
 * Returns null for an empty value (clears the photo), the cleaned string when
 * valid, or undefined when the value is not acceptable.
 */
export function parseImageUrl(raw: unknown): string | null | undefined {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (value === "") return null;
  return isValidImageUrl(value) ? value : undefined;
}
