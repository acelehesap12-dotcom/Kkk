# 👑 MARKET DATA SERVICE DOCKERFILE
FROM golang:1.21-alpine as builder

WORKDIR /app
COPY go.mod ./
RUN go mod download 2>/dev/null || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o market-data-service .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/market-data-service .

ENV PORT=8081
EXPOSE 8081
CMD ["./market-data-service"]
