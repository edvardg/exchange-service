import { BadRequestException } from '@nestjs/common';

export class InsufficientInputAmountException extends BadRequestException {
  constructor(error?: string) {
    super('error.insufficient-input-amount', error);
  }
}
