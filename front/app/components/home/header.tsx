"use client"

import { Calendar } from "lucide-react"
import Link from "next/link"
import UserProfileCircle from "../user-profile-circle"

interface HeaderProps {
  isLoggedIn: boolean
  isLoading: boolean
}

export default function Header({ isLoggedIn, isLoading }: HeaderProps) {
  return (
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
            <li>
              <a href="#solutions" className="nav-link">
                Solutions
              </a>
            </li>
            <li>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
            </li>
            <li>
              <a href="#contact" className="nav-link">
                Contact
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
                <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
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
  )
}

