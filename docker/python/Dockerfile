# Use Alpine Linux for minimal size
FROM python:3.10-alpine

# Install Git, basic tools, bash, and other dependencies
RUN apk add --no-cache \
    git \
    openssh-client \
    bash \
    curl \
    wget \
    libc6-compat \
    libstdc++ \
    build-base \
    && ln -sf /bin/bash /bin/sh

# Install common Python packages
RUN pip install --no-cache-dir \
    requests \
    flask \
    fastapi \
    uvicorn \
    pytest \
    black \
    flake8

# Install code-server (web-based VS Code)
RUN wget https://github.com/coder/code-server/releases/download/v4.16.1/code-server-4.16.1-linux-amd64.tar.gz && \
    tar -xzf code-server-4.16.1-linux-amd64.tar.gz && \
    # Move the ENTIRE extracted directory to a standard library location
    mv code-server-4.16.1-linux-amd64 /usr/local/lib/code-server && \
    # Create a symbolic link to the binary in a system PATH location
    ln -s /usr/local/lib/code-server/bin/code-server /usr/local/bin/code-server && \
    # Clean up the downloaded tarball
    rm -f code-server-4.16.1-linux-amd64.tar.gz

# Create workspace directory and set proper permissions
WORKDIR /workspace
RUN chmod 755 /workspace

# Copy welcome file
COPY welcome.py /workspace/welcome.py
RUN chmod +x /workspace/welcome.py

# Set environment variables for better Python experience
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV SHELL=/bin/bash

# Expose code-server port
EXPOSE 8080

# Start code-server with bash as default shell
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "/workspace"]