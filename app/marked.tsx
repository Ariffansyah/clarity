import type { ReactNode } from "react";
import { RULE_LABELS, RULE_WEIGHTS, type Span } from "@/lib/analyze";

// Renders text with highlighter marks. Overlapping matches keep the earliest, longest one.
export default function Marked({ text, spans, active }: { text: string; spans: Span[]; active?: string | null }) {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: ReactNode[] = [];
  let pos = 0;
  let n = 0;
  for (const s of sorted) {
    if (s.start < pos) continue;
    if (s.start > pos) out.push(text.slice(pos, s.start));
    out.push(
      <mark
        key={s.start}
        className="hl"
        title={RULE_LABELS[s.rule] ?? "Ditandai AI"}
        data-heavy={RULE_WEIGHTS[s.rule] >= 3}
        data-dim={!!active && active !== s.rule}
        style={{ "--i": n++ } as React.CSSProperties}
      >
        {text.slice(s.start, s.end)}
      </mark>,
    );
    pos = s.end;
  }
  out.push(text.slice(pos));
  return <>{out}</>;
}
