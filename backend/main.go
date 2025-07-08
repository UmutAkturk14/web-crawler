package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"github.com/UmutAkturk14/web-crawler/backend/internal/routes"
	"github.com/gin-contrib/cors"
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

	// ✅ Enable CORS for localhost:8088
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8088"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.RegisterAuthRoutes(r, db)

	// Register URL-related routes
	routes.RegisterURLRoutes(r, db)

	r.Run() // listen and serve on 0.0.0.0:8080
}
