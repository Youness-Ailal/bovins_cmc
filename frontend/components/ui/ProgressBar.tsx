interface ProgressBarProps {
  /** 0–100 percentage to fill. */
  value: number;
  /** Tailwind bg class for the fill, e.g. "bg-success". Defaults by value if omitted. */
  color?: string;
  /** Track height in px. */
  height?: number;
  className?: string;
}

/**
 * Thin rounded progress/level bar. When `color` is omitted, the fill color is
 * derived from the value (green / amber / red) — handy for stock or occupancy.
 */
export default function ProgressBar({ value, color, height = 6, className = "" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const auto = pct >= 70 ? "bg-success" : pct >= 35 ? "bg-warning" : "bg-danger";
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[#F0EDE8] ${className}`}
      style={{ height }}
    >
      <div
        className={`h-full rounded-full transition-all ${color ?? auto}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
