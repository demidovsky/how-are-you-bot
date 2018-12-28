FROM node:alpine

RUN npm install --only=production

COPY . .

CMD [ "npm", "start" ]  