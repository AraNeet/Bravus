"use client";

import React from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import SpreadsheetEditor from "../../../../components/SpreadsheetEditor";
import { Button } from "@/components/ui/button";

export default function SpreadsheetEdit() {
  const params = useParams();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const spreadsheetId = params.id as string;

  const handleBackClick = () => {
    setIsExiting(true);
    router.push("/dashboard/owner/sheets");
  };

  return (
    <div className="space-y-4 h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="text-white/70 hover:text-white flex items-center gap-1"
          disabled={isExiting}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spreadsheets
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-[#9f6eff]/20 p-1 rounded-full">
            <FileSpreadsheet className="w-4 h-4 text-[#9f6eff]" />
          </div>
          <h1 className="font-medium">Edit Spreadsheet</h1>
        </div>
      </div>

      {/* Spreadsheet Editor */}
      <div className="flex-grow bg-white/3 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <SpreadsheetEditor
          spreadsheetId={spreadsheetId}
          onBackClick={handleBackClick}
        />
      </div>
    </div>
  );
}
