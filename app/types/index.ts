import type { FileId } from "@/lib/types";

export interface UploadedFile {
  id: FileId;
  name: string;
  size: number;
  uploadedAt: Date;
  status: "uploaded" | "error";
  storage_path?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current: boolean;
}
