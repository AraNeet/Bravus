"use client"

import { ChevronLeft, Info } from "lucide-react"
import { formatDateForDisplay, formatTimeStringForDisplay, isValidDateTimeFormat } from "@/app/utils/date-utils"

interface TimeSelectorProps {
  selectedDate: Date | null
  selectedTime: string
  setSelectedTime: (time: string) => void
  availableTimes: string[]
  notes: string
  setNotes: (notes: string) => void
  dateTimeString: string
  onBack: () => void
  onSubmit: () => void
  isEditMode: boolean
}

export default function TimeSelector({
  selectedDate,
  selectedTime,
  setSelectedTime,
  availableTimes,
  notes,
  setNotes,
  dateTimeString,
  onBack,
  onSubmit,
  isEditMode,
}: TimeSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Time</h2>

      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <p className="font-medium mb-4">Available times for {selectedDate && formatDateForDisplay(selectedDate)}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2 px-4 rounded-lg text-center transition-colors ${
                selectedTime === time ? "bg-[#9f6eff] text-white" : "bg-white/5 hover:bg-white/10"
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
          <p className="text-lg">{formatTimeStringForDisplay(selectedTime)}</p>
        </div>
      )}

      {/* Date-Time Format Display */}
      <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30 mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-[#9f6eff] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-white mb-1">Appointment Date & Time</p>
            <p className="text-white/80">
              {isValidDateTimeFormat(dateTimeString) ? dateTimeString : "Please select a valid date and time"}
            </p>
            <p className="text-xs text-white/60 mt-1">Format: YYYY-MM-DD HH:mm</p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-white/80 mb-2">
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
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={onSubmit}
          disabled={!selectedTime || !isValidDateTimeFormat(dateTimeString)}
          className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditMode ? "Update Appointment" : "Book Appointment"}
        </button>
      </div>
    </div>
  )
}

