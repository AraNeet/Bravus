import { get, post, put, del } from "../http";

// Types
export interface GoogleAuthResponse {
  redirectUrl: string;
}

export interface GoogleAuthStatusResponse {
  authenticated: boolean;
  userEmail?: string;
  profileUrl?: string;
}

export interface SpreadsheetListItem {
  id: string;
  name: string;
  lastModified: string;
  url: string;
  thumbnailUrl?: string;
}

export interface SheetDataResponse {
  title: string;
  data: any[][];
  range: string;
  headers?: string[];
  meta?: Record<string, string>;
}

export interface SpreadsheetDataResponse {
  spreadsheetId: string;
  title: string;
  sheets: SheetDataResponse[];
  url: string;
}

export interface SpreadsheetCreateRequest {
  title: string;
  sheetNames?: string[];
  description?: string;
}

export interface SpreadsheetCreateResponse {
  spreadsheetId: string;
  title: string;
  url: string;
}

export interface SpreadsheetUpdateRequest {
  values: any[][];
  range: string;
}

export interface SpreadsheetUpdateResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedCells: number;
}

// Google Auth API
export const initiateGoogleAuth = async (): Promise<GoogleAuthResponse> => {
  const response = await get<GoogleAuthResponse>("/api/google/auth/login");
  return response;
};

export const checkGoogleAuthStatus =
  async (): Promise<GoogleAuthStatusResponse> => {
    const response = await get<GoogleAuthStatusResponse>(
      "/api/google/auth/status"
    );
    return response;
  };

export const revokeGoogleAccess = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await post<{ success: boolean; message: string }>(
    "/api/google/auth/revoke",
    { confirm: true }
  );
  return response;
};

// Google Sheets API
export const listSpreadsheets = async (): Promise<SpreadsheetListItem[]> => {
  const response = await get<SpreadsheetListItem[]>("/api/google/sheets");
  return response;
};

export const getSpreadsheet = async (
  id: string
): Promise<SpreadsheetDataResponse> => {
  const response = await get<SpreadsheetDataResponse>(
    `/api/google/sheets/${id}`
  );
  return response;
};

export const createSpreadsheet = async (
  data: SpreadsheetCreateRequest
): Promise<SpreadsheetCreateResponse> => {
  const response = await post<SpreadsheetCreateResponse>(
    "/api/google/sheets",
    data
  );
  return response;
};

export const updateSpreadsheet = async (
  id: string,
  data: SpreadsheetUpdateRequest
): Promise<SpreadsheetUpdateResponse> => {
  const response = await put<SpreadsheetUpdateResponse>(
    `/api/google/sheets/${id}`,
    data
  );
  return response;
};

export const deleteSpreadsheet = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await del<{ success: boolean; message: string }>(
    `/api/google/sheets/${id}`
  );
  return response;
};
