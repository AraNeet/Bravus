"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./hooks/useAuth";
import UserProfileCircle from "./components/user-profile-circle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  LineChart, 
  Search, 
  BarChart2, 
  Settings, 
  Database, 
  Zap,
  CheckCircle2, 
  User,
  Sheet,
  Calendar
} from "lucide-react";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full py-4 bg-navy/90 backdrop-blur-sm z-50 border-b border-white/10">
        <div className="container mx-auto px-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                Bravus
              </span>
            </Link>

            <ul className="hidden md:flex items-center gap-8">
              <li>
                <a href="#features" className="nav-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="nav-link">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="nav-link">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#blog" className="nav-link">
                  Blog
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
              ) : isLoggedIn ? (
                <UserProfileCircle />
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Button variant="accent" className="text-navy">
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy/50 pointer-events-none" />
          
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 text-center md:text-left">
                <Badge variant="accent" className="mb-6">
                  <span className="text-navy">Bravus Tools</span>
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Elevate your<br />business.
                </h1>
                <p className="text-lg md:text-xl text-gteal mb-8 max-w-lg">
                  Elevate your business with Bravus Tools all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="navy" size="lg" className="border border-spink/20">
                    Get Started
                  </Button>
                </div>
              </div>
              
              <div className="md:w-1/2 relative">
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute top a-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 rotate-12 animate-float">
                      <div className="bg-navy h-24 w-24 rounded-md border border-spink/20 shadow-lg"></div>
                      <div className="bg-navy h-24 w-24 rounded-md border border-spink/20 shadow-lg"></div>
                      <div className="bg-navy h-24 w-24 rounded-md border border-spink/20 shadow-lg"></div>
                      <div className="bg-navy h-24 w-24 rounded-md border border-spink/20 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Everything you need section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center mb-16">
            <h2 className="text-2xl font-semibold mb-6">Everything you need</h2>
            
            <h3 className="text-3xl font-bold max-w-2xl mx-auto mb-6">
              All at your fingertips. Simple and easy to use. Brilliant results.
            </h3>
          </div>
          
          {/* Dashboard Preview */}
          <div className="max-w-6xl mx-auto mb-20 rounded-xl overflow-hidden border border-white/10">
            <img 
              src="/images/dashboard-preview.svg" 
              alt="Dashboard Dashboard Preview" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/1200x600/121420/F4A4A6?text=Dashboard+Preview";
              }}
            />
          </div>
          
          {/* Features Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="navy" className="border border-white/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-spink/20 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-spink" />
                </div>
                <CardTitle className="text-xl">Appointments Scheduler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gteal">
                  Easy to use client scheduling tool. Create, edit and delete appointments.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="navy" className="border border-white/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-spink/20 flex items-center justify-center mb-4">
                  <Sheet className="w-6 h-6 text-spink" />
                </div>
                <CardTitle className="text-xl">Spreadsheets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gteal">
                  Simple and easy to use spreadsheets. Create, edit and delete spreadsheets. and more.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="navy" className="border border-white/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-spink/20 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-spink" />
                </div>
                <CardTitle className="text-xl">Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gteal">
                  Simple and easy to use for your clients. To bring them to your business.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
  
        {/* Pricing Section */}
        <section className="py-20 px-4 bg-navy/50" id="pricing">
          <div className="container mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Pricing</h2>
            <p className="text-xl text-gteal max-w-2xl mx-auto">
              Start for free and upgrade to a paid plan as new features are added.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
              <Card variant="bordered" className="flex flex-col">
                <CardHeader className="text-center">
                  <h3 className="text-xl mb-2">Basic</h3>
                  <CardTitle className="text-4xl font-bold">Free</CardTitle>
                  <p className="text-sm text-gteal">per month</p>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <Button variant="outline" className="mb-6">Get Started</Button>
                  
                  <ul className="space-y-4 mt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-spink" />
                      <span>Appointments Scheduler</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-spink" />
                      <span>Clients Advertising</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-spink" />
                      <span>Spreadsheets</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-xl bg-spink/20 mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-8 h-8 text-spink" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Bravus tools is here to help you.
              </h2>
              <p className="text-lg text-gteal mb-8">
                New features are added every month.
              </p>
              <Button variant="muted" size="lg">
                Try for Free
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="text-xl font-bold mb-2">Bravus</div>
              <p className="text-sm text-gteal">© {new Date().getFullYear()} Bravus. All rights reserved.</p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gteal hover:text-white">Features</a>
              <a href="#" className="text-sm text-gteal hover:text-white">Pricing</a>
              <a href="#" className="text-sm text-gteal hover:text-white">Privacy</a>
              <a href="#" className="text-sm text-gteal hover:text-white">Terms</a>
              <a href="#" className="text-sm text-gteal hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
