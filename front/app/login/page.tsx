"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected from signup
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccessMessage("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await login({
        email: username,
        password: password,
      });
    } catch (err: any) {
      setFormError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background with room and stacks of files */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src="/images/login-bg.svg" 
          alt="Room with stacks of files"
          className="w-full h-full object-cover"
        />
        
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-navy/30"></div>
      </div>
      
      {/* Stars Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`star star-${i % 5}`}
            />
          ))}
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 animate-fadeIn">
        <div className="bg-navy/80 backdrop-blur-xl rounded-3xl border border-spink/20 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Login</h1>
          
          {formError && (
            <div className="mb-6 p-3 bg-mred/20 border border-mred/50 rounded-lg text-sm text-white animate-shake">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-sm text-white">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2 group">
              <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Username"
                  className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2 group">
              <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-navy/70 text-spink focus:ring-spink/50"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-white/80"
                >
                  Remember me
                </label>
              </div>
              
              <Link
                href="/forgot-password"
                className="text-sm text-spink hover:text-spink/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-spink hover:bg-mred text-navy font-medium py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-spink/20 hover:shadow-spink/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>
          
          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-spink hover:text-spink/80 transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
