"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Temporary solution - use our own date utilities until date-fns is installed
import { useAuth } from "@/app/hooks/useAuth";
import { deleteAppointment, getOwnerAppointments } from "@/app/api/appointments";
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
  ArrowLeft,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type {
  Owner,
  Client,
  AuthOwnerResponse,
  AuthClientResponse,
  Appointment,
  Service,
  ClientAppointment,
  OwnerAppointment,
} from "@/app/api/types";
import { getServiceById } from "@/app/api/services";

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
  const { user, authUser, isLoading, isLoggedIn, userType } = useAuth();
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Redirect if not authenticated or not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (userType !== "owner") {
        router.push("/dashboard/client");
      }
    }
  }, [isLoading, isLoggedIn, userType, router]);

  // Fetch appointments using the new API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isLoggedIn) return;
      
      try {
        setIsLoadingAppointments(true);
        const userId = getUserIdFromToken();
        if (userId) {
          console.log("Fetching appointments for owner with userId:", userId);
          const ownerAppointments = await getOwnerAppointments(userId);
          console.log("Owner appointments:", ownerAppointments);
          setAppointments(Array.isArray(ownerAppointments) ? ownerAppointments : []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
        // Fallback to user.appointments if available
        if (
          user &&
          (user as any).appointments &&
          Array.isArray((user as any).appointments)
        ) {
          setAppointments((user as any).appointments);
        }
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    if (!isLoading && isLoggedIn) {
      fetchAppointments();
    }
  }, [isLoading, isLoggedIn, user]);

  // If still loading, show loading state
  if (isLoading || isLoadingAppointments) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get user data from either full profile or auth response
  const userData = (user as Owner) || (authUser as AuthOwnerResponse);

  // If no user data, redirect to login (should be handled by useEffect, but just in case)
  if (!userData) {
    router.push("/login");
    return null;
  }

  // Type guard function to check if the user data has appointments
  const hasAppointments = (data: any): data is Owner => {
    return "appointments" in data && Array.isArray(data.appointments);
  };

  // Type guard function to check if the user data has services
  const hasServices = (data: any): data is Owner => {
    return "services" in data && Array.isArray(data.services);
  };

  // Filter appointments based on search query, date filter, and status filter
  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const appointmentDate = new Date(appointment.datetime);
    const clientNames = appointment.clients
      ? appointment.clients
          .map((client: ClientAppointment) => `${client.name}`.toLowerCase())
          .join(" ")
      : "";

    // Try to find service name
    let serviceName = "";
    if (appointment.services && appointment.services.length > 0) {
      serviceName = appointment.services[0].service_name.toLowerCase();
    } else if (hasServices(userData)) {
      const service = userData.services.find(
        (s: Service) => s.id === appointment.services?.[0]?.id
      );
      if (service) {
        serviceName = service.service_name.toLowerCase();
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
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a: Appointment, b: Appointment) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    }
  );

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = sortedAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Delete appointment
  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    setIsLoading2(true);
    try {
      await deleteAppointment(appointmentToDelete);
      
      // Update the appointments state by removing the deleted appointment
      setAppointments(appointments.filter(
        (appointment) => appointment.id !== appointmentToDelete
      ));
      
      toast.success("Appointment deleted successfully");
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    } finally {
      setIsLoading2(false);
    }
  };

  // Get service name helper function
  const getServiceName = (appointment: Appointment): string => {
    if (appointment.services && appointment.services.length > 0) {
      return appointment.services[0].service_name;
    }
    
    // Fallback to looking up service ID in userData.services
    if (hasServices(userData) && appointment.services && appointment.services.length > 0) {
      const serviceId = appointment.services[0].id;
      const service = userData.services.find((s: Service) => s.id === serviceId);
      if (service) {
        return service.service_name;
      }
    }
    
    return "Unknown Service";
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
          <h1 className="text-3xl font-bold mb-1">Appointments</h1>
          <p className="text-white/70">Manage your scheduled appointments</p>
        </div>
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
                    key={appointment.id}
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
                        {appointment.clients.map(
                          (client: ClientAppointment, index: number) => (
                            <div key={index}>
                              <p className="font-medium">{client.name}</p>
                              {client.phone && (
                                <p className="text-sm text-white/60">
                                  {client.phone}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium">
                        {getServiceName(appointment)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status="confirmed" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/owner/appointments/${appointment.id}`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          aria-label="View appointment details"
                        >
                          <MoreHorizontal className="w-4 h-4 text-white/70" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(appointment.id)}
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
