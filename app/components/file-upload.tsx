"use client";

import { useState, useCallback, useRef } from "react";
import {
  uploadFile,
  type FileUploadResult,
  type FileUploadProgress,
} from "@/lib/supabase-client";

const MAX_FILES = 10;
const ACCEPTED_FILE_TYPE = ".csv";

interface FileUploadProps {
  onFilesUploaded: (results: FileUploadResult[]) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [activeUploads, setActiveUploads] = useState(0);
  const currentErrorsRef = useRef<string[]>([]);

  const processFiles = useCallback(
    async (files: FileList) => {
      if (uploading) return;

      const fileArray = Array.from(files);

      if (fileArray.length > MAX_FILES) {
        setErrors([`Maximum ${MAX_FILES} files allowed`]);
        return;
      }

      setUploading(true);
      setErrors([]);
      setUploadProgress({});
      setActiveUploads(fileArray.length);
      currentErrorsRef.current = [];

      fileArray.forEach((file) => {
        uploadFile(file, {
          onProgress: (progress: FileUploadProgress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress.percentage,
            }));
          },
        })
          .then((result) => {
            // Remove completed file from progress display immediately
            setUploadProgress((prev) => {
              const { [file.name]: _removed, ...rest } = prev;
              return rest;
            });

            if (result.success) {
              // Trigger refresh of uploaded files list immediately after successful upload
              onFilesUploaded([result]);
            } else {
              currentErrorsRef.current.push(`${file.name}: ${result.error}`);
            }

            // Decrement active uploads counter
            setActiveUploads((prev) => {
              const newCount = prev - 1;
              if (newCount === 0) {
                setUploading(false);
                setErrors(currentErrorsRef.current);

                // Final call to handle any remaining errors
                if (currentErrorsRef.current.length > 0) {
                  onFilesUploaded(
                    currentErrorsRef.current.map((error) => ({
                      success: false,
                      error,
                    }))
                  );
                }
              }
              return newCount;
            });
          })
          .catch((error) => {
            // Remove failed file from progress display
            setUploadProgress((prev) => {
              const { [file.name]: _removed, ...rest } = prev;
              return rest;
            });

            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            currentErrorsRef.current.push(`${file.name}: ${errorMsg}`);

            // Decrement active uploads counter
            setActiveUploads((prev) => {
              const newCount = prev - 1;
              if (newCount === 0) {
                setUploading(false);
                setErrors(currentErrorsRef.current);

                // Final call to handle any remaining errors
                if (currentErrorsRef.current.length > 0) {
                  onFilesUploaded(
                    currentErrorsRef.current.map((error) => ({
                      success: false,
                      error,
                    }))
                  );
                }
              }
              return newCount;
            });
          });
      });
    },
    [uploading, onFilesUploaded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      processFiles(files);

      // Reset input
      e.target.value = "";
    },
    [processFiles]
  );

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : uploading
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-300 hover:border-gray-400"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPE}
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📁</span>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading
                ? `Uploading files... (${activeUploads} remaining)`
                : "Drop CSV files here or click to browse"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Maximum 10 files, 50MB per file
            </p>
          </div>

          <button
            type="button"
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Choose Files"}
          </button>
        </div>
      </div>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div
              key={fileName}
              className="bg-gray-50 border border-gray-200 rounded-md p-3"
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-900">{fileName}</span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Upload Errors
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Only CSV files are accepted</p>
        <p>• Maximum file size: 50MB</p>
        <p>• Maximum files: 10</p>
        <p>• Files are uploaded to secure cloud storage</p>
      </div>
    </div>
  );
}
