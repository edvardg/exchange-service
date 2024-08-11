import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { Web3Service } from '../web3/web3.service';
import { Web3Module } from '../web3/web3.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule, Web3Module],
  controllers: [ExchangeController],
  providers: [ExchangeService, Web3Service],
})
export class ExchangeModule {}
