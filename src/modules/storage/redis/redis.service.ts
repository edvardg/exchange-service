import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.redis.host,
      port: this.configService.redis.port,
    });
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }
}
