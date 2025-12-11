# 👑 ORDER GATEWAY DOCKERFILE
FROM golang:1.21-alpine as builder

WORKDIR /app
COPY go.mod ./
RUN go mod download || go mod tidy

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o order-gateway .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/order-gateway .

ENV PORT=8080
EXPOSE 8080
CMD ["./order-gateway"]
