"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Package,
  Phone,
  Briefcase,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/hooks/useAuth";
import { getAppointmentById, deleteAppointment } from "@/app/api/appointments";
import { getServiceById } from "@/app/api/services";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
} from "@/app/utils/date-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch appointment and service data
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) return;

      try {
        setIsLoading(true);

        // Fetch appointment
        const appointmentData = await getAppointmentById(appointmentId);
        if (!appointmentData) {
          setNotFound(true);
          setError("Appointment not found");
          return;
        }

        setAppointment(appointmentData);

        // Fetch service if available
        if (appointmentData.service_id) {
          try {
            const serviceData = await getServiceById(
              appointmentData.service_id
            );
            setService(serviceData);
          } catch (serviceError) {
            console.error("Failed to fetch service:", serviceError);
          }
        }
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
        setError("Failed to load appointment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      router.push("/dashboard/owner/appointments");
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      toast.error("Failed to delete appointment");
      setIsDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>

        {appointment && (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/owner/appointments/${appointmentId}/edit`}>
              <Button variant="outline" className="border-white/10 bg-white/5">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
        <p className="text-white/70">
          View and manage the appointment information
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Appointment Details */}
      {appointment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Date & Time */}
          <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Date & Time</h2>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-white/80">
                <Calendar className="w-4 h-4 mt-1 shrink-0" />
                <span>
                  {appointment.datetime
                    ? formatDateForDisplay(new Date(appointment.datetime))
                    : "Not specified"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-white/80">
                <Clock className="w-4 h-4 mt-1 shrink-0" />
                <span>
                  {appointment.datetime
                    ? formatTimeForDisplay(new Date(appointment.datetime))
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Service</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-white/60 text-sm">Service Name</h3>
                <p>{service ? service["service-name"] : "Service not found"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-white/60 text-sm">Description</h3>
                <p className="text-white/80">
                  {service
                    ? service["service-desc"]
                    : "No description available"}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-white/60 text-sm">Price</h3>
                <p className="text-[#9f6eff] font-medium">
                  ${service ? service.price.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Client</h2>
              </div>
            </div>
            <div className="space-y-2">
              {appointment.Users && appointment.Users.length > 0 ? (
                appointment.Users.map((user: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2 text-white/80">
                      <User className="w-4 h-4 mt-1 shrink-0" />
                      <span>
                        {user.firstname} {user.lastname}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-white/80">
                      <Phone className="w-4 h-4 mt-1 shrink-0" />
                      <span>{user.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-white/80">
                      <Briefcase className="w-4 h-4 mt-1 shrink-0" />
                      <span>{user.career || "No career information"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No client information available</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center py-12">
          <p className="text-white/70">
            Appointment not found or failed to load appointment details.
          </p>
          {notFound && (
            <div className="mt-4">
              <Button
                variant="default"
                onClick={() => router.push("/dashboard/owner/appointments")}
              >
                Return to Appointments
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Notes Section (Placeholder) */}
      <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="font-medium text-lg mb-4">Notes</h2>
        <p className="text-white/70">
          No notes have been added to this appointment.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1250] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Appointment</h2>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete this appointment? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
