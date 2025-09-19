import type { UploadedFile } from "@/app/types";
import type { FileId } from "@/lib/types";
import { brand } from "@/lib/types";
import { createClient, type User } from "@supabase/supabase-js";
import { AUTH_CONFIG, type AuthTimeoutResponse } from "./auth-config";
import { authLog } from "./auth-logger";

// Session timeout tracking
type SessionTimeouts = {
  idleTimeout: NodeJS.Timeout | null;
  absoluteTimeout: NodeJS.Timeout | null;
  lastActivity: number;
  pausedAt: number | null;
  remainingIdleTime: number;
};

let sessionTimeouts: SessionTimeouts = {
  idleTimeout: null,
  absoluteTimeout: null,
  lastActivity: Date.now(),
  pausedAt: null,
  remainingIdleTime: AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS,
};

// Session timeout management
export const clearSessionTimeouts = (): void => {
  if (sessionTimeouts.idleTimeout) {
    clearTimeout(sessionTimeouts.idleTimeout);
    sessionTimeouts.idleTimeout = null;
  }
  if (sessionTimeouts.absoluteTimeout) {
    clearTimeout(sessionTimeouts.absoluteTimeout);
    sessionTimeouts.absoluteTimeout = null;
  }
};

export const pauseSessionTimeout = (): void => {
  if (sessionTimeouts.idleTimeout && !sessionTimeouts.pausedAt) {
    // Calculate remaining time
    const elapsed = Date.now() - sessionTimeouts.lastActivity;
    sessionTimeouts.remainingIdleTime = Math.max(0, AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS - elapsed);
    sessionTimeouts.pausedAt = Date.now();
    
    // Clear the current timeout
    clearTimeout(sessionTimeouts.idleTimeout);
    sessionTimeouts.idleTimeout = null;
    
    authLog.debug(`Session timeout paused with ${Math.round(sessionTimeouts.remainingIdleTime / 1000)}s remaining`);
  }
};

export const resumeSessionTimeout = (): void => {
  if (sessionTimeouts.pausedAt && !sessionTimeouts.idleTimeout) {
    sessionTimeouts.pausedAt = null;
    sessionTimeouts.lastActivity = Date.now();
    
    // Always reset to full timeout when returning from app switch
    // This prevents immediate logout when returning after extended periods
    sessionTimeouts.remainingIdleTime = AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS;
    
    sessionTimeouts.idleTimeout = setTimeout(() => {
      authLog.warn("Session idle timeout reached, signing out");
      signOut();
    }, AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS);
    
    authLog.debug(`Session timeout resumed with full ${Math.round(AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS / 1000)}s timeout`);
  }
};

export const updateActivityTimestamp = (): void => {
  sessionTimeouts.lastActivity = Date.now();
  sessionTimeouts.remainingIdleTime = AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS;
  sessionTimeouts.pausedAt = null; // Clear any paused state since we're active

  // Reset idle timeout
  if (sessionTimeouts.idleTimeout) {
    clearTimeout(sessionTimeouts.idleTimeout);
  }

  // Always set timeout when user is active (don't check visibility here)
  sessionTimeouts.idleTimeout = setTimeout(() => {
    authLog.warn("Session idle timeout reached, signing out");
    signOut();
  }, AUTH_CONFIG.IDLE_SESSION_TIMEOUT_MS);
};

export const startSessionTimeouts = (): void => {
  clearSessionTimeouts();

  // Start idle timeout
  updateActivityTimestamp();

  // Start absolute timeout
  sessionTimeouts.absoluteTimeout = setTimeout(() => {
    authLog.warn("Absolute session timeout reached, signing out");
    signOut();
  }, AUTH_CONFIG.ABSOLUTE_SESSION_TIMEOUT_MS);

  authLog.debug("Session timeouts started");
};

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
    supabaseInstance = createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: {
          "X-Client-Info": "directory-template-app",
        },
      },
    });
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
      authLog.error("Sign in failed", error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      authLog.debug("User signed in successfully");
      startSessionTimeouts();

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
    authLog.error("Sign in exception", error);
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
    authLog.debug("Signing out user");
    clearSessionTimeouts();

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      authLog.error("Sign out failed", error.message);
      return { success: false, error: error.message };
    }

    authLog.debug("User signed out successfully");
    return { success: true };
  } catch (error) {
    authLog.error("Sign out exception", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    };
  }
};

const createAuthTimeout = (): Promise<AuthTimeoutResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      authLog.timeout("Auth request timed out, returning no user");
      resolve({ data: { user: null }, error: null });
    }, AUTH_CONFIG.TIMEOUT_MS);
  });
};

const authenticateUser = async (): Promise<{
  data: { user: any };
  error: any;
}> => {
  const supabase = getSupabaseClient();
  const authPromise = supabase.auth.getUser();
  const timeoutPromise = createAuthTimeout();

  return await Promise.race([authPromise, timeoutPromise]);
};

export const getCurrentUser = async (): Promise<AuthResult> => {
  try {
    authLog.debug("Starting getCurrentUser");

    const {
      data: { user },
      error,
    } = await authenticateUser();
    authLog.debug("Got user from Supabase", { user: !!user, error: !!error });

    if (error) {
      authLog.error("Supabase auth error", error.message);
      return { success: false, error: error.message };
    }

    if (user) {
      authLog.debug("User found, getting profile");
      const profileResult = await getUserProfile(user.id);
      authLog.debug("Profile result", { success: profileResult.success });
      if (profileResult.success) {
        return { success: true, user, profile: profileResult.profile };
      }
    }

    authLog.debug("No user found, returning success with null user");
    return { success: true, user };
  } catch (error) {
    authLog.error("getCurrentUser exception", error);
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

// Pre-release data processing
export type ProcessResult = {
  success: boolean;
  processed?: number;
  error?: string;
};

export type ProcessProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type ProcessOptions = {
  onProgress?: (progress: ProcessProgress) => void;
};

export const processFileToPreRelease = async (
  fileId: FileId,
  options?: ProcessOptions
): Promise<ProcessResult> => {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Start processing and simulate progress
    const startTime = Date.now();
    const estimatedDuration = 30000; // Estimate 30 seconds for processing

    // Start progress simulation
    const progressInterval = setInterval(() => {
      if (options?.onProgress) {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min(
          95,
          Math.round((elapsed / estimatedDuration) * 100)
        );

        options.onProgress({
          loaded: percentage,
          total: 100,
          percentage: percentage,
        });
      }
    }, 500); // Update every 500ms

    try {
      const response = await fetch(`/api/files/${fileId}/add-to-prerelease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      clearInterval(progressInterval);

      // Set to 100% when complete
      if (options?.onProgress) {
        options.onProgress({
          loaded: 100,
          total: 100,
          percentage: 100,
        });
      }

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `Processing failed: ${response.status} - ${errorText}`,
        };
      }
    } catch (error) {
      clearInterval(progressInterval);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error during processing",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
