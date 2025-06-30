# Use Node.js for building, then serve statically
FROM node:18 AS builder

WORKDIR /app

# Install dependencies and build
COPY . .
RUN npm install
RUN npm run build

# Serve built frontend with 'serve'
FROM node:18 AS production
WORKDIR /app

RUN npm install -g serve

# Copy built static site
COPY --from=builder /app/dist /app/dist

# Serve the app
CMD ["serve", "-s", "dist", "-l", "1234"]
