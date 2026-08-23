export type CsvValue = string | number | boolean | null;

/**
 * RFC-4180 quoting, plus formula-injection defence.
 *
 * `notes` on every log type is free text the user types, and these exports are
 * meant to be handed to a physician — so a cell opening with `=`, `+`, `-`, or
 * `@` would be evaluated as a formula by Excel and Google Sheets. Prefixing
 * with a single quote makes the spreadsheet treat it as literal text; the
 * quote is not part of the value and does not show in the cell.
 */
export function escapeCell(value: CsvValue): string {
  const raw = String(value ?? '');
  const guarded = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers.join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
}
