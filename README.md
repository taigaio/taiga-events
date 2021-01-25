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

## Bug reports, enhancements and support

If you **need help to setup Taiga**, want to **talk about some cool enhancemnt** or you have **some questions**, please write us to our [mailing list](http://groups.google.com/d/forum/taigaio).

If you **find a bug** in Taiga you can always report it:

- in [Taiga issues](https://tree.taiga.io/project/taiga/issues).
- send us a mail to support@taiga.io if is a bug related to [tree.taiga.io](https://tree.taiga.io).
- send a mail to security@taiga.io if is a **security bug**.

One of our fellow Taiga developers will search, find and hunt it as soon as possible.

Please, before reporting a bug write down how can we reproduce it, your operating system, your browser and version, and if it's possible, a screenshot. Sometimes it takes less time to fix a bug if the developer knows how to find it and we will solve your problem as fast as possible.


## Credits

- NodeJS
- WS
- Winston
- AmqpLib
- Dotenv
