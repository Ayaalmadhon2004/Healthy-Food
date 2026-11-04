import { Fragment } from "react";
import { parseAnswer, type Inline } from "./answerFormat";

interface Props {
  text: string;
  /** Anchor prefix of this message's source list; markers link to `${anchor}-${n}`. */
  anchor: string;
  citationCount: number;
  jumpLabel: (n: number) => string;
}

function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

// Renders parsed answer blocks as React text nodes. No HTML is ever injected.
export default function AnswerBody({ text, anchor, citationCount, jumpLabel }: Props) {
  const renderInlines = (inlines: Inline[]) =>
    inlines.map((part, i) => {
      if (part.kind === "bold") return <strong key={i} className="font-semibold text-ink">{part.text}</strong>;
      if (part.kind === "cite") {
        if (part.n > citationCount) return <Fragment key={i}>[{part.n}]</Fragment>;
        const id = `${anchor}-${part.n}`;
        return (
          <sup key={i} className="mx-0.5">
            <a
              href={`#${id}`}
              onClick={(e) => jumpTo(e, id)}
              aria-label={jumpLabel(part.n)}
              className="inline-block min-w-5 px-1 rounded-sm bg-olive-100 text-olive-900 text-xs font-semibold text-center no-underline hover:bg-olive-200"
            >
              {part.n}
            </a>
          </sup>
        );
      }
      return <Fragment key={i}>{part.text}</Fragment>;
    });

  return (
    <div className="space-y-3 leading-relaxed break-words">
      {parseAnswer(text).map((block, i) =>
        block.kind === "ul" ? (
          <ul key={i} className="list-disc ps-5 space-y-1.5 marker:text-olive-600">
            {block.items.map((item, j) => (
              <li key={j}>{renderInlines(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInlines(block.inlines)}</p>
        ),
      )}
    </div>
  );
}
