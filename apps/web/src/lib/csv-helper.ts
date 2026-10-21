/**
 * Robust CSV parser and downloader helper for Admin Bulk Uploads.
 */

export function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  // Parse a CSV line into cells taking quotes and escaped commas into account
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const rawHeaders = parseLine(lines[0]);
  const normalisedHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.every((c) => !c)) continue;
    const rec: Record<string, string> = {};
    normalisedHeaders.forEach((header, idx) => {
      rec[header] = cells[idx] ? cells[idx].replace(/^["']|["']$/g, "").trim() : "";
    });
    records.push(rec);
  }

  return records;
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
