FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT=3000

# Установка переменных окружения
ENV BOT_TOKEN=<YOUR_BOT_TOKEN>

# Открытие порта для взаимодействия с ботом
EXPOSE $PORT

# Запуск приложения
CMD ["npm", "start"]
