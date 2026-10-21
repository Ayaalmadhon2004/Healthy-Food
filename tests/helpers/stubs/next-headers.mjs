export async function cookies() {
  return { getAll: () => [], get: (name) => (name === "lang" ? { name, value: "en" } : undefined), set() {} };
}
export async function headers() {
  return new Headers();
}
