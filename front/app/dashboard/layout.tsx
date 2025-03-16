"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Package,
  Clock,
  LogOut,
  Home,
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authUser, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check localStorage for sidebar state on component mount
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState !== null) {
      setSidebarCollapsed(storedState === "true");
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      }
    }
  }, [isLoading, isLoggedIn, router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get user data from either full profile or auth response
  const userData = user || authUser;

  // If no user data, redirect to login (should be handled by useEffect, but just in case)
  if (!userData) {
    router.push("/login");
    return null;
  }

  // Determine if user is an owner
  const isOwner = userData.owner;

  // Navigation links based on user type
  const navLinks = isOwner
    ? [
        {
          href: "/dashboard/owner",
          icon: <Home className="w-5 h-5" />,
          label: "Dashboard",
        },
        {
          href: "/dashboard/owner/appointments",
          icon: <Clock className="w-5 h-5" />,
          label: "Appointments",
        },
        {
          href: "/dashboard/owner/clients",
          icon: <Users className="w-5 h-5" />,
          label: "Clients",
        },
        {
          href: "/dashboard/owner/service",
          icon: <Package className="w-5 h-5" />,
          label: "Services",
        },
        {
          href: "/dashboard/owner/sheets",
          icon: <FileText className="w-5 h-5" />,
          label: "Spreadsheets",
        },
      ]
    : [
        {
          href: "/dashboard/client",
          icon: <Home className="w-5 h-5" />,
          label: "Dashboard",
        },
        {
          href: "/dashboard/client/appointments",
          icon: <Clock className="w-5 h-5" />,
          label: "My Appointments",
        },
        {
          href: "/dashboard/client/animals",
          icon: <Heart className="w-5 h-5" />,
          label: "My Animals",
        },
        {
          href: "/dashboard/client/providers",
          icon: <Package className="w-5 h-5" />,
          label: "Browse Services",
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-1/2 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:flex"
                aria-label="Toggle sidebar"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-white/70" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-white/70" />
                )}
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Calendar className="w-5 h-5 text-[#9f6eff]" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                  Bravus
                </span>
              </Link>
            </div>

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
                  {userData.firstname?.charAt(0) || ""}
                  {userData.lastname?.charAt(0) || ""}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">
                    {userData.firstname} {userData.lastname}
                  </p>
                  <p className="text-sm text-white/60">
                    {userData.career || (isOwner ? "Provider" : "Client")}
                  </p>
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
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-[#1a0b2e] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-medium text-lg">Menu</p>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      pathname === link.href
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-20" : "w-20 md:w-64"
          } bg-black/10 border-r border-white/10 p-4 hidden md:block transition-all duration-300`}
        >
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.icon}
                <span
                  className={`${
                    isSidebarCollapsed ? "hidden" : "hidden md:inline"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
