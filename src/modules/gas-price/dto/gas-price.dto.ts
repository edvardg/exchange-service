import { ApiProperty } from '@nestjs/swagger';

export class LegacyGasPrice {
  @ApiProperty({
    description: 'Gas price for legacy transactions',
    example: '10000000000',
  })
  gasPrice: string;
}

export class Eip1559GasPrice {
  @ApiProperty({
    description: 'Base fee per gas unit (EIP-1559)',
    example: '10000000000',
  })
  baseFee: string;

  @ApiProperty({
    description: 'Maximum priority fee per gas unit (EIP-1559)',
    example: '2000000000',
  })
  maxPriorityFeePerGas: string;

  @ApiProperty({
    description: 'Maximum fee per gas unit (EIP-1559)',
    example: '12000000000',
  })
  maxFeePerGas: string;
}

export type GasPrice = Eip1559GasPrice | LegacyGasPrice;
