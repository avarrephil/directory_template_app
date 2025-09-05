'use client'

import { useState, useCallback } from 'react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;
const ACCEPTED_FILE_TYPE = '.csv';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = (files: FileList): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (files.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed`);
      return { validFiles, errors };
    }

    Array.from(files).forEach((file) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        errors.push(`${file.name} is not a CSV file`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds 50MB limit`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    const { validFiles, errors } = validateFiles(files);
    
    setErrors(errors);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const { validFiles, errors } = validateFiles(files);
    
    setErrors(errors);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📁</span>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop CSV files here or click to browse
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Maximum 10 files, 50MB per file
            </p>
          </div>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose Files
          </button>
        </div>
      </div>

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
        <p>• TODO: Implement actual file upload logic</p>
      </div>
    </div>
  );
}