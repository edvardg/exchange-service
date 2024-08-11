import { BadRequestException } from '@nestjs/common';

export class InsufficientLiquidityException extends BadRequestException {
  constructor(error?: string) {
    super('error.insufficient-liquidity', error);
  }
}
