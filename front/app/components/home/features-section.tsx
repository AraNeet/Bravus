import type React from "react"
import { ArrowRight, Calendar, Bell, Users } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      <article className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-transparent bg-clip-text">
            Powerful Tools for Small Business Success
          </h2>
          <p className="text-lg text-white/60">
            Everything you need to manage your store, salon, or service business in one intuitive platform
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Calendar className="w-6 h-6 text-[#9f6eff]" />}
            title="Appointment Management"
            description="Easily schedule and manage client appointments. Reduce no-shows with automated reminders and keep your business running smoothly."
          />

          <FeatureCard
            icon={<Bell className="w-6 h-6 text-[#9f6eff]" />}
            title="Inventory Tracking"
            description="Keep track of your products and supplies with our intuitive inventory management system. Get alerts when stock is low and manage orders efficiently."
          />

          <article className="feature-card group md:col-span-2 max-w-2xl mx-auto">
            <figure className="mb-6 w-12 h-12 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center group-hover:bg-[#9f6eff]/30 transition-colors">
              <Users className="w-6 h-6 text-[#9f6eff]" />
            </figure>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
            <p className="text-white/60 mb-6">
              Get smart suggestions based on your business data. Our AI assistant helps you make informed decisions,
              optimize operations, and identify growth opportunities.
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
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="feature-card group">
      <figure className="mb-6 w-12 h-12 bg-[#9f6eff]/20 rounded-xl flex items-center justify-center group-hover:bg-[#9f6eff]/30 transition-colors">
        {icon}
      </figure>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-white/60 mb-6">{description}</p>
      <footer className="pt-6 border-t border-white/10">
        <a href="#learn-more" className="inline-flex items-center gap-2 text-[#9f6eff] hover:gap-3 transition-all">
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </footer>
    </article>
  )
}

