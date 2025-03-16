"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { Appointment } from "@/app/api/types";

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
  const appointmentsPerPage = 10;

  // Get appointments from user data
  const appointments = user?.appointments || [];

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments.filter((appointment) => {
    // Search filter - check if service name matches search query
    const serviceMatch = user?.services
      ?.find((s) => s.id === appointment.service)
      ?.["service-name"]?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const searchMatch = searchQuery === "" || serviceMatch;

    // Status filter
    const statusMatch =
      statusFilter === "all" ||
      getAppointmentStatus(appointment) === statusFilter;

    // Date filter
    const appointmentDate = new Date(appointment.datetime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    let dateMatch = true;
    if (dateFilter === "today") {
      dateMatch = appointmentDate >= today && appointmentDate < tomorrow;
    } else if (dateFilter === "upcoming") {
      dateMatch = appointmentDate >= today;
    } else if (dateFilter === "past") {
      dateMatch = appointmentDate < today;
    } else if (dateFilter === "week") {
      dateMatch = appointmentDate >= today && appointmentDate < nextWeek;
    } else if (dateFilter === "month") {
      dateMatch = appointmentDate >= today && appointmentDate < nextMonth;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = sortedAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  // Helper function to determine appointment status
  function getAppointmentStatus(appointment: Appointment): string {
    // This is a placeholder - in a real app, you'd use the actual status from the API
    // For now, we'll determine status based on date
    const appointmentDate = new Date(appointment.datetime);
    const now = new Date();

    // If appointment has a status property, use that
    if ((appointment as any).status) {
      return (appointment as any).status;
    }

    // Otherwise determine based on date
    if (appointmentDate < now) {
      return "completed";
    } else if (
      appointmentDate.getTime() - now.getTime() <
      24 * 60 * 60 * 1000
    ) {
      return "confirmed";
    } else {
      return "pending";
    }
  }

  // Helper function to find service by ID
  function getServiceName(serviceId: string): string {
    return (
      user?.services?.find((s) => s.id === serviceId)?.["service-name"] ||
      "Unknown Service"
    );
  }

  return (
    <div className="space-y-6">
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
      {currentAppointments.length > 0 ? (
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
                {currentAppointments.map((appointment) => (
                  <tr
                    key={appointment.ID}
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
                      {getServiceName(appointment.service)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={getAppointmentStatus(appointment)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/client/appointments/${appointment.ID}`}
                          className="text-[#9f6eff] hover:text-[#8b4ff7] transition-colors"
                        >
                          View
                        </Link>
                        {getAppointmentStatus(appointment) === "pending" && (
                          <>
                            <Link
                              href={`/dashboard/client/appointments/${appointment.ID}/edit`}
                              className="text-[#9f6eff] hover:text-[#8b4ff7] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              className="text-red-400 hover:text-red-300 transition-colors"
                              onClick={() => {
                                // Handle cancellation logic here
                                alert(`Cancel appointment ${appointment.ID}`);
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
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center mb-6">
          <Clock className="w-12 h-12 text-[#9f6eff]/50 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No appointments found</h3>
          <p className="text-white/60 mb-6">
            {searchQuery || statusFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your filters to see more results."
              : "You don't have any appointments scheduled yet."}
          </p>
          <Link
            href="/dashboard/client/appointments/book"
            className="inline-flex items-center gap-1 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Book Appointment
          </Link>
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
