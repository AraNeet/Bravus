"use client";

import Link from "next/link";
import { Clock, ChevronRight, PlusCircle, Heart } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import { Client, Appointment } from "@/app/api/types";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  // Assert type as Client since we're in client dashboard
  const clientUser = user as Client;

  console.log("Client Dashboard - User Data:", user);

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

  return (
    <>
      {/* Debug overlay - only shown when showDebug is true */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/70 z-50 p-4 overflow-auto">
          <div className="bg-[#1a0b2e] border border-white/20 rounded-lg p-4 max-w-2xl mx-auto my-10 text-xs">
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
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome, {getUserName()}!</h1>
        <p className="text-white/70">Manage your appointments and animals</p>
      </section>

      {/* Debug toggle button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-20 right-4 bg-[#9f6eff]/40 hover:bg-[#9f6eff] text-white p-1 rounded text-xs z-40"
      >
        Toggle Debug
      </button>

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
                {clientUser?.appointments?.length || 0}
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
                {clientUser?.animals?.length || 0}
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

        {clientUser?.appointments && clientUser.appointments.length > 0 ? (
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
                  {clientUser.appointments
                    .filter((appointment: Appointment) => {
                      const now = new Date();
                      const appointmentDate = new Date(appointment.datetime);
                      return appointmentDate > now;
                    })
                    .sort(
                      (a: Appointment, b: Appointment) =>
                        new Date(a.datetime).getTime() -
                        new Date(b.datetime).getTime()
                    )
                    .slice(0, 5)
                    .map((appointment: Appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(appointment.datetime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {/* Use the first service in the services array */}
                          {appointment.services &&
                          appointment.services.length > 0
                            ? appointment.services[0].service_name
                            : "Unknown Service"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                            Confirmed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/client/appointments/${appointment.id}`}
                              className="text-[#9f6eff] hover:text-[#8b4ff7]"
                            >
                              View
                            </Link>
                            <button
                              className="text-[#9f6eff] hover:text-[#8b4ff7]"
                              onClick={() => {
                                // Handle cancellation logic here
                                alert(`Cancel appointment ${appointment.id}`);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* If no upcoming appointments, show message */}
                  {clientUser.appointments.filter((appointment) => {
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
            <p className="text-white/60 mb-4">No appointments scheduled yet</p>
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
    </>
  );
}
