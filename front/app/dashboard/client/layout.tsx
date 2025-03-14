"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Package, Clock, LogOut, Settings, Home, Heart, Menu, X } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import { useState } from "react"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authUser, isLoading, isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Redirect to login if not authenticated or to owner dashboard if user is an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login")
      } else {
        const userData = user || authUser
        if (userData && userData.owner) {
          router.push("/dashboard/owner")
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Get user data from either full profile or auth response
  const userData = user || authUser

  // If no user data, redirect to login (should be handled by useEffect, but just in case)
  if (!userData) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Bravus
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-white/70" />
                  ) : (
                    <Menu className="w-5 h-5 text-white/70" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                  {userData.firstname.charAt(0)}
                  {userData.lastname.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">
                    {userData.firstname} {userData.lastname}
                  </p>
                  <p className="text-sm text-white/60">{userData.career || "Client"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-[#1a0b2e] p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <p className="font-medium text-lg">Menu</p>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <nav className="space-y-2">
                <Link
                  href="/dashboard/client"
                  className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dashboard/client/appointments"
                  className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Clock className="w-5 h-5" />
                  <span>My Appointments</span>
                </Link>
                <Link
                  href="/dashboard/client/animals"
                  className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>My Animals</span>
                </Link>
                <Link
                  href="/dashboard/client/browse"
                  className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  <span>Browse Services</span>
                </Link>
                <Link
                  href="/dashboard/client/settings"
                  className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-black/10 border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-2">
            <Link
              href="/dashboard/client"
              className={`flex items-center gap-3 p-3 rounded-lg text-white/70 hover:text-white transition-colors ${
                window.location.pathname === "/dashboard/client" ? "bg-white/10 text-white" : "hover:bg-white/10"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/client/appointments"
              className={`flex items-center gap-3 p-3 rounded-lg text-white/70 hover:text-white transition-colors ${
                window.location.pathname.includes("/dashboard/client/appointments")
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="hidden md:inline">My Appointments</span>
            </Link>
            <Link
              href="/dashboard/client/animals"
              className={`flex items-center gap-3 p-3 rounded-lg text-white/70 hover:text-white transition-colors ${
                window.location.pathname.includes("/dashboard/client/animals")
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="hidden md:inline">My Animals</span>
            </Link>
            <Link
              href="/dashboard/client/providers"
              className={`flex items-center gap-3 p-3 rounded-lg text-white/70 hover:text-white transition-colors ${
                window.location.pathname.includes("/dashboard/client/providers")
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="hidden md:inline">Browse Services</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

