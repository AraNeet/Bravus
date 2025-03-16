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

      if (userData && !userData.owner) {
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
        try {
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

          if (userServices.length === 0) {
            toast("No services found", {
              description:
                "You haven't created any services yet. Use the Add Service button to create your first service.",
            });
          }

          if (!Array.isArray(result)) {
            console.warn("Services result is not an array, received:", result);
          }
        } catch (apiError) {
          console.error("Error fetching services from API:", apiError);
          toast.error(
            "Failed to load services from API. Trying fallback method..."
          );

          // Fallback: If user data has services property
          if (
            userData &&
            "services" in userData &&
            Array.isArray(userData.services)
          ) {
            userServices = userData.services;
            console.log("Using services from user data:", userServices);
          }
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

  // Filter services based on search query
  const filteredServices = Array.isArray(services)
    ? services.filter((service) => {
        const matchesSearch =
          service["service-name"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service["service-desc"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gradient-to-br from-white/5 to-white/3 border-[#9f6eff]/20 focus:border-[#9f6eff]/40 focus:ring-[#9f6eff]/30"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-[#9f6eff]/20 p-6 hover:shadow-lg hover:shadow-[#9f6eff]/10 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">
                  {service["service-name"]}
                </h3>
              </div>

              <p className="text-white/70 text-sm mb-4 line-clamp-3">
                {service["service-desc"]}
              </p>

              <div className="flex justify-between items-center">
                <p className="text-[#9f6eff] font-medium">
                  ${service.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => confirmDelete(service.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    aria-label="Delete service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/dashboard/owner/service/${service.id}`}
                    className="p-2 text-[#9f6eff] hover:bg-[#9f6eff]/20 rounded-lg transition-colors"
                    aria-label="Edit service"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
          {searchQuery ? (
            <p className="text-white/60 mb-4">
              No services match your search criteria
            </p>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Package className="w-12 h-12 text-[#9f6eff]/50" />
              </div>
              <p className="text-white/60 mb-4">
                You haven't added any services yet
              </p>
              <Link
                href="/dashboard/owner/service/new"
                className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe7] px-4 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add your first service</span>
              </Link>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Service</h2>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete this service? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
