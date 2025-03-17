"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  ChevronRight,
  ArrowLeft,
  Clock,
  DollarSign,
  MessageSquare,
  UserCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { getOwners, getOwnerServices } from "@/app/api/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { OwnerWithServices } from "@/app/api/users";
import type { Service } from "@/app/api/types";
import Link from "next/link";

// Define fallback components if imports fail
const SkeletonFallback = (props: any) => (
  <div className="bg-white/10 animate-pulse" {...props} />
);
const Avatar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-full overflow-hidden flex items-center justify-center ${className}`}
  >
    {children}
  </div>
);
const AvatarFallback = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`w-full h-full flex items-center justify-center ${className}`}
  >
    {children}
  </div>
);

export default function ProvidersPage() {
  const [owners, setOwners] = useState<OwnerWithServices[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<OwnerWithServices | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  // Fetch owners on page load
  useEffect(() => {
    async function fetchOwners() {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching providers...");
        const ownersData = await getOwners();
        console.log("Providers fetched:", ownersData);
        setOwners(ownersData);
      } catch (err) {
        console.error("Error fetching providers:", err);
        setError(err.message || "Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    }

    fetchOwners();
  }, []);

  // Fetch services when owner is selected
  useEffect(() => {
    if (selectedOwner) {
      setLoadingServices(true);
      setServices([]);
      
      getOwnerServices(selectedOwner.id)
        .then(servicesData => {
          console.log(`Loaded ${servicesData.length} services for provider ${selectedOwner.id}`, servicesData);
          setServices(servicesData);
        })
        .catch(err => {
          console.error("Error fetching provider services:", err);
        })
        .finally(() => {
          setLoadingServices(false);
        });
    }
  }, [selectedOwner]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/dashboard/client"
          className="text-white/70 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Providers</h1>
          <p className="text-white/70">
            Find and connect with our expert Service Providers
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-[#9f6eff] animate-spin mb-4" />
          <p className="text-white/70">Loading providers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg">
          <p className="text-white font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Providers</h2>
              
              {owners.length > 0 ? (
                <div className="space-y-3">
                  {owners.map((owner) => (
                    <button
                      key={owner.id}
                      onClick={() => setSelectedOwner(owner)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedOwner?.id === owner.id
                          ? "bg-[#9f6eff]/20 border border-[#9f6eff]/50"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9f6eff]/20 flex items-center justify-center">
                          {getInitials(owner.firstname, owner.lastname)}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {owner.firstname || owner.name?.split(' ')[0] || 'Unknown'} {owner.lastname || (owner.name?.split(' ').length > 1 ? owner.name?.split(' ').slice(1).join(' ') : '')}
                          </h3>
                          <p className="text-sm text-white/60">
                            {owner.career || "Service Provider"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-center py-4">No providers found</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
              {selectedOwner ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedOwner.firstname || selectedOwner.name?.split(' ')[0]} {selectedOwner.lastname || (selectedOwner.name?.split(' ').length > 1 ? selectedOwner.name?.split(' ').slice(1).join(' ') : '')}
                      </h2>
                      <p className="text-white/70">{selectedOwner.career || "Service Provider"}</p>
                      
                      {selectedOwner.email && (
                        <p className="text-sm text-white/60 mt-2">
                          {selectedOwner.email} | {selectedOwner.phone || "No phone"}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setLoadingServices(true);
                        getOwnerServices(selectedOwner.id)
                          .then(servicesData => {
                            console.log(`Refreshed services: ${servicesData.length}`);
                            setServices(servicesData);
                          })
                          .catch(err => {
                            console.error("Error refreshing services:", err);
                          })
                          .finally(() => setLoadingServices(false));
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs"
                    >
                      Refresh Services
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4">Services</h3>
                  
                  {loadingServices ? (
                    <div className="py-8 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#9f6eff] animate-spin mb-2" />
                      <p className="text-white/70">Loading services...</p>
                    </div>
                  ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service: Service) => (
                        <div
                          key={service.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                          <h4 className="font-medium text-lg">
                            {service.service_name}
                          </h4>
                          <p className="text-white/60 text-sm mb-2">
                            {service.service_desc}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-[#9f6eff] font-medium">
                              ${service.price.toFixed(2)}
                            </p>
                            <p className="text-white/40 text-xs">
                              {service.duration} min
                            </p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10 text-white/40 text-xs">
                            Service ID: {service.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/5 rounded-lg">
                      <p className="text-white/60 mb-2">No services found for this provider</p>
                      <p className="text-white/40 text-sm">
                        This provider may not have any services configured yet
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <p className="text-white/60 mb-2">Select a provider to view their services</p>
                  <p className="text-white/40 text-sm">
                    Choose a provider from the list on the left
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white/5 to-white/3 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <SkeletonFallback className="h-12 w-12 rounded-full" />
          <SkeletonFallback className="h-5 w-16" />
        </div>
        <SkeletonFallback className="h-7 w-3/4 mt-4" />
        <SkeletonFallback className="h-4 w-1/2 mt-2" />
        <SkeletonFallback className="h-4 w-full mt-2" />
        <SkeletonFallback className="h-4 w-5/6 mt-1" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mt-2">
          <SkeletonFallback className="h-6 w-20 rounded-full" />
          <SkeletonFallback className="h-6 w-24 rounded-full" />
          <SkeletonFallback className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter>
        <SkeletonFallback className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
