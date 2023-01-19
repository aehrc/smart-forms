FROM node:19

WORKDIR /usr/share/app

COPY packages/sdc-assemble packages/sdc-assemble
COPY services/assemble-express services/assemble-express
COPY package*.json .

RUN npm ci

FROM node:19

COPY --from=0 /usr/share/app/services/assemble-express/lib /usr/share/app
COPY --from=0 /usr/share/app/packages/sdc-assemble /usr/share/app/packages/sdc-assemble
COPY --from=0 /usr/share/app/node_modules /usr/share/app/node_modules

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3002