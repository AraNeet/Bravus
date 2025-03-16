"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Search,
  ChevronDown,
  UserPlus,
  Phone,
  Mail,
  Clock,
  CalendarClock,
  Package,
  Star,
  Users,
  Filter,
  Check,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Pencil,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserWithAllData } from "@/app/api/users";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import type {
  User,
  Appointment,
  UserAppointment,
  Service,
} from "@/app/api/types";

// Interface for client information extracted from appointments
interface Client {
  id: string; // Generated unique ID for this client
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  appointmentCount: number;
  lastAppointment: Date;
  services: Service[];
  isVip: boolean; // VIP status (3+ appointments)
  notes: string;
}

// Client notes storage - simulate a database
const CLIENT_NOTES_KEY = "bravus_client_notes";

export default function ClientsPage() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  // State for client data and UI
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<
    "name" | "lastAppointment" | "appointmentCount"
  >("lastAppointment");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterByVip, setFilterByVip] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Client notes state
  const [noteClientId, setNoteClientId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});

  // Authentication check
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

  // Load client notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(CLIENT_NOTES_KEY);
    if (savedNotes) {
      try {
        setClientNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse client notes from localStorage");
      }
    }
  }, []);

  // Save notes to localStorage when they change
  useEffect(() => {
    if (Object.keys(clientNotes).length > 0) {
      localStorage.setItem(CLIENT_NOTES_KEY, JSON.stringify(clientNotes));
    }
  }, [clientNotes]);

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!isLoggedIn) return;

      try {
        setIsLoadingClients(true);
        setError(null);

        const userId = getUserIdFromToken();
        if (!userId) {
          throw new Error("User ID not found");
        }

        // Fetch complete user data including appointments
        const userData = await getUserWithAllData(userId);

        // Process appointments to extract unique clients
        const clientMap = new Map<string, Client>();

        if (userData.appointments && userData.appointments.length > 0) {
          // Process each appointment
          userData.appointments.forEach((appointment) => {
            const appointmentDate = new Date(appointment.datetime);
            const serviceId = appointment.service;
            const service = userData.services.find((s) => s.id === serviceId);

            // Process each user in the appointment
            appointment.Users.forEach((user) => {
              // Skip if this is the owner
              if (user.phone === userData.phone) return;

              // Create a unique ID for this client based on their name and phone
              const clientId =
                `${user.firstname}-${user.lastname}-${user.phone}`
                  .toLowerCase()
                  .replace(/\s+/g, "-");

              if (clientMap.has(clientId)) {
                // Update existing client
                const existingClient = clientMap.get(clientId)!;
                existingClient.appointmentCount += 1;

                // Update last appointment date if this one is more recent
                if (appointmentDate > existingClient.lastAppointment) {
                  existingClient.lastAppointment = appointmentDate;
                }

                // Add service if not already included
                if (
                  service &&
                  !existingClient.services.some((s) => s.id === service.id)
                ) {
                  existingClient.services.push(service);
                }

                // Update VIP status
                existingClient.isVip = existingClient.appointmentCount >= 3;
              } else {
                // Create new client
                clientMap.set(clientId, {
                  id: clientId,
                  firstName: user.firstname,
                  lastName: user.lastname,
                  phone: user.phone,
                  email: undefined,
                  appointmentCount: 1,
                  lastAppointment: appointmentDate,
                  services: service ? [service] : [],
                  isVip: false, // Will be updated once we have all appointments counted
                  notes: clientNotes[clientId] || "",
                });
              }
            });
          });
        }

        // Convert map to array and set state
        setClients(Array.from(clientMap.values()));
      } catch (error) {
        console.error("Error fetching client data:", error);
        setError("Failed to load client data. Please try again.");
      } finally {
        setIsLoadingClients(false);
      }
    };

    if (!isLoading && isLoggedIn) {
      fetchClientData();
    }
  }, [isLoading, isLoggedIn, clientNotes]);

  // Handle saving a note
  const handleSaveNote = () => {
    if (noteClientId && noteText.trim()) {
      setClientNotes((prev) => ({
        ...prev,
        [noteClientId]: noteText,
      }));

      // Update client in the list
      setClients((prev) =>
        prev.map((client) =>
          client.id === noteClientId ? { ...client, notes: noteText } : client
        )
      );

      // Reset note state
      setNoteClientId(null);
      setNoteText("");
    }
  };

  // Toggle sort direction or change sort field
  const handleSort = (
    field: "name" | "lastAppointment" | "appointmentCount"
  ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to descending when changing fields
    }
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          `${client.firstName} ${client.lastName}`
            .toLowerCase()
            .includes(query) ||
          client.phone.includes(query) ||
          (client.email && client.email.toLowerCase().includes(query))
      );
    }

    // Apply VIP filter
    if (filterByVip) {
      result = result.filter((client) => client.isVip);
    }

    // Apply service filter
    if (serviceFilter) {
      result = result.filter((client) =>
        client.services.some((service) => service.id === serviceFilter)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === "lastAppointment") {
        comparison = a.lastAppointment.getTime() - b.lastAppointment.getTime();
      } else if (sortField === "appointmentCount") {
        comparison = a.appointmentCount - b.appointmentCount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    clients,
    searchQuery,
    sortField,
    sortDirection,
    filterByVip,
    serviceFilter,
  ]);

  // Get services list for filter dropdown
  const uniqueServices = useMemo(() => {
    const serviceSet = new Set<Service>();
    clients.forEach((client) => {
      client.services.forEach((service) => {
        serviceSet.add(service);
      });
    });
    return Array.from(serviceSet);
  }, [clients]);

  // Pagination
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentClients = filteredClients.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Client Management</h1>
        <p className="text-white/70">View and manage your client information</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search clients by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
              onClick={() => handleSort(sortField)}
            >
              {sortField === "name" && "Sort by Name"}
              {sortField === "lastAppointment" && "Sort by Recent"}
              {sortField === "appointmentCount" && "Sort by Visits"}
              {sortDirection === "asc" ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[#1a0b2e] border border-white/10 rounded-lg shadow-lg z-10 w-48 overflow-hidden hidden group-focus:block">
              <button
                className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm flex items-center justify-between"
                onClick={() => handleSort("name")}
              >
                <span>Name</span>
                {sortField === "name" && (
                  <Check className="w-4 h-4 text-[#9f6eff]" />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm flex items-center justify-between"
                onClick={() => handleSort("lastAppointment")}
              >
                <span>Recent Appointment</span>
                {sortField === "lastAppointment" && (
                  <Check className="w-4 h-4 text-[#9f6eff]" />
                )}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm flex items-center justify-between"
                onClick={() => handleSort("appointmentCount")}
              >
                <span>Number of Visits</span>
                {sortField === "appointmentCount" && (
                  <Check className="w-4 h-4 text-[#9f6eff]" />
                )}
              </button>
            </div>
          </div>

          {/* Service Filter */}
          <div className="relative inline-block">
            <select
              value={serviceFilter || ""}
              onChange={(e) => setServiceFilter(e.target.value || null)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
            >
              <option value="">All Services</option>
              {uniqueServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service["service-name"]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* VIP Toggle */}
          <button
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              filterByVip
                ? "bg-[#9f6eff]/20 text-[#9f6eff] border border-[#9f6eff]/30"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
            }`}
            onClick={() => setFilterByVip(!filterByVip)}
          >
            <Star className="w-4 h-4" />
            <span>VIP Clients</span>
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden mb-6">
        {isLoadingClients ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#9f6eff] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">Loading client data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8a5de8] rounded-lg text-white transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : currentClients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/70 mb-2">
              {filteredClients.length === 0
                ? "No clients found. Schedule appointments to see clients here."
                : "No clients match your search criteria."}
            </p>
            {filteredClients.length > 0 && (
              <button
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setFilterByVip(false);
                  setServiceFilter(null);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table view for medium and larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/20 border-b border-white/10">
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      #
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      <button
                        className="flex items-center gap-1 hover:text-white"
                        onClick={() => handleSort("name")}
                      >
                        Client Name
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          ))}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      Contact Info
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      <button
                        className="flex items-center gap-1 hover:text-white"
                        onClick={() => handleSort("appointmentCount")}
                      >
                        Visits
                        {sortField === "appointmentCount" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          ))}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      <button
                        className="flex items-center gap-1 hover:text-white"
                        onClick={() => handleSort("lastAppointment")}
                      >
                        Last Visit
                        {sortField === "lastAppointment" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          ))}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-white/70 text-sm">
                      Services
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-white/70 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentClients.map((client, index) => (
                    <tr
                      key={client.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-4 text-white/70">
                        {firstItemIndex + index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center text-[#9f6eff]">
                            {client.firstName.charAt(0)}
                            {client.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {client.firstName} {client.lastName}
                              {client.isVip && (
                                <span className="bg-[#9f6eff]/20 text-[#9f6eff] px-1.5 py-0.5 rounded text-xs">
                                  VIP
                                </span>
                              )}
                            </div>
                            {client.notes && (
                              <div className="text-xs text-white/60 mt-1 italic truncate max-w-[200px]">
                                "{client.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Phone className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-white/70 mt-1">
                              <Mail className="w-4 h-4" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-white/60" />
                          <span className="font-medium">
                            {client.appointmentCount}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white/80">
                        {formatDate(client.lastAppointment)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {client.services.map((service) => (
                            <span
                              key={service.id}
                              className="inline-block px-2 py-1 bg-white/10 rounded-md text-xs"
                            >
                              {service["service-name"]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            onClick={() => {
                              setNoteClientId(client.id);
                              setNoteText(client.notes || "");
                            }}
                            title="Add/edit notes"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${client.phone}`}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Call client"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`sms:${client.phone}`}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Message client"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          {client.email && (
                            <a
                              href={`mailto:${client.email}`}
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Email client"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card view for mobile screens */}
            <div className="md:hidden">
              {currentClients.map((client, index) => (
                <div key={client.id} className="border-b border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center text-[#9f6eff]">
                        {client.firstName.charAt(0)}
                        {client.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {client.firstName} {client.lastName}
                          {client.isVip && (
                            <span className="bg-[#9f6eff]/20 text-[#9f6eff] px-1.5 py-0.5 rounded text-xs">
                              VIP
                            </span>
                          )}
                        </div>
                        {client.notes && (
                          <div className="text-xs text-white/60 italic truncate max-w-[200px]">
                            "{client.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-white/60">
                      #{firstItemIndex + index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-white/50 mb-1">Contact</div>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-white/50 mb-1">Visits</div>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <CalendarClock className="w-3 h-3" />
                        <span className="font-medium">
                          {client.appointmentCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(client.lastAppointment)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-white/50 mb-1">Services</div>
                    <div className="flex flex-wrap gap-1">
                      {client.services.map((service) => (
                        <span
                          key={service.id}
                          className="inline-block px-2 py-1 bg-white/10 rounded-md text-xs"
                        >
                          {service["service-name"]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                    <button
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => {
                        setNoteClientId(client.id);
                        setNoteText(client.notes || "");
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`sms:${client.phone}`}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {filteredClients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Showing {firstItemIndex + 1}-
            {Math.min(lastItemIndex, filteredClients.length)} of{" "}
            {filteredClients.length} clients
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNumber = currentPage;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentPage === pageNumber
                      ? "bg-[#9f6eff] text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {noteClientId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a0b2e] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Client Notes</h3>
              <button
                className="p-1 hover:bg-white/10 rounded-lg"
                onClick={() => {
                  setNoteClientId(null);
                  setNoteText("");
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 min-h-32 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50 mb-4"
              placeholder="Add notes about this client..."
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => {
                  setNoteClientId(null);
                  setNoteText("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8a5de8] rounded-lg text-white transition-colors"
                onClick={handleSaveNote}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
