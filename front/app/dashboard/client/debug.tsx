"use client";

import { useState, useEffect } from "react";
import { getOwners, getOwnerServices } from "@/app/api/users";
import type { OwnerWithServices } from "@/app/api/users";
import type { Service } from "@/app/api/types";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { getCurrentClient } from "@/app/api";

export default function DebugPage() {
  const { user } = useAuth();
  const [owners, setOwners] = useState<OwnerWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    async function fetchOwners() {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching owners...");
        const ownersData = await getOwners();
        console.log("Owners fetched:", ownersData);
        setOwners(ownersData);
      } catch (err: any) {
        console.error("Error fetching owners:", err);
        setError(err.message || "Failed to fetch owners");
      } finally {
        setLoading(false);
      }
    }

    fetchOwners();
  }, []);

  const fetchServices = async () => {
    if (!selectedOwnerId) {
      setServicesError("Please select an owner first");
      return;
    }

    try {
      setLoadingServices(true);
      setServicesError(null);
      console.log(`Fetching services for owner ${selectedOwnerId}...`);
      const servicesData = await getOwnerServices(selectedOwnerId);
      console.log("Services fetched:", servicesData);
      setServices(servicesData);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setServicesError(err.message || "Failed to fetch services");
    } finally {
      setLoadingServices(false);
    }
  };

  // Get user data
  useEffect(() => {
    if (user && user.appointments) {
      setAppointments(user.appointments || []);
      console.log("User appointments:", user.appointments);
    }
  }, [user, refreshCount]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await getCurrentClient();
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/dashboard/client"
          className="text-white/70 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">Debug Page</h1>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        <p className="text-gray-400">
          This page is for debugging purposes to see raw data from API responses.
        </p>
      </div>

      <div className="p-6 bg-gray-800 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="p-6 bg-gray-800 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Appointments ({appointments.length})</h2>
        {appointments.length === 0 ? (
          <div className="bg-gray-900 p-4 rounded-lg text-gray-400">No appointments found</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={appointment.id || index} className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">
                  Appointment {index + 1}: {appointment.id}
                </h3>
                <p className="text-gray-400 mb-2">
                  Date & Time: {new Date(appointment.datetime).toLocaleString()}
                </p>
                
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-300">Services:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {appointment.services && appointment.services.length > 0 
                      ? appointment.services.map((service: any) => (
                          <li key={service.id} className="text-gray-400">
                            {service.service_name} - ${service.price} ({service.duration} min)
                          </li>
                        ))
                      : <li className="text-gray-500">No services found</li>
                    }
                  </ul>
                </div>
                
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-300">Provider:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {appointment.owners && appointment.owners.length > 0 
                      ? appointment.owners.map((owner: any) => (
                          <li key={owner.id} className="text-gray-400">
                            {owner.name} - {owner.phone}
                          </li>
                        ))
                      : <li className="text-gray-500">No provider information</li>
                    }
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Notes:</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {appointment.notes || "No notes"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-800 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">ID:</h3>
            <div className="bg-gray-900 p-3 rounded-lg text-sm">
              {typeof window !== "undefined" ? localStorage.getItem("ID") || "Not set" : "Loading..."}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">User Type:</h3>
            <div className="bg-gray-900 p-3 rounded-lg text-sm">
              {typeof window !== "undefined" ? localStorage.getItem("user_type") || "Not set" : "Loading..."}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Name:</h3>
            <div className="bg-gray-900 p-3 rounded-lg text-sm">
              {typeof window !== "undefined" ? localStorage.getItem("name") || "Not set" : "Loading..."}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Email:</h3>
            <div className="bg-gray-900 p-3 rounded-lg text-sm">
              {typeof window !== "undefined" ? localStorage.getItem("email") || "Not set" : "Loading..."}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Token:</h3>
            <div className="bg-gray-900 p-3 rounded-lg text-sm overflow-hidden text-ellipsis">
              {typeof window !== "undefined"
                ? localStorage.getItem("auth_token")
                  ? "Token exists (hidden)"
                  : "Not set"
                : "Loading..."}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Debug: Owners and Services API Test</h1>
        
        <div className="mb-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg text-white mr-4"
          >
            Refresh
          </button>
          
          <button 
            onClick={() => console.log("Current owners state:", owners)}
            className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg text-white"
          >
            Log to Console
          </button>
        </div>
        
        {loading && <p className="text-white/70">Loading owners...</p>}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-6">
            <p className="text-white font-medium">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h2 className="text-xl font-medium mb-4">Owners: {owners.length}</h2>
            
            {owners.length > 0 ? (
              <div className="space-y-4">
                {owners.map((owner) => (
                  <div key={owner.id} className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">
                      {owner.name || `${owner.firstname || ""} ${owner.lastname || ""}`}
                    </h3>
                    <p className="text-sm text-white/60">{owner.email} | {owner.phone}</p>
                    
                    {owner.career && (
                      <p className="text-sm mt-1">{owner.career}</p>
                    )}
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium mt-2">
                        Owner ID: <span className="text-[#9f6eff] select-all">{owner.id}</span>
                      </p>
                      <p className="text-sm font-medium">
                        Services in owner object: {owner.services?.length || 0}
                      </p>
                      
                      <button
                        onClick={() => {
                          setSelectedOwnerId(owner.id);
                          console.log(`Selected owner ID: ${owner.id}`);
                        }}
                        className={`mt-2 px-3 py-1 rounded text-sm ${
                          selectedOwnerId === owner.id
                            ? "bg-[#9f6eff] text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        Select for Testing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <p className="text-white/60">No owners found.</p>
            )}
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <h2 className="text-xl font-medium mb-4">Service Tester</h2>
            
            <div className="mb-4">
              <p className="text-sm mb-2">
                Selected Owner ID: <span className="text-[#9f6eff] font-mono">{selectedOwnerId || "None"}</span>
              </p>
              
              <button
                onClick={fetchServices}
                disabled={!selectedOwnerId || loadingServices}
                className="px-4 py-2 bg-[#9f6eff] hover:bg-[#8b4ff7] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingServices ? "Loading..." : "Fetch Services"}
              </button>
            </div>
            
            {servicesError && (
              <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg mb-4">
                <p className="text-white font-medium">{servicesError}</p>
              </div>
            )}
            
            <div className="bg-white/5 p-3 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Services: {services.length}</h3>
              
              {loadingServices ? (
                <p className="text-white/70">Loading services...</p>
              ) : services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white/10 p-3 rounded-lg">
                      <p className="font-medium">{service.service_name}</p>
                      <p className="text-sm text-white/60">{service.service_desc}</p>
                      <div className="flex justify-between mt-2">
                        <p className="text-[#9f6eff]">${service.price}</p>
                        <p className="text-white/40 text-xs">{service.duration} min</p>
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Service ID: <span className="font-mono select-all">{service.id}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No services found. Try fetching services for a provider.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 