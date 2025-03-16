import React, { useRef, useEffect } from "react";
import {
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Scissors,
  Copy,
  Clipboard,
  PlusSquare,
  Trash2,
} from "lucide-react";

interface ContextMenuOption {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface SpreadsheetContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  options: ContextMenuOption[];
  onClose: () => void;
}

const SpreadsheetContextMenu: React.FC<SpreadsheetContextMenuProps> = ({
  x,
  y,
  visible,
  options,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  // Adjust position if menu would go off screen
  const adjustX = x + 200 > window.innerWidth ? x - 200 : x;
  const adjustY =
    y + options.length * 36 > window.innerHeight ? y - options.length * 36 : y;

  return (
    <div
      ref={menuRef}
      className="absolute bg-white shadow-lg border border-gray-200 rounded-md py-1 z-50 min-w-[180px]"
      style={{
        top: `${adjustY}px`,
        left: `${adjustX}px`,
      }}
    >
      {options.map((option, index) => (
        <React.Fragment key={index}>
          <button
            className={`
              w-full text-left px-3 py-2 text-sm hover:bg-[#f1f3f4] flex items-center 
              ${
                option.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
            onClick={() => {
              if (!option.disabled) {
                option.onClick();
                onClose();
              }
            }}
            disabled={option.disabled}
          >
            <span className="w-5 h-5 mr-2 inline-flex items-center justify-center">
              {option.icon}
            </span>
            {option.label}
          </button>
          {option.divider && <div className="border-t border-gray-200 my-1" />}
        </React.Fragment>
      ))}
    </div>
  );
};

// Helper function to create column context menu options
export const createColumnMenuOptions = ({
  colIndex,
  isFrozen,
  isHidden,
  onInsertLeft,
  onInsertRight,
  onDelete,
  onFreeze,
  onUnfreeze,
  onHide,
  onShow,
  canDelete = true,
}: {
  colIndex: number;
  isFrozen: boolean;
  isHidden: boolean;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDelete: () => void;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onHide: () => void;
  onShow: () => void;
  canDelete?: boolean;
}): ContextMenuOption[] => {
  return [
    {
      icon: <PlusSquare size={14} />,
      label: "Insert column left",
      onClick: onInsertLeft,
    },
    {
      icon: <PlusSquare size={14} />,
      label: "Insert column right",
      onClick: onInsertRight,
      divider: true,
    },
    {
      icon: <Trash2 size={14} />,
      label: "Delete column",
      onClick: onDelete,
      disabled: !canDelete,
      divider: true,
    },
    {
      icon: isFrozen ? <Unlock size={14} /> : <Lock size={14} />,
      label: isFrozen ? "Unfreeze column" : "Freeze column",
      onClick: isFrozen ? onUnfreeze : onFreeze,
    },
    {
      icon: isHidden ? <Eye size={14} /> : <EyeOff size={14} />,
      label: isHidden ? "Show column" : "Hide column",
      onClick: isHidden ? onShow : onHide,
      divider: true,
    },
    {
      icon: <Scissors size={14} />,
      label: "Cut",
      onClick: () => {
        // Call clipboard API to cut column data
        console.log("Cut column", colIndex);
      },
    },
    {
      icon: <Copy size={14} />,
      label: "Copy",
      onClick: () => {
        // Call clipboard API to copy column data
        console.log("Copy column", colIndex);
      },
    },
    {
      icon: <Clipboard size={14} />,
      label: "Paste",
      onClick: () => {
        // Call clipboard API to paste column data
        console.log("Paste to column", colIndex);
      },
    },
  ];
};

// Helper function to create cell context menu options
export const createCellMenuOptions = ({
  rowIndex,
  colIndex,
  onCut,
  onCopy,
  onPaste,
}: {
  rowIndex: number;
  colIndex: number;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
}): ContextMenuOption[] => {
  return [
    {
      icon: <Scissors size={14} />,
      label: "Cut",
      onClick: onCut,
    },
    {
      icon: <Copy size={14} />,
      label: "Copy",
      onClick: onCopy,
    },
    {
      icon: <Clipboard size={14} />,
      label: "Paste",
      onClick: onPaste,
    },
  ];
};

export default SpreadsheetContextMenu;
