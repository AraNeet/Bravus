"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Search,
  LogOut,
  BarChart,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  checkGoogleAuthStatus,
  initiateGoogleAuth,
  listSpreadsheets,
  deleteSpreadsheet,
  SpreadsheetListItem,
} from "@/app/api/google";

export default function SheetsDashboard() {
  const { user, authUser, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetListItem[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated or to client dashboard if not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        const userData = user || authUser;
        if (userData && !userData.owner) {
          router.push("/dashboard/client");
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router]);

  // Check Google authentication status
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const status = await checkGoogleAuthStatus();
        setIsGoogleAuthenticated(status.authenticated);
      } catch (error) {
        console.error("Error checking Google auth status:", error);
        setIsGoogleAuthenticated(false);
      }
    };

    if (isLoggedIn && !isLoading) {
      checkGoogleAuth();
    }
  }, [isLoggedIn, isLoading]);

  // Fetch spreadsheets if authenticated with Google
  useEffect(() => {
    const fetchSpreadsheets = async () => {
      if (!isGoogleAuthenticated) return;

      try {
        setIsLoadingSheets(true);
        setError(null);
        const sheets = await listSpreadsheets();
        setSpreadsheets(sheets);
      } catch (error) {
        console.error("Error fetching spreadsheets:", error);
        setError("Failed to load spreadsheets. Please try again.");
      } finally {
        setIsLoadingSheets(false);
      }
    };

    if (isGoogleAuthenticated) {
      fetchSpreadsheets();
    }
  }, [isGoogleAuthenticated]);

  // Handle Google authentication
  const handleConnectGoogle = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);
      const response = await initiateGoogleAuth();
      window.location.href = response.redirectUrl;
    } catch (error) {
      console.error("Error initiating Google auth:", error);
      setError("Failed to connect to Google. Please try again.");
      setIsAuthenticating(false);
    }
  };

  // Handle spreadsheet deletion
  const handleDeleteSpreadsheet = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteSpreadsheet(id);
      setSpreadsheets(spreadsheets.filter((sheet) => sheet.id !== id));
    } catch (error) {
      console.error("Error deleting spreadsheet:", error);
      setError("Failed to delete spreadsheet. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Filter spreadsheets by search query
  const filteredSpreadsheets = spreadsheets.filter((sheet) =>
    sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search spreadsheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                />
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
                  <p className="text-sm text-white/60">Business Owner</p>
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
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-black/10 border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-2">
            <Link
              href="/dashboard/owner"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <BarChart className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/owner/appointments"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="hidden md:inline">Appointments</span>
            </Link>
            <Link
              href="/dashboard/owner/service"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="hidden md:inline">Service</span>
            </Link>
            <Link
              href="/dashboard/owner/sheets"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg text-white"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden md:inline">Sheets</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Google Sheets</h1>
              {isGoogleAuthenticated && (
                <Link
                  href="/dashboard/owner/sheets/create"
                  className="flex items-center gap-2 bg-[#9f6eff] hover:bg-[#8a5de8] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Spreadsheet</span>
                </Link>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {!isGoogleAuthenticated ? (
              <div className="bg-black/20 rounded-xl p-8 text-center">
                <FileSpreadsheet className="w-16 h-16 text-[#9f6eff] mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  Connect to Google Sheets
                </h2>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Connect your Google account to create, view, and manage
                  spreadsheets directly from your dashboard.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  disabled={isAuthenticating}
                  className="bg-[#9f6eff] hover:bg-[#8a5de8] text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticating
                    ? "Connecting..."
                    : "Connect Google Account"}
                </button>
              </div>
            ) : isLoadingSheets ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-10 h-10 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
              </div>
            ) : filteredSpreadsheets.length === 0 ? (
              <div className="bg-black/20 rounded-xl p-8 text-center">
                <FileSpreadsheet className="w-16 h-16 text-[#9f6eff] mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  No spreadsheets found
                </h2>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No spreadsheets match "${searchQuery}". Try a different search term.`
                    : "You haven't created any spreadsheets yet. Create your first spreadsheet to get started."}
                </p>
                <Link
                  href="/dashboard/owner/sheets/create"
                  className="bg-[#9f6eff] hover:bg-[#8a5de8] text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Spreadsheet</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpreadsheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="bg-black/20 border border-white/10 rounded-lg overflow-hidden hover:border-[#9f6eff]/50 transition-colors group"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/dashboard/owner/sheets/${sheet.id}`}
                          className="flex-1"
                        >
                          <h3 className="font-medium text-lg truncate group-hover:text-[#9f6eff] transition-colors">
                            {sheet.name}
                          </h3>
                        </Link>
                        <div className="flex gap-1">
                          <a
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Open in Google Sheets"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteSpreadsheet(sheet.id, sheet.name)
                            }
                            className="p-1.5 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Delete spreadsheet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mt-1">
                        Last modified:{" "}
                        {new Date(sheet.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/owner/sheets/${sheet.id}`}
                      className="block border-t border-white/10 py-2 px-4 text-center text-sm text-white/70 hover:bg-white/5 transition-colors"
                    >
                      View & Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
