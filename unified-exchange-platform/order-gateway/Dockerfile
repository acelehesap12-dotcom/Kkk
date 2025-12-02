# 👑 ORDER GATEWAY DOCKERFILE
FROM golang:1.21-alpine as builder

WORKDIR /app
COPY go.mod ./
# COPY go.sum ./ # In real scenario
RUN go mod download || echo "Skipping download for dev"

COPY . .
# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o order-gateway .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/order-gateway .
EXPOSE 8080
CMD ["./order-gateway"]
