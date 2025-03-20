/**
 * Google Sheets API
 *
 * This file contains functions for Google Sheets-related API requests.
 */

import { get, post, put, del } from "../http";

// Types
export interface Spreadsheet {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpreadsheetRequest {
  name: string;
  description?: string;
  sheetNames?: string[];
}

/**
 * List all spreadsheets
 */
export const listSpreadsheets = async (): Promise<Spreadsheet[]> => {
  return await get<Spreadsheet[]>(`/api/google/sheets/`);
};

/**
 * Get spreadsheet by ID
 */
export const getSpreadsheet = async (id: string): Promise<Spreadsheet> => {
  return await get<Spreadsheet>(`/api/google/sheets/${id}`);
};

/**
 * Create a new spreadsheet
 */
export const createSpreadsheet = async (
  data: CreateSpreadsheetRequest
): Promise<Spreadsheet> => {
  return await post<Spreadsheet>(`/api/google/sheets/`, data);
};

/**
 * Update spreadsheet
 */
export const updateSpreadsheet = async (
  id: string,
  data: Partial<CreateSpreadsheetRequest>
): Promise<Spreadsheet> => {
  return await put<Spreadsheet>(`/api/google/sheets/${id}`, data);
};

/**
 * Delete spreadsheet
 */
export const deleteSpreadsheet = async (id: string): Promise<void> => {
  await del(`/api/google/sheets/${id}`);
};
