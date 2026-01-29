FROM node:20-alpine

# Install Docker CLI and required dependencies
RUN apk add --no-cache docker-cli curl

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 4000
CMD ["npm", "run", "server"]