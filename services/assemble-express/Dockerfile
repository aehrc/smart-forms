# Build stage: install the workspace's full dependency tree, build the local
# @aehrc/sdc-assemble package and compile the service. The output is plain
# JavaScript, so this stage runs on the build host's platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY packages/sdc-assemble/package.json packages/sdc-assemble/
COPY services/assemble-express/package.json services/assemble-express/

RUN npm ci --workspace packages/sdc-assemble --workspace services/assemble-express

COPY packages/sdc-assemble/tsconfig.json packages/sdc-assemble/
COPY packages/sdc-assemble/src packages/sdc-assemble/src
COPY services/assemble-express/tsconfig.json services/assemble-express/
COPY services/assemble-express/src services/assemble-express/src

RUN npm run build --workspace packages/sdc-assemble \
  && npm run compile --workspace services/assemble-express

# Dependencies stage: production dependencies of the service and of
# @aehrc/sdc-assemble only, installed for the target platform.
FROM node:24-alpine AS deps

WORKDIR /usr/share/app

COPY package.json package-lock.json ./
COPY packages/sdc-assemble/package.json packages/sdc-assemble/
COPY services/assemble-express/package.json services/assemble-express/

RUN npm ci --omit=dev --ignore-scripts --workspace services/assemble-express \
  && rm -f node_modules/assemble-express

# Runtime stage: Node.js, the compiled service, the built local package and
# its production dependencies. Package managers are removed because nothing
# runs them at run time.
FROM node:24-alpine

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn-* \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=builder /usr/share/app/services/assemble-express/lib /usr/share/app
COPY --from=deps /usr/share/app/node_modules /usr/share/app/node_modules
COPY --from=deps /usr/share/app/packages /usr/share/app/packages
COPY --from=builder /usr/share/app/packages/sdc-assemble/dist /usr/share/app/packages/sdc-assemble/dist

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/assemble-express/.env .

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3002
