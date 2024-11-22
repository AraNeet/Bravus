package Bravus

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/sheets/v4"
)

var (
	// The path to the client secret file downloaded from Google Cloud Console
	clientSecretFile = "client_secret.json"

	// OAuth2 config
	config *oauth2.Config
)

func Start() {
	ClientGetter()
}

func AuthCallback(c *fiber.Ctx) error {
	ctx := context.Background()
	id := c.Query("state")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("UUID not found")
	}

	// Get the authorization code from the URL query parameters
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Authorization code not found")
	}

	// Exchange the authorization code for an access token
	tok, err := config.Exchange(ctx, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Unable to exchange code for token: " + err.Error())
	}

	// Save the token to a file or use it to create a service client
	saveToken(tok, id)

	return c.Status(200).Redirect("http://34.204.43.154:3000/dashboard")
}

func ClientGetter() {
	// Load The Secrets Files
	b, err := os.ReadFile(clientSecretFile)
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v", err)
	}

	// Parse the client secret file to config
	config, err = google.ConfigFromJSON(b, sheets.SpreadsheetsScope)
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
}

func ReadFromFile(filename string) (*oauth2.Token, error) {
	path := filepath.Join(".tokens", filename)
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

func saveToken(token *oauth2.Token, filename string) {
	path := filepath.Join(".tokens", filename+".json")
	f, err := os.Create(path)
	if err != nil {
		log.Fatalf("Unable to create token file: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
}

func AuthGoogle(c *fiber.Ctx) error {
	id := c.Query("uuid")

	if !isValidUUID(id) {
		println(id)
		return c.Status(fiber.StatusBadRequest).SendString("Invalid UUID")
	}
	// Generate the URL for the authorization request.
	ClientGetter()
	authURL := config.AuthCodeURL(id, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
	return c.Status(200).JSON(fiber.Map{"url": authURL})
}
