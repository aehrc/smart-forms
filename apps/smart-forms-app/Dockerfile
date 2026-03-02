# Dockerfile

# Step 1: Use a Node.js image to build the app
FROM --platform=$BUILDPLATFORM node:18 AS builder

# Set working directory inside the container
WORKDIR /app

# Install build tools for native dependencies
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Set npm config for python and permissions (use ENV for cross-platform compatibility)
ENV npm_config_python=python3 \
    npm_config_unsafe_perm=true

# Copy root workspace package files so npm can set up the workspace
COPY package*.json ./

# Copy only the package manifests first (better layer caching for npm install)
COPY packages/smart-forms-renderer/package*.json ./packages/smart-forms-renderer/
COPY apps/smart-forms-app/package*.json ./apps/smart-forms-app/

# Install all workspace dependencies from the root
RUN npm install

# Copy source files for the renderer and the app
COPY packages/smart-forms-renderer/ ./packages/smart-forms-renderer/
COPY apps/smart-forms-app/ ./apps/smart-forms-app/

# Build the renderer package first so its lib/ output is up to date
RUN npm run build --workspace=packages/smart-forms-renderer

# Build the app
RUN npm run build --workspace=apps/smart-forms-app


# Step 2: Use an Nginx image to serve the static files
FROM --platform=$BUILDPLATFORM nginx:alpine

# Copy the build files from the builder stage to the Nginx web directory
COPY --from=builder /app/apps/smart-forms-app/dist /usr/share/nginx/html

# Copy your Nginx configuration file into the container
COPY --from=builder /app/apps/smart-forms-app/default.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
