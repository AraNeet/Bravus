"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { getServiceById, updateService } from "@/app/api/services";
import type { Service } from "@/app/api/types";
import type { UpdateServiceRequest } from "@/app/api/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const { user, authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get user data from either full profile or auth response
  const userData = user || authUser;

  useEffect(() => {
    const fetchService = async () => {
      if (authLoading) return;

      if (!userData) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const serviceData = await getServiceById(params.id);
        setService(serviceData);

        // Populate form fields
        setServiceName(serviceData["service-name"]);
        setServiceDesc(serviceData["service-desc"]);
        setPrice(serviceData.price.toString());

        // These fields would come from the API in a real app
        setDuration("60");
        setCategory("");
        setActive(true);

        // In a real app, you would set the image preview from the service's image URL
        setImagePreview(null);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast.error("Failed to load service details");
        router.push("/dashboard/owner/services");
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [params.id, userData, authLoading, router]);

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

    if (!service) {
      toast.error("Unable to update service");
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceData: UpdateServiceRequest = {
        "service-name": serviceName,
        "service-desc": serviceDesc,
        price: Number.parseFloat(price),
      };

      // In a real app, you would upload the image to a storage service
      // and include the URL in the service data

      await updateService(service.id, serviceData);

      toast.success("Service updated successfully");
      router.push("/dashboard/owner/service");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading, show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Service not found</p>
          <Link
            href="/dashboard/owner/services"
            className="px-6 py-2 rounded-lg bg-[#9f6eff] hover:bg-[#8b4ff7] transition-colors"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Service</h1>
        <p className="text-white/70">Update your service details</p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>
            Make changes to your service information below
          </CardDescription>
        </CardHeader>
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
                  <option value="grooming" className="bg-[#1a0b2e] text-white">
                    Grooming
                  </option>
                  <option value="medical" className="bg-[#1a0b2e] text-white">
                    Medical
                  </option>
                  <option value="training" className="bg-[#1a0b2e] text-white">
                    Training
                  </option>
                  <option value="boarding" className="bg-[#1a0b2e] text-white">
                    Boarding
                  </option>
                  <option value="daycare" className="bg-[#1a0b2e] text-white">
                    Daycare
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={active}
                      onChange={() => setActive(true)}
                      className="w-4 h-4 accent-[#9f6eff]"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!active}
                      onChange={() => setActive(false)}
                      className="w-4 h-4 accent-[#9f6eff]"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
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
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Service"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
