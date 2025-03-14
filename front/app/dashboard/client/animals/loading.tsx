export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white/70">Loading your animals...</p>
    </div>
  );
}
