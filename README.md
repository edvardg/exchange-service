# Exchange Service

This is a backend service built using Nest.js that provides two endpoints: one for fetching the current gas price on the blockchain network and another for estimating the output amount for a token swap using UniswapV2. The project includes support for Redis caching and integration with blockchain nodes via ethers.js.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
    - [With Docker](#with-docker)
    - [Locally](#locally)
- [Running Tests](#running-tests)
    - [Unit Tests](#unit-tests)
    - [End-to-End Tests](#end-to-end-tests)
- [API Documentation](#api-documentation)

## Requirements

- Node.js (v18 or higher)
- npm (v8 or higher)
- Docker (optional, for containerized deployment)
- Redis (for caching)

## Installation

1. Clone the repository:
```bash
   git clone https://github.com/edvardg/exchange-service.git
   cd exchange-service
```

2. Install the dependencies:
```bash
    npm install
```

## Environment Variables
Create a .env file in the root directory of the project with the following variables:

```dotenv
    APP_PORT=4000
    APP_GLOBAL_PREFIX=/api

    REDIS_HOST=redis
    REDIS_PORT=6379
    GAS_PRICE_CACHE_KEY=gasPrice
    GAS_PRICE_CACHE_TTL=60

    SWAGGER_DESCRIPTION="Exchange Service API"
    SWAGGER_VERSION=v1
    SWAGGER_PATH=api/doc

    RPC_URL=[RPC_URL]
    UNISWAP_V2_FACTORY_ADDRESS=0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
    UNISWAP_V2_PAIR_INIT_CODE_HASH=0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f
```

## Running the Application

### With Docker
1. Run the application with Docker:
```bash
  npm run docker:start
```
2. The application should now be running on http://localhost:{$APP_PORT}.

### Locally
1. Ensure Redis is running locally (please update the `REDIS_HOST` env variable to `127.0.0.1`):
```bash
  docker compose up redis
```
2. Start the application:
```bash
  npm run start:dev
```
3.	The application should now be running on http://localhost:{$APP_PORT}.


## Running Tests

### Unit Tests

Run the unit tests using Jest:
```bash
  npm run test
```

### End-to-End Tests

Run the end-to-end tests:
```bash
  npm run test:e2e
```
These tests use Testcontainers to spin up a Redis container for testing purposes.


## API Documentation
The API documentation is generated using Swagger. Once the application is running, you can access the Swagger documentation at:
```text
    http://localhost:{$APP_PORT}/${SWAGGER_PATH}
```
