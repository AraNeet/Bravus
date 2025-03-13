"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Clock,
  ArrowLeft,
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import type { Appointment, Service } from "@/app/api/types"

export default function AppointmentDetailsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  const appointmentId = params.id as string

  // Find the appointment in user data
  useEffect(() => {
    if (isLoggedIn && user) {
      const foundAppointment = user.appointments?.find((a) => a.ID === appointmentId) || null

      if (foundAppointment) {
        setAppointment(foundAppointment)
      } else {
        setError("Appointment not found")
      }
    }
  }, [isLoggedIn, user, appointmentId])

  // Helper function to determine appointment status
  function getAppointmentStatus(appointment: Appointment): string {
    // This is a placeholder - in a real app, you'd use the actual status from the API
    const appointmentDate = new Date(appointment.datetime)
    const now = new Date()

    // If appointment has a status property, use that
    if ((appointment as any).status) {
      return (appointment as any).status
    }

    // Otherwise determine based on date
    if (appointmentDate < now) {
      return "completed"
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "confirmed"
    } else {
      return "pending"
    }
  }

  // Helper function to find service by ID
  function getService(serviceId: string): Service | undefined {
    return user?.services?.find((s: Service) => s.id === serviceId)
  }

  // If error or no appointment found
  if (error || !appointment) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
        <p className="text-white/70 mb-6">
          {error || "The appointment you're looking for doesn't exist or you don't have permission to view it."}
        </p>
        <Link
          href="/dashboard/client/appointments"
          className="inline-flex items-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
      </div>
    )
  }

  // Get service details
  const service = getService(appointment.service)
  const status = getAppointmentStatus(appointment)
  const appointmentDate = new Date(appointment.datetime)
  const isPast = appointmentDate < new Date()

  // Status badge component
  const StatusBadge = () => {
    const statusConfig = {
      confirmed: {
        color: "bg-green-500/20 text-green-400",
        icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
      },
      cancelled: {
        color: "bg-red-500/20 text-red-400",
        icon: <XCircle className="w-4 h-4 mr-2" />,
      },
      pending: {
        color: "bg-yellow-500/20 text-yellow-400",
        icon: <Clock className="w-4 h-4 mr-2" />,
      },
      completed: {
        color: "bg-blue-500/20 text-blue-400",
        icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <div className={`px-4 py-2 rounded-lg ${config.color} text-sm flex items-center`}>
        {config.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    )
  }

  // Find provider information from Users array
  const provider = appointment.Users.find((u) => u.career === "Business Owner" || u.career === "Service Provider")

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
          <p className="text-white/70">View the details of your scheduled appointment</p>
        </div>
        <StatusBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointment Details Card */}
        <div className="md:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#9f6eff]" />
            Appointment Information
          </h2>

          <div className="space-y-6">
            {/* Date and Time */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Date & Time</h3>
                <p className="text-lg font-medium">
                  {appointmentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-white/80">
                  {appointmentDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Service</h3>
                <p className="text-lg font-medium">{service?.["service-name"] || "Unknown Service"}</p>
                <p className="text-white/80">{service?.["service-desc"] || ""}</p>
                {service && <p className="text-[#9f6eff] font-medium mt-1">${service.price.toFixed(2)}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Location</h3>
                <p className="text-lg font-medium">Bravus Main Office</p>
                <p className="text-white/80">123 Business Ave, Suite 101</p>
                <p className="text-white/80">New York, NY 10001</p>
              </div>
            </div>

            {/* Additional Notes (if any) */}
            {(appointment as any).notes && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-sm font-medium text-white/60 mb-2">Additional Notes</h3>
                <p className="text-white/80">{(appointment as any).notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isPast && status !== "cancelled" && (
            <div className="mt-8 flex flex-wrap gap-3">
              {status === "pending" && (
                <>
                  <Link
                    href={`/dashboard/client/appointments/${appointment.ID}/edit`}
                    className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit Appointment
                  </Link>
                  <button
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    onClick={() => {
                      // Handle cancellation logic here
                      alert(`Cancel appointment ${appointment.ID}`)
                    }}
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {status === "confirmed" && (
                <button
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                  onClick={() => {
                    // Handle cancellation logic here
                    alert(`Cancel appointment ${appointment.ID}`)
                  }}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Provider Information Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#9f6eff]" />
            Provider Information
          </h2>

          <div className="p-4 bg-white/5 rounded-lg">
            {provider ? (
              <>
                <h3 className="font-medium text-lg mb-2">
                  {provider.firstname} {provider.lastname}
                </h3>
                <p className="text-white/60 text-sm mb-3">{provider.career}</p>

                {provider.phone && (
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>{provider.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="w-4 h-4" />
                  <span>{provider.email || "support@bravus.com"}</span>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-medium text-lg mb-2">Bravus Service Provider</h3>

                <div className="flex items-center gap-2 text-white/70 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </div>

                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="w-4 h-4" />
                  <span>support@bravus.com</span>
                </div>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                If you need to make changes to your appointment, please contact us at least 24 hours in advance.
              </p>
            </div>
          </div>

          {/* Add calendar button */}
          <button
            className="w-full mt-6 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            onClick={() => {
              // Generate calendar file (in a real app)
              alert("Add to calendar functionality would go here")
            }}
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
        </div>
      </div>
    </>
  )
}

