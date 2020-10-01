FROM node:12-alpine
LABEL maintainer="support@taiga.io"

COPY . /taiga-events
WORKDIR /taiga-events

RUN apk update \
    && apk add --no-cache \
       gettext \
    && npm install \
    && chmod +x docker/entrypoint.sh

EXPOSE 8888
ENTRYPOINT ["./docker/entrypoint.sh"]
