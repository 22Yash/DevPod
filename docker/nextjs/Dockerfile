FROM node:20-bookworm-slim

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

WORKDIR /workspace

# Create a Next.js app
RUN npx --yes create-next-app@latest nextapp --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm && \
    mv nextapp/* nextapp/.* . 2>/dev/null || true && \
    rmdir nextapp 2>/dev/null || true

ENV SHELL=/bin/bash
ENV NODE_ENV=development

EXPOSE 8080 3000

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "/workspace"]
