"use client"

import Link from "next/link"
import { Clock, ChevronRight, PlusCircle, Heart } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"

export default function ClientDashboard() {
  const { user } = useAuth()

  return (
    <>
      {/* Welcome Section */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstname || "Client"}!</h1>
        <p className="text-white/70">Manage your appointments and animals</p>
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
              <p className="text-2xl font-bold">{user?.appointments?.length || 0}</p>
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
              <p className="text-2xl font-bold">{user?.animals?.length || 0}</p>
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
                      const now = new Date()
                      const appointmentDate = new Date(appointment.datetime)
                      return appointmentDate > now
                    })
                    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                    .slice(0, 5)
                    .map((appointment) => (
                      <tr key={appointment.ID} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(appointment.datetime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {/* Find service name by ID */}
                          {user.services?.find((s) => s.id === appointment.service)?.["service-name"] ||
                            appointment.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                            Confirmed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/client/appointments/${appointment.ID}`}
                              className="text-[#9f6eff] hover:text-[#8b4ff7]"
                            >
                              View
                            </Link>
                            <button
                              className="text-[#9f6eff] hover:text-[#8b4ff7]"
                              onClick={() => {
                                // Handle cancellation logic here
                                alert(`Cancel appointment ${appointment.ID}`)
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* If no upcoming appointments, show message */}
                  {user.appointments.filter((appointment) => {
                    const now = new Date()
                    const appointmentDate = new Date(appointment.datetime)
                    return appointmentDate > now
                  }).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-white/60">
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
              <div key={service.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <h3 className="font-medium text-lg">{service["service-name"]}</h3>
                <p className="text-white/60 text-sm mb-2">{service["service-desc"]}</p>
                <div className="flex justify-between items-center">
                  <p className="text-[#9f6eff] font-medium">${service.price.toFixed(2)}</p>
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
            <p className="text-white/60">No services available at the moment</p>
          </div>
        )}
      </section>
    </>
  )
}

