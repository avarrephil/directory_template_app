import type { FileId } from "./types";

interface DatabaseClient {
  url: string;
  serviceKey: string;
}

export const insertBusinessBatch = async (
  records: Record<string, unknown>[],
  client: DatabaseClient
): Promise<{ success: boolean; error?: string }> => {
  try {
    const insertResponse = await fetch(
      `${client.url}/rest/v1/pre_release_businesses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: client.serviceKey,
          Authorization: `Bearer ${client.serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(records),
      }
    );

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      return {
        success: false,
        error: `Batch insert failed: ${insertResponse.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Batch insert failed",
    };
  }
};

type FileStatus = "added" | "pending" | "processing" | "error";

export const updateFileStatus = async (
  fileId: FileId,
  status: FileStatus,
  client: DatabaseClient
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(
      `${client.url}/rest/v1/uploaded_files?id=eq.${fileId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: client.serviceKey,
          Authorization: `Bearer ${client.serviceKey}`,
        },
        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Status update failed: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Status update failed",
    };
  }
};
