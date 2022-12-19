FROM node:19

COPY lib /usr/share/app
COPY package*.json /usr/share/app

WORKDIR /usr/share/app

RUN npm ci

CMD ["node", "/usr/share/app/index.js"]

EXPOSE 3002
