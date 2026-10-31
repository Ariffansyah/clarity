// A chat bubble with a highlighter stroke across it: a message, marked up.
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M7 3.5h18a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H14.5L8 28.5v-6H7a4 4 0 0 1-4-4v-11a4 4 0 0 1 4-4z"
        fill="var(--ink)"
      />
      <path className="logo-hl" d="M7.2 10.6 24.9 8.5l.7 5.7-17.7 2.1z" fill="#ffd84a" />
      <path d="M8.8 19h9" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
