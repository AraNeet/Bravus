"use client"

import type { OwnerWithServices } from "@/app/api/types"
import { ChevronRight } from "lucide-react"

interface ProviderSelectorProps {
  owners: OwnerWithServices[]
  selectedOwner: string
  setSelectedOwner: (id: string) => void
  onContinue: () => void
}

export default function ProviderSelector({
  owners,
  selectedOwner,
  setSelectedOwner,
  onContinue,
}: ProviderSelectorProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select a Service Provider</h2>

      {owners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {owners.map((owner) => (
            <button
              key={owner.id}
              onClick={() => setSelectedOwner(owner.id)}
              className={`p-4 rounded-lg text-left transition-colors ${
                selectedOwner === owner.id
                  ? "bg-[#9f6eff]/20 border border-[#9f6eff]/50"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                  {owner.firstname.charAt(0)}
                  {owner.lastname.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {owner.firstname} {owner.lastname}
                  </h3>
                  <p className="text-white/60 text-sm">{owner.career || "Service Provider"}</p>
                </div>
              </div>

              {owner.services && owner.services.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-2">Services offered:</p>
                  <div className="flex flex-wrap gap-2">
                    {owner.services.slice(0, 3).map((service: any) => (
                      <span key={service.id} className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {service["service-name"]}
                      </span>
                    ))}
                    {owner.services.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        +{owner.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <p className="text-white/60">No service providers available at the moment.</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onContinue}
          disabled={!selectedOwner}
          className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

