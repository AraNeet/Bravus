import React, { createContext, useState, useContext, ReactNode } from "react";

interface SpreadsheetContextType {
  selectedCells: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null;
  setSelectedCells: (
    cells: {
      startRow: number;
      startCol: number;
      endRow: number;
      endCol: number;
    } | null
  ) => void;
  clipboardData: any[][] | null;
  setClipboardData: (data: any[][] | null) => void;
  cutOperation: boolean;
  setCutOperation: (value: boolean) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
  undefined
);

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (context === undefined) {
    throw new Error("useSpreadsheet must be used within a SpreadsheetProvider");
  }
  return context;
}

interface SpreadsheetProviderProps {
  children: ReactNode;
}

export default function SpreadsheetProvider({
  children,
}: SpreadsheetProviderProps) {
  const [selectedCells, setSelectedCells] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null>(null);

  const [clipboardData, setClipboardData] = useState<any[][] | null>(null);
  const [cutOperation, setCutOperation] = useState(false);

  const value = {
    selectedCells,
    setSelectedCells,
    clipboardData,
    setClipboardData,
    cutOperation,
    setCutOperation,
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}
