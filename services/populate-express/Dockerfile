# Builder stage
FROM node:19-alpine AS builder

WORKDIR /usr/share/app

COPY packages/sdc-populate packages/sdc-populate
COPY services/populate-express services/populate-express
COPY package*.json .

RUN npm ci

# Create image stage
FROM node:19-alpine

COPY --from=builder /usr/share/app/services/populate-express/lib /usr/share/app
COPY --from=0 /usr/share/app/packages/sdc-populate /usr/share/app/packages/sdc-populate
COPY --from=builder /usr/share/app/node_modules /usr/share/app/node_modules

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/populate-express/.env .

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3001
