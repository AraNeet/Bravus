package google

// GoogleAuthRequest represents the request for Google authentication
type GoogleAuthRequest struct {
	State string `json:"state,omitempty"`
}

// GoogleAuthResponse represents the response from Google authentication
type GoogleAuthResponse struct {
	RedirectURL string `json:"redirectUrl"`
}

// GoogleCallbackRequest represents the request data for Google callback
type GoogleCallbackRequest struct {
	Code  string `json:"code" validate:"required"`
	State string `json:"state" validate:"required"`
}

// GoogleCallbackResponse represents the response data for Google callback
type GoogleCallbackResponse struct {
	Success      bool   `json:"success"`
	Message      string `json:"message"`
	RedirectPath string `json:"redirectPath,omitempty"`
}

// GoogleAuthStatusResponse represents the response for checking auth status
type GoogleAuthStatusResponse struct {
	Authenticated bool   `json:"authenticated"`
	UserEmail     string `json:"userEmail,omitempty"`
	ProfileURL    string `json:"profileUrl,omitempty"`
}

// GoogleRevokeRequest represents the request to revoke Google access
type GoogleRevokeRequest struct {
	Confirm bool `json:"confirm" validate:"required"`
}

// GoogleRevokeResponse represents the response after revoking Google access
type GoogleRevokeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
