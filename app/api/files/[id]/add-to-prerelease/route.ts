"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { getSupabaseConfig, getFileStoragePath } from "@/lib/supabase-client";
import { processCSVToPreRelease } from "@/lib/csv-processor";
import { updateFileStatus } from "@/lib/database-operations";

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

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
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
    const result = await processCSVToPreRelease(csvText, fileId, {
      url: config.url,
      serviceKey,
    });

    if (result.success) {
      const statusResult = await updateFileStatus(fileId, "added", {
        url: config.url,
        serviceKey,
      });
      if (!statusResult.success) {
        console.warn("Failed to update file status:", statusResult.error);
      }
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
