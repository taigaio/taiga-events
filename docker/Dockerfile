# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos INC

FROM node:24-alpine
LABEL maintainer="support@taiga.io"

COPY . /taiga-events
WORKDIR /taiga-events

# grab su-exec for easy step-down from root
# https://github.com/ncopa/su-exec

RUN set -eux; \
    apk update; \
    apk upgrade --no-cache; \
    apk add --no-cache \
       gettext \
       su-exec; \
    npm install; \
    # npm is only needed to install the dependencies: remove it, and the packages it bundles, from the image
    npm cache clean --force; \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx; \
    chmod +x docker/entrypoint.sh; \
    addgroup -g 99 -S taiga; \
    adduser -u 99 -S -D -G taiga -H -h /taiga-events -s /bin/sh taiga; \
    chown -R taiga:taiga /taiga-events

EXPOSE 8888
ENTRYPOINT ["./docker/entrypoint.sh"]
