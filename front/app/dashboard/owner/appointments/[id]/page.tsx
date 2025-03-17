"use client";

import React, { useState, useEffect } from "react";
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
  MapPin,
  CheckCircle,
  XCircle,
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
  
  // Extract appointment ID handling both string and array formats
  const rawAppointmentId = params.id;
  const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch appointment and service data
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) return;

      try {
        setIsLoading(true);
        console.log("Fetching appointment with ID:", appointmentId);

        // Fetch appointment
        const appointmentData = await getAppointmentById(appointmentId);
        console.log("Appointment data:", appointmentData);
        
        if (!appointmentData) {
          setNotFound(true);
          setError("Appointment not found");
          return;
        }

        setAppointment(appointmentData);

        // Fetch service if available
        if (appointmentData.services && appointmentData.services.length > 0) {
          try {
            console.log("Fetching service with ID:", appointmentData.services[0].id);
            const serviceData = await getServiceById(appointmentData.services[0].id);
            console.log("Service data:", serviceData);
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

  // Get the appointment status
  const getAppointmentStatus = () => {
    if (!appointment) return "unknown";
    
    const appointmentDate = new Date(appointment.datetime);
    const now = new Date();
    
    if (appointmentDate < now) {
      return "completed";
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "confirmed";
    } else {
      return "pending";
    }
  };
  
  // Status badge component
  const StatusBadge = () => {
    const status = getAppointmentStatus();
    const statusConfig = {
      confirmed: {
        color: "bg-green-500/20 text-green-400",
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
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
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
      },
      unknown: {
        color: "bg-white/10 text-white/60",
        icon: <AlertCircle className="w-4 h-4 mr-2" />,
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;

    return (
      <div className={`px-4 py-2 rounded-lg ${config.color} text-sm flex items-center`}>
        {config.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting appointment with ID:", appointmentId);
      await deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      router.push("/dashboard/owner/appointments");
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      toast.error("Failed to delete appointment");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Confirmation dialog component
  const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isConfirming,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isConfirming: boolean;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-[#2a1347] to-[#1a0b2e] rounded-xl border border-[#9f6eff]/20 shadow-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-white/70 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              disabled={isConfirming}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isConfirming}
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>Delete Appointment</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-12 h-12 border-4 border-[#9f6eff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (notFound || !appointment) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
        <p className="text-white/70 mb-6">
          We couldn't find the appointment you're looking for.
        </p>
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.push("/dashboard/owner/appointments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.push("/dashboard/owner/appointments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-white"
            onClick={handleDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
          <p className="text-white/70">
            View and manage the appointment information
          </p>
        </div>
        <StatusBadge />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Appointment Details */}
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
            {appointment.services && appointment.services.length > 0 ? (
              appointment.services.map((serviceItem: any) => (
                <div key={serviceItem.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <p className="text-lg font-medium">{serviceItem.service_name}</p>
                    <p className="text-[#9f6eff] font-medium">${serviceItem.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{serviceItem.service_desc}</p>
                  <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{serviceItem.duration || 60} minutes</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60">No service information available</div>
            )}
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
          {appointment.clients && appointment.clients.length > 0 ? (
            appointment.clients.map((client: any) => (
              <div key={client.id} className="space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{client.name}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.location && (
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{client.location}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-white/60">No client information available</div>
          )}
        </div>
      </div>

      {/* Animals Section - Show animals associated with this appointment */}
      {appointment.animals && appointment.animals.length > 0 && (
        <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
              <div className="text-[#9f6eff] text-lg">🐾</div>
            </div>
            <div>
              <h2 className="font-medium text-lg">Animals</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointment.animals.map((animal: any) => (
              <div key={animal.id} className="bg-white/5 rounded-lg p-3">
                <p className="text-lg font-medium">{animal.animal_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-white/80 text-sm">
                  <span>{animal.species}</span>
                  <span>{animal.animal_race}</span>
                  <span>{animal.animal_age} years old</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section - Show appointment notes if available */}
      {appointment.notes && (
        <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#9f6eff]" />
            </div>
            <div>
              <h2 className="font-medium text-lg">Notes</h2>
            </div>
          </div>
          <p className="text-white/80">{appointment.notes}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment on ${formatDateForDisplay(new Date(appointment.datetime))} at ${formatTimeForDisplay(new Date(appointment.datetime))}? This action cannot be undone.`}
        isConfirming={isDeleting}
      />
    </div>
  );
}
