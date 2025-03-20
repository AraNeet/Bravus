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
  PlusCircle,
  RefreshCcw,
  CalendarDays,
  ChevronDown,
  XCircle,
  CheckCircle2,
  User,
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

// Format date to a friendly string
function formatAppointmentDate(datetime: string): string {
  const date = new Date(datetime);
  
  // Add 4 hours to the time
  date.setHours(date.getHours() + 4);
  
  // Use UTC methods to ensure consistent rendering
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  
  const isToday = date >= today && date < tomorrow;
  const isTomorrow = date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000);
  
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: 'UTC' // Use UTC to ensure consistent rendering
  };
  
  let dateString = "";
  
  if (isToday) {
    dateString = "Today";
  } else if (isTomorrow) {
    dateString = "Tomorrow";
  } else {
    dateString = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short", 
      day: "numeric",
      timeZone: 'UTC' // Use UTC to ensure consistent rendering
    });
  }
  
  return `${dateString} at ${date.toLocaleTimeString([], options)}`;
}

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
  const statusConfig = {
    confirmed: {
      color: "bg-gteal/15 text-gteal border border-gteal/20",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    cancelled: {
      color: "bg-mred/15 text-mred border border-mred/20",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    pending: {
      color: "bg-amber-400/15 text-amber-400 border border-amber-400/20",
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    upcoming: {
      color: "bg-spink/15 text-spink border border-spink/20",
      icon: <Calendar className="w-3 h-3 mr-1" />,
    },
    past: {
      color: "bg-white/15 text-white/60 border border-white/20",
      icon: <CalendarDays className="w-3 h-3 mr-1" />,
    },
    completed: {
      color: "bg-spink/15 text-spink border border-spink/20",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 rounded-full ${config.color} text-xs flex items-center font-medium`}
    >
      {config.icon}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
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
      <div className="bg-navy/80 rounded-xl border border-spink/20 shadow-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/70 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-navy/60 hover:bg-navy/80 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-mred/80 hover:bg-mred transition-colors"
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
  const [appointmentsPerPage] = useState(6);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [isLoading2, setIsLoading2] = useState(false);
  const [serviceCache, setServiceCache] = useState<Record<string, Service>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
  }, [isLoading, isLoggedIn, user, refreshing]);

  // Function to refresh appointments
  const refreshAppointments = async () => {
    try {
      setRefreshing(true);
      console.log("Refreshing appointments data...");
      const userId = getUserIdFromToken();
      if (userId) {
        const ownerAppointments = await getOwnerAppointments(userId);
        setAppointments(Array.isArray(ownerAppointments) ? ownerAppointments : []);
      }
      toast.success("Appointments refreshed successfully");
    } catch (error) {
      console.error("Error refreshing appointments:", error);
      toast.error("Failed to refresh appointments");
    } finally {
      setRefreshing(false);
    }
  };

  // If still loading, show loading state
  if (isLoading || isLoadingAppointments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-spink border-t-transparent rounded-full"></div>
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

  // Helper function to determine appointment status
  function getAppointmentStatus(appointment: Appointment): string {
    const appointmentDate = new Date(appointment.datetime);
    // Add 4 hours to match the display time
    appointmentDate.setHours(appointmentDate.getHours() + 4);
    const now = new Date();
    
    // Simple status logic based on date
    if (appointmentDate < now) {
      return "completed";
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "confirmed";
    } else {
      return "pending";
    }
  }

  // Filter appointments based on search query, date filter, and status filter
  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const appointmentDate = new Date(appointment.datetime);
    appointmentDate.setHours(appointmentDate.getHours() + 4);
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
    let matchesDate = dateFilter === "all";
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    const weekFromNow = new Date(today);
    weekFromNow.setUTCDate(weekFromNow.getUTCDate() + 7);
    
    const monthFromNow = new Date(today);
    monthFromNow.setUTCMonth(monthFromNow.getUTCMonth() + 1);

    if (dateFilter === "today") {
      matchesDate = appointmentDate >= today && appointmentDate < tomorrow;
    } else if (dateFilter === "week") {
      matchesDate = appointmentDate >= today && appointmentDate < weekFromNow;
    } else if (dateFilter === "month") {
      matchesDate = appointmentDate >= today && appointmentDate < monthFromNow;
    } else if (dateFilter === "upcoming") {
      matchesDate = appointmentDate > today;
    }

    // Status filter
    let matchesStatus = statusFilter === "all";
    
    if (statusFilter === "upcoming") {
      matchesStatus = appointmentDate > new Date();
    } else if (statusFilter === "past") {
      matchesStatus = appointmentDate < new Date();
    } else if (statusFilter !== "all") {
      matchesStatus = getAppointmentStatus(appointment) === statusFilter;
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a: Appointment, b: Appointment) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    }
  );

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

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
            background: "rgba(0, 0, 48, 0.8)",
            color: "#fff",
            border: "1px solid rgba(255, 82, 181, 0.2)",
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
          <h1 className="text-2xl font-bold mb-1">Appointments</h1>
          <p className="text-white/70">Manage your scheduled appointments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshAppointments}
            disabled={refreshing}
            className="bg-navy/40 backdrop-blur-sm hover:bg-navy/60 border border-spink/20 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-all duration-300"
          >
            {refreshing ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by client or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy/40 border-spink/10 focus:border-spink/40 focus:ring-spink/30 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none bg-navy/40 border-spink/10 focus:border-spink/40 focus:ring-spink/30 rounded-lg py-2 pl-10 pr-9 text-sm focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-navy">All Statuses</option>
            <option value="upcoming" className="bg-navy">Upcoming</option>
            <option value="past" className="bg-navy">Past</option>
            <option value="pending" className="bg-navy">Pending</option>
            <option value="confirmed" className="bg-navy">Confirmed</option>
            <option value="completed" className="bg-navy">Completed</option>
            <option value="cancelled" className="bg-navy">Cancelled</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full appearance-none bg-navy/40 border-spink/10 focus:border-spink/40 focus:ring-spink/30 rounded-lg py-2 pl-10 pr-9 text-sm focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-navy">All Dates</option>
            <option value="today" className="bg-navy">Today</option>
            <option value="week" className="bg-navy">This Week</option>
            <option value="month" className="bg-navy">This Month</option>
            <option value="upcoming" className="bg-navy">Future</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      {paginatedAppointments.length === 0 ? (
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="w-12 h-12 text-spink/60" />
          </div>
          <h3 className="text-lg font-medium mb-2">No appointments found</h3>
          <p className="text-white/60 mb-4">
            {searchQuery || statusFilter !== "all" || dateFilter !== "all" 
              ? "Try adjusting your search filters for different results."
              : "You don't have any appointments scheduled yet."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={refreshAppointments}
              disabled={refreshing}
              className="bg-navy/60 hover:bg-navy/80 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedAppointments.map((appointment: Appointment) => (
            <div
              key={appointment.id}
              className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 hover:border-spink/20 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge status={getAppointmentStatus(appointment)} />
                  <span className="text-xs text-white/50">ID: #{appointment.id.substring(0, 6)}</span>
                </div>
                <h3 className="font-medium mb-1 text-lg">{getServiceName(appointment)}</h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatAppointmentDate(appointment.datetime)}</span>
                </div>
                {appointment.clients && appointment.clients.length > 0 && (
                  <div className="mt-2 py-1 px-3 bg-navy/60 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/90 font-medium">{appointment.clients[0].name}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 mt-auto flex justify-end gap-2 border-t border-white/5">
                <Link
                  href={`/dashboard/owner/appointments/${appointment.id}`}
                  className="px-3 py-1.5 rounded-lg bg-spink/10 hover:bg-spink/20 text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View Details
                </Link>
                
                <button
                  onClick={() => handleDeleteClick(appointment.id)}
                  className="px-3 py-1.5 rounded-lg bg-mred/10 hover:bg-mred/20 text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-navy/40 border border-spink/10 hover:bg-spink/10 hover:border-spink/20 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  currentPage === page
                    ? "bg-spink/20 text-spink border border-spink/30"
                    : "bg-navy/40 border border-spink/10 hover:bg-spink/10 text-white/70"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-navy/40 border border-spink/10 hover:bg-spink/10 hover:border-spink/20 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
      />
    </div>
  );
}
