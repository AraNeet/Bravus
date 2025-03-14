"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Info } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { createService } from "@/app/api/services";
import type { CreateServiceRequest } from "@/app/api/services";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";

export default function NewServicePage() {
  const { user, authUser, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get user data from either full profile or auth response
  const userData = user || authUser;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!serviceName.trim()) {
      newErrors.serviceName = "Service name is required";
    }

    if (!serviceDesc.trim()) {
      newErrors.serviceDesc = "Service description is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (
      isNaN(Number.parseFloat(price)) ||
      Number.parseFloat(price) <= 0
    ) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Get user ID from token
      const userId = getUserIdFromToken();
      if (!userId) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const serviceData: CreateServiceRequest = {
        "service-name": serviceName,
        "service-desc": serviceDesc,
        price: Number.parseFloat(price),
      };

      // In a real app, you would upload the image to a storage service
      // and include the URL in the service data

      await createService(userId, serviceData);

      toast.success("Service created successfully");
      router.push("/dashboard/owner/service");
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30, 15, 60, 0.95)",
            color: "white",
            border: "1px solid rgba(159, 110, 255, 0.3)",
            backdropFilter: "blur(8px)",
          },
        }}
      />

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/dashboard/owner/service" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
            </Link>
            <h1 className="text-xl font-bold">Add New Service</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-[#9f6eff]/20 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column - Service Details */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="serviceName"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Service Name*
                  </label>
                  <input
                    id="serviceName"
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className={`w-full bg-white/5 border ${
                      errors.serviceName ? "border-red-500" : "border-white/10"
                    } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                    placeholder="e.g., Pet Grooming"
                  />
                  {errors.serviceName && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.serviceName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Price ($)*
                  </label>
                  <input
                    id="price"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full bg-white/5 border ${
                      errors.price ? "border-red-500" : "border-white/10"
                    } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                    placeholder="e.g., 49.99"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Duration (minutes)
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                  >
                    <option value="15" className="bg-[#1a0b2e] text-white">
                      15 minutes
                    </option>
                    <option value="30" className="bg-[#1a0b2e] text-white">
                      30 minutes
                    </option>
                    <option value="45" className="bg-[#1a0b2e] text-white">
                      45 minutes
                    </option>
                    <option value="60" className="bg-[#1a0b2e] text-white">
                      1 hour
                    </option>
                    <option value="90" className="bg-[#1a0b2e] text-white">
                      1.5 hours
                    </option>
                    <option value="120" className="bg-[#1a0b2e] text-white">
                      2 hours
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                  >
                    <option value="" className="bg-[#1a0b2e] text-white">
                      Select a category
                    </option>
                    <option
                      value="grooming"
                      className="bg-[#1a0b2e] text-white"
                    >
                      Grooming
                    </option>
                    <option value="medical" className="bg-[#1a0b2e] text-white">
                      Medical
                    </option>
                    <option
                      value="training"
                      className="bg-[#1a0b2e] text-white"
                    >
                      Training
                    </option>
                    <option
                      value="boarding"
                      className="bg-[#1a0b2e] text-white"
                    >
                      Boarding
                    </option>
                    <option value="daycare" className="bg-[#1a0b2e] text-white">
                      Daycare
                    </option>
                  </select>
                </div>
              </div>

              {/* Right Column - Image Upload & Description */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Service Image
                  </label>
                  <div className="border border-dashed border-white/20 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Service preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center h-48 cursor-pointer bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-white/40 mb-2" />
                        <p className="text-sm text-white/60">
                          Click to upload image
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          PNG, JPG or WEBP (max. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="serviceDesc"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Service Description*
                  </label>
                  <textarea
                    id="serviceDesc"
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    rows={5}
                    className={`w-full bg-white/5 border ${
                      errors.serviceDesc ? "border-red-500" : "border-white/10"
                    } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                    placeholder="Describe your service..."
                  />
                  {errors.serviceDesc && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.serviceDesc}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#9f6eff]/10 border border-[#9f6eff]/20 rounded-lg p-4 mb-8 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#9f6eff] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/80">
                  Services you create will be visible to clients who can book
                  appointments for them. Make sure to provide clear descriptions
                  and accurate pricing.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard/owner/services"
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe7] transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
