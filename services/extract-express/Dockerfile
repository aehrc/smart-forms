FROM node:19

WORKDIR /usr/share/app

COPY services/extract-express services/extract-express
COPY package*.json .

RUN npm ci

FROM node:19

COPY --from=0 /usr/share/app/services/extract-express/lib /usr/share/app
COPY --from=0 /usr/share/app/node_modules /usr/share/app/node_modules

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3003
