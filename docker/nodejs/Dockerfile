# Use a standard Node base image with bash
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
    bash \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# CRITICAL STEP: Install code-server globally (fixes Exited 127)
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Set up the workspace directory
RUN mkdir /workspace
WORKDIR /workspace

# Copy welcome file
COPY welcome.js /workspace/welcome.js
RUN chmod +x /workspace/welcome.js

# Set environment variables
ENV SHELL=/bin/bash
ENV NODE_ENV=development

# Copy your Node.js template files
# COPY . /workspace 

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "/workspace"]