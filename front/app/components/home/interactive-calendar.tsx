"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"

// Sample event data
const EVENTS = {
  "2024-03-08": [
    { id: 1, title: "Team Meeting", time: "10:00 AM - 11:00 AM", color: "#9f6eff" },
    { id: 2, title: "Product Review", time: "2:00 PM - 3:00 PM", color: "#c061f7" },
  ],
  "2024-03-15": [
    { id: 3, title: "Client Call", time: "9:00 AM - 10:00 AM", color: "#9f6eff" },
    { id: 4, title: "Inventory Check", time: "1:00 PM - 2:00 PM", color: "#c061f7" },
  ],
  "2024-03-22": [{ id: 5, title: "Marketing Meeting", time: "11:00 AM - 12:00 PM", color: "#9f6eff" }],
}

// Month names for display
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function InteractiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDate(null)
    setSelectedEvents([])
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDate(null)
    setSelectedEvents([])
  }

  // Handle date selection
  const handleDateClick = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateString)

    // Get events for selected date
    const events = EVENTS[dateString as keyof typeof EVENTS] || []
    setSelectedEvents(events)
  }

  return (
    <article className="w-full max-w-full sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
      <CalendarHeader
        monthName={monthNames[currentMonth]}
        year={currentYear}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        isMobile={isMobile}
      />

      {/* Calendar Interface */}
      <section className="p-2 sm:p-3 md:p-4">
        {/* Calendar Grid */}
        <CalendarGrid
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDate={selectedDate}
          handleDateClick={handleDateClick}
          isMobile={isMobile}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
          monthNames={monthNames}
        />

        {/* Events Preview */}
        <EventsPreview selectedDate={selectedDate} selectedEvents={selectedEvents} isMobile={isMobile} />
      </section>
    </article>
  )
}

interface CalendarHeaderProps {
  monthName: string
  year: number
  prevMonth: () => void
  nextMonth: () => void
  isMobile: boolean
}

function CalendarHeader({ monthName, year, prevMonth, nextMonth, isMobile }: CalendarHeaderProps) {
  return (
    <header className="flex items-center gap-2 px-2 py-1.5 border-b border-white/10">
      <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
      <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
      <span className="w-2 h-2 rounded-full bg-[#28c840]" />
    </header>
  )
}

interface CalendarGridProps {
  currentMonth: number
  currentYear: number
  selectedDate: string | null
  handleDateClick: (day: number) => void
  isMobile: boolean
  prevMonth: () => void
  nextMonth: () => void
  monthNames: string[]
}

function CalendarGrid({
  currentMonth,
  currentYear,
  selectedDate,
  handleDateClick,
  isMobile,
  prevMonth,
  nextMonth,
  monthNames,
}: CalendarGridProps) {
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
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

    // Create blank spaces for days before the first day of the month
    const blanks = Array(firstDay)
      .fill(null)
      .map((_, i) => <span key={`blank-${i}`} className="aspect-square"></span>)

    // Create day buttons
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const hasEvents = EVENTS[dateString as keyof typeof EVENTS] !== undefined
      const isSelected = dateString === selectedDate

      return (
        <button
          key={`day-${day}`}
          onClick={() => handleDateClick(day)}
          className={`
            aspect-square flex items-center justify-center rounded 
            ${isMobile ? "text-[7px]" : "text-[9px] sm:text-[10px]"}
            ${isSelected ? "bg-[#9f6eff] text-white" : hasEvents ? "bg-[#9f6eff]/20 text-[#9f6eff]" : "hover:bg-white/10"}
            transition-colors cursor-pointer
          `}
        >
          {day}
        </button>
      )
    })

    return [...blanks, ...days]
  }

  return (
    <>
      <header className="flex items-center justify-between mb-2">
        <section className="flex items-center gap-1.5">
          <figure className="bg-[#9f6eff]/20 p-0.5 rounded-lg">
            <CalendarIcon className={`${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} text-[#9f6eff]`} />
          </figure>
          <section className="text-left">
            <h4 className={`${isMobile ? "text-[9px]" : "text-[10px] sm:text-xs"} font-medium text-white`}>
              {monthNames[currentMonth]}
            </h4>
            <p className={`${isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"} text-white/60`}>{currentYear}</p>
          </section>
        </section>
        <nav className="flex items-center gap-0.5">
          <button
            onClick={prevMonth}
            className="p-0.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className={`${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} text-white/60`} />
          </button>
          <button
            onClick={nextMonth}
            className="p-0.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className={`${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} text-white/60`} />
          </button>
        </nav>
      </header>

      {/* Calendar Grid */}
      <section className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className={`${isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"} text-white/40 py-0.5`}>
            {day}
          </span>
        ))}
      </section>

      <section className="grid grid-cols-7 gap-0.5">{generateCalendarDays()}</section>
    </>
  )
}

interface EventsPreviewProps {
  selectedDate: string | null
  selectedEvents: any[]
  isMobile: boolean
}

function EventsPreview({ selectedDate, selectedEvents, isMobile }: EventsPreviewProps) {
  return (
    <section className="mt-2 space-y-1">
      {selectedEvents.length > 0 ? (
        selectedEvents.map((event) => (
          <article key={event.id} className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg">
            <span className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: event.color }} />
            <section className="min-w-0 flex-1">
              <h5 className={`${isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"} font-medium text-white truncate`}>
                {event.title}
              </h5>
              <time className={`${isMobile ? "text-[6px]" : "text-[7px] sm:text-[8px]"} text-white/60`}>
                {event.time}
              </time>
            </section>
          </article>
        ))
      ) : selectedDate ? (
        <p className={`${isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"} text-white/60 text-center py-1`}>
          No events scheduled for this day
        </p>
      ) : (
        <article className="flex items-center gap-1.5 bg-[#9f6eff]/10 p-1 rounded-lg">
          <span className="w-0.5 h-0.5 rounded-full bg-[#9f6eff]" />
          <section className="min-w-0 flex-1">
            <h5 className={`${isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"} font-medium text-white truncate`}>
              Select a date to view events
            </h5>
            <p className={`${isMobile ? "text-[6px]" : "text-[7px] sm:text-[8px]"} text-white/60`}>
              Dates with events are highlighted
            </p>
          </section>
        </article>
      )}
    </section>
  )
}

