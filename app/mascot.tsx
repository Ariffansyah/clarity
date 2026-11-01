const OUTLINE = { stroke: "#17181c", strokeWidth: 8.5, strokeLinecap: "round", fill: "none" } as const;
const CORE = { stroke: "#ffd84a", strokeWidth: 4, strokeLinecap: "round", fill: "none" } as const;
const STRIPE = { stroke: "#e0a31f", strokeWidth: 2.4, strokeLinecap: "round", fill: "none" } as const;

// Sorot, a highlighter-yellow kucing oren with a sharp eye for scams. Yellow parts keep a dark outline in both themes, like .btn-main.
export default function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 22 80 88" className={`mascot ${className ?? ""}`} aria-hidden>
      <ellipse cx="40" cy="105" rx="26" ry="3.5" fill="var(--shadow)" opacity=".2" />
      <g className="mascot-tail">
        <path d="M58 97c10 0 15-7 13-15s-1-9 2-12" {...OUTLINE} />
        <path d="M58 97c10 0 15-7 13-15s-1-9 2-12" {...CORE} />
      </g>
      <path d="M26 56 9 53M26 60 9 61M54 56l17-3M54 60l17 1" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M23 101c-5 0-6-4-5-9 2-12 7-25 22-25s20 13 22 25c1 5 0 9-5 9z"
        fill="#ffd84a"
        stroke="#17181c"
        strokeWidth="2.5"
      />
      <ellipse cx="40" cy="88" rx="9.5" ry="10" fill="#fff3c4" />
      <path d="M21 84q4 1 6 4M59 84q-4 1-6 4" {...STRIPE} />
      <g fill="#ffd84a" stroke="#17181c" strokeWidth="2.5">
        <ellipse cx="33" cy="100" rx="5.5" ry="3.5" />
        <ellipse cx="47" cy="100" rx="5.5" ry="3.5" />
      </g>
      <g className="mascot-wave">
        <path d="M25 82c-7 0-12-4-14-11" {...OUTLINE} />
        <path d="M25 82c-7 0-12-4-14-11" {...CORE} />
        <circle cx="11" cy="70" r="4.5" fill="#ffd84a" stroke="#17181c" strokeWidth="2.5" />
      </g>
      <g fill="#ffd84a" stroke="#17181c" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M21 47 19.5 27 37 37z" />
        <path d="M59 47 60.5 27 43 37z" />
      </g>
      <path d="M23.5 42 23 32l9 5.5zM56.5 42l.5-10-9 5.5z" fill="#f59e2a" />
      <ellipse cx="40" cy="52" rx="22" ry="17" fill="#ffd84a" stroke="#17181c" strokeWidth="2.5" />
      <path d="M40 36.5v5M34.5 37.5l1.2 4M45.5 37.5l-1.2 4" {...STRIPE} />
      <g className="mascot-eyes" fill="#17181c">
        <ellipse cx="32" cy="52" rx="3" ry="4" />
        <ellipse cx="48" cy="52" rx="3" ry="4" />
      </g>
      <circle cx="33" cy="50.5" r="1.1" fill="#fff" />
      <circle cx="49" cy="50.5" r="1.1" fill="#fff" />
      <ellipse cx="25.5" cy="59" rx="3.5" ry="2" fill="#f59e2a" opacity=".6" />
      <ellipse cx="54.5" cy="59" rx="3.5" ry="2" fill="#f59e2a" opacity=".6" />
      <path d="M38 56.5h4l-2 2.4z" fill="#17181c" />
      <path d="M36.5 60q1.75 2 3.5 0q1.75 2 3.5 0" stroke="#17181c" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
