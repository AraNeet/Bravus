"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Download,
  Search,
  Plus,
  Trash2,
  Edit,
  History,
  ArrowLeft,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "sonner";
import {
  listSpreadsheets,
  deleteSpreadsheet,
  checkGoogleAuthStatus,
  initiateGoogleAuth,
  type SpreadsheetListItem,
} from "@/app/api/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SheetsDashboard() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  // State for sheets data and loading
  const [sheets, setSheets] = useState<SpreadsheetListItem[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google authentication state
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTab, setSelectedTab] = useState("sheets");

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] =
    useState<SpreadsheetListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Google auth status and spreadsheets
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      setIsLoadingSheets(true);
      setError(null);

      try {
        // Check if user is authenticated with Google
        const authStatus = await checkGoogleAuthStatus();
        setIsGoogleAuthenticated(authStatus.authenticated);

        if (authStatus.authenticated) {
          // Fetch spreadsheets
          const sheetsData = await listSpreadsheets();
          setSheets(sheetsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch spreadsheets. Please try again later.");
      } finally {
        setIsLoadingSheets(false);
      }
    };

    fetchData();
  }, [authLoading]);

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      const response = await initiateGoogleAuth();
      // Redirect to Google OAuth URL
      window.location.href = response.redirectUrl;
    } catch (err) {
      console.error("Error initiating Google auth:", err);
      toast.error("Failed to connect to Google", {
        description: "Please try again later.",
      });
      setIsAuthenticating(false);
    }
  };

  // Handle delete spreadsheet
  const handleDeleteSpreadsheet = async () => {
    if (!sheetToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSpreadsheet(sheetToDelete.id);

      // Update local state
      setSheets((prevSheets) =>
        prevSheets.filter((sheet) => sheet.id !== sheetToDelete.id)
      );

      toast.success("Spreadsheet deleted", {
        description: `${sheetToDelete.name} has been deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setSheetToDelete(null);
    } catch (err) {
      console.error("Error deleting spreadsheet:", err);
      toast.error("Failed to delete spreadsheet", {
        description: "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open spreadsheet in Google Sheets
  const handleOpenSpreadsheet = (sheet: SpreadsheetListItem) => {
    window.open(sheet.url, "_blank");
  };

  // Handle edit spreadsheet (navigate to editor)
  const handleEditSpreadsheet = (sheet: SpreadsheetListItem) => {
    router.push(`/dashboard/owner/sheets/${sheet.id}`);
  };

  // Filter sheets based on search query
  const filteredSheets = sheets.filter((sheet) =>
    sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Auth loading state handled by parent
  if (authLoading) return null;

  // Google authentication required
  if (!isGoogleAuthenticated && !isLoadingSheets) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/dashboard/owner"
                className="text-white/70 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-1">Spreadsheet Management</h1>
            <p className="text-white/70">
              Connect with Google Sheets to manage your data
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 text-center">
          <FileSpreadsheet className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect with Google</h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            To manage your spreadsheets, you need to connect your Google
            account. This allows Bravus to securely access your Google Sheets.
          </p>
          <Button
            onClick={handleGoogleAuth}
            disabled={isAuthenticating}
            className="bg-gradient-to-r from-[#4285F4] to-[#34A853] hover:from-[#3b76d9] hover:to-[#2e9549] border-none"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Connect with Google
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/owner"
              className="text-white/70 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-1">Spreadsheet Management</h1>
          <p className="text-white/70">Manage your data and exports</p>
        </div>

        <Button
          onClick={() =>
            (window.location.href = "/dashboard/owner/sheets/create")
          }
          className="w-full md:w-auto bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Spreadsheet
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-white">Error</h3>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search spreadsheets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoadingSheets ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-[#9f6eff] animate-spin mb-4" />
          <p className="text-white/70">Loading your spreadsheets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSheets.length > 0 ? (
            filteredSheets.map((sheet) => (
              <Card
                key={sheet.id}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#9f6eff]/40 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{sheet.name}</CardTitle>
                    <div className="bg-[#9f6eff]/20 p-2 rounded-full">
                      <FileSpreadsheet className="w-5 h-5 text-[#9f6eff]" />
                    </div>
                  </div>
                  <CardDescription className="text-white/60">
                    Google Spreadsheet
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm text-white/60">
                    Last modified on {formatDate(sheet.lastModified)}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/10 flex justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSpreadsheet(sheet)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSpreadsheet(sheet)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" /> Open
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSheetToDelete(sheet);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No spreadsheets found
              </h3>
              <p className="text-white/60 mb-4">
                {searchQuery
                  ? "No spreadsheets match your search criteria."
                  : "You haven't created any spreadsheets yet."}
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/owner/sheets/create")
                }
                className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] border-none"
              >
                <Plus className="w-4 h-4 mr-2" /> Create your first spreadsheet
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border-[#9f6eff]/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spreadsheet</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete "{sheetToDelete?.name}"? This will
              permanently remove the spreadsheet and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white/5 border-[#9f6eff]/20 text-white hover:bg-white/10 hover:text-white hover:border-[#9f6eff]/40"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white border-none"
              onClick={handleDeleteSpreadsheet}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Spreadsheet
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
