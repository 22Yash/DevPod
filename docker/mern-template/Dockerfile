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

# Install global packages for MERN development
RUN npm install -g nodemon concurrently

# Set working directory
WORKDIR /workspace

# Copy template files to safe location (survives volume mounts)
COPY . /template

# Copy template files to workspace for initial setup
COPY . /workspace

# Make startup script executable in both locations
RUN chmod +x /template/startup.sh /workspace/startup.sh

# Install root dependencies
WORKDIR /workspace
RUN npm install --silent

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

# Use startup.sh from template location (survives volume mounts)
CMD ["/template/startup.sh"]