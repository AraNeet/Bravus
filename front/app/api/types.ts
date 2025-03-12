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
  id: string;
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
  "animal-name": string;
  "animal-race": string;
  "animal-age": number;
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
