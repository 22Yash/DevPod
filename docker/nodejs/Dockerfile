# docker/nodejs/Dockerfile

# Use a standard Node base image
FROM node:20-bullseye-slim 

# Set user to root to install packages
USER root

# Install dependencies for code-server, git, and build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    git \
    build-essential \
    sudo \
    curl \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# CRITICAL STEP: Install code-server globally (fixes Exited 127)
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Set up the workspace directory
RUN mkdir /workspace
WORKDIR /workspace

# Copy your Node.js template files
# COPY . /workspace 

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "/workspace"]