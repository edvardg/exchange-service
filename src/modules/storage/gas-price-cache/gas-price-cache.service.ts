import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { GasPrice } from '../../gas-price/dto/gas-price.dto';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class GasPriceCacheService {
  constructor(
    private readonly redisCache: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async setGasPrice(gasPrice: GasPrice): Promise<void> {
    await this.redisCache.set(this.configService.cache.key, gasPrice, this.configService.cache.ttl);
  }

  async getGasPrice<T = GasPrice>(): Promise<T | null> {
    return this.redisCache.get<T>(this.configService.cache.key);
  }
}
