import Icon from "@/components/ui/Icon";

export interface Column<T> {
  key: string;
  label: string;
  width: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
}

interface PaginationProps {
  page: number;
  total: number;
  count: number;
  onPrev?: () => void;
  onNext?: () => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pagination?: PaginationProps;
  rowHeight?: number;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  rowHeight = 54,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface px-6" style={{ height: 40 }}>
        {columns.map((col) => (
          <span
            key={col.key}
            className={`${col.width} shrink-0 font-inter text-[11px] font-bold uppercase tracking-wide text-placeholder ${col.align === "right" ? "text-right" : ""}`}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-10">
          <span className="font-inter text-[13px] text-placeholder">Aucun résultat</span>
        </div>
      ) : (
        data.map((row) => (
          <div
            key={keyExtractor(row)}
            className="flex items-center justify-between border-b border-border-light px-6 last:border-b-0 hover:bg-surface/60 transition-colors"
            style={{ height: rowHeight }}
          >
            {columns.map((col) => {
              const value = (row as Record<string, unknown>)[col.key];
              return (
                <div
                  key={col.key}
                  className={`${col.width} shrink-0 ${col.align === "right" ? "flex justify-end" : "flex items-center"}`}
                >
                  {col.render ? (
                    col.render(row)
                  ) : (
                    <span className="font-inter text-[13px] text-subtle">
                      {value as string}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between bg-surface px-6" style={{ height: 52 }}>
          <button
            onClick={pagination.onPrev}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1.5 font-inter text-[13px] text-subtle transition-colors hover:text-label disabled:opacity-40"
          >
            <Icon name="chevron-left" size={14} className="text-placeholder" />
            Précédent
          </button>
          <span className="font-inter text-xs text-placeholder">
            Page {pagination.page} — {pagination.count} résultats
          </span>
          <button
            onClick={pagination.onNext}
            disabled={pagination.page >= pagination.total}
            className="flex items-center gap-1.5 font-inter text-[13px] text-subtle transition-colors hover:text-label disabled:opacity-40"
          >
            Suivant
            <Icon name="chevron-right" size={14} className="text-placeholder" />
          </button>
        </div>
      )}
    </div>
  );
}
