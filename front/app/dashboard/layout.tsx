"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Home,
  Calendar,
  User,
  Users,
  Package,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Settings,
  Heart,
  LayoutDashboard,
  AlignLeft,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Sheet,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // New state for collapsible sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const pathname = usePathname();
  const { user, isLoading, error, logout, userType, isLoggedIn } = useAuth();
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // No need to check token validity on mount - useAuth already does this
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = "/login";
    }
  }, [isLoading, isLoggedIn]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-spink border-t-transparent"></div>
          <p className="text-white/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If error or no user, show error state
  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Authentication Required</h1>
        <p className="mb-6 max-w-md text-white/70">
          Please log in to access the dashboard.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-spink px-6 py-2 font-medium text-navy transition-colors hover:bg-mred"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Helper functions for user data
  const getUserInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    // Try from localStorage as fallback
    const storedName = localStorage.getItem("name");
    if (storedName) {
      return storedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "U";
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user.name) {
      return user.name;
    }
    const storedName = localStorage.getItem("name");
    if (storedName) {
      return storedName;
    }
    // Fallbacks for legacy data
    if ((user as any).firstname || (user as any).lastname) {
      return `${(user as any).firstname || ""} ${
        (user as any).lastname || ""
      }`.trim();
    }
    return "User";
  };

  // Helper function to get role
  const getRole = () => {
    if (userType) {
      return userType === "owner" ? "Provider" : "Client";
    }
    const localUserType = localStorage.getItem("user_type");
    if (localUserType) {
      return localUserType === "owner" ? "Provider" : "Client";
    }
    return "User";
  };

  // Helper function to get email
  const getUserEmail = () => {
    if (user.email) {
      return user.email;
    }
    return localStorage.getItem("email") || "";
  };

  // Navigation links based on user type
  const navLinks = userType === "owner" || localStorage.getItem("user_type") === "owner"
    ? [
        {
          name: "Dashboard",
          href: "/dashboard/owner",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          name: "Appointments",
          href: "/dashboard/owner/appointments",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          name: "Services",
          href: "/dashboard/owner/services",
          icon: <Package className="h-5 w-5" />,
        },
        {
          name: "Sheets",
          href: "/dashboard/owner/sheets",
          icon: <Sheet className="h-5 w-5" />,
        },
      ]
    : [
        {
          name: "Dashboard",
          href: "/dashboard/client",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          name: "Appointments",
          href: "/dashboard/client/appointments",
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          name: "My Pets",
          href: "/dashboard/client/animals",
          icon: <Heart className="h-5 w-5" />,
        },
        {
          name: "Providers",
          href: "/dashboard/client/providers",
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Settings",
          href: "/dashboard/client/settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ];

  // Debug information component
  const DebugInfo = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-navy border border-white/20 p-6">
        <div className="mb-4 flex justify-between">
          <h2 className="text-xl font-bold">Debug Information</h2>
        <button
            onClick={() => setShowDebugInfo(false)}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
            <X className="h-5 w-5" />
        </button>
      </div>
        <div className="space-y-4">
      <div>
            <h3 className="mb-1 font-medium">User Object:</h3>
            <pre className="overflow-auto rounded bg-black/50 p-3 text-xs">
              {JSON.stringify(user, null, 2)}
        </pre>
          </div>
          <div>
            <h3 className="mb-1 font-medium">LocalStorage:</h3>
            <ul className="space-y-1 rounded bg-black/50 p-3 text-xs">
          <li>ID: {localStorage.getItem("ID") || "not set"}</li>
          <li>name: {localStorage.getItem("name") || "not set"}</li>
          <li>email: {localStorage.getItem("email") || "not set"}</li>
              <li>
                user_type: {localStorage.getItem("user_type") || "not set"}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-medium">Helpers:</h3>
            <ul className="space-y-1 rounded bg-black/50 p-3 text-xs">
              <li>Display Name: {getDisplayName()}</li>
              <li>Role: {getRole()}</li>
              <li>Initials: {getUserInitials()}</li>
              <li>Email: {getUserEmail()}</li>
        </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile menu overlay
  const MobileMenuOverlay = () => (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      
      {/* Mobile sidebar */}
      <div className="absolute left-0 top-0 h-full w-[280px] bg-navy/95 backdrop-blur-md shadow-xl">
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-2 text-spink">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-spink text-navy font-bold">
                B
              </div>
              <span className="text-lg font-bold">Bravus</span>
            </Link>
              <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg bg-white/5 p-2 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
              </button>
            </div>

          {/* Mobile nav links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    pathname === link.href
                      ? "bg-spink/20 text-spink"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>
              </div>
          
          {/* User info */}
          <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-spink/20 text-spink font-medium">
                  {getUserInitials()}
                </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{getDisplayName()}</p>
                <p className="truncate text-xs text-white/60">{getRole()}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy">
      {/* Debug info overlay */}
      {showDebugInfo && <DebugInfo />}
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && <MobileMenuOverlay />}
      
      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 hidden transform-gpu transition-all duration-300 lg:block ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex h-full flex-col border-r border-white/10 bg-navy/80 backdrop-blur-sm">
            {/* Sidebar header */}
            <div className={`flex h-16 items-center ${isSidebarCollapsed ? "justify-center" : "px-4"} border-b border-white/10`}>
              {isSidebarCollapsed ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-spink text-navy font-bold">
                  B
                </div>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-2 text-spink">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-spink text-navy font-bold">
                    B
                </div>
                  <span className="text-lg font-bold">Bravus</span>
                </Link>
              )}
              
              <button 
                onClick={toggleSidebar}
                className={`rounded-lg bg-white/5 p-1.5 text-white/70 hover:bg-white/10 hover:text-white ${
                  isSidebarCollapsed ? "ml-0 mt-4 absolute right-0 top-0 mr-[-12px]" : "ml-auto"
                }`}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
              </div>

            {/* Sidebar navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className={`space-y-1 ${isSidebarCollapsed ? "px-2" : "px-3"}`}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-lg ${isSidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5"} text-sm font-medium ${
                      pathname === link.href
                        ? "bg-spink/20 text-spink"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={pathname === link.href
                      ? "text-spink" 
                      : "text-white/70 group-hover:text-white"
                    }>
                    {link.icon}
                    </span>
                    {!isSidebarCollapsed && <span>{link.name}</span>}
                    {isSidebarCollapsed && (
                      <span className="absolute left-full ml-2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs opacity-0 shadow-lg group-hover:opacity-100 z-[60]">
                        {link.name}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* User profile */}
            <div className={`border-t border-white/10 ${isSidebarCollapsed ? "p-2" : "p-4"}`}>
              <div className={`flex ${isSidebarCollapsed ? "flex-col items-center" : "items-center gap-3"}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spink/20 text-spink font-medium">
                  {getUserInitials()}
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{getDisplayName()}</p>
                      <p className="truncate text-xs text-white/60">{getRole()}</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </>
                )}
                {isSidebarCollapsed && (
                  <button 
                    onClick={logout}
                    className="mt-2 rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 transform-gpu transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}>
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-navy/90 backdrop-blur-sm px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-spink/50 focus:outline-none focus:ring-1 focus:ring-spink/50"
              />
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications */}
              <button className="relative rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-spink"></span>
              </button>
              
              {/* User dropdown (mobile/tablet only) */}
              <div className="relative lg:hidden">
                <button className="flex items-center gap-2 rounded-lg bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white">
                  <div className="h-6 w-6 rounded-full bg-spink/20 flex items-center justify-center text-xs font-medium text-spink">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>
          
          {/* Page content */}
          <div className="p-4 lg:p-6">
          {/* Debug button */}
          <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="fixed bottom-4 left-4 z-30 rounded bg-spink/20 px-2 py-1 text-xs text-spink hover:bg-spink/30"
          >
              Debug
          </button>
            
            {/* Render children */}
          {children}
          </div>
        </main>
      </div>
    </div>
  );
}
