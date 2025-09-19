import type { FileId } from "./types";

const EXPECTED_COLUMNS = [
  "name",
  "site",
  "subtypes",
  "category",
  "type",
  "phone",
  "full_address",
  "street",
  "city",
  "postal_code",
  "state",
  "us_state",
  "country_code",
  "latitude",
  "longitude",
  "rating",
  "reviews",
  "reviews_link",
  "photos_count",
  "photo",
  "street_view",
  "working_hours",
  "working_hours_old_format",
  "business_status",
  "about",
  "logo",
  "owner_link",
  "location_link",
  "location_reviews_link",
  "place_id",
] as const;

export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  result.push(current.trim());
  return result;
};

export const validateBusinessCSV = (
  lines: string[]
): { isValid: boolean; error?: string; headers?: string[] } => {
  if (lines.length === 0) {
    return { isValid: false, error: "CSV file is empty" };
  }

  const headers = parseCSVLine(lines[0]);
  const dataLines = lines.slice(1);

  if (dataLines.length === 0) {
    return { isValid: false, error: "No data rows found in CSV" };
  }

  return { isValid: true, headers };
};

export const createColumnMapping = (
  headers: string[],
  expectedColumns: readonly string[] = EXPECTED_COLUMNS
): Record<string, number> => {
  const columnMap: Record<string, number> = {};

  expectedColumns.forEach((col) => {
    const index = headers.findIndex(
      (h) => h.toLowerCase() === col.toLowerCase()
    );
    if (index !== -1) {
      columnMap[col] = index;
    }
  });

  return columnMap;
};

export const parseBusinessRecord = (
  values: string[],
  columnMap: Record<string, number>,
  fileId: FileId
): Record<string, unknown> => {
  const record: Record<string, unknown> = { file_id: fileId };

  Object.keys(columnMap).forEach((col) => {
    const index = columnMap[col];
    record[col] =
      index !== undefined && values[index] !== undefined ? values[index] : null;
  });

  return record;
};
