#!bash
set -xe

# Compile the Express app.
npm run compile

# Build the Docker image for multiple architectures, then push to Docker Hub.
docker buildx build --tag aehrc/smart-forms-assemble \
  --platform linux/amd64,linux/arm64/v8 --push --no-cache .
