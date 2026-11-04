---
title: Knowledge base: adding and verifying documents
type: operation
created: 2026-11-04
updated: 2026-11-04
sources:
  - code: scripts/ingest-knowledge.ts
  - code: lib/rag/chunking.ts
  - code: tests/rag-chunking.test.js
  - code: data/knowledge
verified_at: 5603716
---

# Knowledge base (RAG)

The nutrition assistant answers only from passages stored in the `KnowledgeChunk` table. Passages come from two places:

1. The app's own rows: recipes, health tips and community kitchens (`lib/rag/sources.ts`).
2. Curated documents in `data/knowledge/*.json` about nutrition in Gaza, each with a named official source.

## Status

`data/knowledge/` is currently EMPTY. The session that built the ingestion could not reach any official site (who.int, unicef.org, ipcinfo.org: DNS failure, host not in the network allow-list), and the rule is to include nothing that was not read on a fetched page. Allow those hosts and fetch the pages listed under "Not verified", then add the documents.

## Run

```bash
# once, in this order (see the comments inside prisma/rag-setup.sql):
#   1. run the CREATE EXTENSION part of prisma/rag-setup.sql (Supabase SQL editor or psql)
#   2. npx prisma db push
#   3. run the two CREATE INDEX statements of prisma/rag-setup.sql
npx prisma db push

npm run ingest -- --dry-run   # validate + counts, no database, no model download, works offline
npm run ingest                # build chunks and upsert (needs DATABASE_URL). With RAG_RETRIEVER=pgvector it also embeds them and downloads the model on first run
npm run ingest -- --dry-run --dir path/to/other/folder
```

Ingestion only upserts (keyed by `sourceKey`); it never deletes. If a recipe is deleted or a document id is renamed, remove its stale rows by hand. If the embedder is unavailable, chunks are still stored (without a vector) and found by full-text search only; run `npm run ingest` again later to add vectors.

## Chunking

`lib/rag/chunking.ts` (pure, unit-tested in `tests/rag-chunking.test.js`): one chunk per language per row, key `recipe:12:ar`, `tip:3:en`, `kitchen:1:ar`, `doc:<id>:ar`. The language is its own `:` segment because retrieval de-duplicates ar/en twins by removing the `ar`/`en` segments (`sourceStem` in `lib/rag/fusion.ts`). Text over about 900 characters is split on paragraph/sentence boundaries with a ~120 character overlap; split chunks are keyed `...:ar:1`, `...:ar:2`. Every chunk starts with the document title so it is self-contained. Ar and en may split into a different number of parts.

Recipe text is written as one fact per line, each a full sentence, because the extractive answerer (`lib/rag/extractive.ts`) quotes whole sentences (split on `. ! ? ؟` and newlines, ignoring those under 25 characters and cutting those over 240): a basics line (type, time, calories), a nutrition line, `Ingredients: a, b, c.` (a very long list continues on further lines of at most 220 characters) and one `Step n: ...` line per step.

> ⚠️ Keep every fact line at 25 characters or more and under 240. A bare `Calories: 320 cal` line would be dropped by the extractive answerer, and a long blob would be cut mid-sentence.

### Kitchens: what is embedded and what is not

Kitchen rows change every day. The chunk keeps the stable facts (name, region, location, distribution time, access information) and the contact phone number, because the phone number is the reason someone looks for a kitchen. It does NOT embed today's meal or the capacity: a stored chunk is only refreshed when `npm run ingest` runs, so it would answer with food that is no longer served or places that are gone, which is worse than no answer. Instead the last line of every kitchen chunk (localized) says that today's menu and remaining places are on the Kitchens page of the app (shown in the menu as "Gaza Kitchen"). `KitchenRow` still accepts `capacity` and `todaysMeal` so the Prisma row can be passed as is; they are ignored.

> ⚠️ Do not add `todaysMeal` or `capacity` back to the kitchen chunk. A test (`tests/rag-chunking.test.js`) fails if the chunk changes when only those fields change. The phone number can also go stale: re-run ingestion after editing a kitchen's contact.

## Add a curated document

Create or edit a JSON file in `data/knowledge/` (one file per topic): an array of

```json
{
  "id": "ors-home-care",
  "title": { "ar": "...", "en": "..." },
  "content": { "ar": "...", "en": "..." },
  "sourceName": "WHO",
  "sourceUrl": "https://...",
  "sourceDate": "date exactly as shown on the page"
}
```

Rules: `id` is a unique lowercase slug and is the stable key, do not rename it. Both languages are required (Modern Standard Arabic). `sourceUrl` must be https. Run `npm run ingest -- --dry-run` before committing; it reports every problem.

## Source policy

- Official sources only: WHO, UNICEF, WFP, IPC (ipcinfo.org), Nutrition Cluster/OCHA, UNRWA, Palestinian Ministry of Health.
- Write your own concise paraphrase; never copy long passages.
- Never add a fact, number, dose or statistic that you did not read on the cited page. If you cannot verify it, leave it out and list it below.
- No medication dosing. Prefer qualitative, actionable guidance and "seek care" triggers.
- `sourceDate` is the date shown on the page (publication or last update), copied exactly.

## Not verified (to do once the hosts are reachable)

No claim has been verified yet. Topics still to be researched and written, with the intended source:

| Topic | Intended source |
| --- | --- |
| Safe water, treating water | WHO drinking-water fact sheet; WHO household water treatment |
| Oral rehydration, diarrhoea in children | WHO diarrhoeal disease fact sheet; UNICEF |
| Infant and young child feeding, breastfeeding | WHO infant and young child feeding fact sheet; Nutrition Cluster |
| Acute malnutrition signs, when to seek care | WHO malnutrition fact sheet; UNICEF; Nutrition Cluster |
| Pregnancy and lactation nutrition | WHO |
| Diabetes / hypertension diet with limited supplies | WHO diabetes and hypertension fact sheets; Ministry of Health |
| Food safety without refrigeration | WHO food safety fact sheet (five keys) |
| Stretching scarce staples (lentils, rice, bulgur, flour, canned food) | WFP / Nutrition Cluster guidance |
| Micronutrients (iron, vitamin A/D) | WHO; UNICEF |
| Current situation context | IPC (ipcinfo.org); OCHA |

A search snippet seen during development (WHO diarrhoea page: ORS is a solution of clean water, sugar and salt; continue fluids until diarrhoea stops; soup or rice water if ORS is unavailable) was NOT used: it was not read on a fetched page and had no date.

## How the current documents were gathered (read this before trusting them)

The 2026-11-04 batch (19 documents, `data/knowledge/feeding-*.json` and `safety-*.json`) was collected through web *search* only, because the session could not open who.int, unicef.org or reliefweb.int directly. Each document paraphrases what the search result summaries stated about the cited page, so:

- Every `sourceDate` reads "accessed 2026-11-04 (via web search summary)", not the publication date. Open `sourceUrl` to confirm wording and date before relying on a document for anything important.
- Several documents are dated background (surveys, IPC snapshots) and say so in their text; they are not current facts.
- General emergency guidance (water, hand hygiene, food safety, carbon monoxide) comes from CDC and WHO pages and is not Gaza-specific.
- Left out on purpose: medication or supplement doses, home-made ORS amounts, chlorine quantities, case counts and recovery rates that could not be tied to a dated page, and anything from non-official hosts.
- Not covered (no source found): preparing formula with limited water or fuel, practical complementary-feeding advice for 6-24 months, storing flour/rice/lentils without a fridge, stretching staples, insulin storage, fuel-saving cooking, warning-sign lists for malnutrition.

When who.int, unicef.org and reliefweb.int are reachable, re-verify each document against its page, fix the `sourceDate`, and fill the gaps above.
