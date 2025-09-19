import { describe, expect, test } from "vitest";
import {
  parseCSVLine,
  validateBusinessCSV,
  createColumnMapping,
  parseBusinessRecord,
} from "./csv-business-parser";
import { brand } from "./types";
import type { FileId } from "./types";

const testFileId: FileId = brand<string, "FileId">("test-file-123");

describe("parseCSVLine", () => {
  test("parses simple CSV line", () => {
    const line = "value1,value2,value3";
    const result = parseCSVLine(line);
    expect(result).toEqual(["value1", "value2", "value3"]);
  });

  test("handles quoted values with commas", () => {
    const line = '"value1,with,comma",value2,"value3"';
    const result = parseCSVLine(line);
    expect(result).toEqual(["value1,with,comma", "value2", "value3"]);
  });

  test("handles escaped quotes", () => {
    const line = '"value with ""quotes""",simple,value';
    const result = parseCSVLine(line);
    expect(result).toEqual(['value with "quotes"', "simple", "value"]);
  });

  test("handles empty values", () => {
    const line = "value1,,value3";
    const result = parseCSVLine(line);
    expect(result).toEqual(["value1", "", "value3"]);
  });

  test("handles whitespace trimming", () => {
    const line = " value1 , value2 , value3 ";
    const result = parseCSVLine(line);
    expect(result).toEqual(["value1", "value2", "value3"]);
  });
});

describe("validateBusinessCSV", () => {
  test("returns valid for proper CSV with headers and data", () => {
    const lines = ["name,phone,city", "Business1,123456,NYC"];
    const result = validateBusinessCSV(lines);
    expect(result).toEqual({
      isValid: true,
      headers: ["name", "phone", "city"],
    });
  });

  test("returns error for empty CSV", () => {
    const lines: string[] = [];
    const result = validateBusinessCSV(lines);
    expect(result).toEqual({
      isValid: false,
      error: "CSV file is empty",
    });
  });

  test("returns error for CSV with only headers", () => {
    const lines = ["name,phone,city"];
    const result = validateBusinessCSV(lines);
    expect(result).toEqual({
      isValid: false,
      error: "No data rows found in CSV",
    });
  });
});

describe("createColumnMapping", () => {
  test("creates mapping for matching columns", () => {
    const headers = ["name", "phone", "unknown", "city"];
    const expectedColumns = ["name", "phone", "city"] as const;
    const result = createColumnMapping(headers, expectedColumns);
    expect(result).toEqual({
      name: 0,
      phone: 1,
      city: 3,
    });
  });

  test("case insensitive matching", () => {
    const headers = ["NAME", "Phone", "CITY"];
    const expectedColumns = ["name", "phone", "city"] as const;
    const result = createColumnMapping(headers, expectedColumns);
    expect(result).toEqual({
      name: 0,
      phone: 1,
      city: 2,
    });
  });

  test("returns empty mapping for no matches", () => {
    const headers = ["unknown1", "unknown2"];
    const expectedColumns = ["name", "phone"] as const;
    const result = createColumnMapping(headers, expectedColumns);
    expect(result).toEqual({});
  });
});

describe("parseBusinessRecord", () => {
  test("creates business record with mapped values", () => {
    const values = ["Test Business", "123-456-7890", "New York"];
    const columnMap = { name: 0, phone: 1, city: 2 };
    const result = parseBusinessRecord(values, columnMap, testFileId);

    expect(result).toEqual({
      file_id: testFileId,
      name: "Test Business",
      phone: "123-456-7890",
      city: "New York",
    });
  });

  test("handles missing values as null", () => {
    const values = ["Test Business", "123-456-7890"];
    const columnMap = { name: 0, phone: 1, city: 2 };
    const result = parseBusinessRecord(values, columnMap, testFileId);

    expect(result).toEqual({
      file_id: testFileId,
      name: "Test Business",
      phone: "123-456-7890",
      city: null,
    });
  });

  test("handles unmapped columns gracefully", () => {
    const values = ["Test Business"];
    const columnMap = { name: 0 };
    const result = parseBusinessRecord(values, columnMap, testFileId);

    expect(result).toEqual({
      file_id: testFileId,
      name: "Test Business",
    });
  });
});
