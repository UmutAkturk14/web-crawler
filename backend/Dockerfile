# syntax=docker/dockerfile:1

# --- 1. Base stage for building ---
FROM golang:1.23-alpine AS builder

# Install necessary packages
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first (for caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire backend source
COPY . .

# Build the Go app
RUN go build -o webcrawler ./cmd/webcrawler

# --- 2. Final stage ---
FROM alpine:latest

# Set working directory
WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/webcrawler .

# Expose application port (optional, in case you use it)
EXPOSE 8080

# Run the binary
CMD ["./webcrawler"]
