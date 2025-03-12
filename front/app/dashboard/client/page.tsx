"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Package,
  Clock,
  ChevronRight,
  PlusCircle,
  LogOut,
  Settings,
  Home,
  Heart,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function ClientDashboard() {
  const { user, authUser, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated or to owner dashboard if user is an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        const userData = user || authUser;
        if (userData && userData.owner) {
          router.push("/dashboard/owner");
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router]);

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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                  {userData.firstname.charAt(0)}
                  {userData.lastname.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium">
                    {userData.firstname} {userData.lastname}
                  </p>
                  <p className="text-sm text-white/60">
                    {userData.career || "Client"}
                  </p>
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
              href="/dashboard/client"
              className="flex items-center gap-3 p-3 bg-white/10 rounded-lg text-white"
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/client/appointments"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="hidden md:inline">My Appointments</span>
            </Link>
            <Link
              href="/dashboard/client/animals"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden md:inline">My Animals</span>
            </Link>
            <Link
              href="/dashboard/client/browse"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="hidden md:inline">Browse Services</span>
            </Link>
            <Link
              href="/dashboard/client/settings"
              className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome Section */}
          <section className="mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {userData.firstname}!
            </h1>
            <p className="text-white/70">
              Manage your appointments and animals
            </p>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#9f6eff]" />
                </div>
                <div>
                  <h2 className="font-medium">My Appointments</h2>
                  <p className="text-2xl font-bold">
                    {user?.appointments?.length || 0}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/client/appointments"
                className="flex items-center justify-between text-sm text-[#9f6eff] hover:underline"
              >
                <span>View all appointments</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#9f6eff]" />
                </div>
                <div>
                  <h2 className="font-medium">My Animals</h2>
                  <p className="text-2xl font-bold">
                    {user?.animals?.length || 0}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/client/animals"
                className="flex items-center justify-between text-sm text-[#9f6eff] hover:underline"
              >
                <span>View all animals</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Upcoming Appointments */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upcoming Appointments</h2>
              <Link
                href="/dashboard/client/appointments/book"
                className="flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-3 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>
            </div>

            {user?.appointments && user.appointments.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
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
                      {/* Filter upcoming appointments */}
                      {user.appointments
                        .filter((appointment) => {
                          const now = new Date();
                          const appointmentDate = new Date(
                            appointment.datetime
                          );
                          return appointmentDate > now;
                        })
                        .sort(
                          (a, b) =>
                            new Date(a.datetime).getTime() -
                            new Date(b.datetime).getTime()
                        )
                        .slice(0, 5)
                        .map((appointment) => (
                          <tr
                            key={appointment.ID}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(appointment.datetime).toLocaleString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* Find service name by ID */}
                              {user.services?.find(
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
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {/* If no upcoming appointments, show message */}
                      {user.appointments.filter((appointment) => {
                        const now = new Date();
                        const appointmentDate = new Date(appointment.datetime);
                        return appointmentDate > now;
                      }).length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-white/60"
                          >
                            No upcoming appointments
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
                  href="/dashboard/client/appointments/book"
                  className="inline-flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Book your first appointment</span>
                </Link>
              </div>
            )}
          </section>

          {/* My Animals */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Animals</h2>
              <Link
                href="/dashboard/client/animals/new"
                className="flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-3 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Animal</span>
              </Link>
            </div>

            {user?.animals && user.animals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.animals.map((animal) => (
                  <div
                    key={animal.ID}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
                  >
                    <h3 className="font-medium text-lg">
                      {animal["animal-name"]}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {animal["animal-race"]}
                    </p>
                    <p className="text-white/60 text-sm">
                      Age: {animal["animal-age"]} years
                    </p>
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/dashboard/client/animals/${animal.ID}`}
                        className="text-sm text-[#9f6eff] hover:text-[#8b4ff7]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
                <p className="text-white/60 mb-4">No animals added yet</p>
                <Link
                  href="/dashboard/client/animals/new"
                  className="inline-flex items-center gap-1 text-sm bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add your first animal</span>
                </Link>
              </div>
            )}
          </section>

          {/* Browse Services */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Available Services</h2>
              <Link
                href="/dashboard/client/browse"
                className="flex items-center gap-1 text-sm text-[#9f6eff] hover:text-[#8b4ff7]"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {user?.services && user.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.services.slice(0, 3).map((service) => (
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
                        href={`/dashboard/client/appointments/book?service=${service.id}`}
                        className="text-sm bg-[#9f6eff]/20 hover:bg-[#9f6eff]/30 px-3 py-1 rounded-lg text-[#9f6eff] transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
                <p className="text-white/60">
                  No services available at the moment
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
