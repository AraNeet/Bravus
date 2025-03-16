// Constants
const SPREADSHEET_IDS_KEY = "bravus-spreadsheets";

// Types
interface SpreadsheetInfo {
  id: string;
  title: string;
  lastAccessed: string; // ISO date string
}

/**
 * Get all saved spreadsheet IDs from localStorage
 */
export const getSavedSpreadsheets = (): SpreadsheetInfo[] => {
  try {
    const savedData = localStorage.getItem(SPREADSHEET_IDS_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error("Error retrieving spreadsheets from localStorage:", error);
    return [];
  }
};

/**
 * Save a spreadsheet ID to localStorage
 */
export const saveSpreadsheetId = (id: string, title: string): void => {
  try {
    const spreadsheets = getSavedSpreadsheets();

    // Check if spreadsheet already exists
    const existingIndex = spreadsheets.findIndex((sheet) => sheet.id === id);

    if (existingIndex >= 0) {
      // Update existing entry
      spreadsheets[existingIndex] = {
        ...spreadsheets[existingIndex],
        title,
        lastAccessed: new Date().toISOString(),
      };
    } else {
      // Add new entry
      spreadsheets.push({
        id,
        title,
        lastAccessed: new Date().toISOString(),
      });
    }

    // Save back to localStorage
    localStorage.setItem(SPREADSHEET_IDS_KEY, JSON.stringify(spreadsheets));
  } catch (error) {
    console.error("Error saving spreadsheet to localStorage:", error);
  }
};

/**
 * Remove a spreadsheet ID from localStorage
 */
export const removeSpreadsheetId = (id: string): void => {
  try {
    const spreadsheets = getSavedSpreadsheets();
    const filteredSpreadsheets = spreadsheets.filter(
      (sheet) => sheet.id !== id
    );
    localStorage.setItem(
      SPREADSHEET_IDS_KEY,
      JSON.stringify(filteredSpreadsheets)
    );
  } catch (error) {
    console.error("Error removing spreadsheet from localStorage:", error);
  }
};

/**
 * Clear all spreadsheet IDs from localStorage
 */
export const clearSpreadsheetIds = (): void => {
  try {
    localStorage.removeItem(SPREADSHEET_IDS_KEY);
  } catch (error) {
    console.error("Error clearing spreadsheets from localStorage:", error);
  }
};

/**
 * Update the last accessed time for a spreadsheet
 */
export const updateSpreadsheetAccess = (id: string): void => {
  try {
    const spreadsheets = getSavedSpreadsheets();
    const existingIndex = spreadsheets.findIndex((sheet) => sheet.id === id);

    if (existingIndex >= 0) {
      spreadsheets[existingIndex] = {
        ...spreadsheets[existingIndex],
        lastAccessed: new Date().toISOString(),
      };

      localStorage.setItem(SPREADSHEET_IDS_KEY, JSON.stringify(spreadsheets));
    }
  } catch (error) {
    console.error("Error updating spreadsheet access time:", error);
  }
};

/**
 * Get most recently accessed spreadsheets, limited to a certain number
 */
export const getRecentSpreadsheets = (limit: number = 5): SpreadsheetInfo[] => {
  const spreadsheets = getSavedSpreadsheets();

  // Sort by last accessed (most recent first)
  return spreadsheets
    .sort(
      (a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    )
    .slice(0, limit);
};
