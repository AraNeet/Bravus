"use client";

import type React from "react";

import { useState } from "react";
import {
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    owner: false,
    career: "",
    agreeToTerms: false,
  });
  const { signup, isLoading } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Check password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);

      // Check if passwords match when changing password
      if (formData.confirmPassword) {
        setPasswordMatch(value === formData.confirmPassword);
      }
    }

    // Check if passwords match when changing confirm password
    if (name === "confirmPassword") {
      setPasswordMatch(value === formData.password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      setFormError("Passwords don't match");
      return;
    }

    try {
      // Prepare data for submission (remove confirmPassword and agreeToTerms)
      const submissionData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        owner: formData.owner,
        career: formData.career || "No Career", // Use default if empty
      };

      await signup(submissionData);
      // Will redirect to dashboard in the useAuth hook
    } catch (err: any) {
      setFormError(err.message || "Registration failed. Please try again.");
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

      {/* Signup Form */}
      <section className="flex-1 flex items-center justify-center p-4 relative z-10 py-12">
        <article className="w-full max-w-lg bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
              Create Account
            </h1>
            <p className="text-white/60">Join Bravus to manage your business</p>
          </header>

          {formError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4">
              {/* Name Fields - Split into First and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                />
              </div>

              {/* Career Field */}
              <div>
                <label
                  htmlFor="career"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Career
                </label>
                <select
                  id="career"
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white"
                >
                  <option value="" className="bg-[#1a0b2e]">
                    Select a career (optional)
                  </option>
                  <option value="Business Owner" className="bg-[#1a0b2e]">
                    Business Owner
                  </option>
                  <option value="Manager" className="bg-[#1a0b2e]">
                    Manager
                  </option>
                  <option value="Stylist" className="bg-[#1a0b2e]">
                    Stylist
                  </option>
                  <option value="Technician" className="bg-[#1a0b2e]">
                    Technician
                  </option>
                  <option value="Receptionist" className="bg-[#1a0b2e]">
                    Receptionist
                  </option>
                  <option value="Other" className="bg-[#1a0b2e]">
                    Other
                  </option>
                </select>
                <p className="mt-1 text-xs text-white/60">
                  Defaults to "No Career" if left blank
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordStrength
                              ? passwordStrength === 1
                                ? "bg-red-500"
                                : passwordStrength === 2
                                ? "bg-yellow-500"
                                : passwordStrength === 3
                                ? "bg-green-400"
                                : "bg-green-500"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/60">
                      {passwordStrength === 0 &&
                        "Use 8+ characters with letters, numbers & symbols"}
                      {passwordStrength === 1 &&
                        "Weak - Add uppercase, numbers or symbols"}
                      {passwordStrength === 2 && "Fair - Add more variety"}
                      {passwordStrength === 3 && "Good - Almost there"}
                      {passwordStrength === 4 && "Strong password"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      formData.confirmPassword
                        ? passwordMatch
                          ? "border-green-500/50"
                          : "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40`}
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

                  {formData.confirmPassword && passwordMatch && (
                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>

                {formData.confirmPassword && !passwordMatch && (
                  <p className="mt-1 text-xs text-red-400">
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Owner Checkbox */}
              <div className="flex items-center bg-white/5 p-3 rounded-lg border border-white/10">
                <input
                  id="owner"
                  name="owner"
                  type="checkbox"
                  checked={formData.owner}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#9f6eff] focus:ring-[#9f6eff]/50"
                />
                <label
                  htmlFor="owner"
                  className="ml-2 block text-sm text-white/80"
                >
                  I am a business owner
                </label>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#9f6eff] focus:ring-[#9f6eff]/50"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-2 block text-sm text-white/80"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-[#9f6eff] hover:text-[#c061f7] transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#9f6eff] hover:text-[#c061f7] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isLoading || !passwordMatch || !formData.agreeToTerms}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#9f6eff] hover:text-[#c061f7] transition-colors"
              >
                Sign in
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
