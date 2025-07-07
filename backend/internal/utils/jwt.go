package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("your_secret_key_here") // replace with your secret key

type Claims struct {
    Username string `json:"username"`
    jwt.RegisteredClaims
}

// GenerateJWT creates a token for a given username
func GenerateJWT(username string) (string, error) {
    expirationTime := time.Now().Add(24 * time.Hour) // token valid for 24h
    claims := &Claims{
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            NotBefore: jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        return "", err
    }
    return tokenString, nil
}

// ValidateToken parses and validates the token string
func ValidateToken(tokenString string) (*Claims, error) {
    claims := &Claims{}

    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })

    if err != nil {
        return nil, err
    }

    if !token.Valid {
        return nil, err
    }

    return claims, nil
}
