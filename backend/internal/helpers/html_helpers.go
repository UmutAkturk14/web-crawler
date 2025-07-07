package helpers

import (
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// DetectHTMLVersion can be expanded later, for now returns HTML5
func DetectHTMLVersion() string {
    return "HTML5"
}

func CountLinks(doc *goquery.Document, baseURL string) (int, int) {
	internal := 0
	external := 0

	base, err := url.Parse(baseURL)
	if err != nil {
		return 0, 0 // or handle error properly
	}

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || strings.TrimSpace(href) == "" || href == "#" {
			return
		}

		parsedHref, err := url.Parse(href)
		if err != nil {
			return
		}

		// Resolve relative URLs
		absURL := base.ResolveReference(parsedHref)

		if absURL.Host == base.Host {
			internal++
		} else {
			external++
		}
	})

	return internal, external
}

func HasLoginForm(doc *goquery.Document) bool {
    found := false
    doc.Find("form").EachWithBreak(func(i int, s *goquery.Selection) bool {
        if s.Find(`input[type="password"]`).Length() > 0 {
            found = true
            return false
        }
        return true
    })
    return found
}
