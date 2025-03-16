import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import SpreadsheetGrid from "@/app/components/SpreadsheetGrid";
import {
  getSpreadsheet,
  updateSpreadsheet,
  deleteSpreadsheet,
} from "@/app/api/google";
import {
  saveSpreadsheetId,
  removeSpreadsheetId,
  updateSpreadsheetAccess,
} from "@/app/utils/localStorageUtils";
import SpreadsheetProvider from "./SpreadsheetProvider";
import ColumnForm from "./ColumnForm";

interface SpreadsheetEditorProps {
  spreadsheetId: string;
  onBackClick?: () => void;
}

export default function SpreadsheetEditor({
  spreadsheetId,
  onBackClick,
}: SpreadsheetEditorProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [spreadsheet, setSpreadsheet] = useState<any | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any[][]>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [cellBackgroundColors, setCellBackgroundColors] = useState<
    Record<string, string>
  >({});
  const [cellTextFormatting, setCellTextFormatting] = useState<
    Record<string, any>
  >({});

  // Fetch spreadsheet data
  useEffect(() => {
    const fetchSpreadsheet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSpreadsheet(spreadsheetId);
        setSpreadsheet(data);

        // Initialize edited data and formatting
        const initialEditedData: Record<string, any[][]> = {};
        const initialBackgroundColors: Record<string, string> = {};
        const initialTextFormatting: Record<string, any> = {};

        data.sheets.forEach((sheet: any) => {
          // Create a deep copy of the data
          const sheetData = JSON.parse(JSON.stringify(sheet.data));

          // Ensure all cells have at least an empty string
          for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
            const row = sheetData[rowIndex] || [];
            for (let colIndex = 0; colIndex < (row.length || 1); colIndex++) {
              // Initialize undefined or null cells with empty string
              if (row[colIndex] === undefined || row[colIndex] === null) {
                row[colIndex] = "";
              }
            }
            sheetData[rowIndex] = row;
          }

          initialEditedData[sheet.title] = sheetData;

          // Extract formatting information if available
          if (sheet.meta) {
            if (sheet.meta.cellBackgroundColors) {
              try {
                const bgColors = JSON.parse(sheet.meta.cellBackgroundColors);
                Object.assign(initialBackgroundColors, bgColors);
              } catch (e) {
                console.error("Error parsing cell background colors:", e);
              }
            }

            if (sheet.meta.textFormatting) {
              try {
                const formatting = JSON.parse(sheet.meta.textFormatting);
                Object.assign(initialTextFormatting, formatting);
              } catch (e) {
                console.error("Error parsing text formatting:", e);
              }
            }
          }
        });

        setEditedData(initialEditedData);
        setCellBackgroundColors(initialBackgroundColors);
        setCellTextFormatting(initialTextFormatting);
        setHasChanges(false);

        // Save to localStorage
        if (data.title) {
          saveSpreadsheetId(spreadsheetId, data.title);
        } else {
          updateSpreadsheetAccess(spreadsheetId);
        }
      } catch (error) {
        console.error("Error fetching spreadsheet:", error);
        setError("Failed to load spreadsheet. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpreadsheet();
  }, [spreadsheetId]);

  // Handle cell edit
  const handleCellEdit = (rowIndex: number, colIndex: number, value: any) => {
    if (!spreadsheet) return;

    const sheetTitle = spreadsheet.sheets[activeSheetIndex].title;
    const newEditedData = { ...editedData };

    if (!newEditedData[sheetTitle]) {
      newEditedData[sheetTitle] = [];
    }

    // Ensure rows exist
    while (newEditedData[sheetTitle].length <= rowIndex) {
      newEditedData[sheetTitle].push([]);
    }

    // Ensure columns exist
    if (!newEditedData[sheetTitle][rowIndex]) {
      newEditedData[sheetTitle][rowIndex] = [];
    }

    // Store empty values as empty strings, not null or undefined
    newEditedData[sheetTitle][rowIndex][colIndex] =
      value === null || value === undefined ? "" : value;

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

      // Ensure all values are non-null before saving
      const processedValues = (editedData[sheetTitle] || []).map((row) =>
        row.map((cell) => (cell === null || cell === undefined ? "" : cell))
      );

      const updateRequest = {
        range: activeSheet.range,
        values: processedValues,
      };

      await updateSpreadsheet(spreadsheetId, updateRequest);

      // Refresh data
      const updatedData = await getSpreadsheet(spreadsheetId);
      setSpreadsheet(updatedData);

      // Update edited data with empty strings for null values
      const newEditedData: Record<string, any[][]> = {};
      updatedData.sheets.forEach((sheet: any) => {
        const sheetData = JSON.parse(JSON.stringify(sheet.data));

        // Ensure all cells have at least an empty string
        for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
          const row = sheetData[rowIndex] || [];
          for (let colIndex = 0; colIndex < (row.length || 1); colIndex++) {
            if (row[colIndex] === undefined || row[colIndex] === null) {
              row[colIndex] = "";
            }
          }
          sheetData[rowIndex] = row;
        }

        newEditedData[sheet.title] = sheetData;
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

      await deleteSpreadsheet(spreadsheetId);

      // Remove from localStorage
      removeSpreadsheetId(spreadsheetId);

      // Redirect to sheets list
      router.push("/dashboard/owner/sheets");
    } catch (error) {
      console.error("Error deleting spreadsheet:", error);
      setError("Failed to delete spreadsheet. Please try again.");
      setIsDeleting(false);
    }
  };

  // Add row handler
  const handleAddRow = () => {
    if (!spreadsheet) return;

    const activeSheet = spreadsheet.sheets[activeSheetIndex];
    const sheetTitle = activeSheet.title;

    const newEditedData = { ...editedData };
    const currentData = newEditedData[sheetTitle] || [];
    const columnCount =
      currentData.length > 0 && currentData[0]
        ? currentData[0].length
        : activeSheet.headers?.length || 5;

    // Create empty row
    const newRow = Array(columnCount).fill("");

    // Add new row
    newEditedData[sheetTitle] = [...currentData, newRow];

    setEditedData(newEditedData);
    setHasChanges(true);
  };

  // Add column handler
  const handleAddColumn = (atIndex: number) => {
    if (!spreadsheet) return;

    const activeSheet = spreadsheet.sheets[activeSheetIndex];
    const sheetTitle = activeSheet.title;

    const newEditedData = { ...editedData };
    const currentData = newEditedData[sheetTitle] || [];

    // Insert column
    currentData.forEach((row, rowIndex) => {
      if (!row) {
        currentData[rowIndex] = [];
      }

      currentData[rowIndex].splice(atIndex, 0, "");
    });

    // If no data, create sample row
    if (currentData.length === 0) {
      const newRow = Array(atIndex + 1).fill("");
      currentData.push(newRow);
    }

    newEditedData[sheetTitle] = currentData;
    setEditedData(newEditedData);
    setHasChanges(true);
  };

  // Delete column handler
  const handleDeleteColumn = (colIndex: number) => {
    if (!spreadsheet) return;

    const activeSheet = spreadsheet.sheets[activeSheetIndex];
    const sheetTitle = activeSheet.title;

    const newEditedData = { ...editedData };
    const currentData = newEditedData[sheetTitle] || [];

    // Remove column
    currentData.forEach((row) => {
      if (row) {
        row.splice(colIndex, 1);
      }
    });

    newEditedData[sheetTitle] = currentData;
    setEditedData(newEditedData);
    setHasChanges(true);
  };

  // Sheet change handler
  const handleSheetChange = (index: number) => {
    setActiveSheetIndex(index);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin w-10 h-10 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error state
  if (error && !spreadsheet) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="bg-black/20 rounded-xl p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Spreadsheet</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={onBackClick}
            className="bg-[#9f6eff] hover:bg-[#8a5de8] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Sheets
          </button>
        </div>
      </div>
    );
  }

  // Get active sheet data
  const activeSheet = spreadsheet?.sheets[activeSheetIndex];
  const activeSheetData = activeSheet
    ? editedData[activeSheet.title] || []
    : [];
  const sheetNames = spreadsheet?.sheets.map((sheet: any) => sheet.title) || [];

  return (
    <SpreadsheetProvider>
      <div
        ref={containerRef}
        className="flex flex-col h-full w-full bg-black/20 rounded-lg overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-white/10">
          <h1 className="text-lg font-medium truncate">
            {spreadsheet?.title || "Spreadsheet"}
          </h1>

          <div className="flex items-center gap-2">
            {error && !isLoading && (
              <div className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleDeleteSpreadsheet}
              disabled={isDeleting}
              className="p-1.5 text-white/70 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
              title="Delete spreadsheet"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving || !hasChanges}
              className={`
                px-3 py-1.5 rounded flex items-center gap-2
                ${
                  hasChanges
                    ? "bg-[#9f6eff] hover:bg-[#8a5de8]"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }
                transition-colors
              `}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Grid - Full height */}
        <div className="flex-grow overflow-hidden">
          {activeSheet && (
            <SpreadsheetGrid
              data={activeSheetData}
              headers={activeSheet.headers}
              onCellChange={handleCellEdit}
              readOnly={isSaving}
              initialColumnWidths={columnWidths}
              backgroundColor={cellBackgroundColors}
              textFormatting={cellTextFormatting}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddRow={handleAddRow}
              sheetNames={sheetNames}
              activeSheetIndex={activeSheetIndex}
              onSheetChange={handleSheetChange}
              className="h-full w-full"
            />
          )}
        </div>
      </div>
    </SpreadsheetProvider>
  );
}
