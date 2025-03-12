"use client";

import type React from "react";

import { useState } from "react";
import { Calendar, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await login({ email, password });
      // Successful login will redirect in the useAuth hook
      console.log("Login successful");
    } catch (err: any) {
      console.error("Login error:", err);
      setFormError(
        err.message ||
          "Login failed. Please check your credentials and try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex flex-col">
      {/* Header */}
      <header className="w-full py-4 bg-black/20 backdrop-blur-sm">
        <section className="container mx-auto px-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <figure className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </figure>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Bravus
              </span>
            </Link>
          </nav>
        </section>
      </header>

      {/* Background effects */}
      <section className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9f6eff] rounded-full opacity-10 blur-3xl" />
        <span className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c061f7] rounded-full opacity-10 blur-3xl" />
      </section>

      {/* Login Form */}
      <section className="flex-1 flex items-center justify-center p-4 relative z-10">
        <article className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
              Welcome Back
            </h1>
            <p className="text-white/60">Sign in to your Bravus account</p>
          </header>

          {formError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/80"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#9f6eff] hover:text-[#c061f7] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
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

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#9f6eff] focus:ring-[#9f6eff]/50"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-white/80"
                >
                  Remember me
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#9f6eff] hover:text-[#c061f7] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </footer>
        </article>
      </section>

      {/* Back to home link */}
      <footer className="py-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </footer>
    </main>
  );
}
