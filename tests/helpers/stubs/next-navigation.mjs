// Like Next, redirect() works by throwing.
export function redirect(url) {
  const error = new Error("NEXT_REDIRECT");
  error.digest = `NEXT_REDIRECT;replace;${url};307;`;
  error.redirectUrl = url;
  throw error;
}
export function notFound() {
  throw new Error("NEXT_NOT_FOUND");
}
