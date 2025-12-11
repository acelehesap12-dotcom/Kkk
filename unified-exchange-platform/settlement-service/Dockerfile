# 👑 SETTLEMENT SERVICE DOCKERFILE
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

# Production Runtime
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

ENV PORT=3002
EXPOSE 3002

USER node

CMD ["node", "dist/chain-reorg-manager.js"]
