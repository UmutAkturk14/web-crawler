package linkcheck

import (
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// LinkCheckResult holds the URL and error/status for broken link
type LinkCheckResult struct {
	URL    string
	Status string
}

// CheckBrokenLinks checks given URLs and returns broken ones
func CheckBrokenLinks(links []string) ([]LinkCheckResult, error) {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	const maxWorkers = 10
	linksCh := make(chan string)
	resultsCh := make(chan LinkCheckResult)
	var wg sync.WaitGroup

	worker := func() {
		defer wg.Done()
		for link := range linksCh {
			fmt.Println("Checking link:", link)
			resp, err := client.Head(link)
			if err != nil || resp.StatusCode >= 400 {
				if resp != nil {
					resp.Body.Close()
				}
				respGet, errGet := client.Get(link)
				if errGet != nil || respGet.StatusCode >= 400 {
					status := "error"
					if respGet != nil {
						status = respGet.Status
						respGet.Body.Close()
					} else if resp != nil {
						status = resp.Status
					} else if errGet != nil {
						status = errGet.Error()
					} else if err != nil {
						status = err.Error()
					}
					resultsCh <- LinkCheckResult{URL: link, Status: status}
					continue
				}
				respGet.Body.Close()
			} else {
				resp.Body.Close()
			}
		}
	}

	// Start workers
	wg.Add(maxWorkers)
	for i := 0; i < maxWorkers; i++ {
		go worker()
	}

	// Feed links to workers
	go func() {
		for _, link := range links {
			linksCh <- link
		}
		close(linksCh)
	}()

	// Collect results
	var broken []LinkCheckResult
	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	for res := range resultsCh {
		fmt.Println("Broken link found:", res.URL, "Status:", res.Status)
		broken = append(broken, res)
	}

	return broken, nil
}

func ExtractAllLinks(doc *goquery.Document, baseURL string) []string {
	var links []string

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		absURL := resolveURL(baseURL, href)
		if absURL != "" {
			links = append(links, absURL)
		}
	})

	return links
}

func resolveURL(base, href string) string {
	baseParsed, err := url.Parse(base)
	if err != nil {
		return ""
	}
	hrefParsed, err := url.Parse(href)
	if err != nil {
		return ""
	}
	resolved := baseParsed.ResolveReference(hrefParsed)
	return resolved.String()
}
