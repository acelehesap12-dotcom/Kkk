# 👑 ORDER GATEWAY DOCKERFILE
FROM golang:1.21-alpine as builder

# Install build dependencies for CGO (librdkafka)
RUN apk add --no-cache build-base

WORKDIR /app
COPY go.mod ./
# COPY go.sum ./ # In real scenario
RUN go mod download || echo "Skipping download for dev"

COPY . .
# Build with CGO enabled and musl tags for static linking of librdkafka
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o order-gateway .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/order-gateway .
EXPOSE 8080
CMD ["./order-gateway"]
