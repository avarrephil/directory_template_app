"use server";

import { NextRequest, NextResponse } from "next/server";
import type { UploadedFile } from "@/app/types";
import { fetchUploadedFiles, insertFileRecord } from "@/lib/supabase-client";

export async function GET() {
  try {
    const result = await fetchUploadedFiles();

    if (!result.success) {
      console.error("Fetch files error:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to fetch files" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.files || []);
  } catch (error) {
    console.error("Fetch files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const fileData = (await request.json()) as Omit<UploadedFile, "id">;

    // Parse uploadedAt from string if needed
    const parsedFileData = {
      ...fileData,
      uploadedAt:
        typeof fileData.uploadedAt === "string"
          ? new Date(fileData.uploadedAt)
          : fileData.uploadedAt,
    };

    const result = await insertFileRecord(parsedFileData);

    if (!result.success) {
      console.error("Insert file error:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to save file metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.file);
  } catch (error) {
    console.error("Insert file error:", error);
    return NextResponse.json(
      { error: "Failed to save file metadata" },
      { status: 500 }
    );
  }
}
