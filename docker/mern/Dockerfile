FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache git openssh-client curl bash

# Install code-server v4.16.1 (compatible with Node 20)
RUN curl -fOL https://github.com/coder/code-server/releases/download/v4.16.1/code-server-4.16.1-linux-amd64.tar.gz && \
    tar -xzf code-server-4.16.1-linux-amd64.tar.gz && \
    mv code-server-4.16.1-linux-amd64/bin/code-server /usr/local/bin/code-server && \
    mv code-server-4.16.1-linux-amd64/lib/node /usr/local/lib/node && \
    rm -rf code-server-4.16.1-linux-amd64* && \
    chmod +x /usr/local/bin/code-server

# Install global packages
RUN npm install -g nodemon concurrently

WORKDIR /workspace

# Copy setup script
COPY ./mern-template/setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh

# CRITICAL: Expose ports for Docker
EXPOSE 3000 5000 8080

# Create startup wrapper
RUN printf '#!/bin/sh\n\
set -e\n\
echo "🚀 Starting MERN container..."\n\
/usr/local/bin/setup.sh || echo "⚠️ Setup had issues"\n\
echo "📝 Starting code-server..."\n\
exec /usr/local/bin/code-server --bind-addr 0.0.0.0:8080 --auth none /workspace\n' > /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]