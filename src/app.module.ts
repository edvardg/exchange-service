import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { GasPriceModule } from './modules/gas-price/gas-price.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [NestConfigModule.forRoot(), ScheduleModule.forRoot(), GasPriceModule, ExchangeModule],
  providers: [ConfigService],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    this.configService.print();

    if (!this.configService.isValid()) {
      process.exit(1);
    }
  }
}
