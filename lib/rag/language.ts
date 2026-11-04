// Which language to answer in: the language the visitor actually wrote, not the language of the page they happen to be
// on. A visitor on /en/assistant who types Arabic gets an Arabic answer, and the other way round.
import type { Lang } from "@/lib/types";

// Any letter: matches "م" and "w", rejects digits and punctuation such as "؟".
// https://regex101.com/?regex=%5Cp%7BL%7D&flags=gu
const LETTER = /\p{L}/gu;
// Arabic-script letter: matches "م", rejects "w". Used only on characters that are already letters.
// https://regex101.com/?regex=%5Cp%7BScript%3DArabic%7D&flags=u
const ARABIC_SCRIPT = /\p{Script=Arabic}/u;
// Latin letter: matches "w", rejects "م".
// https://regex101.com/?regex=%5BA-Za-z%5D
const LATIN_LETTER = /[A-Za-z]/;

/** "ar" or "en" by whichever script has more letters in the text; `fallback` when it has no such letters (digits only). */
export function detectLang(text: string, fallback: Lang): Lang {
  let arabic = 0;
  let latin = 0;
  for (const letter of text.match(LETTER) ?? []) {
    if (ARABIC_SCRIPT.test(letter)) arabic += 1;
    else if (LATIN_LETTER.test(letter)) latin += 1;
  }
  if (arabic === 0 && latin === 0) return fallback;
  return arabic >= latin ? "ar" : "en";
}
