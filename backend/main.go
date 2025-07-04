package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"github.com/UmutAkturk14/web-crawler/backend/internal/routes"
)

var db *gorm.DB

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, pass, host, port, dbname)
	fmt.Println("MySQL DSN:", dsn)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(&models.URL{}, &models.BrokenLink{})
	if err != nil {
		log.Fatal("Database migration failed:", err)
	}

	r := gin.Default()

	// Healthcheck
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// Register URL-related routes
	routes.RegisterURLRoutes(r, db)

	r.Run() // listen and serve on 0.0.0.0:8080
}
