"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import { Calendar, Clock, ChevronLeft, User, Package, Phone, Briefcase, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import { deleteAppointment } from "@/app/api/appointments"
import { formatDateForDisplay, formatTimeForDisplay } from "@/app/utils/date-utils"
import type { User as UserType, AuthResponse, Appointment as AppointmentType, Service, UserAppointment } from "@/app/api/types"

// Confirmation dialog component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#2a1347] to-[#1a0b2e] rounded-xl border border-[#9f6eff]/20 shadow-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/70 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentDetails() {
  const { user, authUser, isLoading, isLoggedIn } = useAuth()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Type guard functions
  const hasAppointments = (data: UserType | AuthResponse): data is UserType => {
    return 'appointments' in data && Array.isArray(data.appointments);
  };

  const hasServices = (data: UserType | AuthResponse): data is UserType => {
    return 'services' in data && Array.isArray(data.services);
  };

  // Redirect if not authenticated or not an owner
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login")
      } else {
        const userData = user || authUser
        if (userData && !userData.owner) {
          router.push("/dashboard/client")
        } else if (userData) {
          // Check if appointment exists
          const appointmentExists = hasAppointments(userData) && 
            userData.appointments.some(a => a.ID === appointmentId);
          if (!appointmentExists) {
            setNotFound(true);
          }
        }
      }
    }
  }, [isLoading, isLoggedIn, user, authUser, router, appointmentId])

  // Handle redirect for missing user data
  useEffect(() => {
    if (!isLoading && !user && !authUser) {
      router.push("/login");
    }
  }, [isLoading, user, authUser, router]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Get user data from either full profile or auth response
  const userData = user || authUser

  // If no user data or appointment not found, show error
  if (notFound || (userData && hasAppointments(userData) && !userData.appointments.find(a => a.ID === appointmentId))) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
          <p className="text-white/70 mb-6">
            The appointment you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/dashboard/owner/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Appointments</span>
          </Link>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Find the appointment by ID
  const appointment = hasAppointments(userData) 
    ? userData.appointments.find((a: AppointmentType) => a.ID === appointmentId)
    : undefined;

  // If appointment not found after initial checks, show error UI
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
          <p className="text-white/70 mb-6">
            The appointment you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/dashboard/owner/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Appointments</span>
          </Link>
        </div>
      </div>
    )
  }

  // Find service details
  const service = hasServices(userData)
    ? userData.services.find((s: Service) => s.id === appointment.service)
    : undefined;

  // Handle appointment deletion
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAppointment(appointmentId)
      toast.success("Appointment deleted successfully")

      // Redirect to appointments page after successful deletion
      setTimeout(() => {
        router.push("/dashboard/owner/appointments")
      }, 1500)
    } catch (error) {
      console.error("Error deleting appointment:", error)
      toast.error("Failed to delete appointment")
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(42, 19, 71, 0.9)",
            color: "#fff",
            border: "1px solid rgba(159, 110, 255, 0.2)",
            backdropFilter: "blur(8px)",
          },
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/dashboard/owner/appointments"
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Appointments</span>
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">Appointment Details</h1>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/owner/appointments/${appointmentId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Date & Time */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <h2 className="text-xl font-bold">Date & Time</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">Date</p>
                <p className="font-medium">{formatDateForDisplay(new Date(appointment.datetime))}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Time</p>
                <p className="font-medium">{formatTimeForDisplay(new Date(appointment.datetime))}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Status</p>
                <p className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs inline-flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Confirmed
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <h2 className="text-xl font-bold">Client</h2>
            </div>
            {appointment.Users.map((client: UserAppointment, index: number) => (
              <div key={index} className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">Name</p>
                  <p className="font-medium">
                    {client.firstname} {client.lastname}
                  </p>
                </div>
                {client.phone && (
                  <div>
                    <p className="text-white/60 text-sm">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40" />
                      <p>{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.career && (
                  <div>
                    <p className="text-white/60 text-sm">Occupation</p>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-white/40" />
                      <p>{client.career}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Service Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <h2 className="text-xl font-bold">Service</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">Service Name</p>
                <p className="font-medium">{service?.["service-name"] || "Unknown Service"}</p>
              </div>
              {service?.["service-desc"] && (
                <div>
                  <p className="text-white/60 text-sm">Description</p>
                  <p>{service["service-desc"]}</p>
                </div>
              )}
              <div>
                <p className="text-white/60 text-sm">Price</p>
                <p className="text-[#9f6eff] font-medium">${service?.price.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section (Placeholder) */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Notes</h2>
          <p className="text-white/70">No notes have been added to this appointment.</p>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  )
}

