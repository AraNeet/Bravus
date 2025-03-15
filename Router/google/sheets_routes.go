package google

import (
	"github.com/AramisAra/BravusBackend/Global"
	googleHandlers "github.com/AramisAra/BravusBackend/handlers/google"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

// SheetsRoutes sets up routes for Google Sheets operations
func SheetsRoutes(app *fiber.App) {
	// Create handlers
	sheetsHandler, err := googleHandlers.NewSheetsHandler(Global.DB)
	if err != nil {
		panic("Failed to create Google Sheets handler: " + err.Error())
	}

	// Set up routes with authentication middleware
	apiGroup := app.Group("/api/google/sheets", middleware.AuthMiddleware())

	// List spreadsheets (GET /api/google/sheets)
	apiGroup.Get("/", sheetsHandler.ListSpreadsheets)

	// Get spreadsheet (GET /api/google/sheets/:id)
	apiGroup.Get("/:id", sheetsHandler.GetSpreadsheet)

	// Create spreadsheet (POST /api/google/sheets)
	apiGroup.Post("/", sheetsHandler.CreateSpreadsheet)

	// Update spreadsheet (PUT /api/google/sheets/:id)
	apiGroup.Put("/:id", sheetsHandler.UpdateSpreadsheet)

	// Delete spreadsheet (DELETE /api/google/sheets/:id)
	apiGroup.Delete("/:id", sheetsHandler.DeleteSpreadsheet)
}
