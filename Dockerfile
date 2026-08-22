# Google Cloud Run / Docker deployment for YenFind
FROM node:18-alpine

WORKDIR /app

# Copy all application files
COPY package*.json ./
COPY . .

# Expose default Cloud Run port (8080 or process.env.PORT)
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
