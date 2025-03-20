"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Users, Package, ChevronRight, PlusCircle, Calendar, BarChart3 } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserServices } from "@/app/api/services";
import { getOwnerAppointments } from "@/app/api/appointments";
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

// Client-side only component for displaying time
function FormattedTime({ dateString }: { dateString: string }) {
  const [formattedTime, setFormattedTime] = useState<string>("");
  
  useEffect(() => {
    // Only run on client side
    const appointmentTime = new Date(dateString);
    // Add 4 hours to the appointment time
    appointmentTime.setHours(appointmentTime.getHours() + 4);
    setFormattedTime(appointmentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, [dateString]);
  
  return <span>{formattedTime}</span>;
}

export default function OwnerDashboard() {
  const { user, authUser, isLoading, isLoggedIn, userType } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated or to client dashboard if not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else {
        const userData = user || authUser;
        if (userType !== "owner") {
          console.log("Redirecting to client dashboard, userType:", userType);
          router.push("/dashboard/client");
        } else {
          console.log("User is an owner, staying on owner dashboard");
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router, userType]);

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

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isLoggedIn) return;

      try {
        setIsLoadingAppointments(true);
        const userId = getUserIdFromToken();
        if (userId) {
          console.log("Fetching appointments for dashboard with userId:", userId);
          const ownerAppointments = await getOwnerAppointments(userId);
          console.log("Dashboard appointments:", ownerAppointments);
          setAppointments(Array.isArray(ownerAppointments) ? ownerAppointments : []);
        }
      } catch (error) {
        console.error("Error fetching appointments for dashboard:", error);
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

  // Loading state is already handled by the parent layout
  // Get user data from either full profile or auth response
  const userData = user || authUser;

  // Filter today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.datetime);
    return appointmentDate >= today && appointmentDate < tomorrow;
  });

  // Extract first name if available
  const firstName = userData && typeof userData === 'object' && 'firstname' in userData 
    ? String(userData.firstname) 
    : userData && typeof userData === 'object' && 'name' in userData 
      ? String(userData.name).split(' ')[0] 
      : "Business Owner";
  
  // Prevent any rendering until client-side hydration is complete
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-3 border-spink border-t-transparent rounded-full mx-auto"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="flex justify-between items-center bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-xl font-bold text-spink">{firstName}!</p>
        </div>
        <div className="hidden md:block">
          <img src="/images/dashboard-illustration.svg" alt="Dashboard" className="h-24 w-auto" onError={(e) => {e.currentTarget.style.display = 'none'}} />
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 hover:shadow-lg hover:shadow-spink/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-spink/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-spink" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Active Appointments</p>
              <h2 className="text-3xl font-bold">{appointments.length || 0}</h2>
              <p className="text-xs text-white/50 mt-1">
                {todaysAppointments.length} today
              </p>
            </div>
          </div>
        </div>

        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 hover:shadow-lg hover:shadow-spink/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-mred/20 flex items-center justify-center">
              <Package className="w-7 h-7 text-mred" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Services</p>
              <h2 className="text-3xl font-bold">{services.length || 0}</h2>
              <p className="text-xs text-white/50 mt-1">
                Active offerings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-spink" />
            <h2 className="text-xl font-bold">Today's Appointments</h2>
          </div>
          <Link
            href="/dashboard/owner/appointments"
            className="text-sm text-spink hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingAppointments ? (
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-spink border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading appointments...</p>
          </div>
        ) : todaysAppointments.length > 0 ? (
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 overflow-hidden">
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {todaysAppointments.map((appointment) => {
                    const clientName = appointment.clients && appointment.clients.length > 0 
                      ? appointment.clients[0].name 
                      : "Unknown Client";
                    const serviceName = appointment.services && appointment.services.length > 0
                      ? appointment.services[0].service_name
                      : "Unknown Service";
                    
                    return (
                      <tr key={appointment.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormattedTime dateString={appointment.datetime} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {serviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/dashboard/owner/appointments/${appointment.id}`}
                            className="text-spink hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 text-center">
            <p>No appointments scheduled for today.</p>
          </div>
        )}
      </section>

      {/* Services List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-mred" />
            <h2 className="text-xl font-bold">Your Services</h2>
          </div>
          <Link
            href="/dashboard/owner/services/new"
            className="flex items-center gap-1 text-sm bg-gradient-to-r from-spink to-mred hover:from-spink/90 hover:to-mred/90 px-3 py-2 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Service</span>
          </Link>
        </div>

        {isLoadingServices ? (
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 flex justify-center items-center">
            <div className="animate-spin w-8 h-8 border-3 border-spink border-t-transparent rounded-full"></div>
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
                  className="bg-gradient-to-br from-navy/40 to-navy/30 backdrop-blur-sm rounded-xl border border-spink/10 p-6 hover:shadow-lg hover:shadow-spink/5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-white truncate">
                      {serviceName}
                    </h3>
                    <div className="px-3 py-1 bg-spink/20 rounded-full text-spink text-xs font-medium">
                      Active
                    </div>
                  </div>

                  <div className="mb-3 text-2xl font-bold bg-gradient-to-r from-spink to-mred bg-clip-text text-transparent">
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
                    href={`/dashboard/owner/services/${service.id}`}
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
          <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 text-center">
            <p className="text-white/60 mb-4">No services available yet</p>
            <Link
              href="/dashboard/owner/services/new"
              className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-spink to-mred hover:from-spink/90 hover:to-mred/90 px-4 py-2 rounded-lg transition-colors"
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
