# Dockerfile

# Step 1: Use a Node.js image to build the app
FROM --platform=$BUILDPLATFORM node:18 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install build tools for native dependencies
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Set npm config for python and permissions (use ENV for cross-platform compatibility)
ENV npm_config_python=python3 \
    npm_config_unsafe_perm=true

# Install dependencies
RUN npm install

# Copy the rest of the app’s source code
COPY . .

# Build the app
RUN npm run build


# Step 2: Use an Nginx image to serve the static files
FROM --platform=$BUILDPLATFORM nginx:alpine

# Copy the build files from the builder stage to the Nginx web directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy your Nginx configuration file into the container
COPY default.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]