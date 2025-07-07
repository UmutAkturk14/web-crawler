package handlers

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword takes a plain password and returns a bcrypt hashed password.
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// CheckPassword compares a plain password with its hashed version.
// Returns nil if they match, otherwise returns an error.
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
