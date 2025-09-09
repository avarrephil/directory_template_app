"use client";

import { useState, useEffect, useCallback } from "react";
import type { FileId } from "@/lib/types";

interface CSVViewerModalProps {
  fileId: FileId;
  fileName: string;
  onClose: () => void;
}

interface CSVData {
  headers: string[];
  data: string[][];
  totalRows: number;
  currentPage: number;
  hasNextPage: boolean;
}

// Debounce utility function
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export default function CSVViewerModal({
  fileId,
  fileName,
  onClose,
}: CSVViewerModalProps) {
  const [csvData, setCsvData] = useState<CSVData>({
    headers: [],
    data: [],
    totalRows: 0,
    currentPage: 0,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCSVData = async (page: number = 0, search: string = "") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "100",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/files/${fileId}/data?${params}`);
      const result = await response.json();

      if (result.success) {
        setCsvData({
          headers: result.headers || [],
          data: result.data || [],
          totalRows: result.totalRows || 0,
          currentPage: result.currentPage || 0,
          hasNextPage: result.hasNextPage || false,
        });
      } else {
        setError(result.error || "Failed to load CSV data");
      }
    } catch (err) {
      setError("Network error loading CSV data");
      console.error("CSV fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      fetchCSVData(0, search);
    }, 300),
    [fileId]
  );

  useEffect(() => {
    fetchCSVData();
  }, [fileId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchTerm(newSearch);
    debouncedSearch(newSearch);
  };

  const handlePrevPage = () => {
    if (csvData.currentPage > 0) {
      fetchCSVData(csvData.currentPage - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (csvData.hasNextPage) {
      fetchCSVData(csvData.currentPage + 1, searchTerm);
    }
  };

  // EXACT modal pattern from sidebar.tsx:101-128
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border max-w-7xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header with file info and search */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{fileName}</h3>
              <p className="text-sm text-gray-500">
                {csvData.totalRows > 0 &&
                  `${csvData.totalRows.toLocaleString()} rows`}
                {searchTerm && ` (filtered)`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search data..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading CSV data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : csvData.data.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">
                {searchTerm
                  ? "No results found for your search"
                  : "No data found"}
              </div>
            </div>
          ) : (
            <>
              {/* Table - using existing Tailwind patterns */}
              <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {csvData.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.data.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap max-w-xs truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - reuse button styles from uploaded-files-list.tsx */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing page {csvData.currentPage + 1} • 100 rows per page
                  {csvData.totalRows > 0 && (
                    <span className="ml-2">
                      ({(csvData.currentPage * 100 + 1).toLocaleString()}-
                      {Math.min(
                        (csvData.currentPage + 1) * 100,
                        csvData.totalRows
                      ).toLocaleString()}{" "}
                      of {csvData.totalRows.toLocaleString()})
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={csvData.currentPage === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!csvData.hasNextPage}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
