# Use Alpine Linux for minimal size
FROM python:3.10-alpine

# Install Git, basic tools, libc6-compat (for glibc binary compatibility), and libstdc++
RUN apk add --no-cache \
    git \
    openssh-client \
    libc6-compat \
    libstdc++

# Install code-server (web-based VS Code)
RUN wget https://github.com/coder/code-server/releases/download/v4.16.1/code-server-4.16.1-linux-amd64.tar.gz && \
    tar -xzf code-server-4.16.1-linux-amd64.tar.gz && \
    # Move the ENTIRE extracted directory to a standard library location
    mv code-server-4.16.1-linux-amd64 /usr/local/lib/code-server && \
    # Create a symbolic link to the binary in a system PATH location
    ln -s /usr/local/lib/code-server/bin/code-server /usr/local/bin/code-server && \
    # Clean up the downloaded tarball
    rm -f code-server-4.16.1-linux-amd64.tar.gz

# Create workspace directory
WORKDIR /workspace

# Expose code-server port
EXPOSE 8080

# Start code-server with no authentication (behind your auth layer)
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "/workspace"]