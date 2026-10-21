// Preloaded with `node --import` (see the "test" script). Lets the Server Actions run unchanged under
// node:test: resolves the "@/..." alias and swaps the Next-specific modules and the Supabase client
// for small stubs. Everything else (Prisma, Postgres, lib/*) is real.
import { register } from "node:module";

register("./hooks.mjs", import.meta.url);
