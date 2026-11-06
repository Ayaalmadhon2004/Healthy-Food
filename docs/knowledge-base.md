---
title: Knowledge base: adding and verifying documents
type: operation
created: 2026-11-04
updated: 2026-11-06
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
  "sourceDate": "date exactly as shown on the page",
  "summary": { "ar": "...", "en": "..." }
}
```

Rules: `id` is a unique lowercase slug and is the stable key, do not rename it. Both languages are required (Modern Standard Arabic). `sourceUrl` must be https. Run `npm run ingest -- --dry-run` before committing; it reports every problem.

### Write a summary (optional field, expected for every document)

The "general tips" overview (`lib/rag/overview.ts`, `buildOverviewAnswer`) shows ONE sentence per topic: the first sentence of the best passage. For a document that opens with a description (for example how MUAC is measured) that sentence is not advice. `summary` fixes this without any schema change: `chunkDocument` writes it as the line right after the title of the document's FIRST chunk (per language), so `sentencesOf(chunk)[0]` returns it. Later chunks of a long document do not repeat it, and it is an extra header line that is not counted in `MAX_CHUNK_CHARS`. Existing rows are only updated when `npm run ingest` is run again.

Rules (checked by `validateCuratedDocument` and `tests/rag-contracts.test.js`):

- One sentence, 25 to 220 characters, ending with `. ! ? ؟` (no sentence end in the middle, no line break; decimals such as `12.5` are fine). `summary.ar` must contain Arabic letters, `summary.en` must contain Latin letters and no Arabic.
- One actionable sentence: what the reader should do or keep in mind ("Make each feed fresh...", "If the MUAC is below 12.5 cm, ask a clinic..."), not a description of the source or a statistic.
- Worded strictly from the document's own `content`: no new fact, number or advice. The contract test requires at least 70% of the summary's words to occur in the title and content of the same language.
- Dated background (surveys, IPC) gets a summary that points to the live source ("check the IPC website...") instead of repeating old numbers.
- If the summary repeats a sentence of the content word for word, `sentencesOf` quotes it only once.

### Overview topics

`OVERVIEW_TOPICS` (en and ar, same topic at the same index) lists the queries asked for a general request. `chat.ts` keeps the first `OVERVIEW_MAX_POINTS` (9) topics that found a passage, so the ORDER is the priority and the last topics (hand washing, dietary variety) are only fallbacks. When adding a topic, word the query like the document's title and summary, add it in both languages and keep a test in `tests/rag-overview.test.js` that names it.

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
- Not covered (no source found): stretching staples, fuel-saving cooking, warning-sign lists for malnutrition (the gaps below were partly closed on 2026-11-06).

When who.int, unicef.org and reliefweb.int are reachable, re-verify each document against its page, fix the `sourceDate`, and fill the gaps above.

## Gap documents added 2026-11-06 (`data/knowledge/gap-*.json`)

Collected the same way (web search summaries only; `sourceDate` reads "accessed 2026-11-06 (via web search summary)"). Every one has a `summary`, and so do the 19 earlier documents (their text is unchanged).

| Document id | Source | What it says |
| --- | --- | --- |
| `formula-safe-preparation` | WHO powdered infant formula guidelines (who.int) | powder is not sterile; make each feed fresh; no fridge means no feeds in advance; discard leftovers after two hours |
| `complementary-feeding-schedule` | WHO complementary feeding page (who.int) | start at 6 months with breastfeeding continuing; meals per day by age; textures |
| `complementary-feeding-guideline` | WHO 2023 complementary feeding guideline (who.int) | diverse diet, animal source foods daily, responsive feeding |
| `insulin-storage-medlineplus` | MedlinePlus Medical Encyclopedia | unopened vs opened insulin, temperatures, 28 days, product differences |
| `pregnancy-healthy-diet` | WHO ELENA (who.int) | foods for a healthy diet in pregnancy; nutrition education in undernourished populations |
| `breastfeeding-women-micronutrients-unicef` | UNICEF (Arabic maternal nutrition page) | supplements for breastfeeding women exist; ask a health worker, no amounts |
| `dry-food-storage-usda` | USDA FSIS shelf-stable food page | where to keep rice, flour, pasta, cans; general, not Gaza-specific, no spoilage signs |

Still uncovered or only partly covered: fuel-saving cooking (no official text found), iron and vitamin A/D through food (no official text found; only the UNICEF supplement statement above), how to recognise spoiled flour, rice and lentils, a WHO/IDF statement on insulin without refrigeration (the only hit was an MSF study, not used), and the cup-feeding steps of the WHO leaflet. The salt limit (under 5 g a day for adults) is already in `safety-healthy-diet-variety`.
