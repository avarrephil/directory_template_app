"use client";

import { useState, useEffect } from "react";
import { UploadedFile } from "@/app/types";
import type { FileId } from "@/lib/types";
import { fetchUploadedFiles, deleteFileRecord } from "@/lib/supabase-client";
import CSVViewerModal from "./csv-viewer-modal";

interface UploadedFilesListProps {
  refreshTrigger?: number;
  onDeleteFile?: (fileId: FileId) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getStatusColor = (status: UploadedFile["status"]): string => {
  switch (status) {
    case "uploaded":
      return "bg-green-100 text-green-800";
    case "uploading":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function UploadedFilesList({
  refreshTrigger,
  onDeleteFile,
}: UploadedFilesListProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [viewingFile, setViewingFile] = useState<{
    id: FileId;
    name: string;
  } | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchUploadedFiles();
      if (result.success && result.files) {
        setFiles(result.files);
      } else {
        setError(result.error || "Failed to load files");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const handleDeleteFile = async (fileId: FileId) => {
    if (deleting[fileId]) return;

    setDeleting((prev) => ({ ...prev, [fileId]: true }));

    try {
      const result = await deleteFileRecord(fileId);
      if (result.success) {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        onDeleteFile?.(fileId);
      } else {
        setError(result.error || "Failed to delete file");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeleting((prev) => ({ ...prev, [fileId]: false }));
    }
  };
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Loading files...
        </h3>
        <p className="text-gray-600">Fetching your uploaded files.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Error loading files
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadFiles}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No files uploaded
        </h3>
        <p className="text-gray-600">
          Upload CSV files to get started with your directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploaded Files ({files.length})
        </h2>
        <button
          onClick={loadFiles}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {files.map((file) => (
            <li key={file.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          file.status
                        )}`}
                      >
                        {file.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <span className="flex items-center">
                        <span className="mr-1">📏</span>
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📅</span>
                        {formatDateTime(file.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingFile({ id: file.id, name: file.name });
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    👁️ View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deleting[file.id]}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting[file.id] ? "⏳" : "🗑️"}{" "}
                    {deleting[file.id] ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-gray-500">
        <p>Files are stored securely in cloud storage</p>
        <p>Refresh automatically syncs with latest data</p>
        <p>Delete removes both file and storage data</p>
      </div>

      {/* CSV Viewer Modal */}
      {viewingFile && (
        <CSVViewerModal
          fileId={viewingFile.id}
          fileName={viewingFile.name}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
}
