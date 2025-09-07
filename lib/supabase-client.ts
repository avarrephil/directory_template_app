import type { UploadedFile } from "@/app/types";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";

// Phase 1: Internal Utilities
type SupabaseConfig = {
  url: string;
  key: string;
};

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase configuration missing");
  }
  return { url, key };
};

// Phase 2: API Response Types and Validation
type SupabaseFileRecord = {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
  status: string;
  storage_path: string | null;
};

const isValidFileRecord = (obj: unknown): obj is SupabaseFileRecord => {
  if (obj === null || typeof obj !== "object") return false;
  
  const record = obj as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.size === "number" &&
    typeof record.uploaded_at === "string" &&
    typeof record.status === "string" &&
    (record.storage_path === null || typeof record.storage_path === "string")
  );
};

export const validateFileRecord = (raw: unknown): SupabaseFileRecord => {
  if (!isValidFileRecord(raw)) {
    throw new Error(`Invalid file record: ${JSON.stringify(raw)}`);
  }
  return raw;
};

// Phase 3: Split Function Helpers (Private)
export const getFileStoragePath = async (
  fileId: FileId
): Promise<string | null> => {
  const config = getSupabaseConfig();
  const response = await fetch(
    `${config.url}/rest/v1/uploaded_files?id=eq.${fileId}&select=storage_path`,
    {
      method: "GET",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get file info: ${response.status}`);
  }

  const [fileInfo] = await response.json();
  return fileInfo?.storage_path || null;
};

const deleteFromStorage = async (storagePath: string): Promise<void> => {
  const config = getSupabaseConfig();
  const deleteStorageResponse = await fetch(
    `${config.url}/storage/v1/object/csv_files/${storagePath}`,
    {
      method: "DELETE",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    }
  );

  // Log warning but don't throw - storage delete can fail if file already deleted
  if (!deleteStorageResponse.ok) {
    console.warn(
      `Failed to delete from storage: ${deleteStorageResponse.status}`
    );
  }
};

const deleteFromDatabase = async (fileId: FileId): Promise<void> => {
  const config = getSupabaseConfig();
  const deleteResponse = await fetch(
    `${config.url}/rest/v1/uploaded_files?id=eq.${fileId}`,
    {
      method: "DELETE",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    }
  );

  if (!deleteResponse.ok) {
    const errorText = await deleteResponse.text();
    throw new Error(
      `Failed to delete from database: ${deleteResponse.status} - ${errorText}`
    );
  }
};

export type FileUploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type FileUploadResult = {
  success: boolean;
  file?: UploadedFile;
  error?: string;
};

export type FileUploadOptions = {
  onProgress?: (progress: FileUploadProgress) => void;
};

export const generateUniqueFilePath = (filename: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const uuid = `${timestamp}-${randomId}`;
  return `uploads/${uuid}/${filename}`;
};

export const uploadFileToStorage = async (
  file: File,
  storagePath: string,
  options?: FileUploadOptions
): Promise<{ success: boolean; error?: string }> => {
  try {
    const config = getSupabaseConfig();

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && options?.onProgress) {
          const progress: FileUploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          options.onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            error: `Upload failed: ${xhr.status} - ${xhr.statusText}`,
          });
        }
      });

      xhr.addEventListener("error", () => {
        resolve({
          success: false,
          error: "Network error during upload",
        });
      });

      xhr.addEventListener("timeout", () => {
        resolve({
          success: false,
          error: "Upload timed out",
        });
      });

      xhr.timeout = 5 * 60 * 1000; // 5 minutes
      xhr.open(
        "POST",
        `${config.url}/storage/v1/object/csv_files/${storagePath}`
      );
      xhr.setRequestHeader("apikey", config.key);
      xhr.setRequestHeader("Authorization", `Bearer ${config.key}`);
      xhr.send(file);
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const insertFileRecord = async (
  fileData: Omit<UploadedFile, "id">
): Promise<{ success: boolean; file?: UploadedFile; error?: string }> => {
  try {
    const config = getSupabaseConfig();
    const response = await fetch(`${config.url}/rest/v1/uploaded_files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: fileData.name,
        size: fileData.size,
        uploaded_at: fileData.uploadedAt.toISOString(),
        status: fileData.status,
        storage_path: fileData.storage_path,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Insert failed: ${response.status} - ${errorText}`);
    }

    const [dbFile] = await response.json();
    const validatedFile = validateFileRecord(dbFile);
    const file: UploadedFile = {
      id: brand<string, "FileId">(validatedFile.id),
      name: validatedFile.name,
      size: validatedFile.size,
      uploadedAt: new Date(validatedFile.uploaded_at),
      status: validatedFile.status as UploadedFile["status"],
      storage_path: validatedFile.storage_path || undefined,
    };
    return { success: true, file };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save file metadata",
    };
  }
};

export const updateFileStatus = async (
  fileId: FileId,
  status: UploadedFile["status"]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const config = getSupabaseConfig();
    const response = await fetch(
      `${config.url}/rest/v1/uploaded_files?id=eq.${fileId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Update failed: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update file status",
    };
  }
};

export const fetchUploadedFiles = async (): Promise<{
  success: boolean;
  files?: UploadedFile[];
  error?: string;
}> => {
  try {
    const config = getSupabaseConfig();
    const response = await fetch(
      `${config.url}/rest/v1/uploaded_files?order=uploaded_at.desc`,
      {
        method: "GET",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
    }

    const dbFiles = await response.json();
    const files: UploadedFile[] = dbFiles.map((dbFile: unknown) => {
      const validatedFile = validateFileRecord(dbFile);
      return {
        id: brand<string, "FileId">(validatedFile.id),
        name: validatedFile.name,
        size: validatedFile.size,
        uploadedAt: new Date(validatedFile.uploaded_at),
        status: validatedFile.status as UploadedFile["status"],
        storage_path: validatedFile.storage_path || undefined,
      };
    });
    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch files",
    };
  }
};

export const deleteFileRecord = async (
  fileId: FileId
): Promise<{ success: boolean; error?: string }> => {
  try {
    const storagePath = await getFileStoragePath(fileId);
    if (storagePath) {
      await deleteFromStorage(storagePath); // May log warning but continues
    }
    await deleteFromDatabase(fileId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
};

export const validateCsvFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { valid: false, error: "File must be a CSV" };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 50MB limit" };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  return { valid: true };
};

export const uploadFile = async (
  file: File,
  options?: FileUploadOptions
): Promise<FileUploadResult> => {
  const validation = validateCsvFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const storagePath = generateUniqueFilePath(file.name);

  try {
    const uploadResult = await uploadFileToStorage(file, storagePath, options);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    const fileData: Omit<UploadedFile, "id"> = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: "uploaded",
      storage_path: storagePath,
    };

    const insertResult = await insertFileRecord(fileData);
    if (!insertResult.success) {
      return { success: false, error: insertResult.error };
    }

    return { success: true, file: insertResult.file };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};
