package middleware

import (
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// Your secret key (replace with env var or config in production)
var JwtSecret = []byte("your_secret_key")

// AuthMiddleware checks the Authorization header for a valid JWT token
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth token"})
            c.Abort()
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
            c.Abort()
            return
        }

        tokenString := parts[1]

        if !validateToken(tokenString) {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Next()
    }
}

// validateToken parses and validates the JWT token
func validateToken(tokenStr string) bool {
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        // You can check signing method here if needed
        return JwtSecret, nil
    })

    if err != nil || !token.Valid {
        return false
    }

    return true
}
