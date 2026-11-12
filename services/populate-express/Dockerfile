# Build stage: install the workspace's full dependency tree, build the local
# @aehrc/sdc-populate package and compile the service. The output is plain
# JavaScript, so this stage runs on the build host's platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY packages/sdc-populate/package.json packages/sdc-populate/
COPY services/populate-express/package.json services/populate-express/

RUN npm ci --workspace packages/sdc-populate --workspace services/populate-express

COPY packages/sdc-populate/tsconfig.json packages/sdc-populate/
COPY packages/sdc-populate/src packages/sdc-populate/src
COPY services/populate-express/tsconfig.json services/populate-express/
COPY services/populate-express/src services/populate-express/src

RUN npm run build --workspace packages/sdc-populate \
  && npm run compile --workspace services/populate-express

# Dependencies stage: production dependencies of the service and of
# @aehrc/sdc-populate only, installed for the target platform.
FROM node:24-alpine AS deps

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY packages/sdc-populate/package.json packages/sdc-populate/
COPY services/populate-express/package.json services/populate-express/

RUN npm ci --omit=dev --ignore-scripts --workspace services/populate-express \
  && rm -f node_modules/populate-express

# Runtime stage: Node.js, the compiled service, the built local package and
# its production dependencies. Package managers are removed because nothing
# runs them at run time.
FROM node:24-alpine

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn-* \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder /usr/share/app/services/populate-express/lib /usr/share/app
COPY --from=deps /usr/share/app/node_modules /usr/share/app/node_modules
COPY --from=deps /usr/share/app/packages /usr/share/app/packages
COPY --from=builder /usr/share/app/packages/sdc-populate/dist /usr/share/app/packages/sdc-populate/dist

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/populate-express/.env .

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3001
