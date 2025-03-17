"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Users, Package, ChevronRight, PlusCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserServices } from "@/app/api/services";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";
import type { Service, Appointment } from "@/app/api/types";

// Define extended types for the application-specific data structure
interface UserInfo {
  firstname: string;
  lastname: string;
  phone?: string;
  email?: string;
}

interface AppointmentWithUsers extends Omit<Appointment, "id"> {
  ID: string;
  id?: string;
  Users: UserInfo[];
  service?: string;
}

interface ExtendedOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  owner: boolean;
  services: Service[];
  appointments: AppointmentWithUsers[];
}

export default function OwnerDashboard() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Redirect to login if not authenticated or to client dashboard if not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        const userData = user || authUser;
        if (userData && !(userData as any).owner) {
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
        if (
          user &&
          (user as any).services &&
          Array.isArray((user as any).services)
        ) {
          setServices((user as any).services);
        }
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (!isLoading && isLoggedIn) {
      fetchServices();
    }
  }, [isLoading, isLoggedIn, user]);

  // Loading state is already handled by the parent layout
  // Get user data from either full profile or auth response
  const userData = user || authUser;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
        <p className="text-white/70">
          Manage your appointments, clients, and services
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-2xl font-bold">{services.length || 0}</p>
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
      <section className="mb-8">
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
                  {(user.appointments as AppointmentWithUsers[])
                    .filter((appointment) => {
                      const today = new Date();
                      const appointmentDate = new Date(appointment.datetime);
                      return (
                        appointmentDate.getDate() === today.getDate() &&
                        appointmentDate.getMonth() === today.getMonth() &&
                        appointmentDate.getFullYear() === today.getFullYear()
                      );
                    })
                    .map((appointment) => (
                      <tr
                        key={appointment.ID || appointment.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(appointment.datetime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(() => {
                            // Handle different appointment data structures
                            if (
                              (appointment as any).Users &&
                              Array.isArray((appointment as any).Users)
                            ) {
                              return (appointment as any).Users.map(
                                (u: any) => `${u.firstname} ${u.lastname}`
                              ).join(", ");
                            }

                            // Try to use the clients array if available
                            if (
                              appointment.clients &&
                              appointment.clients.length > 0
                            ) {
                              return appointment.clients
                                .map((client) => client.name)
                                .join(", ");
                            }

                            return "No clients";
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {/* Find service by ID or use service info from the appointment */}
                          {(() => {
                            // Try to find service in the owner's services list
                            const serviceId =
                              (appointment as any).service ||
                              (appointment.services &&
                              appointment.services.length > 0
                                ? appointment.services[0].id
                                : null);

                            if (serviceId) {
                              const service = services?.find(
                                (s) => s.id === serviceId
                              );
                              if (service) {
                                return service.service_name;
                              }
                            }

                            // If service is included in the appointment
                            if (
                              appointment.services &&
                              appointment.services.length > 0
                            ) {
                              return appointment.services[0].service_name;
                            }

                            return "Unknown Service";
                          })()}
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
                  {!(user.appointments as AppointmentWithUsers[]).some(
                    (appointment) => {
                      const today = new Date();
                      const appointmentDate = new Date(appointment.datetime);
                      return (
                        appointmentDate.getDate() === today.getDate() &&
                        appointmentDate.getMonth() === today.getMonth() &&
                        appointmentDate.getFullYear() === today.getFullYear()
                      );
                    }
                  ) && (
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
            <p className="text-white/60 mb-4">No appointments scheduled yet</p>
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
            className="flex items-center gap-1 text-sm bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] px-3 py-2 rounded-lg transition-colors"
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
            {services.map((service) => {
              // Handle different service data formats
              const serviceName =
                service.service_name ||
                (service as any)["service-name"] ||
                "Unnamed Service";
              const serviceDesc =
                service.service_desc ||
                (service as any)["service-desc"] ||
                "No description";
              const price =
                typeof service.price === "number"
                  ? service.price.toFixed(2)
                  : parseFloat(String(service.price || 0)).toFixed(2);
              const duration = service.duration || 60;

              return (
                <div
                  key={service.id}
                  className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-[#9f6eff]/20 p-6 hover:shadow-lg hover:shadow-[#9f6eff]/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-white truncate">
                      {serviceName}
                    </h3>
                    <div className="px-3 py-1 bg-[#9f6eff]/20 rounded-full text-[#c061f7] text-xs font-medium">
                      Active
                    </div>
                  </div>

                  <div className="mb-3 text-2xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] bg-clip-text text-transparent">
                    ${price}
                  </div>

                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {serviceDesc}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-white/60 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{duration} minutes</span>
                  </div>

                  <Link
                    href={`/dashboard/owner/service/${service.id}`}
                    className="flex items-center justify-center gap-1 w-full text-sm bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors"
                  >
                    <span>Manage Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
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
    </div>
  );
}
