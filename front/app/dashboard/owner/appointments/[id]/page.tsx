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
  Download,
  HelpCircle,
  CalendarCheck,
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
  const [isClient, setIsClient] = useState(false);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    // Add 4 hours to the appointment time
    appointmentDate.setHours(appointmentDate.getHours() + 4);
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
        color: "bg-mred/20 text-mred",
        icon: <XCircle className="w-4 h-4 mr-2" />,
      },
      pending: {
        color: "bg-yellow-500/20 text-yellow-400",
        icon: <Clock className="w-4 h-4 mr-2" />,
      },
      completed: {
        color: "bg-spink/20 text-spink",
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
        <div className="bg-navy/80 rounded-xl border border-spink/20 shadow-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-white/70 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              disabled={isConfirming}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-navy/60 hover:bg-navy/80 border border-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isConfirming}
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-mred/80 hover:bg-mred transition-colors flex items-center gap-2 disabled:opacity-50"
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

  // Prevent any rendering until client-side hydration is complete
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-3 border-spink border-t-transparent rounded-full mx-auto"></div>
    </div>;
  }

  if (isLoading) {
    return (
      <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 max-w-md mx-auto text-center">
        <div className="animate-spin w-16 h-16 border-4 border-spink border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Loading Appointment</h1>
        <p className="text-white/70">Retrieving appointment details...</p>
      </div>
    );
  }

  if (notFound || !appointment) {
    return (
      <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-mred mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
        <p className="text-white/70 mb-6">
          We couldn't find the appointment you're looking for.
        </p>
        <Link
          href="/dashboard/owner/appointments"
          className="inline-flex items-center justify-center gap-2 bg-navy/60 hover:bg-navy/80 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.datetime);
  // Add 4 hours to the appointment time
  appointmentDate.setHours(appointmentDate.getHours() + 4);
  const isPast = appointmentDate < new Date();

  return (
    <>
      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard/owner/appointments"
                className="text-white/70 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
          Back to Appointments
              </Link>
            </div>
            <h1 className="text-2xl font-bold mb-2">Appointment Details</h1>
            <p className="text-white/70">
              {appointmentDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 bg-mred/20 hover:bg-mred/30 text-mred rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-mred border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Cancel Appointment
                </>
              )}
            </button>
            <StatusBadge />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-mred/10 border border-mred/20 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-mred shrink-0 mt-0.5" />
          <p className="text-mred">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointment Details Card */}
        <div className="md:col-span-2 bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 hover:shadow-lg hover:shadow-spink/5 transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-spink" />
            Appointment Information
          </h2>

          <div className="space-y-8">
            {/* Date and Time */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-spink/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-spink" />
            </div>
            <div>
                <h3 className="text-sm font-medium text-white/60 mb-1">Date & Time</h3>
                <p className="text-lg font-bold">
                  {appointmentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-white/80 font-medium">
                  {appointmentDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  ({isPast ? "Past appointment" : "Upcoming appointment"})
                </p>
          </div>
            </div>

            {/* Services Section - Enhanced to show all services */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-mred/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-mred" />
            </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-white/60 mb-2">Service{appointment.services && appointment.services.length > 1 ? 's' : ''}</h3>
                
            {appointment.services && appointment.services.length > 0 ? (
                  <div className="space-y-3">
                    {appointment.services.map((serviceItem: any) => (
                      <div key={serviceItem.id} className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                  <div className="flex justify-between items-start">
                          <p className="text-lg font-bold">{serviceItem.service_name}</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-spink to-mred bg-clip-text text-transparent">${serviceItem.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{serviceItem.service_desc}</p>
                  <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{serviceItem.duration || 60} minutes</span>
                  </div>
                </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">No service information available</p>
          )}
        </div>
      </div>

      {/* Animals Section - Show animals associated with this appointment */}
      {appointment.animals && appointment.animals.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gteal/20 flex items-center justify-center flex-shrink-0">
                  <div className="text-gteal text-lg">🐾</div>
            </div>
                <div className="w-full">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Animal{appointment.animals.length > 1 ? 's' : ''}</h3>
                  
                  <div className="space-y-3">
            {appointment.animals.map((animal: any) => (
                      <div key={animal.id} className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                        <p className="text-lg font-bold">{animal.animal_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-white/80 text-sm">
                  <span>{animal.species}</span>
                  <span>{animal.animal_race}</span>
                  <span>{animal.animal_age} years old</span>
                </div>
              </div>
            ))}
                  </div>
          </div>
        </div>
      )}

            {/* Client */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gteal/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gteal" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-white/60 mb-2">Client Information</h3>
                
                {appointment.clients && appointment.clients.length > 0 ? (
                  <div className="space-y-3">
                    {appointment.clients.map((client: any) => (
                      <div key={client.id} className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                        <div className="flex justify-between items-start">
                          <p className="text-lg font-bold">{client.name}</p>
                        </div>
                        <div className="space-y-2 mt-2">
                          {client.phone && (
                            <div className="flex items-center gap-2 text-white/80">
                              <Phone className="w-4 h-4 text-white/60" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.location && (
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="w-4 h-4 text-white/60" />
                              <span>{client.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">No client information available</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-spink/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-spink" />
            </div>
            <div>
                <h3 className="text-sm font-medium text-white/60 mb-1">Location</h3>
                <p className="text-lg font-bold">Bravus Main Office</p>
                <p className="text-white/80">123 Business Ave, Suite 101</p>
                <p className="text-white/80">New York, NY 10001</p>
              </div>
            </div>

            {/* Additional Notes (if any) */}
            {appointment.notes && (
              <div className="bg-navy/70 rounded-lg p-4 mt-4 border border-spink/10">
                <h3 className="text-sm font-medium text-white/60 mb-2">Additional Notes</h3>
                <p className="text-white/80">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Information Card - Enhanced */}
        <div className="bg-navy/40 backdrop-blur-sm rounded-xl border border-spink/10 p-6 hover:shadow-lg hover:shadow-spink/5 transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-spink" />
            Quick Actions
          </h2>

          <div className="space-y-6">
            {/* Add to calendar */}
            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-spink to-mred hover:from-spink/90 hover:to-mred/90 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => {
                // Generate calendar data
                const startTime = new Date(appointment.datetime);
                // Add 4 hours to the appointment time for calendar export
                startTime.setHours(startTime.getHours() + 4);
                const serviceItem = appointment.services && appointment.services.length > 0 ? appointment.services[0] : null;
                const endTime = new Date(startTime.getTime() + (serviceItem?.duration || 60) * 60000);
                
                // Format for iCal
                const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
                
                const iCalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bravus//Appointment//EN
BEGIN:VEVENT
SUMMARY:${serviceItem?.service_name || 'Bravus Appointment'}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
LOCATION:Bravus Main Office
DESCRIPTION:${appointment.notes || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

                const blob = new Blob([iCalData], { type: 'text/calendar' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bravus_appointment_${formatDate(startTime)}.ics`;
                link.click();
              }}
            >
              <CalendarCheck className="w-4 h-4" />
              Add to Calendar
            </button>

            {/* Client contact info if available */}
            {appointment.clients && appointment.clients.length > 0 && appointment.clients[0].phone && (
              <button
                className="w-full px-4 py-2 bg-navy/60 hover:bg-navy/80 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => {
                  const client = appointment.clients[0];
                  // Generate vCard data
                  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${client.name} (Bravus Client)
TEL:${client.phone}
ADR:;;${client.location || ''};;;;
END:VCARD`;
                  
                  const blob = new Blob([vCardData], { type: 'text/vcard' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${client.name.replace(/\s+/g, '_')}_contact.vcf`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
                Save Client Contact
              </button>
            )}
            
            <div className="border-t border-white/10 my-6"></div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-2">Appointment Tips</h3>
              
              <div className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                <p className="text-white/70 text-sm">
                  Remember to check your schedule 30 minutes before the appointment and prepare any necessary materials.
                </p>
              </div>
              
              <div className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                <p className="text-white/70 text-sm">
                  If you need to cancel this appointment, use the "Cancel Appointment" button above. The client will be notified automatically.
                </p>
              </div>
              
              <div className="bg-navy/70 rounded-lg p-4 border border-spink/10">
                <p className="text-white/70 text-sm">
                  Need to make changes? Contact support at <span className="text-spink">support@bravus.com</span> for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel this appointment on ${formatDateForDisplay(appointmentDate)} at ${formatTimeForDisplay(appointmentDate)}? This action cannot be undone.`}
        isConfirming={isDeleting}
      />
    </>
  );
}
