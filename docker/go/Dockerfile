FROM golang:1.22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Install utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
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
COPY welcome.go /workspace/welcome.go

ENV SHELL=/bin/bash
ENV PATH="/usr/local/go/bin:/go/bin:${PATH}"
ENV GOPATH="/go"
RUN echo 'export PATH="/usr/local/go/bin:/go/bin:$PATH"' >> /etc/bash.bashrc

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry", "/workspace"]
