FROM node:20-alpine

# Install Docker CLI (to control host Docker daemon)
RUN apk add --no-cache docker-cli

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "run", "server"]