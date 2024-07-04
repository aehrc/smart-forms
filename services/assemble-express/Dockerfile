# Builder stage
FROM node:19-alpine AS builder

WORKDIR /usr/share/app

COPY packages/sdc-assemble packages/sdc-assemble
COPY services/assemble-express services/assemble-express
COPY package*.json .

RUN npm ci

# Create image stage
FROM node:19-alpine

COPY --from=builder /usr/share/app/services/assemble-express/lib /usr/share/app
COPY --from=builder /usr/share/app/packages/sdc-assemble /usr/share/app/packages/sdc-assemble
COPY --from=builder /usr/share/app/node_modules /usr/share/app/node_modules

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/assemble-express/.env .

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3002
