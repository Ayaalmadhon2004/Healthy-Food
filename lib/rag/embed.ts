// Local multilingual embeddings (multilingual-e5-small via transformers.js). Never throws: when the model
// cannot be loaded or run (offline, serverless limits, disabled) it logs once and returns nulls, and
// retrieval falls back to full-text search only. Importing this module does not load the model.
// @huggingface/transformers is an optionalDependency: when it is not installed the dynamic import below
// fails, which is handled like any other load failure (warn once, return nulls).
import { EMBEDDING_DIM, EMBEDDING_MODEL } from "@/lib/rag/constants";

const PASSAGE_PREFIX = "passage: ";
const QUERY_PREFIX = "query: ";
const BATCH_SIZE = 16;

/** Takes already-prefixed texts, returns one vector per text (mean pooled, L2 normalised). */
export type Embedder = (texts: string[]) => Promise<number[][]>;

type TransformersModule = {
  pipeline: (task: string, model: string) => Promise<(texts: string[], options: object) => Promise<{ tolist(): unknown }>>;
  env: { cacheDir?: string };
};

let moduleLoader: () => Promise<TransformersModule> = () =>
  import("@huggingface/transformers") as unknown as Promise<TransformersModule>;
let embedderPromise: Promise<Embedder | null> | null = null;
let injected: Embedder | null = null;
let warned = false;

function warnOnce(reason: unknown): void {
  if (warned) return;
  warned = true;
  const message = reason instanceof Error ? reason.message : String(reason);
  console.warn(`[rag] embeddings unavailable, falling back to full-text search only: ${message}`);
}

/** Tests: replace the loader of the optional transformers module (null restores the real import). Resets cached state. */
export function setModuleLoaderForTests(loader: (() => Promise<unknown>) | null): void {
  moduleLoader = loader
    ? (loader as () => Promise<TransformersModule>)
    : () => import("@huggingface/transformers") as unknown as Promise<TransformersModule>;
  embedderPromise = null;
  warned = false;
}

/** Tests: inject a fake embedder (or null to restore the real one). Also resets the cached state. */
export function setEmbedderForTests(embedder: Embedder | null): void {
  injected = embedder;
  embedderPromise = null;
  warned = false;
}

async function loadEmbedder(): Promise<Embedder | null> {
  try {
    if (process.env.RAG_DISABLE_EMBEDDINGS === "1") throw new Error("disabled by RAG_DISABLE_EMBEDDINGS");
    const { pipeline, env } = await moduleLoader();
    if (process.env.RAG_MODEL_CACHE_DIR) env.cacheDir = process.env.RAG_MODEL_CACHE_DIR;
    const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
    return async (texts: string[]): Promise<number[][]> => {
      const output = await extractor(texts, { pooling: "mean", normalize: true });
      return output.tolist() as number[][];
    };
  } catch (error) {
    warnOnce(error);
    return null;
  }
}

function getEmbedder(): Promise<Embedder | null> {
  if (injected) return Promise.resolve(injected);
  embedderPromise ??= loadEmbedder();
  return embedderPromise;
}

function isValidVector(v: unknown): v is number[] {
  return Array.isArray(v) && v.length === EMBEDDING_DIM && v.every((n) => Number.isFinite(n));
}

async function embedAll(texts: string[], prefix: string): Promise<(number[] | null)[]> {
  const result: (number[] | null)[] = texts.map(() => null);
  if (texts.length === 0) return result;
  try {
    const embedder = await getEmbedder();
    if (!embedder) return result;
    for (let start = 0; start < texts.length; start += BATCH_SIZE) {
      const batch = texts.slice(start, start + BATCH_SIZE).map((t) => prefix + t);
      const vectors = await embedder(batch);
      vectors.forEach((vector, i) => {
        if (isValidVector(vector)) result[start + i] = vector;
      });
    }
  } catch (error) {
    warnOnce(error);
  }
  return result;
}

export function embedPassages(texts: string[]): Promise<(number[] | null)[]> {
  return embedAll(texts, PASSAGE_PREFIX);
}

export async function embedQuery(text: string): Promise<number[] | null> {
  const [vector] = await embedAll([text], QUERY_PREFIX);
  return vector ?? null;
}
