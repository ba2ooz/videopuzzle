# ---------- Build Frontend ----------
FROM node:18 AS builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---------- Final Runtime Image ----------
FROM alpine:latest

WORKDIR /app

# Install minimal static server
RUN apk add --no-cache nodejs npm
RUN npm install -g serve

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend

# Copy PocketBase binary and preloaded data
COPY pocketbase/pocketbase ./pocketbase
COPY pocketbase/pb_data ./pb_data

# Expose ports
EXPOSE 1234
EXPOSE 8090

# Run both servers concurrently
CMD sh -c "./pocketbase serve --http=0.0.0.0:8090 & serve -s ./frontend -l 1234 && wait"