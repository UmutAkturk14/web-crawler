package routes

import (
	"net/http"
	"strconv"

	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

// Convert a models.URL to models.URLResponse
func urlToResponse(u models.URL) models.URLResponse {
	return models.URLResponse{
		ID:                 u.ID,
		URL:                u.URL,
		Status:             u.Status,
		Title:              u.Title,
		HTMLVersion:        u.HTMLVersion,
		H1Count:            u.H1Count,
		H2Count:            u.H2Count,
		H3Count:            u.H3Count,
		H4Count:            u.H4Count,
		H5Count:            u.H5Count,
		H6Count:            u.H6Count,
		InternalLinks:      u.InternalLinks,
		ExternalLinks:      u.ExternalLinks,
		BrokenLinks:        u.BrokenLinks,
		HasLoginForm:       u.LoginFormFound,
		CreatedAt:          u.CreatedAt,
		BrokenLinksDetails: u.BrokenLinksDetails,
	}
}

func parsePaginationParams(c *gin.Context, defaultPage, defaultPageSize int) (page, pageSize int) {
	page = defaultPage
	pageSize = defaultPageSize

	if p, err := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(defaultPage))); err == nil && p > 0 {
		page = p
	}

	if ps, err := strconv.Atoi(c.DefaultQuery("page_size", strconv.Itoa(defaultPageSize))); err == nil && ps > 0 && ps <= 100 {
		pageSize = ps
	}

	return
}

func handleError(c *gin.Context, err error) {
	if err == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}
