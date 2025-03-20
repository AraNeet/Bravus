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
  Loader2,
} from "lucide-react";
import { createSpreadsheet } from "@/app/api/google";
import SpreadsheetGrid from "@/app/components/SpreadsheetGrid";
import { saveSpreadsheetId } from "@/app/utils/localStorageUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
        name: title.trim(),
        description: description.trim() || undefined,
        sheetNames: filteredSheetNames,
      });

      // Save to localStorage
      saveSpreadsheetId(response.id, title.trim());

      // Redirect to the spreadsheet view page
      router.push(`/dashboard/owner/sheets/${response.id}`);
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      setError("Failed to create spreadsheet. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/dashboard/owner/sheets"
          className="text-white/70 hover:text-white flex items-center gap-1 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spreadsheets
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-spink to-mred bg-clip-text text-transparent">
        Create Spreadsheet
      </h1>
      <p className="text-white/70 mb-6">
        Create a new Google spreadsheet to store and manage your data
      </p>

      <div className="space-y-8 bg-navy/30 backdrop-blur-sm rounded-xl border border-gteal/20 p-6 shadow-lg shadow-navy/30">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter spreadsheet title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-navy/40 border-gteal/20 focus:border-mred/40 focus:ring-mred/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this spreadsheet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-navy/40 border-gteal/20 focus:border-mred/40 focus:ring-mred/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sheet Names</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSheetName}
                className="text-white/80 border-gteal/20 bg-navy/50 hover:bg-navy/70 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Sheet
              </Button>
            </div>
            <div className="space-y-3">
              {sheetNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Sheet ${index + 1}`}
                    value={name}
                    onChange={(e) => updateSheetName(index, e.target.value)}
                    className="bg-navy/40 border-gteal/20 focus:border-mred/40 focus:ring-mred/30 text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSheetName(index)}
                    disabled={sheetNames.length <= 1}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gteal/20 pt-4">
            <div className="flex items-center mb-2">
              <Switch
                id="preview"
                checked={showPreview}
                onCheckedChange={setShowPreview}
                className="data-[state=checked]:bg-mred"
              />
              <Label htmlFor="preview" className="ml-2">
                Show preview
              </Label>
            </div>
            {showPreview && (
              <div className="border border-gteal/20 rounded-lg overflow-hidden mt-4">
                <SpreadsheetGrid
                  data={previewData}
                  sheetNames={sheetNames}
                  activeSheetIndex={activeSheetIndex}
                  onCellChange={handleCellChange}
                  onAddRow={handleAddRow}
                  onAddColumn={handleAddColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onSheetChange={setActiveSheetIndex}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-white">Error</h3>
              <p className="text-white/70">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-gteal/20 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/owner/sheets")}
            className="border-gteal/20 bg-navy/50 hover:bg-navy/70 text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || !title || !sheetNames[0]}
            className="bg-gradient-to-r from-mred to-spink hover:opacity-90 border-none text-white shadow-md shadow-navy/20"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Create Spreadsheet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
