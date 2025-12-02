# 👑 MARKET DATA SERVICE DOCKERFILE
FROM golang:1.21-alpine as builder

WORKDIR /app
COPY go.mod ./
RUN go mod download || echo "Skipping download for dev"

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o market-data-service .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/market-data-service .
CMD ["./market-data-service"]
