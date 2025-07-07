package analyzer

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/UmutAkturk14/web-crawler/backend/internal/helpers"
	"github.com/UmutAkturk14/web-crawler/backend/internal/models"
	"gorm.io/gorm"
)

func CrawlURL(db *gorm.DB, urlEntry *models.URL) error {
	fmt.Println("Starting crawl for URL ID:", urlEntry.ID, "URL:", urlEntry.URL)

	resp, err := http.Get(urlEntry.URL)
	if err != nil {
		fmt.Println("Error fetching URL:", err)
		return err
	}
	defer resp.Body.Close()

	fmt.Println("HTTP response status code:", resp.StatusCode)
	if resp.StatusCode != 200 {
		urlEntry.Status = fmt.Sprintf("failed with status %d", resp.StatusCode)
		db.Save(urlEntry)
		return errors.New("failed to fetch URL")
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		fmt.Println("Error parsing HTML document:", err)
		return err
	}
	fmt.Println("Parsed HTML document successfully")

	urlEntry.HTMLVersion = helpers.DetectHTMLVersion()
	fmt.Println("Detected HTML version:", urlEntry.HTMLVersion)

	urlEntry.Title = strings.TrimSpace(doc.Find("title").Text())
	fmt.Println("Page title:", urlEntry.Title)

	urlEntry.H1Count = doc.Find("h1").Length()
	urlEntry.H2Count = doc.Find("h2").Length()
	urlEntry.H3Count = doc.Find("h3").Length()
	urlEntry.H4Count = doc.Find("h4").Length()
	urlEntry.H5Count = doc.Find("h5").Length()
	urlEntry.H6Count = doc.Find("h6").Length()
	fmt.Printf("Header counts h1:%d h2:%d h3:%d h4:%d h5:%d h6:%d\n",
		urlEntry.H1Count, urlEntry.H2Count, urlEntry.H3Count,
		urlEntry.H4Count, urlEntry.H5Count, urlEntry.H6Count)

	internalLinks, externalLinks := helpers.CountLinks(doc, urlEntry.URL)
	urlEntry.InternalLinks = internalLinks
	urlEntry.ExternalLinks = externalLinks
	fmt.Println("Counted links - internal:", internalLinks, "external:", externalLinks)

	urlEntry.LoginFormFound = helpers.HasLoginForm(doc)
	fmt.Println("Login form found:", urlEntry.LoginFormFound)

	allLinks := helpers.ExtractAllLinks(doc, urlEntry.URL)
	fmt.Println("Extracted total links for broken link check:", len(allLinks))

	// Check broken links
	linkCheckResults, err := helpers.CheckBrokenLinks(allLinks)
	if err != nil {
		fmt.Println("Warning: error during broken links check:", err)
	} else {
		fmt.Println("Broken links check completed, results count:", len(linkCheckResults))
	}

	// Convert helper results to model broken links
	var brokenLinks []models.BrokenLink
	for _, res := range linkCheckResults {
		brokenLinks = append(brokenLinks, models.BrokenLink{
			URLID:      urlEntry.ID,
			Link:       res.URL,
		})
	}
	fmt.Println("Converted broken links count:", len(brokenLinks))

	// Delete old broken links
	if err := db.Where("url_id = ?", urlEntry.ID).Delete(&models.BrokenLink{}).Error; err != nil {
		fmt.Println("Failed to delete old broken links:", err)
		return fmt.Errorf("failed to delete old broken links: %w", err)
	}
	fmt.Println("Deleted old broken links from DB")

	// Insert new broken links
	if len(brokenLinks) > 0 {
		if err := db.Create(&brokenLinks).Error; err != nil {
			fmt.Println("Failed to insert new broken links:", err)
			return fmt.Errorf("failed to create broken links: %w", err)
		}
		fmt.Println("Inserted new broken links into DB")
	}

	urlEntry.BrokenLinks = len(brokenLinks)
	urlEntry.BrokenLinksDetails = brokenLinks

	urlEntry.Status = "done"
	fmt.Println("Setting status to done and saving urlEntry")

	err = db.Save(urlEntry).Error
	if err != nil {
		fmt.Println("Failed to save updated URL entry:", err)
		return err
	}

	fmt.Println("Crawl finished successfully for URL ID:", urlEntry.ID)
	return nil
}
