"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Info,
  Package,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { createService } from "@/app/api/services";
import type { ServiceRequest } from "@/app/api/services";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

      // Structure service data exactly as expected by the backend
      // Backend expects ServiceName, ServiceDesc, Price and Duration in the ServiceRequestHandler struct
      const serviceData = {
        "service-name": serviceName,
        "service-desc": serviceDesc,
        price: Number.parseFloat(price),
        duration: Number.parseInt(duration),
        ServiceName: serviceName, // Add these fields as backup
        ServiceDesc: serviceDesc,
        Price: Number.parseFloat(price),
        Duration: Number.parseInt(duration),
      };

      // Add detailed debug logging
      console.log(
        "Creating service with data:",
        JSON.stringify(serviceData, null, 2)
      );
      console.log("Sending to endpoint:", `/service/create?id=${userId}`);

      try {
        const response = await createService(userId, serviceData);
        console.log("Service creation response:", response);
        toast.success("Service created successfully");
        router.push("/dashboard/owner/services");
      } catch (error) {
        console.error("Error creating service:", error);

        // Detailed error logging
        if (error && typeof error === "object" && "message" in error) {
          console.error("Error message:", (error as any).message);
        }
        if (error && typeof error === "object" && "status" in error) {
          console.error("Error status:", (error as any).status);
        }
        if (error && typeof error === "object" && "data" in error) {
          console.error("Error data:", (error as any).data);
        }

        toast.error(
          "Failed to create service. Please check console for details."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy to-navy/70 text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-mred border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          className="border-gteal/20 bg-navy/30 text-white hover:bg-navy/50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-spink to-mred bg-clip-text text-transparent">Add New Service</h1>
        <p className="text-white/70">
          Create a new service offering that will be visible to your clients
        </p>
      </div>

      {/* Form */}
      <Card className="bg-navy/30 border-gteal/20 shadow-lg shadow-navy/40 relative overflow-hidden">
        {/* Color accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mred to-spink"></div>
        
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="w-5 h-5 text-spink" />
            Service Information
          </CardTitle>
          <CardDescription>
            Enter all the details about your new service offering
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6">
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
                  className={`w-full bg-navy/50 border ${
                    errors.serviceName ? "border-red-500" : "border-gteal/20"
                  } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-mred/30`}
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
                  className={`w-full bg-navy/50 border ${
                    errors.price ? "border-red-500" : "border-gteal/20"
                  } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-mred/30`}
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
                  className="w-full bg-navy/50 border border-gteal/20 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-mred/30"
                >
                  <option value="15" className="bg-navy text-white">
                    15 minutes
                  </option>
                  <option value="30" className="bg-navy text-white">
                    30 minutes
                  </option>
                  <option value="45" className="bg-navy text-white">
                    45 minutes
                  </option>
                  <option value="60" className="bg-navy text-white">
                    1 hour
                  </option>
                  <option value="90" className="bg-navy text-white">
                    1.5 hours
                  </option>
                  <option value="120" className="bg-navy text-white">
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
                  className="w-full bg-navy/50 border border-gteal/20 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-mred/30"
                >
                  <option value="" className="bg-navy text-white">
                    Select a category
                  </option>
                  <option value="grooming" className="bg-navy text-white">
                    Grooming
                  </option>
                  <option value="medical" className="bg-navy text-white">
                    Medical
                  </option>
                  <option value="training" className="bg-navy text-white">
                    Training
                  </option>
                  <option value="boarding" className="bg-navy text-white">
                    Boarding
                  </option>
                  <option value="daycare" className="bg-navy text-white">
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
                <div className="border border-dashed border-gteal/20 rounded-lg p-4">
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
                      className="flex flex-col items-center justify-center h-48 cursor-pointer bg-navy/50 rounded-lg hover:bg-navy/70 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-spink/60 mb-2" />
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
                  className={`w-full bg-navy/50 border ${
                    errors.serviceDesc ? "border-red-500" : "border-gteal/20"
                  } rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-mred/30`}
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
          <div className="bg-spink/10 border border-spink/20 rounded-lg p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-spink mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/80">
                Services you create will be visible to clients who can book
                appointments for them. Make sure to provide clear descriptions
                and accurate pricing.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex sm:flex-row flex-col justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/owner/services")}
              className="border-gteal/20 bg-navy/50 hover:bg-navy/70 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-mred to-spink hover:opacity-90 transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Service
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
