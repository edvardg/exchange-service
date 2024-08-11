import { Module } from '@nestjs/common';
import { GasPriceService } from './gas-price.service';
import { GasPriceController } from './gas-price.controller';
import { Web3Module } from '../web3/web3.module';
import { RedisModule } from '../storage/redis/redis.module';
import { GasPriceCacheService } from '../storage/gas-price-cache/gas-price-cache.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [Web3Module, RedisModule, ConfigModule],
  providers: [GasPriceService, GasPriceCacheService],
  controllers: [GasPriceController],
  exports: [GasPriceService],
})
export class GasPriceModule {}
