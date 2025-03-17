"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";
import { getUserWithAllData } from "@/app/api/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { OwnerWithServices } from "@/app/api/users";
import type { Service } from "@/app/api/types";

export default function ProviderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [provider, setProvider] = useState<OwnerWithServices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching provider data for ID:", params.id);
        const data = await getUserWithAllData(params.id);
        console.log("Provider data fetched:", data);
        setProvider(data as OwnerWithServices);
      } catch (err) {
        console.error("Failed to fetch provider:", err);
        setError("Failed to load provider details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProvider();
    }
  }, [params.id]);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  if (error) {
    return (
      <div>
        <Button
          variant="outline"
          className="mb-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Providers
        </Button>

        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-white">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProviderDetailSkeleton />;
  }

  return (
    <div>
      <Button
        variant="outline"
        className="mb-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Providers
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Profile Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-white/5 to-white/3 border-white/10">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto border-2 border-[#9f6eff]/50">
              <AvatarImage
                src={`/placeholder.svg?height=96&width=96`}
                alt={`${provider?.firstname} ${provider?.lastname}`}
              />
              <AvatarFallback className="bg-gradient-to-r from-[#9f6eff] to-[#c061f7] text-white text-2xl">
                {getInitials(provider?.firstname, provider?.lastname)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl mt-4 text-white">
              {provider?.firstname} {provider?.lastname}
            </CardTitle>
            <div className="flex items-center justify-center text-white/60 text-sm mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{"Location not specified"}</span>
            </div>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400/50 text-yellow-400/50" />
              <span className="text-white font-medium ml-1">4.8</span>
              <span className="text-white/60">(24 reviews)</span>
            </div>
            <CardDescription className="text-white/70 mt-4">
              {provider?.career ||
                "Professional pet care provider specializing in various animal services."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4 bg-white/10" />

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-[#9f6eff] mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white">
                    {provider?.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-5 w-5 text-[#9f6eff] mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Phone</p>
                  <p className="text-white">
                    {provider?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-[#9f6eff] mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Working Hours</p>
                  <p className="text-white">Mon-Fri: 9AM-5PM</p>
                </div>
              </div>
            </div>

            <Separator className="my-4 bg-white/10" />

            <Button
              className="w-full bg-gradient-to-r from-[#9f6eff] to-[#c061f7] hover:from-[#8a5ee6] hover:to-[#a94fdb] text-white"
              asChild
            >
              <a
                href={`/dashboard/client/appointments/book?providerId=${provider?.id}`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Services and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger
                value="services"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9f6eff]/80 data-[state=active]:to-[#c061f7]/80 data-[state=active]:text-white text-white/70"
              >
                Services
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9f6eff]/80 data-[state=active]:to-[#c061f7]/80 data-[state=active]:text-white text-white/70"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9f6eff]/80 data-[state=active]:to-[#c061f7]/80 data-[state=active]:text-white text-white/70"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider?.services && provider.services.length > 0 ? (
                  provider.services.map((service: Service) => (
                    <Card
                      key={service.id}
                      className="bg-gradient-to-br from-white/5 to-white/3 border-white/10 hover:border-[#9f6eff]/40 transition-all duration-300"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-white">
                            {service.service_name}
                          </CardTitle>
                          <div className="flex items-center text-white font-medium">
                            <DollarSign className="h-4 w-4 text-[#9f6eff]" />
                            {service.price?.toFixed(2)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">{service.service_desc}</p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            className="w-full border-[#9f6eff]/30 bg-[#9f6eff]/10 text-white hover:bg-[#9f6eff]/20"
                            asChild
                          >
                            <a
                              href={`/dashboard/client/appointments/book?providerId=${provider?.id}&serviceId=${service.id}`}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Book This Service
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-white/70">
                      No services listed for this provider.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    About {provider?.firstname}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70">
                    {`${provider?.firstname} ${provider?.lastname} is a dedicated pet care professional with years of experience in the field. They specialize in providing high-quality services for all types of animals.`}
                  </p>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {provider?.services?.map((service: Service) => (
                        <Badge
                          key={service.id}
                          className="bg-gradient-to-r from-[#9f6eff]/20 to-[#c061f7]/20 hover:from-[#9f6eff]/30 hover:to-[#c061f7]/30 text-white border-[#9f6eff]/30"
                        >
                          {service.service_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="bg-gradient-to-br from-white/5 to-white/3 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    Client Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-white/70">Reviews coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ProviderDetailSkeleton() {
  return (
    <div>
      <Button
        variant="outline"
        className="mb-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
        disabled
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Providers
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Profile Card Skeleton */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-white/5 to-white/3 border-white/10">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto mt-4" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
            <Skeleton className="h-5 w-36 mx-auto mt-2" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
          </CardHeader>
          <CardContent>
            <Separator className="my-4 bg-white/10" />

            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4 bg-white/10" />

            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Services and Details Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 w-full" />

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-gradient-to-br from-white/5 to-white/3 border-white/10"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-1" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
