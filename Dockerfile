FROM node:14

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run tsc

EXPOSE 8080

CMD [ "node", "dist/server.js" ]