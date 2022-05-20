#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos Ventures SL

set -e

cmd="npm run start:production"

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

envsubst < /taiga-events/docker/env.template \
         > /taiga-events/.env

if [ "$(id -u)" -eq 0 ]; then
    chown -R taiga:taiga /taiga-events

    # Start node process
    echo Starting Taiga events
    # note: no quotes around $cmd to allow it to expand
    exec su-exec taiga $cmd
else
    # Start node process
    echo Starting Taiga events
    # note: no quotes around $cmd to allow it to expand
    exec $cmd
fi
