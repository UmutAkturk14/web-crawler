package helpers

import (
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

    doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
        href, _ := s.Attr("href")
        href = strings.TrimSpace(href)
        if href == "" || href == "#" {
            return
        }
        if strings.HasPrefix(href, "http") {
            if strings.HasPrefix(href, baseURL) {
                internal++
            } else {
                external++
            }
        } else {
            internal++
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
