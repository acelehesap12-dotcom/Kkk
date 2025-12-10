# 👑 MARKET DATA SERVICE DOCKERFILE
FROM golang:1.21-alpine as builder

# Install build dependencies for CGO (librdkafka)
RUN apk add --no-cache build-base

WORKDIR /app
COPY go.mod ./
RUN go mod download || echo "Skipping download for dev"

COPY . .
# Build with CGO enabled and musl tags
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o market-data-service .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/market-data-service .
CMD ["./market-data-service"]
