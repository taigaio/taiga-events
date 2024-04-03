#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos INC

set -e

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

if [ -z "$TAIGA_EVENTS_RABBITMQ_HOST" ]; then
  echo "TAIGA_EVENTS_RABBITMQ_HOST is not set. Using default value: taiga-events-rabbitmq"
  export TAIGA_EVENTS_RABBITMQ_HOST=taiga-events-rabbitmq
fi

envsubst < /taiga-events/docker/env.template \
         > /taiga-events/.env

chown -R taiga:taiga /taiga-events

# Start node process
echo Starting Taiga events
exec su-exec taiga npm run start:production
