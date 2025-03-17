"use client"

import React from "react"
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
  Loader2,
} from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import type { Appointment, Service } from "@/app/api/types"

// Add a direct API fetch function for appointments
async function fetchAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching appointment: ${response.status}`);
    }
    
    const data = await response.json();
    return data.appointment || null;
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return null;
  }
}

export default function AppointmentDetailsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const params = useParams()
  
  // Ensure we have the correct appointment ID format from different possible sources
  const rawAppointmentId = params.id as string;
  const appointmentId = Array.isArray(rawAppointmentId) ? rawAppointmentId[0] : rawAppointmentId;

  // Log route information for debugging
  useEffect(() => {
    console.log("Route information:", {
      params,
      appointmentId,
      currentUrl: typeof window !== 'undefined' ? window.location.pathname : null
    });
  }, [params, appointmentId]);

  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function getAppointment() {
      setLoading(true);
      setError(null);
      
      try {
        // First try to find in current user data for efficiency
        let foundAppointment = null;
        
        if (isLoggedIn && user && user.appointments) {
          foundAppointment = user.appointments.find((a) => {
            const appointmentIdString = String(appointmentId);
            const currentId = String(a.id);
            const legacyId = (a as any).ID ? String((a as any).ID) : null;
            
            return currentId === appointmentIdString || 
                   (legacyId && legacyId === appointmentIdString);
          });
          
          if (foundAppointment) {
            console.log("Found appointment in user data:", foundAppointment);
            setAppointment(foundAppointment);
            setLoading(false);
            return;
          }
        }
        
        // If not found in user data, fetch directly from API
        console.log("Fetching appointment directly from API:", appointmentId);
        const apiAppointment = await fetchAppointmentById(appointmentId);
        
        if (apiAppointment) {
          console.log("Found appointment from API:", apiAppointment);
          setAppointment(apiAppointment);
        } else {
          console.error("Appointment not found with ID:", appointmentId);
          setError("Appointment not found");
        }
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    }
    
    if (appointmentId) {
      getAppointment();
    }
  }, [isLoggedIn, user, appointmentId]);

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

  // Helper function to find service by ID - updated for new structure
  function getServiceFromAppointment(appointment: Appointment): Service | undefined {
    if (appointment.services && appointment.services.length > 0) {
      return appointment.services[0];
    }
    return undefined;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto text-center">
        <Loader2 className="w-16 h-16 text-[#9f6eff] mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold mb-4">Loading Appointment</h1>
        <p className="text-white/70">Retrieving appointment details...</p>
      </div>
    );
  }

  // If error or no appointment found
  if (error || !appointment) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
        <p className="text-white/70 mb-6">
          We couldn't find the appointment you're looking for. This might be because:
        </p>
        <ul className="text-left text-white/70 mb-6 mx-auto max-w-sm">
          <li className="mb-2">• The appointment ID may be incorrect</li>
          <li className="mb-2">• The appointment may have been deleted</li>
          <li className="mb-2">• There might be a temporary server issue</li>
        </ul>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/dashboard/client/appointments"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4" />
            Refresh & Try Again
          </button>
        </div>

        {/* Debug Info Section (only shown in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-black/30 rounded-lg text-left text-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono font-bold">Debug Info</h3>
              <button
                onClick={() => {
                  const debugInfo = {
                    appointmentId,
                    userAppointments: user?.appointments?.map(a => ({ 
                      id: a.id, 
                      legacyId: (a as any).ID,
                      datetime: a.datetime
                    }))
                  };
                  console.log('Debug info:', debugInfo);
                  navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                  alert('Debug info copied to clipboard and logged to console');
                }}
                className="text-[#9f6eff] hover:underline"
              >
                Copy Debug Info
              </button>
            </div>
            <p className="mb-1 font-mono">Appointment ID: <span className="text-[#9f6eff]">{appointmentId}</span></p>
            <p className="mb-1 font-mono">Available Appointments: {user?.appointments?.length || 0}</p>
            <p className="mb-1 font-mono">User Auth Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</p>
          </div>
        )}
      </div>
    )
  }

  // Update service reference
  const service = getServiceFromAppointment(appointment)
  const status = getAppointmentStatus(appointment)
  const appointmentDate = new Date(appointment.datetime)
  const isPast = appointmentDate < new Date()

  // Fix provider information from the owners array
  const provider = appointment.owners && appointment.owners.length > 0 ? appointment.owners[0] : undefined

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

  return (
    <>
      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard/client/appointments"
                className="text-white/70 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Appointments
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">Appointment Details</h1>
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
          <StatusBadge />
        </div>
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
                <p className="text-white/60 text-sm mt-1">
                  ({isPast ? "Past appointment" : "Upcoming appointment"})
                </p>
              </div>
            </div>

            {/* Services Section - Enhanced to show all services */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#9f6eff]" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-white/60 mb-2">Service{appointment.services && appointment.services.length > 1 ? 's' : ''}</h3>
                
                {appointment.services && appointment.services.length > 0 ? (
                  <div className="space-y-3">
                    {appointment.services.map((serviceItem) => (
                      <div key={serviceItem.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-lg font-medium">{serviceItem.service_name}</p>
                          <p className="text-[#9f6eff] font-medium">${serviceItem.price.toFixed(2)}</p>
                        </div>
                        <p className="text-white/80 text-sm mt-1">{serviceItem.service_desc}</p>
                        <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{serviceItem.duration} minutes</span>
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
                <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                  <div className="text-[#9f6eff]">🐾</div>
                </div>
                <div className="w-full">
                  <h3 className="text-sm font-medium text-white/60 mb-2">Animal{appointment.animals.length > 1 ? 's' : ''}</h3>
                  
                  <div className="space-y-3">
                    {appointment.animals.map((animal) => (
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
              </div>
            )}

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
            {appointment.notes && (
              <div className="bg-white/5 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium text-white/60 mb-2">Additional Notes</h3>
                <p className="text-white/80">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons - Only show if this is the user's own appointment */}
          {isLoggedIn && user && user.appointments && user.appointments.some(a => 
            String(a.id) === String(appointment.id) || String((a as any).ID) === String(appointment.id)
          ) && !isPast && status !== "cancelled" && (
            <div className="mt-8 flex flex-wrap gap-3">
              {status === "pending" && (
                <>
                  <Link
                    href={`/dashboard/client/appointments/${appointment.id}/edit`}
                    className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit Appointment
                  </Link>
                  <button
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    onClick={() => {
                      // Handle cancellation logic here
                      alert(`Cancel appointment ${appointment.id}`)
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
                    alert(`Cancel appointment ${appointment.id}`)
                  }}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Provider Information Card - Enhanced */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#9f6eff]" />
            Provider Information
          </h2>

          {provider ? (
            <div className="space-y-5">
              {/* Provider avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-[#9f6eff]/20 flex items-center justify-center text-[#9f6eff] text-2xl">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Provider name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#9f6eff]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/60">Name</h3>
                  <p className="text-lg font-medium">{provider.name}</p>
                </div>
              </div>

              {/* Phone number */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#9f6eff]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/60">Phone</h3>
                  <p className="text-lg font-medium">{provider.phone}</p>
                  <button 
                    className="text-xs text-[#9f6eff] mt-1 hover:underline"
                    onClick={() => navigator.clipboard.writeText(provider.phone)}
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#9f6eff]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/60">Location</h3>
                  <p className="text-lg font-medium">{provider.location}</p>
                </div>
              </div>

              {/* Contact card button */}
              <button
                className="w-full mt-4 px-4 py-2 bg-[#9f6eff]/20 hover:bg-[#9f6eff]/30 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                onClick={() => {
                  // Generate vCard data
                  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${provider.name} (Bravus)
TEL:${provider.phone}
ADR:;;${provider.location};;;;
END:VCARD`;
                  
                  const blob = new Blob([vCardData], { type: 'text/vcard' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${provider.name.replace(/\s+/g, '_')}_contact.vcf`;
                  link.click();
                }}
              >
                <User className="w-4 h-4" />
                Save Contact
              </button>
            </div>
          ) : (
            <p className="text-white/60">No provider information available</p>
          )}

          {/* Add calendar button */}
          <button
            className="w-full mt-6 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            onClick={() => {
              // Generate calendar data
              const startTime = new Date(appointment.datetime);
              const endTime = new Date(startTime.getTime() + (service?.duration || 60) * 60000);
              
              // Format for iCal
              const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
              
              const iCalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bravus//Appointment//EN
BEGIN:VEVENT
SUMMARY:${service?.service_name || 'Bravus Appointment'}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
LOCATION:${provider?.location || 'Bravus Main Office'}
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
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
        </div>
      </div>

      {/* FAQ/Help Section */}
      <div className="mt-10 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">How can I reschedule my appointment?</h3>
            <p className="text-white/70">
              If you need to reschedule, please contact the service provider directly or use the "Edit Appointment" button above at least 24 hours before your scheduled time.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">What's your cancellation policy?</h3>
            <p className="text-white/70">
              You can cancel appointments up to 24 hours in advance without any charge. Cancellations with less than 24 hours notice may be subject to a cancellation fee.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">How should I prepare for my appointment?</h3>
            <p className="text-white/70">
              Make sure your pet is comfortable and familiar with travel carriers if applicable. It's also helpful to bring any relevant medical records or information about previous treatments or concerns.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Need more help?</h3>
            <p className="text-white/70">
              If you have any other questions or concerns about your appointment, please contact our support team at <span className="text-[#9f6eff]">support@bravus.com</span> or call <span className="text-[#9f6eff]">(555) 123-4567</span>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

