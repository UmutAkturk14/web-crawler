package routes

import (
	"net/http"
	"strconv"

	"github.com/UmutAkturk14/web-crawler/backend/internal/analyzer"
	"github.com/UmutAkturk14/web-crawler/backend/internal/middleware"
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
			// Default pagination params
			const defaultPage = 1
			const defaultPageSize = 10

			// Parse query params for pagination
			pageStr := c.Query("page")
			pageSizeStr := c.Query("page_size")

			page := defaultPage
			pageSize := defaultPageSize

			if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
					page = p
			}

			if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
					pageSize = ps
			}

			var totalCount int64
			if err := db.Model(&models.URL{}).Count(&totalCount).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
			}

			var urls []models.URL

			// Calculate offset
			offset := (page - 1) * pageSize

			// Query with pagination
			if err := db.Order("created_at DESC").Limit(pageSize).Offset(offset).Find(&urls).Error; err != nil {
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

			c.JSON(http.StatusOK, gin.H{
					"page":       page,
					"page_size":  pageSize,
					"total_count": totalCount,
					"urls":       response,
			})
	})

	r.GET("/urls/sorted", func(c *gin.Context) {
		// Get query params
		sortBy := c.DefaultQuery("sort_by", "created_at")
		order := c.DefaultQuery("order", "desc")
		pageStr := c.DefaultQuery("page", "1")
		pageSizeStr := c.DefaultQuery("page_size", "10")

		// Validate fields
		allowedFields := map[string]bool{
			"id":             true,
			"url":            true,
			"status":         true,
			"title":          true,
			"html_version":   true,
			"h1_count":       true,
			"h2_count":       true,
			"h3_count":       true,
			"h4_count":       true,
			"h5_count":       true,
			"h6_count":       true,
			"internal_links": true,
			"external_links": true,
			"broken_links":   true,
			"login_form_found": true,
			"created_at":     true,
		}

		if !allowedFields[sortBy] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sort field"})
			return
		}
		if order != "asc" && order != "desc" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order value"})
			return
		}

		// Pagination
		page, err1 := strconv.Atoi(pageStr)
		pageSize, err2 := strconv.Atoi(pageSizeStr)
		if err1 != nil || page < 1 {
			page = 1
		}
		if err2 != nil || pageSize < 1 || pageSize > 100 {
			pageSize = 10
		}
		offset := (page - 1) * pageSize

		// Count total records
		var totalCount int64
		if err := db.Model(&models.URL{}).Count(&totalCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Query with sorting and pagination
		var urls []models.URL
		if err := db.Order(sortBy + " " + order).Limit(pageSize).Offset(offset).Find(&urls).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Convert to response
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

		// Return paginated & sorted result
		c.JSON(http.StatusOK, gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total_count": totalCount,
			"urls":        response,
		})
	})

	r.GET("/url/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		id, err := strconv.Atoi(idParam)
		if err != nil || id <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var urlEntry models.URL
		// Preload BrokenLinksDetails to fetch associated broken links
		if err := db.Preload("BrokenLinksDetails").First(&urlEntry, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		response := models.URLResponse{
			ID:               urlEntry.ID,
			URL:              urlEntry.URL,
			Status:           urlEntry.Status,
			Title:            urlEntry.Title,
			HTMLVersion:      urlEntry.HTMLVersion,
			H1Count:          urlEntry.H1Count,
			H2Count:          urlEntry.H2Count,
			H3Count:          urlEntry.H3Count,
			H4Count:          urlEntry.H4Count,
			H5Count:          urlEntry.H5Count,
			H6Count:          urlEntry.H6Count,
			InternalLinks:    urlEntry.InternalLinks,
			ExternalLinks:    urlEntry.ExternalLinks,
			BrokenLinks:      urlEntry.BrokenLinks,
			HasLoginForm:     urlEntry.LoginFormFound,
			CreatedAt:        urlEntry.CreatedAt,
			BrokenLinksDetails: urlEntry.BrokenLinksDetails,  // Added here
		}

		c.JSON(http.StatusOK, response)
	})


	r.DELETE("/url/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil || id <= 0 {
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

		if err := db.Delete(&urlEntry).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URL"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "URL deleted successfully"})
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

	urlGroup := r.Group("/").Use(middleware.AuthMiddleware())

	urlGroup.GET("/urls-protected", func(c *gin.Context) {
		var urls []models.URL
		if err := db.Find(&urls).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URLs"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"urls": urls})
	})

	// Group with Auth Middleware for testing
  authGroup := r.Group("/auth").Use(middleware.AuthMiddleware())

  // Simple test route to check if authentication passed
   authGroup.GET("/ping", func(c *gin.Context) {
      // You can get user info from context if your middleware sets it, e.g.:
      // user, _ := c.Get("user")
      c.JSON(http.StatusOK, gin.H{"message": "pong", "auth": "success"})
  })

  // Route to test access to protected resource
  authGroup.GET("/secret-data", func(c *gin.Context) {
      // Example protected data
      secretData := map[string]interface{}{
          "confidential": "The launch code is 12345",
          "user":         c.GetString("user"), // assuming middleware sets "user"
      }
      c.JSON(http.StatusOK, secretData)
  })
}
