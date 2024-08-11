import { ServiceUnavailableException } from '@nestjs/common';

export class GasPriceFetchException extends ServiceUnavailableException {
  constructor(error?: string) {
    super('error.gas-price-fetch', error);
  }
}
