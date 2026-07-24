FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

COPY app.js index.html styles.css favicon.svg ./
COPY data ./data
COPY scripts ./scripts

EXPOSE 8080

CMD ["npm", "start"]
