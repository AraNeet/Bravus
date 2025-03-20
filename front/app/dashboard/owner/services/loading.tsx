export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy to-navy/70 text-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin w-12 h-12 border-4 border-mred border-t-transparent rounded-full mb-4"></div>
        <p className="text-white/70">Loading services...</p>
      </div>
    </div>
  );
}
