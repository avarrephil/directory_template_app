import type { FileId } from "./types";
import {
  validateBusinessCSV,
  createColumnMapping,
  parseBusinessRecord,
  parseCSVLine,
} from "./csv-business-parser";
import { insertBusinessBatch } from "./database-operations";

const BATCH_SIZE = 1000;

interface ProcessorConfig {
  url: string;
  serviceKey: string;
}

export const processCSVToPreRelease = async (
  csvText: string,
  fileId: FileId,
  config: ProcessorConfig
): Promise<{ success: boolean; error?: string; processed?: number }> => {
  try {
    const lines = csvText.split("\n").filter((line) => line.trim());

    const validation = validateBusinessCSV(lines);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const { headers } = validation;
    const dataLines = lines.slice(1);
    const columnMap = createColumnMapping(headers!);

    let processed = 0;
    const client = { url: config.url, serviceKey: config.serviceKey };

    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
      const batch = dataLines.slice(i, i + BATCH_SIZE);
      const records = batch.map((line) => {
        const values = parseCSVLine(line);
        return parseBusinessRecord(values, columnMap, fileId);
      });

      const insertResult = await insertBusinessBatch(records, client);
      if (!insertResult.success) {
        return { success: false, error: insertResult.error };
      }

      processed += batch.length;
    }

    return { success: true, processed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Processing failed",
    };
  }
};
