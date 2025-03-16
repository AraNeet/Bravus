import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface ColumnFormProps {
  initialName?: string;
  initialWidth?: number;
  onSubmit: (values: { name: string; width: number }) => void;
  onCancel: () => void;
}

export default function ColumnForm({
  initialName = "",
  initialWidth = 120,
  onSubmit,
  onCancel,
}: ColumnFormProps) {
  const [name, setName] = useState(initialName);
  const [width, setWidth] = useState(initialWidth);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 60 && value <= 500) {
      setWidth(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim(), width });
  };

  return (
    <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-white/20">
      <form onSubmit={handleSubmit}>
        <h3 className="text-white font-medium mb-4">Column Properties</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="column-name"
              className="block text-sm text-white/70 mb-1"
            >
              Header Name
            </label>
            <input
              id="column-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
            />
          </div>

          <div>
            <label
              htmlFor="column-width"
              className="block text-sm text-white/70 mb-1"
            >
              Width (60-500px)
            </label>
            <input
              id="column-width"
              type="number"
              min={60}
              max={500}
              value={width}
              onChange={handleWidthChange}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 rounded-lg flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-[#9f6eff] hover:bg-[#8a5de8] text-white rounded-lg flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}
