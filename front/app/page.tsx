"use client";

import {
  Calendar,
  Bell,
  Users,
  ArrowRight,
  Shield,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./hooks/useAuth";
import UserProfileCircle from "./components/user-profile-circle";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    createStars();
  }, []);

  const createStars = () => {
    const starsContainer = document.getElementById("stars");
    if (!starsContainer) return;
    starsContainer.innerHTML = "";

    for (let i = 0; i < 100; i++) {
      const star = document.createElement("span");
      star.className = "star absolute bg-white rounded-full animate-twinkle";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${Math.random() * 1}s`;
      starsContainer.appendChild(star);
    }
  };

  return (
    <article className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header - Made smaller */}
      <header className="fixed top-0 left-0 w-full py-4 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm z-50">
        <section className="container mx-auto px-6">
          <nav className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 group">
              <figure className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#9f6eff]" />
              </figure>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Bravus
              </span>
            </a>

            <ul className="hidden md:flex items-center gap-8">
              <li>
                <a href="#features" className="nav-link">
                  Features
                </a>
              </li>
            </ul>

            <section className="flex items-center gap-4">
              {isLoading ? (
                // Show loading skeleton while checking auth status
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
              ) : isLoggedIn ? (
                // Show user profile circle when logged in
                <UserProfileCircle />
              ) : (
                // Show login/signup buttons when not logged in
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-lg border border-white/10 backdrop-blur-sm"
                  >
                    Start Free
                  </Link>
                </>
              )}
            </section>
          </nav>
        </section>
      </header>

      <main>
        {/* Hero Section - Increased spacing */}
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
          <aside id="stars" className="fixed inset-0 pointer-events-none" />

          <aside className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9f6eff] rounded-full opacity-10 blur-3xl" />
            <span className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c061f7] rounded-full opacity-10 blur-3xl" />
          </aside>

          <article className="container mx-auto relative z-10">
            <header className="text-center max-w-4xl mx-auto mb-24">
              <h1 className="text-6xl md:text-8xl font-bold mb-12 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text leading-tight">
                Smart Business Management for Small Teams
              </h1>

              <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto leading-relaxed">
                Streamline your small business with our all-in-one dashboard.
                Manage inventory, appointments, and get AI-powered insights to
                help your business grow.
              </p>

              <section className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                <a
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-10 py-5 rounded-full text-lg font-medium transition-all hover:scale-105 hover:shadow-lg border border-white/10 backdrop-blur-sm group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#9f6eff] hover:bg-[#8b4ff7] px-10 py-5 rounded-full text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#9f6eff]/25"
                >
                  Watch Demo
                </a>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-24">
                <article className="p-8">
                  <figure className="w-14 h-14 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-7 h-7 text-[#9f6eff]" />
                  </figure>
                  <h3 className="text-lg font-semibold mb-3">
                    Secure Platform
                  </h3>
                  <p className="text-white/60">
                    Enterprise-grade security for your business data
                  </p>
                </article>
                <article className="p-8">
                  <figure className="w-14 h-14 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-7 h-7 text-[#9f6eff]" />
                  </figure>
                  <h3 className="text-lg font-semibold mb-3">Time-Saving</h3>
                  <p className="text-white/60">
                    Automate routine tasks and focus on growth
                  </p>
                </article>
                <article className="p-8">
                  <figure className="w-14 h-14 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-7 h-7 text-[#9f6eff]" />
                  </figure>
                  <h3 className="text-lg font-semibold mb-3">
                    Built by Experts
                  </h3>
                  <p className="text-white/60">
                    Developed by Aramis Martinez, Full-Stack Developer
                  </p>
                </article>
              </section>
            </header>

            {/* Calendar view section - Made responsive */}
            <figure className="relative max-w-4xl mx-auto">
              <section className="relative w-full bg-[#1a0b2e] rounded-2xl overflow-hidden border border-white/10 mb-12 p-4 md:p-6">
                <span className="absolute inset-0 bg-gradient-to-br from-[#9f6eff]/20 to-transparent" />
                <section className="relative flex items-center justify-center">
                  <InteractiveCalendar />
                </section>
              </section>

              <figcaption className="relative z-10 flex justify-center">
                <button className="inline-flex items-center gap-2 bg-[#9f6eff] px-6 py-3 rounded-full shadow-lg hover:bg-[#8b4ff7] transition-colors">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Smart Appointment Manager
                  </span>
                </button>
              </figcaption>
            </figure>
          </article>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative">
          <article className="container mx-auto px-4">
            <header className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
                Powerful Tools for Small Business Success
              </h2>
              <p className="text-lg text-white/60">
                Everything you need to manage your store, salon, or service
                business in one intuitive platform
              </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <article className="feature-card group">
                <figure className="mb-6 w-12 h-12 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center group-hover:bg-[#9f6eff]/30 transition-colors">
                  <Calendar className="w-6 h-6 text-[#9f6eff]" />
                </figure>
                <h3 className="text-xl font-semibold mb-4">
                  Appointment Management
                </h3>
                <p className="text-white/60 mb-6">
                  Easily schedule and manage client appointments. Reduce
                  no-shows with automated reminders and keep your business
                  running smoothly.
                </p>
                <footer className="pt-6 border-t border-white/10">
                  <a
                    href="#learn-more"
                    className="inline-flex items-center gap-2 text-[#9f6eff] hover:gap-3 transition-all"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </footer>
              </article>

              <article className="feature-card group">
                <figure className="mb-6 w-12 h-12 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center group-hover:bg-[#9f6eff]/30 transition-colors">
                  <Bell className="w-6 h-6 text-[#9f6eff]" />
                </figure>
                <h3 className="text-xl font-semibold mb-4">
                  Inventory Tracking
                </h3>
                <p className="text-white/60 mb-6">
                  Keep track of your products and supplies with our intuitive
                  inventory management system. Get alerts when stock is low and
                  manage orders efficiently.
                </p>
                <footer className="pt-6 border-t border-white/10">
                  <a
                    href="#learn-more"
                    className="inline-flex items-center gap-2 text-[#9f6eff] hover:gap-3 transition-all"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </footer>
              </article>

              <article className="feature-card group md:col-span-2 max-w-2xl mx-auto">
                <figure className="mb-6 w-12 h-12 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center group-hover:bg-[#9f6eff]/30 transition-colors">
                  <Users className="w-6 h-6 text-[#9f6eff]" />
                </figure>
                <h3 className="text-xl font-semibold mb-4">
                  AI-Powered Insights
                </h3>
                <p className="text-white/60 mb-6">
                  Get smart suggestions based on your business data. Our AI
                  assistant helps you make informed decisions, optimize
                  operations, and identify growth opportunities.
                </p>
                <footer className="pt-6 border-t border-white/10">
                  <a
                    href="#learn-more"
                    className="inline-flex items-center gap-2 text-[#9f6eff] hover:gap-3 transition-all"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </footer>
              </article>
            </section>
          </article>
        </section>
      </main>
    </article>
  );
}

// Sample event data
const EVENTS = {
  "2024-03-08": [
    {
      id: 1,
      title: "Team Meeting",
      time: "10:00 AM - 11:00 AM",
      color: "#9f6eff",
    },
    {
      id: 2,
      title: "Product Review",
      time: "2:00 PM - 3:00 PM",
      color: "#c061f7",
    },
  ],
  "2024-03-15": [
    {
      id: 3,
      title: "Client Call",
      time: "9:00 AM - 10:00 AM",
      color: "#9f6eff",
    },
    {
      id: 4,
      title: "Inventory Check",
      time: "1:00 PM - 2:00 PM",
      color: "#c061f7",
    },
  ],
  "2024-03-22": [
    {
      id: 5,
      title: "Marketing Meeting",
      time: "11:00 AM - 12:00 PM",
      color: "#9f6eff",
    },
  ],
};

function InteractiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

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
  ];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateString);

    // Get events for selected date
    const events = EVENTS[dateString as keyof typeof EVENTS] || [];
    setSelectedEvents(events);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    // Create blank spaces for days before the first day of the month
    const blanks = Array(firstDay)
      .fill(null)
      .map((_, i) => (
        <span key={`blank-${i}`} className="aspect-square"></span>
      ));

    // Create day buttons
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const hasEvents = EVENTS[dateString as keyof typeof EVENTS] !== undefined;
      const isSelected = dateString === selectedDate;

      return (
        <button
          key={`day-${day}`}
          onClick={() => handleDateClick(day)}
          className={`
            aspect-square flex items-center justify-center rounded 
            ${isMobile ? "text-[7px]" : "text-[9px] sm:text-[10px]"}
            ${
              isSelected
                ? "bg-[#9f6eff] text-white"
                : hasEvents
                ? "bg-[#9f6eff]/20 text-[#9f6eff]"
                : "hover:bg-white/10"
            }
            transition-colors cursor-pointer
          `}
        >
          {day}
        </button>
      );
    });

    return [...blanks, ...days];
  };

  return (
    <article className="w-full max-w-full sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
      <header className="flex items-center gap-2 px-2 py-1.5 border-b border-white/10">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <span className="w-2 h-2 rounded-full bg-[#28c840]" />
      </header>

      {/* Calendar Interface */}
      <section className="p-2 sm:p-3 md:p-4">
        <header className="flex items-center justify-between mb-2">
          <section className="flex items-center gap-1.5">
            <figure className="bg-[#9f6eff]/20 p-0.5 rounded-lg">
              <Calendar
                className={`${
                  isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                } text-[#9f6eff]`}
              />
            </figure>
            <section className="text-left">
              <h4
                className={`${
                  isMobile ? "text-[9px]" : "text-[10px] sm:text-xs"
                } font-medium text-white`}
              >
                {monthNames[currentMonth]}
              </h4>
              <p
                className={`${
                  isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"
                } text-white/60`}
              >
                {currentYear}
              </p>
            </section>
          </section>
          <nav className="flex items-center gap-0.5">
            <button
              onClick={prevMonth}
              className="p-0.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft
                className={`${
                  isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                } text-white/60`}
              />
            </button>
            <button
              onClick={nextMonth}
              className="p-0.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight
                className={`${
                  isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                } text-white/60`}
              />
            </button>
          </nav>
        </header>

        {/* Calendar Grid */}
        <section className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span
              key={day}
              className={`${
                isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"
              } text-white/40 py-0.5`}
            >
              {day}
            </span>
          ))}
        </section>

        <section className="grid grid-cols-7 gap-0.5">
          {generateCalendarDays()}
        </section>

        {/* Events Preview */}
        <section className="mt-2 space-y-1">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <article
                key={event.id}
                className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg"
              >
                <span
                  className="w-0.5 h-0.5 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <section className="min-w-0 flex-1">
                  <h5
                    className={`${
                      isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"
                    } font-medium text-white truncate`}
                  >
                    {event.title}
                  </h5>
                  <time
                    className={`${
                      isMobile ? "text-[6px]" : "text-[7px] sm:text-[8px]"
                    } text-white/60`}
                  >
                    {event.time}
                  </time>
                </section>
              </article>
            ))
          ) : selectedDate ? (
            <p
              className={`${
                isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"
              } text-white/60 text-center py-1`}
            >
              No events scheduled for this day
            </p>
          ) : (
            <article className="flex items-center gap-1.5 bg-[#9f6eff]/10 p-1 rounded-lg">
              <span className="w-0.5 h-0.5 rounded-full bg-[#9f6eff]" />
              <section className="min-w-0 flex-1">
                <h5
                  className={`${
                    isMobile ? "text-[7px]" : "text-[8px] sm:text-[9px]"
                  } font-medium text-white truncate`}
                >
                  Select a date to view events
                </h5>
                <p
                  className={`${
                    isMobile ? "text-[6px]" : "text-[7px] sm:text-[8px]"
                  } text-white/60`}
                >
                  Dates with events are highlighted
                </p>
              </section>
            </article>
          )}
        </section>
      </section>
    </article>
  );
}
