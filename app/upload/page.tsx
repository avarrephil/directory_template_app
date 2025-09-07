"use client";

import { useState } from "react";
import FileUpload from "@/app/components/file-upload";
import UploadedFilesList from "@/app/components/uploaded-files-list";
import type { FileUploadResult } from "@/lib/supabase-client";
import type { FileId } from "@/lib/types";

export default function UploadPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFilesUploaded = (results: FileUploadResult[]) => {
    console.log("Upload results:", results);

    // Trigger refresh of uploaded files list
    setRefreshTrigger((prev) => prev + 1);

    // Show summary of results
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      console.log(`Successfully uploaded ${successful} file(s)`);
    }
    if (failed > 0) {
      console.log(`Failed to upload ${failed} file(s)`);
    }
  };

  const handleDeleteFile = (fileId: FileId) => {
    console.log("File deleted:", fileId);
    // File list will automatically refresh via the component
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Upload CSV Files
          </h2>
          <p className="text-gray-600">
            Upload your business directory CSV files containing Google Maps
            data. Files will be processed and cleaned with AI before being added
            to your directory.
          </p>
        </div>

        <FileUpload onFilesUploaded={handleFilesUploaded} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UploadedFilesList
          refreshTrigger={refreshTrigger}
          onDeleteFile={handleDeleteFile}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Processing Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Uploaded files are securely stored and their metadata tracked in
                the database. The current implementation includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Secure file storage in cloud storage</li>
                <li>Real-time upload progress tracking</li>
                <li>File validation and error handling</li>
                <li>Database synchronization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
