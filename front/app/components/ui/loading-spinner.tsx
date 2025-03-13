import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 text-[#9f6eff] animate-spin mb-4" />
      <p className="text-white/70">{message}</p>
    </div>
  )
}

