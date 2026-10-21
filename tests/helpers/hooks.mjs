import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../../", import.meta.url);
const stub = (name) => new URL(`./stubs/${name}`, import.meta.url).href;

const STUBS = {
  "next/cache": stub("next-cache.mjs"),
  "next/headers": stub("next-headers.mjs"),
  "next/navigation": stub("next-navigation.mjs"),
  "@/lib/supabase/server": stub("supabase-server.mjs"),
};

export function resolve(specifier, context, nextResolve) {
  if (STUBS[specifier]) return { url: STUBS[specifier], shortCircuit: true };

  if (specifier.startsWith("@/")) {
    const base = new URL(specifier.slice(2), root);
    const candidates = [base, ...[".ts", ".tsx", ".js"].map((ext) => new URL(base.href + ext))];
    const found = candidates.find((u) => /\.[a-z]+$/.test(u.pathname) && existsSync(fileURLToPath(u)));
    if (found) return { url: pathToFileURL(fileURLToPath(found)).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
