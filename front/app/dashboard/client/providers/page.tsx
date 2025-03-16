"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  ChevronRight,
  ArrowLeft,
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
  const [filteredProviders, setFilteredProviders] = useState<
    OwnerWithServices[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const data = await getOwners();
        setProviders(data);
        setFilteredProviders(data);

        // Extract unique service names for filter tabs
        const services = new Set<string>();
        data.forEach((provider) => {
          provider.services?.forEach((service: Service) => {
            services.add(service["service-name"]);
          });
        });
        setUniqueServices(Array.from(services));
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError("Failed to load service providers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    // Filter providers based on search query and selected service
    const filtered = providers.filter((provider) => {
      const matchesSearch =
        searchQuery === "" ||
        provider.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.services?.some(
          (service: Service) =>
            service["service-name"]
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            service["service-desc"]
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );

      const matchesService =
        selectedService === "all" ||
        provider.services?.some(
          (service: Service) => service["service-name"] === selectedService
        );

      return matchesSearch && matchesService;
    });

    setFilteredProviders(filtered);
  }, [searchQuery, selectedService, providers]);

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
      <Tabs
        defaultValue="all"
        value={selectedService}
        onValueChange={setSelectedService}
        className="w-full"
      >
        <TabsList className="bg-white/5 border border-white/10 p-1 overflow-x-auto flex w-full justify-start">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9f6eff]/80 data-[state=active]:to-[#c061f7]/80 data-[state=active]:text-white text-white/70"
          >
            All Services
          </TabsTrigger>
          {uniqueServices.map((service) => (
            <TabsTrigger
              key={service}
              value={service}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9f6eff]/80 data-[state=active]:to-[#c061f7]/80 data-[state=active]:text-white text-white/70"
            >
              {service}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-white">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <div className="rounded-full bg-white/5 p-4 inline-flex mx-auto mb-4">
            <Search className="h-6 w-6 text-white/60" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No providers found
          </h3>
          <p className="text-white/70 max-w-md mx-auto">
            We couldn't find any service providers matching your search
            criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {/* Provider Cards */}
      {!isLoading && filteredProviders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card
              key={provider.id}
              className="overflow-hidden bg-gradient-to-br from-white/5 to-white/3 border-white/10 hover:border-[#9f6eff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#9f6eff]/10"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Avatar className="h-12 w-12 border-2 border-[#9f6eff]/50">
                    <AvatarFallback className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white">
                      {getInitials(provider.firstname, provider.lastname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">4.8</span>
                  </div>
                </div>
                <CardTitle className="text-xl mt-2 text-white">
                  {provider.firstname} {provider.lastname}
                </CardTitle>
                <div className="flex items-center text-white/60 text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{"Location not specified"}</span>
                </div>
                <CardDescription className="text-white/70 mt-2 line-clamp-2">
                  {provider.career ||
                    "Professional pet care provider specializing in various animal services."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.services?.slice(0, 4).map((service: Service) => (
                    <Badge
                      key={service.id}
                      className="bg-gradient-to-r from-[#9f6eff]/20 to-[#c061f7]/20 hover:from-[#9f6eff]/30 hover:to-[#c061f7]/30 text-white border-[#9f6eff]/30"
                    >
                      {service["service-name"]}
                    </Badge>
                  ))}
                  {provider.services && provider.services.length > 4 && (
                    <Badge
                      variant="outline"
                      className="border-white/20 text-white/70"
                    >
                      +{provider.services.length - 4} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8a5ee6] hover:to-[#a94fdb] text-white"
                  asChild
                >
                  <a href={`/dashboard/client/providers/${provider.id}`}>
                    View Profile
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
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
