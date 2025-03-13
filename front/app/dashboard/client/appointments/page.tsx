"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Filter, Search, PlusCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { Appointment } from "@/app/api/types";
import AppointmentList from "@/app/components/appointments/appointment-list";
import EmptyState from "@/app/components/ui/empty-state";
import Pagination from "@/app/components/ui/pagination";

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
  const filteredAppointments = filterAppointments(appointments, {
    searchQuery,
    statusFilter,
    dateFilter,
    user,
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

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-white/70">
          View and manage all your scheduled appointments
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <StatusFilter
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <DateFilter dateFilter={dateFilter} setDateFilter={setDateFilter} />
      </div>

      {/* Appointments List */}
      {currentAppointments.length > 0 ? (
        <AppointmentList appointments={currentAppointments} user={user} />
      ) : (
        <EmptyState
          icon={<Clock className="w-12 h-12 text-[#9f6eff]/50 mx-auto mb-4" />}
          title="No appointments found"
          description={
            searchQuery || statusFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your filters to see more results."
              : "You don't have any appointments scheduled yet."
          }
          action={
            <Link
              href="/dashboard/client/appointments/book"
              className="inline-flex items-center gap-1 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Book Appointment
            </Link>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

interface FilterOptions {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  user: any;
}

// Helper function to filter appointments
function filterAppointments(
  appointments: Appointment[],
  options: FilterOptions
) {
  const { searchQuery, statusFilter, dateFilter, user } = options;

  return appointments.filter((appointment) => {
    // Search filter - check if service name matches search query
    const serviceMatch = user?.services
      ?.find(
        (s: { id: string | number; "service-name": string }) =>
          s.id === appointment.service
      )
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
}

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
  } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return "confirmed";
  } else {
    return "pending";
  }
}

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function SearchInput({ searchQuery, setSearchQuery }: SearchInputProps) {
  return (
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
  );
}

interface StatusFilterProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

function StatusFilter({ statusFilter, setStatusFilter }: StatusFilterProps) {
  return (
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
  );
}

interface DateFilterProps {
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}

function DateFilter({ dateFilter, setDateFilter }: DateFilterProps) {
  return (
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
  );
}
