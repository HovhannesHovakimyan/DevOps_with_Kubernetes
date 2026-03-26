FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY todo-frontend.js ./
COPY public ./public

RUN npm install

EXPOSE 3000

ENV BACKEND_PATH=todos
# Set cache directory to a mountable location
ENV CACHE_DIR=/cache

CMD ["npm", "start"]