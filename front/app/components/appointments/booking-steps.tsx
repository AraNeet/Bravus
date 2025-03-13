import type React from "react"
import { User, Package, Calendar, Clock } from "lucide-react"

interface BookingStepsProps {
  step: number
}

export default function BookingSteps({ step }: BookingStepsProps) {
  return (
    <div className="flex items-center justify-between mb-8 flex-wrap">
      <StepItem step={1} currentStep={step} icon={<User className="w-5 h-5" />} label="Select Provider" />

      <div className="w-8 h-0.5 bg-white/10 hidden md:block">
        <div className={`h-full ${step >= 2 ? "bg-[#9f6eff]" : "bg-transparent"}`}></div>
      </div>

      <StepItem step={2} currentStep={step} icon={<Package className="w-5 h-5" />} label="Select Service" />

      <div className="w-8 h-0.5 bg-white/10 hidden md:block">
        <div className={`h-full ${step >= 3 ? "bg-[#9f6eff]" : "bg-transparent"}`}></div>
      </div>

      <StepItem step={3} currentStep={step} icon={<Calendar className="w-5 h-5" />} label="Select Date" />

      <div className="w-8 h-0.5 bg-white/10 hidden md:block">
        <div className={`h-full ${step >= 4 ? "bg-[#9f6eff]" : "bg-transparent"}`}></div>
      </div>

      <StepItem step={4} currentStep={step} icon={<Clock className="w-5 h-5" />} label="Select Time" />
    </div>
  )
}

interface StepItemProps {
  step: number
  currentStep: number
  icon: React.ReactNode
  label: string
}

function StepItem({ step, currentStep, icon, label }: StepItemProps) {
  const isActive = currentStep >= step

  return (
    <div className="flex-1 flex flex-col items-center min-w-[100px] mb-4 md:mb-0">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
          isActive ? "bg-[#9f6eff] text-white" : "bg-white/10 text-white/50"
        }`}
      >
        {icon}
      </div>
      <span className={`text-sm ${isActive ? "text-white" : "text-white/50"}`}>{label}</span>
    </div>
  )
}

