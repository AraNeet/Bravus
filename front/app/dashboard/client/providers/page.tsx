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
} from "lucide-react";
import { getOwners } from "@/app/api/users";
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
  const [providers, setProviders] = useState<OwnerWithServices[]>([]);
  const [allProviders, setAllProviders] = useState<OwnerWithServices[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "rating" | "reviews"
  >("all");
  const [showMoreServices, setShowMoreServices] = useState<boolean>(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const data = await getOwners();
        console.log("Fetched providers data:", data);

        if (data.length === 0) {
          console.warn("No providers were returned from the API");
        }

        setProviders(data);
        setAllProviders(data);

        // Extract unique service names for filter tabs
        const services = new Set<string>();
        data.forEach((provider) => {
          provider.services?.forEach((service: Service) => {
            services.add(service.service_name);
          });
        });
        setAvailableServices(Array.from(services) as string[]);
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter providers based on search and filters - this was causing an infinite loop
  useEffect(() => {
    // Only run this effect if we have providers loaded
    if (allProviders.length > 0) {
      let filtered = [...allProviders];

      // Apply sorting based on selected filter
      if (selectedFilter === "rating") {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (selectedFilter === "reviews") {
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      }

      // Filter providers based on search query and selected service
      const filteredProviders = filtered.filter((provider) => {
        // Apply service filter
        const serviceMatch =
          selectedService === "all" ||
          provider.services?.some(
            (service: Service) => service.service_name === selectedService
          );

        // Apply search filter
        const searchMatch =
          !searchQuery ||
          provider.firstname
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          provider.lastname
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          provider.career?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.services?.some(
            (service: Service) =>
              service.service_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              service.service_desc
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          );

        // Filter by selected services if any are selected
        const selectedServicesMatch =
          selectedServices.length === 0 ||
          provider.services?.some((service: Service) =>
            selectedServices.includes(service.id)
          );

        return serviceMatch && searchMatch && selectedServicesMatch;
      });

      setProviders(filteredProviders);
    }
  }, [
    selectedFilter,
    allProviders,
    searchQuery,
    selectedService,
    selectedServices,
  ]);

  // Get unique services from all providers
  useEffect(() => {
    if (allProviders.length) {
      const services = new Set();
      allProviders.forEach((provider) => {
        provider.services?.forEach((service: Service) => {
          services.add(service.service_name);
        });
      });
      setAvailableServices(Array.from(services) as string[]);
    }
  }, [allProviders]);

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

      {/* Service Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex space-x-2 mb-2 w-full overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setSelectedService("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedService === "all"
                ? "bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            All Services
          </button>
          {availableServices.slice(0, 5).map((service, index) => (
            <button
              key={index}
              onClick={() => setSelectedService(service)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedService === service
                  ? "bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {service}
            </button>
          ))}
          {availableServices.length > 5 && (
            <div className="relative group">
              <button
                onClick={() => setShowMoreServices(!showMoreServices)}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 whitespace-nowrap flex items-center"
              >
                More Services
                <ChevronRight
                  className={`h-4 w-4 ml-1 transition-transform ${
                    showMoreServices ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showMoreServices && (
                <div className="absolute top-full left-0 mt-2 bg-[#171A26] border border-white/10 rounded-lg shadow-lg p-2 z-50 max-h-64 overflow-y-auto w-48">
                  {availableServices.slice(5).map((service, index) => (
                    <button
                      key={index}
                      className="w-full text-left text-white hover:bg-white/5 rounded px-3 py-2 cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedService(service);
                        setShowMoreServices(false);
                      }}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2 w-full">
          <div className="text-sm text-white/60 flex items-center mr-2">
            Sort by:
          </div>
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === "all"
                ? "bg-gradient-to-r from-[#9f6eff]/30 to-[#c061f7]/30 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Relevance
          </button>
          <button
            onClick={() => setSelectedFilter("rating")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === "rating"
                ? "bg-gradient-to-r from-[#9f6eff]/30 to-[#c061f7]/30 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Highest Rated
          </button>
          <button
            onClick={() => setSelectedFilter("reviews")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === "reviews"
                ? "bg-gradient-to-r from-[#9f6eff]/30 to-[#c061f7]/30 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Most Reviews
          </button>
        </div>
      </div>

      {/* Error Message */}
      {/* Error Message - Removed */}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* No Results */}
      {providers.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-gradient-to-b from-transparent to-[#0e101a]/50 rounded-xl border border-white/5 px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-white/30" />
          </div>
          <div className="text-white text-xl font-medium mb-2">
            No providers found
          </div>
          <div className="text-white/50 text-md mb-6 max-w-md mx-auto">
            We couldn't find any providers matching your current search
            criteria. Try adjusting your filters or search query.
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedService("all");
              setSelectedServices([]);
              setSelectedFilter("all");
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] text-white rounded-full text-sm font-medium"
          >
            Reset All Filters
          </button>
        </div>
      ) : null}

      {/* Provider Cards */}
      {!isLoading && providers.length > 0 && (
        <>
          {/* View toggle buttons */}
          <div className="flex justify-end mb-4">
            <div className="bg-white/5 rounded-md flex p-1">
              <button
                onClick={() => setViewType("grid")}
                className={`px-3 py-1.5 rounded text-sm ${
                  viewType === "grid"
                    ? "bg-gradient-to-r from-[#9f6eff]/30 to-[#c061f7]/30 text-white"
                    : "text-white/70"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`px-3 py-1.5 rounded text-sm ${
                  viewType === "list"
                    ? "bg-gradient-to-r from-[#9f6eff]/30 to-[#c061f7]/30 text-white"
                    : "text-white/70"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewType === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className="overflow-hidden bg-gradient-to-br from-white/5 to-white/3 border-white/10 hover:border-[#9f6eff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#9f6eff]/10"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-14 w-14 border-2 border-[#9f6eff]/50">
                        <AvatarFallback className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white text-lg font-bold">
                          {getInitials(provider.firstname, provider.lastname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full px-2 py-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-300 font-medium">
                          {provider.rating?.toFixed(1) || "4.8"}
                        </span>
                        <span className="text-xs text-yellow-300/70">
                          ({provider.reviewCount || "16"})
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-3 text-white">
                      {provider.firstname ||
                        provider.name?.split(" ")[0] ||
                        "Unknown"}{" "}
                      {provider.lastname ||
                        provider.name?.split(" ").slice(1).join(" ") ||
                        ""}
                    </CardTitle>
                    <div className="flex items-center text-white/70 text-sm mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                      <span>
                        {provider.location || "Location not specified"}
                      </span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm mt-1">
                      <UserCircle className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                      <span className="font-medium">
                        {provider.career || "Pet Care Provider"}
                      </span>
                    </div>
                    {provider.bio && (
                      <CardDescription className="text-white/70 mt-3 border-l-2 border-[#9f6eff]/30 pl-3 italic line-clamp-2">
                        "{provider.bio}"
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-[#9f6eff]" />
                      Services
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.services
                        ?.slice(0, 3)
                        .map((service: Service) => (
                          <Badge
                            key={service.id}
                            className="bg-gradient-to-r from-[#9f6eff]/20 to-[#c061f7]/20 hover:from-[#9f6eff]/30 hover:to-[#c061f7]/30 text-white border-[#9f6eff]/30"
                          >
                            {service.service_name}
                            {service.price && (
                              <span className="ml-1 text-xs opacity-80">
                                $
                                {typeof service.price === "number"
                                  ? service.price.toFixed(0)
                                  : service.price}
                              </span>
                            )}
                          </Badge>
                        ))}
                      {provider.services && provider.services.length > 3 && (
                        <Badge className="bg-white/10 hover:bg-white/20 text-white/80">
                          +{provider.services.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-white/60 mt-2">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                        <span>
                          {provider.services && provider.services.length > 0
                            ? "Available now"
                            : "Contact for availability"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                        <span>{provider.reviewCount || 0} reviews</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-white/10 mt-2">
                    <Link
                      href={`/dashboard/client/providers/${provider.id}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] border-none text-white flex justify-center items-center">
                        <span className="mr-1">View Full Profile</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewType === "list" && (
            <div className="space-y-4">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className="overflow-hidden bg-gradient-to-br from-white/5 to-white/3 border-white/10 hover:border-[#9f6eff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#9f6eff]/10"
                >
                  <div className="flex flex-col md:flex-row p-4">
                    {/* Left side - Provider info */}
                    <div className="flex md:w-1/4 mb-4 md:mb-0">
                      <Avatar className="h-16 w-16 border-2 border-[#9f6eff]/50 mr-4">
                        <AvatarFallback className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white text-lg font-bold">
                          {getInitials(provider.firstname, provider.lastname)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {provider.firstname ||
                            provider.name?.split(" ")[0] ||
                            "Unknown"}{" "}
                          {provider.lastname ||
                            provider.name?.split(" ").slice(1).join(" ") ||
                            ""}
                        </h3>
                        <div className="flex items-center text-white/70 text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                          <span>
                            {provider.location || "Location not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <UserCircle className="h-3.5 w-3.5 mr-1 text-[#9f6eff]" />
                          <span>{provider.career || "Pet Care Provider"}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-300 text-sm ml-1">
                            {provider.rating?.toFixed(1) || "4.8"} (
                            {provider.reviewCount || "0"})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Services */}
                    <div className="md:w-2/4 mb-4 md:mb-0">
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-[#9f6eff]" />
                        Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.services?.length > 0 ? (
                          provider.services.map((service: Service) => (
                            <Badge
                              key={service.id}
                              className="bg-gradient-to-r from-[#9f6eff]/20 to-[#c061f7]/20 hover:from-[#9f6eff]/30 hover:to-[#c061f7]/30 text-white border-[#9f6eff]/30"
                            >
                              {service.service_name}
                              {service.price && (
                                <span className="ml-1 text-xs opacity-80">
                                  $
                                  {typeof service.price === "number"
                                    ? service.price.toFixed(0)
                                    : service.price}
                                </span>
                              )}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-white/50 text-sm">
                            No services listed
                          </span>
                        )}
                      </div>
                      {provider.bio && (
                        <p className="text-white/70 mt-2 text-sm italic line-clamp-1">
                          "{provider.bio}"
                        </p>
                      )}
                    </div>

                    {/* Right - Action button */}
                    <div className="md:w-1/4 flex items-center justify-end">
                      <Link href={`/dashboard/client/providers/${provider.id}`}>
                        <Button className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8b4ff7] hover:to-[#b04fe3] border-none text-white flex justify-center items-center">
                          <span className="mr-1">View Profile</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
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
