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

		var response []models.URLResponse
		for _, u := range urls {
			response = append(response, models.URLResponse{
				ID:            u.ID,
				URL:           u.URL,
				Status:        u.Status,
				Title:         u.Title,
				HTMLVersion:   u.HTMLVersion,
				H1Count:       u.H1Count,
				H2Count:       u.H2Count,
				H3Count:       u.H3Count,
				H4Count:       u.H4Count,
				H5Count:       u.H5Count,
				H6Count:       u.H6Count,
				InternalLinks: u.InternalLinks,
				ExternalLinks: u.ExternalLinks,
				BrokenLinks:   u.BrokenLinks,
				HasLoginForm:  u.LoginFormFound,
				CreatedAt:     u.CreatedAt,
			})
		}

		c.JSON(http.StatusOK, response)
	})

	r.POST("/url", func(c *gin.Context) {
		var req struct {
			ID  uint   `json:"id"`
			URL string `json:"url"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		var urlEntry models.URL
		var err error

		switch {
		case req.ID != 0:
			err = db.First(&urlEntry, req.ID).Error
		case req.URL != "":
			err = db.Where("url = ?", req.URL).First(&urlEntry).Error
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Either 'id' or 'url' must be provided"})
			return
		}

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		response := models.URLResponse{
			ID:            urlEntry.ID,
			URL:           urlEntry.URL,
			Status:        urlEntry.Status,
			Title:         urlEntry.Title,
			HTMLVersion:   urlEntry.HTMLVersion,
			H1Count:       urlEntry.H1Count,
			H2Count:       urlEntry.H2Count,
			H3Count:       urlEntry.H3Count,
			H4Count:       urlEntry.H4Count,
			H5Count:       urlEntry.H5Count,
			H6Count:       urlEntry.H6Count,
			InternalLinks: urlEntry.InternalLinks,
			ExternalLinks: urlEntry.ExternalLinks,
			BrokenLinks:   urlEntry.BrokenLinks,
			HasLoginForm:  urlEntry.LoginFormFound,
			CreatedAt:     urlEntry.CreatedAt,
		}

		c.JSON(http.StatusOK, response)
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

		// Update status to "crawling"
		urlEntry.Status = "crawling"
		if err := db.Save(&urlEntry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
			return
		}

		// Perform crawl
		err = analyzer.CrawlURL(db, &urlEntry)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

			response := models.URLResponse{
			ID:            urlEntry.ID,
			URL:           urlEntry.URL,
			Status:        urlEntry.Status,
			Title:         urlEntry.Title,
			HTMLVersion:   urlEntry.HTMLVersion,
			H1Count:       urlEntry.H1Count,
			H2Count:       urlEntry.H2Count,
			H3Count:       urlEntry.H3Count,
			H4Count:       urlEntry.H4Count,
			H5Count:       urlEntry.H5Count,
			H6Count:       urlEntry.H6Count,
			InternalLinks: urlEntry.InternalLinks,
			ExternalLinks: urlEntry.ExternalLinks,
			BrokenLinks:   urlEntry.BrokenLinks,
			HasLoginForm:  urlEntry.LoginFormFound,
			CreatedAt:     urlEntry.CreatedAt,
		}

		c.JSON(http.StatusOK, response)
	})
}
