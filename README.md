# Taiga events

[![Managed with Taiga.io](https://img.shields.io/badge/managed%20with-TAIGA.io-709f14.svg)](https://tree.taiga.io/project/taiga/ "Managed with Taiga.io")

The Taiga websocket server.

## Installation

> _NOTE:_ You should use node >= 10.0.0

```shell script
npm install
```

## Configuration

There should be an `.env` file with the configuration. An example can be found at `.env.example`.

## How to run

**Development**

```shell script
npm run start:dev
```

**Production**

```shell script
npm run start:production
```

### Credits

- NodeJS
- WS
- Winston
- AmqpLib
- Dotenv
