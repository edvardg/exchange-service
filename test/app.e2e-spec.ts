import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Redis } from 'ioredis';
import { AppModule } from '../src/app.module';

let app: INestApplication;
let redisContainer: StartedTestContainer;
let redisClient: Redis;

beforeAll(async () => {
  // Start Redis test container
  redisContainer = await new GenericContainer('redis').withExposedPorts(6379).start();
  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getMappedPort(6379);

  // Configure Redis client for tests
  process.env.REDIS_HOST = redisHost;
  process.env.REDIS_PORT = redisPort.toString();

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
  });

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await redisClient.quit();
  await redisContainer.stop();
  await app.close();
});

it('/gasPrice (GET)', async () => {
  // Ensure Redis is empty initially
  const initialCache = await redisClient.get('gasPrice');
  expect(initialCache).toBeNull();

  // Wait for the worker to update the gas price
  await new Promise(resolve => setTimeout(resolve, 3000));

  const response = await request(app.getHttpServer()).get('/gasPrice');
  expect(response.status).toBe(200);

  const cachedGasPrice = await redisClient.get('gasPrice');
  expect(JSON.parse(cachedGasPrice)).toEqual(response.body);
});

it('/return/:fromTokenAddress/:toTokenAddress/:amountIn (GET) should return expected output', async () => {
  const fromTokenAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'; // WBTC
  const toTokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
  const amountIn = '10000'; // 0.0001 WBTC

  const response = await request(app.getHttpServer()).get(`/return/${fromTokenAddress}/${toTokenAddress}/${amountIn}`);
  expect(response.status).toBe(200);

  const amountOut = BigInt(response.body.amountOut);
  expect(amountOut).toBeGreaterThan(0n);
});
