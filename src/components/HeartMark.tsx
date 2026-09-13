// Simplified brand mark for MesKartu.Lt — two intertwined paths forming a
// heart (echoes the "two lives, one journey" idea from the source logo),
// stripped of the small pin/bell/runner/pulse glyphs so it stays legible at
// header and favicon sizes.
export function HeartMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heartMarkGrad" x1="6" y1="0" x2="94" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff8a3d" />
          <stop offset="32%" stopColor="#e0447e" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="78%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <path
        d="M48,30 C48,16 36,8 24,13 C12,18 10,34 18,46 C26,58 40,70 56,88"
        stroke="url(#heartMarkGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52,30 C52,16 64,8 76,13 C88,18 90,34 82,46 C74,58 60,70 44,88"
        stroke="url(#heartMarkGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
