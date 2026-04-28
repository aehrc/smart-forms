# Dockerfile
# Runtime Configuration: This Docker image supports runtime configuration via config.json.
# Mount your custom config.json at /usr/share/nginx/html/config.json to override defaults.
# See config.docker.json for an example and the README for Kubernetes ConfigMap documentation.

# Step 1: Use a Node.js image to build the app
FROM --platform=$BUILDPLATFORM node:20 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/smart-forms-app/package*.json ./apps/smart-forms-app/

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the app
WORKDIR /app/apps/smart-forms-app
RUN npm run build

# Step 2: Use an Nginx image to serve the static files
FROM nginx:alpine

# Copy the build files from the builder stage to the Nginx web directory
COPY --from=builder /app/apps/smart-forms-app/dist /usr/share/nginx/html

# Copy your Nginx configuration file into the container
COPY apps/smart-forms-app/default.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
