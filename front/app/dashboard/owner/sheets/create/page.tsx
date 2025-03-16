"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  X,
  Plus,
  Calendar,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { createSpreadsheet } from "@/app/api/google";
import SpreadsheetGrid from "@/app/components/SpreadsheetGrid";
import { saveSpreadsheetId } from "@/app/utils/localStorageUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CreateSpreadsheet() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sheetNames, setSheetNames] = useState<string[]>(["Sheet1"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[][]>([[]]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Add a new sheet name input
  const addSheetName = () => {
    setSheetNames([...sheetNames, `Sheet${sheetNames.length + 1}`]);
  };

  // Remove a sheet name input
  const removeSheetName = (index: number) => {
    if (sheetNames.length > 1) {
      setSheetNames(sheetNames.filter((_, i) => i !== index));
      if (activeSheetIndex >= sheetNames.length - 1) {
        setActiveSheetIndex(sheetNames.length - 2);
      }
    }
  };

  // Update a sheet name
  const updateSheetName = (index: number, value: string) => {
    const newSheetNames = [...sheetNames];
    newSheetNames[index] = value;
    setSheetNames(newSheetNames);
  };

  // Handle cell change in preview grid
  const handleCellChange = (rowIndex: number, colIndex: number, value: any) => {
    const newData = [...previewData];

    // Ensure rows exist up to the edited row
    while (newData.length <= rowIndex) {
      newData.push([]);
    }

    // Ensure the row has enough columns
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }

    newData[rowIndex][colIndex] = value;
    setPreviewData(newData);
  };

  // Add a new row to preview
  const handleAddRow = () => {
    const newData = [...previewData];
    const columnCount = newData.length > 0 ? newData[0]?.length || 5 : 5;
    newData.push(Array(columnCount).fill(""));
    setPreviewData(newData);
  };

  // Add a column to preview
  const handleAddColumn = (atIndex: number) => {
    const newData = [...previewData];

    // Insert a new column at the specified index
    newData.forEach((row, rowIndex) => {
      // Make sure the row array exists
      if (!row) {
        newData[rowIndex] = [];
      }

      // Insert empty cell at specified column index
      newData[rowIndex].splice(atIndex, 0, "");
    });

    // If there's no data yet, create a sample row
    if (newData.length === 0) {
      const newRow = Array(atIndex + 1).fill("");
      newData.push(newRow);
    }

    setPreviewData(newData);
  };

  // Delete a column from preview
  const handleDeleteColumn = (colIndex: number) => {
    const newData = [...previewData];

    // Remove the column at the specified index
    newData.forEach((row) => {
      if (row) {
        row.splice(colIndex, 1);
      }
    });

    setPreviewData(newData);
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);

    // Initialize preview data if it's empty
    if (previewData.length === 1 && previewData[0].length === 0) {
      setPreviewData([Array(5).fill(""), Array(5).fill("")]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      setError("Spreadsheet title is required");
      return;
    }

    // Filter out empty sheet names
    const filteredSheetNames = sheetNames.filter((name) => name.trim() !== "");
    if (filteredSheetNames.length === 0) {
      setError("At least one sheet name is required");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Create spreadsheet
      const response = await createSpreadsheet({
        title: title.trim(),
        description: description.trim() || undefined,
        sheetNames: filteredSheetNames,
      });

      // Save to localStorage
      saveSpreadsheetId(response.spreadsheetId, title.trim());

      // Redirect to the spreadsheet view page
      router.push(`/dashboard/owner/sheets/${response.spreadsheetId}`);
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      setError("Failed to create spreadsheet. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.push("/dashboard/owner/sheets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spreadsheets
        </Button>
      </div>

      {/* Create Spreadsheet Form */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Spreadsheet</h1>
          <p className="text-white/70">
            Create a new Google Spreadsheet for your data
          </p>
        </div>

        <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-6">
                  <label htmlFor="title" className="block text-white/80 mb-2">
                    Spreadsheet Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter spreadsheet title"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-white/80 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for your spreadsheet"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 min-h-[100px]"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-white/80">
                      Sheets <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addSheetName}
                      className="text-sm text-[#9f6eff] hover:text-[#8a5de8] flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Sheet
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {sheetNames.map((name, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            updateSheetName(index, e.target.value)
                          }
                          placeholder={`Sheet ${index + 1}`}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                          required
                        />
                        {sheetNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSheetName(index)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Remove sheet"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Spreadsheet Preview</h3>
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="text-sm text-[#9f6eff] hover:text-[#8a5de8] flex items-center gap-1"
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                </div>

                {showPreview && (
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <SpreadsheetGrid
                      data={previewData}
                      onCellChange={handleCellChange}
                      onAddRow={handleAddRow}
                      onAddColumn={handleAddColumn}
                      onDeleteColumn={handleDeleteColumn}
                      sheetNames={sheetNames}
                      activeSheetIndex={activeSheetIndex}
                      onSheetChange={setActiveSheetIndex}
                      className="w-full border border-white/10 rounded"
                    />
                  </div>
                )}

                {!showPreview && (
                  <div className="border border-dashed border-white/20 rounded-lg h-[300px] flex items-center justify-center">
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80"
                    >
                      <FileSpreadsheet className="w-12 h-12" />
                      <span>Click to show spreadsheet preview</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Link
                href="/dashboard/owner/sheets"
                className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 bg-[#9f6eff] hover:bg-[#8a5de8] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {isCreating ? "Creating..." : "Create Spreadsheet"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
