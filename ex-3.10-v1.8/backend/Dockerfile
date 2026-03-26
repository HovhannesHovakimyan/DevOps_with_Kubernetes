FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY todo-backend.js ./

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]