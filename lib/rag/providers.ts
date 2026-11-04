// Picks the answer generator from the environment. Free by default:
//   LLM_PROVIDER=extractive  no key, no model: the answer is assembled from the retrieved passages (default)
//   LLM_PROVIDER=gemini      Google Gemini free tier (needs GEMINI_API_KEY); chosen automatically when that key is set
//   LLM_PROVIDER=anthropic   Claude (paid, needs ANTHROPIC_API_KEY); never chosen unless asked for explicitly
import { buildExtractiveAnswer, buildOverviewAnswer } from "@/lib/rag/extractive";
import { createGeminiGenerator } from "@/lib/rag/gemini";
import { generate as generateWithClaude } from "@/lib/rag/generate";
import type { AnswerGenerator, GenerateInput } from "@/lib/rag/generate";

export type Provider = "extractive" | "gemini" | "anthropic";

export function chooseProvider(env: NodeJS.ProcessEnv = process.env): Provider {
  const wanted = env.LLM_PROVIDER?.trim().toLowerCase();
  if (wanted === "anthropic" || wanted === "gemini" || wanted === "extractive") return wanted;
  return env.GEMINI_API_KEY ? "gemini" : "extractive";
}

async function* generateExtractive(input: GenerateInput) {
  const text = input.overviewIntro
    ? buildOverviewAnswer({ passages: input.passages ?? [], intro: input.overviewIntro, lang: input.lang ?? "en", disclaimer: input.disclaimer ?? "" })
    : buildExtractiveAnswer({ passages: input.passages ?? [], question: input.question, lang: input.lang ?? "en", disclaimer: input.disclaimer ?? "" });
  if (!text) {
    yield { type: "error", code: "unavailable" } as const;
    return;
  }
  yield { type: "delta", text } as const;
}

const gemini = createGeminiGenerator();

/** The generator used in production; chosen per call so tests and env changes take effect immediately. */
export const generate: AnswerGenerator = (input) => {
  const provider = chooseProvider();
  if (provider === "anthropic") return generateWithClaude(input);
  if (provider === "gemini") return gemini(input);
  return generateExtractive(input);
};
