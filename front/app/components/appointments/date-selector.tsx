"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDateForDisplay } from "@/app/utils/date-utils"

interface DateSelectorProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  onBack: () => void
  onContinue: () => void
}

export default function DateSelector({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  onBack,
  onContinue,
}: DateSelectorProps) {
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const currentYear = currentMonth.getFullYear()
    const currentMonthIndex = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonthIndex)

    // Create blank spaces for days before the first day of the month
    const blanks = Array(firstDay)
      .fill(null)
      .map((_, i) => <span key={`blank-${i}`} className="aspect-square"></span>)

    // Create day buttons
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = new Date(currentYear, currentMonthIndex, day)
      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
      const isToday = date.toDateString() === new Date().toDateString()

      return (
        <button
          key={`day-${day}`}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`
            aspect-square flex items-center justify-center rounded-lg text-sm
            ${isSelected ? "bg-[#9f6eff] text-white" : ""}
            ${isPast ? "text-white/30 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"}
            ${isToday && !isSelected ? "border border-[#9f6eff]/50 text-[#9f6eff]" : ""}
          `}
        >
          {day}
        </button>
      )
    })

    return [...blanks, ...days]
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Date</h2>

      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">
            {currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth)
                newMonth.setMonth(newMonth.getMonth() - 1)
                setCurrentMonth(newMonth)
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth)
                newMonth.setMonth(newMonth.getMonth() + 1)
                setCurrentMonth(newMonth)
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

        <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
      </div>

      {selectedDate && (
        <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30">
          <p className="font-medium">Selected Date:</p>
          <p className="text-lg">{formatDateForDisplay(selectedDate)}</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={onContinue}
          disabled={!selectedDate}
          className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

