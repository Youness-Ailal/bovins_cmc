interface TableSkeletonProps {
  /** Number of placeholder rows to render. */
  rows?: number;
  /** Relative column widths (flex-grow ratios). */
  cols?: number[];
}

/** Animated placeholder shown while a table's data is loading. */
export default function TableSkeleton({ rows = 6, cols = [3, 2, 2, 2, 1] }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-border-light bg-card shadow-[0_1px_2px_rgba(27,46,31,0.04)]">
      <div className="flex items-center gap-6 border-b border-border-light bg-surface px-6" style={{ height: 44 }}>
        {cols.map((c, i) => (
          <div key={i} className="h-2.5 rounded bg-border-light" style={{ flexGrow: c, maxWidth: `${c * 40}px` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex animate-pulse items-center gap-6 border-b border-border-light px-6 last:border-b-0" style={{ height: 56 }}>
          {cols.map((c, i) => (
            <div
              key={i}
              className="h-3 rounded bg-surface"
              style={{ flexGrow: c, maxWidth: `${c * 60}px`, opacity: 1 - r * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
