/** Gold brush slashes + halftone bursting in from the corners, cut from their own ABOUT card. */
export function Corners({
  tl = true,
  br = true,
  size = 'clamp(160px, 26vw, 420px)',
  className = '',
  halftone = true,
}: {
  tl?: boolean;
  br?: boolean;
  size?: string;
  className?: string;
  halftone?: boolean;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {tl && <div className="brush-tl left-0 top-0" style={{ width: size, height: `calc(${size} * 1.23)` }} />}
      {br && <div className="brush-br bottom-0 right-0" style={{ width: size, height: `calc(${size} * 1.05)` }} />}
      {halftone && (
        <div
          className="halftone absolute right-0 top-[18%] h-[38%] w-[22%] max-md:hidden"
          style={{ ['--hx' as string]: '100%', ['--hy' as string]: '50%' }}
        />
      )}
    </div>
  );
}
