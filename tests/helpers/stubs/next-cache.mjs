// Records revalidatePath calls so tests can assert on them.
globalThis.__revalidated ??= [];
export function revalidatePath(path) {
  globalThis.__revalidated.push(path);
}
export function revalidateTag() {}
