FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ gfortran python3-dev \
    libopenblas-dev liblapack-dev libfreetype6-dev libpng-dev libjpeg-dev \
    libxml2-dev libxslt1-dev libffi-dev libssl-dev rustc cargo \
    libcurl4-openssl-dev libpq-dev default-libmysqlclient-dev \
    libgdal-dev libproj-dev libgeos-dev \
    libx11-dev libxtst-dev xorg tesseract-ocr python3 python3-pip \
    git curl wget vim bash postgresql-client default-mysql-client \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Copy your pre-built fork (from GitHub Actions build step)
COPY compiled/ /usr/local/lib/node_modules/n8n/

# Install production dependencies inside container
WORKDIR /usr/local/lib/node_modules/n8n
RUN pnpm install --prod

# Create n8n CLI link
RUN ln -sf /usr/local/lib/node_modules/n8n/packages/cli/bin/n8n /usr/local/bin/n8n

# Verify n8n works (build fails here if broken)
RUN n8n --version

# Setup custom n8n stuff
WORKDIR /
RUN mkdir -p /usr/src/app/default-workflows \
    && mkdir -p /usr/src/app/initial-credentials \
    && mkdir -p /usr/src/app/workflows-static

COPY workflows/ /usr/src/app/default-workflows/
COPY initial-credentials/ /usr/src/app/initial-credentials/
COPY requirements.txt /tmp/requirements.txt
COPY .devcontainer/setup-defaults.sh /tmp/setup-defaults.sh

RUN echo '#!/bin/sh' > /usr/local/bin/setup-defaults.sh && \
    tr -d '\r' < /tmp/setup-defaults.sh >> /usr/local/bin/setup-defaults.sh && \
    chmod +x /usr/local/bin/setup-defaults.sh && \
    rm /tmp/setup-defaults.sh

COPY workflows-static/ /usr/src/app/workflows-static/

RUN chown -R node:node /home/node /usr/src/app

USER node
WORKDIR /home/node
CMD ["/bin/sh", "-c", "/usr/local/bin/setup-defaults.sh"]
