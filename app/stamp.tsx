// A verdict inked onto the page. The words stay real text in their own case; the stamp's capitals are CSS.
export default function Stamp({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="stamp" style={{ "--stamp": color } as React.CSSProperties}>
      {children}
    </span>
  );
}
