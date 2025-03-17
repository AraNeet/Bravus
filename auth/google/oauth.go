package google

import (
	"context"
	"fmt"
	"net/http"
	"time"

	googleConfig "github.com/AramisAra/BravusBackend/config/google"
	googleModels "github.com/AramisAra/BravusBackend/models/google"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/sheets/v4"
	"gorm.io/gorm"
)

// OAuthService manages Google OAuth authentication
type OAuthService struct {
	config *googleConfig.Config
	db     *gorm.DB
}

// NewOAuthService creates a new OAuth service instance
func NewOAuthService(db *gorm.DB) (*OAuthService, error) {
	config, err := googleConfig.LoadConfig()
	if err != nil {
		return nil, err
	}

	return &OAuthService{
		config: config,
		db:     db,
	}, nil
}

// GetAuthURL generates a URL for OAuth authentication
func (s *OAuthService) GetAuthURL(state string) string {
	oauthConfig := s.config.GetOAuthConfig()
	return oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
}

// HandleCallback processes OAuth callback and stores token
func (s *OAuthService) HandleCallback(ctx context.Context, code string, ownerID uuid.UUID) error {
	oauthConfig := s.config.GetOAuthConfig()

	token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		return err
	}

	return googleModels.StoreToken(s.db, ownerID, token)
}

// GetClient returns an HTTP client with token authentication
func (s *OAuthService) GetClient(ctx context.Context, ownerID uuid.UUID) (*http.Client, error) {
	token, err := googleModels.GetToken(s.db, ownerID)
	if err != nil {
		return nil, err
	}

	// Check if token is valid and refresh if necessary
	if token.Expiry.Before(time.Now()) {
		oauthConfig := s.config.GetOAuthConfig()

		// Try to refresh the token
		tokenSource := oauthConfig.TokenSource(ctx, token)
		newToken, err := tokenSource.Token()
		if err != nil {
			return nil, fmt.Errorf("token expired and could not be refreshed: %v", err)
		}

		// Preserve scope in the new token if it exists in the old token
		if token.Extra("scope") != nil && newToken.Extra("scope") == nil {
			newToken = newToken.WithExtra(map[string]interface{}{
				"scope": token.Extra("scope"),
			})
		}

		// Store the new token
		if err := googleModels.StoreToken(s.db, ownerID, newToken); err != nil {
			return nil, err
		}

		token = newToken
	}

	oauthConfig := s.config.GetOAuthConfig()
	return oauthConfig.Client(ctx, token), nil
}

// GetSheetsService returns a Google Sheets service client
func (s *OAuthService) GetSheetsService(ctx context.Context, ownerID uuid.UUID) (*sheets.Service, error) {
	client, err := s.GetClient(ctx, ownerID)
	if err != nil {
		return nil, err
	}

	return googleConfig.GetSheetsService(ctx, nil, nil, client)
}

// GetDriveService returns a Google Drive service client
func (s *OAuthService) GetDriveService(ctx context.Context, ownerID uuid.UUID) (*drive.Service, error) {
	client, err := s.GetClient(ctx, ownerID)
	if err != nil {
		return nil, err
	}

	return googleConfig.GetDriveService(ctx, nil, nil, client)
}

// IsAuthenticated checks if an owner has a valid Google token
func (s *OAuthService) IsAuthenticated(ownerID uuid.UUID) bool {
	return googleModels.IsTokenValid(s.db, ownerID)
}

// RevokeAccess removes Google token for an owner
func (s *OAuthService) RevokeAccess(ownerID uuid.UUID) error {
	return googleModels.DeleteToken(s.db, ownerID)
}
