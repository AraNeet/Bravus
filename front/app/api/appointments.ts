/**
 * Appointments API
 *
 * This file contains functions for appointment-related API requests.
 */

import { post, put, del } from "./http";
import type { Appointment } from "./types";

// Types
export interface CreateAppointmentRequest {
  DateTime: string; // Format: "MM-DD-YYYY h:mmAM/PM" (e.g., "01-02-2006 3:04PM")
}

export interface UpdateAppointmentRequest {
  DateTime: string;
  Service?: string; // Added Service field to match what's being used in the edit page
}

/**
 * Create a new appointment
 */
export const createAppointment = async (
  ownerId: string,
  userId: string,
  serviceId: string,
  appointmentData: CreateAppointmentRequest
): Promise<Appointment> => {
  return await post<Appointment>(
    `/appointment/create?Oid=${ownerId}&Uid=${userId}&Sid=${serviceId}`,
    appointmentData
  );
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
