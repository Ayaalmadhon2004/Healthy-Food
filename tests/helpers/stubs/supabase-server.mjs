// The auth boundary: a fake Supabase client whose signed-in user is set by tests (see ../db.js signInAs).
// lib/auth.ts is real, so the role is still read from the database.
import { AsyncLocalStorage } from "node:async_hooks";

// signInAs() sets the default user; asUser() scopes one for a single async call chain so concurrent calls can differ.
globalThis.__testAuthUserId = null;
globalThis.__testAuthStorage ??= new AsyncLocalStorage();

export async function createSupabaseServerClient() {
  return {
    auth: {
      getUser: async () => {
        const scoped = globalThis.__testAuthStorage.getStore();
        const id = scoped ? scoped.id : globalThis.__testAuthUserId;
        return id ? { data: { user: { id } }, error: null } : { data: { user: null }, error: { message: "no session" } };
      },
    },
  };
}
export function getSupabaseAdmin() {
  throw new Error("getSupabaseAdmin is not available in tests");
}
export async function getSupabaseServer() {
  return createSupabaseServerClient();
}
