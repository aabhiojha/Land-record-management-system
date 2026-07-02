# syntax=docker/dockerfile:1

# ---- Build stage: produce the static Vite bundle ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: serve the bundle with nginx ----
FROM nginx:1.27-alpine AS runtime

# SPA routing + /api reverse proxy to the backend container.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
