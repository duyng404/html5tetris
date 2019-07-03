FROM node:11

WORKDIR /tetris
COPY . .

RUN npm install

ENTRYPOINT ["node", "highscoreServer.js"]
