// Lets plain Node load the lib/rag TypeScript sources: extensionless relative imports ("./constants") resolve to .ts/.tsx.
// Importing this file registers the hook once; the shared tests/helpers hooks (the "@/..." alias and the stubs) are untouched.
import { register } from "node:module";

const hook = `
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
export function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\\.[a-z]+$/.test(specifier) && context.parentURL?.startsWith("file:")) {
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      const url = new URL(specifier + ext, context.parentURL);
      if (existsSync(fileURLToPath(url))) return { url: pathToFileURL(fileURLToPath(url)).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
`;

register("data:text/javascript," + encodeURIComponent(hook));
