#!bash
set -xe

# Compile the Express app.
cd services/assemble-express && npm run compile && cd -

# Build the Docker image for multiple architectures, then push to Docker Hub.
docker buildx build --file ./services/assemble-express/Dockerfile --tag aehrc/smart-forms-assemble \
  --platform linux/amd64,linux/arm64/v8 --push --no-cache .
