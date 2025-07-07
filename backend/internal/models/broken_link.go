package models

type BrokenLink struct {
	ID         uint   `gorm:"primaryKey"`
	URLID      uint		`json:"url_id"`
	Link       string `json:"link"`
}
