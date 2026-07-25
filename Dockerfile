FROM node:22-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
