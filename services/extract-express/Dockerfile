# Builder stage
FROM node:19-alpine AS builder

WORKDIR /usr/share/app

COPY services/extract-express services/extract-express
COPY package*.json .

RUN npm ci

# Create image stage
FROM node:19-alpine

COPY --from=builder /usr/share/app/services/extract-express/lib /usr/share/app
COPY --from=builder /usr/share/app/node_modules /usr/share/app/node_modules

# Define environment variables
# Or you can choose to copy the entire env file to the docker image's root dir to be read by dotenv (not best practice)
# i.e. COPY --from=builder /usr/share/app/services/extract-express/.env .
ENV FORMS_SERVER_URL='https://smartforms.csiro.au/api/fhir'

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3003
