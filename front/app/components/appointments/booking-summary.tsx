import type React from "react"
import { User, Package, Calendar, Clock, Info } from "lucide-react"
import type { OwnerWithServices, Service } from "@/app/api/types"
import { formatDateForDisplay, formatTimeStringForDisplay, isValidDateTimeFormat } from "@/app/utils/date-utils"

interface BookingSummaryProps {
  isEditMode: boolean
  selectedOwner: string
  selectedService: string
  selectedDate: Date | null
  selectedTime: string
  notes: string
  dateTimeString: string
  owners: OwnerWithServices[]
  services: Service[]
}

export default function BookingSummary({
  isEditMode,
  selectedOwner,
  selectedService,
  selectedDate,
  selectedTime,
  notes,
  dateTimeString,
  owners,
  services,
}: BookingSummaryProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? "Appointment Summary" : "Booking Summary"}</h2>

      <div className="space-y-4">
        <SummaryItem
          icon={<User className="w-4 h-4 text-[#9f6eff]" />}
          label="Provider"
          value={
            selectedOwner
              ? `${owners.find((o) => o.id === selectedOwner)?.firstname} ${owners.find((o) => o.id === selectedOwner)?.lastname}`
              : "No provider selected"
          }
        />

        <SummaryItem
          icon={<Package className="w-4 h-4 text-[#9f6eff]" />}
          label="Service"
          value={
            selectedService
              ? services.find((s: Service) => s.id === selectedService)?.["service-name"]
              : "No service selected"
          }
          price={
            selectedService ? services.find((s: Service) => s.id === selectedService)?.price.toFixed(2) : undefined
          }
        />

        <SummaryItem
          icon={<Calendar className="w-4 h-4 text-[#9f6eff]" />}
          label="Date"
          value={selectedDate ? formatDateForDisplay(selectedDate) : "No date selected"}
        />

        <SummaryItem
          icon={<Clock className="w-4 h-4 text-[#9f6eff]" />}
          label="Time"
          value={selectedTime ? formatTimeStringForDisplay(selectedTime) : "No time selected"}
        />

        {notes && <SummaryItem icon={<Info className="w-4 h-4 text-[#9f6eff]" />} label="Notes" value={notes} />}

        {isValidDateTimeFormat(dateTimeString) && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="text-sm text-white/60">Standardized Date-Time Format:</p>
            <p className="font-mono bg-white/5 px-3 py-2 rounded mt-1">{dateTimeString}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface SummaryItemProps {
  icon: React.ReactNode
  label: string
  value: string
  price?: string
}

function SummaryItem({ icon, label, value, price }: SummaryItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-lg bg-[#9f6eff]/20 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-white/60">{label}</h3>
        <p className="font-medium">{value}</p>
        {price && <p className="text-[#9f6eff]">${price}</p>}
      </div>
    </div>
  )
}

