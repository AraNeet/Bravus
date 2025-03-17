package google

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"

	googleStructs "github.com/AramisAra/BravusBackend/Struct/google"
	googleAuth "github.com/AramisAra/BravusBackend/auth/google"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AuthHandler manages Google OAuth authentication
type AuthHandler struct {
	db           *gorm.DB
	oauthService *googleAuth.OAuthService
}

// NewAuthHandler creates a new Auth handler
func NewAuthHandler(db *gorm.DB) (*AuthHandler, error) {
	oauthService, err := googleAuth.NewOAuthService(db)
	if err != nil {
		return nil, err
	}

	return &AuthHandler{
		db:           db,
		oauthService: oauthService,
	}, nil
}

// generateState generates a random state string for OAuth security
func generateState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}

// InitiateAuth starts the Google OAuth flow
func (h *AuthHandler) InitiateAuth(c *fiber.Ctx) error {
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

	// Generate state parameter to prevent CSRF
	state, err := generateState()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate state parameter",
		})
	}

	// Store state in DB or session (uses owner ID as key in state)
	stateWithOwnerID := fmt.Sprintf("%s:%s", state, ownerID.String())

	// Get authorization URL
	authURL := h.oauthService.GetAuthURL(stateWithOwnerID)

	return c.Status(fiber.StatusOK).JSON(googleStructs.GoogleAuthResponse{
		RedirectURL: authURL,
	})
}

// HandleCallback processes the OAuth callback
func (h *AuthHandler) HandleCallback(c *fiber.Ctx) error {
	// Get code and state from query parameters
	code := c.Query("code")
	receivedState := c.Query("state")

	if code == "" || receivedState == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing code or state parameter",
		})
	}

	// Parse state to extract owner ID
	stateParts := make([]string, 0)
	for i, part := range receivedState {
		if part == ':' && i < len(receivedState)-1 {
			stateParts = append(stateParts, receivedState[:i], receivedState[i+1:])
			break
		}
	}

	if len(stateParts) != 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid state parameter",
		})
	}

	// Parse owner ID
	ownerID, err := uuid.Parse(stateParts[1])
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID in state parameter",
		})
	}

	// Exchange code for token
	err = h.oauthService.HandleCallback(context.Background(), code, ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to exchange code for token: " + err.Error(),
		})
	}

	// Redirect user to frontend dashboard
	return c.Redirect("http://localhost:3000/dashboard/owner/sheets")
}

// CheckAuthStatus checks if an owner is authenticated with Google
func (h *AuthHandler) CheckAuthStatus(c *fiber.Ctx) error {
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

	// Check if owner is authenticated with Google
	authenticated := h.oauthService.IsAuthenticated(ownerID)

	response := googleStructs.GoogleAuthStatusResponse{
		Authenticated: authenticated,
	}

	// TODO: If needed, fetch user profile info from Google API using the token

	return c.Status(fiber.StatusOK).JSON(response)
}

// RevokeAccess revokes Google access
func (h *AuthHandler) RevokeAccess(c *fiber.Ctx) error {
	// Parse request body
	var request googleStructs.GoogleRevokeRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request: " + err.Error(),
		})
	}

	// Confirm revocation
	if !request.Confirm {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Confirmation required to revoke access",
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

	// Revoke access
	err = h.oauthService.RevokeAccess(ownerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to revoke access: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(googleStructs.GoogleRevokeResponse{
		Success: true,
		Message: "Google access successfully revoked",
	})
}
