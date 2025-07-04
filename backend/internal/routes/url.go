package routes

import (
	"net/http"
	"strconv"

	"github.com/UmutAkturk14/web-crawler/backend/internal/analyzer"
	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

func RegisterURLRoutes(r *gin.Engine, db *gorm.DB) {
	r.POST("/urls", func(c *gin.Context) {
		var req CreateURLRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input or missing URL field"})
			return
		}

		urlEntry := models.URL{
			URL:    req.URL,
			Status: "pending",
		}

		if err := db.Create(&urlEntry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save URL"})
			return
		}

		c.JSON(http.StatusCreated, urlEntry)
	})

	r.GET("/urls", func(c *gin.Context) {
		var urls []models.URL
		if err := db.Find(&urls).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, urls)
	})

	r.POST("/crawl/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
			return
		}

		var urlEntry models.URL
		if err := db.First(&urlEntry, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		// Update status to crawling
		urlEntry.Status = "crawling"
		db.Save(&urlEntry)

		// Call crawler logic
		err = analyzer.CrawlURL(db, &urlEntry)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, urlEntry)
	})
}
