import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Scissors,
  ChevronRight,
} from "lucide-react";
import SpreadsheetContextMenu, {
  createColumnMenuOptions,
  createCellMenuOptions,
} from "./SpreadsheetContextMenu";

// Define column width constants
const DEFAULT_COLUMN_WIDTH = 120;
const MIN_COLUMN_WIDTH = 60;
const MAX_COLUMN_WIDTH = 500;

// Generate column labels (A, B, C, ... Z, AA, AB, etc.)
const generateColumnLabel = (index: number): string => {
  let label = "";
  let n = index;

  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }

  return label;
};

interface SpreadsheetGridProps {
  data: any[][];
  headers?: string[];
  onCellChange: (rowIndex: number, colIndex: number, value: any) => void;
  className?: string;
  readOnly?: boolean;
  initialColumnWidths?: Record<number, number>;
  backgroundColor?: Record<string, string>;
  textFormatting?: Record<string, any>;
  onAddColumn?: (atIndex: number) => void;
  onDeleteColumn?: (index: number) => void;
  onAddRow?: () => void;
  sheetNames?: string[];
  activeSheetIndex?: number;
  onSheetChange?: (index: number) => void;
  onAddSheet?: () => void;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data = [],
  headers,
  onCellChange,
  className = "",
  readOnly = false,
  initialColumnWidths = {},
  backgroundColor = {},
  textFormatting = {},
  onAddColumn,
  onDeleteColumn,
  onAddRow,
  sheetNames = ["Sheet1"],
  activeSheetIndex = 0,
  onSheetChange,
  onAddSheet,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const [activeCell, setActiveCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);

  const [cellValue, setCellValue] = useState<string>("");
  const [formulaBarValue, setFormulaBarValue] = useState<string>("");

  // Column state
  const [columnWidths, setColumnWidths] =
    useState<Record<number, number>>(initialColumnWidths);
  const [frozenColumns, setFrozenColumns] = useState<number[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<number[]>([]);

  // Resizing state
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [startResizeX, setStartResizeX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);

  // Selection state
  const [selectedRange, setSelectedRange] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: "column" | "cell" | "row";
    target: number;
    options: any[];
  } | null>(null);

  // Add state to track visible rows
  const [visibleRows, setVisibleRows] = useState<number>(5);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // Add state to track visible columns
  const [visibleColumns, setVisibleColumns] = useState<number>(5);
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);

  // Calculate how many rows to display
  const displayedData = showAllRows ? data : data.slice(0, visibleRows);

  // Calculate total columns
  const totalColumns =
    data.length > 0 ? Math.max(data[0]?.length || 0, 20) : 20;

  // Calculate how many columns to display
  const effectiveColumns = showAllColumns
    ? totalColumns
    : Math.min(visibleColumns, totalColumns);

  // Generate column headers (A, B, C, etc.)
  const columnHeaders = Array.from({ length: totalColumns }, (_, i) =>
    generateColumnLabel(i)
  );

  // Handle cell click
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (readOnly) return;

    setActiveCell({ rowIndex, colIndex });

    // Set formula bar value to the cell value or empty string
    const value = data[rowIndex]?.[colIndex] ?? "";
    setFormulaBarValue(String(value));

    // Start a new selection range
    setSelectedRange({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
    });
  };

  // Handle cell input change
  const handleCellInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (readOnly) return;

    const value = e.target.value;
    setFormulaBarValue(value);
    onCellChange(rowIndex, colIndex, value);
  };

  // Handle formula bar change
  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !activeCell) return;

    const value = e.target.value;
    setFormulaBarValue(value);
    onCellChange(activeCell.rowIndex, activeCell.colIndex, value);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly || !activeCell) return;

    const { rowIndex, colIndex } = activeCell;
    const maxRow = data.length - 1;
    const maxCol = totalColumns - 1;

    switch (e.key) {
      case "ArrowUp":
        if (rowIndex > 0) {
          e.preventDefault();
          setActiveCell({ rowIndex: rowIndex - 1, colIndex });
          setFormulaBarValue(String(data[rowIndex - 1]?.[colIndex] ?? ""));
          setSelectedRange({
            startRow: rowIndex - 1,
            startCol: colIndex,
            endRow: rowIndex - 1,
            endCol: colIndex,
          });
        }
        break;
      case "ArrowDown":
        if (rowIndex < maxRow) {
          e.preventDefault();
          setActiveCell({ rowIndex: rowIndex + 1, colIndex });
          setFormulaBarValue(String(data[rowIndex + 1]?.[colIndex] ?? ""));
          setSelectedRange({
            startRow: rowIndex + 1,
            startCol: colIndex,
            endRow: rowIndex + 1,
            endCol: colIndex,
          });
        }
        break;
      case "ArrowLeft":
        if (colIndex > 0) {
          e.preventDefault();
          setActiveCell({ rowIndex, colIndex: colIndex - 1 });
          setFormulaBarValue(String(data[rowIndex]?.[colIndex - 1] ?? ""));
          setSelectedRange({
            startRow: rowIndex,
            startCol: colIndex - 1,
            endRow: rowIndex,
            endCol: colIndex - 1,
          });
        }
        break;
      case "ArrowRight":
        if (colIndex < maxCol) {
          e.preventDefault();
          setActiveCell({ rowIndex, colIndex: colIndex + 1 });
          setFormulaBarValue(String(data[rowIndex]?.[colIndex + 1] ?? ""));
          setSelectedRange({
            startRow: rowIndex,
            startCol: colIndex + 1,
            endRow: rowIndex,
            endCol: colIndex + 1,
          });
        }
        break;
      case "Tab":
        e.preventDefault();
        if (colIndex < maxCol) {
          setActiveCell({ rowIndex, colIndex: colIndex + 1 });
          setFormulaBarValue(String(data[rowIndex]?.[colIndex + 1] ?? ""));
          setSelectedRange({
            startRow: rowIndex,
            startCol: colIndex + 1,
            endRow: rowIndex,
            endCol: colIndex + 1,
          });
        } else if (rowIndex < maxRow) {
          setActiveCell({ rowIndex: rowIndex + 1, colIndex: 0 });
          setFormulaBarValue(String(data[rowIndex + 1]?.[0] ?? ""));
          setSelectedRange({
            startRow: rowIndex + 1,
            startCol: 0,
            endRow: rowIndex + 1,
            endCol: 0,
          });
        }
        break;
      case "Enter":
        e.preventDefault();
        if (rowIndex < maxRow) {
          setActiveCell({ rowIndex: rowIndex + 1, colIndex });
          setFormulaBarValue(String(data[rowIndex + 1]?.[colIndex] ?? ""));
          setSelectedRange({
            startRow: rowIndex + 1,
            startCol: colIndex,
            endRow: rowIndex + 1,
            endCol: colIndex,
          });
        }
        break;
    }
  };

  // Handle column resize
  const handleColumnResizeStart = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();

    setResizingColumn(colIndex);
    setStartResizeX(e.clientX);
    setStartWidth(columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH);

    document.addEventListener("mousemove", handleColumnResizeMove);
    document.addEventListener("mouseup", handleColumnResizeEnd);
  };

  const handleColumnResizeMove = (e: MouseEvent) => {
    if (resizingColumn === null) return;

    const diff = e.clientX - startResizeX;
    const newWidth = Math.max(
      MIN_COLUMN_WIDTH,
      Math.min(MAX_COLUMN_WIDTH, startWidth + diff)
    );

    setColumnWidths((prev) => ({
      ...prev,
      [resizingColumn]: newWidth,
    }));
  };

  const handleColumnResizeEnd = () => {
    setResizingColumn(null);
    document.removeEventListener("mousemove", handleColumnResizeMove);
    document.removeEventListener("mouseup", handleColumnResizeEnd);
  };

  // Toggle column frozen state
  const toggleColumnFrozen = (colIndex: number) => {
    setFrozenColumns((prev) =>
      prev.includes(colIndex)
        ? prev.filter((col) => col !== colIndex)
        : [...prev, colIndex]
    );
  };

  // Toggle column visibility
  const toggleColumnVisibility = (colIndex: number) => {
    setHiddenColumns((prev) =>
      prev.includes(colIndex)
        ? prev.filter((col) => col !== colIndex)
        : [...prev, colIndex]
    );
  };

  // Handle range selection with mouse
  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    if (readOnly) return;

    setSelectedRange({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!tableRef.current) return;

      // Get the cell element under the cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const cell = element?.closest("td, th");

      if (cell && cell.tagName === "TD") {
        const rowAttr = cell.getAttribute("data-row");
        const colAttr = cell.getAttribute("data-col");

        if (rowAttr && colAttr) {
          const currentRow = parseInt(rowAttr, 10);
          const currentCol = parseInt(colAttr, 10);

          setSelectedRange((prev) => ({
            startRow: prev?.startRow ?? rowIndex,
            startCol: prev?.startCol ?? colIndex,
            endRow: currentRow,
            endCol: currentCol,
          }));
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle right click on column header
  const handleColumnHeaderContextMenu = (
    e: React.MouseEvent,
    colIndex: number
  ) => {
    e.preventDefault();

    const isFrozen = frozenColumns.includes(colIndex);
    const isHidden = hiddenColumns.includes(colIndex);

    const options = createColumnMenuOptions({
      colIndex,
      isFrozen,
      isHidden,
      onInsertLeft: () => {
        if (onAddColumn) onAddColumn(colIndex);
      },
      onInsertRight: () => {
        if (onAddColumn) onAddColumn(colIndex + 1);
      },
      onDelete: () => {
        if (onDeleteColumn) onDeleteColumn(colIndex);
      },
      onFreeze: () => toggleColumnFrozen(colIndex),
      onUnfreeze: () => toggleColumnFrozen(colIndex),
      onHide: () => toggleColumnVisibility(colIndex),
      onShow: () => toggleColumnVisibility(colIndex),
      canDelete: true,
    });

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "column",
      target: colIndex,
      options,
    });
  };

  // Handle right click on cell
  const handleCellContextMenu = (
    e: React.MouseEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    e.preventDefault();

    const options = createCellMenuOptions({
      rowIndex,
      colIndex,
      onCut: () => {
        // Implement cut functionality
        console.log("Cut cell", rowIndex, colIndex);
      },
      onCopy: () => {
        // Implement copy functionality
        console.log("Copy cell", rowIndex, colIndex);
      },
      onPaste: () => {
        // Implement paste functionality
        console.log("Paste to cell", rowIndex, colIndex);
      },
    });

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: "cell",
      target: colIndex,
      options,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Check if a cell is in the selected range
  const isCellSelected = (rowIndex: number, colIndex: number) => {
    if (!selectedRange) return false;

    const { startRow, startCol, endRow, endCol } = selectedRange;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    return (
      rowIndex >= minRow &&
      rowIndex <= maxRow &&
      colIndex >= minCol &&
      colIndex <= maxCol
    );
  };

  // Get cell reference (e.g., A1, B2)
  const getCellReference = (rowIndex: number, colIndex: number) => {
    return `${generateColumnLabel(colIndex)}${rowIndex + 1}`;
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleColumnResizeMove);
      document.removeEventListener("mouseup", handleColumnResizeEnd);
    };
  }, []);

  // Get column width (with default if not set)
  const getColumnWidth = (colIndex: number) => {
    return columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH;
  };

  // Get cell background color
  const getCellBackgroundColor = (rowIndex: number, colIndex: number) => {
    const cellRef = getCellReference(rowIndex, colIndex);
    return backgroundColor[cellRef] || "";
  };

  // Get cell text formatting
  const getCellTextFormatting = (rowIndex: number, colIndex: number) => {
    const cellRef = getCellReference(rowIndex, colIndex);
    return textFormatting[cellRef] || {};
  };

  // Add a new row handler
  const handleAddRow = () => {
    if (onAddRow) {
      onAddRow();
    }
  };

  // Handle showing more rows
  const handleShowMoreRows = () => {
    setShowAllRows(true);
  };

  // Handle showing more columns
  const handleShowMoreColumns = () => {
    setShowAllColumns(true);
  };

  // Effect for updating container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (gridRef.current && gridContainerRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const containerRect = gridContainerRef.current.getBoundingClientRect();

        setContainerHeight(containerRect.height);
        setContainerWidth(containerRect.width);
      }
    };

    // Initialize dimensions
    updateDimensions();

    // Set up resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    // Fallback to window resize event
    window.addEventListener("resize", updateDimensions);

    return () => {
      if (gridRef.current) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div
      className={`flex flex-col ${className}`}
      ref={gridRef}
      style={{ height: "100%", width: "100%" }}
    >
      {/* Sheet tabs - horizontally scrollable */}
      <div className="flex items-center overflow-x-auto border-b border-white/10 mb-2">
        {sheetNames.map((name, index) => (
          <button
            key={index}
            className={`px-3 py-1.5 text-sm whitespace-nowrap ${
              index === activeSheetIndex
                ? "bg-white/10 text-white font-medium"
                : "text-white/60 hover:bg-white/5"
            } transition-colors`}
            onClick={() => onSheetChange && onSheetChange(index)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Formula bar */}
      <div className="flex items-center bg-white/5 border border-white/10 rounded-t-md px-2 py-1.5 mb-1">
        {activeCell && (
          <div className="mr-2 px-2 py-1 bg-white/10 rounded text-sm text-white/60">
            {getCellReference(activeCell.rowIndex, activeCell.colIndex)}
          </div>
        )}
        <input
          type="text"
          value={formulaBarValue}
          onChange={handleFormulaBarChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="Enter value or formula"
          className="flex-grow bg-transparent border-none outline-none text-white text-sm"
          disabled={readOnly || !activeCell}
        />
      </div>

      {/* Grid container with responsive height */}
      <div ref={gridContainerRef} className="flex-grow relative overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              {/* Corner Cell */}
              <th className="bg-[#292240] sticky top-0 left-0 z-20 w-10 h-8 border border-white/10 text-center text-xs font-medium text-white/60 select-none">
                ⌞⌝
              </th>

              {/* Column Headers */}
              {Array.from({ length: effectiveColumns }).map((_, colIndex) => {
                // Skip hidden columns
                if (hiddenColumns.includes(colIndex)) return null;

                const isFrozen = frozenColumns.includes(colIndex);
                const colWidth = getColumnWidth(colIndex);

                return (
                  <th
                    key={colIndex}
                    className={`bg-[#292240] py-1 px-2 border border-white/10 text-white/80 text-sm font-medium sticky top-0 select-none ${
                      isFrozen ? "sticky left-10 z-10" : ""
                    }`}
                    style={{
                      width: colWidth,
                      minWidth: colWidth,
                      maxWidth: colWidth,
                    }}
                    onContextMenu={(e) =>
                      handleColumnHeaderContextMenu(e, colIndex)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {headers?.[colIndex] || generateColumnLabel(colIndex)}
                      </span>
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#9f6eff]/50"
                        onMouseDown={(e) =>
                          handleColumnResizeStart(e, colIndex)
                        }
                      />
                    </div>
                  </th>
                );
              })}

              {/* "Show More" button for columns */}
              {!showAllColumns && totalColumns > visibleColumns && (
                <th className="bg-[#292240] sticky top-0 border border-white/10 bg-white/5 hover:bg-white/10">
                  <button
                    className="w-full h-full flex items-center justify-center gap-1 text-white/70 hover:text-white transition-colors py-1.5 px-2"
                    onClick={handleShowMoreColumns}
                    title="Show more columns"
                  >
                    <ChevronRight size={14} />
                    <span className="text-sm whitespace-nowrap">
                      More ({totalColumns - visibleColumns})
                    </span>
                  </button>
                </th>
              )}

              {/* Add Column Button */}
              {onAddColumn && (
                <th className="bg-[#292240] sticky top-0 w-10 border border-white/10 text-center">
                  <button
                    className="w-full h-full flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
                    onClick={() => onAddColumn(data[0]?.length || 0)}
                    title="Add column"
                  >
                    <Plus size={14} />
                  </button>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* Empty state if no data */}
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    effectiveColumns +
                    2 +
                    (!showAllColumns && totalColumns > visibleColumns ? 1 : 0)
                  }
                  className="text-center py-8 text-white/50 bg-black/20"
                >
                  No data available
                </td>
              </tr>
            ) : (
              // Render data rows (limited to visibleRows)
              displayedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Row Headers */}
                  <td className="bg-[#292240] py-1 px-2 border border-white/10 text-white/60 text-sm font-medium text-center sticky left-0 z-10 select-none">
                    {rowIndex + 1}
                  </td>

                  {/* Cells - limited to effectiveColumns */}
                  {Array.from({
                    length: Math.max(row.length || 0, effectiveColumns),
                  }).map((_, colIndex) => {
                    // Skip columns beyond the visible limit
                    if (colIndex >= effectiveColumns) return null;

                    // Skip hidden columns
                    if (hiddenColumns.includes(colIndex)) return null;

                    const isFrozen = frozenColumns.includes(colIndex);
                    const isActive =
                      activeCell?.rowIndex === rowIndex &&
                      activeCell?.colIndex === colIndex;
                    const isSelected = isCellSelected(rowIndex, colIndex);
                    const cellBgColor = getCellBackgroundColor(
                      rowIndex,
                      colIndex
                    );
                    const cellFormat = getCellTextFormatting(
                      rowIndex,
                      colIndex
                    );

                    // Determine text alignment
                    let textAlign = "left";
                    if (cellFormat?.align === "center") textAlign = "center";
                    if (cellFormat?.align === "right") textAlign = "right";

                    return (
                      <td
                        key={colIndex}
                        data-row={rowIndex}
                        data-col={colIndex}
                        className={`border border-white/10 p-0 ${
                          isFrozen ? "sticky left-10 z-[5]" : ""
                        } ${
                          isActive
                            ? "outline outline-2 outline-[#9f6eff] z-[1]"
                            : ""
                        } ${
                          isSelected
                            ? "bg-[#9f6eff]/20"
                            : cellBgColor || "bg-white/5"
                        }`}
                        style={{
                          width: getColumnWidth(colIndex),
                          minWidth: getColumnWidth(colIndex),
                          maxWidth: getColumnWidth(colIndex),
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onContextMenu={(e) =>
                          handleCellContextMenu(e, rowIndex, colIndex)
                        }
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      >
                        <input
                          type="text"
                          value={
                            row[colIndex] === undefined ||
                            row[colIndex] === null
                              ? ""
                              : row[colIndex]
                          }
                          onChange={(e) =>
                            handleCellInputChange(e, rowIndex, colIndex)
                          }
                          disabled={readOnly}
                          className={`w-full h-full py-1.5 px-2 bg-transparent border-none outline-none text-sm ${
                            readOnly
                              ? "cursor-default"
                              : "cursor-text focus:bg-white/10"
                          } transition-colors`}
                          style={{
                            textAlign: textAlign as any,
                            fontWeight: cellFormat?.bold ? "bold" : "normal",
                            fontStyle: cellFormat?.italic ? "italic" : "normal",
                            textDecoration: cellFormat?.underline
                              ? "underline"
                              : "none",
                            color: cellFormat?.color || "white",
                          }}
                        />
                      </td>
                    );
                  })}

                  {/* "Show More" button for columns in each row */}
                  {!showAllColumns && totalColumns > visibleColumns && (
                    <td
                      className="border border-white/10 bg-white/5 hover:bg-white/10 p-0"
                      onClick={handleShowMoreColumns}
                      style={{
                        minWidth: "80px",
                      }}
                    >
                      <button className="w-full h-full flex items-center justify-center gap-1 text-white/70 hover:text-white transition-colors py-1.5 px-2">
                        <ChevronRight size={14} />
                        <span className="text-sm">More</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}

            {/* "Show More" button - only show if there are more rows and not showing all already */}
            {!showAllRows && data.length > visibleRows && (
              <tr>
                <td
                  colSpan={
                    effectiveColumns +
                    2 +
                    (!showAllColumns && totalColumns > visibleColumns ? 1 : 0)
                  }
                  className="border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <button
                    className="w-full py-1.5 flex items-center justify-center gap-1 text-white/70 hover:text-white transition-colors text-sm"
                    onClick={handleShowMoreRows}
                  >
                    <ChevronDown size={14} />
                    <span>
                      Show More Rows ({data.length - visibleRows} more)
                    </span>
                  </button>
                </td>
              </tr>
            )}

            {/* Add Row Button */}
            {onAddRow && (
              <tr>
                <td
                  colSpan={
                    effectiveColumns +
                    2 +
                    (!showAllColumns && totalColumns > visibleColumns ? 1 : 0)
                  }
                  className="border border-white/10 bg-black/20"
                >
                  <button
                    className="w-full py-1 flex items-center justify-center gap-1 text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors text-sm"
                    onClick={handleAddRow}
                  >
                    <Plus size={14} />
                    <span>Add Row</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Context Menu */}
        {contextMenu && (
          <SpreadsheetContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            visible={contextMenu.visible}
            options={contextMenu.options}
            onClose={closeContextMenu}
          />
        )}
      </div>
    </div>
  );
};

export default SpreadsheetGrid;
