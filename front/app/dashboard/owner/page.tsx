"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Package,
  Clock,
  ChevronRight,
  PlusCircle,
  LogOut,
  BarChart,
  Settings,
  Search,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserServices } from "@/app/api/services";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import type { Service } from "@/app/api/types";

export default function OwnerDashboard() {
  const { user, authUser, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Redirect to login if not authenticated or to client dashboard if not an owner
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
  
  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      if (!isLoggedIn) return;
      
      try {
        setIsLoadingServices(true);
        const userId = getUserIdFromToken();
        if (userId) {
          console.log("Fetching services for dashboard with userId:", userId);
          const userServices = await getUserServices(userId);
          console.log("Dashboard services:", userServices);
          setServices(Array.isArray(userServices) ? userServices : []);
        }
      } catch (error) {
        console.error("Error fetching services for dashboard:", error);
        // Fallback to user.services if available
        if (user?.services && Array.isArray(user.services)) {
          setServices(user.services);
        }
      } finally {
        setIsLoadingServices(false);
      }
    };
    
    if (!isLoading && isLoggedIn) {
      fetchServices();
    }
  }, [isLoading, isLoggedIn, user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Bravus
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search appointments, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                  {userData.firstname.charAt(0)}
                  {userData.lastname.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">
                    {userData.firstname} {userData.lastname}
                  </p>
                  <p className="text-sm text-white/60">Business Owner</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-black/10 border-r border-white/10 p-4 hidden md:block">
          <nav className="space-y-2">
            <Link
              href="/dashboard/owner"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg text-white"
            >
              <BarChart className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/owner/appointments"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="hidden md:inline">Appointments</span>
            </Link>
            <Link
              href="/dashboard/owner/service"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="hidden md:inline">Service</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome Section */}
          <section className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
            <p className="text-white/70">
              Manage your appointments, clients, and services
            </p>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#9f6eff]" />
                </div>
                <div>
                  <h2 className="font-medium">Appointments</h2>
                  <p className="text-2xl font-bold">
                    {user?.appointments?.length || 0}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/owner/appointments"
                className="flex items-center justify-between text-sm text-[#9f6eff] hover:underline"
              >
                <span>View all appointments</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#9f6eff]" />
                </div>
                <div>
                  <h2 className="font-medium">Clients</h2>
                  <p className="text-2xl font-bold">
                    {/* Calculate unique clients from appointments */}
                    {user?.appointments
                      ? new Set(
                          user.appointments.flatMap((a) =>
                            a.Users.map((u) => u.firstname + u.lastname)
                          )
                        ).size
                      : 0}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/owner/clients"
                className="flex items-center justify-between text-sm text-[#9f6eff] hover:underline"
              >
                <span>View all clients</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#9f6eff]" />
                </div>
                <div>
                  <h2 className="font-medium">Services</h2>
                  <p className="text-2xl font-bold">
                    {services.length || 0}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/owner/service"
                className="flex items-center justify-between text-sm text-[#9f6eff] hover:underline"
              >
                <span>View all services</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Today's Appointments */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Today's Appointments</h2>
              <Link
                href="/dashboard/owner/appointments/new"
                className="flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-3 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Appointment</span>
              </Link>
            </div>

            {user?.appointments && user.appointments.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                          Time
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
                      {/* Filter today's appointments */}
                      {user.appointments
                        .filter((appointment) => {
                          const today = new Date();
                          const appointmentDate = new Date(
                            appointment.datetime
                          );
                          return (
                            appointmentDate.getDate() === today.getDate() &&
                            appointmentDate.getMonth() === today.getMonth() &&
                            appointmentDate.getFullYear() ===
                              today.getFullYear()
                          );
                        })
                        .map((appointment) => (
                          <tr
                            key={appointment.ID}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(
                                appointment.datetime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {appointment.Users.map(
                                (u) => `${u.firstname} ${u.lastname}`
                              ).join(", ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* Find service name by ID */}
                              {services?.find(
                                (s) => s.id === appointment.service
                              )?.["service-name"] || appointment.service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                Confirmed
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <button className="text-[#9f6eff] hover:text-[#8b4ff7]">
                                  View
                                </button>
                                <button className="text-[#9f6eff] hover:text-[#8b4ff7]">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {/* If no appointments today, show message */}
                      {user.appointments.filter((appointment) => {
                        const today = new Date();
                        const appointmentDate = new Date(appointment.datetime);
                        return (
                          appointmentDate.getDate() === today.getDate() &&
                          appointmentDate.getMonth() === today.getMonth() &&
                          appointmentDate.getFullYear() === today.getFullYear()
                        );
                      }).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-white/60"
                          >
                            No appointments scheduled for today
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
                <p className="text-white/60 mb-4">
                  No appointments scheduled yet
                </p>
                <Link
                  href="/dashboard/owner/appointments/new"
                  className="inline-flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create your first appointment</span>
                </Link>
              </div>
            )}
          </section>

          {/* Services List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Services</h2>
              <Link
                href="/dashboard/owner/service/new"
                className="flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-3 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Service</span>
              </Link>
            </div>

            {isLoadingServices ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 flex justify-center items-center">
                <div className="animate-spin w-8 h-8 border-3 border-[#9f6eff] border-t-transparent rounded-full"></div>
                <span className="ml-3 text-white/70">Loading services...</span>
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
                  >
                    <h3 className="font-medium text-lg">
                      {service["service-name"]}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">
                      {service["service-desc"]}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-[#9f6eff] font-medium">
                        ${service.price.toFixed(2)}
                      </p>
                      <Link
                        href={`/dashboard/owner/service/${service.id}`}
                        className="text-sm text-white/60 hover:text-white"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
                <p className="text-white/60 mb-4">No services available yet</p>
                <Link
                  href="/dashboard/owner/service/new"
                  className="inline-flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add your first service</span>
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
