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

export interface SignupRequest {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  owner: boolean;
  career: string;
}

// Response from login/register (AuthUserSerializer)
export interface AuthResponse {
  id: UUID;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  owner: boolean;
  career: string;
  token: string;
}

// User profile (UserSerializer)
export interface User {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  owner: boolean;
  career: string;
  animals: Animal[];
  appointments: Appointment[];
  services: Service[];
}

// Animal (AnimalSerializer)
export interface Animal {
  ID: UUID;
  animal_name: string;
  animal_race: string;
  animal_age: number;
  species: string;
  metadata?: string; // JSON string for additional fields
  owner_id: UUID;
  created_at: string;
  updated_at: string;
}

// Service (ServiceSerializer)
export interface Service {
  id: UUID;
  "service-name": string;
  "service-desc": string;
  price: number;
}

// User for appointments (UserAppointmentSerializer)
export interface UserAppointment {
  firstname: string;
  lastname: string;
  phone: string;
  career: string;
}

// Appointment (AppointmentSerializer)
export interface Appointment {
  ID: UUID;
  Users: UserAppointment[];
  service: UUID;
  datetime: string;
}
