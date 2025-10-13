# Changelog

# 6.9.1 (unreleased)

- ...

# 6.9.0 (2025-10-13)

- Compatible with Taiga 6.9.0

# 6.8.0 (2024-04-03)

- Changed the namespace of the repositories, from kaleidos-ventures to taigaio
- Inmproved RabbitMQ host configuration for Taiga events and asynchrous tasks (thanks [@iriseden](https://github.com/iriseden))

# 6.7.0 (2023-06-12)

- Upgrade dotenv.

# 6.6.1 (2023-04-11)

- Allow to define the logging level in the dotenv file

# 6.6.0 (2023-03-06)

- Upgrade docker base image to node:16-alpine
- Compatible with Taiga 6.6.0

# 6.5.0 (2022-01-24)

- Compatible with Taiga 6.5.0

## 6.4.0 (2021-09-06)

- Compatible with Taiga 6.4.0
- (feat) Support serving Taiga in subpath

## 6.3.0 (2021-08-10)

- New crypto module, compatible with the new auth system (history #tg-4625, issue #tgg-626)

## 6.2.3 (2021-07-29)

- Fix an error related to the close connection process.

## 6.2.2 (2021-07-15)

- Compatible with Taiga 6.2.2

## 6.2.1 (2021-06-22)

- Compatible with Taiga 6.2.1

## 6.2.0 (2021-06-09)

- Upgrade dependencies.
- Allow self-notification.

## 6.1.1 (2021-05-18)

- Compatible with Taiga 6.1.1

## 6.1.0 (2021-05-04)

- Update github templates

### misc

Fixed a critical bug related to channels not closed after WS connections ended.


## 6.0.1 (2020-02-08)

### misc

improve logger messages.


## 6.0.0 (2020-02-02)

Major update: rewrited coffeescript to pure JS ES6.

### Features

- Generate docker image

### Misc

- Migration from JSON config store to dotenv (evironment variables)

- Fix bugs
