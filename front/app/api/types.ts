/**
 * API Types
 *
 * This file contains type definitions for API requests and responses.
 */

// UUID type
export type UUID = string;

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

// Client registration
export interface ClientSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
}

// Owner registration
export interface OwnerSignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  bio?: string;
}

// Animal registration
export interface AnimalRequest {
  animal_name: string;
  animal_race: string;
  animal_age: number;
  species: string;
}

// Service registration
export interface ServiceRequest {
  service_name: string;
  service_desc: string;
  price: number;
  duration: number;
}

// Response from client login/register
export interface AuthClientResponse {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  location: string;
  token: string;
}

// Response from owner login/register
export interface AuthOwnerResponse {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  location: string;
  token: string;
}

// Client profile
export interface Client {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  location: string;
  animals: Animal[];
  appointments: Appointment[];
}

// Owner profile
export interface Owner {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  services: Service[];
  appointments: Appointment[];
}

// Animal
export interface Animal {
  id: UUID;
  animal_name: string;
  animal_race: string;
  animal_age: number;
  species: string;
  metadata?: string;
  client_id: UUID;
  created_at: string;
  updated_at: string;
}

// Service
export interface Service {
  id: UUID;
  service_name: string;
  service_desc: string;
  price: number;
  duration: number;
  owner_id: UUID;
}

// Client Appointment (minimal info for appointments)
export interface ClientAppointment {
  id: UUID;
  name: string;
  phone: string;
  location: string;
}

// Owner Appointment (minimal info for appointments)
export interface OwnerAppointment {
  id: UUID;
  name: string;
  phone: string;
  location: string;
}

// Appointment
export interface Appointment {
  id: UUID;
  datetime: string;
  notes: string;
  clients: ClientAppointment[];
  owners: OwnerAppointment[];
  animals: Animal[];
  services: Service[];
}

// Review
export interface Review {
  id: UUID;
  content: string;
  created_at: string;
  client_id: UUID;
  owner_id: UUID;
  client: Client;
}

// Rating
export interface Rating {
  id: UUID;
  score: number;
  client_id: UUID;
  owner_id: UUID;
}
