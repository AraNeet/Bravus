"use client"

import { Calendar } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "./hooks/useAuth"
import Header from "./components/home/header"
import HeroSection from "./components/home/hero-section"
import FeaturesSection from "./components/home/features-section"
import InteractiveCalendar from "./components/home/interactive-calendar"

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth()

  useEffect(() => {
    createStars()
  }, [])

  const createStars = () => {
    const starsContainer = document.getElementById("stars")
    if (!starsContainer) return
    starsContainer.innerHTML = ""

    for (let i = 0; i < 100; i++) {
      const star = document.createElement("span")
      star.className = "star absolute bg-white rounded-full animate-twinkle"
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = Math.random() * 2
      star.style.left = `${x}%`
      star.style.top = `${y}%`
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.animationDelay = `${Math.random() * 1}s`
      starsContainer.appendChild(star)
    }
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#2c1250] text-white">
      {/* Header */}
      <Header isLoggedIn={isLoggedIn} isLoading={isLoading} />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Calendar view section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
          <aside id="stars" className="fixed inset-0 pointer-events-none" />

          <aside className="absolute inset-0 pointer-events-none">
            <span className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9f6eff] rounded-full opacity-10 blur-3xl" />
            <span className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c061f7] rounded-full opacity-10 blur-3xl" />
          </aside>

          <article className="container mx-auto relative z-10">
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
                  <span className="text-sm font-medium">Smart Appointment Manager</span>
                </button>
              </figcaption>
            </figure>
          </article>
        </section>

        {/* Features Section */}
        <FeaturesSection />
      </main>
    </article>
  )
}

