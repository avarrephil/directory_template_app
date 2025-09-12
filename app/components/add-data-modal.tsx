"use client";

import { useState } from "react";
import type { FileId } from "@/lib/types";
import {
  processFileToPreRelease,
  type ProcessProgress,
} from "@/lib/supabase-client";

interface AddDataModalProps {
  fileId: FileId;
  fileName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDataModal({
  fileId,
  fileName,
  onClose,
  onSuccess,
}: AddDataModalProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);
    setProgress(null);

    try {
      const result = await processFileToPreRelease(fileId, {
        onProgress: (prog) => setProgress(prog),
      });

      if (result.success) {
        setSuccess(true);
        setProcessedCount(result.processed || 0);
        onSuccess();
      } else {
        setError(result.error || "Processing failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  // EXACT modal pattern from csv-viewer-modal.tsx:112-128
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Add Data to Pre-Release
              </h3>
              <p className="text-sm text-gray-500">File: {fileName}</p>
            </div>
            {!processing && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              >
                ×
              </button>
            )}
          </div>

          {/* Content */}
          {!processing && !success && !error && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This will add the data from this CSV file to the pre-release
                table. Once processed, this file cannot be added again.
              </p>
              <p className="text-sm text-gray-600">Do you want to proceed?</p>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Data
                </button>
              </div>
            </div>
          )}

          {processing && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Processing file...
                </div>
                {progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                )}
                {progress && (
                  <div className="text-xs text-gray-500 mt-1">
                    {progress.percentage}% complete
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Data Added Successfully
                </h3>
                <p className="text-gray-600">
                  {processedCount
                    ? `${processedCount.toLocaleString()} records processed`
                    : "Data has been added to the pre-release table"}
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Processing Failed
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setProcessing(false);
                    setSuccess(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
