// Client-side CSV export for the data tables. Exports exactly the rows the
// caller passes (already filtered/sorted on screen). Uses ';' as the delimiter
// and a UTF-8 BOM so French Excel opens accents and columns correctly.

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Quote if the cell contains the delimiter, a quote, or a newline.
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const sep = ";";
  const header = columns.map((c) => escapeCell(c.header)).join(sep);
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(sep));
  const BOM = "﻿"; // makes Excel detect UTF-8
  const csv = BOM + [header, ...body].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
