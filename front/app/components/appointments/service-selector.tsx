"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Service, OwnerWithServices } from "@/app/api/types"

interface ServiceSelectorProps {
  selectedOwner: string
  selectedService: string
  setSelectedService: (id: string) => void
  services: Service[]
  owners: OwnerWithServices[]
  onBack: () => void
  onContinue: () => void
}

export default function ServiceSelector({
  selectedOwner,
  selectedService,
  setSelectedService,
  services,
  owners,
  onBack,
  onContinue,
}: ServiceSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Service</h2>

      <div className="bg-[#9f6eff]/10 rounded-lg p-4 border border-[#9f6eff]/30 mb-6">
        <p className="font-medium">Selected Provider:</p>
        <p className="text-lg">
          {owners.find((o) => o.id === selectedOwner)?.firstname} {owners.find((o) => o.id === selectedOwner)?.lastname}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service: Service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className={`p-4 rounded-lg text-left transition-colors ${
              selectedService === service.id
                ? "bg-[#9f6eff]/20 border border-[#9f6eff]/50"
                : "bg-white/5 border border-white/10 hover:bg-white/10"
            }`}
          >
            <h3 className="font-medium text-lg">{service["service-name"]}</h3>
            <p className="text-white/60 text-sm mb-2">{service["service-desc"]}</p>
            <p className="text-[#9f6eff] font-medium">${service.price.toFixed(2)}</p>
          </button>
        ))}
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
          onClick={onContinue}
          disabled={!selectedService}
          className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

