#!/bin/sh

set -e

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

envsubst < /taiga-events/docker/env.template \
         > /taiga-events/.env

chown -R taiga:taiga /taiga-events

# Start node process
echo Starting Taiga events
exec su-exec taiga npm run start:production
