"use client";

import React, { useState } from "react";
import {
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash,
  User,
  Briefcase,
  PawPrint,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { post, put } from "../api/http";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    owner: false,
    agreeToTerms: false,
    location: "",

    // Step 2 - Owner
    career: "",
    services: [{ name: "", description: "", price: "" }],

    // Step 2 - Client
    animals: [{ name: "", race: "", age: "", species: "" }],
  });

  const { signupClient, signupOwner, isLoading } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    id: string;
    type: "client" | "owner";
  } | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  // Handle changes to nested service objects
  const handleServiceChange = (index: number, field: string, value: string) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  // Add a new service field
  const addServiceField = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", description: "", price: "" }],
    }));
  };

  // Remove a service field
  const removeServiceField = (index: number) => {
    if (formData.services.length <= 1) return; // Keep at least one

    const updatedServices = [...formData.services];
    updatedServices.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  // Handle changes to nested animal objects
  const handleAnimalChange = (index: number, field: string, value: string) => {
    const updatedAnimals = [...formData.animals];
    updatedAnimals[index] = {
      ...updatedAnimals[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      animals: updatedAnimals,
    }));
  };

  // Add a new animal field
  const addAnimalField = () => {
    setFormData((prev) => ({
      ...prev,
      animals: [...prev.animals, { name: "", race: "", age: "", species: "" }],
    }));
  };

  // Remove an animal field
  const removeAnimalField = (index: number) => {
    if (formData.animals.length <= 1) return; // Keep at least one

    const updatedAnimals = [...formData.animals];
    updatedAnimals.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      animals: updatedAnimals,
    }));
  };

  // Go to the next step and create the user account
  const goToNextStep = async () => {
    // Validate form data for step 1
    if (formData.name.trim() === "") {
      setFormError("Please enter your name");
      return;
    }
    if (formData.email.trim() === "") {
      setFormError("Please enter your email");
      return;
    }
    if (formData.phone.trim() === "") {
      setFormError("Please enter your phone number");
      return;
    }
    if (formData.location.trim() === "") {
      setFormError("Please enter your location");
      return;
    }
    if (formData.password.trim() === "") {
      setFormError("Please enter a password");
      return;
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (!formData.agreeToTerms) {
      setFormError("You must agree to the terms and conditions");
      return;
    }

    // Clear any previous errors
    setFormError(null);

    // Set loading state
    setCreatingAccount(true);

    try {
      // Create user account based on type
      if (formData.owner) {
        // Register as owner
        const ownerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location,
          bio: "", // Empty bio initially
        };

        // Create owner account
        const response = await signupOwner(ownerData, []);
        setCreatedAccount({ id: response.id, type: "owner" });

        // Show guidance for next step
        setFormError(
          "Please add at least 2 services to complete your registration"
        );
      } else {
        // Register as client
        const clientData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location,
        };

        // Create client account
        const response = await signupClient(clientData, []);
        setCreatedAccount({ id: response.id, type: "client" });

        // Show guidance for next step
        setFormError("Please add at least 1 pet to complete your registration");
      }

      // Move to next step after account creation
      setStep(2);
    } catch (err: any) {
      setFormError(err.message || "Account creation failed. Please try again.");
    } finally {
      setCreatingAccount(false);
    }
  };

  // Go back to the previous step
  const goToPrevStep = () => {
    setStep(1);
    setFormError(null);
  };

  // Handle final form submission (adding animals/services)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Ensure we have a created account ID
    if (!createdAccount?.id) {
      setFormError("Account creation failed. Please start over.");
      setStep(1);
      return;
    }

    try {
      if (createdAccount.type === "owner") {
        // Validate owner-specific fields
        if (!formData.career) {
          setFormError("Please provide your career");
          return;
        }

        // Check if at least 2 valid services
        const validServices = formData.services.filter(
          (service) => service.name && service.description && service.price
        );

        if (validServices.length < 2) {
          setFormError(
            "Please add at least 2 services with all fields completed"
          );
          return;
        }

        // Map services to match API format
        const services = validServices.map((service) => ({
          "service-name": service.name,
          "service-desc": service.description,
          price: parseFloat(service.price),
          duration: 60, // Default duration in minutes
        }));

        // Update owner with career and add services
        try {
          // Update owner with career
          await put(`/owner/update/${createdAccount.id}`, {
            Career: formData.career,
          });

          // Add services for owner
          console.log("Owner ID for service creation:", createdAccount.id);
          const promises = services.map((service) => {
            console.log("Creating service:", JSON.stringify(service));
            return post(`/service/create?id=${createdAccount.id}`, service)
              .then((result) => {
                console.log("Service created successfully:", result);
                return result;
              })
              .catch((error) => {
                console.error("Service creation failed:", error);
                console.error("Service that failed:", JSON.stringify(service));
                throw error;
              });
          });

          const results = await Promise.all(promises);
          console.log("Service creation results:", results);

          // Logout and redirect to login page
          localStorage.removeItem("auth_token");
          localStorage.removeItem("ID");
          localStorage.removeItem("user_type");
          window.location.href = "/login?registered=true";
        } catch (serviceErr) {
          console.error("Error creating services:", serviceErr);
          throw new Error(
            "Failed to add services. Please try again or add services later."
          );
        }
      } else {
        // Validate client-specific fields - check if at least 1 valid animal
        const validAnimals = formData.animals.filter(
          (animal) => animal.name && animal.species && animal.race && animal.age
        );

        if (validAnimals.length < 1) {
          setFormError(
            "Please add at least 1 pet with all required fields completed"
          );
          return;
        }

        // Map animals to match API format
        const animals = validAnimals.map((animal) => ({
          "animal-name": animal.name,
          "animal-race": animal.race,
          "animal-age": parseInt(animal.age) || 0,
          species: animal.species,
        }));

        // Add animals for the client
        try {
          const promises = animals.map((animal) =>
            post(`/animal/create?id=${createdAccount.id}`, animal)
          );
          await Promise.all(promises);

          // Logout and redirect to login page
          localStorage.removeItem("auth_token");
          localStorage.removeItem("ID");
          localStorage.removeItem("user_type");
          window.location.href = "/login?registered=true";
        } catch (err) {
          console.error("Error adding animals:", err);
          throw new Error(
            "Failed to add pets. Your account was created, but please add pets later."
          );
        }
      }
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === 1 ? "bg-[#9f6eff]/80" : "bg-white/10"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <div className="h-0.5 w-8 bg-white/20"></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === 2 ? "bg-[#9f6eff]/80" : "bg-white/10"
                }`}
              >
                {formData.owner ? (
                  <Briefcase className="w-5 h-5" />
                ) : (
                  <PawPrint className="w-5 h-5" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
              {step === 1
                ? "Create Account"
                : formData.owner
                ? "Business Details"
                : "Your Pets"}
            </h1>
            <p className="text-white/60">
              {step === 1
                ? "Join Bravus to manage your business"
                : step === 2 && formData.owner
                ? "Tell us about your services"
                : "Add your pets (required)"}
            </p>
          </header>

          {formError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <fieldset className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(123) 456-7890"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="New York, NY"
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
            )}

            {/* Step 2: Owner Details (Career & Services) */}
            {step === 2 && formData.owner && (
              <fieldset className="space-y-6">
                {/* Career Field */}
                <div>
                  <label
                    htmlFor="career"
                    className="block text-sm font-medium text-white/80 mb-1"
                  >
                    Career <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="career"
                    name="career"
                    value={formData.career}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 text-white"
                  >
                    <option value="" className="bg-[#1a0b2e]">
                      Select a career
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
                    <option value="Groomer" className="bg-[#1a0b2e]">
                      Groomer
                    </option>
                    <option value="Other" className="bg-[#1a0b2e]">
                      Other
                    </option>
                  </select>
                </div>

                {/* Services Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white/80">
                      Your Services <span className="text-red-400">*</span>
                    </label>
                    <p className="text-xs text-white/60">
                      Add at least 2 services
                    </p>
                  </div>

                  {formData.services.map((service, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Service #{index + 1}</h3>
                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceField(index)}
                            className="p-1 rounded-full hover:bg-white/10"
                          >
                            <Trash className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-white/80 mb-1">
                            Service Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) =>
                              handleServiceChange(index, "name", e.target.value)
                            }
                            placeholder="e.g. Haircut"
                            required
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/80 mb-1">
                            Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            value={service.description}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your service"
                            required
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-white/80 mb-1">
                            Price ($) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={service.price}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="29.99"
                            required
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addServiceField}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 border border-dashed border-white/20 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Service
                  </button>
                </div>
              </fieldset>
            )}

            {/* Step 2: Client Details (Animals) */}
            {step === 2 && !formData.owner && (
              <fieldset className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white/80">
                      Your Pets <span className="text-red-400">*</span>
                    </label>
                    <p className="text-xs text-white/60">Add at least 1 pet</p>
                  </div>

                  {formData.animals.map((animal, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Pet #{index + 1}</h3>
                        {formData.animals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAnimalField(index)}
                            className="p-1 rounded-full hover:bg-white/10"
                          >
                            <Trash className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-white/80 mb-1">
                            Pet Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={animal.name}
                            onChange={(e) =>
                              handleAnimalChange(index, "name", e.target.value)
                            }
                            placeholder="e.g. Max"
                            required
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-white/80 mb-1">
                              Species <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={animal.species}
                              onChange={(e) =>
                                handleAnimalChange(
                                  index,
                                  "species",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Dog, Cat"
                              required
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-white/80 mb-1">
                              Breed <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={animal.race}
                              onChange={(e) =>
                                handleAnimalChange(
                                  index,
                                  "race",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Golden Retriever"
                              required
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-white/80 mb-1">
                            Age <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={animal.age}
                            onChange={(e) =>
                              handleAnimalChange(index, "age", e.target.value)
                            }
                            placeholder="e.g. 3"
                            required
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9f6eff]/50 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAnimalField}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 border border-dashed border-white/20 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Pet
                  </button>
                </div>
              </fieldset>
            )}

            {/* Form buttons */}
            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-lg text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={
                    creatingAccount ||
                    !formData.name ||
                    !formData.email ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    !passwordMatch ||
                    !formData.agreeToTerms
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creatingAccount ? (
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (formData.owner &&
                      (!formData.career ||
                        formData.services.filter(
                          (s) => s.name && s.description && s.price
                        ).length < 2)) ||
                    (!formData.owner &&
                      formData.animals.filter(
                        (a) => a.name && a.species && a.race && a.age
                      ).length < 1)
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                      {createdAccount?.type === "owner"
                        ? "Adding Services..."
                        : "Adding Pets..."}
                    </>
                  ) : (
                    <>
                      {createdAccount?.type === "owner"
                        ? "Add Services"
                        : "Add Pets"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
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
