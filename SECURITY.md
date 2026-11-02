# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private reporting: **Security → Report a vulnerability** on this repository. Include what you found, how to reproduce it, and what you think the impact is.

You can expect a first reply within a few days. Once a fix is released, you are welcome to be credited.

## Scope

Of particular interest: authentication and role checks (`USER`, `ORG`, `ADMIN`, `DOCTOR`), Server Actions, API routes, and anything that exposes personal or health data.

Never commit secrets. `.env` is git-ignored; use `.env.example` as the template.
