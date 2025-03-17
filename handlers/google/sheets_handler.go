package google

import (
	"context"
	"fmt"
	"time"

	googleStructs "github.com/AramisAra/BravusBackend/Struct/google"
	googleAuth "github.com/AramisAra/BravusBackend/auth/google"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/sheets/v4"
	"gorm.io/gorm"
)

// SheetsHandler manages Google Sheets operations
type SheetsHandler struct {
	db           *gorm.DB
	oauthService *googleAuth.OAuthService
}

// NewSheetsHandler creates a new Sheets handler
func NewSheetsHandler(db *gorm.DB) (*SheetsHandler, error) {
	oauthService, err := googleAuth.NewOAuthService(db)
	if err != nil {
		return nil, err
	}

	return &SheetsHandler{
		db:           db,
		oauthService: oauthService,
	}, nil
}

// GetOwnerID extracts the owner ID from the JWT token
// Note: For backward compatibility, this still uses the "user_id" field from the token
func GetOwnerID(c *fiber.Ctx) (uuid.UUID, error) {
	// Get user ID from context (set by JWT middleware)
	userID := c.Locals("user_id")
	if userID == nil {
		return uuid.Nil, fmt.Errorf("owner ID not found in token")
	}

	// Convert to string and parse UUID
	userIDStr, ok := userID.(string)
	if !ok {
		return uuid.Nil, fmt.Errorf("owner ID is not a string")
	}

	parsedID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid owner ID format")
	}

	return parsedID, nil
}

// ListSpreadsheets returns a list of user's spreadsheets
func (h *SheetsHandler) ListSpreadsheets(c *fiber.Ctx) error {
	// Get owner ID from token
	ownerID, err := GetOwnerID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	// Check if owner
	isOwner := c.Locals("owner")
	if isOwner == nil || isOwner.(bool) == false {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only business owners can access this resource",
		})
	}

	// Check if user has authenticated with Google
	if !h.oauthService.IsAuthenticated(ownerID) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "Not authenticated with Google",
			"message": "Please connect your Google account first",
		})
	}

	// Get Google Drive service
	driveService, err := h.oauthService.GetDriveService(context.Background(), ownerID)
	if err != nil {
		fmt.Printf("Error getting Drive service: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to Google Drive: " + err.Error(),
		})
	}

	// Query for spreadsheets
	query := "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
	fmt.Printf("Executing Drive API query for user %s: %s\n", ownerID, query)

	// Try a simpler query first to test API connectivity
	try, err := driveService.Files.List().Fields("files(id, name)").PageSize(10).Do()
	if err != nil {
		fmt.Printf("Error with simple Drive API call: %v\n", err)
		if try != nil {
			fmt.Printf("Response data: %+v\n", try)
		}
	} else {
		fmt.Printf("Simple query successful, found %d files\n", len(try.Files))
	}

	files, err := driveService.Files.List().Q(query).
		Fields("files(id, name, webViewLink, thumbnailLink, modifiedTime)").
		OrderBy("modifiedTime desc").
		PageSize(100).
		Do()
	if err != nil {
		fmt.Printf("Error listing spreadsheets: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to list spreadsheets: " + err.Error(),
			"details": "This could be due to insufficient permissions. Please ensure you've granted access to both Google Sheets and Google Drive.",
		})
	}

	// Convert to response format
	spreadsheets := make([]googleStructs.SpreadsheetListItem, 0, len(files.Files))
	fmt.Printf("Found %d spreadsheets for user %s\n", len(files.Files), ownerID)

	for _, file := range files.Files {
		modTime, _ := time.Parse(time.RFC3339, file.ModifiedTime)
		spreadsheets = append(spreadsheets, googleStructs.SpreadsheetListItem{
			ID:           file.Id,
			Name:         file.Name,
			LastModified: modTime,
			URL:          file.WebViewLink,
			ThumbnailURL: file.ThumbnailLink,
		})
	}

	return c.Status(fiber.StatusOK).JSON(spreadsheets)
}

// GetSpreadsheet returns a specific spreadsheet
func (h *SheetsHandler) GetSpreadsheet(c *fiber.Ctx) error {
	// Get spreadsheet ID from URL params
	spreadsheetID := c.Params("id")
	if spreadsheetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Spreadsheet ID is required",
		})
	}

	// Get owner ID from token
	ownerID, err := GetOwnerID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: " + err.Error(),
		})
	}

	// Check if owner
	isOwner := c.Locals("owner")
	if isOwner == nil || isOwner.(bool) == false {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only business owners can access this resource",
		})
	}

	// Get Google Sheets service
	sheetsService, err := h.oauthService.GetSheetsService(context.Background(), ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to Google Sheets: " + err.Error(),
		})
	}

	// Get spreadsheet
	spreadsheet, err := sheetsService.Spreadsheets.Get(spreadsheetID).Fields("properties.title,sheets(properties(title,sheetId),data(rowData))").Do()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get spreadsheet: " + err.Error(),
		})
	}

	// Create response with sheet data
	response := googleStructs.SpreadsheetDataResponse{
		SpreadsheetID: spreadsheet.SpreadsheetId,
		Title:         spreadsheet.Properties.Title,
		URL:           fmt.Sprintf("https://docs.google.com/spreadsheets/d/%s", spreadsheet.SpreadsheetId),
		Sheets:        make([]googleStructs.SheetDataResponse, 0, len(spreadsheet.Sheets)),
	}

	// Process each sheet
	for _, sheet := range spreadsheet.Sheets {
		// Get sheet data
		sheetTitle := sheet.Properties.Title
		range_ := fmt.Sprintf("%s!A1:Z1000", sheetTitle) // Reasonable default range

		valueRange, err := sheetsService.Spreadsheets.Values.Get(spreadsheetID, range_).Do()
		if err != nil {
			continue // Skip this sheet if data can't be retrieved
		}

		// Convert data to 2D array of interfaces
		data := make([][]interface{}, 0, len(valueRange.Values))
		headers := make([]string, 0)

		// Extract headers and data
		for i, row := range valueRange.Values {
			rowData := make([]interface{}, len(row))
			for j, cell := range row {
				rowData[j] = cell

				// Save first row as headers
				if i == 0 {
					if cellStr, ok := cell.(string); ok {
						headers = append(headers, cellStr)
					}
				}
			}
			data = append(data, rowData)
		}

		// Add sheet to response
		sheetData := googleStructs.SheetDataResponse{
			Title:   sheetTitle,
			Data:    data,
			Range:   range_,
			Headers: headers,
		}

		response.Sheets = append(response.Sheets, sheetData)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// CreateSpreadsheet creates a new spreadsheet
func (h *SheetsHandler) CreateSpreadsheet(c *fiber.Ctx) error {
	// Parse request body
	var request googleStructs.SpreadsheetCreateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request: " + err.Error(),
		})
	}

	// Validate required fields
	if request.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title is required",
		})
	}

	// Get owner ID from token
	ownerID, err := GetOwnerID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: " + err.Error(),
		})
	}

	// Check if owner
	isOwner := c.Locals("owner")
	if isOwner == nil || isOwner.(bool) == false {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only business owners can access this resource",
		})
	}

	// Get Google Sheets service
	sheetsService, err := h.oauthService.GetSheetsService(context.Background(), ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to Google Sheets: " + err.Error(),
		})
	}

	// Create spreadsheet object
	newSpreadsheet := &sheets.Spreadsheet{
		Properties: &sheets.SpreadsheetProperties{
			Title: request.Title,
		},
	}

	// Add sheets if specified
	if len(request.SheetNames) > 0 {
		newSpreadsheet.Sheets = make([]*sheets.Sheet, 0, len(request.SheetNames))

		for _, sheetName := range request.SheetNames {
			newSpreadsheet.Sheets = append(newSpreadsheet.Sheets, &sheets.Sheet{
				Properties: &sheets.SheetProperties{
					Title: sheetName,
				},
			})
		}
	}

	// Create the spreadsheet
	createdSpreadsheet, err := sheetsService.Spreadsheets.Create(newSpreadsheet).Do()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create spreadsheet: " + err.Error(),
		})
	}

	// Set metadata if description is provided
	if request.Description != "" {
		driveService, err := h.oauthService.GetDriveService(context.Background(), ownerID)
		if err == nil {
			file := &drive.File{
				Description: request.Description,
			}
			driveService.Files.Update(createdSpreadsheet.SpreadsheetId, file).Do()
		}
	}

	// Return response
	response := googleStructs.SpreadsheetCreateResponse{
		SpreadsheetID: createdSpreadsheet.SpreadsheetId,
		Title:         createdSpreadsheet.Properties.Title,
		URL:           fmt.Sprintf("https://docs.google.com/spreadsheets/d/%s", createdSpreadsheet.SpreadsheetId),
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// UpdateSpreadsheet updates a spreadsheet
func (h *SheetsHandler) UpdateSpreadsheet(c *fiber.Ctx) error {
	// Get spreadsheet ID from URL params
	spreadsheetID := c.Params("id")
	if spreadsheetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Spreadsheet ID is required",
		})
	}

	// Parse request body
	var request googleStructs.SpreadsheetUpdateRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request: " + err.Error(),
		})
	}

	// Validate required fields
	if request.Range == "" || len(request.Values) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Range and values are required",
		})
	}

	// Get owner ID from token
	ownerID, err := GetOwnerID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: " + err.Error(),
		})
	}

	// Check if owner
	isOwner := c.Locals("owner")
	if isOwner == nil || isOwner.(bool) == false {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only business owners can access this resource",
		})
	}

	// Get Google Sheets service
	sheetsService, err := h.oauthService.GetSheetsService(context.Background(), ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to Google Sheets: " + err.Error(),
		})
	}

	// Convert values to value range
	valueRange := &sheets.ValueRange{
		Range:  request.Range,
		Values: make([][]interface{}, len(request.Values)),
	}

	for i, row := range request.Values {
		valueRange.Values[i] = row
	}

	// Update the spreadsheet
	updateResponse, err := sheetsService.Spreadsheets.Values.Update(
		spreadsheetID,
		request.Range,
		valueRange,
	).ValueInputOption("USER_ENTERED").Do()

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update spreadsheet: " + err.Error(),
		})
	}

	// Return response
	response := googleStructs.SpreadsheetUpdateResponse{
		SpreadsheetID: spreadsheetID,
		UpdatedRange:  updateResponse.UpdatedRange,
		UpdatedCells:  int(updateResponse.UpdatedCells),
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// DeleteSpreadsheet deletes a spreadsheet
func (h *SheetsHandler) DeleteSpreadsheet(c *fiber.Ctx) error {
	// Get spreadsheet ID from URL params
	spreadsheetID := c.Params("id")
	if spreadsheetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Spreadsheet ID is required",
		})
	}

	// Get owner ID from token
	ownerID, err := GetOwnerID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: " + err.Error(),
		})
	}

	// Check if owner
	isOwner := c.Locals("owner")
	if isOwner == nil || isOwner.(bool) == false {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only business owners can access this resource",
		})
	}

	// Get Google Drive service (used to delete files)
	driveService, err := h.oauthService.GetDriveService(context.Background(), ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to connect to Google Drive: " + err.Error(),
		})
	}

	// Delete the spreadsheet
	err = driveService.Files.Delete(spreadsheetID).Do()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete spreadsheet: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Spreadsheet deleted successfully",
	})
}
