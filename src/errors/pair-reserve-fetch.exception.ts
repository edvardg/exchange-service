import { ServiceUnavailableException } from '@nestjs/common';

export class PairReserveFetchException extends ServiceUnavailableException {
  constructor(error?: string) {
    super('error.pair-reserve-fetch', error);
  }
}
