import { Injectable, Logger } from '@nestjs/common';
import * as Joi from '@hapi/joi';
import { ServiceSchema } from './config-service.schema';

@Injectable()
export class ConfigService {
  private logger: Logger = new Logger(ConfigService.name);

  public port: number = Number.parseInt(process.env.APP_PORT, 10);
  public redis = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT, 10) : 6379,
  };
  public cache = {
    key: process.env.GAS_PRICE_CACHE_KEY,
    ttl: process.env.GAS_PRICE_CACHE_TTL ? Number.parseInt(process.env.GAS_PRICE_CACHE_TTL, 10) : 60,
  };
  public swagger = {
    description: process.env.SWAGGER_DESCRIPTION,
    version: process.env.SWAGGER_VERSION,
    path: process.env.SWAGGER_PATH,
  };
  public globalPrefix: string = process.env.APP_GLOBAL_PREFIX || '/api';

  public web3 = {
    rpcUrl: process.env.RPC_URL,
    factoryV2Address: process.env.UNISWAP_V2_FACTORY_ADDRESS,
    pairV2InitCodeHash: process.env.UNISWAP_V2_PAIR_INIT_CODE_HASH,
  };

  print() {
    this.logger.log(`APP_PORT: ${JSON.stringify(this.port)}`);
    this.logger.log(`APP_GLOBAL_PREFIX: ${JSON.stringify(this.globalPrefix)}`);
    this.logger.log(`SWAGGER: ${JSON.stringify(this.swagger)}`);
  }

  isValid() {
    const schema = Joi.object(ServiceSchema);
    const { error } = schema.validate(this, { stripUnknown: true });
    if (error) {
      this.logger.error(`Joi validation error: ${JSON.stringify(error.details)}`);
    } else {
      this.logger.debug('Joi validation success');
    }
    return !error;
  }
}
