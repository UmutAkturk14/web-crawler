package routes

import (
	"net/http"
	"strconv"

	"github.com/UmutAkturk14/web-crawler/backend/internal/auth"
	analyzer "github.com/UmutAkturk14/web-crawler/backend/internal/crawler"
	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)


func RegisterURLRoutes(r *gin.Engine, db *gorm.DB) {
	urlGroup := r.Group("/")
	urlGroup.Use(auth.AuthMiddleware())

	urlGroup.POST("/urls", func(c *gin.Context) {
		var req CreateURLRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input or missing URL field"})
			return
		}

		urlEntry := models.URL{URL: req.URL, Status: "pending"}

		if err := db.Create(&urlEntry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save URL"})
			return
		}

		c.JSON(http.StatusCreated, urlToResponse(urlEntry))
	})

	urlGroup.GET("/urls", func(c *gin.Context) {
		page, pageSize := parsePaginationParams(c, 1, 10)

		var totalCount int64
		if err := db.Model(&models.URL{}).Count(&totalCount).Error; err != nil {
			handleError(c, err)
			return
		}

		var urls []models.URL
		offset := (page - 1) * pageSize

		if err := db.Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&urls).Error; err != nil {
			handleError(c, err)
			return
		}

		response := make([]models.URLResponse, len(urls))
		for i, u := range urls {
			response[i] = urlToResponse(u)
		}

		c.JSON(http.StatusOK, gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total_count": totalCount,
			"urls":        response,
		})
	})

	urlGroup.GET("/urls/sorted", func(c *gin.Context) {
		sortBy := c.DefaultQuery("sort_by", "created_at")
		order := c.DefaultQuery("order", "desc")

		allowedFields := map[string]bool{
			"id": true, "url": true, "status": true, "title": true,
			"html_version": true, "h1_count": true, "h2_count": true,
			"h3_count": true, "h4_count": true, "h5_count": true,
			"h6_count": true, "internal_links": true, "external_links": true,
			"broken_links": true, "login_form_found": true, "created_at": true,
		}

		if !allowedFields[sortBy] || (order != "asc" && order != "desc") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sort_by or order parameter"})
			return
		}

		page, pageSize := parsePaginationParams(c, 1, 10)
		offset := (page - 1) * pageSize

		var totalCount int64
		if err := db.Model(&models.URL{}).Count(&totalCount).Error; err != nil {
			handleError(c, err)
			return
		}

		var urls []models.URL
		if err := db.Order(sortBy + " " + order).Limit(pageSize).Offset(offset).Find(&urls).Error; err != nil {
			handleError(c, err)
			return
		}

		response := make([]models.URLResponse, len(urls))
		for i, u := range urls {
			response[i] = urlToResponse(u)
		}

		c.JSON(http.StatusOK, gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total_count": totalCount,
			"urls":        response,
		})
	})

	urlGroup.GET("/url/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var urlEntry models.URL
		if err := db.Preload("BrokenLinksDetails").First(&urlEntry, id).Error; err != nil {
			handleError(c, err)
			return
		}

		c.JSON(http.StatusOK, urlToResponse(urlEntry))
	})

	urlGroup.DELETE("/url/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
			return
		}

		if err := db.Delete(&models.URL{}, id).Error; err != nil {
			handleError(c, err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "URL deleted successfully"})
	})

	urlGroup.POST("/crawl/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
			return
		}

		var urlEntry models.URL
		if err := db.First(&urlEntry, id).Error; err != nil {
			handleError(c, err)
			return
		}

		urlEntry.Status = "crawling"
		if err := db.Save(&urlEntry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
			return
		}

		if err := analyzer.CrawlURL(db, &urlEntry); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, urlToResponse(urlEntry))
	})
}
