// Declares the `jsx` / `global` props on <style> (used by styled-jsx).
// next-env.d.ts also pulls this in, but that file is generated and not committed,
// so a fresh checkout (e.g. CI) would otherwise fail `npm run typecheck`.
/// <reference types="styled-jsx" />
