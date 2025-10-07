# docker/mern-template/Dockerfile

FROM node:20-bullseye-slim 

USER root

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    git \
    build-essential \
    sudo \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --version

# Set working directory
WORKDIR /workspace

# Copy entire mern-template contents
COPY ./mern-template /workspace

# Make startup script executable
RUN chmod +x /workspace/startup.sh

# Install backend dependencies
WORKDIR /workspace/backend
RUN npm install --silent

# Install frontend dependencies
WORKDIR /workspace/frontend
RUN npm install --silent

# Return to workspace root
WORKDIR /workspace

# Expose ports: code-server, frontend dev server, backend API
EXPOSE 8080 3000 5000

# Use startup.sh as entrypoint
CMD ["/workspace/startup.sh"]