# Build stage: install the workspace's full dependency tree and compile the
# service. The output is plain JavaScript, so this stage runs on the build
# host's platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY services/extract-express/package.json services/extract-express/

RUN npm ci --workspace services/extract-express

COPY services/extract-express/tsconfig.json services/extract-express/
COPY services/extract-express/src services/extract-express/src

RUN npm run compile --workspace services/extract-express

# Dependencies stage: production dependencies of the service only, installed
# for the target platform.
FROM node:24-alpine AS deps

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY services/extract-express/package.json services/extract-express/

RUN npm ci --omit=dev --ignore-scripts --workspace services/extract-express \
  && rm -f node_modules/extract-express

# Runtime stage: Node.js, the compiled service and its production
# dependencies. Package managers are removed because nothing runs them at run
# time.
FROM node:24-alpine

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn-* \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder /usr/share/app/services/extract-express/lib /usr/share/app
COPY --from=deps /usr/share/app/node_modules /usr/share/app/node_modules

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/extract-express/.env .
ENV FORMS_SERVER_URL='https://smartforms.csiro.au/api/fhir'

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3003
