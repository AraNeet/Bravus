import type React from "react"
import { ArrowRight, Shield, Clock, Star } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
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
            Streamline your small business with our all-in-one dashboard. Manage inventory, appointments, and get
            AI-powered insights to help your business grow.
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
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-[#9f6eff]" />}
              title="Secure Platform"
              description="Enterprise-grade security for your business data"
            />
            <FeatureCard
              icon={<Clock className="w-7 h-7 text-[#9f6eff]" />}
              title="Time-Saving"
              description="Automate routine tasks and focus on growth"
            />
            <FeatureCard
              icon={<Star className="w-7 h-7 text-[#9f6eff]" />}
              title="Built by Experts"
              description="Developed by Aramis Martinez, Full-Stack Developer"
            />
          </section>
        </header>
      </article>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="p-8">
      <figure className="w-14 h-14 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center mx-auto mb-6">
        {icon}
      </figure>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-white/60">{description}</p>
    </article>
  )
}

