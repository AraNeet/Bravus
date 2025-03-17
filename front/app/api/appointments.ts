/**
 * Appointments API
 *
 * This file contains functions for appointment-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Appointment } from "./types";

// Types
export interface CreateAppointmentRequest {
  DateTime: string; // Format: "MM-DD-YYYY h:mmAM/PM" (e.g., "01-02-2006 3:04PM")
}

export interface UpdateAppointmentRequest {
  DateTime: string;
  Service?: string;
}

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (
  appointmentId: string
): Promise<Appointment> => {
  return await get<Appointment>(
    `/appointment/get-appointment?id=${appointmentId}`
  );
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  ownerId: string,
  userId: string,
  serviceId: string,
  appointmentData: CreateAppointmentRequest
): Promise<Appointment> => {
  if (!ownerId || !userId || !serviceId) {
    console.error("Missing required IDs for creating appointment:", {
      ownerId,
      userId,
      serviceId
    });
    throw new Error("Missing required owner, user, or service ID");
  }

  console.log("Creating appointment with data:", {
    ownerId,
    userId,
    serviceId,
    appointmentData
  });

  // Make sure the DateTime is in the correct format (MM-DD-YYYY h:mmAM/PM)
  if (!appointmentData.DateTime || !/^\d{2}-\d{2}-\d{4} \d{1,2}:\d{2}(AM|PM)$/.test(appointmentData.DateTime)) {
    console.error("Invalid DateTime format:", appointmentData.DateTime);
    throw new Error("Date and time must be in the format MM-DD-YYYY h:mmAM/PM");
  }

  try {
    return await post<Appointment>(
      `/appointment/create?Oid=${ownerId}&Uid=${userId}&Sid=${serviceId}`,
      appointmentData
    );
  } catch (error) {
    console.error("Failed to create appointment:", error);
    throw error;
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  appointmentData: UpdateAppointmentRequest
): Promise<Appointment> => {
  return await put<Appointment>(
    `/appointment/update?id=${appointmentId}`,
    appointmentData
  );
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  await del(`/appointment/delete?id=${appointmentId}`);
};

/**
 * Get all appointments for an owner
 */
export const getOwnerAppointments = async (
  ownerId: string
): Promise<Appointment[]> => {
  if (!ownerId) {
    throw new Error("Owner ID is required");
  }
  
  try {
    return await get<Appointment[]>(`/owner/get-owner-appointments/${ownerId}`);
  } catch (error) {
    console.error("Failed to fetch owner appointments:", error);
    throw error;
  }
};
