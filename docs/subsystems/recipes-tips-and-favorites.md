---
title: Recipes, tips and favorites
type: subsystem
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: lib/data.ts
  - code: app/api/favorites/route.ts
  - code: store/useFavStore.ts
  - code: components/recipes/AddToFavButton.tsx
  - code: app/[lang]/recipes/[id]/page.tsx
  - code: app/[lang]/tips/[id]/page.tsx
  - code: app/[lang]/favorites/page.tsx
  - code: prisma/schema.prisma
  - code: prisma/seed.js
  - code: app/api/doctors/route.ts
verified_at: 8b565be
---

# Recipes, tips and favorites

Recipes (`FoodRecipe`) and health tips (`HealthTip`) are read-only content seeded by `prisma/seed.js`; their text fields are `{ ar, en }` JSON.

## Reading content

`lib/data.ts` exposes `getRecipes`, `getRecipe(id)`, `getTips`, `getTip(id)`, `getDoctors`, `getNutritionGuide` and `getContentIds` (for the sitemap). Each is cached with `unstable_cache` for one hour under a tag (`recipes`, `tips`, `doctors`, `nutrition`) and selects only the columns the UI needs; list queries leave out the large ingredient and instruction JSON. `parseId` accepts only 1 to 9 digits, so a route segment like `1.5` or `abc` is not an id. The detail pages (`recipes/[id]`, `tips/[id]`) use `revalidate = 3600`.

> ⚠️ Re-seeding does not show up at once: cached lists live up to an hour. Nothing in the repo calls `revalidateTag` for these tags, so wait or redeploy after changing content (unverified for any manual purge outside the code).

## Favorites

`/api/favorites` works only for the signed-in user taken from the session ([[auth-and-roles]]):

- `GET` returns the user's favourites (an empty list when signed out) merged from the stored `recipeData` snapshot plus the recipe id.
- `POST { recipeId }` is a toggle: it removes an existing favourite or creates one, and answers `Removed` or `Added`. Unknown recipe ids get 404.

The client side is `store/useFavStore.ts` (Zustand): it updates the UI first and then calls the endpoint. `Favorite` is unique on user and recipe, and its `recipeData` snapshot is copied from the database row, never from the request body.

> ⚠️ The POST is a toggle, not an "add". A retried or double-fired request flips the state back. Keep the optimistic UI in step with the response.

> ⚠️ `recipeData` is JSON but older rows may hold it as a JSON string; `parseRecipeData` in the route tolerates both. Do not simplify it to a plain object cast.

The public `/api/doctors` list deliberately omits phone and email; see [[doctors-and-appointments]].
