import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = 
    type === "success" ? "bg-green-500/90" : 
    type === "error" ? "bg-red-500/90" : 
    "bg-blue-500/90"

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center ${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}>
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false)
          if (onClose) onClose()
        }}
        className="ml-3 p-1 hover:bg-white/20 rounded-full"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toasts,
    showToast,
    hideToast,
  }
} 