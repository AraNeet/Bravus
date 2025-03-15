package google

import (
	"time"
)

// SpreadsheetListItem represents a simplified spreadsheet item for listing
type SpreadsheetListItem struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	LastModified time.Time `json:"lastModified"`
	URL          string    `json:"url"`
	ThumbnailURL string    `json:"thumbnailUrl,omitempty"`
}

// SpreadsheetCreateRequest represents the data needed to create a new spreadsheet
type SpreadsheetCreateRequest struct {
	Title       string   `json:"title" validate:"required"`
	SheetNames  []string `json:"sheetNames,omitempty"`
	Description string   `json:"description,omitempty"`
}

// SpreadsheetUpdateRequest represents the data needed to update a spreadsheet
type SpreadsheetUpdateRequest struct {
	Values [][]interface{} `json:"values" validate:"required"`
	Range  string          `json:"range" validate:"required"`
}

// SpreadsheetDataResponse represents data from a spreadsheet
type SpreadsheetDataResponse struct {
	SpreadsheetID string              `json:"spreadsheetId"`
	Title         string              `json:"title"`
	Sheets        []SheetDataResponse `json:"sheets"`
	URL           string              `json:"url"`
}

// SheetDataResponse represents data from a single sheet
type SheetDataResponse struct {
	Title   string            `json:"title"`
	Data    [][]interface{}   `json:"data"`
	Range   string            `json:"range"`
	Headers []string          `json:"headers,omitempty"`
	Meta    map[string]string `json:"meta,omitempty"`
}

// SpreadsheetCreateResponse represents the response after creating a spreadsheet
type SpreadsheetCreateResponse struct {
	SpreadsheetID string `json:"spreadsheetId"`
	Title         string `json:"title"`
	URL           string `json:"url"`
}

// SpreadsheetUpdateResponse represents the response after updating a spreadsheet
type SpreadsheetUpdateResponse struct {
	SpreadsheetID string `json:"spreadsheetId"`
	UpdatedRange  string `json:"updatedRange"`
	UpdatedCells  int    `json:"updatedCells"`
}

// BatchUpdateRequest represents a request to batch update a spreadsheet
type BatchUpdateRequest struct {
	Ranges           []string          `json:"ranges"`
	Values           [][][]interface{} `json:"values"`
	ValueInputOption string            `json:"valueInputOption,omitempty"`
}

// BatchUpdateResponse represents the response after a batch update
type BatchUpdateResponse struct {
	SpreadsheetID     string                      `json:"spreadsheetId"`
	TotalUpdatedCells int                         `json:"totalUpdatedCells"`
	Updates           []SpreadsheetUpdateResponse `json:"updates"`
}

// SpreadsheetPermissionRequest represents data needed to share a spreadsheet
type SpreadsheetPermissionRequest struct {
	EmailAddresses []string `json:"emailAddresses" validate:"required"`
	Role           string   `json:"role" validate:"required,oneof=reader writer owner"`
	Message        string   `json:"message,omitempty"`
}

// SpreadsheetPermissionResponse represents the response after sharing a spreadsheet
type SpreadsheetPermissionResponse struct {
	SpreadsheetID string   `json:"spreadsheetId"`
	Shared        bool     `json:"shared"`
	Permissions   []string `json:"permissions"`
}
