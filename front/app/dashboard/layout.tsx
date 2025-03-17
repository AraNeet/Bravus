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
  const { user, authUser, isLoading, isLoggedIn, logout, userType } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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

  // Debug log to see what data we're getting
  console.log("Dashboard Layout - userData:", userData);
  console.log("Dashboard Layout - user object:", user);
  console.log("Dashboard Layout - authUser object:", authUser);
  console.log("Dashboard Layout - email in userData:", userData?.email);

  // If no user data, redirect to login (should be handled by useEffect, but just in case)
  if (!userData) {
    router.push("/login");
    return null;
  }

  // Safely check if user is an owner
  const isOwner =
    userData && "owner" in userData ? userData.owner : userType === "owner"; // Fallback to userType from useAuth hook

  // Function to get user initials
  const getUserInitials = () => {
    if (userData && userData.name) {
      const parts = userData.name.split(" ");
      const firstInitial = parts[0] ? parts[0].charAt(0) : "";
      const lastInitial =
        parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    // Fallback for older data format
    const userObj = userData as Record<string, any>;
    if (userObj.firstname && userObj.lastname) {
      return `${userObj.firstname.charAt(0)}${userObj.lastname.charAt(
        0
      )}`.toUpperCase();
    }

    return "";
  };

  // Function to get user display name
  const getUserDisplayName = () => {
    // Add console log to debug the userData
    console.log("getUserDisplayName userData:", userData);

    // Check for name property
    if (userData && userData.name && userData.name !== "Client User") {
      return userData.name;
    }

    // Check for localStorage value
    const storedName = localStorage.getItem("name");
    if (storedName && storedName !== "Client User") {
      return storedName;
    }

    // Access as Record to check for alternative properties
    const userObj = userData as Record<string, any>;
    if (userObj.firstname && userObj.lastname) {
      return `${userObj.firstname} ${userObj.lastname}`;
    }

    return isOwner ? "Provider" : "Client";
  };

  // Function to get user career/role
  const getUserRole = () => {
    const userObj = userData as Record<string, any>;
    if (userObj.career) {
      return userObj.career;
    }

    return isOwner ? "Provider" : "Client";
  };

  // Function to get user email
  const getUserEmail = () => {
    // Directly try to access the email from userData
    if (userData && userData.email) {
      return userData.email;
    }

    // Try to get it from localStorage as fallback
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      return storedEmail;
    }

    return "No email provided";
  };

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

  // Add debug information component
  const DebugInfo = () => (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-4 rounded-lg max-w-md overflow-auto max-h-96">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Information</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-white/70 hover:text-white"
        >
          ×
        </button>
      </div>
      <div>
        <p className="mb-1 font-bold">User Data:</p>
        <pre className="whitespace-pre-wrap overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
        <p className="mt-2 mb-1 font-bold">LocalStorage:</p>
        <ul>
          <li>ID: {localStorage.getItem("ID") || "not set"}</li>
          <li>name: {localStorage.getItem("name") || "not set"}</li>
          <li>email: {localStorage.getItem("email") || "not set"}</li>
          <li>user_type: {localStorage.getItem("user_type") || "not set"}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {showDebug && <DebugInfo />}

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
                  {getUserInitials()}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">{getUserDisplayName()}</p>
                  <p className="text-sm text-white/60">{getUserEmail()}</p>
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

              {/* User profile in mobile menu */}
              <div className="flex items-center gap-3 p-3 mb-4 bg-black/20 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="font-medium">{getUserDisplayName()}</p>
                  <p className="text-sm text-white/60">{getUserEmail()}</p>
                </div>
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
        <main className="flex-1 p-6 overflow-auto">
          {/* Debug button */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="fixed bottom-4 right-4 z-40 bg-[#9f6eff]/70 hover:bg-[#9f6eff] text-white p-2 rounded-full"
          >
            🐞
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
