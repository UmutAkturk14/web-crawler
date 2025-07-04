package models

type BrokenLink struct {
	ID         uint   `gorm:"primaryKey"`
	URLID      uint
	Link       string
	StatusCode int
}
