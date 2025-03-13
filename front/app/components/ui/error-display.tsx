import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: string
  backLink: string
}

export default function ErrorDisplay({ error, backLink }: ErrorDisplayProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-4">Error</h1>
      <p className="text-white/70 mb-6">{error}</p>
      <Link
        href={backLink}
        className="inline-flex items-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Link>
    </div>
  )
}

