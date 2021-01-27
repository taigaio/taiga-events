# Copyright (C) 2014-present Taiga Agile LLC
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
    chmod +x docker/entrypoint.sh; \
    addgroup -g 99 -S taiga; \
    adduser -u 99 -S -D -G taiga -H -h /taiga-events -s /bin/sh taiga; \
    chown -R taiga:taiga /taiga-events

EXPOSE 8888
ENTRYPOINT ["./docker/entrypoint.sh"]
