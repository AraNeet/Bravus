"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  Save,
  ExternalLink,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import {
  getSpreadsheet,
  updateSpreadsheet,
  deleteSpreadsheet,
} from "@/app/api/google";
import type {
  SpreadsheetDataResponse,
  SheetDataResponse,
  SpreadsheetUpdateRequest,
} from "@/app/api/google";

interface SpreadsheetDetailProps {
  params: {
    id: string;
  };
}

export default function SpreadsheetDetail({ params }: SpreadsheetDetailProps) {
  const router = useRouter();
  const [spreadsheet, setSpreadsheet] =
    useState<SpreadsheetDataResponse | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any[][]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch spreadsheet data
  useEffect(() => {
    const fetchSpreadsheet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSpreadsheet(params.id);
        setSpreadsheet(data);

        // Initialize edited data with original data
        const initialEditedData: Record<string, any[][]> = {};
        data.sheets.forEach((sheet) => {
          initialEditedData[sheet.title] = JSON.parse(
            JSON.stringify(sheet.data)
          );
        });
        setEditedData(initialEditedData);

        setHasChanges(false);
      } catch (error) {
        console.error("Error fetching spreadsheet:", error);
        setError("Failed to load spreadsheet. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpreadsheet();
  }, [params.id]);

  // Handle cell edit
  const handleCellEdit = (
    sheetTitle: string,
    rowIndex: number,
    colIndex: number,
    value: any
  ) => {
    const newEditedData = { ...editedData };

    if (!newEditedData[sheetTitle]) {
      newEditedData[sheetTitle] = [];
    }

    if (!newEditedData[sheetTitle][rowIndex]) {
      newEditedData[sheetTitle][rowIndex] = [];
    }

    newEditedData[sheetTitle][rowIndex][colIndex] = value;
    setEditedData(newEditedData);
    setHasChanges(true);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!spreadsheet) return;

    try {
      setIsSaving(true);
      setError(null);

      const activeSheet = spreadsheet.sheets[activeSheetIndex];
      const sheetTitle = activeSheet.title;

      const updateRequest: SpreadsheetUpdateRequest = {
        range: activeSheet.range,
        values: editedData[sheetTitle] || [],
      };

      await updateSpreadsheet(params.id, updateRequest);

      // Refresh data after save
      const updatedData = await getSpreadsheet(params.id);
      setSpreadsheet(updatedData);

      // Update edited data with new data
      const newEditedData: Record<string, any[][]> = {};
      updatedData.sheets.forEach((sheet) => {
        newEditedData[sheet.title] = JSON.parse(JSON.stringify(sheet.data));
      });
      setEditedData(newEditedData);

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving spreadsheet:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete spreadsheet
  const handleDeleteSpreadsheet = async () => {
    if (!spreadsheet) return;

    if (
      !confirm(
        `Are you sure you want to delete "${spreadsheet.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await deleteSpreadsheet(params.id);

      // Redirect to sheets list
      router.push("/dashboard/owner/sheets");
    } catch (error) {
      console.error("Error deleting spreadsheet:", error);
      setError("Failed to delete spreadsheet. Please try again.");
      setIsDeleting(false);
    }
  };

  // Add a new row
  const handleAddRow = () => {
    if (!spreadsheet) return;

    const activeSheet = spreadsheet.sheets[activeSheetIndex];
    const sheetTitle = activeSheet.title;

    const newEditedData = { ...editedData };
    const currentData = newEditedData[sheetTitle] || [];
    const columnCount =
      currentData.length > 0
        ? currentData[0].length
        : activeSheet.headers?.length || 5;

    // Create a new empty row
    const newRow = Array(columnCount).fill("");

    // Add the new row
    newEditedData[sheetTitle] = [...currentData, newRow];

    setEditedData(newEditedData);
    setHasChanges(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Render error state
  if (error && !spreadsheet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="bg-black/20 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Spreadsheet</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <Link
            href="/dashboard/owner/sheets"
            className="bg-[#9f6eff] hover:bg-[#8a5de8] text-white px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Back to Sheets
          </Link>
        </div>
      </div>
    );
  }

  // Get active sheet
  const activeSheet = spreadsheet?.sheets[activeSheetIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Bravus
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {spreadsheet && (
                <a
                  href={spreadsheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center gap-1"
                  title="Open in Google Sheets"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span className="hidden md:inline">
                    Open in Google Sheets
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/owner/sheets"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">
              {spreadsheet?.title || "Spreadsheet"}
            </h1>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {spreadsheet?.sheets.map((sheet, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSheetIndex(index)}
                  className={`px-4 py-2 rounded-t-lg whitespace-nowrap ${
                    index === activeSheetIndex
                      ? "bg-white/10 text-white"
                      : "bg-black/20 text-white/60 hover:bg-black/30 hover:text-white/80"
                  }`}
                >
                  {sheet.title}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddRow}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center gap-1"
                title="Add Row"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Row</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
                className={`p-2 rounded transition-colors flex items-center gap-1 ${
                  hasChanges
                    ? "text-[#9f6eff] hover:text-[#8a5de8] hover:bg-[#9f6eff]/10"
                    : "text-white/40 cursor-not-allowed"
                }`}
                title="Save Changes"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="hidden md:inline">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </button>
              <button
                onClick={handleDeleteSpreadsheet}
                disabled={isDeleting}
                className="p-2 text-white/70 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors flex items-center gap-1"
                title="Delete Spreadsheet"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                <span className="hidden md:inline">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {activeSheet && (
          <div className="bg-black/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black/30">
                    {activeSheet.headers?.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left font-medium text-white/80 border-b border-white/10"
                      >
                        {header}
                      </th>
                    )) ||
                      activeSheet.data[0]?.map((_, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left font-medium text-white/80 border-b border-white/10"
                        >
                          {String.fromCharCode(65 + index)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {(editedData[activeSheet.title] || []).map(
                    (row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 border-r border-white/5"
                          >
                            <input
                              type="text"
                              value={cell || ""}
                              onChange={(e) =>
                                handleCellEdit(
                                  activeSheet.title,
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              className="w-full bg-transparent focus:outline-none focus:bg-white/10 px-1 py-0.5 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
