"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/hooks/useAuth"

// Main dashboard that redirects based on user role
export default function Dashboard() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isLoggedIn) {
      router.push("/login")
      return
    }

    // If authenticated, redirect based on role
    if (!isLoading && isLoggedIn) {
      const userData = user || authUser
      if (userData) {
        if (userData.owner) {
          router.push("/dashboard/owner")
        } else {
          router.push("/dashboard/client")
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router])

  // Show loading state while checking auth or redirecting
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
    </div>
  )
}

