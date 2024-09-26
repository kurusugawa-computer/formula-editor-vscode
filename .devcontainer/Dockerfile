FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

RUN set -x \
    && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo 'Asia/Tokyo' >/etc/timezone

# nodejs
ARG NODE_VERSION=20.17.0
RUN set -x \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
    && apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/* \
    && mkdir -p /usr/local/lib/nodejs \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" | tar xJ -C /usr/local/lib/nodejs
ENV PATH=/usr/local/lib/nodejs/node-v${NODE_VERSION}-linux-x64/bin:${PATH}

USER vscode

# RUN sudo apt-get update && sudo apt-get install -y \
#     [something to install]
#  && sudo apt-get clean \
#  && sudo rm -rf /var/lib/apt/lists/*
