package models

import "time"

type URL struct {
	ID              uint         `gorm:"primaryKey"`
	URL             string       `gorm:"unique;not null"`
	HTMLVersion     string
	Title           string
	H1Count         int
	H2Count         int
	H3Count					int
	H4Count					int
	H5Count					int
	H6Count					int
	InternalLinks   int
	ExternalLinks   int
	BrokenLinks     int
	LoginFormFound  bool
	Status          string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	BrokenLinksDetails []BrokenLink `gorm:"foreignKey:URLID;constraint:OnDelete:CASCADE;"`
}
