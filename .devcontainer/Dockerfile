FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ gfortran python3-dev python3 python3-pip python3-venv \
    libopenblas-dev liblapack-dev libfreetype6-dev libpng-dev libjpeg-dev \
    libxml2-dev libxslt1-dev libffi-dev libssl-dev rustc cargo \
    libcurl4-openssl-dev libpq-dev default-libmysqlclient-dev \
    libgdal-dev libproj-dev libgeos-dev \
    libx11-dev libxtst-dev xorg tesseract-ocr \
    git curl wget vim bash postgresql-client default-mysql-client \
    tini jq \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

# pre-built n8n from CI
COPY compiled/ /usr/local/lib/node_modules/n8n/

WORKDIR /usr/local/lib/node_modules/n8n
RUN pnpm install --prod

RUN ln -sf /usr/local/lib/node_modules/n8n/packages/cli/bin/n8n /usr/local/bin/n8n
RUN n8n --version

# --- Python default packages (from stardawn_setup)
COPY stardawn_setup/python-default-packages /tmp/python-default-packages.txt
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install -U pip setuptools wheel && \
    /opt/venv/bin/pip install -r /tmp/python-default-packages.txt

ENV PATH="/opt/venv/bin:$PATH"

# runtime assets
WORKDIR /
RUN mkdir -p /usr/src/app/default-workflows \
    && mkdir -p /usr/src/app/initial-credentials \
    && mkdir -p /usr/src/app/workflows-static

COPY workflows/ /usr/src/app/default-workflows/
COPY initial-credentials/ /usr/src/app/initial-credentials/
COPY workflows-static/ /usr/src/app/workflows-static/
COPY .devcontainer/setup-defaults.sh /tmp/setup-defaults.sh

RUN echo '#!/bin/sh' > /usr/local/bin/setup-defaults.sh && \
    tr -d '\r' < /tmp/setup-defaults.sh >> /usr/local/bin/setup-defaults.sh && \
    chmod +x /usr/local/bin/setup-defaults.sh && \
    rm /tmp/setup-defaults.sh

RUN chown -R node:node /home/node /usr/src/app

USER node
WORKDIR /home/node
CMD ["/bin/sh", "-c", "/usr/local/bin/setup-defaults.sh"]
