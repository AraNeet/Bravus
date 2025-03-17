"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Package,
  ChevronRight,
  ChevronLeft,
  User,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import type { Service, Appointment } from "@/app/api/types";
import { getOwners, getOwnerServices } from "@/app/api/users";
import { createAppointment, updateAppointment } from "@/app/api/appointments";
import type { OwnerWithServices } from "@/app/api/users";
import {
  formatDateToStandard,
  getDateForInput,
  getTimeForInput,
  combineDateAndTime,
  isValidDateTimeFormat,
  formatDateForDisplay,
  formatTimeStringForDisplay,
  parseStandardDate,
  formatDateForBackend,
} from "@/app/utils/date-utils";
import { getUserIdFromToken } from "@/app/utils/jwt-utils";

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id");
  const isEditMode = !!appointmentId;

  const [owners, setOwners] = useState<OwnerWithServices[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [dateTimeString, setDateTimeString] = useState<string>("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [ownerServices, setOwnerServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);

  // Fetch owners and appointment data (if editing) on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const ownersData = await getOwners();
        console.log("Owners data received:", ownersData);
        
        // For TypeScript, manually assert the 'owner' field
        const ownersWithType = ownersData.map(owner => ({
          ...owner,
          owner: true // Explicitly add owner property
        }));
        
        const filteredOwners = ownersWithType.filter(
          (owner) => owner.owner === true
        );
        console.log("Filtered owners:", filteredOwners);
        
        setOwners(filteredOwners);

        // If editing, find the appointment in user data
        if (isEditMode && user?.appointments) {
          const foundAppointment = user.appointments.find(
            (a) => a.id === appointmentId // Fix: using lowercase 'id' property
          );

          if (foundAppointment) {
            setAppointment(foundAppointment);

            // Find the owner of this service
            // Look for the service in the services array instead of a single service property
            const serviceId = foundAppointment.services && foundAppointment.services.length > 0 
              ? foundAppointment.services[0].id 
              : "";
            let ownerId = "";

            for (const owner of filteredOwners) {
              if (
                owner.services &&
                owner.services.some((s: Service) => s.id === serviceId)
              ) {
                ownerId = owner.id;
                break;
              }
            }

            // Parse the datetime string to get date and time components
            const appointmentDate = new Date(foundAppointment.datetime);

            // Initialize form data
            setSelectedOwner(ownerId);
            setSelectedService(serviceId);
            setSelectedDate(appointmentDate);
            setSelectedTime(getTimeForInput(appointmentDate));
            setNotes((foundAppointment as any).notes || "");

            // Set the datetime string
            setDateTimeString(formatDateToStandard(appointmentDate));
          } else {
            setError("Appointment not found");
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch appointment data:", err);
        setError("Failed to load data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, appointmentId, isEditMode]);

  // Generate available times for the selected date
  useEffect(() => {
    if (selectedDate) {
      // In a real app, you would fetch available times from the API
      // For now, we'll generate some sample times
      const times = [];
      for (let hour = 9; hour < 17; hour++) {
        times.push(`${hour}:00`);
        times.push(`${hour}:30`);
      }
      setAvailableTimes(times);

      // If we're in edit mode and already have a time, make sure it's selected
      if (isEditMode && selectedTime && !times.includes(selectedTime)) {
        times.push(selectedTime);
      }
    }
  }, [selectedDate, isEditMode, selectedTime]);

  // Update dateTimeString when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateStr = getDateForInput(selectedDate);
      const combined = combineDateAndTime(dateStr, selectedTime);
      setDateTimeString(combined);

      // Validate the combined date-time string
      const isValid = isValidDateTimeFormat(combined);
      if (!isValid) {
        setFormError(
          "Please enter a valid date and time in the format YYYY-MM-DD HH:mm"
        );
      } else {
        setFormError(null);
      }
    }
  }, [selectedDate, selectedTime]);

  // Update the useEffect that runs when selectedOwner changes
  useEffect(() => {
    if (!isEditMode || (isEditMode && !isLoading)) {
      setSelectedService("");
      
      // Fetch services directly when an owner is selected
      if (selectedOwner) {
        setLoadingServices(true);
        setOwnerServices([]);
        
        // Use the dedicated function to get services for this owner
        getOwnerServices(selectedOwner)
          .then(services => {
            console.log(`Loaded ${services.length} services for owner ${selectedOwner}`, services);
            setOwnerServices(services);
          })
          .catch(err => {
            console.error("Error fetching owner services:", err);
          })
          .finally(() => {
            setLoadingServices(false);
          });
      }
    }
  }, [selectedOwner, isEditMode, isLoading]);

  // Get services from selected owner
  const getSelectedOwnerServices = () => {
    return ownerServices || [];
  };

  // Helper function to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Create blank spaces for days before the first day of the month
    const blanks = Array(firstDay)
      .fill(null)
      .map((_, i) => <div key={`blank-${i}`} className="aspect-square"></div>);

    // Create day buttons
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isToday = date.toDateString() === new Date().toDateString();

      return (
        <button
          key={`day-${day}`}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`
            aspect-square flex items-center justify-center rounded-lg text-sm
            ${isSelected ? "bg-[#9f6eff] text-white" : ""}
            ${
              isPast
                ? "text-white/30 cursor-not-allowed"
                : "hover:bg-white/10 cursor-pointer"
            }
            ${
              isToday && !isSelected
                ? "border border-[#9f6eff]/50 text-[#9f6eff]"
                : ""
            }
          `}
        >
          {day}
        </button>
      );
    });

    return [...blanks, ...days];
  };

  // Reset service selection when owner changes
  useEffect(() => {
    if (!isEditMode || (isEditMode && !isLoading)) {
      setSelectedService("");
    }
  }, [selectedOwner, isEditMode, isLoading]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedOwner || !selectedService || !selectedDate || !selectedTime) {
      setFormError("Please fill out all required fields");
      return;
    }

    if (!isValidDateTimeFormat(dateTimeString)) {
      setFormError("Invalid date or time format");
      return;
    }

    try {
      // Convert the date to the backend format (MM-DD-YYYY h:mmAM/PM)
      const date = parseStandardDate(dateTimeString);
      const backendDateFormat = formatDateForBackend(date);

      // Get the current user ID
      const userId = getUserIdFromToken();
      if (!userId) {
        setFormError("User authentication error. Please log in again.");
        return;
      }

      const appointmentData = {
        DateTime: backendDateFormat, // Format: MM-DD-YYYY h:mmAM/PM (e.g., 01-02-2006 3:04PM)
      };

      if (isEditMode && appointmentId) {
        // Update existing appointment
        await updateAppointment(appointmentId, appointmentData);
        alert(`Appointment updated successfully`);
        router.push(`/dashboard/client/appointments/${appointmentId}`);
      } else {
        // Create new appointment
        await createAppointment(
          selectedOwner,
          userId,
          selectedService,
          appointmentData
        );
        alert(`Appointment booked successfully`);
        router.push("/dashboard/client/appointments");
      }
    } catch (err: any) {
      console.error("Failed to submit appointment:", err);
      setFormError(
        err.message || "Failed to submit appointment. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-[#9f6eff] animate-spin mb-4" />
        <p className="text-white/70">
          Loading {isEditMode ? "appointment" : "service providers"}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          href="/dashboard/client/appointments"
          className="inline-flex items-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard/client/appointments"
            className="text-white/70 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? "Edit Appointment" : "Book an Appointment"}
        </h1>
        <p className="text-white/70">
          {isEditMode
            ? "Update your appointment details"
            : "Schedule a new appointment with our service providers"}
        </p>
      </div>

      {/* Booking Steps */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
        {formError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-white text-sm">{formError}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 flex-wrap">
          <div className="flex-1 flex flex-col items-center min-w-[100px] mb-4 md:mb-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 1
                  ? "bg-[#9f6eff] text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <span
              className={`text-sm ${
                step >= 1 ? "text-white" : "text-white/50"
              }`}
            >
              Select Provider
            </span>
          </div>

          <div className="w-8 h-0.5 bg-white/10 hidden md:block">
            <div
              className={`h-full ${
                step >= 2 ? "bg-[#9f6eff]" : "bg-transparent"
              }`}
            ></div>
          </div>

          <div className="flex-1 flex flex-col items-center min-w-[100px] mb-4 md:mb-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 2
                  ? "bg-[#9f6eff] text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <span
              className={`text-sm ${
                step >= 2 ? "text-white" : "text-white/50"
              }`}
            >
              Select Service
            </span>
          </div>

          <div className="w-8 h-0.5 bg-white/10 hidden md:block">
            <div
              className={`h-full ${
                step >= 3 ? "bg-[#9f6eff]" : "bg-transparent"
              }`}
            ></div>
          </div>

          <div className="flex-1 flex flex-col items-center min-w-[100px] mb-4 md:mb-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 3
                  ? "bg-[#9f6eff] text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <span
              className={`text-sm ${
                step >= 3 ? "text-white" : "text-white/50"
              }`}
            >
              Select Date
            </span>
          </div>

          <div className="w-8 h-0.5 bg-white/10 hidden md:block">
            <div
              className={`h-full ${
                step >= 4 ? "bg-[#9f6eff]" : "bg-transparent"
              }`}
            ></div>
          </div>

          <div className="flex-1 flex flex-col items-center min-w-[100px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 4
                  ? "bg-[#9f6eff] text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <span
              className={`text-sm ${
                step >= 4 ? "text-white" : "text-white/50"
              }`}
            >
              Select Time
            </span>
          </div>
        </div>

        {/* Step 1: Select Owner */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Select a Service Provider
            </h2>

            {/* Debug info */}
            <div className="mb-4 p-2 rounded bg-gray-800/50 text-xs">
              <p>Number of owners loaded: {owners.length}</p>
              <button 
                onClick={() => console.log("Current owners state:", owners)}
                className="text-[#9f6eff] hover:underline mt-1"
              >
                Log owners to console
              </button>
              <button 
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const refreshedOwners = await getOwners();
                    console.log("Refreshed owners:", refreshedOwners);
                    const withOwnerFlag = refreshedOwners.map(o => ({...o, owner: true}));
                    setOwners(withOwnerFlag.filter(o => o.owner === true));
                  } catch (err) {
                    console.error("Failed to refresh owners:", err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-[#9f6eff] hover:underline mt-1 ml-4"
              >
                Refresh owners
              </button>
            </div>

            {owners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {owners.map((owner) => (
                  <button
                    key={owner.id}
                    onClick={() => setSelectedOwner(owner.id)}
                    className={`p-4 rounded-lg text-left transition-colors ${
                      selectedOwner === owner.id
                        ? "bg-[#9f6eff]/20 border border-[#9f6eff]/50"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                        {owner.firstname?.charAt(0) || '?'}
                        {owner.lastname?.charAt(0) || ''}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {owner.firstname || owner.name?.split(' ')[0] || 'Unknown'} {owner.lastname || (owner.name?.split(' ').length > 1 ? owner.name?.split(' ').slice(1).join(' ') : '')}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {owner.career || "Service Provider"}
                        </p>
                        <p className="text-xs text-white/40">
                          {owner.services?.length || 0} services available
                        </p>
                      </div>
                    </div>

                    {owner.services && owner.services.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-white/60 mb-2">
                          Services offered: {owner.services.length}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {owner.services
                            .slice(0, 3)
                            .map((service: Service) => (
                              <span
                                key={service.id}
                                className="px-2 py-1 bg-white/10 rounded-full text-xs"
                              >
                                {service.service_name || "Unnamed Service"}
                              </span>
                            ))}
                          {owner.services.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                              +{owner.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-white/10 text-white/40 text-xs">
                        No services configured yet
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-white/60 mb-4">
                  No service providers available at the moment.
                </p>
                <p className="text-white/40 text-sm mb-4">
                  This could be because there are no providers in the system yet,
                  or there was an error loading the providers.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium"
                >
                  Refresh Page
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedOwner}
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Service</h2>

            <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30 mb-6">
              <p className="font-medium">Selected Provider:</p>
              <p className="text-lg">
                {owners.find((o) => o.id === selectedOwner)?.firstname || owners.find((o) => o.id === selectedOwner)?.name || 'Unknown'}{" "}
                {owners.find((o) => o.id === selectedOwner)?.lastname || ''}
              </p>
            </div>

            {loadingServices ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#9f6eff] animate-spin mb-4" />
                <p className="text-white/70">Loading services...</p>
              </div>
            ) : ownerServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownerServices.map((service: Service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg text-left transition-colors ${
                      selectedService === service.id
                        ? "bg-[#9f6eff]/20 border border-[#9f6eff]/50"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <h3 className="font-medium text-lg">
                      {service.service_name}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">
                      {service.service_desc}
                    </p>
                    <p className="text-[#9f6eff] font-medium">
                      ${service.price.toFixed(2)}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Duration: {service.duration} minutes
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-white/60 mb-4">
                  This provider has no services available.
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium"
                  >
                    Select a different provider
                  </button>
                  
                  <button
                    onClick={() => {
                      setLoadingServices(true);
                      getOwnerServices(selectedOwner)
                        .then(services => {
                          console.log(`Refreshed services: ${services.length}`);
                          setOwnerServices(services);
                        })
                        .catch(err => {
                          console.error("Error refreshing services:", err);
                        })
                        .finally(() => setLoadingServices(false));
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium mt-2"
                  >
                    Refresh Services
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!selectedService}
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Date */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Date</h2>

            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {currentMonth.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-xs text-white/40 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays()}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30">
                <p className="font-medium">Selected Date:</p>
                <p className="text-lg">{formatDateForDisplay(selectedDate)}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={() => setStep(4)}
                disabled={!selectedDate}
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Select Time and Notes */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select a Time</h2>

            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="font-medium mb-4">
                Available times for{" "}
                {selectedDate && formatDateForDisplay(selectedDate)}
              </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-4 rounded-lg text-center transition-colors ${
                      selectedTime === time
                        ? "bg-[#9f6eff] text-white"
                        : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {formatTimeStringForDisplay(time)}
                    </button>
                  ))}
                </div>
            </div>

            {selectedTime && (
              <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30 mb-4">
                <p className="font-medium">Selected Time:</p>
                <p className="text-lg">
                  {formatTimeStringForDisplay(selectedTime)}
                </p>
              </div>
            )}

            {/* Date-Time Format Display */}
            <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-[#9f6eff] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">
                    Appointment Date & Time
                  </p>
                  <p className="text-white/80">
                    {isValidDateTimeFormat(dateTimeString)
                      ? dateTimeString
                      : "Please select a valid date and time"}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Format: YYYY-MM-DD HH:mm
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special requests or information for this appointment"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9f6eff]/50"
              ></textarea>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={
                  !selectedTime || !isValidDateTimeFormat(dateTimeString)
                }
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditMode ? "Update Appointment" : "Book Appointment"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Appointment Summary" : "Booking Summary"}
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#9f6eff]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60">Provider</h3>
              <p className="font-medium">
                {selectedOwner
                  ? `${owners.find((o) => o.id === selectedOwner)?.firstname} ${
                      owners.find((o) => o.id === selectedOwner)?.lastname
                    }`
                  : "No provider selected"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-[#9f6eff]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60">Service</h3>
              <p className="font-medium">
                {selectedService
                  ? ownerServices.find(
                      (s: Service) => s.id === selectedService
                    )?.service_name
                  : "No service selected"}
              </p>
              {selectedService && (
                <p className="text-[#9f6eff]">
                  $
                  {ownerServices
                    .find((s: Service) => s.id === selectedService)
                    ?.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#9f6eff]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60">Date</h3>
              <p className="font-medium">
                {selectedDate
                  ? formatDateForDisplay(selectedDate)
                  : "No date selected"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#9f6eff]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60">Time</h3>
              <p className="font-medium">
                {selectedTime
                  ? formatTimeStringForDisplay(selectedTime)
                  : "No time selected"}
              </p>
            </div>
          </div>

          {notes && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-[#9f6eff]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/60">Notes</h3>
                <p className="font-medium">{notes}</p>
              </div>
            </div>
          )}

          {isValidDateTimeFormat(dateTimeString) && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Standardized Date-Time Format:
              </p>
              <p className="font-mono bg-white/5 px-3 py-2 rounded mt-1">
                {dateTimeString}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
