"use server";

import { NextRequest, NextResponse } from "next/server";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { getSupabaseConfig, getFileStoragePath } from "@/lib/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const search = searchParams.get("search") || "";

    const { id: rawFileId } = await params;
    const fileId: FileId = brand<string, "FileId">(rawFileId);

    // Get the storage path from database
    const storagePath = await getFileStoragePath(fileId);
    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: "File not found in database" },
        { status: 404 }
      );
    }

    // Follow existing pattern - direct Supabase storage access
    const config = getSupabaseConfig();
    const storageUrl = `${config.url}/storage/v1/object/csv_files/${storagePath}`;

    // Simple fetch (native Node.js 18+) - no external dependencies
    const response = await fetch(storageUrl, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    });

    if (!response.ok) {
      console.error("Storage fetch error:", response.status);
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const csvText = await response.text();
    const parsedData = parseCSVSimple(csvText, page, limit, search);

    return NextResponse.json({
      success: true,
      ...parsedData,
    });
  } catch (error) {
    console.error("CSV data error:", error);
    return NextResponse.json(
      { error: "Failed to load CSV data" },
      { status: 500 }
    );
  }
}

// Simple CSV parser - no external dependencies
const parseCSVSimple = (
  csvText: string,
  page: number,
  limit: number,
  search: string
) => {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      headers: [],
      data: [],
      totalRows: 0,
      currentPage: page,
      hasNextPage: false,
    };
  }

  const headers = parseCSVLine(lines[0]);
  const dataLines = lines.slice(1);

  // Apply search filter if provided
  let filteredLines = dataLines;
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filteredLines = dataLines.filter((line) =>
      line.toLowerCase().includes(searchLower)
    );
  }

  // Apply pagination
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const pageData = filteredLines.slice(startIndex, endIndex);

  const rows = pageData.map((line) => parseCSVLine(line));

  return {
    headers,
    data: rows,
    totalRows: filteredLines.length,
    currentPage: page,
    hasNextPage: endIndex < filteredLines.length,
  };
};

// Simple CSV line parser that handles quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add final field
  result.push(current.trim());

  return result;
};
