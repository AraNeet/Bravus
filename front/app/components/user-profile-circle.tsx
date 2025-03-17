"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { Client, Owner } from "@/app/api";
import { getCurrentClient, getCurrentOwner, getUserType } from "@/app/api";

export default function UserProfileCircle() {
  const { user, authUser, logout, userType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);

  // Use these values directly for rendering to avoid type issues
  const [userInitials, setUserInitials] = useState<string>("?");
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");

  // Fetch user data directly if needed
  const fetchUserData = async () => {
    const userId = localStorage.getItem("ID");
    if (!userId) return null;

    const localUserType = localStorage.getItem("user_type") || userType;

    try {
      let userData;
      if (localUserType === "owner") {
        userData = await getCurrentOwner();
      } else {
        userData = await getCurrentClient();
      }

      // Store data in localStorage for future use
      if (userData) {
        if (userData.name) localStorage.setItem("name", userData.name);
        if (userData.email) localStorage.setItem("email", userData.email);
        return userData;
      }
    } catch (error) {
      console.error("Error fetching user data directly:", error);
    }
    return null;
  };

  // Process user data when it changes
  useEffect(() => {
    const processUserData = async () => {
      console.log("UserProfileCircle - Raw user value:", user);
      console.log("UserProfileCircle - User type:", userType);
      console.log("UserProfileCircle - localStorage:", {
        ID: localStorage.getItem("ID"),
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
        token: localStorage.getItem("auth_token") ? "exists" : "missing",
      });

      // Check if we have a user object with required data
      let processedUser = user;

      // If we don't have a valid user but have an ID in localStorage, try to fetch directly
      if (
        (!processedUser || !processedUser.name) &&
        localStorage.getItem("ID") &&
        !dataProcessed // Only fetch if we haven't already processed the data
      ) {
        console.log("Attempting to fetch user data directly from API");
        processedUser = await fetchUserData();
      }

      // Extract name
      let name = "";
      if (processedUser && processedUser.name) {
        name = processedUser.name;
        console.log("Found name property:", name);
      } else {
        // Fallback to localStorage if API response doesn't have name
        name = localStorage.getItem("name") || "User";
        console.log("Using localStorage name:", name);
      }
      setUserName(name);

      // Extract email
      let email = "";
      if (processedUser && processedUser.email) {
        email = processedUser.email;
      } else {
        email = localStorage.getItem("email") || "";
      }
      setUserEmail(email);

      // Create initials from name
      let initials = "?";
      if (name) {
        const parts = name.split(" ");
        const firstInitial = parts[0] ? parts[0].charAt(0) : "";
        const lastInitial =
          parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
        initials = `${firstInitial}${lastInitial}`.toUpperCase();
        console.log("Created initials:", initials);
      } else if (email) {
        // Fall back to first letter of email
        initials = email.charAt(0).toUpperCase();
      }
      setUserInitials(initials);

      // Mark data as processed to prevent unnecessary re-fetching
      setDataProcessed(true);
    };

    processUserData();
  }, [user, userType, dataProcessed]);

  // Reset the dataProcessed flag when user or userType changes
  useEffect(() => {
    setDataProcessed(false);
  }, [user, userType]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {debugMode && (
        <div
          className="absolute top-12 right-0 w-96 p-2 bg-black/80 text-xs text-white rounded-lg z-50"
          style={{ whiteSpace: "pre-wrap" }}
        >
          <button
            onClick={() => setDebugMode(false)}
            className="absolute top-1 right-1 text-white/60 hover:text-white"
          >
            ×
          </button>
          <h3 className="font-bold mb-1">Debug Info</h3>
          <p>User data:</p>
          <ul className="list-disc pl-4">
            <li>ID: {user?.id || localStorage.getItem("ID") || "not found"}</li>
            <li>
              Name: {user?.name || localStorage.getItem("name") || "not found"}
            </li>
            <li>
              Email:{" "}
              {user?.email || localStorage.getItem("email") || "not found"}
            </li>
            <li>
              UserType:{" "}
              {userType || localStorage.getItem("user_type") || "unknown"}
            </li>
            <li>
              Using for display: "{userName}" ({userInitials})
            </li>
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9f6eff]/20 hover:bg-[#9f6eff]/30 text-white font-medium transition-colors"
        aria-label="User profile"
      >
        {userInitials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-white/10">
            <p className="text-white font-medium">{userName}</p>
            <p className="text-white/60 text-sm truncate">{userEmail}</p>
            <p
              className="text-white/40 text-xs mt-1 cursor-pointer"
              onClick={() => setDebugMode(!debugMode)}
            >
              Toggle debug info
            </p>
          </div>
          <nav className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
