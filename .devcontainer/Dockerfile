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

# Copy your pre-built fork (from GitHub Actions build step)
COPY compiled/ /usr/local/lib/node_modules/n8n/

# Create n8n CLI link
RUN ln -s /usr/local/lib/node_modules/n8n/packages/cli/bin/n8n /usr/local/bin/n8n

# Your custom stuff
RUN mkdir -p /usr/src/app/default-workflows
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
CMD ["/bin/sh", "-c", "/usr/local/bin/setup-defaults.sh"]
