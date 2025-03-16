"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Temporary solution - use our own date utilities until date-fns is installed
import { useAuth } from "@/app/hooks/useAuth";
import { deleteAppointment } from "@/app/api/appointments";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type {
  User,
  AuthResponse,
  Appointment,
  Service,
  UserAppointment,
} from "@/app/api/types";
import { getServiceById } from "@/app/api/services";
import { Button } from "@/components/ui/button";

// Date utility functions to replace date-fns
const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return date >= weekStart && date <= weekEnd;
};

const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const isFuture = (date: Date): boolean => {
  return date > new Date();
};

// Define CalendarClock icon as we're not importing it from lucide-react directly
const CalendarClock = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h5" />
    <path d="M17.5 17.5 16 16.25V14" />
    <path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
  </svg>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return (
        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Confirmed
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "cancelled":
      return (
        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center gap-1">
          <X className="w-3 h-3" />
          Cancelled
        </span>
      );
    case "completed":
      return (
        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
          {status}
        </span>
      );
  }
};

// Confirmation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#2a1347] to-[#1a0b2e] rounded-xl border border-[#9f6eff]/20 shadow-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/70 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OwnerAppointments() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [isLoading2, setIsLoading2] = useState(false);
  const [serviceCache, setServiceCache] = useState<Record<string, Service>>({});

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

  // Type guard function to check if the user data has appointments
  const hasAppointments = (data: User | AuthResponse): data is User => {
    return "appointments" in data && Array.isArray(data.appointments);
  };

  // Type guard function to check if the user data has services
  const hasServices = (data: User | AuthResponse): data is User => {
    return "services" in data && Array.isArray(data.services);
  };

  // Filter appointments based on search query, date filter, and status filter
  const filteredAppointments = hasAppointments(userData)
    ? userData.appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.datetime);
        const clientNames = appointment.Users.map((u: UserAppointment) =>
          `${u.firstname} ${u.lastname}`.toLowerCase()
        ).join(" ");

        // Try to find service name
        let serviceName = "";
        if (hasServices(userData)) {
          const service = userData.services.find(
            (s: Service) => s.id === appointment.service
          );
          if (service) {
            serviceName = service["service-name"].toLowerCase();
          }
        }

        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          clientNames.includes(searchQuery.toLowerCase()) ||
          serviceName.includes(searchQuery.toLowerCase());

        // Date filter
        let matchesDate = true;
        if (dateFilter === "today") {
          matchesDate = isToday(appointmentDate);
        } else if (dateFilter === "week") {
          matchesDate = isThisWeek(appointmentDate);
        } else if (dateFilter === "month") {
          matchesDate = isThisMonth(appointmentDate);
        } else if (dateFilter === "upcoming") {
          matchesDate = isFuture(appointmentDate);
        }

        // Status filter - for demo purposes, we'll assume all appointments are confirmed unless specified
        // In a real app, you would have a status field in the appointment object
        const appointmentStatus = "confirmed";
        const matchesStatus =
          statusFilter === "all" || statusFilter === appointmentStatus;

        return matchesSearch && matchesDate && matchesStatus;
      })
    : [];

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = sortedAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle appointment deletion
  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    setIsLoading2(true);
    try {
      await deleteAppointment(appointmentToDelete);
      toast.success("Appointment deleted successfully");
      // In a real app, you would refresh the appointments list here
      // For now, we'll just close the dialog and reset the state
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);

      // Simulate a refresh by redirecting to the same page
      router.refresh();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    } finally {
      setIsLoading2(false);
    }
  };

  // Find service name by ID
  const getServiceName = (serviceId: string): string => {
    // Check if we already have this service in our cache
    if (serviceCache[serviceId]) {
      return serviceCache[serviceId]["service-name"];
    }

    // Try to find in user's services first (for performance)
    if (hasServices(userData)) {
      const service = userData.services.find(
        (s: Service) => s.id === serviceId
      );
      if (service) {
        // Add to cache for future reference
        setServiceCache((prev) => ({ ...prev, [serviceId]: service }));
        return service["service-name"];
      }
    }

    // If not found, fetch from API
    getServiceById(serviceId)
      .then((service) => {
        // Add to cache for future reference
        setServiceCache((prev) => ({ ...prev, [serviceId]: service }));
      })
      .catch((error) => {
        console.error(`Error fetching service ${serviceId}:`, error);
      });

    // Return placeholder while loading
    return serviceCache[serviceId]
      ? serviceCache[serviceId]["service-name"]
      : "Loading...";
  };

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(42, 19, 71, 0.9)",
            color: "#fff",
            border: "1px solid rgba(159, 110, 255, 0.2)",
            backdropFilter: "blur(8px)",
          },
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <h1 className="text-3xl font-bold mb-1">Appointments</h1>
          <p className="text-white/70">Manage your scheduled appointments</p>
        </div>
        <Link
          href="/dashboard/owner/appointments/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by client or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <ChevronRight className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 rotate-90" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <ChevronRight className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {currentAppointments.length > 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment: Appointment) => (
                  <tr
                    key={appointment.ID}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#9f6eff]/10 rounded-lg p-2 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5 text-[#9f6eff]" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatDateForDisplay(
                              new Date(appointment.datetime)
                            )}
                          </p>
                          <p className="text-sm text-white/60">
                            {formatTimeForDisplay(
                              new Date(appointment.datetime)
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {appointment.Users.map(
                          (user: UserAppointment, index: number) => (
                            <div key={index}>
                              <p className="font-medium">
                                {user.firstname} {user.lastname}
                              </p>
                              {user.phone && (
                                <p className="text-sm text-white/60">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium">
                        {getServiceName(appointment.service)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status="confirmed" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/owner/appointments/${appointment.ID}`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          aria-label="View appointment details"
                        >
                          <MoreHorizontal className="w-4 h-4 text-white/70" />
                        </Link>
                        <Link
                          href={`/dashboard/owner/appointments/${appointment.ID}/edit`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          aria-label="Edit appointment"
                        >
                          <Edit className="w-4 h-4 text-white/70" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(appointment.ID)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                          aria-label="Delete appointment"
                        >
                          <Trash2 className="w-4 h-4 text-white/70" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#9f6eff]/10 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#9f6eff]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No appointments found</h3>
            <p className="text-white/60 mb-6">
              {searchQuery || dateFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "You don't have any appointments yet"}
            </p>
            {!searchQuery && dateFilter === "all" && statusFilter === "all" && (
              <Link
                href="/dashboard/owner/appointments/new"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create your first appointment</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === number
                      ? "bg-[#9f6eff]/20 text-[#9f6eff] font-medium"
                      : "bg-white/5 hover:bg-white/10"
                  } transition-colors`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  );
}
