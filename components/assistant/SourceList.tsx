import { ExternalLink } from "lucide-react";
import type { Citation } from "@/lib/rag/types";
import { safeHttpUrl } from "./answerFormat";
import type { AssistantDict } from "./types";

interface Props {
  citations: Citation[];
  anchor: string;
  t: AssistantDict;
}

export default function SourceList({ citations, anchor, t }: Props) {
  if (citations.length === 0) return null;
  return (
    <section aria-label={t.sources} className="mt-4 pt-3 border-t border-line">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">{t.sources}</h3>
      <ol className="space-y-2">
        {citations.map((c, i) => {
          const href = safeHttpUrl(c.sourceUrl);
          const meta = [c.sourceName, c.sourceDate].filter(Boolean).join(" · ");
          return (
            <li
              key={`${c.id}-${i}`}
              id={`${anchor}-${i + 1}`}
              tabIndex={-1}
              className="flex gap-2.5 text-sm rounded-md p-1.5 -m-1.5 scroll-mt-24 focus:bg-olive-100 focus:outline-none"
            >
              <span aria-hidden="true" className="shrink-0 w-5 h-5 mt-0.5 rounded-sm bg-olive-100 text-olive-900 text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink break-words">{c.title}</p>
                {meta && <p className="text-ink-mute break-words">{meta}</p>}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link inline-flex items-center gap-1 min-h-11 sm:min-h-0"
                  >
                    {t.open_source}
                    <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" className="rtl:-scale-x-100" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
