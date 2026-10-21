import { revalidatePath } from "next/cache";
import { LOCALES, localePath } from "@/lib/i18n-routing";

// Every page exists once per language, so a change has to refresh both URLs.
// `path` is the page's path without a locale, e.g. "/dashboard/reports".
export function revalidateLocalized(path: string): void {
  for (const lang of LOCALES) revalidatePath(localePath(lang, path));
}
