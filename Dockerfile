# Alpine Node Image
FROM node:10-alpine AS builder

# Create app directory
WORKDIR /usr/app

# Copy package info
COPY package.json package-lock.json ./

# Install app dependencies
RUN apk add --no-cache tini bash git openssh
RUN npm i -g typescript
RUN npm ci

# Build source
COPY . .
RUN npm run build

# Main Image
FROM node:10-alpine
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/app

# Copy built source
COPY package.json package-lock.json ./
COPY --from=builder /usr/app/build ./build

# Install prod dependencies
RUN apk add --no-cache tini bash git openssh curl && \
  npm install --production && \
  apk del bash git openssh

# Start Node.js
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "."]
