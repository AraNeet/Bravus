"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Plus,
  Trash,
  User,
  Briefcase,
  Phone,
  MapPin,
  Mail,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { post, put } from "../api/http";
import Image from "next/image";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Handle user type change (owner or client)
  const handleUserTypeChange = (isOwner: boolean) => {
    setFormData({
      ...formData,
      owner: isOwner
    });
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
    <main className="min-h-screen relative bg-navy flex justify-center items-center px-4 py-10 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/images/signup-bg.svg"
          alt="Background"
          fill
          priority
          className="object-cover opacity-75"
        />
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
      
      <div className="container max-w-6xl mx-auto flex relative z-10">
        {/* Left Content - Only shows on larger screens */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-8">
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            Begin Your <span className="text-spink">Journey</span> With Us
            </h1>
          <p className="text-white/70 text-lg max-w-lg">
            Create your account and unlock a world of possibilities for your pet care business or find the perfect services for your beloved pets.
          </p>
        </div>

      {/* Signup Form */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto">
          <div className="bg-navy/75 backdrop-blur-lg rounded-2xl shadow-xl border border-spink/20 p-6 animate-fadeIn">
            {/* Mobile Header - Only visible on smaller screens */}
            <div className="lg:hidden mb-6 text-center">
              <h1 className="text-2xl font-bold text-white">
                Join <span className="text-spink">Bravus</span>
              </h1>
              <p className="text-white/70 mt-1">Create your account</p>
              </div>
            
            {/* Steps Indicator */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-spink text-navy' : 'bg-navy/50 text-white/70 border border-spink/30'}`}>
                  1
              </div>
                <div className={`h-0.5 w-8 ${step === 2 ? 'bg-spink' : 'bg-navy/50'}`}></div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'bg-spink text-navy' : 'bg-navy/50 text-white/70 border border-spink/30'}`}>
                  2
            </div>
              </div>
              <div className="text-sm text-white/70">
                {step === 1 ? 'Account Details' : formData.owner ? 'Business Details' : 'Pet Information'}
              </div>
            </div>

          {formError && (
              <div className="bg-mred/20 border border-mred/40 text-white rounded-lg p-3 mb-4">
                <p className="text-sm">{formError}</p>
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Account Creation */}
            {step === 1 && (
                <>
                  {/* Full Name */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                        placeholder="Full Name"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                  />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                        <User className="w-4 h-4" />
                      </span>
                    </div>
                </div>

                  {/* Email */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Email Address"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                        <Mail className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                        placeholder="Phone Number"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                  />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                        <Phone className="w-4 h-4" />
                      </span>
                    </div>
                </div>

                {/* Location */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                        placeholder="Location/Address"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                  />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                        <MapPin className="w-4 h-4" />
                      </span>
                </div>
                </div>

                {/* Password */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                        placeholder="Password"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                        placeholder="Confirm Password"
                        className={`w-full px-5 py-3.5 bg-navy/50 border rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300 ${
                          formData.password && formData.confirmPassword && !passwordMatch
                            ? "border-mred/60 focus:border-mred"
                            : "border-spink/30 focus:border-spink/60"
                        }`}
                    />
                    <button
                      type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                    {formData.password && formData.confirmPassword && !passwordMatch && (
                      <p className="text-mred text-sm animate-shake">Passwords do not match!</p>
                  )}
                </div>

                  {/* User Type */}
                  <div className="pt-1 pb-1">
                    <h3 className="text-white text-sm mb-2">I want to:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUserTypeChange(true)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          formData.owner
                            ? "border-spink bg-spink/10"
                            : "border-white/10 bg-navy/50 hover:bg-navy/70"
                        }`}
                      >
                        <ShoppingBag className={`w-5 h-5 ${formData.owner ? "text-spink" : "text-white/70"}`} />
                        <span className={formData.owner ? "text-white" : "text-white/70"}>
                          Offer Services
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUserTypeChange(false)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          !formData.owner
                            ? "border-spink bg-spink/10"
                            : "border-white/10 bg-navy/50 hover:bg-navy/70"
                        }`}
                      >
                        <Users className={`w-5 h-5 ${!formData.owner ? "text-spink" : "text-white/70"}`} />
                        <span className={!formData.owner ? "text-white" : "text-white/70"}>
                          Book Services
                        </span>
                      </button>
                    </div>
                </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-2 my-2">
                  <input
                    type="checkbox"
                      id="terms"
                      name="agreeToTerms"
                    checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })}
                    required
                      className="mt-1 h-4 w-4 rounded border-spink/30 bg-navy/50 text-spink focus:ring-spink/50"
                  />
                    <label htmlFor="terms" className="text-sm text-white/70">
                    I agree to the{" "}
                      <a
                        href="#"
                        className="text-spink hover:text-spink/80 transition-colors underline"
                    >
                      Terms of Service
                      </a>{" "}
                    and{" "}
                      <a
                        href="#"
                        className="text-spink hover:text-spink/80 transition-colors underline"
                    >
                      Privacy Policy
                      </a>
                  </label>
                </div>

                  {/* Continue Button (Step 1 only) */}
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={
                      creatingAccount ||
                      !formData.name ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.location ||
                      !formData.password ||
                      !formData.confirmPassword ||
                      !passwordMatch ||
                      !formData.agreeToTerms
                    }
                    className="w-full bg-spink hover:bg-mred text-navy font-medium py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-spink/20 hover:shadow-spink/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {creatingAccount ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </>
              )}

              {/* Step 2: Account Type Specific Fields */}
            {step === 2 && formData.owner && (
                <>
                {/* Career Field */}
                  <div className="space-y-2 group">
                    <div className="relative transition-all duration-300 group-hover:scale-[1.01]">
                      <input
                    id="career"
                    name="career"
                        type="text"
                    value={formData.career}
                    onChange={handleChange}
                    required
                        placeholder="Your Career/Profession"
                        className="w-full px-5 py-3.5 bg-navy/50 border border-spink/30 rounded-full text-white placeholder:text-white/60 pr-10 focus:outline-none focus:border-spink/60 focus:shadow-[0_0_15px_rgba(244,164,166,0.15)] transition-all duration-300"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                        <Briefcase className="w-4 h-4" />
                      </span>
                    </div>
                </div>

                  {/* Services */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">Services</h3>
                      <button
                        type="button"
                        onClick={addServiceField}
                        className="flex items-center gap-1 text-spink hover:text-spink/80 text-sm"
                      >
                        <Plus className="w-4 h-4" /> Add Service
                      </button>
                  </div>

                  {formData.services.map((service, index) => (
                    <div
                      key={index}
                        className="p-4 bg-navy/40 rounded-xl border border-spink/20"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">
                            Service #{index + 1}
                          </h4>
                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceField(index)}
                              className="text-mred hover:text-red-400 transition-colors"
                              aria-label="Remove service"
                          >
                              <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                          {/* Service Name */}
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) =>
                              handleServiceChange(index, "name", e.target.value)
                            }
                            placeholder="Service Name"
                            required
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                          />

                          {/* Service Description */}
                          <textarea
                            value={service.description}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Service Description"
                            required
                            rows={2}
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60 resize-none"
                          />

                          {/* Service Price */}
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
                              $
                            </span>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                              placeholder="Price"
                            required
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}

              {/* Step 2: Pet Information for Clients */}
              {step === 2 && !formData.owner && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">Your Pets</h3>
                  <button
                    type="button"
                        onClick={addAnimalField}
                        className="flex items-center gap-1 text-spink hover:text-spink/80 text-sm"
                  >
                        <Plus className="w-4 h-4" /> Add Pet
                  </button>
                  </div>

                  {formData.animals.map((animal, index) => (
                    <div
                      key={index}
                        className="p-4 bg-navy/40 rounded-xl border border-spink/20"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">
                            Pet #{index + 1}
                          </h4>
                        {formData.animals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAnimalField(index)}
                              className="text-mred hover:text-red-400 transition-colors"
                              aria-label="Remove pet"
                          >
                              <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Pet Name */}
                          <input
                            type="text"
                            value={animal.name}
                            onChange={(e) =>
                              handleAnimalChange(index, "name", e.target.value)
                            }
                            placeholder="Pet Name"
                            required
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                          />

                          {/* Pet Age */}
                            <input
                            type="number"
                            value={animal.age}
                              onChange={(e) =>
                              handleAnimalChange(index, "age", e.target.value)
                            }
                            placeholder="Age"
                              required
                            min="0"
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                            />

                          {/* Pet Species */}
                            <input
                              type="text"
                            value={animal.species}
                              onChange={(e) =>
                              handleAnimalChange(index, "species", e.target.value)
                            }
                            placeholder="Species (e.g. Dog, Cat)"
                              required
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                            />

                          {/* Pet Race/Breed */}
                          <input
                            type="text"
                            value={animal.race}
                            onChange={(e) =>
                              handleAnimalChange(index, "race", e.target.value)
                            }
                            placeholder="Breed"
                            required
                            className="w-full px-4 py-2.5 bg-navy/50 border border-spink/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-spink/60"
                          />
                      </div>
                    </div>
                  ))}
                </div>
                </>
            )}

              {/* Back Button (Step 2 only) */}
              {step === 2 && (
                <div className="flex mt-2 mb-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                    className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                </div>
              )}

              {/* Submit Button (Step 2 only) */}
              {step === 2 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-spink hover:bg-mred text-navy font-medium py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-spink/20 hover:shadow-spink/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </button>
              )}
          </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                  className="text-spink hover:text-spink/80 transition-colors"
              >
                  Login
              </Link>
            </p>
              <p className="text-white/60 text-sm">
                Want to go back?{" "}
        <Link
          href="/"
                  className="text-spink hover:text-spink/80 transition-colors"
        >
          Back to home
        </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
