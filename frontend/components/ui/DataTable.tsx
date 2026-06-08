import Icon from "@/components/ui/Icon";
import EmptyState from "@/components/ui/EmptyState";

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
  empty?: { icon?: string; title: string; hint?: string };
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  rowHeight = 56,
  empty,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-border-light bg-card shadow-[0_1px_2px_rgba(27,46,31,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light bg-surface px-6" style={{ height: 44 }}>
        {columns.map((col) => (
          <span
            key={col.key}
            className={`${col.width} shrink-0 font-inter text-[11px] font-bold uppercase tracking-[0.04em] text-placeholder ${col.align === "right" ? "text-right" : ""}`}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {data.length === 0 ? (
        <EmptyState icon={empty?.icon} title={empty?.title ?? "Aucun résultat"} hint={empty?.hint} />
      ) : (
        data.map((row) => (
          <div
            key={keyExtractor(row)}
            className="group flex items-center justify-between border-b border-border-light px-6 last:border-b-0 hover:bg-primary-light/40 transition-colors"
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
                    <span className="font-inter text-[13px] text-subtle">{value as string}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between border-t border-border-light bg-surface px-6" style={{ height: 52 }}>
          <button
            onClick={pagination.onPrev}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1.5 font-inter text-[13px] text-subtle transition-colors hover:text-label disabled:opacity-40"
          >
            <Icon name="chevron-left" size={14} className="text-placeholder" />
            Précédent
          </button>
          <span className="font-inter text-xs text-placeholder">
            {pagination.count} résultat{pagination.count > 1 ? "s" : ""}
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
