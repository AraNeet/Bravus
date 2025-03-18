"use client";

import Link from "next/link";
import { Clock, ChevronRight, PlusCircle, Heart, User, Calendar, ChevronUp, Calendar as CalendarIcon, Activity, Users, Package } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useState, useEffect } from "react";
import { Client, Appointment } from "@/app/api/types";
import { getOwners } from "@/app/api";
import { getServices } from "@/app/api/services";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);
  const [animalsCount, setAnimalsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [providersCount, setProvidersCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Assert type as Client since we're in client dashboard
  const clientUser = user as Client;

  // Check for animals and appointments data when user changes
  useEffect(() => {
    if (user) {
      // Set loading to true when user changes
      setLoading(true);
      
      // Process animals data
      if (Array.isArray(clientUser?.animals)) {
        setAnimalsCount(clientUser.animals.length);
      } else if (Array.isArray((user as any)?.animals)) {
        setAnimalsCount((user as any).animals.length);
      } else {
        setAnimalsCount(0);
      }
      
      // Process appointments data
      if (Array.isArray(clientUser?.appointments)) {
        setAppointmentsCount(clientUser.appointments.length);
        
        // Filter upcoming appointments
        const now = new Date();
        const upcoming = clientUser.appointments
          .filter((appointment: Appointment) => {
            const appointmentDate = new Date(appointment.datetime);
            return appointmentDate > now;
          })
          .sort(
            (a: Appointment, b: Appointment) =>
              new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
          )
          .slice(0, 4);
          
        setUpcomingAppointments(upcoming);
      } else {
        setAppointmentsCount(0);
        setUpcomingAppointments([]);
      }
      
      // Set loading to false after data is processed
      setLoading(false);
    }
  }, [user, clientUser]);

  // Fetch providers and services data
  useEffect(() => {
    const fetchProvidersAndServices = async () => {
      try {
        // Fetch providers
        const ownersData = await getOwners();
        setProvidersCount(ownersData.length);
        
        // Fetch services directly from the new endpoint
        const services = await getServices();
        setServicesCount(services.length);
      } catch (error) {
        console.error("Error fetching providers and services:", error);
        // Set to 0 in case of error
        setProvidersCount(0);
        setServicesCount(0);
      }
    };
    
    fetchProvidersAndServices();
  }, []);

  // Helper function to get the user's name
  const getUserName = () => {
    if (user?.name && user.name !== "Client User") {
      return user.name;
    }

    // Try from localStorage as fallback
    const storedName = localStorage.getItem("name");
    if (storedName && storedName !== "Client User") {
      return storedName;
    }

    // Fallbacks for legacy data
    if ((user as any)?.firstname || (user as any)?.lastname) {
      return `${(user as any)?.firstname || ""} ${
        (user as any)?.lastname || ""
      }`.trim();
    }

    return "Client";
  };
  
  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get provider name from appointment
  const getProviderName = (appointment: Appointment) => {
    // Try different possible ways the owner/provider info might be stored
    if (appointment.owners && appointment.owners.length > 0) {
      return appointment.owners[0].name || "Unknown Provider";
    }
    
    if ((appointment as any).owner?.name) {
      return (appointment as any).owner.name;
    }
    
    return "Unknown Provider";
  };

  return (
    <>
      {/* Debug overlay - only shown when showDebug is true */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/70 z-50 p-4 overflow-auto">
          <div className="bg-navy border border-white/20 rounded-lg p-4 max-w-2xl mx-auto my-10 text-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Debug Information</h2>
              <button
                onClick={() => setShowDebug(false)}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-1">User Object:</h3>
                <pre className="bg-black/50 p-2 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-bold mb-1">Animals Count:</h3>
                <p className="bg-black/50 p-2 rounded">{animalsCount}</p>
              </div>
              <div>
                <h3 className="font-bold mb-1">LocalStorage:</h3>
                <ul className="bg-black/50 p-2 rounded">
                  <li>ID: {localStorage.getItem("ID") || "not set"}</li>
                  <li>name: {localStorage.getItem("name") || "not set"}</li>
                  <li>email: {localStorage.getItem("email") || "not set"}</li>
                  <li>
                    user_type: {localStorage.getItem("user_type") || "not set"}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-1">Returned Name:</h3>
                <p className="bg-black/50 p-2 rounded">{getUserName()}</p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Providers & Services:</h3>
                <ul className="bg-black/50 p-2 rounded">
                  <li>Total Providers: {providersCount}</li>
                  <li>Total Services: {servicesCount}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, <span className="text-spink">{getUserName()}</span>!
            </h1>
            <p className="text-white/70">Here's what's happening with your pet care</p>
          </div>
          <div>
            <Link
              href="/dashboard/client/appointments/book"
              className="inline-flex items-center gap-2 bg-spink hover:bg-mred text-navy font-medium py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-spink/10 hover:shadow-mred/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Active Appointments */}
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5 hover:border-spink/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Active Appointments</p>
              <h3 className="text-2xl font-bold">{appointmentsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-spink/10 flex items-center justify-center text-spink">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-green-400 mr-1">
              <ChevronUp className="w-3 h-3" />
              <span>12.5%</span>
            </span>
            <span className="text-white/60">from last month</span>
          </div>
        </div>
        
        {/* Registered Pets */}
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5 hover:border-spink/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Registered Pets</p>
              <h3 className="text-2xl font-bold">{animalsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-spink/10 flex items-center justify-center text-spink">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-white/60">
              <span>View details</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Total Providers */}
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5 hover:border-spink/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Total Providers</p>
              <h3 className="text-2xl font-bold">{providersCount || "-"}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-spink/10 flex items-center justify-center text-spink">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-white/60">
              <Link href="/dashboard/client/providers" className="flex items-center">
                <span>Browse providers</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </span>
          </div>
        </div>
        
        {/* Available Services */}
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5 hover:border-spink/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Available Services</p>
              <h3 className="text-2xl font-bold">{servicesCount || "-"}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-spink/10 flex items-center justify-center text-spink">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-white/60">
              <Link href="/dashboard/client/providers" className="flex items-center">
                <span>Browse services</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {/* Upcoming Appointments */}
      <div className="mt-6">
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-spink/5">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Upcoming Appointments</h2>
          <Link
              href="/dashboard/client/appointments"
              className="flex items-center text-xs text-spink hover:text-mred transition-colors"
          >
              <span>View all</span>
              <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-spink border-t-transparent rounded-full"></div>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Service</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Date & Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Provider</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((appointment: Appointment) => (
                    <tr key={appointment.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-sm">
                        {appointment.services && appointment.services.length > 0
                            ? appointment.services[0].service_name
                            : "Unknown Service"}
                        </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(appointment.datetime)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {getProviderName(appointment)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                            Confirmed
                          </span>
                        </td>
                      <td className="py-3 px-4 text-sm">
                            <Link
                              href={`/dashboard/client/appointments/${appointment.id}`}
                          className="text-spink hover:text-mred transition-colors"
                            >
                          View Details
                            </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4">
              <p className="text-white/70 mb-4">You don't have any upcoming appointments</p>
            <Link
              href="/dashboard/client/appointments/book"
                className="inline-flex items-center gap-2 bg-spink/20 hover:bg-spink/30 text-spink font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
                <span>Book Your First Appointment</span>
            </Link>
          </div>
        )}
          </div>
      </div>

      {/* Debug toggle button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 right-4 bg-spink/40 hover:bg-spink text-white p-1 rounded text-xs z-40"
      >
        Toggle Debug
      </button>
    </>
  );
}
