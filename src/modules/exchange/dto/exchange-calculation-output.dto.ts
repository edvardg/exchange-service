import { ApiProperty } from '@nestjs/swagger';

export class ExchangeCalculationOutput {
  @ApiProperty({
    description: 'The raw output amount in the smallest unit of the token',
    example: '1000000000000000000',
  })
  amountOut: string;
}
