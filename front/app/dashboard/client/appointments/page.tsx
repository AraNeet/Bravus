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
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { Appointment, Service } from "@/app/api/types";
import { getCurrentClient } from "@/app/api";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    confirmed: {
      color: "bg-green-500/20 text-green-400",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    cancelled: {
      color: "bg-red-500/20 text-red-400",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
    pending: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 rounded-full ${config.color} text-xs flex items-center`}
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
  const [showToast, setShowToast] = useState(false);
  const appointmentsPerPage = 10;

  // Update the refresh function to show a success message
  const refreshAppointments = async () => {
    try {
      setRefreshing(true);
      console.log("Refreshing appointments data...");
      // This will trigger a re-render with updated appointment data
      await getCurrentClient();
      // Show success message
      setShowToast(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error refreshing appointments:", error);
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
  const paginatedAppointments = filteredAppointments.slice(
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
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
          Appointments refreshed successfully!
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/dashboard/client"
          className="text-white/70 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Appointments</h1>
          <p className="text-white/70">
            Manage your upcoming and past appointments
          </p>
        </div>
        
        <button
          onClick={refreshAppointments}
          disabled={refreshing}
          className="bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Refresh Appointments
            </>
          )}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 flex-1"
          >
            <option value="all" className="bg-[#1a0b2e]">
              All Statuses
            </option>
            <option value="pending" className="bg-[#1a0b2e]">
              Pending
            </option>
            <option value="confirmed" className="bg-[#1a0b2e]">
              Confirmed
            </option>
            <option value="completed" className="bg-[#1a0b2e]">
              Completed
            </option>
            <option value="cancelled" className="bg-[#1a0b2e]">
              Cancelled
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/60" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 flex-1"
          >
            <option value="all" className="bg-[#1a0b2e]">
              All Dates
            </option>
            <option value="today" className="bg-[#1a0b2e]">
              Today
            </option>
            <option value="week" className="bg-[#1a0b2e]">
              This Week
            </option>
            <option value="month" className="bg-[#1a0b2e]">
              This Month
            </option>
            <option value="upcoming" className="bg-[#1a0b2e]">
              Upcoming
            </option>
            <option value="past" className="bg-[#1a0b2e]">
              Past
            </option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No appointments found</div>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all" || dateFilter !== "all" 
              ? "Try clearing your filters or refreshing the page."
              : "You don't have any appointments yet. Book one now!"}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={refreshAppointments}
              disabled={refreshing}
              className="bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
            <Link
              href="/dashboard/client/appointments/book"
              className="bg-[#4f46e5] hover:bg-[#4338ca] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date & Time
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
                {paginatedAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(appointment.datetime).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getServiceName(appointment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={getAppointmentStatus(appointment)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/client/appointments/${appointment.id}`}
                          className="text-[#9f6eff] hover:text-[#8b4ff7] transition-colors"
                        >
                          View
                        </Link>
                        {getAppointmentStatus(appointment) === "pending" && (
                          <>
                            <Link
                              href={`/dashboard/client/appointments/${appointment.id}/edit`}
                              className="text-[#9f6eff] hover:text-[#8b4ff7] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              className="text-red-400 hover:text-red-300 transition-colors"
                              onClick={() => {
                                // Handle cancellation logic here
                                alert(`Cancel appointment ${appointment.id}`);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  currentPage === page
                    ? "bg-[#9f6eff] text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/70"
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
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
