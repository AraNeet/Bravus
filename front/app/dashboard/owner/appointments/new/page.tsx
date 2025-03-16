"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import {
  Calendar,
  Clock,
  ChevronLeft,
  Users,
  Package,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  createAppointment,
  CreateAppointmentRequest,
} from "@/app/api/appointments";
import { getOwners } from "@/app/api/users";
import { formatDateForBackend } from "@/app/utils/date-utils";
import { OwnerWithServices } from "@/app/api/users";
import { Service } from "@/app/api/types";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import type { User, AuthResponse } from "@/app/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewAppointment() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [clients, setClients] = useState<OwnerWithServices[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({
    date: "",
    time: "",
    client: "",
    service: "",
  });

  // Redirect if not authenticated or not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        const userData = user || authUser;
        if (userData && !userData.owner) {
          router.push("/dashboard/client");
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router]);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const ownersData = await getOwners();
        // Filter out owners, keep only clients
        const clientsData = ownersData.filter((owner) => !owner.owner);
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setIsLoadingClients(false);
      }
    };

    if (isLoggedIn && !isLoading) {
      loadClients();
    }
  }, [isLoggedIn, isLoading]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get user data from either full profile or auth response
  const userData = user || authUser;

  // If no user data, redirect to login (should be handled by useEffect, but just in case)
  if (!userData) {
    router.push("/login");
    return null;
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      date: "",
      time: "",
      client: "",
      service: "",
    };
    let isValid = true;

    if (!date) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    if (!time) {
      newErrors.time = "Time is required";
      isValid = false;
    }

    if (!selectedClient) {
      newErrors.client = "Client is required";
      isValid = false;
    }

    if (!selectedService) {
      newErrors.service = "Service is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time and format for backend
      const dateTimeObj = new Date(`${date}T${time}`);
      const formattedDateTime = formatDateForBackend(dateTimeObj);

      const appointmentData: CreateAppointmentRequest = {
        DateTime: formattedDateTime,
      };

      // Get owner ID from token or localStorage
      const ownerId =
        getUserIdFromToken() ||
        (userData && "id" in userData ? userData.id : "");

      if (!ownerId) {
        throw new Error("Could not determine owner ID");
      }

      await createAppointment(
        ownerId, // Owner ID from token or user data
        selectedClient, // Client ID
        selectedService, // Service ID
        appointmentData
      );

      toast.success("Appointment created successfully");

      // Redirect to appointments page after successful creation
      setTimeout(() => {
        router.push("/dashboard/owner/appointments");
      }, 1500);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Type guard function to check if the user data has services
  const hasServices = (data: User | AuthResponse): data is User => {
    return "services" in data && Array.isArray(data.services);
  };

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
        <h1 className="text-3xl font-bold mb-2">Create New Appointment</h1>
        <p className="text-white/70">
          Schedule a new appointment with a client
        </p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full bg-white/5 border ${
                    errors.date ? "border-red-500/50" : "border-white/10"
                  } rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-400">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full bg-white/5 border ${
                    errors.time ? "border-red-500/50" : "border-white/10"
                  } rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-400">{errors.time}</p>
              )}
            </div>

            {/* Client Selection */}
            <div>
              <label
                htmlFor="client"
                className="block text-sm font-medium mb-2"
              >
                Client
              </label>
              <div className="relative">
                <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className={`w-full bg-white/5 border ${
                    errors.client ? "border-red-500/50" : "border-white/10"
                  } rounded-lg py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                >
                  <option value="">Select a client</option>
                  {isLoadingClients ? (
                    <option disabled>Loading clients...</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstname} {client.lastname}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {errors.client && (
                <p className="mt-1 text-sm text-red-400">{errors.client}</p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium mb-2"
              >
                Service
              </label>
              <div className="relative">
                <Package className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className={`w-full bg-white/5 border ${
                    errors.service ? "border-red-500/50" : "border-white/10"
                  } rounded-lg py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50`}
                >
                  <option value="">Select a service</option>
                  {userData &&
                  hasServices(userData) &&
                  userData.services.length > 0 ? (
                    userData.services.map((service: Service) => (
                      <option key={service.id} value={service.id}>
                        {service["service-name"]} (${service.price.toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option disabled>No services available</option>
                  )}
                </select>
              </div>
              {errors.service && (
                <p className="mt-1 text-sm text-red-400">{errors.service}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <Link
              href="/dashboard/owner/appointments"
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Appointment</span>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
