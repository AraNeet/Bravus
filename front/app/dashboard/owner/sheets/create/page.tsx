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

export default function CreateSpreadsheet() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sheetNames, setSheetNames] = useState<string[]>(["Sheet1"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new sheet name input
  const addSheetName = () => {
    setSheetNames([...sheetNames, `Sheet${sheetNames.length + 1}`]);
  };

  // Remove a sheet name input
  const removeSheetName = (index: number) => {
    if (sheetNames.length > 1) {
      setSheetNames(sheetNames.filter((_, i) => i !== index));
    }
  };

  // Update a sheet name
  const updateSheetName = (index: number, value: string) => {
    const newSheetNames = [...sheetNames];
    newSheetNames[index] = value;
    setSheetNames(newSheetNames);
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

      // Redirect to the spreadsheet view page
      router.push(`/dashboard/owner/sheets/${response.spreadsheetId}`);
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      setError("Failed to create spreadsheet. Please try again.");
      setIsCreating(false);
    }
  };

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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard/owner/sheets"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Create New Spreadsheet</h1>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-black/20 rounded-xl p-6">
            <form onSubmit={handleSubmit}>
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

                <div className="space-y-3">
                  {sheetNames.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateSheetName(index, e.target.value)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
