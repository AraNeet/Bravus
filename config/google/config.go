package google

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

// Config holds Google API configuration
type Config struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	Scopes       []string
}

// Default configuration values
var (
	DefaultRedirectURL = "http://localhost:8000/api/google/auth/callback"
	DefaultScopes      = []string{
		sheets.SpreadsheetsScope,
		drive.DriveFileScope,
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	}
)

// LoadConfig loads Google API configuration from environment variables
func LoadConfig() (*Config, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")

	if clientID == "" || clientSecret == "" {
		return nil, fmt.Errorf("Google client ID and client secret are required")
	}

	if redirectURL == "" {
		redirectURL = DefaultRedirectURL
	}

	return &Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       DefaultScopes,
	}, nil
}

// GetOAuthConfig returns the OAuth2 config for Google authentication
func (c *Config) GetOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     c.ClientID,
		ClientSecret: c.ClientSecret,
		RedirectURL:  c.RedirectURL,
		Scopes:       c.Scopes,
		Endpoint:     google.Endpoint,
	}
}

// GetSheetsService creates a new Google Sheets service client using the provided token
func GetSheetsService(ctx context.Context, token *oauth2.Token, config *oauth2.Config, client ...*http.Client) (*sheets.Service, error) {
	var httpClient *http.Client

	if len(client) > 0 && client[0] != nil {
		// Use provided client
		httpClient = client[0]
	} else if token != nil && config != nil {
		// Create client from token
		httpClient = config.Client(ctx, token)
	} else {
		return nil, errors.New("either token and config or client must be provided")
	}

	srv, err := sheets.NewService(ctx, option.WithHTTPClient(httpClient))
	if err != nil {
		log.Printf("Unable to create Sheets service: %v", err)
		return nil, err
	}
	return srv, nil
}

// GetDriveService creates a new Google Drive service client using the provided token
func GetDriveService(ctx context.Context, token *oauth2.Token, config *oauth2.Config, client ...*http.Client) (*drive.Service, error) {
	var httpClient *http.Client

	if len(client) > 0 && client[0] != nil {
		// Use provided client
		httpClient = client[0]
	} else if token != nil && config != nil {
		// Create client from token
		httpClient = config.Client(ctx, token)
	} else {
		return nil, errors.New("either token and config or client must be provided")
	}

	srv, err := drive.NewService(ctx, option.WithHTTPClient(httpClient))
	if err != nil {
		log.Printf("Unable to create Drive service: %v", err)
		return nil, err
	}
	return srv, nil
}
