package google

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

// GoogleTokenStorage model for storing OAuth tokens
type GoogleTokenStorage struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt    time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	OwnerID      uuid.UUID      `json:"owner_id" gorm:"type:uuid;not null;uniqueIndex"`
	AccessToken  string         `json:"access_token" gorm:"not null;type:text"`
	RefreshToken string         `json:"refresh_token" gorm:"type:text"`
	TokenExpiry  time.Time      `json:"token_expiry" gorm:"not null"`
	TokenType    string         `json:"token_type" gorm:"not null;size:50"`
	Scopes       string         `json:"scopes" gorm:"type:text"`
}

// StoreToken stores an OAuth2 token for an owner without encryption
func StoreToken(db *gorm.DB, ownerID uuid.UUID, token *oauth2.Token) error {
	// Serialize scopes
	scopesJSON, err := json.Marshal(token.Extra("scope"))
	if err != nil {
		return err
	}

	// Check if token already exists for this owner
	var existingToken GoogleTokenStorage
	result := db.Where("owner_id = ?", ownerID).First(&existingToken)

	if result.Error == nil {
		// Update existing token
		existingToken.AccessToken = token.AccessToken
		if token.RefreshToken != "" {
			existingToken.RefreshToken = token.RefreshToken
		}
		existingToken.TokenExpiry = token.Expiry
		existingToken.TokenType = token.TokenType
		existingToken.Scopes = string(scopesJSON)
		return db.Save(&existingToken).Error
	} else if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new token
		tokenStorage := GoogleTokenStorage{
			OwnerID:      ownerID,
			AccessToken:  token.AccessToken,
			RefreshToken: token.RefreshToken,
			TokenExpiry:  token.Expiry,
			TokenType:    token.TokenType,
			Scopes:       string(scopesJSON),
		}
		return db.Create(&tokenStorage).Error
	} else {
		// Other database error
		return result.Error
	}
}

// GetToken retrieves a stored OAuth2 token for an owner
func GetToken(db *gorm.DB, ownerID uuid.UUID) (*oauth2.Token, error) {
	var tokenStorage GoogleTokenStorage
	if err := db.Where("owner_id = ?", ownerID).First(&tokenStorage).Error; err != nil {
		return nil, err
	}

	// Parse scopes
	var scopes interface{}
	if tokenStorage.Scopes != "" {
		// Try to parse as array first
		var scopesArray []string
		err := json.Unmarshal([]byte(tokenStorage.Scopes), &scopesArray)
		if err == nil {
			scopes = scopesArray
		} else {
			// If it fails, try as string
			var scopeString string
			err = json.Unmarshal([]byte(tokenStorage.Scopes), &scopeString)
			if err == nil {
				scopes = scopeString
			} else {
				// If both fail, just use the raw string
				scopes = tokenStorage.Scopes
			}
		}
	}

	// Create OAuth2 token
	token := &oauth2.Token{
		AccessToken:  tokenStorage.AccessToken,
		RefreshToken: tokenStorage.RefreshToken,
		TokenType:    tokenStorage.TokenType,
		Expiry:       tokenStorage.TokenExpiry,
	}

	// Add scopes to token
	if scopes != nil {
		token = token.WithExtra(map[string]interface{}{
			"scope": scopes,
		})
	}

	return token, nil
}

// IsTokenValid checks if a token exists and is not expired
func IsTokenValid(db *gorm.DB, ownerID uuid.UUID) bool {
	var tokenStorage GoogleTokenStorage
	if err := db.Where("owner_id = ?", ownerID).First(&tokenStorage).Error; err != nil {
		return false
	}

	// Check if token is expired
	return tokenStorage.TokenExpiry.After(time.Now())
}

// DeleteToken removes a token for an owner
func DeleteToken(db *gorm.DB, ownerID uuid.UUID) error {
	return db.Where("owner_id = ?", ownerID).Delete(&GoogleTokenStorage{}).Error
}
