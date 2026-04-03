FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install C/C++ toolchain and utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    cmake \
    gdb \
    git \
    curl \
    wget \
    ca-certificates \
    sudo \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh && \
    code-server --version

WORKDIR /workspace

# Create welcome file
COPY welcome.cpp /workspace/welcome.cpp

ENV SHELL=/bin/bash

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "/workspace"]
