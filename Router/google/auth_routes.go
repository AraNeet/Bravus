package google

import (
	"github.com/AramisAra/BravusBackend/Global"
	googleHandlers "github.com/AramisAra/BravusBackend/handlers/google"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

// AuthRoutes sets up routes for Google OAuth authentication
func AuthRoutes(app *fiber.App) {
	// Create handlers
	authHandler, err := googleHandlers.NewAuthHandler(Global.DB)
	if err != nil {
		panic("Failed to create Google Auth handler: " + err.Error())
	}

	// Set up auth routes
	authGroup := app.Group("/api/google/auth")

	// Initiate OAuth flow (GET /api/google/auth/login)
	// Requires authentication to ensure only logged in users can connect
	authGroup.Get("/login", middleware.AuthMiddleware(), authHandler.InitiateAuth)

	// OAuth callback (GET /api/google/auth/callback)
	// No auth middleware as this is called by Google
	authGroup.Get("/callback", authHandler.HandleCallback)

	// Check auth status (GET /api/google/auth/status)
	authGroup.Get("/status", middleware.AuthMiddleware(), authHandler.CheckAuthStatus)

	// Revoke access (POST /api/google/auth/revoke)
	authGroup.Post("/revoke", middleware.AuthMiddleware(), authHandler.RevokeAccess)
}
