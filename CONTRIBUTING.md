# Contributing to NutriFlow

Thanks for wanting to help. Small fixes, translations and new recipes or tips are all welcome.

## Getting set up

Follow **Run it locally** in the [README](README.md). You need Node.js 22.18+, PostgreSQL and a Supabase project.

## Before you open a pull request

```bash
npm run lint
npm run typecheck
npm test
```

CI runs the same checks plus a production build, so please make sure they pass locally first.

## Guidelines

- **Branch from `main`** and keep each pull request to one change.
- **Both languages.** Any text the user sees goes in `locales/en.json` and `locales/ar.json`. The locale test fails if a key exists in only one of them.
- **Right to left.** Check Arabic pages too. Prefer logical properties (`ms-*`, `ps-*`, `text-start`) over left/right.
- **Follow the look.** Use the design tokens in `app/globals.css` instead of new colours, and keep motion respectful of `prefers-reduced-motion`.
- **Never trust the browser for identity.** Read the user from the session (`lib/auth.ts`), not from request data.
- **Add a test** when you change logic in `lib/` or `app/actions/`.
- **Commit messages:** short and plain, in the imperative ("Fix capacity parsing for ranges").

## Reporting problems

Open an [issue](https://github.com/Ayaalmadhon2004/Healthy-Food/issues/new/choose). For security problems, see [SECURITY.md](SECURITY.md) instead.
