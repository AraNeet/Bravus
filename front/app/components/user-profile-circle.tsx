"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";

export default function UserProfileCircle() {
  const { user, authUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user initials - use either full user profile or auth user data
  const getInitials = () => {
    if (user) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(
        0
      )}`.toUpperCase();
    } else if (authUser) {
      return `${authUser.firstname.charAt(0)}${authUser.lastname.charAt(
        0
      )}`.toUpperCase();
    }
    return "?";
  };

  // Get user name - use either full user profile or auth user data
  const getUserName = () => {
    if (user) {
      return `${user.firstname} ${user.lastname}`;
    } else if (authUser) {
      return `${authUser.firstname} ${authUser.lastname}`;
    }
    return "User";
  };

  // Get user email - use either full user profile or auth user data
  const getUserEmail = () => {
    if (user) {
      return user.email;
    } else if (authUser) {
      return authUser.email;
    }
    return "";
  };

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9f6eff]/20 hover:bg-[#9f6eff]/30 text-white font-medium transition-colors"
        aria-label="User profile"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-white/10">
            <p className="text-white font-medium">{getUserName()}</p>
            <p className="text-white/60 text-sm truncate">{getUserEmail()}</p>
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
