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

# Install dependencies
RUN apk add --no-cache nodejs

# Copy built frontend into PocketBase's public directory
COPY --from=builder /app/frontend/dist ./pb_public

# Remove admin panel route
RUN rm -rf ./pb_public/_/

# Copy PocketBase binary and preloaded data
COPY pocketbase/pocketbase ./pocketbase
COPY pocketbase/pb_data ./pb_data

# Expose pocketbase port
EXPOSE 8090

# Run pocketbase serving frontend and API/admin panel
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]