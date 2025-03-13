"use client";

import Link from "next/link";
import type { Appointment, User } from "@/app/api/types";
import StatusBadge from "@/app/components/ui/status-badge";

interface AppointmentListProps {
  appointments: Appointment[];
  user: User | null;
}

export default function AppointmentList({
  appointments,
  user,
}: AppointmentListProps) {
  // Helper function to find service name by ID
  const getServiceName = (serviceId: string): string => {
    const service = user?.services?.find((s) => s.id === serviceId);
    return service ? service["service-name"] : "Unknown Service";
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden mb-8">
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
            {appointments.map((appointment) => (
              <tr
                key={appointment.ID}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(appointment.datetime).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getServiceName(appointment.service)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={getAppointmentStatus(appointment)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/client/appointments/${appointment.ID}`}
                      className="text-[#9f6eff] hover:text-[#8b4ff7]"
                    >
                      View
                    </Link>
                    {getAppointmentStatus(appointment) === "pending" && (
                      <Link
                        href={`/dashboard/client/appointments/book?id=${appointment.ID}`}
                        className="text-[#9f6eff] hover:text-[#8b4ff7]"
                      >
                        Edit
                      </Link>
                    )}
                    {(getAppointmentStatus(appointment) === "pending" ||
                      getAppointmentStatus(appointment) === "confirmed") && (
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          // Handle cancellation logic here
                          alert(`Cancel appointment ${appointment.ID}`);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to determine appointment status
function getAppointmentStatus(appointment: Appointment): string {
  // This is a placeholder - in a real app, you'd use the actual status from the API
  const appointmentDate = new Date(appointment.datetime);
  const now = new Date();

  // If appointment has a status property, use that
  if ((appointment as any).status) {
    return (appointment as any).status;
  }

  // Otherwise determine based on date
  if (appointmentDate < now) {
    return "completed";
  } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return "confirmed";
  } else {
    return "pending";
  }
}
