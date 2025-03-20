"use client";

import React from "react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import SpreadsheetEditor from "../../../../components/SpreadsheetEditor";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function SpreadsheetEdit() {
  const params = useParams();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const spreadsheetId = params.id as string;
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [exitConfirmationRequired, setExitConfirmationRequired] = useState(false);

  const handleBackNavigation = () => {
    if (exitConfirmationRequired) {
      setShowExitConfirmation(true);
    } else {
      router.push("/dashboard/owner/sheets");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              onClick={handleBackNavigation}
              className="text-white/70 hover:text-white flex items-center gap-1 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Spreadsheets
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-spink to-mred bg-clip-text text-transparent">
            Edit Spreadsheet
          </h1>
        </div>
      </div>

      <div className="bg-navy/30 backdrop-blur-sm rounded-xl border border-gteal/20 shadow-lg shadow-navy/30">
        <SpreadsheetEditor
          spreadsheetId={params.id as string}
          onBackClick={() => handleBackNavigation()}
        />
      </div>

      <AlertDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
      >
        <AlertDialogContent className="bg-navy border-gteal/20 text-white animate-fadeIn">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              You have unsaved changes that will be lost if you leave this page.
              Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-navy/50 hover:bg-navy/70 border border-gteal/20 text-white"
              onClick={() => setShowExitConfirmation(false)}
            >
              Stay on Page
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-mred to-spink hover:opacity-90 border-none text-white"
              onClick={() => router.push("/dashboard/owner/sheets")}
            >
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
