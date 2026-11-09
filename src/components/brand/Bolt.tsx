/** The ⚡ from their cards, as a crisp vector. */
export function Bolt({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d="M15.5 0 3 22.5h8.2L7.6 40 21 15.6h-8.4L15.5 0Z" fill="currentColor" />
    </svg>
  );
}

/** Thin gold rule — ⚡ — thin gold rule */
export function BoltRule({ className = '', width = 'w-full' }: { className?: string; width?: string }) {
  return (
    <div className={`bolt-rule ${width} ${className}`} aria-hidden>
      <Bolt className="h-6 w-4 shrink-0" />
    </div>
  );
}

/** Two-tone headline pair ("CULTURE / SHOCK", "WHO WE / ARE") with the distressed finish. */
export function PairHeadline({
  white,
  gold,
  as: Tag = 'h2',
  className = '',
  stacked = true,
}: {
  white: string;
  gold: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  stacked?: boolean;
}) {
  return (
    <Tag className={`display distress ${className}`}>
      <span className="text-paper">{white}</span>
      {stacked ? <br /> : ' '}
      <span className="text-gold">{gold}</span>
    </Tag>
  );
}
