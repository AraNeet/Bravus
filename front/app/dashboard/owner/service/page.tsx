"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Plus,
  Clock,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { deleteService, getUserServices } from "@/app/api/services";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import type { Service } from "@/app/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ServicesPage() {
  const { user, authUser, isLoading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(6);

  // Get user data from either full profile or auth response
  const userData = user || authUser;

  useEffect(() => {
    const fetchServices = async () => {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Check if user is owner - different ways the data might be structured
      const isOwner =
        userData &&
        ((userData as any).owner ||
          (userData as any).userType === "owner" ||
          localStorage.getItem("user_type") === "owner");

      if (!isOwner) {
        router.push("/dashboard/client");
        return;
      }

      try {
        setIsLoading(true);

        // Get user ID from token
        const userId = getUserIdFromToken();
        if (!userId) {
          console.error("Failed to get user ID from token");
          toast.error("Authentication error. Please log in again.");
          return;
        } else {
          console.log("Successfully retrieved userId:", userId);
        }

        // Fetch services directly from API
        let userServices: Service[] = [];
        let fetchSuccess = false;

        try {
          console.log(
            `Attempting to fetch services via getUserServices(${userId})...`
          );
          const result = await getUserServices(userId);
          console.log("Fetched services:", result);
          console.log(
            "Services type:",
            Array.isArray(result) ? "Array" : typeof result
          );

          // Show notification about service data source
          if (result && result.length > 0 && result[0].id.startsWith("mock")) {
            toast("Using mock services data for display", {
              description:
                "Couldn't connect to the backend. Showing sample data for now.",
            });
          }

          // Ensure we have an array
          userServices = Array.isArray(result) ? result : [];
          fetchSuccess = userServices.length > 0;

          if (userServices.length === 0) {
            console.log(
              "No services found in first attempt, trying direct API endpoints..."
            );
          }

          if (!Array.isArray(result)) {
            console.warn("Services result is not an array, received:", result);
          }
        } catch (apiError) {
          console.error("Error fetching services from API:", apiError);
          toast.error("Retrying with alternative endpoints...");
        }

        // If first method failed, try alternative methods
        if (!fetchSuccess) {
          try {
            console.log("Trying direct endpoint: /service/owner/" + userId);
            const response = await fetch(
              `/api/proxy?url=/service/owner/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (response.ok) {
              const result = await response.json();
              console.log("Direct service API result:", result);

              if (Array.isArray(result) && result.length > 0) {
                userServices = result.map((service: any) => ({
                  id: service.ID || service.id,
                  service_name:
                    service.ServiceName ||
                    service.service_name ||
                    "Unnamed Service",
                  service_desc:
                    service.ServiceDesc || service.service_desc || "",
                  price:
                    typeof service.Price === "number"
                      ? service.Price
                      : typeof service.price === "number"
                      ? service.price
                      : 0,
                  duration: service.Duration || service.duration || 60,
                  owner_id: service.OwnerID || service.owner_id || userId,
                }));
                fetchSuccess = true;
                console.log(
                  "Successfully fetched services from direct endpoint:",
                  userServices
                );
              }
            }
          } catch (directError) {
            console.error("Error with direct endpoint:", directError);
          }
        }

        // Fallback: If user data has services property
        if (!fetchSuccess && userData) {
          if ("services" in userData && Array.isArray(userData.services)) {
            userServices = userData.services;
            console.log("Using services from user data:", userServices);
            fetchSuccess = true;
          } else {
            console.log("User data structure:", userData);
            // Try to find services nested in the user object
            for (const key in userData) {
              if (key === "services" || key === "Services") {
                const services = (userData as any)[key];
                if (Array.isArray(services)) {
                  userServices = services;
                  console.log(`Found services in userData.${key}:`, services);
                  fetchSuccess = true;
                  break;
                }
              }
            }
          }
        }

        if (userServices.length === 0) {
          toast("No services found", {
            description:
              "You haven't created any services yet. Use the Add Service button to create your first service.",
          });
        }

        setServices(userServices || []);
      } catch (error) {
        console.error("Error in fetch services flow:", error);
        toast.error("Failed to load services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchServices();
    }
  }, [authLoading, isLoggedIn, userData, router]);

  // Handle service name and description which might be in different formats
  const getServiceName = (service: any): string => {
    return service.service_name || service["service-name"] || "Unnamed Service";
  };

  const getServiceDesc = (service: any): string => {
    return service.service_desc || service["service-desc"] || "No description";
  };

  // Filter services based on search query
  const filteredServices = Array.isArray(services)
    ? services.filter((service) => {
        const serviceName = getServiceName(service);
        const serviceDesc = getServiceDesc(service);

        const matchesSearch =
          serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          serviceDesc.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
    : [];

  // Pagination logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService
  );
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle service deletion
  const confirmDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeleting(true);
      await deleteService(serviceToDelete);

      // Remove the service from the local state
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== serviceToDelete)
      );

      toast.success("Service deleted successfully");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service. Please try again.");
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setServiceToDelete(null);
  };

  // If still loading, show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  console.log("Current services:", services);

  return (
    <main className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/owner"
              className="text-white/70 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-1">Services</h1>
          <p className="text-white/70">Manage your veterinary services</p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/owner/service/new")}
          className="w-full sm:w-auto bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] border-none text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gradient-to-br from-white/5 to-white/3 border-[#9f6eff]/20 focus:border-[#9f6eff]/40 focus:ring-[#9f6eff]/30 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm">
            {filteredServices.length} service
            {filteredServices.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-[#9f6eff]/20 p-6 hover:shadow-lg hover:shadow-[#9f6eff]/10 transition-all duration-300 flex flex-col h-full"
            >
              {/* Service Header */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-semibold text-lg text-white truncate">
                  {getServiceName(service)}
                </h3>
                <div className="px-3 py-1 bg-[#9f6eff]/20 rounded-full text-[#c061f7] text-sm font-medium">
                  Active
                </div>
              </div>

              {/* Service Price */}
              <div className="mb-3 text-2xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] bg-clip-text text-transparent">
                $
                {typeof service.price === "number"
                  ? service.price.toFixed(2)
                  : parseFloat(String(service.price)).toFixed(2)}
              </div>

              {/* Service Description */}
              <p className="text-white/70 mb-4 line-clamp-3 flex-grow">
                {getServiceDesc(service)}
              </p>

              {/* Service Duration */}
              <div className="flex items-center gap-2 mb-4 text-white/70">
                <Clock className="w-4 h-4" />
                <span>{service.duration || 60} minutes</span>
              </div>

              {/* Service Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <Link
                  href={`/dashboard/owner/service/${service.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium flex items-center"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Link>
                <button
                  onClick={() => confirmDelete(service.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm font-medium text-red-400 flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-[#9f6eff]/20 p-10 text-center">
          {searchQuery ? (
            <>
              <div className="bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches found</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                We couldn't find any services matching "{searchQuery}". Try a
                different search term or clear the search.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3]"
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <div className="bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-[#9f6eff]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No services yet</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                You haven't added any services to your profile yet. Services
                will appear here once you create them.
              </p>
              <Button
                onClick={() => router.push("/dashboard/owner/service/new")}
                className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Add Your First Service</span>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredServices.length > servicesPerPage && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 py-2">
              <span className="text-white/70">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border border-[#9f6eff]/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl shadow-[#9f6eff]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Service</h2>
              <p className="text-white/70">
                Are you sure you want to delete this service? This action cannot
                be undone and will remove all associated data.
              </p>
            </div>

            <div className="flex gap-3 sm:flex-row flex-col mt-6">
              <Button
                onClick={cancelDelete}
                className="bg-white/5 hover:bg-white/10 flex-1"
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white border-none flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
