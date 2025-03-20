export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy to-navy/70">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full border-t-transparent border-mred animate-spin"></div>
        <p className="text-white/70 font-medium">Loading spreadsheet...</p>
      </div>
    </div>
  );
} 