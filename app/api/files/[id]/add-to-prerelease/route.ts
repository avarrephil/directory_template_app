"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { getSupabaseConfig, getFileStoragePath } from "@/lib/supabase-client";

const BATCH_SIZE = 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const config = getSupabaseConfig();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { success: false, error: "Service configuration error" },
        { status: 500 }
      );
    }
    
    // Use service role to verify user and check admin status
    const supabaseAdmin = createClient(config.url, serviceKey);
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Check if user is admin using service role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

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

    // Fetch CSV data from storage
    const storageUrl = `${config.url}/storage/v1/object/csv_files/${storagePath}`;

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
    const result = await processCSVToPreRelease(csvText, fileId, config, serviceKey);

    if (result.success) {
      // Update file status to "added"
      await updateFileStatusToAdded(fileId, config, serviceKey);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Add to prerelease error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process file" },
      { status: 500 }
    );
  }
}

// Reuse CSV parser from existing data route
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

const processCSVToPreRelease = async (
  csvText: string,
  fileId: FileId,
  config: ReturnType<typeof getSupabaseConfig>,
  serviceKey: string
): Promise<{ success: boolean; error?: string; processed?: number }> => {
  try {
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      return { success: false, error: "CSV file is empty" };
    }

    const headers = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);

    if (dataLines.length === 0) {
      return { success: false, error: "No data rows found in CSV" };
    }

    // Expected columns from the CSV
    const expectedColumns = [
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
    ];

    // Create column mapping
    const columnMap: Record<string, number> = {};
    expectedColumns.forEach((col) => {
      const index = headers.findIndex(
        (h) => h.toLowerCase() === col.toLowerCase()
      );
      if (index !== -1) {
        columnMap[col] = index;
      }
    });

    let processed = 0;

    // Process in batches
    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
      const batch = dataLines.slice(i, i + BATCH_SIZE);
      const records = batch.map((line) => {
        const values = parseCSVLine(line);
        const record: Record<string, unknown> = { file_id: fileId };

        // Map CSV columns to database columns
        expectedColumns.forEach((col) => {
          const index = columnMap[col];
          record[col] =
            index !== undefined && values[index] !== undefined
              ? values[index]
              : null;
        });

        return record;
      });

      // Insert batch to database using service role
      const insertResponse = await fetch(
        `${config.url}/rest/v1/pre_release_businesses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(records),
        }
      );

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(
          `Batch insert failed: ${insertResponse.status} - ${errorText}`
        );
      }

      processed += batch.length;
    }

    return { success: true, processed };
  } catch (error) {
    console.error("CSV processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Processing failed",
    };
  }
};

const updateFileStatusToAdded = async (
  fileId: FileId,
  config: ReturnType<typeof getSupabaseConfig>,
  serviceKey: string
): Promise<void> => {
  const response = await fetch(
    `${config.url}/rest/v1/uploaded_files?id=eq.${fileId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        status: "added",
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status update failed: ${response.status} - ${errorText}`);
  }
};
