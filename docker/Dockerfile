# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

FROM node:12-alpine
LABEL maintainer="support@taiga.io"

COPY . /taiga-events
WORKDIR /taiga-events

# grab su-exec for easy step-down from root
# https://github.com/ncopa/su-exec

RUN set -eux; \
    apk update; \
    apk add --no-cache \
       gettext \
       su-exec; \
    npm install; \
    chmod +x docker/entrypoint.sh docker/write.env.sh; \
    addgroup -g 99 -S taiga; \
    adduser -u 99 -S -D -G taiga -H -h /taiga-events -s /bin/sh taiga; \
    chown -R taiga:taiga /taiga-events

EXPOSE 8888
ENTRYPOINT ["./docker/entrypoint.sh"]
