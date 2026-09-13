// Small circular avatar: the person's photo when they've set one, or a
// colored initial as a fallback — used everywhere a name is shown next to
// something they did (run log, contributions, capsules, etc.).
export function Avatar({
  url,
  name,
  size = 26,
  accent,
}: {
  url?: string | null;
  name: string;
  size?: number;
  accent?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: accent ?? "var(--dusk)" }}
    >
      {initial}
    </span>
  );
}
