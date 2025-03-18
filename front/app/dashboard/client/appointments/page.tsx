"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Filter,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  RefreshCcw,
  AlertCircle,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { Appointment, Service } from "@/app/api/types";
import { getCurrentClient } from "@/app/api";
import { toast } from "sonner";

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

export default function ClientAppointmentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const appointmentsPerPage = 6;

  // Update the refresh function to show a success message
  const refreshAppointments = async () => {
    try {
      setRefreshing(true);
      console.log("Refreshing appointments data...");
      // This will trigger a re-render with updated appointment data
      await getCurrentClient();
      toast.success("Appointments refreshed successfully");
    } catch (error) {
      console.error("Error refreshing appointments:", error);
      toast.error("Failed to refresh appointments");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments.filter((appointment) => {
    // Search filter - check if service name matches search query
    const serviceName = getServiceName(appointment);
    const searchMatch = searchQuery === "" || 
      serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let statusMatch = statusFilter === "all";
    if (statusFilter === "upcoming") {
      statusMatch = new Date(appointment.datetime) > new Date();
    } else if (statusFilter === "past") {
      statusMatch = new Date(appointment.datetime) < new Date();
    } else if (statusFilter !== "all") {
      statusMatch = getAppointmentStatus(appointment) === statusFilter;
    }

    // Date filter
    let dateMatch = dateFilter === "all";
    const appointmentDate = new Date(appointment.datetime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    if (dateFilter === "today") {
      dateMatch = appointmentDate >= today && appointmentDate < tomorrow;
    } else if (dateFilter === "week") {
      dateMatch = appointmentDate >= today && appointmentDate < weekFromNow;
    } else if (dateFilter === "month") {
      dateMatch = appointmentDate >= today && appointmentDate < monthFromNow;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  // Helper function to determine appointment status
  function getAppointmentStatus(appointment: Appointment): string {
    const appointmentDate = new Date(appointment.datetime);
    const now = new Date();
    
    // Simple status logic based on date
    if (appointmentDate > now) {
      return "upcoming";
    } else {
      return "past";
    }
    
    // TODO: In the future, this could be expanded to include "cancelled", "completed", etc.
    // if there's a status field in the appointment data
  }

  // Helper function to find service by ID - update to handle the new service structure
  function getServiceName(appointment: Appointment): string {
    if (appointment.services && appointment.services.length > 0) {
      // New structure: appointment has services array
      return appointment.services[0].service_name || "Unknown Service";
    }
    
    // Fallback for old structure or missing data
    return "Unknown Service";
  }

  // Format date to a friendly string
  function formatAppointmentDate(datetime: string): string {
    const date = new Date(datetime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date >= today && date < tomorrow;
    const isTomorrow = date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
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
        day: "numeric"
      });
    }
    
    return `${dateString} at ${date.toLocaleTimeString([], options)}`;
  }

  // Add dependency on refreshing state
  useEffect(() => {
    if (user) {
      console.log("User data in appointments page:", user);
      // Extract appointments from user data, if available
      setAppointments(
        user.appointments || []
      );
    }
  }, [user, refreshing]); // Add refreshing to the dependency array

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/client"
              className="text-white/70 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-1">My Appointments</h1>
          <p className="text-white/70">
            Manage your upcoming and past appointments
          </p>
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

          <Link
            href="/dashboard/client/appointments/book"
            className="bg-spink hover:bg-mred text-navy font-medium transition-all duration-300 shadow-lg shadow-spink/10 hover:shadow-mred/20 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            Book New
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by service..."
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
            <option value="past" className="bg-navy">Past</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calendar className="w-12 h-12 text-spink/60" />
          </div>
          <h3 className="text-lg font-medium mb-2">No appointments found</h3>
          <p className="text-white/60 mb-4">
            {searchQuery || statusFilter !== "all" || dateFilter !== "all" 
              ? "Try adjusting your search filters for different results."
              : "You don't have any appointments yet. Schedule one now!"}
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
            <Link
              href="/dashboard/client/appointments/book"
              className="bg-spink hover:bg-mred text-navy font-medium transition-colors px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedAppointments.map((appointment) => (
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
              </div>
              
              <div className="p-4 mt-auto flex justify-end gap-2 border-t border-white/5">
                <Link
                  href={`/dashboard/client/appointments/${appointment.id}`}
                  className="px-3 py-1.5 rounded-lg bg-spink/10 hover:bg-spink/20 text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View Details
                </Link>
                
                {getAppointmentStatus(appointment) === "upcoming" && (
                  <button
                    className="px-3 py-1.5 rounded-lg bg-mred/10 hover:bg-mred/20 text-white text-sm font-medium transition-colors flex items-center gap-1"
                    onClick={() => {
                      // Handle cancellation logic here
                      alert(`Cancel appointment ${appointment.id}`);
                    }}
                  >
                    Cancel
                  </button>
                )}
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
    </div>
  );
}
