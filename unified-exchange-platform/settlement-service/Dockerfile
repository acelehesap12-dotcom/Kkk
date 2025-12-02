# 👑 SETTLEMENT SERVICE DOCKERFILE
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

# Stage 2: Production Runtime
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

USER node

CMD ["node", "dist/chain-reorg-manager.js"]
