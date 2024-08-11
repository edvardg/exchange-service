import { Module } from '@nestjs/common';
import { GasPriceCacheService } from './gas-price-cache.service';

@Module({
  providers: [GasPriceCacheService],
  exports: [GasPriceCacheService],
})
export class GasPriceCacheModule {}
