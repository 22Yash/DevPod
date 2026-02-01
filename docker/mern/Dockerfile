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

# Install global packages for MERN
RUN npm install -g nodemon concurrently

WORKDIR /workspace

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "--disable-update-check", "/workspace"]