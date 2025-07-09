# --- 1. Builder stage ---
FROM golang:1.24-alpine as builder

RUN apk update && apk add --no-cache git upx

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy the entire source code
COPY . .

# Build the binary, optimize for size, and compress with upx
RUN go build -ldflags="-s -w" -o webcrawler cmd/webcrawler/main.go
RUN upx --best --ultra-brute webcrawler

# --- 2. Final stage ---
FROM alpine:latest

# Install netcat for wait-for-it.sh to work
RUN apk add --no-cache netcat-openbsd

# Copy wait-for-it.sh script and make executable
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

WORKDIR /root/

# Copy the built binary from builder stage
COPY --from=builder /app/webcrawler .

EXPOSE 8080

# Default command, can be overridden in docker-compose
CMD ["./webcrawler"]
