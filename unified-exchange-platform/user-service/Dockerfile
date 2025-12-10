# 👑 USER SERVICE DOCKERFILE
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY src ./src

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001
CMD ["npm", "start"]
