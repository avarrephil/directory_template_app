"use server";

import { NextRequest, NextResponse } from "next/server";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { updateFileStatus, deleteFileRecord } from "@/lib/supabase-client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id: rawFileId } = await params;
    const fileId: FileId = brand<string, "FileId">(rawFileId);

    const result = await updateFileStatus(fileId, status);

    if (!result.success) {
      console.error("Update file error:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to update file status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json(
      { error: "Failed to update file status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawFileId } = await params;
    const fileId: FileId = brand<string, "FileId">(rawFileId);

    const result = await deleteFileRecord(fileId);

    if (!result.success) {
      console.error("Delete file error:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
