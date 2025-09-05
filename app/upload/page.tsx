'use client'

import { useState } from 'react';
import FileUpload from '@/app/components/file-upload';
import UploadedFilesList from '@/app/components/uploaded-files-list';
import { UploadedFile } from '@/app/types';

// Mock data for demonstration
const mockUploadedFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'restaurants_downtown.csv',
    size: 2456789,
    uploadedAt: new Date('2024-01-15T10:30:00'),
    status: 'completed',
  },
  {
    id: '2',
    name: 'cafes_midtown.csv',
    size: 1234567,
    uploadedAt: new Date('2024-01-14T14:20:00'),
    status: 'processing',
  },
  {
    id: '3',
    name: 'bakeries_uptown.csv',
    size: 987654,
    uploadedAt: new Date('2024-01-13T09:15:00'),
    status: 'error',
  },
];

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockUploadedFiles);

  const handleFilesSelected = (files: File[]) => {
    // TODO: Implement actual file upload logic
    console.log('Selected files:', files);
    
    // Mock: Add files to the uploaded files list
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded',
    }));

    setUploadedFiles(prev => [...newFiles, ...prev]);
  };

  const handleDeleteFile = (fileId: string) => {
    // TODO: Implement actual file deletion logic
    console.log('Delete file:', fileId);
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Upload CSV Files
          </h2>
          <p className="text-gray-600">
            Upload your business directory CSV files containing Google Maps data. 
            Files will be processed and cleaned with AI before being added to your directory.
          </p>
        </div>
        
        <FileUpload onFilesSelected={handleFilesSelected} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <UploadedFilesList 
          files={uploadedFiles} 
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
                Uploaded files will be automatically processed with AI to clean and enrich the data 
                before being saved to your production directory. This includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Data validation and formatting</li>
                <li>Business information enrichment</li>
                <li>Duplicate detection and removal</li>
                <li>Category standardization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}