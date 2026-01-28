# Development container for chatgpt-acp-app
FROM node:20

WORKDIR /workspace/chatgpt-acp-app

# Install dependencies
COPY package.json package-lock.json ./

RUN npm ci

# Install useful dev tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 8787

CMD ["sleep", "infinity"]
