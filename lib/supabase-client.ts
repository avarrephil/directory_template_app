import type { UploadedFile } from "@/app/types";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { createClient, type User } from "@supabase/supabase-js";

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

// Supabase client instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const config = getSupabaseConfig();
    supabaseInstance = createClient(config.url, config.key);
  }
  return supabaseInstance;
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
    // Create database record with "uploading" status first
    const initialFileData: Omit<UploadedFile, "id"> = {
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: "uploading",
      storage_path: storagePath,
    };

    const insertResult = await insertFileRecord(initialFileData);
    if (!insertResult.success) {
      return { success: false, error: insertResult.error };
    }

    const fileId = insertResult.file!.id;

    // Upload to storage
    const uploadResult = await uploadFileToStorage(file, storagePath, options);
    if (!uploadResult.success) {
      // Update status to failed
      await updateFileStatus(fileId, "failed");
      return { success: false, error: uploadResult.error };
    }

    // Update status to uploaded
    const updateResult = await updateFileStatus(fileId, "uploaded");
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    // Return file with updated status
    const updatedFile: UploadedFile = {
      ...insertResult.file!,
      status: "uploaded",
    };

    return { success: true, file: updatedFile };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

// Auth Types
export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  owns_business: boolean;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  owns_business: boolean;
};

export type AuthResult = {
  success: boolean;
  user?: User | null;
  profile?: UserProfile;
  error?: string;
};

// Auth Functions
export const signUp = async (userData: SignUpData): Promise<AuthResult> => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number || "",
          owns_business: userData.owns_business,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Fetch the created profile
      const profileResult = await getUserProfile(data.user.id);
      if (profileResult.success) {
        return {
          success: true,
          user: data.user,
          profile: profileResult.profile,
        };
      }
    }

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed",
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Fetch user profile
      const profileResult = await getUserProfile(data.user.id);
      if (profileResult.success) {
        return {
          success: true,
          user: data.user,
          profile: profileResult.profile,
        };
      }
    }

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
};

export const signOut = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    };
  }
};

export const getCurrentUser = async (): Promise<AuthResult> => {
  try {
    console.log("🔍 getCurrentUser: Starting...");
    const supabase = getSupabaseClient();
    console.log("🔍 getCurrentUser: Got Supabase client");
    
    // Add timeout to prevent hanging (increased to 15 seconds for better UX)
    const timeoutPromise = new Promise<{data: {user: null}, error: null}>((resolve) => {
      setTimeout(() => {
        console.log("⏰ getCurrentUser: Auth timed out, returning no user");
        resolve({data: {user: null}, error: null});
      }, 15000);
    });

    const authPromise = supabase.auth.getUser();
    
    const {
      data: { user },
      error,
    } = await Promise.race([authPromise, timeoutPromise]);
    
    console.log("🔍 getCurrentUser: Got user from Supabase", { user: !!user, error });

    if (error) {
      console.log("❌ getCurrentUser: Supabase auth error:", error.message);
      return { success: false, error: error.message };
    }

    if (user) {
      console.log("🔍 getCurrentUser: User found, getting profile...");
      const profileResult = await getUserProfile(user.id);
      console.log("🔍 getCurrentUser: Profile result:", profileResult);
      if (profileResult.success) {
        return { success: true, user, profile: profileResult.profile };
      }
    }

    console.log("🔍 getCurrentUser: No user found, returning success with null user");
    return { success: true, user };
  } catch (error) {
    console.error("❌ getCurrentUser: Exception:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get current user",
    };
  }
};

export const getUserProfile = async (
  userId: string
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch user profile",
    };
  }
};

export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send reset email",
    };
  }
};

export const updatePassword = async (
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
};
